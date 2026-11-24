/**
 * Task 2 - Library Management System
 * Auspify Technologies Software Development Internship
 * Features:
 * - Book Catalog Management (Add, Edit, Delete, Stock control)
 * - Book Issue and Return workflow with due date tracking & fine calculation
 * - Dynamic Search & Filter by Category / Availability
 * - Report Generation and CSV Export
 * - LocalStorage Persistence
 */

const STORAGE_BOOKS_KEY = 'auspify_library_books_v1';
const STORAGE_TRANS_KEY = 'auspify_library_transactions_v1';

// Initial Mock Seed Books
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
    availableCopies: 3
  },
  {
    id: 'BK-1002',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '978-0201633610',
    category: 'Software Engineering',
    shelf: 'Rack A-02',
    year: 1994,
    totalCopies: 4,
    availableCopies: 4
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
    availableCopies: 2
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
    availableCopies: 1
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
    availableCopies: 4
  }
];

// Initial Transactions
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
    status: 'Active' // Active or Returned
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
    status: 'Active' // overdue!
  }
];

let books = [];
let transactions = [];

// DOM references
const booksCatalogSection = document.getElementById('booksCatalogSection');
const transactionsSection = document.getElementById('transactionsSection');
const tabBooksBtn = document.getElementById('tabBooksBtn');
const tabTransactionsBtn = document.getElementById('tabTransactionsBtn');
const transBadgeCount = document.getElementById('transBadgeCount');

// Book table elements
const booksTableBody = document.getElementById('booksTableBody');
const booksEmptyState = document.getElementById('booksEmptyState');
const bookCountLabel = document.getElementById('bookCountLabel');
const searchBookInput = document.getElementById('searchBookInput');
const genreFilter = document.getElementById('genreFilter');
const availabilityFilter = document.getElementById('availabilityFilter');
const resetBookFilterBtn = document.getElementById('resetBookFilterBtn');

// Transaction table elements
const transTableBody = document.getElementById('transTableBody');
const transEmptyState = document.getElementById('transEmptyState');
const searchTransInput = document.getElementById('searchTransInput');
const transStatusFilter = document.getElementById('transStatusFilter');

// Statistics
const statTotalBooks = document.getElementById('statTotalBooks');
const statTotalCopies = document.getElementById('statTotalCopies');
const statIssuedBooks = document.getElementById('statIssuedBooks');
const statOverdueBooks = document.getElementById('statOverdueBooks');

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
const exportReportBtn = document.getElementById('exportReportBtn');

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  renderAll();
});

function loadData() {
  const storedBooks = localStorage.getItem(STORAGE_BOOKS_KEY);
  if (storedBooks) {
    try {
      books = JSON.parse(storedBooks);
    } catch (e) {
      books = [...initialBooks];
    }
  } else {
    books = [...initialBooks];
    saveBooks();
  }

  const storedTrans = localStorage.getItem(STORAGE_TRANS_KEY);
  if (storedTrans) {
    try {
      transactions = JSON.parse(storedTrans);
    } catch (e) {
      transactions = [...initialTransactions];
    }
  } else {
    transactions = [...initialTransactions];
    saveTransactions();
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(books));
}

function saveTransactions() {
  localStorage.setItem(STORAGE_TRANS_KEY, JSON.stringify(transactions));
}

function setupEventListeners() {
  // Tabs switching
  tabBooksBtn.addEventListener('click', () => switchTab('catalog'));
  tabTransactionsBtn.addEventListener('click', () => switchTab('transactions'));

  // Book Modal
  openAddBookModalBtn.addEventListener('click', () => openBookModal());
  closeBookModalBtn.addEventListener('click', () => bookModal.classList.add('hidden'));
  cancelBookModalBtn.addEventListener('click', () => bookModal.classList.add('hidden'));
  bookForm.addEventListener('submit', handleBookSubmit);

  // Issue Modal
  closeIssueModalBtn.addEventListener('click', () => issueModal.classList.add('hidden'));
  cancelIssueBtn.addEventListener('click', () => issueModal.classList.add('hidden'));
  issueForm.addEventListener('submit', handleIssueSubmit);

  // Filters & Search
  searchBookInput.addEventListener('input', renderBooks);
  genreFilter.addEventListener('change', renderBooks);
  availabilityFilter.addEventListener('change', renderBooks);
  resetBookFilterBtn.addEventListener('click', () => {
    searchBookInput.value = '';
    genreFilter.value = '';
    availabilityFilter.value = '';
    renderBooks();
  });

  searchTransInput.addEventListener('input', renderTransactions);
  transStatusFilter.addEventListener('change', renderTransactions);

  exportReportBtn.addEventListener('click', exportLibraryReport);

  window.addEventListener('click', (e) => {
    if (e.target === bookModal) bookModal.classList.add('hidden');
    if (e.target === issueModal) issueModal.classList.add('hidden');
  });
}

