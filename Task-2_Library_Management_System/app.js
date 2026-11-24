/**
 * Task 2 - Library Management System (LibroSync Hub)
 * Archetype: Digital Bookshelf & Circulation Desk
 */

const STORAGE_BOOKS_KEY = 'auspify_library_books_v1';
const STORAGE_TRANS_KEY = 'auspify_library_transactions_v1';

const initialBooks = [
  {
    id: 'BK-1001',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Software Engineering',
    shelf: 'Rack A-01',
    year: 2008,
    totalCopies: 5,
    availableCopies: 3,
    coverGradient: 'from-blue-900 to-indigo-950'
  },
  {
    id: 'BK-1002',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm',
    isbn: '978-0201633610',
    category: 'Software Engineering',
    shelf: 'Rack A-02',
    year: 1994,
    totalCopies: 4,
    availableCopies: 4,
    coverGradient: 'from-emerald-900 to-teal-950'
  },
  {
    id: 'BK-1003',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    isbn: '978-0262033848',
    category: 'Computer Science',
    shelf: 'Rack B-04',
    year: 2009,
    totalCopies: 6,
    availableCopies: 2,
    coverGradient: 'from-amber-900 to-stone-950'
  },
  {
    id: 'BK-1004',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '978-0136042594',
    category: 'Artificial Intelligence',
    shelf: 'Rack C-01',
    year: 2020,
    totalCopies: 3,
    availableCopies: 1,
    coverGradient: 'from-purple-900 to-violet-950'
  },
  {
    id: 'BK-1005',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth',
    isbn: '978-0078022159',
    category: 'Database Systems',
    shelf: 'Rack D-02',
    year: 2019,
    totalCopies: 4,
    availableCopies: 4,
    coverGradient: 'from-cyan-900 to-slate-950'
  }
];

const initialTransactions = [
  {
    id: 'TRX-901',
    bookId: 'BK-1001',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    borrowerName: 'Sarah Amalia',
    borrowerId: 'MBR-2024-012',
    issueDate: '2026-11-10',
    dueDate: '2026-11-24',
    returnDate: null,
    status: 'Active'
  },
  {
    id: 'TRX-902',
    bookId: 'BK-1003',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    borrowerName: 'Bambang Wicaksono',
    borrowerId: 'MBR-2023-044',
    issueDate: '2026-11-01',
    dueDate: '2026-11-15',
    returnDate: null,
    status: 'Active' // Overdue
  }
];

let books = [];
let transactions = [];
let selectedGenreFilter = '';

// DOM Elements
const bookshelfGrid = document.getElementById('bookshelfGrid');
const booksEmptyState = document.getElementById('booksEmptyState');
const searchBookInput = document.getElementById('searchBookInput');
const currentShelfTitle = document.getElementById('currentShelfTitle');
const shelfSubtitle = document.getElementById('shelfSubtitle');
const bookCountBadge = document.getElementById('bookCountBadge');
const navTotalBooksBadge = document.getElementById('navTotalBooksBadge');
const navLoansBadge = document.getElementById('navLoansBadge');
const loanBadgeCounter = document.getElementById('loanBadgeCounter');

// Circulation Drawer
const circulationDrawer = document.getElementById('circulationDrawer');
const circBackdrop = document.getElementById('circBackdrop');
const closeCircDrawerBtn = document.getElementById('closeCircDrawerBtn');
const openCirculationDrawerBtn = document.getElementById('openCirculationDrawerBtn');
const navCirculation = document.getElementById('navCirculation');
const circLoansContainer = document.getElementById('circLoansContainer');

// Book Modal
const bookModal = document.getElementById('bookModal');
const bookForm = document.getElementById('bookForm');
const bookModalTitle = document.getElementById('bookModalTitle');
const openAddBookModalBtn = document.getElementById('openAddBookModalBtn');
const closeBookModalBtn = document.getElementById('closeBookModalBtn');
const cancelBookModalBtn = document.getElementById('cancelBookModalBtn');

// Issue Modal
const issueModal = document.getElementById('issueModal');
const issueForm = document.getElementById('issueForm');
const issueModalBookTitle = document.getElementById('issueModalBookTitle');
const closeIssueModalBtn = document.getElementById('closeIssueModalBtn');
const cancelIssueBtn = document.getElementById('cancelIssueBtn');

