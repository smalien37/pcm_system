from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=schemas.LoginResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == credentials.email.lower(),
        models.User.status == "active"
    ).first()

    if not user:
        return schemas.LoginResponse(
            success=False,
            message="Invalid email or password",
            user=None
        )

    # Simple password check (in production, use bcrypt or similar)
    if user.password_hash != credentials.password:
        return schemas.LoginResponse(
            success=False,
            message="Invalid email or password",
            user=None
        )

    # Update last login
    user.last_login = func.now()
    db.commit()
    db.refresh(user)

    return schemas.LoginResponse(
        success=True,
        message="Login successful",
        user=schemas.UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            department_id=user.department_id,
            status=user.status,
            last_login=user.last_login
        )
    )


@router.get("/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = models.User(
        email=user.email.lower(),
        password_hash=user.password,  # In production, hash this
        name=user.name,
        role=user.role,
        department_id=user.department_id,
        status=user.status
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.email = user.email.lower()
    db_user.name = user.name
    db_user.role = user.role
    db_user.department_id = user.department_id
    db_user.status = user.status
    if user.password:
        db_user.password_hash = user.password  # In production, hash this

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}
