# HRShield — Employee Data Privacy & Information Security Audit Platform

**HRShield** is a professional, enterprise-grade **HR Data Privacy & Information Security Audit Platform** designed to monitor, audit, assess, and improve the privacy and security posture of sensitive employee and HR information.

Unlike conventional HR CRUD applications, **HRShield** is engineered specifically for **cybersecurity governance, DPDP/GDPR privacy compliance, automated vulnerability detection, and threat telemetry monitoring**.

---

## 🌟 Key Product Features

### 1. Executive Security & Privacy Dashboard
* **Dynamic Automated Scores**: Calculates **Privacy Score %** and **Security Score %** transparently based on active database telemetry.
* **Interactive Data Visualizations**: Security Risk Distribution (Low/Med/High/Critical), Access Activity Trends over time, Sensitivity Classifications, and Finding Category breakdowns using **Recharts**.
* **Real-time Telemetry Stream**: Live access log activity and high-frequency velocity anomaly alerts.

### 2. Employee Registry & Sensitive PII Protection
* **AES-256 Field-Level Encryption at Rest**: SSN/Aadhar, Annual Compensation/Salary, Bank & Routing Details, and Health Disclosures are encrypted using AES-256 before saving to MongoDB.
* **Masked by Default (`••••••••`)**: Sensitive PII fields are masked in all bulk API views and revealed only to authorized users with explicit decryption triggers.
* **Audit Logging on Decrypt**: Every time an authorized user decrypts restricted PII, an immutable telemetry audit event is generated.
* **Employee Security Profile**: Data classification matrix, access history per employee, authorized accessor list, and security flags.

### 3. Users & Role-Based Access Control (RBAC)
* **Granular Security Roles**:
  - `SUPER_ADMIN`: Full administrative governance, user creation, role assignment, policy updates.
  - `SECURITY_AUDITOR`: Dedicated audit execution, findings management, risk matrix oversight.
  - `HR_MANAGER`: Full employee directory management, consent tracking, data export.
  - `HR_STAFF`: Standard employee management with non-sensitive editing rights.
  - `EMPLOYEE`: Self-service profile and DPDP consent management.
* **Interactive RBAC Permission Matrix**: Visualizes server-side enforced access rules across all system features.

### 4. Automated Audit Engine Service
* **Privacy Audit Engine**: Audits AES-256 field encryption completeness, third-party consent revocations, terminated employee retention thresholds, and data minimization.
* **Security Audit Engine**: Detects high-frequency access velocity anomalies, inactive/orphaned user accounts, super admin privilege concentration, and logging integrity.
* **Real Findings Generation**: Scans DB data to generate real findings, severity levels, and remediation recommendations without hardcoded placeholders.

### 5. Audit Findings & Remediation Tracking Workflow
* Centralized vulnerability management repository.
* Status Lifecycle: `OPEN` ➔ `INVESTIGATING` ➔ `REMEDIATION_IN_PROGRESS` ➔ `RESOLVED` ➔ `RISK_ACCEPTED`.
* Ownership assignment, target due dates, remediation notes, and verification history timeline.

### 6. Risk Management & 3x3 Assessment Matrix
* Interactive 3x3 Likelihood (Low/Med/High) × Impact (Low/Med/High) Risk Matrix.
* Dynamic Risk Score calculation (1 to 9 scale) mapping to Low, Medium, High, or Critical severity.
* Risk register tracking owner, affected asset, status, and mitigation strategy.

### 7. Immutable Telemetry Audit Logs & CSV Export
* Append-only access log viewer with real IP addresses, user roles, action types, and fields accessed.
* Anomaly flag detection for access frequency velocity spikes.
* Export logs directly to **CSV format**.

### 8. Executive Audit Report Generator
* Formats comprehensive formal audit reports with Executive Summary, Audit Scope, Privacy & Security Scores, Detailed Findings, Risk Assessments, and Recommendations.
* Supports **Print / Export PDF** view and **CSV data export**.

### 9. Notifications & Security Alerts
* Active alert stream for critical findings, high-velocity access events, and consent updates.

### 10. System Configuration Settings
* Password policy rules (length, lockout duration, max attempts).
* Audit threshold configurations (retention days, velocity limit).

---

## 🔑 Demo Persona Login Credentials

The database comes pre-seeded with 5 distinct role personas for instant testing:

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@hrshield.com` | `AdminPassword123!` | Full security governance & user administration |
| **Security Auditor** | `auditor@hrshield.com` | `AuditorPassword123!` | Dedicated security & privacy auditing |
| **HR Manager** | `hr@hrshield.com` | `ManagerPassword123!` | Employee directory & consent export management |
| **HR Staff** | `staff@hrshield.com` | `StaffPassword123!` | Standard HR operations |
| **Employee** | `john@hrshield.com` | `EmployeePassword123!` | Employee self-view & DPDP consent portal |

---

## 🛠️ Technology Stack

### Backend
* **Runtime**: Node.js & Express.js
* **Database**: MongoDB Atlas / Mongoose ORM
* **Security & Auth**: JWT (JSON Web Tokens), bcryptjs password hashing, Helmet security headers, Express Rate Limiting
* **Cryptography**: AES-256-CBC field-level encryption for sensitive PII (`cryptoService.js`)

### Frontend
* **Framework**: React 19 (Vite) + React Router v7
* **Styling**: Vanilla CSS Design System + Tailwind CSS v4
* **UI Aesthetic**: Cybersecurity Dark SaaS / Glassmorphism Palette
* **Data Visualization**: Recharts
* **Icons**: Lucide React

---

## 🚀 Running the Project Locally

### 1. Backend Setup
```bash
cd backend
npm install
node seed.js  # Seeds DB with demo users, employees, risks, findings & telemetry
npm run dev   # Starts backend on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev   # Starts frontend Vite dev server on http://localhost:5173
```
