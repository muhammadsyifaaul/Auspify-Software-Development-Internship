/**
 * Task 5 - Online Examination System
 * Auspify Technologies Software Development Internship
 * Features:
 * - Student Authentication & Session Management
 * - Dynamic Exam Catalog loading (from exams.json with fallback)
 * - Search & Filter (Category, Difficulty)
 * - Timed Examination Room with live countdown timer
 * - Interactive Question Navigation & Palette
 * - Automated Result & Scoring calculation
 * - Printable Certificate / Scorecard
 */

const STORAGE_AUTH_USER = 'auspify_exam_user_v1';
const STORAGE_EXAM_RESULTS = 'auspify_exam_results_v1';

// Fallback Exam Data in case JSON fetch is blocked by local file:// policy
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
        explanation: "According to the IEEE 754 floating-point standard, NaN is technically a numerical value."
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
        explanation: "2NF requires 1NF and no non-prime attribute to be dependent on any proper subset of any candidate key."
      },
      {
        id: 2,
        question: "What does the 'I' in ACID transaction properties stand for?",
        options: ["Integrity", "Isolation", "Indexing", "Immutable"],
        correctIndex: 1,
        explanation: "Isolation ensures concurrent transactions execute without interfering with one another."
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
        question: "Which index structure is most commonly utilized by relational database storage engines for range queries?",
        options: ["Hash Index", "B+ Tree", "Skip List", "Trie"],
        correctIndex: 1,
        explanation: "B+ Trees store sequential pointers across leaf nodes, making range queries exceptionally fast."
      }
    ]
  }
];

let exams = [];
let currentUser = null;
let completedResults = [];

// Active Exam State
let currentExam = null;
let currentQuestionIndex = 0;
let userAnswers = {}; // { [qIndex]: selectedOptionIndex }
let timerInterval = null;
let secondsRemaining = 0;
let startTime = null;

// DOM View References
const viewCatalog = document.getElementById('viewCatalog');
const viewExamInterface = document.getElementById('viewExamInterface');
const viewResult = document.getElementById('viewResult');

// Header Auth
const authBtn = document.getElementById('authBtn');
const authBtnText = document.getElementById('authBtnText');
const authUserBadge = document.getElementById('authUserBadge');
const headerUserName = document.getElementById('headerUserName');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const authNameInput = document.getElementById('authNameInput');
const authIdInput = document.getElementById('authIdInput');
const authEmailInput = document.getElementById('authEmailInput');

// Catalog DOM
const examsGrid = document.getElementById('examsGrid');
const searchExamInput = document.getElementById('searchExamInput');
const examCategoryFilter = document.getElementById('examCategoryFilter');
const examDifficultyFilter = document.getElementById('examDifficultyFilter');
const statTotalExams = document.getElementById('statTotalExams');
const statCompletedTests = document.getElementById('statCompletedTests');
const statAvgScore = document.getElementById('statAvgScore');

// Active Exam DOM
const activeExamCategoryBadge = document.getElementById('activeExamCategoryBadge');
const activeExamTitle = document.getElementById('activeExamTitle');
const timerDisplay = document.getElementById('timerDisplay');
const finishExamBtn = document.getElementById('finishExamBtn');
const questionNumberIndicator = document.getElementById('questionNumberIndicator');
const currentQuestionText = document.getElementById('currentQuestionText');
const optionsContainer = document.getElementById('optionsContainer');
const prevQuestionBtn = document.getElementById('prevQuestionBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const questionPaletteGrid = document.getElementById('questionPaletteGrid');

// Result DOM
const resultIconContainer = document.getElementById('resultIconContainer');
const resultBadge = document.getElementById('resultBadge');
const resultExamTitle = document.getElementById('resultExamTitle');
const resultFeedback = document.getElementById('resultFeedback');
const resultScorePercent = document.getElementById('resultScorePercent');
const resultCorrectCount = document.getElementById('resultCorrectCount');
const resultTimeTaken = document.getElementById('resultTimeTaken');
const backToCatalogBtn = document.getElementById('backToCatalogBtn');
const printCertBtn = document.getElementById('printCertBtn');

document.addEventListener('DOMContentLoaded', async () => {
  loadAuthUser();
  loadResults();
  await fetchExams();
  setupEventListeners();
  renderCatalog();
});

function loadAuthUser() {
  const stored = localStorage.getItem(STORAGE_AUTH_USER);
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
      updateAuthUI();
    } catch (e) {
      currentUser = null;
    }
  } else {
    // Default guest candidate
    currentUser = {
      name: 'Muhammad Syifaaul',
      id: 'AUSP-2026-08',
      email: 'candidate@auspify.com'
    };
    saveAuthUser();
    updateAuthUI();
  }
}

