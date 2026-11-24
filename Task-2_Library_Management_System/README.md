# Task 2: Library Management System (LibroSync Hub)

## 📌 Overview
LibroSync Hub is a comprehensive web-based Library Management System developed for the **Auspify Technologies Software Development Internship**. It streamlines book cataloging, stock availability, member checkout/issue flows, return handling, overdue detection, and late fee tracking.

---

## 🚀 Features Implemented
- **Book Catalog Management**:
  - Add, edit, and delete books with fields: Title, Author, ISBN, Category, Shelf Location, Total Copies, and Published Year.
  - Automatically calculates and updates available copies based on active loans.
  - Safe deletion: prevents deletion of books currently borrowed.
- **Book Issue & Return Functionality**:
  - Issue books to members/students with automated due dates (14-day loan standard).
  - One-click return processing that instantly restocks book copies.
  - Overdue detection with visual alerts and late fine calculator.
- **Search & Multi-criteria Filtering**:
  - Search by Title, Author, or ISBN.
  - Filter by Category (Computer Science, AI, Software Engineering, etc.).
  - Filter by Availability (Available Now vs Fully Borrowed).
- **Tabbed Interface & Transactions Ledger**:
  - Clean separation between Book Catalog and Issue & Return Transaction history.
- **Analytics & Report Generation**:
  - Total titles, total volume copies, active borrows, and overdue count.
  - One-click CSV export of full library catalog.
- **Data Persistence**:
  - Saved to `localStorage` with initial seed books & transaction records.

---

## 🛠️ Tech Stack
- **HTML5 & Semantic Structure**
- **Tailwind CSS** for responsive styling
- **JavaScript (ES6+)**
- **FontAwesome 6**

---

## 💻 How to Run
1. Navigate to `Task-2_Library_Management_System`.
2. Double click `index.html` or open in any modern browser.
