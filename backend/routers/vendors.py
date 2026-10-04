from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])


@router.get("", response_model=List[schemas.VendorDetailResponse])
def get_vendors(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Vendor)

    if status:
        query = query.filter(models.Vendor.status == status)
    if search:
        query = query.filter(models.Vendor.name.ilike(f"%{search}%"))

    vendors = query.all()

    result = []
    for vendor in vendors:
        categories = [vc.category.name for vc in vendor.categories]
        subgroups = [vs.subgroup_id for vs in vendor.subgroups]
        item_ids = [vi.item_id for vi in vendor.items]

        result.append(schemas.VendorDetailResponse(
            id=vendor.id,
            name=vendor.name,
            contact=vendor.contact,
            phone=vendor.phone,
            address=vendor.address,
            primary_category=vendor.primary_category,
            status=vendor.status,
            categories=categories,
            subgroups=subgroups,
            item_ids=item_ids
        ))

    return result


@router.get("/{vendor_id}", response_model=schemas.VendorDetailResponse)
def get_vendor(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    categories = [vc.category.name for vc in vendor.categories]
    subgroups = [vs.subgroup_id for vs in vendor.subgroups]
    item_ids = [vi.item_id for vi in vendor.items]

    return schemas.VendorDetailResponse(
        id=vendor.id,
        name=vendor.name,
        contact=vendor.contact,
        phone=vendor.phone,
        address=vendor.address,
        primary_category=vendor.primary_category,
        status=vendor.status,
        categories=categories,
        subgroups=subgroups,
        item_ids=item_ids
    )


@router.post("", response_model=schemas.VendorResponse)
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    db_vendor = models.Vendor(
        id=vendor.id,
        name=vendor.name,
        contact=vendor.contact,
        phone=vendor.phone,
        address=vendor.address,
        primary_category=vendor.primary_category,
        status=vendor.status
    )
    db.add(db_vendor)

    for cat_name in vendor.categories:
        category = db.query(models.VendorCategory).filter(models.VendorCategory.name == cat_name).first()
        if category:
            db.add(models.VendorCategoryMap(vendor_id=vendor.id, category_id=category.id))

    for sg_id in vendor.subgroups:
        db.add(models.VendorSubgroupMap(vendor_id=vendor.id, subgroup_id=sg_id))

    for item_id in vendor.item_ids:
        db.add(models.VendorItemMap(vendor_id=vendor.id, item_id=item_id))

    db.commit()
    db.refresh(db_vendor)
    return db_vendor


@router.put("/{vendor_id}", response_model=schemas.VendorResponse)
def update_vendor(vendor_id: str, vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    db_vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    db_vendor.name = vendor.name
    db_vendor.contact = vendor.contact
    db_vendor.phone = vendor.phone
    db_vendor.address = vendor.address
    db_vendor.primary_category = vendor.primary_category
    db_vendor.status = vendor.status

    db.query(models.VendorCategoryMap).filter(models.VendorCategoryMap.vendor_id == vendor_id).delete()
    db.query(models.VendorSubgroupMap).filter(models.VendorSubgroupMap.vendor_id == vendor_id).delete()
    db.query(models.VendorItemMap).filter(models.VendorItemMap.vendor_id == vendor_id).delete()

    for cat_name in vendor.categories:
        category = db.query(models.VendorCategory).filter(models.VendorCategory.name == cat_name).first()
        if category:
            db.add(models.VendorCategoryMap(vendor_id=vendor_id, category_id=category.id))

    for sg_id in vendor.subgroups:
        db.add(models.VendorSubgroupMap(vendor_id=vendor_id, subgroup_id=sg_id))

    for item_id in vendor.item_ids:
        db.add(models.VendorItemMap(vendor_id=vendor_id, item_id=item_id))

    db.commit()
    db.refresh(db_vendor)
    return db_vendor


@router.delete("/{vendor_id}")
def delete_vendor(vendor_id: str, db: Session = Depends(get_db)):
    db_vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    db.delete(db_vendor)
    db.commit()
    return {"message": "Vendor deleted"}


@router.get("/{vendor_id}/items", response_model=List[schemas.ItemResponse])
def get_vendor_items(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    item_ids = [vi.item_id for vi in vendor.items]
    items = db.query(models.Item).filter(models.Item.id.in_(item_ids)).all()
    return items


@router.get("/{vendor_id}/open-pos")
def get_vendor_open_pos(vendor_id: str, db: Session = Depends(get_db)):
    pos = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.vendor_id == vendor_id,
        models.PurchaseOrder.status.in_(['Open', 'Partially Received'])
    ).all()

    result = []
    for po in pos:
        result.append({
            "id": po.id,
            "po_date": po.po_date,
            "department_id": po.department_id,
            "section_id": po.section_id,
            "department": po.department.name if po.department else None,
            "section": po.section.name if po.section else None,
            "status": po.status,
            "total_amount": float(po.total_amount) if po.total_amount else 0,
            "items": [
                {
                    "id": item.id,
                    "item_id": item.item_id,
                    "name": item.item.name if item.item else item.description,
                    "uom": item.uom,
                    "qty": float(item.qty),
                    "received_qty": float(item.received_qty) if item.received_qty else 0,
                    "pending_qty": float(item.qty) - float(item.received_qty or 0),
                    "rate": float(item.rate),
                    "cgst_pct": float(item.cgst_pct) if item.cgst_pct else 0,
                    "sgst_pct": float(item.sgst_pct) if item.sgst_pct else 0,
                    "igst_pct": float(item.igst_pct) if item.igst_pct else 0
                }
                for item in po.items
                if float(item.qty) > float(item.received_qty or 0)
            ]
        })

    return result
