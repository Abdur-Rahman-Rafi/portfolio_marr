# Abdur Rahman Rafi - Personal Portfolio & Dashboard

Welcome to the source code for my personal portfolio! This is a modern, dynamic, and highly interactive web application built to showcase my skills, projects, experience, and research papers. It includes a built-in admin dashboard for real-time content management without needing to edit the source code.

## 🚀 Features

- **Modern UI/UX:** Built with React, Tailwind CSS, and Framer Motion for smooth animations and a premium, responsive design.
- **Dynamic Content:** A secure admin dashboard allows for real-time updates to projects, skills, experience, education, and research papers.
- **Real-Time Analytics:** Tracks visitors, daily views, and time spent on the site via Firebase.
- **Interactive Elements:**
  - A playable Snake Game.
  - An interactive retro Terminal.
  - A 3D interactive Globe.
  - Audio player and CRT screen effects.
- **Firebase Integration:** Uses Firestore for database management, real-time analytics with `onSnapshot`, and Firebase Auth for secure dashboard access.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend/Database:** Firebase (Firestore, Authentication, Storage)
- **Deployment:** Vercel

## 💻 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v16 or higher)
- A Firebase project (for the database and authentication)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abdur-Rahman-Rafi/portfolio_marr.git
   cd portfolio_marr
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## ⚙️ Dashboard & Seeding Data

To access the dashboard, navigate to `/login` and authenticate with your Firebase credentials.
On the first run, the database will be empty. You can use the **Seed DB** button in the dashboard to populate Firestore with the initial fallback content (stored in `src/constants/content.js`).

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---
*Built with ❤️ by [Abdur Rahman Rafi](https://github.com/Abdur-Rahman-Rafi).*