// Export
const exportCatalogBtn = document.getElementById('exportCatalogBtn');

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderAll();
});

function loadData() {
  const storedBooks = localStorage.getItem(STORAGE_BOOKS_KEY);
  books = storedBooks ? JSON.parse(storedBooks) : [...initialBooks];
  if (!storedBooks) saveBooks();

  const storedTrans = localStorage.getItem(STORAGE_TRANS_KEY);
  transactions = storedTrans ? JSON.parse(storedTrans) : [...initialTransactions];
  if (!storedTrans) saveTransactions();
}

function saveBooks() {
  localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(books));
}

function saveTransactions() {
  localStorage.setItem(STORAGE_TRANS_KEY, JSON.stringify(transactions));
}

function setupEventListeners() {
  searchBookInput.addEventListener('input', renderBookshelf);

  // All Bookshelf button reset
  navAllBooks.addEventListener('click', () => selectGenre(''));

  // Drawer
  openCirculationDrawerBtn.addEventListener('click', openCircDrawer);
  navCirculation.addEventListener('click', openCircDrawer);
  closeCircDrawerBtn.addEventListener('click', closeCircDrawer);
  circBackdrop.addEventListener('click', closeCircDrawer);

  // Book Modal
  openAddBookModalBtn.addEventListener('click', () => openBookModal());
  closeBookModalBtn.addEventListener('click', () => bookModal.classList.add('hidden'));
  cancelBookModalBtn.addEventListener('click', () => bookModal.classList.add('hidden'));
  bookForm.addEventListener('submit', handleBookSubmit);

  // Issue Modal
  closeIssueModalBtn.addEventListener('click', () => issueModal.classList.add('hidden'));
  cancelIssueBtn.addEventListener('click', () => issueModal.classList.add('hidden'));
  issueForm.addEventListener('submit', handleIssueSubmit);

  exportCatalogBtn.addEventListener('click', exportCatalogCsv);
}

function selectGenre(genre) {
  selectedGenreFilter = genre;

  // Move active class and yellow dot indicator
  document.querySelectorAll('.genre-nav-btn').forEach(btn => {
    const btnGenre = btn.getAttribute('data-genre') || '';
    const dot = btn.querySelector('.genre-dot');
    if (btnGenre === genre) {
      btn.className = 'genre-nav-btn active w-full text-left px-3 py-1.5 rounded-lg bg-white/10 text-white font-semibold transition flex items-center justify-between text-xs';
      if (dot) dot.className = 'genre-dot w-2 h-2 rounded-full bg-amber-400 shadow-xs';
    } else {
      btn.className = 'genre-nav-btn w-full text-left px-3 py-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-white/5 transition flex items-center justify-between text-xs';
      if (dot) dot.className = 'genre-dot w-2 h-2 rounded-full bg-emerald-700/60';
    }
  });

  if (genre) {
    currentShelfTitle.textContent = `${genre} Shelf`;
    shelfSubtitle.textContent = `Viewing selected technical collection in ${genre}`;
    navAllBooks.className = 'w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 text-emerald-200/80 font-medium transition';
  } else {
    currentShelfTitle.textContent = 'Library Catalog';
    shelfSubtitle.textContent = 'Browsing all cataloged volumes and textbooks';
    navAllBooks.className = 'w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/10 text-white font-medium transition';
  }

  renderBookshelf();
}

function openCircDrawer() {
  renderCirculation();
  circulationDrawer.classList.remove('hidden');
}

function closeCircDrawer() {
  circulationDrawer.classList.add('hidden');
}

function openBookModal(book = null) {
  bookForm.reset();
  if (book) {
    bookModalTitle.textContent = 'Edit Volume Details';
    document.getElementById('bookIdHidden').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookIsbn').value = book.isbn;
    document.getElementById('bookCategory').value = book.category;
    document.getElementById('bookShelf').value = book.shelf || '';
    document.getElementById('bookTotalCopies').value = book.totalCopies;
    document.getElementById('bookYear').value = book.year || 2024;
  } else {
    bookModalTitle.textContent = 'Catalog New Book';
    document.getElementById('bookIdHidden').value = '';
    document.getElementById('bookYear').value = 2024;
  }
  bookModal.classList.remove('hidden');
}

