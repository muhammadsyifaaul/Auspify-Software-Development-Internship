/**
 * Task 5 - Online Examination System (ExamVerse CBT)
 * Archetype: Computer-Based Test (CBT) Cockpit & Certificate Generator
 */

const STORAGE_AUTH_USER = 'auspify_exam_user_v1';
const STORAGE_EXAM_RESULTS = 'auspify_exam_results_v1';

const fallbackExams = [
  {
    id: "EXAM-CS-101",
    title: "Data Structures & Algorithms Certification",
    category: "Computer Science",
    difficulty: "Intermediate",
    durationMinutes: 10,
    passingScore: 70,
    description: "Assess your understanding of time complexity, arrays, trees, graphs, and dynamic programming.",
    questions: [
      {
        id: 1,
        question: "What is the average time complexity of searching in a Balanced Binary Search Tree (AVL Tree)?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctIndex: 1,
        explanation: "Searching in a balanced BST splits the search space in half at each step, yielding O(log n)."
      },
      {
        id: 2,
        question: "Which data structure follows the Last-In, First-Out (LIFO) principle?",
        options: ["Queue", "Stack", "Binary Heap", "Linked List"],
        correctIndex: 1,
        explanation: "A Stack works on the LIFO principle where elements are pushed and popped from top."
      },
      {
        id: 3,
        question: "What is the worst-case time complexity of QuickSort?",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(2^n)"],
        correctIndex: 2,
        explanation: "When an unbalanced pivot is picked repeatedly, QuickSort degrades to O(n^2)."
      },
      {
        id: 4,
        question: "Which algorithm is commonly used to find the shortest path in a graph with non-negative edge weights?",
        options: ["Dijkstra's Algorithm", "Kruskal's Algorithm", "Depth First Search", "Floyd-Warshall"],
        correctIndex: 0,
        explanation: "Dijkstra's algorithm is optimal for single-source shortest paths on non-negative graphs."
      },
      {
        id: 5,
        question: "Which of the following is NOT an in-place sorting algorithm?",
        options: ["Bubble Sort", "Insertion Sort", "Heap Sort", "Merge Sort"],
        correctIndex: 3,
        explanation: "Standard Merge Sort requires O(n) auxiliary space to merge subarrays."
      }
    ]
  },
  {
    id: "EXAM-WEB-201",
    title: "Modern JavaScript & Web Development Assessment",
    category: "Web Development",
    difficulty: "Beginner",
    durationMinutes: 8,
    passingScore: 60,
    description: "Evaluate modern ES6+ syntax, asynchronous programming, DOM manipulation, and promises.",
    questions: [
      {
        id: 1,
        question: "Which keyword is used to declare a block-scoped variable that cannot be reassigned?",
        options: ["var", "let", "const", "def"],
        correctIndex: 2,
        explanation: "'const' creates immutable bindings within block scope."
      },
      {
        id: 2,
        question: "What does Promise.all() return if any of the passed promises reject?",
        options: ["An array with null values", "A promise that immediately rejects with that reason", "The first resolved promise", "It waits for all promises to resolve"],
        correctIndex: 1,
        explanation: "Promise.all() rejects immediately as soon as any promise in the iterable rejects."
      },
      {
        id: 3,
        question: "What will `typeof NaN` evaluate to in JavaScript?",
        options: ["'undefined'", "'nan'", "'number'", "'object'"],
        correctIndex: 2,
        explanation: "NaN is technically of type number."
      },
      {
        id: 4,
        question: "Which method turns a JavaScript object into a JSON formatted string?",
        options: ["JSON.parse()", "JSON.stringify()", "JSON.toString()", "Object.toJSON()"],
        correctIndex: 1,
        explanation: "JSON.stringify() converts a JavaScript value to a JSON string."
      }
    ]
  },
  {
    id: "EXAM-DB-301",
    title: "SQL & Relational Database Architecture",
    category: "Database Systems",
    difficulty: "Advanced",
    durationMinutes: 12,
    passingScore: 75,
    description: "Deep dive into ACID properties, query optimization, indexing strategies, and normalization.",
    questions: [
      {
        id: 1,
        question: "Which normal form removes partial functional dependencies on a composite primary key?",
        options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
        correctIndex: 1,
        explanation: "2NF requires 1NF and no partial dependencies on candidate keys."
      },
      {
        id: 2,
        question: "What does the 'I' in ACID transaction properties stand for?",
        options: ["Integrity", "Isolation", "Indexing", "Immutable"],
        correctIndex: 1,
        explanation: "Isolation prevents concurrent transaction race conditions."
      },
      {
        id: 3,
        question: "Which SQL clause is used to filter records after aggregation with GROUP BY?",
        options: ["WHERE", "HAVING", "FILTER", "ORDER BY"],
        correctIndex: 1,
        explanation: "HAVING filters groups created by the GROUP BY clause."
      },
      {
        id: 4,
        question: "Which index structure is most commonly utilized for range queries in relational databases?",
        options: ["Hash Index", "B+ Tree", "Skip List", "Trie"],
        correctIndex: 1,
        explanation: "B+ Trees support efficient sequential range lookups."
      }
    ]
  }
];

