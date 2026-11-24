/**
 * Task 3 - Inventory Management System (StockMaster Pro)
 * Archetype: Industrial Warehouse Cockpit & Telemetry Operations Feed
 */

const STORAGE_INVENTORY_KEY = 'auspify_inventory_products_v1';
const STORAGE_MOVEMENTS_KEY = 'auspify_inventory_movements_v1';

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

const initialMovements = [
  {
    id: 'MOV-101',
    timestamp: '2026-11-20 09:30',
    type: 'IN',
    productId: 'PRD-001',
    productName: 'Logitech MX Master 3S',
    quantity: 20,
    balance: 18,
    note: 'Initial batch purchase invoice #INV-492'
  },
  {
    id: 'MOV-102',
    timestamp: '2026-11-22 14:15',
    type: 'OUT',
    productId: 'PRD-001',
    productName: 'Logitech MX Master 3S',
    quantity: 2,
    balance: 18,
    note: 'Developer workstation setup'
  }
];

let products = [];
let movements = [];

// DOM References
const productGrid = document.getElementById('productGrid');
const terminalContainer = document.getElementById('terminalContainer');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const stockFilter = document.getElementById('stockFilter');

// HUD
const hudValuation = document.getElementById('hudValuation');
const hudSkus = document.getElementById('hudSkus');
const hudLowStock = document.getElementById('hudLowStock');

// Modals
const adjustModal = document.getElementById('adjustModal');
const adjustForm = document.getElementById('adjustForm');
const adjustModalTitle = document.getElementById('adjustModalTitle');
const adjustProdName = document.getElementById('adjustProdName');
const adjustHeader = document.getElementById('adjustHeader');
const confirmAdjustBtn = document.getElementById('confirmAdjustBtn');
const closeAdjustBtn = document.getElementById('closeAdjustBtn');
const cancelAdjustBtn = document.getElementById('cancelAdjustBtn');

const skuModal = document.getElementById('skuModal');
const skuForm = document.getElementById('skuForm');
const skuModalTitle = document.getElementById('skuModalTitle');
const openAddProductBtn = document.getElementById('openAddProductBtn');
const closeSkuBtn = document.getElementById('closeSkuBtn');
const cancelSkuBtn = document.getElementById('cancelSkuBtn');

const clearLogBtn = document.getElementById('clearLogBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderAll();
});

function loadData() {
  const p = localStorage.getItem(STORAGE_INVENTORY_KEY);
  products = p ? JSON.parse(p) : [...initialProducts];
  if (!p) saveProducts();

  const m = localStorage.getItem(STORAGE_MOVEMENTS_KEY);
  movements = m ? JSON.parse(m) : [...initialMovements];
  if (!m) saveMovements();
}

function saveProducts() {
  localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(products));
}

function saveMovements() {
  localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(movements));
}

function setupEventListeners() {
  searchInput.addEventListener('input', renderProducts);
  categoryFilter.addEventListener('change', renderProducts);
  stockFilter.addEventListener('change', renderProducts);

  openAddProductBtn.addEventListener('click', () => openSkuModal());
  closeSkuBtn.addEventListener('click', () => skuModal.classList.add('hidden'));
  cancelSkuBtn.addEventListener('click', () => skuModal.classList.add('hidden'));
  skuForm.addEventListener('submit', handleSkuSubmit);

  closeAdjustBtn.addEventListener('click', () => adjustModal.classList.add('hidden'));
  cancelAdjustBtn.addEventListener('click', () => adjustModal.classList.add('hidden'));
  adjustForm.addEventListener('submit', handleAdjustSubmit);

  clearLogBtn.addEventListener('click', () => {
    movements = [];
    saveMovements();
    renderTerminal();
  });

  exportCsvBtn.addEventListener('click', exportInventoryCsv);
}

function openSkuModal(prod = null) {
  skuForm.reset();
  if (prod) {
    skuModalTitle.textContent = 'UPDATE SKU RECORD';
    document.getElementById('skuHiddenId').value = prod.id;
    document.getElementById('skuCode').value = prod.sku;
    document.getElementById('skuName').value = prod.name;
    document.getElementById('skuCategory').value = prod.category;
    document.getElementById('skuPrice').value = prod.price;
    document.getElementById('skuQty').value = prod.quantity;
    document.getElementById('skuThreshold').value = prod.reorderLevel;
    document.getElementById('skuSupplier').value = prod.supplier || '';
  } else {
    skuModalTitle.textContent = 'REGISTER NEW SKU RECORD';
    document.getElementById('skuHiddenId').value = '';
    document.getElementById('skuThreshold').value = 5;
  }
  skuModal.classList.remove('hidden');
}

