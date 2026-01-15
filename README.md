# Aria Lite - Building Engineer Chat Demo

A polished 3-column Next.js demo app that simulates an AI building engineer chat experience using deterministic intent routing and local JSON data. No external APIs, no real backend, no LLM calls - all "AI" behavior is deterministic and driven by local fake data.

## Quick Start

```bash
npm install
npm run dev
```

The app will run on **http://localhost:5276**

## Features

- **3-Column Dashboard Layout**:
  - **Left Panel**: Building context with system status and today's alerts
  - **Center Panel**: Chat interface with Aria, your building engineer assistant
  - **Right Panel**: Telemetry cards, proposed actions, and audit log

- **Deterministic Intent Routing**: Simple keyword matching for intent detection
- **Interactive Chat**: Ask questions about HVAC, alerts, energy usage, or create work orders
- **Proposed Actions**: Aria recommends actions that can be approved
- **Audit Log**: Complete log of all queries, actions, and summaries

## Project Structure

```
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
└── plans/
    └── plan-v1.0-initial.md     # Implementation plan
```

## Customization Guide

### Editing Fake Data

**Location**: `data/building.json`

This file contains all the fake building data:
- **floors**: Building floor information
- **hvac**: HVAC units with status, efficiency, temperature readings
- **zoneTemps**: Time series temperature data for floors
- **alerts**: Today's active alerts
- **energy**: Energy usage metrics (today vs yesterday)
- **comfortComplaints**: Occupant comfort complaints
- **workOrders**: Work order records

**Example**: To change the Floor 9 temperature issue, edit the `hvac.units` array to modify AHU-3 status or update `zoneTemps["9"]` to change temperature values.

### Adding New Intents

**Location**: `lib/intentRouter.ts`

The intent router uses keyword matching to detect user intent. To add a new intent:

1. **Add keywords** in `detectIntent()`:
   ```typescript
   if (lowerMessage.includes("your-keyword")) {
     return "your-intent";
   }
   ```

2. **Create handler function**:
   ```typescript
   function handleYourIntent(message: string): AriaResponse {
     // Your logic here
     return {
       diagnosis: "...",
       telemetry: [...],
       recommendations: [...],
       confidence: "High",
       safetyNote: "No changes applied; pending approval.",
       message: "...",
     };
   }
   ```

3. **Add to switch statement** in `routeIntent()`:
   ```typescript
   case "your-intent":
     return handleYourIntent(message);
   ```

### Modifying Response Templates

**Location**: `lib/intentRouter.ts`

Aria's responses are generated from templates in each intent handler. Each response includes:
- **Diagnosis**: 1-2 sentence summary
- **Telemetry**: 3-5 bullet points with data
- **Recommendations**: 3 ranked action items
- **Confidence**: High/Medium/Low
- **Safety Note**: Always includes "No changes applied; pending approval."

To change how Aria responds, modify the message template in the handler functions (e.g., `handleHvacIntent`, `handleAnomaliesIntent`).

### Adding New Tool Functions

**Location**: `lib/tools.ts`

Tool functions are pure functions that read from `building.json`. To add a new tool:

1. Import the building data:
   ```typescript
   import buildingData from "../data/building.json";
   ```

2. Create your function:
   ```typescript
   export function yourToolFunction(params: any): YourReturnType {
     // Access data.buildingName, data.hvac, etc.
     return result;
   }
   ```

3. Use it in intent handlers in `intentRouter.ts`

## Demo Prompts

Try these example prompts to see the demo in action:

1. **"Why is Floor 9 so hot today?"**
   - Triggers HVAC intent
   - Identifies AHU-3 damper issue
   - Shows temperature trend and HVAC status

2. **"Any anomalies in HVAC right now?"**
   - Triggers anomalies intent
   - Lists all active alerts
   - Provides root cause analysis

3. **"Summarize energy usage vs yesterday."**
   - Triggers energy intent
   - Compares today vs yesterday
   - Shows peak demand metrics

4. **"Create a work order for the likely cause."**
   - Triggers work order intent
   - Drafts a work order based on previous context
   - Adds entry to audit log

## Technology Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **React** for UI components
- No external dependencies for AI/ML - all deterministic logic

## Notes

- All data is in-memory and resets on page refresh (acceptable for demo)
- No actual building system changes are made - everything is simulation
- The "AI" behavior is entirely deterministic based on keyword matching
- Response templates can be easily modified for different use cases

## Development

```bash
# Install dependencies
npm install

# Run development server on port 5276
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

This is a demo application for demonstration purposes.
