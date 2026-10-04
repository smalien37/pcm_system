-- PCM System Database Schema
-- Database: pcm_db1
-- User: pcm_user

-- =====================================================
-- USERS TABLE (for authentication)
-- =====================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    department_id INTEGER,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- =====================================================
-- LOOKUP / MASTER TABLES (no dependencies)
-- =====================================================

-- Item Sub Groups (SG-TYRES, SG-LUBRICANTS, etc.)
CREATE TABLE item_subgroups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Categories (lookup)
CREATE TABLE vendor_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item Categories (lookup)
CREATE TABLE item_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sites & Warehouses
CREATE TABLE sites (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Site', 'Warehouse')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Godowns
CREATE TABLE godowns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    site_id VARCHAR(50) REFERENCES sites(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sections
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cost Centers
CREATE TABLE cost_centers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    section_id INTEGER REFERENCES sections(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CORE MASTER TABLES
-- =====================================================

-- Vendors
CREATE TABLE vendors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact VARCHAR(100),
    phone VARCHAR(50),
    address TEXT,
    primary_category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items
CREATE TABLE items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    uom VARCHAR(50) NOT NULL,
    category_id INTEGER REFERENCES item_categories(id),
    subgroup_id VARCHAR(50) REFERENCES item_subgroups(id),
    reorder_level INTEGER DEFAULT 0,
    tracking VARCHAR(50) DEFAULT '-' CHECK (tracking IN ('Batch', 'Serial', '-')),
    rate DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- JUNCTION TABLES (many-to-many relationships)
-- =====================================================

-- Vendor to Categories mapping
CREATE TABLE vendor_category_map (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES vendor_categories(id) ON DELETE CASCADE,
    UNIQUE(vendor_id, category_id)
);

-- Vendor to SubGroups mapping (which subgroups vendor deals with)
CREATE TABLE vendor_subgroup_map (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    subgroup_id VARCHAR(50) NOT NULL REFERENCES item_subgroups(id) ON DELETE CASCADE,
    UNIQUE(vendor_id, subgroup_id)
);

-- Vendor to Items mapping (which items vendor supplies)
CREATE TABLE vendor_item_map (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    vendor_rate DECIMAL(12, 2),
    UNIQUE(vendor_id, item_id)
);

-- =====================================================
-- ITEM GROUPS (predefined sets for quick PO creation)
-- =====================================================

CREATE TABLE item_groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE item_group_items (
    id SERIAL PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL REFERENCES item_groups(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    qty DECIMAL(12, 3) NOT NULL,
    rate DECIMAL(12, 2) NOT NULL,
    UNIQUE(group_id, item_id)
);

-- =====================================================
-- TRANSACTION TABLES
-- =====================================================

-- Purchase Orders (Header)
CREATE TABLE purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id),
    site_id VARCHAR(50) REFERENCES sites(id),
    department_id INTEGER REFERENCES departments(id),
    section_id INTEGER REFERENCES sections(id),
    po_date DATE NOT NULL,
    delivery_date DATE,
    remarks TEXT,
    terms_conditions TEXT,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Open', 'Partially Received', 'Completed', 'Cancelled')),
    total_taxable DECIMAL(14, 2) DEFAULT 0,
    total_cgst DECIMAL(14, 2) DEFAULT 0,
    total_sgst DECIMAL(14, 2) DEFAULT 0,
    total_igst DECIMAL(14, 2) DEFAULT 0,
    total_amount DECIMAL(14, 2) DEFAULT 0,
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Line Items
CREATE TABLE po_items (
    id SERIAL PRIMARY KEY,
    po_id VARCHAR(50) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    description TEXT,
    uom VARCHAR(50) NOT NULL,
    qty DECIMAL(12, 3) NOT NULL,
    rate DECIMAL(12, 2) NOT NULL,
    discount_pct DECIMAL(5, 2) DEFAULT 0,
    taxable_amount DECIMAL(14, 2) NOT NULL,
    cgst_pct DECIMAL(5, 2) DEFAULT 0,
    sgst_pct DECIMAL(5, 2) DEFAULT 0,
    igst_pct DECIMAL(5, 2) DEFAULT 0,
    cgst_amount DECIMAL(14, 2) DEFAULT 0,
    sgst_amount DECIMAL(14, 2) DEFAULT 0,
    igst_amount DECIMAL(14, 2) DEFAULT 0,
    total_amount DECIMAL(14, 2) NOT NULL,
    received_qty DECIMAL(12, 3) DEFAULT 0,
    line_no INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goods Receipt Notes (Header)
CREATE TABLE goods_receipts (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id),
    site_id VARCHAR(50) REFERENCES sites(id),
    department_id INTEGER REFERENCES departments(id),
    section_id INTEGER REFERENCES sections(id),
    godown_id INTEGER REFERENCES godowns(id),
    challan_no VARCHAR(100),
    grn_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Posted')),
    total_taxable DECIMAL(14, 2) DEFAULT 0,
    total_cgst DECIMAL(14, 2) DEFAULT 0,
    total_sgst DECIMAL(14, 2) DEFAULT 0,
    total_igst DECIMAL(14, 2) DEFAULT 0,
    total_amount DECIMAL(14, 2) DEFAULT 0,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goods Receipt Line Items
CREATE TABLE grn_items (
    id SERIAL PRIMARY KEY,
    grn_id VARCHAR(50) NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    po_id VARCHAR(50) REFERENCES purchase_orders(id),
    po_item_id INTEGER REFERENCES po_items(id),
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    description TEXT,
    uom VARCHAR(50) NOT NULL,
    qty DECIMAL(12, 3) NOT NULL,
    accepted_qty DECIMAL(12, 3) DEFAULT 0,
    rejected_qty DECIMAL(12, 3) DEFAULT 0,
    damaged_qty DECIMAL(12, 3) DEFAULT 0,
    rate DECIMAL(12, 2) NOT NULL,
    discount_pct DECIMAL(5, 2) DEFAULT 0,
    taxable_amount DECIMAL(14, 2) NOT NULL,
    cgst_pct DECIMAL(5, 2) DEFAULT 0,
    sgst_pct DECIMAL(5, 2) DEFAULT 0,
    igst_pct DECIMAL(5, 2) DEFAULT 0,
    cgst_amount DECIMAL(14, 2) DEFAULT 0,
    sgst_amount DECIMAL(14, 2) DEFAULT 0,
    igst_amount DECIMAL(14, 2) DEFAULT 0,
    total_amount DECIMAL(14, 2) NOT NULL,
    rack_bin VARCHAR(50),
    line_no INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Consumptions (Header)
CREATE TABLE stock_consumptions (
    id VARCHAR(50) PRIMARY KEY,
    cost_center_id VARCHAR(50) REFERENCES cost_centers(id),
    department_id INTEGER REFERENCES departments(id),
    section_id INTEGER REFERENCES sections(id),
    godown_id INTEGER REFERENCES godowns(id),
    sc_date DATE NOT NULL,
    kmr VARCHAR(50),
    hmr VARCHAR(50),
    job_card_no VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Posted')),
    total_amount DECIMAL(14, 2) DEFAULT 0,
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Consumption Line Items
CREATE TABLE sc_items (
    id SERIAL PRIMARY KEY,
    sc_id VARCHAR(50) NOT NULL REFERENCES stock_consumptions(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    description TEXT,
    uom VARCHAR(50) NOT NULL,
    qty DECIMAL(12, 3) NOT NULL,
    rate DECIMAL(12, 2) NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    rack_bin VARCHAR(50),
    remarks TEXT,
    line_no INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices (Header)
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id),
    vendor_bill_no VARCHAR(100),
    po_id VARCHAR(50) REFERENCES purchase_orders(id),
    grn_id VARCHAR(50) REFERENCES goods_receipts(id),
    invoice_date DATE NOT NULL,
    due_date DATE,
    match_status VARCHAR(50) DEFAULT 'Pending' CHECK (match_status IN ('Pending', 'Matched', 'Variance')),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Partially Paid', 'Cancelled')),
    total_amount DECIMAL(14, 2) DEFAULT 0,
    variance_amount DECIMAL(14, 2) DEFAULT 0,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Line Items
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    description TEXT,
    qty DECIMAL(12, 3) NOT NULL,
    rate DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    line_no INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debit Notes (Header)
CREATE TABLE debit_notes (
    id VARCHAR(50) PRIMARY KEY,
    vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id),
    grn_id VARCHAR(50) REFERENCES goods_receipts(id),
    invoice_id VARCHAR(50) REFERENCES invoices(id),
    dn_date DATE NOT NULL,
    reason VARCHAR(50) CHECK (reason IN ('Damaged', 'Rejected', 'Price Difference', 'Short Quantity', 'Other')),
    description TEXT,
    total_amount DECIMAL(14, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Settled', 'Cancelled')),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Debit Note Line Items
CREATE TABLE debit_note_items (
    id SERIAL PRIMARY KEY,
    dn_id VARCHAR(50) NOT NULL REFERENCES debit_notes(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    description TEXT,
    qty DECIMAL(12, 3) NOT NULL,
    rate DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    line_no INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INVENTORY / STOCK TABLE
-- =====================================================

CREATE TABLE stock (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    site_id VARCHAR(50) REFERENCES sites(id),
    godown_id INTEGER REFERENCES godowns(id),
    on_hand_qty DECIMAL(12, 3) DEFAULT 0,
    reserved_qty DECIMAL(12, 3) DEFAULT 0,
    available_qty DECIMAL(12, 3) GENERATED ALWAYS AS (on_hand_qty - reserved_qty) STORED,
    last_movement_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, site_id, godown_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_name ON vendors(name);

CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_subgroup ON items(subgroup_id);
CREATE INDEX idx_items_status ON items(status);

CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(po_date);
CREATE INDEX idx_po_department ON purchase_orders(department_id);

CREATE INDEX idx_grn_vendor ON goods_receipts(vendor_id);
CREATE INDEX idx_grn_status ON goods_receipts(status);
CREATE INDEX idx_grn_date ON goods_receipts(grn_date);

CREATE INDEX idx_sc_cost_center ON stock_consumptions(cost_center_id);
CREATE INDEX idx_sc_status ON stock_consumptions(status);
CREATE INDEX idx_sc_date ON stock_consumptions(sc_date);

CREATE INDEX idx_invoice_vendor ON invoices(vendor_id);
CREATE INDEX idx_invoice_status ON invoices(status);
CREATE INDEX idx_invoice_due_date ON invoices(due_date);

CREATE INDEX idx_stock_item ON stock(item_id);
CREATE INDEX idx_stock_site ON stock(site_id);

-- =====================================================
-- GRANT PERMISSIONS TO pcm_user
-- =====================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pcm_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pcm_user;
