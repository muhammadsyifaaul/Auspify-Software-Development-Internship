/**
 * Task 1 - Student Management System (EduTrack Portal)
 * Archetype: Academic Registry & Student Card Portal
 */

const STORAGE_KEY = 'auspify_students_data_v1';

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
    gpa: 2.85,
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
    code: 'CY-2024-088',
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
let currentFilterTab = 'all'; // 'all', 'honors', 'warning'
let currentViewMode = 'grid'; // 'grid' or 'table'
let activeDrawerStudentId = null;

// DOM Elements
const studentGridContainer = document.getElementById('studentGridContainer');
const studentTableContainer = document.getElementById('studentTableContainer');
const studentTableBody = document.getElementById('studentTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');
const statusFilter = document.getElementById('statusFilter');

// Tab Filters
const tabFilterAll = document.getElementById('tabFilterAll');
const tabFilterHonors = document.getElementById('tabFilterHonors');
const tabFilterWarning = document.getElementById('tabFilterWarning');

// View Switcher
const viewGridBtn = document.getElementById('viewGridBtn');
const viewTableBtn = document.getElementById('viewTableBtn');

// Stats
const statTotalStudents = document.getElementById('statTotalStudents');
const statDeansList = document.getElementById('statDeansList');
const statAvgGpa = document.getElementById('statAvgGpa');

// Modal Elements
const studentModal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// Drawer Elements
const studentDrawer = document.getElementById('studentDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const drawerAvatar = document.getElementById('drawerAvatar');
const drawerName = document.getElementById('drawerName');
const drawerCode = document.getElementById('drawerCode');
const drawerCourse = document.getElementById('drawerCourse');
const drawerGpa = document.getElementById('drawerGpa');
const drawerStatus = document.getElementById('drawerStatus');
const drawerDate = document.getElementById('drawerDate');
const drawerEmail = document.getElementById('drawerEmail');
const drawerPhone = document.getElementById('drawerPhone');
const drawerHonorStatus = document.getElementById('drawerHonorStatus');
const drawerHonorIcon = document.getElementById('drawerHonorIcon');
const drawerEditBtn = document.getElementById('drawerEditBtn');
const drawerDeleteBtn = document.getElementById('drawerDeleteBtn');

// Export
const exportCsvBtn = document.getElementById('exportCsvBtn');

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
  // View Toggle
  viewGridBtn.addEventListener('click', () => {
    currentViewMode = 'grid';
    viewGridBtn.className = 'p-1.5 rounded-md text-xs bg-white text-blue-600 shadow-xs';
    viewTableBtn.className = 'p-1.5 rounded-md text-xs hover:text-slate-800 text-slate-500';
    render();
  });

  viewTableBtn.addEventListener('click', () => {
    currentViewMode = 'table';
    viewTableBtn.className = 'p-1.5 rounded-md text-xs bg-white text-blue-600 shadow-xs';
    viewGridBtn.className = 'p-1.5 rounded-md text-xs hover:text-slate-800 text-slate-500';
    render();
  });

  // Filter Tabs
  tabFilterAll.addEventListener('click', () => setFilterTab('all'));
  tabFilterHonors.addEventListener('click', () => setFilterTab('honors'));
  tabFilterWarning.addEventListener('click', () => setFilterTab('warning'));

  // Search & Filters
  searchInput.addEventListener('input', render);
  courseFilter.addEventListener('change', render);
  statusFilter.addEventListener('change', render);

  // Modal
  openAddModalBtn.addEventListener('click', () => openModal());
  closeModalBtn.addEventListener('click', () => studentModal.classList.add('hidden'));
  cancelModalBtn.addEventListener('click', () => studentModal.classList.add('hidden'));
  studentForm.addEventListener('submit', handleFormSubmit);

  // Drawer
  closeDrawerBtn.addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  drawerEditBtn.addEventListener('click', () => {
    const s = students.find(item => item.id === activeDrawerStudentId);
    closeDrawer();
    if (s) openModal(s);
  });
  drawerDeleteBtn.addEventListener('click', () => {
    const s = students.find(item => item.id === activeDrawerStudentId);
    if (s) {
      deleteStudent(s.id);
      closeDrawer();
    }
  });

  exportCsvBtn.addEventListener('click', exportToCsv);
}

function setFilterTab(tab) {
  currentFilterTab = tab;
  const buttons = [
    { btn: tabFilterAll, name: 'all' },
    { btn: tabFilterHonors, name: 'honors' },
    { btn: tabFilterWarning, name: 'warning' }
  ];

  buttons.forEach(({ btn, name }) => {
    if (name === tab) {
      btn.className = 'px-3 py-1.5 rounded-lg font-medium text-white bg-blue-600 transition';
    } else {
      btn.className = 'px-3 py-1.5 rounded-lg font-medium text-slate-300 hover:text-white transition';
    }
  });

  render();
}

