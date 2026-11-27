import type { NODE_TYPES, EDGE_TYPES, InMemorySmartGraphRepository, createCapabilityResolver } from './smartGraph.mjs';
export type SmartGraphNodeType = typeof NODE_TYPES[number];
export type SmartGraphEdgeType = typeof EDGE_TYPES[number];
export interface SmartGraphActor { userId: string; workspaceId?: string }
export interface SmartGraphNodeInput {
  id: string; type: SmartGraphNodeType; label?: string; data?: Record<string, unknown>;
  scope?: { visibility?: 'private'|'workspace'|'public'|'system'; ownerId?: string|null; workspaceId?: string|null };
  provenance?: { sourceId?: string; version?: string; uri?: string; consent?: string };
  sensitivity?: 'public'|'internal'|'confidential'|'restricted'; createdAt?: string;
}
export interface SmartGraphEdgeInput {
  id: string; type: SmartGraphEdgeType; from: string; to: string; metadata?: Record<string, unknown>;
}
export { InMemorySmartGraphRepository, createCapabilityResolver };
