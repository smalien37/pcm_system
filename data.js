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
      items: ['Tires', 'Filters', 'Engine Oil'],
      status: 'active'
    },
    {
      id: 'VND-002',
      name: 'Heavy Equipment Corp',
      contact: 'sales@heavyequip.com',
      phone: '+91 98765 12345',
      address: '456 Steel City, Jamshedpur',
      category: 'Heavy Equipment OEM',
      categories: ['Heavy Equipment OEM'],
      items: ['Excavator Parts', 'Hydraulic Pumps'],
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
      items: ['HSD Fuel', 'Engine Oil 15W40', 'Grease'],
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
      items: ['Bolts', 'Nuts', 'Tools', 'Filters'],
      status: 'active'
    }
  ],

  // Items Master
  items: [
    { id: 'TYRE-295', sku: 'TYRE-295', name: 'Tyre 295/80R22.5', uom: 'NOS', category: 'Tyres', reorder: 10, tracking: 'Batch', status: 'active' },
    { id: 'OIL-15W40', sku: 'OIL-15W40', name: 'Engine Oil 15W40', uom: 'LTR', category: 'Lubricants', reorder: 50, tracking: 'Batch', status: 'active' },
    { id: 'FILTER-OF', sku: 'FILTER-OF', name: 'Oil Filter', uom: 'NOS', category: 'Filters', reorder: 25, tracking: '-', status: 'active' },
    { id: 'FILTER-AF', sku: 'FILTER-AF', name: 'Air Filter', uom: 'NOS', category: 'Filters', reorder: 20, tracking: '-', status: 'active' },
    { id: 'HSD-FUEL', sku: 'HSD-FUEL', name: 'HSD Fuel', uom: 'LTR', category: 'Fuel', reorder: 500, tracking: '-', status: 'active' },
    { id: 'BOLT-M12', sku: 'BOLT-M12', name: 'Hex Bolt M12x50', uom: 'NOS', category: 'Hardware', reorder: 100, tracking: '-', status: 'active' }
  ],

  // Sites
  sites: [
    { id: 'SITE-A', code: 'SITE-A', name: 'Site A', type: 'Site', status: 'active' },
    { id: 'SITE-B', code: 'SITE-B', name: 'Site B', type: 'Site', status: 'active' },
    { id: 'WH-CENTRAL', code: 'WH-CENTRAL', name: 'Central Warehouse', type: 'Warehouse', status: 'active' }
  ],

  // Purchase Orders
  purchaseOrders: [
    {
      id: 'PO-2026-00001',
      vendorId: 'VND-001',
      vendorName: 'Acme Auto Parts',
      siteId: 'SITE-B',
      siteName: 'Site B',
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
      siteName: 'Site A',
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
