/**
 * Navigation rail.
 *
 * The item list is computed, not written down: a module appears only if the
 * active segment grants it (PRD module matrix) AND the active role can view it
 * (PRD RBAC). Switching either switcher in the top bar visibly changes this list.
 */

import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { NAV_GROUP_LABELS, type NavGroup, type PlatformModule } from '@/data/platform'
import { useWorkspace } from '@/state/WorkspaceContext'
import { Icon } from '@/components/primitives'

const GROUP_ORDER: NavGroup[] = ['core', 'workspace', 'intelligence', 'system']

function NavItem({ module, collapsed }: { module: PlatformModule; collapsed: boolean }) {
  const { permission } = useWorkspace()
  const level = permission(module.id)
  const alertCount = module.id === 'operational-alerts' ? 18 : null

  return (
    <NavLink
      to={module.route}
      title={collapsed ? module.name : `${module.name} — ${level} access`}
      className={({ isActive }) =>
        `font-body-sm text-body-sm relative flex items-center gap-space-sm rounded-xl px-space-sm py-2 transition-colors ${
          collapsed ? 'justify-center px-0' : ''
        } ${
          isActive
            ? 'bg-primary font-semibold text-on-primary shadow-level-1'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
        }`
      }
    >
      <Icon name={module.icon} className="shrink-0 text-[18px]" />
      {!collapsed && <span className="flex-1 truncate">{module.name}</span>}

      {!collapsed && alertCount !== null && (
        <span className="font-telemetry-sm rounded-pill bg-error-container px-1.5 py-0.5 text-[11px] font-bold text-on-error-container">
          {alertCount}
        </span>
      )}

      {/* View-only modules are marked so the permission model is legible at a glance. */}
      {!collapsed && level === 'view' && alertCount === null && (
        <Icon name="visibility" className="shrink-0 text-[14px] opacity-60" title="View only" />
      )}
    </NavLink>
  )
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { visibleModules, roleBlockedModules, segment, role } = useWorkspace()
  const [showBlocked, setShowBlocked] = useState(false)

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-30 flex flex-col justify-between overflow-y-auto overflow-x-hidden border-r border-outline-variant/30 bg-surface-container-lowest transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col gap-space-lg py-space-md">
        {GROUP_ORDER.map((group) => {
          const items = visibleModules.filter((m) => m.group === group)
          if (items.length === 0) return null

          const label =
            group === 'workspace'
              ? `Workspace: ${segment.name}`
              : NAV_GROUP_LABELS[group]

          return (
            <div key={group} className={collapsed ? 'px-2' : 'px-space-md'}>
              {label && !collapsed && (
                <div
                  className={`mb-space-xs flex items-center justify-between rounded px-space-sm py-1.5 ${
                    group === 'workspace' ? 'bg-surface-container-high/60' : 'bg-surface-container'
                  }`}
                >
                  <span
                    className={`font-label-sm text-label-sm truncate font-bold uppercase tracking-wider ${
                      group === 'workspace' ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {label}
                  </span>
                  {group === 'workspace' && <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-primary" />}
                </div>
              )}
              {label && collapsed && <div className="my-2 h-px bg-outline-variant/30" />}

              <nav className="space-y-1">
                {items.map((m) => (
                  <NavItem key={m.id} module={m} collapsed={collapsed} />
                ))}
              </nav>
            </div>
          )
        })}

        {/* Makes the RBAC gap explicit rather than silently hiding modules. */}
        {!collapsed && roleBlockedModules.length > 0 && (
          <div className="px-space-md">
            <button
              type="button"
              onClick={() => setShowBlocked((v) => !v)}
              className="font-label-sm text-label-sm flex w-full items-center gap-1.5 rounded-lg px-space-sm py-1.5 uppercase tracking-wider text-outline transition-colors hover:bg-surface-container hover:text-on-surface-variant"
            >
              <Icon name="lock" className="text-[14px]" />
              {roleBlockedModules.length} hidden by role
              <Icon name={showBlocked ? 'expand_less' : 'expand_more'} className="ml-auto text-[16px]" />
            </button>

            {showBlocked && (
              <ul className="mt-space-xs space-y-1 rounded-xl bg-surface-container-low p-space-sm">
                {roleBlockedModules.map((m) => (
                  <li
                    key={m.id}
                    className="font-body-sm text-body-sm flex items-center gap-space-sm text-outline line-through decoration-outline/40"
                  >
                    <Icon name={m.icon} className="text-[16px]" />
                    <span className="truncate">{m.name}</span>
                  </li>
                ))}
                <li className="font-body-sm text-body-sm pt-1 text-on-surface-variant no-underline">
                  Not granted to <span className="font-semibold">{role.name}</span>.
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      <div
        className={`flex flex-col gap-space-xs border-t border-outline-variant/30 bg-surface-container-low/50 ${
          collapsed ? 'p-2' : 'p-space-md'
        }`}
      >
        <div
          className="flex items-center justify-between rounded border border-outline-variant/40 bg-surface-container-lowest p-2"
          title={`${segment.tenant} — ${segment.tier}`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Icon name="verified" className="shrink-0 text-[18px] text-primary" />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-body-sm text-body-sm truncate font-semibold text-on-surface">
                  {segment.tenant}
                </span>
                <span className="font-label-sm text-label-sm font-bold uppercase text-primary">{segment.tier}</span>
              </div>
            )}
          </div>
          {!collapsed && <Icon name="unfold_more" className="text-[16px] text-on-surface-variant" />}
        </div>

        <div className={`flex items-center pt-space-xs ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <button
              type="button"
              className="font-body-sm text-body-sm flex items-center gap-1.5 text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <Icon name="contact_support" className="text-[16px]" />
              Support
            </button>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex items-center justify-center rounded-xl p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon
              name={collapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'}
              className="text-[18px]"
            />
          </button>
        </div>
      </div>
    </aside>
  )
}
