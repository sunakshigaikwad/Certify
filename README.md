# CertifyPro – Chain of Trust: Secure & Transparent Digital Certificate Verification using Blockchain

CertifyPro is a modern, production-ready, full-stack HR management portal designed to streamline and secure employee experience certificates. It integrates AI-based skill evaluation, secure PDF generation, dynamic QR-code lookups, and Solidity smart contracts anchored to the blockchain to prevent credentials tampering.

---

## Technical Architecture

*   **Frontend**: React (Vite + TypeScript + Tailwind CSS + React Router + Axios + React Hook Form + React Query)
*   **Backend**: NestJS + Prisma ORM + SQLite (local sandbox) / PostgreSQL (production) + JWT Auth (Passport JWT + bcrypt) + Nodemailer (email dispatch) + PDFKit (landscape certificate printing)
*   **Blockchain**: Hardhat + Solidity smart contract (runs locally or connects to Polygon Amoy testnet)
*   **AI Pre-validation**: Mock analyzer pre-fills Technical Skills, Communication, Teamwork, and Punctuality metrics based on applicant tenure and attendance.

---

## Directory Structure

```
├── backend/                   # NestJS Backend Application
│   ├── src/
│   │   ├── auth/              # Passport JWT auth & Roles guards
│   │   ├── users/             # Admin team evaluator setup
│   │   ├── requests/          # Experience requests & Multer document uploads
│   │   ├── evaluations/       # Evaluator parameters & ratings
│   │   ├── certificates/      # PDFKit landscape layout, QRCodes & Emailing
│   │   ├── blockchain/        # Ethers.js blockchain connection
│   │   ├── ai/                # Mock AI parser & pre-fill logic
│   │   └── main.ts            # Entrypoint & Swagger setup
│   └── prisma/                # Schema definitions & database seeds
├── frontend/                  # React Frontend (Vite)
│   ├── src/
│   │   ├── components/        # Sidebar navigation & header bars
│   │   ├── pages/             # Auth pages, dashboards, tables & portals
│   │   ├── App.tsx            # Routes configuration
│   │   └── main.tsx           # Setup query provider
├── blockchain/                # Smart Contract & hardhat compiler
│   ├── contracts/             # CertifyPro Solidity contract
│   └── hardhat.config.ts      # Hardhat network environment
├── docker-compose.yml         # Container configuration for PostgreSQL
└── README.md
```

---

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   NPM (v9 or higher)

### Setup Database & Backend

1.  Navigate to `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables in `backend/.env` (default configured for SQLite sandbox):
    ```env
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="CertifyProSecretKey2026!ChangeThisInProduction"
    JWT_EXPIRATION="86400s"
    PORT=5000
    RPC_URL="http://127.0.0.1:8545"
    CONTRACT_OWNER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    CONTRACT_ADDRESS=""
    ```
4.  Generate Prisma client:
    ```bash
    npm run prisma:generate
    ```
5.  Push database schema:
    ```bash
    npm run prisma:migrate
    ```
6.  Seed sample accounts (Admin, Sunakshi evaluator, Aksha employee, and an incoming request):
    ```bash
    npm run prisma:seed
    ```
7.  Start NestJS server:
    ```bash
    npm run start:dev
    ```
    *   API running at: `http://localhost:5000`
    *   Swagger docs available at: `http://localhost:5000/api/docs`

---

### Setup Smart Contracts (Hardhat)

1.  Navigate to `blockchain` folder:
    ```bash
    cd ../blockchain
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Compile contract:
    ```bash
    npx hardhat compile
    ```
4.  Launch local blockchain Node:
    ```bash
    npx hardhat node
    ```
5.  Deploy contract to localhost network:
    ```bash
    npx hardhat run scripts/deploy.ts --network localhost
    ```
6.  Copy the printed contract address and paste it in `backend/.env` under `CONTRACT_ADDRESS=...` to link on-chain verification logs!

---

### Setup Frontend (React)

1.  Navigate to `frontend` folder:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start dev webserver:
    ```bash
    npm run dev
    ```
    *   Frontend portal opens at: `http://localhost:5173`

---

## User Roles & Login Credentials

To test the complete workflow out-of-the-box, use these seeded logins:

### 1. Admin (HR Administrator)
*   **Email**: `admin@google.com`
*   **Password**: `admin123`
*   **Dashboard Features**: Add evaluators, review incoming requests, forward to managers, confirm evaluations, print certificates, and view stats.

### 2. Evaluator (Team Manager)
*   **Email**: `sunakshipd.edu@gmail.com`
*   **Password**: `eval123`
*   **Dashboard Features**: View pending reviews, trigger pre-filled AI validation, adjust Technical/Communication/Punctuality ratings, add feedback, and Approve/Reject.

### 3. Employee (Candidate)
*   **Email**: `akshadhiwar@gmail.com`
*   **Password**: `emp123`
*   **Dashboard Features**: Upload documents (Resume, Experience Letter, Aadhaar), submit requests, track processing status, download issued certificates, and check AI reports.

### 4. Public Verifier (Public access)
*   **Endpoint**: `http://localhost:5173/verify`
*   **Workflow**: Search by Certificate ID or scan QR code. Fetches PDF data, anchors hashes directly from blockchain registers, and prints visual certificate matches.
