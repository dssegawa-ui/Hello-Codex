# Choptop Admin (Parts 1, 2, 3, 3B, 4)

Vite + React + TypeScript scaffold that bundles your admin wireframes into a single runnable repo.

## Install & Run
```bash
npm i
npm run dev
# open the URL printed (usually http://localhost:5173)
```

## Lint, Types, Tests
```bash
npm run lint
npm run typecheck
npm test
```

## What's inside
- **Part 1** — Home, Queues, Users/Organizers, Events, Tickets, Analytics (compact) (src/parts/Part1.tsx)
- **Part 2** — Payments & Payouts with unified reconciliation (includes MTN MoMo) (src/parts/Part2.tsx)
- **Part 3** — CMS + Journeys with live analytics hooks (src/parts/Part3.tsx)
- **Part 3B** — Access Scopes full UI with city overrides (src/parts/Part3B.tsx)
- **Part 4** — Roles & Access management + CMS/Journeys/Disputes analytics (src/parts/Part4.tsx)

## Notes
- The UI uses utility-like class names but does not require Tailwind; a tiny CSS is included in `src/index.css` to make it look decent.
- Two small unit test files verify:
  - scope inheritance (city overrides global)
  - rows-per-page scaling for responsive tables

If you want this integrated with Tailwind, shadcn/ui, or your existing design tokens, say the word and I’ll extend the scaffold.