function handleBookSubmit(e) {
  e.preventDefault();
  const idHidden = document.getElementById('bookIdHidden').value;
  const title = document.getElementById('bookTitle').value.trim();
  const author = document.getElementById('bookAuthor').value.trim();
  const isbn = document.getElementById('bookIsbn').value.trim();
  const category = document.getElementById('bookCategory').value;
  const shelf = document.getElementById('bookShelf').value.trim();
  const totalCopies = parseInt(document.getElementById('bookTotalCopies').value, 10);
  const year = parseInt(document.getElementById('bookYear').value, 10);

  const gradients = [
    'from-blue-900 to-indigo-950',
    'from-emerald-900 to-teal-950',
    'from-amber-900 to-stone-950',
    'from-purple-900 to-violet-950',
    'from-cyan-900 to-slate-950'
  ];
  const coverGradient = gradients[Math.floor(Math.random() * gradients.length)];

  if (idHidden) {
    const idx = books.findIndex(b => b.id === idHidden);
    if (idx !== -1) {
      const existing = books[idx];
      const diff = totalCopies - existing.totalCopies;
      books[idx] = {
        ...existing,
        title,
        author,
        isbn,
        category,
        shelf,
        totalCopies,
        availableCopies: Math.max(0, existing.availableCopies + diff),
        year
      };
      showToast('Volume record updated', 'success');
    }
  } else {
    const newBook = {
      id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
      title,
      author,
      isbn,
      category,
      shelf,
      totalCopies,
      availableCopies: totalCopies,
      year,
      coverGradient
    };
    books.unshift(newBook);
    showToast('Book shelved into library catalog!', 'success');
  }

  saveBooks();
  bookModal.classList.add('hidden');
  renderAll();
}

function openIssueModal(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book || book.availableCopies <= 0) {
    showToast('No copies available for checkout!', 'error');
    return;
  }

  issueForm.reset();
  document.getElementById('issueBookId').value = book.id;
  issueModalBookTitle.textContent = `${book.title} (${book.availableCopies} available)`;

  const today = new Date().toISOString().split('T')[0];
  const due = new Date();
  due.setDate(due.getDate() + 14);

  document.getElementById('issueDate').value = today;
  document.getElementById('dueDate').value = due.toISOString().split('T')[0];

  issueModal.classList.remove('hidden');
}

function handleIssueSubmit(e) {
  e.preventDefault();
  const bookId = document.getElementById('issueBookId').value;
  const borrowerName = document.getElementById('borrowerName').value.trim();
  const borrowerId = document.getElementById('borrowerId').value.trim();
  const issueDate = document.getElementById('issueDate').value;
  const dueDate = document.getElementById('dueDate').value;

  const bIdx = books.findIndex(b => b.id === bookId);
  if (bIdx === -1 || books[bIdx].availableCopies <= 0) return;

  books[bIdx].availableCopies -= 1;
  saveBooks();

  const newTx = {
    id: 'TRX-' + Math.floor(100 + Math.random() * 900),
    bookId,
    bookTitle: books[bIdx].title,
    borrowerName,
    borrowerId,
    issueDate,
    dueDate,
    returnDate: null,
    status: 'Active'
  };

  transactions.unshift(newTx);
  saveTransactions();

  issueModal.classList.add('hidden');
  showToast(`Book checked out to ${borrowerName}`, 'success');
  renderAll();
}

function returnBook(trxId) {
  const tx = transactions.find(t => t.id === trxId);
  if (!tx || tx.status === 'Returned') return;

  const todayStr = new Date().toISOString().split('T')[0];
  const due = new Date(tx.dueDate);
  const diffDays = Math.ceil((new Date(todayStr) - due) / (1000 * 60 * 60 * 24));
  let penaltyNote = '';
  if (diffDays > 0) {
    penaltyNote = `\n\n⚠️ OVERDUE: ${diffDays} day(s) late.\nAssessed late fee: Rp ${(diffDays * 2000).toLocaleString('id-ID')}`;
  }

  if (confirm(`Confirm book check-in / return for ${tx.borrowerName}?${penaltyNote}`)) {
    tx.status = 'Returned';
    tx.returnDate = todayStr;

    const book = books.find(b => b.id === tx.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      saveBooks();
    }

    saveTransactions();
    showToast('Book checked in and returned to shelf!', 'success');
    renderAll();
    renderCirculation();
  }
}

