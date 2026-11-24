/**
 * Task 1 - Student Management System
 * Auspify Technologies Software Development Internship
 * Features:
 * - CRUD operations (Add, Edit, View, Delete)
 * - Real-time Search & Multi-criteria Filtering
 * - Data Persistence with LocalStorage
 * - Statistics & Dashboard KPIs
 * - CSV Export
 */

const STORAGE_KEY = 'auspify_students_data_v1';

// Initial Mock Seed Data
const initialStudents = [
  {
    id: 'STU-001',
    code: 'CS-2024-001',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@student.univ.ac.id',
    phone: '+62 812-9876-5432',
    course: 'Computer Science',
    gpa: 3.85,
    status: 'Active',
    enrollDate: '2024-08-15'
  },
  {
    id: 'STU-002',
    code: 'SE-2024-045',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@student.univ.ac.id',
    phone: '+62 856-1122-3344',
    course: 'Software Engineering',
    gpa: 3.92,
    status: 'Active',
    enrollDate: '2024-08-15'
  },
  {
    id: 'STU-003',
    code: 'IS-2023-102',
    name: 'Budi Santoso',
    email: 'budi.santoso@student.univ.ac.id',
    phone: '+62 813-4455-6677',
    course: 'Information Systems',
    gpa: 3.40,
    status: 'Probation',
    enrollDate: '2023-08-20'
  },
  {
    id: 'STU-004',
    code: 'DS-2022-019',
    name: 'Dian Permata',
    email: 'dian.permata@student.univ.ac.id',
    phone: '+62 878-9900-1122',
    course: 'Data Science',
    gpa: 3.98,
    status: 'Graduated',
    enrollDate: '2022-08-10'
  },
  {
    id: 'STU-005',
    code: 'CS-2024-088',
    name: 'Rian Pratama',
    email: 'rian.pratama@student.univ.ac.id',
    phone: '+62 821-3322-1100',
    course: 'Cyber Security',
    gpa: 3.65,
    status: 'Active',
    enrollDate: '2024-08-15'
  }
];

let students = [];

// DOM References
const studentTableBody = document.getElementById('studentTableBody');
const emptyState = document.getElementById('emptyState');
const recordCountLabel = document.getElementById('recordCountLabel');
const searchInput = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');
const statusFilter = document.getElementById('statusFilter');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

// Modal Elements
const studentModal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// View Modal Elements
const viewModal = document.getElementById('viewModal');
const viewModalContent = document.getElementById('viewModalContent');
const closeViewModalBtn = document.getElementById('closeViewModalBtn');
const closeViewModalBtn2 = document.getElementById('closeViewModalBtn2');

// Statistics
const statTotalStudents = document.getElementById('statTotalStudents');
const statActiveStudents = document.getElementById('statActiveStudents');
const statAvgGpa = document.getElementById('statAvgGpa');
const statTotalDepartments = document.getElementById('statTotalDepartments');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  render();
});

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      students = JSON.parse(stored);
    } catch (e) {
      students = [...initialStudents];
    }
  } else {
    students = [...initialStudents];
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function setupEventListeners() {
  // Modal handlers
  openAddModalBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  studentForm.addEventListener('submit', handleFormSubmit);

  // View Modal handlers
  closeViewModalBtn.addEventListener('click', () => viewModal.classList.add('hidden'));
  closeViewModalBtn2.addEventListener('click', () => viewModal.classList.add('hidden'));

  // Filter & Search handlers
  searchInput.addEventListener('input', render);
  courseFilter.addEventListener('change', render);
  statusFilter.addEventListener('change', render);
  resetFilterBtn.addEventListener('click', () => {
    searchInput.value = '';
    courseFilter.value = '';
    statusFilter.value = '';
    render();
  });

  // Export CSV
  exportCsvBtn.addEventListener('click', exportToCsv);

  // Close modals when clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target === studentModal) closeModal();
    if (e.target === viewModal) viewModal.classList.add('hidden');
  });
}

