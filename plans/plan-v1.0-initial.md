---
name: Aria Lite Demo App
version: 1.0
date: 2025-01-27
overview: Build a polished 3-column Next.js demo app that simulates an AI building engineer chat experience using deterministic intent routing and local JSON data, with no external APIs or LLM calls.
todos: []
---

# Aria Lite Demo App - Implementation Plan

## Project Structure

```
/Users/dgabrielli/Documents/development/bbai-claude-demo/
├── app/
│   ├── layout.tsx              # Root layout with Tailwind
│   ├── page.tsx                 # Main 3-column dashboard
│   └── globals.css              # Global styles
├── components/
│   ├── BuildingContext.tsx      # Left panel: building info & alerts
│   ├── ChatPanel.tsx            # Center panel: chat interface
│   └── TelemetryPanel.tsx       # Right panel: telemetry & actions
├── lib/
│   ├── tools.ts                 # Tool functions (getHvacSnapshot, etc.)
│   ├── intentRouter.ts         # Intent detection & response generation
│   └── types.ts                 # TypeScript interfaces
├── data/
│   └── building.json            # Fake building data
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind config
├── postcss.config.js            # PostCSS config
└── next.config.js               # Next.js config (port 5276)
```

## Implementation Steps

### 1. Project Setup

- Initialize Next.js with TypeScript and Tailwind CSS
- Configure `package.json` with dependencies: `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`
- Set up `next.config.js` to run on port 5276
- Configure TypeScript and Tailwind

### 2. Data Layer (`/data/building.json`)

Create structured fake data:

- **floors**: Array of 12 floors (1-12) with basic metadata
- **hvac**: 
  - Units: AHU-1 (operational), AHU-2 (operational), AHU-3 (damper stuck at 15%)
  - Include status, lastMaintenance, efficiency metrics
- **zoneTemps**: Time series data for Floor 9 (showing heat spike) and 2-3 other floors
- **alerts**: 3-5 today's alerts (HVAC issues, sensor faults, etc.)
- **energy**: `today_kwh`, `yesterday_kwh`, `peak_kw` with realistic values
- **comfortComplaints**: Array with Floor 9 spike around 10:30am
- **workOrders**: Empty array initially

### 3. Type Definitions (`/lib/types.ts`)

Define interfaces for:

- `BuildingData`, `Floor`, `HvacUnit`, `Alert`, `EnergyData`, `ComfortComplaint`, `WorkOrder`
- `ChatMessage`, `ProposedAction`, `AuditLogEntry`
- `AriaResponse` (with diagnosis, telemetry, recommendations, confidence, safety note)

### 4. Tool Functions (`/lib/tools.ts`)

Pure functions that read from building data:

- `getHvacSnapshot()`: Returns all HVAC units with current status
- `getZoneTemps(floor: number)`: Returns temperature data for specific floor
- `getEnergySummary()`: Returns today vs yesterday comparison
- `getAlerts()`: Returns today's alerts
- `draftWorkOrder(reason: string, recommendedActions: string[])`: Creates work order object

### 5. Intent Router (`/lib/intentRouter.ts`)

Keyword-based intent detection:

- **HVAC intent**: Keywords: "hot", "cold", "temperature", "floor 9", "hvac"
  - Calls `getHvacSnapshot()` and `getZoneTemps(9)`
  - Identifies AHU-3 damper issue affecting Floor 9
  - Generates structured response with diagnosis, telemetry bullets, recommendations

- **Anomalies intent**: Keywords: "anomalies", "alerts", "issues"
  - Calls `getAlerts()`
  - Groups by system type
  - Provides root cause analysis

- **Energy intent**: Keywords: "energy", "usage", "kwh", "consumption"
  - Calls `getEnergySummary()`
  - Compares today vs yesterday
  - Highlights peak usage

- **Work order intent**: Keywords: "work order", "ticket", "create", "draft"
  - Uses context from previous interaction
  - Calls `draftWorkOrder()` with reason and actions
  - Creates audit log entry

Response generation:

- Each intent returns an `AriaResponse` object
- Templates assemble natural language from structured data
- Always includes: Diagnosis, What I'm seeing (bullets), Recommended actions (ranked 3), Confidence level, Safety note

### 6. UI Components

**BuildingContext.tsx** (Left Panel):

