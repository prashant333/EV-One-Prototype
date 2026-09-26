/**
 * Fleet Operations & Telemetry — the landing page.
 * Built to match Design/intellicar_one_ev_platform/fleet_mobility_dashboard.
 *
 * Segment-aware: panels belonging to modules the active segment doesn't get
 * (per the PRD matrix) drop out entirely. Actions are RBAC-gated.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/layout/AppShell'
import { KpiStrip } from '@/components/KpiStrip'
import { ActionButton } from '@/components/ActionButton'
import { MapView } from '@/components/MapView'
import { EmptyState, Icon, Panel, PanelHeader, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import {
  DRIVERS,
  FEATURED_VEHICLES,
  HEALTH_QUEUE,
  SEGMENT_COPY,
  TRIPS,
  UTILISATION_SERIES,
  VEHICLES,
  getDriver,
  getVehicle,
  scopeToHubs,
  type Vehicle,
} from '@/data/fleet'

// --- Live map with telemetry overlay -----------------------------------------

function TelemetryOverlay({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const driver = getDriver(vehicle.driverId)
  const navigate = useNavigate()

  return (
    <div className="panel absolute right-space-md top-space-md z-[500] w-[320px] max-w-[calc(100%-1.5rem)] p-space-md shadow-level-3">
      <div className="mb-space-sm flex items-center justify-between gap-space-sm">
        <span className="font-telemetry-sm text-telemetry-sm flex items-center gap-1.5 font-semibold text-on-surface-variant">
          <span className="h-1.5 w-1.5 animate-pulse rounded-pill bg-state-ok" />
          {vehicle.id}
        </span>
        <div className="flex items-center gap-1">
          {vehicle.activeTripId && (
            <StatusBadge tone="ok">TRIP {vehicle.activeTripId}</StatusBadge>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close telemetry card"
            className="rounded p-0.5 text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        </div>
      </div>

      <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">{vehicle.registration}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {vehicle.model} · Last ping: {vehicle.lastPingSeconds}s ago
      </p>

      {driver && (
        <div className="mt-space-sm flex items-center gap-space-sm rounded-xl bg-surface-container-low p-space-sm">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-primary font-label-sm text-label-sm font-bold text-on-primary">
            {driver.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-body-sm text-body-sm truncate font-semibold text-on-surface">{driver.name}</p>
            <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
              ★ {driver.rating} · {driver.efficiencyPct} wh/km.
            </p>
          </div>
          <Icon name="headset_mic" className="text-[18px] text-primary" />
        </div>
      )}

      <div className="mt-space-sm grid grid-cols-2 gap-space-sm">
        {[
          { label: 'Speed', value: `${vehicle.speedKmh} km/h` },
          { label: 'State of Charge', value: `${vehicle.soc}% (${vehicle.rangeKm} km)` },
          { label: 'Motor Temp', value: `${vehicle.motorTempC.toFixed(1)}°C` },
          { label: 'Battery Pack', value: `${vehicle.packTempC.toFixed(1)}°C` },
        ].map((cell) => (
          <div key={cell.label} className="rounded-xl bg-surface-container-low p-space-sm">
            <p className="font-label-sm text-label-sm uppercase text-outline">{cell.label}</p>
            <p className="font-telemetry-md text-telemetry-md tnum font-semibold text-on-surface">{cell.value}</p>
          </div>
        ))}
      </div>

      <div className="font-telemetry-sm text-telemetry-sm mt-space-sm flex items-center justify-between text-on-surface-variant">
        <span>Odometer: {vehicle.odometerKm.toLocaleString()} km</span>
        <span>Cell Deviation: &lt;{vehicle.cellDeviationMv} mV</span>
      </div>

      {/* Pack analytics moved to Cluster 2 (Asset Intelligence & Finance) along
          with the Battery module, so this rail links to health & telemetry only. */}
      <div className="mt-space-sm flex flex-col gap-space-xs">
        <ActionButton
          variant="primary"
          icon="arrow_forward"
          module="vehicle-telemetry"
          requires="view"
          size="compact"
          className="w-full justify-center"
          onClick={() => navigate('/vehicles-health')}
        >
          View Full Telemetry Stream
        </ActionButton>
        <ActionButton
          variant="secondary"
          icon="monitor_heart"
          module="vehicle-telemetry"
          requires="view"
          size="compact"
          className="w-full justify-center"
          onClick={() => navigate('/vehicles-health')}
        >
          Open {vehicle.id} Health Record
        </ActionButton>
      </div>
    </div>
  )
}

