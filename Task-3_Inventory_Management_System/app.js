/**
 * Task 3 - Inventory Management System
 * Auspify Technologies Software Development Internship
 * Features:
 * - Inventory Items Catalog (SKU, Product, Category, Price, Stock, Reorder Level)
 * - Stock In (Restock) & Stock Out (Dispatch) operations with automatic balance recalculation
 * - Audit Trail / Movement Log
 * - Real-time Search & Filter by Category & Stock Status
 * - Automated Low Stock & Out of Stock Alerts
 * - Comprehensive Inventory Valuation & CSV Export
 */

const STORAGE_INVENTORY_KEY = 'auspify_inventory_products_v1';
const STORAGE_MOVEMENTS_KEY = 'auspify_inventory_movements_v1';

// Initial Mock Inventory Products
const initialProducts = [
  {
    id: 'PRD-001',
    sku: 'LOGI-MX3S-BLK',
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    category: 'Computers & Accessories',
    price: 99.99,
    quantity: 18,
    reorderLevel: 5,
    supplier: 'Logitech Distribution'
  },
  {
    id: 'PRD-002',
    sku: 'DELL-U2723QE',
    name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
    category: 'Computers & Accessories',
    price: 579.50,
    quantity: 4,
    reorderLevel: 5,
    supplier: 'Dell Enterprise'
  },
  {
    id: 'PRD-003',
    sku: 'CSCO-SG350-28',
    name: 'Cisco 28-Port Gigabit Managed Switch',
    category: 'Networking',
    price: 389.00,
    quantity: 12,
    reorderLevel: 4,
    supplier: 'Cisco Partner ID'
  },
  {
    id: 'PRD-004',
    sku: 'SONY-WH1000XM5',
    name: 'Sony WH-1000XM5 Noise Canceling Headphones',
    category: 'Audio & Video',
    price: 348.00,
    quantity: 0,
    reorderLevel: 3,
    supplier: 'Sony Electronics'
  },
  {
    id: 'PRD-005',
    sku: 'ANK-PWR737-24K',
    name: 'Anker 737 Power Bank (PowerCore 24K)',
    category: 'Electronics',
    price: 149.99,
    quantity: 35,
    reorderLevel: 10,
    supplier: 'Anker Official'
  }
];

// Initial Movement Log
const initialMovements = [
  {
    id: 'MOV-101',
    timestamp: '2026-11-20 09:30',
    type: 'IN',
    productId: 'PRD-001',
    productName: 'Logitech MX Master 3S Wireless Performance Mouse',
    quantity: 20,
    balance: 18,
    note: 'Initial batch purchase invoice #INV-492'
  },
  {
    id: 'MOV-102',
    timestamp: '2026-11-22 14:15',
    type: 'OUT',
    productId: 'PRD-001',
    productName: 'Logitech MX Master 3S Wireless Performance Mouse',
    quantity: 2,
    balance: 18,
    note: 'Office developer setup deployment'
  }
];

let products = [];
let movements = [];

// DOM References
const inventorySection = document.getElementById('inventorySection');
const movementLogSection = document.getElementById('movementLogSection');
const tabInventoryBtn = document.getElementById('tabInventoryBtn');
const tabStockLogBtn = document.getElementById('tabStockLogBtn');

// KPI Stats
const statTotalItems = document.getElementById('statTotalItems');
const statTotalValue = document.getElementById('statTotalValue');
const statLowStock = document.getElementById('statLowStock');
const statOutOfStock = document.getElementById('statOutOfStock');

// Table & Filters
const inventoryTableBody = document.getElementById('inventoryTableBody');
const inventoryEmptyState = document.getElementById('inventoryEmptyState');
const inventoryCountLabel = document.getElementById('inventoryCountLabel');
const searchInventoryInput = document.getElementById('searchInventoryInput');
const categoryFilter = document.getElementById('categoryFilter');
const stockStatusFilter = document.getElementById('stockStatusFilter');
const resetInventoryFilterBtn = document.getElementById('resetInventoryFilterBtn');
const exportInventoryBtn = document.getElementById('exportInventoryBtn');

// Movement Log
const movementTableBody = document.getElementById('movementTableBody');
const logEmptyState = document.getElementById('logEmptyState');
const clearLogBtn = document.getElementById('clearLogBtn');

// Product Modal
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const productModalTitle = document.getElementById('productModalTitle');
const openAddProductModalBtn = document.getElementById('openAddProductModalBtn');
const closeProductModalBtn = document.getElementById('closeProductModalBtn');
const cancelProductBtn = document.getElementById('cancelProductBtn');

