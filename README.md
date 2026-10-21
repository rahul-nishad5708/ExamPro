# 🎓 ExamPro — Enterprise Online Examination & Practice Portal

ExamPro is a production-ready, full-featured Online Examination & Practice Testing Portal engineered with the **MERN stack** (MongoDB, Express.js, React 19 with Vite, and Node.js). It features a dark-navy SaaS aesthetic, server-synchronized countdown timers, automated server-side evaluation with negative marking, instant feedback practice testing, and an Admin Student Activity Dashboard.

---

## 🚀 Key Highlights & Architectural Strengths

- **Dual Testing Engines:**
  - **Standard Exam Mode:** Server-authoritative timer, answer-key privacy during testing, negative marking support, and post-submission reviews.
  - **Practice Test Mode:** Immediate answer checking, detailed step-by-step explanations, answer locking options, and practice history tracking.
- **Shared-Password Candidate Access:** Students enter examinations with a shared access code (`EXAM_ACCESS_PASSWORD`) and candidate name, without requiring mandatory self-registration.
- **Unified Admin Student Activity Dashboard (`/admin/student-activity`):** Real-time aggregation of standard exam attempts and practice drills with search, filtering (status & test type), pagination, and session isolation.
- **Answer Key Privacy:** Correct options and explanations are filtered at the Mongoose query level and never transmitted to students while taking an exam.
- **Production Cookie Security:** HTTP-Only, `SameSite=None`, `Secure=true` cookies with `trust proxy` enabled for seamless cross-origin hosting between Vercel and Render.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React.js (v19) powered by Vite |
| **Styling** | Tailwind CSS (v4) with Glassmorphism & custom glowing accents |
| **Routing** | React Router DOM (v7) with protected and admin route guards |
| **HTTP Client** | Axios (configured with `withCredentials: true`, dynamic base URL, and interceptors) |
| **Forms & Validation** | React Hook Form & Zod Schema Validation |
| **Visualizations** | Recharts (Responsive bar and analytical distribution charts) |
| **Icons & Feedback** | Lucide React, Sonner / React Hot Toast |
| **Backend Runtime** | Node.js & Express.js (ES Modules) |
| **Database & ODM** | MongoDB Atlas / Local MongoDB with Mongoose |
| **Authentication** | JSON Web Tokens (JWT) stored in HTTP-Only Cookies & Bearer headers |
| **Security** | Helmet HTTP headers, express-rate-limit, Bcryptjs, CORS origin matching |

---

## 📂 Project Structure

```text
exampro/
├── client/                     # Vite React Frontend
│   ├── public/
│   │   └── favicon.svg         # ExamPro custom SVG brand icon
│   ├── src/
│   │   ├── components/         # Reusable UI component library
│   │   ├── context/
│   │   │   └── AuthContext.jsx # User session & auth state management
│   │   ├── layouts/            # DashboardLayout & Navigation
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminExamsPage.jsx
│   │   │   │   ├── AdminPracticeTestsPage.jsx
│   │   │   │   ├── AdminStudentActivityPage.jsx # Unified activity tracking
│   │   │   │   └── AdminStudentsPage.jsx
│   │   │   ├── ExamAttemptPage.jsx
│   │   │   ├── PracticeTestsListPage.jsx
│   │   │   ├── PracticeTestAttemptPage.jsx
│   │   │   ├── PracticeResultPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── routes/             # AdminRoute & ProtectedRoute guards
│   │   ├── services/
│   │   │   ├── api.js          # Normalized baseURL via VITE_API_URL
│   │   │   ├── examService.js
│   │   │   └── practiceService.js
│   │   ├── App.jsx             # Route definitions
│   │   ├── index.css           # Tailwind v4 styles
│   │   └── main.jsx
│   ├── .env.example            # Frontend environment template
│   ├── vercel.json             # Vercel SPA client rewrite & caching
│   ├── package.json
│   └── vite.config.js          # API proxy (/api -> localhost:5000)
├── server/                     # Express Backend & Mongoose
│   ├── scripts/
│   │   ├── seed.js             # Seeds standard exams and accounts
│   │   ├── seedPracticeTests.js# Seeds sample practice drills
│   │   ├── testIntegration.js  # Automated integration test suite
│   │   ├── testPracticeSuite.js# Practice mode & feedback test suite
│   │   ├── testAdminStudentActivity.js # Activity dashboard test suite
│   │   └── testProductionMode.js# Ephemeral production mode server verification
│   ├── src/
│   │   ├── config/             # Environment, DB, and cookie configurations
│   │   │   ├── db.js           # Mongoose connection with lifecycle listeners
│   │   │   └── index.js
│   │   ├── controllers/        # REST route controllers
│   │   ├── middleware/         # Auth, Role, Error & Rate Limiting
│   │   │   ├── auth.js         # Student session & Admin auth
│   │   │   └── errorHandler.js # Safe production error messages
│   │   ├── models/             # Mongoose Schemas (Exam, Question, Attempt, PracticeTest, PracticeAttempt, User)
│   │   ├── routes/             # Express API endpoints
│   │   ├── app.js              # Express app setup, CORS, trust proxy
│   │   └── server.js           # Server entry point with graceful shutdown
│   ├── .env.example            # Backend environment template
│   ├── .gitignore
│   └── package.json
├── .gitignore                  # Root git exclusions (.env, node_modules, dist)
├── package.json                # Root workspace script runner
└── README.md
```

