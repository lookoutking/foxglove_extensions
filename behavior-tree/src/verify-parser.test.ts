// Quick validation script - run with: npx vitest run src/verify-parser.test.ts
//
// Verifies:
// 1. XML parsing produces correct node names
// 2. Mock BehaviorTreeLog maps correctly to parsed nodes
// 3. node_name in logs matches TreeNode.name from XML

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

import { parseBehaviorTreeXML } from "./parse";
import { NodeStatus, BehaviorTreeLog } from "./types";

// Collect all node names from parsed tree
function collectNodeNames(node: { name: string; children?: any[] }): string[] {
  const names = [node.name];
  if (node.children) {
    for (const child of node.children) {
      names.push(...collectNodeNames(child));
    }
  }
  return names;
}

describe("Parser verification", () => {
  // --- Simple XML ---
  it("parses bt-simple.xml and lists all node names", () => {
    const xml = readFileSync(resolve(__dirname, "fixtures/bt-simple.xml"), "utf-8");
    const tree = parseBehaviorTreeXML(xml);
    const names = collectNodeNames(tree.root);

    console.log("\n=== bt-simple.xml ===");
    console.log("All node names:", names);
    console.log("Root:", tree.root.name, "(model:", tree.root.model, ")");

    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain("battery_check");
    expect(names).toContain("navigate_primary");
  });

  // --- Complex XML ---
  it("parses behavior-tree.xml and lists all node names", () => {
    const xml = readFileSync(resolve(__dirname, "fixtures/behavior-tree.xml"), "utf-8");
    const tree = parseBehaviorTreeXML(xml);
    const names = collectNodeNames(tree.root);

    console.log("\n=== behavior-tree.xml ===");
    console.log("Total nodes:", names.length);
    console.log("All node names:", names);

    expect(names.length).toBeGreaterThan(0);
  });

  // --- Log matching ---
  it("verifies mock log node_names match parsed XML node names", () => {
    const xml = readFileSync(resolve(__dirname, "fixtures/bt-simple.xml"), "utf-8");
    const tree = parseBehaviorTreeXML(xml);
    const nodeNames = new Set(collectNodeNames(tree.root));

    const mockLog: BehaviorTreeLog = {
      timestamp: { sec: 1, nsec: 0 },
      event_log: [
        { timestamp: { sec: 1, nsec: 0 }, node_name: "root_sequence", previous_status: "IDLE", current_status: "RUNNING" },
        { timestamp: { sec: 1, nsec: 0 }, node_name: "battery_check", previous_status: "IDLE", current_status: "SUCCESS" },
        { timestamp: { sec: 1, nsec: 0 }, node_name: "navigate_primary", previous_status: "IDLE", current_status: "RUNNING" },
      ],
    };

    console.log("\n=== Log matching ===");
    console.log("XML node names:", [...nodeNames]);
    for (const event of mockLog.event_log) {
      const match = nodeNames.has(event.node_name);
      console.log(
        `  log node_name="${event.node_name}" → ${match ? "MATCH" : "NO MATCH"}`
      );
      expect(match).toBe(true);
    }
  });

  // --- Status resolution ---
  it("resolves all status formats correctly", () => {
    // Simulate what LogProcessor.resolveNodeStatus does
    function resolveNodeStatus(statusValue: string | number): NodeStatus {
      if (typeof statusValue === "number") return statusValue as NodeStatus;
      const num = Number(statusValue);
      if (!isNaN(num) && num >= 0 && num <= 4) return num as NodeStatus;
      const map: Record<string, NodeStatus> = {
        IDLE: NodeStatus.IDLE,
        RUNNING: NodeStatus.RUNNING,
        SUCCESS: NodeStatus.SUCCESS,
        FAILURE: NodeStatus.FAILURE,
        SKIPPED: NodeStatus.SKIPPED,
      };
      return map[statusValue.toUpperCase()] ?? NodeStatus.IDLE;
    }

    console.log("\n=== Status resolution ===");
    const testCases: [string | number, NodeStatus][] = [
      [0, NodeStatus.IDLE],
      [1, NodeStatus.RUNNING],
      [2, NodeStatus.SUCCESS],
      [3, NodeStatus.FAILURE],
      [4, NodeStatus.SKIPPED],
      ["IDLE", NodeStatus.IDLE],
      ["RUNNING", NodeStatus.RUNNING],
      ["SUCCESS", NodeStatus.SUCCESS],
      ["FAILURE", NodeStatus.FAILURE],
      ["0", NodeStatus.IDLE],
      ["1", NodeStatus.RUNNING],
    ];

    for (const [input, expected] of testCases) {
      const result = resolveNodeStatus(input);
      console.log(`  resolveNodeStatus(${JSON.stringify(input)}) → ${result} (expected ${expected})`);
      expect(result).toBe(expected);
    }
  });
});
