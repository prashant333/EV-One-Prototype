/**
 * Battery Health — portfolio roster.
 * Built to match Design/Battery_intellicar_one_ev_platform/battery_health_list_intellicar_one.
 */

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/layout/AppShell'
import { ActionButton } from '@/components/ActionButton'
import { EmptyState, Icon, Panel, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { HUBS, scopeToHubs } from '@/data/fleet'
import {
  BATTERIES,
  DEGRADATION_STATS,
  PORTFOLIO_KPIS,
  PREDICTIVE_QUEUE,
  SOH_BINS,
  SOH_SAMPLING,
  SOH_TREND,
  SOH_STATUS_LABELS,
  TELEMETRY_BANNER,
  WARRANTY_LABELS,
  type Battery,
  type PortfolioKpi,
  type SohStatus,
} from '@/data/batteries'

const ROWS_PER_PAGE = 6

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
} as const

const SOH_TONE: Record<SohStatus, 'ok' | 'info' | 'warn' | 'crit'> = {
  healthy: 'ok',
  'grade-a': 'ok',
  'grade-b': 'info',
  watch: 'warn',
  critical: 'crit',
  'claim-alert': 'warn',
}

function PortfolioKpiCard({ kpi }: { kpi: PortfolioKpi }) {
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
        {kpi.badge && <StatusBadge tone={kpi.badgeTone ?? 'info'}>{kpi.badge}</StatusBadge>}
      </div>

      <p className={`font-body-sm text-body-sm mt-0.5 ${TONE_TEXT[kpi.captionTone]}`}>{kpi.caption}</p>

      {kpi.rows.map((r) => (
        <p key={r.label} className={`font-body-sm text-body-sm ${TONE_TEXT[r.tone ?? 'neutral']}`}>
          {r.label} {r.value}
        </p>
      ))}

      <div className="mt-auto pt-space-sm">
        <div className="h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
          <div className={`h-full rounded-pill ${TONE_BAR[kpi.progressTone]}`} style={{ width: `${kpi.progress}%` }} />
        </div>
      </div>
    </div>
  )
}

// --- SoH distribution & trend ------------------------------------------------

