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
      itemIds: ['BOLT-M12'],
      status: 'active'
    }
  ],

  // Items Master
  items: [
    { id: 'TYRE-295', sku: 'TYRE-295', name: 'Tyre 295/80R22.5', uom: 'NOS', category: 'Tyres', reorder: 10, tracking: 'Batch', status: 'active', rate: 15000 },
    { id: 'OIL-15W40', sku: 'OIL-15W40', name: 'Engine Oil 15W40', uom: 'LTR', category: 'Lubricants', reorder: 50, tracking: 'Batch', status: 'active', rate: 350 },
    { id: 'FILTER-OF', sku: 'FILTER-OF', name: 'Oil Filter', uom: 'NOS', category: 'Filters', reorder: 25, tracking: '-', status: 'active', rate: 850 },
    { id: 'FILTER-AF', sku: 'FILTER-AF', name: 'Air Filter', uom: 'NOS', category: 'Filters', reorder: 20, tracking: '-', status: 'active', rate: 1200 },
    { id: 'HSD-FUEL', sku: 'HSD-FUEL', name: 'HSD Fuel', uom: 'LTR', category: 'Fuel', reorder: 500, tracking: '-', status: 'active', rate: 95 },
    { id: 'BOLT-M12', sku: 'BOLT-M12', name: 'Hex Bolt M12x50', uom: 'NOS', category: 'Hardware', reorder: 100, tracking: '-', status: 'active', rate: 25 },
    { id: 'GREASE-EP2', sku: 'GREASE-EP2', name: 'EP2 Grease', uom: 'KG', category: 'Lubricants', reorder: 20, tracking: '-', status: 'active', rate: 180 },
    { id: 'COOLANT-10L', sku: 'COOLANT-10L', name: 'Radiator Coolant 10L', uom: 'NOS', category: 'Lubricants', reorder: 15, tracking: 'Batch', status: 'active', rate: 950 },
    { id: 'BRAKE-PAD', sku: 'BRAKE-PAD', name: 'Brake Pad Set', uom: 'SET', category: 'Spare Parts', reorder: 10, tracking: '-', status: 'active', rate: 3500 },
    { id: 'BELT-FAN', sku: 'BELT-FAN', name: 'Fan Belt', uom: 'NOS', category: 'Spare Parts', reorder: 8, tracking: '-', status: 'active', rate: 650 }
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

  // Purchase Orders
  purchaseOrders: [
    {
      id: 'PO-2026-00001',
      vendorId: 'VND-001',
      vendorName: 'Acme Auto Parts',
      siteId: 'SITE-B',
      siteName: 'Site B - Delhi',
      date: '2026-07-15',
      status: 'Completed',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', qty: 10, rate: 15000, total: 150000, received: 10 }
      ],
      total: 150000
    },
    {
      id: 'PO-2026-00002',
      vendorId: 'VND-003',
      vendorName: 'Fuel & Lube Suppliers',
      siteId: 'SITE-A',
      siteName: 'Site A - Mumbai',
      date: '2026-07-20',
      status: 'Partially Received',
      items: [
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', qty: 200, rate: 350, total: 70000, received: 80 },
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', qty: 1000, rate: 95, total: 95000, received: 500 }
      ],
      total: 165000
    },
    {
      id: 'PO-2026-00003',
      vendorId: 'VND-004',
      vendorName: 'Local Hardware Store',
      siteId: 'WH-CENTRAL',
      siteName: 'Central Warehouse',
      date: '2026-07-25',
      status: 'Open',
      items: [
        { itemId: 'FILTER-OF', name: 'Oil Filter', qty: 50, rate: 850, total: 42500, received: 0 },
        { itemId: 'FILTER-AF', name: 'Air Filter', qty: 30, rate: 1200, total: 36000, received: 0 }
      ],
      total: 78500
    },
    {
      id: 'PO-2026-00004',
      vendorId: 'VND-005',
      vendorName: 'MRF Tyres Ltd',
      siteId: 'SITE-C',
      siteName: 'Site C - Chennai',
      date: '2026-08-01',
      status: 'Open',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', qty: 20, rate: 14500, total: 290000, received: 0 }
      ],
      total: 290000
    },
    {
      id: 'PO-2026-00005',
      vendorId: 'VND-006',
      vendorName: 'Castrol India',
      siteId: 'WH-NORTH',
      siteName: 'North Zone Warehouse',
      date: '2026-08-02',
      status: 'Open',
      items: [
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', qty: 500, rate: 340, total: 170000, received: 0 },
        { itemId: 'GREASE-EP2', name: 'EP2 Grease', qty: 100, rate: 175, total: 17500, received: 0 },
        { itemId: 'COOLANT-10L', name: 'Radiator Coolant 10L', qty: 50, rate: 920, total: 46000, received: 0 }
      ],
      total: 233500
    },
    {
      id: 'PO-2026-00006',
      vendorId: 'VND-007',
      vendorName: 'Bosch Automotive',
      siteId: 'SITE-E',
      siteName: 'Site E - Bangalore',
      date: '2026-08-03',
      status: 'Partially Received',
      items: [
        { itemId: 'FILTER-OF', name: 'Oil Filter', qty: 100, rate: 820, total: 82000, received: 40 },
        { itemId: 'FILTER-AF', name: 'Air Filter', qty: 80, rate: 1150, total: 92000, received: 30 },
        { itemId: 'BRAKE-PAD', name: 'Brake Pad Set', qty: 20, rate: 3400, total: 68000, received: 10 }
      ],
      total: 242000
    },
    {
      id: 'PO-2026-00007',
      vendorId: 'VND-008',
      vendorName: 'Indian Oil Corporation',
      siteId: 'SITE-A',
      siteName: 'Site A - Mumbai',
      date: '2026-08-05',
      status: 'Open',
      items: [
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', qty: 5000, rate: 92, total: 460000, received: 0 }
      ],
      total: 460000
    },
    {
      id: 'PO-2026-00008',
      vendorId: 'VND-009',
      vendorName: 'Tata AutoComp',
      siteId: 'WH-SOUTH',
      siteName: 'South Zone Warehouse',
      date: '2026-08-06',
      status: 'Open',
      items: [
        { itemId: 'BRAKE-PAD', name: 'Brake Pad Set', qty: 50, rate: 3450, total: 172500, received: 0 },
        { itemId: 'BELT-FAN', name: 'Fan Belt', qty: 30, rate: 640, total: 19200, received: 0 },
        { itemId: 'COOLANT-10L', name: 'Radiator Coolant 10L', qty: 25, rate: 940, total: 23500, received: 0 }
      ],
      total: 215200
    },
    {
      id: 'PO-2026-00009',
      vendorId: 'VND-010',
      vendorName: 'Apollo Tyres',
      siteId: 'SITE-D',
      siteName: 'Site D - Kolkata',
      date: '2026-08-07',
      status: 'Open',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', qty: 16, rate: 14800, total: 236800, received: 0 }
      ],
      total: 236800
    },
    {
      id: 'PO-2026-00010',
      vendorId: 'VND-011',
      vendorName: 'Bharat Petroleum',
      siteId: 'SITE-B',
      siteName: 'Site B - Delhi',
      date: '2026-08-08',
      status: 'Partially Received',
      items: [
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', qty: 3000, rate: 93, total: 279000, received: 1500 },
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', qty: 100, rate: 345, total: 34500, received: 50 },
        { itemId: 'GREASE-EP2', name: 'EP2 Grease', qty: 50, rate: 178, total: 8900, received: 25 }
      ],
      total: 322400
    },
    {
      id: 'PO-2026-00011',
      vendorId: 'VND-012',
      vendorName: 'Sundaram Fasteners',
      siteId: 'WH-CENTRAL',
      siteName: 'Central Warehouse',
      date: '2026-08-10',
      status: 'Open',
      items: [
        { itemId: 'BOLT-M12', name: 'Hex Bolt M12x50', qty: 500, rate: 24, total: 12000, received: 0 }
      ],
      total: 12000
    },
    {
      id: 'PO-2026-00012',
      vendorId: 'VND-001',
      vendorName: 'Acme Auto Parts',
      siteId: 'SITE-A',
      siteName: 'Site A - Mumbai',
      date: '2026-08-12',
      status: 'Open',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', qty: 8, rate: 15000, total: 120000, received: 0 },
        { itemId: 'BRAKE-PAD', name: 'Brake Pad Set', qty: 10, rate: 3500, total: 35000, received: 0 }
      ],
      total: 155000
    }
  ],

  // Goods Receipt Notes
  goodsReceipts: [
    {
      id: 'GRN-2026-00001',
      poId: 'PO-2026-00001',
      vendorName: 'Acme Auto Parts',
      siteId: 'SITE-B',
      siteName: 'Site B',
      challanNo: 'DC-2026-789',
      date: '2026-07-18',
      status: 'Posted',
      items: [
        { itemId: 'TYRE-295', name: 'Tyre 295/80R22.5', ordered: 10, previouslyReceived: 0, received: 10, balance: 0 }
      ]
    },
    {
      id: 'GRN-2026-00002',
      poId: 'PO-2026-00002',
      vendorName: 'Fuel & Lube Suppliers',
      siteId: 'SITE-A',
      siteName: 'Site A',
      challanNo: 'DC-2026-801',
      date: '2026-07-22',
      status: 'Posted',
      items: [
        { itemId: 'OIL-15W40', name: 'Engine Oil 15W40', ordered: 200, previouslyReceived: 0, received: 80, balance: 120 },
        { itemId: 'HSD-FUEL', name: 'HSD Fuel', ordered: 1000, previouslyReceived: 0, received: 500, balance: 500 }
      ]
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
