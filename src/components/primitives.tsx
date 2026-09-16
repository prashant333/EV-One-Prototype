/** Shared UI primitives built to the DESIGN.md component spec. */

import type { ReactNode } from 'react'

export function Icon({
  name,
  className = '',
  title,
}: {
  name: string
  className?: string
  title?: string
}) {
  return (
    <span aria-hidden="true" title={title} className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  )
}

type BadgeTone = 'ok' | 'warn' | 'crit' | 'idle' | 'info'

const BADGE_TONES: Record<BadgeTone, string> = {
  // DESIGN.md "Status Badges & Operational Indicators"
  ok: 'bg-state-ok-fill text-state-ok-text border-state-ok-border',
  warn: 'bg-state-warn-fill text-state-warn-text border-state-warn-border',
  crit: 'bg-state-crit-fill text-state-crit-text border-state-crit-border',
  idle: 'bg-surface text-on-surface-variant border-outline-variant/60',
  info: 'bg-primary-fixed text-on-primary-fixed border-primary-fixed-dim',
}

export function StatusBadge({
  tone,
  children,
  pulse = false,
  className = '',
}: {
  tone: BadgeTone
  children: ReactNode
  pulse?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 font-label-sm text-label-sm uppercase whitespace-nowrap ${BADGE_TONES[tone]} ${className}`}
    >
      {pulse && (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-pill ${
            tone === 'ok'
              ? 'bg-state-ok animate-pulse'
              : tone === 'crit'
                ? 'bg-state-crit animate-pulse'
                : tone === 'warn'
                  ? 'bg-state-warn'
                  : 'bg-state-idle'
          }`}
        />
      )}
      {children}
    </span>
  )
}

/** Level 1 surface — explicit border, never a borderless floating white box. */
export function Panel({
  children,
  className = '',
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return <div className={`panel ${padded ? 'p-space-lg' : ''} ${className}`}>{children}</div>
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-space-md flex items-start justify-between gap-space-md">
      <div className="min-w-0">
        <h2 className="font-headline-sm text-headline-sm truncate font-semibold text-on-surface">{title}</h2>
        {subtitle && <p className="font-body-sm text-body-sm mt-0.5 text-on-surface-variant">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** Uppercase section label used above dense data regions. */
export function SectionLabel({ children, icon }: { children: ReactNode; icon?: string }) {
  return (
    <span className="font-label-sm text-label-sm flex items-center gap-1.5 font-bold uppercase tracking-wider text-on-surface-variant">
      {icon && <Icon name={icon} className="text-[16px] text-primary" />}
      {children}
    </span>
  )
}

/** Telemetry numerals — JetBrains Mono, tabular, per DESIGN.md. */
export function Metric({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-telemetry-md text-telemetry-md tnum ${className}`}>{children}</span>
}

export type ProgressTone = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'critical'

// Full class names, not interpolated — Tailwind only generates classes it can see as literals.
const PROGRESS_TONES: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-state-ok',
  neutral: 'bg-outline',
  critical: 'bg-state-crit',
}

export function ProgressBar({ value, tone = 'primary' }: { value: number; tone?: ProgressTone }) {
  return (
    <div className="mt-space-sm h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
      <div
        className={`h-full rounded-pill ${PROGRESS_TONES[tone]}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-space-sm px-space-lg py-space-2xl text-center">
      <Icon name={icon} className="text-[32px] text-outline" />
      <p className="font-headline-sm text-headline-sm text-on-surface">{title}</p>
      <p className="font-body-sm text-body-sm max-w-md text-on-surface-variant">{body}</p>
    </div>
  )
}
