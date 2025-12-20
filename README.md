# TechRisk: AI-Powered Risk Analysis

TechRisk is a web application that leverages Generative AI to perform evidence-based audits of technical assets. Users can input any technical context—such as code snippets, log files, or architecture descriptions—and receive a comprehensive risk analysis report, an executive summary, and actionable recommendations.

![TechRisk Screenshot](<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/1b33bc5f-53ef-4aa3-be9e-4b72b97917ee" />)

## Features

-   **AI-Powered Risk Analysis:** Utilizes Google's Gemini model via Genkit to analyze technical inputs and identify potential risks, security vulnerabilities, and architectural problems.
-   **Structured Reporting:** Generates a detailed report with severity levels, business impact, and evidence for each identified risk.
-   **Executive Summaries:** Creates concise, non-technical summaries of the findings for business stakeholders.
-   **Actionable Recommendations:** Provides concrete steps to mitigate identified risks, complete with estimated effort and expected business benefits.
-   **Local History:** Saves all analysis reports to the browser's local storage for easy access and review.
-   **Modern UI:** A clean and responsive user interface built with Next.js, ShadCN UI, and Tailwind CSS.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **AI/Generative:** [Genkit](https://firebase.google.com/docs/genkit) with Google Gemini
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   A Google AI API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_google_api_key_here
    ```

### Running the Application

You need to run two processes in separate terminals: the Next.js development server and the Genkit development server.

1.  **Run the Genkit server:**
    This server hosts the AI flows.
    ```bash
    npm run genkit:dev
    ```

2.  **Run the Next.js server:**
    This server runs the web application.
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

## Project Structure

-   `src/app/`: Contains all the pages and routing for the Next.js application.
    -   `page.tsx`: The main analysis submission page.
    -   `report/[id]/page.tsx`: The detailed report view page.
    -   `history/page.tsx`: The analysis history page.
    -   `actions.ts`: Server Actions that connect the frontend to the AI flows.
-   `src/ai/`: Contains the Genkit AI implementation.
    -   `flows/`: Defines the core AI logic using Genkit flows and prompts.
    -   `genkit.ts`: Configures and initializes the Genkit instance.
-   `src/components/`: Shared React components used throughout the application.
    -   `ui/`: Auto-generated ShadCN UI components.
    -   `header.tsx`: The main site header.
    -   `report-ui.tsx`: Components specifically for displaying the analysis report.
-   `src/lib/`: Contains utility functions and type definitions.
    -   `types.ts`: TypeScript types for the application data structures.
    -   `utils.ts`: General utility functions.

## How It Works

1.  **Input:** The user pastes technical context into the textarea on the main page.
2.  **Action:** Submitting the form triggers the `analyzeAction` Server Action in `src/app/actions.ts`.
3.  **AI Flow:** The server action calls the `performAIRiskAnalysis` flow located in `src/ai/flows/perform-ai-risk-analysis.ts`.
4.  **Analysis:** Genkit uses the Gemini model to analyze the input based on the prompt instructions, generating a structured JSON output containing the risk report and executive summary.
5.  **Response:** The result is returned to the client-side component.
6.  **Storage & Redirect:** The report data is saved to `localStorage` with a unique ID (timestamp), and the user is redirected to the report page (`/report/[id]`).
7.  **Display:** The report page retrieves the data from `localStorage` and renders it using various report components.
