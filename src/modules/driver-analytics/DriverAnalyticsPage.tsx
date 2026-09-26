/**
 * Driver Analytics.
 * Built to match Design/intellicar_one_ev_platform-session_and_driver/driver_analytics_intellicar_one.
 *
 * The bottom detail panel tracks the selected roster row — clicking a driver
 * updates the incentive, shift logs, velocity profile and IMU telemetry.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { PageHeader } from '@/layout/AppShell'
import { ActionButton } from '@/components/ActionButton'
import { EmptyState, Icon, Panel, PanelHeader, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { DRIVERS, HUBS, getDriver, scopeToHubs, type Driver } from '@/data/fleet'
import {
  COACHING_QUEUE,
  DRIVER_FILTERS,
  DRIVER_INCENTIVE,
  DRIVER_KPIS,
  IMU_SAMPLES,
  IMU_STATS,
  KINETIC_RECOVERY_SERIES,
  ROSTER_SUMMARY,
  SHIFT_LOGS,
  TIER_DISTRIBUTION,
  TIER_LABELS,
  VELOCITY_PROFILE,
  VELOCITY_STATS,
  getDriverAnalytics,
  type DriverKpi,
  type DriverTier,
} from '@/data/driverAnalytics'

const ROWS_PER_PAGE = 5

const TIER_TONE: Record<DriverTier, 'ok' | 'info' | 'crit'> = {
  elite: 'ok',
  standard: 'info',
  coaching: 'crit',
}

const TIER_BAR: Record<DriverTier, string> = {
  elite: 'bg-tertiary',
  standard: 'bg-primary',
  coaching: 'bg-state-crit',
}

const TONE_TEXT = {
  ok: 'text-state-ok',
  warn: 'text-state-warn',
  crit: 'text-state-crit',
  neutral: 'text-on-surface-variant',
} as const

const TONE_BAR = {
  ok: 'bg-state-ok',
  warn: 'bg-state-warn',
  crit: 'bg-state-crit',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
} as const

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-state-warn">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star_half' : 'star_outline'}
          className="text-[14px]"
        />
      ))}
    </span>
  )
}

function DriverKpiCard({ kpi }: { kpi: DriverKpi }) {
  return (
    <div className="panel flex flex-col p-space-md">
      <div className="mb-space-xs flex items-start justify-between gap-space-sm">
        <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">
          {kpi.label}
        </span>
        <Icon name={kpi.icon} className={`text-[20px] ${TONE_TEXT[kpi.captionTone]}`} />
      </div>

      <div className="flex flex-wrap items-baseline gap-space-xs">
        <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">{kpi.value}</span>
        {kpi.unit && <span className="font-body-sm text-body-sm text-on-surface-variant">{kpi.unit}</span>}
      </div>

      {kpi.stars !== undefined && (
        <div className="mt-space-xs">
          <Stars rating={kpi.stars} />
        </div>
      )}

      <div className="mt-space-sm h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
        <div className={`h-full rounded-pill ${TONE_BAR[kpi.progressTone]}`} style={{ width: `${kpi.progress}%` }} />
      </div>

      <p className={`font-body-sm text-body-sm mt-space-xs ${TONE_TEXT[kpi.captionTone]}`}>{kpi.caption}</p>
    </div>
  )
}

// --- Tier distribution -------------------------------------------------------

function TierDistributionPanel() {
  return (
    <Panel className="lg:col-span-2">
      <div className="mb-space-md flex flex-wrap items-start justify-between gap-space-sm">
        <div>
          <h2 className="font-headline-md text-headline-md font-semibold">Safety & Performance Tier Distribution</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{TIER_DISTRIBUTION.calibration}</p>
        </div>
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          {TIER_DISTRIBUTION.target}
        </span>
      </div>

      <div className="mb-space-md flex h-6 w-full overflow-hidden rounded-lg">
        {TIER_DISTRIBUTION.bands.map((b) => (
          <div
            key={b.tier}
            className={`font-label-sm text-label-sm flex items-center justify-center font-bold text-white ${TIER_BAR[b.tier]}`}
            style={{ width: `${b.pct}%` }}
            title={`${TIER_LABELS[b.tier]} — ${b.drivers} drivers`}
          >
            {b.pct}%
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
        {TIER_DISTRIBUTION.bands.map((b) => (
          <div
            key={b.tier}
            className={`rounded-xl border p-space-sm ${
              b.tier === 'coaching'
                ? 'border-state-crit-border bg-state-crit-fill'
                : 'border-outline-variant/40 bg-surface-container-low'
            }`}
          >
            <p className="font-label-sm text-label-sm flex items-center gap-1.5 uppercase text-on-surface-variant">
              <span className={`h-2 w-2 rounded-pill ${TIER_BAR[b.tier]}`} />
              {TIER_LABELS[b.tier]} {b.range}
            </p>
            <p className="font-headline-sm text-headline-sm tnum font-bold text-on-surface">
              {b.drivers.toLocaleString()} Drivers
            </p>
            <p
              className={`font-body-sm text-body-sm ${
                b.tier === 'coaching' ? 'font-semibold text-state-crit' : 'text-on-surface-variant'
              }`}
            >
              {b.note}
            </p>
          </div>
        ))}
      </div>

      {/* <div className="mt-space-md flex items-center gap-space-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm">
        <div className="min-w-0">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Kinetic Recovery Efficiency Trend
          </p>
          <p className="font-telemetry-sm text-telemetry-sm text-on-surface">7-Day Aggregated Wh/km Velocity</p>
        </div>
        <div className="h-10 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={KINETIC_RECOVERY_SERIES} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
              <Line
                type="monotone"
                dataKey="whKm"
                stroke="#0037b0"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div> */}
    </Panel>
  )
}

