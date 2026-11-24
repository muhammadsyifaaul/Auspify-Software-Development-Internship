# Task 3: Inventory Management System (StockMaster Pro)

## 📌 Overview
StockMaster Pro is a robust, responsive inventory management application developed for the **Auspify Technologies Software Development Internship**. It empowers businesses to track products, monitor stock thresholds, log stock movements (in/out), calculate total asset valuation, and generate instant inventory audit reports.

---

## 🚀 Features Implemented
- **Inventory Product Management**:
  - Full CRUD for products: SKU Code, Name, Category, Unit Price, Stock Quantity, Reorder Threshold, Supplier.
- **Stock Movement & Quick Adjustments**:
  - **Stock In (Restock)**: Add incoming units with reference PO / invoice note.
  - **Stock Out (Dispatch)**: Safe reduction with automated validation preventing negative stock.
  - **Movement Audit Log**: Full chronological history tracking timestamp, movement type, quantity delta, resulting balance, and audit notes.
- **Real-time Analytics & Valuation**:
  - Total SKU count.
  - Automated Total Asset Valuation calculation based on current prices and units.
  - Low Stock alert counter (triggered when quantity ≤ reorder level).
  - Out of Stock alert counter.
- **Search & Multi-criteria Filtering**:
  - Search by Product Name, SKU, or Supplier.
  - Filter by Category (Electronics, Networking, Computer Accessories, etc.).
  - Filter by Stock Status (In Stock, Low Stock, Out of Stock).
- **Data Export & Persistence**:
  - One-click CSV export of inventory valuation.
  - Persistent state in browser `localStorage`.

---

## 🛠️ Tech Stack
- **HTML5 & Modern Layouts**
- **Tailwind CSS**
- **JavaScript (ES6+)**
- **FontAwesome 6**

---

## 💻 How to Run
1. Navigate to `Task-3_Inventory_Management_System`.
2. Double click `index.html` or open in any browser.
