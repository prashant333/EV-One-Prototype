/**
 * Telemetry shell architecture per DESIGN.md: collapsible navigation rail +
 * expansive flex canvas. Route content renders into the canvas via <Outlet/>.
 */

import { useState, type ReactNode } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { Icon } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className={`transition-all duration-300 ${collapsed ? 'pl-16' : 'pl-64'}`}>
        <main className="min-h-screen w-full px-space-md pb-space-2xl pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** Breadcrumb + title + action row shared by every module screen. */
export function PageHeader({
  title,
  breadcrumb,
  live,
  liveLabel = 'Synced 1s ago',
  actions,
}: {
  title: string
  breadcrumb: string
  live?: boolean
  liveLabel?: string
  actions?: ReactNode
}) {
  const { cluster } = useWorkspace()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-space-md py-space-md lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-space-2xs">
        <nav className="font-label-sm text-label-sm flex items-center gap-space-xs uppercase tracking-wider text-on-surface-variant">
          <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-on-surface">
            Workspaces
          </button>
          <Icon name="chevron_right" className="text-[14px]" />
          <span>{cluster.name}</span>
          <Icon name="chevron_right" className="text-[14px]" />
          <span className="font-bold text-primary">{breadcrumb}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-space-md">
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">{title}</h1>
          {live && (
            <span className="font-label-sm text-label-sm flex items-center gap-space-xs rounded-pill bg-state-ok-fill px-2.5 py-1 font-semibold uppercase text-state-ok-text">
              <span className="h-1.5 w-1.5 animate-pulse rounded-pill bg-state-ok" />
              {liveLabel}
            </span>
          )}
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2 lg:shrink-0">{actions}</div>}
    </div>
  )
}