function CoachingQueuePanel() {
  const q = COACHING_QUEUE
  return (
    <Panel>
      <PanelHeader
        title="Automated Coaching Queue"
        action={<StatusBadge tone="crit">{q.urgentCount} Urgent</StatusBadge>}
      />

      <div className="rounded-xl border border-state-crit-border bg-state-crit-fill p-space-md">
        <div className="mb-space-xs flex flex-wrap items-start justify-between gap-space-sm">
          <span className="font-body-md text-body-md flex items-center gap-1.5 font-semibold text-on-surface">
            <Icon name="priority_high" className="text-[16px] text-state-crit" />
            {q.primary.title}
          </span>
          <StatusBadge tone="crit">{q.primary.driverCount} Drivers</StatusBadge>
        </div>
        <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">{q.primary.location}</p>
        <p className="font-body-sm text-body-sm mt-space-sm text-on-surface-variant">{q.primary.detail}</p>

        <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Recommended Module: <strong className="text-on-surface">{q.primary.module}</strong>
          </span>
          <ActionButton variant="primary" module="driver-analytics" size="compact">
            {q.primary.action}
          </ActionButton>
        </div>
      </div>

      <div className="mt-space-sm flex flex-wrap items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-sm">
        <span className="font-body-sm text-body-sm flex items-center gap-1.5 text-on-surface-variant">
          <Icon name="turn_sharp_right" className="text-[16px] text-primary" />
          {q.secondary.title}
        </span>
        <ActionButton variant="ghost" module="driver-analytics" requires="view" size="compact">
          {q.secondary.action}
        </ActionButton>
      </div>
    </Panel>
  )
}

// --- Selected driver detail --------------------------------------------------

