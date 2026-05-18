# 🌟 NextHire Frontend - AI-Powered Resume Builder Client

NextHire Frontend is a modern, feature-rich single-page application built with **React 18**, **TypeScript**, and **Vite**, serving as the client layer for the Resume-AI microservices backend. It delivers a seamless, interactive experience for building resumes, generating AI content, matching jobs, and receiving real-time notifications, all wrapped in a polished glassmorphism UI.

---

## 🚀 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | SPA Library (Functional Components & Hooks) |
| **TypeScript 5.4** | Type-safe development |
| **Vite** | Lightning-fast build tool and dev server |
| **React Router v6** | Client-Side Navigation & Route Guards |
| **@microsoft/signalr** | Real-Time WebSocket Client |
| **Axios** | JWT-authenticated HTTP communication |
| **Context API** | Global State Management (Auth, Notifications) |
| **Vanilla CSS** | Styling with Variables & Glassmorphism |
| **Vitest & Happy-DOM** | Unit & Component Testing |
| **React Testing Library**| DOM Testing Utilities |

---

## 🏗 Application Architecture

NextHire Frontend follows a modern React architecture with the following principles:

✅ **Functional Components & Hooks** - Clean, reusable UI components  
✅ **Context-Based State** - Lightweight global state using React Context (Auth, Notifications)  
✅ **Route Guards** - JWT-protected navigation restricting access to authenticated users  
✅ **Axios Interceptors** - Automatic token injection for secure API requests  
✅ **Real-Time Integration** - SignalR hubs for instant notifications and export status updates  
✅ **Proxy-Configured Dev Server** - Vite proxy configured to seamlessly talk to the backend YARP Gateway  

---

## 📦 Page Overview

| Page | Route | Responsibility |
|---------|-------|----------------|
| **AuthPage** | `/auth` | Login, registration, Google OAuth |
| **OAuthCallbackPage**| `/auth/callback` | Handling external OAuth redirects |
| **LandingPage** | `/` | Marketing home, feature overview |
| **DashboardPage** | `/dashboard` | User overview, recent resumes, quick stats |
| **TemplatesPage** | `/templates` | Browse and select resume templates |
| **ResumeFlowPage**| `/resume` | Multi-step resume builder, AI generation |
| **JobMatchPage** | `/jobmatch` | Compare resume to job descriptions for ATS scoring |
| **ExportsPage** | `/exports` | Manage PDF/Word downloads and export history |
| **NotificationsPage**| `/notifications`| Real-time notification history |
| **ProfilePage** | `/profile` | User account settings and subscription management |
| **UserManagement**| `/users` | Admin-only dashboard for managing users |

---

## 🎯 Core Features

### 👤 Authentication Features
✅ Email & password login and registration  
✅ Google OAuth (one-click sign-in)  
✅ JWT token storage in `localStorage`  
✅ Automatic session restoration  
✅ Protected routes for authenticated users  

### 📄 Resume Builder Features
✅ Multi-step interactive resume creation  
✅ Dynamic section management (Experience, Education, Skills)  
✅ Live template preview  
✅ Easy export to high-fidelity PDF  

### 🤖 AI Integration
✅ Generate professional summaries with one click  
✅ Improve bullet points using LLMs  
✅ Tailor resumes to specific job descriptions  
✅ Get instant ATS match scores  

### 🔔 Real-Time Notifications (SignalR)
✅ Live connection status indicator  
✅ Real-time notification badge  
✅ Instant updates when PDF exports are completed  
✅ Instant updates when AI generation finishes  

### 🛡️ Admin Features
✅ Role-based UI rendering (Admin vs User)  
✅ Dedicated User Management dashboard  

---

## 🏛 Architecture Diagrams

### Application Layer Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER LAYER                            │
│                   React 18 SPA (Vite Port 3000)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
    HTTP (REST)                  WebSocket (SignalR)
    + JWT Bearer                  @microsoft/signalr
          │                             │
