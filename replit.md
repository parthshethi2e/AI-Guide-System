# AI Maturity Assessment Platform

## Overview

A production-ready universal AI assessment platform that helps organizations evaluate their AI readiness across 7 dimensions and receive personalized transformation roadmaps.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Frontend**: React + Vite + shadcn/ui + Tailwind CSS
- **Charts**: Recharts (RadarChart, BarChart)
- **Routing**: Wouter

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── ai-assessment/       # React + Vite frontend (preview: /)
│   └── api-server/          # Express API server (preview: /api)
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas from OpenAPI
│   └── db/                  # Drizzle ORM schema + DB connection
├── scripts/                 # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Assessment Platform
- **7-Category Survey**: Data Infrastructure, Technology Stack, AI/ML Usage, Workforce Skills, Leadership Vision, Operational Processes, Governance & Ethics
- **23 weighted questions** spanning all AI maturity dimensions
- **Multi-step wizard** with progress tracking and category navigation
- **Automatic scoring** using weighted question scoring engine

### AI Maturity Classification
Five levels: Nascent → Emerging → Developing → Advanced → Leading
- Score-based classification using percentage thresholds
- Per-category radar chart visualization

### Recommendation Engine
- Tailored recommendations based on category weakness scores
- Grouped by timeframe: Short-term, Mid-term, Long-term
- Priority levels: Critical, High, Medium, Low
- Tool recommendations for each action item

### Dashboard & Analytics
- Platform-wide statistics
- Maturity level distribution chart
- Industry benchmark comparison
- Recent assessments feed

## API Routes

### Assessments
- `GET /api/assessments` — List all assessments
- `POST /api/assessments` — Create new assessment
- `GET /api/assessments/:id` — Get assessment with responses
- `POST /api/assessments/:id/submit` — Submit survey and generate results
- `GET /api/assessments/:id/result` — Get computed result

### Survey
- `GET /api/survey/questions` — Get full question set by category

### Dashboard
- `GET /api/dashboard/stats` — Platform statistics
- `GET /api/dashboard/maturity-distribution` — Level distribution
- `GET /api/dashboard/recent-assessments` — Recent 10 assessments
- `GET /api/dashboard/industry-benchmarks` — Industry comparisons

## Database Schema

- `assessments` — Organization info, status, maturity level, score
- `survey_responses` — Individual question answers with numeric/text values

## Key Files

- `artifacts/api-server/src/lib/survey-data.ts` — Survey questions with weighted scoring
- `artifacts/api-server/src/lib/recommendation-engine.ts` — Maturity classification + recommendation generation
- `artifacts/api-server/src/routes/assessments.ts` — Assessment CRUD and submission logic
- `artifacts/api-server/src/routes/dashboard.ts` — Analytics endpoints
- `lib/api-spec/openapi.yaml` — Full API contract (OpenAPI 3.1)

## Development

- `pnpm --filter @workspace/api-server run dev` — Start API server
- `pnpm --filter @workspace/ai-assessment run dev` — Start frontend
- `pnpm --filter @workspace/db run push` — Push schema to database
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API client
