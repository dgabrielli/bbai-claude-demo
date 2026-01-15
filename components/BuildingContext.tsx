"use client";

import { BuildingData, Alert } from "@/lib/types";
import buildingData from "@/data/building.json";
import { alertHasSensorData } from "@/lib/tools";

// Helper function to format timestamps consistently (fixes hydration errors)
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timestamp;
  }
}

interface BuildingContextProps {
  onAlertClick?: (alert: Alert) => void;
}

export default function BuildingContext({ onAlertClick }: BuildingContextProps) {
  const data: BuildingData = buildingData as BuildingData;
  const todaysAlerts = data.alerts.filter(alert => alert.status === "active");

  // System status - demo logic
  const hvacStatus = data.hvac.units.some(u => u.status === "fault") ? "alert" : "operational";
  const lightingStatus = "operational";
  const elevatorsStatus = "operational";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800 border-green-200";
      case "alert":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Building Context</h2>
      </div>

      {/* Building Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Building</h3>
          <p className="text-xl font-semibold text-gray-900">{data.buildingName}</p>
        </div>

        {/* Systems */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Systems</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded border border-gray-200">
              <span className="text-sm font-medium text-gray-700">HVAC</span>
              <span
                className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                  hvacStatus
                )}`}
              >
                {hvacStatus === "alert" ? "Alert" : "Operational"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Lighting</span>
              <span
                className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                  lightingStatus
                )}`}
              >
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Elevators</span>
              <span
                className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                  elevatorsStatus
                )}`}
              >
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Alerts */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Today&apos;s Alerts</h3>
        {todaysAlerts.length === 0 ? (
          <p className="text-sm text-gray-500">No active alerts</p>
        ) : (
          <div className="space-y-3">
            {todaysAlerts.map((alert) => {
              const hasData = alertHasSensorData(alert.id);
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border border-gray-200 bg-white shadow-sm ${
                    hasData
                      ? "cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                      : ""
                  }`}
                  onClick={() => hasData && onAlertClick?.(alert)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                      {hasData && (
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                  {alert.affectedFloors.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Floors: {alert.affectedFloors.join(", ")}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400" suppressHydrationWarning>
                      {formatTimestamp(alert.timestamp)}
                    </p>
                    {hasData && (
                      <span className="text-xs text-blue-500">Click for details</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