function openModal(student = null) {
  studentForm.reset();
  if (student) {
    modalTitle.textContent = 'Edit Student Academic Record';
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
    modalTitle.textContent = 'Enroll New Student';
    document.getElementById('studentIdHidden').value = '';
    document.getElementById('studentEnrollDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('studentStatus').value = 'Active';
  }
  studentModal.classList.remove('hidden');
}

function handleFormSubmit(e) {
  e.preventDefault();
  const idHidden = document.getElementById('studentIdHidden').value;
  const code = document.getElementById('studentCode').value.trim();
  const name = document.getElementById('studentName').value.trim();
  const email = document.getElementById('studentEmail').value.trim();
  const phone = document.getElementById('studentPhone').value.trim();
  const course = document.getElementById('studentCourse').value;
  const gpa = parseFloat(document.getElementById('studentGpa').value) || 0;
  const enrollDate = document.getElementById('studentEnrollDate').value;
  const status = document.getElementById('studentStatus').value;

  if (idHidden) {
    const idx = students.findIndex(s => s.id === idHidden);
    if (idx !== -1) {
      students[idx] = { ...students[idx], code, name, email, phone, course, gpa, enrollDate, status };
      showToast('Student record updated successfully!', 'success');
    }
  } else {
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
    showToast('New student enrolled into registry!', 'success');
  }

  saveData();
  studentModal.classList.add('hidden');
  render();
}

function deleteStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  if (confirm(`Are you sure you want to withdraw ${student.name} (${student.code}) from registry?`)) {
    students = students.filter(s => s.id !== id);
    saveData();
    render();
    showToast('Student withdrawn from portal', 'info');
  }
}

function openDrawer(id) {
  const s = students.find(item => item.id === id);
  if (!s) return;

  activeDrawerStudentId = s.id;
  const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  drawerAvatar.textContent = initials;
  drawerName.textContent = s.name;
  drawerCode.textContent = s.code;
  drawerCourse.textContent = s.course;
  drawerGpa.textContent = `${Number(s.gpa).toFixed(2)} / 4.00`;
  drawerStatus.textContent = s.status;
  drawerDate.textContent = s.enrollDate || 'N/A';
  drawerEmail.textContent = s.email;
  drawerPhone.textContent = s.phone || 'N/A';

  if (s.gpa >= 3.5) {
    drawerHonorStatus.textContent = "Dean's List Honoree (GPA >= 3.5)";
    drawerHonorIcon.className = 'w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center text-sm shadow-xs';
    drawerHonorIcon.innerHTML = '<i class="fa-solid fa-award"></i>';
  } else if (s.gpa < 3.0) {
    drawerHonorStatus.textContent = "Academic Probation Warning (GPA < 3.0)";
    drawerHonorIcon.className = 'w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center text-sm shadow-xs';
    drawerHonorIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
  } else {
    drawerHonorStatus.textContent = "Good Academic Standing";
    drawerHonorIcon.className = 'w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center text-sm shadow-xs';
    drawerHonorIcon.innerHTML = '<i class="fa-solid fa-check"></i>';
  }

  studentDrawer.classList.remove('hidden');
}

function closeDrawer() {
  studentDrawer.classList.add('hidden');
  activeDrawerStudentId = null;
}

function updateStats() {
  statTotalStudents.textContent = students.length;
  const deansList = students.filter(s => s.gpa >= 3.5).length;
  statDeansList.textContent = deansList;

  const totalGpa = students.reduce((acc, curr) => acc + (Number(curr.gpa) || 0), 0);
  const avgGpa = students.length ? (totalGpa / students.length).toFixed(2) : '0.00';
  statAvgGpa.textContent = avgGpa;
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

    let matchesTab = true;
    if (currentFilterTab === 'honors') matchesTab = s.gpa >= 3.5;
    if (currentFilterTab === 'warning') matchesTab = s.gpa < 3.0;

    return matchesQuery && matchesCourse && matchesStatus && matchesTab;
  });

  if (filtered.length === 0) {
    studentGridContainer.classList.add('hidden');
    studentTableContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  if (currentViewMode === 'grid') {
    studentGridContainer.classList.remove('hidden');
    studentTableContainer.classList.add('hidden');
    renderGrid(filtered);
  } else {
    studentGridContainer.classList.add('hidden');
    studentTableContainer.classList.remove('hidden');
    renderTable(filtered);
  }
}

