# TechRiskAI: Intelligent Technical Risk Analysis

**TechRiskAI** is an advanced desktop application that leverages Generative AI to perform evidence-based audits of technical assets. By inputting code snippets, log files, or architecture descriptions, users receive comprehensive risk analysis reports, executive summaries, and actionable recommendations—all within a secure, local environment.

![TechRiskAI Dashboard Screenshot](https://github.com/user-attachments/assets/1b33bc5f-53ef-4aa3-be9e-4b72b97917ee)

## 🚀 Key Features

-   **🖥️ Native Desktop Experience:** Built with **Electron** for a robust, standalone application on Windows.
-   **🧠 AI-Powered Analysis:** Utilizes **Google Genkit** and **Gemini** models to detect security vulnerabilities, architectural flaws, and compliance risks.
-   **📊 Structured Reporting:** Generates detailed reports with severity levels, business impact assessments, and concrete evidence.
-   **💼 Executive Summaries:** Automatically creates non-technical summaries suitable for stakeholders and management.
-   **🛡️ Secure & Local:** Your data remains on your machine; analysis history is stored locally for maximum privacy.
-   **✨ Modern UI:** A beautiful, responsive interface crafted with **Next.js**, **Tailwind CSS**, and **Radix UI**.

## 🛠️ Tech Stack

-   **Core:** [Electron](https://www.electronjs.org/), [Next.js](https://nextjs.org/) (App Router)
-   **AI Engine:** [Genkit](https://firebase.google.com/docs/genkit) with Google Gemini
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 📦 Installation

1.  Go to the [Releases](https://github.com/MaikyOzr/TechRiskAI/releases) page.
2.  Download the latest installer for Windows (`TechRisk-Setup-x.x.x.exe`).
3.  Run the installer and follow the on-screen instructions.

## 🚦 Getting Started (Development)

If you want to contribute or build from source:

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   A Google AI API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MaikyOzr/TechRiskAI.git
    cd TechRiskAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    GEMINI_API_KEY=your_google_api_key_here
    ```

### Running Locally

To run the application in development mode (Next.js + Electron):

```bash
npm run electron:dev
```

This command starts the Next.js server, waits for it to be ready, builds the Electron main process, and launches the application window.

### Building for Production

To create a distributable installer (e.g., `.exe` for Windows):

```bash
npm run dist
```
The output installer will be in the `dist/` directory.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📜 License

This project is licensed under the **GNU Cloud Affero General Public License v3.0 (AGPL-3.0)**.
See the [LICENSE](LICENSE) file for details.

## ❤️ Support the Project

If you find TechRiskAI useful, please consider supporting its development!

-   **Star** this repository on GitHub ⭐
-   **Sponsor** on [GitHub Sponsors](https://github.com/sponsors/MaikyOzr)
-   **Buy me a coffee** on [BuyMeACoffee](https://www.buymeacoffee.com/techriskai)

---
*Built with ❤️ by [MaikyOzr](https://github.com/MaikyOzr)*
