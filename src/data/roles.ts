/**
 * RBAC model — PRD pages 3-4.
 *
 *   1. Create a user role and define permission at individual module level.
 *   2. This access can be given per asset as well.
 *   3. Each module has View and Edit permission allowing users to do only
 *      assigned activity as per the role.
 *
 * Roles are declared per cluster: a Fleet & Mobility role carries no useful
 * permissions in Assets & Finance and vice versa, so the workspace switcher
 * moves you to that cluster's default role rather than stranding you with an
 * empty navigation rail.
 */

import { MODULES, type ClusterId, type ModuleId } from './platform'

export type PermissionLevel = 'none' | 'view' | 'edit'

export interface AssetScope {
  /** 'all' = tenant-wide. Otherwise the role only sees the listed hubs. */
  kind: 'all' | 'hubs'
  hubs?: string[]
}

export interface Role {
  id: string
  name: string
  description: string
  /** Which workspaces this role is meaningful in. */
  clusters: ClusterId[]
  /** Modules omitted here resolve to 'none' — invisible in navigation. */
  permissions: Partial<Record<ModuleId, PermissionLevel>>
  /** PRD: "This access can be given per asset as well." */
  assetScope: AssetScope
  /** Roles shipped with the platform cannot be deleted in the prototype. */
  builtIn: boolean
}

/** Builds a permission map from two lists, so role definitions stay readable. */
function perms(
  edit: ModuleId[],
  view: ModuleId[] = [],
): Partial<Record<ModuleId, PermissionLevel>> {
  const out: Partial<Record<ModuleId, PermissionLevel>> = {}
  for (const id of view) out[id] = 'view'
  for (const id of edit) out[id] = 'edit'
  return out
}

const EVERY_MODULE = MODULES.map((m) => m.id)

const ALL_EDIT = perms(EVERY_MODULE)
const ALL_VIEW = perms([], EVERY_MODULE)