┌─────────▼─────────────────────────────▼─────────────────────────┐
│                   API GATEWAY (YARP) — Port 9000                │
│        /api/*  →  REST microservices                            │
│        /hubs/* →  SignalR Hubs                                  │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┬───────┘
   │          │          │          │          │          │
┌──▼────┐ ┌───▼───┐ ┌───▼────┐ ┌───▼──────┐ ┌──▼──────┐ ┌─▼───────┐
│ Auth  │ │Resume │ │   AI   │ │  Export  │ │Notif.   │ │JobMatch │
│Service│ │Service│ │Service │ │ Service  │ │Service  │ │Service  │
└───────┘ └───────┘ └────────┘ └──────────┘ └─────────┘ └─────────┘
```

### Component Tree Diagram

```text
App
├── Routes
│   ├── AuthPage                  (/auth)
│   ├── OAuthCallbackPage         (/auth/callback)
│   └── PrivateRoute
│       └── NotificationProvider
│           └── Layout
│               ├── Navbar
│               │   └── [Logo, NavLinks, SignalR Status, Notification Badge, User Menu]
│               ├── <Outlet>
│               │   ├── LandingPage         (/)
│               │   ├── DashboardPage       (/dashboard)
│               │   ├── TemplatesPage       (/templates)
│               │   ├── ResumeFlowPage      (/resume)
│               │   ├── JobMatchPage        (/jobmatch)
│               │   ├── NotificationsPage   (/notifications)
│               │   ├── ProfilePage         (/profile)
│               │   ├── ExportsPage         (/exports)
│               │   └── UserManagementPage  (/users) [Admin Only]
│               └── Footer
```

### Authentication Flow Diagram

```text
┌──────────┐         ┌──────────┐         ┌──────────────────┐
│  Browser │         │  React   │         │ Backend Gateway  │
└────┬─────┘         └────┬─────┘         └────────┬─────────┘
     │                    │                        │
     │  Navigate to /     │                        │
     ├───────────────────►│                        │
     │                    │  PrivateRoute check    │
     │                    │  (isAuthenticated?)    │
     │                    │                        │
     │  Redirect /auth    │                        │
     │◄───────────────────┤                        │
     │                    │                        │
     │  Submit Login Form │                        │
     ├───────────────────►│                        │
     │                    │  POST /api/auth/login  │
     │                    ├───────────────────────►│
     │                    │  { token, user }       │
     │                    │◄───────────────────────┤
     │                    │                        │
     │                    │  localStorage.setItem('token')
     │                    │  AuthContext updates   │
     │                    │                        │
     │  Redirect /        │                        │
     │◄───────────────────┤                        │
     │                    │                        │
     │  Subsequent APIs   │                        │
     │                    │  api.ts intercepts     │
     │                    │  adds Bearer <token>   │
     │                    ├───────────────────────►│
```

---

## 📂 Project Structure

```text
ResumeAI/src/ResumeAI.React/
│
├── src/
│   ├── api/                           # Axios instances and API client methods
│   │   ├── index.ts                   # Centralized API exports
│   │   └── ...
│   │
│   ├── components/                    # Reusable UI components
│   │   ├── Layout.tsx                 # App shell wrapper
│   │   ├── Navbar.tsx                 # Top navigation
│   │   ├── Footer.tsx                 # Page footer
│   │   └── ToastContainer.tsx         # Notification toasts
│   │
│   ├── context/                       # React Context for global state
│   │   ├── AuthContext.tsx            # Session, login, logout, user state
│   │   └── NotificationContext.tsx    # SignalR connection, unread counts
│   │
│   ├── pages/                         # Route-level components
│   │   ├── AuthPage.tsx               # Login/Register
│   │   ├── DashboardPage.tsx          # Main user dashboard
│   │   ├── ResumeFlowPage.tsx         # Resume builder
│   │   └── ...
│   │
│   ├── test/                          # Testing configuration
│   │   └── setup.ts                   # Vitest setup file
│   │
│   ├── App.tsx                        # Main router configuration
│   ├── main.tsx                       # React entry point
│   ├── index.css                      # Global styles and CSS variables
│   ├── styles.ts                      # Shared inline style objects
│   ├── types.ts                       # TypeScript interfaces and types
│   └── Frontend.test.tsx              # Consolidated testing suite
│
├── .gitignore                         # Ignored files (including tests/coverage)
├── index.html                         # HTML template
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript configuration
└── vite.config.ts                     # Vite and Vitest configuration
```

---

## 🎨 Design System

### Color Palette

| Token | CSS Variable | Value | Usage |
|-------|--------------|-------|-------|
| **Deep** | `--color-depth` | `#0f172a` | Text, primary headings |
| **Harbor**| `--color-harbor` | `#0284c7` | Primary brand, active states, buttons |
| **Marine**| `--color-marine` | `#475569` | Secondary text, muted icons |
| **Glacier**| `--color-glacier`| `#38bdf8` | Accents, gradients, highlights |
| **Frost** | `--color-frost` | `#f0f9ff` | Subtle backgrounds, active nav items |
| **Sand** | `--color-sand` | `#f8fafc` | Page backgrounds |

### Glassmorphism Theme

NextHire utilizes a heavy glassmorphism design language. Components use `rgba` backgrounds paired with backdrop filters to create depth:

```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid var(--glass-border);
box-shadow: var(--shadow-sm);
```

---

## 🌐 API Integration

All HTTP calls route through the API Gateway at `http://localhost:9000/api` (configured via Vite proxy during development).

### Axios Setup (`src/api/index.ts`)

```typescript
const apiClient = axios.create({
  baseURL: '/api' // Proxied by Vite to http://localhost:9000/api
});

// Automatic Token Injection
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- NextHire Backend running (YARP Gateway at port 9000)

### Installation

```bash
# Navigate to the frontend directory
cd ResumeAI/src/ResumeAI.React

# Install dependencies
npm install

# Start development server
npm run dev
# App runs at http://localhost:3000
```

### Available Scripts

```bash
npm run dev      # Starts Vite dev server with proxy
npm run build    # Production build using TypeScript and Vite
npm run preview  # Preview the production build locally
npm run test     # Run Vitest in watch mode
npm run test:ui  # Run Vitest with the interactive browser UI
npm run test:run # Run Vitest a single time (useful for CI/CD)
```

---

## 🧪 Testing

The project uses **Vitest**, **Happy-DOM**, and **React Testing Library** for blazing-fast component and unit testing.

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test
```

Tests are consolidated in `src/Frontend.test.tsx` to verify component rendering, context usage, and routing behavior without requiring a live backend.

---

## 🔐 Security

- **JWT Storage** — Tokens are stored locally and injected via Axios interceptors.
- **Route Protection** — `PrivateRoute` component wraps all protected routes.
- **Role-Based UI** — Links to `/users` and other admin functionalities are only rendered if `user?.role === 'ADMIN'`.

---

## 🗺 Roadmap

### Phase 1 (Completed)
- [x] React SPA setup with Vite & TypeScript
- [x] JWT Authentication & Google OAuth UI
- [x] Context-based state management
- [x] Glassmorphism UI & custom CSS variables
- [x] Integration with Resume-AI Microservices Gateway
- [x] Real-time SignalR notifications
- [x] Vitest testing environment

### Phase 2 (Planned)
- [ ] Dark Mode support
- [ ] Drag-and-drop resume section reordering
- [ ] Live PDF preview within the browser (react-pdf)
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard for Admins
