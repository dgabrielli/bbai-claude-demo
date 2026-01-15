"use client";

import { useEffect, useCallback } from "react";
import { Alert } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface SensorChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
  chartData: Array<{ time: string; value: number; setpoint?: number }>;
  chartTitle: string;
  valueLabel: string;
  unit: string;
}

export default function SensorChartModal({
  isOpen,
  onClose,
  alert,
  chartData,
  chartTitle,
  valueLabel,
  unit,
}: SensorChartModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !alert) return null;

  // Calculate min/max for Y-axis with padding
  const values = chartData.map((d) => d.value);
  const setpoints = chartData.filter((d) => d.setpoint).map((d) => d.setpoint!);
  const allValues = [...values, ...setpoints];
  const minValue = Math.min(...allValues) - 2;
  const maxValue = Math.max(...allValues) + 2;

  // Get setpoint for reference line (assuming constant setpoint)
  const setpoint = chartData[0]?.setpoint;

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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {alert.title}
              </h2>
              <span
                className={`text-xs px-2 py-1 rounded ${getSeverityColor(
                  alert.severity
                )}`}
              >
                {alert.severity}
              </span>
            </div>
            <p className="text-sm text-gray-600">{alert.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Chart */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            {chartTitle}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  domain={[minValue, maxValue]}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                  label={{
                    value: unit,
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12, fill: "#6b7280" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value}${unit}`, valueLabel]}
                />
                <Legend />
                {setpoint && (
                  <ReferenceLine
                    y={setpoint}
                    stroke="#10b981"
                    strokeDasharray="5 5"
                    label={{
                      value: `Setpoint: ${setpoint}${unit}`,
                      position: "right",
                      style: { fontSize: 11, fill: "#10b981" },
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#2563eb" }}
                  name={valueLabel}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer with metadata */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              {alert.affectedFloors.length > 0 && (
                <span>Affected Floors: {alert.affectedFloors.join(", ")}</span>
              )}
            </div>
            <div>Alert ID: {alert.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
