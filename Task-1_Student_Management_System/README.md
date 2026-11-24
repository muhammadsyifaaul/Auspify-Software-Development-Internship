# Task 1: Student Management System (EduTrack Pro)

##  Overview
EduTrack Pro is a modern, responsive web application designed to manage student records efficiently for educational institutions. Developed as part of the **Auspify Technologies Software Development Internship**.

---

##  Features Implemented
- **CRUD Operations**:
  - **Add Student**: Register new students with validation (ID/NIM, Full Name, Email, Phone, Department, GPA, Enrollment Date, Status).
  - **View Student**: Interactive Student Profile Modal with GPA indicator and contact details.
  - **Update Details**: Full editing capability with pre-filled inputs and validation.
  - **Delete Records**: Safe deletion with confirmation prompt.
- **Search & Filtering**:
  - Real-time search by Student ID, Full Name, or Email.
  - Filter by Department (Computer Science, Software Engineering, Information Systems, etc.).
  - Filter by Academic Status (Active, Probation, Graduated, Suspended).
- **Analytics & Dashboard KPIs**:
  - Total student count
  - Active enrollment metrics
  - Real-time Average GPA calculation
  - Department breakdown count
- **Data Persistence**:
  - Saved automatically to browser `localStorage` with initial seed data.
- **Data Export**:
  - One-click export to CSV spreadsheet.

---

##  Tech Stack
- **HTML5 & Modern Semantic Elements**
- **Tailwind CSS (via CDN)** for responsive, utility-first styling
- **JavaScript (ES6+)** with modular state management
- **FontAwesome Icons**

---

##  How to Run
1. Open the project folder: `Task-1_Student_Management_System`.
2. Double click `index.html` or open it with any web browser (Chrome, Edge, Firefox).
3. (Optional) Run with local server:
   ```bash
   npx serve .
   ```
