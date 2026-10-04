# PCM System - Project Documentation

## Overview
PCM (Purchase & Inventory Control Management) System - A full-stack web application for managing purchase orders, goods receipts, vendors, items, inventory, and stock consumption.

## Tech Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Single-page application)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy

## Quick Start

```bash
# 1. Ensure PostgreSQL is running with database pcm_db1 and user pcm_user

# 2. Create/reset database schema
psql -U pcm_user -d pcm_db1 -f schema.sql

# 3. Run the application
./run.sh

# Or manually:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m backend.seed_data
uvicorn backend.main:app --reload --port 8000
```

**Access:**
- App: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Default Login:**
| Email | Password | Role |
|-------|----------|------|
| admin@syncflow.com | admin123 | Admin |
| manager@syncflow.com | manager123 | Manager |
| user@syncflow.com | user123 | User |
| viewer@syncflow.com | viewer123 | Viewer |

## File Structure

```
pcm_system-main/
├── .env                    # Database connection config
├── api.js                  # Frontend API client & data management
├── app.js                  # Main frontend application logic
├── index.html              # Entry point HTML
├── styles.css              # All styling
├── logo.png                # Application logo
├── requirements.txt        # Python dependencies
├── run.sh                  # Start script
├── schema.sql              # Complete database schema
├── add_users_table.sql     # Standalone users table script
│
├── backend/                # FastAPI backend
│   ├── __init__.py
│   ├── config.py           # Settings & environment config
│   ├── database.py         # Database connection
│   ├── main.py             # FastAPI app entry point
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── seed_data.py        # Database seeding script
│   │
│   └── routers/            # API route handlers
│       ├── __init__.py
│       ├── auth.py         # Authentication & user management
│       ├── lookups.py      # Departments, sections, godowns, etc.
│       ├── vendors.py      # Vendor CRUD
│       ├── items.py        # Item CRUD
│       ├── purchase_orders.py  # PO operations
│       ├── goods_receipts.py   # GRN operations
│       └── stock.py        # Stock & consumption operations
│
└── data/                   # Reference screenshots from client
```

## Database Schema

### Core Tables
- `users` - Authentication & user management
- `vendors` - Vendor master data
- `items` - Item master data
- `item_subgroups` - Item sub-group definitions
- `item_categories` - Item category lookup
- `vendor_categories` - Vendor category lookup

### Location Tables
- `sites` - Sites and warehouses
- `godowns` - Storage locations
- `departments` - Department lookup
- `sections` - Section lookup
- `cost_centers` - Cost centers with department/section mapping

### Transaction Tables
- `purchase_orders` - PO headers
- `po_items` - PO line items
- `goods_receipts` - GRN headers
- `grn_items` - GRN line items
- `stock_consumptions` - Stock consumption headers
- `sc_items` - Stock consumption line items
- `invoices` - Invoice headers
- `invoice_items` - Invoice line items
- `debit_notes` - Debit note headers
- `debit_note_items` - Debit note line items

### Inventory
- `stock` - Current stock levels by item/site/godown

### Junction Tables
- `vendor_category_map` - Vendor to categories
- `vendor_subgroup_map` - Vendor to subgroups
- `vendor_item_map` - Vendor to items they supply
- `item_groups` - Predefined item sets
- `item_group_items` - Items in each group

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - List all users
- `POST /api/auth/users` - Create user
- `PUT /api/auth/users/{id}` - Update user
- `DELETE /api/auth/users/{id}` - Delete user

### Vendors
- `GET /api/vendors` - List vendors (with filters)
- `GET /api/vendors/{id}` - Get vendor details
- `POST /api/vendors` - Create vendor
- `PUT /api/vendors/{id}` - Update vendor
- `DELETE /api/vendors/{id}` - Delete vendor
- `GET /api/vendors/{id}/items` - Get vendor's items
- `GET /api/vendors/{id}/open-pos` - Get vendor's open POs

### Items
- `GET /api/items` - List items (with filters)
- `GET /api/items/{id}` - Get item details
- `POST /api/items` - Create item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

### Purchase Orders
- `GET /api/purchase-orders` - List POs
- `GET /api/purchase-orders/{id}` - Get PO details
- `GET /api/purchase-orders/next-number` - Get next PO number
- `GET /api/purchase-orders/summary` - Get PO summary stats
- `POST /api/purchase-orders` - Create PO
- `PUT /api/purchase-orders/{id}` - Update PO
- `PATCH /api/purchase-orders/{id}/approve` - Approve PO
- `DELETE /api/purchase-orders/{id}` - Delete draft PO

