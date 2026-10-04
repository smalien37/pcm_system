from sqlalchemy import Column, String, Integer, Numeric, Date, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False, default="user")
    department_id = Column(Integer, ForeignKey("departments.id"))
    status = Column(String(20), default="active")
    last_login = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    department = relationship("Department", foreign_keys=[department_id])


class ItemSubgroup(Base):
    __tablename__ = "item_subgroups"

    id = Column(String(20), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    items = relationship("Item", back_populates="subgroup")


class VendorCategory(Base):
    __tablename__ = "vendor_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now())


class ItemCategory(Base):
    __tablename__ = "item_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now())

    items = relationship("Item", back_populates="category")


class Site(Base):
    __tablename__ = "sites"

    id = Column(String(20), primary_key=True)
    code = Column(String(20), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Godown(Base):
    __tablename__ = "godowns"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    site_id = Column(String(20), ForeignKey("sites.id"))
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())

    site = relationship("Site")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now())


class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now())


class CostCenter(Base):
    __tablename__ = "cost_centers"

    id = Column(String(20), primary_key=True)
    name = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    section_id = Column(Integer, ForeignKey("sections.id"))
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    department = relationship("Department")
    section = relationship("Section")


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String(20), primary_key=True)
    name = Column(String(200), nullable=False)
    contact = Column(String(100))
    phone = Column(String(50))
    address = Column(Text)
    primary_category = Column(String(100))
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    categories = relationship("VendorCategoryMap", back_populates="vendor", cascade="all, delete-orphan")
    subgroups = relationship("VendorSubgroupMap", back_populates="vendor", cascade="all, delete-orphan")
    items = relationship("VendorItemMap", back_populates="vendor", cascade="all, delete-orphan")


class Item(Base):
    __tablename__ = "items"

    id = Column(String(20), primary_key=True)
    sku = Column(String(50), nullable=False, unique=True)
    name = Column(String(200), nullable=False)
    uom = Column(String(20), nullable=False)
    category_id = Column(Integer, ForeignKey("item_categories.id"))
    subgroup_id = Column(String(20), ForeignKey("item_subgroups.id"))
    reorder_level = Column(Integer, default=0)
    tracking = Column(String(20), default="-")
    rate = Column(Numeric(12, 2), default=0)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("ItemCategory", back_populates="items")
    subgroup = relationship("ItemSubgroup", back_populates="items")


class VendorCategoryMap(Base):
    __tablename__ = "vendor_category_map"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String(20), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("vendor_categories.id", ondelete="CASCADE"), nullable=False)

    vendor = relationship("Vendor", back_populates="categories")
    category = relationship("VendorCategory")


class VendorSubgroupMap(Base):
    __tablename__ = "vendor_subgroup_map"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String(20), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    subgroup_id = Column(String(20), ForeignKey("item_subgroups.id", ondelete="CASCADE"), nullable=False)

    vendor = relationship("Vendor", back_populates="subgroups")
    subgroup = relationship("ItemSubgroup")


