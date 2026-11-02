# EmberWatch — AI-Powered Cyber Threat Intelligence & Early Warning System

> *"See the threat before it strikes."*

EmberWatch is an enterprise-grade Cyber Threat Intelligence (CTI) and Early Warning Platform designed to solve security team alert fatigue. Instead of drowning in scattered vulnerability feeds, EmberWatch ingests intelligence from public feeds, normalises it into MongoDB, computes explainable AI risk scores, and correlates threats directly against organizational assets (software, domains, IP ranges, technologies) in real time.

---

## 🎨 Editorial Design System (Warm & Modern)

EmberWatch intentionally departs from stereotypical neon, matrix-green, or "hacker" aesthetics in favor of a warm, editorial, and trustworthy look inspired by premium analytics magazines.

### Color Tokens
- **Cream 50 / 100 / 200**: `#FDFAF4`, `#F6EEDF`, `#EBDDC6` (Paper-like backgrounds and card surfaces)
- **Tan 300 / Brown 500 / 700**: `#D9C3A5`, `#7A5C48`, `#4E3324` (Subtle dividers, secondary text, muted indicators)
- **Chocolate 800 / 900**: `#3B2418`, `#2A1810` (Primary text, dark sidebar, deep hero accents)
- **Burnt Orange 500 / 600**: `#CC5500`, `#B04A00` (Primary accent: interactive buttons, active pills, alert gauges)
- **Severity Palette**:
  - **Critical**: `#A8321C` (Brick) / `#F6DDD6` background
  - **High**: `#CC5500` (Burnt Orange) / `#F8E1CC` background
  - **Medium**: `#D99A2B` (Amber) / `#FAEBC8` background
  - **Low**: `#6B8F5E` (Sage) / `#E3ECDD` background
  - **Info**: `#8A7B6E` (Taupe) / `#EEE8E1` background

---

## 🚀 Key Capabilities & Modules

1. **Normalized Threat Feed**: Filter by source, type, and severity. Detailed drawers with AI analysis, linked CVEs, and raw STIX/JSON.
2. **Explainable AI Risk Scoring (0–100)**: Transparent weighted breakdown across Base Severity (30%), Active Exploitation / CISA KEV (20%), Reporting Prevalence (15%), Temporal Recency Decay (15%), Watchlist Asset Exposure (10%), and ML Classifier Output (10%).
3. **IOC Explorer & Enrichment**: Auto-detects indicator types (IP, domain, URL, hash, email, CVE). Computes Shannon entropy for DGA detection and brand impersonation homoglyphs.
4. **CVE Intelligence**: Complete NVD CVE database enriched with FIRST EPSS exploit likelihood scores and active CISA KEV exploitation flags.
5. **Early Warning Center**: Kanban triage workflow (`New` ➔ `Investigating` ➔ `Mitigated` ➔ `False Positive`) evaluating correlation rules against internal infrastructure.
6. **Asset Watchlist**: Register software versions, domains, or subnets. Triggers instantaneous threat evaluation when added.
7. **Adversary Profiling & MITRE ATT&CK**: Nation-state group profiles (Volt Typhoon, Scattered Spider, Lazarus) and interactive ATT&CK frequency heatmap.
8. **Grounded AI Analyst**: Conversational interface with suggested prompts, citation links, and automated incident brief generation.
9. **Intelligence Reports**: Branded executive summaries and daily briefings exportable as PDF or CSV.
10. **Automated Live Ingestion & Simulator**: Built-in simulator ticks new live threats and alerts every 20–40 seconds for presentations and live testing.

---

## 🔑 Demo Access & Seed Credentials

The system includes pre-seeded demo users for testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@emberwatch.dev` | `EmberWatch2026!` |
| **Analyst** | `analyst@emberwatch.dev` | `EmberWatch2026!` |
| **Viewer** | `viewer@emberwatch.dev` | `EmberWatch2026!` |

> **Tip:** You can also use the **1-Click Role Login** buttons on the login screen (`/auth/login`) to switch roles instantly.

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js 20+ (Node v26 LTS installed)
- MongoDB Atlas cluster or local MongoDB instance

### 1. Environment Configuration
The `.env.local` file is configured with your MongoDB Atlas cluster:
```env
MONGODB_URI=mongodb+srv://desaiabhay107_db_user:<db_password>@cluster0.q0rrgz6.mongodb.net/emberwatch?retryWrites=true&w=majority
JWT_SECRET=emberwatch_jwt_secret_dev_3829013824982390482093842
DEMO_MODE=true
```
*(Replace `<db_password>` in `.env.local` with your MongoDB database user password).*

### 2. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Run with Docker Compose (Alternative)
```bash
docker compose up -d
```

---

## 📊 Database Seeding
The application seeds automatically upon first launch or when clicking **"Reset & Seed Intelligence"** in **Admin & Feeds (`/settings`)**.

Seeded data includes:
- 3 Users (Admin, Analyst, Viewer)
- 310+ Realistic Threat Campaigns
- 1,520+ Enriched IOCs across malware families
- 155+ CVEs (including top CISA KEV entries)
- 25 Adversary Profiles
- 12 Monitored Organizational Assets
- 40 Early-Warning Alerts across all triage stages

---

## 📜 Ethics Note
EmberWatch is strictly designed for **defensive security operations, authorized threat monitoring, and academic research**. Indicators and intelligence queries are non-invasive and never execute payloads or attack third-party systems.