function switchTab(tab) {
  if (tab === 'catalog') {
    booksCatalogSection.classList.remove('hidden');
    transactionsSection.classList.add('hidden');
    tabBooksBtn.className = 'py-3 px-1 border-b-2 border-emerald-600 text-emerald-700 flex items-center space-x-2 transition';
    tabTransactionsBtn.className = 'py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center space-x-2 transition';
  } else {
    booksCatalogSection.classList.add('hidden');
    transactionsSection.classList.remove('hidden');
    tabTransactionsBtn.className = 'py-3 px-1 border-b-2 border-emerald-600 text-emerald-700 flex items-center space-x-2 transition';
    tabBooksBtn.className = 'py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center space-x-2 transition';
  }
}

function openBookModal(book = null) {
  bookForm.reset();
  if (book) {
    bookModalTitle.textContent = 'Edit Book Details';
    document.getElementById('bookIdHidden').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookIsbn').value = book.isbn;
    document.getElementById('bookCategory').value = book.category;
    document.getElementById('bookShelf').value = book.shelf || '';
    document.getElementById('bookTotalCopies').value = book.totalCopies;
    document.getElementById('bookYear').value = book.year || new Date().getFullYear();
  } else {
    bookModalTitle.textContent = 'Add New Book to Library';
    document.getElementById('bookIdHidden').value = '';
    document.getElementById('bookYear').value = new Date().getFullYear();
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

  if (idHidden) {
    const idx = books.findIndex(b => b.id === idHidden);
    if (idx !== -1) {
      const existing = books[idx];
      const diff = totalCopies - existing.totalCopies;
      const newAvailable = Math.max(0, existing.availableCopies + diff);

      books[idx] = {
        ...existing,
        title,
        author,
        isbn,
        category,
        shelf,
        totalCopies,
        availableCopies: newAvailable,
        year
      };
      showToast('Book details updated successfully!', 'success');
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
      year
    };
    books.unshift(newBook);
    showToast('New book cataloged successfully!', 'success');
  }

  saveBooks();
  bookModal.classList.add('hidden');
  renderAll();
}

function deleteBook(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  const hasActiveBorrow = transactions.some(t => t.bookId === id && t.status === 'Active');
  if (hasActiveBorrow) {
    alert(`Cannot delete "${book.title}" because it currently has active borrowed copies. Please process returns first.`);
    return;
  }

  if (confirm(`Are you sure you want to remove "${book.title}" from library inventory?`)) {
    books = books.filter(b => b.id !== id);
    saveBooks();
    renderAll();
    showToast('Book removed from catalog', 'info');
  }
}

function openIssueModal(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  if (book.availableCopies <= 0) {
    showToast('No copies available for checkout right now!', 'error');
    return;
  }

  issueForm.reset();
  document.getElementById('issueBookId').value = book.id;
  issueModalBookTitle.textContent = `${book.title} (Available: ${book.availableCopies})`;

  const today = new Date().toISOString().split('T')[0];
  const due = new Date();
  due.setDate(due.getDate() + 14); // 14 days loan period standard
  const dueDateStr = due.toISOString().split('T')[0];

  document.getElementById('issueDate').value = today;
  document.getElementById('dueDate').value = dueDateStr;

  issueModal.classList.remove('hidden');
}

function handleIssueSubmit(e) {
  e.preventDefault();
  const bookId = document.getElementById('issueBookId').value;
  const borrowerName = document.getElementById('borrowerName').value.trim();
  const borrowerId = document.getElementById('borrowerId').value.trim();
  const issueDate = document.getElementById('issueDate').value;
  const dueDate = document.getElementById('dueDate').value;

  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex === -1 || books[bookIndex].availableCopies <= 0) {
    showToast('Cannot issue book. Stock unavailable.', 'error');
    return;
  }

  // Deduct available copy
  books[bookIndex].availableCopies -= 1;
  saveBooks();

  // Create transaction
  const newTx = {
    id: 'TRX-' + Math.floor(100 + Math.random() * 900),
    bookId,
    bookTitle: books[bookIndex].title,
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
  showToast(`Book successfully issued to ${borrowerName}!`, 'success');
  renderAll();
}

function returnBook(trxId) {
  const tx = transactions.find(t => t.id === trxId);
  if (!tx || tx.status === 'Returned') return;

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate overdue days
  const due = new Date(tx.dueDate);
  const today = new Date(todayStr);
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let overdueMessage = '';

  if (diffDays > 0) {
    const finePerDay = 2000; // Rp 2000 per day
    const fine = diffDays * finePerDay;
    overdueMessage = `\n\n⚠️ NOTE: This return is ${diffDays} day(s) overdue!\nEstimated late fee: Rp ${fine.toLocaleString('id-ID')}`;
  }

  if (confirm(`Confirm book return for transaction ${tx.id} from ${tx.borrowerName}?${overdueMessage}`)) {
    tx.status = 'Returned';
    tx.returnDate = todayStr;

    // Restore copy
    const book = books.find(b => b.id === tx.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      saveBooks();
    }

    saveTransactions();
    showToast('Book returned and restocked successfully!', 'success');
    renderAll();
  }
}

function renderAll() {
  updateStats();
  renderBooks();
  renderTransactions();
}

function updateStats() {
  statTotalBooks.textContent = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  statTotalCopies.textContent = totalCopies;

  const activeLoans = transactions.filter(t => t.status === 'Active');
  statIssuedBooks.textContent = activeLoans.length;
  transBadgeCount.textContent = activeLoans.length;

  const today = new Date().toISOString().split('T')[0];
  const overdueCount = activeLoans.filter(t => t.dueDate < today).length;
  statOverdueBooks.textContent = overdueCount;
}

function renderBooks() {
  const query = searchBookInput.value.toLowerCase().trim();
  const category = genreFilter.value;
  const availability = availabilityFilter.value;

  const filtered = books.filter(b => {
    const matchesQuery = !query ||
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      b.isbn.toLowerCase().includes(query);

    const matchesCat = !category || b.category === category;
    const matchesAvail = !availability || 
      (availability === 'Available' && b.availableCopies > 0) ||
      (availability === 'Unavailable' && b.availableCopies === 0);

    return matchesQuery && matchesCat && matchesAvail;
  });

  booksTableBody.innerHTML = '';
  if (filtered.length === 0) {
    booksEmptyState.classList.remove('hidden');
    bookCountLabel.textContent = `Showing 0 of ${books.length} books`;
    return;
  }

  booksEmptyState.classList.add('hidden');
  bookCountLabel.textContent = `Showing ${filtered.length} of ${books.length} books`;

  filtered.forEach(b => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors border-b border-slate-100';

    const isAvailable = b.availableCopies > 0;
    const availBadge = isAvailable
      ? '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Available</span>'
      : '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Unavailable</span>';

    tr.innerHTML = `
      <td class="py-4 px-6">
        <div class="font-bold text-slate-800 hover:text-emerald-700 transition">${escapeHtml(b.title)}</div>
        <div class="text-xs text-slate-500 mt-0.5">by <span class="font-medium text-slate-700">${escapeHtml(b.author)}</span> • <span class="font-mono text-slate-400">${b.isbn}</span></div>
      </td>
      <td class="py-4 px-6">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          ${escapeHtml(b.category)}
        </span>
      </td>
      <td class="py-4 px-6 text-xs text-slate-600 font-mono">
        ${escapeHtml(b.shelf || '-')}
      </td>
      <td class="py-4 px-6 text-center font-semibold">
        <span class="${b.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'}">${b.availableCopies}</span>
        <span class="text-slate-400 font-normal"> / ${b.totalCopies}</span>
      </td>
      <td class="py-4 px-6 text-center">
        ${availBadge}
      </td>
      <td class="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
        ${isAvailable ? `
          <button onclick="openIssueModal('${b.id}')" title="Issue Book" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition inline-flex items-center space-x-1">
            <i class="fa-solid fa-arrow-up-from-bracket"></i>
            <span>Issue</span>
          </button>
        ` : `
          <button disabled class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed inline-flex items-center space-x-1">
            <i class="fa-solid fa-ban"></i>
            <span>Full</span>
          </button>
        `}
        <button onclick="editBook('${b.id}')" title="Edit Book" class="w-8 h-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button onclick="deleteBook('${b.id}')" title="Delete Book" class="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition inline-flex items-center justify-center">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    booksTableBody.appendChild(tr);
  });
}

function renderTransactions() {
  const query = searchTransInput.value.toLowerCase().trim();
  const filter = transStatusFilter.value;
  const today = new Date().toISOString().split('T')[0];

  const filtered = transactions.filter(t => {
    const matchesQuery = !query ||
      t.borrowerName.toLowerCase().includes(query) ||
      t.bookTitle.toLowerCase().includes(query) ||
      t.borrowerId.toLowerCase().includes(query);

    const isOverdue = t.status === 'Active' && t.dueDate < today;
    let matchesStatus = true;
    if (filter === 'Active') matchesStatus = t.status === 'Active' && !isOverdue;
    if (filter === 'Returned') matchesStatus = t.status === 'Returned';
    if (filter === 'Overdue') matchesStatus = isOverdue;

    return matchesQuery && matchesStatus;
  });

  transTableBody.innerHTML = '';
  if (filtered.length === 0) {
    transEmptyState.classList.remove('hidden');
    return;
  }

  transEmptyState.classList.add('hidden');

  filtered.forEach(t => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors border-b border-slate-100';

    const isOverdue = t.status === 'Active' && t.dueDate < today;
    let statusBadge = '';
    if (t.status === 'Returned') {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Returned</span>';
    } else if (isOverdue) {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">Overdue</span>';
    } else {
      statusBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Borrowing</span>';
    }

    tr.innerHTML = `
      <td class="py-4 px-6 font-mono text-xs font-semibold text-slate-700">
        ${t.id}
      </td>
      <td class="py-4 px-6 font-medium text-slate-800">
        ${escapeHtml(t.bookTitle)}
      </td>
      <td class="py-4 px-6">
        <div class="font-medium text-slate-800">${escapeHtml(t.borrowerName)}</div>
        <div class="text-xs text-slate-400 font-mono">${escapeHtml(t.borrowerId)}</div>
      </td>
      <td class="py-4 px-6 text-xs text-slate-600">
        ${t.issueDate}
      </td>
      <td class="py-4 px-6 text-xs ${isOverdue ? 'font-bold text-rose-600' : 'text-slate-600'}">
        ${t.dueDate}
      </td>
      <td class="py-4 px-6 text-center">
        ${statusBadge}
      </td>
      <td class="py-4 px-6 text-right whitespace-nowrap">
        ${t.status === 'Active' ? `
          <button onclick="returnBook('${t.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition inline-flex items-center space-x-1">
            <i class="fa-solid fa-rotate-left"></i>
            <span>Process Return</span>
          </button>
        ` : `
          <span class="text-xs text-slate-400"><i class="fa-solid fa-check text-emerald-500 mr-1"></i>Returned ${t.returnDate || ''}</span>
        `}
      </td>
    `;
    transTableBody.appendChild(tr);
  });
}

function editBook(id) {
  const b = books.find(item => item.id === id);
  if (b) openBookModal(b);
}

function exportLibraryReport() {
  if (books.length === 0) {
    showToast('No books to export!', 'error');
    return;
  }

  const headers = ['Book ID', 'ISBN', 'Title', 'Author', 'Category', 'Shelf', 'Total Copies', 'Available Copies'];
  const rows = books.map(b => [
    b.id,
    `"${b.isbn}"`,
    `"${b.title}"`,
    `"${b.author}"`,
    `"${b.category}"`,
    `"${b.shelf || ''}"`,
    b.totalCopies,
    b.availableCopies
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Library_Catalog_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Library Catalog CSV report exported successfully!', 'success');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  const icon = type === 'success' ? 'fa-circle-check text-emerald-500' : 
               type === 'error' ? 'fa-triangle-exclamation text-rose-500' : 'fa-circle-info text-blue-500';
  
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

window.openIssueModal = openIssueModal;
window.returnBook = returnBook;
window.editBook = editBook;
window.deleteBook = deleteBook;
