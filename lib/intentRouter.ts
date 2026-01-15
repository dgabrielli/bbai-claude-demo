import {
  AriaResponse,
  IntentType,
  ConfidenceLevel,
} from "./types";
import {
  getHvacSnapshot,
  getZoneTemps,
  getEnergySummary,
  getAlerts,
  draftWorkOrder,
  getHvacUnitById,
  getComfortComplaints,
} from "./tools";

/**
 * DEMO LOGIC: Intent Router
 * This is where all the "AI" magic happens - but it's all deterministic!
 * 
 * To modify behavior:
 * 1. Add new keywords to the intent detection below
 * 2. Create new intent handlers (like handleHvacIntent)
 * 3. Update the response templates to change how Aria responds
 */

/**
 * Detect intent from user message using keyword matching
 * Easy to extend: Just add more keywords or patterns
 */
export function detectIntent(message: string): IntentType {
  const lowerMessage = message.toLowerCase();

  // HVAC intent: Temperature issues, floor complaints, HVAC system
  if (
    lowerMessage.includes("hot") ||
    lowerMessage.includes("cold") ||
    lowerMessage.includes("temperature") ||
    lowerMessage.includes("floor 9") ||
    lowerMessage.includes("hvac") ||
    lowerMessage.includes("heating") ||
    lowerMessage.includes("cooling") ||
    lowerMessage.includes("warm")
  ) {
    return "hvac";
  }

  // Anomalies intent: Alerts, issues, problems
  if (
    lowerMessage.includes("anomalies") ||
    lowerMessage.includes("alerts") ||
    lowerMessage.includes("issues") ||
    lowerMessage.includes("problems") ||
    lowerMessage.includes("faults") ||
    lowerMessage.includes("error")
  ) {
    return "anomalies";
  }

  // Energy intent: Power usage, consumption
  if (
    lowerMessage.includes("energy") ||
    lowerMessage.includes("usage") ||
    lowerMessage.includes("kwh") ||
    lowerMessage.includes("consumption") ||
    lowerMessage.includes("power") ||
    lowerMessage.includes("electricity")
  ) {
    return "energy";
  }

  // Work order intent: Creating tickets or work orders
  if (
    lowerMessage.includes("work order") ||
    lowerMessage.includes("ticket") ||
    lowerMessage.includes("create") ||
    lowerMessage.includes("draft") ||
    lowerMessage.includes("generate")
  ) {
    return "workorder";
  }

  return "unknown";
}

/**
 * DEMO LOGIC: Handle HVAC Intent
 * This generates Aria's response for temperature/HVAC queries
 * Easy to modify: Change the diagnosis text, telemetry bullets, recommendations
 */
function handleHvacIntent(message: string, context?: AriaResponse): AriaResponse {
  const hvacUnits = getHvacSnapshot();
  const floor9Temps = getZoneTemps(9);
  const ahu3 = getHvacUnitById("AHU-3");
  const complaints = getComfortComplaints(9);

  // Check if Floor 9 is mentioned
  const isFloor9 = message.toLowerCase().includes("floor 9") || message.toLowerCase().includes("9");

  if (isFloor9 && ahu3 && ahu3.status === "fault") {
    const currentTemp = floor9Temps?.[floor9Temps.length - 1]?.temp || 81;
    const setpoint = floor9Temps?.[0]?.setpoint || 72;

    const diagnosis = `I've identified a damper malfunction in AHU-3 that's causing insufficient cooling to Floor 9. The zone temperature is currently ${currentTemp}°F, ${currentTemp - setpoint}°F above the setpoint.`;

    const telemetry = [
      `AHU-3 damper position stuck at ${ahu3.damperPosition}% (normal range: 60-80%)`,
      `Floor 9 zone temperature: ${currentTemp}°F (setpoint: ${setpoint}°F)`,
      `AHU-3 supply temp: ${ahu3.supplyTemp}°F (target: 55-57°F)`,
      `${complaints} comfort complaints reported for Floor 9 today`,
      `AHU-3 last maintenance: ${ahu3.lastMaintenance} (overdue)`,
    ];

    const recommendations = [
      `Immediately schedule maintenance for AHU-3 damper actuator - highest priority`,
      `Temporarily increase cooling from AHU-1/AHU-2 to provide relief to Floor 9`,
      `Dispatch technician to verify damper position and check actuator control signal`,
    ];

    const responseMessage = `${diagnosis}

**What I'm seeing:**
${telemetry.map(t => `• ${t}`).join("\n")}

**Recommended actions (ranked):**
1. ${recommendations[0]}
2. ${recommendations[1]}
3. ${recommendations[2]}

**Confidence: High**
**Safety note: No changes applied; pending approval.**`;

    return {
      diagnosis,
      telemetry,
      recommendations,
      confidence: "High",
      safetyNote: "No changes applied; pending approval.",
      message: responseMessage,
      telemetryData: {
        type: "hvac",
        data: { hvacUnits, floor9Temps, ahu3 },
      },
    };
  }

  // Generic HVAC response
  const operationalUnits = hvacUnits.filter(u => u.status === "operational").length;
  const faultUnits = hvacUnits.filter(u => u.status === "fault").length;

  const diagnosis = `I've checked all HVAC systems. ${operationalUnits} units are operational, ${faultUnits} unit(s) have faults.`;

  const telemetry = hvacUnits.map(unit => {
    return `${unit.id}: ${unit.status} (${unit.damperPosition}% damper, serves floors ${unit.servesFloors.join(", ")})`;
  });

  const recommendations = [
    "Review HVAC system status dashboard for detailed metrics",
    "Schedule preventive maintenance for units approaching service interval",
    "Monitor zone temperatures for any anomalies",
  ];

  const responseMessage = `${diagnosis}

**What I'm seeing:**
${telemetry.map(t => `• ${t}`).join("\n")}

**Recommended actions (ranked):**
1. ${recommendations[0]}
2. ${recommendations[1]}
3. ${recommendations[2]}

**Confidence: Medium**
**Safety note: No changes applied; pending approval.**`;

  return {
    diagnosis,
    telemetry,
    recommendations,
    confidence: "Medium",
    safetyNote: "No changes applied; pending approval.",
    message: responseMessage,
    telemetryData: {
      type: "hvac",
      data: { hvacUnits },
    },
  };
}

