from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/items", tags=["Items"])


@router.get("", response_model=List[schemas.ItemResponse])
def get_items(
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    subgroup_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Item)

    if status:
        query = query.filter(models.Item.status == status)
    if category_id:
        query = query.filter(models.Item.category_id == category_id)
    if subgroup_id:
        query = query.filter(models.Item.subgroup_id == subgroup_id)
    if search:
        query = query.filter(
            (models.Item.name.ilike(f"%{search}%")) |
            (models.Item.sku.ilike(f"%{search}%"))
        )

    return query.all()


@router.get("/{item_id}", response_model=schemas.ItemResponse)
def get_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("", response_model=schemas.ItemResponse)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/{item_id}", response_model=schemas.ItemResponse)
def update_item(item_id: str, item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    for key, value in item.model_dump().items():
        if key != "id":
            setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}")
def delete_item(item_id: str, db: Session = Depends(get_db)):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted"}
