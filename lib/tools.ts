import { BuildingData, HvacUnit, Alert, EnergyData, WorkOrder } from "./types";
import buildingData from "../data/building.json";

// Load building data (in a real app, this would come from an API)
const data: BuildingData = buildingData as BuildingData;

/**
 * DEMO LOGIC: Get HVAC snapshot
 * Returns all HVAC units with their current status
 * Easy to modify: Add more units, change status values, etc.
 */
export function getHvacSnapshot(): HvacUnit[] {
  return data.hvac.units;
}

/**
 * DEMO LOGIC: Get zone temperatures for a specific floor
 * Returns time series temperature data for the floor
 * Easy to modify: Change temp values, add more time points, etc.
 */
export function getZoneTemps(floor: number): Array<{ time: string; temp: number; setpoint: number }> | null {
  const floorKey = floor.toString();
  return data.zoneTemps[floorKey] || null;
}

/**
 * DEMO LOGIC: Get energy summary
 * Returns today vs yesterday comparison
 * Easy to modify: Change energy values, add more metrics, etc.
 */
export function getEnergySummary(): EnergyData {
  return data.energy;
}

/**
 * DEMO LOGIC: Get today's alerts
 * Returns all active alerts
 * Easy to modify: Filter by type, change severity, add alerts, etc.
 */
export function getAlerts(): Alert[] {
  return data.alerts.filter(alert => alert.status === "active");
}

/**
 * DEMO LOGIC: Draft a work order
 * Creates a work order object (doesn't persist - demo only)
 * Easy to modify: Change priority logic, add more fields, etc.
 */
export function draftWorkOrder(reason: string, recommendedActions: string[]): WorkOrder {
  const priority = reason.toLowerCase().includes("hot") || reason.toLowerCase().includes("critical") 
    ? "high" 
    : recommendedActions.length > 2 
    ? "medium" 
    : "low";

  return {
    id: `WO-${Date.now()}`,
    timestamp: new Date().toISOString(),
    reason,
    recommendedActions,
    status: "draft",
    priority,
  };
}

/**
 * Helper: Get HVAC unit by ID
 */
export function getHvacUnitById(id: string): HvacUnit | undefined {
  return data.hvac.units.find(unit => unit.id === id);
}

/**
 * Helper: Get floors served by an HVAC unit
 */
export function getFloorsByHvacUnit(unitId: string): number[] {
  const unit = getHvacUnitById(unitId);
  return unit?.servesFloors || [];
}

/**
 * Helper: Get comfort complaints for a floor
 */
export function getComfortComplaints(floor?: number): number {
  if (floor !== undefined) {
    return data.comfortComplaints.filter(comp => comp.floor === floor).length;
  }
  return data.comfortComplaints.length;
}

/**
 * DEMO LOGIC: Get sensor data for a specific alert
 * Maps alert to its relevant floor's zone temperature data
 * Returns null if no sensor data is available for the alert
 */
export function getSensorDataForAlert(alertId: string): {
  chartData: Array<{ time: string; value: number; setpoint?: number }>;
  chartTitle: string;
  valueLabel: string;
  unit: string;
} | null {
  const alert = data.alerts.find(a => a.id === alertId);
  if (!alert) return null;

  // Check if alert has affected floors with sensor data
  if (alert.affectedFloors.length > 0) {
    const floor = alert.affectedFloors[0]; // Use first affected floor
    const floorKey = floor.toString();
    const temps = data.zoneTemps[floorKey];

    if (temps) {
      return {
        chartData: temps.map(t => ({
          time: t.time,
          value: t.temp,
          setpoint: t.setpoint,
        })),
        chartTitle: `Floor ${floor} Temperature - Last 24h`,
        valueLabel: "Temperature",
        unit: "°F",
      };
    }
  }

  return null;
}

/**
 * Helper: Check if an alert has available sensor data
 */
export function alertHasSensorData(alertId: string): boolean {
  return getSensorDataForAlert(alertId) !== null;
}
