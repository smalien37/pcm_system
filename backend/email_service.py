import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional
import threading
import os

from .config import settings


def send_email_async(to_emails: List[str], subject: str, html_body: str,
                     text_body: Optional[str] = None, attachments: Optional[List[dict]] = None):
    """Send email in a background thread to avoid blocking the request"""
    thread = threading.Thread(
        target=_send_email,
        args=(to_emails, subject, html_body, text_body, attachments)
    )
    thread.start()


def _send_email(to_emails: List[str], subject: str, html_body: str,
                text_body: Optional[str] = None, attachments: Optional[List[dict]] = None):
    """Internal function to send email via SMTP"""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EMAIL] SMTP not configured. Would send to: {to_emails}")
        print(f"[EMAIL] Subject: {subject}")
        if attachments:
            print(f"[EMAIL] Attachments: {[a.get('name') for a in attachments]}")
        return

    try:
        msg = MIMEMultipart("mixed")
        msg["Subject"] = subject
        msg["From"] = f"SyncFlow PCM <{settings.SMTP_FROM}>"
        msg["To"] = ", ".join(to_emails)

        # Create the body part
        body_part = MIMEMultipart("alternative")
        if text_body:
            body_part.attach(MIMEText(text_body, "plain"))
        body_part.attach(MIMEText(html_body, "html"))
        msg.attach(body_part)

        # Add attachments
        if attachments:
            for att in attachments:
                file_path = att.get("file_path")
                file_name = att.get("name", "attachment")
                mime_type = att.get("type", "application/octet-stream")

                if file_path and os.path.exists(file_path):
                    with open(file_path, "rb") as f:
                        file_data = f.read()

                    maintype, subtype = mime_type.split("/") if "/" in mime_type else ("application", "octet-stream")
                    attachment_part = MIMEBase(maintype, subtype)
                    attachment_part.set_payload(file_data)
                    encoders.encode_base64(attachment_part)
                    attachment_part.add_header(
                        "Content-Disposition",
                        f"attachment; filename={file_name}"
                    )
                    msg.attach(attachment_part)
                    print(f"[EMAIL] Attached: {file_name}")

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, to_emails, msg.as_string())

        print(f"[EMAIL] Sent successfully to: {to_emails}")
    except Exception as e:
        print(f"[EMAIL] Failed to send: {e}")


def send_issue_notification(issue_number: str, issue_type: str, subject: str,
                            description: str, priority: str, reported_by: str,
                            page: Optional[str] = None, attachments: Optional[List[dict]] = None):
    """Send email notification for a new issue with attachments"""
    to_emails = [email.strip() for email in settings.ISSUE_NOTIFY_EMAILS.split(",")]

    priority_colors = {
        "low": "#16a34a",
        "medium": "#f59e0b",
        "high": "#ea580c",
        "critical": "#dc2626"
    }
    priority_color = priority_colors.get(priority, "#6b7280")

    type_labels = {
        "bug": "Bug / Error",
        "feature": "Feature Request",
        "performance": "Performance Issue",
        "ui": "UI/UX Issue",
        "data": "Data Issue",
        "other": "Other"
    }
    type_label = type_labels.get(issue_type, issue_type.title())

    email_subject = f"[{issue_number}] New Issue: {subject}"

    attachments_count = len(attachments) if attachments else 0
    attachment_names = ", ".join([a.get("name", "file") for a in attachments]) if attachments else ""

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #3d2a2a 0%, #2a1f1f 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
            .header h1 {{ margin: 0; font-size: 20px; }}
            .content {{ background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }}
            .badge {{ display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }}
            .priority {{ background: {priority_color}; color: white; }}
            .type {{ background: #e5e7eb; color: #374151; }}
            .field {{ margin-bottom: 16px; }}
            .field-label {{ font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }}
            .field-value {{ font-size: 14px; color: #111827; }}
            .description {{ background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap; }}
            .footer {{ background: #f3f4f6; padding: 16px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; text-align: center; }}
            .attachments {{ background: #fef3c7; padding: 12px 16px; border-radius: 8px; border: 1px solid #f59e0b; }}
            .attachments-icon {{ color: #d97706; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Issue Reported</h1>
            </div>
            <div class="content">
                <div class="field">
                    <div class="field-label">Issue Number</div>
                    <div class="field-value"><strong>{issue_number}</strong></div>
                </div>
                <div class="field">
                    <span class="badge type">{type_label}</span>
                    <span class="badge priority">{priority.upper()}</span>
                </div>
                <div class="field">
                    <div class="field-label">Subject</div>
                    <div class="field-value">{subject}</div>
                </div>
                <div class="field">
                    <div class="field-label">Description</div>
                    <div class="description">{description}</div>
                </div>
                <div class="field">
                    <div class="field-label">Reported By</div>
                    <div class="field-value">{reported_by}</div>
                </div>
                {f'<div class="field"><div class="field-label">Page</div><div class="field-value">{page}</div></div>' if page else ''}
                {f'<div class="field"><div class="attachments"><span class="attachments-icon">📎</span> <strong>{attachments_count} file(s) attached:</strong> {attachment_names}</div></div>' if attachments_count > 0 else ''}
            </div>
            <div class="footer">
                This is an automated notification from SyncFlow PCM System.
            </div>
        </div>
    </body>
    </html>
    """

    text_body = f"""
New Issue Reported
==================

Issue Number: {issue_number}
Type: {type_label}
Priority: {priority.upper()}
Subject: {subject}

Description:
{description}

Reported By: {reported_by}
{f'Page: {page}' if page else ''}
{f'Attachments ({attachments_count}): {attachment_names}' if attachments_count > 0 else ''}

--
SyncFlow PCM System
    """

    send_email_async(to_emails, email_subject, html_body, text_body, attachments)
