from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])


def generate_po_number(db: Session) -> str:
    last_po = db.query(models.PurchaseOrder).order_by(models.PurchaseOrder.id.desc()).first()
    if last_po and last_po.id.startswith("PO-NMTPL-"):
        try:
            last_num = int(last_po.id.split("-")[-1])
            return f"PO-NMTPL-{str(last_num + 1).zfill(4)}"
        except:
            pass
    return "PO-NMTPL-0001"


@router.get("/next-number")
def get_next_po_number(db: Session = Depends(get_db)):
    return {"next_number": generate_po_number(db)}


@router.get("", response_model=List[schemas.PurchaseOrderResponse])
def get_purchase_orders(
    status: Optional[str] = None,
    vendor_id: Optional[str] = None,
    department_id: Optional[int] = None,
    section_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.PurchaseOrder)

    if status:
        query = query.filter(models.PurchaseOrder.status == status)
    if vendor_id:
        query = query.filter(models.PurchaseOrder.vendor_id == vendor_id)
    if department_id:
        query = query.filter(models.PurchaseOrder.department_id == department_id)
    if section_id:
        query = query.filter(models.PurchaseOrder.section_id == section_id)
    if from_date:
        query = query.filter(models.PurchaseOrder.po_date >= from_date)
    if to_date:
        query = query.filter(models.PurchaseOrder.po_date <= to_date)
    if search:
        query = query.filter(
            (models.PurchaseOrder.id.ilike(f"%{search}%")) |
            (models.PurchaseOrder.vendor.has(models.Vendor.name.ilike(f"%{search}%")))
        )

    return query.order_by(models.PurchaseOrder.po_date.desc()).all()


@router.get("/summary")
def get_po_summary(
    status: Optional[str] = None,
    vendor_id: Optional[str] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.PurchaseOrder)

    if status:
        query = query.filter(models.PurchaseOrder.status == status)
    if vendor_id:
        query = query.filter(models.PurchaseOrder.vendor_id == vendor_id)
    if department_id:
        query = query.filter(models.PurchaseOrder.department_id == department_id)

    pos = query.all()

    total_amount = sum(float(po.total_amount or 0) for po in pos)
    completed = sum(float(po.total_amount or 0) for po in pos if po.status == "Completed")
    pending = sum(float(po.total_amount or 0) for po in pos if po.status in ["Open", "Partially Received", "Draft"])

    return {
        "total_amount": total_amount,
        "completed_amount": completed,
        "pending_amount": pending,
        "total_count": len(pos)
    }


@router.get("/{po_id}", response_model=schemas.PurchaseOrderResponse)
def get_purchase_order(po_id: str, db: Session = Depends(get_db)):
    po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    return po


@router.post("", response_model=schemas.PurchaseOrderResponse)
def create_purchase_order(po: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)):
    db_po = models.PurchaseOrder(
        id=po.id,
        vendor_id=po.vendor_id,
        site_id=po.site_id,
        department_id=po.department_id,
        section_id=po.section_id,
        po_date=po.po_date,
        delivery_date=po.delivery_date,
        remarks=po.remarks,
        terms_conditions=po.terms_conditions,
        status=po.status,
        total_taxable=po.total_taxable,
        total_cgst=po.total_cgst,
        total_sgst=po.total_sgst,
        total_igst=po.total_igst,
        total_amount=po.total_amount,
        created_by=po.created_by,
        approved_by=po.approved_by
    )
    db.add(db_po)

    for idx, item in enumerate(po.items):
        db_item = models.POItem(
            po_id=po.id,
            item_id=item.item_id,
            description=item.description,
            uom=item.uom,
            qty=item.qty,
            rate=item.rate,
            discount_pct=item.discount_pct,
            taxable_amount=item.taxable_amount,
            cgst_pct=item.cgst_pct,
            sgst_pct=item.sgst_pct,
            igst_pct=item.igst_pct,
            cgst_amount=item.cgst_amount,
            sgst_amount=item.sgst_amount,
            igst_amount=item.igst_amount,
            total_amount=item.total_amount,
            received_qty=item.received_qty,
            line_no=idx + 1
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_po)
    return db_po


@router.put("/{po_id}", response_model=schemas.PurchaseOrderResponse)
def update_purchase_order(po_id: str, po: schemas.PurchaseOrderUpdate, db: Session = Depends(get_db)):
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    update_data = po.model_dump(exclude_unset=True, exclude={"items"})
    for key, value in update_data.items():
        if value is not None:
            setattr(db_po, key, value)

    if po.items is not None:
        db.query(models.POItem).filter(models.POItem.po_id == po_id).delete()
        for idx, item in enumerate(po.items):
            db_item = models.POItem(
                po_id=po_id,
                item_id=item.item_id,
                description=item.description,
                uom=item.uom,
                qty=item.qty,
                rate=item.rate,
                discount_pct=item.discount_pct,
                taxable_amount=item.taxable_amount,
                cgst_pct=item.cgst_pct,
                sgst_pct=item.sgst_pct,
                igst_pct=item.igst_pct,
                cgst_amount=item.cgst_amount,
                sgst_amount=item.sgst_amount,
                igst_amount=item.igst_amount,
                total_amount=item.total_amount,
                received_qty=item.received_qty,
                line_no=idx + 1
            )
            db.add(db_item)

    db.commit()
    db.refresh(db_po)
    return db_po


@router.patch("/{po_id}/approve")
def approve_purchase_order(po_id: str, approved_by: str, db: Session = Depends(get_db)):
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    db_po.status = "Open"
    db_po.approved_by = approved_by
    db.commit()
    return {"message": "Purchase Order approved", "status": "Open"}


@router.delete("/{po_id}")
def delete_purchase_order(po_id: str, db: Session = Depends(get_db)):
    db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not db_po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    if db_po.status not in ["Draft"]:
        raise HTTPException(status_code=400, detail="Can only delete Draft POs")

    db.delete(db_po)
    db.commit()
    return {"message": "Purchase Order deleted"}
