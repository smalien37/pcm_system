// =====================================================
// API Client & Data Management
// =====================================================

const API_BASE = '/api';

// Global App Data Store
let AppData = {
  vendors: [],
  itemSubGroups: [],
  items: [],
  itemGroups: [],
  sites: [],
  costCenters: [],
  purchaseOrders: [],
  goodsReceipts: [],
  stockConsumptions: [],
  stock: [],
  vendorCategories: [],
  itemCategories: [],
  departments: [],
  sections: [],
  godowns: [],
  invoices: [],
  debitNotes: []
};

let dataLoaded = false;
let currentUser = null;

// =====================================================
// API Methods
// =====================================================

const API = {
    async get(endpoint) {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async put(endpoint, data) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async patch(endpoint, data) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    // Authentication
    auth: {
        login: (email, password) => API.post('/auth/login', { email, password }),
        getUsers: () => API.get('/auth/users'),
        getUser: (id) => API.get(`/auth/users/${id}`),
        createUser: (data) => API.post('/auth/users', data),
        updateUser: (id, data) => API.put(`/auth/users/${id}`, data),
        deleteUser: (id) => API.delete(`/auth/users/${id}`),
    },

    lookups: {
        getItemSubgroups: () => API.get('/lookups/item-subgroups'),
        getVendorCategories: () => API.get('/lookups/vendor-categories'),
        createVendorCategory: (name) => API.post('/lookups/vendor-categories', { name }),
        getItemCategories: () => API.get('/lookups/item-categories'),
        createItemCategory: (name) => API.post('/lookups/item-categories', { name }),
        getSites: () => API.get('/lookups/sites'),
        getGodowns: () => API.get('/lookups/godowns'),
        getDepartments: () => API.get('/lookups/departments'),
        createDepartment: (name) => API.post('/lookups/departments', { name }),
        getSections: () => API.get('/lookups/sections'),
        createSection: (name) => API.post('/lookups/sections', { name }),
        getCostCenters: () => API.get('/lookups/cost-centers'),
    },

    vendors: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/vendors${query ? '?' + query : ''}`);
        },
        getById: (id) => API.get(`/vendors/${id}`),
        create: (data) => API.post('/vendors', data),
        update: (id, data) => API.put(`/vendors/${id}`, data),
        delete: (id) => API.delete(`/vendors/${id}`),
        getItems: (id) => API.get(`/vendors/${id}/items`),
        getOpenPOs: (id) => API.get(`/vendors/${id}/open-pos`),
    },

    items: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/items${query ? '?' + query : ''}`);
        },
        getById: (id) => API.get(`/items/${id}`),
        create: (data) => API.post('/items', data),
        update: (id, data) => API.put(`/items/${id}`, data),
        delete: (id) => API.delete(`/items/${id}`),
    },

    purchaseOrders: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/purchase-orders${query ? '?' + query : ''}`);
        },
        getById: (id) => API.get(`/purchase-orders/${id}`),
        getSummary: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/purchase-orders/summary${query ? '?' + query : ''}`);
        },
        getNextNumber: () => API.get('/purchase-orders/next-number'),
        create: (data) => API.post('/purchase-orders', data),
        update: (id, data) => API.put(`/purchase-orders/${id}`, data),
        approve: (id, approvedBy) => API.patch(`/purchase-orders/${id}/approve?approved_by=${approvedBy}`),
        delete: (id) => API.delete(`/purchase-orders/${id}`),
    },

    goodsReceipts: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/goods-receipts${query ? '?' + query : ''}`);
        },
        getById: (id) => API.get(`/goods-receipts/${id}`),
        getSummary: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/goods-receipts/summary${query ? '?' + query : ''}`);
        },
        getNextNumber: () => API.get('/goods-receipts/next-number'),
        create: (data) => API.post('/goods-receipts', data),
        delete: (id) => API.delete(`/goods-receipts/${id}`),
    },

    stock: {
        getOnHand: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/stock/on-hand${query ? '?' + query : ''}`);
        },
        getReorderItems: () => API.get('/stock/reorder'),
        getConsumptions: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/stock/consumption${query ? '?' + query : ''}`);
        },
        getConsumptionById: (id) => API.get(`/stock/consumption/${id}`),
        getConsumptionSummary: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`/stock/consumption/summary${query ? '?' + query : ''}`);
        },
        getNextSCNumber: () => API.get('/stock/consumption/next-number'),
        createConsumption: (data) => API.post('/stock/consumption', data),
        approveConsumption: (id, approvedBy) => API.patch(`/stock/consumption/${id}/approve?approved_by=${approvedBy}`),
        deleteConsumption: (id) => API.delete(`/stock/consumption/${id}`),
    },

    async loadInitialData() {
        try {
            const [
                vendors, items, itemSubgroups, sites, costCenters,
                vendorCategories, itemCategories, departments, sections, godowns,
                purchaseOrders, goodsReceipts, stockConsumptions, stock
            ] = await Promise.all([
                this.vendors.getAll(),
                this.items.getAll(),
                this.lookups.getItemSubgroups(),
                this.lookups.getSites(),
                this.lookups.getCostCenters(),
                this.lookups.getVendorCategories(),
                this.lookups.getItemCategories(),
                this.lookups.getDepartments(),
                this.lookups.getSections(),
                this.lookups.getGodowns(),
                this.purchaseOrders.getAll(),
                this.goodsReceipts.getAll(),
                this.stock.getConsumptions(),
                this.stock.getOnHand()
            ]);

            return {
                vendors: vendors.map(v => ({
                    id: v.id,
                    name: v.name,
                    contact: v.contact,
                    phone: v.phone,
                    address: v.address,
                    category: v.primary_category,
                    categories: v.categories || [],
                    subGroups: v.subgroups || [],
                    itemIds: v.item_ids || [],
                    status: v.status
                })),
                items: items.map(i => ({
                    id: i.id,
                    sku: i.sku,
                    name: i.name,
                    uom: i.uom,
                    category: i.category?.name || '',
                    subGroup: i.subgroup_id,
                    reorder: i.reorder_level,
                    tracking: i.tracking,
                    status: i.status,
                    rate: parseFloat(i.rate) || 0
                })),
                itemSubGroups: itemSubgroups.map(sg => ({
                    id: sg.id,
                    name: sg.name,
                    description: sg.description
                })),
                sites: sites.map(s => ({
                    id: s.id,
                    code: s.code,
                    name: s.name,
                    type: s.type,
                    status: s.status
                })),
                costCenters: costCenters.map(cc => ({
                    id: cc.id,
                    name: cc.name,
                    department: cc.department?.name || '',
                    section: cc.section?.name || ''
                })),
                vendorCategories: vendorCategories.map(vc => vc.name),
                itemCategories: itemCategories.map(ic => ic.name),
                departments: departments.map(d => ({ id: d.id, name: d.name })),
                sections: sections.map(s => ({ id: s.id, name: s.name })),
                godowns: godowns.map(g => ({ id: g.id, name: g.name })),
                purchaseOrders: purchaseOrders.map(po => ({
                    id: po.id,
                    vendorId: po.vendor_id,
                    vendorName: po.vendor?.name || '',
                    siteId: po.site_id,
                    siteName: po.site?.name || '',
                    department: po.department?.name || '',
                    section: po.section?.name || '',
                    date: po.po_date,
                    status: po.status,
                    createdBy: po.created_by,
                    approvedBy: po.approved_by,
                    items: (po.items || []).map(item => ({
                        itemId: item.item_id,
                        name: item.item?.name || item.description,
                        uom: item.uom,
                        qty: parseFloat(item.qty),
                        rate: parseFloat(item.rate),
                        disc: parseFloat(item.discount_pct) || 0,
                        taxableAmount: parseFloat(item.taxable_amount),
                        cgst: parseFloat(item.cgst_pct) || 0,
                        sgst: parseFloat(item.sgst_pct) || 0,
                        igst: parseFloat(item.igst_pct) || 0,
                        total: parseFloat(item.total_amount),
                        received: parseFloat(item.received_qty) || 0
                    })),
                    total: parseFloat(po.total_amount) || 0
                })),
                goodsReceipts: goodsReceipts.map(grn => ({
                    id: grn.id,
                    vendorId: grn.vendor_id,
                    vendorName: grn.vendor?.name || '',
                    siteId: grn.site_id,
                    siteName: grn.site?.name || '',
                    department: grn.department?.name || '',
                    section: grn.section?.name || '',
                    godown: grn.godown?.name || '',
                    challanNo: grn.challan_no,
                    date: grn.grn_date,
                    status: grn.status,
                    createdBy: grn.created_by,
                    items: (grn.items || []).map(item => ({
                        itemId: item.item_id,
                        name: item.item?.name || item.description,
                        uom: item.uom,
                        qty: parseFloat(item.qty),
                        rate: parseFloat(item.rate),
                        disc: parseFloat(item.discount_pct) || 0,
                        taxableAmount: parseFloat(item.taxable_amount),
                        cgst: parseFloat(item.cgst_pct) || 0,
                        sgst: parseFloat(item.sgst_pct) || 0,
                        igst: parseFloat(item.igst_pct) || 0,
                        total: parseFloat(item.total_amount),
                        rack: item.rack_bin,
                        poId: item.po_id
                    })),
                    total: parseFloat(grn.total_amount) || 0
                })),
                stockConsumptions: stockConsumptions.map(sc => ({
                    id: sc.id,
                    costCenter: sc.cost_center?.name || '',
                    date: sc.sc_date,
                    kmr: sc.kmr,
                    hmr: sc.hmr,
                    jobCardNo: sc.job_card_no,
                    department: sc.department?.name || '',
                    section: sc.section?.name || '',
                    godown: sc.godown?.name || '',
                    status: sc.status,
                    createdBy: sc.created_by,
                    approvedBy: sc.approved_by,
                    items: (sc.items || []).map(item => ({
                        itemId: item.item_id,
                        name: item.item?.name || item.description,
                        uom: item.uom,
                        qty: parseFloat(item.qty),
                        rate: parseFloat(item.rate),
                        amount: parseFloat(item.amount),
                        rack: item.rack_bin,
                        remarks: item.remarks
                    })),
                    total: parseFloat(sc.total_amount) || 0
                })),
                stock: stock.map(s => ({
                    sku: s.item?.sku || s.item_id,
                    itemName: s.item?.name || '',
                    siteId: s.site_id,
                    siteName: s.site?.name || '',
                    godownId: s.godown_id,
                    godown: s.godown?.name || '',
                    onHand: parseFloat(s.on_hand_qty) || 0,
                    reorder: s.item?.reorder_level || 0,
                    lastMovement: s.last_movement_date
                })),
                invoices: [],
                debitNotes: [],
                itemGroups: []
            };
        } catch (error) {
            console.error('Error loading data from API:', error);
            throw error;
        }
    }
};

