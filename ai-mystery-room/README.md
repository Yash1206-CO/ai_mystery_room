# AI Mystery Room — Complete Build & Setup Guide

This repository contains the complete, production-ready codebase for **AI Mystery Room**, an AI-powered interactive whodunit web application built with **React, Vite, Tailwind CSS, Node.js, Express, MongoDB Atlas, and the Gemini API**.

---

## 📁 Project Architecture & Structure

```
ai-mystery-room/
├── SPEC.md                      # Complete system specification blueprint
├── server/                      # Node.js + Express backend
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js             # Server entry point & MongoDB connection
│       ├── models/
│       │   └── Case.js          # Mongoose schema with secure solution masking
│       ├── services/
│       │   └── geminiService.js # Gemini GenAI SDK integration with Zod validation
│       ├── controllers/
│       │   └── caseController.js# Clue discovery, hint logic, scoring, accusation
│       └── routes/
│           └── caseRoutes.js    # RESTful API route definitions
└── client/                      # Vite + React frontend
    ├── package.json
    └── src/
        ├── App.jsx              # Main router & noir detective layout
        ├── services/
        │   └── api.js           # Axios API service client
        └── pages/
            ├── Home.jsx         # Case introduction, rules & scoring matrix
            ├── CreateMystery.jsx# Premise input & difficulty tier selector
            ├── InvestigationRoom.jsx # Clue examination, suspect dossiers & hints
            ├── Accusation.jsx   # Prime suspect accusation chamber
            └── Results.jsx      # Verdict, score debrief & solution breakdown
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: MongoDB Atlas URI or local MongoDB instance
- **Gemini API Key**: Obtainable from Google AI Studio (https://aistudio.google.com/)

---

### 2. Backend Setup (`server`)

1. Open a terminal and navigate to `server`:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file from `.env.example`:
   ```bash
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_URL=http://localhost:5173
   ```

3. Start the backend development server:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

---

### 3. Frontend Setup (`client`)

1. Open a new terminal and navigate to `client`:
   ```bash
   cd client
   npm install
   ```

2. (Optional) Create a `.env` file in `client/` if using a custom backend port:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🔒 Security & Anti-Cheat Features
- **Culprit Masking**: In `Case.js`, the `solution` schema sets `select: false`. Regular queries (`GET /api/cases/:id`) never deliver the culprit or solution to the browser.
- **Client Sanitization**: Undiscovered clues omit their forensic description until the user explicitly calls the `/discover` endpoint.
- **Backend Scoring**: All base points, clue bonuses (+5 pts), hint penalties (-10 pts), and final score validation are computed server-side.

---

## 🌐 Production Deployment Steps

1. **Database (MongoDB Atlas)**:
   - Create a free M0 cluster on MongoDB Atlas.
   - Whitelist `0.0.0.0/0` in Network Access.
   - Create a database user and copy the connection string.

2. **Backend (Render / Railway)**:
   - Connect your GitHub repository.
   - Set Root Directory to `server`.
   - Build command: `npm install`
   - Start command: `node src/index.js`
   - Add Environment Variables: `PORT`, `MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL` (set to your Vercel URL).

3. **Frontend (Vercel)**:
   - Connect your GitHub repository.
   - Set Root Directory to `client`.
   - Framework Preset: `Vite`.
   - Add Environment Variable: `VITE_API_URL` (set to your Render/Railway backend URL + `/api`).
   - Click **Deploy**.