- Building name: "HQ-12 (Demo)"
- Systems list: HVAC, Lighting, Elevators (with status indicators)
- "Today's Alerts" section: List of alerts from data
- Clean card-based layout

**ChatPanel.tsx** (Center Panel):

- Chat transcript: Scrollable message list (user messages + Aria responses)
- Message bubbles: User (right-aligned), Aria (left-aligned with distinct styling)
- Input area: Text input + Send button
- Suggested prompts: 4 clickable chips below input
- State management: Messages array, input value
- On send: Calls intent router, adds user message, adds Aria response, updates proposed actions

**TelemetryPanel.tsx** (Right Panel):

- **Telemetry Cards**: Dynamic cards showing relevant metrics based on last query
  - HVAC status cards (when HVAC intent detected)
  - Temperature charts (when floor temp queried)
  - Energy metrics (when energy queried)
- **Proposed Actions**: List of actions from Aria responses
  - Each action: Description, status badge (Proposed/Approved), Approve button
  - Approve button: Toggles status, adds audit log entry
- **Audit Log**: Chronological list of actions
  - Format: `[timestamp] [type] [summary] [status]`
  - Types: Query, Action, WorkOrder, Summary

### 7. Main Page (`/app/page.tsx`)

- 3-column grid layout using Tailwind
- State management:
  - `messages`: Chat history
  - `proposedActions`: Array of proposed actions
  - `auditLog`: Array of audit entries
  - `telemetryData`: Current telemetry to display
- Loads building data on mount
- Passes state and handlers to child components

### 8. Styling & Polish

- Tailwind utility classes for consistent spacing
- Color scheme: Professional blue/gray palette
- Typography: Clear hierarchy (headings, body, code)
- Responsive design: 3-column on desktop, stacks on mobile
- Loading states: Skeleton loaders if needed
- Smooth transitions for state changes

### 9. Configuration Files

- `next.config.js`: Custom port 5276
- `tailwind.config.ts`: Custom theme if needed
- `tsconfig.json`: Strict TypeScript settings
- `package.json`: Scripts for `dev` and `build`

### 10. README.md

Documentation includes:

- Quick start: `npm install && npm run dev`
- Data editing: Location of `building.json` and structure
- Intent routing: Location of `intentRouter.ts` and how to add new intents
- Response templates: Where Aria message templates are defined
- Demo prompts: 3 example prompts to showcase features

## Key Design Decisions

1. **State Management**: Simple React `useState` hooks - no Redux/Context needed for demo
2. **Intent Detection**: Simple keyword matching with clear comments for easy modification
3. **Response Templates**: String templates in intent router for easy editing
4. **Data Flow**: One-way: User input → Intent Router → Tools → Response → UI Update
5. **Audit Log**: In-memory state (resets on refresh - acceptable for demo)

## Demo Flow Example

1. User clicks "Why is Floor 9 so hot today?"
2. Intent router detects HVAC intent
3. Calls `getHvacSnapshot()` and `getZoneTemps(9)`
4. Generates response identifying AHU-3 damper issue
5. Adds 3 recommended actions to Proposed Actions panel
6. Updates telemetry panel with HVAC cards showing AHU-3 status
7. Adds audit log entry for the query

## Files to Create

1. `package.json` - Dependencies and scripts
2. `tsconfig.json` - TypeScript configuration
3. `next.config.js` - Next.js config with port 5276
4. `tailwind.config.ts` - Tailwind configuration
5. `postcss.config.js` - PostCSS configuration
6. `app/layout.tsx` - Root layout
7. `app/page.tsx` - Main dashboard page
8. `app/globals.css` - Global styles with Tailwind directives
9. `lib/types.ts` - TypeScript interfaces
10. `lib/tools.ts` - Tool functions
11. `lib/intentRouter.ts` - Intent routing logic
12. `components/BuildingContext.tsx` - Left panel
13. `components/ChatPanel.tsx` - Center panel
14. `components/TelemetryPanel.tsx` - Right panel
15. `data/building.json` - Fake building data
16. `README.md` - Documentation

## Testing Considerations

- No TypeScript errors
- No runtime errors in console
- All intents respond correctly
- Proposed actions update properly
- Audit log entries are created
- Approve buttons toggle status
- Telemetry panel updates based on query type