// Adjust Modal
const adjustModal = document.getElementById('adjustModal');
const adjustForm = document.getElementById('adjustForm');
const adjustModalHeader = document.getElementById('adjustModalHeader');
const adjustModalTitle = document.getElementById('adjustModalTitle');
const adjustProductName = document.getElementById('adjustProductName');
const confirmAdjustBtn = document.getElementById('confirmAdjustBtn');
const closeAdjustModalBtn = document.getElementById('closeAdjustModalBtn');
const cancelAdjustBtn = document.getElementById('cancelAdjustBtn');

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderAll();
});

function loadData() {
  const storedProd = localStorage.getItem(STORAGE_INVENTORY_KEY);
  if (storedProd) {
    try {
      products = JSON.parse(storedProd);
    } catch (e) {
      products = [...initialProducts];
    }
  } else {
    products = [...initialProducts];
    saveProducts();
  }

  const storedMov = localStorage.getItem(STORAGE_MOVEMENTS_KEY);
  if (storedMov) {
    try {
      movements = JSON.parse(storedMov);
    } catch (e) {
      movements = [...initialMovements];
    }
  } else {
    movements = [...initialMovements];
    saveMovements();
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(products));
}

function saveMovements() {
  localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(movements));
}

function setupEventListeners() {
  // Tabs
  tabInventoryBtn.addEventListener('click', () => switchTab('inventory'));
  tabStockLogBtn.addEventListener('click', () => switchTab('log'));

  // Product Modal
  openAddProductModalBtn.addEventListener('click', () => openProductModal());
  closeProductModalBtn.addEventListener('click', () => productModal.classList.add('hidden'));
  cancelProductBtn.addEventListener('click', () => productModal.classList.add('hidden'));
  productForm.addEventListener('submit', handleProductSubmit);

  // Adjust Modal
  closeAdjustModalBtn.addEventListener('click', () => adjustModal.classList.add('hidden'));
  cancelAdjustBtn.addEventListener('click', () => adjustModal.classList.add('hidden'));
  adjustForm.addEventListener('submit', handleAdjustSubmit);

  // Search & Filter
  searchInventoryInput.addEventListener('input', renderProducts);
  categoryFilter.addEventListener('change', renderProducts);
  stockStatusFilter.addEventListener('change', renderProducts);
  resetInventoryFilterBtn.addEventListener('click', () => {
    searchInventoryInput.value = '';
    categoryFilter.value = '';
    stockStatusFilter.value = '';
    renderProducts();
  });

  // Actions
  exportInventoryBtn.addEventListener('click', exportInventoryCsv);
  clearLogBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all movement logs?')) {
      movements = [];
      saveMovements();
      renderMovements();
      showToast('Movement logs cleared', 'info');
    }
  });

  window.addEventListener('click', (e) => {
    if (e.target === productModal) productModal.classList.add('hidden');
    if (e.target === adjustModal) adjustModal.classList.add('hidden');
  });
}

function switchTab(tab) {
  if (tab === 'inventory') {
    inventorySection.classList.remove('hidden');
    movementLogSection.classList.add('hidden');
    tabInventoryBtn.className = 'py-3 px-1 border-b-2 border-purple-600 text-purple-700 flex items-center space-x-2 transition';
    tabStockLogBtn.className = 'py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center space-x-2 transition';
  } else {
    inventorySection.classList.add('hidden');
    movementLogSection.classList.remove('hidden');
    tabStockLogBtn.className = 'py-3 px-1 border-b-2 border-purple-600 text-purple-700 flex items-center space-x-2 transition';
    tabInventoryBtn.className = 'py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center space-x-2 transition';
  }
}

function openProductModal(prod = null) {
  productForm.reset();
  if (prod) {
    productModalTitle.textContent = 'Edit Product Details';
    document.getElementById('productIdHidden').value = prod.id;
    document.getElementById('productSku').value = prod.sku;
    document.getElementById('productName').value = prod.name;
    document.getElementById('productCategory').value = prod.category;
    document.getElementById('productPrice').value = prod.price;
    document.getElementById('productQuantity').value = prod.quantity;
    document.getElementById('productReorderLevel').value = prod.reorderLevel;
    document.getElementById('productSupplier').value = prod.supplier || '';
  } else {
    productModalTitle.textContent = 'Add Product to Inventory';
    document.getElementById('productIdHidden').value = '';
    document.getElementById('productReorderLevel').value = 5;
  }
  productModal.classList.remove('hidden');
}

