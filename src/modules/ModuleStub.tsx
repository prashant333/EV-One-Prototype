/**
 * Placeholder for modules whose designs have not been delivered yet.
 *
 * Deliberately NOT an invented screen: it keeps the route, navigation, module
 * contract and permission state real so the IA is fully clickable, and states
 * plainly that the visual design is pending. Each new design drops into
 * src/modules/<module>/ and replaces this in the router.
 */

import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/layout/AppShell'
import { ActionButton } from '@/components/ActionButton'
import { Icon, Panel, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { getModule, type ModuleId } from '@/data/platform'

export function ModuleStub({ moduleId }: { moduleId: ModuleId }) {
  const module = getModule(moduleId)
  const { permission, segment, visibleModules } = useWorkspace()
  const level = permission(moduleId)
  const navigate = useNavigate()

  const grantedToSegment = module.segments === null || module.segments.includes(segment.id)
  const inNav = visibleModules.some((m) => m.id === moduleId)

  return (
    <>
      <PageHeader
        title={module.name}
        breadcrumb={module.name}
        actions={
          <ActionButton icon="arrow_back" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </ActionButton>
        }
      />

      <Panel className="mx-auto max-w-3xl">
        <div className="flex items-start gap-space-md">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-fixed">
            <Icon name={module.icon} className="text-[24px] text-primary" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="mb-space-xs flex flex-wrap items-center gap-space-sm">
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">{module.name}</h2>
              <StatusBadge tone="warn">Design Pending</StatusBadge>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant">{module.purpose}</p>

            <div className="mt-space-lg grid grid-cols-1 gap-space-sm sm:grid-cols-3">
              <div className="rounded-xl bg-surface-container-low p-space-sm">
                <p className="font-label-sm text-label-sm uppercase text-outline">Module ID</p>
                <p className="font-telemetry-md text-telemetry-md font-semibold">{module.id}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-space-sm">
                <p className="font-label-sm text-label-sm uppercase text-outline">Segment Access</p>
                <p className="font-telemetry-md text-telemetry-md font-semibold">
                  {module.segments === null ? 'Shared core' : `${module.segments.length} of 3 segments`}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-space-sm">
                <p className="font-label-sm text-label-sm uppercase text-outline">Your Permission</p>
                <p
                  className={`font-telemetry-md text-telemetry-md font-semibold uppercase ${
                    level === 'edit' ? 'text-state-ok' : level === 'view' ? 'text-secondary' : 'text-state-crit'
                  }`}
                >
                  {level}
                </p>
              </div>
            </div>

            {(!grantedToSegment || !inNav) && (
              <div className="mt-space-md rounded-xl border border-state-warn-border bg-state-warn-fill p-space-sm">
                <p className="font-body-sm text-body-sm text-state-warn-text">
                  {!grantedToSegment
                    ? `The PRD module matrix does not grant ${module.name} to ${segment.name}. This route is reachable directly but hidden from navigation.`
                    : `Your current role has no access to ${module.name}, so it is hidden from navigation.`}
                </p>
              </div>
            )}

            <p className="font-body-sm text-body-sm mt-space-lg text-outline">
              Route, navigation entry, segment gating and RBAC for this module are already wired. Drop the
              delivered design into <code className="font-telemetry-sm">src/modules/{module.id}/</code> and
              register it in the router to replace this placeholder.
            </p>
          </div>
        </div>
      </Panel>
    </>
  )
}