function saveAuthUser() {
  localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(currentUser));
}

function updateAuthUI() {
  if (currentUser) {
    headerUserName.textContent = currentUser.name;
    authUserBadge.classList.remove('hidden');
    authBtnText.textContent = 'Switch Candidate';
  } else {
    authUserBadge.classList.add('hidden');
    authBtnText.textContent = 'Sign In';
  }
}

function loadResults() {
  const stored = localStorage.getItem(STORAGE_EXAM_RESULTS);
  if (stored) {
    try {
      completedResults = JSON.parse(stored);
    } catch (e) {
      completedResults = [];
    }
  }
  updateStats();
}

function saveResults() {
  localStorage.setItem(STORAGE_EXAM_RESULTS, JSON.stringify(completedResults));
  updateStats();
}

async function fetchExams() {
  try {
    const res = await fetch('exams.json');
    if (!res.ok) throw new Error('Network error loading exams');
    exams = await res.json();
  } catch (err) {
    console.warn('Using embedded exams fallback:', err);
    exams = [...fallbackExams];
  }
}

function setupEventListeners() {
  // Auth
  authBtn.addEventListener('click', () => {
    if (currentUser) {
      authNameInput.value = currentUser.name;
      authIdInput.value = currentUser.id;
      authEmailInput.value = currentUser.email || '';
    }
    authModal.classList.remove('hidden');
  });
  closeAuthModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser = {
      name: authNameInput.value.trim(),
      id: authIdInput.value.trim(),
      email: authEmailInput.value.trim()
    };
    saveAuthUser();
    updateAuthUI();
    authModal.classList.add('hidden');
    showToast(`Signed in as ${currentUser.name}!`, 'success');
  });

  // Filters
  searchExamInput.addEventListener('input', renderCatalog);
  examCategoryFilter.addEventListener('change', renderCatalog);
  examDifficultyFilter.addEventListener('change', renderCatalog);

  // Exam interface navigation
  prevQuestionBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderActiveQuestion();
    }
  });

  nextQuestionBtn.addEventListener('click', () => {
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      currentQuestionIndex++;
      renderActiveQuestion();
    }
  });

  finishExamBtn.addEventListener('click', () => {
    const answeredCount = Object.keys(userAnswers).length;
    const total = currentExam.questions.length;
    if (answeredCount < total) {
      if (!confirm(`You have answered ${answeredCount} of ${total} questions. Are you sure you want to finish and submit now?`)) {
        return;
      }
    } else {
      if (!confirm('Are you ready to submit your assessment for scoring?')) return;
    }
    finalizeExam();
  });

  // Result navigation
  backToCatalogBtn.addEventListener('click', () => {
    viewResult.classList.add('hidden');
    viewCatalog.classList.remove('hidden');
    renderCatalog();
  });

  printCertBtn.addEventListener('click', () => {
    window.print();
  });
}

function updateStats() {
  statTotalExams.textContent = exams.length;
  statCompletedTests.textContent = completedResults.length;

  if (completedResults.length > 0) {
    const totalScore = completedResults.reduce((acc, r) => acc + r.scorePercent, 0);
    const avg = Math.round(totalScore / completedResults.length);
    statAvgScore.textContent = `${avg}%`;
  } else {
    statAvgScore.textContent = '0%';
  }
}

