# Useless Dave - Small Business ERP

A lightweight, fun ERP system designed for small businesses. Named after the punk spirit of not taking things too seriously.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Linting | Biome |
| Backend | Firebase Functions (Node.js 20) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google sign-in) |
| Storage | Firebase Storage |
| Hosting | Firebase Hosting |

## Features

- **Multi-Company Support** - Users can create and belong to multiple companies with isolated data
- **AI Assistant (Dave)** - Chat interface powered by Gemini

## Project Structure

```
useless-dave/
├── client/                      # React SPA
│   ├── src/
│   │   ├── components/          # UI components and layouts
│   │   ├── features/            # Feature modules (auth, company, chat, etc.)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Firebase config, utilities
│   │   └── types/               # TypeScript interfaces
│   └── vite.config.ts
│
├── server/                      # Firebase Functions
│   └── src/
│       ├── functions/
│       └── types/
│
├── biome.json                   # Linting configuration (root level)
├── firebase.json                # Emulators + hosting config
├── firestore.rules              # Security rules
├── storage.rules                # File upload security
└── .firebaserc                  # Firebase project config
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project

### 1. Clone and Install

```bash
git clone <repo-url>
cd useless-dave
npm install
```

### 2. Configure Firebase

```bash
firebase login
firebase use --add
```

### 3. Set Up Environment Variables

```bash
cd client
cp .env.example .env
```

Edit `client/.env` with your Firebase config from Firebase Console:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_USE_EMULATORS=true
```

## Running the App

### With Firebase Emulators (Recommended)

```bash
# Terminal 1 - Start emulators
firebase emulators:start

# Terminal 2 - Start app
npm run dev
```

Open http://localhost:5173

Emulator UI at http://localhost:4000

### Direct to Firebase

Set `VITE_USE_EMULATORS=false` in `client/.env`, then:

```bash
npm run dev
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run build` | Build for production |
| `npm run deploy` | Build and deploy to Firebase |

## Multi-Company Architecture

Users can belong to multiple companies via `/users/{userId}/memberships/{companyId}`:

```
users/{userId}
  └── memberships/{companyId}
        └── companyId, role, joinedAt

companies/{companyId}
  ├── name, logoUrl?, createdAt, createdBy
  └── users/{userId}
        └── email, role
```

This enables:
- Querying which companies a user belongs to
- Role-based access per company (admin, editor, viewer)
- Company switching without re-authentication

## Security

- All data is company-scoped
- Firestore rules enforce authentication and company membership
- Storage rules require authentication for file uploads

## License

Private - All rights reserved
