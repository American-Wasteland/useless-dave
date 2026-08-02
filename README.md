# Useless Dave - Small Business ERP

A lightweight ERP system designed for small business accountancy in Colombia. Built because commercial ERPs are overpriced and overly complex for simple needs.

## Why This Exists

Managing expenses, tracking payments, and keeping records shouldn't require enterprise software. Useless Dave provides just what you need:

- Track business expenses with invoice attachments
- Record partial or full payments (common in Colombian business: 50/50 splits, 2-3 payment installments)
- Categorize by cost center and provider
- All amounts in Colombian Peso (COP) - no multi-currency complexity

## Features (Phase 1 - Expense Tracking)

| Feature | Description |
|---------|-------------|
| **Expenses** | Create expenses with provider, amount, tax deductions, cost center, date, and invoice upload |
| **Payments** | Record partial or full payments with voucher attachments. Status auto-updates (pending → partial → paid) |
| **Providers** | Manage vendors/suppliers with NIT/RUT, contact info. Quick-add from expense form |
| **Cost Centers** | Categorize expenses by department, project, or any grouping |
| **Payment Accounts** | Track where money comes from (bank accounts, cash, cards) |

### Future Phases (Not Yet Implemented)

- Phase 2: Income tracking
- Phase 3: Quotes (PDF generation)
- Phase 4: Invoices (PDF generation)
- Phase 5: Dashboard with charts
- Phase 6: Inventory management

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Linting | Biome |
| Backend | Firebase Functions (Node.js 20) |
| Database | Firestore |
| Auth | Firebase Auth (Google sign-in) |
| Storage | Firebase Storage (invoices, vouchers) |
| Hosting | Firebase Hosting |

## Project Structure

```
useless-dave/
├── client/                      # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Button, Input, Select, Modal, FileUpload, Badge
│   │   │   └── layout/          # Sidebar, MainLayout
│   │   ├── features/
│   │   │   ├── auth/            # Google sign-in, AuthContext, ProtectedRoute
│   │   │   ├── expenses/        # ExpenseForm, ExpenseList, ExpenseDetail, PaymentForm
│   │   │   └── providers/       # ProviderList, ProviderModal
│   │   ├── hooks/               # useCostCenters, usePaymentAccounts
│   │   ├── pages/               # HomePage, CostCentersPage, PaymentAccountsPage
│   │   ├── lib/                 # Firebase config, utils (formatCOP, formatDate)
│   │   └── types/               # TypeScript interfaces
│   ├── biome.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
├── server/                      # Firebase Functions
│   └── src/
│       ├── functions/
│       │   ├── expenses.ts      # onPaymentCreated (auto-update status)
│       │   └── users.ts         # inviteUser, getUserCompany
│       └── types/
│
├── firebase.json                # Emulators + hosting config
├── firestore.rules              # Company-scoped security rules
├── firestore.indexes.json       # Composite indexes
├── storage.rules                # File upload security
└── .firebaserc                  # Firebase project config
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project (free tier works fine)

### 1. Clone and Install

```bash
git clone <repo-url>
cd useless-dave

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Configure Firebase

```bash
# Login to Firebase
firebase login

# Link to your project (updates .firebaserc)
firebase use --add
```

### 3. Set Up Environment Variables

```bash
cd client
cp .env.example .env
```

Edit `client/.env` with your Firebase project config (find these in Firebase Console → Project Settings → Your Apps):

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

### Option A: With Firebase Emulators (Recommended for Development)

Emulators run Firestore, Auth, Storage, and Functions locally. No costs, no risk to production data.

**Terminal 1** - Start emulators:
```bash
firebase emulators:start
```

**Terminal 2** - Start client:
```bash
cd client
npm run dev
```

Open http://localhost:5173

The Emulator UI is available at http://localhost:4000 to inspect data.

### Option B: Direct to Firebase (Production-like)

If you want to connect directly to your Firebase project:

1. Set `VITE_USE_EMULATORS=false` in `client/.env`
2. Enable Google Auth in Firebase Console → Authentication → Sign-in method
3. Run:
   ```bash
   cd client
   npm run dev
   ```

Open http://localhost:5173

## Deployment

### Build

```bash
# Build client
cd client
npm run build

# Build server
cd ../server
npm run build
```

### Deploy

```bash
# Deploy everything (hosting + functions + rules)
firebase deploy

# Or deploy individually
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Development Commands

### Client (`/client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Build for production |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run preview` | Preview production build |

### Server (`/server`)

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |

## Data Model

```
companies/{companyId}
  ├── name, createdAt, settings
  │
  ├── users/{userId}
  │     └── email, role, modules
  │
  ├── providers/{providerId}
  │     └── name, rut, address?, email?, phone?
  │
  ├── costCenters/{costCenterId}
  │     └── name, description?
  │
  ├── paymentAccounts/{accountId}
  │     └── name, type (bank|cash|card), details?
  │
  └── expenses/{expenseId}
        ├── providerId, totalAmount, taxDeductions
        ├── costCenterId, date, description
        ├── status (pending|partial|paid)
        ├── invoiceUrl?, createdBy, createdAt
        │
        └── payments/{paymentId}
              └── amount, paymentAccountId, date, voucherUrl?
```

## Security

- All data is company-scoped - users can only access their company's data
- Firestore rules enforce authentication and company membership
- Storage rules require authentication for file uploads

## License

Private - All rights reserved