function handleSkuSubmit(e) {
  e.preventDefault();
  const idHidden = document.getElementById('skuHiddenId').value;
  const sku = document.getElementById('skuCode').value.trim().toUpperCase();
  const name = document.getElementById('skuName').value.trim();
  const category = document.getElementById('skuCategory').value;
  const price = parseFloat(document.getElementById('skuPrice').value) || 0;
  const quantity = parseInt(document.getElementById('skuQty').value, 10) || 0;
  const reorderLevel = parseInt(document.getElementById('skuThreshold').value, 10) || 5;
  const supplier = document.getElementById('skuSupplier').value.trim();

  if (idHidden) {
    const idx = products.findIndex(p => p.id === idHidden);
    if (idx !== -1) {
      products[idx] = { ...products[idx], sku, name, category, price, quantity, reorderLevel, supplier };
      showToast(`SKU ${sku} modified`, 'success');
    }
  } else {
    const newP = {
      id: 'PRD-' + Math.floor(100 + Math.random() * 900),
      sku,
      name,
      category,
      price,
      quantity,
      reorderLevel,
      supplier
    };
    products.unshift(newP);
    logMovement('IN', newP.id, newP.name, quantity, quantity, 'SKU Initial Inbound');
    showToast(`SKU ${sku} registered in WMS`, 'success');
  }

  saveProducts();
  skuModal.classList.add('hidden');
  renderAll();
}

// Rapid Inline Stepper: direct +1 or -1 from matrix row!
function stepQuantity(id, delta) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  if (delta < 0 && p.quantity <= 0) {
    showToast(`SKU ${p.sku} is already at zero stock!`, 'error');
    return;
  }

  const type = delta > 0 ? 'IN' : 'OUT';
  const qty = Math.abs(delta);
  p.quantity += delta;

  saveProducts();
  logMovement(type, p.id, p.name, qty, p.quantity, `Rapid ${type === 'IN' ? 'Restock' : 'Dispatch'} (±1 step)`);
  renderAll();
}

function openAdjustModal(id, type) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  adjustForm.reset();
  document.getElementById('adjustProdId').value = p.id;
  document.getElementById('adjustType').value = type;
  adjustProdName.textContent = `[${p.sku}] ${p.name} (Cur: ${p.quantity})`;

  if (type === 'IN') {
    adjustHeader.className = 'p-4 bg-emerald-500 text-black flex justify-between items-center font-bold';
    adjustModalTitle.textContent = 'RESTOCK SHIPMENT (STOCK IN)';
    confirmAdjustBtn.className = 'px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-bold';
  } else {
    adjustHeader.className = 'p-4 bg-amber-500 text-black flex justify-between items-center font-bold';
    adjustModalTitle.textContent = 'DISPATCH SHIPMENT (STOCK OUT)';
    confirmAdjustBtn.className = 'px-4 py-1.5 rounded-lg bg-amber-500 text-black font-bold';
  }

  adjustModal.classList.remove('hidden');
}

function handleAdjustSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('adjustProdId').value;
  const type = document.getElementById('adjustType').value;
  const qty = parseInt(document.getElementById('adjustQty').value, 10);
  const note = document.getElementById('adjustNote').value.trim() || (type === 'IN' ? 'Warehouse PO Delivery' : 'Outbound Dispatch');

  const p = products.find(item => item.id === id);
  if (!p) return;

  if (type === 'OUT' && qty > p.quantity) {
    showToast(`Cannot dispatch ${qty} units. Only ${p.quantity} available!`, 'error');
    return;
  }

  if (type === 'IN') p.quantity += qty;
  else p.quantity -= qty;

  saveProducts();
  logMovement(type, p.id, p.name, qty, p.quantity, note);

  adjustModal.classList.add('hidden');
  showToast(`Inventory updated: ${p.sku} = ${p.quantity} units`, 'success');
  renderAll();
}

function logMovement(type, productId, productName, qty, balance, note) {
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
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
  updateHUD();
  renderProducts();
  renderTerminal();
}

function updateHUD() {
  hudSkus.textContent = products.length;
  const totalVal = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  hudValuation.textContent = '$' + totalVal.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const low = products.filter(p => p.quantity <= p.reorderLevel).length;
  hudLowStock.textContent = `${low} CRITICAL`;
}

