# TechRiskAI: AI-Powered Technical Risk Analysis 🛡️🚀

**TechRiskAI** is a premium desktop application designed for technical leaders, security auditors, and engineers to perform rapid, evidence-based risk assessments of technical assets. Leveraging **Gemini 2.0 Flash**, it transforms complex code, logs, and architecture descriptions into actionable business intelligence.

![TechRiskAI Dashboard](https://github.com/user-attachments/assets/1b33bc5f-53ef-4aa3-be9e-4b72b97917ee)

## ✨ Core Pillars

### 🧠 Intelligent Analysis
- **Context-Aware Auditing:** Input code snippets, cloud configurations, or system logs for deep analysis.
- **Strategic Consulting:** Interactive AI assistant to discuss remediation strategies and "what-if" scenarios.
- **Auto-Fix Generator:** One-click AI-powered remediation code for identified vulnerabilities.

### 🛡️ Hardened Security (v0.7.1)
- **AES-GCM Encryption:** All local history and sensitive data are encrypted using **AES-256-GCM** via the Web Crypto API.
- **Multi-Layer Sanitizer:** Automatically masks API keys (AWS, Google, Stripe) and detects **Prompt Injection** attempts before processing.
- **Privacy First:** Data never leaves your machine unless explicitly sent to the AI model (Gemini), and even then, it is sanitized first.

### 💼 Business & Compliance
- **Financial Exposure:** Automated estimates of revenue risk vs. mitigation costs (ROI analysis).
- **Compliance Mapping:** Direct links to **SOC2**, **ISO27001**, and **GDPR** controls.
- **Executive Summaries:** Professional, non-technical summaries for stakeholders.
- **Report Comparison:** Compare two analysis runs to track progress or identify regressions.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Runtime:** [Electron](https://www.electronjs.org/) (Native Desktop Windows App)
- **AI Orchestration:** [Firebase Genkit](https://firebase.google.com/docs/genkit)
- **Database (Local):** Hardened IndexedDB/LocalStorage with AES-GCM
- **Styling:** Tailwind CSS + Radix UI + Lucide Icons

## 🚦 Getting Started

### Prerequisites
- **Node.js:** v18.0.0+ (v20 recommended)
- **API Key:** A Google Gemini API Key (from [AI Studio](https://aistudio.google.com/app/apikey))

### Installation (User)
1. Download the latest installer from [Releases](https://github.com/MaikyOzr/TechRiskAI/releases).
2. Run `TechRisk-Setup.exe`.

### Development Setup
1. **Clone & Install:**
   ```bash
   git clone https://github.com/MaikyOzr/TechRiskAI.git
   cd TechRiskAI
   npm install
   ```
2. **Environment:** Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
3. **Launch Dev Mode:**
   ```bash
   npm run electron:dev
   ```

## 📜 Licensing

- **Open Source:** Licensed under **GNU Cloud Affero General Public License v3.0 (AGPL-3.0)**.
- **Commercial:** Proprietary licenses are available for organizations requiring closed-source redistribution or custom SLAs. [Request Quote](mailto:legal@techriskai.com).

---
*Built with ❤️ for a safer technical future by [TechRiskAI](https://github.com/MaikyOzr)*
