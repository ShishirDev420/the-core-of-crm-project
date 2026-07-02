# AuraClose Engine 🎯

AuraClose Engine is a premium, modern, and interactive CRM closer tool designed for real estate sales managers and closer desks. It helps closers analyze prospective client profiles mathematically (using Zodiac signs and Life Path numbers) to formulate high-impact closing strategies, objection matrices, and custom closing protocols.

## Features ✨

- **Numerology & Astrological Analysis**: Calculates the client's Life Path Number and Zodiac element automatically based on their Date of Birth to determine their closer persona archetype.
- **Client Archetypes**: Custom strategies for:
  - **Fire**: *The High-Status King* (Aries, Leo, Sagittarius)
  - **Earth**: *The Solid Investor* (Taurus, Virgo, Capricorn)
  - **Air**: *The Future Visionary* (Gemini, Libra, Aquarius)
  - **Water**: *The Family Guardian* (Cancer, Scorpio, Pisces)
- **Live Objection Counter Matrix**: Immediate scripts to counter standard client objections regarding Price, Time, and Trust/Skepticism.
- **Site Manager Audit Log**: Easily record closed sessions and export them as a clean JSON file for audit review.
- **Stunning UI**: Designed with a premium, high-fidelity dark glassmorphic theme and sleek animated transitions.

## Tech Stack 🛠️

- **Framework**: React 18 & Vite
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **State & Forms**: Wouter (Routing), React Hook Form, Zod (Validation), TanStack React Query
- **Components**: Radix UI primitives (Accordion, Select, Dialog, Toast, Table)

## Getting Started 🚀

### Prerequisites

Make sure you have Node.js (v18+) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ShishirDev420/the-core-of-crm-project.git
   cd the-core-of-crm-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the local development server:
```bash
npm run dev
```

The app will run locally at [http://localhost:5173](http://localhost:5173).

### Build

Build the project for production:
```bash
npm run build
```

The static files will be generated in `dist/public`.