function renderCatalog() {
  updateStats();
  const query = searchExamInput.value.toLowerCase().trim();
  const category = examCategoryFilter.value;
  const difficulty = examDifficultyFilter.value;

  const filtered = exams.filter(e => {
    const matchesQuery = !query ||
      e.title.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      e.category.toLowerCase().includes(query);

    const matchesCat = !category || e.category === category;
    const matchesDiff = !difficulty || e.difficulty === difficulty;

    return matchesQuery && matchesCat && matchesDiff;
  });

  examsGrid.innerHTML = '';
  if (filtered.length === 0) {
    examsGrid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200">
        <i class="fa-solid fa-graduation-cap text-4xl text-slate-300 mb-3"></i>
        <p class="text-sm text-slate-500 font-semibold">No assessments match your filter criteria.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(exam => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group';

    const diffBadge = exam.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                      exam.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700';

    // Check if user previously took this exam
    const previousAttempt = completedResults.find(r => r.examId === exam.id);

    card.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${diffBadge}">
            ${exam.difficulty}
          </span>
          <span class="text-xs text-slate-400 font-medium">
            <i class="fa-regular fa-clock mr-1"></i>${exam.durationMinutes} mins
          </span>
        </div>

        <h3 class="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition">
          ${escapeHtml(exam.title)}
        </h3>

        <p class="text-xs text-slate-500 mt-2 line-clamp-2">
          ${escapeHtml(exam.description)}
        </p>

        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span><i class="fa-solid fa-circle-question text-indigo-500 mr-1"></i>${exam.questions.length} Questions</span>
          <span><i class="fa-solid fa-bullseye text-amber-500 mr-1"></i>Pass: ${exam.passingScore}%</span>
        </div>
      </div>

      <div class="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        ${previousAttempt ? `
          <div class="text-xs">
            <span class="text-slate-400">Best Score:</span>
            <span class="font-bold ${previousAttempt.passed ? 'text-emerald-600' : 'text-rose-600'}">${previousAttempt.scorePercent}%</span>
          </div>
        ` : `
          <span class="text-xs text-slate-400">Not Attempted</span>
        `}
        <button onclick="startExam('${exam.id}')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm inline-flex items-center space-x-1">
          <span>${previousAttempt ? 'Retake Exam' : 'Start Assessment'}</span>
          <i class="fa-solid fa-arrow-right text-xs"></i>
        </button>
      </div>
    `;
    examsGrid.appendChild(card);
  });
}

function startExam(examId) {
  const exam = exams.find(e => e.id === examId);
  if (!exam) return;

  currentExam = exam;
  currentQuestionIndex = 0;
  userAnswers = {};
  startTime = new Date();
  secondsRemaining = exam.durationMinutes * 60;

  activeExamCategoryBadge.textContent = exam.category;
  activeExamTitle.textContent = exam.title;

  viewCatalog.classList.add('hidden');
  viewResult.classList.add('hidden');
  viewExamInterface.classList.remove('hidden');

  startTimer();
  renderActiveQuestion();
}