// =====================================================
// Data Loading Functions
// =====================================================

async function loadAppData() {
  if (dataLoaded) return;

  try {
    console.log('Loading data from API...');
    const data = await API.loadInitialData();

    AppData.vendors = data.vendors || [];
    AppData.items = data.items || [];
    AppData.itemSubGroups = data.itemSubGroups || [];
    AppData.sites = data.sites || [];
    AppData.costCenters = data.costCenters || [];
    AppData.purchaseOrders = data.purchaseOrders || [];
    AppData.goodsReceipts = data.goodsReceipts || [];
    AppData.stockConsumptions = data.stockConsumptions || [];
    AppData.stock = data.stock || [];
    AppData.vendorCategories = data.vendorCategories || [];
    AppData.itemCategories = data.itemCategories || [];
    AppData.departments = data.departments || [];
    AppData.sections = data.sections || [];
    AppData.godowns = data.godowns || [];
    AppData.itemGroups = data.itemGroups || [];
    AppData.invoices = data.invoices || [];
    AppData.debitNotes = data.debitNotes || [];

    dataLoaded = true;
    console.log('Data loaded successfully:', {
      vendors: AppData.vendors.length,
      items: AppData.items.length,
      purchaseOrders: AppData.purchaseOrders.length,
      goodsReceipts: AppData.goodsReceipts.length
    });
  } catch (error) {
    console.error('Failed to load data from API:', error);
    console.log('Using empty data...');
  }
}