let exams = [];
let currentUser = null;
let currentExam = null;
let currentQuestionIndex = 0;
let userAnswers = {}; // { [idx]: optionIndex }
let flaggedQuestions = new Set();
let timerInterval = null;
let secondsRemaining = 0;
let startTime = null;

// DOM
const viewCatalog = document.getElementById('viewCatalog');
const viewCbtCockpit = document.getElementById('viewCbtCockpit');
const viewCertificate = document.getElementById('viewCertificate');

// Header
const topCandidateDisplay = document.getElementById('topCandidateDisplay');
const switchCandidateBtn = document.getElementById('switchCandidateBtn');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const authNameInput = document.getElementById('authNameInput');
const authIdInput = document.getElementById('authIdInput');

// Catalog
const examsGrid = document.getElementById('examsGrid');
const searchExamInput = document.getElementById('searchExamInput');
const examCategoryFilter = document.getElementById('examCategoryFilter');
const examDifficultyFilter = document.getElementById('examDifficultyFilter');

// CBT Proctor Bar
const cbtSubjectBadge = document.getElementById('cbtSubjectBadge');
const cbtExamTitle = document.getElementById('cbtExamTitle');
const cbtTimerDisplay = document.getElementById('cbtTimerDisplay');
const cbtSubmitBtn = document.getElementById('cbtSubmitBtn');

// CBT Palette & Canvas
const cbtPaletteGrid = document.getElementById('cbtPaletteGrid');
const paletteAnsweredProgress = document.getElementById('paletteAnsweredProgress');
const cbtQuestionIndexIndicator = document.getElementById('cbtQuestionIndexIndicator');
const flagQuestionBtn = document.getElementById('flagQuestionBtn');
const cbtQuestionPrompt = document.getElementById('cbtQuestionPrompt');
const cbtOptionsList = document.getElementById('cbtOptionsList');
const cbtPrevBtn = document.getElementById('cbtPrevBtn');
const cbtNextBtn = document.getElementById('cbtNextBtn');
const cbtClearBtn = document.getElementById('cbtClearBtn');

// Certificate Elements
const certCandidateName = document.getElementById('certCandidateName');
const certExamTitle = document.getElementById('certExamTitle');
const certScore = document.getElementById('certScore');
const certQuestions = document.getElementById('certQuestions');
const certTime = document.getElementById('certTime');
const certIssueDate = document.getElementById('certIssueDate');
const certBackToCatalogBtn = document.getElementById('certBackToCatalogBtn');

document.addEventListener('DOMContentLoaded', async () => {
  loadUser();
  await loadExams();
  setupEventListeners();
  renderCatalog();
});

function loadUser() {
  const stored = localStorage.getItem(STORAGE_AUTH_USER);
  currentUser = stored ? JSON.parse(stored) : {
    name: 'Muhammad Syifaaul',
    id: 'AUSP-2026-08'
  };
  topCandidateDisplay.textContent = `Candidate: ${currentUser.name} (${currentUser.id})`;
}

async function loadExams() {
  try {
    const res = await fetch('exams.json');
    if (!res.ok) throw new Error();
    exams = await res.json();
  } catch (e) {
    exams = [...fallbackExams];
  }
}

