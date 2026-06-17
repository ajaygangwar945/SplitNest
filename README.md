# SplitNest

SplitNest is a modern, responsive web application designed to help friends, flatmates, and travel groups track shared expenses and settle up effortlessly. Built with a sleek, interactive user interface and a robust PostgreSQL-backed API, SplitNest makes splitting bills stress-free.

## 🚀 Features

- **User Authentication:** Secure signup and login flow.
- **Group Management:** Create and manage expense groups with friends (e.g., "Flatmates", "Goa Trip").
- **Expense Tracking:** Log expenses, specifying who paid and how the cost should be split among members.
- **Smart Balances:** Instantly see who owes whom in a clean, visual format. Includes single-click "Settle Up" functionality.
- **CSV Import (Smart Parser):** Upload legacy spreadsheets (e.g., old tracking sheets). The app automatically parses, flags anomalies (e.g., unrecognized formats or mismatched totals), and maps entries into the database.
- **Modern Mobile-First UI:** Fully responsive design featuring glassmorphism elements, subtle animations, and curated modern typography.

## 🛠️ Technology Stack

**Frontend:**
- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- [React Router DOM](https://reactrouter.com/) for navigation
- Vanilla CSS (for custom styling, gradient animations, and responsiveness)
- [Lucide React](https://lucide.dev/) for iconography
- [Axios](https://axios-http.com/) for API communication

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) for relational data storage
- [JWT (JSON Web Tokens)](https://jwt.io/) for authentication
- `csv-parser` & `multer` for robust CSV import parsing
- `string-similarity` for fuzzy matching imported spreadsheet names to database users
- [Swagger](https://swagger.io/) for API documentation

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (ensure your DB is running and accessible)

### 1. Database Setup
1. Create a PostgreSQL database (e.g., `splitnest`).
2. Update your connection details in the backend `.env` file.

### 2. Backend Setup
```bash
cd backend
npm install

# Create a .env file (see .env.example if available, or configure the standard DB/JWT vars)
# PORT=5000
# DATABASE_URL=postgres://user:password@localhost:5432/splitnest
# JWT_SECRET=your_secret_key

npm run dev
```
*The backend runs on `http://localhost:5000` by default. API documentation is available at `http://localhost:5000/api-docs`.*

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create a .env file if needed, setting the API URL:
# VITE_API_URL=http://localhost:5000/api

npm run dev
```
*The frontend will launch via Vite, typically at `http://localhost:5173`.*

## 📱 Mobile Friendly
The SplitNest UI is completely mobile-optimized. All tables, forms, and cards adjust dynamically to fit smaller screens perfectly, providing a seamless mobile web experience.

---
*Built with ❤️ for tracking shared expenses easily.*