export const ROLES: Role[] = [
  // --- Cross-cluster ---------------------------------------------------------
  {
    id: 'org-admin',
    name: 'Org Admin',
    description: 'Full control across every module in both workspaces, including RBAC.',
    clusters: ['fleet-mobility', 'asset-finance'],
    permissions: ALL_EDIT,
    assetScope: { kind: 'all' },
    builtIn: true,
  },
  {
    id: 'read-only-auditor',
    name: 'Read-only Auditor',
    description: 'View everything in both workspaces, change nothing. Every Edit action is disabled.',
    clusters: ['fleet-mobility', 'asset-finance'],
    permissions: ALL_VIEW,
    assetScope: { kind: 'all' },
    builtIn: true,
  },

  // --- Cluster 1: Fleet & Mobility ------------------------------------------
  {
    id: 'ops-lead',
    name: 'Operations Lead',
    description: 'Runs day-to-day fleet operations. Cannot change org settings or integrations.',
    clusters: ['fleet-mobility'],
    permissions: perms(
      [
        'dashboard',
        'assets-registry',
        'live-tracking',
        'vehicles-trips',
        'operational-alerts',
        'maintenance',
        'geofences',
        'routes-corridors',
        'charging-sessions',
        'driver-analytics',
      ],
      ['vehicle-telemetry', 'fota', 'asset-intelligence', 'reports-analytics', 'organization-settings'],
    ),
    assetScope: { kind: 'all' },
    builtIn: true,
  },
  {
    id: 'hub-supervisor',
    name: 'Hub Supervisor',
    description:
      'Dispatch and driver management for assigned hubs only. Demonstrates per-asset scoping.',
    clusters: ['fleet-mobility'],
    permissions: perms(
      ['vehicles-trips', 'operational-alerts', 'driver-analytics'],
      [
        'dashboard',
        'assets-registry',
        'live-tracking',
        'maintenance',
        'geofences',
        'routes-corridors',
        'charging-sessions',
        'reports-analytics',
      ],
    ),
    // PRD: access can be given per asset — this role is scoped to two hubs
    assetScope: { kind: 'hubs', hubs: ['Koramangala Hub', 'Peenya Corridor'] },
    builtIn: true,
  },
  {
    id: 'maintenance-tech',
    name: 'Maintenance Technician',
    description: 'Services vehicles. Sees health and telemetry, edits only work orders.',
    clusters: ['fleet-mobility'],
    permissions: perms(
      ['maintenance'],
      [
        'dashboard',
        'assets-registry',
        'live-tracking',
        'vehicles-trips',
        'operational-alerts',
        'charging-sessions',
        'vehicle-telemetry',
        'fota',
      ],
    ),
    assetScope: { kind: 'all' },
    builtIn: true,
  },

  // --- Cluster 2: Assets & Finance ------------------------------------------
  {
    id: 'battery-ops',
    name: 'Battery Operations Manager',
    description: 'Owns pack health, lifecycle and warranty recovery across the battery portfolio.',
    clusters: ['asset-finance'],
    permissions: perms(
      ['dashboard', 'assets-registry', 'battery', 'battery-lifecycle', 'asset-tracking', 'maintenance-warranty'],
      [
        'live-tracking',
        'swap-stations',
        'asset-risk',
        'asset-valuation',
        'predictive-degradation',
        'reports-analytics',
        'oem-integrations',
        'warranty-governance',
        'organization-settings',
      ],
    ),
    assetScope: { kind: 'all' },
    builtIn: true,
  },
  {
    id: 'swap-supervisor',
    name: 'Swap Network Supervisor',
    description:
      'Runs swap stations and pack rotation for assigned sites only. Per-asset scoping in Cluster 2.',
    clusters: ['asset-finance'],
    permissions: perms(
      ['swap-stations', 'swap-sessions', 'battery-lifecycle', 'asset-tracking'],
      ['dashboard', 'assets-registry', 'live-tracking', 'battery', 'maintenance-warranty', 'reports-analytics'],
    ),
    assetScope: { kind: 'hubs', hubs: ['Koramangala Hub', 'Peenya Corridor'] },
    builtIn: true,
  },
  {
    id: 'warranty-analyst',
    name: 'Warranty Analyst',
    description: 'Adjudicates claims and maintains warranty policy. Read-only on live telemetry.',
    clusters: ['asset-finance'],
    permissions: perms(
      ['maintenance-warranty', 'warranty-governance'],
      [
        'dashboard',
        'assets-registry',
        'battery',
        'battery-lifecycle',
        'asset-risk',
        'asset-valuation',
        'predictive-degradation',
        'reports-analytics',
      ],
    ),
    assetScope: { kind: 'all' },
    builtIn: true,
  },
  {
    id: 'credit-risk',
    name: 'Credit & Risk Officer',
    description: 'Owns the lease book, collections and residual value. No operational controls.',
    clusters: ['asset-finance'],
    permissions: perms(
      ['finance-leasing', 'collections-payments', 'asset-risk', 'asset-valuation'],
      [
        'dashboard',
        'assets-registry',
        'asset-tracking',
        'battery',
        'predictive-degradation',
        'reports-analytics',
        'organization-settings',
      ],
    ),
    assetScope: { kind: 'all' },
    builtIn: true,
  },
]

/** Where the workspace switcher lands when the current role cannot serve a cluster. */
export const DEFAULT_ROLE_BY_CLUSTER: Record<ClusterId, string> = {
  'fleet-mobility': 'ops-lead',
  'asset-finance': 'battery-ops',
}

export function getRole(id: string): Role {
  const role = ROLES.find((r) => r.id === id)
  if (!role) throw new Error(`Unknown role: ${id}`)
  return role
}

export function rolesForCluster(cluster: ClusterId): Role[] {
  return ROLES.filter((r) => r.clusters.includes(cluster))
}

export function permissionFor(role: Role, moduleId: ModuleId): PermissionLevel {
  return role.permissions[moduleId] ?? 'none'
}

export function canView(role: Role, moduleId: ModuleId): boolean {
  return permissionFor(role, moduleId) !== 'none'
}

export function canEdit(role: Role, moduleId: ModuleId): boolean {
  return permissionFor(role, moduleId) === 'edit'
}
