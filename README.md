# 🕒 PomodoRise – Productivity Level Up

**PomodoRise** is a **Full Stack** application fully developed in **TypeScript**, designed to help you boost your productivity using the **Pomodoro technique**, **task management**, and **personal progress gamification**.

This project is aimed at practical learning of TypeScript in both frontend and backend, following **Clean Code principles, scalable architecture, and professional best practices**.

---

## 📚 Table of Contents

1. [Description](#-description)
2. [Technologies](#-technologies)
3. [Monorepo Structure](#-monorepo-structure)
4. [Main Features](#-main-features)
5. [Installation and Running](#-installation-and-running)
6. [Testing](#-testing)
7. [Documentation](#-documentation)
8. [TypeScript Learning Guide](#-typescript-learning-guide)
9. [Best Practices](#-best-practices)
10. [License](#-license)

---

## 🧠 Description

**PomodoRise** allows you to:

- Create a user account.
- Set your work and break durations.
- Add tasks or routines to complete during sessions.
- Complete Pomodoro sessions and earn points.
- Level up based on consistency.
- Visualize your progress with charts and productivity indicators.

All in a **professional, educational, and modern environment**, designed to understand and master TypeScript in a real project.

---

## ⚙️ Technologies

### 🔹 Backend

- Node.js + Express
- Modern TypeScript
- MongoDB + Mongoose
- JWT + bcrypt
- Jest for testing
- Swagger UI for API documentation

### 🔹 Frontend

- React + TypeScript + Vite
- Modern CSS
- React Router DOM
- React Hook Form
- Axios
- Recharts for statistics
- Vitest + React Testing Library

### 🔹 Shared

- Common types and interfaces (`User`, `Task`, `Session`, etc.)
- Reusable enums, DTOs, and helpers

---

## 🧱 Monorepo Structure

```
pomodorise/
├── packages/
│   ├── backend/      → REST API with Express + TypeScript + MongoDB
│   ├── frontend/     → React + TypeScript + CSS
│   ├── shared/       → Shared types and utilities
├── pnpm-workspace.yaml
├── package.json      → Root workspace configuration
├── tsconfig.base.json     → Base TypeScript config
└── README.md         → This file
```

### 📦 Recommended package manager:

**pnpm** (for performance and efficient workspace management)

---

## 🚀 Main Features

| Category                     | Description                                   |
| ---------------------------- | --------------------------------------------- |
| 🎯 **Pomodoro Timer**        | Start, pause, and reset configurable sessions |
| 🧾 **Task Management**       | Add, mark, and remove tasks per session       |
| 🕹️ **Gamification**          | Earn points and level up based on consistency |
| 📊 **Dashboard**             | Visualize your progress and statistics        |
| 👤 **Secure Authentication** | Registration and login with JWT               |

---

## 🛠️ Installation and Running

### 1️⃣ Clone the repository

```bash
git clone https://github.com/alejandrogoscu/pomodorise.git
cd pomodorise
```

### 2️⃣ Install dependencies

```bash
pnpm install
```

### 3️⃣ Environment variables

Create a `.env` file in `/packages/backend` with the following keys:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pomodorise
JWT_SECRET=supersecret
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
```

### 4️⃣ Run in development mode

```bash
pnpm dev
```

This will launch both backend and frontend simultaneously.

---

## 🧹 Best Practices Applied

- ✅ **Clean Architecture** (Controllers / Services / Repositories)
- ✅ **SOLID Principles**
- ✅ **Semantic and consistent naming**
- ✅ **No duplication (DRY)**
- ✅ **Small, pure functions**
- ✅ **Centralized error handling**

---

## 🗺️ Roadmap

| Phase                  | Description                           |
| ---------------------- | ------------------------------------- |
| **1️⃣ Setup monorepo**  | Base structure, dependencies, configs |
| **2️⃣ Backend MVP**     | Models, controllers, authentication   |
| **3️⃣ Frontend MVP**    | Main pages and components             |
| **4️⃣ API Integration** | Full user–task–session flow           |
| **5️⃣ Gamification**    | Points, levels, and progress          |
| **6️⃣ Dashboard**       | Statistics with charts                |

---

## 📝 Future Features

Potential features for future updates:

- 🎵 Listen to music (Spotify or local tracks)
- 📅 Calendar integration for scheduling sessions
- 🌐 Multi-language support
- 🏆 Rewards and gamification enhancements
- 👤 Profile customization and personalization

---

## 📜 License

MIT © 2025 — Developed by **Alejandro Goscu**  
Created as a **Full Stack TypeScript learning project**, aimed at **learning, teaching, and demonstrating professional best practices**.