function openModal(student = null) {
  studentForm.reset();
  if (student) {
    modalTitle.textContent = 'Edit Student Record';
    document.getElementById('studentIdHidden').value = student.id;
    document.getElementById('studentCode').value = student.code;
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentEmail').value = student.email;
    document.getElementById('studentPhone').value = student.phone || '';
    document.getElementById('studentCourse').value = student.course;
    document.getElementById('studentGpa').value = student.gpa;
    document.getElementById('studentEnrollDate').value = student.enrollDate || '';
    document.getElementById('studentStatus').value = student.status || 'Active';
  } else {
    modalTitle.textContent = 'Add New Student';
    document.getElementById('studentIdHidden').value = '';
    document.getElementById('studentEnrollDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('studentStatus').value = 'Active';
  }
  studentModal.classList.remove('hidden');
}

function closeModal() {
  studentModal.classList.add('hidden');
}

function handleFormSubmit(e) {
  e.preventDefault();

  const idHidden = document.getElementById('studentIdHidden').value;
  const code = document.getElementById('studentCode').value.trim();
  const name = document.getElementById('studentName').value.trim();
  const email = document.getElementById('studentEmail').value.trim();
  const phone = document.getElementById('studentPhone').value.trim();
  const course = document.getElementById('studentCourse').value;
  const gpa = parseFloat(document.getElementById('studentGpa').value);
  const enrollDate = document.getElementById('studentEnrollDate').value;
  const status = document.getElementById('studentStatus').value;

  if (gpa < 0 || gpa > 4) {
    showToast('GPA must be between 0.00 and 4.00', 'error');
    return;
  }

  if (idHidden) {
    // Update existing
    const idx = students.findIndex(s => s.id === idHidden);
    if (idx !== -1) {
      students[idx] = {
        ...students[idx],
        code,
        name,
        email,
        phone,
        course,
        gpa,
        enrollDate,
        status
      };
      showToast('Student record updated successfully!', 'success');
    }
  } else {
    // Add new
    const newStudent = {
      id: 'STU-' + Date.now().toString(36).toUpperCase(),
      code,
      name,
      email,
      phone,
      course,
      gpa,
      enrollDate,
      status
    };
    students.unshift(newStudent);
    showToast('New student registered successfully!', 'success');
  }

  saveData();
  closeModal();
  render();
}

function deleteStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  if (confirm(`Are you sure you want to delete ${student.name} (${student.code})? This action cannot be undone.`)) {
    students = students.filter(s => s.id !== id);
    saveData();
    render();
    showToast('Student deleted successfully', 'info');
  }
}