function handleProductSubmit(e) {
  e.preventDefault();
  const idHidden = document.getElementById('productIdHidden').value;
  const sku = document.getElementById('productSku').value.trim().toUpperCase();
  const name = document.getElementById('productName').value.trim();
  const category = document.getElementById('productCategory').value;
  const price = parseFloat(document.getElementById('productPrice').value) || 0;
  const quantity = parseInt(document.getElementById('productQuantity').value, 10) || 0;
  const reorderLevel = parseInt(document.getElementById('productReorderLevel').value, 10) || 5;
  const supplier = document.getElementById('productSupplier').value.trim();

  if (idHidden) {
    const idx = products.findIndex(p => p.id === idHidden);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        sku,
        name,
        category,
        price,
        quantity,
        reorderLevel,
        supplier
      };
      showToast('Product updated successfully!', 'success');
    }
  } else {
    const newProd = {
      id: 'PRD-' + Math.floor(100 + Math.random() * 900),
      sku,
      name,
      category,
      price,
      quantity,
      reorderLevel,
      supplier
    };
    products.unshift(newProd);

    // Record initial movement log
    if (quantity > 0) {
      logMovement('IN', newProd.id, newProd.name, quantity, quantity, 'Initial stock entry upon creation');
    }

    showToast('New product added to inventory!', 'success');
  }

  saveProducts();
  productModal.classList.add('hidden');
  renderAll();
}

function deleteProduct(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  if (confirm(`Are you sure you want to delete ${prod.name} (${prod.sku})?`)) {
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderAll();
    showToast('Product removed from catalog', 'info');
  }
}

function openAdjustModal(productId, type) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  adjustForm.reset();
  document.getElementById('adjustProductId').value = prod.id;
  document.getElementById('adjustType').value = type;
  adjustProductName.textContent = `${prod.name} (Current: ${prod.quantity} units)`;

  if (type === 'IN') {
    adjustModalHeader.className = 'p-5 text-white flex justify-between items-center bg-emerald-600';
    adjustModalTitle.textContent = 'Stock In (Restock Products)';
    confirmAdjustBtn.className = 'px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition';
    confirmAdjustBtn.textContent = 'Confirm Stock In';
  } else {
    adjustModalHeader.className = 'p-5 text-white flex justify-between items-center bg-amber-600';
    adjustModalTitle.textContent = 'Stock Out (Dispatch Products)';
    confirmAdjustBtn.className = 'px-5 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition';
    confirmAdjustBtn.textContent = 'Confirm Stock Out';
  }

  adjustModal.classList.remove('hidden');
}

function handleAdjustSubmit(e) {
  e.preventDefault();
  const prodId = document.getElementById('adjustProductId').value;
  const type = document.getElementById('adjustType').value;
  const qty = parseInt(document.getElementById('adjustQuantity').value, 10);
  const note = document.getElementById('adjustNote').value.trim() || (type === 'IN' ? 'Warehouse restock' : 'Sales order dispatch');

  const prod = products.find(p => p.id === prodId);
  if (!prod) return;

  if (type === 'OUT' && qty > prod.quantity) {
    showToast(`Insufficient stock! Cannot dispatch ${qty} units (Only ${prod.quantity} available).`, 'error');
    return;
  }

  if (type === 'IN') {
    prod.quantity += qty;
  } else {
    prod.quantity -= qty;
  }

  saveProducts();
  logMovement(type, prod.id, prod.name, qty, prod.quantity, note);

  adjustModal.classList.add('hidden');
  showToast(`Stock updated successfully! New quantity: ${prod.quantity}`, 'success');
  renderAll();
}

function logMovement(type, productId, productName, qty, balance, note) {
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

  movements.unshift({
    id: 'MOV-' + Math.floor(100 + Math.random() * 900),
    timestamp: dateStr,
    type,
    productId,
    productName,
    quantity: qty,
    balance,
    note
  });
  saveMovements();
}

function renderAll() {
  updateStats();
  renderProducts();
  renderMovements();
}

function updateStats() {
  statTotalItems.textContent = products.length;

  const totalValuation = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  statTotalValue.textContent = '$' + totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.reorderLevel).length;
  statLowStock.textContent = lowStockCount;

  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  statOutOfStock.textContent = outOfStockCount;
}

