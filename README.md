# Who Owes Who - Split bills effortlessly

A premium, privacy-first debt settlement calculator built with Next.js and TypeScript. Track shared expenses, simplify repayments with a smart algorithm, and visualize the money flow with a dynamic graph.

![Who Owes Who Premium UI](https://img.shields.io/badge/UI-Glassmorphism-indigo)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **💸 Expense Tracking**: Add payments with description and amount.
- **🧮 Smart Inputs**: Supports math expressions (e.g., `10 + 20`) directly in the input fields.
- **⚡ Auto-fill**: Automatically fills the remaining amount for the next payer in the "Who Paid?" section.
- **💎 Premium Glassmorphic UI**: A modern, sleek dark theme with indigo/slate gradients and refined typography.
- **🧮 Smart Debt Simplification**: A greedy algorithm that minimizes the number of transactions needed to settle all debts.
- **📊 Visual Settlement Graph**: A dynamic, animated canvas-based graph representing the flow of money between people.
- **✅ "Settle Up" Logic**: Record repayments directly with a single click, automatically balancing the ledger.
- **💾 LocalStorage Persistence**: Your data stays in your browser. Payments are automatically saved and persist across refreshes.
- **📂 Data Portability**: Export your entire payment history to a JSON file and import it anytime to restore your data.
- **🛡️ Privacy First**: No signups, no databases, no tracking. Everything happens on your device.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (Modern CSS variables, Flexbox/Grid, Backdrop-filter) / [Tailwind CSS v4](https://tailwindcss.com/)
- **Math**: Custom Safe Evaluation & Greedy Debt Simplification Algorithm

## ⚙️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/who-owes-who.git
    cd who-owes-who
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```

4.  **Build for production:**
    ```bash
    pnpm build
    ```

## 📂 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: React components (`PaymentForm`, `PaymentList`, `SettlementGraph`).
- `src/lib`: Core logic (`ledger.ts`) and types.

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
