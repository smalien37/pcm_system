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
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupPasswordToggle();

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

// // Auth Handlers
// function handleLogin(e) {
//   e.preventDefault();
//   sessionStorage.setItem('loggedIn', 'true');
//   showMainApp();
// }
// Auth Handlers
// Auth Handlers
const VALID_CREDENTIALS = [
  { email: 'admin@synesisconsulting.app', password: 'Demo@2026' },
  { email: 'admin@syncflow.local', password: 'password123' },
  // Add more credentials here as needed
];

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const isValid = VALID_CREDENTIALS.some(
    cred => cred.email === email && cred.password === password
  );

  if (isValid) {
    sessionStorage.setItem('loggedIn', 'true');
    showMainApp();
  } else {
    alert('Invalid email or password. Please try again.');
  }
}

function handleLogout() {
  sessionStorage.removeItem('loggedIn');
  mainApp.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

function showMainApp() {
  loginScreen.classList.add('hidden');
  mainApp.classList.remove('hidden');
  navigateTo('dashboard');
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
      <span class="kbd">/</span>
      <span class="kbd">n</span>
      <span class="kbd">j</span>
      <span class="kbd">k</span>
      <span class="kbd">↵</span>
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
  return vendors.map(v => `
    <tr>
      <td>${v.id}</td>
      <td><strong>${v.name}</strong></td>
      <td>${v.contact}</td>
      <td><span class="badge ${getStatusBadgeClass(v.status)}">${v.status}</span></td>
      <td>${v.categories.join(', ')}</td>
      <td class="action-icons">
        <button class="action-icon" onclick="editVendor('${v.id}')" title="Edit">✏️</button>
        <button class="action-icon delete" onclick="deleteVendor('${v.id}')" title="Delete">🗑️</button>
      </td>
    </tr>
  `).join('');
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
            <select id="vendor-category">
              ${AppData.vendorCategories.map(cat =>
                `<option value="${cat}" ${vendor?.category === cat ? 'selected' : ''}>${cat}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group full-width">
            <label>Address</label>
            <textarea id="vendor-address" rows="2">${vendor?.address || ''}</textarea>
          </div>
          <div class="form-group full-width">
            <label>Supplied Items (comma separated)</label>
            <input type="text" id="vendor-items" value="${vendor?.items?.join(', ') || ''}" placeholder="Tires, Filters, Engine Oil...">
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

function saveVendor(vendorId) {
  const name = document.getElementById('vendor-name').value;
  const email = document.getElementById('vendor-email').value;
  const phone = document.getElementById('vendor-phone').value;
  const category = document.getElementById('vendor-category').value;
  const address = document.getElementById('vendor-address').value;
  const itemsStr = document.getElementById('vendor-items').value;
  const items = itemsStr.split(',').map(i => i.trim()).filter(i => i);

  if (!name) {
    alert('Vendor name is required');
    return;
  }

  if (vendorId) {
    // Update existing
    const idx = AppData.vendors.findIndex(v => v.id === vendorId);
    if (idx !== -1) {
      AppData.vendors[idx] = {
        ...AppData.vendors[idx],
        name, contact: email, phone, category, categories: [category], address, items
      };
    }
  } else {
    // Create new
    const newVendor = {
      id: generateId('VND'),
      name,
      contact: email,
      phone,
      category,
      categories: [category],
      address,
      items,
      status: 'active'
    };
    AppData.vendors.push(newVendor);
  }

  closeModal();
  renderPage('vendors');
}

function editVendor(id) {
  openVendorModal(id);
}

function deleteVendor(id) {
  if (confirm('Are you sure you want to delete this vendor?')) {
    AppData.vendors = AppData.vendors.filter(v => v.id !== id);
    renderPage('vendors');
  }
}

// ============ ITEMS ============
function renderItems() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">🏷️</span>
        <div>
          <h1>Items</h1>
          <p class="page-subtitle">SKU master with UOM, reorder & tracking — soft-delete to recycle bin.</p>
        </div>
      </div>
      <div class="page-actions">
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
  document.getElementById('item-status-filter')?.addEventListener('change', filterItems);
}

function renderItemRows(items) {
  return items.map(item => `
    <tr>
      <td>${item.sku}</td>
      <td><strong>${item.name}</strong></td>
      <td>${item.uom}</td>
      <td>${item.category}</td>
      <td>${item.reorder}</td>
      <td>${item.tracking}</td>
      <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span></td>
      <td class="action-icons">
        <button class="action-icon" onclick="editItem('${item.id}')" title="Edit">✏️</button>
        <button class="action-icon delete" onclick="deleteItem('${item.id}')" title="Delete">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function filterItems() {
  const search = document.getElementById('item-search').value.toLowerCase();
  const category = document.getElementById('item-category-filter').value;
  const status = document.getElementById('item-status-filter').value;

  const filtered = AppData.items.filter(item => {
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search) ||
      item.sku.toLowerCase().includes(search);
    const matchesCategory = !category || item.category === category;
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
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
            <label>SKU *</label>
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
            </select>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select id="item-category">
              ${AppData.itemCategories.map(cat =>
                `<option value="${cat}" ${item?.category === cat ? 'selected' : ''}>${cat}</option>`
              ).join('')}
            </select>
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
              <option value="Batch, Serial" ${item?.tracking === 'Batch, Serial' ? 'selected' : ''}>Batch & Serial</option>
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

function saveItem(itemId) {
  const sku = document.getElementById('item-sku').value;
  const name = document.getElementById('item-name').value;
  const uom = document.getElementById('item-uom').value;
  const category = document.getElementById('item-category').value;
  const reorder = parseInt(document.getElementById('item-reorder').value) || 0;
  const tracking = document.getElementById('item-tracking').value;

  if (!sku || !name) {
    alert('SKU and Name are required');
    return;
  }

  if (itemId) {
    const idx = AppData.items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      AppData.items[idx] = { ...AppData.items[idx], sku, name, uom, category, reorder, tracking };
    }
  } else {
    AppData.items.push({
      id: sku,
      sku,
      name,
      uom,
      category,
      reorder,
      tracking,
      status: 'active'
    });
  }

  closeModal();
  renderPage('items');
}

function editItem(id) {
  openItemModal(id);
}

function deleteItem(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    AppData.items = AppData.items.filter(i => i.id !== id);
    renderPage('items');
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

    <div class="filters-bar">
      <input type="text" class="filter-input" id="po-search" placeholder="Search PO number...">
      <select class="filter-select" id="po-status-filter">
        <option value="">Status</option>
        <option value="Open">Open</option>
        <option value="Partially Received">Partially Received</option>
        <option value="Completed">Completed</option>
      </select>
      <select class="filter-select" id="po-vendor-filter">
        <option value="">Vendor</option>
        ${AppData.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="po-site-filter">
        <option value="">Site</option>
        ${AppData.sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
      </select>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      <table class="data-table" id="po-table">
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Site</th>
            <th>Status</th>
            <th>Total</th>
            <th></th>
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
  document.getElementById('po-status-filter')?.addEventListener('change', filterPOs);
  document.getElementById('po-vendor-filter')?.addEventListener('change', filterPOs);
  document.getElementById('po-site-filter')?.addEventListener('change', filterPOs);
}

function renderPORows(orders) {
  return orders.map(po => `
    <tr>
      <td><strong>${po.id}</strong></td>
      <td>${po.vendorName}</td>
      <td>${po.siteName}</td>
      <td><span class="badge ${getStatusBadgeClass(po.status)}">${po.status}</span></td>
      <td>₹${formatCurrency(po.total)}</td>
      <td class="action-icons">
        <button class="action-icon" onclick="viewPO('${po.id}')" title="View">👁️</button>
      </td>
    </tr>
  `).join('');
}

function filterPOs() {
  const search = document.getElementById('po-search').value.toLowerCase();
  const status = document.getElementById('po-status-filter').value;
  const vendorId = document.getElementById('po-vendor-filter').value;
  const siteId = document.getElementById('po-site-filter').value;

  const filtered = AppData.purchaseOrders.filter(po => {
    const matchesSearch = !search || po.id.toLowerCase().includes(search);
    const matchesStatus = !status || po.status === status;
    const matchesVendor = !vendorId || po.vendorId === vendorId;
    const matchesSite = !siteId || po.siteId === siteId;
    return matchesSearch && matchesStatus && matchesVendor && matchesSite;
  });

  document.querySelector('#po-table tbody').innerHTML = renderPORows(filtered);
}

function openPOModal() {
  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>New Purchase Order</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="po-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Vendor *</label>
            <select id="po-vendor" required>
              <option value="">Select vendor...</option>
              ${AppData.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Site *</label>
            <select id="po-site" required>
              <option value="">Select site...</option>
              ${AppData.sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>PO Date</label>
            <input type="date" id="po-date" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>

        <div class="item-lines">
          <div class="item-lines-header">
            <h4>Order Lines</h4>
            <button type="button" class="btn btn-sm btn-secondary" onclick="addPOLine()">+ Add Line</button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="po-lines">
              <tr>
                <td>
                  <select class="po-item" onchange="updatePOLineTotal(this)">
                    <option value="">Select item...</option>
                    ${AppData.items.map(i => `<option value="${i.id}" data-name="${i.name}">${i.name}</option>`).join('')}
                  </select>
                </td>
                <td><input type="number" class="po-qty" value="1" min="1" onchange="updatePOLineTotal(this)"></td>
                <td><input type="number" class="po-rate" value="0" min="0" onchange="updatePOLineTotal(this)"></td>
                <td class="po-line-total">₹0</td>
                <td><button type="button" class="action-icon delete" onclick="removePOLine(this)">🗑️</button></td>
              </tr>
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 12px; font-weight: 600;">
            Grand Total: <span id="po-grand-total">₹0</span>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="savePO()">Create PO</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function addPOLine() {
  const tbody = document.getElementById('po-lines');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>
      <select class="po-item" onchange="updatePOLineTotal(this)">
        <option value="">Select item...</option>
        ${AppData.items.map(i => `<option value="${i.id}" data-name="${i.name}">${i.name}</option>`).join('')}
      </select>
    </td>
    <td><input type="number" class="po-qty" value="1" min="1" onchange="updatePOLineTotal(this)"></td>
    <td><input type="number" class="po-rate" value="0" min="0" onchange="updatePOLineTotal(this)"></td>
    <td class="po-line-total">₹0</td>
    <td><button type="button" class="action-icon delete" onclick="removePOLine(this)">🗑️</button></td>
  `;
  tbody.appendChild(row);
}

function removePOLine(btn) {
  const row = btn.closest('tr');
  if (document.querySelectorAll('#po-lines tr').length > 1) {
    row.remove();
    updatePOGrandTotal();
  }
}

function updatePOLineTotal(el) {
  const row = el.closest('tr');
  const qty = parseInt(row.querySelector('.po-qty').value) || 0;
  const rate = parseFloat(row.querySelector('.po-rate').value) || 0;
  const total = qty * rate;
  row.querySelector('.po-line-total').textContent = `₹${formatCurrency(total)}`;
  updatePOGrandTotal();
}

function updatePOGrandTotal() {
  let total = 0;
  document.querySelectorAll('#po-lines tr').forEach(row => {
    const qty = parseInt(row.querySelector('.po-qty').value) || 0;
    const rate = parseFloat(row.querySelector('.po-rate').value) || 0;
    total += qty * rate;
  });
  document.getElementById('po-grand-total').textContent = `₹${formatCurrency(total)}`;
}

function savePO() {
  const vendorId = document.getElementById('po-vendor').value;
  const siteId = document.getElementById('po-site').value;
  const date = document.getElementById('po-date').value;

  if (!vendorId || !siteId) {
    alert('Please select vendor and site');
    return;
  }

  const vendor = AppData.vendors.find(v => v.id === vendorId);
  const site = AppData.sites.find(s => s.id === siteId);

  const items = [];
  let total = 0;

  document.querySelectorAll('#po-lines tr').forEach(row => {
    const itemSelect = row.querySelector('.po-item');
    const itemId = itemSelect.value;
    if (itemId) {
      const itemName = itemSelect.options[itemSelect.selectedIndex].dataset.name;
      const qty = parseInt(row.querySelector('.po-qty').value) || 0;
      const rate = parseFloat(row.querySelector('.po-rate').value) || 0;
      const lineTotal = qty * rate;
      items.push({
        itemId,
        name: itemName,
        qty,
        rate,
        total: lineTotal,
        received: 0
      });
      total += lineTotal;
    }
  });

  if (items.length === 0) {
    alert('Please add at least one item');
    return;
  }

  const newPO = {
    id: generateId('PO'),
    vendorId,
    vendorName: vendor.name,
    siteId,
    siteName: site.name,
    date,
    status: 'Open',
    items,
    total
  };

  AppData.purchaseOrders.unshift(newPO);
  closeModal();
  renderPage('purchase-orders');
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
        <button class="btn btn-secondary">Balances vs PO outstanding</button>
        <button class="btn btn-primary" id="btn-new-grn">+ Receive against PO</button>
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

    <div class="filters-bar">
      <input type="text" class="filter-input" id="grn-search" placeholder="Search GRN number...">
      <select class="filter-select" id="grn-status-filter">
        <option value="">Status</option>
        <option value="Posted">Posted</option>
        <option value="Draft">Draft</option>
      </select>
      <select class="filter-select" id="grn-vendor-filter">
        <option value="">Vendor</option>
        ${AppData.vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="grn-site-filter">
        <option value="">Site</option>
        ${AppData.sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
      </select>
    </div>

    ${getKeyboardHints()}

    <div class="card">
      <table class="data-table" id="grn-table">
        <thead>
          <tr>
            <th>GRN</th>
            <th>PO</th>
            <th>Vendor</th>
            <th>Site</th>
            <th>Status</th>
            <th></th>
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
  document.getElementById('grn-status-filter')?.addEventListener('change', filterGRNs);
  document.getElementById('grn-vendor-filter')?.addEventListener('change', filterGRNs);
  document.getElementById('grn-site-filter')?.addEventListener('change', filterGRNs);
}

function renderGRNRows(receipts) {
  return receipts.map(grn => `
    <tr>
      <td><strong>${grn.id}</strong></td>
      <td>${grn.poId}</td>
      <td>${grn.vendorName}</td>
      <td>${grn.siteName}</td>
      <td><span class="badge ${getStatusBadgeClass(grn.status)}">${grn.status}</span></td>
      <td class="action-icons">
        <button class="action-icon" onclick="viewGRN('${grn.id}')" title="View">👁️</button>
      </td>
    </tr>
  `).join('');
}

function filterGRNs() {
  const search = document.getElementById('grn-search').value.toLowerCase();
  const status = document.getElementById('grn-status-filter').value;
  const vendorId = document.getElementById('grn-vendor-filter').value;
  const siteId = document.getElementById('grn-site-filter').value;

  const filtered = AppData.goodsReceipts.filter(grn => {
    const matchesSearch = !search || grn.id.toLowerCase().includes(search) || grn.poId.toLowerCase().includes(search);
    const matchesStatus = !status || grn.status === status;
    const matchesVendor = !vendorId || grn.vendorId === vendorId;
    const matchesSite = !siteId || grn.siteId === siteId;
    return matchesSearch && matchesStatus && matchesVendor && matchesSite;
  });

  document.querySelector('#grn-table tbody').innerHTML = renderGRNRows(filtered);
}

function openGRNModal() {
  const openPOs = AppData.purchaseOrders.filter(po => po.status !== 'Completed');

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>New Goods Receipt</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <form id="grn-form">
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Select Purchase Order *</label>
            <select id="grn-po" required onchange="loadPOForGRN()">
              <option value="">Select PO...</option>
              ${openPOs.map(po => `<option value="${po.id}">${po.id} - ${po.vendorName} (${po.status})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Delivery Challan / Invoice No.</label>
            <input type="text" id="grn-challan" placeholder="e.g., DC-2026-XXX">
          </div>
          <div class="form-group">
            <label>Received Date</label>
            <input type="date" id="grn-date" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>

        <div id="grn-lines-container" class="hidden">
          <h4 style="margin: 20px 0 12px;">Receive Items</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Ordered</th>
                <th>Previously Received</th>
                <th>Receive Now</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody id="grn-lines">
            </tbody>
          </table>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveGRN()">Post GRN</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

function loadPOForGRN() {
  const poId = document.getElementById('grn-po').value;
  const container = document.getElementById('grn-lines-container');
  const tbody = document.getElementById('grn-lines');

  if (!poId) {
    container.classList.add('hidden');
    return;
  }

  const po = AppData.purchaseOrders.find(p => p.id === poId);
  if (!po) return;

  container.classList.remove('hidden');

  tbody.innerHTML = po.items.map(item => {
    const pending = item.qty - item.received;
    return `
      <tr data-item-id="${item.itemId}">
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${item.received}</td>
        <td>
          <input type="number" class="grn-receive-qty" value="0" min="0" max="${pending}"
                 onchange="updateGRNBalance(this, ${item.qty}, ${item.received})">
        </td>
        <td class="grn-balance">${pending}</td>
      </tr>
    `;
  }).join('');
}

function updateGRNBalance(input, ordered, prevReceived) {
  const row = input.closest('tr');
  const receiveNow = parseInt(input.value) || 0;
  const pending = ordered - prevReceived;

  if (receiveNow > pending) {
    input.value = pending;
    alert(`Cannot receive more than pending quantity (${pending})`);
    return;
  }

  const newBalance = pending - receiveNow;
  row.querySelector('.grn-balance').textContent = newBalance;
}

function saveGRN() {
  const poId = document.getElementById('grn-po').value;
  const challanNo = document.getElementById('grn-challan').value;
  const date = document.getElementById('grn-date').value;

  if (!poId) {
    alert('Please select a Purchase Order');
    return;
  }

  const po = AppData.purchaseOrders.find(p => p.id === poId);
  if (!po) return;

  const grnItems = [];
  let anyReceived = false;

  document.querySelectorAll('#grn-lines tr').forEach(row => {
    const itemId = row.dataset.itemId;
    const poItem = po.items.find(i => i.itemId === itemId);
    const receiveQty = parseInt(row.querySelector('.grn-receive-qty').value) || 0;

    if (receiveQty > 0) {
      anyReceived = true;

      grnItems.push({
        itemId,
        name: poItem.name,
        ordered: poItem.qty,
        previouslyReceived: poItem.received,
        received: receiveQty,
        balance: poItem.qty - poItem.received - receiveQty
      });

      // Update PO item received quantity
      poItem.received += receiveQty;

      // Update stock
      updateStock(itemId, poItem.name, po.siteId, po.siteName, receiveQty);
    }
  });

  if (!anyReceived) {
    alert('Please enter quantity to receive for at least one item');
    return;
  }

  // Update PO status
  const allReceived = po.items.every(i => i.received >= i.qty);
  const anyPartial = po.items.some(i => i.received > 0 && i.received < i.qty);

  if (allReceived) {
    po.status = 'Completed';
  } else if (anyPartial || po.items.some(i => i.received > 0)) {
    po.status = 'Partially Received';
  }

  // Create GRN
  const newGRN = {
    id: generateId('GRN'),
    poId,
    vendorName: po.vendorName,
    siteId: po.siteId,
    siteName: po.siteName,
    challanNo,
    date,
    status: 'Posted',
    items: grnItems
  };

  AppData.goodsReceipts.unshift(newGRN);
  closeModal();
  renderPage('goods-receipt');
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

function viewGRN(grnId) {
  const grn = AppData.goodsReceipts.find(g => g.id === grnId);
  if (!grn) return;

  modalContent.innerHTML = `
    <div class="modal-header">
      <h2>Goods Receipt: ${grn.id}</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group">
          <label>PO Number</label>
          <p><strong>${grn.poId}</strong></p>
        </div>
        <div class="form-group">
          <label>Vendor</label>
          <p><strong>${grn.vendorName}</strong></p>
        </div>
        <div class="form-group">
          <label>Site</label>
          <p><strong>${grn.siteName}</strong></p>
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
      </div>

      <h4 style="margin: 20px 0 12px;">Received Items</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Ordered</th>
            <th>Prev. Received</th>
            <th>This Receipt</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${grn.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.ordered}</td>
              <td>${item.previouslyReceived}</td>
              <td><strong>${item.received}</strong></td>
              <td>${item.balance}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  modalOverlay.classList.remove('hidden');
}

// ============ STOCK ============
function renderStock() {
  return `
    <div class="page-header">
      <div class="page-title">
        <span class="page-title-icon">📦</span>
        <div>
          <h1>Stock</h1>
          <p class="page-subtitle">On-hand balances, reorder alerts, and site movements in one place.</p>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
        <button class="btn btn-primary">Stock movement</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active">On hand</button>
      <button class="tab">Reorder (${AppData.stock.filter(s => s.onHand <= s.reorder).length})</button>
      <button class="tab">Movements</button>
    </div>

    <div class="filters-bar">
      <input type="text" class="filter-input" id="stock-search" placeholder="Search SKU or item name...">
      <select class="filter-select" id="stock-site-filter">
        <option value="">Site</option>
        ${AppData.sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
      </select>
    </div>

    ${getKeyboardHints()}

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
  `;
}

function setupStockHandlers() {
  document.getElementById('stock-search')?.addEventListener('input', filterStock);
  document.getElementById('stock-site-filter')?.addEventListener('change', filterStock);
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
  const search = document.getElementById('stock-search').value.toLowerCase();
  const siteId = document.getElementById('stock-site-filter').value;

  const filtered = AppData.stock.filter(s => {
    const matchesSearch = !search ||
      s.sku.toLowerCase().includes(search) ||
      s.itemName.toLowerCase().includes(search);
    const matchesSite = !siteId || s.siteId === siteId;
    return matchesSearch && matchesSite;
  });

  document.querySelector('#stock-table tbody').innerHTML = renderStockRows(filtered);
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
  document.getElementById('invoice-status-filter')?.addEventListener('change', filterInvoices);
  document.getElementById('invoice-vendor-filter')?.addEventListener('change', filterInvoices);
}

function filterInvoices() {
  const search = document.getElementById('invoice-search').value.toLowerCase();
  const status = document.getElementById('invoice-status-filter').value;
  const vendorId = document.getElementById('invoice-vendor-filter').value;

  const filtered = (AppData.invoices || []).filter(inv => {
    const matchesSearch = !search ||
      inv.id.toLowerCase().includes(search) ||
      inv.vendorName.toLowerCase().includes(search);
    const matchesStatus = !status || inv.status.toLowerCase() === status;
    const matchesVendor = !vendorId || inv.vendorId === vendorId;
    return matchesSearch && matchesStatus && matchesVendor;
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
  document.getElementById('debit-note-status-filter')?.addEventListener('change', filterDebitNotes);
  document.getElementById('debit-note-vendor-filter')?.addEventListener('change', filterDebitNotes);
}

function filterDebitNotes() {
  const search = document.getElementById('debit-note-search').value.toLowerCase();
  const status = document.getElementById('debit-note-status-filter').value;
  const vendorId = document.getElementById('debit-note-vendor-filter').value;

  const filtered = (AppData.debitNotes || []).filter(dn => {
    const matchesSearch = !search ||
      dn.id.toLowerCase().includes(search) ||
      dn.vendorName.toLowerCase().includes(search);
    const matchesStatus = !status || dn.status.toLowerCase() === status;
    const matchesVendor = !vendorId || dn.vendorId === vendorId;
    return matchesSearch && matchesStatus && matchesVendor;
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
  modalContent.innerHTML = '';
}
