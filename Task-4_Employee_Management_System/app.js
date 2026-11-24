/**
 * Task 4 - Employee Management System (StaffPulse HR)
 * Archetype: Corporate HR Bento Directory & Org Hierarchy
 */

const STORAGE_STAFF_KEY = 'auspify_staff_employees_v1';

const initialEmployees = [
  {
    id: 'EMP-001',
    code: 'AUS-ENG-01',
    name: 'David Hartono',
    email: 'david.hartono@auspify.com',
    phone: '+62 811-2233-4455',
    department: 'Engineering',
    role: 'Lead Full-Stack Architect',
    salary: 7500,
    type: 'Full-Time',
    status: 'Active',
    joinDate: '2023-01-15',
    avatarBg: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'EMP-002',
    code: 'AUS-DES-08',
    name: 'Clarissa Tanuwidjaja',
    email: 'clarissa.tan@auspify.com',
    phone: '+62 812-4455-6677',
    department: 'Product & Design',
    role: 'Principal UX Designer',
    salary: 6200,
    type: 'Full-Time',
    status: 'Active',
    joinDate: '2023-06-01',
    avatarBg: 'from-purple-600 to-pink-600'
  },
  {
    id: 'EMP-003',
    code: 'AUS-HR-03',
    name: 'Nadia Pratiwi',
    email: 'nadia.pratiwi@auspify.com',
    phone: '+62 813-7788-9900',
    department: 'Human Resources',
    role: 'HR & Talent Acquisition Lead',
    salary: 4800,
    type: 'Full-Time',
    status: 'Active',
    joinDate: '2022-11-10',
    avatarBg: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'EMP-004',
    code: 'AUS-MKT-12',
    name: 'Kevin Wijaya',
    email: 'kevin.w@auspify.com',
    phone: '+62 819-3322-1144',
    department: 'Marketing & Sales',
    role: 'Growth Marketing Manager',
    salary: 5100,
    type: 'Full-Time',
    status: 'On Leave',
    joinDate: '2024-02-01',
    avatarBg: 'from-amber-500 to-orange-600'
  },
  {
    id: 'EMP-005',
    code: 'AUS-FIN-02',
    name: 'Agus Setiawan',
    email: 'agus.setiawan@auspify.com',
    phone: '+62 822-6677-8899',
    department: 'Finance & Accounting',
    role: 'Financial Analyst',
    salary: 4500,
    type: 'Full-Time',
    status: 'Active',
    joinDate: '2023-09-15',
    avatarBg: 'from-cyan-600 to-blue-700'
  },
  {
    id: 'EMP-006',
    code: 'AUS-INT-09',
    name: 'Rina Kusuma',
    email: 'rina.kusuma@auspify.com',
    phone: '+62 857-8899-0011',
    department: 'Engineering',
    role: 'Junior Frontend Developer',
    salary: 1800,
    type: 'Internship',
    status: 'Active',
    joinDate: '2026-09-01',
    avatarBg: 'from-sky-500 to-indigo-600'
  }
];

let employees = [];
let selectedDepartment = '';
let currentView = 'team'; // 'team', 'org', 'payroll'

// DOM Elements
const secDirectory = document.getElementById('secDirectory');
const secOrgChart = document.getElementById('secOrgChart');
const secPayroll = document.getElementById('secPayroll');
const employeeCardGrid = document.getElementById('employeeCardGrid');
const emptyStaffState = document.getElementById('emptyStaffState');
const searchStaffInput = document.getElementById('searchStaffInput');
const typeFilter = document.getElementById('typeFilter');
const currentDeptTitle = document.getElementById('currentDeptTitle');
const currentDeptSubtitle = document.getElementById('currentDeptSubtitle');
const sidebarCountBadge = document.getElementById('sidebarCountBadge');
const sidebarPayrollTotal = document.getElementById('sidebarPayrollTotal');
const orgTreeContainer = document.getElementById('orgTreeContainer');
const deptBudgetGrid = document.getElementById('deptBudgetGrid');