function deleteBook(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  if (transactions.some(t => t.bookId === id && t.status === 'Active')) {
    alert('Cannot remove book while copies are currently out on loan!');
    return;
  }

  if (confirm(`Remove "${book.title}" from library inventory?`)) {
    books = books.filter(b => b.id !== id);
    saveBooks();
    renderAll();
    showToast('Book removed from collection', 'info');
  }
}

function renderAll() {
  updateBadges();
  renderBookshelf();
}

function updateBadges() {
  const activeLoans = transactions.filter(t => t.status === 'Active');
  navLoansBadge.textContent = activeLoans.length;
  loanBadgeCounter.textContent = activeLoans.length;

  // Update counts for each genre shelf
  const countAll = document.getElementById('countAllGenres');
  if (countAll) countAll.textContent = books.length;
  const countSE = document.getElementById('countSoftwareEng');
  if (countSE) countSE.textContent = books.filter(b => b.category === 'Software Engineering').length;
  const countCS = document.getElementById('countCompSci');
  if (countCS) countCS.textContent = books.filter(b => b.category === 'Computer Science').length;
  const countAI = document.getElementById('countAI');
  if (countAI) countAI.textContent = books.filter(b => b.category === 'Artificial Intelligence').length;
  const countDB = document.getElementById('countDb');
  if (countDB) countDB.textContent = books.filter(b => b.category === 'Database Systems').length;
}

