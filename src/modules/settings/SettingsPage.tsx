/**
 * Organization & Settings — the RBAC surface.
 *
 * Makes the PRD's access-control section inspectable: the module matrix per
 * segment, and the permission grid per role. Changing the active role here has
 * the same effect as the top-bar switcher, so the consequences are visible
 * immediately in navigation.
 */

import { PageHeader } from '@/layout/AppShell'
import { Icon, Panel, PanelHeader, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { MODULES, SEGMENTS, type PlatformModule } from '@/data/platform'
import { permissionFor, type PermissionLevel } from '@/data/roles'
import { mapProviderStatus } from '@/components/MapView'

const LEVEL_STYLE: Record<PermissionLevel, string> = {
  edit: 'bg-state-ok-fill text-state-ok-text border-state-ok-border',
  view: 'bg-primary-fixed text-on-primary-fixed border-primary-fixed-dim',
  none: 'bg-surface-container text-outline border-outline-variant/40',
}

function PermissionCell({ level }: { level: PermissionLevel }) {
  return (
    <span
      className={`font-label-sm text-label-sm inline-flex min-w-[52px] justify-center rounded border px-1.5 py-0.5 uppercase ${LEVEL_STYLE[level]}`}
    >
      {level}
    </span>
  )
}

function ModuleMatrix() {
  const { segmentId } = useWorkspace()
  const clusterOneSegments = SEGMENTS.filter((s) => s.cluster === 'fleet-mobility')
  const gated = MODULES.filter((m) => m.segments !== null)

  return (
    <Panel padded={false}>
      <div className="p-space-lg pb-space-sm">
        <PanelHeader
          title="Cluster 1 module matrix"
          subtitle="Which modules each segment receives — PRD page 4. The active segment's column is highlighted."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="bg-surface">
              <th className="font-label-sm text-label-sm border-b border-outline-variant/40 px-space-lg py-space-sm text-left uppercase text-on-surface-variant">
                Module
              </th>
              {clusterOneSegments.map((s) => (
                <th
                  key={s.id}
                  className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm text-center uppercase ${
                    s.id === segmentId ? 'bg-primary-fixed/50 text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gated.map((m: PlatformModule) => (
              <tr key={m.id} className="border-b border-surface-container-high hover:bg-surface">
                <td className="font-body-sm text-body-sm px-space-lg py-space-sm">
                  <span className="flex items-center gap-space-sm">
                    <Icon name={m.icon} className="text-[16px] text-on-surface-variant" />
                    {m.name}
                  </span>
                </td>
                {clusterOneSegments.map((s) => {
                  const granted = m.segments!.includes(s.id)
                  return (
                    <td
                      key={s.id}
                      className={`px-space-md py-space-sm text-center ${s.id === segmentId ? 'bg-primary-fixed/30' : ''}`}
                    >
                      {granted ? (
                        <Icon name="check_circle" className="text-[18px] text-state-ok" />
                      ) : (
                        <Icon name="remove" className="text-[18px] text-outline" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function RoleMatrix() {
  const { roles, roleId, setRole } = useWorkspace()

  return (
    <Panel padded={false}>
      <div className="p-space-lg pb-space-sm">
        <PanelHeader
          title="Roles & module permissions"
          subtitle="Each module carries View and Edit permission. Select a role to apply it to this session."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="bg-surface">
              <th className="font-label-sm text-label-sm sticky left-0 z-10 border-b border-outline-variant/40 bg-surface px-space-lg py-space-sm text-left uppercase text-on-surface-variant">
                Module
              </th>
              {roles.map((r) => (
                <th
                  key={r.id}
                  className="border-b border-outline-variant/40 px-space-md py-space-sm text-center"
                >
                  <button
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`font-label-sm text-label-sm rounded-lg px-2 py-1 uppercase transition-colors ${
                      r.id === roleId
                        ? 'bg-primary font-bold text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {r.name}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m.id} className="border-b border-surface-container-high hover:bg-surface">
                <td className="font-body-sm text-body-sm sticky left-0 z-10 bg-surface-container-lowest px-space-lg py-space-sm">
                  <span className="flex items-center gap-space-sm">
                    <Icon name={m.icon} className="text-[16px] text-on-surface-variant" />
                    {m.name}
                  </span>
                </td>
                {roles.map((r) => (
                  <td
                    key={r.id}
                    className={`px-space-md py-space-sm text-center ${r.id === roleId ? 'bg-primary-fixed/30' : ''}`}
                  >
                    <PermissionCell level={permissionFor(r, m.id)} />
                  </td>
                ))}
              </tr>
            ))}

            <tr className="bg-surface">
              <td className="font-label-sm text-label-sm sticky left-0 z-10 bg-surface px-space-lg py-space-sm uppercase text-on-surface-variant">
                Asset scope
              </td>
              {roles.map((r) => (
                <td key={r.id} className="font-body-sm text-body-sm px-space-md py-space-sm text-center">
                  {r.assetScope.kind === 'all' ? (
                    <span className="text-on-surface-variant">Tenant-wide</span>
                  ) : (
                    <span className="font-semibold text-state-warn-text">
                      {r.assetScope.hubs?.join(', ')}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

export function SettingsPage() {
  const { role, segment, visibleModules, roleBlockedModules } = useWorkspace()

  return (
    <>
      <PageHeader title="Organization & Settings" breadcrumb="Organization & Settings" />

      <div className="mb-space-md grid grid-cols-1 gap-space-md lg:grid-cols-3">
        <Panel>
          <p className="font-label-sm text-label-sm uppercase text-outline">Active tenant</p>
          <p className="font-headline-sm text-headline-sm font-semibold text-on-surface">{segment.tenant}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {segment.name} · {segment.tier}
          </p>
        </Panel>

        <Panel>
          <p className="font-label-sm text-label-sm uppercase text-outline">Active role</p>
          <p className="font-headline-sm text-headline-sm font-semibold text-on-surface">{role.name}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {visibleModules.length} modules visible · {roleBlockedModules.length} hidden by role
          </p>
        </Panel>

        <Panel>
          <p className="font-label-sm text-label-sm uppercase text-outline">Map provider</p>
          <p className="font-headline-sm text-headline-sm font-semibold uppercase text-on-surface">
            {mapProviderStatus.active}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Configured: {mapProviderStatus.configured}
            {!mapProviderStatus.hasMapboxToken && ' · no key set, using free tiles'}
          </p>
        </Panel>
      </div>

      <div className="mb-space-md flex flex-wrap items-center gap-space-sm rounded-xl border border-primary-fixed-dim bg-primary-fixed/40 px-space-md py-space-sm">
        <Icon name="admin_panel_settings" className="text-[18px] text-primary" />
        <span className="font-body-sm text-body-sm text-on-surface">
          Role-based access control: permissions are defined per module, scoped per asset, and each module carries
          View and Edit levels.
        </span>
        <StatusBadge tone="info" className="ml-auto">
          PRD pages 3–4
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 gap-space-md">
        <ModuleMatrix />
        <RoleMatrix />
      </div>
    </>
  )
}