function viewStudent(id) {
  const s = students.find(item => item.id === id);
  if (!s) return;

  const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  viewModalContent.innerHTML = `
    <div class="w-20 h-20 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center font-bold text-2xl mb-4 border-2 border-blue-500 shadow-sm">
      ${initials}
    </div>
    <h4 class="text-xl font-bold text-slate-800">${s.name}</h4>
    <p class="text-xs text-slate-400 font-mono mt-0.5">${s.code}</p>
    
    <div class="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(s.status)}">
      ${s.status}
    </div>

    <div class="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
      <div class="flex justify-between">
        <span class="text-slate-400">Department:</span>
        <span class="font-semibold text-slate-700">${s.course}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Grade Point Average:</span>
        <span class="font-bold text-blue-600">${s.gpa.toFixed(2)} / 4.00</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Email:</span>
        <span class="font-medium text-slate-700">${s.email}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Phone:</span>
        <span class="font-medium text-slate-700">${s.phone || 'N/A'}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Enrollment Date:</span>
        <span class="font-medium text-slate-700">${s.enrollDate || 'N/A'}</span>
      </div>
    </div>
  `;

  viewModal.classList.remove('hidden');
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'Probation':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'Graduated':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'Suspended':
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

function updateStats() {
  statTotalStudents.textContent = students.length;
  statActiveStudents.textContent = students.filter(s => s.status === 'Active').length;

  const totalGpa = students.reduce((acc, curr) => acc + (Number(curr.gpa) || 0), 0);
  const avgGpa = students.length ? (totalGpa / students.length).toFixed(2) : '0.00';
  statAvgGpa.textContent = avgGpa;

  const departments = new Set(students.map(s => s.course));
  statTotalDepartments.textContent = departments.size;
}

function render() {
  updateStats();

  const query = searchInput.value.toLowerCase().trim();
  const course = courseFilter.value;
  const status = statusFilter.value;

  const filtered = students.filter(s => {
    const matchesQuery = !query || 
      s.name.toLowerCase().includes(query) || 
      s.code.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query);
    
    const matchesCourse = !course || s.course === course;
    const matchesStatus = !status || s.status === status;

    return matchesQuery && matchesCourse && matchesStatus;
  });

  studentTableBody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    recordCountLabel.textContent = `Showing 0 of ${students.length} students`;
    return;
  }

  emptyState.classList.add('hidden');
  recordCountLabel.textContent = `Showing ${filtered.length} of ${students.length} students`;

  filtered.forEach(s => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors border-b border-slate-100';

    const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    tr.innerHTML = `
      <td class="py-3.5 px-6">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            ${initials}
          </div>
          <div>
            <div class="font-semibold text-slate-800 cursor-pointer hover:text-blue-600" onclick="viewStudent('${s.id}')">
              ${escapeHtml(s.name)}
            </div>
            <div class="text-xs text-slate-400 font-mono">${escapeHtml(s.code)}</div>
          </div>
        </div>
      </td>
      <td class="py-3.5 px-6">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          ${escapeHtml(s.course)}
        </span>
      </td>
      <td class="py-3.5 px-6">
        <div class="text-xs text-slate-700">${escapeHtml(s.email)}</div>
        <div class="text-xs text-slate-400">${escapeHtml(s.phone || '-')}</div>
      </td>
      <td class="py-3.5 px-6 text-center font-bold text-slate-700">
        <span class="${s.gpa >= 3.5 ? 'text-emerald-600' : (s.gpa < 2.5 ? 'text-amber-600' : 'text-slate-700')}">
          ${Number(s.gpa).toFixed(2)}
        </span>
      </td>
      <td class="py-3.5 px-6 text-center">
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(s.status)}">
          ${s.status}
        </span>
      </td>
      <td class="py-3.5 px-6 text-center text-xs text-slate-500">
        ${s.enrollDate || '-'}
      </td>
      <td class="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
        <button onclick="viewStudent('${s.id}')" title="View Details" class="w-8 h-8 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button onclick="editStudent('${s.id}')" title="Edit Student" class="w-8 h-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button onclick="deleteStudent('${s.id}')" title="Delete Student" class="w-8 h-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    studentTableBody.appendChild(tr);
  });
}

function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (student) {
    openModal(student);
  }
}

function exportToCsv() {
  if (students.length === 0) {
    showToast('No records to export!', 'error');
    return;
  }

  const headers = ['ID', 'Student Code', 'Full Name', 'Email', 'Phone', 'Department', 'GPA', 'Status', 'Enrollment Date'];
  const rows = students.map(s => [
    s.id,
    `"${s.code}"`,
    `"${s.name}"`,
    `"${s.email}"`,
    `"${s.phone || ''}"`,
    `"${s.course}"`,
    s.gpa,
    s.status,
    s.enrollDate || ''
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Students_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Student CSV export downloaded successfully', 'success');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  const icon = type === 'success' ? 'fa-circle-check text-emerald-500' : 
               type === 'error' ? 'fa-triangle-exclamation text-red-500' : 'fa-circle-info text-blue-500';
  
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

// Global exposes for inline handlers
window.viewStudent = viewStudent;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
