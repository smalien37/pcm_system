from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/stock", tags=["Stock"])


def generate_sc_number(db: Session) -> str:
    import datetime
    year = datetime.datetime.now().year
    prefix = f"SC-{year}-"

    last_sc = db.query(models.StockConsumption).filter(
        models.StockConsumption.id.like(f"{prefix}%")
    ).order_by(models.StockConsumption.id.desc()).first()

    if last_sc:
        try:
            last_num = int(last_sc.id.split("-")[-1])
            return f"{prefix}{str(last_num + 1).zfill(5)}"
        except:
            pass
    return f"{prefix}00001"


@router.get("/consumption/next-number")
def get_next_sc_number(db: Session = Depends(get_db)):
    return {"next_number": generate_sc_number(db)}


@router.get("/on-hand", response_model=List[schemas.StockResponse])
def get_stock_on_hand(
    site_id: Optional[str] = None,
    godown_id: Optional[int] = None,
    search: Optional[str] = None,
    low_stock: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    query = db.query(models.Stock)

    if site_id:
        query = query.filter(models.Stock.site_id == site_id)
    if godown_id:
        query = query.filter(models.Stock.godown_id == godown_id)
    if search:
        query = query.join(models.Item).filter(
            (models.Item.name.ilike(f"%{search}%")) |
            (models.Item.sku.ilike(f"%{search}%"))
        )

    stocks = query.all()

    if low_stock:
        result = []
        for stock in stocks:
            item = db.query(models.Item).filter(models.Item.id == stock.item_id).first()
            if item and float(stock.on_hand_qty or 0) <= float(item.reorder_level or 0):
                result.append(stock)
        return result

    return stocks


@router.get("/reorder")
def get_reorder_items(db: Session = Depends(get_db)):
    stocks = db.query(models.Stock).all()

    result = []
    for stock in stocks:
        item = db.query(models.Item).filter(models.Item.id == stock.item_id).first()
        if item and float(stock.on_hand_qty or 0) <= float(item.reorder_level or 0):
            result.append({
                "item_id": item.id,
                "item_name": item.name,
                "sku": item.sku,
                "uom": item.uom,
                "on_hand": float(stock.on_hand_qty or 0),
                "reorder_level": item.reorder_level,
                "site_id": stock.site_id,
                "godown_id": stock.godown_id,
                "last_movement": stock.last_movement_date
            })

    return result


@router.get("/consumption", response_model=List[schemas.StockConsumptionResponse])
def get_stock_consumptions(
    status: Optional[str] = None,
    cost_center_id: Optional[str] = None,
    department_id: Optional[int] = None,
    godown_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.StockConsumption)

    if status:
        query = query.filter(models.StockConsumption.status == status)
    if cost_center_id:
        query = query.filter(models.StockConsumption.cost_center_id == cost_center_id)
    if department_id:
        query = query.filter(models.StockConsumption.department_id == department_id)
    if godown_id:
        query = query.filter(models.StockConsumption.godown_id == godown_id)
    if from_date:
        query = query.filter(models.StockConsumption.sc_date >= from_date)
    if to_date:
        query = query.filter(models.StockConsumption.sc_date <= to_date)
    if search:
        query = query.filter(
            (models.StockConsumption.id.ilike(f"%{search}%")) |
            (models.StockConsumption.job_card_no.ilike(f"%{search}%"))
        )

    return query.order_by(models.StockConsumption.sc_date.desc()).all()


@router.get("/consumption/summary")
def get_sc_summary(
    status: Optional[str] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.StockConsumption)

    if status:
        query = query.filter(models.StockConsumption.status == status)
    if department_id:
        query = query.filter(models.StockConsumption.department_id == department_id)

    scs = query.all()

    total_amount = sum(float(sc.total_amount or 0) for sc in scs)
    posted = sum(float(sc.total_amount or 0) for sc in scs if sc.status == "Posted")
    draft = sum(float(sc.total_amount or 0) for sc in scs if sc.status == "Draft")

    return {
        "total_amount": total_amount,
        "posted_amount": posted,
        "draft_amount": draft,
        "total_count": len(scs)
    }


@router.get("/consumption/{sc_id}", response_model=schemas.StockConsumptionResponse)
def get_stock_consumption(sc_id: str, db: Session = Depends(get_db)):
    sc = db.query(models.StockConsumption).filter(models.StockConsumption.id == sc_id).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Stock Consumption not found")
    return sc


@router.post("/consumption", response_model=schemas.StockConsumptionResponse)
def create_stock_consumption(sc: schemas.StockConsumptionCreate, db: Session = Depends(get_db)):
    db_sc = models.StockConsumption(
        id=sc.id,
        cost_center_id=sc.cost_center_id,
        department_id=sc.department_id,
        section_id=sc.section_id,
        godown_id=sc.godown_id,
        sc_date=sc.sc_date,
        kmr=sc.kmr,
        hmr=sc.hmr,
        job_card_no=sc.job_card_no,
        status=sc.status,
        total_amount=sc.total_amount,
        created_by=sc.created_by,
        approved_by=sc.approved_by
    )
    db.add(db_sc)

    for idx, item in enumerate(sc.items):
        db_item = models.SCItem(
            sc_id=sc.id,
            item_id=item.item_id,
            description=item.description,
            uom=item.uom,
            qty=item.qty,
            rate=item.rate,
            amount=item.amount,
            rack_bin=item.rack_bin,
            remarks=item.remarks,
            line_no=idx + 1
        )
        db.add(db_item)

        if sc.status == "Posted":
            stock = db.query(models.Stock).filter(
                models.Stock.item_id == item.item_id,
                models.Stock.godown_id == sc.godown_id
            ).first()

            if stock:
                stock.on_hand_qty = max(0, float(stock.on_hand_qty or 0) - float(item.qty))
                stock.last_movement_date = sc.sc_date

    db.commit()
    db.refresh(db_sc)
    return db_sc


@router.patch("/consumption/{sc_id}/approve")
def approve_stock_consumption(sc_id: str, approved_by: str, db: Session = Depends(get_db)):
    db_sc = db.query(models.StockConsumption).filter(models.StockConsumption.id == sc_id).first()
    if not db_sc:
        raise HTTPException(status_code=404, detail="Stock Consumption not found")

    if db_sc.status == "Posted":
        raise HTTPException(status_code=400, detail="Already posted")

    for item in db_sc.items:
        stock = db.query(models.Stock).filter(
            models.Stock.item_id == item.item_id,
            models.Stock.godown_id == db_sc.godown_id
        ).first()

        if stock:
            stock.on_hand_qty = max(0, float(stock.on_hand_qty or 0) - float(item.qty))
            stock.last_movement_date = db_sc.sc_date

    db_sc.status = "Posted"
    db_sc.approved_by = approved_by
    db.commit()
    return {"message": "Stock Consumption posted", "status": "Posted"}


@router.delete("/consumption/{sc_id}")
def delete_stock_consumption(sc_id: str, db: Session = Depends(get_db)):
    db_sc = db.query(models.StockConsumption).filter(models.StockConsumption.id == sc_id).first()
    if not db_sc:
        raise HTTPException(status_code=404, detail="Stock Consumption not found")

    if db_sc.status != "Draft":
        raise HTTPException(status_code=400, detail="Can only delete Draft records")

    db.delete(db_sc)
    db.commit()
    return {"message": "Stock Consumption deleted"}