// Nav Buttons
const viewTeamBtn = document.getElementById('viewTeamBtn');
const viewOrgChartBtn = document.getElementById('viewOrgChartBtn');
const viewPayrollBtn = document.getElementById('viewPayrollBtn');

// Modal Elements
const employeeModal = document.getElementById('employeeModal');
const employeeForm = document.getElementById('employeeForm');
const employeeModalTitle = document.getElementById('employeeModalTitle');
const openRegisterModalBtn = document.getElementById('openRegisterModalBtn');
const closeEmployeeModalBtn = document.getElementById('closeEmployeeModalBtn');
const cancelEmployeeBtn = document.getElementById('cancelEmployeeBtn');
const exportPayrollBtn = document.getElementById('exportPayrollBtn');

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderAll();
});

function loadData() {
  const stored = localStorage.getItem(STORAGE_STAFF_KEY);
  employees = stored ? JSON.parse(stored) : [...initialEmployees];
  if (!stored) saveData();
}

function saveData() {
  localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(employees));
}

function setupEventListeners() {
  viewTeamBtn.addEventListener('click', () => switchView('team'));
  viewOrgChartBtn.addEventListener('click', () => switchView('org'));
  viewPayrollBtn.addEventListener('click', () => switchView('payroll'));

  searchStaffInput.addEventListener('input', renderDirectory);
  typeFilter.addEventListener('change', renderDirectory);

  openRegisterModalBtn.addEventListener('click', () => openEmployeeModal());
  closeEmployeeModalBtn.addEventListener('click', () => employeeModal.classList.add('hidden'));
  cancelEmployeeBtn.addEventListener('click', () => employeeModal.classList.add('hidden'));
  employeeForm.addEventListener('submit', handleEmployeeSubmit);

  exportPayrollBtn.addEventListener('click', exportStaffCsv);
}

function switchView(view) {
  currentView = view;
  secDirectory.classList.add('hidden');
  secOrgChart.classList.add('hidden');
  secPayroll.classList.add('hidden');

  viewTeamBtn.className = 'w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-600 font-medium transition';
  viewOrgChartBtn.className = 'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-600 font-medium transition';
  viewPayrollBtn.className = 'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-600 font-medium transition';

  if (view === 'team') {
    secDirectory.classList.remove('hidden');
    viewTeamBtn.className = 'w-full flex items-center justify-between px-3 py-2 rounded-xl bg-sky-50 text-sky-700 font-semibold transition';
    renderDirectory();
  } else if (view === 'org') {
    secOrgChart.classList.remove('hidden');
    viewOrgChartBtn.className = 'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-sky-50 text-sky-700 font-semibold transition';
    renderOrgChart();
  } else if (view === 'payroll') {
    secPayroll.classList.remove('hidden');
    viewPayrollBtn.className = 'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-sky-50 text-sky-700 font-semibold transition';
    renderDeptBudgets();
  }
}

function filterByDept(dept) {
  selectedDepartment = dept;

  document.querySelectorAll('.dept-nav-btn').forEach(btn => {
    const btnDept = btn.getAttribute('data-dept') ?? '';
    if (btnDept === dept) {
      btn.className = 'dept-nav-btn active w-full text-left px-3 py-1.5 rounded-lg font-semibold text-slate-900 bg-sky-50 border-l-2 border-sky-600 transition flex items-center justify-between text-xs';
    } else {
      btn.className = 'dept-nav-btn w-full text-left px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition flex items-center justify-between text-xs';
    }
  });

  if (dept) {
    currentDeptTitle.textContent = `${dept} Team`;
    currentDeptSubtitle.textContent = `Active personnel allocated to ${dept}`;
  } else {
    currentDeptTitle.textContent = 'Workforce Directory';
    currentDeptSubtitle.textContent = 'Showing all registered corporate personnel and team designations';
  }

  switchView('team');
}

