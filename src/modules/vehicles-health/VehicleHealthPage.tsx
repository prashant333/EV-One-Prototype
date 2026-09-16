/**
 * Vehicles and Health — fleet roster.
 * Built to match Design/intellicar_one_ev_platform-vehicle_and_health/vehicle_list_Intellicar_one.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/layout/AppShell'
import { ActionButton } from '@/components/ActionButton'
import { EmptyState, Icon, Panel, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import {
  HUBS,
  VEHICLES,
  getDriver,
  scopeToHubs,
  type FirmwareStatus,
  type HealthGrade,
  type Subsystem,
  type Vehicle,
} from '@/data/fleet'
import {
  ACTIVE_ROLLOUT,
  FOTA_FILTERS,
  HEALTH_KPIS,
  SUBSYSTEM_FILTERS,
  type HealthKpi,
} from '@/data/health'

const ROWS_PER_PAGE = 8

const TONE_TEXT = {
  ok: 'text-state-ok',
  warn: 'text-state-warn',
  crit: 'text-state-crit',
  neutral: 'text-on-surface-variant',
  primary: 'text-primary',
} as const

const TONE_BAR = {
  ok: 'bg-state-ok',
  warn: 'bg-state-warn',
  crit: 'bg-state-crit',
  primary: 'bg-primary',
} as const

function HealthKpiCard({ kpi }: { kpi: HealthKpi }) {
  return (
    <div className="panel flex flex-col p-space-md">
      <div className="mb-space-xs flex items-start justify-between gap-space-sm">
        <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">
          {kpi.label}
        </span>
        <Icon name={kpi.icon} className={`text-[20px] ${TONE_TEXT[kpi.captionTone]}`} />
      </div>

      <div className="flex items-baseline gap-space-xs">
        <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">{kpi.value}</span>
        {kpi.unit && <span className="font-body-sm text-body-sm text-on-surface-variant">{kpi.unit}</span>}
      </div>

      <p className={`font-body-sm text-body-sm mt-0.5 ${TONE_TEXT[kpi.captionTone]}`}>{kpi.caption}</p>

      <div className="mt-space-sm h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
        <div className={`h-full rounded-pill ${TONE_BAR[kpi.progressTone]}`} style={{ width: `${kpi.progress}%` }} />
      </div>

      <p className="font-body-sm text-body-sm mt-space-xs text-on-surface-variant">{kpi.footnote}</p>
    </div>
  )
}

function RolloutBanner() {
  const r = ACTIVE_ROLLOUT
  return (
    <Panel className="mb-space-md">
      <div className="flex flex-col gap-space-md xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-space-md">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed">
            <Icon name="browser_updated" className="text-[22px] text-primary" />
          </span>

          <div className="min-w-0">
            <div className="mb-space-xs flex flex-wrap items-center gap-space-sm">
              <span className="font-label-sm text-label-sm rounded bg-primary px-2 py-0.5 font-bold uppercase tracking-wider text-on-primary">
                Active Rollout Batch
              </span>
              <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                Release: {r.release}
              </span>
              <StatusBadge tone="ok" pulse>
                {r.failSafe}
              </StatusBadge>
            </div>

            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {r.title} {r.campaignId}
            </h2>

            <p className="font-body-sm text-body-sm mt-0.5 flex flex-wrap items-center gap-space-sm text-on-surface-variant">
              <span>
                <strong className="text-on-surface">Target:</strong> {r.target}
              </span>
              <span className="text-outline">•</span>
              <span>
                CAN Arbitration:{' '}
                <code className="font-telemetry-sm rounded bg-surface-container px-1.5 py-0.5">
                  {r.canArbitration}
                </code>
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-space-sm sm:flex-row sm:items-center">
          <div className="min-w-[220px]">
            <div className="font-label-sm text-label-sm mb-1 flex items-center justify-between uppercase tracking-wider">
              <span className="text-on-surface-variant">Progress</span>
              <span className="font-telemetry-sm text-telemetry-sm font-bold text-primary">
                {r.progressPct}% Complete
              </span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-pill bg-surface-container-high">
              <div className="h-full bg-primary" style={{ width: `${r.progressPct}%` }} />
              <div className="h-full bg-state-crit" style={{ width: '4%' }} />
            </div>
            <p className="font-telemetry-sm text-telemetry-sm mt-1 flex flex-wrap gap-space-sm text-on-surface-variant">
              <span>
                <strong className="text-on-surface">{r.flashed.toLocaleString()}</strong> Flashed
              </span>
              <span>
                <strong className="text-on-surface">{r.staged}</strong> Staged
              </span>
              <span>
                <strong className="text-on-surface">{r.scheduled}</strong> Scheduled
              </span>
            </p>
          </div>

          <div className="flex items-center gap-space-xs">
            <ActionButton icon="pause_circle" module="fota" size="compact">
              Pause
            </ActionButton>
            <ActionButton icon="history" module="fota" size="compact">
              Rollback
            </ActionButton>
            <span className="font-body-sm text-body-sm inline-flex h-9 items-center gap-1.5 rounded-xl border border-state-crit-border bg-state-crit-fill px-space-md font-semibold text-state-crit-text">
              <Icon name="warning" className="text-[16px]" />
              Failed ({r.failed})
            </span>
          </div>
        </div>
      </div>
    </Panel>
  )
}

function GradeBadge({ grade, score }: { grade: HealthGrade; score: number }) {
  const map = {
    A: { tone: 'ok' as const, label: 'Grade A' },
    B: { tone: 'info' as const, label: 'Grade B' },
    C: { tone: 'crit' as const, label: 'Grade C (Critical)' },
  }
  const { tone, label } = map[grade]
  return (
    <span className="flex flex-col items-start gap-0.5">
      <StatusBadge tone={tone}>{label}</StatusBadge>
      <span className="font-telemetry-sm text-telemetry-sm tnum text-on-surface-variant">({score}%)</span>
    </span>
  )
}

function FirmwareCell({ vehicle }: { vehicle: Vehicle }) {
  const { firmwareVersion: v, firmwareStatus: s } = vehicle
  if (s === 'flashing') {
    return (
      <div>
        <p className="font-telemetry-sm text-telemetry-sm font-semibold text-secondary">{v}</p>
        <p className="font-telemetry-sm text-telemetry-sm text-secondary">Flashing</p>
        <div className="mt-1 h-1 w-20 overflow-hidden rounded-pill bg-surface-container-high">
          <div className="h-full w-2/3 rounded-pill bg-secondary" />
        </div>
      </div>
    )
  }
  if (s === 'queued') {
    return (
      <div>
        <p className="font-telemetry-sm text-telemetry-sm text-on-surface">{v}</p>
        <p className="font-telemetry-sm text-telemetry-sm flex items-center gap-1 text-primary">
          <Icon name="schedule" className="text-[12px]" />
          Queued v4.2.1
        </p>
      </div>
    )
  }
  if (s === 'update-required') {
    return (
      <div>
        <p className="font-telemetry-sm text-telemetry-sm text-on-surface">{v}</p>
        <p className="font-telemetry-sm text-telemetry-sm flex items-center gap-1 text-state-warn-text">
          <Icon name="error" className="text-[12px]" />
          Update Required
        </p>
      </div>
    )
  }
  return (
    <div>
      <p className="font-telemetry-sm text-telemetry-sm text-on-surface">{v}</p>
      <p className="font-telemetry-sm text-telemetry-sm flex items-center gap-1 text-state-ok">
        <Icon name="check_circle" className="text-[12px]" />
        Up to date
      </p>
    </div>
  )
}

export function VehicleHealthPage() {
  const navigate = useNavigate()
  const { role, segment } = useWorkspace()

  const [grade, setGrade] = useState<'all' | HealthGrade>('all')
  const [subsystem, setSubsystem] = useState<Subsystem | 'all'>('all')
  const [fota, setFota] = useState<FirmwareStatus | 'all'>('all')
  const [hub, setHub] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  // PRD: role asset scoping applies before any screen filter.
  const scoped = useMemo(() => scopeToHubs(VEHICLES, role.assetScope.hubs), [role])

  const counts = useMemo(
    () => ({
      all: scoped.length,
      A: scoped.filter((v) => v.healthGrade === 'A').length,
      B: scoped.filter((v) => v.healthGrade === 'B').length,
      C: scoped.filter((v) => v.healthGrade === 'C').length,
    }),
    [scoped],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((v) => {
      if (grade !== 'all' && v.healthGrade !== grade) return false
      if (hub !== 'all' && v.hub !== hub) return false
      if (fota !== 'all' && v.firmwareStatus !== fota) return false
      if (subsystem !== 'all' && !v.dtcs.some((d) => d.subsystem === subsystem)) return false
      if (q) {
        const driver = getDriver(v.driverId)?.name ?? ''
        if (!`${v.registration} ${v.vin} ${v.model} ${driver}`.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [scoped, grade, hub, fota, subsystem, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage = Math.min(page, pageCount - 1)
  const rows = filtered.slice(safePage * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE + ROWS_PER_PAGE)

  /** Any filter change returns to page 1 — otherwise you land on an empty page. */
  function update<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(0)
    }
  }

  const tabs = [
    { id: 'all' as const, label: 'All Fleet', count: counts.all, dot: false },
    { id: 'A' as const, label: 'Grade A Healthy', count: counts.A, dot: false },
    { id: 'B' as const, label: 'Grade B Watch', count: counts.B, dot: false },
    { id: 'C' as const, label: 'Grade C Critical', count: counts.C, dot: true },
  ]

  return (
    <>
      <PageHeader
        title="Vehicle Health"
        breadcrumb="Vehicle & Health"
        actions={
          <>
            <ActionButton
              icon="warning"
              module="vehicle-telemetry"
              requires="view"
              onClick={() => update(setGrade)('C')}
            >
              Filter Fault DTCs ({counts.C})
            </ActionButton>
            <ActionButton icon="download" module="reports-analytics" requires="view">
              Export Diagnostic Report
            </ActionButton>
            <ActionButton icon="browser_updated" variant="primary" module="fota">
              New FOTA Campaign
            </ActionButton>
            <ActionButton icon="my_location" variant="primary" module="vehicle-telemetry">
              Trigger Remote Diagnostics
            </ActionButton>
          </>
        }
      />

      <div className="mb-space-md flex flex-wrap items-center gap-space-sm">
        <StatusBadge tone="ok" pulse>
          Fleet CAN Ingestion Synced (1s refresh)
        </StatusBadge>
        {role.assetScope.kind === 'hubs' && (
          <StatusBadge tone="warn">
            <Icon name="lock" className="text-[12px]" />
            Scoped to {role.assetScope.hubs?.join(', ')}
          </StatusBadge>
        )}
        <span className="font-body-sm text-body-sm ml-auto text-on-surface-variant">{segment.name}</span>
      </div>

      <div className="mb-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-5">
        {HEALTH_KPIS.map((kpi) => (
          <HealthKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <RolloutBanner />

      <Panel padded={false}>
        <div className="flex flex-col gap-space-md p-space-lg pb-space-sm xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-space-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-fixed">
              <Icon name="health_and_safety" className="text-[20px] text-primary" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-space-sm">
                <h2 className="font-headline-sm text-headline-sm font-semibold">
                  Fleet Health & Diagnostics Master Roster
                </h2>
                <StatusBadge tone="ok" pulse>
                  {scoped.length.toLocaleString()} In Synchronized Polling
                </StatusBadge>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Real-time CAN bus telemetry, DTC triage, thermal profiles, and FOTA firmware distribution
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <ActionButton icon="sync" module="vehicle-telemetry" size="compact">
              Force Rescan CAN
            </ActionButton>
            <ActionButton icon="download" module="reports-analytics" requires="view" size="compact">
              Export Diagnostic Report
            </ActionButton>
            <ActionButton icon="browser_updated" variant="primary" module="fota" size="compact">
              Batch FOTA Push
            </ActionButton>
          </div>
        </div>

        <div className="flex flex-col gap-space-sm px-space-lg pb-space-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-space-xs rounded-xl bg-surface-container-low p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => update(setGrade)(t.id)}
                className={`font-body-sm text-body-sm flex items-center gap-1.5 whitespace-nowrap rounded-lg px-space-md py-1.5 transition-colors ${
                  grade === t.id
                    ? 'bg-surface-container-lowest font-semibold text-primary shadow-level-1'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.dot && <span className="h-1.5 w-1.5 rounded-pill bg-state-crit" />}
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <select
              value={subsystem}
              onChange={(e) => update(setSubsystem)(e.target.value as Subsystem | 'all')}
              className="font-body-sm text-body-sm h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {SUBSYSTEM_FILTERS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={fota}
              onChange={(e) => update(setFota)(e.target.value as FirmwareStatus | 'all')}
              className="font-body-sm text-body-sm h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {FOTA_FILTERS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={hub}
              onChange={(e) => update(setHub)(e.target.value)}
              className="font-body-sm text-body-sm h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Hubs</option>
              {HUBS.map((h) => (
                <option key={h.id} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>

            <div className="relative min-w-[220px]">
              <Icon
                name="search"
                className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[16px] text-outline"
              />
              <input
                value={query}
                onChange={(e) => update(setQuery)(e.target.value)}
                placeholder="Filter Reg, VIN, Model, Driver..."
                className="font-body-sm text-body-sm h-9 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-8 pr-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {[
                  'Vehicle / VIN',
                  'Model & Fleet Type',
                  'Assigned Driver & Hub',
                  'Overall Health',
                  'Active DTCs',
                  'Battery SoC & ΔV',
                  'Motor & Inverter',
                  'Firmware / FOTA',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm uppercase text-on-surface-variant ${
                      ['Battery SoC & ΔV', 'Motor & Inverter'].includes(h)
                        ? 'text-right'
                        : h === 'Actions'
                          ? 'text-right'
                          : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((v) => {
                const driver = getDriver(v.driverId)
                const critical = v.healthGrade === 'C'
                return (
                  <tr
                    key={v.id}
                    onClick={() => navigate(`/vehicles-health/${v.id}`)}
                    className={`cursor-pointer border-b border-surface-container-high transition-colors hover:bg-surface ${
                      critical ? 'bg-state-crit-fill/40' : ''
                    }`}
                  >
                    <td className="px-space-md py-space-md align-top">
                      <p
                        className={`font-telemetry-md text-telemetry-md flex items-center gap-1.5 font-semibold ${
                          critical ? 'text-state-crit' : 'text-on-surface'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-pill ${
                            critical ? 'bg-state-crit' : v.status === 'on-trip' ? 'bg-primary' : 'bg-state-idle'
                          }`}
                        />
                        {v.registration}
                      </p>
                      <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">VIN: {v.vin}</p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p className="font-body-sm text-body-sm font-semibold text-on-surface">{v.model}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{v.fleetType}</p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <span className="flex items-center gap-space-sm">
                        <span
                          className={`font-label-sm text-label-sm flex h-7 w-7 shrink-0 items-center justify-center rounded-pill font-bold ${
                            driver ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'
                          }`}
                        >
                          {driver
                            ? driver.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                            : '--'}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={`font-body-sm text-body-sm block truncate ${
                              driver ? 'text-on-surface' : 'italic text-outline'
                            }`}
                          >
                            {driver?.name ?? 'Unassigned'}
                          </span>
                          <span className="font-body-sm text-body-sm block truncate text-on-surface-variant">
                            {v.hub}
                          </span>
                        </span>
                      </span>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <GradeBadge grade={v.healthGrade} score={v.healthScore} />
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      {v.dtcs.length === 0 ? (
                        <span className="font-telemetry-sm text-telemetry-sm rounded bg-surface-container px-1.5 py-0.5 text-on-surface-variant">
                          NONE {v.healthGrade === 'A' ? '(Nominal)' : ''}
                        </span>
                      ) : (
                        <span className="flex flex-col gap-1">
                          {v.dtcs.map((d) => (
                            <span
                              key={d.code}
                              className="font-telemetry-sm text-telemetry-sm rounded border border-state-crit-border bg-state-crit-fill px-1.5 py-0.5 text-state-crit-text"
                            >
                              {d.code} ({d.label})
                            </span>
                          ))}
                        </span>
                      )}
                    </td>

                    <td className="px-space-md py-space-md text-right align-top">
                      <p
                        className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                          v.soc < 25 ? 'text-state-crit' : 'text-primary'
                        }`}
                      >
                        {v.soc}% <span className="text-on-surface-variant">({v.rangeKm} km)</span>
                      </p>
                      <p
                        className={`font-telemetry-sm text-telemetry-sm tnum ${
                          v.packTempC > 45 ? 'font-bold text-state-crit' : 'text-on-surface-variant'
                        }`}
                      >
                        {v.packTempC.toFixed(1)}°C · ΔV: {v.cellDeviationMv} mV
                      </p>
                    </td>

                    <td className="px-space-md py-space-md text-right align-top">
                      <p
                        className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                          v.motorLabel === 'Thermal Warning' ? 'text-state-crit' : 'text-on-surface'
                        }`}
                      >
                        {v.motorTempC.toFixed(1)}°C
                      </p>
                      <p
                        className={`font-body-sm text-body-sm ${
                          v.motorLabel === 'Thermal Warning' ? 'font-semibold text-state-crit' : 'text-state-ok'
                        }`}
                      >
                        {v.motorLabel}
                      </p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <FirmwareCell vehicle={v} />
                    </td>

                    <td className="px-space-md py-space-md align-top" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {critical ? (
                          <ActionButton variant="destructive" icon="block" module="maintenance" size="compact">
                            Take Offline
                          </ActionButton>
                        ) : (
                          <ActionButton
                            icon="query_stats"
                            module="vehicle-telemetry"
                            requires="view"
                            size="compact"
                            onClick={() => navigate(`/vehicles-health/${v.id}`)}
                          >
                            360 Health
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {rows.length === 0 && (
            <EmptyState
              icon="search_off"
              title="No vehicles match these filters"
              body="Clear the grade tab, subsystem, FOTA status, hub or search filter to widen the roster."
            />
          )}
        </div>

        <div className="font-body-sm text-body-sm flex flex-wrap items-center justify-between gap-space-sm p-space-lg text-on-surface-variant">
          <span>
            Showing{' '}
            <strong className="text-on-surface">
              {filtered.length === 0 ? 0 : safePage * ROWS_PER_PAGE + 1} – {safePage * ROWS_PER_PAGE + rows.length}
            </strong>{' '}
            of <strong className="text-on-surface">{filtered.length}</strong> vehicles
          </span>

          <span className="flex items-center gap-space-sm">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              className="rounded-lg px-space-sm py-1 transition-colors enabled:hover:bg-surface-container disabled:text-outline"
            >
              Previous
            </button>
            <span className="font-telemetry-sm text-telemetry-sm">
              Page {safePage + 1} of {pageCount}
            </span>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
              className="rounded-lg px-space-sm py-1 transition-colors enabled:hover:bg-surface-container disabled:text-outline"
            >
              Next
            </button>
          </span>
        </div>
      </Panel>
    </>
  )
}
