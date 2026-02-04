# Development

This document explains how to run the app locally and where the core logic lives.

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+

## Install

```bash
cd "/Users/aarav/Developer/Lab Pipeline Simulator"
npm install
```

## Run

```bash
npm run dev
```

The development server will print a local URL, typically `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Project Structure

- `src/app` — App Router entrypoint and API routes.
- `src/components` — UI and feature components.
- `src/lib` — Parsing, simulation, and utilities.
- `docs` — Detailed documentation.

## Key Entry Points

- UI: `src/app/page.tsx`
- Parser API: `src/app/api/parse-workflow/route.ts`
- Explainer API: `src/app/api/explain/route.ts`

## Configuration

- Tailwind: `tailwind.config.ts`
- PostCSS: `postcss.config.js`
- Next: `next.config.js`
- TypeScript: `tsconfig.json`