function openEmployeeModal(emp = null) {
  employeeForm.reset();
  if (emp) {
    employeeModalTitle.textContent = 'Edit Employee Profile';
    document.getElementById('employeeIdHidden').value = emp.id;
    document.getElementById('employeeCode').value = emp.code;
    document.getElementById('employeeName').value = emp.name;
    document.getElementById('employeeEmail').value = emp.email;
    document.getElementById('employeePhone').value = emp.phone || '';
    document.getElementById('employeeDepartment').value = emp.department;
    document.getElementById('employeeRole').value = emp.role;
    document.getElementById('employeeSalary').value = emp.salary;
    document.getElementById('employeeType').value = emp.type;
    document.getElementById('employeeJoinDate').value = emp.joinDate || '';
    document.getElementById('employeeStatus').value = emp.status || 'Active';
  } else {
    employeeModalTitle.textContent = 'Register New Employee';
    document.getElementById('employeeIdHidden').value = '';
    document.getElementById('employeeJoinDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('employeeStatus').value = 'Active';
  }
  employeeModal.classList.remove('hidden');
}

function handleEmployeeSubmit(e) {
  e.preventDefault();
  const idHidden = document.getElementById('employeeIdHidden').value;
  const code = document.getElementById('employeeCode').value.trim();
  const name = document.getElementById('employeeName').value.trim();
  const email = document.getElementById('employeeEmail').value.trim();
  const phone = document.getElementById('employeePhone').value.trim();
  const department = document.getElementById('employeeDepartment').value;
  const role = document.getElementById('employeeRole').value.trim();
  const salary = parseFloat(document.getElementById('employeeSalary').value) || 0;
  const type = document.getElementById('employeeType').value;
  const joinDate = document.getElementById('employeeJoinDate').value;
  const status = document.getElementById('employeeStatus').value;

  const bgs = ['from-blue-600 to-indigo-700', 'from-purple-600 to-pink-600', 'from-emerald-600 to-teal-700', 'from-amber-500 to-orange-600'];
  const avatarBg = bgs[Math.floor(Math.random() * bgs.length)];

  if (idHidden) {
    const idx = employees.findIndex(item => item.id === idHidden);
    if (idx !== -1) {
      employees[idx] = { ...employees[idx], code, name, email, phone, department, role, salary, type, joinDate, status };
      showToast('Employee profile updated', 'success');
    }
  } else {
    const newEmp = {
      id: 'EMP-' + Math.floor(100 + Math.random() * 900),
      code,
      name,
      email,
      phone,
      department,
      role,
      salary,
      type,
      joinDate,
      status,
      avatarBg
    };
    employees.unshift(newEmp);
    showToast('Employee registered successfully', 'success');
  }

  saveData();
  employeeModal.classList.add('hidden');
  renderAll();
}

function deleteEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  if (confirm(`Remove ${emp.name} (${emp.code}) from organization registry?`)) {
    employees = employees.filter(e => e.id !== id);
    saveData();
    renderAll();
    showToast('Employee record deleted', 'info');
  }
}

function renderAll() {
  updateDeptBadges();
  const totalPayroll = employees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0);
  sidebarPayrollTotal.textContent = '$' + totalPayroll.toLocaleString('en-US');

  if (currentView === 'team') renderDirectory();
  else if (currentView === 'org') renderOrgChart();
  else if (currentView === 'payroll') renderDeptBudgets();
}

function updateDeptBadges() {
  const badgeAll = document.getElementById('badgeDeptAll');
  if (badgeAll) badgeAll.textContent = employees.length;
  const badgeEng = document.getElementById('badgeDeptEng');
  if (badgeEng) badgeEng.textContent = employees.filter(e => e.department === 'Engineering').length;
  const badgeDesign = document.getElementById('badgeDeptDesign');
  if (badgeDesign) badgeDesign.textContent = employees.filter(e => e.department === 'Product & Design').length;
  const badgeHR = document.getElementById('badgeDeptHR');
  if (badgeHR) badgeHR.textContent = employees.filter(e => e.department === 'Human Resources').length;
  const badgeMkt = document.getElementById('badgeDeptMkt');
  if (badgeMkt) badgeMkt.textContent = employees.filter(e => e.department === 'Marketing & Sales').length;
  const badgeFin = document.getElementById('badgeDeptFin');
  if (badgeFin) badgeFin.textContent = employees.filter(e => e.department === 'Finance & Accounting').length;
}