function renderProducts() {
  const query = searchInventoryInput.value.toLowerCase().trim();
  const category = categoryFilter.value;
  const status = stockStatusFilter.value;

  const filtered = products.filter(p => {
    const matchesQuery = !query ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.supplier && p.supplier.toLowerCase().includes(query));

    const matchesCat = !category || p.category === category;

    let matchesStatus = true;
    if (status === 'In Stock') matchesStatus = p.quantity > p.reorderLevel;
    if (status === 'Low Stock') matchesStatus = p.quantity > 0 && p.quantity <= p.reorderLevel;
    if (status === 'Out of Stock') matchesStatus = p.quantity === 0;

    return matchesQuery && matchesCat && matchesStatus;
  });

  inventoryTableBody.innerHTML = '';
  if (filtered.length === 0) {
    inventoryEmptyState.classList.remove('hidden');
    inventoryCountLabel.textContent = `Showing 0 of ${products.length} products`;
    return;
  }

  inventoryEmptyState.classList.add('hidden');
  inventoryCountLabel.textContent = `Showing ${filtered.length} of ${products.length} products`;

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors border-b border-slate-100';

    let statusBadge = '';
    if (p.quantity === 0) {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">Out of Stock</span>';
    } else if (p.quantity <= p.reorderLevel) {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Low Stock</span>';
    } else {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">In Stock</span>';
    }

    const itemTotalValue = (p.price * p.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    tr.innerHTML = `
      <td class="py-4 px-6">
        <div class="font-bold text-slate-800">${escapeHtml(p.name)}</div>
        <div class="text-xs text-slate-400 font-mono mt-0.5">SKU: <span class="font-semibold text-slate-600">${p.sku}</span> ${p.supplier ? '• ' + escapeHtml(p.supplier) : ''}</div>
      </td>
      <td class="py-4 px-6">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          ${escapeHtml(p.category)}
        </span>
      </td>
      <td class="py-4 px-6 text-right font-medium text-slate-800">
        $${p.price.toFixed(2)}
      </td>
      <td class="py-4 px-6 text-center font-bold">
        <span class="${p.quantity === 0 ? 'text-rose-600' : (p.quantity <= p.reorderLevel ? 'text-amber-600' : 'text-slate-800')}">${p.quantity}</span>
        <span class="text-slate-400 text-xs block font-normal">Min: ${p.reorderLevel}</span>
      </td>
      <td class="py-4 px-6 text-center">
        ${statusBadge}
      </td>
      <td class="py-4 px-6 text-right font-semibold text-purple-700">
        $${itemTotalValue}
      </td>
      <td class="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
        <button onclick="openAdjustModal('${p.id}', 'IN')" title="Stock In / Restock" class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-arrow-down"></i>
        </button>
        <button onclick="openAdjustModal('${p.id}', 'OUT')" title="Stock Out / Dispatch" class="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-arrow-up"></i>
        </button>
        <button onclick="editProduct('${p.id}')" title="Edit Product" class="w-8 h-8 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button onclick="deleteProduct('${p.id}')" title="Delete Product" class="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    inventoryTableBody.appendChild(tr);
  });
}

function renderMovements() {
  movementTableBody.innerHTML = '';
  if (movements.length === 0) {
    logEmptyState.classList.remove('hidden');
    return;
  }

  logEmptyState.classList.add('hidden');

  movements.forEach(m => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs';

    const isStockIn = m.type === 'IN';
    const typeBadge = isStockIn
      ? '<span class="px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800"><i class="fa-solid fa-arrow-down mr-1"></i>Stock In</span>'
      : '<span class="px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800"><i class="fa-solid fa-arrow-up mr-1"></i>Stock Out</span>';

    tr.innerHTML = `
      <td class="py-3 px-6 text-slate-500 font-mono">${m.timestamp}</td>
      <td class="py-3 px-6">${typeBadge}</td>
      <td class="py-3 px-6 font-semibold text-slate-800">${escapeHtml(m.productName)}</td>
      <td class="py-3 px-6 text-center font-bold ${isStockIn ? 'text-emerald-600' : 'text-amber-600'}">
        ${isStockIn ? '+' : '-'}${m.quantity}
      </td>
      <td class="py-3 px-6 text-center font-semibold text-slate-700">${m.balance}</td>
      <td class="py-3 px-6 text-slate-500">${escapeHtml(m.note || '-')}</td>
    `;
    movementTableBody.appendChild(tr);
  });
}

function editProduct(id) {
  const p = products.find(item => item.id === id);
  if (p) openProductModal(p);
}

function exportInventoryCsv() {
  if (products.length === 0) {
    showToast('No inventory records to export!', 'error');
    return;
  }

  const headers = ['Product ID', 'SKU', 'Product Name', 'Category', 'Unit Price ($)', 'Current Quantity', 'Reorder Level', 'Total Value ($)', 'Supplier'];
  const rows = products.map(p => [
    p.id,
    `"${p.sku}"`,
    `"${p.name}"`,
    `"${p.category}"`,
    p.price.toFixed(2),
    p.quantity,
    p.reorderLevel,
    (p.price * p.quantity).toFixed(2),
    `"${p.supplier || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Inventory CSV Valuation Report exported successfully!', 'success');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  const icon = type === 'success' ? 'fa-circle-check text-emerald-500' : 
               type === 'error' ? 'fa-triangle-exclamation text-rose-500' : 'fa-circle-info text-purple-500';
  
  toast.className = 'toast-enter pointer-events-auto bg-white border border-slate-200 shadow-xl px-4 py-3 rounded-xl flex items-center space-x-3 text-sm text-slate-700 min-w-[280px] max-w-sm';
  toast.innerHTML = `
    <i class="fa-solid ${icon} text-lg"></i>
    <span class="flex-1 font-medium">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.openAdjustModal = openAdjustModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