async function refreshVendors() {
  try {
    const vendors = await API.vendors.getAll();
    AppData.vendors = vendors.map(v => ({
      id: v.id,
      name: v.name,
      contact: v.contact,
      phone: v.phone,
      address: v.address,
      category: v.primary_category,
      categories: v.categories || [],
      subGroups: v.subgroups || [],
      itemIds: v.item_ids || [],
      status: v.status
    }));
  } catch (error) {
    console.error('Failed to refresh vendors:', error);
  }
}

async function refreshItems() {
  try {
    const items = await API.items.getAll();
    AppData.items = items.map(i => ({
      id: i.id,
      sku: i.sku,
      name: i.name,
      uom: i.uom,
      category: i.category?.name || '',
      subGroup: i.subgroup_id,
      reorder: i.reorder_level,
      tracking: i.tracking,
      status: i.status,
      rate: parseFloat(i.rate) || 0
    }));
  } catch (error) {
    console.error('Failed to refresh items:', error);
  }
}

async function refreshPurchaseOrders() {
  try {
    const pos = await API.purchaseOrders.getAll();
    AppData.purchaseOrders = pos.map(po => ({
      id: po.id,
      vendorId: po.vendor_id,
      vendorName: po.vendor?.name || '',
      siteId: po.site_id,
      siteName: po.site?.name || '',
      department: po.department?.name || '',
      section: po.section?.name || '',
      date: po.po_date,
      status: po.status,
      createdBy: po.created_by,
      approvedBy: po.approved_by,
      items: (po.items || []).map(item => ({
        itemId: item.item_id,
        name: item.item?.name || item.description,
        uom: item.uom,
        qty: parseFloat(item.qty),
        rate: parseFloat(item.rate),
        disc: parseFloat(item.discount_pct) || 0,
        taxableAmount: parseFloat(item.taxable_amount),
        cgst: parseFloat(item.cgst_pct) || 0,
        sgst: parseFloat(item.sgst_pct) || 0,
        igst: parseFloat(item.igst_pct) || 0,
        total: parseFloat(item.total_amount),
        received: parseFloat(item.received_qty) || 0
      })),
      total: parseFloat(po.total_amount) || 0
    }));
  } catch (error) {
    console.error('Failed to refresh purchase orders:', error);
  }
}

