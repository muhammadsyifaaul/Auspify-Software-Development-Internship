/**
 * Task 4 - Employee Management System
 * Auspify Technologies Software Development Internship
 * Features:
 * - Employee Records Management (Add, Edit, View, Delete)
 * - Department Breakdown & Headcount / Budget allocation analytics
 * - Real-time Search and Multi-filter (Department, Employment Type, Status)
 * - Monthly Payroll Calculation & Summary
 * - CSV Payroll Export & LocalStorage persistence
 */

const STORAGE_STAFF_KEY = 'auspify_staff_employees_v1';

// Initial Mock Seed Employees
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
    joinDate: '2023-01-15'
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
    joinDate: '2023-06-01'
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
    joinDate: '2022-11-10'
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
    joinDate: '2024-02-01'
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
    joinDate: '2023-09-15'
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
    joinDate: '2026-09-01'
  }
];

let employees = [];

// DOM References
const employeesSection = document.getElementById('employeesSection');
const departmentsSection = document.getElementById('departmentsSection');
const tabEmployeesBtn = document.getElementById('tabEmployeesBtn');
const tabDepartmentsBtn = document.getElementById('tabDepartmentsBtn');
const departmentCardsContainer = document.getElementById('departmentCardsContainer');

// KPI Stats
const statTotalEmployees = document.getElementById('statTotalEmployees');
const statMonthlyPayroll = document.getElementById('statMonthlyPayroll');
const statDepartmentCount = document.getElementById('statDepartmentCount');
const statAvgSalary = document.getElementById('statAvgSalary');

// Table & Filters
const employeeTableBody = document.getElementById('employeeTableBody');
const staffEmptyState = document.getElementById('staffEmptyState');
const staffCountLabel = document.getElementById('staffCountLabel');
const searchStaffInput = document.getElementById('searchStaffInput');
const departmentFilter = document.getElementById('departmentFilter');
const employmentFilter = document.getElementById('employmentFilter');
const resetStaffFilterBtn = document.getElementById('resetStaffFilterBtn');
const exportStaffBtn = document.getElementById('exportStaffBtn');

// Modal
const employeeModal = document.getElementById('employeeModal');
const employeeForm = document.getElementById('employeeForm');
const employeeModalTitle = document.getElementById('employeeModalTitle');
const openAddStaffModalBtn = document.getElementById('openAddStaffModalBtn');
const closeEmployeeModalBtn = document.getElementById('closeEmployeeModalBtn');
const cancelEmployeeBtn = document.getElementById('cancelEmployeeBtn');

// Profile Modal
const viewEmployeeModal = document.getElementById('viewEmployeeModal');
const viewEmpContent = document.getElementById('viewEmpContent');
const closeViewEmpBtn = document.getElementById('closeViewEmpBtn');
const closeViewEmpBtn2 = document.getElementById('closeViewEmpBtn2');

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderAll();
});

function loadData() {
  const stored = localStorage.getItem(STORAGE_STAFF_KEY);
  if (stored) {
    try {
      employees = JSON.parse(stored);
    } catch (e) {
      employees = [...initialEmployees];
    }
  } else {
    employees = [...initialEmployees];
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(employees));
}

function setupEventListeners() {
  // Tabs
  tabEmployeesBtn.addEventListener('click', () => switchTab('employees'));
  tabDepartmentsBtn.addEventListener('click', () => switchTab('departments'));

  // Modals
  openAddStaffModalBtn.addEventListener('click', () => openEmployeeModal());
  closeEmployeeModalBtn.addEventListener('click', () => employeeModal.classList.add('hidden'));
  cancelEmployeeBtn.addEventListener('click', () => employeeModal.classList.add('hidden'));
  employeeForm.addEventListener('submit', handleEmployeeSubmit);

  closeViewEmpBtn.addEventListener('click', () => viewEmployeeModal.classList.add('hidden'));
  closeViewEmpBtn2.addEventListener('click', () => viewEmployeeModal.classList.add('hidden'));

  // Search & Filters
  searchStaffInput.addEventListener('input', renderEmployees);
  departmentFilter.addEventListener('change', renderEmployees);
  employmentFilter.addEventListener('change', renderEmployees);
  resetStaffFilterBtn.addEventListener('click', () => {
    searchStaffInput.value = '';
    departmentFilter.value = '';
    employmentFilter.value = '';
    renderEmployees();
  });

  exportStaffBtn.addEventListener('click', exportStaffCsv);

  window.addEventListener('click', (e) => {
    if (e.target === employeeModal) employeeModal.classList.add('hidden');
    if (e.target === viewEmployeeModal) viewEmployeeModal.classList.add('hidden');
  });
}

