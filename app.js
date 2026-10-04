// App State
let currentPage = 'dashboard';
let selectedRowIndex = -1;
let isSearchMode = false;
let showingShortcuts = false;
let sidebarCollapsed = false;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const pageContent = document.querySelector('.page-content');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setupPasswordToggle();

  // Load data from API
  await loadAppData();

  // Check if already logged in (for demo)
  if (sessionStorage.getItem('loggedIn')) {
    showMainApp();
  }
});

// Password visibility toggle
function setupPasswordToggle() {
  const toggleBtn = document.querySelector('.toggle-password');
  const passwordInput = document.getElementById('password');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
      } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁';
      }
    });
  }
}

// Event Listeners
function setupEventListeners() {
  // Login form
  loginForm.addEventListener('submit', handleLogin);

  // Logout
  logoutBtn.addEventListener('click', handleLogout);

  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;
      navigateTo(page);
    });
  });

  // Sidebar toggle
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  // Modal close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', handleGlobalKeyboard);
}

// Sidebar Toggle
function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const toggleBtn = document.querySelector('.sidebar-toggle');

  if (sidebarCollapsed) {
    sidebar.classList.add('collapsed');
    mainContent.classList.add('sidebar-collapsed');
    toggleBtn.textContent = '›';
  } else {
    sidebar.classList.remove('collapsed');
    mainContent.classList.remove('sidebar-collapsed');
    toggleBtn.textContent = '‹';
  }
}

// Keyboard Navigation Handler
function handleGlobalKeyboard(e) {
  // Don't handle if modal is open or in input field (unless Escape)
  const isModalOpen = !modalOverlay.classList.contains('hidden');
  const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

  // Escape key - close modal or exit search mode
  if (e.key === 'Escape') {
    if (isModalOpen) {
      closeModal();
      return;
    }
    if (isSearchMode) {
      exitSearchMode();
      return;
    }
    // Clear row selection
    clearRowSelection();
    return;
  }

  // If modal is open, don't process other shortcuts
  if (isModalOpen) return;

  // If in input and not Escape, let normal typing work
  if (isInInput && e.key !== '/') return;

  // Update keyboard hints UI
  updateKeyboardHints(e.key);

  switch(e.key) {
    case '/':
      // Focus search
      e.preventDefault();
      enterSearchMode();
      break;

    case 'n':
      // New item (context-aware)
      e.preventDefault();
      handleNewShortcut();
      break;

    case 'j':
      // Move down
      e.preventDefault();
      moveSelection(1);
      break;

    case 'k':
      // Move up
      e.preventDefault();
      moveSelection(-1);
      break;

    case 'Enter':
      // Open/view selected item
      e.preventDefault();
      openSelectedItem();
      break;

    case '?':
      // Toggle shortcuts help
      e.preventDefault();
      toggleShortcutsHelp();
      break;

    case 'g':
      // Quick navigation prefix (wait for next key)
      e.preventDefault();
      waitForNavKey();
      break;
  }
}

function updateKeyboardHints(key) {
  const validKeys = ['/', 'n', 'j', 'k', 'Enter'];
  const kbdElements = document.querySelectorAll('.keyboard-hints .kbd');

  kbdElements.forEach(kbd => {
    kbd.classList.remove('active');
    if (kbd.textContent === key || (key === 'Enter' && kbd.textContent === '↵')) {
      kbd.classList.add('active');
      setTimeout(() => kbd.classList.remove('active'), 200);
    }
  });
}

function enterSearchMode() {
  isSearchMode = true;
  const searchInput = document.querySelector('.filter-input');
  if (searchInput) {
    searchInput.focus();
    searchInput.parentElement?.classList.add('search-mode');
  }
}

function exitSearchMode() {
  isSearchMode = false;
  const searchInput = document.querySelector('.filter-input');
  if (searchInput) {
    searchInput.blur();
    searchInput.parentElement?.classList.remove('search-mode');
  }
}

function handleNewShortcut() {
  switch(currentPage) {
    case 'vendors':
      openVendorModal();
      break;
    case 'items':
      openItemModal();
      break;
    case 'purchase-orders':
      openPOModal();
      break;
    case 'goods-receipt':
      openGRNModal();
      break;
    case 'sites':
      document.getElementById('btn-new-site')?.click();
      break;
  }
}

function moveSelection(direction) {
  const rows = document.querySelectorAll('.data-table tbody tr');
  if (rows.length === 0) return;

  // Clear previous selection
  rows.forEach(row => row.classList.remove('selected'));

  // Calculate new index
  selectedRowIndex += direction;
  if (selectedRowIndex < 0) selectedRowIndex = 0;
  if (selectedRowIndex >= rows.length) selectedRowIndex = rows.length - 1;

  // Apply selection
  const selectedRow = rows[selectedRowIndex];
  if (selectedRow) {
    selectedRow.classList.add('selected');
    selectedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function clearRowSelection() {
  selectedRowIndex = -1;
  document.querySelectorAll('.data-table tbody tr').forEach(row => {
    row.classList.remove('selected');
  });
}

function openSelectedItem() {
  const selectedRow = document.querySelector('.data-table tbody tr.selected');
  if (!selectedRow) return;

  // Find and click the view button
  const viewBtn = selectedRow.querySelector('.action-icon');
  if (viewBtn) {
    viewBtn.click();
  }
}

function toggleShortcutsHelp() {
  const existingHelp = document.querySelector('.shortcuts-help');
  if (existingHelp) {
    existingHelp.remove();
    showingShortcuts = false;
    return;
  }

  showingShortcuts = true;
  const helpDiv = document.createElement('div');
  helpDiv.className = 'shortcuts-help';
  helpDiv.innerHTML = `
    <h4>Keyboard Shortcuts</h4>
    <div class="shortcut-row">
      <span class="kbd">/</span>
      <span class="shortcut-desc">Search</span>
    </div>
    <div class="shortcut-row">
      <span class="kbd">n</span>
      <span class="shortcut-desc">New item</span>
    </div>
    <div class="shortcut-row">
      <span class="kbd">j</span>
      <span class="shortcut-desc">Move down</span>
    </div>
    <div class="shortcut-row">
      <span class="kbd">k</span>
      <span class="shortcut-desc">Move up</span>
    </div>
    <div class="shortcut-row">
      <span class="kbd">↵</span>
      <span class="shortcut-desc">Open selected</span>
    </div>
    <div class="shortcut-row">
      <span class="kbd">Esc</span>
      <span class="shortcut-desc">Clear / Close</span>
    </div>
    <div class="shortcut-row">
      <span class="kbd">?</span>
      <span class="shortcut-desc">Toggle this help</span>
    </div>
  `;
  document.body.appendChild(helpDiv);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (showingShortcuts) {
      helpDiv.remove();
      showingShortcuts = false;
    }
  }, 5000);
}

function waitForNavKey() {
  // Simple quick-nav: g then another key
  const handler = (e) => {
    document.removeEventListener('keydown', handler);
    switch(e.key) {
      case 'd': navigateTo('dashboard'); break;
      case 'v': navigateTo('vendors'); break;
      case 'i': navigateTo('items'); break;
      case 'p': navigateTo('purchase-orders'); break;
      case 'g': navigateTo('goods-receipt'); break;
      case 's': navigateTo('stock'); break;
    }
  };
  document.addEventListener('keydown', handler, { once: true });
}

// Auth Handlers
const ALL_SITES = ['SITE-A', 'SITE-B', 'SITE-C', 'SITE-D', 'SITE-E', 'WH-CENTRAL', 'WH-NORTH', 'WH-SOUTH'];

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  try {
    const response = await API.auth.login(email, password);

    if (response.success && response.user) {
      currentUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        sites: ALL_SITES
      };
      sessionStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      await showMainApp();
    } else {
      alert(response.message || 'Invalid email or password. Please try again.');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please check your connection and try again.');
  }
}

function handleLogout() {
  sessionStorage.removeItem('loggedIn');
  sessionStorage.removeItem('currentUser');
  currentUser = null;
  mainApp.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

async function showMainApp() {
  // Restore user from session if page was refreshed
  if (!currentUser) {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }
  }

  // Ensure data is loaded from API
  if (!dataLoaded) {
    await loadAppData();
  }

  loginScreen.classList.add('hidden');
  mainApp.classList.remove('hidden');
  updateTopBarUserInfo();
  navigateTo('dashboard');
}

function updateTopBarUserInfo() {
  const topBarActions = document.querySelector('.top-bar-actions');
  if (topBarActions && currentUser) {
    const userSites = currentUser.sites.map(siteId => {
      const site = AppData.sites.find(s => s.id === siteId);
      return site ? site.name : siteId;
    });

    topBarActions.innerHTML = `
      <div class="user-site-selector">
        <select id="active-site-select" class="site-select" onchange="changeActiveSite(this.value)">
          ${currentUser.sites.map((siteId, idx) => {
            const site = AppData.sites.find(s => s.id === siteId);
            return `<option value="${siteId}"${idx === 0 ? ' selected' : ''}>${site ? site.name : siteId}</option>`;
          }).join('')}
        </select>
      </div>
      <span class="notification-badge">5</span>
      <div class="user-info" onclick="toggleUserMenu()">
        <span class="user-name">${currentUser.name}</span>
        <span class="user-role">${currentUser.role}</span>
        <span class="user-avatar">${currentUser.name.charAt(0)}</span>
      </div>
      <div class="user-menu hidden" id="user-menu">
        <div class="user-menu-header">
          <strong>${currentUser.name}</strong>
          <span>${currentUser.email}</span>
        </div>
        <div class="user-menu-item" onclick="navigateTo('users')">My Profile</div>
        <div class="user-menu-item" onclick="handleLogout()">Sign Out</div>
      </div>
    `;
  }
}

function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function changeActiveSite(siteId) {
  console.log('Active site changed to:', siteId);
  // Could trigger re-filtering of data based on selected site
}

// Navigation
function navigateTo(page) {
  currentPage = page;

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });

  // Render page
  renderPage(page);
}

// Page Renderer
function renderPage(page) {
  const pages = {
    'dashboard': renderDashboard,
    'my-inbox': renderMyInbox,
    'all-instances': renderAllInstances,
    'vendors': renderVendors,
    'items': renderItems,
    'cost-centres': renderCostCentres,
    'purchase-orders': renderPurchaseOrders,
    'goods-receipt': renderGoodsReceipt,
    'invoices': renderInvoices,
    'debit-notes': renderDebitNotes,
    'stock': renderStock,
    'reports': renderReports,
    'notifications': renderNotifications,
    'workflow-setup': renderWorkflowSetup,
    'audit-log': renderAuditLog,
    'users': renderUsers,
    'roles': renderRoles
  };

  const renderer = pages[page] || renderDashboard;
  pageContent.innerHTML = renderer();

  // Setup page-specific handlers
  setupPageHandlers(page);
}

// Setup page-specific event handlers
function setupPageHandlers(page) {
  // Reset row selection when changing pages
  selectedRowIndex = -1;

  switch(page) {
    case 'vendors':
      setupVendorHandlers();
      break;
    case 'items':
      setupItemHandlers();
      break;
    case 'sites':
      setupSiteHandlers();
      break;
    case 'purchase-orders':
      setupPOHandlers();
      break;
    case 'goods-receipt':
      setupGRNHandlers();
      break;
    case 'stock':
      setupStockHandlers();
      break;
    case 'all-instances':
      setupInstancesHandlers();
      break;
    case 'invoices':
      setupInvoiceHandlers();
      break;
    case 'debit-notes':
      setupDebitNoteHandlers();
      break;
    case 'workflow-setup':
      setupWorkflowHandlers();
      break;
  }
}

// Keyboard hints HTML
function getKeyboardHints() {
  return `
    <div class="keyboard-hints">
      <span>Keyboard</span>
      <span class="kbd">/</span><span class="kbd-hint">(Search)</span>
      <span class="kbd">n</span><span class="kbd-hint">(New)</span>
      <span class="kbd">j</span><span class="kbd-hint">(Down)</span>
      <span class="kbd">k</span><span class="kbd-hint">(Up)</span>
      <span class="kbd">↵</span><span class="kbd-hint">(Open)</span>
      <span class="kbd">Tab</span><span class="kbd-hint">(Next)</span>
      <span class="kbd">Esc</span><span class="kbd-hint">(Close)</span>
    </div>
  `;
}

// Generate PO Number in format PO-NMTPL-XXXX
function generatePONumber() {
  const year = new Date().getFullYear();
  const existingPOs = AppData.purchaseOrders.filter(po => po.id && po.id.startsWith(`PO${year}`));
  const nextNum = existingPOs.length + 1;
  return `PO-NMTPL-${String(nextNum).padStart(4, '0')}`;
}

// Generate GRN Number in format GRN-XXXX-YYYY
function generateGRNNumber() {
  const year = new Date().getFullYear();
  const existingGRNs = AppData.goodsReceipts.filter(grn => grn.id && grn.id.includes(year.toString()));
  const nextNum = existingGRNs.length + 1;
  return `GRN${year}-${String(nextNum).padStart(5, '0')}`;
}

// Financial Year filter options
function getFinancialYearOptions() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed, so March = 2

  // If we're in Jan-Mar, current FY started last year
  const currentFYStart = currentMonth < 3 ? currentYear - 1 : currentYear;

  // Generate last 5 financial years
  const years = [];
  for (let i = 0; i < 5; i++) {
    const startYear = currentFYStart - i;
    const endYear = startYear + 1;
    years.push(`${startYear}-${endYear}`);
  }

  return `
    <option value="">Financial Year</option>
    ${years.map((fy, idx) => `<option value="${fy}"${idx === 0 ? ' selected' : ''}>${fy}</option>`).join('')}
  `;
}

// Get financial year from a date string
function getFinancialYear(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed

  // FY runs Apr-Mar, so Jan-Mar belongs to previous year's FY
  const fyStart = month < 3 ? year - 1 : year;
  return `${fyStart}-${fyStart + 1}`;
}

// Dropdown toggle
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const allDropdowns = document.querySelectorAll('.dropdown-menu');

  // Close all other dropdowns
  allDropdowns.forEach(d => {
    if (d.id !== dropdownId) d.classList.remove('show');
  });

  // Toggle current dropdown
  dropdown.classList.toggle('show');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));
  }
});

// Export PO to CSV
function exportPO(type) {
  let data;
  if (type === 'current') {
    // Get currently filtered data from table
    const rows = document.querySelectorAll('#po-table tbody tr');
    data = Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      return {
        date: cells[0]?.textContent || '',
        poNumber: cells[1]?.textContent || '',
        vendorName: cells[2]?.textContent || '',
        department: cells[3]?.textContent || '',
        section: cells[4]?.textContent || '',
        amount: cells[5]?.textContent || '',
        status: cells[6]?.textContent || '',
        createdBy: cells[7]?.textContent || '',
        approvedBy: cells[8]?.textContent || ''
      };
    });
  } else {
    // Export all data
    data = AppData.purchaseOrders.map(po => ({
      date: formatDate(po.date),
      poNumber: po.id,
      vendorName: po.vendorName,
      department: po.department || '-',
      section: po.section || '-',
      amount: `₹${formatCurrency(po.total)}`,
      status: po.status,
      createdBy: po.createdBy || 'Admin',
      approvedBy: po.approvedBy || '-'
    }));
  }

  downloadCSV(data, 'purchase_orders.csv', ['Date', 'PO Number', 'Vendor Name', 'Department', 'Section', 'Amount', 'Status', 'Created By', 'Approved By']);
  toggleDropdown('po-export-dropdown');
}

// Export GRN to CSV
function exportGRN(type) {
  let data;
  if (type === 'current') {
    // Get currently filtered data from table
    const rows = document.querySelectorAll('#grn-table tbody tr');
    data = Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      return {
        date: cells[0]?.textContent || '',
        grnNo: cells[1]?.textContent || '',
        poNo: cells[2]?.textContent || '',
        challanNo: cells[3]?.textContent || '',
        vendorName: cells[4]?.textContent || '',
        amount: cells[5]?.textContent || '',
        godown: cells[6]?.textContent || '',
        department: cells[7]?.textContent || '',
        section: cells[8]?.textContent || '',
        createdBy: cells[9]?.textContent || ''
      };
    });
  } else {
    // Export all data
    data = AppData.goodsReceipts.map(grn => {
      const poIds = [...new Set(grn.items?.map(i => i.poId) || [grn.poId])].filter(Boolean).join(', ');
      return {
        date: formatDate(grn.date),
        grnNo: grn.id,
        poNo: poIds || '-',
        challanNo: grn.challanNo || '-',
        vendorName: grn.vendorName,
        amount: `₹${formatCurrency(grn.total || 0)}`,
        godown: grn.godown || '-',
        department: grn.department || '-',
        section: grn.section || '-',
        createdBy: grn.createdBy || 'Admin'
      };
    });
  }

  downloadCSV(data, 'goods_receipts.csv', ['Date', 'GRN No', 'PO No', 'Challan No', 'Vendor Name', 'Amount', 'Godown', 'Department', 'Section', 'Created By']);
  toggleDropdown('grn-export-dropdown');
}

