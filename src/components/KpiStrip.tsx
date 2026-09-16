/**
 * The KPI strip and its customiser.
 *
 * The delivered dashboard design shows "ACTIVE FLEET METRICS (5 of 16 displayed)"
 * and a "Customize KPIs (5/16)" button, so the strip is genuinely configurable:
 * pick any five from the catalogue. Switching segment resets the selection to
 * that segment's defaults.
 */

import { useState } from 'react'
import { KPI_CATALOGUE, getKpi, type Kpi, type KpiTone } from '@/data/kpis'
import { useWorkspace } from '@/state/WorkspaceContext'
import { Icon, ProgressBar, SectionLabel, type ProgressTone } from './primitives'

const VALUE_TONES: Record<KpiTone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-state-ok',
  neutral: 'text-on-surface-variant',
  critical: 'text-state-crit',
}

const BADGE_TONES: Record<KpiTone, string> = {
  primary: 'text-primary',
  secondary: 'bg-secondary-fixed text-on-secondary-fixed px-1.5 py-0.5 rounded-lg',
  tertiary: 'text-state-ok',
  neutral: 'text-on-surface-variant',
  critical: 'text-state-crit',
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="panel flex flex-col justify-between p-space-md transition-shadow hover:shadow-level-2">
      <div className="mb-space-xs flex items-center justify-between">
        <span className="font-label-sm text-label-sm font-semibold uppercase text-outline">{kpi.label}</span>
        <Icon name={kpi.icon} className={`text-[20px] ${VALUE_TONES[kpi.tone]}`} />
      </div>

      <div className="flex items-baseline gap-space-xs">
        <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">{kpi.value}</span>
        {kpi.badge && (
          <span
            className={`font-label-sm text-label-sm font-semibold ${BADGE_TONES[kpi.badgeTone ?? 'neutral']}`}
          >
            {kpi.badge}
          </span>
        )}
      </div>

      <div className="font-body-sm text-body-sm mt-space-sm flex items-center justify-between gap-space-sm">
        <span className="truncate text-outline">{kpi.footLabel}</span>
        <span
          className={`font-telemetry-sm text-telemetry-sm tnum shrink-0 font-semibold ${VALUE_TONES[kpi.footTone ?? 'neutral']}`}
        >
          {kpi.footValue}
        </span>
      </div>

      {kpi.progress !== undefined && <ProgressBar value={kpi.progress} tone={kpi.tone as ProgressTone} />}
    </div>
  )
}

export function KpiStrip({
  label = 'Active Fleet Metrics',
  kpiIds,
  customisable = true,
}: {
  label?: string
  kpiIds?: string[]
  customisable?: boolean
}) {
  const { selectedKpis, setSelectedKpis } = useWorkspace()
  const [open, setOpen] = useState(false)

  const active = kpiIds ?? selectedKpis
  const cards = active.map(getKpi).filter((k): k is Kpi => Boolean(k))

  function toggle(id: string) {
    if (selectedKpis.includes(id)) {
      setSelectedKpis(selectedKpis.filter((k) => k !== id))
    } else if (selectedKpis.length < 5) {
      setSelectedKpis([...selectedKpis, id])
    }
  }

  return (
    <section>
      <div className="mb-space-sm flex flex-col gap-space-sm border-b border-outline-variant/30 pb-space-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-space-sm">
          <SectionLabel icon="monitoring">
            {label}{' '}
            <span className="font-normal text-outline">
              ({cards.length} of {KPI_CATALOGUE.length} displayed)
            </span>
          </SectionLabel>
          <span className="font-telemetry-sm text-telemetry-sm flex items-center gap-1 rounded-pill bg-surface-container px-2 py-0.5 text-on-surface-variant">
            <span className="h-1.5 w-1.5 animate-pulse rounded-pill bg-state-ok" />
            Auto-refresh: 1s
          </span>
        </div>

        {customisable && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="font-body-sm text-body-sm inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 font-semibold text-on-primary shadow-level-1 transition-all hover:bg-primary-container"
          >
            <Icon name="tune" className="text-[16px]" />
            Customize KPIs ({selectedKpis.length}/{KPI_CATALOGUE.length})
          </button>
        )}
      </div>

      {open && (
        <div className="panel mb-space-md p-space-lg shadow-level-3">
          <div className="mb-space-md flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold">Customize KPI strip</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Select up to 5 metrics. Switching workspace segment restores that segment's defaults.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container"
              aria-label="Close KPI customizer"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 lg:grid-cols-4">
            {KPI_CATALOGUE.map((kpi) => {
              const checked = selectedKpis.includes(kpi.id)
              const atLimit = !checked && selectedKpis.length >= 5
              return (
                <label
                  key={kpi.id}
                  className={`flex items-center gap-space-sm rounded-xl border p-space-sm transition-colors ${
                    checked
                      ? 'border-primary bg-primary-fixed/40'
                      : atLimit
                        ? 'cursor-not-allowed border-outline-variant/40 opacity-50'
                        : 'cursor-pointer border-outline-variant/40 hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={atLimit}
                    onChange={() => toggle(kpi.id)}
                    className="h-4 w-4 shrink-0 rounded border-outline-variant text-primary accent-primary"
                  />
                  <Icon name={kpi.icon} className="text-[18px] shrink-0 text-on-surface-variant" />
                  <span className="font-body-sm text-body-sm truncate">{kpi.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      <div className="mb-space-lg grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  )
}