/**
 * DEMO LOGIC: Handle Anomalies Intent
 * This generates Aria's response for alert/anomaly queries
 * Easy to modify: Change how alerts are grouped, root cause analysis text
 */
function handleAnomaliesIntent(message: string): AriaResponse {
  const alerts = getAlerts();
  const hvacAlerts = alerts.filter(a => a.type === "HVAC");
  const otherAlerts = alerts.filter(a => a.type !== "HVAC");

  const diagnosis = `I've identified ${alerts.length} active alerts today. ${hvacAlerts.length} HVAC-related, ${otherAlerts.length} other system alerts.`;

  const telemetry = alerts.map(alert => {
    const floors = alert.affectedFloors.length > 0 
      ? ` (Floors: ${alert.affectedFloors.join(", ")})` 
      : "";
    return `${alert.title} - ${alert.severity.toUpperCase()} severity${floors}`;
  });

  // Root cause analysis for HVAC alerts
  const rootCause = hvacAlerts.length > 0
    ? "HVAC alerts appear to stem from AHU-3 damper malfunction affecting multiple zones."
    : "Alerts span multiple systems; no single root cause identified.";

  const recommendations = [
    hvacAlerts.length > 0
      ? "Address AHU-3 damper issue - this is likely causing cascading temperature problems"
      : "Review alert patterns to identify underlying system issues",
    "Prioritize high-severity alerts and dispatch appropriate technicians",
    "Update alert thresholds if false positives are occurring",
  ];

  const responseMessage = `${diagnosis}

**What I'm seeing:**
${telemetry.map(t => `• ${t}`).join("\n")}

**Root cause analysis:**
${rootCause}

**Recommended actions (ranked):**
1. ${recommendations[0]}
2. ${recommendations[1]}
3. ${recommendations[2]}

**Confidence: ${hvacAlerts.length > 0 ? "High" : "Medium"}**
**Safety note: No changes applied; pending approval.**`;

  return {
    diagnosis,
    telemetry,
    recommendations,
    confidence: hvacAlerts.length > 0 ? "High" : "Medium",
    safetyNote: "No changes applied; pending approval.",
    message: responseMessage,
    telemetryData: {
      type: "alerts",
      data: { alerts, hvacAlerts, otherAlerts },
    },
  };
}

/**
 * DEMO LOGIC: Handle Energy Intent
 * This generates Aria's response for energy usage queries
 * Easy to modify: Change comparison logic, peak usage analysis
 */
