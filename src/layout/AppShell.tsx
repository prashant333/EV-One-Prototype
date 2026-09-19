/**
 * Telemetry shell architecture per DESIGN.md: collapsible navigation rail +
 * expansive flex canvas. Route content renders into the canvas via <Outlet/>.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { Icon } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { MODULES } from '@/data/platform'

/**
 * Keeps the open page and the active workspace in step.
 *
 * Every module has a route regardless of cluster, so switching from Fleet &
 * Mobility to Assets & Finance while sitting on, say, Schedule and Trips would
 * otherwise leave that screen rendered inside a workspace that does not grant
 * it. The same applies when a role change removes access to the current module.
 */
function useModuleGuard() {
  const { visibleModules } = useWorkspace()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Match the module owning this path, including its drill-down routes
    // (e.g. /battery-health/BAT-8821 belongs to the Battery Health module).
    const owner = MODULES.find((m) => pathname === m.route || pathname.startsWith(`${m.route}/`))
    if (!owner) return

    const permitted = visibleModules.some((m) => m.id === owner.id)
    // Never bounce away from the dashboard itself — that is the redirect target.
    if (!permitted && owner.id !== 'dashboard') {
      navigate('/dashboard', { replace: true })
    }
  }, [pathname, visibleModules, navigate])
}

export function AppShell() {
  useModuleGuard()

  /**
   * The rail starts collapsed and expands on hover. The chevron pins it open
   * for anyone who prefers the labels permanently visible.
   */
  const [collapsed, setCollapsed] = useState(true)
  /** Transient hover/focus expansion while the rail is pinned collapsed. */
  const [peeking, setPeeking] = useState(false)

  /**
   * Leaving the window never fires mouseleave, so a hover latched while
   * switching away would still be set on return. Clear it whenever the page is
   * backgrounded or the window loses focus.
   */
  useEffect(() => {
    const clear = () => setPeeking(false)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') clear()
    }
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const expanded = !collapsed || peeking
  // Expanding on hover floats over the canvas instead of pushing it, so the
  // page does not reflow every time the cursor crosses the rail.
  const overlay = collapsed && peeking

  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <Sidebar
        expanded={expanded}
        pinnedOpen={!collapsed}
        overlay={overlay}
        onToggle={() => setCollapsed((v) => !v)}
        onPeekChange={setPeeking}
      />
      {/* Padding follows the pinned width only — never the hover state. */}
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
