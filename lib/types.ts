// Building data types
export interface Floor {
  number: number;
  name: string;
  area_sqft: number;
  occupancy: number;
}

export interface HvacUnit {
  id: string;
  name: string;
  status: "operational" | "fault" | "maintenance";
  servesFloors: number[];
  lastMaintenance: string;
  efficiency: number;
  damperPosition: number;
  supplyTemp: number;
  returnTemp: number;
  faultDescription?: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  affectedFloors: number[];
  status: "active" | "resolved" | "acknowledged";
}

export interface EnergyData {
  today_kwh: number;
  yesterday_kwh: number;
  peak_kw: number;
  peak_time: string;
  average_kw: number;
}

export interface ComfortComplaint {
  id: string;
  timestamp: string;
  floor: number;
  type: string;
  description: string;
  reportedBy: string;
  status: string;
}

export interface WorkOrder {
  id: string;
  timestamp: string;
  reason: string;
  recommendedActions: string[];
  status: "draft" | "approved" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
}

export interface BuildingData {
  buildingName: string;
  floors: Floor[];
  hvac: {
    units: HvacUnit[];
  };
  zoneTemps: {
    [floorNumber: string]: Array<{
      time: string;
      temp: number;
      setpoint: number;
    }>;
  };
  alerts: Alert[];
  energy: EnergyData;
  comfortComplaints: ComfortComplaint[];
  workOrders: WorkOrder[];
}

// Chat and UI types
export interface ChatMessage {
  id: string;
  role: "user" | "aria";
  content: string;
  timestamp: string;
}

export interface ProposedAction {
  id: string;
  description: string;
  status: "Proposed" | "Approved";
  priority: number;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  type: "Query" | "Action" | "WorkOrder" | "Summary";
  summary: string;
  status: string;
}

export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface AriaResponse {
  diagnosis: string;
  telemetry: string[];
  recommendations: string[];
  confidence: ConfidenceLevel;
  safetyNote: string;
  message: string;
  telemetryData?: {
    type: "hvac" | "temperature" | "energy" | "alerts";
    data: any;
  };
}

export type IntentType = "hvac" | "anomalies" | "energy" | "workorder" | "unknown";

export interface SensorChartData {
  time: string;
  value: number;
  setpoint?: number;
}