class VendorItemMap(Base):
    __tablename__ = "vendor_item_map"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String(20), ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(String(20), ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    vendor_rate = Column(Numeric(12, 2))

    vendor = relationship("Vendor", back_populates="items")
    item = relationship("Item")


class ItemGroup(Base):
    __tablename__ = "item_groups"

    id = Column(String(20), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    items = relationship("ItemGroupItem", back_populates="group", cascade="all, delete-orphan")


class ItemGroupItem(Base):
    __tablename__ = "item_group_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(String(20), ForeignKey("item_groups.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(String(20), ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    qty = Column(Numeric(12, 3), nullable=False)
    rate = Column(Numeric(12, 2), nullable=False)

    group = relationship("ItemGroup", back_populates="items")
    item = relationship("Item")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(String(20), primary_key=True)
    vendor_id = Column(String(20), ForeignKey("vendors.id"), nullable=False)
    site_id = Column(String(20), ForeignKey("sites.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    section_id = Column(Integer, ForeignKey("sections.id"))
    po_date = Column(Date, nullable=False)
    delivery_date = Column(Date)
    remarks = Column(Text)
    terms_conditions = Column(Text)
    status = Column(String(30), default="Draft")
    total_taxable = Column(Numeric(14, 2), default=0)
    total_cgst = Column(Numeric(14, 2), default=0)
    total_sgst = Column(Numeric(14, 2), default=0)
    total_igst = Column(Numeric(14, 2), default=0)
    total_amount = Column(Numeric(14, 2), default=0)
    created_by = Column(String(100))
    approved_by = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    vendor = relationship("Vendor")
    site = relationship("Site")
    department = relationship("Department")
    section = relationship("Section")
    items = relationship("POItem", back_populates="po", cascade="all, delete-orphan")


class POItem(Base):
    __tablename__ = "po_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    po_id = Column(String(20), ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(String(20), ForeignKey("items.id"), nullable=False)
    description = Column(Text)
    uom = Column(String(20), nullable=False)
    qty = Column(Numeric(12, 3), nullable=False)
    rate = Column(Numeric(12, 2), nullable=False)
    discount_pct = Column(Numeric(5, 2), default=0)
    taxable_amount = Column(Numeric(14, 2), nullable=False)
    cgst_pct = Column(Numeric(5, 2), default=0)
    sgst_pct = Column(Numeric(5, 2), default=0)
    igst_pct = Column(Numeric(5, 2), default=0)
    cgst_amount = Column(Numeric(14, 2), default=0)
    sgst_amount = Column(Numeric(14, 2), default=0)
    igst_amount = Column(Numeric(14, 2), default=0)
    total_amount = Column(Numeric(14, 2), nullable=False)
    received_qty = Column(Numeric(12, 3), default=0)
    line_no = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

    po = relationship("PurchaseOrder", back_populates="items")
    item = relationship("Item")


class GoodsReceipt(Base):
    __tablename__ = "goods_receipts"

    id = Column(String(30), primary_key=True)
    vendor_id = Column(String(20), ForeignKey("vendors.id"), nullable=False)
    site_id = Column(String(20), ForeignKey("sites.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    section_id = Column(Integer, ForeignKey("sections.id"))
    godown_id = Column(Integer, ForeignKey("godowns.id"))
    challan_no = Column(String(100))
    grn_date = Column(Date, nullable=False)
    status = Column(String(20), default="Draft")
    total_taxable = Column(Numeric(14, 2), default=0)
    total_cgst = Column(Numeric(14, 2), default=0)
    total_sgst = Column(Numeric(14, 2), default=0)
    total_igst = Column(Numeric(14, 2), default=0)
    total_amount = Column(Numeric(14, 2), default=0)
    created_by = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    vendor = relationship("Vendor")
    site = relationship("Site")
    department = relationship("Department")
    section = relationship("Section")
    godown = relationship("Godown")
    items = relationship("GRNItem", back_populates="grn", cascade="all, delete-orphan")


class GRNItem(Base):
    __tablename__ = "grn_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    grn_id = Column(String(30), ForeignKey("goods_receipts.id", ondelete="CASCADE"), nullable=False)
    po_id = Column(String(20), ForeignKey("purchase_orders.id"))
    po_item_id = Column(Integer, ForeignKey("po_items.id"))
    item_id = Column(String(20), ForeignKey("items.id"), nullable=False)
    description = Column(Text)
    uom = Column(String(20), nullable=False)
    qty = Column(Numeric(12, 3), nullable=False)
    accepted_qty = Column(Numeric(12, 3), default=0)
    rejected_qty = Column(Numeric(12, 3), default=0)
    damaged_qty = Column(Numeric(12, 3), default=0)
    rate = Column(Numeric(12, 2), nullable=False)
    discount_pct = Column(Numeric(5, 2), default=0)
    taxable_amount = Column(Numeric(14, 2), nullable=False)
    cgst_pct = Column(Numeric(5, 2), default=0)
    sgst_pct = Column(Numeric(5, 2), default=0)
    igst_pct = Column(Numeric(5, 2), default=0)
    cgst_amount = Column(Numeric(14, 2), default=0)
    sgst_amount = Column(Numeric(14, 2), default=0)
    igst_amount = Column(Numeric(14, 2), default=0)
    total_amount = Column(Numeric(14, 2), nullable=False)
    rack_bin = Column(String(50))
    line_no = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

    grn = relationship("GoodsReceipt", back_populates="items")
    po = relationship("PurchaseOrder")
    item = relationship("Item")


class StockConsumption(Base):
    __tablename__ = "stock_consumptions"

    id = Column(String(30), primary_key=True)
    cost_center_id = Column(String(20), ForeignKey("cost_centers.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    section_id = Column(Integer, ForeignKey("sections.id"))
    godown_id = Column(Integer, ForeignKey("godowns.id"))
    sc_date = Column(Date, nullable=False)
    kmr = Column(String(50))
    hmr = Column(String(50))
    job_card_no = Column(String(50))
    status = Column(String(20), default="Draft")
    total_amount = Column(Numeric(14, 2), default=0)
    created_by = Column(String(100))
    approved_by = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    cost_center = relationship("CostCenter")
    department = relationship("Department")
    section = relationship("Section")
    godown = relationship("Godown")
    items = relationship("SCItem", back_populates="sc", cascade="all, delete-orphan")


class SCItem(Base):
    __tablename__ = "sc_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sc_id = Column(String(30), ForeignKey("stock_consumptions.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(String(20), ForeignKey("items.id"), nullable=False)
    description = Column(Text)
    uom = Column(String(20), nullable=False)
    qty = Column(Numeric(12, 3), nullable=False)
    rate = Column(Numeric(12, 2), nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    rack_bin = Column(String(50))
    remarks = Column(Text)
    line_no = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

    sc = relationship("StockConsumption", back_populates="items")
    item = relationship("Item")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(30), primary_key=True)
    vendor_id = Column(String(20), ForeignKey("vendors.id"), nullable=False)
    vendor_bill_no = Column(String(100))
    po_id = Column(String(20), ForeignKey("purchase_orders.id"))
    grn_id = Column(String(30), ForeignKey("goods_receipts.id"))
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date)
    match_status = Column(String(30), default="Pending")
    status = Column(String(20), default="Pending")
    total_amount = Column(Numeric(14, 2), default=0)
    variance_amount = Column(Numeric(14, 2), default=0)
    created_by = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    vendor = relationship("Vendor")
    po = relationship("PurchaseOrder")
    grn = relationship("GoodsReceipt")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    invoice_id = Column(String(30), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(String(20), ForeignKey("items.id"), nullable=False)
    description = Column(Text)
    qty = Column(Numeric(12, 3), nullable=False)
    rate = Column(Numeric(12, 2), nullable=False)
    total_amount = Column(Numeric(14, 2), nullable=False)
    line_no = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

    invoice = relationship("Invoice", back_populates="items")
    item = relationship("Item")


class DebitNote(Base):
    __tablename__ = "debit_notes"

    id = Column(String(30), primary_key=True)
    vendor_id = Column(String(20), ForeignKey("vendors.id"), nullable=False)
    grn_id = Column(String(30), ForeignKey("goods_receipts.id"))
    invoice_id = Column(String(30), ForeignKey("invoices.id"))
    dn_date = Column(Date, nullable=False)
    reason = Column(String(50))
    description = Column(Text)
    total_amount = Column(Numeric(14, 2), default=0)
    status = Column(String(20), default="Draft")
    created_by = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    vendor = relationship("Vendor")
    grn = relationship("GoodsReceipt")
    invoice = relationship("Invoice")
    items = relationship("DebitNoteItem", back_populates="debit_note", cascade="all, delete-orphan")


class DebitNoteItem(Base):
    __tablename__ = "debit_note_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dn_id = Column(String(30), ForeignKey("debit_notes.id", ondelete="CASCADE"), nullable=False)
    item_id = Column(String(20), ForeignKey("items.id"), nullable=False)
    description = Column(Text)
    qty = Column(Numeric(12, 3), nullable=False)
    rate = Column(Numeric(12, 2), nullable=False)
    total_amount = Column(Numeric(14, 2), nullable=False)
    line_no = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

    debit_note = relationship("DebitNote", back_populates="items")
    item = relationship("Item")


class Stock(Base):
    __tablename__ = "stock"

    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(String(20), ForeignKey("items.id"), nullable=False)
    site_id = Column(String(20), ForeignKey("sites.id"))
    godown_id = Column(Integer, ForeignKey("godowns.id"))
    on_hand_qty = Column(Numeric(12, 3), default=0)
    reserved_qty = Column(Numeric(12, 3), default=0)
    last_movement_date = Column(Date)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    item = relationship("Item")
    site = relationship("Site")
    godown = relationship("Godown")
