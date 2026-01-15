"use client";

import { useState } from "react";
import BuildingContext from "@/components/BuildingContext";
import ChatPanel from "@/components/ChatPanel";
import TelemetryPanel from "@/components/TelemetryPanel";
import SensorChartModal from "@/components/SensorChartModal";
import { AriaResponse, ProposedAction, AuditLogEntry, Alert } from "@/lib/types";
import { getSensorDataForAlert } from "@/lib/tools";

export default function Home() {
  const [proposedActions, setProposedActions] = useState<ProposedAction[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [telemetryData, setTelemetryData] = useState<AriaResponse["telemetryData"]>();

  // Modal state for sensor chart
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    alert: Alert | null;
    chartData: Array<{ time: string; value: number; setpoint?: number }>;
    chartTitle: string;
    valueLabel: string;
    unit: string;
  }>({
    isOpen: false,
    alert: null,
    chartData: [],
    chartTitle: "",
    valueLabel: "",
    unit: "",
  });

  // Handle alert click to open modal
  const handleAlertClick = (alert: Alert) => {
    const sensorData = getSensorDataForAlert(alert.id);
    if (sensorData) {
      setModalState({
        isOpen: true,
        alert,
        chartData: sensorData.chartData,
        chartTitle: sensorData.chartTitle,
        valueLabel: sensorData.valueLabel,
        unit: sensorData.unit,
      });
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Handle new message from chat panel
  const handleNewMessage = (response: AriaResponse) => {
    setTelemetryData(response.telemetryData);
  };

  // Handle proposed actions from chat panel
  const handleProposedActions = (actions: ProposedAction[]) => {
    // Merge with existing actions, avoiding duplicates
    setProposedActions((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const newActions = actions.filter((a) => !existingIds.has(a.id));
      return [...prev, ...newActions];
    });
  };

  // Handle audit log entry
  const handleAuditLog = (entry: AuditLogEntry) => {
    setAuditLog((prev) => [...prev, entry]);
  };

  // Handle action approval
  const handleApproveAction = (actionId: string) => {
    setProposedActions((prev) =>
      prev.map((action) =>
        action.id === actionId
          ? { ...action, status: "Approved" as const }
          : action
      )
    );

    // Add audit log entry for approval
    const action = proposedActions.find((a) => a.id === actionId);
    if (action) {
      const entry: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "Action",
        summary: `Approved: ${action.description}`,
        status: "Approved",
      };
      handleAuditLog(entry);
    }
  };

  // Handle generate summary
  const handleGenerateSummary = () => {
    if (auditLog.length === 0) return;

    // DEMO LOGIC: Generate a deterministic summary based on recent entries
    const recentEntries = auditLog.slice(-3);
    const queries = recentEntries.filter((e) => e.type === "Query");
    const actions = recentEntries.filter((e) => e.type === "Action");

    const summaryText =
      queries.length > 0
        ? `Recent activity: ${queries.length} query/queries processed. ${
            actions.length > 0
              ? `${actions.length} action(s) approved. `
              : ""
          }Primary focus: ${
            queries[queries.length - 1]?.summary || "Building systems status"
          }.`
        : `Recent activity: ${actions.length} action(s) approved. System status reviewed.`;

    const entry: AuditLogEntry = {
      id: `audit-summary-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "Summary",
      summary: summaryText,
      status: "Generated",
    };
    handleAuditLog(entry);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Main content: 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Building Context */}
        <div className="w-80 flex-shrink-0">
          <BuildingContext onAlertClick={handleAlertClick} />
        </div>

        {/* Center Panel: Chat */}
        <div className="flex-1 min-w-0">
          <ChatPanel
            onNewMessage={handleNewMessage}
            onProposedActions={handleProposedActions}
            onAuditLog={handleAuditLog}
          />
        </div>

        {/* Right Panel: Telemetry & Actions */}
        <div className="w-96 flex-shrink-0">
          <TelemetryPanel
            telemetryData={telemetryData}
            proposedActions={proposedActions}
            auditLog={auditLog}
            onApproveAction={handleApproveAction}
            onGenerateSummary={handleGenerateSummary}
          />
        </div>
      </div>

      {/* Sensor Chart Modal */}
      <SensorChartModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        alert={modalState.alert}
        chartData={modalState.chartData}
        chartTitle={modalState.chartTitle}
        valueLabel={modalState.valueLabel}
        unit={modalState.unit}
      />
    </div>
  );
}
