from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/goods-receipts", tags=["Goods Receipts"])


def generate_grn_number(db: Session) -> str:
    import datetime
    year = datetime.datetime.now().year
    prefix = f"GRN{year}-"

    last_grn = db.query(models.GoodsReceipt).filter(
        models.GoodsReceipt.id.like(f"{prefix}%")
    ).order_by(models.GoodsReceipt.id.desc()).first()

    if last_grn:
        try:
            last_num = int(last_grn.id.split("-")[-1])
            return f"{prefix}{str(last_num + 1).zfill(5)}"
        except:
            pass
    return f"{prefix}00001"


@router.get("/next-number")
def get_next_grn_number(db: Session = Depends(get_db)):
    return {"next_number": generate_grn_number(db)}


@router.get("", response_model=List[schemas.GoodsReceiptResponse])
def get_goods_receipts(
    status: Optional[str] = None,
    vendor_id: Optional[str] = None,
    department_id: Optional[int] = None,
    godown_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.GoodsReceipt)

    if status:
        query = query.filter(models.GoodsReceipt.status == status)
    if vendor_id:
        query = query.filter(models.GoodsReceipt.vendor_id == vendor_id)
    if department_id:
        query = query.filter(models.GoodsReceipt.department_id == department_id)
    if godown_id:
        query = query.filter(models.GoodsReceipt.godown_id == godown_id)
    if from_date:
        query = query.filter(models.GoodsReceipt.grn_date >= from_date)
    if to_date:
        query = query.filter(models.GoodsReceipt.grn_date <= to_date)
    if search:
        query = query.filter(
            (models.GoodsReceipt.id.ilike(f"%{search}%")) |
            (models.GoodsReceipt.challan_no.ilike(f"%{search}%"))
        )

    return query.order_by(models.GoodsReceipt.grn_date.desc()).all()


@router.get("/summary")
def get_grn_summary(
    status: Optional[str] = None,
    vendor_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.GoodsReceipt)

    if status:
        query = query.filter(models.GoodsReceipt.status == status)
    if vendor_id:
        query = query.filter(models.GoodsReceipt.vendor_id == vendor_id)

    grns = query.all()

    total_amount = sum(float(grn.total_amount or 0) for grn in grns)
    total_taxable = sum(float(grn.total_taxable or 0) for grn in grns)
    total_tax = sum(
        float(grn.total_cgst or 0) + float(grn.total_sgst or 0) + float(grn.total_igst or 0)
        for grn in grns
    )

    total_items = 0
    for grn in grns:
        total_items += len(grn.items)

    return {
        "total_amount": total_amount,
        "total_taxable": total_taxable,
        "total_tax": total_tax,
        "total_items": total_items,
        "total_count": len(grns)
    }


@router.get("/{grn_id}", response_model=schemas.GoodsReceiptResponse)
def get_goods_receipt(grn_id: str, db: Session = Depends(get_db)):
    grn = db.query(models.GoodsReceipt).filter(models.GoodsReceipt.id == grn_id).first()
    if not grn:
        raise HTTPException(status_code=404, detail="Goods Receipt not found")
    return grn


@router.post("", response_model=schemas.GoodsReceiptResponse)
def create_goods_receipt(grn: schemas.GoodsReceiptCreate, db: Session = Depends(get_db)):
    db_grn = models.GoodsReceipt(
        id=grn.id,
        vendor_id=grn.vendor_id,
        site_id=grn.site_id,
        department_id=grn.department_id,
        section_id=grn.section_id,
        godown_id=grn.godown_id,
        challan_no=grn.challan_no,
        grn_date=grn.grn_date,
        status=grn.status,
        total_taxable=grn.total_taxable,
        total_cgst=grn.total_cgst,
        total_sgst=grn.total_sgst,
        total_igst=grn.total_igst,
        total_amount=grn.total_amount,
        created_by=grn.created_by
    )
    db.add(db_grn)

    for idx, item in enumerate(grn.items):
        db_item = models.GRNItem(
            grn_id=grn.id,
            po_id=item.po_id,
            po_item_id=item.po_item_id,
            item_id=item.item_id,
            description=item.description,
            uom=item.uom,
            qty=item.qty,
            accepted_qty=item.accepted_qty,
            rejected_qty=item.rejected_qty,
            damaged_qty=item.damaged_qty,
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
            rack_bin=item.rack_bin,
            line_no=idx + 1
        )
        db.add(db_item)

        if grn.status == "Posted" and item.po_item_id:
            po_item = db.query(models.POItem).filter(models.POItem.id == item.po_item_id).first()
            if po_item:
                po_item.received_qty = float(po_item.received_qty or 0) + float(item.qty)

                po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == item.po_id).first()
                if po:
                    all_received = all(
                        float(pi.received_qty or 0) >= float(pi.qty)
                        for pi in po.items
                    )
                    if all_received:
                        po.status = "Completed"
                    else:
                        po.status = "Partially Received"

        if grn.status == "Posted":
            stock = db.query(models.Stock).filter(
                models.Stock.item_id == item.item_id,
                models.Stock.godown_id == grn.godown_id
            ).first()

            if stock:
                stock.on_hand_qty = float(stock.on_hand_qty or 0) + float(item.accepted_qty or item.qty)
                stock.last_movement_date = grn.grn_date
            else:
                db.add(models.Stock(
                    item_id=item.item_id,
                    site_id=grn.site_id,
                    godown_id=grn.godown_id,
                    on_hand_qty=float(item.accepted_qty or item.qty),
                    last_movement_date=grn.grn_date
                ))

    db.commit()
    db.refresh(db_grn)
    return db_grn


@router.delete("/{grn_id}")
def delete_goods_receipt(grn_id: str, db: Session = Depends(get_db)):
    db_grn = db.query(models.GoodsReceipt).filter(models.GoodsReceipt.id == grn_id).first()
    if not db_grn:
        raise HTTPException(status_code=404, detail="Goods Receipt not found")

    if db_grn.status != "Draft":
        raise HTTPException(status_code=400, detail="Can only delete Draft GRNs")

    db.delete(db_grn)
    db.commit()
    return {"message": "Goods Receipt deleted"}
