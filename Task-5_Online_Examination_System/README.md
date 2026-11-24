# Task 5: Online Examination System (ExamVerse Pro)

## 📌 Overview
ExamVerse Pro is an advanced, responsive web application for conducting and grading timed online assessments. Developed as the Capstone Task 5 of the **Auspify Technologies Software Development Internship**, it features candidate authentication, dynamic assessment catalog loading (via API/JSON), an interactive exam room with real-time countdown timers, question palettes, automated score calculations, and printable certificates of completion.

---

## 🚀 Features Implemented
- **Candidate Authentication & Profile**:
  - Full session handling (Name, Candidate ID, Email) for tracking scores and certificates.
- **Dynamic Assessment Catalog (API Integration)**:
  - Fetches tests dynamically from `exams.json` (with embedded fallback for local file execution).
  - Search exams by title, topic, or keyword.
  - Filter by Category (Computer Science, Web Development, Database Systems) and Difficulty (Beginner, Intermediate, Advanced).
- **Interactive Examination Room**:
  - **Live Countdown Timer**: Real-time timer with automated submission upon expiration.
  - **Question Navigation Palette**: Quick jumping between questions with visual answered/unanswered color codes.
  - **Single Choice Options**: Instant selection feedback and answer preservation.
- **Automated Results & Scoring Engine**:
  - Immediate percentage grading based on passing thresholds.
  - Detailed score card showing total questions, correct answers, time taken, and pass/fail badge.
- **Printable Certificate & Scorecard**:
  - Built-in print/PDF certificate styling (`@media print`) for official completion verification.
- **Persistent State**:
  - User session and examination history stored in `localStorage`.

---

## 🛠️ Tech Stack
- **HTML5 & Semantic Structure**
- **Tailwind CSS**
- **JavaScript (ES6+)**
- **JSON Data Architecture**
- **FontAwesome 6**

---

## 💻 How to Run
1. Navigate to `Task-5_Online_Examination_System`.
2. Double-click `index.html` or serve via local server:
   ```bash
   npx serve .
   ```
