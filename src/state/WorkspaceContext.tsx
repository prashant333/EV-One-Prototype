/**
 * Global workspace state.
 *
 * This is where the PRD's core claim becomes real behaviour: the active
 * segment determines which modules exist (PRD module matrix), and the active
 * role determines what you can do in them (PRD RBAC). Every screen reads from
 * here rather than hard-coding its own visibility rules.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  getCluster,
  getSegment,
  modulesForSegment,
  type ClusterId,
  type ModuleId,
  type PlatformModule,
  type SegmentId,
} from '@/data/platform'
import {
  DEFAULT_ROLE_BY_CLUSTER,
  ROLES,
  canEdit,
  canView,
  getRole,
  permissionFor,
  rolesForCluster,
  type PermissionLevel,
  type Role,
} from '@/data/roles'
import { DEFAULT_KPIS } from '@/data/kpis'

interface ScopeFilters {
  region: string
  site: string
  timeWindow: string
}

interface WorkspaceValue {
  clusterId: ClusterId
  segmentId: SegmentId
  roleId: string
  role: Role
  segment: ReturnType<typeof getSegment>
  cluster: ReturnType<typeof getCluster>
  /** Modules visible given BOTH the segment matrix and the role's permissions. */
  visibleModules: PlatformModule[]
  /** Modules the segment grants but the role does not — used to explain gaps. */
  roleBlockedModules: PlatformModule[]
  scope: ScopeFilters
  selectedKpis: string[]
  /** Roles meaningful in the active workspace — drives the role switcher. */
  roles: Role[]
  /** Every role in the org, regardless of workspace. */
  allRoles: Role[]

  setSegment: (id: SegmentId) => void
  setRole: (id: string) => void
  setScope: (patch: Partial<ScopeFilters>) => void
  setSelectedKpis: (ids: string[]) => void

  can: (moduleId: ModuleId, level: PermissionLevel) => boolean
  permission: (moduleId: ModuleId) => PermissionLevel
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [segmentId, setSegmentId] = useState<SegmentId>('b2b-fleet')
  const [roleId, setRoleId] = useState<string>('ops-lead')
  const [scope, setScopeState] = useState<ScopeFilters>({
    region: 'Bengaluru Hub',
    site: 'All Sites',
    timeWindow: '24h',
  })
  const [selectedKpis, setSelectedKpis] = useState<string[]>(DEFAULT_KPIS['b2b-fleet'])

  const role = getRole(roleId)
  const segment = getSegment(segmentId)
  const cluster = getCluster(segment.cluster)

  /**
   * Switching segment swaps in that segment's default KPI set, and — if the
   * active role does not serve the target cluster — moves to that cluster's
   * default role. Without this, crossing into Assets & Finance as an Operations
   * Lead would leave every module hidden and the rail empty.
   */
  const setSegment = useCallback(
    (id: SegmentId) => {
      setSegmentId(id)
      setSelectedKpis(DEFAULT_KPIS[id])

      const targetCluster = getSegment(id).cluster
      setRoleId((current) => {
        const currentRole = getRole(current)
        return currentRole.clusters.includes(targetCluster)
          ? current
          : DEFAULT_ROLE_BY_CLUSTER[targetCluster]
      })
    },
    [],
  )

  const setScope = useCallback((patch: Partial<ScopeFilters>) => {
    setScopeState((prev) => ({ ...prev, ...patch }))
  }, [])

  const segmentModules = useMemo(() => modulesForSegment(segmentId), [segmentId])

  const visibleModules = useMemo(
    () => segmentModules.filter((m) => canView(role, m.id)),
    [segmentModules, role],
  )

  const roleBlockedModules = useMemo(
    () => segmentModules.filter((m) => !canView(role, m.id)),
    [segmentModules, role],
  )

  const can = useCallback(
    (moduleId: ModuleId, level: PermissionLevel) => {
      if (level === 'none') return true
      if (level === 'view') return canView(role, moduleId)
      return canEdit(role, moduleId)
    },
    [role],
  )

  const permission = useCallback((moduleId: ModuleId) => permissionFor(role, moduleId), [role])

  const value: WorkspaceValue = {
    clusterId: cluster.id,
    segmentId,
    roleId,
    role,
    segment,
    cluster,
    visibleModules,
    roleBlockedModules,
    scope,
    selectedKpis,
    roles: rolesForCluster(cluster.id),
    allRoles: ROLES,
    setSegment,
    setRole: setRoleId,
    setScope,
    setSelectedKpis,
    can,
    permission,
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used inside a WorkspaceProvider')
  return ctx
}
