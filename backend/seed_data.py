"""
Seed script to populate the database with initial data from data.js
Run: python -m backend.seed_data
"""
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models
from datetime import datetime


def seed_database():
    db = SessionLocal()

    try:
        print("Seeding database...")

        print("  - Item Subgroups...")
        item_subgroups = [
            {"id": "SG-TYRES", "name": "Tyres & Tubes", "description": "All tyre related items"},
            {"id": "SG-LUBRICANTS", "name": "Lubricants & Oils", "description": "Engine oils, greases, coolants"},
            {"id": "SG-FILTERS", "name": "Filters", "description": "Oil, air, fuel filters"},
            {"id": "SG-FUEL", "name": "Fuel", "description": "HSD, petrol and other fuels"},
            {"id": "SG-HARDWARE", "name": "Hardware & Fasteners", "description": "Bolts, nuts, fasteners"},
            {"id": "SG-BRAKES", "name": "Brake Components", "description": "Brake pads, shoes, discs"},
            {"id": "SG-BELTS", "name": "Belts & Hoses", "description": "Fan belts, timing belts, hoses"},
        ]
        for sg in item_subgroups:
            if not db.query(models.ItemSubgroup).filter(models.ItemSubgroup.id == sg["id"]).first():
                db.add(models.ItemSubgroup(**sg))

        print("  - Vendor Categories...")
        vendor_categories = ["Local Hardware", "Heavy Equipment OEM", "Spare Parts", "Lubricants/Fuel", "Tyres", "Filters"]
        for cat in vendor_categories:
            if not db.query(models.VendorCategory).filter(models.VendorCategory.name == cat).first():
                db.add(models.VendorCategory(name=cat))

        print("  - Item Categories...")
        item_categories = ["Tyres", "Lubricants", "Filters", "Fuel", "Hardware", "Spare Parts"]
        for cat in item_categories:
            if not db.query(models.ItemCategory).filter(models.ItemCategory.name == cat).first():
                db.add(models.ItemCategory(name=cat))

        print("  - Departments...")
        departments = ["Maintenance", "Production", "HR"]
        for dept in departments:
            if not db.query(models.Department).filter(models.Department.name == dept).first():
                db.add(models.Department(name=dept))

        print("  - Sections...")
        sections = ["Tipper", "Excavator", "Loader"]
        for sec in sections:
            if not db.query(models.Section).filter(models.Section.name == sec).first():
                db.add(models.Section(name=sec))

        print("  - Godowns...")
        godowns = ["Godown A", "Godown B", "Godown C", "Godown D"]
        for gd in godowns:
            if not db.query(models.Godown).filter(models.Godown.name == gd).first():
                db.add(models.Godown(name=gd))

        db.commit()

        print("  - Sites...")
        sites = [
            {"id": "SITE-A", "code": "SITE-A", "name": "Site A - Mumbai", "type": "Site", "status": "active"},
            {"id": "SITE-B", "code": "SITE-B", "name": "Site B - Delhi", "type": "Site", "status": "active"},
            {"id": "SITE-C", "code": "SITE-C", "name": "Site C - Chennai", "type": "Site", "status": "active"},
            {"id": "SITE-D", "code": "SITE-D", "name": "Site D - Kolkata", "type": "Site", "status": "active"},
            {"id": "SITE-E", "code": "SITE-E", "name": "Site E - Bangalore", "type": "Site", "status": "active"},
            {"id": "WH-CENTRAL", "code": "WH-CENTRAL", "name": "Central Warehouse", "type": "Warehouse", "status": "active"},
            {"id": "WH-NORTH", "code": "WH-NORTH", "name": "North Zone Warehouse", "type": "Warehouse", "status": "active"},
            {"id": "WH-SOUTH", "code": "WH-SOUTH", "name": "South Zone Warehouse", "type": "Warehouse", "status": "active"},
        ]
        for site in sites:
            if not db.query(models.Site).filter(models.Site.id == site["id"]).first():
                db.add(models.Site(**site))

        db.commit()

        maint_dept = db.query(models.Department).filter(models.Department.name == "Maintenance").first()
        prod_dept = db.query(models.Department).filter(models.Department.name == "Production").first()
        hr_dept = db.query(models.Department).filter(models.Department.name == "HR").first()

        tipper_sec = db.query(models.Section).filter(models.Section.name == "Tipper").first()
        excavator_sec = db.query(models.Section).filter(models.Section.name == "Excavator").first()
        loader_sec = db.query(models.Section).filter(models.Section.name == "Loader").first()

        print("  - Cost Centers...")
        cost_centers = [
            {"id": "CC-001", "name": "Volvo Tipper - VT001", "department_id": maint_dept.id, "section_id": tipper_sec.id},
            {"id": "CC-002", "name": "Volvo Tipper - VT002", "department_id": maint_dept.id, "section_id": tipper_sec.id},
            {"id": "CC-003", "name": "Komatsu Excavator - KE001", "department_id": prod_dept.id, "section_id": excavator_sec.id},
            {"id": "CC-004", "name": "CAT Loader - CL001", "department_id": maint_dept.id, "section_id": loader_sec.id},
            {"id": "CC-005", "name": "Workshop - General", "department_id": maint_dept.id, "section_id": tipper_sec.id},
            {"id": "CC-006", "name": "Admin Office", "department_id": hr_dept.id, "section_id": tipper_sec.id},
        ]
        for cc in cost_centers:
            if not db.query(models.CostCenter).filter(models.CostCenter.id == cc["id"]).first():
                db.add(models.CostCenter(**cc))

        db.commit()

        tyres_cat = db.query(models.ItemCategory).filter(models.ItemCategory.name == "Tyres").first()
        lubricants_cat = db.query(models.ItemCategory).filter(models.ItemCategory.name == "Lubricants").first()
        filters_cat = db.query(models.ItemCategory).filter(models.ItemCategory.name == "Filters").first()
        fuel_cat = db.query(models.ItemCategory).filter(models.ItemCategory.name == "Fuel").first()
        hardware_cat = db.query(models.ItemCategory).filter(models.ItemCategory.name == "Hardware").first()
        spare_parts_cat = db.query(models.ItemCategory).filter(models.ItemCategory.name == "Spare Parts").first()

        print("  - Items...")
        items = [
            {"id": "TYRE-295", "sku": "TYRE-295", "name": "Tyre 295/80R22.5", "uom": "NOS", "category_id": tyres_cat.id, "subgroup_id": "SG-TYRES", "reorder_level": 10, "tracking": "Batch", "status": "active", "rate": 15000},
            {"id": "OIL-15W40", "sku": "OIL-15W40", "name": "Engine Oil 15W40", "uom": "LTR", "category_id": lubricants_cat.id, "subgroup_id": "SG-LUBRICANTS", "reorder_level": 50, "tracking": "Batch", "status": "active", "rate": 350},
            {"id": "FILTER-OF", "sku": "FILTER-OF", "name": "Oil Filter", "uom": "NOS", "category_id": filters_cat.id, "subgroup_id": "SG-FILTERS", "reorder_level": 25, "tracking": "-", "status": "active", "rate": 850},
            {"id": "FILTER-AF", "sku": "FILTER-AF", "name": "Air Filter", "uom": "NOS", "category_id": filters_cat.id, "subgroup_id": "SG-FILTERS", "reorder_level": 20, "tracking": "-", "status": "active", "rate": 1200},
            {"id": "HSD-FUEL", "sku": "HSD-FUEL", "name": "HSD Fuel", "uom": "LTR", "category_id": fuel_cat.id, "subgroup_id": "SG-FUEL", "reorder_level": 500, "tracking": "-", "status": "active", "rate": 95},
            {"id": "BOLT-M12", "sku": "BOLT-M12", "name": "Hex Bolt M12x50", "uom": "NOS", "category_id": hardware_cat.id, "subgroup_id": "SG-HARDWARE", "reorder_level": 100, "tracking": "-", "status": "active", "rate": 25},
            {"id": "GREASE-EP2", "sku": "GREASE-EP2", "name": "EP2 Grease", "uom": "KG", "category_id": lubricants_cat.id, "subgroup_id": "SG-LUBRICANTS", "reorder_level": 20, "tracking": "-", "status": "active", "rate": 180},
            {"id": "COOLANT-10L", "sku": "COOLANT-10L", "name": "Radiator Coolant 10L", "uom": "NOS", "category_id": lubricants_cat.id, "subgroup_id": "SG-LUBRICANTS", "reorder_level": 15, "tracking": "Batch", "status": "active", "rate": 950},
            {"id": "BRAKE-PAD", "sku": "BRAKE-PAD", "name": "Brake Pad Set", "uom": "SET", "category_id": spare_parts_cat.id, "subgroup_id": "SG-BRAKES", "reorder_level": 10, "tracking": "-", "status": "active", "rate": 3500},
            {"id": "BELT-FAN", "sku": "BELT-FAN", "name": "Fan Belt", "uom": "NOS", "category_id": spare_parts_cat.id, "subgroup_id": "SG-BELTS", "reorder_level": 8, "tracking": "-", "status": "active", "rate": 650},
        ]
        for item in items:
            if not db.query(models.Item).filter(models.Item.id == item["id"]).first():
                db.add(models.Item(**item))

        db.commit()

        print("  - Vendors...")
        vendors_data = [
            {"id": "VND-001", "name": "Acme Auto Parts", "contact": "ravi@acme.example", "phone": "+91 98765 43210", "address": "123 Industrial Area, Mumbai", "primary_category": "Spare Parts", "categories": ["Spare Parts", "Lubricants"], "subgroups": ["SG-TYRES", "SG-FILTERS", "SG-LUBRICANTS", "SG-BRAKES"], "items": ["TYRE-295", "FILTER-OF", "FILTER-AF", "OIL-15W40", "BRAKE-PAD"]},
            {"id": "VND-002", "name": "Heavy Equipment Corp", "contact": "sales@heavyequip.com", "phone": "+91 98765 12345", "address": "456 Steel City, Jamshedpur", "primary_category": "Heavy Equipment OEM", "categories": ["Heavy Equipment OEM", "Spare Parts"], "subgroups": ["SG-BRAKES", "SG-BELTS", "SG-FILTERS"], "items": ["BRAKE-PAD", "BELT-FAN", "FILTER-OF", "FILTER-AF"]},
            {"id": "VND-003", "name": "Fuel & Lube Suppliers", "contact": "orders@fuellube.in", "phone": "+91 98123 45678", "address": "789 Petro Hub, Chennai", "primary_category": "Lubricants/Fuel", "categories": ["Lubricants/Fuel"], "subgroups": ["SG-FUEL", "SG-LUBRICANTS"], "items": ["HSD-FUEL", "OIL-15W40", "GREASE-EP2", "COOLANT-10L"]},
            {"id": "VND-004", "name": "Local Hardware Store", "contact": "info@localhw.com", "phone": "+91 98456 78901", "address": "321 Market Road, Bangalore", "primary_category": "Local Hardware", "categories": ["Local Hardware", "Spare Parts"], "subgroups": ["SG-HARDWARE", "SG-FILTERS", "SG-BELTS"], "items": ["BOLT-M12", "FILTER-OF", "FILTER-AF", "BELT-FAN"]},
            {"id": "VND-005", "name": "MRF Tyres Ltd", "contact": "corporate@mrf.co.in", "phone": "+91 44 2345 6789", "address": "45 Tyre Park, Chennai", "primary_category": "Tyres", "categories": ["Tyres"], "subgroups": ["SG-TYRES"], "items": ["TYRE-295"]},
            {"id": "VND-006", "name": "Castrol India", "contact": "b2b@castrol.in", "phone": "+91 22 6789 0123", "address": "78 Lubricant Tower, Mumbai", "primary_category": "Lubricants/Fuel", "categories": ["Lubricants/Fuel"], "subgroups": ["SG-LUBRICANTS"], "items": ["OIL-15W40", "GREASE-EP2", "COOLANT-10L"]},
            {"id": "VND-007", "name": "Bosch Automotive", "contact": "parts@bosch.in", "phone": "+91 80 4567 8901", "address": "234 Auto Hub, Bangalore", "primary_category": "Spare Parts", "categories": ["Spare Parts", "Filters"], "subgroups": ["SG-FILTERS", "SG-BRAKES", "SG-BELTS"], "items": ["FILTER-OF", "FILTER-AF", "BRAKE-PAD", "BELT-FAN"]},
            {"id": "VND-008", "name": "Indian Oil Corporation", "contact": "bulk@iocl.com", "phone": "+91 11 2345 6780", "address": "1 Fuel Depot, New Delhi", "primary_category": "Lubricants/Fuel", "categories": ["Lubricants/Fuel"], "subgroups": ["SG-FUEL", "SG-LUBRICANTS"], "items": ["HSD-FUEL", "OIL-15W40"]},
            {"id": "VND-009", "name": "Tata AutoComp", "contact": "spares@tataautocomp.com", "phone": "+91 20 6789 1234", "address": "567 Auto Lane, Pune", "primary_category": "Spare Parts", "categories": ["Spare Parts", "Heavy Equipment OEM"], "subgroups": ["SG-BRAKES", "SG-BELTS", "SG-FILTERS", "SG-LUBRICANTS"], "items": ["BRAKE-PAD", "BELT-FAN", "FILTER-OF", "FILTER-AF", "COOLANT-10L"]},
            {"id": "VND-010", "name": "Apollo Tyres", "contact": "sales@apollotyres.com", "phone": "+91 124 456 7890", "address": "89 Rubber Road, Gurgaon", "primary_category": "Tyres", "categories": ["Tyres"], "subgroups": ["SG-TYRES"], "items": ["TYRE-295"]},
            {"id": "VND-011", "name": "Bharat Petroleum", "contact": "commercial@bpcl.in", "phone": "+91 22 8901 2345", "address": "12 Refinery Complex, Mumbai", "primary_category": "Lubricants/Fuel", "categories": ["Lubricants/Fuel"], "subgroups": ["SG-FUEL", "SG-LUBRICANTS"], "items": ["HSD-FUEL", "OIL-15W40", "GREASE-EP2"]},
            {"id": "VND-012", "name": "Sundaram Fasteners", "contact": "orders@sundaramfasteners.com", "phone": "+91 44 5678 9012", "address": "34 Industrial Estate, Chennai", "primary_category": "Local Hardware", "categories": ["Local Hardware"], "subgroups": ["SG-HARDWARE"], "items": ["BOLT-M12"]},
        ]

        for vdata in vendors_data:
            if not db.query(models.Vendor).filter(models.Vendor.id == vdata["id"]).first():
                vendor = models.Vendor(
                    id=vdata["id"],
                    name=vdata["name"],
                    contact=vdata["contact"],
                    phone=vdata["phone"],
                    address=vdata["address"],
                    primary_category=vdata["primary_category"],
                    status="active"
                )
                db.add(vendor)
                db.flush()

                for cat_name in vdata["categories"]:
                    cat = db.query(models.VendorCategory).filter(models.VendorCategory.name == cat_name).first()
                    if cat:
                        db.add(models.VendorCategoryMap(vendor_id=vdata["id"], category_id=cat.id))

                for sg_id in vdata["subgroups"]:
                    db.add(models.VendorSubgroupMap(vendor_id=vdata["id"], subgroup_id=sg_id))

                for item_id in vdata["items"]:
                    db.add(models.VendorItemMap(vendor_id=vdata["id"], item_id=item_id))

        db.commit()

        print("  - Initial Stock...")
        godown_a = db.query(models.Godown).filter(models.Godown.name == "Godown A").first()
        godown_b = db.query(models.Godown).filter(models.Godown.name == "Godown B").first()

        stock_data = [
            {"item_id": "TYRE-295", "site_id": "SITE-B", "godown_id": godown_a.id, "on_hand_qty": 10, "last_movement_date": "2026-07-18"},
            {"item_id": "OIL-15W40", "site_id": "SITE-A", "godown_id": godown_b.id, "on_hand_qty": 80, "last_movement_date": "2026-07-22"},
            {"item_id": "HSD-FUEL", "site_id": "SITE-A", "godown_id": godown_b.id, "on_hand_qty": 500, "last_movement_date": "2026-07-22"},
            {"item_id": "FILTER-OF", "site_id": "SITE-B", "godown_id": godown_a.id, "on_hand_qty": 5, "last_movement_date": "2026-07-10"},
            {"item_id": "FILTER-AF", "site_id": "SITE-B", "godown_id": godown_a.id, "on_hand_qty": 3, "last_movement_date": "2026-07-10"},
        ]
        for s in stock_data:
            existing = db.query(models.Stock).filter(
                models.Stock.item_id == s["item_id"],
                models.Stock.godown_id == s["godown_id"]
            ).first()
            if not existing:
                db.add(models.Stock(
                    item_id=s["item_id"],
                    site_id=s["site_id"],
                    godown_id=s["godown_id"],
                    on_hand_qty=s["on_hand_qty"],
                    last_movement_date=datetime.strptime(s["last_movement_date"], "%Y-%m-%d").date()
                ))

        db.commit()

        print("  - Users...")
        users_data = [
            {"email": "admin@syncflow.com", "password_hash": "admin123", "name": "System Admin", "role": "admin"},
            {"email": "manager@syncflow.com", "password_hash": "manager123", "name": "Operations Manager", "role": "manager"},
            {"email": "user@syncflow.com", "password_hash": "user123", "name": "Regular User", "role": "user"},
            {"email": "viewer@syncflow.com", "password_hash": "viewer123", "name": "Report Viewer", "role": "viewer"},
        ]
        for user_data in users_data:
            existing = db.query(models.User).filter(models.User.email == user_data["email"]).first()
            if not existing:
                db.add(models.User(**user_data, status="active"))

        db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