function switchTab(tab) {
  if (tab === 'employees') {
    employeesSection.classList.remove('hidden');
    departmentsSection.classList.add('hidden');
    tabEmployeesBtn.className = 'py-3 px-1 border-b-2 border-sky-600 text-sky-700 flex items-center space-x-2 transition';
    tabDepartmentsBtn.className = 'py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center space-x-2 transition';
  } else {
    employeesSection.classList.add('hidden');
    departmentsSection.classList.remove('hidden');
    tabDepartmentsBtn.className = 'py-3 px-1 border-b-2 border-sky-600 text-sky-700 flex items-center space-x-2 transition';
    tabEmployeesBtn.className = 'py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center space-x-2 transition';
    renderDepartments();
  }
}

function openEmployeeModal(emp = null) {
  employeeForm.reset();
  if (emp) {
    employeeModalTitle.textContent = 'Edit Employee Record';
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

  if (idHidden) {
    const idx = employees.findIndex(e => e.id === idHidden);
    if (idx !== -1) {
      employees[idx] = {
        ...employees[idx],
        code,
        name,
        email,
        phone,
        department,
        role,
        salary,
        type,
        joinDate,
        status
      };
      showToast('Employee information updated successfully!', 'success');
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
      status
    };
    employees.unshift(newEmp);
    showToast('New employee registered successfully!', 'success');
  }

  saveData();
  employeeModal.classList.add('hidden');
  renderAll();
}

function deleteEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  if (confirm(`Are you sure you want to delete employee record for ${emp.name} (${emp.code})?`)) {
    employees = employees.filter(e => e.id !== id);
    saveData();
    renderAll();
    showToast('Employee record deleted', 'info');
  }
}

function viewEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  const initials = emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  viewEmpContent.innerHTML = `
    <div class="w-20 h-20 rounded-full bg-sky-100 text-sky-800 mx-auto flex items-center justify-center font-bold text-2xl mb-3 border-2 border-sky-500 shadow-sm">
      ${initials}
    </div>
    <h4 class="text-xl font-bold text-slate-800">${escapeHtml(emp.name)}</h4>
    <p class="text-xs text-sky-600 font-semibold">${escapeHtml(emp.role)}</p>
    <p class="text-xs text-slate-400 font-mono mt-0.5">${emp.code} • ${emp.department}</p>

    <div class="mt-3 flex justify-center space-x-2">
      <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(emp.status)}">${emp.status}</span>
      <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">${emp.type}</span>
    </div>

    <div class="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2 text-xs text-slate-600">
      <div class="flex justify-between">
        <span class="text-slate-400">Monthly Compensation:</span>
        <span class="font-bold text-emerald-600">$${emp.salary.toLocaleString('en-US')} / month</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Email:</span>
        <span class="font-medium text-slate-700">${escapeHtml(emp.email)}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Phone:</span>
        <span class="font-medium text-slate-700">${escapeHtml(emp.phone || 'N/A')}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Date Joined:</span>
        <span class="font-medium text-slate-700">${emp.joinDate || 'N/A'}</span>
      </div>
    </div>
  `;

  viewEmployeeModal.classList.remove('hidden');
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'On Leave':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'Probation':
      return 'bg-sky-100 text-sky-800 border border-sky-200';
    case 'Terminated':
      return 'bg-rose-100 text-rose-800 border border-rose-200';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

function renderAll() {
  updateStats();
  renderEmployees();
  renderDepartments();
}

function updateStats() {
  statTotalEmployees.textContent = employees.length;

  const totalPayroll = employees.reduce((acc, e) => acc + (Number(e.salary) || 0), 0);
  statMonthlyPayroll.textContent = '$' + totalPayroll.toLocaleString('en-US');

  const depts = new Set(employees.map(e => e.department));
  statDepartmentCount.textContent = depts.size;

  const avgSalary = employees.length ? (totalPayroll / employees.length) : 0;
  statAvgSalary.textContent = '$' + Math.round(avgSalary).toLocaleString('en-US');
}