function LiveMapPanel({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedId, setSelectedId] = useState<string | null>('VEH-2210')
  const selected = selectedId ? getVehicle(selectedId) : undefined

  return (
    <Panel padded={false} className="relative overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/30 p-space-sm">
        <ActionButton icon="download" module="reports-analytics" requires="view" size="compact">
          Export Telemetry CSV
        </ActionButton>
        <ActionButton icon="podcasts" module="operational-alerts" size="compact">
          Dispatch Broadcast
        </ActionButton>
        <ActionButton icon="add_circle" variant="primary" module="assets-registry" size="compact">
          Onboard Vehicle
        </ActionButton>
      </div>

      <div className="relative h-[420px]">
        <MapView
          vehicles={vehicles}
          selectedId={selectedId}
          onSelect={setSelectedId}
          className="h-full w-full"
        />
        {selected && <TelemetryOverlay vehicle={selected} onClose={() => setSelectedId(null)} />}

        <div className="panel absolute bottom-space-md left-space-md z-[500] flex flex-wrap items-center gap-space-md px-space-md py-space-sm">
          {[
            { label: 'Trip In-Progress', color: 'bg-primary' },
            { label: 'Returning to Staging', color: 'bg-state-idle' },
            { label: 'Critical Anomaly', color: 'bg-state-crit' },
          ].map((item) => (
            <span
              key={item.label}
              className="font-body-sm text-body-sm flex items-center gap-1.5 text-on-surface-variant"
            >
              <span className={`h-2 w-2 rounded-pill ${item.color}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  )
}

// --- Right rail panels -------------------------------------------------------

function UtilisationPanel() {
  const [range, setRange] = useState('Today')

  return (
    <Panel>
      <PanelHeader
        title="Fleet Utilisation & Duty Cycle"
        subtitle="Hourly aggregated operational load"
        action={
          <div className="flex items-center gap-1 rounded-xl bg-surface-container-low p-0.5">
            {['Today', '7 Days', '30 Days'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`font-label-sm text-label-sm rounded-lg px-2 py-1 transition-colors ${
                  range === r ? 'bg-surface-container-lowest font-bold text-primary shadow-level-1' : 'text-on-surface-variant'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-space-sm grid grid-cols-2 gap-space-sm">
        {[
          { icon: 'arrow_upward', text: 'Peak 1: 88% at 11:00 AM' },
          { icon: 'arrow_upward', text: 'Peak 2: 92% at 6:00 PM' },
        ].map((p) => (
          <span
            key={p.text}
            className="font-body-sm text-body-sm flex items-center gap-1.5 rounded-xl bg-surface-container-low px-space-sm py-1.5 text-on-surface-variant"
          >
            <Icon name={p.icon} className="text-[14px] text-primary" />
            {p.text}
          </span>
        ))}
      </div>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={UTILISATION_SERIES} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="utilFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0037b0" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#0037b0" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e7ff" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #c4c5d7',
                fontFamily: 'Inter',
                fontSize: 12,
              }}
              formatter={(v: number, name: string) => [`${v}%`, name === 'today' ? 'Today' : 'Baseline']}
            />
            <Area
              type="monotone"
              dataKey="today"
              stroke="#0037b0"
              strokeWidth={2}
              fill="url(#utilFill)"
              name="today"
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#747686"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              fill="none"
              name="baseline"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

function SafetyLeaderboard() {
  const leaders = [...DRIVERS].sort((a, b) => b.safetyScore - a.safetyScore).slice(0, 3)

  const gradeTone = (grade: string) => (grade === 'Elite' ? 'ok' : grade === 'Grade A' ? 'info' : 'crit')

  return (
    <Panel>
      <PanelHeader
        title="Safety & Efficiency Leaderboard"
        subtitle="Telemetry-graded driving behavior"
        action={<StatusBadge tone="ok">Harsh Events: −42% YoY</StatusBadge>}
      />

      <ul className="space-y-space-sm">
        {leaders.map((driver, i) => (
          <li key={driver.id} className="flex items-center gap-space-sm">
            <span
              className={`font-telemetry-sm text-telemetry-sm flex h-6 w-6 shrink-0 items-center justify-center rounded-pill font-bold ${
                i === 0 ? 'bg-state-ok-fill text-state-ok-text' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-body-sm text-body-sm truncate font-semibold text-on-surface">{driver.name}</p>
              <p
                className={`font-telemetry-sm text-telemetry-sm truncate ${
                  driver.grade === 'Flagged' ? 'text-state-crit' : 'text-on-surface-variant'
                }`}
              >
                {driver.id} · {driver.harshEventLabel}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-telemetry-md text-telemetry-md tnum font-semibold text-primary">
                {driver.safetyScore}/100
              </p>
              <p className="font-telemetry-sm text-telemetry-sm tnum text-on-surface-variant">
                {driver.efficiencyWhKm} Wh/km
              </p>
            </div>
            <StatusBadge tone={gradeTone(driver.grade) as 'ok' | 'info' | 'crit'} className="shrink-0">
              {driver.grade}
            </StatusBadge>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function PredictiveHealthQueue() {
  const toneFor = (severity: string) =>
    severity === 'critical' ? 'crit' : severity === 'warning' ? 'warn' : 'idle'

  return (
    <Panel>
      <PanelHeader
        title="Predictive Fleet Health Queue"
        subtitle="AI-Driven maintenance triage"
        action={<StatusBadge tone="crit">3 Critical</StatusBadge>}
      />

      <ul className="space-y-space-sm">
        {HEALTH_QUEUE.map((item) => (
          <li
            key={item.id}
            className={`rounded-xl border p-space-sm ${
              item.severity === 'critical'
                ? 'border-state-crit-border bg-state-crit-fill'
                : 'border-outline-variant/40 bg-surface-container-low'
            }`}
          >
            <div className="mb-space-xs flex flex-wrap items-center justify-between gap-space-xs">
              <span className="font-body-sm text-body-sm flex items-center gap-1.5 font-semibold text-on-surface">
                <Icon
                  name={item.severity === 'critical' ? 'warning' : 'schedule'}
                  className={`text-[16px] ${item.severity === 'critical' ? 'text-state-crit' : 'text-on-surface-variant'}`}
                />
                {item.registration}
                <span className="font-telemetry-sm text-telemetry-sm font-normal text-on-surface-variant">
                  {item.vehicleId}
                </span>
              </span>
              <StatusBadge tone={toneFor(item.severity) as 'crit' | 'warn' | 'idle'}>{item.riskLabel}</StatusBadge>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">{item.detail}</p>

            <div className="mt-space-sm flex flex-wrap items-center justify-between gap-space-sm">
              <span
                className={`font-body-sm text-body-sm ${
                  item.severity === 'critical' ? 'font-semibold text-state-crit' : 'text-on-surface-variant'
                }`}
              >
                {item.footnote}
              </span>
              <ActionButton
                module={item.actionModule}
                variant={item.severity === 'critical' ? 'destructive' : 'secondary'}
                size="compact"
              >
                {item.action}
              </ActionButton>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

// --- Trips and diagnostics ---------------------------------------------------

const TRIP_TABS = [
  { id: 'all', label: 'All', count: 849 },
  { id: 'on-time', label: 'On-time', count: 712 },
  { id: 'delayed', label: 'Delayed', count: 94 },
  { id: 'completed', label: 'Completed', count: 43 },
]

function ActiveTripsPanel() {
  const [tab, setTab] = useState('all')
  const navigate = useNavigate()

  const rows = TRIPS.filter((t) => (tab === 'all' ? true : t.status === tab))

  return (
    <Panel padded={false}>
      <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-lg pb-space-sm">
        <div className="flex items-center gap-space-sm">
          <Icon name="swap_driving_apps_wheel" className="text-[20px] text-primary" />
          <div>
            <h2 className="font-headline-sm text-headline-sm font-semibold">Active & Ongoing Trips</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Real-time dispatch route telemetry and driver transit tracking
            </p>
          </div>
          <StatusBadge tone="info">849 Active Trips</StatusBadge>
        </div>

        <div className="flex items-center gap-2">
          <ActionButton icon="sync" module="routes-corridors" size="compact">
            Sync Routes
          </ActionButton>
          <ActionButton
            icon="open_in_new"
            variant="primary"
            size="compact"
            onClick={() => navigate('/vehicles-trips')}
          >
            View All Active Trips
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-space-xs border-b border-outline-variant/30 px-space-lg pb-space-sm">
        {TRIP_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`font-body-sm text-body-sm rounded-xl px-space-md py-1.5 transition-colors ${
              tab === t.id
                ? 'bg-primary-fixed font-semibold text-on-primary-fixed'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-surface">
              {['Vehicle Number', 'Trip ID', 'Driver Name', 'Route Name', 'Status'].map((h) => (
                <th
                  key={h}
                  className="font-label-sm text-label-sm border-b border-outline-variant/40 px-space-lg py-space-sm text-left uppercase text-on-surface-variant"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((trip) => {
              const vehicle = getVehicle(trip.vehicleId)
              const driver = getDriver(trip.driverId)
              return (
                <tr
                  key={trip.id}
                  onClick={() => navigate('/vehicles-trips')}
                  className="cursor-pointer border-b border-surface-container-high transition-colors hover:bg-surface"
                >
                  <td className="px-space-lg py-space-sm">
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface">
                      {vehicle?.registration}
                    </p>
                    <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">{vehicle?.model}</p>
                  </td>
                  <td className="font-telemetry-sm text-telemetry-sm px-space-lg py-space-sm font-semibold text-primary">
                    {trip.tripCode}
                  </td>
                  <td className="px-space-lg py-space-sm">
                    <span className="font-body-sm text-body-sm flex items-center gap-space-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-primary-fixed font-label-sm text-label-sm font-bold text-on-primary-fixed">
                        {driver?.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                      {driver?.name}
                    </span>
                  </td>
                  <td className="font-body-sm text-body-sm max-w-[220px] truncate px-space-lg py-space-sm text-on-surface-variant">
                    {trip.routeName}
                  </td>
                  <td className="px-space-lg py-space-sm">
                    {trip.status === 'delayed' ? (
                      <StatusBadge tone="crit" pulse>
                        Delayed (+{trip.driftMinutes}m)
                      </StatusBadge>
                    ) : trip.status === 'completed' ? (
                      <StatusBadge tone="idle">Complete</StatusBadge>
                    ) : (
                      <StatusBadge tone="ok" pulse>
                        On-time
                      </StatusBadge>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <EmptyState
            icon="search_off"
            title="No trips in this state"
            body="No trips match the selected tab for the current scope filters."
          />
        )}
      </div>

      <div className="font-body-sm text-body-sm flex items-center justify-between p-space-lg text-on-surface-variant">
        <span>Showing {rows.length} of 849 ongoing trips</span>
        <span className="flex items-center gap-space-sm">
          <button type="button" className="rounded-lg px-2 py-1 hover:bg-surface-container" disabled>
            Previous
          </button>
          <span className="font-telemetry-sm text-telemetry-sm">1 of 170</span>
          <button type="button" className="rounded-lg px-2 py-1 hover:bg-surface-container">
            Next
          </button>
        </span>
      </div>
    </Panel>
  )
}

function DiagnosticsManifest({ vehicles }: { vehicles: Vehicle[] }) {
  const [filter, setFilter] = useState('')

  const rows = vehicles.filter((v) =>
    filter
      ? `${v.registration} ${v.id} ${v.vin} ${v.hub}`.toLowerCase().includes(filter.toLowerCase())
      : true,
  )

  const statusBadge = (v: Vehicle) => {
    switch (v.status) {
      case 'thermal-alert':
        return <StatusBadge tone="crit" pulse>Thermal Alert</StatusBadge>
      case 'on-trip':
        return <StatusBadge tone="ok" pulse>On Trip {v.activeTripId}</StatusBadge>
      case 'charging':
        return <StatusBadge tone="ok">Charging</StatusBadge>
      case 'staging':
        return <StatusBadge tone="idle">Staging Hub</StatusBadge>
      default:
        return <StatusBadge tone="idle">Offline</StatusBadge>
    }
  }

  return (
    <Panel padded={false}>
      <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-lg pb-space-sm">
        <div className="flex items-center gap-space-sm">
          <Icon name="format_list_bulleted" className="text-[20px] text-primary" />
          <div>
            <h2 className="font-headline-sm text-headline-sm font-semibold">Live Fleet Diagnostics Manifest</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Streaming real-time CAN bus telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[16px] text-outline"
            />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter current list..."
              className="font-body-sm text-body-sm h-9 w-full min-w-[200px] rounded-xl border border-outline-variant bg-surface-container-lowest pl-8 pr-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <ActionButton icon="filter_alt" size="compact">
            Filter
          </ActionButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="bg-surface">
              {['Asset / VIN', 'Status', 'Driver Assignee', 'Battery SoC', 'Speed', 'Pack Temp', 'Efficiency', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-lg py-space-sm uppercase text-on-surface-variant ${
                      ['Battery SoC', 'Speed', 'Pack Temp', 'Efficiency'].includes(h) ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => {
              const driver = getDriver(v.driverId)
              return (
                <tr key={v.id} className="border-b border-surface-container-high transition-colors hover:bg-surface">
                  <td className="px-space-lg py-space-sm">
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface">{v.registration}</p>
                    <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                      {v.id} · {v.vin}
                    </p>
                  </td>
                  <td className="px-space-lg py-space-sm">{statusBadge(v)}</td>
                  <td className="font-body-sm text-body-sm px-space-lg py-space-sm">
                    {driver ? (
                      driver.name
                    ) : (
                      <span className="italic text-outline">Unassigned</span>
                    )}
                  </td>
                  {/* Numeric telemetry: right-aligned tabular figures per DESIGN.md */}
                  <td className="font-telemetry-md text-telemetry-md tnum px-space-lg py-space-sm text-right">
                    <span className={v.soc < 25 ? 'font-bold text-state-crit' : 'font-semibold text-state-ok'}>
                      {v.soc}%
                    </span>
                    <span className="text-on-surface-variant"> ({v.rangeKm} km)</span>
                  </td>
                  <td className="font-telemetry-md text-telemetry-md tnum px-space-lg py-space-sm text-right">
                    {v.speedKmh} km/h
                  </td>
                  <td
                    className={`font-telemetry-md text-telemetry-md tnum px-space-lg py-space-sm text-right ${
                      v.packTempC > 45 ? 'font-bold text-state-crit' : ''
                    }`}
                  >
                    {v.packTempC.toFixed(1)}°C
                  </td>
                  <td
                    className={`font-telemetry-md text-telemetry-md tnum px-space-lg py-space-sm text-right ${
                      v.efficiencyWhKm && v.efficiencyWhKm > 110 ? 'font-bold text-state-crit' : ''
                    }`}
                  >
                    {v.efficiencyWhKm ? `${v.efficiencyWhKm} Wh/km` : '--'}
                  </td>
                  <td className="px-space-lg py-space-sm">
                    <div className="flex items-center justify-end gap-1">
                      <ActionButton
                        variant="ghost"
                        icon="query_stats"
                        module="vehicle-telemetry"
                        requires="view"
                        size="compact"
                        className="!px-2"
                      >
                        <span className="sr-only">Telemetry</span>
                      </ActionButton>
                      <ActionButton
                        variant="ghost"
                        icon={v.status === 'thermal-alert' ? 'power_settings_new' : 'podcasts'}
                        module="operational-alerts"
                        size="compact"
                        className="!px-2"
                      >
                        <span className="sr-only">Action</span>
                      </ActionButton>
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
            title="No assets match this filter"
            body="Clear the filter, or widen the region and site scope in the top bar."
          />
        )}
      </div>

      <div className="font-body-sm text-body-sm flex items-center justify-between p-space-lg text-on-surface-variant">
        {/* <span>
          Displaying 1 – {rows.length} of {vehicles.length.toLocaleString()} Active Assets
        </span> */}
        <span className="flex items-center gap-space-sm">
          <button type="button" className="rounded-lg px-2 py-1 hover:bg-surface-container" disabled>
            Previous
          </button>
          <span className="font-telemetry-sm text-telemetry-sm">Page 1 of 474</span>
          <button type="button" className="rounded-lg px-2 py-1 hover:bg-surface-container">
            Next
          </button>
        </span>
      </div>
    </Panel>
  )
}

// --- Page --------------------------------------------------------------------

export function DashboardPage() {
  const { segmentId, role, visibleModules } = useWorkspace()
  const copy = SEGMENT_COPY[segmentId]

  // PRD: "This access can be given per asset as well."
  const scopedVehicles = scopeToHubs(VEHICLES, role.assetScope.hubs)

  const hasTrips = visibleModules.some((m) => m.id === 'vehicles-trips')
  const hasDriverAnalytics = visibleModules.some((m) => m.id === 'driver-analytics')
  const hasMaintenance = visibleModules.some((m) => m.id === 'maintenance')

  return (
    <>
      <PageHeader
        title={copy.pageTitle}
        breadcrumb={copy.breadcrumb}
        live
        liveLabel="Live"
        actions={
          <>
            <ActionButton icon="podcasts" module="operational-alerts">
              Dispatch Broadcast
            </ActionButton>
            <ActionButton icon="add_circle" variant="primary" module="assets-registry">
              Onboard Vehicle
            </ActionButton>
          </>
        }
      />

      {/* Shown only for hub-restricted roles, so a short vehicle list reads as
          a permission boundary rather than missing data. */}
      {role.assetScope.kind === 'hubs' && (
        <div className="mb-space-md flex justify-end">
          <StatusBadge tone="warn">
            <Icon name="lock" className="text-[12px]" />
            Scoped to {role.assetScope.hubs?.join(', ')}
          </StatusBadge>
        </div>
      )}

      <KpiStrip />

      <div className="grid grid-cols-1 gap-space-md xl:grid-cols-3">
        <div className="flex flex-col gap-space-md xl:col-span-2">
          <LiveMapPanel vehicles={scopedVehicles} />

          {/* <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
            {[
              { icon: 'ev_station', label: 'Indiranagar Station', value: '18 Swaps / Hr' },
              { icon: 'local_shipping', label: 'Delivery SLA On-time', value: '97.8% On-Time' },
              { icon: 'eco', label: 'Carbon Offsets', value: '4.82 Metric Tons' },
            ].map((s) => (
              <Panel key={s.label} className="flex items-center gap-space-sm !p-space-md">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-low">
                  <Icon name={s.icon} className="text-[20px] text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="font-body-sm text-body-sm truncate font-semibold text-on-surface">{s.label}</p>
                  <p className="font-telemetry-sm text-telemetry-sm truncate text-on-surface-variant">{s.value}</p>
                </div>
              </Panel>
            ))}
          </div> */}

          {/* Dropped entirely for Vehicle OEM — the PRD matrix withholds trips. */}
          {hasTrips && <ActiveTripsPanel />}
        </div>

        <div className="flex flex-col gap-space-md">
          <UtilisationPanel />
          {hasDriverAnalytics && <SafetyLeaderboard />}
          {hasMaintenance && <PredictiveHealthQueue />}
        </div>
      </div>

      {/* The manifest stays on the designed set; the full roster lives on
          Vehicles and Health, which has the filters and pagination for it. */}
      <div className="mt-space-md">
        <DiagnosticsManifest vehicles={scopeToHubs(FEATURED_VEHICLES, role.assetScope.hubs)} />
      </div>
    </>
  )
}
