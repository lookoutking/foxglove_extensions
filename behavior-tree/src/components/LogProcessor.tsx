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
import { useEffect } from "react";

import { BehaviorTreeLog, NodeStatus } from "../types";
import { useGraphContext } from "./GraphContextProvider";

interface LogProcessorProps {
  logs?: BehaviorTreeLog;
}

function resolveNodeStatus(statusValue: string | number): NodeStatus {
  if (typeof statusValue === "number") {
    return statusValue as NodeStatus;
  }

  const numericValue = Number(statusValue);
  if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 4) {
    return numericValue as NodeStatus;
  }

  const statusMap: Record<string, NodeStatus> = {
    IDLE: NodeStatus.IDLE,
    RUNNING: NodeStatus.RUNNING,
    SUCCESS: NodeStatus.SUCCESS,
    FAILURE: NodeStatus.FAILURE,
    SKIPPED: NodeStatus.SKIPPED,
  };

  return statusMap[statusValue.toUpperCase()] ?? NodeStatus.IDLE;
}

export function LogProcessor({ logs }: LogProcessorProps) {
  const { setNodeStatusMap } = useGraphContext();

  useEffect(() => {
    if (!logs?.event_log || logs.event_log.length === 0) {
      setNodeStatusMap(new Map());
      return;
    }

    const statusMap = new Map<string, NodeStatus>();

    for (const event of logs.event_log) {
      const status = resolveNodeStatus(event.current_status);
      statusMap.set(event.node_name, status);
    }

    setNodeStatusMap(statusMap);
  }, [logs, setNodeStatusMap]);

  return null;
}