function DistributionPanel() {
  const [view, setView] = useState<'bins' | 'trend'>('bins')

  return (
    <Panel className="xl:col-span-2">
      <div className="mb-space-md flex flex-col gap-space-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md font-semibold">
            Battery Health Distribution & 12-Month SoH Trend
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Comparing physical pack degradation vs OEM warranty envelope and dynamic thermal load
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-xl bg-surface-container-low p-0.5">
          {(
            [
              { id: 'bins', label: 'Distribution (Bins)' },
              { id: 'trend', label: '12-Mo Trajectory' },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`font-body-sm text-body-sm rounded-lg px-space-md py-1.5 transition-colors ${
                view === v.id
                  ? 'bg-surface-container-lowest font-semibold text-primary shadow-level-1'
                  : 'text-on-surface-variant'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="font-body-sm text-body-sm mb-space-sm flex flex-wrap items-center gap-space-md">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
          Actual Measured SoH (Fleet Avg)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-outline" />
          OEM Warranty Floor (70% SoH)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-pill bg-state-ok" />
          Nominal Baseline
        </span>
        <span className="font-telemetry-sm text-telemetry-sm ml-auto text-outline">{SOH_SAMPLING}</span>
      </div>

      <div className="h-[260px] rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={SOH_TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sohFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0037b0" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#0037b0" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e7ff" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[65, 102]}
              ticks={[70, 80, 90, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
            />
            <ReferenceLine y={70} stroke="#e11d48" strokeDasharray="6 4" />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #c4c5d7', fontFamily: 'Inter', fontSize: 12 }}
              formatter={(v: number, n: string) => [`${v}%`, n]}
            />
            <Area
              type="monotone"
              dataKey="measured"
              name="Measured SoH"
              stroke="#0037b0"
              strokeWidth={2.5}
              fill="url(#sohFill)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="nominal"
              name="Nominal Baseline"
              stroke="#747686"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {view === 'bins' && (
        <div className="mt-space-md grid grid-cols-1 gap-space-sm sm:grid-cols-2 xl:grid-cols-4">
          {SOH_BINS.map((b) => (
            <div
              key={b.label}
              className={`rounded-xl border p-space-sm ${
                b.tone === 'crit' ? 'border-state-crit-border bg-state-crit-fill' : 'border-outline-variant/40'
              }`}
            >
              <p className="flex items-baseline justify-between gap-space-sm">
                <span className={`font-label-sm text-label-sm font-semibold uppercase ${TONE_TEXT[b.tone === 'info' ? 'neutral' : b.tone]}`}>
                  {b.label}
                </span>
                <span className="font-telemetry-sm text-telemetry-sm tnum text-on-surface-variant">{b.pct}%</span>
              </p>
              <p className="font-headline-sm text-headline-sm tnum font-bold text-on-surface">
                {b.packs.toLocaleString()} packs
              </p>
              <p className={`font-body-sm text-body-sm ${b.tone === 'crit' ? 'font-semibold text-state-crit' : 'text-on-surface-variant'}`}>
                {b.note}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-space-md grid grid-cols-2 gap-space-sm sm:grid-cols-5">
        {DEGRADATION_STATS.map((s) => (
          <div key={s.label} className="rounded-xl bg-surface-container-low p-space-sm">
            <p className="font-label-sm text-label-sm uppercase text-outline">{s.label}</p>
            <p className="font-telemetry-md text-telemetry-md tnum font-semibold text-on-surface">{s.value}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{s.caption}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function PredictiveQueuePanel({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <Panel>
      <div className="mb-space-md flex items-start justify-between gap-space-sm">
        <div>
          <h2 className="font-headline-sm text-headline-sm flex items-center gap-1.5 font-semibold">
            <Icon name="troubleshoot" className="text-[18px] text-primary" />
            Predictive Health Queue
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            AI wear-triage engine detecting early internal short-circuiting, cell imbalances, and thermal run-away
            markers
          </p>
        </div>
        <StatusBadge tone="crit">42 High Risk</StatusBadge>
      </div>

      <ul className="space-y-space-sm">
        {PREDICTIVE_QUEUE.map((a) => (
          <li
            key={a.batteryId}
            className={`rounded-xl border p-space-sm ${
              a.riskTone === 'crit' ? 'border-state-crit-border bg-state-crit-fill' : 'border-outline-variant/40'
            }`}
          >
            <div className="mb-space-xs flex flex-wrap items-center justify-between gap-space-xs">
              <span className="font-telemetry-md text-telemetry-md font-semibold text-on-surface">
                {a.batteryId} <span className="font-normal text-on-surface-variant">· {a.chemistryLabel}</span>
              </span>
              <StatusBadge tone={a.riskTone}>{a.riskLabel}</StatusBadge>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">{a.detail}</p>

            <p className="font-telemetry-sm text-telemetry-sm mt-space-xs flex flex-wrap gap-space-md text-on-surface-variant">
              <span>
                SoH: <strong className={a.sohPct < 75 ? 'text-state-crit' : 'text-on-surface'}>{a.sohPct}%</strong>
              </span>
              <span>
                Cycles: <strong className="text-on-surface">{a.cycles.toLocaleString()}</strong>
              </span>
              <span className="ml-auto">{a.context}</span>
            </p>

            <p className="font-body-sm text-body-sm mt-space-sm rounded-lg bg-surface-container-lowest p-space-sm text-on-surface-variant">
              <strong className="text-on-surface">Recommendation:</strong> {a.recommendation}
            </p>

            <div className="mt-space-sm flex flex-wrap justify-end gap-space-sm">
              <ActionButton size="compact" onClick={() => onOpen(a.batteryId)}>
                View Pack
              </ActionButton>
              <ActionButton variant="primary" module="battery" size="compact">
                {a.primaryAction}
              </ActionButton>
            </div>
          </li>
        ))}
      </ul>

      <ActionButton
        variant="ghost"
        icon="arrow_forward"
        module="battery"
        requires="view"
        className="mt-space-sm w-full justify-center"
      >
        View All 42 Flagged Batteries
      </ActionButton>
    </Panel>
  )
}

// --- Page --------------------------------------------------------------------

export function BatteryHealthPage() {
  const navigate = useNavigate()
  const { role, segment } = useWorkspace()

  const [tab, setTab] = useState<'all' | 'healthy' | 'at-risk' | 'critical' | 'claims'>('all')
  const [chemistry, setChemistry] = useState('all')
  const [health, setHealth] = useState('all')
  const [hub, setHub] = useState('all')
  const [warranty, setWarranty] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)

  function update<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(0)
    }
  }

  function resetFilters() {
    setTab('all')
    setChemistry('all')
    setHealth('all')
    setHub('all')
    setWarranty('all')
    setQuery('')
    setPage(0)
  }

  // PRD: role asset scoping applies before any screen filter.
  const scoped = useMemo(() => scopeToHubs(BATTERIES, role.assetScope.hubs), [role])

  const counts = useMemo(
    () => ({
      all: scoped.length,
      healthy: scoped.filter((b) => b.sohStatus === 'healthy' || b.sohStatus === 'grade-a').length,
      atRisk: scoped.filter((b) => b.sohStatus === 'grade-b' || b.sohStatus === 'watch').length,
      critical: scoped.filter((b) => b.sohStatus === 'critical').length,
      claims: scoped.filter((b) => b.warranty === 'ready-to-claim' || b.warranty === 'under-review').length,
    }),
    [scoped],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped.filter((b) => {
      if (tab === 'healthy' && !(b.sohStatus === 'healthy' || b.sohStatus === 'grade-a')) return false
      if (tab === 'at-risk' && !(b.sohStatus === 'grade-b' || b.sohStatus === 'watch')) return false
      if (tab === 'critical' && b.sohStatus !== 'critical') return false
      if (tab === 'claims' && !(b.warranty === 'ready-to-claim' || b.warranty === 'under-review')) return false
      if (chemistry !== 'all' && b.chemistry !== chemistry) return false
      if (hub !== 'all' && b.hub !== hub) return false
      if (health !== 'all' && b.sohStatus !== health) return false
      if (warranty !== 'all' && b.warranty !== warranty) return false
      if (q && !`${b.id} ${b.serial} ${b.model} ${b.deployment.detail} ${b.oem}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [scoped, tab, chemistry, hub, health, warranty, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage = Math.min(page, pageCount - 1)
  const rows = filtered.slice(safePage * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE + ROWS_PER_PAGE)

  const tabs = [
    { id: 'all' as const, label: 'All Batteries', count: counts.all, tone: 'info' as const },
    { id: 'healthy' as const, label: 'Healthy', count: counts.healthy, tone: 'ok' as const },
    { id: 'at-risk' as const, label: 'At Risk', count: counts.atRisk, tone: 'warn' as const },
    { id: 'critical' as const, label: 'Critical / Quarantined', count: counts.critical, tone: 'crit' as const },
    { id: 'claims' as const, label: 'Warranty Claim Review', count: counts.claims, tone: 'info' as const },
  ]

  const openPack = (id: string) => navigate(`/battery-health/${id}`)

  return (
    <>
      <PageHeader
        title="Battery Health"
        breadcrumb="Battery Health"
        actions={
          <>
            <ActionButton icon="download" module="reports-analytics" requires="view">
              Export Portfolio
            </ActionButton>
            <ActionButton icon="block" module="battery">
              Quarantine Pack
            </ActionButton>
            <ActionButton icon="add_circle" variant="primary" module="assets-registry">
              Commission New Pack
            </ActionButton>
          </>
        }
      />

      {/* Live telemetry banner */}
      <Panel className="mb-space-md !py-space-sm">
        <div className="flex flex-wrap items-center gap-x-space-lg gap-y-space-xs">
          <span className="font-body-sm text-body-sm flex items-center gap-1.5 font-semibold text-on-surface">
            <span className="h-2 w-2 animate-pulse rounded-pill bg-state-ok" />
            {TELEMETRY_BANNER.sync}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{TELEMETRY_BANNER.polling}</span>
          <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
            {TELEMETRY_BANNER.ingestion}
          </span>
          <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
            {TELEMETRY_BANNER.lossRate}
          </span>
          <button
            type="button"
            className="font-body-sm text-body-sm ml-auto flex items-center gap-1 text-primary hover:underline"
          >
            <Icon name="refresh" className="text-[14px]" />
            Force Pipeline Refresh
          </button>
        </div>
      </Panel>

      {role.assetScope.kind === 'hubs' && (
        <div className="mb-space-md flex justify-end">
          <StatusBadge tone="warn">
            <Icon name="lock" className="text-[12px]" />
            Scoped to {role.assetScope.hubs?.join(', ')}
          </StatusBadge>
        </div>
      )}

      <div className="mb-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-5">
        {PORTFOLIO_KPIS.map((kpi) => (
          <PortfolioKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="mb-space-md grid grid-cols-1 gap-space-md xl:grid-cols-3">
        <DistributionPanel />
        <PredictiveQueuePanel onOpen={openPack} />
      </div>

      <Panel padded={false}>
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-space-xs p-space-lg pb-space-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => update(setTab)(t.id)}
              className={`font-body-sm text-body-sm flex items-center gap-1.5 whitespace-nowrap rounded-xl px-space-md py-1.5 transition-colors ${
                tab === t.id
                  ? 'bg-primary-fixed font-semibold text-on-primary-fixed'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {t.label}
              <span
                className={`font-telemetry-sm text-telemetry-sm tnum rounded-pill px-1.5 ${
                  t.tone === 'crit'
                    ? 'bg-state-crit-fill text-state-crit-text'
                    : t.tone === 'warn'
                      ? 'bg-state-warn-fill text-state-warn-text'
                      : t.tone === 'ok'
                        ? 'bg-state-ok-fill text-state-ok-text'
                        : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-space-sm px-space-lg pb-space-sm">
          <ActionButton icon="view_column" size="compact">
            Columns
          </ActionButton>
          <ActionButton icon="download" module="reports-analytics" requires="view" size="compact">
            Export CSV
          </ActionButton>
          <ActionButton icon="checklist" module="battery" size="compact">
            Batch Action
          </ActionButton>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm px-space-lg pb-space-sm">
          <div className="relative min-w-[240px] flex-1 sm:max-w-[320px]">
            <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[16px] text-outline" />
            <input
              value={query}
              onChange={(e) => update(setQuery)(e.target.value)}
              placeholder="Filter by Battery ID, Serial, VIN, Model..."
              className="font-body-sm text-body-sm h-9 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-8 pr-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <select
            value={chemistry}
            onChange={(e) => update(setChemistry)(e.target.value)}
            className="font-body-sm text-body-sm h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
          >
            <option value="all">Chem: All (NMC/LFP)</option>
            <option value="NMC">NMC</option>
            <option value="LFP">LFP</option>
          </select>

          <select
            value={health}
            onChange={(e) => update(setHealth)(e.target.value)}
            className="font-body-sm text-body-sm h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
          >
            <option value="all">Health: All Statuses</option>
            {(Object.keys(SOH_STATUS_LABELS) as SohStatus[]).map((s) => (
              <option key={s} value={s}>
                {SOH_STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <select
            value={hub}
            onChange={(e) => update(setHub)(e.target.value)}
            className="font-body-sm text-body-sm h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
          >
            <option value="all">Hub: Bengaluru (All Hubs)</option>
            {HUBS.map((h) => (
              <option key={h.id} value={h.name}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={warranty}
            onChange={(e) => update(setWarranty)(e.target.value)}
            className="font-body-sm text-body-sm h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
          >
            <option value="all">Warranty: Active & Review</option>
            {(Object.keys(WARRANTY_LABELS) as Array<keyof typeof WARRANTY_LABELS>).map((w) => (
              <option key={w} value={w}>
                {WARRANTY_LABELS[w]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="font-body-sm text-body-sm flex items-center gap-1 text-on-surface-variant hover:text-on-surface"
          >
            <Icon name="filter_alt_off" className="text-[16px]" />
            Reset Filters
          </button>
        </div>

        {/* Roster */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {[
                  { label: 'Battery ID & Model', align: 'text-left' },
                  { label: 'Chemistry & Serial', align: 'text-left' },
                  { label: 'SoH Status', align: 'text-left' },
                  { label: 'SoC & Capacity', align: 'text-left' },
                  { label: 'Cycle Count', align: 'text-right' },
                  { label: 'Pack Temp', align: 'text-right' },
                  { label: 'Fade Rate', align: 'text-right' },
                  { label: 'Deployment (Vehicle / Bay)', align: 'text-left' },
                  { label: 'Warranty', align: 'text-left' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm uppercase text-on-surface-variant ${h.align}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((b: Battery) => {
                const critical = b.sohStatus === 'critical'
                return (
                  <tr
                    key={b.id}
                    onClick={() => openPack(b.id)}
                    className={`cursor-pointer border-b border-surface-container-high transition-colors hover:bg-surface ${
                      critical ? 'bg-state-crit-fill/30' : ''
                    }`}
                  >
                    <td className="px-space-md py-space-md align-top">
                      <p
                        className={`font-telemetry-md text-telemetry-md flex items-center gap-1.5 font-semibold ${
                          critical ? 'text-state-crit' : 'text-primary'
                        }`}
                      >
                        {b.id}
                        {critical && <Icon name="warning" className="text-[14px]" />}
                        {b.warranty === 'ready-to-claim' && <Icon name="flag" className="text-[14px] text-state-warn" />}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{b.model}</p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p className="font-body-sm text-body-sm text-on-surface">{b.chemistryDetail}</p>
                      <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">SN: {b.serial}</p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p className="flex items-center gap-1.5">
                        <span
                          className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                            critical ? 'text-state-crit' : 'text-on-surface'
                          }`}
                        >
                          {b.sohPct}%
                        </span>
                        <StatusBadge tone={SOH_TONE[b.sohStatus]}>{SOH_STATUS_LABELS[b.sohStatus]}</StatusBadge>
                      </p>
                      <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-pill bg-surface-container-high">
                        <div
                          className={`h-full rounded-pill ${critical ? 'bg-state-crit' : 'bg-state-ok'}`}
                          style={{ width: `${b.sohPct}%` }}
                        />
                      </div>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p className="font-telemetry-md text-telemetry-md tnum text-on-surface">
                        {b.socPct}%{' '}
                        <span className="text-on-surface-variant">({b.usableKwh.toFixed(1)} kWh)</span>
                      </p>
                      <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-pill bg-surface-container-high">
                        <div className="h-full rounded-pill bg-primary" style={{ width: `${b.socPct}%` }} />
                      </div>
                    </td>

                    <td className="px-space-md py-space-md text-right align-top">
                      <p className="font-telemetry-md text-telemetry-md tnum font-semibold">
                        {b.cycleCount.toLocaleString()}
                      </p>
                      <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                        tgt: {b.cycleDesign.toLocaleString()} cyc
                      </p>
                    </td>

                    <td className="px-space-md py-space-md text-right align-top">
                      <p
                        className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                          b.packTempC > 45 ? 'text-state-crit' : 'text-on-surface'
                        }`}
                      >
                        {b.packTempC.toFixed(1)}°C
                      </p>
                      <p
                        className={`font-body-sm text-body-sm ${
                          b.thermalState === 'nominal' ? 'text-on-surface-variant' : 'text-state-crit'
                        }`}
                      >
                        {b.thermalState === 'nominal'
                          ? 'Nominal'
                          : b.thermalState === 'elevated'
                            ? 'Elevated'
                            : b.thermalState === 'throttled'
                              ? 'Throttled'
                              : 'High Thermal'}
                      </p>
                    </td>

                    <td className="px-space-md py-space-md text-right align-top">
                      <p
                        className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                          b.fadeRatePct > 3.5 ? 'text-state-crit' : 'text-on-surface'
                        }`}
                      >
                        {b.fadeRatePct}%/yr
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {b.fadeRatePct > 3.5 ? 'Accelerated' : b.fadeRatePct > 2.5 ? 'Gradual' : 'Optimal'}
                      </p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p className="font-body-sm text-body-sm flex items-center gap-1.5 text-on-surface">
                        <Icon
                          name={
                            b.deployment.kind === 'vehicle'
                              ? 'local_shipping'
                              : b.deployment.kind === 'station'
                                ? 'ev_station'
                                : 'inventory_2'
                          }
                          className="text-[14px] text-on-surface-variant"
                        />
                        {b.deployment.label}
                      </p>
                      <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                        {b.deployment.detail}
                      </p>
                    </td>

                    <td className="px-space-md py-space-md align-top">
                      <p
                        className={`font-body-sm text-body-sm font-semibold ${
                          b.warranty === 'ready-to-claim'
                            ? 'text-state-warn-text'
                            : b.warranty === 'expired'
                              ? 'text-outline'
                              : 'text-on-surface'
                        }`}
                      >
                        {WARRANTY_LABELS[b.warranty]}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {b.warranty === 'expired' ? 'Out of term' : `${b.warrantyMonthsLeft}m left`}
                      </p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {rows.length === 0 && (
            <EmptyState
              icon="battery_alert"
              title="No packs match these filters"
              body="Clear the tab, chemistry, health, hub or warranty filter to widen the portfolio."
            />
          )}
        </div>

        <div className="font-body-sm text-body-sm flex flex-wrap items-center justify-between gap-space-sm p-space-lg text-on-surface-variant">
          <span>
            Showing <strong className="text-on-surface">{filtered.length === 0 ? 0 : safePage * ROWS_PER_PAGE + 1}</strong>
            –<strong className="text-on-surface">{safePage * ROWS_PER_PAGE + rows.length}</strong> of{' '}
            <strong className="text-on-surface">{filtered.length}</strong> batteries
            <span className="ml-space-md text-outline">{segment.name}</span>
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
