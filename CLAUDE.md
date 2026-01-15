# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:5276
npm run build        # Production build
npm run lint         # Run ESLint
npm start            # Start production server on port 5276
```

## Architecture Overview

This is **Aria Lite**, a demo Next.js 14 (App Router) application simulating an AI building engineer chat assistant. All "AI" behavior is **deterministic** - no LLM calls, no external APIs. The app uses keyword-based intent routing and local JSON data.

### Core Data Flow

1. User enters message in `ChatPanel`
2. Message goes to `routeIntent()` in `lib/intentRouter.ts`
3. `detectIntent()` uses keyword matching to classify intent (hvac, anomalies, energy, workorder, unknown)
4. Intent-specific handler (e.g., `handleHvacIntent`) calls tool functions from `lib/tools.ts`
5. Tool functions read from `data/building.json` (fake building data)
6. Handler returns structured `AriaResponse` with diagnosis, telemetry, recommendations
7. Response displays in chat and updates `TelemetryPanel` with proposed actions

### Key Extension Points

**To add new intents:**
1. Add keywords in `detectIntent()` (`lib/intentRouter.ts`)
2. Create handler function `handleYourIntent()` returning `AriaResponse`
3. Add case to switch statement in `routeIntent()`

**To modify fake data:** Edit `data/building.json` - contains floors, HVAC units, zone temperatures, alerts, energy data, comfort complaints, work orders.

**To add new tool functions:** Add to `lib/tools.ts` - pure functions that read from building.json.

### Layout Structure

3-column dashboard in `app/page.tsx`:
- **Left (BuildingContext)**: Building info, system status, today's alerts
- **Center (ChatPanel)**: Chat interface with Aria, suggested prompts
- **Right (TelemetryPanel)**: Telemetry cards, proposed actions (approvable), audit log

### State Management

All state lives in `app/page.tsx`:
- `proposedActions`: Actions recommended by Aria (can be approved)
- `auditLog`: Query/action history
- `telemetryData`: Current telemetry display data

ChatPanel maintains `lastContextRef` to pass previous response context to work order intent handler.
