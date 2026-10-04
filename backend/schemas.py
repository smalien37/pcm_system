from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


class LoginRequest(BaseModel):
    email: str
    password: str

class UserBase(BaseModel):
    email: str
    name: str
    role: str = "user"
    department_id: Optional[int] = None
    status: str = "active"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    last_login: Optional[datetime] = None
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None


class ItemSubgroupBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class ItemSubgroupCreate(ItemSubgroupBase):
    pass

class ItemSubgroupResponse(ItemSubgroupBase):
    class Config:
        from_attributes = True


class VendorCategoryBase(BaseModel):
    name: str

class VendorCategoryCreate(VendorCategoryBase):
    pass

class VendorCategoryResponse(VendorCategoryBase):
    id: int
    class Config:
        from_attributes = True


class ItemCategoryBase(BaseModel):
    name: str

class ItemCategoryCreate(ItemCategoryBase):
    pass

class ItemCategoryResponse(ItemCategoryBase):
    id: int
    class Config:
        from_attributes = True


class SiteBase(BaseModel):
    id: str
    code: str
    name: str
    type: str
    status: Optional[str] = "active"

class SiteCreate(SiteBase):
    pass

class SiteResponse(SiteBase):
    class Config:
        from_attributes = True


class GodownBase(BaseModel):
    name: str
    site_id: Optional[str] = None
    status: Optional[str] = "active"

class GodownCreate(GodownBase):
    pass

class GodownResponse(GodownBase):
    id: int
    class Config:
        from_attributes = True


class DepartmentBase(BaseModel):
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    class Config:
        from_attributes = True


class SectionBase(BaseModel):
    name: str

class SectionCreate(SectionBase):
    pass

class SectionResponse(SectionBase):
    id: int
    class Config:
        from_attributes = True


class CostCenterBase(BaseModel):
    id: str
    name: str
    department_id: Optional[int] = None
    section_id: Optional[int] = None
    status: Optional[str] = "active"

class CostCenterCreate(CostCenterBase):
    pass

class CostCenterResponse(CostCenterBase):
    department: Optional[DepartmentResponse] = None
    section: Optional[SectionResponse] = None
    class Config:
        from_attributes = True


class ItemBase(BaseModel):
    id: str
    sku: str
    name: str
    uom: str
    category_id: Optional[int] = None
    subgroup_id: Optional[str] = None
    reorder_level: Optional[int] = 0
    tracking: Optional[str] = "-"
    rate: Optional[Decimal] = 0
    status: Optional[str] = "active"

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    category: Optional[ItemCategoryResponse] = None
    subgroup: Optional[ItemSubgroupResponse] = None
    class Config:
        from_attributes = True


class VendorBase(BaseModel):
    id: str
    name: str
    contact: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    primary_category: Optional[str] = None
    status: Optional[str] = "active"

class VendorCreate(VendorBase):
    categories: Optional[List[str]] = []
    subgroups: Optional[List[str]] = []
    item_ids: Optional[List[str]] = []

class VendorResponse(VendorBase):
    class Config:
        from_attributes = True

class VendorDetailResponse(VendorBase):
    categories: List[str] = []
    subgroups: List[str] = []
    item_ids: List[str] = []
    class Config:
        from_attributes = True


class POItemBase(BaseModel):
    item_id: str
    description: Optional[str] = None
    uom: str
    qty: Decimal
    rate: Decimal
    discount_pct: Optional[Decimal] = 0
    taxable_amount: Decimal
    cgst_pct: Optional[Decimal] = 0
    sgst_pct: Optional[Decimal] = 0
    igst_pct: Optional[Decimal] = 0
    cgst_amount: Optional[Decimal] = 0
    sgst_amount: Optional[Decimal] = 0
    igst_amount: Optional[Decimal] = 0
    total_amount: Decimal
    received_qty: Optional[Decimal] = 0
    line_no: Optional[int] = None

class POItemCreate(POItemBase):
    pass

class POItemResponse(POItemBase):
    id: int
    po_id: str
    item: Optional[ItemResponse] = None
    class Config:
        from_attributes = True


class PurchaseOrderBase(BaseModel):
    vendor_id: str
    site_id: Optional[str] = None
    department_id: Optional[int] = None
    section_id: Optional[int] = None
    po_date: date
    delivery_date: Optional[date] = None
    remarks: Optional[str] = None
    terms_conditions: Optional[str] = None
    status: Optional[str] = "Draft"
    total_taxable: Optional[Decimal] = 0
    total_cgst: Optional[Decimal] = 0
    total_sgst: Optional[Decimal] = 0
    total_igst: Optional[Decimal] = 0
    total_amount: Optional[Decimal] = 0
    created_by: Optional[str] = None
    approved_by: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    id: str
    items: List[POItemCreate] = []

