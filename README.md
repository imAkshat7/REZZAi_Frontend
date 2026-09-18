# ✦ REZZAi — Private Intelligence Workspace (Frontend)

<div align="center">

![REZZAi Banner](public/favicon.svg)

### A modern, considered workspace for AI conversations, full-stack app prototyping, presentation generation, and document intelligence.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#license)

</div>

---

## 🌟 Overview

**REZZAi** is an advanced AI intelligence workspace designed for seamless collaboration with specialized autonomous agents. Built with an ultra-sleek **obsidian dark theme**, high-contrast neon accents (`#dbff4d`), and smooth glassmorphism, REZZAi pairs real-time conversation with an **interactive side-by-side Canvas** for live coding, slide decks, documents, and generated visuals.

---

## ✨ Key Features

### 🤖 Multi-Agent Ecosystem
- **✧ Auto Agent**: Dynamically analyzes user prompts and routes to the best model.
- **✦ Chat Agent**: Everyday critical thinking, reasoning, and brainstorming.
- **⌕ Search Agent**: Real-time web-connected search and synthesis.
- **</> Coding Agent**: Writes multi-file web projects (HTML, CSS, JS) with instant live preview.
- **▤ PDF Agent**: Compiles formal documents and proposals with PDF download capabilities.
- **▧ Slides Agent**: Generates 16:9 executive PowerPoint presentations exported directly to `.pptx`.
- **◫ Image Agent**: Generates contextual visuals and creative mockups on demand.

### 🖥️ Interactive Canvas Panel
- **Live Code Execution**: Renders multi-file web applications in an isolated sandbox.
- **Device Viewport Toggle**: Test interactive web projects in both **Desktop** and **Mobile** viewports directly inside the canvas.
- **Presentation Deck Viewer**: Slide-by-slide 16:9 widescreen preview with navigation pills, keyboard controls, and one-click `.pptx` export.
- **PDF Document Viewer**: In-browser document preview with direct export.
- **Syntax-Highlighted Inspector**: Clean code tabs with copy feedback.

### 🎨 Premium UI / UX
- **Zero-Flash Chat Switching**: Shimmering skeleton screens (`<MessageListSkeleton />`) smoothly bridge conversation transitions without blank flashes.
- **Collapsible Sidebar**: Smooth transition between expanded and collapsed states, with an anchored floating flyout user menu.
- **Quick Starters**: Curated interactive prompt chips on the empty chat state for instant creation.
- **Modern Message Feed**: Dark jade glass user bubbles, markdown formatting, syntax highlighting, and copy-response actions.
- **Secure Authentication**: Frictionless Google Sign-In powered by Firebase Authentication with custom token authorization.

---

## 🏗️ Architecture & Directory Structure

```text
REZZAi-frontend/
├── public/                     # Static assets (favicons, SVG icons)
├── src/
│   ├── assets/                 # Brand assets and images
│   ├── components/
│   │   ├── agents.js           # Agent registry and metadata
│   │   ├── ArtifactCard.jsx    # Interactive artifact pill in message feed
│   │   ├── AuthPage.jsx        # Glassmorphic Google sign-in screen
│   │   ├── CanvasPanel.jsx     # Side drawer for live web apps, slides & PDFs
│   │   ├── ChatHeader.jsx      # Minimalist top navigation with live status
│   │   ├── Composer.jsx        # Intelligent message input with agent picker
│   │   ├── Composer.css        # Composer focus rings and chip styling
│   │   ├── ConfirmDialog.jsx   # Modal confirmation for chat deletion
│   │   ├── MessageList.jsx     # Chat conversation feed & skeleton screen
│   │   ├── MessageList.css     # Markdown, bubbles, cards & skeleton animations
│   │   └── Sidebar.jsx         # Collapsible navigation, chat history & profile
│   ├── pages/
│   │   └── Home.jsx            # Main workspace coordinator and state manager
│   ├── redux/
│   │   ├── store.js            # Redux store setup
│   │   └── userSlice.js        # User authentication slice
│   ├── utils/
│   │   └── artifactUtils.js    # Parsers, formatters, and PPT/PDF downloaders
│   ├── App.css                 # Core workspace layout, theme & responsive styles
│   ├── App.jsx                 # App session check and router
│   ├── index.css               # Base Tailwind imports and global resets
│   └── main.jsx                # Application root entrypoint
├── utils/
│   ├── axios.js                # Configured Axios instance with bearer tokens
│   └── firebase.js             # Firebase client configuration
├── .env.example                # Sample environment configuration
├── eslint.config.js            # Flat ESLint rules with React & Node globals
├── package.json                # Project dependencies and npm scripts
└── vite.config.js              # Vite configuration with Tailwind and proxy rules
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/imAkshat7/REZZAi_Frontend.git
cd REZZAi_Frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

Set your configuration keys:
```env
# Backend API Base URL
VITE_API_URL=https://rezzai-backend.onrender.com

# Firebase Authentication Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

### 6. Run Code Linter
```bash
npm run lint
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI library with modern concurrent rendering |
| **Vite 8** | Ultra-fast bundling, HMR, and build toolchain |
| **TailwindCSS v4** | Modern utility-first CSS framework |
| **Redux Toolkit** | Centralized global application state |
| **React Markdown & Remark GFM** | GitHub Flavored Markdown parsing and rendering |
| **Prism Syntax Highlighter** | High-performance syntax highlighting for code blocks |
| **Firebase Auth** | Google OAuth authentication popup flow |
| **Axios** | HTTP client with bearer token interception |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/imAkshat7/REZZAi_Frontend/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Crafted with precision for <strong>REZZAi</strong> — Think clearly. Move deliberately.</sub>
</div>
