"use client";

import { AriaResponse, ProposedAction, AuditLogEntry, HvacUnit } from "@/lib/types";
import { useState } from "react";

interface TelemetryPanelProps {
  telemetryData?: AriaResponse["telemetryData"];
  proposedActions: ProposedAction[];
  auditLog: AuditLogEntry[];
  onApproveAction: (actionId: string) => void;
  onGenerateSummary: () => void;
}

export default function TelemetryPanel({
  telemetryData,
  proposedActions,
  auditLog,
  onApproveAction,
  onGenerateSummary,
}: TelemetryPanelProps) {
  // Telemetry Cards Section
  const renderTelemetryCards = () => {
    if (!telemetryData) {
      return (
        <div className="p-4 text-sm text-gray-500">
          Ask a question to see telemetry data here
        </div>
      );
    }

    if (telemetryData.type === "hvac") {
      const { hvacUnits, floor9Temps, ahu3 } = telemetryData.data as {
        hvacUnits?: HvacUnit[];
        floor9Temps?: Array<{ time: string; temp: number; setpoint: number }>;
        ahu3?: HvacUnit;
      };

      return (
        <div className="space-y-3">
          {hvacUnits &&
            hvacUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{unit.id}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      unit.status === "operational"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Damper:</span>{" "}
                    <span className="font-medium text-gray-900">{unit.damperPosition}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Supply Temp:</span>{" "}
                    <span className="font-medium text-gray-900">{unit.supplyTemp}°F</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Return Temp:</span>{" "}
                    <span className="font-medium text-gray-900">{unit.returnTemp}°F</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Efficiency:</span>{" "}
                    <span className="font-medium text-gray-900">{(unit.efficiency * 100).toFixed(0)}%</span>
                  </div>
                </div>
                {unit.faultDescription && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                    {unit.faultDescription}
                  </div>
                )}
              </div>
            ))}

          {floor9Temps && floor9Temps.length > 0 && (
            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Floor 9 Temperature Trend</h4>
              <div className="space-y-1">
                {floor9Temps.slice(-5).map((point, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{point.time}</span>
                    <div className="flex space-x-3">
                      <span
                        className={
                          point.temp > point.setpoint
                            ? "font-medium text-red-600"
                            : "font-medium text-gray-900"
                        }
                      >
                        {point.temp}°F
                      </span>
                      <span className="text-gray-600">(set: {point.setpoint}°F)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (telemetryData.type === "energy") {
      const energy = telemetryData.data as any;
      const difference = energy.today_kwh - energy.yesterday_kwh;
      const percentChange = ((difference / energy.yesterday_kwh) * 100).toFixed(1);

      return (
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Energy Usage</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Today:</span>
              <span className="font-medium text-gray-900">{energy.today_kwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Yesterday:</span>
              <span className="font-medium text-gray-900">{energy.yesterday_kwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Change:</span>
              <span className={`font-medium ${difference > 0 ? "text-red-600" : "text-green-600"}`}>
                {difference > 0 ? "+" : ""}
                {difference.toLocaleString()} kWh ({percentChange}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Peak Demand:</span>
              <span className="font-medium text-gray-900">
                {energy.peak_kw} kW at {energy.peak_time}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Telemetry & Actions</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Telemetry Cards */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Telemetry</h3>
          {renderTelemetryCards()}
        </div>

        {/* Proposed Actions */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Proposed Actions</h3>
            <button
              onClick={onGenerateSummary}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Generate Summary
            </button>
          </div>
          {proposedActions.length === 0 ? (
            <p className="text-sm text-gray-500">No proposed actions</p>
          ) : (
            <div className="space-y-2">
              {proposedActions.map((action) => (
                <div
                  key={action.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          #{action.priority}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            action.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {action.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{action.description}</p>
                    </div>
                  </div>
                  {action.status === "Proposed" && (
                    <button
                      onClick={() => onApproveAction(action.id)}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Audit Log</h3>
          {auditLog.length === 0 ? (
            <p className="text-sm text-gray-500">No log entries</p>
          ) : (
            <div className="space-y-2">
              {auditLog.slice().reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="p-2 bg-gray-50 rounded border border-gray-200 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        entry.type === "Query"
                          ? "bg-blue-100 text-blue-800"
                          : entry.type === "Action"
                          ? "bg-green-100 text-green-800"
                          : entry.type === "WorkOrder"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {entry.type}
                    </span>
                    <span className="text-gray-600">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-900">{entry.summary}</p>
                  <p className="text-gray-600 mt-1">Status: {entry.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
