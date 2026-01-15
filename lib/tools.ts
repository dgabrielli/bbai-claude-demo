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