class PurchaseOrderUpdate(BaseModel):
    vendor_id: Optional[str] = None
    site_id: Optional[str] = None
    department_id: Optional[int] = None
    section_id: Optional[int] = None
    po_date: Optional[date] = None
    delivery_date: Optional[date] = None
    remarks: Optional[str] = None
    terms_conditions: Optional[str] = None
    status: Optional[str] = None
    total_taxable: Optional[Decimal] = None
    total_cgst: Optional[Decimal] = None
    total_sgst: Optional[Decimal] = None
    total_igst: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    approved_by: Optional[str] = None
    items: Optional[List[POItemCreate]] = None

class PurchaseOrderResponse(PurchaseOrderBase):
    id: str
    vendor: Optional[VendorResponse] = None
    department: Optional[DepartmentResponse] = None
    section: Optional[SectionResponse] = None
    site: Optional[SiteResponse] = None
    items: List[POItemResponse] = []
    class Config:
        from_attributes = True


class GRNItemBase(BaseModel):
    po_id: Optional[str] = None
    po_item_id: Optional[int] = None
    item_id: str
    description: Optional[str] = None
    uom: str
    qty: Decimal
    accepted_qty: Optional[Decimal] = 0
    rejected_qty: Optional[Decimal] = 0
    damaged_qty: Optional[Decimal] = 0
    rate: Decimal
    discount_pct: Optional[Decimal] = 0
    taxable_amount: Decimal
    cgst_pct: Optional[Decimal] = 0
    sgst_pct: Optional[Decimal] = 0
    igst_pct: Optional[Decimal] = 0
    cgst_amount: Optional[Decimal] = 0
    sgst_amount: Optional[Decimal] = 0
    igst_amount: Optional[Decimal] = 0
    total_amount: Decimal
    rack_bin: Optional[str] = None
    line_no: Optional[int] = None

class GRNItemCreate(GRNItemBase):
    pass

class GRNItemResponse(GRNItemBase):
    id: int
    grn_id: str
    item: Optional[ItemResponse] = None
    class Config:
        from_attributes = True


class GoodsReceiptBase(BaseModel):
    vendor_id: str
    site_id: Optional[str] = None
    department_id: Optional[int] = None
    section_id: Optional[int] = None
    godown_id: Optional[int] = None
    challan_no: Optional[str] = None
    grn_date: date
    status: Optional[str] = "Draft"
    total_taxable: Optional[Decimal] = 0
    total_cgst: Optional[Decimal] = 0
    total_sgst: Optional[Decimal] = 0
    total_igst: Optional[Decimal] = 0
    total_amount: Optional[Decimal] = 0
    created_by: Optional[str] = None

class GoodsReceiptCreate(GoodsReceiptBase):
    id: str
    items: List[GRNItemCreate] = []

class GoodsReceiptResponse(GoodsReceiptBase):
    id: str
    vendor: Optional[VendorResponse] = None
    department: Optional[DepartmentResponse] = None
    section: Optional[SectionResponse] = None
    godown: Optional[GodownResponse] = None
    items: List[GRNItemResponse] = []
    class Config:
        from_attributes = True


class SCItemBase(BaseModel):
    item_id: str
    description: Optional[str] = None
    uom: str
    qty: Decimal
    rate: Decimal
    amount: Decimal
    rack_bin: Optional[str] = None
    remarks: Optional[str] = None
    line_no: Optional[int] = None

class SCItemCreate(SCItemBase):
    pass

class SCItemResponse(SCItemBase):
    id: int
    sc_id: str
    item: Optional[ItemResponse] = None
    class Config:
        from_attributes = True


class StockConsumptionBase(BaseModel):
    cost_center_id: Optional[str] = None
    department_id: Optional[int] = None
    section_id: Optional[int] = None
    godown_id: Optional[int] = None
    sc_date: date
    kmr: Optional[str] = None
    hmr: Optional[str] = None
    job_card_no: Optional[str] = None
    status: Optional[str] = "Draft"
    total_amount: Optional[Decimal] = 0
    created_by: Optional[str] = None
    approved_by: Optional[str] = None

class StockConsumptionCreate(StockConsumptionBase):
    id: str
    items: List[SCItemCreate] = []

class StockConsumptionResponse(StockConsumptionBase):
    id: str
    cost_center: Optional[CostCenterResponse] = None
    department: Optional[DepartmentResponse] = None
    section: Optional[SectionResponse] = None
    godown: Optional[GodownResponse] = None
    items: List[SCItemResponse] = []
    class Config:
        from_attributes = True


class StockBase(BaseModel):
    item_id: str
    site_id: Optional[str] = None
    godown_id: Optional[int] = None
    on_hand_qty: Optional[Decimal] = 0
    reserved_qty: Optional[Decimal] = 0
    last_movement_date: Optional[date] = None

class StockCreate(StockBase):
    pass

class StockResponse(StockBase):
    id: int
    available_qty: Optional[Decimal] = None
    item: Optional[ItemResponse] = None
    site: Optional[SiteResponse] = None
    godown: Optional[GodownResponse] = None
    class Config:
        from_attributes = True