function DriverDetailPanel({ driver }: { driver: Driver }) {
  const a = getDriverAnalytics(driver.id)
  const navigate = useNavigate()
  const initials = driver.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  return (
    <Panel className="mt-space-md">
      <div className="mb-space-md flex flex-col gap-space-md lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-space-md">
          <span className="font-headline-sm text-headline-sm flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-on-primary">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-space-sm">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">{driver.name}</h2>
              {a && <StatusBadge tone={TIER_TONE[a.tier]}>{TIER_LABELS[a.tier]}</StatusBadge>}
            </div>
            <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
              ID: #{driver.id} · Joined: {a?.joined} · {a?.cluster}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <ActionButton
            icon="monitor_heart"
            module="vehicle-telemetry"
            requires="view"
            onClick={() => navigate('/vehicles-health')}
          >
            View Vehicle Telemetry {a?.assignedReg}
          </ActionButton>
          <ActionButton icon="workspace_premium" variant="primary" module="driver-analytics">
            Issue Recognition
          </ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-space-md xl:grid-cols-3">
        {/* Incentive + shift logs */}
        <div className="flex flex-col gap-space-md">
          <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-md">
            <div className="mb-space-xs flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-outline">Current Cycle Incentive</span>
              <Icon name="paid" className="text-[18px] text-state-ok" />
            </div>
            <div className="flex flex-wrap items-baseline gap-space-sm">
              <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">
                {DRIVER_INCENTIVE.amount}
              </span>
              <span className="font-body-sm text-body-sm font-semibold text-state-ok">{DRIVER_INCENTIVE.delta}</span>
            </div>
            <p className="font-body-sm text-body-sm mt-space-sm text-on-surface-variant">
              {DRIVER_INCENTIVE.rationale}
            </p>
            <div className="font-body-sm text-body-sm mt-space-sm flex items-center justify-between border-t border-outline-variant/40 pt-space-sm">
              <span className="text-on-surface-variant">Payout Target Date:</span>
              <span className="font-telemetry-sm text-telemetry-sm font-semibold">{DRIVER_INCENTIVE.payoutDate}</span>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant/40 p-space-md">
            <div className="mb-space-sm flex items-center justify-between gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase text-outline">Shift Logs (Today)</span>
              <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">{a?.assignedReg}</span>
            </div>
            <ul className="space-y-space-sm">
              {SHIFT_LOGS.map((log) => (
                <li key={log.id} className="rounded-xl bg-surface-container-low p-space-sm">
                  <div className="flex items-start justify-between gap-space-sm">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                      Trip {log.id}: {log.route}
                    </span>
                    <span className="font-telemetry-sm text-telemetry-sm shrink-0 text-primary">{log.efficiency}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{log.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Velocity profile */}
        <div className="rounded-xl border border-outline-variant/40 p-space-md">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
            Continuous Velocity Profile
          </p>
          <div className="mb-space-sm flex flex-wrap items-center justify-between gap-space-sm">
            <h3 className="font-headline-sm text-headline-sm font-semibold">Speed Consistency Curve</h3>
            <StatusBadge tone="ok">{VELOCITY_STATS.state}</StatusBadge>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VELOCITY_PROFILE} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="velFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0037b0" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0037b0" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e7ff" vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis
                  domain={[0, 60]}
                  ticks={[0, 25, 50]}
                  tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={false}
                />
                <ReferenceLine
                  y={50}
                  stroke="#e11d48"
                  strokeDasharray="4 3"
                  label={{ value: 'Limit: 50', position: 'right', fontSize: 9, fill: '#9f1239' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #c4c5d7', fontFamily: 'Inter', fontSize: 12 }}
                  formatter={(v: number) => [`${v.toFixed(1)} km/h`, 'Speed']}
                  labelFormatter={() => 'Shift sample'}
                />
                <Area
                  type="monotone"
                  dataKey="speed"
                  stroke="#0037b0"
                  strokeWidth={2}
                  fill="url(#velFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-space-sm grid grid-cols-2 gap-space-sm">
            <div>
              <p className="font-label-sm text-label-sm uppercase text-outline">Cruise Ratio</p>
              <p className="font-telemetry-md text-telemetry-md tnum font-semibold">{VELOCITY_STATS.cruiseRatio}</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm uppercase text-outline">Torque Ripple</p>
              <p className="font-telemetry-md text-telemetry-md tnum font-semibold">{VELOCITY_STATS.torqueRipple}</p>
            </div>
          </div>
        </div>

        {/* IMU scatter */}
        <div className="rounded-xl border border-outline-variant/40 p-space-md">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
            Inertial Measurement Unit (IMU)
          </p>
          <div className="mb-space-sm flex flex-wrap items-center justify-between gap-space-sm">
            <h3 className="font-headline-sm text-headline-sm font-semibold">G-Force Shock Telemetry</h3>
            <Icon name="sensors" className="text-[18px] text-primary" />
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e2e7ff" />
                <XAxis
                  type="number"
                  dataKey="lateral"
                  domain={[-0.5, 0.5]}
                  ticks={[-0.5, 0, 0.5]}
                  tick={{ fontSize: 9, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={false}
                  name="Lateral"
                />
                <YAxis
                  type="number"
                  dataKey="longitudinal"
                  domain={[-0.5, 0.5]}
                  ticks={[-0.5, 0, 0.5]}
                  tick={{ fontSize: 9, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={false}
                  name="Longitudinal"
                />
                <ZAxis range={[40, 40]} />
                <ReferenceLine x={0} stroke="#c4c5d7" />
                <ReferenceLine y={0} stroke="#c4c5d7" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #c4c5d7', fontFamily: 'Inter', fontSize: 12 }}
                  formatter={(v: number) => [`${v.toFixed(2)} G`, '']}
                />
                <Scatter data={IMU_SAMPLES} fill="#0037b0" isAnimationActive={false} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <dl className="font-body-sm text-body-sm mt-space-sm space-y-1">
            {IMU_STATS.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-space-sm">
                <dt className="text-on-surface-variant">{s.label}:</dt>
                <dd className="font-telemetry-sm text-telemetry-sm shrink-0 text-right font-semibold text-on-surface">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Panel>
  )
}

// --- Page --------------------------------------------------------------------

export function DriverAnalyticsPage() {
  const { role } = useWorkspace()

  const [query, setQuery] = useState('')
  const [hub, setHub] = useState('all')
  const [shift, setShift] = useState(DRIVER_FILTERS.shifts[0])
  const [tier, setTier] = useState('All Tiers')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string>('DRV-2041')

  function update<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(0)
    }
  }

  // PRD: role asset scoping applies before any screen filter.
  const scoped = useMemo(() => scopeToHubs(DRIVERS, role.assetScope.hubs), [role])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((d) => {
      const a = getDriverAnalytics(d.id)
      if (hub !== 'all' && d.hub !== hub) return false
      if (tier !== 'All Tiers' && a && TIER_LABELS[a.tier] !== tier) return false
      if (q && !`${d.name} ${d.id} ${a?.assignedReg ?? ''} ${a?.licence ?? ''}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [scoped, query, hub, tier])

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage = Math.min(page, pageCount - 1)
  const rows = filtered.slice(safePage * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE + ROWS_PER_PAGE)

  const selected = getDriver(selectedId) ?? rows[0] ?? filtered[0]

  return (
    <>
      <PageHeader
        title="Driver Analytics"
        breadcrumb="Driver Analytics"
        actions={
          <>
            <ActionButton icon="download" module="reports-analytics" requires="view">
              Download Scorecards
            </ActionButton>
            <ActionButton icon="tune" module="driver-analytics">
              Incentive & Bonus Tiers
            </ActionButton>
            <ActionButton icon="campaign" variant="primary" module="driver-analytics">
              Dispatch Safety Notice
            </ActionButton>
          </>
        }
      />

      {/* Roster summary tiles */}
      <Panel className="mb-space-md !py-space-md">
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
          {ROSTER_SUMMARY.map((s) => (
            <div key={s.id} className="flex items-center gap-space-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-low">
                <Icon name={s.icon} className="text-[20px] text-primary" />
              </span>
              <div className="min-w-0">
                <p className="font-label-sm text-label-sm uppercase text-outline">{s.label}</p>
                <p className="flex flex-wrap items-baseline gap-space-xs">
                  <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">{s.value}</span>
                  {s.unit && <span className="font-body-sm text-body-sm text-on-surface-variant">{s.unit}</span>}
                  {s.id === 'safety-composite' ? (
                    <StatusBadge tone="ok">{s.caption}</StatusBadge>
                  ) : (
                    <span className="font-body-sm text-body-sm text-state-ok">{s.caption}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mb-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-5">
        {DRIVER_KPIS.map((kpi) => (
          <DriverKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="mb-space-md grid grid-cols-1 gap-space-md lg:grid-cols-3">
        <TierDistributionPanel />
        <CoachingQueuePanel />
      </div>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center gap-space-sm p-space-lg pb-space-sm">
          <div className="relative min-w-[220px] flex-1 sm:max-w-[280px]">
            <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[16px] text-outline" />
            <input
              value={query}
              onChange={(e) => update(setQuery)(e.target.value)}
              placeholder="Filter by Driver Name, Employee ID..."
              className="font-body-sm text-body-sm h-9 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-8 pr-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <label className="font-body-sm text-body-sm flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Hub:</span>
            <select
              value={hub}
              onChange={(e) => update(setHub)(e.target.value)}
              className="h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
            >
              <option value="all">{DRIVER_FILTERS.hubs}</option>
              {HUBS.map((h) => (
                <option key={h.id} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>

          <label className="font-body-sm text-body-sm flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Shift:</span>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
            >
              {DRIVER_FILTERS.shifts.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="font-body-sm text-body-sm flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Tier:</span>
            <select
              value={tier}
              onChange={(e) => update(setTier)(e.target.value)}
              className="h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
            >
              {DRIVER_FILTERS.tiers.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>

          <ActionButton icon="refresh" size="compact" className="!px-2">
            <span className="sr-only">Refresh roster</span>
          </ActionButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {[
                  'Driver Identity',
                  'Assigned Asset & Hub',
                  'Distance (mo)',
                  'Safety Score',
                  'Energy (Wh/km)',
                  'Infractions (100km)',
                  'Regen %',
                  'On-Time SLA',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm uppercase text-on-surface-variant ${
                      ['Distance (mo)', 'Regen %', 'On-Time SLA'].includes(h)
                        ? 'text-right'
                        : ['Safety Score', 'Infractions (100km)', 'Actions'].includes(h)
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((d) => {
                const a = getDriverAnalytics(d.id)
                if (!a) return null
                const coaching = a.tier === 'coaching'
                const isSelected = d.id === selected?.id

                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className={`cursor-pointer border-b border-surface-container-high transition-colors ${
                      isSelected ? 'bg-primary-fixed/40' : coaching ? 'bg-state-crit-fill/30' : 'hover:bg-surface'
                    }`}
                  >
                    <td className="px-space-md py-space-md align-top">
                      <div className="flex items-start gap-space-sm">
                        <span className="font-label-sm text-label-sm flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-primary font-bold text-on-primary">
                          {d.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-body-sm text-body-sm flex items-center gap-1.5 font-semibold text-on-surface">
                            {d.name}
                            <span
                              className={`h-1.5 w-1.5 rounded-pill ${a.online ? 'bg-state-ok' : 'bg-state-idle'}`}
                              title={a.online ? 'On duty' : 'Off duty'}
                            />
                          </p>
                          <p
                            className={`font-telemetry-sm text-telemetry-sm ${
                              coaching ? 'text-state-crit' : 'text-primary'
                            }`}
                          >
                            #{d.id} · Lic: {a.licence}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p className="font-telemetry-sm text-telemetry-sm font-semibold text-on-surface">
                        {a.assignedReg}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{d.hub}</p>
                    </td>

                    <td className="px-space-md py-space-md text-right align-top">
                      <p className="font-telemetry-md text-telemetry-md tnum font-semibold">
                        {a.distanceKmMonth.toLocaleString()} km
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{a.tripsMonth} Trips</p>
                    </td>

                    <td className="px-space-md py-space-md text-center align-top">
                      <span
                        className={`font-telemetry-md text-telemetry-md tnum inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-semibold ${
                          a.tier === 'elite'
                            ? 'border-state-ok-border bg-state-ok-fill text-state-ok-text'
                            : a.tier === 'standard'
                              ? 'border-primary-fixed-dim bg-primary-fixed text-on-primary-fixed'
                              : 'border-state-crit-border bg-state-crit-fill text-state-crit-text'
                        }`}
                      >
                        <Icon
                          name={a.tier === 'coaching' ? 'warning' : 'check_circle'}
                          className="text-[14px]"
                        />
                        {a.safetyScore} / 100
                      </span>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p
                        className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                          a.energyWhKm > a.benchmarkWhKm ? 'text-state-crit' : 'text-on-surface'
                        }`}
                      >
                        {a.energyWhKm.toFixed(1)} Wh/km
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {a.energyWhKm > a.benchmarkWhKm
                          ? `+${(((a.energyWhKm - a.benchmarkWhKm) / a.benchmarkWhKm) * 100).toFixed(1)}% over`
                          : `Benchmark: ${a.benchmarkWhKm}`}
                      </p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <div className="flex items-center justify-center gap-1">
                        {[
                          { n: a.harshBraking, label: 'HB' },
                          { n: a.harshTurn, label: 'HT' },
                          { n: a.overSpeed, label: 'OS' },
                        ].map((chip) => (
                          <span
                            key={chip.label}
                            className={`font-telemetry-sm text-telemetry-sm tnum flex w-9 flex-col items-center rounded px-1 py-0.5 ${
                              chip.n === 0
                                ? 'text-on-surface-variant'
                                : chip.n <= 2
                                  ? 'bg-state-warn-fill text-state-warn-text'
                                  : 'bg-state-crit-fill font-bold text-state-crit-text'
                            }`}
                          >
                            <span>{chip.n}</span>
                            <span className="text-[9px] opacity-70">{chip.label}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="font-telemetry-md text-telemetry-md tnum px-space-md py-space-md text-right align-top">
                      <span className={coaching ? 'text-state-crit' : 'text-state-ok'}>{a.regenPct.toFixed(1)} %</span>
                    </td>

                    <td className="font-telemetry-md text-telemetry-md tnum px-space-md py-space-md text-right align-top">
                      <span className={a.onTimeSlaPct < 92 ? 'text-state-crit' : 'text-on-surface'}>
                        {a.onTimeSlaPct.toFixed(1)}%
                      </span>
                    </td>

                    <td className="px-space-md py-space-md align-top" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {coaching ? (
                          <ActionButton variant="destructive" module="driver-analytics" size="compact">
                            Assign Coach
                          </ActionButton>
                        ) : (
                          <>
                            <ActionButton
                              variant="ghost"
                              icon="visibility"
                              module="driver-analytics"
                              requires="view"
                              size="compact"
                              className="!px-2"
                              onClick={() => setSelectedId(d.id)}
                            >
                              <span className="sr-only">View {d.name}</span>
                            </ActionButton>
                            <ActionButton
                              variant="ghost"
                              icon="chat"
                              module="driver-analytics"
                              size="compact"
                              className="!px-2"
                            >
                              <span className="sr-only">Message {d.name}</span>
                            </ActionButton>
                          </>
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
              icon="person_off"
              title="No drivers match these filters"
              body="Clear the search, hub or tier filter to widen the roster."
            />
          )}
        </div>

        <div className="font-body-sm text-body-sm flex flex-wrap items-center justify-between gap-space-sm p-space-lg text-on-surface-variant">
          <span>
            Showing <strong className="text-on-surface">{rows.length}</strong> of{' '}
            <strong className="text-on-surface">{filtered.length}</strong> Active Driver Telemetry Profiles
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

      {selected && <DriverDetailPanel driver={selected} />}
    </>
  )
}