function renderDirectory() {
  const query = searchStaffInput.value.toLowerCase().trim();
  const type = typeFilter.value;

  const filtered = employees.filter(e => {
    const matchesQuery = !query ||
      e.name.toLowerCase().includes(query) ||
      e.code.toLowerCase().includes(query) ||
      e.role.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query);

    const matchesDept = !selectedDepartment || e.department === selectedDepartment;
    const matchesType = !type || e.type === type;

    return matchesQuery && matchesDept && matchesType;
  });

  // Keep sidebar count badge synchronized with current filtered department count
  sidebarCountBadge.textContent = filtered.length;

  employeeCardGrid.innerHTML = '';
  if (filtered.length === 0) {
    emptyStaffState.classList.remove('hidden');
    return;
  }
  emptyStaffState.classList.add('hidden');

  filtered.forEach(e => {
    const initials = e.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const bg = e.avatarBg || 'from-sky-600 to-blue-700';

    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group';

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${bg} text-white font-bold flex items-center justify-center text-sm shadow-xs">
              ${initials}
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">${escapeHtml(e.name)}</h4>
              <p class="text-xs font-semibold text-sky-600">${escapeHtml(e.role)}</p>
              <p class="text-[10px] text-slate-400 font-mono mt-0.5">${e.code} • ${e.department}</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
            e.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }">
            ${e.status}
          </span>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div class="bg-slate-50 p-2.5 rounded-xl">
            <span class="text-slate-400 text-[10px] block">COMPENSATION</span>
            <span class="font-bold text-slate-800 text-xs">$${e.salary.toLocaleString('en-US')} / mo</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-xl">
            <span class="text-slate-400 text-[10px] block">EMPLOYMENT</span>
            <span class="font-medium text-slate-700 text-xs">${e.type}</span>
          </div>
        </div>

        <div class="mt-3 space-y-1 text-[11px] text-slate-500">
          <div class="flex items-center space-x-2">
            <i class="fa-regular fa-envelope text-slate-400 w-3.5"></i>
            <span class="truncate">${escapeHtml(e.email)}</span>
          </div>
          <div class="flex items-center space-x-2">
            <i class="fa-solid fa-phone text-slate-400 w-3.5"></i>
            <span>${escapeHtml(e.phone || 'N/A')}</span>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end space-x-1.5 text-xs">
        <button onclick="editEmployee('${e.id}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition text-[11px]">
          <i class="fa-solid fa-pen mr-1"></i> Edit
        </button>
        <button onclick="deleteEmployee('${e.id}')" class="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium transition text-[11px]">
          <i class="fa-solid fa-trash mr-1"></i> Remove
        </button>
      </div>
    `;
    employeeCardGrid.appendChild(card);
  });
}

function renderOrgChart() {
  const depts = ['Engineering', 'Product & Design', 'Human Resources', 'Marketing & Sales', 'Finance & Accounting'];

  orgTreeContainer.innerHTML = `
    <!-- Top Level: Executive Leadership Node -->
    <div class="flex flex-col items-center">
      <div class="inline-block p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white shadow-md text-xs text-center border border-slate-700 min-w-[260px] z-10">
        <span class="text-[10px] font-mono text-sky-300 block uppercase font-bold tracking-wider">Chief Executive Leadership</span>
        <h3 class="font-bold text-sm mt-0.5">Auspify Executive Board</h3>
        <p class="text-[11px] text-slate-300 mt-1">${employees.length} Total Registered Personnel</p>
      </div>
    </div>

    <!-- Continuous SVG Tree Connector System (100% Unbroken Lines) -->
    <div class="w-full max-w-6xl mx-auto hidden lg:block -mt-1">
      <svg viewBox="0 0 1000 60" preserveAspectRatio="none" class="w-full h-12 stroke-sky-400 fill-none" style="stroke-width: 2.5px;">
        <!-- Vertical Stem from Executive down to the horizontal busbar -->
        <line x1="500" y1="0" x2="500" y2="30" />
        <!-- Horizontal busbar connecting all 5 department branches -->
        <line x1="100" y1="30" x2="900" y2="30" />
        <!-- Vertical drop lines directly touching each of the 5 department cards -->
        <line x1="100" y1="30" x2="100" y2="60" />
        <line x1="300" y1="30" x2="300" y2="60" />
        <line x1="500" y1="30" x2="500" y2="60" />
        <line x1="700" y1="30" x2="700" y2="60" />
        <line x1="900" y1="30" x2="900" y2="60" />
      </svg>
    </div>

    <!-- 5 Connected Department Columns -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto -mt-1">
      ${depts.map((d, idx) => {
        const team = employees.filter(e => e.department === d);
        return `
          <div class="w-full">
            <!-- Mobile/Tablet Top Connector Pin -->
            <div class="lg:hidden w-0.5 h-4 bg-sky-400 mx-auto mb-1"></div>

            <!-- Department Box Node -->
            <div class="w-full bg-slate-50 p-3.5 rounded-2xl border-2 border-sky-200/90 hover:border-sky-400 shadow-2xs text-xs space-y-2.5 transition">
              <div class="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span class="font-bold text-slate-900 truncate">${d}</span>
                <span class="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full shrink-0">${team.length}</span>
              </div>
              <div class="space-y-2">
                ${team.length ? team.map(m => `
                  <div class="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                    <h5 class="font-bold text-slate-900 text-xs truncate">${escapeHtml(m.name)}</h5>
                    <p class="text-[10px] text-sky-600 font-medium truncate">${escapeHtml(m.role)}</p>
                    <span class="text-[9px] font-mono text-slate-400 mt-1 block">${m.type}</span>
                  </div>
                `).join('') : '<p class="text-slate-400 text-[11px] py-1 text-center font-medium">No personnel</p>'}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderDeptBudgets() {
  const depts = ['Engineering', 'Product & Design', 'Human Resources', 'Marketing & Sales', 'Finance & Accounting'];
  deptBudgetGrid.innerHTML = '';

  depts.forEach(d => {
    const team = employees.filter(e => e.department === d);
    const totalSalary = team.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0);
    const avgSalary = team.length ? Math.round(totalSalary / team.length) : 0;

    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <h4 class="font-bold text-slate-800 text-sm">${d}</h4>
        <span class="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">${team.length} Staff</span>
      </div>
      <div class="space-y-2 text-xs">
        <div class="flex justify-between text-slate-500">
          <span>Monthly Payroll Allocation:</span>
          <strong class="text-slate-900">$${totalSalary.toLocaleString('en-US')}</strong>
        </div>
        <div class="flex justify-between text-slate-500">
          <span>Average Compensation:</span>
          <span class="font-medium text-slate-700">$${avgSalary.toLocaleString('en-US')}</span>
        </div>
      </div>
      <div class="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px]">
        <span class="text-emerald-600 font-semibold">Active & Funded</span>
        <button onclick="filterByDept('${d}')" class="text-sky-600 hover:underline font-semibold">View Staff →</button>
      </div>
    `;
    deptBudgetGrid.appendChild(card);
  });
}

function editEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (emp) openEmployeeModal(emp);
}

function exportStaffCsv() {
  if (employees.length === 0) return;
  const headers = ['ID', 'Code', 'Name', 'Email', 'Phone', 'Department', 'Role', 'Salary', 'Type', 'Status'];
  const rows = employees.map(e => [e.id, `"${e.code}"`, `"${e.name}"`, `"${e.email}"`, `"${e.phone || ''}"`, `"${e.department}"`, `"${e.role}"`, e.salary, `"${e.type}"`, `"${e.status}"`]);
  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', `StaffPulse_Workforce_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Staff workforce report exported', 'success');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast-enter pointer-events-auto bg-slate-900 text-white shadow-xl px-4 py-2.5 rounded-xl flex items-center space-x-2.5 text-xs min-w-[240px] border border-slate-700';
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-sky-400"></i><span class="font-medium">${message}</span>`;
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

window.filterByDept = filterByDept;
window.switchView = switchView;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
