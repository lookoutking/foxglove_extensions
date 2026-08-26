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

import { NodeStatus } from "../types";

export interface NodeColorScheme {
  nodeStyles: {
    default: string;
    selected: string;
  };
  popupStyle: string;
  badgeColor: string;
}

/**
 * Get color scheme for a behavior tree node based on its model type
 */
export function getNodeColor(modelType: string): NodeColorScheme {
  // Control flow nodes (blue)
  if (
    ["Sequence", "Fallback", "Parallel", "ReactiveSequence", "ReactiveFallback"].includes(modelType)
  ) {
    return {
      nodeStyles: {
        default: "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-600",
        selected: "bg-blue-300 border-blue-600 dark:bg-blue-700 dark:border-blue-400 shadow-lg ring-2 ring-blue-400/50 dark:ring-blue-500/50",
      },
      popupStyle: "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-600",
      badgeColor: "lightblue",
    };
  }

  // Decorator nodes (purple)
  if (["ForceSuccess", "ForceFailure", "Inverter", "Repeat", "Timeout"].includes(modelType)) {
    return {
      nodeStyles: {
        default: "bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-600",
        selected: "bg-purple-300 border-purple-600 dark:bg-purple-700 dark:border-purple-400 shadow-lg ring-2 ring-purple-400/50 dark:ring-purple-500/50",
      },
      popupStyle: "bg-purple-100 border-purple-300 dark:bg-purple-900 dark:border-purple-600",
      badgeColor: "#DAB1DA",
    };
  }

  // Condition nodes (yellow)
  if (
    modelType.includes("IsTrue") ||
    modelType.includes("IsFalse") ||
    modelType.includes("Check")
  ) {
    return {
      nodeStyles: {
        default: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-600",
        selected: "bg-yellow-300 border-yellow-600 dark:bg-yellow-700 dark:border-yellow-400 shadow-lg ring-2 ring-yellow-400/50 dark:ring-yellow-500/50",
      },
      popupStyle: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-600",
      badgeColor: "#8B8000",
    };
  }

  // Default/Action nodes (green)
  return {
    nodeStyles: {
      default: "bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-600",
      selected: "bg-green-300 border-green-600 dark:bg-green-700 dark:border-green-400 shadow-lg ring-2 ring-green-400/50 dark:ring-green-500/50",
    },
    popupStyle: "bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-600",
    badgeColor: "lightgreen",
  };
}

export interface NodeStatusStyle {
  borderColor: string;
  ringClass: string;
  animationClass: string;
  edgeStroke: string;
  edgeAnimated: boolean;
  statusLabel: string;
}

export function getNodeStatusStyle(status: NodeStatus): NodeStatusStyle {
  switch (status) {
    case NodeStatus.IDLE:
      return {
        borderColor: "",
        ringClass: "",
        animationClass: "",
        edgeStroke: "#6b7280",
        edgeAnimated: false,
        statusLabel: "IDLE",
      };
    case NodeStatus.RUNNING:
      return {
        borderColor: "#f59e0b",
        ringClass: "ring-2 ring-amber-400/70 dark:ring-amber-500/70",
        animationClass: "animate-pulse",
        edgeStroke: "#f59e0b",
        edgeAnimated: true,
        statusLabel: "RUNNING",
      };
    case NodeStatus.SUCCESS:
      return {
        borderColor: "#22c55e",
        ringClass: "ring-2 ring-green-400/70 dark:ring-green-500/70",
        animationClass: "",
        edgeStroke: "#22c55e",
        edgeAnimated: false,
        statusLabel: "SUCCESS",
      };
    case NodeStatus.FAILURE:
      return {
        borderColor: "#ef4444",
        ringClass: "ring-2 ring-red-400/70 dark:ring-red-500/70",
        animationClass: "",
        edgeStroke: "#ef4444",
        edgeAnimated: false,
        statusLabel: "FAILURE",
      };
    case NodeStatus.SKIPPED:
      return {
        borderColor: "#9ca3af",
        ringClass: "ring-1 ring-gray-400/50 dark:ring-gray-500/50",
        animationClass: "opacity-60",
        edgeStroke: "#9ca3af",
        edgeAnimated: false,
        statusLabel: "SKIPPED",
      };
  }
}
