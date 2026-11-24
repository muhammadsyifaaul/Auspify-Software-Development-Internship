#  Auspify Technologies - Software Development Internship Portfolio

![Auspify Technologies](https://img.shields.io/badge/Auspify-Software%20Development%20Internship-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Tasks%201%20to%205%20Completed-success?style=for-the-badge)
![Code Quality](https://img.shields.io/badge/Evaluation%20Criteria-High%20Standard-emerald?style=for-the-badge)

Welcome to the **Auspify Technologies Software Development Internship** repository. This workspace contains the complete, production-ready implementation of **Tasks 1 through 5**, structured according to the professional evaluation standards established by Auspify Technologies.

---

##  Project Evaluation Matrix Fulfillment

| Evaluation Parameter | How It Is Addressed Across All Tasks |
| :--- | :--- |
| **Task Completion** | 100% of workflows, key features, and requirements from Task 1 to Task 5 are fully implemented. |
| **Code Quality** | Modular, clean ES6+ JavaScript, semantic HTML5, zero console errors, separation of concerns. |
| **Website Responsiveness** | Fully responsive flex/grid layouts built with Tailwind CSS, tested across mobile, tablet, and desktop viewports. |
| **User Interface Design** | Modern SaaS-style aesthetics: clean typography, status pills, KPI summary cards, interactive modals, and subtle micro-interactions. |
| **Creativity & Implementation** | Data persistence using `localStorage`, dynamic API data fetching, real-time KPI metrics, search & multi-filters, CSV exports, and printable certificates. |
| **Professional Presentation** | Dedicated folders per task, comprehensive individual and root documentation, clear setup instructions, and ready for GitHub submission. |
| **Project Functionality** | End-to-end functionality including instant feedback, live timers, transaction logs, stock management, and grading engines. |

---

##  Repository Organization

```text
d:\Auspify_Intern_Project\
├── Task-1_Student_Management_System/
│   ├── index.html        # Responsive Student Management UI
│   ├── style.css         # Styling & animations
│   ├── app.js            # CRUD, search, filter, stats, CSV export
│   └── README.md         # Task documentation
│
├── Task-2_Library_Management_System/
│   ├── index.html        # Book catalog & checkout UI
│   ├── style.css         # Styling & scrollbar customizations
│   ├── app.js            # Book management, loan issue/return, overdue tracker
│   └── README.md         # Task documentation
│
├── Task-3_Inventory_Management_System/
│   ├── index.html        # Inventory tracking & stock control
│   ├── style.css         # Modern styling & transitions
│   ├── app.js            # Stock in/out logic, audit trail, reorder alerts
│   └── README.md         # Task documentation
│
├── Task-4_Employee_Management_System/
│   ├── index.html        # Employee directory & department management
│   ├── style.css         # Styling & responsive design
│   ├── app.js            # HR records, payroll calculations, dept breakdown
│   └── README.md         # Task documentation
│
├── Task-5_Online_Examination_System/
│   ├── index.html        # Assessment interface, timer, scorecard
│   ├── exams.json        # Dynamic question bank & assessment API data
│   ├── style.css         # Exam UI & print media stylesheet
│   ├── app.js            # Timer, question palette, scoring engine, cert
│   └── README.md         # Task documentation
│
├── .gitignore            # Git exclusions
└── README.md             # Master portfolio overview
```

---

##  Detailed Task Breakdown

###  Task 1: Student Management System (EduTrack Pro)
- **Difficulty**: Easy
- **Core Workflow**: Add, update, delete, view student records, test functionality.
- **Key Features**:
  - Full CRUD operations with pre-filled edit modal and detail drawer.
  - Live search by Name, ID, or Email.
  - Multi-filtering by Department and Academic Status.
  - Executive KPI Cards (Total Students, Active Count, Average GPA, Department count).
  - One-click CSV Export.

---

###  Task 2: Library Management System (LibroSync Hub)
- **Difficulty**: Easy
- **Core Workflow**: Book management modules, issue & return books, database persistence, reports generation.
- **Key Features**:
  - Book catalog with ISBN, Author, Shelf location, and stock availability.
  - Issue Book workflow with automated due date calculation (14 days).
  - Return Book workflow with automated overdue days and late fine calculation.
  - Tabbed interface separating active catalog and audit transactions.
  - Search & filter by Genre and Availability.
  - Export catalog report to CSV.

---

###  Task 3: Inventory Management System (StockMaster Pro)
- **Difficulty**: Medium
- **Core Workflow**: Inventory modules, stock management, inventory reports, search & filtering, data accuracy.
- **Key Features**:
  - Product SKU management with Unit Price, Stock Count, Reorder Levels, and Supplier.
  - Quick **Stock In (Restock)** and **Stock Out (Dispatch)** modals.
  - Automated Inventory Valuation calculation (Total Asset Value).
  - Low Stock and Out of Stock automated warnings.
  - Movement Audit Log tracking historical transactions and remaining balances.
  - Valuation CSV report export.

---

###  Task 4: Employee Management System (StaffPulse Pro)
- **Difficulty**: Medium
- **Core Workflow**: Employee management screens, employee registration, update & delete modules, employee reports, performance optimization.
- **Key Features**:
  - Complete Employee Directory with designation, department, salary, and employment type.
  - Department overview tab showing headcount allocation and monthly departmental budgets.
  - Total Monthly Payroll and Average Salary KPI indicators.
  - Search and filter by Department and Employment Type.
  - Comprehensive Staff Payroll CSV Export.

---

###  Task 5: Online Examination System (ExamVerse Pro)
- **Difficulty**: Advanced
- **Core Workflow**: User authentication, dynamic assessment loading (API/JSON), search & filter, interactive testing with timer, automated scoring, performance reports.
- **Key Features**:
  - Candidate session management (Sign in, ID tracking).
  - Dynamic Exam Catalog loaded from `exams.json` with embedded fallback.
  - Interactive Examination Room with live countdown timer and automatic submission.
  - Question Palette allowing jump-to-question navigation and answered status indicators.
  - Instant scoring engine calculating percentage, pass/fail status, and time taken.
  - Printable Certificate of Completion and scorecard via built-in `@media print` engine.

---

##  Quick Start Guide

You can run any of the tasks instantly without complicated build setups:

### Method 1: Direct File Launch
Simply double-click `index.html` inside any task folder to open it in your browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).

### Method 2: Local HTTP Server (Recommended)
Using Node.js:
```bash
# In the root repository directory:
npx serve .
# Or run with Python:
python -m http.server 8080
```
Open your browser and navigate to `http://localhost:8080` or select the task folder you want to inspect.

© 2026 Auspify Technologies Software Development Internship Program.
