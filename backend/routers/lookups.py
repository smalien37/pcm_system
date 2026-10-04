from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/lookups", tags=["Lookups"])


@router.get("/item-subgroups", response_model=List[schemas.ItemSubgroupResponse])
def get_item_subgroups(db: Session = Depends(get_db)):
    return db.query(models.ItemSubgroup).all()


@router.post("/item-subgroups", response_model=schemas.ItemSubgroupResponse)
def create_item_subgroup(subgroup: schemas.ItemSubgroupCreate, db: Session = Depends(get_db)):
    db_subgroup = models.ItemSubgroup(**subgroup.model_dump())
    db.add(db_subgroup)
    db.commit()
    db.refresh(db_subgroup)
    return db_subgroup


@router.get("/vendor-categories", response_model=List[schemas.VendorCategoryResponse])
def get_vendor_categories(db: Session = Depends(get_db)):
    return db.query(models.VendorCategory).all()


@router.post("/vendor-categories", response_model=schemas.VendorCategoryResponse)
def create_vendor_category(category: schemas.VendorCategoryCreate, db: Session = Depends(get_db)):
    db_category = models.VendorCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get("/item-categories", response_model=List[schemas.ItemCategoryResponse])
def get_item_categories(db: Session = Depends(get_db)):
    return db.query(models.ItemCategory).all()


@router.post("/item-categories", response_model=schemas.ItemCategoryResponse)
def create_item_category(category: schemas.ItemCategoryCreate, db: Session = Depends(get_db)):
    db_category = models.ItemCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get("/sites", response_model=List[schemas.SiteResponse])
def get_sites(db: Session = Depends(get_db)):
    return db.query(models.Site).all()


@router.post("/sites", response_model=schemas.SiteResponse)
def create_site(site: schemas.SiteCreate, db: Session = Depends(get_db)):
    db_site = models.Site(**site.model_dump())
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site


@router.get("/godowns", response_model=List[schemas.GodownResponse])
def get_godowns(db: Session = Depends(get_db)):
    return db.query(models.Godown).all()


@router.post("/godowns", response_model=schemas.GodownResponse)
def create_godown(godown: schemas.GodownCreate, db: Session = Depends(get_db)):
    db_godown = models.Godown(**godown.model_dump())
    db.add(db_godown)
    db.commit()
    db.refresh(db_godown)
    return db_godown


@router.get("/departments", response_model=List[schemas.DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()


@router.post("/departments", response_model=schemas.DepartmentResponse)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    db_department = models.Department(**department.model_dump())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


@router.get("/sections", response_model=List[schemas.SectionResponse])
def get_sections(db: Session = Depends(get_db)):
    return db.query(models.Section).all()


@router.post("/sections", response_model=schemas.SectionResponse)
def create_section(section: schemas.SectionCreate, db: Session = Depends(get_db)):
    db_section = models.Section(**section.model_dump())
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    return db_section


@router.get("/cost-centers", response_model=List[schemas.CostCenterResponse])
def get_cost_centers(db: Session = Depends(get_db)):
    return db.query(models.CostCenter).all()


@router.post("/cost-centers", response_model=schemas.CostCenterResponse)
def create_cost_center(cost_center: schemas.CostCenterCreate, db: Session = Depends(get_db)):
    db_cost_center = models.CostCenter(**cost_center.model_dump())
    db.add(db_cost_center)
    db.commit()
    db.refresh(db_cost_center)
    return db_cost_center
