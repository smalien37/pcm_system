from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import json
import os
import base64
import uuid
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from ..email_service import send_issue_notification

router = APIRouter(prefix="/api/issues", tags=["Issues"])

# Upload directory for issue attachments
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "issues")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def generate_issue_number(db: Session) -> str:
    """Generate next issue number like ISS-2024-00001"""
    year = datetime.now().year
    prefix = f"ISS-{year}-"

    last_issue = db.query(models.Issue).filter(
        models.Issue.issue_number.like(f"{prefix}%")
    ).order_by(models.Issue.id.desc()).first()

    if last_issue:
        last_num = int(last_issue.issue_number.split("-")[-1])
        next_num = last_num + 1
    else:
        next_num = 1

    return f"{prefix}{next_num:05d}"


def save_attachment(issue_number: str, attachment: schemas.IssueAttachment) -> dict:
    """Save an attachment file and return metadata with file path"""
    if not attachment.data:
        return {
            "name": attachment.name,
            "type": attachment.type,
            "size": attachment.size,
            "path": None
        }

    # Create issue-specific folder
    issue_folder = os.path.join(UPLOAD_DIR, issue_number)
    os.makedirs(issue_folder, exist_ok=True)

    # Generate unique filename
    ext = os.path.splitext(attachment.name)[1] or ""
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(issue_folder, unique_name)

    # Decode and save file
    try:
        # Handle data URL format (e.g., "data:image/png;base64,...")
        if "," in attachment.data:
            file_data = base64.b64decode(attachment.data.split(",")[1])
        else:
            file_data = base64.b64decode(attachment.data)

        with open(file_path, "wb") as f:
            f.write(file_data)

        return {
            "name": attachment.name,
            "type": attachment.type,
            "size": attachment.size,
            "path": f"/api/issues/attachments/{issue_number}/{unique_name}",
            "file_path": file_path  # Full path for email attachments
        }
    except Exception as e:
        print(f"Error saving attachment: {e}")
        return {
            "name": attachment.name,
            "type": attachment.type,
            "size": attachment.size,
            "path": None,
            "error": str(e)
        }


@router.get("", response_model=List[schemas.IssueResponse])
def get_issues(
    status: Optional[str] = None,
    type: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all issues with optional filters"""
    query = db.query(models.Issue)

    if status:
        query = query.filter(models.Issue.status == status)
    if type:
        query = query.filter(models.Issue.type == type)
    if priority:
        query = query.filter(models.Issue.priority == priority)

    return query.order_by(models.Issue.created_at.desc()).all()


@router.get("/summary")
def get_issues_summary(db: Session = Depends(get_db)):
    """Get summary statistics for issues"""
    total = db.query(models.Issue).count()
    open_count = db.query(models.Issue).filter(models.Issue.status == "open").count()
    in_progress = db.query(models.Issue).filter(models.Issue.status == "in_progress").count()
    resolved = db.query(models.Issue).filter(models.Issue.status == "resolved").count()

    by_type = db.query(
        models.Issue.type,
        func.count(models.Issue.id)
    ).group_by(models.Issue.type).all()

    by_priority = db.query(
        models.Issue.priority,
        func.count(models.Issue.id)
    ).group_by(models.Issue.priority).all()

    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "resolved": resolved,
        "by_type": {t: c for t, c in by_type},
        "by_priority": {p: c for p, c in by_priority}
    }


@router.get("/attachments/{issue_number}/{filename}")
def get_attachment(issue_number: str, filename: str):
    """Serve an attachment file"""
    file_path = os.path.join(UPLOAD_DIR, issue_number, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Attachment not found")
    return FileResponse(file_path)


@router.get("/{issue_id}", response_model=schemas.IssueResponse)
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    """Get a specific issue by ID"""
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.post("", response_model=schemas.IssueResponse)
def create_issue(issue: schemas.IssueCreate, db: Session = Depends(get_db)):
    """Create a new issue report"""
    issue_number = generate_issue_number(db)

    # Save attachments and get metadata with paths
    saved_attachments = []
    for att in (issue.attachments or []):
        saved_att = save_attachment(issue_number, att)
        saved_attachments.append(saved_att)

    attachments_json = json.dumps(saved_attachments)

    db_issue = models.Issue(
        issue_number=issue_number,
        type=issue.type,
        subject=issue.subject,
        description=issue.description,
        priority=issue.priority or "medium",
        status="open",
        page=issue.page,
        user_agent=issue.user_agent,
        attachments=attachments_json,
        reported_by_name=issue.reported_by_name
    )

    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)

    # Send email notification with attachments
    send_issue_notification(
        issue_number=issue_number,
        issue_type=issue.type,
        subject=issue.subject,
        description=issue.description,
        priority=issue.priority or "medium",
        reported_by=issue.reported_by_name or "Unknown",
        page=issue.page,
        attachments=saved_attachments  # Pass full attachment info including file paths
    )

    return db_issue


@router.patch("/{issue_id}", response_model=schemas.IssueResponse)
def update_issue(issue_id: int, issue_update: schemas.IssueUpdate, db: Session = Depends(get_db)):
    """Update an issue (status, priority, assignment, resolution)"""
    db_issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not db_issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if issue_update.status:
        db_issue.status = issue_update.status
        if issue_update.status in ["resolved", "closed"]:
            db_issue.resolved_at = datetime.now()

    if issue_update.priority:
        db_issue.priority = issue_update.priority

    if issue_update.assigned_to_id is not None:
        db_issue.assigned_to_id = issue_update.assigned_to_id

    if issue_update.resolution_notes:
        db_issue.resolution_notes = issue_update.resolution_notes

    db.commit()
    db.refresh(db_issue)
    return db_issue


@router.delete("/{issue_id}")
def delete_issue(issue_id: int, db: Session = Depends(get_db)):
    """Delete an issue"""
    db_issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not db_issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Delete attachment files
    issue_folder = os.path.join(UPLOAD_DIR, db_issue.issue_number)
    if os.path.exists(issue_folder):
        import shutil
        shutil.rmtree(issue_folder)

    db.delete(db_issue)
    db.commit()
    return {"message": "Issue deleted", "issue_number": db_issue.issue_number}