async function refreshGoodsReceipts() {
  try {
    const grns = await API.goodsReceipts.getAll();
    AppData.goodsReceipts = grns.map(grn => ({
      id: grn.id,
      vendorId: grn.vendor_id,
      vendorName: grn.vendor?.name || '',
      siteId: grn.site_id,
      siteName: grn.site?.name || '',
      department: grn.department?.name || '',
      section: grn.section?.name || '',
      godown: grn.godown?.name || '',
      challanNo: grn.challan_no,
      date: grn.grn_date,
      status: grn.status,
      createdBy: grn.created_by,
      items: (grn.items || []).map(item => ({
        itemId: item.item_id,
        name: item.item?.name || item.description,
        uom: item.uom,
        qty: parseFloat(item.qty),
        rate: parseFloat(item.rate),
        disc: parseFloat(item.discount_pct) || 0,
        taxableAmount: parseFloat(item.taxable_amount),
        cgst: parseFloat(item.cgst_pct) || 0,
        sgst: parseFloat(item.sgst_pct) || 0,
        igst: parseFloat(item.igst_pct) || 0,
        total: parseFloat(item.total_amount),
        rack: item.rack_bin,
        poId: item.po_id
      })),
      total: parseFloat(grn.total_amount) || 0
    }));
  } catch (error) {
    console.error('Failed to refresh goods receipts:', error);
  }
}

async function refreshStockConsumptions() {
  try {
    const scs = await API.stock.getConsumptions();
    AppData.stockConsumptions = scs.map(sc => ({
      id: sc.id,
      costCenter: sc.cost_center?.name || '',
      date: sc.sc_date,
      kmr: sc.kmr,
      hmr: sc.hmr,
      jobCardNo: sc.job_card_no,
      department: sc.department?.name || '',
      section: sc.section?.name || '',
      godown: sc.godown?.name || '',
      status: sc.status,
      createdBy: sc.created_by,
      approvedBy: sc.approved_by,
      items: (sc.items || []).map(item => ({
        itemId: item.item_id,
        name: item.item?.name || item.description,
        uom: item.uom,
        qty: parseFloat(item.qty),
        rate: parseFloat(item.rate),
        amount: parseFloat(item.amount),
        rack: item.rack_bin,
        remarks: item.remarks
      })),
      total: parseFloat(sc.total_amount) || 0
    }));
  } catch (error) {
    console.error('Failed to refresh stock consumptions:', error);
  }
}

async function refreshStock() {
  try {
    const stock = await API.stock.getOnHand();
    AppData.stock = stock.map(s => ({
      sku: s.item?.sku || s.item_id,
      itemName: s.item?.name || '',
      siteId: s.site_id,
      siteName: s.site?.name || '',
      godownId: s.godown_id,
      godown: s.godown?.name || '',
      onHand: parseFloat(s.on_hand_qty) || 0,
      reorder: s.item?.reorder_level || 0,
      lastMovement: s.last_movement_date
    }));
  } catch (error) {
    console.error('Failed to refresh stock:', error);
  }
}

async function refreshLookups() {
  try {
    const [subgroups, vendorCats, itemCats, departments, sections, godowns, costCenters] = await Promise.all([
      API.lookups.getItemSubgroups(),
      API.lookups.getVendorCategories(),
      API.lookups.getItemCategories(),
      API.lookups.getDepartments(),
      API.lookups.getSections(),
      API.lookups.getGodowns(),
      API.lookups.getCostCenters()
    ]);

    AppData.itemSubGroups = subgroups.map(sg => ({ id: sg.id, name: sg.name, description: sg.description }));
    AppData.vendorCategories = vendorCats.map(vc => vc.name);
    AppData.itemCategories = itemCats.map(ic => ic.name);
    AppData.departments = departments.map(d => ({ id: d.id, name: d.name }));
    AppData.sections = sections.map(s => ({ id: s.id, name: s.name }));
    AppData.godowns = godowns.map(g => ({ id: g.id, name: g.name }));
    AppData.costCenters = costCenters.map(cc => ({
      id: cc.id,
      name: cc.name,
      department: cc.department?.name || '',
      section: cc.section?.name || ''
    }));
  } catch (error) {
    console.error('Failed to refresh lookups:', error);
  }
}

// =====================================================
// Helper Functions
// =====================================================

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
  if (!dateStr) return '';
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

// Make API globally available
window.API = API;