function setupEventListeners() {
  switchCandidateBtn.addEventListener('click', () => {
    authNameInput.value = currentUser.name;
    authIdInput.value = currentUser.id;
    authModal.classList.remove('hidden');
  });
  closeAuthBtn.addEventListener('click', () => authModal.classList.add('hidden'));
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser = {
      name: authNameInput.value.trim(),
      id: authIdInput.value.trim()
    };
    localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(currentUser));
    topCandidateDisplay.textContent = `Candidate: ${currentUser.name} (${currentUser.id})`;
    authModal.classList.add('hidden');
    showToast('Candidate ID updated', 'success');
  });

  searchExamInput.addEventListener('input', renderCatalog);
  examCategoryFilter.addEventListener('change', renderCatalog);
  examDifficultyFilter.addEventListener('change', renderCatalog);

  // CBT Controls
  cbtPrevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderActiveCbtQuestion();
    }
  });

  cbtNextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      currentQuestionIndex++;
      renderActiveCbtQuestion();
    }
  });

  cbtClearBtn.addEventListener('click', () => {
    delete userAnswers[currentQuestionIndex];
    renderActiveCbtQuestion();
  });

  flagQuestionBtn.addEventListener('click', () => {
    if (flaggedQuestions.has(currentQuestionIndex)) {
      flaggedQuestions.delete(currentQuestionIndex);
    } else {
      flaggedQuestions.add(currentQuestionIndex);
    }
    renderActiveCbtQuestion();
  });

  cbtSubmitBtn.addEventListener('click', () => {
    const answeredCount = Object.keys(userAnswers).length;
    const total = currentExam.questions.length;
    if (confirm(`You answered ${answeredCount} of ${total} questions. Ready to submit for scoring?`)) {
      finalizeCbtExam();
    }
  });

  certBackToCatalogBtn.addEventListener('click', () => {
    viewCertificate.classList.add('hidden');
    viewCatalog.classList.remove('hidden');
    renderCatalog();
  });
}