---

## ⚡ Local Development Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on Node 20 & 22)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection string)

### 2. Installation
From the root directory (`exampro/`):
```bash
# Install all root, server, and client dependencies
npm run install:all
```

### 3. Environment Configuration
Copy the environment template files:

**Backend:**
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/Exampro?retryWrites=true&w=majority
JWT_SECRET=super_secret_exampro_jwt_token_key_dev_1234567890
CLIENT_URL=http://localhost:5173
EXAM_ACCESS_PASSWORD=exam2024
ADMIN_EMAIL=admin@exampro.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=ExamPro Admin
```

**Frontend:**
```bash
cp client/.env.example client/.env
```
In local development, `VITE_API_URL` can be left blank (Vite proxies `/api` to `http://localhost:5000` via `vite.config.js`).

### 4. Seed Initial Data
```bash
# Seed initial exams, questions, and admin user
npm run seed

# Seed practice tests
npm run seed:practice
```

### 5. Start Development Servers
Run frontend and backend concurrently or in separate terminals:

```bash
# Terminal 1: Backend API (port 5000)
npm run server

# Terminal 2: Vite Frontend Client (port 5173)
npm run client
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Verification Test Suites

ExamPro includes complete automated verification suites. Run them all with:

```bash
npm run test
```

Or execute individual test suites:
```bash
# 1. Standard Exam Engine & Evaluation Math
npm run test:exam

# 2. Practice Test Engine & Immediate Feedback
npm run test:practice

# 3. Admin Student Activity Aggregation & Session Isolation
npm run test:activity