### Goods Receipts
- `GET /api/goods-receipts` - List GRNs
- `GET /api/goods-receipts/{id}` - Get GRN details
- `GET /api/goods-receipts/next-number` - Get next GRN number
- `GET /api/goods-receipts/summary` - Get GRN summary stats
- `POST /api/goods-receipts` - Create GRN
- `DELETE /api/goods-receipts/{id}` - Delete draft GRN

### Stock
- `GET /api/stock/on-hand` - Get stock on hand
- `GET /api/stock/reorder` - Get items below reorder level
- `GET /api/stock/consumption` - List stock consumptions
- `GET /api/stock/consumption/{id}` - Get SC details
- `GET /api/stock/consumption/next-number` - Get next SC number
- `GET /api/stock/consumption/summary` - Get SC summary
- `POST /api/stock/consumption` - Create stock consumption
- `PATCH /api/stock/consumption/{id}/approve` - Approve SC
- `DELETE /api/stock/consumption/{id}` - Delete draft SC

### Lookups
- `GET /api/lookups/item-subgroups` - Item sub-groups
- `GET /api/lookups/vendor-categories` - Vendor categories
- `GET /api/lookups/item-categories` - Item categories
- `GET /api/lookups/sites` - Sites & warehouses
- `GET /api/lookups/godowns` - Godowns
- `GET /api/lookups/departments` - Departments
- `GET /api/lookups/sections` - Sections
- `GET /api/lookups/cost-centers` - Cost centers

## Frontend Architecture

### api.js
Contains all API communication and data management:
- `API` object - HTTP methods and endpoint wrappers
- `AppData` - Global data store
- `loadAppData()` - Initial data load from API
- `refreshVendors()`, `refreshItems()`, etc. - Data refresh functions
- Helper functions: `formatCurrency()`, `formatDate()`, `getStatusBadgeClass()`, `generateId()`

### app.js
Main application logic:
- Page rendering functions (`renderDashboard()`, `renderVendors()`, etc.)
- Modal handlers (`openPOModal()`, `openGRNModal()`, etc.)
- Save functions (all async, call API)
- Navigation and keyboard shortcuts

### Key Async Functions (API-connected)
- `handleLogin()` - Authenticates via `/api/auth/login`
- `saveVendor()` - Creates/updates vendor via API
- `saveItem()` - Creates/updates item via API
- `savePO()` - Creates purchase order via API
- `saveGRN()` - Creates goods receipt via API
- `saveSC()` - Creates stock consumption via API
- `saveOnTheFlyItem()` - Creates item during PO creation

## Key Features

### Purchase Orders (PO)
- Auto-generated PO numbers: `PO-NMTPL-XXXX`
- Multi-line items with GST calculation (CGST/SGST/IGST)
- Status flow: Draft → Open → Partially Received → Completed
- Vendor-filtered item selection

### Goods Receipt (GRN)
- Auto-generated GRN numbers: `GRN{YEAR}-XXXXX`
- Links to PO for receiving items
- Updates PO received quantities
- Updates stock on posting
- Staggered receipts (Accepted/Rejected/Damaged)

### Stock Consumption (SC)
- Auto-generated SC numbers: `SC-{YEAR}-XXXXX`
- Links to Cost Centers
- KMR/HMR tracking for vehicles
- Deducts from stock on posting

### Stock Management
- Real-time stock levels
- Reorder level alerts
- Movement tracking

## Configuration

### .env
```
DATABASE_URL=postgresql+psycopg://pcm_user:pcm_user@localhost:5432/pcm_db1
```

### Database Connection
Update `.env` or `backend/config.py` to change database credentials.

## Tax Calculation
Line items support Indian GST structure:
- Discount % applied to (Qty × Rate)
- Taxable Amount = Gross - Discount
- CGST, SGST, IGST applied to Taxable Amount
- Total = Taxable + CGST + SGST + IGST

## Status Badge Classes
- `badge-draft` - Purple dashed border (Draft)
- `badge-warning` - Yellow (Open, Partially Received, Pending Approval)
- `badge-success` - Green (Completed, Posted, Active)
- `badge-default` - Gray (default)

## Department & Section Options
- **Departments**: Maintenance, Production, HR
- **Sections**: Tipper, Excavator, Loader
- **Godowns**: Godown A, Godown B, Godown C, Godown D

## User Roles
- `admin` - Full access
- `manager` - Approval rights
- `user` - Create/edit access
- `viewer` - Read-only access

## Development Notes

### Adding New API Endpoints
1. Add model to `backend/models.py`
2. Add schema to `backend/schemas.py`
3. Create router in `backend/routers/`
4. Register router in `backend/main.py`
5. Add API methods to `api.js`

### Database Migrations
Currently manual - update `schema.sql` and recreate tables, or use ALTER statements.

### Running Tests
```bash
# API health check
curl http://localhost:8000/health

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@syncflow.com","password":"admin123"}'
```