function renderEmployees() {
  const query = searchStaffInput.value.toLowerCase().trim();
  const dept = departmentFilter.value;
  const empType = employmentFilter.value;

  const filtered = employees.filter(e => {
    const matchesQuery = !query ||
      e.name.toLowerCase().includes(query) ||
      e.code.toLowerCase().includes(query) ||
      e.role.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query);

    const matchesDept = !dept || e.department === dept;
    const matchesType = !empType || e.type === empType;

    return matchesQuery && matchesDept && matchesType;
  });

  employeeTableBody.innerHTML = '';
  if (filtered.length === 0) {
    staffEmptyState.classList.remove('hidden');
    staffCountLabel.textContent = `Showing 0 of ${employees.length} employees`;
    return;
  }

  staffEmptyState.classList.add('hidden');
  staffCountLabel.textContent = `Showing ${filtered.length} of ${employees.length} employees`;

  filtered.forEach(e => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors border-b border-slate-100';

    const initials = e.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    tr.innerHTML = `
      <td class="py-4 px-6">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            ${initials}
          </div>
          <div>
            <div class="font-bold text-slate-800 cursor-pointer hover:text-sky-600 transition" onclick="viewEmployee('${e.id}')">
              ${escapeHtml(e.name)}
            </div>
            <div class="text-xs text-slate-400 font-mono">${escapeHtml(e.code)} • ${escapeHtml(e.email)}</div>
          </div>
        </div>
      </td>
      <td class="py-4 px-6">
        <div class="font-semibold text-slate-700">${escapeHtml(e.role)}</div>
        <div class="text-xs text-slate-500">${escapeHtml(e.department)}</div>
      </td>
      <td class="py-4 px-6 text-center">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          ${e.type}
        </span>
      </td>
      <td class="py-4 px-6 text-right font-bold text-slate-700">
        $${e.salary.toLocaleString('en-US')}
      </td>
      <td class="py-4 px-6 text-center text-xs text-slate-500">
        ${e.joinDate || '-'}
      </td>
      <td class="py-4 px-6 text-center">
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(e.status)}">
          ${e.status}
        </span>
      </td>
      <td class="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
        <button onclick="viewEmployee('${e.id}')" title="View Profile" class="w-8 h-8 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button onclick="editEmployee('${e.id}')" title="Edit Employee" class="w-8 h-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button onclick="deleteEmployee('${e.id}')" title="Delete Employee" class="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    employeeTableBody.appendChild(tr);
  });
}

function renderDepartments() {
  const depts = ['Engineering', 'Product & Design', 'Human Resources', 'Marketing & Sales', 'Finance & Accounting'];
  departmentCardsContainer.innerHTML = '';

  depts.forEach(d => {
    const staffInDept = employees.filter(e => e.department === d);
    const count = staffInDept.length;
    const deptBudget = staffInDept.reduce((acc, e) => acc + (Number(e.salary) || 0), 0);
    const activeStaff = staffInDept.filter(e => e.status === 'Active').length;

    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg">
            <i class="fa-solid fa-briefcase"></i>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            ${count} Members
          </span>
        </div>
        <h4 class="text-base font-bold text-slate-800">${d}</h4>
        <p class="text-xs text-slate-400 mt-1">Operational Division</p>
      </div>

      <div class="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
        <div class="flex justify-between">
          <span class="text-slate-500">Active Staff:</span>
          <span class="font-semibold text-emerald-600">${activeStaff} / ${count}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Monthly Payroll:</span>
          <span class="font-bold text-slate-800">$${deptBudget.toLocaleString('en-US')}</span>
        </div>
      </div>
    `;
    departmentCardsContainer.appendChild(card);
  });
}

function editEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (emp) openEmployeeModal(emp);
}

function exportStaffCsv() {
  if (employees.length === 0) {
    showToast('No employees to export!', 'error');
    return;
  }

  const headers = ['ID', 'Code', 'Full Name', 'Email', 'Phone', 'Department', 'Job Role', 'Monthly Salary ($)', 'Employment Type', 'Status', 'Date Joined'];
  const rows = employees.map(e => [
    e.id,
    `"${e.code}"`,
    `"${e.name}"`,
    `"${e.email}"`,
    `"${e.phone || ''}"`,
    `"${e.department}"`,
    `"${e.role}"`,
    e.salary,
    `"${e.type}"`,
    `"${e.status}"`,
    `"${e.joinDate || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Staff_Payroll_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Staff Payroll CSV exported successfully!', 'success');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  const icon = type === 'success' ? 'fa-circle-check text-emerald-500' : 
               type === 'error' ? 'fa-triangle-exclamation text-rose-500' : 'fa-circle-info text-sky-500';
  
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

window.viewEmployee = viewEmployee;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