// Download CSV helper
function downloadCSV(data, filename, headers) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const csvContent = [
    headers.join(','),
    ...data.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// PO Summary Cards
function getPOSummaryCards(orders) {
  const totalAmount = orders.reduce((sum, po) => sum + (po.total || 0), 0);

  // Cleared = Total of completed POs
  const clearedAmount = orders
    .filter(po => po.status === 'Completed')
    .reduce((sum, po) => sum + (po.total || 0), 0);

  // Pending = Total of non-completed POs
  const pendingAmount = orders
    .filter(po => po.status !== 'Completed')
    .reduce((sum, po) => sum + (po.total || 0), 0);

  return `
    <div class="summary-card">
      <div class="summary-card-icon" style="background: #dbeafe; color: #2563eb;">📋</div>
      <div class="summary-card-content">
        <div class="summary-card-label">Total Recorded PO Amount</div>
        <div class="summary-card-value">₹${formatCurrency(totalAmount)}</div>
      </div>
    </div>
    <div class="summary-card">
      <div class="summary-card-icon" style="background: #fef3c7; color: #d97706;">⏳</div>
      <div class="summary-card-content">
        <div class="summary-card-label">Total Cleared PO</div>
        <div class="summary-card-value">₹${formatCurrency(clearedAmount)}</div>
      </div>
    </div>
    <div class="summary-card">
      <div class="summary-card-icon" style="background: #d1fae5; color: #059669;">💰</div>
      <div class="summary-card-content">
        <div class="summary-card-label">Total PO Pending</div>
        <div class="summary-card-value">₹${formatCurrency(pendingAmount)}</div>
      </div>
    </div>
  `;
}

// GRN Summary Cards
function getGRNSummaryCards(receipts) {
  const totalAmount = receipts.reduce((sum, grn) => sum + (grn.total || 0), 0);

  // Total items received
  const totalItems = receipts.reduce((sum, grn) => {
    return sum + (grn.items || []).reduce((itemSum, item) => itemSum + (item.qty || 0), 0);
  }, 0);

  // Tax = Sum of all tax amounts from items
  const taxAmount = receipts.reduce((sum, grn) => {
    const grnTax = (grn.items || []).reduce((itemSum, item) => {
      const taxable = item.taxableAmount || (item.qty * item.rate * (1 - (item.disc || 0) / 100));
      const cgst = taxable * ((item.cgst || 0) / 100);
      const sgst = taxable * ((item.sgst || 0) / 100);
      const igst = taxable * ((item.igst || 0) / 100);
      return itemSum + cgst + sgst + igst;
    }, 0);
    return sum + grnTax;
  }, 0);

  return `
    <div class="summary-card">
      <div class="summary-card-icon" style="background: #dbeafe; color: #2563eb;">📥</div>
      <div class="summary-card-content">
        <div class="summary-card-label">Total Received Amount</div>
        <div class="summary-card-value">₹${formatCurrency(totalAmount)}</div>
      </div>
    </div>
    <div class="summary-card">
      <div class="summary-card-icon" style="background: #e0e7ff; color: #4f46e5;">📦</div>
      <div class="summary-card-content">
        <div class="summary-card-label">Total Items Received</div>
        <div class="summary-card-value">${totalItems.toLocaleString()}</div>
      </div>
    </div>
    <div class="summary-card">
      <div class="summary-card-icon" style="background: #d1fae5; color: #059669;">💰</div>
      <div class="summary-card-content">
        <div class="summary-card-label">Tax on Received Goods</div>
        <div class="summary-card-value">₹${formatCurrency(taxAmount)}</div>
      </div>
    </div>
  `;
}

// ============ DASHBOARD ============
function renderDashboard() {
  const totalPOs = AppData.purchaseOrders.length;
  const openPOs = AppData.purchaseOrders.filter(po => po.status === 'Open').length;
  const completedPOs = AppData.purchaseOrders.filter(po => po.status === 'Completed').length;
  const pendingApproval = AppData.purchaseOrders.filter(po => po.status === 'Pending Approval').length;
  const partialPOs = AppData.purchaseOrders.filter(po => po.status === 'Partially Received').length;
  const totalVendors = AppData.vendors.length;
  const lowStock = AppData.stock.filter(s => s.onHand <= s.reorder).length;
  const grnToday = AppData.goodsReceipts.filter(g => g.date === new Date().toISOString().split('T')[0]).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return `
    <!-- Hero Section -->
    <div class="dashboard-hero">
      <div class="hero-main">
        <div class="hero-label">SYNCFLOW · OPERATIONS DESK</div>
        <h1 class="hero-greeting">${greeting}, Admin</h1>
        <p class="hero-subtitle">Request → approve → receive → stock. Your procurement pulse for today.</p>
        <div class="hero-actions">
          <button class="btn btn-with-arrow" onclick="navigateTo('purchase-orders'); setTimeout(() => document.getElementById('btn-new-po')?.click(), 100)">
            New purchase order →
          </button>
          <button class="btn btn-outline-arrow" onclick="navigateTo('purchase-orders')">
            Review approvals →
          </button>
          <button class="btn btn-outline-arrow" onclick="navigateTo('goods-receipt')">
            Receive goods →
          </button>
          <button class="btn btn-secondary" onclick="renderPage('dashboard')">
            ↻ Refresh
          </button>
        </div>
      </div>
      <div class="hero-focus">
        <div class="focus-header">TODAY'S FOCUS</div>
        <div class="focus-title">${pendingApproval + partialPOs} item${pendingApproval + partialPOs !== 1 ? 's' : ''} need attention</div>
        ${pendingApproval > 0 ? `
        <div class="focus-item">
          <div>
            <div class="focus-item-text">${pendingApproval} PO awaiting approval</div>
            <div class="focus-item-sub">${pendingApproval} active workflow${pendingApproval !== 1 ? 's' : ''}</div>
          </div>
          <span class="focus-item-arrow">→</span>
        </div>
        ` : ''}
        ${partialPOs > 0 ? `
        <div class="focus-item">
          <div>
            <div class="focus-item-text">${partialPOs} PO partially received</div>
            <div class="focus-item-sub">Pending delivery</div>
          </div>
          <span class="focus-item-arrow">→</span>
        </div>
        ` : ''}
        ${pendingApproval + partialPOs === 0 ? `
        <div class="focus-item">
          <div>
            <div class="focus-item-text">All caught up!</div>
            <div class="focus-item-sub">No pending items</div>
          </div>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value red">${totalPOs}</div>
        <div class="stat-label">Purchase orders</div>
        <div class="stat-sub">${openPOs} open for receipt</div>
      </div>
      <div class="stat-item">
        <div class="stat-value green">${pendingApproval}</div>
        <div class="stat-label">Pending approval</div>
        <div class="stat-sub">${pendingApproval} active workflow${pendingApproval !== 1 ? 's' : ''}</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${grnToday}</div>
        <div class="stat-label">GRNs today</div>
        <div class="stat-sub">Receipts created today</div>
      </div>
      <div class="stat-item">
        <div class="stat-value ${lowStock > 0 ? 'yellow' : ''}">${lowStock}</div>
        <div class="stat-label">Low stock</div>
        <div class="stat-sub">${totalVendors} active vendors</div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- PO Pipeline -->
      <div class="pipeline-card">
        <div class="pipeline-header">
          <h3 class="pipeline-title">PO pipeline</h3>
          <span class="pipeline-badge">${openPOs} open</span>
        </div>
        <p class="pipeline-subtitle">Live mix across ${totalPOs} purchase orders</p>

        <div class="pipeline-bar">
          <div class="pipeline-segment green" style="width: ${totalPOs > 0 ? (completedPOs / totalPOs * 100) : 0}%"></div>
          <div class="pipeline-segment yellow" style="width: ${totalPOs > 0 ? (partialPOs / totalPOs * 100) : 0}%"></div>
          <div class="pipeline-segment red" style="width: ${totalPOs > 0 ? (pendingApproval / totalPOs * 100) : 0}%"></div>
        </div>

        <div class="pipeline-stats">
          <div class="pipeline-stat">
            <div class="pipeline-stat-label">Open</div>
            <div class="pipeline-stat-value">${openPOs}</div>
          </div>
          <div class="pipeline-stat">
            <div class="pipeline-stat-label">Completed</div>
            <div class="pipeline-stat-value">${completedPOs}</div>
          </div>
          <div class="pipeline-stat">
            <div class="pipeline-stat-label">Partial</div>
            <div class="pipeline-stat-value">${partialPOs}</div>
          </div>
        </div>

        <div class="pipeline-stats" style="margin-top: 12px;">
          <div class="pipeline-stat">
            <div class="pipeline-stat-label">Overdue</div>
            <div class="pipeline-stat-value">0</div>
          </div>
          <div class="pipeline-stat">
            <div class="pipeline-stat-label">Vendors</div>
            <div class="pipeline-stat-value">${totalVendors}</div>
          </div>
          <div class="pipeline-stat">
            <div class="pipeline-stat-label">Workflows</div>
            <div class="pipeline-stat-value">${pendingApproval}</div>
          </div>
        </div>

        <div class="pipeline-legend">
          <div class="legend-item">
            <span class="legend-dot green"></span>
            <span>closed · ${completedPOs}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot red"></span>
            <span>pending · ${pendingApproval}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot yellow"></span>
            <span>partial · ${partialPOs}</span>
          </div>
        </div>
      </div>

      <!-- Sidebar Cards -->
      <div>
        <div class="sidebar-card">
          <h4 class="sidebar-card-title">Needs attention</h4>
          ${pendingApproval > 0 ? `
          <div class="attention-item" onclick="navigateTo('purchase-orders')">
            <div class="attention-icon">📋</div>
            <div class="attention-text">
              <strong>${pendingApproval} PO awaiting approval</strong>
              <span>${pendingApproval} active workflow</span>
            </div>
            <span>→</span>
          </div>
          ` : `
          <div class="attention-item">
            <div class="attention-icon">✓</div>
            <div class="attention-text">
              <strong>All caught up</strong>
              <span>No pending approvals</span>
            </div>
          </div>
          `}
        </div>

        <div class="sidebar-card">
          <h4 class="sidebar-card-title">Jump in</h4>
          <div class="jump-grid">
            <a href="#" class="jump-item" onclick="event.preventDefault(); navigateTo('purchase-orders')">
              📝 Purchase orders
            </a>
            <a href="#" class="jump-item" onclick="event.preventDefault(); navigateTo('purchase-orders')">
              ✓ Approvals
            </a>
            <a href="#" class="jump-item" onclick="event.preventDefault(); navigateTo('goods-receipt')">
              📥 Goods receipt
            </a>
            <a href="#" class="jump-item" onclick="event.preventDefault(); navigateTo('stock')">
              📦 Inventory
            </a>
            <a href="#" class="jump-item" onclick="event.preventDefault(); navigateTo('vendors')">
              🏢 Vendors
            </a>
            <a href="#" class="jump-item" onclick="event.preventDefault(); navigateTo('items')">
              🏷️ Items
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ VENDORS ============
function renderVendors() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">🏢</span>
        <div>
          <h1>Vendors</h1>
          <p class="page-subtitle">Master list with contacts, categories — soft-delete to recycle bin.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
        <button class="btn btn-primary" id="btn-new-vendor">+ New Vendor</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active">Active</button>
      <button class="tab">Recycle bin</button>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" id="vendor-search" placeholder="Search by name, code, or item...">
      <select class="filter-select" id="vendor-category-filter">
        <option value="">All Categories</option>
        ${AppData.vendorCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
      </select>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      <table class="data-table" id="vendors-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Categories</th>
            <th>Item Sub Groups</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${renderVendorRows(AppData.vendors)}
        </tbody>
      </table>
    </div>
  `;
}

function renderVendorRows(vendors) {
  return vendors.map(v => {
    const subGroupNames = (v.subGroups || []).map(sgId => {
      const sg = AppData.itemSubGroups.find(s => s.id === sgId);
      return sg ? sg.name : sgId;
    });
    return `
    <tr>
      <td>${v.id}</td>
      <td><strong>${v.name}</strong></td>
      <td>${v.contact}</td>
      <td><span class="badge ${getStatusBadgeClass(v.status)}">${v.status}</span></td>
      <td>${v.categories.join(', ')}</td>
      <td>${subGroupNames.map(name => `<span class="badge badge-default">${name}</span>`).join(' ')}</td>
      <td class="action-icons">
        <button class="action-icon" onclick="editVendor('${v.id}')" title="Edit">✏️</button>
        <button class="action-icon delete" onclick="deleteVendor('${v.id}')" title="Delete">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function setupVendorHandlers() {
  document.getElementById('btn-new-vendor')?.addEventListener('click', () => openVendorModal());

  document.getElementById('vendor-search')?.addEventListener('input', filterVendors);
  document.getElementById('vendor-category-filter')?.addEventListener('change', filterVendors);
}

function filterVendors() {
  const search = document.getElementById('vendor-search').value.toLowerCase();
  const category = document.getElementById('vendor-category-filter').value;

  const filtered = AppData.vendors.filter(v => {
    const matchesSearch = !search ||
      v.name.toLowerCase().includes(search) ||
      v.id.toLowerCase().includes(search) ||
      v.items.some(item => item.toLowerCase().includes(search));
    const matchesCategory = !category || v.categories.includes(category);
    return matchesSearch && matchesCategory;
  });

  document.querySelector('#vendors-table tbody').innerHTML = renderVendorRows(filtered);
}

function openVendorModal(vendorId = null) {
  const vendor = vendorId ? AppData.vendors.find(v => v.id === vendorId) : null;
  const title = vendor ? 'Edit Vendor' : 'New Vendor';

  const vendorSubGroups = vendor?.subGroups || [];

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>${title}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="vendor-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Vendor Name *</label>
            <input type="text" id="vendor-name" value="${vendor?.name || ''}" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="vendor-email" value="${vendor?.contact || ''}">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" id="vendor-phone" value="${vendor?.phone || ''}">
          </div>
          <div class="form-group">
            <label>Primary Category</label>
            <select id="vendor-category" onchange="toggleNewVendorCategoryInput()">
              ${AppData.vendorCategories.map(cat =>
                `<option value="${cat}" ${vendor?.category === cat ? 'selected' : ''}>${cat}</option>`
              ).join('')}
              <option value="__new__">+ Add New Category...</option>
            </select>
            <input type="text" id="vendor-category-new" class="hidden" placeholder="Enter new category name" style="margin-top: 8px;">
          </div>
          <div class="form-group full-width">
            <label>Address</label>
            <textarea id="vendor-address" rows="2">${vendor?.address || ''}</textarea>
          </div>
          <div class="form-group full-width">
            <label>Item Sub Groups <span style="font-weight: normal; color: var(--gray-500);">(select to add all items in the group)</span></label>
            <div class="subgroup-checklist">
              ${AppData.itemSubGroups.map(sg => `
                <label class="subgroup-checkbox">
                  <input type="checkbox" name="vendor-subgroups" value="${sg.id}"
                    ${vendorSubGroups.includes(sg.id) ? 'checked' : ''}
                    onchange="updateVendorItemsFromSubGroups()">
                  <span class="subgroup-info">
                    <strong>${sg.name}</strong>
                    <span>${sg.description}</span>
                  </span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="form-group full-width">
            <label>Individual Items <span style="font-weight: normal; color: var(--gray-500);">(fine-tune selection - add/remove specific items)</span></label>
            <input type="text" id="vendor-items-search" placeholder="Search items..." onkeyup="filterVendorItems()" style="margin-bottom: 8px;">
            <div class="items-checklist" id="vendor-items-checklist">
              ${AppData.items.map(item => {
                const sg = AppData.itemSubGroups.find(s => s.id === item.subGroup);
                const sgName = sg ? sg.name : 'Other';
                const isChecked = vendor?.itemIds?.includes(item.id) || false;
                return `
                <label class="item-checkbox" data-name="${item.name.toLowerCase()}" data-sku="${item.sku.toLowerCase()}" data-subgroup="${sgName.toLowerCase()}">
                  <input type="checkbox" name="vendor-items" value="${item.id}" ${isChecked ? 'checked' : ''}>
                  <span class="item-info">
                    <strong>${item.name}</strong>
                    <span class="item-meta">${item.sku} | ${sgName}</span>
                  </span>
                </label>`;
              }).join('')}
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveVendor('${vendorId || ''}')">Save Vendor</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function filterVendorItems() {
  const search = document.getElementById('vendor-items-search').value.toLowerCase();
  const items = document.querySelectorAll('#vendor-items-checklist .item-checkbox');

  items.forEach(item => {
    const name = item.dataset.name || '';
    const sku = item.dataset.sku || '';
    const subgroup = item.dataset.subgroup || '';

    if (name.includes(search) || sku.includes(search) || subgroup.includes(search)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

function updateVendorItemsFromSubGroups() {
  const checkedSubGroups = Array.from(document.querySelectorAll('input[name="vendor-subgroups"]:checked'))
    .map(cb => cb.value);

  // For each item, check if its subGroup is selected
  document.querySelectorAll('input[name="vendor-items"]').forEach(checkbox => {
    const itemId = checkbox.value;
    const item = AppData.items.find(i => i.id === itemId);
    if (item && checkedSubGroups.includes(item.subGroup)) {
      checkbox.checked = true;
    }
  });
}

function toggleNewVendorCategoryInput() {
  const select = document.getElementById('vendor-category');
  const newInput = document.getElementById('vendor-category-new');
  if (select.value === '__new__') {
    newInput.classList.remove('hidden');
    newInput.focus();
  } else {
    newInput.classList.add('hidden');
    newInput.value = '';
  }
}

async function saveVendor(vendorId) {
  const name = document.getElementById('vendor-name').value;
  const email = document.getElementById('vendor-email').value;
  const phone = document.getElementById('vendor-phone').value;
  let category = document.getElementById('vendor-category').value;
  const newCategoryName = document.getElementById('vendor-category-new').value.trim();
  const address = document.getElementById('vendor-address').value;

  // Get selected sub groups
  const subGroupCheckboxes = document.querySelectorAll('input[name="vendor-subgroups"]:checked');
  const subGroups = Array.from(subGroupCheckboxes).map(cb => cb.value);

  // Get individually selected items (this is the source of truth)
  const itemCheckboxes = document.querySelectorAll('input[name="vendor-items"]:checked');
  const itemIds = Array.from(itemCheckboxes).map(cb => cb.value);

  if (!name) {
    alert('Vendor name is required');
    return;
  }

  if (category === '__new__' && !newCategoryName) {
    alert('Please enter a name for the new category');
    return;
  }

  try {
    if (category === '__new__' && newCategoryName) {
      await API.lookups.createVendorCategory(newCategoryName);
      AppData.vendorCategories.push(newCategoryName);
      category = newCategoryName;
    }

    const vendorData = {
      id: vendorId || generateId('VND'),
      name,
      contact: email,
      phone,
      address,
      primary_category: category,
      status: 'active',
      categories: [category],
      subgroups: subGroups,
      item_ids: itemIds
    };

    if (vendorId) {
      await API.vendors.update(vendorId, vendorData);
    } else {
      await API.vendors.create(vendorData);
    }

    await refreshVendors();
    closeModal();
    renderPage('vendors');
  } catch (error) {
    console.error('Error saving vendor:', error);
    alert('Failed to save vendor. Please try again.');
  }
}

function editVendor(id) {
  openVendorModal(id);
}

async function deleteVendor(id) {
  if (confirm('Are you sure you want to delete this vendor?')) {
    try {
      await API.vendors.delete(id);
      await refreshVendors();
      renderPage('vendors');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor. Please try again.');
    }
  }
}

// ============ ITEMS ============
function renderItems() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon material-icons">category</span>
        <div>
          <h1>Items</h1>
          <p class="page-subtitle">SKU master with UOM, reorder & tracking — soft-delete to recycle bin.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="openSubGroupsModal()">Manage Sub Groups</button>
        <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
        <button class="btn btn-primary" id="btn-new-item">+ New Item</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active">Active</button>
      <button class="tab">Recycle bin</button>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" id="item-search" placeholder="Search SKU or name...">
      <select class="filter-select" id="item-category-filter">
        <option value="">All Categories</option>
        ${AppData.itemCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
      </select>
      <select class="filter-select" id="item-subgroup-filter">
        <option value="">All Sub Groups</option>
        ${AppData.itemSubGroups.map(sg => `<option value="${sg.id}">${sg.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="item-status-filter">
        <option value="">Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      <table class="data-table" id="items-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>UOM</th>
            <th>Category</th>
            <th>Sub Group</th>
            <th>Reorder</th>
            <th>Tracking</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${renderItemRows(AppData.items)}
        </tbody>
      </table>
    </div>
  `;
}

function setupItemHandlers() {
  document.getElementById('btn-new-item')?.addEventListener('click', () => openItemModal());
  document.getElementById('item-search')?.addEventListener('input', filterItems);
  document.getElementById('item-category-filter')?.addEventListener('change', filterItems);
  document.getElementById('item-subgroup-filter')?.addEventListener('change', filterItems);
  document.getElementById('item-status-filter')?.addEventListener('change', filterItems);
}

function renderItemRows(items) {
  return items.map(item => {
    const subGroup = AppData.itemSubGroups.find(sg => sg.id === item.subGroup);
    const subGroupName = subGroup ? subGroup.name : '-';
    return `
    <tr>
      <td>${item.sku}</td>
      <td><strong>${item.name}</strong></td>
      <td>${item.uom}</td>
      <td>${item.category}</td>
      <td><span class="badge badge-default">${subGroupName}</span></td>
      <td>${item.reorder}</td>
      <td>${item.tracking}</td>
      <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span></td>
      <td class="action-icons">
        <button class="action-icon" onclick="editItem('${item.id}')" title="Edit">✏️</button>
        <button class="action-icon delete" onclick="deleteItem('${item.id}')" title="Delete">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function filterItems() {
  const search = document.getElementById('item-search').value.toLowerCase();
  const category = document.getElementById('item-category-filter').value;
  const subGroup = document.getElementById('item-subgroup-filter').value;
  const status = document.getElementById('item-status-filter').value;

  const filtered = AppData.items.filter(item => {
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search) ||
      item.sku.toLowerCase().includes(search);
    const matchesCategory = !category || item.category === category;
    const matchesSubGroup = !subGroup || item.subGroup === subGroup;
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesCategory && matchesSubGroup && matchesStatus;
  });

  document.querySelector('#items-table tbody').innerHTML = renderItemRows(filtered);
}

function openItemModal(itemId = null) {
  const item = itemId ? AppData.items.find(i => i.id === itemId) : null;
  const title = item ? 'Edit Item' : 'New Item';

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>${title}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="item-form">
        <div class="form-grid">
          <div class="form-group">
            <label>SKU / Part Number</label>
            <input type="text" id="item-sku" value="${item?.sku || ''}" required>
          </div>
          <div class="form-group">
            <label>Name *</label>
            <input type="text" id="item-name" value="${item?.name || ''}" required>
          </div>
          <div class="form-group">
            <label>Unit of Measure</label>
            <select id="item-uom">
              <option value="NOS" ${item?.uom === 'NOS' ? 'selected' : ''}>NOS (Numbers)</option>
              <option value="LTR" ${item?.uom === 'LTR' ? 'selected' : ''}>LTR (Liters)</option>
              <option value="KG" ${item?.uom === 'KG' ? 'selected' : ''}>KG (Kilograms)</option>
              <option value="MTR" ${item?.uom === 'MTR' ? 'selected' : ''}>MTR (Meters)</option>
              <option value="SET" ${item?.uom === 'SET' ? 'selected' : ''}>SET (Set)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select id="item-category" onchange="toggleNewCategoryInput()">
              ${AppData.itemCategories.map(cat =>
                `<option value="${cat}" ${item?.category === cat ? 'selected' : ''}>${cat}</option>`
              ).join('')}
              <option value="__new__">+ Add New Category...</option>
            </select>
            <input type="text" id="item-category-new" class="hidden" placeholder="Enter new category name" style="margin-top: 8px;">
          </div>
          <div class="form-group">
            <label>Sub Group</label>
            <select id="item-subgroup">
              <option value="">Select Sub Group...</option>
              ${AppData.itemSubGroups.map(sg =>
                `<option value="${sg.id}" ${item?.subGroup === sg.id ? 'selected' : ''}>${sg.name}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Default Rate</label>
            <input type="number" id="item-rate" value="${item?.rate || 0}" min="0">
          </div>
          <div class="form-group">
            <label>Reorder Level</label>
            <input type="number" id="item-reorder" value="${item?.reorder || 0}">
          </div>
          <div class="form-group">
            <label>Tracking</label>
            <select id="item-tracking">
              <option value="-" ${item?.tracking === '-' ? 'selected' : ''}>None</option>
              <option value="Batch" ${item?.tracking === 'Batch' ? 'selected' : ''}>Batch</option>
              <option value="Serial" ${item?.tracking === 'Serial' ? 'selected' : ''}>Serial</option>
            </select>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveItem('${itemId || ''}')">Save Item</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function toggleNewCategoryInput() {
  const select = document.getElementById('item-category');
  const newInput = document.getElementById('item-category-new');
  if (select.value === '__new__') {
    newInput.classList.remove('hidden');
    newInput.focus();
  } else {
    newInput.classList.add('hidden');
    newInput.value = '';
  }
}

async function saveItem(itemId) {
  const sku = document.getElementById('item-sku').value;
  const name = document.getElementById('item-name').value;
  const uom = document.getElementById('item-uom').value;
  let category = document.getElementById('item-category').value;
  const newCategoryName = document.getElementById('item-category-new').value.trim();
  const subGroup = document.getElementById('item-subgroup').value;
  const rate = parseFloat(document.getElementById('item-rate').value) || 0;
  const reorder = parseInt(document.getElementById('item-reorder').value) || 0;
  const tracking = document.getElementById('item-tracking').value;

  if (!sku || !name) {
    alert('SKU and Name are required');
    return;
  }

  if (category === '__new__' && !newCategoryName) {
    alert('Please enter a name for the new category');
    return;
  }

  try {
    let categoryObj = null;

    if (category === '__new__' && newCategoryName) {
      categoryObj = await API.lookups.createItemCategory(newCategoryName);
      AppData.itemCategories.push(newCategoryName);
      category = newCategoryName;
    } else {
      categoryObj = AppData.itemCategories.includes(category) ?
        (await API.lookups.getItemCategories()).find(c => c.name === category) : null;
    }

    const itemData = {
      id: itemId || sku,
      sku,
      name,
      uom,
      category_id: categoryObj?.id || null,
      subgroup_id: subGroup || null,
      rate,
      reorder_level: reorder,
      tracking,
      status: 'active'
    };

    if (itemId) {
      await API.items.update(itemId, itemData);
    } else {
      await API.items.create(itemData);
    }

    await refreshItems();
    closeModal();
    renderPage('items');
  } catch (error) {
    console.error('Error saving item:', error);
    alert('Failed to save item. Please try again.');
  }
}

function editItem(id) {
  openItemModal(id);
}

async function deleteItem(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    try {
      await API.items.delete(id);
      await refreshItems();
      renderPage('items');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  }
}

// ============ ITEM SUB GROUPS ============
function openSubGroupsModal() {
  modalContent.classList.add('modal-wide');
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Manage Item Sub Groups</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <p style="color: var(--gray-500); margin: 0;">Sub groups help organize items and enable bulk selection when creating POs.</p>
        <button class="btn btn-primary btn-sm" onclick="showAddSubGroupForm()">+ New Sub Group</button>
      </div>

      <div id="add-subgroup-form" class="hidden" style="background: var(--gray-50); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <div class="form-grid">
          <div class="form-group">
            <label>Sub Group Name *</label>
            <input type="text" id="subgroup-name" placeholder="e.g., Lubricants & Oils">
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" id="subgroup-description" placeholder="e.g., Engine oils, greases, coolants">
          </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="btn btn-primary btn-sm" onclick="saveSubGroup()">Save</button>
          <button class="btn btn-secondary btn-sm" onclick="hideAddSubGroupForm()">Cancel</button>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Items Count</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="subgroups-table-body">
          ${renderSubGroupRows()}
        </tbody>
      </table>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function renderSubGroupRows() {
  return AppData.itemSubGroups.map(sg => {
    const itemCount = AppData.items.filter(item => item.subGroup === sg.id).length;
    return `
      <tr>
        <td><code>${sg.id}</code></td>
        <td><strong>${sg.name}</strong></td>
        <td>${sg.description}</td>
        <td><span class="badge badge-default">${itemCount} items</span></td>
        <td class="action-icons">
          <button class="action-icon" onclick="editSubGroup('${sg.id}')" title="Edit">✏️</button>
          <button class="action-icon delete" onclick="deleteSubGroup('${sg.id}')" title="Delete">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function showAddSubGroupForm() {
  document.getElementById('add-subgroup-form').classList.remove('hidden');
  document.getElementById('subgroup-name').value = '';
  document.getElementById('subgroup-description').value = '';
  document.getElementById('subgroup-name').dataset.editId = '';
}

function hideAddSubGroupForm() {
  document.getElementById('add-subgroup-form').classList.add('hidden');
}

async function saveSubGroup() {
  const nameInput = document.getElementById('subgroup-name');
  const descInput = document.getElementById('subgroup-description');
  const name = nameInput.value.trim();
  const description = descInput.value.trim();
  const editId = nameInput.dataset.editId;

  if (!name) {
    alert('Sub Group name is required');
    return;
  }

  try {
    if (editId) {
      // For now, update locally (API doesn't have update endpoint for subgroups)
      const idx = AppData.itemSubGroups.findIndex(sg => sg.id === editId);
      if (idx !== -1) {
        AppData.itemSubGroups[idx].name = name;
        AppData.itemSubGroups[idx].description = description;
      }
    } else {
      const id = 'SG-' + name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);

      if (AppData.itemSubGroups.some(sg => sg.id === id)) {
        alert('A sub group with a similar name already exists');
        return;
      }

      await API.lookups.getItemSubgroups().then(async () => {
        await API.post('/lookups/item-subgroups', { id, name, description });
      });
      await refreshLookups();
    }

    document.getElementById('subgroups-table-body').innerHTML = renderSubGroupRows();
    hideAddSubGroupForm();
  } catch (error) {
    console.error('Error saving sub group:', error);
    alert('Failed to save sub group. Please try again.');
  }
}

function editSubGroup(id) {
  const sg = AppData.itemSubGroups.find(s => s.id === id);
  if (!sg) return;

  document.getElementById('add-subgroup-form').classList.remove('hidden');
  document.getElementById('subgroup-name').value = sg.name;
  document.getElementById('subgroup-description').value = sg.description;
  document.getElementById('subgroup-name').dataset.editId = id;
}

function deleteSubGroup(id) {
  const itemCount = AppData.items.filter(item => item.subGroup === id).length;

  if (itemCount > 0) {
    alert(`Cannot delete: ${itemCount} item(s) are using this sub group. Please reassign them first.`);
    return;
  }

  if (confirm('Are you sure you want to delete this sub group?')) {
    AppData.itemSubGroups = AppData.itemSubGroups.filter(sg => sg.id !== id);
    document.getElementById('subgroups-table-body').innerHTML = renderSubGroupRows();
  }
}

// ============ SITES ============
function renderSites() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">📍</span>
        <div>
          <h1>Sites & Warehouses</h1>
          <p class="page-subtitle">Manage locations for inventory tracking</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
        <button class="btn btn-primary" id="btn-new-site">+ New Site</button>
      </div>
    </div>

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${AppData.sites.map(site => `
            <tr>
              <td>${site.code}</td>
              <td><strong>${site.name}</strong></td>
              <td>${site.type}</td>
              <td><span class="badge ${getStatusBadgeClass(site.status)}">${site.status}</span></td>
              <td class="action-icons">
                <button class="action-icon" title="Edit">✏️</button>
                <button class="action-icon delete" title="Delete">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function setupSiteHandlers() {
  document.getElementById('btn-new-site')?.addEventListener('click', () => {
    const code = prompt('Enter site code (e.g., SITE-C):');
    if (!code) return;
    const name = prompt('Enter site name:');
    if (!name) return;
    const type = prompt('Enter type (Site/Warehouse):') || 'Site';

    AppData.sites.push({
      id: code,
      code,
      name,
      type,
      status: 'active'
    });

    renderPage('sites');
  });
}

// ============ PURCHASE ORDERS ============
function renderPurchaseOrders() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">📝</span>
        <div>
          <h1>Purchase Orders</h1>
          <p class="page-subtitle">Create, approve, send, receive, and close.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" onclick="toggleDropdown('po-export-dropdown')">
            Export <span class="dropdown-arrow">▼</span>
          </button>
          <div class="dropdown-menu" id="po-export-dropdown">
            <a href="#" class="dropdown-item" onclick="exportPO('current'); return false;">Export Current Page</a>
            <a href="#" class="dropdown-item" onclick="exportPO('all'); return false;">Export All</a>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-new-po">+ New PO</button>
      </div>
    </div>

    <div class="workflow-steps">
      <div class="workflow-step">
        <div class="step-icon">📋</div>
        <div class="step-label">Draft</div>
        <div class="step-desc">Prepare lines, vendor, and site</div>
      </div>
      <div class="workflow-arrow">→</div>
      <div class="workflow-step">
        <div class="step-icon">✓</div>
        <div class="step-label">Approval</div>
        <div class="step-desc">Waiting on workflow sign-off</div>
      </div>
      <div class="workflow-arrow">→</div>
      <div class="workflow-step">
        <div class="step-icon">📤</div>
        <div class="step-label">Vendor</div>
        <div class="step-desc">Approved / sent to vendor</div>
      </div>
      <div class="workflow-arrow">→</div>
      <div class="workflow-step">
        <div class="step-icon">📥</div>
        <div class="step-label">Partial GRN</div>
        <div class="step-desc">Goods partially received</div>
      </div>
      <div class="workflow-arrow">→</div>
      <div class="workflow-step">
        <div class="step-icon">✅</div>
        <div class="step-label">Closed</div>
        <div class="step-desc">Fully received or closed</div>
      </div>
    </div>

    <div class="filters-bar" style="flex-wrap: wrap; gap: 8px;">
      <input type="text" class="filter-input" id="po-search" placeholder="Search PO number...">
      <select class="filter-select" id="po-fy-filter">
        ${getFinancialYearOptions()}
      </select>
      <select class="filter-select" id="po-status-filter">
        <option value="">Status</option>
        <option value="Draft">Draft</option>
        <option value="Open">Open</option>
        <option value="Partially Received">Partially Received</option>
        <option value="Completed">Completed</option>
      </select>
      <select class="filter-select" id="po-vendor-filter">
        <option value="">Vendor</option>
        ${AppData.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="po-department-filter">
        <option value="">Department</option>
        <option value="Maintenance">Maintenance</option>
        <option value="Production">Production</option>
        <option value="HR">HR</option>
      </select>
      <select class="filter-select" id="po-section-filter">
        <option value="">Section</option>
        <option value="Tipper">Tipper</option>
        <option value="Excavator">Excavator</option>
        <option value="Loader">Loader</option>
      </select>
    </div>

    <div class="summary-cards" id="po-summary-cards">
      ${getPOSummaryCards(AppData.purchaseOrders)}
    </div>

    ${getKeyboardHints()}

    <div class="card" style="overflow-x: auto;">
      <table class="data-table" id="po-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>PO Number</th>
            <th>Vendor Name</th>
            <th>Department</th>
            <th>Section</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Approved By</th>
            <th>View & Action</th>
          </tr>
        </thead>
        <tbody>
          ${renderPORows(AppData.purchaseOrders)}
        </tbody>
      </table>
    </div>
  `;
}

function setupPOHandlers() {
  document.getElementById('btn-new-po')?.addEventListener('click', () => openPOModal());
  document.getElementById('po-search')?.addEventListener('input', filterPOs);
  document.getElementById('po-fy-filter')?.addEventListener('change', filterPOs);
  document.getElementById('po-status-filter')?.addEventListener('change', filterPOs);
  document.getElementById('po-vendor-filter')?.addEventListener('change', filterPOs);
  document.getElementById('po-department-filter')?.addEventListener('change', filterPOs);
  document.getElementById('po-section-filter')?.addEventListener('change', filterPOs);
}

function renderPORows(orders) {
  return orders.map(po => `
    <tr>
      <td>${formatDate(po.date)}</td>
      <td><strong>${po.id}</strong></td>
      <td>${po.vendorName}</td>
      <td>${po.department || '-'}</td>
      <td>${po.section || '-'}</td>
      <td>₹${formatCurrency(po.total)}</td>
      <td><span class="badge ${getStatusBadgeClass(po.status)}">${po.status}</span></td>
      <td>${po.createdBy || 'Admin'}</td>
      <td>${po.approvedBy || '-'}</td>
      <td class="action-icons">
        <button class="action-icon" onclick="viewPO('${po.id}')" title="View">👁️</button>
        ${po.status === 'Draft' ? `<button class="action-icon" onclick="editPO('${po.id}')" title="Edit">✏️</button>` : ''}
        ${po.status === 'Draft' || po.status === 'Open' ? `<button class="action-icon" onclick="approvePO('${po.id}')" title="Approve">✅</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function filterPOs() {
  const search = document.getElementById('po-search').value.toLowerCase();
  const fy = document.getElementById('po-fy-filter').value;
  const status = document.getElementById('po-status-filter').value;
  const vendorId = document.getElementById('po-vendor-filter').value;
  const department = document.getElementById('po-department-filter').value;
  const section = document.getElementById('po-section-filter').value;

  const filtered = AppData.purchaseOrders.filter(po => {
    const matchesSearch = !search || po.id.toLowerCase().includes(search) || po.vendorName?.toLowerCase().includes(search);
    const matchesFY = !fy || getFinancialYear(po.date) === fy;
    const matchesStatus = !status || po.status === status;
    const matchesVendor = !vendorId || po.vendorId === vendorId;
    const matchesDepartment = !department || po.department === department;
    const matchesSection = !section || po.section === section;
    return matchesSearch && matchesFY && matchesStatus && matchesVendor && matchesDepartment && matchesSection;
  });

  document.querySelector('#po-table tbody').innerHTML = renderPORows(filtered);
  document.getElementById('po-summary-cards').innerHTML = getPOSummaryCards(filtered);
}

function openPOModal() {
  const poNumber = generatePONumber();
  const poDate = new Date().toISOString().split('T')[0];

  modalContent.classList.add('modal-wide');
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Create Purchase Order</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="po-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Vendor *</label>
            <select id="po-vendor" required onchange="loadVendorSubGroups()">
              <option value="">Vendor *</option>
              ${AppData.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>PO Number *</label>
            <input type="text" id="po-number" value="${poNumber}" readonly style="background: var(--gray-100); cursor: not-allowed;">
          </div>
          <div class="form-group">
            <label>PO Date</label>
            <input type="text" id="po-po-date" value="PO DATE : ${formatDate(poDate)}" readonly style="background: var(--gray-100); cursor: not-allowed;">
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Department *</label>
            <select id="po-department" required onchange="toggleNewDepartmentInput()">
              <option value="">Select Department</option>
              ${AppData.departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
              <option value="__new__">+ Add New Department...</option>
            </select>
            <input type="text" id="po-department-new" class="hidden" placeholder="Enter new department name" style="margin-top: 8px;">
          </div>
          <div class="form-group">
            <label>Section *</label>
            <select id="po-section" required onchange="toggleNewSectionInput()">
              <option value="">Select Section</option>
              ${AppData.sections.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
              <option value="__new__">+ Add New Section...</option>
            </select>
            <input type="text" id="po-section-new" class="hidden" placeholder="Enter new section name" style="margin-top: 8px;">
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Delivery date</label>
            <input type="date" id="po-date" value="${poDate}">
          </div>
          <div class="form-group">
            <label>Remarks</label>
            <textarea id="po-remarks" rows="2" placeholder="Remarks"></textarea>
          </div>
        </div>

        <div class="form-group">
          <label>Terms & Conditions</label>
          <textarea id="po-terms" rows="3" placeholder="Enter terms and conditions"></textarea>
        </div>

        <div class="item-lines" style="margin-top: 24px;">
          <h4 style="margin: 0 0 16px 0;">Lines</h4>
          <table class="data-table" style="width: 100%; table-layout: fixed;">
              <thead>
                <tr>
                  <th style="width: 5%;">Sl No</th>
                  <th style="width: 22%;">Description of Goods</th>
                  <th style="width: 6%;">UOM</th>
                  <th style="width: 8%;">Qty</th>
                  <th style="width: 9%;">Rate</th>
                  <th style="width: 7%;">Disc %</th>
                  <th style="width: 10%;">Taxable Amt</th>
                  <th style="width: 7%;">CGST %</th>
                  <th style="width: 7%;">SGST %</th>
                  <th style="width: 7%;">IGST %</th>
                  <th style="width: 9%;">Total Amt</th>
                  <th style="width: 6%;">Actions</th>
                </tr>
              </thead>
              <tbody id="po-lines">
                <tr>
                  <td class="po-sl-no">1</td>
                  <td>
                    <select class="po-item" onchange="updatePOLineTotal(this)" style="width: 100%;">
                      <option value="">Select Item</option>
                      ${AppData.items.map(i => `<option value="${i.id}" data-name="${i.name}" data-uom="${i.uom || 'NOS'}">${i.name}</option>`).join('')}
                    </select>
                  </td>
                  <td class="po-uom">-</td>
                  <td><input type="number" class="po-qty" value="1" min="1" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
                  <td><input type="number" class="po-rate" value="0" min="0" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
                  <td><input type="number" class="po-disc" value="0" min="0" max="100" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
                  <td class="po-taxable-amt">₹0</td>
                  <td><input type="number" class="po-cgst" value="9" min="0" max="100" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
                  <td><input type="number" class="po-sgst" value="9" min="0" max="100" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
                  <td><input type="number" class="po-igst" value="0" min="0" max="100" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
                  <td class="po-line-total">₹0</td>
                  <td style="text-align: center;">
                    <button type="button" class="action-icon" onclick="editPOLine(this)" title="Edit">✏️</button>
                    <button type="button" class="action-icon delete" onclick="removePOLine(this)" title="Delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; gap: 12px;">
              <button type="button" class="btn btn-sm btn-outline" onclick="openOnTheFlyItemModal()">+ On-the-fly item</button>
              <button type="button" class="btn btn-sm btn-primary" onclick="addPOLine()">+ Add line</button>
            </div>
            <div style="display: flex; gap: 24px; font-size: 13px; color: var(--gray-700);">
              <span>Total Taxable: <strong id="po-total-taxable">₹0</strong></span>
              <span>CGST: <strong id="po-total-cgst">₹0</strong></span>
              <span>SGST: <strong id="po-total-sgst">₹0</strong></span>
              <span>IGST: <strong id="po-total-igst">₹0</strong></span>
              <span style="font-weight: 700; color: var(--gray-900);">TOTAL AMOUNT: <span id="po-grand-total">₹0</span></span>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-outline" onclick="savePO('draft')">Save as Draft</button>
      <button class="btn btn-primary" onclick="savePO('save')">Save Changes</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function loadVendorSubGroups() {
  const vendorId = document.getElementById('po-vendor').value;
  const subGroupSelect = document.getElementById('po-sub-group');

  if (!vendorId) {
    subGroupSelect.innerHTML = '<option value="">Select Item Sub Group...</option>';
    return;
  }

  const vendor = AppData.vendors.find(v => v.id === vendorId);
  if (!vendor || !vendor.subGroups) {
    subGroupSelect.innerHTML = '<option value="">No sub groups available</option>';
    return;
  }

  const vendorSubGroups = AppData.itemSubGroups.filter(sg => vendor.subGroups.includes(sg.id));

  subGroupSelect.innerHTML = `
    <option value="">Select Item Sub Group...</option>
    ${vendorSubGroups.map(sg => `<option value="${sg.id}">${sg.name} - ${sg.description}</option>`).join('')}
  `;
}

function addSubGroupItemsToPO() {
  const subGroupSelect = document.getElementById('po-sub-group');
  const subGroupId = subGroupSelect.value;
  const vendorId = document.getElementById('po-vendor').value;

  if (!subGroupId || !vendorId) return;

  const vendor = AppData.vendors.find(v => v.id === vendorId);
  if (!vendor) return;

  // Get items that belong to this sub group AND are supplied by this vendor
  const subGroupItems = AppData.items.filter(item =>
    item.subGroup === subGroupId && vendor.itemIds.includes(item.id)
  );

  if (subGroupItems.length === 0) {
    alert('No items found for this sub group from the selected vendor.');
    subGroupSelect.value = '';
    return;
  }

  // Clear existing empty rows
  const existingRows = document.querySelectorAll('#po-lines tr');
  existingRows.forEach(row => {
    const itemSelect = row.querySelector('.po-item');
    if (itemSelect && !itemSelect.value) {
      row.remove();
    }
  });

  // Add each item from the sub group
  subGroupItems.forEach(item => {
    addPOLine(item.id, 1, item.rate);
  });

  // Reset the dropdown
  subGroupSelect.value = '';

  // Update grand total
  updatePOGrandTotal();
}

function addPOLine(itemId = '', qty = 1, rate = 0) {
  const tbody = document.getElementById('po-lines');
  const slNo = tbody.querySelectorAll('tr').length + 1;
  const item = itemId ? AppData.items.find(i => i.id === itemId) : null;
  const uom = item?.uom || '-';
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="po-sl-no">${slNo}</td>
    <td>
      <select class="po-item" onchange="updatePOLineTotal(this)" style="width: 100%;">
        <option value="">Select Item</option>
        ${AppData.items.map(i => `<option value="${i.id}" data-name="${i.name}" data-uom="${i.uom || 'NOS'}" ${i.id === itemId ? 'selected' : ''}>${i.name}</option>`).join('')}
      </select>
    </td>
    <td class="po-uom">${uom}</td>
    <td><input type="number" class="po-qty" value="${qty}" min="1" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
    <td><input type="number" class="po-rate" value="${rate}" min="0" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
    <td><input type="number" class="po-disc" value="0" min="0" max="100" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
    <td class="po-taxable-amt">₹0</td>
    <td><input type="number" class="po-cgst" value="9" min="0" max="100" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
    <td><input type="number" class="po-sgst" value="9" min="0" max="100" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
    <td><input type="number" class="po-igst" value="0" min="0" max="100" onchange="updatePOLineTotal(this)" style="width: 100%;"></td>
    <td class="po-line-total">₹0</td>
    <td style="text-align: center;">
      <button type="button" class="action-icon" onclick="editPOLine(this)" title="Edit">✏️</button>
      <button type="button" class="action-icon delete" onclick="removePOLine(this)" title="Delete">🗑️</button>
    </td>
  `;
  tbody.appendChild(row);
  updatePOLineTotal(row.querySelector('.po-item'));
  updatePOGrandTotal();
}

function openOnTheFlyItemModal() {
  // Create a secondary modal overlay for on-the-fly item creation
  const secondaryModal = document.createElement('div');
  secondaryModal.id = 'secondary-modal-overlay';
  secondaryModal.className = 'modal-overlay';
  secondaryModal.style.zIndex = '1100';
  secondaryModal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h2>Create New Item (On-the-fly)</h2>
        <button class="modal-close" onclick="closeOnTheFlyItemModal()">×</button>
      </div>
      <div class="modal-body">
        <form id="otf-item-form">
          <div class="form-grid">
            <div class="form-group">
              <label>SKU / Part Number *</label>
              <input type="text" id="otf-item-sku" required>
            </div>
            <div class="form-group">
              <label>Name *</label>
              <input type="text" id="otf-item-name" required>
            </div>
            <div class="form-group">
              <label>Unit of Measure</label>
              <select id="otf-item-uom">
                <option value="NOS">NOS (Numbers)</option>
                <option value="LTR">LTR (Liters)</option>
                <option value="KG">KG (Kilograms)</option>
                <option value="MTR">MTR (Meters)</option>
                <option value="SET">SET (Set)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select id="otf-item-category" onchange="toggleOtfNewCategoryInput()">
                ${AppData.itemCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                <option value="__new__">+ Add New Category...</option>
              </select>
              <input type="text" id="otf-item-category-new" class="hidden" placeholder="Enter new category name" style="margin-top: 8px;">
            </div>
            <div class="form-group">
              <label>Sub Group</label>
              <select id="otf-item-subgroup">
                <option value="">Select Sub Group...</option>
                ${AppData.itemSubGroups.map(sg => `<option value="${sg.id}">${sg.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Default Rate</label>
              <input type="number" id="otf-item-rate" value="0" min="0">
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeOnTheFlyItemModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveOnTheFlyItem()">Create & Add to PO</button>
      </div>
    </div>
  `;
  document.body.appendChild(secondaryModal);
}

function closeOnTheFlyItemModal() {
  const secondaryModal = document.getElementById('secondary-modal-overlay');
  if (secondaryModal) {
    secondaryModal.remove();
  }
}

function toggleOtfNewCategoryInput() {
  const select = document.getElementById('otf-item-category');
  const newInput = document.getElementById('otf-item-category-new');
  if (select.value === '__new__') {
    newInput.classList.remove('hidden');
    newInput.focus();
  } else {
    newInput.classList.add('hidden');
    newInput.value = '';
  }
}

async function saveOnTheFlyItem() {
  const sku = document.getElementById('otf-item-sku').value.trim();
  const name = document.getElementById('otf-item-name').value.trim();
  const uom = document.getElementById('otf-item-uom').value;
  let category = document.getElementById('otf-item-category').value;
  const newCategoryName = document.getElementById('otf-item-category-new').value.trim();
  const subGroup = document.getElementById('otf-item-subgroup').value;
  const rate = parseFloat(document.getElementById('otf-item-rate').value) || 0;

  if (!sku || !name) {
    alert('SKU and Name are required');
    return;
  }

  if (category === '__new__' && !newCategoryName) {
    alert('Please enter a name for the new category');
    return;
  }

  // Check if SKU already exists
  if (AppData.items.some(i => i.id === sku || i.sku === sku)) {
    alert('An item with this SKU already exists');
    return;
  }

  try {
    let categoryObj = null;

    if (category === '__new__' && newCategoryName) {
      categoryObj = await API.lookups.createItemCategory(newCategoryName);
      AppData.itemCategories.push(newCategoryName);
      category = newCategoryName;
    } else {
      categoryObj = AppData.itemCategories.includes(category) ?
        (await API.lookups.getItemCategories()).find(c => c.name === category) : null;
    }

    const itemData = {
      id: sku,
      sku,
      name,
      uom,
      category_id: categoryObj?.id || null,
      subgroup_id: subGroup || null,
      rate,
      reorder_level: 0,
      tracking: '-',
      status: 'active'
    };

    await API.items.create(itemData);
    await refreshItems();

    // Close the secondary modal
    closeOnTheFlyItemModal();

    // Add a new line with this item selected
    addPOLine(sku, 1, rate);

    // Refresh all item dropdowns in existing PO lines
    refreshPOItemDropdowns();
  } catch (error) {
    console.error('Error creating item:', error);
    alert('Failed to create item. Please try again.');
  }
}

function refreshPOItemDropdowns() {
  const itemSelects = document.querySelectorAll('#po-lines .po-item');
  itemSelects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = `
      <option value="">Item</option>
      ${AppData.items.map(i => `<option value="${i.id}" data-name="${i.name}" ${i.id === currentValue ? 'selected' : ''}>${i.name}</option>`).join('')}
    `;
  });
}

function addItemGroupToPO() {
  const groupSelect = document.getElementById('po-item-group');
  const groupId = groupSelect.value;

  if (!groupId) return;

  const group = AppData.itemGroups.find(g => g.id === groupId);
  if (!group) return;

  // Clear existing empty rows (rows with no item selected)
  const existingRows = document.querySelectorAll('#po-lines tr');
  existingRows.forEach(row => {
    const itemSelect = row.querySelector('.po-item');
    if (itemSelect && !itemSelect.value) {
      row.remove();
    }
  });

  // Add each item from the group
  group.items.forEach(groupItem => {
    const item = AppData.items.find(i => i.id === groupItem.itemId);
    if (item) {
      addPOLine(groupItem.itemId, groupItem.qty, groupItem.rate);
    }
  });

  // Reset the dropdown
  groupSelect.value = '';

  // Update grand total
  updatePOGrandTotal();
}

function removePOLine(btn) {
  const row = btn.closest('tr');
  if (document.querySelectorAll('#po-lines tr').length > 1) {
    row.remove();
    renumberPOLines();
    updatePOGrandTotal();
  }
}

function renumberPOLines() {
  document.querySelectorAll('#po-lines tr').forEach((row, index) => {
    row.querySelector('.po-sl-no').textContent = index + 1;
  });
}

function updatePOLineTotal(el) {
  const row = el.closest('tr');
  const itemSelect = row.querySelector('.po-item');
  const selectedOption = itemSelect.options[itemSelect.selectedIndex];

  if (selectedOption && selectedOption.value) {
    row.querySelector('.po-uom').textContent = selectedOption.dataset.uom || '-';
  }

  const qty = parseInt(row.querySelector('.po-qty').value) || 0;
  const rate = parseFloat(row.querySelector('.po-rate').value) || 0;
  const disc = parseFloat(row.querySelector('.po-disc').value) || 0;
  const cgst = parseFloat(row.querySelector('.po-cgst').value) || 0;
  const sgst = parseFloat(row.querySelector('.po-sgst').value) || 0;
  const igst = parseFloat(row.querySelector('.po-igst').value) || 0;

  const grossAmount = qty * rate;
  const discountAmount = grossAmount * (disc / 100);
  const taxableAmount = grossAmount - discountAmount;
  const cgstAmount = taxableAmount * (cgst / 100);
  const sgstAmount = taxableAmount * (sgst / 100);
  const igstAmount = taxableAmount * (igst / 100);
  const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

  row.querySelector('.po-taxable-amt').textContent = `₹${formatCurrency(taxableAmount)}`;
  row.querySelector('.po-line-total').textContent = `₹${formatCurrency(totalAmount)}`;
  updatePOGrandTotal();
}

function editPOLine(btn) {
  const row = btn.closest('tr');
  const inputs = row.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.disabled = !input.disabled;
  });
  btn.textContent = inputs[0].disabled ? '✏️' : '✅';
  btn.title = inputs[0].disabled ? 'Edit' : 'Done';
}

function updatePOGrandTotal() {
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let grandTotal = 0;

  document.querySelectorAll('#po-lines tr').forEach(row => {
    const qty = parseInt(row.querySelector('.po-qty').value) || 0;
    const rate = parseFloat(row.querySelector('.po-rate').value) || 0;
    const disc = parseFloat(row.querySelector('.po-disc').value) || 0;
    const cgst = parseFloat(row.querySelector('.po-cgst').value) || 0;
    const sgst = parseFloat(row.querySelector('.po-sgst').value) || 0;
    const igst = parseFloat(row.querySelector('.po-igst').value) || 0;

    const grossAmount = qty * rate;
    const discountAmount = grossAmount * (disc / 100);
    const taxableAmount = grossAmount - discountAmount;
    const cgstAmount = taxableAmount * (cgst / 100);
    const sgstAmount = taxableAmount * (sgst / 100);
    const igstAmount = taxableAmount * (igst / 100);

    totalTaxable += taxableAmount;
    totalCGST += cgstAmount;
    totalSGST += sgstAmount;
    totalIGST += igstAmount;
    grandTotal += taxableAmount + cgstAmount + sgstAmount + igstAmount;
  });

  const taxableEl = document.getElementById('po-total-taxable');
  const cgstEl = document.getElementById('po-total-cgst');
  const sgstEl = document.getElementById('po-total-sgst');
  const igstEl = document.getElementById('po-total-igst');
  const grandTotalEl = document.getElementById('po-grand-total');

  if (taxableEl) taxableEl.textContent = `₹${formatCurrency(totalTaxable)}`;
  if (cgstEl) cgstEl.textContent = `₹${formatCurrency(totalCGST)}`;
  if (sgstEl) sgstEl.textContent = `₹${formatCurrency(totalSGST)}`;
  if (igstEl) igstEl.textContent = `₹${formatCurrency(totalIGST)}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${formatCurrency(grandTotal)}`;
}

function toggleNewDepartmentInput() {
  const select = document.getElementById('po-department');
  const newInput = document.getElementById('po-department-new');
  if (select.value === '__new__') {
    newInput.classList.remove('hidden');
    newInput.focus();
  } else {
    newInput.classList.add('hidden');
    newInput.value = '';
  }
}

function toggleNewSectionInput() {
  const select = document.getElementById('po-section');
  const newInput = document.getElementById('po-section-new');
  if (select.value === '__new__') {
    newInput.classList.remove('hidden');
    newInput.focus();
  } else {
    newInput.classList.add('hidden');
    newInput.value = '';
  }
}

async function savePO(action = 'save') {
  const vendorId = document.getElementById('po-vendor').value;
  let department = document.getElementById('po-department').value;
  const newDepartmentName = document.getElementById('po-department-new').value.trim();
  let section = document.getElementById('po-section').value;
  const newSectionName = document.getElementById('po-section-new').value.trim();
  const date = document.getElementById('po-date').value;
  const remarks = document.getElementById('po-remarks').value;
  const terms = document.getElementById('po-terms').value;

  if (!vendorId) {
    alert('Please select a vendor');
    return;
  }

  if ((!department || department === '__new__') && !newDepartmentName) {
    alert('Please select or enter a department');
    return;
  }

  if ((!section || section === '__new__') && !newSectionName) {
    alert('Please select or enter a section');
    return;
  }

  const vendor = AppData.vendors.find(v => v.id === vendorId);

  const items = [];
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  document.querySelectorAll('#po-lines tr').forEach(row => {
    const itemSelect = row.querySelector('.po-item');
    const itemId = itemSelect.value;
    if (itemId) {
      const itemName = itemSelect.options[itemSelect.selectedIndex].dataset.name;
      const uom = row.querySelector('.po-uom').textContent;
      const qty = parseInt(row.querySelector('.po-qty').value) || 0;
      const rate = parseFloat(row.querySelector('.po-rate').value) || 0;
      const disc = parseFloat(row.querySelector('.po-disc').value) || 0;
      const cgst = parseFloat(row.querySelector('.po-cgst').value) || 0;
      const sgst = parseFloat(row.querySelector('.po-sgst').value) || 0;
      const igst = parseFloat(row.querySelector('.po-igst').value) || 0;

      const grossAmount = qty * rate;
      const discountAmount = grossAmount * (disc / 100);
      const taxableAmount = grossAmount - discountAmount;
      const cgstAmount = taxableAmount * (cgst / 100);
      const sgstAmount = taxableAmount * (sgst / 100);
      const igstAmount = taxableAmount * (igst / 100);
      const lineTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;

      items.push({
        item_id: itemId,
        description: itemName,
        uom,
        qty,
        rate,
        discount_pct: disc,
        taxable_amount: taxableAmount,
        cgst_pct: cgst,
        sgst_pct: sgst,
        igst_pct: igst,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
        total_amount: lineTotal,
        received_qty: 0
      });

      totalTaxable += taxableAmount;
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
      totalIGST += igstAmount;
    }
  });

  if (items.length === 0) {
    alert('Please add at least one item');
    return;
  }

  try {
    let deptObj = null;
    if (department === '__new__' && newDepartmentName) {
      deptObj = await API.lookups.createDepartment(newDepartmentName);
      AppData.departments.push(deptObj);
      department = newDepartmentName;
    } else {
      deptObj = AppData.departments.find(d => d.name === department);
    }

    let secObj = null;
    if (section === '__new__' && newSectionName) {
      secObj = await API.lookups.createSection(newSectionName);
      AppData.sections.push(secObj);
      section = newSectionName;
    } else {
      secObj = AppData.sections.find(s => s.name === section);
    }

    const nextNum = await API.purchaseOrders.getNextNumber();

    const poData = {
      id: nextNum.next_number,
      vendor_id: vendorId,
      department_id: deptObj?.id || null,
      section_id: secObj?.id || null,
      po_date: date,
      remarks,
      terms_conditions: terms,
      status: action === 'draft' ? 'Draft' : 'Open',
      total_taxable: totalTaxable,
      total_cgst: totalCGST,
      total_sgst: totalSGST,
      total_igst: totalIGST,
      total_amount: totalTaxable + totalCGST + totalSGST + totalIGST,
      created_by: 'Admin',
      approved_by: action === 'save' ? 'Admin' : null,
      items
    };

    await API.purchaseOrders.create(poData);
    await refreshPurchaseOrders();
    closeModal();
    renderPage('purchase-orders');
  } catch (error) {
    console.error('Error saving PO:', error);
    alert('Failed to save Purchase Order. Please try again.');
  }
}

function editPO(poId) {
  const po = AppData.purchaseOrders.find(p => p.id === poId);
  if (!po || po.status !== 'Draft') {
    alert('Only draft POs can be edited');
    return;
  }
  alert('Edit functionality for PO ' + poId + ' - This would open the PO form with existing data for editing.');
}

async function approvePO(poId) {
  const po = AppData.purchaseOrders.find(p => p.id === poId);
  if (!po) return;

  if (confirm(`Approve PO ${poId}?`)) {
    try {
      await API.purchaseOrders.approve(poId, 'Admin');
      await refreshPurchaseOrders();
      renderPage('purchase-orders');
    } catch (error) {
      console.error('Error approving PO:', error);
      alert('Failed to approve Purchase Order. Please try again.');
    }
  }
}

function viewPO(poId) {
  const po = AppData.purchaseOrders.find(p => p.id === poId);
  if (!po) return;

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Purchase Order: ${po.id}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group">
          <label>Vendor</label>
          <p><strong>${po.vendorName}</strong></p>
        </div>
        <div class="form-group">
          <label>Site</label>
          <p><strong>${po.siteName}</strong></p>
        </div>
        <div class="form-group">
          <label>Date</label>
          <p>${formatDate(po.date)}</p>
        </div>
        <div class="form-group">
          <label>Status</label>
          <p><span class="badge ${getStatusBadgeClass(po.status)}">${po.status}</span></p>
        </div>
      </div>

      <h4 style="margin: 20px 0 12px;">Order Lines</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Pending</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${po.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.qty}</td>
              <td>${item.received}</td>
              <td>${item.qty - item.received}</td>
              <td>₹${formatCurrency(item.rate)}</td>
              <td>₹${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align: right; margin-top: 12px; font-weight: 600;">
        Grand Total: ₹${formatCurrency(po.total)}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

// ============ GOODS RECEIPT ============
function renderGoodsReceipt() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">📥</span>
        <div>
          <h1>Goods Receipt</h1>
          <p class="page-subtitle">Record deliveries against open purchase orders and keep stock accurate.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
        <button class="btn btn-secondary" onclick="openPOOutstandingModal()">Balances vs PO Outstanding</button>
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" onclick="toggleDropdown('grn-export-dropdown')">
            Export <span class="dropdown-arrow">▼</span>
          </button>
          <div class="dropdown-menu" id="grn-export-dropdown">
            <a href="#" class="dropdown-item" onclick="exportGRN('current'); return false;">Export Current Page</a>
            <a href="#" class="dropdown-item" onclick="exportGRN('all'); return false;">Export All</a>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-new-grn">Receive Against Vendors</button>
      </div>
    </div>

    <div class="grn-info">
      <h4>STAGGERED RECEIPTS</h4>
      <p><strong>Receive against each PO line, over multiple deliveries</strong></p>
      <p>Split every receipt into Accepted, Rejected, and Damaged so outstanding balances stay accurate until the PO is complete.</p>
    </div>

    <div class="info-cards">
      <div class="info-card">
        <div class="info-card-icon">✅</div>
        <div class="info-card-content">
          <h3>01 Accepted</h3>
          <p class="number">Into stock</p>
          <p>Good qty posts to the site ledger</p>
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-icon danger">❌</div>
        <div class="info-card-content">
          <h3>02 Rejected</h3>
          <p class="number danger">Not accepted</p>
          <p>Short / wrong / refuse — not stocked</p>
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-icon warning">⚠️</div>
        <div class="info-card-content">
          <h3>03 Damaged</h3>
          <p class="number warning">Quarantine</p>
          <p>Received but unfit — track separately</p>
        </div>
      </div>
    </div>

    <div class="filters-bar" style="flex-wrap: wrap; gap: 8px;">
      <input type="text" class="filter-input" id="grn-search" placeholder="Search GRN / PO / Challan...">
      <select class="filter-select" id="grn-fy-filter">
        ${getFinancialYearOptions()}
      </select>
      <select class="filter-select" id="grn-status-filter">
        <option value="">Status</option>
        <option value="Posted">Posted</option>
        <option value="Draft">Draft</option>
      </select>
      <select class="filter-select" id="grn-vendor-filter">
        <option value="">Vendor</option>
        ${AppData.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="grn-godown-filter">
        <option value="">Godown</option>
        <option value="Godown A">Godown A</option>
        <option value="Godown B">Godown B</option>
        <option value="Godown C">Godown C</option>
        <option value="Godown D">Godown D</option>
      </select>
      <select class="filter-select" id="grn-department-filter">
        <option value="">Department</option>
        <option value="Maintenance">Maintenance</option>
        <option value="Production">Production</option>
        <option value="HR">HR</option>
      </select>
      <select class="filter-select" id="grn-section-filter">
        <option value="">Section</option>
        <option value="Tipper">Tipper</option>
        <option value="Excavator">Excavator</option>
        <option value="Loader">Loader</option>
      </select>
    </div>

    <div class="summary-cards" id="grn-summary-cards">
      ${getGRNSummaryCards(AppData.goodsReceipts)}
    </div>

    ${getKeyboardHints()}

    <div class="card" style="overflow-x: auto;">
      <table class="data-table" id="grn-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>GRN No</th>
            <th>PO No</th>
            <th>Challan No</th>
            <th>Vendor Name</th>
            <th>Amount</th>
            <th>Godown</th>
            <th>Department</th>
            <th>Section</th>
            <th>Created By</th>
            <th>View & Action</th>
          </tr>
        </thead>
        <tbody>
          ${renderGRNRows(AppData.goodsReceipts)}
        </tbody>
      </table>
    </div>
  `;
}

function setupGRNHandlers() {
  document.getElementById('btn-new-grn')?.addEventListener('click', () => openGRNModal());
  document.getElementById('grn-search')?.addEventListener('input', filterGRNs);
  document.getElementById('grn-fy-filter')?.addEventListener('change', filterGRNs);
  document.getElementById('grn-status-filter')?.addEventListener('change', filterGRNs);
  document.getElementById('grn-vendor-filter')?.addEventListener('change', filterGRNs);
  document.getElementById('grn-godown-filter')?.addEventListener('change', filterGRNs);
  document.getElementById('grn-department-filter')?.addEventListener('change', filterGRNs);
  document.getElementById('grn-section-filter')?.addEventListener('change', filterGRNs);
}

function renderGRNRows(receipts) {
  return receipts.map(grn => {
    // Get unique PO IDs from items
    const poIds = [...new Set(grn.items?.map(i => i.poId) || [grn.poId])].filter(Boolean).join(', ');
    return `
    <tr>
      <td>${formatDate(grn.date)}</td>
      <td><strong>${grn.id}</strong></td>
      <td>${poIds || '-'}</td>
      <td>${grn.challanNo || '-'}</td>
      <td>${grn.vendorName}</td>
      <td>₹${formatCurrency(grn.total || 0)}</td>
      <td>${grn.godown || '-'}</td>
      <td>${grn.department || '-'}</td>
      <td>${grn.section || '-'}</td>
      <td>${grn.createdBy || 'Admin'}</td>
      <td class="action-icons">
        <button class="action-icon" onclick="viewGRN('${grn.id}')" title="View">👁️</button>
        ${grn.status === 'Draft' ? `<button class="action-icon" onclick="editGRN('${grn.id}')" title="Edit">✏️</button>` : ''}
      </td>
    </tr>
  `;
  }).join('');
}

function filterGRNs() {
  const search = document.getElementById('grn-search').value.toLowerCase();
  const fy = document.getElementById('grn-fy-filter').value;
  const status = document.getElementById('grn-status-filter').value;
  const vendorId = document.getElementById('grn-vendor-filter').value;
  const godown = document.getElementById('grn-godown-filter').value;
  const department = document.getElementById('grn-department-filter').value;
  const section = document.getElementById('grn-section-filter').value;

  const filtered = AppData.goodsReceipts.filter(grn => {
    const poIds = grn.items?.map(i => i.poId).join(' ') || grn.poId || '';
    const matchesSearch = !search ||
      grn.id.toLowerCase().includes(search) ||
      poIds.toLowerCase().includes(search) ||
      (grn.challanNo || '').toLowerCase().includes(search) ||
      (grn.vendorName || '').toLowerCase().includes(search);
    const matchesFY = !fy || getFinancialYear(grn.date) === fy;
    const matchesStatus = !status || grn.status === status;
    const matchesVendor = !vendorId || grn.vendorId === vendorId;
    const matchesGodown = !godown || grn.godown === godown;
    const matchesDepartment = !department || grn.department === department;
    const matchesSection = !section || grn.section === section;
    return matchesSearch && matchesFY && matchesStatus && matchesVendor && matchesGodown && matchesDepartment && matchesSection;
  });

  document.querySelector('#grn-table tbody').innerHTML = renderGRNRows(filtered);
  document.getElementById('grn-summary-cards').innerHTML = getGRNSummaryCards(filtered);
}

function openGRNModal() {
  // Get vendors that have open POs (not completed)
  const openPOs = AppData.purchaseOrders.filter(po => po.status !== 'Completed');
  const vendorIdsWithOpenPOs = [...new Set(openPOs.map(po => po.vendorId))];
  const vendorsWithOpenPOs = AppData.vendors.filter(v => vendorIdsWithOpenPOs.includes(v.id));

  const grnNumber = generateGRNNumber();
  const grnDate = new Date().toISOString().split('T')[0];

  modalContent.classList.add('modal-wide');
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>GRN Input Form</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="grn-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Vendor Name *</label>
            <select id="grn-vendor" required onchange="loadPOsForVendor()">
              <option value="">(SELECT FROM LIST)</option>
              ${vendorsWithOpenPOs.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Date *</label>
            <input type="date" id="grn-date" value="${grnDate}">
          </div>
          <div class="form-group">
            <label>GRN No</label>
            <input type="text" id="grn-number" value="${grnNumber}" readonly style="background: var(--gray-100); cursor: not-allowed;">
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>PO No & Date *</label>
            <select id="grn-po" required onchange="onPOSelected()">
              <option value="">(SELECT FROM OPEN PO)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Challan / Invoice NO & Date</label>
            <input type="text" id="grn-challan" placeholder="(MANUAL ENTRY)">
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Department</label>
            <input type="text" id="grn-department" readonly placeholder="(AUTO FILL FROM PO NO)" style="background: var(--gray-100); cursor: not-allowed;">
          </div>
          <div class="form-group">
            <label>Section</label>
            <input type="text" id="grn-section" readonly placeholder="(AUTO FILL FROM PO NO)" style="background: var(--gray-100); cursor: not-allowed;">
          </div>
          <div class="form-group">
            <label>Godown *</label>
            <select id="grn-godown" required>
              <option value="">(MANUAL ENTRY)</option>
              <option value="Godown A">Godown A</option>
              <option value="Godown B">Godown B</option>
              <option value="Godown C">Godown C</option>
              <option value="Godown D">Godown D</option>
            </select>
          </div>
        </div>

        <div class="form-group full-width hidden" id="grn-items-container">
          <label>Select Items to Receive</label>
          <div style="margin-bottom: 12px;">
            <input type="text" id="grn-items-search" class="filter-input" placeholder="Search items..." onkeyup="filterGRNItems()" style="width: 100%; max-width: 300px;">
          </div>
          <div id="grn-items-checklist" class="items-checklist" style="max-height: 200px; overflow-y: auto;">
          </div>
        </div>

        <div id="grn-lines-container" class="hidden">
          <h4 style="margin: 20px 0 12px;">Received Items</h4>
          <table class="data-table" style="width: 100%; table-layout: fixed;">
            <thead>
              <tr>
                <th style="width: 4%;">Sl No</th>
                <th style="width: 16%;">Description of Goods</th>
                <th style="width: 5%;">UOM</th>
                <th style="width: 6%;">Qty</th>
                <th style="width: 7%;">Rate</th>
                <th style="width: 5%;">Disc %</th>
                <th style="width: 9%;">Taxable Amt</th>
                <th style="width: 6%;">CGST %</th>
                <th style="width: 6%;">SGST %</th>
                <th style="width: 6%;">IGST %</th>
                <th style="width: 9%;">Total Amt</th>
                <th style="width: 10%;">Rack / Bin</th>
                <th style="width: 8%;">PO ID</th>
                <th style="width: 5%;">Action</th>
              </tr>
            </thead>
            <tbody id="grn-lines">
            </tbody>
          </table>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
            <button type="button" class="btn btn-sm btn-outline" onclick="addGRNLineManually()">+ Add New</button>
            <div style="font-weight: 600;">
              Total: <span id="grn-grand-total">₹0</span>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-outline" onclick="saveGRN('draft')">Save As Draft</button>
      <button class="btn btn-primary" onclick="saveGRN('save')">Save Changes</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function openPOOutstandingModal() {
  // Get all POs with pending items
  const openPOs = AppData.purchaseOrders.filter(po => po.status !== 'Completed');

  // Calculate outstanding items
  const outstandingItems = [];
  let totalOutstandingValue = 0;

  openPOs.forEach(po => {
    po.items.forEach(item => {
      const pending = item.qty - item.received;
      if (pending > 0) {
        const value = pending * item.rate;
        totalOutstandingValue += value;
        outstandingItems.push({
          poId: po.id,
          poDate: po.date,
          vendorName: po.vendorName,
          siteName: po.siteName,
          itemName: item.name,
          ordered: item.qty,
          received: item.received,
          pending: pending,
          rate: item.rate,
          value: value
        });
      }
    });
  });

  modalContent.classList.add('modal-wide');
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>PO Outstanding Balances</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="stats-row" style="margin-bottom: 20px;">
        <div class="stat-item">
          <div class="stat-value red">${openPOs.length}</div>
          <div class="stat-label">Open POs</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${outstandingItems.length}</div>
          <div class="stat-label">Pending Line Items</div>
        </div>
        <div class="stat-item">
          <div class="stat-value green">₹${formatCurrency(totalOutstandingValue)}</div>
          <div class="stat-label">Total Outstanding Value</div>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <input type="text" class="filter-input" id="outstanding-search" placeholder="Search by PO, vendor, or item..." onkeyup="filterOutstandingTable()" style="max-width: 300px;">
      </div>

      <div style="max-height: 400px; overflow-y: auto;">
        <table class="data-table" id="outstanding-table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>Date</th>
              <th>Vendor</th>
              <th>Site</th>
              <th>Item</th>
              <th>Ordered</th>
              <th>Received</th>
              <th>Pending</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${outstandingItems.length > 0 ? outstandingItems.map(item => `
              <tr data-search="${item.poId.toLowerCase()} ${item.vendorName.toLowerCase()} ${item.itemName.toLowerCase()}">
                <td><strong>${item.poId}</strong></td>
                <td>${formatDate(item.poDate)}</td>
                <td>${item.vendorName}</td>
                <td>${item.siteName}</td>
                <td>${item.itemName}</td>
                <td>${item.ordered}</td>
                <td>${item.received}</td>
                <td><span class="badge badge-warning">${item.pending}</span></td>
                <td>₹${formatCurrency(item.value)}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: var(--gray-500);">
                  <p style="font-size: 16px; margin-bottom: 8px;">🎉 All caught up!</p>
                  <p>No outstanding PO balances. All items have been received.</p>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function filterOutstandingTable() {
  const search = document.getElementById('outstanding-search').value.toLowerCase();
  const rows = document.querySelectorAll('#outstanding-table tbody tr[data-search]');

  rows.forEach(row => {
    const searchData = row.dataset.search || '';
    if (searchData.includes(search)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function loadItemsForVendor() {
  const vendorId = document.getElementById('grn-vendor').value;
  const itemsContainer = document.getElementById('grn-items-container');
  const itemsChecklist = document.getElementById('grn-items-checklist');
  const linesContainer = document.getElementById('grn-lines-container');

  if (!vendorId) {
    itemsContainer.classList.add('hidden');
    linesContainer.classList.add('hidden');
    return;
  }

  // Get all open POs for this vendor
  const openPOs = AppData.purchaseOrders.filter(po => po.vendorId === vendorId && po.status !== 'Completed');

  // Group items by itemId to find items in multiple POs
  const itemsByItemId = {};
  openPOs.forEach(po => {
    po.items.forEach(item => {
      const pending = item.qty - item.received;
      if (pending > 0) {
        if (!itemsByItemId[item.itemId]) {
          itemsByItemId[item.itemId] = [];
        }
        itemsByItemId[item.itemId].push({
          poId: po.id,
          itemId: item.itemId,
          name: item.name,
          uom: item.uom || 'NOS',
          qty: item.qty,
          received: item.received,
          pending: pending,
          rate: item.rate,
          disc: item.disc || 0,
          cgst: item.cgst || 9,
          sgst: item.sgst || 9,
          igst: item.igst || 0
        });
      }
    });
  });

  // Store for later use in updateGRNLines
  window.grnItemsByItemId = itemsByItemId;

  // Create a flat list for checkbox display (unique items)
  const uniqueItems = Object.keys(itemsByItemId).map(itemId => {
    const poList = itemsByItemId[itemId];
    const totalPending = poList.reduce((sum, p) => sum + p.pending, 0);
    return {
      itemId: itemId,
      name: poList[0].name,
      poCount: poList.length,
      poIds: poList.map(p => p.poId).join(', '),
      totalPending: totalPending
    };
  });

  if (uniqueItems.length === 0) {
    itemsChecklist.innerHTML = '<p style="color: var(--gray-500); padding: 12px;">No pending items for this vendor.</p>';
    itemsContainer.classList.remove('hidden');
    linesContainer.classList.add('hidden');
    return;
  }

  itemsChecklist.innerHTML = uniqueItems.map(item => `
    <label class="item-checkbox" data-search="${item.name.toLowerCase()} ${item.itemId.toLowerCase()}">
      <input type="checkbox" value="${item.itemId}" onchange="updateGRNLines()">
      <span class="item-info">
        <strong>${item.name}</strong>
        <span class="item-meta">${item.poCount > 1 ? `In ${item.poCount} POs (${item.poIds})` : `PO: ${item.poIds}`} | Total Pending: ${item.totalPending}</span>
      </span>
    </label>
  `).join('');

  itemsContainer.classList.remove('hidden');
  linesContainer.classList.add('hidden');
}

function filterGRNItems() {
  const search = document.getElementById('grn-items-search').value.toLowerCase();
  const items = document.querySelectorAll('#grn-items-checklist .item-checkbox');

  items.forEach(item => {
    const searchData = item.dataset.search || '';
    item.style.display = searchData.includes(search) ? '' : 'none';
  });
}

// Load POs for selected vendor
function loadPOsForVendor() {
  const vendorId = document.getElementById('grn-vendor').value;
  const poSelect = document.getElementById('grn-po');
  const itemsContainer = document.getElementById('grn-items-container');
  const linesContainer = document.getElementById('grn-lines-container');

  // Reset fields
  document.getElementById('grn-department').value = '';
  document.getElementById('grn-section').value = '';

  if (!vendorId) {
    poSelect.innerHTML = '<option value="">(SELECT FROM OPEN PO)</option>';
    if (itemsContainer) itemsContainer.classList.add('hidden');
    if (linesContainer) linesContainer.classList.add('hidden');
    return;
  }

  // Get all open POs for this vendor
  const openPOs = AppData.purchaseOrders.filter(po => po.vendorId === vendorId && po.status !== 'Completed');

  if (openPOs.length === 0) {
    poSelect.innerHTML = '<option value="">No open POs available</option>';
    return;
  }

  poSelect.innerHTML = `
    <option value="">(SELECT FROM OPEN PO)</option>
    ${openPOs.map(po => `<option value="${po.id}">${po.id} : ${formatDate(po.date)}</option>`).join('')}
  `;
}

// When PO is selected, auto-fill department/section and load items
function onPOSelected() {
  const poId = document.getElementById('grn-po').value;
  const departmentInput = document.getElementById('grn-department');
  const sectionInput = document.getElementById('grn-section');
  const itemsContainer = document.getElementById('grn-items-container');
  const itemsChecklist = document.getElementById('grn-items-checklist');
  const linesContainer = document.getElementById('grn-lines-container');

  if (!poId) {
    departmentInput.value = '';
    sectionInput.value = '';
    if (itemsContainer) itemsContainer.classList.add('hidden');
    if (linesContainer) linesContainer.classList.add('hidden');
    return;
  }

  const po = AppData.purchaseOrders.find(p => p.id === poId);
  if (!po) return;

  // Auto-fill department and section from PO
  departmentInput.value = po.department || '';
  sectionInput.value = po.section || '';

  // Get pending items from this PO
  const itemsByItemId = {};
  po.items.forEach(item => {
    const pending = item.qty - item.received;
    if (pending > 0) {
      if (!itemsByItemId[item.itemId]) {
        itemsByItemId[item.itemId] = [];
      }
      itemsByItemId[item.itemId].push({
        poId: po.id,
        itemId: item.itemId,
        name: item.name,
        uom: item.uom || 'NOS',
        qty: item.qty,
        received: item.received,
        pending: pending,
        rate: item.rate,
        disc: item.disc || 0,
        cgst: item.cgst || 9,
        sgst: item.sgst || 9,
        igst: item.igst || 0
      });
    }
  });

  // Store for later use
  window.grnItemsByItemId = itemsByItemId;

  // Create items list for selection
  const uniqueItems = Object.keys(itemsByItemId).map(itemId => {
    const poList = itemsByItemId[itemId];
    const totalPending = poList.reduce((sum, p) => sum + p.pending, 0);
    return {
      itemId: itemId,
      name: poList[0].name,
      totalPending: totalPending
    };
  });

  if (uniqueItems.length === 0) {
    itemsChecklist.innerHTML = '<p style="color: var(--gray-500); padding: 12px;">No pending items for this PO.</p>';
    itemsContainer.classList.remove('hidden');
    linesContainer.classList.add('hidden');
    return;
  }

  itemsChecklist.innerHTML = uniqueItems.map(item => `
    <label class="item-checkbox" data-search="${item.name.toLowerCase()} ${item.itemId.toLowerCase()}">
      <input type="checkbox" value="${item.itemId}" onchange="updateGRNLines()" checked>
      <span class="item-info">
        <strong>${item.name}</strong>
        <span class="item-meta">Pending: ${item.totalPending}</span>
      </span>
    </label>
  `).join('');

  itemsContainer.classList.remove('hidden');

  // Auto-populate lines
  updateGRNLines();
}

function updateGRNLines() {
  const container = document.getElementById('grn-lines-container');
  const tbody = document.getElementById('grn-lines');

  // Get all checked items (now just itemId, not poId|itemId)
  const checkedItemIds = Array.from(document.querySelectorAll('#grn-items-checklist input:checked'))
    .map(cb => cb.value);

  if (checkedItemIds.length === 0) {
    container.classList.add('hidden');
    return;
  }

  // Build lines from checked items using the stored itemsByItemId
  const lines = [];
  checkedItemIds.forEach((itemId, index) => {
    const poOptions = window.grnItemsByItemId[itemId] || [];
    if (poOptions.length > 0) {
      const defaultPO = poOptions[0];
      lines.push({
        slNo: index + 1,
        itemId: itemId,
        poOptions: poOptions,
        selectedPO: defaultPO,
        hasMultiplePOs: poOptions.length > 1
      });
    }
  });

  tbody.innerHTML = lines.map((line, idx) => {
    const po = line.selectedPO;
    const taxableAmt = (po.qty * po.rate * (1 - po.disc / 100));
    const totalAmt = taxableAmt * (1 + (po.cgst + po.sgst + po.igst) / 100);

    return `
    <tr data-item-id="${line.itemId}" data-row-index="${idx}">
      <td class="grn-sl-no" style="text-align: center;">${line.slNo}</td>
      <td>${po.name}</td>
      <td style="text-align: center;">${po.uom}</td>
      <td><input type="number" class="grn-qty" value="${po.pending}" min="1" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
      <td><input type="number" class="grn-rate" value="${po.rate}" min="0" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
      <td><input type="number" class="grn-disc" value="${po.disc}" min="0" max="100" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
      <td class="grn-taxable-amt" style="text-align: right;">₹${formatCurrency(taxableAmt)}</td>
      <td><input type="number" class="grn-cgst" value="${po.cgst}" min="0" max="100" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
      <td><input type="number" class="grn-sgst" value="${po.sgst}" min="0" max="100" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
      <td><input type="number" class="grn-igst" value="${po.igst}" min="0" max="100" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
      <td class="grn-line-total" style="text-align: right;">₹${formatCurrency(totalAmt)}</td>
      <td><input type="text" class="grn-rack" placeholder="e.g., A1-01" style="width: 100%;"></td>
      <td>
        ${line.hasMultiplePOs ? `
          <select class="grn-po-select" onchange="changeGRNLinePO(this, '${line.itemId}')" style="width: 100%;">
            ${line.poOptions.map(opt => `<option value="${opt.poId}" ${opt.poId === po.poId ? 'selected' : ''}>${opt.poId} (Pend: ${opt.pending})</option>`).join('')}
          </select>
        ` : `<span class="badge badge-default">${po.poId}</span>`}
      </td>
      <td style="text-align: center;">
        <button type="button" class="action-icon delete" onclick="removeGRNLine(this)" title="Remove">🗑️</button>
      </td>
    </tr>
  `;
  }).join('');

  container.classList.remove('hidden');
  updateGRNGrandTotal();
}

function changeGRNLinePO(select, itemId) {
  const selectedPOId = select.value;
  const poOptions = window.grnItemsByItemId[itemId] || [];
  const selectedPO = poOptions.find(p => p.poId === selectedPOId);

  if (!selectedPO) return;

  const row = select.closest('tr');
  row.querySelector('.grn-qty').value = selectedPO.pending;
  row.querySelector('.grn-rate').value = selectedPO.rate;
  row.querySelector('.grn-disc').value = selectedPO.disc;
  row.querySelector('.grn-cgst').value = selectedPO.cgst;
  row.querySelector('.grn-sgst').value = selectedPO.sgst;
  row.querySelector('.grn-igst').value = selectedPO.igst;

  updateGRNLineTotal(row.querySelector('.grn-qty'));
}

function updateGRNLineTotal(el) {
  const row = el.closest('tr');
  const qty = parseInt(row.querySelector('.grn-qty').value) || 0;
  const rate = parseFloat(row.querySelector('.grn-rate').value) || 0;
  const disc = parseFloat(row.querySelector('.grn-disc').value) || 0;
  const cgst = parseFloat(row.querySelector('.grn-cgst').value) || 0;
  const sgst = parseFloat(row.querySelector('.grn-sgst').value) || 0;
  const igst = parseFloat(row.querySelector('.grn-igst').value) || 0;

  const grossAmount = qty * rate;
  const discountAmount = grossAmount * (disc / 100);
  const taxableAmount = grossAmount - discountAmount;
  const cgstAmount = taxableAmount * (cgst / 100);
  const sgstAmount = taxableAmount * (sgst / 100);
  const igstAmount = taxableAmount * (igst / 100);
  const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

  row.querySelector('.grn-taxable-amt').textContent = `₹${formatCurrency(taxableAmount)}`;
  row.querySelector('.grn-line-total').textContent = `₹${formatCurrency(totalAmount)}`;
  updateGRNGrandTotal();
}

function updateGRNGrandTotal() {
  let total = 0;
  document.querySelectorAll('#grn-lines tr').forEach(row => {
    const qty = parseInt(row.querySelector('.grn-qty')?.value) || 0;
    const rate = parseFloat(row.querySelector('.grn-rate')?.value) || 0;
    const disc = parseFloat(row.querySelector('.grn-disc')?.value) || 0;
    const cgst = parseFloat(row.querySelector('.grn-cgst')?.value) || 0;
    const sgst = parseFloat(row.querySelector('.grn-sgst')?.value) || 0;
    const igst = parseFloat(row.querySelector('.grn-igst')?.value) || 0;

    const grossAmount = qty * rate;
    const discountAmount = grossAmount * (disc / 100);
    const taxableAmount = grossAmount - discountAmount;
    total += taxableAmount * (1 + (cgst + sgst + igst) / 100);
  });
  const grandTotalEl = document.getElementById('grn-grand-total');
  if (grandTotalEl) {
    grandTotalEl.textContent = `₹${formatCurrency(total)}`;
  }
}

function removeGRNLine(btn) {
  const row = btn.closest('tr');
  const itemId = row.dataset.itemId;

  // Uncheck the corresponding checkbox
  const checkbox = document.querySelector(`#grn-items-checklist input[value="${itemId}"]`);
  if (checkbox) {
    checkbox.checked = false;
  }

  row.remove();
  renumberGRNLines();
  updateGRNGrandTotal();

  // Hide container if no lines left
  if (document.querySelectorAll('#grn-lines tr').length === 0) {
    document.getElementById('grn-lines-container').classList.add('hidden');
  }
}

function renumberGRNLines() {
  document.querySelectorAll('#grn-lines tr').forEach((row, index) => {
    row.querySelector('.grn-sl-no').textContent = index + 1;
  });
}

function addGRNLineManually() {
  const container = document.getElementById('grn-lines-container');
  const tbody = document.getElementById('grn-lines');
  const slNo = tbody.querySelectorAll('tr').length + 1;

  const row = document.createElement('tr');
  row.dataset.itemId = 'manual-' + slNo;
  row.dataset.rowIndex = slNo - 1;
  row.innerHTML = `
    <td class="grn-sl-no" style="text-align: center;">${slNo}</td>
    <td>
      <select class="grn-item-select" onchange="updateGRNLineFromItem(this)" style="width: 100%;">
        <option value="">Select Item</option>
        ${AppData.items.map(i => `<option value="${i.id}" data-name="${i.name}" data-uom="${i.uom || 'NOS'}">${i.name}</option>`).join('')}
      </select>
    </td>
    <td style="text-align: center;">-</td>
    <td><input type="number" class="grn-qty" value="1" min="1" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
    <td><input type="number" class="grn-rate" value="0" min="0" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
    <td><input type="number" class="grn-disc" value="0" min="0" max="100" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
    <td class="grn-taxable-amt" style="text-align: right;">₹0</td>
    <td><input type="number" class="grn-cgst" value="9" min="0" max="100" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
    <td><input type="number" class="grn-sgst" value="9" min="0" max="100" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
    <td><input type="number" class="grn-igst" value="0" min="0" max="100" onchange="updateGRNLineTotal(this)" style="width: 100%;"></td>
    <td class="grn-line-total" style="text-align: right;">₹0</td>
    <td><input type="text" class="grn-rack" placeholder="e.g., A1-01" style="width: 100%;"></td>
    <td><span class="badge badge-default">Manual</span></td>
    <td style="text-align: center;">
      <button type="button" class="action-icon delete" onclick="removeGRNLine(this)" title="Remove">🗑️</button>
    </td>
  `;

  tbody.appendChild(row);
  container.classList.remove('hidden');
  updateGRNGrandTotal();
}

function updateGRNLineFromItem(select) {
  const row = select.closest('tr');
  const selectedOption = select.options[select.selectedIndex];

  if (selectedOption && selectedOption.value) {
    const uomCell = row.querySelectorAll('td')[2];
    uomCell.textContent = selectedOption.dataset.uom || '-';
  }
}

async function saveGRN(action = 'save') {
  const vendorId = document.getElementById('grn-vendor').value;
  const poId = document.getElementById('grn-po').value;
  const department = document.getElementById('grn-department').value;
  const section = document.getElementById('grn-section').value;
  const godown = document.getElementById('grn-godown').value;
  const challanNo = document.getElementById('grn-challan').value;
  const date = document.getElementById('grn-date').value;

  if (!vendorId) {
    alert('Please select a Vendor');
    return;
  }

  if (!poId) {
    alert('Please select a PO');
    return;
  }

  if (!godown) {
    alert('Please select Godown');
    return;
  }

  const vendor = AppData.vendors.find(v => v.id === vendorId);
  const grnItems = [];
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  document.querySelectorAll('#grn-lines tr').forEach(row => {
    const itemId = row.dataset.itemId;
    const poSelect = row.querySelector('.grn-po-select');
    const linePoId = poSelect ? poSelect.value : row.querySelector('.badge')?.textContent;

    const qty = parseInt(row.querySelector('.grn-qty').value) || 0;
    const rate = parseFloat(row.querySelector('.grn-rate').value) || 0;
    const disc = parseFloat(row.querySelector('.grn-disc').value) || 0;
    const cgst = parseFloat(row.querySelector('.grn-cgst').value) || 0;
    const sgst = parseFloat(row.querySelector('.grn-sgst').value) || 0;
    const igst = parseFloat(row.querySelector('.grn-igst').value) || 0;
    const rack = row.querySelector('.grn-rack').value;

    const grossAmount = qty * rate;
    const discountAmount = grossAmount * (disc / 100);
    const taxableAmount = grossAmount - discountAmount;
    const cgstAmount = taxableAmount * (cgst / 100);
    const sgstAmount = taxableAmount * (sgst / 100);
    const igstAmount = taxableAmount * (igst / 100);
    const lineTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;

    const poOptions = window.grnItemsByItemId[itemId] || [];
    const itemData = poOptions.find(p => p.poId === linePoId) || poOptions[0];

    if (qty > 0) {
      grnItems.push({
        po_id: linePoId,
        item_id: itemId,
        description: itemData?.name || '',
        uom: itemData?.uom || 'NOS',
        qty,
        accepted_qty: qty,
        rejected_qty: 0,
        damaged_qty: 0,
        rate,
        discount_pct: disc,
        taxable_amount: taxableAmount,
        cgst_pct: cgst,
        sgst_pct: sgst,
        igst_pct: igst,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
        total_amount: lineTotal,
        rack_bin: rack
      });

      totalTaxable += taxableAmount;
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
      totalIGST += igstAmount;
    }
  });

  if (grnItems.length === 0) {
    alert('Please add at least one item to receive');
    return;
  }

  try {
    const deptObj = AppData.departments.find(d => d.name === department);
    const secObj = AppData.sections.find(s => s.name === section);
    const godownObj = AppData.godowns.find(g => g.name === godown);

    const nextNum = await API.goodsReceipts.getNextNumber();

    const grnData = {
      id: nextNum.next_number,
      vendor_id: vendorId,
      department_id: deptObj?.id || null,
      section_id: secObj?.id || null,
      godown_id: godownObj?.id || null,
      challan_no: challanNo,
      grn_date: date,
      status: action === 'draft' ? 'Draft' : 'Posted',
      total_taxable: totalTaxable,
      total_cgst: totalCGST,
      total_sgst: totalSGST,
      total_igst: totalIGST,
      total_amount: totalTaxable + totalCGST + totalSGST + totalIGST,
      created_by: 'Admin',
      items: grnItems
    };

    await API.goodsReceipts.create(grnData);
    await Promise.all([
      refreshGoodsReceipts(),
      refreshPurchaseOrders(),
      refreshStock()
    ]);
    closeModal();
    renderPage('goods-receipt');
  } catch (error) {
    console.error('Error saving GRN:', error);
    alert('Failed to save Goods Receipt. Please try again.');
  }
}

function updateStock(itemId, itemName, siteId, siteName, qty) {
  const item = AppData.items.find(i => i.id === itemId);
  const existingStock = AppData.stock.find(s => s.sku === itemId && s.siteId === siteId);

  if (existingStock) {
    existingStock.onHand += qty;
    existingStock.lastMovement = new Date().toISOString().split('T')[0];
  } else {
    AppData.stock.push({
      sku: itemId,
      itemName,
      siteId,
      siteName,
      onHand: qty,
      reorder: item?.reorder || 0,
      lastMovement: new Date().toISOString().split('T')[0]
    });
  }
}

function editGRN(grnId) {
  const grn = AppData.goodsReceipts.find(g => g.id === grnId);
  if (!grn || grn.status !== 'Draft') {
    alert('Only draft GRNs can be edited');
    return;
  }
  // For now, show a message - full edit would require loading GRN data into the modal
  alert('Edit functionality for GRN ' + grnId + ' - This would open the GRN form with existing data for editing.');
}

function viewGRN(grnId) {
  const grn = AppData.goodsReceipts.find(g => g.id === grnId);
  if (!grn) return;

  const poIds = [...new Set(grn.items.map(item => item.poId).filter(Boolean))];
  const poDisplay = poIds.length > 0 ? poIds.join(', ') : '-';

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Goods Receipt: ${grn.id}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group">
          <label>PO Number</label>
          <p><strong>${poDisplay}</strong></p>
        </div>
        <div class="form-group">
          <label>Vendor</label>
          <p><strong>${grn.vendorName}</strong></p>
        </div>
        <div class="form-group">
          <label>Site</label>
          <p><strong>${grn.siteName || '-'}</strong></p>
        </div>
        <div class="form-group">
          <label>Challan No.</label>
          <p>${grn.challanNo || '-'}</p>
        </div>
        <div class="form-group">
          <label>Date</label>
          <p>${formatDate(grn.date)}</p>
        </div>
        <div class="form-group">
          <label>Status</label>
          <p><span class="badge ${getStatusBadgeClass(grn.status)}">${grn.status}</span></p>
        </div>
        <div class="form-group">
          <label>Department</label>
          <p>${grn.department || '-'}</p>
        </div>
        <div class="form-group">
          <label>Godown</label>
          <p>${grn.godown || '-'}</p>
        </div>
      </div>

      <h4 style="margin: 20px 0 12px;">Received Items</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>UOM</th>
            <th>Qty Received</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${grn.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.uom}</td>
              <td><strong>${item.qty}</strong></td>
              <td>₹${formatCurrency(item.rate)}</td>
              <td>₹${formatCurrency(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals-section" style="margin-top: 16px; text-align: right;">
        <p><strong>Total Amount: ₹${formatCurrency(grn.total)}</strong></p>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

// ============ STOCK ============
function renderStock() {
  const totalConsumptionAmount = (AppData.stockConsumptions || []).reduce((sum, sc) => sum + (sc.total || 0), 0);
  const postedCount = (AppData.stockConsumptions || []).filter(sc => sc.status === 'Posted').length;
  const draftCount = (AppData.stockConsumptions || []).filter(sc => sc.status === 'Draft').length;

  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">📦</span>
        <div>
          <h1>Stock Consumption</h1>
          <p class="page-subtitle">Track stock consumption against cost centers and job cards.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" onclick="toggleDropdown('sc-export-dropdown')">
            Export <span class="dropdown-arrow">▼</span>
          </button>
          <div class="dropdown-menu" id="sc-export-dropdown">
            <a href="#" class="dropdown-item" onclick="exportSC('current'); return false;">Export Current Page</a>
            <a href="#" class="dropdown-item" onclick="exportSC('all'); return false;">Export All</a>
          </div>
        </div>
        <button class="btn btn-primary" id="btn-new-sc">+ Create New</button>
      </div>
    </div>

    <div class="tabs" id="stock-tabs">
      <button class="tab active" data-tab="consumption">Stock Consumption</button>
      <button class="tab" data-tab="onhand">On Hand</button>
      <button class="tab" data-tab="reorder">Reorder (${AppData.stock.filter(s => s.onHand <= s.reorder).length})</button>
    </div>

    <div id="consumption-tab-content">
      <div class="filters-bar" style="flex-wrap: wrap; gap: 8px;">
        <input type="date" class="filter-select" id="sc-start-date" style="width: 140px;">
        <input type="date" class="filter-select" id="sc-end-date" style="width: 140px;">
        <select class="filter-select" id="sc-status-filter">
          <option value="">All Status</option>
          <option value="Posted">Posted</option>
          <option value="Draft">Draft</option>
        </select>
        <input type="text" class="filter-input" id="sc-search" placeholder="Search SC Number..." style="max-width: 200px;">
        <button class="btn btn-secondary" onclick="filterSC()">More Filters</button>
        <button class="btn btn-outline" onclick="filterSC()">Search</button>
        <button class="btn btn-secondary" onclick="clearSCFilters()">Clear</button>
      </div>

      <div class="summary-cards" id="sc-summary-cards">
        <div class="summary-card">
          <div class="summary-card-icon" style="background: #dbeafe; color: #2563eb;">📋</div>
          <div class="summary-card-content">
            <div class="summary-card-label">Total recorded purchase order amount is</div>
            <div class="summary-card-value">₹${formatCurrency(totalConsumptionAmount)}</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-card-icon" style="background: #fef3c7; color: #d97706;">⏳</div>
          <div class="summary-card-content">
            <div class="summary-card-label">Total outstanding Payment for PO is</div>
            <div class="summary-card-value">₹${formatCurrency(totalConsumptionAmount)}</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-card-icon" style="background: #d1fae5; color: #059669;">💰</div>
          <div class="summary-card-content">
            <div class="summary-card-label">Tax paid to the seller</div>
            <div class="summary-card-value">₹0</div>
          </div>
        </div>
      </div>

      ${getKeyboardHints()}

      <div class="card" style="overflow-x: auto;">
        <table class="data-table" id="sc-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>SC Number</th>
              <th>Department</th>
              <th>Section</th>
              <th>Cost Center</th>
              <th>Godown</th>
              <th>Amount</th>
              <th>Created By</th>
              <th>Approved By</th>
              <th>View & Action</th>
            </tr>
          </thead>
          <tbody>
            ${renderSCRows(AppData.stockConsumptions || [])}
          </tbody>
        </table>
      </div>
    </div>

    <div id="onhand-tab-content" class="hidden">
      <div class="filters-bar">
        <input type="text" class="filter-input" id="stock-search" placeholder="Search SKU or item name...">
        <select class="filter-select" id="stock-site-filter">
          <option value="">Site</option>
          ${AppData.sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
        </select>
      </div>

      <div class="card">
        <table class="data-table" id="stock-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Site</th>
              <th>On Hand</th>
              <th>Reorder</th>
              <th>Last Movement</th>
            </tr>
          </thead>
          <tbody>
            ${renderStockRows(AppData.stock)}
          </tbody>
        </table>
      </div>
    </div>

    <div id="reorder-tab-content" class="hidden">
      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Site</th>
              <th>On Hand</th>
              <th>Reorder Level</th>
              <th>Shortfall</th>
            </tr>
          </thead>
          <tbody>
            ${AppData.stock.filter(s => s.onHand <= s.reorder).map(s => `
              <tr>
                <td>${s.sku}</td>
                <td><strong>${s.itemName}</strong></td>
                <td>${s.siteName}</td>
                <td><span class="badge badge-danger">${s.onHand}</span></td>
                <td>${s.reorder}</td>
                <td><span class="stock-low">${s.reorder - s.onHand}</span></td>
              </tr>
            `).join('') || '<tr><td colspan="6" class="empty-state">No items below reorder level</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function setupStockHandlers() {
  document.getElementById('btn-new-sc')?.addEventListener('click', () => openSCModal());
  document.getElementById('stock-search')?.addEventListener('input', filterStock);
  document.getElementById('stock-site-filter')?.addEventListener('change', filterStock);
  document.getElementById('sc-search')?.addEventListener('input', filterSC);
  document.getElementById('sc-status-filter')?.addEventListener('change', filterSC);

  // Tab switching
  document.querySelectorAll('#stock-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#stock-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;
      document.getElementById('consumption-tab-content')?.classList.toggle('hidden', tabName !== 'consumption');
      document.getElementById('onhand-tab-content')?.classList.toggle('hidden', tabName !== 'onhand');
      document.getElementById('reorder-tab-content')?.classList.toggle('hidden', tabName !== 'reorder');
    });
  });
}

function renderSCRows(consumptions) {
  return consumptions.map(sc => `
    <tr>
      <td>${formatDate(sc.date)}</td>
      <td><strong>${sc.id}</strong></td>
      <td>${sc.department || '-'}</td>
      <td>${sc.section || '-'}</td>
      <td>${sc.costCenter || '-'}</td>
      <td>${sc.godown || '-'}</td>
      <td>₹${formatCurrency(sc.total || 0)}</td>
      <td>${sc.createdBy || 'Admin'}</td>
      <td>${sc.approvedBy || '-'}</td>
      <td class="action-icons">
        <button class="action-icon" onclick="viewSC('${sc.id}')" title="View">👁️</button>
        ${sc.status === 'Draft' ? `<button class="action-icon" onclick="editSC('${sc.id}')" title="Edit">✏️</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function filterSC() {
  const search = document.getElementById('sc-search')?.value.toLowerCase() || '';
  const status = document.getElementById('sc-status-filter')?.value || '';
  const startDate = document.getElementById('sc-start-date')?.value || '';
  const endDate = document.getElementById('sc-end-date')?.value || '';

  const filtered = (AppData.stockConsumptions || []).filter(sc => {
    const matchesSearch = !search || sc.id.toLowerCase().includes(search) || (sc.costCenter || '').toLowerCase().includes(search);
    const matchesStatus = !status || sc.status === status;
    const matchesStartDate = !startDate || sc.date >= startDate;
    const matchesEndDate = !endDate || sc.date <= endDate;
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  document.querySelector('#sc-table tbody').innerHTML = renderSCRows(filtered);
}

function clearSCFilters() {
  document.getElementById('sc-search').value = '';
  document.getElementById('sc-status-filter').value = '';
  document.getElementById('sc-start-date').value = '';
  document.getElementById('sc-end-date').value = '';
  filterSC();
}

function exportSC(type) {
  let data;
  if (type === 'current') {
    const rows = document.querySelectorAll('#sc-table tbody tr');
    data = Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      return {
        date: cells[0]?.textContent || '',
        scNumber: cells[1]?.textContent || '',
        department: cells[2]?.textContent || '',
        section: cells[3]?.textContent || '',
        costCenter: cells[4]?.textContent || '',
        godown: cells[5]?.textContent || '',
        amount: cells[6]?.textContent || '',
        createdBy: cells[7]?.textContent || '',
        approvedBy: cells[8]?.textContent || ''
      };
    });
  } else {
    data = (AppData.stockConsumptions || []).map(sc => ({
      date: formatDate(sc.date),
      scNumber: sc.id,
      department: sc.department || '-',
      section: sc.section || '-',
      costCenter: sc.costCenter || '-',
      godown: sc.godown || '-',
      amount: `₹${formatCurrency(sc.total || 0)}`,
      createdBy: sc.createdBy || 'Admin',
      approvedBy: sc.approvedBy || '-'
    }));
  }

  downloadCSV(data, 'stock_consumption.csv', ['Date', 'SC Number', 'Department', 'Section', 'Cost Center', 'Godown', 'Amount', 'Created By', 'Approved By']);
  toggleDropdown('sc-export-dropdown');
}

function openSCModal() {
  const scNumber = generateSCNumber();
  const scDate = new Date().toISOString().split('T')[0];

  modalContent.classList.add('modal-wide');
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Stock Consumption Input Form</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="sc-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Cost Center *</label>
            <select id="sc-cost-center" required onchange="onCostCenterSelected()">
              <option value="">Select Cost Center...</option>
              ${(AppData.costCenters || []).map(cc => `<option value="${cc.id}" data-dept="${cc.department}" data-section="${cc.section}">${cc.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Date *</label>
            <input type="date" id="sc-date" value="${scDate}" required>
          </div>
          <div class="form-group">
            <label>SC No</label>
            <input type="text" id="sc-number" value="${scNumber}" readonly style="background: var(--gray-100); cursor: not-allowed;">
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>KMR</label>
            <input type="text" id="sc-kmr" placeholder="Kilometer Reading">
          </div>
          <div class="form-group">
            <label>HMR</label>
            <input type="text" id="sc-hmr" placeholder="Hour Meter Reading">
          </div>
          <div class="form-group">
            <label>Job Card No</label>
            <input type="text" id="sc-jobcard" placeholder="Job Card Number">
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Department</label>
            <input type="text" id="sc-department" readonly placeholder="(Auto fill from Cost Center)" style="background: var(--gray-100); cursor: not-allowed;">
          </div>
          <div class="form-group">
            <label>Section</label>
            <input type="text" id="sc-section" readonly placeholder="(Auto fill from Cost Center)" style="background: var(--gray-100); cursor: not-allowed;">
          </div>
          <div class="form-group">
            <label>Godown *</label>
            <select id="sc-godown" required>
              <option value="">Select Godown...</option>
              <option value="Godown A">Godown A</option>
              <option value="Godown B">Godown B</option>
              <option value="Godown C">Godown C</option>
              <option value="Godown D">Godown D</option>
            </select>
          </div>
        </div>

        <div class="item-lines" style="margin-top: 24px;">
          <h4 style="margin: 0 0 16px 0;">Line Items</h4>
          <table class="data-table" style="width: 100%; table-layout: fixed;">
            <thead>
              <tr>
                <th style="width: 5%;">Sl No</th>
                <th style="width: 25%;">Description of Goods</th>
                <th style="width: 8%;">UoM</th>
                <th style="width: 10%;">Qty</th>
                <th style="width: 12%;">Rate</th>
                <th style="width: 12%;">Amount</th>
                <th style="width: 12%;">Rack / Bin</th>
                <th style="width: 10%;">Remarks</th>
                <th style="width: 6%;">Action</th>
              </tr>
            </thead>
            <tbody id="sc-lines">
              <tr>
                <td class="sc-sl-no" style="text-align: center;">1</td>
                <td>
                  <select class="sc-item" onchange="updateSCLineTotal(this)" style="width: 100%;">
                    <option value="">Select Item</option>
                    ${AppData.items.map(i => `<option value="${i.id}" data-name="${i.name}" data-uom="${i.uom || 'NOS'}" data-rate="${i.rate || 0}">${i.name}</option>`).join('')}
                  </select>
                </td>
                <td class="sc-uom" style="text-align: center;">-</td>
                <td><input type="number" class="sc-qty" value="1" min="1" onchange="updateSCLineTotal(this)" style="width: 100%;"></td>
                <td><input type="number" class="sc-rate" value="0" min="0" onchange="updateSCLineTotal(this)" style="width: 100%;"></td>
                <td class="sc-amount" style="text-align: right;">₹0</td>
                <td><input type="text" class="sc-rack" placeholder="e.g., A1-01" style="width: 100%;"></td>
                <td><input type="text" class="sc-remarks" placeholder="Remarks" style="width: 100%;"></td>
                <td style="text-align: center;">
                  <button type="button" class="action-icon" onclick="editSCLine(this)" title="Edit">✏️</button>
                  <button type="button" class="action-icon delete" onclick="removeSCLine(this)" title="Delete">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
            <button type="button" class="btn btn-sm btn-outline" onclick="addSCLine()">+ Add New</button>
            <div style="font-weight: 600;">
              Total: <span id="sc-grand-total">₹0</span>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-outline" onclick="saveSC('draft')">Save As Draft</button>
      <button class="btn btn-primary" onclick="saveSC('save')">Save Changes</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function generateSCNumber() {
  const year = new Date().getFullYear();
  const existingSCs = (AppData.stockConsumptions || []).filter(sc => sc.id && sc.id.includes(year.toString()));
  const nextNum = existingSCs.length + 1;
  return `SC-${year}-${String(nextNum).padStart(5, '0')}`;
}

function onCostCenterSelected() {
  const select = document.getElementById('sc-cost-center');
  const selectedOption = select.options[select.selectedIndex];

  if (selectedOption && selectedOption.value) {
    document.getElementById('sc-department').value = selectedOption.dataset.dept || '';
    document.getElementById('sc-section').value = selectedOption.dataset.section || '';
  } else {
    document.getElementById('sc-department').value = '';
    document.getElementById('sc-section').value = '';
  }
}

function addSCLine() {
  const tbody = document.getElementById('sc-lines');
  const slNo = tbody.querySelectorAll('tr').length + 1;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="sc-sl-no" style="text-align: center;">${slNo}</td>
    <td>
      <select class="sc-item" onchange="updateSCLineTotal(this)" style="width: 100%;">
        <option value="">Select Item</option>
        ${AppData.items.map(i => `<option value="${i.id}" data-name="${i.name}" data-uom="${i.uom || 'NOS'}" data-rate="${i.rate || 0}">${i.name}</option>`).join('')}
      </select>
    </td>
    <td class="sc-uom" style="text-align: center;">-</td>
    <td><input type="number" class="sc-qty" value="1" min="1" onchange="updateSCLineTotal(this)" style="width: 100%;"></td>
    <td><input type="number" class="sc-rate" value="0" min="0" onchange="updateSCLineTotal(this)" style="width: 100%;"></td>
    <td class="sc-amount" style="text-align: right;">₹0</td>
    <td><input type="text" class="sc-rack" placeholder="e.g., A1-01" style="width: 100%;"></td>
    <td><input type="text" class="sc-remarks" placeholder="Remarks" style="width: 100%;"></td>
    <td style="text-align: center;">
      <button type="button" class="action-icon" onclick="editSCLine(this)" title="Edit">✏️</button>
      <button type="button" class="action-icon delete" onclick="removeSCLine(this)" title="Delete">🗑️</button>
    </td>
  `;
  tbody.appendChild(row);
}

function removeSCLine(btn) {
  const row = btn.closest('tr');
  if (document.querySelectorAll('#sc-lines tr').length > 1) {
    row.remove();
    renumberSCLines();
    updateSCGrandTotal();
  }
}

function renumberSCLines() {
  document.querySelectorAll('#sc-lines tr').forEach((row, index) => {
    row.querySelector('.sc-sl-no').textContent = index + 1;
  });
}

function editSCLine(btn) {
  const row = btn.closest('tr');
  const inputs = row.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.disabled = !input.disabled;
  });
  btn.textContent = inputs[0].disabled ? '✏️' : '✅';
  btn.title = inputs[0].disabled ? 'Edit' : 'Done';
}

function updateSCLineTotal(el) {
  const row = el.closest('tr');
  const itemSelect = row.querySelector('.sc-item');
  const selectedOption = itemSelect.options[itemSelect.selectedIndex];

  if (selectedOption && selectedOption.value) {
    row.querySelector('.sc-uom').textContent = selectedOption.dataset.uom || '-';
    const rateInput = row.querySelector('.sc-rate');
    if (parseFloat(rateInput.value) === 0) {
      rateInput.value = selectedOption.dataset.rate || 0;
    }
  }

  const qty = parseInt(row.querySelector('.sc-qty').value) || 0;
  const rate = parseFloat(row.querySelector('.sc-rate').value) || 0;
  const amount = qty * rate;

  row.querySelector('.sc-amount').textContent = `₹${formatCurrency(amount)}`;
  updateSCGrandTotal();
}

function updateSCGrandTotal() {
  let total = 0;
  document.querySelectorAll('#sc-lines tr').forEach(row => {
    const qty = parseInt(row.querySelector('.sc-qty')?.value) || 0;
    const rate = parseFloat(row.querySelector('.sc-rate')?.value) || 0;
    total += qty * rate;
  });
  const grandTotalEl = document.getElementById('sc-grand-total');
  if (grandTotalEl) {
    grandTotalEl.textContent = `₹${formatCurrency(total)}`;
  }
}

async function saveSC(action = 'save') {
  const costCenterSelect = document.getElementById('sc-cost-center');
  const costCenter = costCenterSelect.options[costCenterSelect.selectedIndex]?.text || '';
  const costCenterId = costCenterSelect.value;
  const date = document.getElementById('sc-date').value;
  const kmr = document.getElementById('sc-kmr').value;
  const hmr = document.getElementById('sc-hmr').value;
  const jobCardNo = document.getElementById('sc-jobcard').value;
  const department = document.getElementById('sc-department').value;
  const section = document.getElementById('sc-section').value;
  const godown = document.getElementById('sc-godown').value;

  if (!costCenterId) {
    alert('Please select a Cost Center');
    return;
  }

  if (!godown) {
    alert('Please select a Godown');
    return;
  }

  const items = [];
  let total = 0;

  document.querySelectorAll('#sc-lines tr').forEach(row => {
    const itemSelect = row.querySelector('.sc-item');
    const itemId = itemSelect.value;
    if (itemId) {
      const itemName = itemSelect.options[itemSelect.selectedIndex].dataset.name;
      const uom = row.querySelector('.sc-uom').textContent;
      const qty = parseInt(row.querySelector('.sc-qty').value) || 0;
      const rate = parseFloat(row.querySelector('.sc-rate').value) || 0;
      const amount = qty * rate;
      const rack = row.querySelector('.sc-rack').value;
      const remarks = row.querySelector('.sc-remarks').value;

      items.push({
        item_id: itemId,
        description: itemName,
        uom,
        qty,
        rate,
        amount,
        rack_bin: rack,
        remarks
      });
      total += amount;
    }
  });

  if (items.length === 0) {
    alert('Please add at least one item');
    return;
  }

  try {
    const deptObj = AppData.departments.find(d => d.name === department);
    const secObj = AppData.sections.find(s => s.name === section);
    const godownObj = AppData.godowns.find(g => g.name === godown);

    const nextNum = await API.stock.getNextSCNumber();

    const scData = {
      id: nextNum.next_number,
      cost_center_id: costCenterId,
      department_id: deptObj?.id || null,
      section_id: secObj?.id || null,
      godown_id: godownObj?.id || null,
      sc_date: date,
      kmr,
      hmr,
      job_card_no: jobCardNo,
      status: action === 'draft' ? 'Draft' : 'Posted',
      total_amount: total,
      created_by: 'Admin',
      approved_by: action === 'draft' ? null : 'Manager',
      items
    };

    await API.stock.createConsumption(scData);
    await Promise.all([
      refreshStockConsumptions(),
      refreshStock()
    ]);
    closeModal();
    renderPage('stock');
  } catch (error) {
    console.error('Error saving stock consumption:', error);
    alert('Failed to save Stock Consumption. Please try again.');
  }
}

function viewSC(scId) {
  const sc = (AppData.stockConsumptions || []).find(s => s.id === scId);
  if (!sc) return;

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Stock Consumption: ${sc.id}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group">
          <label>Cost Center</label>
          <p><strong>${sc.costCenter}</strong></p>
        </div>
        <div class="form-group">
          <label>Date</label>
          <p>${formatDate(sc.date)}</p>
        </div>
        <div class="form-group">
          <label>Job Card No</label>
          <p>${sc.jobCardNo || '-'}</p>
        </div>
        <div class="form-group">
          <label>Department</label>
          <p>${sc.department || '-'}</p>
        </div>
        <div class="form-group">
          <label>Section</label>
          <p>${sc.section || '-'}</p>
        </div>
        <div class="form-group">
          <label>Godown</label>
          <p>${sc.godown || '-'}</p>
        </div>
        <div class="form-group">
          <label>KMR / HMR</label>
          <p>${sc.kmr || '-'} / ${sc.hmr || '-'}</p>
        </div>
        <div class="form-group">
          <label>Status</label>
          <p><span class="badge ${getStatusBadgeClass(sc.status)}">${sc.status}</span></p>
        </div>
      </div>

      <h4 style="margin: 20px 0 12px;">Items Consumed</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>UoM</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Rack/Bin</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${(sc.items || []).map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.uom}</td>
              <td>${item.qty}</td>
              <td>₹${formatCurrency(item.rate)}</td>
              <td>₹${formatCurrency(item.amount)}</td>
              <td>${item.rack || '-'}</td>
              <td>${item.remarks || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="text-align: right; margin-top: 12px; font-weight: 600;">
        Total: ₹${formatCurrency(sc.total)}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function editSC(scId) {
  alert('Edit functionality for SC ' + scId + ' - This would open the SC form with existing data for editing.');
}

function renderStockRows(stockItems) {
  return stockItems.map(s => `
    <tr>
      <td>${s.sku}</td>
      <td><strong>${s.itemName}</strong></td>
      <td>${s.siteName}</td>
      <td>
        ${s.onHand}
        ${s.onHand <= s.reorder ? '<span class="stock-low">Low</span>' : ''}
      </td>
      <td>${s.reorder}</td>
      <td>${formatDate(s.lastMovement)}</td>
    </tr>
  `).join('');
}

function filterStock() {
  const search = document.getElementById('stock-search')?.value.toLowerCase() || '';
  const siteId = document.getElementById('stock-site-filter')?.value || '';

  const filtered = AppData.stock.filter(s => {
    const matchesSearch = !search ||
      s.sku.toLowerCase().includes(search) ||
      s.itemName.toLowerCase().includes(search);
    const matchesSite = !siteId || s.siteId === siteId;
    return matchesSearch && matchesSite;
  });

  const tbody = document.querySelector('#stock-table tbody');
  if (tbody) {
    tbody.innerHTML = renderStockRows(filtered);
  }
}

// ============ MY INBOX ============
function renderMyInbox() {
  const pendingApprovals = AppData.purchaseOrders.filter(po => po.status === 'Pending Approval' || po.status === 'Open');

  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">📬</span>
        <div>
          <h1>My inbox</h1>
          <p class="page-subtitle">Your queue — overdue items float to the top.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="renderPage('my-inbox')">Refresh</button>
        <button class="btn btn-secondary" onclick="navigateTo('all-instances')">All instances</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value red">${pendingApprovals.length}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">0</div>
        <div class="stat-label">Overdue</div>
      </div>
      <div class="stat-item">
        <div class="stat-value green">${AppData.purchaseOrders.length}</div>
        <div class="stat-label">Purchase orders</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">0</div>
        <div class="stat-label">Invoices</div>
      </div>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" placeholder="Search...">
      <select class="filter-select">
        <option value="">All types</option>
        <option value="po">Purchase Order</option>
        <option value="grn">Goods Receipt</option>
        <option value="invoice">Invoice</option>
      </select>
      <button class="btn btn-primary">Search</button>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Vendor / detail</th>
            <th>Step</th>
            <th>Waiting</th>
            <th>Initiated by</th>
            <th>Started</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${pendingApprovals.map(po => `
            <tr>
              <td>
                <strong>${po.id}</strong><br>
                <span style="font-size: 12px; color: var(--gray-500)">Purchase order · Standard Approval</span>
              </td>
              <td>
                ${po.vendorName}<br>
                <span style="font-size: 12px; color: var(--gray-500)">₹${formatCurrency(po.total)}</span>
              </td>
              <td><span class="badge badge-pending">Purchase Manager</span></td>
              <td>⏱️ 2d</td>
              <td>System Admin</td>
              <td>${formatDate(po.date)}</td>
              <td>
                <button class="btn btn-primary btn-sm" onclick="viewPO('${po.id}')">Review</button>
              </td>
            </tr>
          `).join('')}
          ${pendingApprovals.length === 0 ? `
            <tr>
              <td colspan="7" class="empty-state">
                <div class="empty-state-icon">✓</div>
                <h3>All caught up!</h3>
                <p>No pending approvals in your inbox</p>
              </td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  `;
}

// ============ ALL INSTANCES ============
function renderAllInstances() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">⚙️</span>
        <div>
          <h1>All instances</h1>
          <p class="page-subtitle">Track every approval run — status, current step, who is assigned, and progress.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="renderPage('all-instances')">Refresh</button>
      </div>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" id="instances-search" placeholder="Search...">
      <select class="filter-select" id="instances-status-filter">
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="approved">Approved</option>
        <option value="stopped">Stopped</option>
      </select>
      <select class="filter-select" id="instances-type-filter">
        <option value="">All types</option>
        <option value="po">Purchase Order</option>
        <option value="grn">Goods Receipt</option>
      </select>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value">${AppData.purchaseOrders.length}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-item">
        <div class="stat-value green">${AppData.purchaseOrders.filter(p => p.status === 'Open').length}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${AppData.purchaseOrders.filter(p => p.status === 'Completed').length}</div>
        <div class="stat-label">Approved</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">0</div>
        <div class="stat-label">Stopped</div>
      </div>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      <table class="data-table" id="instances-table">
        <thead>
          <tr>
            <th>Instance</th>
            <th>Current step</th>
            <th>Waiting on</th>
            <th>Status</th>
            <th>Started</th>
            <th>Finished</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${renderInstanceRows(AppData.purchaseOrders)}
        </tbody>
      </table>
    </div>
  `;
}

function renderInstanceRows(orders) {
  return orders.map(po => `
    <tr data-status="${po.status === 'Completed' ? 'approved' : 'active'}" data-type="po">
      <td>
        <span class="badge badge-default">Purchase order</span> #${po.id.split('-').pop()}<br>
        <strong>${po.id}</strong><br>
        <span style="font-size: 12px; color: var(--gray-500)">${po.vendorName}</span>
      </td>
      <td>
        Finance<br>
        <div class="progress-bar" style="width: 80px; margin-top: 4px;">
          <div class="progress-fill" style="width: ${po.status === 'Completed' ? '100%' : '50%'}"></div>
          <div class="progress-empty" style="width: ${po.status === 'Completed' ? '0%' : '50%'}"></div>
        </div>
        <span class="progress-text">${po.status === 'Completed' ? '2/2' : '1/2'}</span>
      </td>
      <td>—</td>
      <td>
        <span class="badge ${po.status === 'Completed' ? 'badge-approved' : 'badge-inprogress'}">
          ${po.status === 'Completed' ? 'Approved' : 'In progress'}
        </span>
      </td>
      <td>${formatDate(po.date)}<br><span style="font-size: 11px; color: var(--gray-500)">by System Admin</span></td>
      <td>${po.status === 'Completed' ? formatDate(po.date) : '—'}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewPO('${po.id}')">👁️ View</button>
      </td>
    </tr>
  `).join('');
}

function setupInstancesHandlers() {
  document.getElementById('instances-search')?.addEventListener('input', filterInstances);
  document.getElementById('instances-status-filter')?.addEventListener('change', filterInstances);
  document.getElementById('instances-type-filter')?.addEventListener('change', filterInstances);
}

function filterInstances() {
  const search = document.getElementById('instances-search').value.toLowerCase();
  const statusFilter = document.getElementById('instances-status-filter').value;
  const typeFilter = document.getElementById('instances-type-filter').value;

  const filtered = AppData.purchaseOrders.filter(po => {
    const poStatus = po.status === 'Completed' ? 'approved' : 'active';
    const matchesSearch = !search ||
      po.id.toLowerCase().includes(search) ||
      po.vendorName.toLowerCase().includes(search);
    const matchesStatus = !statusFilter || poStatus === statusFilter;
    const matchesType = !typeFilter || typeFilter === 'po';
    return matchesSearch && matchesStatus && matchesType;
  });

  document.querySelector('#instances-table tbody').innerHTML = renderInstanceRows(filtered);
}

// ============ INVOICES ============
function renderInvoices() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">🧾</span>
        <div>
          <h1>Invoices</h1>
          <p class="page-subtitle">Create, match, and release vendor payments with confidence.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="renderPage('invoices')">Refresh</button>
        <button class="btn btn-primary" id="btn-new-invoice">+ New Invoice</button>
      </div>
    </div>

    <div class="invoice-hero" style="background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
      <div style="color: var(--primary); font-size: 11px; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">THREE-WAY MATCH</div>
      <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Pay only when all three agree</h2>
      <p style="color: var(--gray-500); font-size: 14px; margin-bottom: 20px;">Cross-check the purchase order, goods receipt, and invoice before releasing payment.</p>

      <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: var(--gray-100); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📋</div>
          <div>
            <div style="font-size: 12px; color: var(--gray-400);">01</div>
            <div style="font-weight: 600;">Ordered</div>
            <div style="font-size: 12px; color: var(--gray-500);">Purchase order</div>
            <div style="font-size: 11px; color: var(--gray-400);">What the vendor was asked to supply</div>
          </div>
        </div>
        <div style="color: var(--gray-300); font-size: 24px;">→</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: var(--gray-100); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📥</div>
          <div>
            <div style="font-size: 12px; color: var(--gray-400);">02</div>
            <div style="font-weight: 600;">Received</div>
            <div style="font-size: 12px; color: var(--gray-500);">Goods receipt</div>
            <div style="font-size: 11px; color: var(--gray-400);">What was actually delivered</div>
          </div>
        </div>
        <div style="color: var(--gray-300); font-size: 24px;">→</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: var(--gray-100); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🧾</div>
          <div>
            <div style="font-size: 12px; color: var(--gray-400);">03</div>
            <div style="font-weight: 600;">Billed</div>
            <div style="font-size: 12px; color: var(--gray-500);">Vendor invoice</div>
            <div style="font-size: 11px; color: var(--gray-400);">What the vendor is charging</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 16px; text-align: right; font-size: 12px; color: var(--gray-400);">
        Series <span style="font-family: monospace; background: var(--gray-100); padding: 2px 6px; border-radius: 4px;">INPM / FY / #####</span>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active">All</button>
      <button class="tab">Pending</button>
      <button class="tab">Paid</button>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" id="invoice-search" placeholder="Search invoice / vendor...">
      <select class="filter-select" id="invoice-fy-filter">
        ${getFinancialYearOptions()}
      </select>
      <select class="filter-select" id="invoice-status-filter">
        <option value="">Status</option>
        <option value="open">Open</option>
        <option value="paid">Paid</option>
      </select>
      <select class="filter-select" id="invoice-vendor-filter">
        <option value="">Vendor</option>
        ${AppData.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
      </select>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      ${(AppData.invoices && AppData.invoices.length > 0) ? `
      <table class="data-table" id="invoices-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Vendor</th>
            <th>PO</th>
            <th>Match</th>
            <th>Total</th>
            <th>Variance</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${renderInvoiceRows(AppData.invoices)}
        </tbody>
      </table>
      ` : `
      <div class="empty-state">
        <div class="empty-state-icon">🧾</div>
        <h3>No invoices yet</h3>
        <p>Invoices will appear here once you receive goods and process vendor bills.</p>
      </div>
      `}
    </div>
  `;
}

function renderInvoiceRows(invoices) {
  if (!invoices || invoices.length === 0) return '';
  return invoices.map(inv => `
    <tr>
      <td><strong>${inv.id}</strong></td>
      <td>${inv.vendorName}</td>
      <td>${inv.poId}</td>
      <td><span class="badge ${inv.matchStatus === 'Matched' ? 'badge-success' : 'badge-warning'}">${inv.matchStatus}</span></td>
      <td>₹${formatCurrency(inv.total)}</td>
      <td>${inv.variance}</td>
      <td><span class="badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}">${inv.status}</span></td>
      <td class="action-icons">
        <button class="action-icon" onclick="viewInvoice('${inv.id}')" title="View">👁️</button>
      </td>
    </tr>
  `).join('');
}

function setupInvoiceHandlers() {
  document.getElementById('btn-new-invoice')?.addEventListener('click', () => openInvoiceModal());
  document.getElementById('invoice-search')?.addEventListener('input', filterInvoices);
  document.getElementById('invoice-fy-filter')?.addEventListener('change', filterInvoices);
  document.getElementById('invoice-status-filter')?.addEventListener('change', filterInvoices);
  document.getElementById('invoice-vendor-filter')?.addEventListener('change', filterInvoices);
}

function filterInvoices() {
  const search = document.getElementById('invoice-search').value.toLowerCase();
  const fy = document.getElementById('invoice-fy-filter').value;
  const status = document.getElementById('invoice-status-filter').value;
  const vendorId = document.getElementById('invoice-vendor-filter').value;

  const filtered = (AppData.invoices || []).filter(inv => {
    const matchesSearch = !search ||
      inv.id.toLowerCase().includes(search) ||
      inv.vendorName.toLowerCase().includes(search);
    const matchesFY = !fy || getFinancialYear(inv.date) === fy;
    const matchesStatus = !status || inv.status.toLowerCase() === status;
    const matchesVendor = !vendorId || inv.vendorId === vendorId;
    return matchesSearch && matchesFY && matchesStatus && matchesVendor;
  });

  const tbody = document.querySelector('#invoices-table tbody');
  if (tbody) {
    tbody.innerHTML = renderInvoiceRows(filtered);
  }
}

function openInvoiceModal() {
  const poOptions = AppData.purchaseOrders
    .filter(po => po.status !== 'Open')
    .map(po => `<option value="${po.id}">${po.id} - ${po.vendorName}</option>`)
    .join('');

  const nextInvoiceNum = generateInvoiceNumber();

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Create vendor invoice</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div style="background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: var(--radius); padding: 12px 16px; margin-bottom: 20px; display: flex; gap: 12px; align-items: start;">
        <span style="color: #0284c7; font-size: 18px;">ℹ️</span>
        <p style="font-size: 13px; color: #0369a1; margin: 0;">
          Invoice number is auto-generated as <strong>${nextInvoiceNum}</strong> (resets each financial year).
        </p>
      </div>

      <form id="invoice-form">
        <div class="form-group">
          <label>Purchase order *</label>
          <select id="invoice-po" required>
            <option value="">Select purchase order...</option>
            ${poOptions}
          </select>
        </div>

        <div class="form-group">
          <label>Vendor bill number *</label>
          <input type="text" id="invoice-vendor-bill" placeholder="Vendor bill number *" required>
          <p style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">The vendor's own tax invoice / bill number (not our system ID)</p>
        </div>

        <div class="form-group">
          <label>Vendor bill date</label>
          <input type="date" id="invoice-date" value="${new Date().toISOString().split('T')[0]}">
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea id="invoice-notes" rows="3" placeholder="Notes"></textarea>
        </div>

        <p style="font-size: 12px; color: var(--gray-500); margin-top: 16px;">
          Lines default to the full PO. Run match after create to compare against accepted GRN qty.
        </p>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveInvoice()">Create</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function generateInvoiceNumber() {
  const now = new Date();
  const fy = now.getMonth() >= 3 ? `${now.getFullYear() % 100}-${(now.getFullYear() + 1) % 100}` : `${(now.getFullYear() - 1) % 100}-${now.getFullYear() % 100}`;
  const count = (AppData.invoices?.length || 0) + 1;
  return `INPM/${fy}/${String(count).padStart(5, '0')}`;
}

function saveInvoice() {
  const poId = document.getElementById('invoice-po').value;
  const vendorBillNo = document.getElementById('invoice-vendor-bill').value;
  const billDate = document.getElementById('invoice-date').value;
  const notes = document.getElementById('invoice-notes').value;

  if (!poId || !vendorBillNo) {
    alert('Please select a Purchase Order and enter the vendor bill number');
    return;
  }

  const po = AppData.purchaseOrders.find(p => p.id === poId);
  if (!po) return;

  if (!AppData.invoices) {
    AppData.invoices = [];
  }

  const newInvoice = {
    id: generateInvoiceNumber(),
    poId,
    vendorId: po.vendorId,
    vendorName: po.vendorName,
    vendorBillNo,
    billDate,
    notes,
    total: po.total,
    variance: 0,
    matchStatus: 'Pending',
    status: 'Open'
  };

  AppData.invoices.unshift(newInvoice);
  closeModal();
  renderPage('invoices');
}

function viewInvoice(invoiceId) {
  const inv = (AppData.invoices || []).find(i => i.id === invoiceId);
  if (!inv) return;

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Invoice: ${inv.id}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group">
          <label>Purchase Order</label>
          <p><strong>${inv.poId}</strong></p>
        </div>
        <div class="form-group">
          <label>Vendor</label>
          <p><strong>${inv.vendorName}</strong></p>
        </div>
        <div class="form-group">
          <label>Vendor Bill No.</label>
          <p>${inv.vendorBillNo}</p>
        </div>
        <div class="form-group">
          <label>Bill Date</label>
          <p>${formatDate(inv.billDate)}</p>
        </div>
        <div class="form-group">
          <label>Total</label>
          <p><strong>₹${formatCurrency(inv.total)}</strong></p>
        </div>
        <div class="form-group">
          <label>Status</label>
          <p><span class="badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}">${inv.status}</span></p>
        </div>
        <div class="form-group full-width">
          <label>Notes</label>
          <p>${inv.notes || '-'}</p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

// ============ DEBIT NOTES ============
function renderDebitNotes() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">⚠️</span>
        <div>
          <h1>Debit notes</h1>
          <p class="page-subtitle">Recover value from rejected, damaged, or short-shipped goods.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="renderPage('debit-notes')">Refresh</button>
        <button class="btn btn-primary" id="btn-new-debit-note">+ New Debit Note</button>
      </div>
    </div>

    <div class="debit-hero" style="background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
      <div style="color: var(--primary); font-size: 11px; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">VENDOR RECOVERY</div>
      <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Claim credits for supply issues</h2>
      <p style="color: var(--gray-500); font-size: 14px; margin-bottom: 20px;">Create debit notes against GRNs when goods are rejected, damaged, or quantities don't match.</p>

      <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #fee2e2; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">❌</div>
          <div>
            <div style="font-weight: 600;">Rejected</div>
            <div style="font-size: 12px; color: var(--gray-500);">Wrong / defective items</div>
            <div style="font-size: 11px; color: var(--gray-400);">Returned to vendor</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #fef3c7; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">⚠️</div>
          <div>
            <div style="font-weight: 600;">Damaged</div>
            <div style="font-size: 12px; color: var(--gray-500);">Goods damaged in transit</div>
            <div style="font-size: 11px; color: var(--gray-400);">Quarantined / scrapped</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #dbeafe; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📉</div>
          <div>
            <div style="font-weight: 600;">Short-shipped</div>
            <div style="font-size: 12px; color: var(--gray-500);">Quantity mismatch</div>
            <div style="font-size: 11px; color: var(--gray-400);">Billed but not received</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 16px; text-align: right; font-size: 12px; color: var(--gray-400);">
        Series <span style="font-family: monospace; background: var(--gray-100); padding: 2px 6px; border-radius: 4px;">DN / FY / #####</span>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active">All</button>
      <button class="tab">Draft</button>
      <button class="tab">Sent</button>
      <button class="tab">Settled</button>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" id="debit-note-search" placeholder="Search debit note / vendor...">
      <select class="filter-select" id="debit-note-fy-filter">
        ${getFinancialYearOptions()}
      </select>
      <select class="filter-select" id="debit-note-status-filter">
        <option value="">Status</option>
        <option value="draft">Draft</option>
        <option value="sent">Sent</option>
        <option value="settled">Settled</option>
      </select>
      <select class="filter-select" id="debit-note-vendor-filter">
        <option value="">Vendor</option>
        ${AppData.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
      </select>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      ${(AppData.debitNotes && AppData.debitNotes.length > 0) ? `
      <table class="data-table" id="debit-notes-table">
        <thead>
          <tr>
            <th>Debit Note #</th>
            <th>Vendor</th>
            <th>GRN</th>
            <th>Reason</th>
            <th>Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${renderDebitNoteRows(AppData.debitNotes)}
        </tbody>
      </table>
      ` : `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>No debit notes</h3>
        <p>Create debit notes when you need to return goods or claim vendor credits.</p>
      </div>
      `}
    </div>
  `;
}

function renderDebitNoteRows(debitNotes) {
  if (!debitNotes || debitNotes.length === 0) return '';
  return debitNotes.map(dn => `
    <tr>
      <td><strong>${dn.id}</strong></td>
      <td>${dn.vendorName}</td>
      <td>${dn.grnId}</td>
      <td><span class="badge ${dn.reason === 'Rejected' ? 'badge-danger' : dn.reason === 'Damaged' ? 'badge-warning' : 'badge-default'}">${dn.reason}</span></td>
      <td>₹${formatCurrency(dn.amount)}</td>
      <td><span class="badge ${dn.status === 'Settled' ? 'badge-success' : dn.status === 'Sent' ? 'badge-inprogress' : 'badge-default'}">${dn.status}</span></td>
      <td class="action-icons">
        <button class="action-icon" onclick="viewDebitNote('${dn.id}')" title="View">👁️</button>
      </td>
    </tr>
  `).join('');
}

function setupDebitNoteHandlers() {
  document.getElementById('btn-new-debit-note')?.addEventListener('click', () => openDebitNoteModal());
  document.getElementById('debit-note-search')?.addEventListener('input', filterDebitNotes);
  document.getElementById('debit-note-fy-filter')?.addEventListener('change', filterDebitNotes);
  document.getElementById('debit-note-status-filter')?.addEventListener('change', filterDebitNotes);
  document.getElementById('debit-note-vendor-filter')?.addEventListener('change', filterDebitNotes);
}

function filterDebitNotes() {
  const search = document.getElementById('debit-note-search').value.toLowerCase();
  const fy = document.getElementById('debit-note-fy-filter').value;
  const status = document.getElementById('debit-note-status-filter').value;
  const vendorId = document.getElementById('debit-note-vendor-filter').value;

  const filtered = (AppData.debitNotes || []).filter(dn => {
    const matchesSearch = !search ||
      dn.id.toLowerCase().includes(search) ||
      dn.vendorName.toLowerCase().includes(search);
    const matchesFY = !fy || getFinancialYear(dn.date) === fy;
    const matchesStatus = !status || dn.status.toLowerCase() === status;
    const matchesVendor = !vendorId || dn.vendorId === vendorId;
    return matchesSearch && matchesFY && matchesStatus && matchesVendor;
  });

  const tbody = document.querySelector('#debit-notes-table tbody');
  if (tbody) {
    tbody.innerHTML = renderDebitNoteRows(filtered);
  }
}

function openDebitNoteModal() {
  const grnOptions = AppData.goodsReceipts
    .map(grn => `<option value="${grn.id}">${grn.id} - ${grn.vendorName} (${grn.poId})</option>`)
    .join('');

  const nextDebitNoteNum = generateDebitNoteNumber();

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Create debit note</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: var(--radius); padding: 12px 16px; margin-bottom: 20px; display: flex; gap: 12px; align-items: start;">
        <span style="color: #d97706; font-size: 18px;">ℹ️</span>
        <p style="font-size: 13px; color: #92400e; margin: 0;">
          Debit note number is auto-generated as <strong>${nextDebitNoteNum}</strong> (resets each financial year).
        </p>
      </div>

      <form id="debit-note-form">
        <div class="form-group">
          <label>Goods receipt (GRN) *</label>
          <select id="debit-note-grn" required>
            <option value="">Select GRN...</option>
            ${grnOptions}
          </select>
          <p style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">The GRN against which this debit note is raised</p>
        </div>

        <div class="form-group">
          <label>Reason *</label>
          <select id="debit-note-reason" required>
            <option value="">Select reason...</option>
            <option value="Rejected">Rejected - Wrong / defective items</option>
            <option value="Damaged">Damaged - Goods damaged in transit</option>
            <option value="Short-shipped">Short-shipped - Quantity mismatch</option>
            <option value="Quality Issue">Quality Issue - Below specifications</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label>Debit amount (₹) *</label>
          <input type="number" id="debit-note-amount" placeholder="0" min="0" required>
          <p style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">Amount to be recovered from vendor</p>
        </div>

        <div class="form-group">
          <label>Debit note date</label>
          <input type="date" id="debit-note-date" value="${new Date().toISOString().split('T')[0]}">
        </div>

        <div class="form-group">
          <label>Description / Notes</label>
          <textarea id="debit-note-notes" rows="3" placeholder="Describe the issue and items affected..."></textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveDebitNote()">Create</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function generateDebitNoteNumber() {
  const now = new Date();
  const fy = now.getMonth() >= 3 ? `${now.getFullYear() % 100}-${(now.getFullYear() + 1) % 100}` : `${(now.getFullYear() - 1) % 100}-${now.getFullYear() % 100}`;
  const count = (AppData.debitNotes?.length || 0) + 1;
  return `DN/${fy}/${String(count).padStart(5, '0')}`;
}

function saveDebitNote() {
  const grnId = document.getElementById('debit-note-grn').value;
  const reason = document.getElementById('debit-note-reason').value;
  const amount = parseFloat(document.getElementById('debit-note-amount').value) || 0;
  const noteDate = document.getElementById('debit-note-date').value;
  const notes = document.getElementById('debit-note-notes').value;

  if (!grnId || !reason || amount <= 0) {
    alert('Please select a GRN, reason, and enter a valid amount');
    return;
  }

  const grn = AppData.goodsReceipts.find(g => g.id === grnId);
  if (!grn) return;

  if (!AppData.debitNotes) {
    AppData.debitNotes = [];
  }

  const newDebitNote = {
    id: generateDebitNoteNumber(),
    grnId,
    poId: grn.poId,
    vendorId: grn.vendorId,
    vendorName: grn.vendorName,
    reason,
    amount,
    noteDate,
    notes,
    status: 'Draft'
  };

  AppData.debitNotes.unshift(newDebitNote);
  closeModal();
  renderPage('debit-notes');
}

function viewDebitNote(debitNoteId) {
  const dn = (AppData.debitNotes || []).find(d => d.id === debitNoteId);
  if (!dn) return;

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Debit Note: ${dn.id}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group">
          <label>GRN</label>
          <p><strong>${dn.grnId}</strong></p>
        </div>
        <div class="form-group">
          <label>PO</label>
          <p><strong>${dn.poId}</strong></p>
        </div>
        <div class="form-group">
          <label>Vendor</label>
          <p><strong>${dn.vendorName}</strong></p>
        </div>
        <div class="form-group">
          <label>Reason</label>
          <p><span class="badge ${dn.reason === 'Rejected' ? 'badge-danger' : dn.reason === 'Damaged' ? 'badge-warning' : 'badge-default'}">${dn.reason}</span></p>
        </div>
        <div class="form-group">
          <label>Amount</label>
          <p><strong>₹${formatCurrency(dn.amount)}</strong></p>
        </div>
        <div class="form-group">
          <label>Status</label>
          <p><span class="badge ${dn.status === 'Settled' ? 'badge-success' : dn.status === 'Sent' ? 'badge-inprogress' : 'badge-default'}">${dn.status}</span></p>
        </div>
        <div class="form-group">
          <label>Date</label>
          <p>${formatDate(dn.noteDate)}</p>
        </div>
        <div class="form-group full-width">
          <label>Notes</label>
          <p>${dn.notes || '-'}</p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      ${dn.status === 'Draft' ? `<button class="btn btn-primary" onclick="sendDebitNote('${dn.id}')">Send to Vendor</button>` : ''}
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function sendDebitNote(debitNoteId) {
  const dn = (AppData.debitNotes || []).find(d => d.id === debitNoteId);
  if (dn) {
    dn.status = 'Sent';
    closeModal();
    renderPage('debit-notes');
  }
}

// ============ COST CENTRES ============
function renderCostCentres() {
  const costCentres = [
    { id: 'CC-001', code: 'PROJ-A', name: 'Project Alpha', type: 'Project', status: 'active' },
    { id: 'CC-002', code: 'PROJ-B', name: 'Project Beta', type: 'Project', status: 'active' },
    { id: 'CC-003', code: 'MAINT', name: 'Maintenance', type: 'Department', status: 'active' },
    { id: 'CC-004', code: 'ADMIN', name: 'Administration', type: 'Department', status: 'active' }
  ];

  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">💰</span>
        <div>
          <h1>Cost centres</h1>
          <p class="page-subtitle">Track expenses by project, department, or cost allocation.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="renderPage('cost-centres')">Refresh</button>
        <button class="btn btn-primary">+ New Cost Centre</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active">Active</button>
      <button class="tab">Archived</button>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" placeholder="Search by code or name...">
      <select class="filter-select">
        <option value="">All types</option>
        <option value="project">Project</option>
        <option value="department">Department</option>
      </select>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${costCentres.map(cc => `
            <tr>
              <td>${cc.code}</td>
              <td><strong>${cc.name}</strong></td>
              <td>${cc.type}</td>
              <td><span class="badge badge-success">${cc.status}</span></td>
              <td class="action-icons">
                <button class="action-icon" title="Edit">✏️</button>
                <button class="action-icon delete" title="Archive">📁</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============ REPORTS ============
function renderReports() {
  const reports = [
    { name: 'Purchase Order Summary', description: 'Overview of all POs by status, vendor, and value', icon: '📝' },
    { name: 'GRN Report', description: 'Goods received against purchase orders', icon: '📥' },
    { name: 'Stock Valuation', description: 'Current inventory value by site and category', icon: '📦' },
    { name: 'Vendor Performance', description: 'Delivery timelines and rejection rates by vendor', icon: '🏢' },
    { name: 'Pending Approvals', description: 'All items waiting for approval action', icon: '⏳' },
    { name: 'Cost Centre Analysis', description: 'Spending breakdown by cost centre', icon: '💰' }
  ];

  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">📈</span>
        <div>
          <h1>Reports</h1>
          <p class="page-subtitle">Generate insights and export data for analysis.</p>
        </div>
      </div>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" placeholder="Search reports...">
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
      ${reports.map(report => `
        <div class="card" style="cursor: pointer;" onclick="alert('Report: ${report.name}\\n\\nThis would generate the report in a real implementation.')">
          <div class="card-body" style="display: flex; gap: 16px; align-items: center;">
            <div style="font-size: 32px;">${report.icon}</div>
            <div>
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${report.name}</h3>
              <p style="font-size: 12px; color: var(--gray-500); margin: 0;">${report.description}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============ NOTIFICATIONS ============
function renderNotifications() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">🔔</span>
        <div>
          <h1>Notifications</h1>
          <p class="page-subtitle">System alerts and activity updates.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary">Mark all read</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active">All</button>
      <button class="tab">Unread</button>
    </div>

    <div class="card">
      <div class="card-body">
        <div style="padding: 16px; border-bottom: 1px solid var(--gray-100); display: flex; gap: 12px;">
          <span style="font-size: 20px;">📝</span>
          <div style="flex: 1;">
            <strong>New PO Created</strong>
            <p style="color: var(--gray-500); font-size: 13px; margin: 4px 0;">PO-2026-00003 has been created and is pending approval.</p>
            <span style="font-size: 12px; color: var(--gray-400);">2 hours ago</span>
          </div>
        </div>
        <div style="padding: 16px; border-bottom: 1px solid var(--gray-100); display: flex; gap: 12px;">
          <span style="font-size: 20px;">📥</span>
          <div style="flex: 1;">
            <strong>Goods Received</strong>
            <p style="color: var(--gray-500); font-size: 13px; margin: 4px 0;">GRN-2026-00002 posted against PO-2026-00002.</p>
            <span style="font-size: 12px; color: var(--gray-400);">1 day ago</span>
          </div>
        </div>
        <div style="padding: 16px; display: flex; gap: 12px;">
          <span style="font-size: 20px;">⚠️</span>
          <div style="flex: 1;">
            <strong>Low Stock Alert</strong>
            <p style="color: var(--gray-500); font-size: 13px; margin: 4px 0;">Oil Filter stock is below reorder level at Site B.</p>
            <span style="font-size: 12px; color: var(--gray-400);">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============ WORKFLOW SETUP ============
function renderWorkflowSetup() {
  // Initialize workflows data if not exists
  if (!AppData.workflows) {
    AppData.workflows = [
      {
        id: 'WF-001',
        code: 'PO-STD',
        name: 'Standard Purchase Order Approval',
        entityType: 'Purchase order',
        status: 'Active',
        steps: [
          {
            id: 1,
            name: 'Purchase Manager',
            needsApproval: 1,
            assignees: [
              { name: 'System Admin', email: 'admin@syncflow.local', status: 'Active' },
              { name: 'Priya Purchase', email: 'purchase@syncflow.local', status: 'Active' }
            ]
          },
          {
            id: 2,
            name: 'Finance',
            needsApproval: 1,
            assignees: [
              { name: 'System Admin', email: 'admin@syncflow.local', status: 'Active' },
              { name: 'Fiona Finance', email: 'finance@syncflow.local', status: 'Active' }
            ]
          }
        ]
      }
    ];
    AppData.selectedWorkflow = 0;
  }

  const workflows = AppData.workflows;
  const selectedIdx = AppData.selectedWorkflow || 0;
  const selectedWf = workflows[selectedIdx];
  const totalSteps = workflows.reduce((sum, wf) => sum + wf.steps.length, 0);
  const totalAssignees = workflows.reduce((sum, wf) => sum + wf.steps.reduce((s, step) => s + step.assignees.length, 0), 0);

  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">⚡</span>
        <div>
          <h1>Workflow setup</h1>
          <p class="page-subtitle">Define approval paths, SLA hours per step, and who must sign off — then track them under Approvals.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="renderPage('workflow-setup')">↻ Refresh</button>
        <button class="btn btn-primary" id="btn-new-workflow">+ New workflow</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value">${workflows.length}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-item">
        <div class="stat-value green">${workflows.filter(w => w.status === 'Active').length}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${totalSteps}</div>
        <div class="stat-label">Steps</div>
      </div>
      <div class="stat-item">
        <div class="stat-value" style="color: var(--primary);">${totalAssignees}</div>
        <div class="stat-label">Assignees</div>
      </div>
    </div>

    ${getKeyboardHints()}

    <div style="display: grid; grid-template-columns: 320px 1fr; gap: 24px;">
      <!-- Workflows List -->
      <div class="card">
        <div class="card-body" style="padding: 12px;">
          <input type="text" class="filter-input" id="workflow-search" placeholder="Search workflows..." style="margin-bottom: 12px;">
          <div id="workflow-list">
            ${workflows.map((wf, idx) => `
              <div class="workflow-list-item ${idx === selectedIdx ? 'selected' : ''}" onclick="selectWorkflow(${idx})" style="padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; border: 2px solid ${idx === selectedIdx ? 'var(--primary)' : 'var(--gray-200)'}; background: ${idx === selectedIdx ? 'var(--primary-light)' : 'var(--white)'};">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                      <strong style="font-size: 14px;">${wf.name.length > 25 ? wf.name.substring(0, 25) + '...' : wf.name}</strong>
                      <span class="badge ${wf.status === 'Active' ? 'badge-success' : 'badge-default'}" style="font-size: 10px;">${wf.status}</span>
                    </div>
                    <div style="font-size: 12px; color: var(--gray-500);">${wf.code} · ${wf.entityType}</div>
                    <div style="font-size: 12px; color: var(--gray-400);">${wf.steps.length} step${wf.steps.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Workflow Details -->
      <div class="card">
        <div class="card-body">
          ${selectedWf ? `
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
              <div>
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                  <h2 style="font-size: 20px; font-weight: 600; margin: 0;">${selectedWf.name}</h2>
                  <span class="badge badge-default">${selectedWf.code}</span>
                  <span class="badge badge-default">${selectedWf.entityType}</span>
                </div>
                <div style="margin-bottom: 8px;">
                  <span class="badge ${selectedWf.status === 'Active' ? 'badge-success' : 'badge-default'}">Active for entity</span>
                </div>
                <p style="font-size: 13px; color: var(--gray-500);">Only one active workflow runs per entity type. Assign people to each step below.</p>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary btn-sm" onclick="editWorkflowSteps('${selectedWf.id}')">
                  ✏️ Edit steps
                </button>
                <button class="btn btn-primary btn-sm" onclick="addAssigneeToWorkflow('${selectedWf.id}')">
                  👤 Add assignee
                </button>
              </div>
            </div>

            <!-- Approval Path -->
            <div style="margin-bottom: 24px;">
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.5px; color: var(--gray-500); margin-bottom: 12px;">APPROVAL PATH</div>
              <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                ${selectedWf.steps.map((step, idx) => `
                  <div style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 8px;">
                    <span style="font-size: 16px;">👥</span>
                    <span style="font-weight: 500;">${idx + 1}. ${step.name}</span>
                  </div>
                  ${idx < selectedWf.steps.length - 1 ? '<span style="color: var(--gray-400);">→</span>' : ''}
                `).join('')}
              </div>
            </div>

            <!-- Assignees by Step -->
            <div>
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Assignees by step</h3>
              ${selectedWf.steps.map((step, stepIdx) => `
                <div style="border: 1px solid var(--gray-200); border-radius: 8px; margin-bottom: 16px; overflow: hidden;">
                  <div style="background: var(--gray-50); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 600;">Step ${step.id}: ${step.name}</div>
                      <div style="font-size: 12px; color: var(--gray-500);">Needs ${step.needsApproval} approval · ${step.assignees.length} active assignee${step.assignees.length !== 1 ? 's' : ''}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="addAssigneeToStep('${selectedWf.id}', ${stepIdx})">👤+</button>
                  </div>
                  <table class="data-table" style="margin: 0;">
                    <thead>
                      <tr>
                        <th>Approver</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      ${step.assignees.map((assignee, aIdx) => `
                        <tr>
                          <td>
                            <div><strong>${assignee.name}</strong></div>
                            <div style="font-size: 12px; color: var(--gray-500);">${assignee.email}</div>
                          </td>
                          <td><span class="badge badge-success">${assignee.status}</span></td>
                          <td style="text-align: right;">
                            <button class="btn btn-sm" style="color: var(--primary); background: none; border: none; cursor: pointer;" onclick="toggleAssigneeStatus('${selectedWf.id}', ${stepIdx}, ${aIdx})">
                              ${assignee.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon">⚡</div>
              <h3>No workflow selected</h3>
              <p>Select a workflow from the list or create a new one.</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function selectWorkflow(idx) {
  AppData.selectedWorkflow = idx;
  renderPage('workflow-setup');
}

function setupWorkflowHandlers() {
  document.getElementById('btn-new-workflow')?.addEventListener('click', () => openNewWorkflowModal());
  document.getElementById('workflow-search')?.addEventListener('input', filterWorkflows);
}

function filterWorkflows() {
  const search = document.getElementById('workflow-search').value.toLowerCase();
  const items = document.querySelectorAll('.workflow-list-item');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(search) ? 'block' : 'none';
  });
}

function openNewWorkflowModal() {
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Create new workflow</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="workflow-form">
        <div class="form-group">
          <label>Workflow name *</label>
          <input type="text" id="workflow-name" placeholder="e.g., Standard Purchase Order Approval" required>
        </div>

        <div class="form-group">
          <label>Code *</label>
          <input type="text" id="workflow-code" placeholder="e.g., PO-STD" required>
          <p style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">Short identifier for this workflow</p>
        </div>

        <div class="form-group">
          <label>Entity type *</label>
          <select id="workflow-entity" required>
            <option value="">Select entity type...</option>
            <option value="Purchase order">Purchase order</option>
            <option value="Goods receipt">Goods receipt</option>
            <option value="Invoice">Invoice</option>
            <option value="Debit note">Debit note</option>
          </select>
        </div>

        <div class="form-group">
          <label>Initial step name *</label>
          <input type="text" id="workflow-step1" placeholder="e.g., Purchase Manager" required>
          <p style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">You can add more steps after creating the workflow</p>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewWorkflow()">Create workflow</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function saveNewWorkflow() {
  const name = document.getElementById('workflow-name').value;
  const code = document.getElementById('workflow-code').value;
  const entityType = document.getElementById('workflow-entity').value;
  const step1Name = document.getElementById('workflow-step1').value;

  if (!name || !code || !entityType || !step1Name) {
    alert('Please fill in all required fields');
    return;
  }

  const newWorkflow = {
    id: 'WF-' + String(AppData.workflows.length + 1).padStart(3, '0'),
    code,
    name,
    entityType,
    status: 'Draft',
    steps: [
      {
        id: 1,
        name: step1Name,
        needsApproval: 1,
        assignees: []
      }
    ]
  };

  AppData.workflows.push(newWorkflow);
  AppData.selectedWorkflow = AppData.workflows.length - 1;
  closeModal();
  renderPage('workflow-setup');
}

function editWorkflowSteps(workflowId) {
  const wf = AppData.workflows.find(w => w.id === workflowId);
  if (!wf) return;

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Edit steps: ${wf.name}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div id="steps-list">
        ${wf.steps.map((step, idx) => `
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px; padding: 12px; background: var(--gray-50); border-radius: 8px;">
            <span style="font-weight: 600; color: var(--gray-400);">${idx + 1}.</span>
            <input type="text" class="step-name-input" value="${step.name}" style="flex: 1;" data-step-idx="${idx}">
            ${wf.steps.length > 1 ? `<button class="btn btn-sm" style="color: var(--danger);" onclick="removeWorkflowStep('${workflowId}', ${idx})">🗑️</button>` : ''}
          </div>
        `).join('')}
      </div>
      <button class="btn btn-secondary btn-sm" onclick="addWorkflowStep('${workflowId}')" style="margin-top: 8px;">+ Add step</button>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveWorkflowSteps('${workflowId}')">Save changes</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function addWorkflowStep(workflowId) {
  const wf = AppData.workflows.find(w => w.id === workflowId);
  if (!wf) return;

  wf.steps.push({
    id: wf.steps.length + 1,
    name: 'New Step',
    needsApproval: 1,
    assignees: []
  });

  editWorkflowSteps(workflowId);
}

function removeWorkflowStep(workflowId, stepIdx) {
  const wf = AppData.workflows.find(w => w.id === workflowId);
  if (!wf || wf.steps.length <= 1) return;

  wf.steps.splice(stepIdx, 1);
  wf.steps.forEach((step, idx) => step.id = idx + 1);

  editWorkflowSteps(workflowId);
}

function saveWorkflowSteps(workflowId) {
  const wf = AppData.workflows.find(w => w.id === workflowId);
  if (!wf) return;

  const inputs = document.querySelectorAll('.step-name-input');
  inputs.forEach(input => {
    const idx = parseInt(input.dataset.stepIdx);
    wf.steps[idx].name = input.value;
  });

  closeModal();
  renderPage('workflow-setup');
}

function addAssigneeToStep(workflowId, stepIdx) {
  const wf = AppData.workflows.find(w => w.id === workflowId);
  if (!wf) return;
  const step = wf.steps[stepIdx];

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Add assignee to: ${step.name}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="assignee-form">
        <div class="form-group">
          <label>Select user *</label>
          <select id="assignee-user" required>
            <option value="">Select user...</option>
            <option value="System Admin|admin@syncflow.local">System Admin (admin@syncflow.local)</option>
            <option value="Priya Purchase|purchase@syncflow.local">Priya Purchase (purchase@syncflow.local)</option>
            <option value="Fiona Finance|finance@syncflow.local">Fiona Finance (finance@syncflow.local)</option>
            <option value="Sam Store|store@syncflow.local">Sam Store (store@syncflow.local)</option>
            <option value="Evan Exec|executive@syncflow.local">Evan Exec (executive@syncflow.local)</option>
          </select>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveAssignee('${workflowId}', ${stepIdx})">Add assignee</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function addAssigneeToWorkflow(workflowId) {
  addAssigneeToStep(workflowId, 0);
}

function saveAssignee(workflowId, stepIdx) {
  const userVal = document.getElementById('assignee-user').value;
  if (!userVal) {
    alert('Please select a user');
    return;
  }

  const [name, email] = userVal.split('|');
  const wf = AppData.workflows.find(w => w.id === workflowId);
  if (!wf) return;

  const step = wf.steps[stepIdx];
  if (step.assignees.some(a => a.email === email)) {
    alert('This user is already assigned to this step');
    return;
  }

  step.assignees.push({ name, email, status: 'Active' });
  closeModal();
  renderPage('workflow-setup');
}

function toggleAssigneeStatus(workflowId, stepIdx, assigneeIdx) {
  const wf = AppData.workflows.find(w => w.id === workflowId);
  if (!wf) return;

  const assignee = wf.steps[stepIdx].assignees[assigneeIdx];
  assignee.status = assignee.status === 'Active' ? 'Inactive' : 'Active';
  renderPage('workflow-setup');
}

// ============ AUDIT LOG ============
function renderAuditLog() {
  const logs = [
    { time: '15:10:23', user: 'System Admin', action: 'Created', target: 'PO-2026-00003', module: 'Purchase Orders' },
    { time: '14:45:12', user: 'System Admin', action: 'Posted', target: 'GRN-2026-00002', module: 'Goods Receipt' },
    { time: '14:30:05', user: 'System Admin', action: 'Updated', target: 'Acme Auto Parts', module: 'Vendors' },
    { time: '11:22:18', user: 'System Admin', action: 'Login', target: 'Session started', module: 'Auth' },
    { time: '10:15:33', user: 'System Admin', action: 'Created', target: 'PO-2026-00002', module: 'Purchase Orders' },
  ];

  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">📋</span>
        <div>
          <h1>Audit log</h1>
          <p class="page-subtitle">Track all system activities and changes.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary">Export</button>
        <button class="btn btn-secondary" onclick="renderPage('audit-log')">Refresh</button>
      </div>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" placeholder="Search actions...">
      <select class="filter-select">
        <option value="">All modules</option>
        <option value="po">Purchase Orders</option>
        <option value="grn">Goods Receipt</option>
        <option value="vendors">Vendors</option>
        <option value="auth">Auth</option>
      </select>
      <select class="filter-select">
        <option value="">All users</option>
        <option value="admin">System Admin</option>
      </select>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Target</th>
            <th>Module</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(log => `
            <tr>
              <td style="font-family: monospace; font-size: 12px;">${log.time}</td>
              <td>${log.user}</td>
              <td><span class="badge badge-default">${log.action}</span></td>
              <td><strong>${log.target}</strong></td>
              <td>${log.module}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============ USERS ============
function renderUsers() {
  const users = [
    { name: 'Fiona Finance', email: 'finance@pms.local', role: 'Finance', extra: '—', status: 'active' },
    { name: 'Sam Store', email: 'store@pms.local', role: 'Store Keeper', extra: '—', status: 'active' },
    { name: 'Evan Exec', email: 'executive@pms.local', role: 'Purchase Executive', extra: '—', status: 'active' },
    { name: 'Priya Purchase', email: 'purchase@pms.local', role: 'Purchase Manager', extra: '—', status: 'active' },
    { name: 'Super User', email: 'super@pms.local', role: 'Super Admin', extra: 'SUPER', status: 'active', isSuper: true },
    { name: 'System Admin', email: 'admin@pms.local', role: 'Administrator', extra: '—', status: 'active' }
  ];

  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">👥</span>
        <div>
          <h1>Users</h1>
          <p class="page-subtitle">Primary role + additional roles + direct permission grants (unioned at login).</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="navigateTo('roles')">Role matrix</button>
        <button class="btn btn-primary">+ New user</button>
      </div>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Primary role</th>
            <th>Extra</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>
                <strong>${user.name}</strong>
                ${user.isSuper ? '<span class="badge badge-danger" style="margin-left: 8px; font-size: 10px;">SUPER</span>' : ''}
              </td>
              <td>${user.email}</td>
              <td>${user.role}</td>
              <td>${user.extra}</td>
              <td><span class="badge badge-success">${user.status}</span></td>
              <td class="action-icons">
                <button class="action-icon" title="Edit">✏️</button>
                <button class="action-icon" title="Access" style="color: var(--primary);">Access</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ============ ROLES ============
function renderRoles() {
  const roles = [
    { name: 'Super Admin', code: 'super_admin', level: 'L100', type: 'System', permissions: 46 },
    { name: 'Administrator', code: 'admin', level: 'L90', type: 'System', permissions: 46 },
    { name: 'Purchase Manager', code: 'purchase_manager', level: 'L50', type: 'System', permissions: 36 },
    { name: 'Finance', code: 'finance', level: 'L40', type: 'System', permissions: 17 },
    { name: 'Purchase Executive', code: 'purchase_executive', level: 'L30', type: 'System', permissions: 16 },
    { name: 'Store Keeper', code: 'store_keeper', level: 'L30', type: 'System', permissions: 10 },
    { name: 'Viewer', code: 'viewer', level: 'L10', type: 'System', permissions: 11 },
    { name: 'Test Role', code: 'test_role', level: 'L20', type: 'Custom', permissions: 0 }
  ];

  const modules = [
    { name: 'Identity', count: '3/3' },
    { name: 'Inventory', count: '3/3' },
    { name: 'Platform', count: '3/3' },
    { name: 'Procurement', count: '27/27' },
    { name: 'Reports', count: '4/4' },
    { name: 'Workflow', count: '6/6' }
  ];

  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">🔐</span>
        <div>
          <h1>Roles</h1>
          <p class="page-subtitle">Fine-grained RBAC — pick a role, toggle module capabilities, then save.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="renderPage('roles')">Refresh</button>
        <button class="btn btn-primary">+ New role</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value red">${roles.length}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-item">
        <div class="stat-value green">${roles.filter(r => r.type === 'Custom').length}</div>
        <div class="stat-label">Custom</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${roles.filter(r => r.type === 'System').length}</div>
        <div class="stat-label">System</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">46</div>
        <div class="stat-label">Permissions</div>
      </div>
    </div>

    ${getKeyboardHints()}

    <div style="display: grid; grid-template-columns: 350px 1fr; gap: 24px;">
      <!-- Roles List -->
      <div class="card">
        <div class="card-body" style="padding: 12px;">
          <input type="text" class="filter-input" placeholder="Search roles..." style="margin-bottom: 12px;">
          ${roles.map((role, idx) => `
            <div class="role-item ${idx === 0 ? 'active' : ''}" style="padding: 12px; border-radius: 8px; margin-bottom: 4px; cursor: pointer; ${idx === 0 ? 'background: var(--primary-light); border: 1px solid var(--primary);' : 'border: 1px solid var(--gray-200);'}">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <strong>${role.name}</strong>
                  <span class="badge ${role.type === 'System' ? 'badge-default' : 'badge-warning'}" style="margin-left: 8px; font-size: 10px;">${role.type}</span>
                  <div style="font-size: 12px; color: var(--gray-500); margin-top: 4px;">${role.code} · ${role.level}</div>
                  <div style="font-size: 12px; color: var(--gray-400);">${role.permissions} permissions</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Role Details -->
      <div class="card">
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 18px; margin-bottom: 4px;">Super Admin</h3>
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <span class="badge badge-default">super_admin</span>
                <span class="badge badge-default">Level 100</span>
                <span class="badge badge-danger">System role</span>
              </div>
              <p style="color: var(--gray-500); font-size: 13px;">Unrestricted access — testing / break-glass. Prefer isSuperUser flag on user.</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="color: var(--gray-500); font-size: 13px;">46 selected</span>
              <button class="btn btn-secondary btn-sm">Save permissions</button>
            </div>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin-bottom: 20px; display: flex; gap: 12px; align-items: center;">
            <span>🔒</span>
            <p style="font-size: 13px; color: #92400e; margin: 0;">System roles ship with the platform. You can adjust permissions, but the internal name cannot be renamed or deleted.</p>
          </div>

          <div class="filters-bar" style="margin-bottom: 16px;">
            <input type="text" class="filter-input" placeholder="Filter permissions by name or module...">
            <span style="color: var(--primary); cursor: pointer; font-size: 13px;">Expand all</span>
            <span style="color: var(--gray-500); cursor: pointer; font-size: 13px;">Collapse</span>
          </div>

          ${modules.map(mod => `
            <div style="border: 1px solid var(--gray-200); border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <input type="checkbox" checked style="width: 18px; height: 18px; accent-color: var(--primary);">
                <strong>${mod.name}</strong>
              </div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="badge badge-success">${mod.count}</span>
                <span style="cursor: pointer;">⚙️</span>
                <span style="cursor: pointer;">▼</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ============ MODAL HELPERS ============
function closeModal() {
  modalOverlay.classList.add('hidden');
  modalContent.classList.remove('modal-wide');
  modalContent.innerHTML = '';
}