function handleEnergyIntent(message: string): AriaResponse {
  const energy = getEnergySummary();
  const difference = energy.today_kwh - energy.yesterday_kwh;
  const percentChange = ((difference / energy.yesterday_kwh) * 100).toFixed(1);

  const diagnosis = `Today's energy usage is ${difference > 0 ? `${percentChange}% higher` : `${Math.abs(parseFloat(percentChange))}% lower`} than yesterday. Current consumption: ${energy.today_kwh.toLocaleString()} kWh.`;

  const telemetry = [
    `Today: ${energy.today_kwh.toLocaleString()} kWh`,
    `Yesterday: ${energy.yesterday_kwh.toLocaleString()} kWh`,
    `Peak demand: ${energy.peak_kw} kW at ${energy.peak_time}`,
    `Average demand: ${energy.average_kw} kW`,
    `Difference: ${difference > 0 ? "+" : ""}${difference.toLocaleString()} kWh (${percentChange}%)`,
  ];

  const recommendations = [
    difference > 0
      ? "Investigate increased consumption - may be related to HVAC issues (AHU-3 working harder)"
      : "Review energy-saving initiatives that may be contributing to lower usage",
    `Monitor peak demand around ${energy.peak_time} - consider load shifting if possible`,
    "Schedule energy audit to identify additional optimization opportunities",
  ];

  const responseMessage = `${diagnosis}

**What I'm seeing:**
${telemetry.map(t => `• ${t}`).join("\n")}

**Recommended actions (ranked):**
1. ${recommendations[0]}
2. ${recommendations[1]}
3. ${recommendations[2]}

**Confidence: High**
**Safety note: No changes applied; pending approval.**`;

  return {
    diagnosis,
    telemetry,
    recommendations,
    confidence: "High",
    safetyNote: "No changes applied; pending approval.",
    message: responseMessage,
    telemetryData: {
      type: "energy",
      data: energy,
    },
  };
}

/**
 * DEMO LOGIC: Handle Work Order Intent
 * This generates a work order draft based on previous context
 * Easy to modify: Change work order fields, priority logic
 */
function handleWorkOrderIntent(message: string, context?: AriaResponse): AriaResponse {
  // Use context from previous interaction if available
  const reason = context 
    ? `Based on analysis: ${context.diagnosis}`
    : "Work order requested by user";

  const recommendedActions = context?.recommendations || [
    "Review system status",
    "Schedule maintenance",
    "Monitor performance",
  ];

  const workOrder = draftWorkOrder(reason, recommendedActions);

  const diagnosis = `I've drafted a work order (${workOrder.id}) with ${recommendedActions.length} recommended actions.`;

  const telemetry = [
    `Work Order ID: ${workOrder.id}`,
    `Priority: ${workOrder.priority.toUpperCase()}`,
    `Status: ${workOrder.status}`,
    `Reason: ${reason.substring(0, 100)}...`,
  ];

  const recommendations = recommendedActions;

  const responseMessage = `${diagnosis}

**What I'm seeing:**
${telemetry.map(t => `• ${t}`).join("\n")}

**Recommended actions in work order:**
${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

**Confidence: Medium**
**Safety note: No changes applied; pending approval. Work order is in draft status.**`;

  return {
    diagnosis,
    telemetry,
    recommendations,
    confidence: "Medium",
    safetyNote: "No changes applied; pending approval. Work order is in draft status.",
    message: responseMessage,
    telemetryData: {
      type: "alerts",
      data: { workOrder },
    },
  };
}

/**
 * DEMO LOGIC: Handle Unknown Intent
 * Fallback for unrecognized queries
 */
function handleUnknownIntent(message: string): AriaResponse {
  const diagnosis = "I didn't quite understand your query. Could you rephrase or try one of the suggested prompts?";

  const telemetry = [
    "Supported query types: HVAC/temperature issues, alerts/anomalies, energy usage, work orders",
    "Try asking about: Floor 9 temperature, today's alerts, energy consumption, or creating a work order",
  ];

  const recommendations = [
    "Use the suggested prompts below for common queries",
    "Be specific about floors, systems, or timeframes",
    "Check the Building Context panel for current system status",
  ];

  const responseMessage = `${diagnosis}

**What I'm seeing:**
${telemetry.map(t => `• ${t}`).join("\n")}

**Recommended actions (ranked):**
1. ${recommendations[0]}
2. ${recommendations[1]}
3. ${recommendations[2]}

**Confidence: Low**
**Safety note: No changes applied; pending approval.**`;

  return {
    diagnosis,
    telemetry,
    recommendations,
    confidence: "Low",
    safetyNote: "No changes applied; pending approval.",
    message: responseMessage,
  };
}

/**
 * Main router function - processes user message and returns Aria's response
 * This is the entry point - modify the handlers above to change behavior
 */
export function routeIntent(message: string, context?: AriaResponse): AriaResponse {
  const intent = detectIntent(message);

  switch (intent) {
    case "hvac":
      return handleHvacIntent(message, context);
    case "anomalies":
      return handleAnomaliesIntent(message);
    case "energy":
      return handleEnergyIntent(message);
    case "workorder":
      return handleWorkOrderIntent(message, context);
    default:
      return handleUnknownIntent(message);
  }
}