function renderGrid(list) {
  studentGridContainer.innerHTML = '';
  list.forEach(s => {
    const initials = s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const isHonors = s.gpa >= 3.5;
    const isWarning = s.gpa < 3.0;

    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group';

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-indigo-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              ${initials}
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition" onclick="openDrawer('${s.id}')">
                ${escapeHtml(s.name)}
              </h4>
              <p class="text-[11px] font-mono text-slate-400">${s.code}</p>
            </div>
          </div>
          <span class="text-right">
            <span class="text-xs font-black block ${isHonors ? 'text-amber-500' : isWarning ? 'text-rose-500' : 'text-slate-700'}">
              ${Number(s.gpa).toFixed(2)}
            </span>
            <span class="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">GPA</span>
          </span>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
            ${escapeHtml(s.course)}
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
            s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }">
            ${s.status}
          </span>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span class="truncate max-w-[170px] text-[11px] text-slate-400">${escapeHtml(s.email)}</span>
        <div class="space-x-1">
          <button onclick="openDrawer('${s.id}')" title="Quick Profile Sheet" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition inline-flex items-center justify-center">
            <i class="fa-solid fa-address-card text-xs"></i>
          </button>
          <button onclick="editStudent('${s.id}')" title="Edit Student" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition inline-flex items-center justify-center">
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
          <button onclick="deleteStudent('${s.id}')" title="Withdraw Student" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition inline-flex items-center justify-center">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>
    `;
    studentGridContainer.appendChild(card);
  });
}

function renderTable(list) {
  studentTableBody.innerHTML = '';
  list.forEach(s => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

    tr.innerHTML = `
      <td class="py-3 px-5">
        <div class="font-bold text-slate-900 cursor-pointer hover:text-blue-600" onclick="openDrawer('${s.id}')">
          ${escapeHtml(s.name)}
        </div>
        <div class="text-[11px] font-mono text-slate-400">${s.code}</div>
      </td>
      <td class="py-3 px-5">
        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
          ${escapeHtml(s.course)}
        </span>
      </td>
      <td class="py-3 px-5 text-center font-bold">
        <span class="${s.gpa >= 3.5 ? 'text-amber-500' : s.gpa < 3.0 ? 'text-rose-500' : 'text-slate-800'}">
          ${Number(s.gpa).toFixed(2)}
        </span>
      </td>
      <td class="py-3 px-5">
        <div>${escapeHtml(s.email)}</div>
        <div class="text-[11px] text-slate-400">${escapeHtml(s.phone || '-')}</div>
      </td>
      <td class="py-3 px-5 text-center">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
          s.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }">${s.status}</span>
      </td>
      <td class="py-3 px-5 text-right space-x-1">
        <button onclick="openDrawer('${s.id}')" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600">
          <i class="fa-solid fa-eye text-xs"></i>
        </button>
        <button onclick="editStudent('${s.id}')" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600">
          <i class="fa-solid fa-pen text-xs"></i>
        </button>
        <button onclick="deleteStudent('${s.id}')" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600">
          <i class="fa-solid fa-trash text-xs"></i>
        </button>
      </td>
    `;
    studentTableBody.appendChild(tr);
  });
}

function editStudent(id) {
  const s = students.find(item => item.id === id);
  if (s) openModal(s);
}

function exportToCsv() {
  if (students.length === 0) {
    showToast('Registry is empty!', 'error');
    return;
  }

  const headers = ['NIM', 'Full Name', 'Department', 'Email', 'Phone', 'GPA', 'Status', 'Enrollment Date'];
  const rows = students.map(s => [
    `"${s.code}"`,
    `"${s.name}"`,
    `"${s.course}"`,
    `"${s.email}"`,
    `"${s.phone || ''}"`,
    s.gpa,
    s.status,
    s.enrollDate || ''
  ]);

  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', `EduTrack_Student_Registry_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Academic registry downloaded as CSV', 'success');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const icon = type === 'success' ? 'fa-circle-check text-emerald-500' :
               type === 'error' ? 'fa-triangle-exclamation text-rose-500' : 'fa-circle-info text-blue-500';

  toast.className = 'toast-enter pointer-events-auto bg-slate-900 text-white shadow-xl px-4 py-2.5 rounded-xl flex items-center space-x-2.5 text-xs min-w-[240px] border border-slate-700';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span class="font-medium">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-200');
    setTimeout(() => toast.remove(), 200);
  }, 3000);
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

window.openDrawer = openDrawer;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
