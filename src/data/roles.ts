/**
 * RBAC model — PRD pages 3-4.
 *
 *   1. Create a user role and define permission at individual module level.
 *   2. This access can be given per asset as well.
 *   3. Each module has View and Edit permission allowing users to do only
 *      assigned activity as per the role.
 */

import type { ModuleId } from './platform'

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
  /** Modules omitted here resolve to 'none' — invisible in navigation. */
  permissions: Partial<Record<ModuleId, PermissionLevel>>
  /** PRD: "This access can be given per asset as well." */
  assetScope: AssetScope
  /** Roles shipped with the platform cannot be deleted in the prototype. */
  builtIn: boolean
}

const ALL_EDIT: Partial<Record<ModuleId, PermissionLevel>> = {
  dashboard: 'edit',
  'assets-registry': 'edit',
  'live-tracking': 'edit',
  'vehicles-trips': 'edit',
  battery: 'edit',
  'operational-alerts': 'edit',
  maintenance: 'edit',
  geofences: 'edit',
  'routes-corridors': 'edit',
  'charging-sessions': 'edit',
  'driver-analytics': 'edit',
  'vehicle-telemetry': 'edit',
  fota: 'edit',
  'asset-intelligence': 'edit',
  'reports-analytics': 'edit',
  'integrations-apis': 'edit',
  'organization-settings': 'edit',
}

export const ROLES: Role[] = [
  {
    id: 'org-admin',
    name: 'Org Admin',
    description: 'Full control across every module, including RBAC and integrations.',
    permissions: ALL_EDIT,
    assetScope: { kind: 'all' },
    builtIn: true,
  },
  {
    id: 'ops-lead',
    name: 'Operations Lead',
    description: 'Runs day-to-day fleet operations. Cannot change org settings or integrations.',
    permissions: {
      dashboard: 'edit',
      'assets-registry': 'edit',
      'live-tracking': 'edit',
      'vehicles-trips': 'edit',
      battery: 'view',
      'operational-alerts': 'edit',
      maintenance: 'edit',
      geofences: 'edit',
      'routes-corridors': 'edit',
      'charging-sessions': 'view',
      'driver-analytics': 'edit',
      'vehicle-telemetry': 'view',
      fota: 'view',
      'asset-intelligence': 'view',
      'reports-analytics': 'view',
      'integrations-apis': 'none',
      'organization-settings': 'view',
    },
    assetScope: { kind: 'all' },
    builtIn: true,
  },
  {
    id: 'hub-supervisor',
    name: 'Hub Supervisor',
    description:
      'Dispatch and driver management for assigned hubs only. Demonstrates per-asset scoping.',
    permissions: {
      dashboard: 'view',
      'assets-registry': 'view',
      'live-tracking': 'view',
      'vehicles-trips': 'edit',
      battery: 'view',
      'operational-alerts': 'edit',
      maintenance: 'view',
      geofences: 'view',
      'routes-corridors': 'view',
      'charging-sessions': 'view',
      'driver-analytics': 'edit',
      'vehicle-telemetry': 'none',
      fota: 'none',
      'asset-intelligence': 'none',
      'reports-analytics': 'view',
      'integrations-apis': 'none',
      'organization-settings': 'none',
    },
    // PRD: access can be given per asset — this role is scoped to two hubs
    assetScope: { kind: 'hubs', hubs: ['Koramangala Hub', 'Peenya Corridor'] },
    builtIn: true,
  },
  {
    id: 'maintenance-tech',
    name: 'Maintenance Technician',
    description: 'Services vehicles. Sees health and telemetry, edits only work orders.',
    permissions: {
      dashboard: 'view',
      'assets-registry': 'view',
      'live-tracking': 'view',
      'vehicles-trips': 'view',
      battery: 'view',
      'operational-alerts': 'view',
      maintenance: 'edit',
      'charging-sessions': 'view',
      'vehicle-telemetry': 'view',
      fota: 'view',
      'reports-analytics': 'none',
      'organization-settings': 'none',
    },
    assetScope: { kind: 'all' },
    builtIn: true,
  },
  {
    id: 'read-only-auditor',
    name: 'Read-only Auditor',
    description: 'View everything, change nothing. Every Edit action is disabled.',
    permissions: {
      dashboard: 'view',
      'assets-registry': 'view',
      'live-tracking': 'view',
      'vehicles-trips': 'view',
      battery: 'view',
      'operational-alerts': 'view',
      maintenance: 'view',
      geofences: 'view',
      'routes-corridors': 'view',
      'charging-sessions': 'view',
      'driver-analytics': 'view',
      'vehicle-telemetry': 'view',
      fota: 'view',
      'asset-intelligence': 'view',
      'reports-analytics': 'view',
      'integrations-apis': 'view',
      'organization-settings': 'view',
    },
    assetScope: { kind: 'all' },
    builtIn: true,
  },
]

export function getRole(id: string): Role {
  const role = ROLES.find((r) => r.id === id)
  if (!role) throw new Error(`Unknown role: ${id}`)
  return role
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
