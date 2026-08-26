// Copyright (c) 2025-present Polymath Robotics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { useState, useEffect, useRef } from "react";

import { BehaviorTreeLog } from "../types";
import { useGraphContext } from "./GraphContextProvider";

interface DebugOverlayProps {
  logs?: BehaviorTreeLog;
  rawMessage?: unknown;
}

interface LogEntry {
  time: string;
  stage: string;
  message: string;
}

export function DebugOverlay({ logs, rawMessage }: DebugOverlayProps) {
  const { nodeStatusMap } = useGraphContext();
  const [collapsed, setCollapsed] = useState(true);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const now = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

  // Stage 1: raw message received
  useEffect(() => {
    if (rawMessage !== undefined) {
      setEntries((prev) => [
        ...prev.slice(-99),
        {
          time: now(),
          stage: "1-RAW",
          message: JSON.stringify(rawMessage, null, 2),
        },
      ]);
    }
  }, [rawMessage]);

  // Stage 2: parsed logs
  useEffect(() => {
    if (logs) {
      const eventCount = logs.event_log?.length ?? 0;
      const names = logs.event_log?.map((e) => `${e.node_name}=${e.current_status}`) ?? [];
      setEntries((prev) => [
        ...prev.slice(-99),
        {
          time: now(),
          stage: "2-LOGS",
          message: `event_log[${eventCount}]: ${names.join(", ")}`,
        },
      ]);
    }
  }, [logs]);

  // Stage 3: status map built
  useEffect(() => {
    if (nodeStatusMap.size > 0) {
      const items = Array.from(nodeStatusMap.entries()).map(
        ([name, status]) => `${name}=${status}`,
      );
      setEntries((prev) => [
        ...prev.slice(-99),
        {
          time: now(),
          stage: "3-MAP",
          message: `size=${nodeStatusMap.size}: ${items.join(", ")}`,
        },
      ]);
    }
  }, [nodeStatusMap]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "rgba(0,0,0,0.9)",
        color: "#e5e7eb",
        fontSize: "11px",
        fontFamily: "monospace",
        borderTop: "1px solid #374151",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "2px 8px",
          cursor: "pointer",
          backgroundColor: "#1f2937",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span style={{ fontWeight: "bold" }}>
          BT Debug {collapsed ? "▲" : "▼"} | statusMap: {nodeStatusMap.size} | logs:{" "}
          {logs?.event_log?.length ?? "none"}
        </span>
        <button
          style={{
            background: "none",
            border: "1px solid #6b7280",
            color: "#9ca3af",
            padding: "0 4px",
            cursor: "pointer",
            fontSize: "10px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setEntries([]);
          }}
        >
          Clear
        </button>
      </div>
      {!collapsed && (
        <div style={{ maxHeight: "200px", overflow: "auto", padding: "4px 8px" }}>
          {entries.length === 0 && (
            <div style={{ color: "#6b7280" }}>Waiting for log messages...</div>
          )}
          {entries.map((entry, i) => (
            <div key={i} style={{ borderBottom: "1px solid #1f2937", padding: "2px 0" }}>
              <span style={{ color: "#6b7280" }}>{entry.time}</span>{" "}
              <span
                style={{
                  color:
                    entry.stage === "1-RAW"
                      ? "#f59e0b"
                      : entry.stage === "2-LOGS"
                        ? "#22c55e"
                        : "#3b82f6",
                  fontWeight: "bold",
                }}
              >
                [{entry.stage}]
              </span>{" "}
              <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {entry.message}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