function renderBookshelf() {
  const query = searchBookInput.value.toLowerCase().trim();

  const filtered = books.filter(b => {
    const matchesQuery = !query ||
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      b.isbn.toLowerCase().includes(query);

    const matchesGenre = !selectedGenreFilter || b.category === selectedGenreFilter;
    return matchesQuery && matchesGenre;
  });

  bookCountBadge.textContent = `${filtered.length} Titles Listed`;
  navTotalBooksBadge.textContent = filtered.length;

  if (filtered.length === 0) {
    bookshelfGrid.innerHTML = '';
    booksEmptyState.classList.remove('hidden');
    return;
  }

  booksEmptyState.classList.add('hidden');
  bookshelfGrid.innerHTML = '';

  filtered.forEach(b => {
    const isAvail = b.availableCopies > 0;
    const gradient = b.coverGradient || 'from-emerald-900 to-teal-950';

    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl p-4 border border-[#e9e3da] shadow-2xs hover:shadow-md transition flex flex-col justify-between group';

    card.innerHTML = `
      <div>
        <!-- Stylized Book Cover Preview -->
        <div class="h-36 rounded-xl bg-gradient-to-tr ${gradient} p-4 text-white book-cover flex flex-col justify-between mb-3.5 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <span class="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded backdrop-blur">
              ${escapeHtml(b.category)}
            </span>
            <span class="text-[10px] font-mono text-white/70">${b.year || ''}</span>
          </div>
          <div>
            <h4 class="font-bold text-sm leading-snug line-clamp-2 text-amber-200">
              ${escapeHtml(b.title)}
            </h4>
            <p class="text-[10px] text-white/80 mt-1 line-clamp-1">by ${escapeHtml(b.author)}</p>
          </div>
        </div>

        <!-- Shelf Location & Availability -->
        <div class="space-y-1.5 text-xs">
          <div class="flex justify-between text-slate-500 text-[11px]">
            <span>Shelf: <strong class="text-slate-800">${escapeHtml(b.shelf || 'Main')}</strong></span>
            <span class="font-mono">${b.isbn}</span>
          </div>

          <div class="flex justify-between items-center pt-2 border-t border-slate-100">
            <span class="text-xs">
              Available: <strong class="${isAvail ? 'text-emerald-700' : 'text-rose-600'}">${b.availableCopies}</strong> / ${b.totalCopies}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isAvail ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }">
              ${isAvail ? 'On Shelf' : 'All Borrowed'}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Row -->
      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        ${isAvail ? `
          <button onclick="openIssueModal('${b.id}')" class="px-3 py-1.5 rounded-xl bg-[#1b2621] hover:bg-[#2c3d35] text-amber-300 font-semibold text-[11px] transition inline-flex items-center space-x-1.5 shadow-2xs">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Check Out</span>
          </button>
        ` : `
          <button disabled class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-medium cursor-not-allowed">
            <span>Unavailable</span>
          </button>
        `}
        <div class="space-x-1">
          <button onclick="editBook('${b.id}')" title="Edit Details" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 inline-flex items-center justify-center">
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
          <button onclick="deleteBook('${b.id}')" title="Delete Volume" class="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600 inline-flex items-center justify-center">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>
    `;
    bookshelfGrid.appendChild(card);
  });
}

function renderCirculation() {
  const activeLoans = transactions.filter(t => t.status === 'Active');
  const today = new Date().toISOString().split('T')[0];

  circLoansContainer.innerHTML = '';
  if (activeLoans.length === 0) {
    circLoansContainer.innerHTML = `
      <div class="text-center py-16 text-slate-400 text-xs">
        <i class="fa-solid fa-circle-check text-emerald-500 text-3xl mb-2"></i>
        <p class="font-bold text-slate-700">All Volumes Checked In</p>
        <p>No active borrowed books currently outstanding.</p>
      </div>
    `;
    return;
  }

  activeLoans.forEach(t => {
    const isOverdue = t.dueDate < today;
    const due = new Date(t.dueDate);
    const diffDays = Math.ceil((new Date(today) - due) / (1000 * 60 * 60 * 24));

    const item = document.createElement('div');
    item.className = 'p-4 rounded-xl border bg-[#faf8f5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs';

    item.innerHTML = `
      <div>
        <div class="flex items-center space-x-2">
          <span class="font-bold text-slate-900">${escapeHtml(t.bookTitle)}</span>
          ${isOverdue ? '<span class="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-100 text-rose-800">OVERDUE</span>' : ''}
        </div>
        <p class="text-[11px] text-slate-500 mt-0.5">
          Borrower: <strong class="text-slate-700">${escapeHtml(t.borrowerName)}</strong> (${t.borrowerId})
        </p>
        <div class="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
          <span>Issued: ${t.issueDate}</span>
          <span>•</span>
          <span class="${isOverdue ? 'font-bold text-rose-600' : ''}">Due: ${t.dueDate}</span>
          ${isOverdue ? `<span class="text-rose-600 font-bold">• Fine: Rp ${(diffDays * 2000).toLocaleString('id-ID')}</span>` : ''}
        </div>
      </div>
      <button onclick="returnBook('${t.id}')" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shrink-0 inline-flex items-center space-x-1 shadow-2xs">
        <i class="fa-solid fa-arrow-down-to-bracket text-xs"></i>
        <span>Check In / Return</span>
      </button>
    `;
    circLoansContainer.appendChild(item);
  });
}

function editBook(id) {
  const b = books.find(item => item.id === id);
  if (b) openBookModal(b);
}

function exportCatalogCsv() {
  if (books.length === 0) return;
  const headers = ['ID', 'ISBN', 'Title', 'Author', 'Category', 'Shelf', 'Total Copies', 'Available Copies'];
  const rows = books.map(b => [b.id, `"${b.isbn}"`, `"${b.title}"`, `"${b.author}"`, `"${b.category}"`, `"${b.shelf || ''}"`, b.totalCopies, b.availableCopies]);
  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', `LibroSync_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Catalog CSV exported successfully', 'success');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast-enter pointer-events-auto bg-[#1b2621] text-white shadow-xl px-4 py-2.5 rounded-xl flex items-center space-x-2.5 text-xs min-w-[240px] border border-emerald-900';
  toast.innerHTML = `<i class="fa-solid fa-circle-info text-amber-400"></i><span class="font-medium">${message}</span>`;
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

window.selectGenre = selectGenre;
window.openIssueModal = openIssueModal;
window.returnBook = returnBook;
window.editBook = editBook;
window.deleteBook = deleteBook;
