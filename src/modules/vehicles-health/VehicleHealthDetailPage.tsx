/**
 * Vehicles and Health — individual vehicle record.
 * Built to match Design/.../vehicle_health_details_intellicar_one.
 *
 * Five tabs, all populated: Health & Diagnostics, Trip History, Charging
 * History, Driver Assignment & Score, Maintenance & Service.
 */

import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ActionButton } from '@/components/ActionButton'
import { EmptyState, Icon, Panel, PanelHeader, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { getDriver, getVehicle, type Vehicle } from '@/data/fleet'
import {
  ASSIGNED_DRIVER,
  CHARGING_SESSIONS,
  CHARGING_SUMMARY,
  COMPLETED_TRIPS,
  DIGITAL_TWIN,
  DTC_PANEL,
  LIVE_TRIP,
  SCHEDULED_SERVICE,
  SIGNAL_GROUPS,
  SIGNAL_SAMPLES,
  SIGNAL_WINDOW,
  SUBSYSTEM_CARDS,
  WORK_ORDERS,
} from '@/data/health'

type TabId = 'diagnostics' | 'trips' | 'charging' | 'driver' | 'maintenance'

const TABS: Array<{ id: TabId; label: string; icon: string; badge?: string; dot?: boolean }> = [
  { id: 'diagnostics', label: 'Health & Diagnostics', icon: 'health_and_safety' },
  { id: 'trips', label: 'Trip History', icon: 'swap_driving_apps_wheel', badge: '4' },
  { id: 'charging', label: 'Charging History', icon: 'ev_station' },
  { id: 'driver', label: 'Driver Assignment & Score', icon: 'person' },
  { id: 'maintenance', label: 'Maintenance & Service', icon: 'build', dot: true },
]

const STATE_TONES = {
  ok: 'bg-state-ok-fill text-state-ok-text border-state-ok-border',
  warn: 'bg-state-warn-fill text-state-warn-text border-state-warn-border',
  crit: 'bg-state-crit-fill text-state-crit-text border-state-crit-border',
  info: 'bg-primary-fixed text-on-primary-fixed border-primary-fixed-dim',
} as const

// --- Header ------------------------------------------------------------------

function VehicleHeader({ vehicle }: { vehicle: Vehicle }) {
  const navigate = useNavigate()
  const { cluster } = useWorkspace()
  const driver = getDriver(vehicle.driverId)

  return (
    <Panel className="mb-space-md">
      <nav className="font-label-sm text-label-sm mb-space-sm flex flex-wrap items-center gap-space-xs uppercase tracking-wider text-on-surface-variant">
        <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-on-surface">
          Workspaces
        </button>
        <Icon name="chevron_right" className="text-[14px]" />
        <span>{cluster.name}</span>
        <Icon name="chevron_right" className="text-[14px]" />
        <button type="button" onClick={() => navigate('/vehicles-health')} className="hover:text-on-surface">
          Vehicle Health
        </button>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="font-telemetry-sm text-telemetry-sm rounded bg-primary-fixed px-1.5 py-0.5 normal-case text-on-primary-fixed">
          {vehicle.registration}
        </span>
        <span className="font-telemetry-sm text-telemetry-sm normal-case text-outline">({vehicle.id})</span>

        <span className="ml-auto flex flex-wrap items-center gap-space-sm normal-case">
          <span className="font-telemetry-sm text-telemetry-sm flex items-center gap-1 rounded-lg bg-surface-container-low px-2 py-0.5 text-on-surface-variant">
            <Icon name="router" className="text-[14px]" />
            TCU Firmware: {vehicle.firmwareVersion}
          </span>
          <StatusBadge tone="ok" pulse>
            Packet Age: {vehicle.lastPingSeconds * 105}ms
          </StatusBadge>
        </span>
      </nav>

      <div className="flex flex-col gap-space-md xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
            {vehicle.registration}
          </h1>

          <div className="mt-space-sm flex flex-wrap items-center gap-space-sm">
            <span className="font-body-sm text-body-sm rounded-lg bg-primary-fixed px-2 py-1 font-semibold text-on-primary-fixed">
              {vehicle.model} ({vehicle.fleetType})
            </span>
            <StatusBadge tone="ok" pulse>
              CAN Telemetry Online · 1s sync
            </StatusBadge>
            <span className="font-telemetry-sm text-telemetry-sm rounded-lg bg-surface-container-low px-2 py-1 text-on-surface-variant">
              Node ID #N-{vehicle.id.replace('VEH-', '')}
            </span>
          </div>

          <dl className="font-body-sm text-body-sm mt-space-md grid grid-cols-1 gap-x-space-lg gap-y-space-xs sm:grid-cols-2">
            <div className="flex gap-space-sm">
              <dt className="font-label-sm text-label-sm uppercase text-outline">VIN</dt>
              <dd className="font-telemetry-sm text-telemetry-sm text-on-surface">{vehicle.vin}</dd>
            </div>
            <div className="flex gap-space-sm">
              <dt className="font-label-sm text-label-sm uppercase text-outline">Odometer</dt>
              <dd className="font-telemetry-sm text-telemetry-sm text-on-surface">
                {vehicle.odometerKm.toLocaleString()} km
              </dd>
            </div>
            <div className="flex gap-space-sm">
              <dt className="font-label-sm text-label-sm uppercase text-outline">Depot</dt>
              <dd className="text-on-surface">{vehicle.hub}</dd>
            </div>
            <div className="flex gap-space-sm">
              <dt className="font-label-sm text-label-sm uppercase text-outline">Assigned Driver</dt>
              <dd className="text-primary">
                {driver ? `${driver.name} (#${driver.id})` : 'Unassigned'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm xl:shrink-0">
          <ActionButton icon="browser_updated" variant="primary" module="fota">
            Push FOTA v4.2.1
          </ActionButton>
          <ActionButton icon="event" module="maintenance">
            Schedule Inspection
          </ActionButton>
          <ActionButton icon="download" module="reports-analytics" requires="view">
            MDF4 Telemetry
          </ActionButton>
          <ActionButton icon="power_settings_new" variant="destructive" module="maintenance">
            Remote Immobilize
          </ActionButton>
        </div>
      </div>
    </Panel>
  )
}

function SummaryCards({ vehicle }: { vehicle: Vehicle }) {
  const gradeLabel = { A: 'Grade A · Nominal', B: 'Grade B · Watch', C: 'Grade C · Critical' }[vehicle.healthGrade]
  const gradeTone = vehicle.healthGrade === 'A' ? 'ok' : vehicle.healthGrade === 'B' ? 'info' : 'crit'

  return (
    <div className="mb-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-5">
      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase text-outline">Health Index</span>
          <Icon name="verified" className="text-[18px] text-state-ok" />
        </div>
        <div className="flex flex-wrap items-baseline gap-space-sm">
          <span className="font-telemetry-lg text-telemetry-lg tnum font-bold">{vehicle.healthScore}%</span>
          <StatusBadge tone={gradeTone}>{gradeLabel}</StatusBadge>
        </div>
        <div className="mt-space-sm h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
          <div className="h-full rounded-pill bg-state-ok" style={{ width: `${vehicle.healthScore}%` }} />
        </div>
        <p className="font-body-sm text-body-sm mt-space-xs text-on-surface-variant">
          {vehicle.dtcs.length === 0
            ? 'Zero critical thermal or voltage deviations'
            : `${vehicle.dtcs.length} active fault code(s)`}
        </p>
      </Panel>

      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase text-outline">Battery Pack SoC</span>
          <Icon name="battery_charging_full" className="text-[18px] text-primary" />
        </div>
        <div className="flex items-baseline gap-space-sm">
          <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-primary">{vehicle.soc}%</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">~{vehicle.rangeKm} km range</span>
        </div>
        <div className="mt-space-sm h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
          <div className="h-full rounded-pill bg-primary" style={{ width: `${vehicle.soc}%` }} />
        </div>
        <p className="font-telemetry-sm text-telemetry-sm mt-space-xs text-on-surface-variant">
          Temp: {vehicle.packTempC.toFixed(1)}°C ΔV: {vehicle.cellDeviationMv} mV
        </p>
      </Panel>

      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase text-outline">Motor & Inverter</span>
          <Icon name="bolt" className="text-[18px] text-secondary" />
        </div>
        <div className="flex flex-wrap items-baseline gap-space-sm">
          <span className="font-telemetry-lg text-telemetry-lg tnum font-bold">
            {vehicle.motorTempC.toFixed(1)}°C
          </span>
          <StatusBadge tone={vehicle.motorLabel === 'Thermal Warning' ? 'crit' : 'idle'}>
            {vehicle.motorLabel === 'Thermal Warning' ? 'Thermal' : 'Normal'}
          </StatusBadge>
        </div>
        <dl className="font-telemetry-sm text-telemetry-sm mt-space-sm space-y-1 text-on-surface-variant">
          <div className="flex justify-between">
            <dt>Stator Core:</dt>
            <dd className="tnum text-on-surface">51.2°C</dd>
          </div>
          <div className="flex justify-between">
            <dt>IGBT Heat Sink:</dt>
            <dd className="tnum text-on-surface">42.1°C</dd>
          </div>
        </dl>
      </Panel>

      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase text-outline">Efficiency</span>
          <Icon name="eco" className="text-[18px] text-state-ok" />
        </div>
        <div className="flex items-baseline gap-space-xs">
          <span className="font-telemetry-lg text-telemetry-lg tnum font-bold">
            {vehicle.efficiencyWhKm ?? '--'}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Wh/km</span>
        </div>
        <p className="font-body-sm text-body-sm mt-space-sm flex items-center gap-1 text-state-ok">
          <Icon name="trending_down" className="text-[14px]" />
          −8.4% vs Fleet Average
        </p>
        <p className="font-body-sm text-body-sm mt-space-xs text-on-surface-variant">
          Target benchmark: &lt;102 Wh/km
        </p>
      </Panel>

      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase text-outline">Mission State</span>
          <span className="h-2 w-2 rounded-pill bg-primary" />
        </div>
        <div className="flex flex-wrap items-baseline gap-space-sm">
          <span className="font-headline-md text-headline-md font-bold">
            {vehicle.status === 'on-trip'
              ? 'On Trip'
              : vehicle.status === 'charging'
                ? 'Charging'
                : vehicle.status === 'thermal-alert'
                  ? 'Thermal Alert'
                  : 'Staging'}
          </span>
          {vehicle.activeTripId && (
            <span className="font-telemetry-sm text-telemetry-sm text-primary">#{vehicle.activeTripId}</span>
          )}
        </div>
        <dl className="font-telemetry-sm text-telemetry-sm mt-space-sm space-y-1 text-on-surface-variant">
          <div className="flex justify-between gap-space-sm">
            <dt>Current Speed:</dt>
            <dd className="tnum text-on-surface">{vehicle.speedKmh} km/h</dd>
          </div>
          <div className="flex justify-between gap-space-sm">
            <dt>Geofence:</dt>
            <dd className="truncate text-on-surface">{vehicle.hub} (In)</dd>
          </div>
        </dl>
      </Panel>
    </div>
  )
}

// --- Telemetry oscilloscope --------------------------------------------------

/**
 * Multi-signal CAN scope. Each group shares a scale so the traces are directly
 * comparable; groups mixing units get a second axis rather than being squashed
 * onto one. ComposedChart is required — Area and Line siblings inside AreaChart
 * are silently dropped by Recharts.
 */
function OscilloscopePanel() {
  const [groupId, setGroupId] = useState(SIGNAL_GROUPS[0].id)
  const group = SIGNAL_GROUPS.find((g) => g.id === groupId) ?? SIGNAL_GROUPS[0]

  return (
    <Panel className="xl:col-span-2">
      <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary">Telemetry Oscilloscope</p>

      <div className="mb-space-sm flex flex-wrap items-start justify-between gap-space-sm">
        <div>
          <h3 className="font-headline-md text-headline-md font-semibold">{group.headline}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{group.description}</p>
        </div>
        <span className="font-telemetry-sm text-telemetry-sm rounded-lg bg-surface-container-low px-2 py-1 text-on-surface-variant">
          Last 15m
        </span>
      </div>

      {/* Signal group selector */}
      <div className="mb-space-md flex flex-wrap items-center gap-space-xs rounded-xl bg-surface-container-low p-1">
        {SIGNAL_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroupId(g.id)}
            className={`font-body-sm text-body-sm flex items-center gap-1.5 whitespace-nowrap rounded-lg px-space-md py-1.5 transition-colors ${
              g.id === groupId
                ? 'bg-surface-container-lowest font-semibold text-primary shadow-level-1'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon name={g.icon} className="text-[16px]" />
            {g.label}
          </button>
        ))}
      </div>

      {/* Live value chips */}
      <div className="mb-space-sm flex flex-wrap gap-space-xs">
        {group.series.map((s) => (
          <span
            key={s.key}
            className="font-telemetry-sm text-telemetry-sm flex items-center gap-1.5 rounded-lg bg-surface-container-low px-2 py-1"
          >
            <span className="h-1.5 w-1.5 rounded-pill" style={{ background: s.color }} />
            <span className="text-on-surface-variant">{s.label}</span>
            <span className="font-semibold text-on-surface">{s.current}</span>
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm">
        <div className="font-telemetry-sm text-telemetry-sm mb-1 flex justify-between text-outline">
          <span>{SIGNAL_WINDOW.start}</span>
          {SIGNAL_WINDOW.marks.map((m) => (
            <span key={m} className="hidden sm:inline">
              {m}
            </span>
          ))}
          <span>{SIGNAL_WINDOW.end}</span>
        </div>

        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={SIGNAL_SAMPLES} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
              <defs>
                {group.series
                  .filter((s) => s.render === 'area')
                  .map((s) => (
                    <linearGradient key={s.key} id={`fill-${group.id}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.color} stopOpacity={0.24} />
                      <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
              </defs>

              <CartesianGrid stroke="#e2e7ff" vertical={false} />

              <XAxis
                dataKey="t"
                tick={{ fontSize: 9, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                interval={11}
              />

              <YAxis
                yAxisId="left"
                domain={group.left.domain}
                tick={{ fontSize: 9, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                width={46}
              />
              {group.right && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={group.right.domain}
                  tick={{ fontSize: 9, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={false}
                  width={46}
                />
              )}

              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #c4c5d7', fontFamily: 'Inter', fontSize: 12 }}
                labelFormatter={(v) => `T+${v}`}
                formatter={(value: number, name: string) => {
                  const s = group.series.find((x) => x.label === name)
                  return [`${value} ${s?.unit ?? ''}`, name]
                }}
              />

              {group.series.map((s) =>
                s.render === 'area' ? (
                  <Area
                    key={s.key}
                    yAxisId={s.axis}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    fill={`url(#fill-${group.id}-${s.key})`}
                    isAnimationActive={false}
                  />
                ) : (
                  <Line
                    key={s.key}
                    yAxisId={s.axis}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={1.75}
                    strokeDasharray={s.dashed ? '4 3' : undefined}
                    dot={false}
                    isAnimationActive={false}
                  />
                ),
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="font-telemetry-sm text-telemetry-sm mt-1 flex flex-wrap items-center justify-between gap-space-sm text-outline">
          <span>{group.scaleNote}</span>
          <span className="flex items-center gap-1.5 text-state-ok">
            <span className="h-1.5 w-1.5 rounded-pill bg-state-ok" />
            {group.qualityNote}
          </span>
        </div>
      </div>

      <p className="font-telemetry-sm text-telemetry-sm mt-space-xs text-outline">{SIGNAL_WINDOW.resolution}</p>

      <div className="mt-space-md grid grid-cols-1 gap-space-sm sm:grid-cols-3">
        {group.stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm">
            <p className="font-label-sm text-label-sm uppercase text-outline">{s.label}</p>
            <p className="font-telemetry-md text-telemetry-md tnum font-semibold text-on-surface">{s.value}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{s.caption}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// --- Tab: Health & Diagnostics ----------------------------------------------

function DiagnosticsTab() {
  return (
    <div className="flex flex-col gap-space-md">
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-5">
        {SUBSYSTEM_CARDS.map((card) => (
          <Panel key={card.name} className="!p-space-md">
            <div className="mb-space-sm flex flex-wrap items-center gap-space-sm">
              <Icon name={card.icon} className="text-[18px] text-primary" />
              <h3 className="font-headline-sm text-headline-sm font-semibold">{card.name}</h3>
              <span
                className={`font-label-sm text-label-sm rounded border px-1.5 py-0.5 uppercase ${STATE_TONES[card.stateTone]}`}
              >
                {card.state}
              </span>
            </div>
            <dl className="font-telemetry-sm text-telemetry-sm space-y-1.5">
              {card.rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-space-sm">
                  <dt className="text-on-surface-variant">{row.label}:</dt>
                  <dd className="tnum shrink-0 font-semibold text-on-surface">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-space-md xl:grid-cols-3">
        <OscilloscopePanel />

        <div className="flex flex-col gap-space-md">
          <Panel>
            <div className="mb-space-sm flex items-center justify-between gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Digital Twin Snapshot
              </span>
              <StatusBadge tone="info">{DIGITAL_TWIN.payloadLabel}</StatusBadge>
            </div>

            {/* Placeholder rather than a hotlinked asset — see README. */}
            <div className="relative overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container">
              <svg viewBox="0 0 320 150" className="h-[150px] w-full" role="img" aria-label="Vehicle schematic">
                <rect width="320" height="150" fill="#eaedff" />
                <line x1="0" y1="118" x2="320" y2="118" stroke="#c4c5d7" strokeWidth="2" />
                {/* charge post */}
                <rect x="34" y="52" width="20" height="66" rx="4" fill="#dae2fd" stroke="#0037b0" strokeWidth="1.5" />
                <circle cx="44" cy="64" r="4" fill="#0037b0" />
                <path d="M62 78 q16 0 16 14" stroke="#0037b0" strokeWidth="2" fill="none" strokeDasharray="4 3" />
                {/* cargo body */}
                <rect x="120" y="42" width="140" height="56" rx="5" fill="#ffffff" stroke="#0037b0" strokeWidth="2" />
                {/* cab */}
                <path d="M92 70 L120 70 L120 98 L88 98 Z" fill="#ffffff" stroke="#0037b0" strokeWidth="2" />
                <path d="M96 74 L118 74 L118 86 L94 86 Z" fill="#dae2fd" />
                {/* wheels */}
                <circle cx="112" cy="112" r="11" fill="#131b2e" />
                <circle cx="112" cy="112" r="4" fill="#c4c5d7" />
                <circle cx="232" cy="112" r="11" fill="#131b2e" />
                <circle cx="232" cy="112" r="4" fill="#c4c5d7" />
                {/* battery glyph */}
                <rect x="150" y="60" width="34" height="18" rx="3" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
                <rect x="184" y="65" width="4" height="8" rx="1" fill="#059669" />
                <rect x="153" y="63" width="20" height="12" fill="#059669" />
              </svg>

              <span className="font-telemetry-sm text-telemetry-sm absolute bottom-2 left-2 rounded-lg bg-surface-container-lowest/95 px-2 py-1 font-semibold text-on-surface">
                {DIGITAL_TWIN.payloadMax}
              </span>
            </div>

            <div className="mt-space-sm grid grid-cols-2 gap-space-sm">
              <div className="rounded-xl bg-surface-container-low p-space-sm">
                <p className="font-label-sm text-label-sm uppercase text-outline">Gross Weight</p>
                <p className="font-telemetry-md text-telemetry-md tnum font-semibold">{DIGITAL_TWIN.grossWeight}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-space-sm">
                <p className="font-label-sm text-label-sm uppercase text-outline">Tire Pressure</p>
                <p className="font-telemetry-md text-telemetry-md tnum font-semibold">{DIGITAL_TWIN.tirePressure}</p>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Diagnostic Trouble Codes"
              action={<StatusBadge tone="ok">{DTC_PANEL.activeCount} Active</StatusBadge>}
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant">{DTC_PANEL.description}</p>

            <div className="mt-space-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm">
              <div className="flex items-center justify-between gap-space-sm">
                <span className="font-body-sm text-body-sm font-semibold text-on-surface">Last Cleared Fault:</span>
                <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                  {DTC_PANEL.lastCleared.code}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{DTC_PANEL.lastCleared.label}</p>
              <div className="font-body-sm text-body-sm mt-space-xs flex flex-wrap items-center justify-between gap-space-sm text-outline">
                <span>{DTC_PANEL.lastCleared.resolved}</span>
                <span>{DTC_PANEL.lastCleared.by}</span>
              </div>
            </div>

            <ActionButton
              icon="terminal"
              module="vehicle-telemetry"
              className="mt-space-sm w-full justify-center"
            >
              Run UDS Routine Test
            </ActionButton>
          </Panel>
        </div>
      </div>
    </div>
  )
}

// --- Tab: Trip History -------------------------------------------------------

function TripsTab() {
  return (
    <div className="flex flex-col gap-space-md">
      <Panel>
        <div className="mb-space-md flex flex-wrap items-center gap-space-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Range:
          </span>
          <span className="font-body-sm text-body-sm flex items-center gap-1.5 rounded-xl bg-surface-container-low px-space-md py-1.5">
            <Icon name="calendar_month" className="text-[16px] text-primary" />
            Last 7 Days (4 Trips)
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Filter Status:
          </span>
          <select className="font-body-sm text-body-sm h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm">
            <option>All Trips</option>
            <option>Completed</option>
            <option>In-Transit</option>
          </select>
          <ActionButton
            icon="file_download"
            module="reports-analytics"
            requires="view"
            size="compact"
            className="ml-auto"
          >
            Export KML / CSV
          </ActionButton>
        </div>

        <div className="rounded-xl border border-primary-fixed-dim bg-primary-fixed/30 p-space-md">
          <div className="mb-space-sm flex flex-wrap items-center gap-space-sm">
            <span className="font-telemetry-md text-telemetry-md font-bold text-primary">{LIVE_TRIP.id}</span>
            <StatusBadge tone="ok" pulse>
              {LIVE_TRIP.state}
            </StatusBadge>
            <span className="font-body-sm text-body-sm text-on-surface">{LIVE_TRIP.route}</span>
          </div>

          <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-4">
            {[
              { label: 'Departed', value: LIVE_TRIP.departed },
              { label: 'Est. Arrival', value: LIVE_TRIP.estArrival },
              { label: 'Dist. Traveled', value: LIVE_TRIP.distance },
              { label: 'Live Speed', value: LIVE_TRIP.liveSpeed },
            ].map((c) => (
              <div key={c.label} className="rounded-xl bg-surface-container-lowest p-space-sm">
                <p className="font-label-sm text-label-sm uppercase text-outline">{c.label}</p>
                <p className="font-telemetry-md text-telemetry-md tnum font-semibold text-on-surface">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-space-sm h-1.5 w-full overflow-hidden rounded-pill bg-surface-container-high">
            <div className="h-full rounded-pill bg-primary" style={{ width: `${LIVE_TRIP.progressPct}%` }} />
          </div>
          <p className="font-telemetry-sm text-telemetry-sm mt-space-xs text-on-surface-variant">
            Live Telemetry — Wh/km: {LIVE_TRIP.liveEfficiency}
          </p>
        </div>
      </Panel>

      <Panel padded={false}>
        <div className="p-space-lg pb-space-sm">
          <PanelHeader
            title="Completed Trip Ledger"
            action={<StatusBadge tone="idle">3 historical logs</StatusBadge>}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {['Trip ID', 'Route', 'Timeline', 'Driver', 'Distance', 'Efficiency', 'Harsh Evt', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm uppercase text-on-surface-variant ${
                        ['Distance', 'Efficiency', 'Harsh Evt'].includes(h) ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {COMPLETED_TRIPS.map((t) => (
                <tr key={t.id} className="border-b border-surface-container-high hover:bg-surface">
                  <td className="font-telemetry-sm text-telemetry-sm px-space-md py-space-sm font-semibold text-primary">
                    {t.id}
                  </td>
                  <td className="font-body-sm text-body-sm px-space-md py-space-sm">{t.route}</td>
                  <td className="font-telemetry-sm text-telemetry-sm px-space-md py-space-sm text-on-surface-variant">
                    {t.timeline}
                  </td>
                  <td className="font-body-sm text-body-sm px-space-md py-space-sm">{t.driver}</td>
                  <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right">
                    {t.distanceKm} km
                  </td>
                  <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right">
                    {t.efficiency.toFixed(1)} Wh/km
                  </td>
                  <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right text-state-ok">
                    {t.harshEvents}
                  </td>
                  <td className="px-space-md py-space-sm">
                    <StatusBadge tone="ok">Completed</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

// --- Tab: Charging History ---------------------------------------------------

function ChargingTab() {
  return (
    <div className="flex flex-col gap-space-md">
      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-3">
        {CHARGING_SUMMARY.map((c) => (
          <Panel key={c.label} className="!p-space-md">
            <p className="font-label-sm text-label-sm uppercase text-outline">{c.label}</p>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-primary">{c.value}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{c.unit}</span>
            </div>
            <p className="font-body-sm text-body-sm mt-space-xs text-on-surface-variant">{c.caption}</p>
          </Panel>
        ))}
      </div>

      <Panel padded={false}>
        <div className="p-space-lg pb-space-sm">
          <PanelHeader
            title="Depot & Opportunity Sessions"
            action={<StatusBadge tone="idle">Last 3 Recorded</StatusBadge>}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {[
                  'Session',
                  'Location / Gun',
                  'Start Time',
                  'Duration',
                  'Delta SoC',
                  'Energy (kWh)',
                  'Peak kW',
                  'Max Temp',
                  'Cost',
                ].map((h) => (
                  <th
                    key={h}
                    className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm uppercase text-on-surface-variant ${
                      ['Energy (kWh)', 'Peak kW', 'Max Temp', 'Cost'].includes(h) ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHARGING_SESSIONS.map((s) => (
                <tr key={s.id} className="border-b border-surface-container-high hover:bg-surface">
                  <td className="font-telemetry-sm text-telemetry-sm px-space-md py-space-sm font-semibold text-primary">
                    {s.id}
                  </td>
                  <td className="font-body-sm text-body-sm px-space-md py-space-sm">{s.location}</td>
                  <td className="font-telemetry-sm text-telemetry-sm px-space-md py-space-sm text-on-surface-variant">
                    {s.start}
                  </td>
                  <td className="font-telemetry-sm text-telemetry-sm px-space-md py-space-sm">{s.duration}</td>
                  <td className="font-telemetry-sm text-telemetry-sm px-space-md py-space-sm text-state-ok">
                    {s.deltaSoc}
                  </td>
                  <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right">
                    {s.energyKwh.toFixed(2)}
                  </td>
                  <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right">
                    {s.peakKw.toFixed(1)} kW
                  </td>
                  <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right">
                    {s.maxTempC.toFixed(1)}°C
                  </td>
                  <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right font-semibold">
                    {s.cost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

// --- Tab: Driver Assignment & Score -----------------------------------------

function DriverTab() {
  const d = ASSIGNED_DRIVER
  return (
    <div className="grid grid-cols-1 gap-space-md xl:grid-cols-3">
      <Panel>
        <div className="mb-space-sm flex items-center justify-between gap-space-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Primary Assigned Driver
          </span>
          <StatusBadge tone="ok">{d.tier}</StatusBadge>
        </div>

        <div className="flex items-center gap-space-md">
          <span className="font-headline-md text-headline-md flex h-14 w-14 shrink-0 items-center justify-center rounded-pill bg-primary font-bold text-on-primary">
            {d.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </span>
          <div className="min-w-0">
            <p className="font-headline-sm text-headline-sm font-semibold text-on-surface">{d.name}</p>
            <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">{d.id}</p>
            <p className="font-body-sm text-body-sm flex items-center gap-1 text-state-warn">
              <Icon name="star" className="text-[14px]" />
              <span className="tnum font-semibold">{d.rating}</span>
              <span className="text-on-surface-variant">({d.verifiedRuns} verified runs)</span>
            </p>
          </div>
        </div>

        <dl className="font-body-sm text-body-sm mt-space-md space-y-space-xs">
          {[
            ['Active Shift:', d.shift],
            ['Hours in vehicle:', d.hoursInVehicle],
            ['Mobile:', d.mobile],
            ['Commercial License:', d.licence],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-space-sm">
              <dt className="text-on-surface-variant">{label}</dt>
              <dd className="font-telemetry-sm text-telemetry-sm shrink-0 text-on-surface">{value}</dd>
            </div>
          ))}
        </dl>

        <ActionButton icon="chat" module="driver-analytics" className="mt-space-md w-full justify-center">
          Dispatch Direct Note
        </ActionButton>
      </Panel>

      <Panel className="xl:col-span-2">
        <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          Driving Safety & Telematics
        </p>
        <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
          <h3 className="font-headline-md text-headline-md font-semibold">Behavioral Telemetry Scorecard</h3>
          <div className="flex items-center gap-space-sm">
            <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-state-ok">{d.score} / 100</span>
            <StatusBadge tone="ok">{d.scorePercentile}</StatusBadge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 lg:grid-cols-4">
          {d.metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm">
              <p className="font-label-sm text-label-sm uppercase text-outline">{m.label}</p>
              <p className="font-telemetry-md text-telemetry-md tnum font-semibold text-on-surface">{m.value}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{m.caption}</p>
            </div>
          ))}
        </div>

        <div className="mt-space-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-md">
          <p className="font-label-sm text-label-sm mb-space-sm flex items-center gap-1.5 uppercase tracking-wider text-on-surface-variant">
            <Icon name="swap_horiz" className="text-[16px] text-primary" />
            Shift Handover & Secondary Drivers
          </p>
          <p className="font-body-sm text-body-sm font-semibold text-on-surface">
            Relief Driver: {d.relief.name} ({d.relief.id})
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{d.relief.note}</p>
          <div className="font-body-sm text-body-sm mt-space-sm flex flex-wrap items-center justify-between gap-space-sm">
            <span className="font-telemetry-sm text-telemetry-sm">
              Score: <strong className="text-state-ok">{d.relief.score.toFixed(1)}</strong>
            </span>
            <span className="text-outline">{d.relief.lastAudit}</span>
          </div>
          <ActionButton
            variant="ghost"
            icon="arrow_forward"
            module="driver-analytics"
            requires="view"
            size="compact"
            className="mt-space-sm"
          >
            View Driver Safety Certificate
          </ActionButton>
        </div>
      </Panel>
    </div>
  )
}

// --- Tab: Maintenance & Service ---------------------------------------------

function MaintenanceTab() {
  const [booked, setBooked] = useState(false)

  return (
    <div className="flex flex-col gap-space-md">
      <Panel className="border-primary-fixed-dim bg-primary-fixed/30">
        <div className="flex flex-col gap-space-md lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-space-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest">
              <Icon name="schedule" className="text-[22px] text-primary" />
            </span>
            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary">
                Scheduled Preventive Maintenance
              </p>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                {SCHEDULED_SERVICE.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Due in <strong className="text-on-surface">{SCHEDULED_SERVICE.dueKm}</strong> or approximately{' '}
                <strong className="text-on-surface">{SCHEDULED_SERVICE.dueDays}</strong>.{' '}
                {SCHEDULED_SERVICE.location}
              </p>
            </div>
          </div>

          {booked ? (
            <span className="font-body-sm text-body-sm flex shrink-0 items-center gap-1.5 rounded-xl bg-surface-container-lowest px-space-md py-2 font-semibold text-state-ok-text">
              <Icon name="check_circle" className="text-[18px]" />
              Bay booked — workshop notified
            </span>
          ) : (
            <ActionButton
              icon="event_available"
              variant="primary"
              module="maintenance"
              className="shrink-0"
              onClick={() => setBooked(true)}
            >
              Confirm Bay Booking
            </ActionButton>
          )}
        </div>
      </Panel>

      <Panel padded={false}>
        <div className="p-space-lg pb-space-sm">
          <PanelHeader
            title="Service & Work Order Log"
            action={<StatusBadge tone="idle">3 historical tickets</StatusBadge>}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {[
                  'Work Order',
                  'Category / Defect',
                  'Action Taken',
                  'Lead Tech',
                  'Downtime',
                  'Cost',
                  'Signed Off',
                  'Status',
                ].map((h) => (
                  <th
                    key={h}
                    className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm uppercase text-on-surface-variant ${
                      ['Downtime', 'Cost'].includes(h) ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORK_ORDERS.map((w) => (
                <tr key={w.id} className="border-b border-surface-container-high hover:bg-surface">
                  <td className="font-telemetry-sm text-telemetry-sm px-space-md py-space-sm font-semibold text-primary">
                    {w.id}
                  </td>
                  <td className="font-body-sm text-body-sm px-space-md py-space-sm font-semibold text-on-surface">
                    {w.category}
                  </td>
                  <td className="font-body-sm text-body-sm max-w-[320px] px-space-md py-space-sm text-on-surface-variant">
                    {w.action}
                  </td>
                  <td className="font-body-sm text-body-sm px-space-md py-space-sm">{w.tech}</td>
                  <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right">
                    {w.downtime}
                  </td>
                  <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right">
                    {w.cost}
                  </td>
                  <td className="font-body-sm text-body-sm px-space-md py-space-sm text-on-surface-variant">
                    {w.signedOff}
                  </td>
                  <td className="px-space-md py-space-sm">
                    <StatusBadge tone="ok">Resolved</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

// --- Page --------------------------------------------------------------------

export function VehicleHealthDetailPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const [tab, setTab] = useState<TabId>('diagnostics')
  const navigate = useNavigate()

  const vehicle = vehicleId ? getVehicle(vehicleId) : undefined

  if (!vehicleId) return <Navigate to="/vehicles-health" replace />

  if (!vehicle) {
    return (
      <div className="py-space-2xl">
        <Panel>
          <EmptyState
            icon="error"
            title={`No vehicle with id ${vehicleId}`}
            body="This asset is not in the current roster. It may be outside your role's hub scope."
          />
          <div className="flex justify-center">
            <ActionButton icon="arrow_back" onClick={() => navigate('/vehicles-health')}>
              Back to Vehicle Health
            </ActionButton>
          </div>
        </Panel>
      </div>
    )
  }

  return (
    <div className="py-space-md">
      <VehicleHeader vehicle={vehicle} />
      <SummaryCards vehicle={vehicle} />

      <div className="mb-space-md flex flex-wrap items-center gap-space-xs rounded-xl bg-surface-container-low p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`font-body-sm text-body-sm flex items-center gap-space-sm whitespace-nowrap rounded-lg px-space-md py-2 transition-colors ${
              tab === t.id
                ? 'bg-primary font-semibold text-on-primary shadow-level-1'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <Icon name={t.icon} className="text-[16px]" />
            {t.label}
            {tab === t.id && t.id === 'diagnostics' && <span className="opacity-80">(Active)</span>}
            {t.badge && (
              <span
                className={`font-telemetry-sm text-telemetry-sm rounded-pill px-1.5 ${
                  tab === t.id ? 'bg-white/20' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {t.badge}
              </span>
            )}
            {t.dot && <span className="h-1.5 w-1.5 rounded-pill bg-secondary" />}
          </button>
        ))}
      </div>

      {tab === 'diagnostics' && <DiagnosticsTab />}
      {tab === 'trips' && <TripsTab />}
      {tab === 'charging' && <ChargingTab />}
      {tab === 'driver' && <DriverTab />}
      {tab === 'maintenance' && <MaintenanceTab />}
    </div>
  )
}
