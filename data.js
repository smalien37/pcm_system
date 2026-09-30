// Sample Data Store
const AppData = {
  // Vendors
  vendors: [
    {
      id: 'VND-001',
      name: 'Acme Auto Parts',
      contact: 'ravi@acme.example',
      phone: '+91 98765 43210',
      address: '123 Industrial Area, Mumbai',
      category: 'Spare Parts',
      categories: ['Spare Parts', 'Lubricants'],
      subGroups: ['SG-TYRES', 'SG-FILTERS', 'SG-LUBRICANTS', 'SG-BRAKES'],
      itemIds: ['TYRE-295', 'FILTER-OF', 'FILTER-AF', 'OIL-15W40', 'BRAKE-PAD'],
      status: 'active'
    },
    {
      id: 'VND-002',
      name: 'Heavy Equipment Corp',
      contact: 'sales@heavyequip.com',
      phone: '+91 98765 12345',
      address: '456 Steel City, Jamshedpur',
      category: 'Heavy Equipment OEM',
      categories: ['Heavy Equipment OEM', 'Spare Parts'],
      subGroups: ['SG-BRAKES', 'SG-BELTS', 'SG-FILTERS'],
      itemIds: ['BRAKE-PAD', 'BELT-FAN', 'FILTER-OF', 'FILTER-AF'],
      status: 'active'
    },
    {
      id: 'VND-003',
      name: 'Fuel & Lube Suppliers',
      contact: 'orders@fuellube.in',
      phone: '+91 98123 45678',
      address: '789 Petro Hub, Chennai',
      category: 'Lubricants/Fuel',
      categories: ['Lubricants/Fuel'],
      subGroups: ['SG-FUEL', 'SG-LUBRICANTS'],
      itemIds: ['HSD-FUEL', 'OIL-15W40', 'GREASE-EP2', 'COOLANT-10L'],
      status: 'active'
    },
    {
      id: 'VND-004',
      name: 'Local Hardware Store',
      contact: 'info@localhw.com',
      phone: '+91 98456 78901',
      address: '321 Market Road, Bangalore',
      category: 'Local Hardware',
      categories: ['Local Hardware', 'Spare Parts'],
      subGroups: ['SG-HARDWARE', 'SG-FILTERS', 'SG-BELTS'],
      itemIds: ['BOLT-M12', 'FILTER-OF', 'FILTER-AF', 'BELT-FAN'],
      status: 'active'
    },
    {
      id: 'VND-005',
      name: 'MRF Tyres Ltd',
      contact: 'corporate@mrf.co.in',
      phone: '+91 44 2345 6789',
      address: '45 Tyre Park, Chennai',
      category: 'Tyres',
      categories: ['Tyres'],
      subGroups: ['SG-TYRES'],
      itemIds: ['TYRE-295'],
      status: 'active'
    },
    {
      id: 'VND-006',
      name: 'Castrol India',
      contact: 'b2b@castrol.in',
      phone: '+91 22 6789 0123',
      address: '78 Lubricant Tower, Mumbai',
      category: 'Lubricants/Fuel',
      categories: ['Lubricants/Fuel'],
      subGroups: ['SG-LUBRICANTS'],
      itemIds: ['OIL-15W40', 'GREASE-EP2', 'COOLANT-10L'],
      status: 'active'
    },
    {
      id: 'VND-007',
      name: 'Bosch Automotive',
      contact: 'parts@bosch.in',
      phone: '+91 80 4567 8901',
      address: '234 Auto Hub, Bangalore',
      category: 'Spare Parts',
      categories: ['Spare Parts', 'Filters'],
      subGroups: ['SG-FILTERS', 'SG-BRAKES', 'SG-BELTS'],
      itemIds: ['FILTER-OF', 'FILTER-AF', 'BRAKE-PAD', 'BELT-FAN'],
      status: 'active'
    },
    {
      id: 'VND-008',
      name: 'Indian Oil Corporation',
      contact: 'bulk@iocl.com',
      phone: '+91 11 2345 6780',
      address: '1 Fuel Depot, New Delhi',
      category: 'Lubricants/Fuel',
      categories: ['Lubricants/Fuel'],
      subGroups: ['SG-FUEL', 'SG-LUBRICANTS'],
      itemIds: ['HSD-FUEL', 'OIL-15W40'],
      status: 'active'
    },
    {
      id: 'VND-009',
      name: 'Tata AutoComp',
      contact: 'spares@tataautocomp.com',
      phone: '+91 20 6789 1234',
      address: '567 Auto Lane, Pune',
      category: 'Spare Parts',
      categories: ['Spare Parts', 'Heavy Equipment OEM'],
      subGroups: ['SG-BRAKES', 'SG-BELTS', 'SG-FILTERS', 'SG-LUBRICANTS'],
      itemIds: ['BRAKE-PAD', 'BELT-FAN', 'FILTER-OF', 'FILTER-AF', 'COOLANT-10L'],
      status: 'active'
    },
    {
      id: 'VND-010',
      name: 'Apollo Tyres',
      contact: 'sales@apollotyres.com',
      phone: '+91 124 456 7890',
      address: '89 Rubber Road, Gurgaon',
      category: 'Tyres',
      categories: ['Tyres'],
      subGroups: ['SG-TYRES'],
      itemIds: ['TYRE-295'],
      status: 'active'
    },
    {
      id: 'VND-011',
      name: 'Bharat Petroleum',
      contact: 'commercial@bpcl.in',
      phone: '+91 22 8901 2345',
      address: '12 Refinery Complex, Mumbai',
      category: 'Lubricants/Fuel',
      categories: ['Lubricants/Fuel'],
      subGroups: ['SG-FUEL', 'SG-LUBRICANTS'],
      itemIds: ['HSD-FUEL', 'OIL-15W40', 'GREASE-EP2'],
      status: 'active'
    },
    {
      id: 'VND-012',
      name: 'Sundaram Fasteners',
      contact: 'orders@sundaramfasteners.com',
      phone: '+91 44 5678 9012',
      address: '34 Industrial Estate, Chennai',
      category: 'Local Hardware',
      categories: ['Local Hardware'],
      subGroups: ['SG-HARDWARE'],
      itemIds: ['BOLT-M12'],
      status: 'active'
    }
  ],

  // Item Sub Groups
  itemSubGroups: [
    { id: 'SG-TYRES', name: 'Tyres & Tubes', description: 'All tyre related items' },
    { id: 'SG-LUBRICANTS', name: 'Lubricants & Oils', description: 'Engine oils, greases, coolants' },
    { id: 'SG-FILTERS', name: 'Filters', description: 'Oil, air, fuel filters' },
    { id: 'SG-FUEL', name: 'Fuel', description: 'HSD, petrol and other fuels' },
    { id: 'SG-HARDWARE', name: 'Hardware & Fasteners', description: 'Bolts, nuts, fasteners' },
    { id: 'SG-BRAKES', name: 'Brake Components', description: 'Brake pads, shoes, discs' },
    { id: 'SG-BELTS', name: 'Belts & Hoses', description: 'Fan belts, timing belts, hoses' }
  ],

  // Items Master
  items: [
    { id: 'TYRE-295', sku: 'TYRE-295', name: 'Tyre 295/80R22.5', uom: 'NOS', category: 'Tyres', subGroup: 'SG-TYRES', reorder: 10, tracking: 'Batch', status: 'active', rate: 15000 },
    { id: 'OIL-15W40', sku: 'OIL-15W40', name: 'Engine Oil 15W40', uom: 'LTR', category: 'Lubricants', subGroup: 'SG-LUBRICANTS', reorder: 50, tracking: 'Batch', status: 'active', rate: 350 },
    { id: 'FILTER-OF', sku: 'FILTER-OF', name: 'Oil Filter', uom: 'NOS', category: 'Filters', subGroup: 'SG-FILTERS', reorder: 25, tracking: '-', status: 'active', rate: 850 },
    { id: 'FILTER-AF', sku: 'FILTER-AF', name: 'Air Filter', uom: 'NOS', category: 'Filters', subGroup: 'SG-FILTERS', reorder: 20, tracking: '-', status: 'active', rate: 1200 },
    { id: 'HSD-FUEL', sku: 'HSD-FUEL', name: 'HSD Fuel', uom: 'LTR', category: 'Fuel', subGroup: 'SG-FUEL', reorder: 500, tracking: '-', status: 'active', rate: 95 },
    { id: 'BOLT-M12', sku: 'BOLT-M12', name: 'Hex Bolt M12x50', uom: 'NOS', category: 'Hardware', subGroup: 'SG-HARDWARE', reorder: 100, tracking: '-', status: 'active', rate: 25 },
    { id: 'GREASE-EP2', sku: 'GREASE-EP2', name: 'EP2 Grease', uom: 'KG', category: 'Lubricants', subGroup: 'SG-LUBRICANTS', reorder: 20, tracking: '-', status: 'active', rate: 180 },
    { id: 'COOLANT-10L', sku: 'COOLANT-10L', name: 'Radiator Coolant 10L', uom: 'NOS', category: 'Lubricants', subGroup: 'SG-LUBRICANTS', reorder: 15, tracking: 'Batch', status: 'active', rate: 950 },
    { id: 'BRAKE-PAD', sku: 'BRAKE-PAD', name: 'Brake Pad Set', uom: 'SET', category: 'Spare Parts', subGroup: 'SG-BRAKES', reorder: 10, tracking: '-', status: 'active', rate: 3500 },
    { id: 'BELT-FAN', sku: 'BELT-FAN', name: 'Fan Belt', uom: 'NOS', category: 'Spare Parts', subGroup: 'SG-BELTS', reorder: 8, tracking: '-', status: 'active', rate: 650 }
  ],

  // Item Groups - predefined sets of items for quick PO creation
  itemGroups: [
    {
      id: 'GRP-SERVICE',
      name: 'Standard Service Kit',
      description: 'Regular service items for vehicles',
      items: [
        { itemId: 'OIL-15W40', qty: 10, rate: 350 },
        { itemId: 'FILTER-OF', qty: 2, rate: 850 },
        { itemId: 'FILTER-AF', qty: 2, rate: 1200 },
        { itemId: 'GREASE-EP2', qty: 5, rate: 180 }
      ]
    },
    {
      id: 'GRP-TYRE',
      name: 'Tyre Replacement Set',
      description: 'Complete tyre replacement package',
      items: [
        { itemId: 'TYRE-295', qty: 4, rate: 15000 },
        { itemId: 'BOLT-M12', qty: 20, rate: 25 }
      ]
    },
    {
      id: 'GRP-BRAKE',
      name: 'Brake Maintenance Kit',
      description: 'Brake system maintenance items',
      items: [
        { itemId: 'BRAKE-PAD', qty: 2, rate: 3500 },
        { itemId: 'GREASE-EP2', qty: 2, rate: 180 }
      ]
    },
    {
      id: 'GRP-FUEL',
      name: 'Monthly Fuel & Lubricants',
      description: 'Monthly fuel and lubricant supply',
      items: [
        { itemId: 'HSD-FUEL', qty: 500, rate: 95 },
        { itemId: 'OIL-15W40', qty: 50, rate: 350 },
        { itemId: 'COOLANT-10L', qty: 5, rate: 950 }
      ]
    },
    {
      id: 'GRP-FILTER',
      name: 'Filter Kit',
      description: 'All types of filters',
      items: [
        { itemId: 'FILTER-OF', qty: 10, rate: 850 },
        { itemId: 'FILTER-AF', qty: 10, rate: 1200 }
      ]
    }
  ],

  // Sites
  sites: [
    { id: 'SITE-A', code: 'SITE-A', name: 'Site A - Mumbai', type: 'Site', status: 'active' },
    { id: 'SITE-B', code: 'SITE-B', name: 'Site B - Delhi', type: 'Site', status: 'active' },
    { id: 'SITE-C', code: 'SITE-C', name: 'Site C - Chennai', type: 'Site', status: 'active' },
    { id: 'SITE-D', code: 'SITE-D', name: 'Site D - Kolkata', type: 'Site', status: 'active' },
    { id: 'SITE-E', code: 'SITE-E', name: 'Site E - Bangalore', type: 'Site', status: 'active' },
    { id: 'WH-CENTRAL', code: 'WH-CENTRAL', name: 'Central Warehouse', type: 'Warehouse', status: 'active' },
    { id: 'WH-NORTH', code: 'WH-NORTH', name: 'North Zone Warehouse', type: 'Warehouse', status: 'active' },
    { id: 'WH-SOUTH', code: 'WH-SOUTH', name: 'South Zone Warehouse', type: 'Warehouse', status: 'active' }
  ],

  // Cost Centers
  costCenters: [
    { id: 'CC-001', name: 'Volvo Tipper - VT001', department: 'Maintenance', section: 'Tipper' },
    { id: 'CC-002', name: 'Volvo Tipper - VT002', department: 'Maintenance', section: 'Tipper' },
    { id: 'CC-003', name: 'Komatsu Excavator - KE001', department: 'Production', section: 'Excavator' },
    { id: 'CC-004', name: 'CAT Loader - CL001', department: 'Maintenance', section: 'Loader' },
    { id: 'CC-005', name: 'Workshop - General', department: 'Maintenance', section: 'Tipper' },
    { id: 'CC-006', name: 'Admin Office', department: 'HR', section: 'Tipper' }
  ],

  // Stock Consumption Records
  stockConsumptions: [
    {
      id: 'SC-2026-00001',
      costCenter: 'Volvo Tipper - VT001',
      date: '2026-09-15',
      kmr: '125430',
      hmr: '4520',
      jobCardNo: 'JC-2026-0145',
      department: 'Maintenance',
      section: 'Tipper',
      godown: 'Godown A',
      status: 'Posted',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', uom: 'LTR', qty: 10, rate: 350, amount: 3500, rack: 'A1-01', remarks: 'Regular service' },
        { itemId: 'FILTER-OF', name: 'Oil Filter', uom: 'NOS', qty: 1, rate: 850, amount: 850, rack: 'A2-03', remarks: 'Replaced' }
      ],
      total: 4350
    },
    {
      id: 'SC-2026-00002',
      costCenter: 'Komatsu Excavator - KE001',
      date: '2026-09-18',
      kmr: '',
      hmr: '8920',
      jobCardNo: 'JC-2026-0152',
      department: 'Production',
      section: 'Excavator',
      godown: 'Godown B',
      status: 'Posted',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', uom: 'LTR', qty: 200, rate: 95, amount: 19000, rack: 'B1-01', remarks: 'Daily refuel' },
        { itemId: 'GREASE-EP2', name: 'EP2 Grease', uom: 'KG', qty: 2, rate: 180, amount: 360, rack: 'B2-05', remarks: 'Boom greasing' }
      ],
      total: 19360
    },
    {
      id: 'SC-2026-00003',
      costCenter: 'CAT Loader - CL001',
      date: '2026-09-20',
      kmr: '45200',
      hmr: '3150',
      jobCardNo: 'JC-2026-0158',
      department: 'Maintenance',
      section: 'Loader',
      godown: 'Godown A',
      status: 'Draft',
      createdBy: 'Admin',
      approvedBy: '',
      items: [
        { itemId: 'BRAKE-PAD', name: 'Brake Pad Set', uom: 'SET', qty: 1, rate: 3500, amount: 3500, rack: 'A3-02', remarks: 'Front brake replacement' },
        { itemId: 'COOLANT-10L', name: 'Radiator Coolant 10L', uom: 'NOS', qty: 1, rate: 950, amount: 950, rack: 'A2-08', remarks: 'Top up' }
      ],
      total: 4450
    },
    {
      id: 'SC-2026-00004',
      costCenter: 'Volvo Tipper - VT002',
      date: '2026-09-22',
      kmr: '98750',
      hmr: '3890',
      jobCardNo: 'JC-2026-0165',
      department: 'Maintenance',
      section: 'Tipper',
      godown: 'Godown C',
      status: 'Posted',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', uom: 'NOS', qty: 2, rate: 15000, amount: 30000, rack: 'C1-01', remarks: 'Rear tyres replaced' }
      ],
      total: 30000
    },
    {
      id: 'SC-2026-00005',
      costCenter: 'Workshop - General',
      date: '2026-09-25',
      kmr: '',
      hmr: '',
      jobCardNo: 'JC-2026-0172',
      department: 'Maintenance',
      section: 'Tipper',
      godown: 'Godown A',
      status: 'Posted',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'BOLT-M12', name: 'Hex Bolt M12x50', uom: 'NOS', qty: 50, rate: 25, amount: 1250, rack: 'A4-01', remarks: 'General stock' },
        { itemId: 'BELT-FAN', name: 'Fan Belt', uom: 'NOS', qty: 3, rate: 650, amount: 1950, rack: 'A3-05', remarks: 'Spare stock' }
      ],
      total: 3200
    }
  ],

  // Purchase Orders
  purchaseOrders: [
    {
      id: 'PO-2026-00001',
      vendorId: 'VND-001',
      vendorName: 'Acme Auto Parts',
      siteId: 'SITE-B',
      siteName: 'Site B - Delhi',
      department: 'Maintenance',
      section: 'Tipper',
      date: '2026-07-15',
      status: 'Completed',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', uom: 'NOS', qty: 10, rate: 15000, disc: 0, taxableAmount: 150000, cgst: 9, sgst: 9, igst: 0, total: 177000, received: 10 }
      ],
      total: 177000
    },
    {
      id: 'PO-2026-00002',
      vendorId: 'VND-003',
      vendorName: 'Fuel & Lube Suppliers',
      siteId: 'SITE-A',
      siteName: 'Site A - Mumbai',
      department: 'Production',
      section: 'Excavator',
      date: '2026-07-20',
      status: 'Partially Received',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', uom: 'LTR', qty: 200, rate: 350, disc: 0, taxableAmount: 70000, cgst: 9, sgst: 9, igst: 0, total: 82600, received: 80 },
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', uom: 'LTR', qty: 1000, rate: 95, disc: 0, taxableAmount: 95000, cgst: 9, sgst: 9, igst: 0, total: 112100, received: 500 }
      ],
      total: 194700
    },
    {
      id: 'PO-2026-00003',
      vendorId: 'VND-004',
      vendorName: 'Local Hardware Store',
      siteId: 'WH-CENTRAL',
      siteName: 'Central Warehouse',
      department: 'Maintenance',
      section: 'Loader',
      date: '2026-07-25',
      status: 'Open',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'FILTER-OF', name: 'Oil Filter', uom: 'NOS', qty: 50, rate: 850, disc: 0, taxableAmount: 42500, cgst: 9, sgst: 9, igst: 0, total: 50150, received: 0 },
        { itemId: 'FILTER-AF', name: 'Air Filter', uom: 'NOS', qty: 30, rate: 1200, disc: 0, taxableAmount: 36000, cgst: 9, sgst: 9, igst: 0, total: 42480, received: 0 }
      ],
      total: 92630
    },
    {
      id: 'PO-2026-00004',
      vendorId: 'VND-005',
      vendorName: 'MRF Tyres Ltd',
      siteId: 'SITE-C',
      siteName: 'Site C - Chennai',
      department: 'Maintenance',
      section: 'Tipper',
      date: '2026-08-01',
      status: 'Open',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', uom: 'NOS', qty: 20, rate: 14500, disc: 0, taxableAmount: 290000, cgst: 9, sgst: 9, igst: 0, total: 342200, received: 0 }
      ],
      total: 342200
    },
    {
      id: 'PO-2026-00005',
      vendorId: 'VND-006',
      vendorName: 'Castrol India',
      siteId: 'WH-NORTH',
      siteName: 'North Zone Warehouse',
      department: 'Production',
      section: 'Excavator',
      date: '2026-08-02',
      status: 'Open',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', uom: 'LTR', qty: 500, rate: 340, disc: 0, taxableAmount: 170000, cgst: 9, sgst: 9, igst: 0, total: 200600, received: 0 },
        { itemId: 'GREASE-EP2', name: 'EP2 Grease', uom: 'KG', qty: 100, rate: 175, disc: 0, taxableAmount: 17500, cgst: 9, sgst: 9, igst: 0, total: 20650, received: 0 },
        { itemId: 'COOLANT-10L', name: 'Radiator Coolant 10L', uom: 'NOS', qty: 50, rate: 920, disc: 0, taxableAmount: 46000, cgst: 9, sgst: 9, igst: 0, total: 54280, received: 0 }
      ],
      total: 275530
    },
    {
      id: 'PO-2026-00006',
      vendorId: 'VND-007',
      vendorName: 'Bosch Automotive',
      siteId: 'SITE-E',
      siteName: 'Site E - Bangalore',
      department: 'Maintenance',
      section: 'Loader',
      date: '2026-08-03',
      status: 'Partially Received',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'FILTER-OF', name: 'Oil Filter', uom: 'NOS', qty: 100, rate: 820, disc: 0, taxableAmount: 82000, cgst: 9, sgst: 9, igst: 0, total: 96760, received: 40 },
        { itemId: 'FILTER-AF', name: 'Air Filter', uom: 'NOS', qty: 80, rate: 1150, disc: 0, taxableAmount: 92000, cgst: 9, sgst: 9, igst: 0, total: 108560, received: 30 },
        { itemId: 'BRAKE-PAD', name: 'Brake Pad Set', uom: 'SET', qty: 20, rate: 3400, disc: 0, taxableAmount: 68000, cgst: 9, sgst: 9, igst: 0, total: 80240, received: 10 }
      ],
      total: 285560
    },
    {
      id: 'PO-2026-00007',
      vendorId: 'VND-008',
      vendorName: 'Indian Oil Corporation',
      siteId: 'SITE-A',
      siteName: 'Site A - Mumbai',
      department: 'Production',
      section: 'Tipper',
      date: '2026-08-05',
      status: 'Open',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', uom: 'LTR', qty: 5000, rate: 92, disc: 0, taxableAmount: 460000, cgst: 9, sgst: 9, igst: 0, total: 542800, received: 0 }
      ],
      total: 542800
    },
    {
      id: 'PO-2026-00008',
      vendorId: 'VND-009',
      vendorName: 'Tata AutoComp',
      siteId: 'WH-SOUTH',
      siteName: 'South Zone Warehouse',
      department: 'Maintenance',
      section: 'Excavator',
      date: '2026-08-06',
      status: 'Open',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'BRAKE-PAD', name: 'Brake Pad Set', uom: 'SET', qty: 50, rate: 3450, disc: 0, taxableAmount: 172500, cgst: 9, sgst: 9, igst: 0, total: 203550, received: 0 },
        { itemId: 'BELT-FAN', name: 'Fan Belt', uom: 'NOS', qty: 30, rate: 640, disc: 0, taxableAmount: 19200, cgst: 9, sgst: 9, igst: 0, total: 22656, received: 0 },
        { itemId: 'COOLANT-10L', name: 'Radiator Coolant 10L', uom: 'NOS', qty: 25, rate: 940, disc: 0, taxableAmount: 23500, cgst: 9, sgst: 9, igst: 0, total: 27730, received: 0 }
      ],
      total: 253936
    },
    {
      id: 'PO-2026-00009',
      vendorId: 'VND-010',
      vendorName: 'Apollo Tyres',
      siteId: 'SITE-D',
      siteName: 'Site D - Kolkata',
      department: 'Maintenance',
      section: 'Tipper',
      date: '2026-08-07',
      status: 'Open',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', uom: 'NOS', qty: 16, rate: 14800, disc: 0, taxableAmount: 236800, cgst: 9, sgst: 9, igst: 0, total: 279424, received: 0 }
      ],
      total: 279424
    },
    {
      id: 'PO-2026-00010',
      vendorId: 'VND-011',
      vendorName: 'Bharat Petroleum',
      siteId: 'SITE-B',
      siteName: 'Site B - Delhi',
      department: 'Production',
      section: 'Loader',
      date: '2026-08-08',
      status: 'Partially Received',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', uom: 'LTR', qty: 3000, rate: 93, disc: 0, taxableAmount: 279000, cgst: 9, sgst: 9, igst: 0, total: 329220, received: 1500 },
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', uom: 'LTR', qty: 100, rate: 345, disc: 0, taxableAmount: 34500, cgst: 9, sgst: 9, igst: 0, total: 40710, received: 50 },
        { itemId: 'GREASE-EP2', name: 'EP2 Grease', uom: 'KG', qty: 50, rate: 178, disc: 0, taxableAmount: 8900, cgst: 9, sgst: 9, igst: 0, total: 10502, received: 25 }
      ],
      total: 380432
    },
    {
      id: 'PO-2026-00011',
      vendorId: 'VND-012',
      vendorName: 'Sundaram Fasteners',
      siteId: 'WH-CENTRAL',
      siteName: 'Central Warehouse',
      department: 'Maintenance',
      section: 'Tipper',
      date: '2026-08-10',
      status: 'Open',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'BOLT-M12', name: 'Hex Bolt M12x50', uom: 'NOS', qty: 500, rate: 24, disc: 0, taxableAmount: 12000, cgst: 9, sgst: 9, igst: 0, total: 14160, received: 0 }
      ],
      total: 14160
    },
    {
      id: 'PO-2026-00012',
      vendorId: 'VND-001',
      vendorName: 'Acme Auto Parts',
      siteId: 'SITE-A',
      siteName: 'Site A - Mumbai',
      department: 'Maintenance',
      section: 'Loader',
      date: '2026-08-12',
      status: 'Open',
      createdBy: 'Admin',
      approvedBy: 'Manager',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', uom: 'NOS', qty: 8, rate: 15000, disc: 0, taxableAmount: 120000, cgst: 9, sgst: 9, igst: 0, total: 141600, received: 0 },
        { itemId: 'BRAKE-PAD', name: 'Brake Pad Set', uom: 'SET', qty: 10, rate: 3500, disc: 0, taxableAmount: 35000, cgst: 9, sgst: 9, igst: 0, total: 41300, received: 0 }
      ],
      total: 182900
    }
  ],

  // Goods Receipt Notes
  goodsReceipts: [
    {
      id: 'GRN-2026-00001',
      poId: 'PO-2026-00001',
      vendorId: 'VND-001',
      vendorName: 'Acme Auto Parts',
      siteId: 'SITE-B',
      siteName: 'Site B',
      department: 'Maintenance',
      section: 'Tipper',
      godown: 'Godown A',
      challanNo: 'DC-2026-789',
      date: '2026-07-18',
      status: 'Posted',
      createdBy: 'Admin',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', uom: 'NOS', qty: 10, rate: 15000, disc: 0, taxableAmount: 150000, cgst: 9, sgst: 9, igst: 0, total: 177000, rack: 'A1-01', poId: 'PO-2026-00001' }
      ],
      total: 177000
    },
    {
      id: 'GRN-2026-00002',
      poId: 'PO-2026-00002',
      vendorId: 'VND-003',
      vendorName: 'Fuel & Lube Suppliers',
      siteId: 'SITE-A',
      siteName: 'Site A',
      department: 'Production',
      section: 'Excavator',
      godown: 'Godown B',
      challanNo: 'DC-2026-801',
      date: '2026-07-22',
      status: 'Posted',
      createdBy: 'Admin',
      items: [
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', uom: 'LTR', qty: 80, rate: 350, disc: 0, taxableAmount: 28000, cgst: 9, sgst: 9, igst: 0, total: 33040, rack: 'B2-01', poId: 'PO-2026-00002' },
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', uom: 'LTR', qty: 500, rate: 95, disc: 0, taxableAmount: 47500, cgst: 9, sgst: 9, igst: 0, total: 56050, rack: 'B1-01', poId: 'PO-2026-00002' }
      ],
      total: 89090
    },
    {
      id: 'GRN-2026-00003',
      poId: 'PO-2026-00006',
      vendorId: 'VND-007',
      vendorName: 'Bosch Automotive',
      siteId: 'SITE-E',
      siteName: 'Site E - Bangalore',
      department: 'Maintenance',
      section: 'Loader',
      godown: 'Godown C',
      challanNo: 'DC-2026-892',
      date: '2026-08-10',
      status: 'Posted',
      createdBy: 'Admin',
      items: [
        { itemId: 'FILTER-OF', name: 'Oil Filter', uom: 'NOS', qty: 40, rate: 820, disc: 0, taxableAmount: 32800, cgst: 9, sgst: 9, igst: 0, total: 38704, rack: 'C2-03', poId: 'PO-2026-00006' },
        { itemId: 'FILTER-AF', name: 'Air Filter', uom: 'NOS', qty: 30, rate: 1150, disc: 0, taxableAmount: 34500, cgst: 9, sgst: 9, igst: 0, total: 40710, rack: 'C2-04', poId: 'PO-2026-00006' },
        { itemId: 'BRAKE-PAD', name: 'Brake Pad Set', uom: 'SET', qty: 10, rate: 3400, disc: 0, taxableAmount: 34000, cgst: 9, sgst: 9, igst: 0, total: 40120, rack: 'C3-01', poId: 'PO-2026-00006' }
      ],
      total: 119534
    },
    {
      id: 'GRN-2026-00004',
      poId: 'PO-2026-00010',
      vendorId: 'VND-011',
      vendorName: 'Bharat Petroleum',
      siteId: 'SITE-B',
      siteName: 'Site B - Delhi',
      department: 'Production',
      section: 'Loader',
      godown: 'Godown D',
      challanNo: 'DC-2026-915',
      date: '2026-08-15',
      status: 'Posted',
      createdBy: 'Admin',
      items: [
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', uom: 'LTR', qty: 1500, rate: 93, disc: 0, taxableAmount: 139500, cgst: 9, sgst: 9, igst: 0, total: 164610, rack: 'D1-01', poId: 'PO-2026-00010' },
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', uom: 'LTR', qty: 50, rate: 345, disc: 0, taxableAmount: 17250, cgst: 9, sgst: 9, igst: 0, total: 20355, rack: 'D2-01', poId: 'PO-2026-00010' },
        { itemId: 'GREASE-EP2', name: 'EP2 Grease', uom: 'KG', qty: 25, rate: 178, disc: 0, taxableAmount: 4450, cgst: 9, sgst: 9, igst: 0, total: 5251, rack: 'D2-03', poId: 'PO-2026-00010' }
      ],
      total: 190216
    }
  ],

  // Stock Inventory
  stock: [
    { sku: 'TYRE-295', itemName: 'Tyre 295/80R22.5', siteId: 'SITE-B', siteName: 'Site B', onHand: 10, reorder: 10, lastMovement: '2026-07-18' },
    { sku: 'OIL-15W40', itemName: 'Engine Oil 15W40', siteId: 'SITE-A', siteName: 'Site A', onHand: 80, reorder: 50, lastMovement: '2026-07-22' },
    { sku: 'HSD-FUEL', itemName: 'HSD Fuel', siteId: 'SITE-A', siteName: 'Site A', onHand: 500, reorder: 500, lastMovement: '2026-07-22' },
    { sku: 'FILTER-OF', itemName: 'Oil Filter', siteId: 'SITE-B', siteName: 'Site B', onHand: 5, reorder: 25, lastMovement: '2026-07-10' },
    { sku: 'FILTER-AF', itemName: 'Air Filter', siteId: 'SITE-B', siteName: 'Site B', onHand: 3, reorder: 20, lastMovement: '2026-07-10' }
  ],

  // Categories for vendors
  vendorCategories: [
    'Local Hardware',
    'Heavy Equipment OEM',
    'Spare Parts',
    'Lubricants/Fuel',
    'Tyres',
    'Filters'
  ],

  // Item categories
  itemCategories: [
    'Tyres',
    'Lubricants',
    'Filters',
    'Fuel',
    'Hardware',
    'Spare Parts'
  ],

  // Invoices
  invoices: [
    {
      id: 'INV-2026-00001',
      vendorId: 'VND-001',
      vendorName: 'Acme Auto Parts',
      vendorBillNo: 'ACME/TAX/2026/1542',
      poId: 'PO-2026-00001',
      grnId: 'GRN-2026-00001',
      date: '2026-07-20',
      dueDate: '2026-08-20',
      matchStatus: 'Matched',
      status: 'Paid',
      total: 150000,
      variance: '₹0',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', qty: 10, rate: 15000, total: 150000 }
      ]
    },
    {
      id: 'INV-2026-00002',
      vendorId: 'VND-003',
      vendorName: 'Fuel & Lube Suppliers',
      vendorBillNo: 'FLS/INV/2026/0892',
      poId: 'PO-2026-00002',
      grnId: 'GRN-2026-00002',
      date: '2026-07-25',
      dueDate: '2026-08-25',
      matchStatus: 'Matched',
      status: 'Pending',
      total: 75500,
      variance: '₹0',
      items: [
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', qty: 80, rate: 350, total: 28000 },
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', qty: 500, rate: 95, total: 47500 }
      ]
    },
    {
      id: 'INV-2026-00003',
      vendorId: 'VND-002',
      vendorName: 'Heavy Equipment Corp',
      vendorBillNo: 'HEC/2026/TAX/0234',
      poId: 'PO-2026-00004',
      grnId: 'GRN-2026-00003',
      date: '2026-08-01',
      dueDate: '2026-09-01',
      matchStatus: 'Variance',
      status: 'Pending',
      total: 125000,
      variance: '+₹2,500',
      items: [
        { itemId: 'HYD-PUMP', name: 'Hydraulic Pump Assembly', qty: 1, rate: 125000, total: 125000 }
      ]
    },
    {
      id: 'INV-2026-00004',
      vendorId: 'VND-004',
      vendorName: 'Local Hardware Store',
      vendorBillNo: 'LHS/BILL/8821',
      poId: 'PO-2026-00003',
      grnId: 'GRN-2026-00004',
      date: '2026-08-05',
      dueDate: '2026-08-20',
      matchStatus: 'Matched',
      status: 'Pending',
      total: 42500,
      variance: '₹0',
      items: [
        { itemId: 'FILTER-OF', name: 'Oil Filter', qty: 50, rate: 850, total: 42500 }
      ]
    }
  ],

  // Debit Notes
  debitNotes: [
    {
      id: 'DN-2026-00001',
      vendorId: 'VND-003',
      vendorName: 'Fuel & Lube Suppliers',
      grnId: 'GRN-2026-00002',
      invoiceId: 'INV-2026-00002',
      date: '2026-07-28',
      reason: 'Damaged',
      description: '5 litres of Engine Oil 15W40 received damaged - containers leaking',
      amount: 1750,
      status: 'Sent',
      items: [
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', qty: 5, rate: 350, total: 1750 }
      ]
    },
    {
      id: 'DN-2026-00002',
      vendorId: 'VND-002',
      vendorName: 'Heavy Equipment Corp',
      grnId: 'GRN-2026-00003',
      invoiceId: 'INV-2026-00003',
      date: '2026-08-03',
      reason: 'Rejected',
      description: 'Hydraulic pump does not match specifications - wrong pressure rating',
      amount: 125000,
      status: 'Draft',
      items: [
        { itemId: 'HYD-PUMP', name: 'Hydraulic Pump Assembly', qty: 1, rate: 125000, total: 125000 }
      ]
    },
    {
      id: 'DN-2026-00003',
      vendorId: 'VND-001',
      vendorName: 'Acme Auto Parts',
      grnId: 'GRN-2026-00001',
      invoiceId: 'INV-2026-00001',
      date: '2026-07-22',
      reason: 'Price Difference',
      description: 'Invoice charged ₹15,500 per tyre but PO rate was ₹15,000',
      amount: 5000,
      status: 'Settled',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', qty: 10, rate: 500, total: 5000 }
      ]
    },
    {
      id: 'DN-2026-00004',
      vendorId: 'VND-004',
      vendorName: 'Local Hardware Store',
      grnId: 'GRN-2026-00004',
      invoiceId: 'INV-2026-00004',
      date: '2026-08-07',
      reason: 'Short Quantity',
      description: 'Received only 48 oil filters instead of 50 as per invoice',
      amount: 1700,
      status: 'Sent',
      items: [
        { itemId: 'FILTER-OF', name: 'Oil Filter', qty: 2, rate: 850, total: 1700 }
      ]
    }
  ]
};

// Helper functions
function generateId(prefix) {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}-${year}-${num}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getStatusBadgeClass(status) {
  const statusMap = {
    'Draft': 'badge-draft',
    'Open': 'badge-warning',
    'Partially Received': 'badge-warning',
    'Completed': 'badge-success',
    'Posted': 'badge-success',
    'Pending Approval': 'badge-warning',
    'active': 'badge-success',
    'inactive': 'badge-default'
  };
  return statusMap[status] || 'badge-default';
}