function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    secondsRemaining--;
    updateTimerDisplay();

    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      showToast('Time expired! Submitting your exam automatically...', 'info');
      finalizeExam();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderActiveQuestion() {
  const q = currentExam.questions[currentQuestionIndex];
  const total = currentExam.questions.length;

  questionNumberIndicator.textContent = `Question ${currentQuestionIndex + 1} of ${total}`;
  currentQuestionText.textContent = q.question;

  // Render options
  optionsContainer.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const isSelected = userAnswers[currentQuestionIndex] === idx;
    const btn = document.createElement('button');
    btn.className = `w-full text-left p-4 rounded-xl border transition flex items-center justify-between text-sm ${
      isSelected 
        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-semibold shadow-sm ring-1 ring-indigo-600' 
        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
    }`;

    btn.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
        }">
          ${String.fromCharCode(65 + idx)}
        </span>
        <span>${escapeHtml(opt)}</span>
      </div>
      ${isSelected ? '<i class="fa-solid fa-circle-check text-indigo-600 text-base"></i>' : ''}
    `;

    btn.addEventListener('click', () => {
      userAnswers[currentQuestionIndex] = idx;
      renderActiveQuestion();
      renderPalette();
    });

    optionsContainer.appendChild(btn);
  });

  // Buttons state
  prevQuestionBtn.disabled = currentQuestionIndex === 0;
  prevQuestionBtn.className = currentQuestionIndex === 0 
    ? 'px-4 py-2 rounded-xl border border-slate-100 text-xs font-semibold text-slate-300 cursor-not-allowed'
    : 'px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition';

  if (currentQuestionIndex === total - 1) {
    nextQuestionBtn.textContent = 'Review Answers';
  } else {
    nextQuestionBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right ml-1"></i>';
  }

  renderPalette();
}

function renderPalette() {
  questionPaletteGrid.innerHTML = '';
  currentExam.questions.forEach((_, idx) => {
    const isCurrent = idx === currentQuestionIndex;
    const isAnswered = userAnswers.hasOwnProperty(idx);

    const btn = document.createElement('button');
    btn.className = `h-9 rounded-lg font-bold text-xs transition flex items-center justify-center ${
      isCurrent 
        ? 'ring-2 ring-indigo-600 ring-offset-1 ' 
        : ''
    } ${
      isAnswered 
        ? 'bg-indigo-600 text-white' 
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;
    btn.textContent = idx + 1;
    btn.addEventListener('click', () => {
      currentQuestionIndex = idx;
      renderActiveQuestion();
    });
    questionPaletteGrid.appendChild(btn);
  });
}

function finalizeExam() {
  clearInterval(timerInterval);

  let correctCount = 0;
  currentExam.questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });

  const total = currentExam.questions.length;
  const scorePercent = Math.round((correctCount / total) * 100);
  const passed = scorePercent >= currentExam.passingScore;

  const endTime = new Date();
  const timeTakenSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
  const timeMins = Math.floor(timeTakenSeconds / 60);
  const timeSecs = timeTakenSeconds % 60;
  const timeStr = `${timeMins.toString().padStart(2, '0')}:${timeSecs.toString().padStart(2, '0')}`;

  const resultRecord = {
    examId: currentExam.id,
    examTitle: currentExam.title,
    candidateName: currentUser ? currentUser.name : 'Guest Candidate',
    candidateId: currentUser ? currentUser.id : 'N/A',
    scorePercent,
    correctCount,
    totalQuestions: total,
    passed,
    date: new Date().toISOString().split('T')[0],
    timeTaken: timeStr
  };

  // Upsert result
  const existingIdx = completedResults.findIndex(r => r.examId === currentExam.id);
  if (existingIdx !== -1) {
    completedResults[existingIdx] = resultRecord;
  } else {
    completedResults.unshift(resultRecord);
  }
  saveResults();

  // Render Result UI
  resultExamTitle.textContent = currentExam.title;
  resultScorePercent.textContent = `${scorePercent}%`;
  resultCorrectCount.textContent = `${correctCount} / ${total}`;
  resultTimeTaken.textContent = timeStr;

  if (passed) {
    resultIconContainer.className = 'w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl shadow-inner bg-emerald-100 text-emerald-600';
    resultIconContainer.innerHTML = '<i class="fa-solid fa-trophy"></i>';
    resultBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200';
    resultBadge.textContent = 'Assessment Passed';
    resultFeedback.textContent = `Congratulations, ${resultRecord.candidateName}! You have successfully demonstrated competency in ${currentExam.category}.`;
    printCertBtn.classList.remove('hidden');
  } else {
    resultIconContainer.className = 'w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl shadow-inner bg-rose-100 text-rose-600';
    resultIconContainer.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    resultBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200';
    resultBadge.textContent = 'Assessment Failed';
    resultFeedback.textContent = `You scored ${scorePercent}%, which is below the passing requirement of ${currentExam.passingScore}%. You can review the material and retake the exam anytime.`;
  }

  viewExamInterface.classList.add('hidden');
  viewResult.classList.remove('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  const icon = type === 'success' ? 'fa-circle-check text-emerald-500' : 
               type === 'error' ? 'fa-triangle-exclamation text-rose-500' : 'fa-circle-info text-indigo-500';
  
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

window.startExam = startExam;
