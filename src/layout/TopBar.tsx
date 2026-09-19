/**
 * Global top bar: brand, workspace/segment switcher, scope filters, search,
 * and the role switcher that drives RBAC across the app.
 */

import { useEffect, useRef, useState } from 'react'
import { CLUSTERS, SEGMENTS, type SegmentId } from '@/data/platform'
import { useWorkspace } from '@/state/WorkspaceContext'
import { Icon } from '@/components/primitives'
import { BrandLogo } from '@/components/BrandLogo'

function useDismissOnOutsideClick(onDismiss: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onDismiss])
  return ref
}

function ScopeFilter({
  label,
  value,
  options,
  onChange,
  mono = false,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  mono?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useDismissOnOutsideClick(() => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-1 py-0.5 hover:text-on-surface"
      >
        <span className="font-label-sm text-label-sm font-semibold uppercase text-outline">{label}:</span>
        <span className={mono ? 'font-telemetry-sm text-telemetry-sm font-medium text-primary' : ''}>{value}</span>
        <Icon name="arrow_drop_down" className="text-[14px]" />
      </button>

      {open && (
        <div className="panel absolute left-0 top-full z-50 mt-1 min-w-[180px] p-1 shadow-level-3">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`font-body-sm text-body-sm flex w-full items-center justify-between rounded-lg px-space-sm py-1.5 text-left hover:bg-surface-container ${
                opt === value ? 'font-semibold text-primary' : 'text-on-surface'
              }`}
            >
              {opt}
              {opt === value && <Icon name="check" className="text-[16px]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function WorkspaceSwitcher() {
  const { segment, cluster, setSegment } = useWorkspace()
  const [open, setOpen] = useState(false)
  const ref = useDismissOnOutsideClick(() => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-space-sm rounded-xl bg-surface-container-low px-space-sm py-1.5 text-left transition-colors hover:bg-surface-container"
      >
        <span className="h-2 w-2 shrink-0 rounded-pill bg-primary" />
        <span className="flex flex-col leading-tight">
          <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
            Workspace
          </span>
          <span className="font-headline-sm text-headline-sm flex items-center gap-1 text-on-surface">
            {cluster.name}
            <Icon name="expand_more" className="text-[16px] text-on-surface-variant" />
          </span>
        </span>
      </button>

      {open && (
        <div className="panel absolute left-0 top-full z-50 mt-1 w-[360px] p-space-sm shadow-level-3">
          {/* <p className="font-label-sm text-label-sm px-space-sm py-1 font-bold uppercase tracking-wider text-outline">
            One platform · two experience clusters
          </p> */}

          {CLUSTERS.map((c) => (
            <div key={c.id} className="mt-space-xs">
              <div className="flex items-center justify-between px-space-sm py-1">
                <span className="font-body-sm text-body-sm font-semibold text-on-surface">{c.name}</span>
                {!c.available && (
                  <span className="font-label-sm text-label-sm rounded-lg bg-surface-container px-1.5 py-0.5 uppercase text-outline">
                    Workspace 2 · Placeholder
                  </span>
                )}
              </div>

              {c.segments.map((sid) => {
                const s = SEGMENTS.find((x) => x.id === sid)!
                const isActive = s.id === segment.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!c.available}
                    onClick={() => {
                      setSegment(s.id as SegmentId)
                      setOpen(false)
                    }}
                    className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-space-sm py-space-sm text-left transition-colors ${
                      !c.available
                        ? 'cursor-not-allowed opacity-45'
                        : isActive
                          ? 'bg-primary-fixed/50'
                          : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="flex w-full items-center justify-between">
                      <span className="font-body-md text-body-md font-semibold text-on-surface">{s.name}</span>
                      {isActive && <Icon name="check_circle" className="text-[16px] text-primary" />}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{s.businessQuestion}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RoleSwitcher() {
  const { role, roles, setRole } = useWorkspace()
  const [open, setOpen] = useState(false)
  const ref = useDismissOnOutsideClick(() => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-space-sm rounded-xl px-space-sm py-1 transition-colors hover:bg-surface-container-low"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-primary">
          <Icon name="person" className="text-[18px] text-on-primary" />
        </span>
        <span className="hidden flex-col leading-tight lg:flex">
          <span className="font-body-sm text-body-sm font-semibold text-on-surface">Signed in as</span>
          <span className="font-label-sm text-label-sm text-primary">{role.name}</span>
        </span>
        <Icon name="expand_more" className="text-[16px] text-on-surface-variant" />
      </button>

      {open && (
        <div className="panel absolute right-0 top-full z-50 mt-1 w-[340px] p-space-sm shadow-level-3">
          <p className="font-label-sm text-label-sm px-space-sm py-1 font-bold uppercase tracking-wider text-outline">
            Switch role · RBAC demo
          </p>
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setRole(r.id)
                setOpen(false)
              }}
              className={`flex w-full flex-col items-start gap-0.5 rounded-lg px-space-sm py-space-sm text-left transition-colors ${
                r.id === role.id ? 'bg-primary-fixed/50' : 'hover:bg-surface-container-low'
              }`}
            >
              <span className="flex w-full items-center justify-between">
                <span className="font-body-md text-body-md font-semibold text-on-surface">{r.name}</span>
                {r.id === role.id && <Icon name="check_circle" className="text-[16px] text-primary" />}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{r.description}</span>
              {r.assetScope.kind === 'hubs' && (
                <span className="font-label-sm text-label-sm mt-1 inline-flex items-center gap-1 rounded-lg bg-surface-container px-1.5 py-0.5 uppercase text-on-surface-variant">
                  <Icon name="lock" className="text-[12px]" />
                  Scoped to {r.assetScope.hubs?.length} hubs
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function TopBar() {
  const { scope, setScope } = useWorkspace()

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-space-md border-b border-outline-variant/30 bg-surface-container-lowest px-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex shrink-0 items-center gap-space-md">
        <BrandLogo />

        <span className="mx-space-2xs h-6 w-px bg-outline-variant/50" />
        <WorkspaceSwitcher />
      </div>

      <div className="mx-space-md flex max-w-4xl flex-1 items-center gap-space-sm">
        <div className="font-body-sm text-body-sm hidden shrink-0 items-center gap-space-xs rounded-xl border border-outline-variant/40 bg-surface-container-low px-space-sm py-1 text-on-surface-variant xl:flex">
          <ScopeFilter
            label="Reg"
            value={scope.region}
            options={['Bengaluru Hub', 'Pune Cluster', 'NCR Region', 'All Regions']}
            onChange={(region) => setScope({ region })}
          />
          <span className="h-3 w-px bg-outline-variant/60" />
          <ScopeFilter
            label="Site"
            value={scope.site}
            options={['All Sites', 'Koramangala Hub', 'Peenya Corridor', 'Airport Arterial', 'Whitefield Ring']}
            onChange={(site) => setScope({ site })}
          />
          <span className="h-3 w-px bg-outline-variant/60" />
          <ScopeFilter
            label="Time"
            value={scope.timeWindow}
            options={['1h', '24h', '7d', '30d']}
            onChange={(timeWindow) => setScope({ timeWindow })}
            mono
          />
        </div>

        <div className="relative min-w-[200px] flex-1">
          <Icon
            name="search"
            className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[18px] text-outline"
          />
          <input
            type="text"
            placeholder="Search vehicle ID, battery ID, VIN, station, driver (e.g. BAT-4587)..."
            className="font-body-sm text-body-sm h-9 w-full rounded-xl border border-outline-variant/40 bg-surface-container-low pl-9 pr-12 text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="font-telemetry-sm text-telemetry-sm absolute right-space-sm top-1/2 hidden -translate-y-1/2 rounded border border-outline-variant/60 bg-surface-container px-1.5 py-0.5 text-on-surface-variant sm:block">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-space-sm">
        <button
          type="button"
          aria-label="Alerts"
          className="relative rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
        >
          <Icon name="notifications" className="text-[20px]" />
          <span className="font-telemetry-sm absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-pill bg-error px-1 text-[10px] font-bold text-on-error">
            18
          </span>
        </button>
        <span className="h-6 w-px bg-outline-variant/50" />
        <RoleSwitcher />
      </div>
    </header>
  )
}
