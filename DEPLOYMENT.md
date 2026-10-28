# 🚀 HRShield Full-Stack Deployment Guide

This guide walks you through deploying **MongoDB Atlas (Database)**, **Render (Backend API)**, and **Vercel (Frontend Client)** into production.

---

## 🗄️ Step 1: Database Setup on MongoDB Atlas

1. **Log in / Sign Up** to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a Free Cluster**:
   - Choose the **M0 Free Tier** (Shared).
   - Select your preferred cloud provider (AWS/GCP/Azure) and the region closest to you.
3. **Create Database User Credentials**:
   - Go to **Security** → **Database Access**.
   - Click **Add New Database User**.
   - Choose **Password** authentication.
   - Enter a username (e.g., `hrshield_admin`) and a strong password (avoid special characters like `@`, `:`, `/` in the password or URL-encode them).
   - Under **Built-in Role**, select **Read and write to any database**.
   - Click **Add User**.
4. **Configure Network Access (Crucial for Render)**:
   - Go to **Security** → **Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *Note: Render uses dynamic outbound IP addresses, so `0.0.0.0/0` is required.*
5. **Get the Connection String**:
   - Go to **Database** → **Clusters** → click **Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the connection URI. It will look like:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your real credentials, and add your database name (e.g. `hrshield_db`):
     ```
     mongodb+srv://hrshield_admin:YourStrongPassword123@cluster0.abcde.mongodb.net/hrshield_db?retryWrites=true&w=majority
     ```

---

## ⚙️ Step 2: Backend Deployment on Render

1. Push your project to a GitHub repository (e.g., `your-username/hrshield`).
2. Log in to [Render](https://render.com/).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name**: `hrshield-backend` (or your preferred name)
   - **Language**: `Node`
   - **Root Directory**: `HRShield/backend` *(or `backend` if HRShield is the repository root)*
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` *(or `node server.js`)*
   - **Instance Type**: `Free`
6. Under **Environment Variables**, add the following:

   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` *(Render sets this automatically)* | Backend reads `process.env.PORT` |
   | `MONGO_URI` | `mongodb+srv://...` | Your Atlas connection string from Step 1 |
   | `JWT_SECRET` | `your_super_strong_jwt_secret_key_2026` | Any strong secret string |
   | `ENCRYPTION_SECRET` | `4f8a3b1c9e2d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a` | 64-character hex key for AES-256 field encryption |
   | `CLIENT_URL` | `http://localhost:5173` *(Update with Vercel URL in Step 4)* | Allowed CORS origin |

7. Click **Create Web Service**.
8. Once deployed, Render will provide your public backend URL (e.g., `https://hrshield-backend.onrender.com`).
9. Verify health check by visiting:
   `https://hrshield-backend.onrender.com/` → You should see:
   ```json
   {
     "system": "HRShield Security Audit & Data Privacy Server",
     "status": "ACTIVE"
   }
   ```

---

## 💻 Step 3: Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `HRShield/frontend` *(or `frontend` if repository root)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://hrshield-backend.onrender.com/api` *(Your Render backend URL with `/api`)*
6. Click **Deploy**.
7. Vercel will build and assign you a live domain (e.g., `https://hrshield.vercel.app`).

> ℹ️ *Note: `frontend/vercel.json` has already been created to handle client-side Single Page Application (SPA) routing, so refreshing any page won't result in a 404 error.*

---

## 🔄 Step 4: Link Frontend & Backend CORS

1. Go back to your [Render Dashboard](https://dashboard.render.com/).
2. Select your `hrshield-backend` service → **Environment**.
3. Update `CLIENT_URL` to include your new Vercel production domain:
   ```
   https://hrshield.vercel.app,http://localhost:5173
   ```
4. Render will automatically redeploy with the updated CORS policy.
*(Our updated CORS logic also natively permits `*.vercel.app` preview branches and strips trailing slashes automatically).*

---

## 📦 Step 5: (Optional) Seed Initial Database Data

To populate the system with standard administrative roles, compliance frameworks, sample employees, and audit logs:
1. On your local machine, ensure your `HRShield/backend/.env` has the live `MONGO_URI`.
2. Run:
   ```bash
   cd HRShield/backend
   npm run seed
   ```
3. Default administrative login credentials:
   - **Email**: `admin@hrshield.com`
   - **Password**: `AdminPassword123!`