function renderProducts() {
  const query = searchInput.value.toLowerCase().trim();
  const cat = categoryFilter.value;
  const stock = stockFilter.value;

  const filtered = products.filter(p => {
    const matchesQuery = !query ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.supplier && p.supplier.toLowerCase().includes(query));

    const matchesCat = !cat || p.category === cat;

    let matchesStock = true;
    if (stock === 'critical') matchesStock = p.quantity <= p.reorderLevel;
    if (stock === 'normal') matchesStock = p.quantity > p.reorderLevel;

    return matchesQuery && matchesCat && matchesStock;
  });

  productGrid.innerHTML = '';
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  filtered.forEach(p => {
    const isOut = p.quantity === 0;
    const isLow = p.quantity > 0 && p.quantity <= p.reorderLevel;

    const row = document.createElement('div');
    row.className = `p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
      isOut ? 'bg-rose-950/20 border-rose-900/40' : isLow ? 'bg-amber-950/20 border-amber-900/40' : 'bg-[#111827] border-slate-800'
    }`;

    row.innerHTML = `
      <div class="flex items-center space-x-3 min-w-0">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isOut ? 'bg-rose-500/20 text-rose-400' : isLow ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
        }">
          <i class="fa-solid fa-box text-sm"></i>
        </div>
        <div class="min-w-0">
          <div class="flex items-center space-x-2">
            <span class="font-mono text-xs font-bold text-amber-400">${p.sku}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">${p.category}</span>
          </div>
          <h4 class="font-bold text-sm text-white truncate mt-0.5">${escapeHtml(p.name)}</h4>
          <p class="text-[11px] text-slate-400 font-mono">
            Unit: $${p.price.toFixed(2)} • Reorder Threshold: ${p.reorderLevel} • Total: <strong class="text-slate-200">$${(p.price * p.quantity).toFixed(2)}</strong>
          </p>
        </div>
      </div>

      <!-- Live Stepper & Bulk Controls -->
      <div class="flex items-center space-x-3 shrink-0 justify-between md:justify-end">
        <!-- Rapid Inline Stepper (- / +) -->
        <div class="flex items-center bg-[#0b0f19] border border-slate-700 rounded-lg p-0.5 font-mono">
          <button onclick="stepQuantity('${p.id}', -1)" title="Rapid Dispatch -1" class="w-7 h-7 rounded hover:bg-slate-800 text-slate-300 hover:text-rose-400 font-bold transition flex items-center justify-center">
            -
          </button>
          <span class="w-12 text-center text-xs font-bold ${isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}">
            ${p.quantity}
          </span>
          <button onclick="stepQuantity('${p.id}', 1)" title="Rapid Restock +1" class="w-7 h-7 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400 font-bold transition flex items-center justify-center">
            +
          </button>
        </div>

        <!-- Bulk Modal Buttons -->
        <div class="flex items-center space-x-1.5 font-mono text-xs">
          <button onclick="openAdjustModal('${p.id}', 'IN')" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition text-[11px]">
            +Bulk In
          </button>
          <button onclick="openAdjustModal('${p.id}', 'OUT')" class="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition text-[11px]">
            -Bulk Out
          </button>
          <button onclick="editSku('${p.id}')" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
          <button onclick="deleteSku('${p.id}')" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>
    `;
    productGrid.appendChild(row);
  });
}

function renderTerminal() {
  terminalContainer.innerHTML = '';
  if (movements.length === 0) {
    terminalContainer.innerHTML = `<div class="text-slate-600 text-center py-8">NO ACTIVITY TELEMETRY RECORDED</div>`;
    return;
  }

  movements.slice(0, 30).forEach(m => {
    const isIN = m.type === 'IN';
    const item = document.createElement('div');
    item.className = 'p-2 rounded bg-[#0b0f19] border border-slate-800/80 leading-relaxed';

    item.innerHTML = `
      <div class="flex items-center justify-between text-[10px]">
        <span class="${isIN ? 'text-emerald-400' : 'text-amber-400'} font-bold">
          [${isIN ? 'RESTOCK / INBOUND' : 'DISPATCH / OUTBOUND'}]
        </span>
        <span class="text-slate-500">${m.timestamp}</span>
      </div>
      <div class="text-white text-[11px] truncate mt-0.5">${escapeHtml(m.productName)}</div>
      <div class="text-[10px] text-slate-400 flex justify-between mt-1 pt-1 border-t border-slate-800">
        <span>DELTA: <strong class="${isIN ? 'text-emerald-400' : 'text-amber-400'}">${isIN ? '+' : '-'}${m.quantity}</strong> (BAL: ${m.balance})</span>
        <span class="text-slate-500 truncate max-w-[140px]">${escapeHtml(m.note || '-')}</span>
      </div>
    `;
    terminalContainer.appendChild(item);
  });
}

function editSku(id) {
  const p = products.find(item => item.id === id);
  if (p) openSkuModal(p);
}

function deleteSku(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  if (confirm(`Decommission SKU ${p.sku} from active warehouse?`)) {
    products = products.filter(item => item.id !== id);
    saveProducts();
    renderAll();
    showToast(`SKU ${p.sku} decommissioned`, 'info');
  }
}

function exportInventoryCsv() {
  if (products.length === 0) return;
  const headers = ['SKU', 'Product Name', 'Category', 'Unit Price ($)', 'Quantity', 'Reorder Level', 'Total Value ($)', 'Supplier'];
  const rows = products.map(p => [
    `"${p.sku}"`, `"${p.name}"`, `"${p.category}"`, p.price.toFixed(2), p.quantity, p.reorderLevel, (p.price * p.quantity).toFixed(2), `"${p.supplier || ''}"`
  ]);
  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', `StockMaster_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Inventory CSV exported', 'success');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast-enter pointer-events-auto bg-[#111827] text-white shadow-xl px-4 py-2.5 rounded-xl flex items-center space-x-2.5 text-xs min-w-[240px] border border-amber-500/40 font-mono';
  toast.innerHTML = `<i class="fa-solid fa-microchip text-amber-400"></i><span class="font-medium">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-200');
    setTimeout(() => toast.remove(), 200);
  }, 2500);
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

window.stepQuantity = stepQuantity;
window.openAdjustModal = openAdjustModal;
window.editSku = editSku;
window.deleteSku = deleteSku;