# 4. Production Mode Server & Health Check
node server/scripts/testProductionMode.js
```

---

## 🌐 Production Deployment Guide

ExamPro is optimized for the following production deployment architecture:
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

```
[ Candidate Browser ] 
       │
       ├── (HTTPS / Client SPA) ─────────► Vercel (https://your-exampro.vercel.app)
       │
       └── (REST API / Secure Cookie) ───► Render (https://your-exampro-api.onrender.com)
                                                 │
                                                 ▼
                                        MongoDB Atlas Cluster
```

---

### Step 1: Deploy Database on MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a free shared cluster (e.g. `Cluster0` on AWS or GCP).
3. **Database Access:** Create a database user with `readWriteAnyDatabase` privileges (e.g., `exampro_admin`).
4. **Network Access:** Go to **Network Access** > **Add IP Address** > Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Render cloud servers can connect.
5. **Get Connection String:**
   - Click **Connect** > **Drivers** > **Node.js**.
   - Copy the URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/Exampro?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and specify the database name (e.g. `Exampro`).

---

### Step 2: Deploy Backend Web Service on Render

1. Log in to [Render](https://render.com/) and click **New +** > **Web Service**.
2. Connect your Git repository.
3. Configure service settings:
   - **Name:** `exampro-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Branch:** `main` (or your deployment branch)
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js` (or `npm start`)
   - **Plan:** Free or Starter
4. Add **Environment Variables** in Render:
   | Variable | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production security and cookie policies |
   | `PORT` | `10000` | Render sets `PORT` automatically |
   | `MONGODB_URI` | `mongodb+srv://<user>:<pwd>@cluster0.xxxx.mongodb.net/Exampro?retryWrites=true&w=majority` | Atlas connection string |
   | `JWT_SECRET` | *(64-character random hex string)* | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `CLIENT_URL` | `https://your-exampro.vercel.app` | Your deployed Vercel domain (no trailing slash) |
   | `EXAM_ACCESS_PASSWORD` | `exam2024` | Secret code required for student exam entry |
   | `ADMIN_EMAIL` | `admin@exampro.com` | Administrator email |
   | `ADMIN_PASSWORD` | *(Secure admin password)* | Administrator password |
   | `ADMIN_NAME` | `ExamPro Admin` | Admin display name |
5. Click **Create Web Service**.
6. Once deployed, note your backend URL (e.g. `https://exampro-api.onrender.com`).
7. Verify health by visiting `https://exampro-api.onrender.com/api/health` in your browser. It should return:
   ```json
   {"success": true, "message": "ExamPro API is running"}
   ```

---

### Step 3: Deploy Frontend SPA on Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New...** > **Project**.
2. Import your Git repository.
3. In project configuration:
   - **Root Directory:** Click Edit and select `client`.
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (or `vite build`)
   - **Output Directory:** `dist`
4. In **Environment Variables**:
   | Variable | Value | Notes |
   |---|---|---|
   | `VITE_API_URL` | `https://exampro-api.onrender.com` | Your Render backend URL (no trailing slash) |
5. Click **Deploy**.
6. Vercel automatically applies `client/vercel.json` for client-side routing rewrites (`/* -> /index.html`), preventing 404s on page refresh.

---

### Step 4: Final Link Verification

1. Once Vercel assigns your production domain (e.g., `https://your-exampro.vercel.app`), return to **Render**.
2. Update `CLIENT_URL` in your Render Environment Variables to match your exact Vercel URL:
   ```text
   CLIENT_URL=https://your-exampro.vercel.app
   ```
3. Save changes in Render to trigger an automatic redeploy.
4. Visit your live Vercel URL and test:
   - Enter exam using the shared password (`exam2024`) and a candidate name.
   - Start an exam and submit answers.
   - Run a practice drill and verify instant feedback.
   - Log in to `/admin` and inspect `/admin/student-activity`.

---

## 📋 Environment Variables Reference

### Backend (`server/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | Optional | Port for the Express server (Render injects this) | `5000` |
| `NODE_ENV` | **Yes** | Environment mode (`production` or `development`) | `production` |
| `MONGODB_URI` | **Yes** | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | **Yes** | Secret cryptographic key for JWT generation | `64-char-hex-key` |
| `CLIENT_URL` | **Yes** | Permitted CORS origin(s). Comma-separate for multiple | `https://exampro.vercel.app` |
| `EXAM_ACCESS_PASSWORD` | **Yes** | Candidate exam passkey | `exam2024` |
| `ADMIN_EMAIL` | Optional | Initial admin email for seeding | `admin@exampro.com` |
| `ADMIN_PASSWORD` | Optional | Initial admin password for seeding | `Admin@123456` |
| `ADMIN_NAME` | Optional | Admin account name | `ExamPro Admin` |
| `COOKIE_SAMESITE` | Optional | Override cookie SameSite policy (defaults to `none` in prod) | `none` |
| `COOKIE_SECURE` | Optional | Override cookie Secure flag (defaults to `true` in prod) | `true` |

### Frontend (`client/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | **Yes** (Prod) | Full URL of the backend API without trailing slash | `https://exampro-api.onrender.com` |

---

## 🔧 Production Troubleshooting & FAQ

### 1. Cookies Not Persisting Across Domains (Vercel + Render)
- **Symptom:** Candidate or Admin logs in, but next request returns `401 Unauthorized`.
- **Cause:** Third-party cross-site cookies require `SameSite=None; Secure`. Also, Express behind Render's reverse proxy needs `trust proxy`.
- **Solution:** ExamPro includes `app.set('trust proxy', 1)` in `server/src/app.js` and automatically sets `sameSite: 'none'` and `secure: true` when `NODE_ENV=production`. Ensure both your Vercel frontend and Render backend use HTTPS.

### 2. CORS Origin Rejection / Network Error
- **Symptom:** Browser console displays `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`.
- **Solution:** Verify that the `CLIENT_URL` in your Render Environment settings exactly matches your Vercel URL (e.g. `https://your-app.vercel.app` without a trailing slash).

### 3. 404 Error on Page Refresh in Vercel
- **Symptom:** Navigating to `/admin/student-activity` works via links, but refreshing the page returns `404 Not Found`.
- **Solution:** This is handled by `client/vercel.json`, which rewrites all incoming routes to `/index.html`. Ensure `client/vercel.json` is deployed in the client root.

### 4. MongoDB Connection Timeout
- **Symptom:** Server crashes on startup with `MongooseServerSelectionError: connect ECONNREFUSED` or timeout.
- **Solution:** In MongoDB Atlas, verify that **Network Access** includes `0.0.0.0/0` (Allow access from anywhere). Cloud hosting platforms like Render do not have static IP addresses on free/starter tiers.

### 5. Render Free Tier Cold Starts
- **Symptom:** First request takes 30-50 seconds to respond after inactivity.
- **Solution:** Free tier Render instances spin down after 15 minutes of inactivity. The health check endpoint `/api/health` can be pinged by free uptime services (e.g. UptimeRobot, Cron-job.org) every 10 minutes to prevent sleeping.

---

## 🔒 Security Summary

1. **No Frontend Secrets:** No API keys, database credentials, or JWT signing secrets are bundled in the Vite client.
2. **Credentialed CORS:** Wildcard CORS (`*`) is strictly rejected when credentials are enabled.
3. **Bcrypt Password Encryption:** All admin passwords are salted and hashed (10 rounds) before storage.
4. **Sanitized Error Output:** Internal server error stack traces are suppressed in production mode (`NODE_ENV=production`).
5. **Git Protection:** `.env` and sensitive credential files are excluded in root, client, and server `.gitignore`.

---

## 📄 License
This project is licensed under the MIT License.