function renderCatalog() {
  const query = searchExamInput.value.toLowerCase().trim();
  const cat = examCategoryFilter.value;
  const diff = examDifficultyFilter.value;

  const filtered = exams.filter(e => {
    const matchesQ = !query || e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query);
    const matchesC = !cat || e.category === cat;
    const matchesD = !diff || e.difficulty === diff;
    return matchesQ && matchesC && matchesD;
  });

  examsGrid.innerHTML = '';
  filtered.forEach(e => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group';

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            e.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-800' :
            e.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
          }">${e.difficulty}</span>
          <span class="text-xs text-slate-400 font-mono"><i class="fa-regular fa-clock mr-1"></i>${e.durationMinutes} min</span>
        </div>

        <h3 class="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">${escapeHtml(e.title)}</h3>
        <p class="text-xs text-slate-500 mt-2 line-clamp-2">${escapeHtml(e.description)}</p>

        <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
          <span><i class="fa-solid fa-list-check text-indigo-500 mr-1"></i>${e.questions.length} Items</span>
          <span>Pass Mark: <strong>${e.passingScore}%</strong></span>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[11px] text-slate-400 font-mono">Proctored CBT</span>
        <button onclick="startCbt('${e.id}')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs inline-flex items-center space-x-1.5">
          <span>Start Assessment</span>
          <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>
    `;
    examsGrid.appendChild(card);
  });
}

function startCbt(examId) {
  const e = exams.find(item => item.id === examId);
  if (!e) return;

  currentExam = e;
  currentQuestionIndex = 0;
  userAnswers = {};
  flaggedQuestions.clear();
  startTime = new Date();
  secondsRemaining = e.durationMinutes * 60;

  cbtSubjectBadge.textContent = e.category;
  cbtExamTitle.textContent = e.title;

  viewCatalog.classList.add('hidden');
  viewCertificate.classList.add('hidden');
  viewCbtCockpit.classList.remove('hidden');

  startTimer();
  renderActiveCbtQuestion();
}

function startTimer() {
  clearInterval(timerInterval);
  updateTimerText();

  timerInterval = setInterval(() => {
    secondsRemaining--;
    updateTimerText();

    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      showToast('Time expired! Auto submitting assessment...', 'info');
      finalizeCbtExam();
    }
  }, 1000);
}

function updateTimerText() {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  cbtTimerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderActiveCbtQuestion() {
  const q = currentExam.questions[currentQuestionIndex];
  const total = currentExam.questions.length;

  cbtQuestionIndexIndicator.textContent = `Question ${currentQuestionIndex + 1} of ${total}`;
  cbtQuestionPrompt.textContent = q.question;

  // Flag Status
  const isFlagged = flaggedQuestions.has(currentQuestionIndex);
  flagQuestionBtn.className = isFlagged
    ? 'text-xs text-amber-600 font-bold inline-flex items-center space-x-1 transition'
    : 'text-xs text-slate-400 hover:text-amber-600 font-semibold inline-flex items-center space-x-1 transition';
  flagQuestionBtn.innerHTML = `<i class="${isFlagged ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i><span>${isFlagged ? 'Review Flagged' : 'Mark for Review'}</span>`;

  // Options
  cbtOptionsList.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const isSelected = userAnswers[currentQuestionIndex] === idx;
    const btn = document.createElement('button');
    btn.className = `w-full text-left p-4 rounded-xl border transition flex items-center justify-between text-xs ${
      isSelected
        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-xs ring-1 ring-indigo-600'
        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
    }`;

    btn.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
        }">${String.fromCharCode(65 + idx)}</span>
        <span class="text-xs leading-relaxed">${escapeHtml(opt)}</span>
      </div>
      ${isSelected ? '<i class="fa-solid fa-circle-check text-indigo-600 text-sm"></i>' : ''}
    `;

    btn.addEventListener('click', () => {
      userAnswers[currentQuestionIndex] = idx;
      renderActiveCbtQuestion();
    });

    cbtOptionsList.appendChild(btn);
  });

  // Buttons State
  cbtPrevBtn.disabled = currentQuestionIndex === 0;
  cbtPrevBtn.className = currentQuestionIndex === 0
    ? 'px-4 py-2 rounded-xl border border-slate-100 text-xs font-semibold text-slate-300 cursor-not-allowed'
    : 'px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50';

  cbtNextBtn.innerHTML = currentQuestionIndex === total - 1
    ? 'Review Complete <i class="fa-solid fa-check ml-1"></i>'
    : 'Next Question <i class="fa-solid fa-arrow-right ml-1"></i>';

  renderPalette();
}

function renderPalette() {
  cbtPaletteGrid.innerHTML = '';
  const total = currentExam.questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  paletteAnsweredProgress.textContent = `${answeredCount} / ${total} Done`;

  currentExam.questions.forEach((_, idx) => {
    const isCur = idx === currentQuestionIndex;
    const isAns = userAnswers.hasOwnProperty(idx);
    const isFlg = flaggedQuestions.has(idx);

    const btn = document.createElement('button');
    let colorClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
    if (isAns) colorClass = 'bg-emerald-600 text-white font-bold';
    else if (isFlg) colorClass = 'bg-amber-400 text-slate-900 font-bold';

    btn.className = `h-9 rounded-lg font-mono text-xs transition flex items-center justify-center ${colorClass} ${
      isCur ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
    }`;
    btn.textContent = idx + 1;
    btn.addEventListener('click', () => {
      currentQuestionIndex = idx;
      renderActiveCbtQuestion();
    });
    cbtPaletteGrid.appendChild(btn);
  });
}

function finalizeCbtExam() {
  clearInterval(timerInterval);

  let correctCount = 0;
  currentExam.questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctIndex) correctCount++;
  });

  const total = currentExam.questions.length;
  const scorePercent = Math.round((correctCount / total) * 100);
  const passed = scorePercent >= currentExam.passingScore;

  const durationSec = Math.max(1, Math.round((new Date() - startTime) / 1000));
  const timeStr = `${Math.floor(durationSec / 60).toString().padStart(2, '0')}:${(durationSec % 60).toString().padStart(2, '0')}`;

  // Populate Certificate
  certCandidateName.textContent = currentUser.name;
  certExamTitle.textContent = currentExam.title;
  certScore.textContent = `${scorePercent}%`;
  certQuestions.textContent = `${correctCount} / ${total}`;
  certTime.textContent = timeStr;
  certIssueDate.textContent = `Date of Issue: ${new Date().toISOString().split('T')[0]}`;

  viewCbtCockpit.classList.add('hidden');
  viewCertificate.classList.remove('hidden');

  if (passed) {
    showToast(`Passed with ${scorePercent}%! Certificate unlocked.`, 'success');
  } else {
    showToast(`Assessment finished: Score ${scorePercent}% (Pass Mark: ${currentExam.passingScore}%)`, 'info');
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast-enter pointer-events-auto bg-[#0f172a] text-white shadow-xl px-4 py-2.5 rounded-xl flex items-center space-x-2.5 text-xs min-w-[240px] border border-slate-700';
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-indigo-400"></i><span class="font-medium">${message}</span>`;
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

window.startCbt = startCbt;
