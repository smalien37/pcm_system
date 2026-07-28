# pcm_system
Functional Specification: Vendor Directory &amp; Purchase/GRN Management

# Vendor Directory & Purchase/GRN Management System

A comprehensive functional specification and modular guide for building a robust inventory, vendor, and purchase order tracking system with support for staggered deliveries.

---

## 1. System Overview & Core Goal

The purpose of this module is to solve three main operational problems:
1. **Finding the Right Vendors Quickly:** Easily searching which suppliers provide specific categories or items when a need arises.
2. **Managing Purchases:** Creating Purchase Orders (POs) cleanly when items are needed.
3. **Handling Staggered/Partial Deliveries:** Updating inventory and tracking open PO balances when a vendor delivers goods in multiple shipments (Staggered GRN).

---

## 2. Core Modules & Data Fields

### Module A: Vendors & Item Category Directory
* **Goal:** To maintain a master list of vendors, tag them with the categories/items they supply, and allow team members to search for suppliers by item or category.
* **Data Fields Needed:**
  * **Vendor ID:** System Generated
  * **Vendor Name:** Text
  * **Contact Details:** Phone Number, Email, Address
  * **Vendor Category:** Dropdown (e.g., Local Hardware, Heavy Equipment OEM, Spare Parts, Lubricants/Fuel)
  * **Supplied Item Categories / Items:** Multi-select Tag/List (e.g., Tires, HSD Fuel, Filters, Engine Parts)
* **Key Screens / Views:**
  * **Vendor Creation Form:** To add or edit vendor details and select which item categories they supply.
  * **Vendor Search Directory:**
    * *Search Bar:* Type an item name (e.g., "Volvo Tipper Tires") or select a category.
    * *Search Results:* Displays a list of all matching vendors who supply that specific item/category along with their contact info.

### Module B: Purchase Order (PO) Management
* **Goal:** To generate official purchase requests with specific items, rates, and quantities.
* **Data Fields Needed:**
  * **PO Number:** Unique Identifier (e.g., `PO-2026-001`)
  * **Vendor Name:** Selected from the Vendor List
  * **Site / Location:** Dropdown (e.g., Site A, Site B)
  * **PO Date:** Date Picker
  * **PO Status:** Auto-calculated (`Open`, `Partially Received`, `Completed`, `Canceled`)
  * **Item Details Table:**
    * Item Name
    * Ordered Quantity
    * Unit Price
    * Total Price

### Module C: Staggered Goods Receipt Note (GRN) Management
* **Goal:** When a vendor sends a partial shipment (e.g., delivering only 20 tires out of 100 ordered), the system logs the partial receiving, updates stock levels, and keeps the PO open for the remaining balance.
* **Data Fields Needed:**
  * **GRN Number:** Unique Identifier (e.g., `GRN-2026-105`)
  * **Select PO Number:** Dropdown linking to open Purchase Orders
  * **Delivery Challan / Invoice Number:** Text (from supplier's paper slip)
  * **Received Date:** Date Picker
  * **Received Items Table:**
    * Item Name
    * Total Ordered Quantity *(Auto-filled from PO)*
    * Previously Received Quantity *(Auto-filled by System)*
    * Current Received Quantity *(Editable field filled by receiving staff)*
    * Remaining Balance Quantity *(Auto-calculated: $\text{Ordered} - \text{Total Received}$)*

---

## 3. Step-by-Step User Workflows

### Workflow 1: Finding Vendors for a Specific Item
```text
[Need an Item on Site] ──> [Open Vendor Directory] ──> [Search by Item / Category] ──> [System Lists Matching Vendors]
```
1. A site manager needs a specific part (e.g., Filters or Tires).
2. They open the Vendor Search screen and filter by the category or item name.
3. The app displays all matching vendors who supply that item, showing their contact details and category tags.

### Workflow 2: Creating a Purchase Order
```text
[Select Vendor] ──> [Add Items, Quantities & Rates] ──> [Save PO] ──> [PO Status set to 'OPEN']
```
1. The user creates a new Purchase Order and picks the vendor from the directory.
2. They add the required items, ordered quantities, and agreed prices.
3. The PO is saved, marked as `OPEN`, and stored in the system.

### Workflow 3: Staggered Delivery (Staggered GRN Update)
```text
[Vendor Arrives with Partial Goods] ──> [Staff Selects PO Number] ──> [Inputs Received Quantity] ──> [System Updates Stock & PO Balance]
```

#### Real Example Scenario:
* **Day 1 (Creating the PO):** You issue a PO for 100 Tires.
  * *PO Status:* `OPEN` (100 Pending)
* **Day 5 (First Delivery):** The vendor delivers 30 Tires with a delivery slip.
  * Receiving staff opens the New GRN screen and selects the PO.
  * The screen shows: `Ordered = 100`, `Previously Received = 0`.
  * Staff enters `Current Received = 30`.
  * **System Action:**
    * Adds `+30` Tires to the site's stock inventory.
    * Updates the PO status to `PARTIALLY RECEIVED`.
    * Calculates Remaining Balance: `70 Tires`.
* **Day 12 (Second Delivery):** The vendor delivers the remaining 70 Tires.
  * Staff opens a new GRN and selects the same PO.
  * The screen shows: `Ordered = 100`, `Previously Received = 30`.
  * Staff enters `Current Received = 70`.
  * **System Action:**
    * Adds `+70` Tires to inventory.
    * Remaining Balance becomes `0`.
    * System automatically marks the PO status as `COMPLETED`.

---

## 4. Key Rules for the Developers

1. **Flexible Categorization:** A vendor must be able to have multiple categories and multiple items assigned to them.
2. **Prevent Over-Receiving:** The GRN input screen should warn or block the user if they try to enter a Received Quantity that exceeds the remaining PO balance.
3. **Automatic Inventory Sync:** Saving a GRN must instantly increase the current stock balance of that item in the main inventory table.
