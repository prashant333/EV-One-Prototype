/**
 * Battery Health — individual pack record.
 * Built to match Design/Battery_intellicar_one_ev_platform/battery_health_detail_bat_8821.
 */

import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ActionButton } from '@/components/ActionButton'
import { EmptyState, Icon, Panel, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import {
  ANOMALY_BANNER,
  CELL_MATRIX,
  CELL_SUMMARY,
  DUTY_PROFILE,
  LIFECYCLE_MILESTONES,
  PACK_ARCHITECTURE,
  PACK_AXES,
  PACK_DETAIL_TABS,
  PACK_MODE_META,
  PACK_MODE_WINDOWS,
  PACK_TELEMETRY,
  PACK_TELEMETRY_CHANNELS,
  PACK_TELEMETRY_SUMMARY,
  PLATFORM_TELEMETRY,
  SOH_STATUS_LABELS,
  batteryVehicle,
  getBattery,
  type Battery,
} from '@/data/batteries'

// --- Header ------------------------------------------------------------------

function PackHeader({ battery }: { battery: Battery }) {
  const navigate = useNavigate()
  const { cluster } = useWorkspace()
  const vehicle = batteryVehicle(battery)
  const critical = battery.sohStatus === 'critical'

  return (
    <Panel className="mb-space-md">
      <nav className="font-label-sm text-label-sm mb-space-sm flex flex-wrap items-center gap-space-xs uppercase tracking-wider text-on-surface-variant">
        <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-on-surface">
          Workspaces
        </button>
        <Icon name="chevron_right" className="text-[14px]" />
        <span>{cluster.name}</span>
        <Icon name="chevron_right" className="text-[14px]" />
        <button type="button" onClick={() => navigate('/battery-health')} className="hover:text-on-surface">
          Battery Health
        </button>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="font-telemetry-sm text-telemetry-sm normal-case text-on-surface">
          {battery.id} (Pack-{battery.id.replace('BAT-', '99')})
        </span>

        <span className="ml-auto flex flex-wrap items-center gap-space-sm normal-case">
          <span className="font-telemetry-sm text-telemetry-sm flex items-center gap-1 rounded-lg bg-surface-container-low px-2 py-0.5 text-on-surface-variant">
            <span className="h-1.5 w-1.5 animate-pulse rounded-pill bg-state-ok" />
            CAN Telemetry: 1000ms sync
          </span>
          {critical && (
            <StatusBadge tone="crit" pulse>
              Action Required
            </StatusBadge>
          )}
        </span>
      </nav>

      <div className="flex flex-col gap-space-md xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-surface">
              {battery.id}
            </h1>
            <span className="font-body-sm text-body-sm rounded-lg bg-primary-fixed px-2 py-1 font-semibold uppercase text-on-primary-fixed">
              {battery.chemistryDetail} Chemistry
            </span>
          </div>

          {critical && (
            <p className="font-label-sm text-label-sm mt-space-sm inline-flex items-center gap-1.5 rounded-lg bg-state-crit-fill px-2.5 py-1 font-bold uppercase tracking-wider text-state-crit-text">
              <span className="h-1.5 w-1.5 rounded-pill bg-state-crit" />
              Critical Risk · Quarantine Recommended
            </p>
          )}

          <p className="font-body-md text-body-md mt-space-sm text-on-surface">
            <span className="rounded-lg bg-surface-container-low px-2 py-0.5 font-semibold">Class 7 Commercial EV</span>
          </p>
          <p className="font-body-sm text-body-sm mt-space-xs text-on-surface-variant">
            {battery.model} · Commercial EV Pack · Battery Assets Division
          </p>

          <dl className="font-telemetry-sm text-telemetry-sm mt-space-md grid grid-cols-1 gap-x-space-lg gap-y-space-xs sm:grid-cols-2">
            {[
              ['Serial', battery.serial],
              ['BMS FW', 'v4.2.1-bms'],
              ['Commissioned', battery.commissioned],
              ['Assigned', vehicle ? `${vehicle.model} (${vehicle.registration})` : battery.deployment.label],
              ['Hub', battery.hub],
              ['Depot Bay', battery.deployment.detail],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-space-sm">
                <dt className="font-label-sm text-label-sm uppercase text-outline">{label}</dt>
                <dd className={label === 'Assigned' ? 'text-primary' : 'text-on-surface'}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm xl:shrink-0">
          <ActionButton
            icon="local_shipping"
            module="asset-tracking"
            requires="view"
            onClick={() => vehicle && navigate('/asset-tracking')}
          >
            Vehicle
          </ActionButton>
          <ActionButton icon="description" module="battery" requires="view">
            MDF4 Log
          </ActionButton>
          <ActionButton icon="download" module="reports-analytics" requires="view">
            Export
          </ActionButton>
          <ActionButton icon="confirmation_number" module="maintenance-warranty">
            Create Ticket
          </ActionButton>
          <ActionButton icon="power_settings_new" variant="destructive" module="battery">
            Take Offline
          </ActionButton>
        </div>
      </div>
    </Panel>
  )
}

function PackSummaryCards({ battery }: { battery: Battery }) {
  const critical = battery.sohStatus === 'critical'
  const cycleUsedPct = Math.round((battery.cycleCount / battery.cycleDesign) * 100)

  return (
    <div className="mb-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-5">
      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-start justify-between gap-space-sm">
          <span className="font-label-sm text-label-sm uppercase text-outline">State of Health (SoH)</span>
          <StatusBadge tone={critical ? 'crit' : 'ok'}>{SOH_STATUS_LABELS[battery.sohStatus]}</StatusBadge>
        </div>
        <p className="flex items-baseline gap-space-xs">
          <span
            className={`font-telemetry-lg text-telemetry-lg tnum font-bold ${critical ? 'text-state-crit' : 'text-on-surface'}`}
          >
            {battery.sohPct}%
          </span>
          <span className="font-body-sm text-body-sm text-state-crit">↓ {battery.fadeRatePct}% (60d)</span>
        </p>
        <div className="mt-space-sm h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
          <div
            className={`h-full rounded-pill ${critical ? 'bg-state-crit' : 'bg-state-ok'}`}
            style={{ width: `${battery.sohPct}%` }}
          />
        </div>
        <p className="font-telemetry-sm text-telemetry-sm mt-space-xs flex justify-between text-on-surface-variant">
          <span>Warranty Min: {battery.sohFloorPct.toFixed(1)}%</span>
          <span className="font-semibold text-state-crit">
            +{(battery.sohPct - battery.sohFloorPct).toFixed(1)} delta
          </span>
        </p>
      </Panel>

      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase text-outline">State of Charge (SoC)</span>
          <Icon name="battery_charging_full" className="text-[18px] text-primary" />
        </div>
        <p className="flex items-baseline gap-space-xs">
          <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">{battery.socPct}%</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">@ {battery.nominalVoltage} V</span>
        </p>
        <div className="mt-space-sm h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
          <div className="h-full rounded-pill bg-primary" style={{ width: `${battery.socPct}%` }} />
        </div>
        <p className="font-telemetry-sm text-telemetry-sm mt-space-xs text-on-surface-variant">
          {battery.usableKwh.toFixed(1)} kWh usable · {battery.capacityKwh.toFixed(1)} kWh nom
        </p>
      </Panel>

      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase text-outline">Cycle Count (EFC)</span>
          <Icon name="autorenew" className="text-[18px] text-secondary" />
        </div>
        <p className="flex items-baseline gap-space-xs">
          <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">
            {battery.cycleCount.toLocaleString()}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            / {battery.cycleDesign.toLocaleString()}
          </span>
        </p>
        <div className="mt-space-sm h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
          <div className="h-full rounded-pill bg-secondary" style={{ width: `${cycleUsedPct}%` }} />
        </div>
        <p className="font-telemetry-sm text-telemetry-sm mt-space-xs flex justify-between text-on-surface-variant">
          <span>{cycleUsedPct}% Life Consumed</span>
          <span>{(battery.cycleDesign - battery.cycleCount).toLocaleString()} left</span>
        </p>
      </Panel>

      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase text-outline">Max Pack Temp</span>
          <Icon name="local_fire_department" className="text-[18px] text-state-crit" />
        </div>
        <p className="flex items-baseline gap-space-xs">
          <span
            className={`font-telemetry-lg text-telemetry-lg tnum font-bold ${
              battery.packTempC > 45 ? 'text-state-crit' : 'text-on-surface'
            }`}
          >
            {battery.packTempC.toFixed(1)}°C
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Peak: 54.2°C</span>
        </p>
        <div className="mt-space-sm h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
          <div className="h-full rounded-pill bg-state-crit" style={{ width: `${(battery.packTempC / 60) * 100}%` }} />
        </div>
        <p className="font-telemetry-sm text-telemetry-sm mt-space-xs flex justify-between text-on-surface-variant">
          <span>Loop ΔT: +4.8°C</span>
          <span className="font-semibold text-state-crit">HOT ZONE</span>
        </p>
      </Panel>

      <Panel className="!p-space-md">
        <div className="mb-space-xs flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase text-outline">Rem. Useful Life (RUL)</span>
          <Icon name="hourglass_empty" className="text-[18px] text-primary" />
        </div>
        <p className="flex items-baseline gap-space-xs">
          <span className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">
            {battery.estimatedRulYears}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">yrs</span>
          <span className="font-telemetry-sm text-telemetry-sm ml-auto text-on-surface-variant">
            ≈ {Math.round((battery.cycleDesign - battery.cycleCount) * 0.54)} cyc
          </span>
        </p>
        <p className="font-telemetry-sm text-telemetry-sm mt-space-sm flex justify-between text-on-surface-variant">
          <span>Trajectory to 70% SoH</span>
          <span className="font-semibold text-state-crit">Fast Drift</span>
        </p>
      </Panel>
    </div>
  )
}

// --- Overview tab ------------------------------------------------------------

function CellMatrixPanel() {
  return (
    <Panel>
      <div className="mb-space-sm flex flex-wrap items-start justify-between gap-space-sm">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-semibold">BMS 14-Cell Voltage & Thermal Matrix</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Real-time individual cell telemetry reported via TI BQ79616-Q1 BMS chip
          </p>
        </div>
        <StatusBadge tone="crit">
          ΔV: {CELL_SUMMARY.deltaMv} mV (Max: {CELL_SUMMARY.maxDeltaMv}mV)
        </StatusBadge>
      </div>

      <div className="mb-space-md grid grid-cols-1 gap-space-sm sm:grid-cols-3">
        {[
          { label: 'Min Cell Voltage', value: CELL_SUMMARY.min.value, caption: CELL_SUMMARY.min.label, tone: 'crit' },
          { label: 'Max Cell Voltage', value: CELL_SUMMARY.max.value, caption: CELL_SUMMARY.max.label, tone: 'neutral' },
          {
            label: 'Balancing State',
            value: CELL_SUMMARY.balancing,
            caption: CELL_SUMMARY.balancingDetail,
            tone: 'info',
          },
        ].map((c) => (
          <div key={c.label} className="rounded-xl bg-surface-container-low p-space-sm">
            <p className="font-label-sm text-label-sm uppercase text-outline">{c.label}</p>
            <p
              className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                c.tone === 'crit' ? 'text-state-crit' : c.tone === 'info' ? 'text-primary' : 'text-on-surface'
              }`}
            >
              {c.value}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{c.caption}</p>
          </div>
        ))}
      </div>

      <div className="mb-space-xs flex flex-wrap items-center justify-between gap-space-sm">
        <span className="font-body-sm text-body-sm text-on-surface-variant">{CELL_SUMMARY.spectrum}</span>
        <span className="font-body-sm text-body-sm font-semibold text-state-crit">{CELL_SUMMARY.divergentNote}</span>
      </div>

      {/* 14 cells, 7 per row, matching the physical module layout */}
      <div className="grid grid-cols-7 gap-1">
        {CELL_MATRIX.map((cell) => (
          <div key={cell.id} className="flex flex-col items-center gap-0.5">
            <div
              className={`h-9 w-full rounded ${cell.divergent ? 'bg-state-crit' : 'bg-tertiary'}`}
              title={`${cell.id}: ${cell.voltage} V`}
            />
            <span className="font-telemetry-sm text-[10px] text-on-surface-variant">{cell.id}</span>
            {cell.divergent && (
              <span className="font-telemetry-sm text-[10px] font-bold text-state-crit">{cell.voltage}V</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-space-md rounded-xl bg-surface-container-low p-space-sm">
        <p className="font-label-sm text-label-sm mb-space-xs uppercase text-outline">Thermistor Probe Array</p>
        <dl className="font-telemetry-sm text-telemetry-sm grid grid-cols-1 gap-space-sm sm:grid-cols-3">
          {CELL_SUMMARY.thermistors.map((t) => (
            <div key={t.label}>
              <dt className="text-on-surface-variant">{t.label}</dt>
              <dd className={`tnum font-semibold ${t.tone === 'crit' ? 'text-state-crit' : 'text-on-surface'}`}>
                {t.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Panel>
  )
}

/**
 * Combined pack scope: temperature, state of charge, charge/discharge state and
 * terminal voltage on one plot.
 *
 * Volts and Celsius share the left axis because their ranges overlap; SoC gets
 * the right axis. Charge state is drawn as background bands rather than a
 * fourth line — it is a state, not a magnitude, and a line would compete with
 * the three that carry real units.
 */
function TelemetryScopePanel() {
  const [range, setRange] = useState('24H')
  const [hidden, setHidden] = useState<string[]>(['current'])

  const visible = PACK_TELEMETRY_CHANNELS.filter((c) => !hidden.includes(c.key))
  const showCurrent = visible.some((c) => c.axis === 'current')

  function toggle(key: string) {
    setHidden((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      // Never hide every trace — an empty plot is not a useful state.
      return next.length === PACK_TELEMETRY_CHANNELS.length ? prev : next
    })
  }

  const latest = PACK_TELEMETRY[PACK_TELEMETRY.length - 1]
  const chargingWindows = PACK_MODE_WINDOWS.filter((w) => w.mode !== 'discharging')

  return (
    <Panel>
      <div className="mb-space-sm flex flex-col gap-space-sm lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <h3 className="font-headline-sm text-headline-sm font-semibold">
              CAN Bus High-Frequency Telemetry Oscilloscope
            </h3>
            <StatusBadge tone="info">{PACK_TELEMETRY_SUMMARY.sample}</StatusBadge>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Pack temperature, state of charge, charge/discharge state and terminal voltage on a shared 24-hour axis
          </p>
        </div>

        {/* Trace toggles — click a channel to add or remove it from the plot. */}
        <div className="flex flex-wrap items-center gap-space-xs">
          {PACK_TELEMETRY_CHANNELS.map((c) => {
            const on = !hidden.includes(c.key)
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => toggle(c.key)}
                aria-pressed={on}
                className={`font-body-sm text-body-sm flex items-center gap-1.5 rounded-lg border px-2 py-1 transition-colors ${
                  on
                    ? 'border-outline-variant bg-surface-container-lowest text-on-surface'
                    : 'border-transparent bg-surface-container-low text-outline'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-pill"
                  style={{ background: on ? c.color : '#c4c5d7' }}
                />
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-space-sm flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-surface-container-low p-0.5">
          {PACK_TELEMETRY_SUMMARY.ranges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`font-telemetry-sm text-telemetry-sm rounded-lg px-2.5 py-1 transition-colors ${
                range === r
                  ? 'bg-surface-container-lowest font-bold text-primary shadow-level-1'
                  : 'text-on-surface-variant'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Band legend — what the shaded regions behind the traces mean. */}
        <div className="font-body-sm text-body-sm flex flex-wrap items-center gap-space-md">
          {(['charging', 'idle', 'discharging'] as const).map((m) => (
            <span key={m} className="flex items-center gap-1.5 text-on-surface-variant">
              <span
                className="h-3 w-3 rounded-sm border border-outline-variant/60"
                style={{
                  background:
                    PACK_MODE_META[m].fill === 'transparent' ? '#ffffff' : PACK_MODE_META[m].fill,
                }}
              />
              {PACK_MODE_META[m].label}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm">
        <p className="font-telemetry-sm text-telemetry-sm mb-space-xs text-primary">
          {PACK_TELEMETRY_SUMMARY.header}
        </p>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={PACK_TELEMETRY} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="socFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#e2e7ff" vertical={false} />

              {/* Charge-state bands sit behind every trace. */}
              {chargingWindows.map((w) => (
                <ReferenceArea
                  key={`${w.mode}-${w.from}`}
                  x1={w.from}
                  x2={w.to}
                  yAxisId="left"
                  fill={PACK_MODE_META[w.mode].fill}
                  fillOpacity={1}
                  stroke="none"
                />
              ))}

              <XAxis
                dataKey="t"
                tick={{ fontSize: 9, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                interval={7}
              />

              <YAxis
                yAxisId="left"
                domain={PACK_AXES.left.domain}
                tick={{ fontSize: 9, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={showCurrent ? PACK_AXES.current.domain : PACK_AXES.right.domain}
                tick={{ fontSize: 9, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                width={44}
              />

              {/* Zero line only means something once current is on the plot. */}
              {showCurrent && <ReferenceLine yAxisId="right" y={0} stroke="#c4c5d7" strokeDasharray="3 3" />}

              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #c4c5d7', fontFamily: 'Inter', fontSize: 12 }}
                labelFormatter={(v) => {
                  const row = PACK_TELEMETRY.find((s) => s.t === v)
                  return `${v} · ${row ? PACK_MODE_META[row.mode].label : ''}`
                }}
                formatter={(value: number, name: string) => {
                  const c = PACK_TELEMETRY_CHANNELS.find((x) => x.label === name)
                  return [`${value} ${c?.unit ?? ''}`, name]
                }}
              />

              {visible.map((c) =>
                c.render === 'area' ? (
                  <Area
                    key={c.key}
                    yAxisId="right"
                    type="monotone"
                    dataKey={c.key}
                    name={c.label}
                    stroke={c.color}
                    strokeWidth={2}
                    fill="url(#socFill)"
                    isAnimationActive={false}
                  />
                ) : (
                  <Line
                    key={c.key}
                    yAxisId={c.axis === 'current' ? 'right' : 'left'}
                    type="monotone"
                    dataKey={c.key}
                    name={c.label}
                    stroke={c.color}
                    strokeWidth={1.9}
                    dot={false}
                    isAnimationActive={false}
                  />
                ),
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <p className="font-telemetry-sm text-telemetry-sm mt-space-xs flex flex-wrap items-center justify-between gap-space-sm text-outline">
          <span>{PACK_TELEMETRY_SUMMARY.footer}</span>
          <span>
            Left axis: {PACK_AXES.left.label} · Right axis:{' '}
            {showCurrent ? PACK_AXES.current.label : PACK_AXES.right.label}
          </span>
        </p>
      </div>

      {/* Latest sample, so the plot has a readable "now" anchor. */}
      <div className="mt-space-md grid grid-cols-2 gap-space-sm sm:grid-cols-4">
        {[
          { label: 'Pack Temp', value: `${latest.packTemp} °C`, tone: latest.packTemp > 45 ? 'crit' : 'neutral' },
          { label: 'State of Charge', value: `${latest.socPct} %`, tone: 'ok' },
          { label: 'Terminal Voltage', value: `${latest.voltage} V`, tone: 'neutral' },
          { label: 'Mode', value: PACK_MODE_META[latest.mode].label, tone: latest.mode === 'charging' ? 'ok' : 'neutral' },
        ].map((t) => (
          <div key={t.label} className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm">
            <p className="font-label-sm text-label-sm uppercase text-outline">{t.label}</p>
            <p
              className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                t.tone === 'crit' ? 'text-state-crit' : t.tone === 'ok' ? 'text-state-ok' : 'text-on-surface'
              }`}
            >
              {t.value}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function LifecyclePanel() {
  return (
    <Panel>
      <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
        <h3 className="font-headline-sm text-headline-sm flex items-center gap-1.5 font-semibold">
          <Icon name="verified_user" className="text-[18px] text-primary" />
          Lifecycle Milestones & Warranty Gate
        </h3>
        <StatusBadge tone="ok">{LIFECYCLE_MILESTONES.gate}</StatusBadge>
      </div>

      <p className="font-label-sm text-label-sm mb-space-xs uppercase text-outline">Pack Lifecycle Phase</p>
      <div className="mb-space-sm flex gap-1">
        {LIFECYCLE_MILESTONES.phases.map((p) => (
          <div key={p.label} className="flex-1">
            <div
              className={`h-1.5 rounded-pill ${
                p.state === 'done' ? 'bg-tertiary' : p.state === 'current' ? 'bg-state-crit' : 'bg-surface-container-high'
              }`}
            />
            <p
              className={`font-body-sm text-body-sm mt-1 truncate ${
                p.state === 'current' ? 'font-semibold text-state-crit' : 'text-on-surface-variant'
              }`}
            >
              {p.label}
            </p>
          </div>
        ))}
      </div>

      <dl className="font-body-sm text-body-sm space-y-1.5 border-t border-outline-variant/40 pt-space-sm">
        {LIFECYCLE_MILESTONES.terms.map((t) => (
          <div key={t.label} className="flex items-baseline justify-between gap-space-sm">
            <dt className="text-on-surface-variant">{t.label}:</dt>
            <dd
              className={`font-telemetry-sm text-telemetry-sm shrink-0 text-right font-semibold ${
                'tone' in t && t.tone === 'crit' ? 'text-state-crit' : 'text-on-surface'
              }`}
            >
              {t.value}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-space-sm pt-space-xs">
          <dt className="font-semibold text-state-crit">Risk Classifier:</dt>
          <dd>
            <StatusBadge tone="crit">{LIFECYCLE_MILESTONES.classifier}</StatusBadge>
          </dd>
        </div>
      </dl>

      <ActionButton
        icon="assignment"
        variant="primary"
        module="maintenance-warranty"
        className="mt-space-md w-full justify-center"
      >
        Initiate OEM Warranty Dossier
      </ActionButton>
    </Panel>
  )
}

function DutyProfilePanel() {
  const d = DUTY_PROFILE
  return (
    <Panel>
      <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
        <h3 className="font-headline-sm text-headline-sm flex items-center gap-1.5 font-semibold">
          <Icon name="query_stats" className="text-[18px] text-primary" />
          Operational Stress & Duty Profile
        </h3>
        <span className="font-body-sm text-body-sm text-on-surface-variant">{d.benchmark}</span>
      </div>

      <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
        {d.tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm">
            <p className="font-label-sm text-label-sm uppercase text-outline">{t.label}</p>
            <p className="font-telemetry-md text-telemetry-md tnum font-semibold text-on-surface">{t.value}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t.caption}</p>
          </div>
        ))}
      </div>

      <div className="mt-space-md">
        <div className="mb-space-xs flex flex-wrap items-baseline justify-between gap-space-sm">
          <span className="font-body-sm text-body-sm text-on-surface">{d.cohort.label}</span>
          <span className="font-telemetry-sm text-telemetry-sm font-semibold text-state-crit">{d.cohort.delta}</span>
        </div>

        {[
          { label: `Cohort Average (${d.cohort.average}%)`, value: d.cohort.average, tone: 'bg-tertiary' },
          { label: `BAT-8821 Current (${d.cohort.current}%)`, value: d.cohort.current, tone: 'bg-state-crit' },
        ].map((bar) => (
          <div key={bar.label} className="mb-space-xs">
            <div className="font-body-sm text-body-sm flex justify-between text-on-surface-variant">
              <span>{bar.label}</span>
              <span className="tnum">{bar.value}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-container-high">
              <div className={`h-full rounded-pill ${bar.tone}`} style={{ width: `${bar.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// --- Page --------------------------------------------------------------------

export function BatteryDetailPage() {
  const { batteryId } = useParams<{ batteryId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<string>(PACK_DETAIL_TABS[0])

  const battery = batteryId ? getBattery(batteryId) : undefined

  if (!batteryId) return <Navigate to="/battery-health" replace />

  if (!battery) {
    return (
      <div className="py-space-2xl">
        <Panel>
          <EmptyState
            icon="battery_alert"
            title={`No pack with id ${batteryId}`}
            body="This battery is not in the current portfolio. It may be outside your role's hub scope."
          />
          <div className="flex justify-center">
            <ActionButton icon="arrow_back" onClick={() => navigate('/battery-health')}>
              Back to Battery Health
            </ActionButton>
          </div>
        </Panel>
      </div>
    )
  }

  return (
    <div className="py-space-md">
      <PackHeader battery={battery} />
      <PackSummaryCards battery={battery} />

      <div className="mb-space-md flex flex-wrap items-center gap-space-xs rounded-xl bg-surface-container-low p-1">
        {PACK_DETAIL_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`font-body-sm text-body-sm whitespace-nowrap rounded-lg px-space-md py-2 transition-colors ${
              tab === t
                ? 'bg-primary font-semibold text-on-primary shadow-level-1'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <div className="flex flex-col gap-space-md">
          <div className="grid grid-cols-1 gap-space-md xl:grid-cols-3">
            <Panel>
              <div className="mb-space-sm flex items-center justify-between gap-space-sm">
                <h3 className="font-headline-sm text-headline-sm flex items-center gap-1.5 font-semibold">
                  <Icon name="tune" className="text-[18px] text-primary" />
                  Battery Architecture & Rating
                </h3>
                <StatusBadge tone="ok">OEM Validated</StatusBadge>
              </div>
              <dl className="font-body-sm text-body-sm space-y-1.5">
                {PACK_ARCHITECTURE.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-space-sm border-b border-surface-container-high pb-1 last:border-b-0"
                  >
                    <dt className="text-on-surface-variant">{row.label}</dt>
                    <dd
                      className={`font-telemetry-sm text-telemetry-sm shrink-0 text-right font-semibold ${
                        'tone' in row && row.tone === 'crit' ? 'text-state-crit' : 'text-on-surface'
                      }`}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-space-md rounded-xl border border-outline-variant/40 p-space-sm">
                <div className="mb-space-sm flex items-center justify-between gap-space-sm">
                  <span className="font-body-sm text-body-sm flex items-center gap-1.5 font-semibold">
                    <Icon name="local_shipping" className="text-[16px] text-primary" />
                    Assigned Platform Telematics
                  </span>
                  <StatusBadge tone="ok" pulse>
                    {PLATFORM_TELEMETRY.status}
                  </StatusBadge>
                </div>
                <p className="font-body-sm text-body-sm font-semibold text-on-surface">{PLATFORM_TELEMETRY.vehicle}</p>
                <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                  VIN: {PLATFORM_TELEMETRY.vin}
                </p>
                <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">
                  Speed: {PLATFORM_TELEMETRY.speed} · Odo: {PLATFORM_TELEMETRY.odometer}
                </p>
                <div className="mt-space-sm grid grid-cols-2 gap-space-sm">
                  <div className="rounded-lg bg-surface-container-low p-space-sm">
                    <p className="font-label-sm text-label-sm uppercase text-outline">Bus Load</p>
                    <p className="font-telemetry-md text-telemetry-md tnum font-semibold">
                      {PLATFORM_TELEMETRY.busLoad}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {PLATFORM_TELEMETRY.busLoadNote}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-space-sm">
                    <p className="font-label-sm text-label-sm uppercase text-outline">BMS Temp Sensors</p>
                    <p className="font-telemetry-md text-telemetry-md tnum font-semibold">
                      {PLATFORM_TELEMETRY.sensors}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {PLATFORM_TELEMETRY.sensorsNote}
                    </p>
                  </div>
                </div>
              </div>
            </Panel>

            <div className="xl:col-span-2">
              <CellMatrixPanel />
            </div>
          </div>

          <TelemetryScopePanel />

          <div className="grid grid-cols-1 gap-space-md xl:grid-cols-2">
            <LifecyclePanel />
            <DutyProfilePanel />
          </div>

          {/* Anomaly banner */}
          <Panel className="border-state-crit-border bg-state-crit-fill">
            <div className="flex flex-col gap-space-md lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-space-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-state-crit">
                  <Icon name="priority_high" className="text-[22px] text-white" />
                </span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-state-crit-text">
                    {ANOMALY_BANNER.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{ANOMALY_BANNER.detail}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm lg:shrink-0">
                <ActionButton icon="event" module="maintenance-warranty" size="compact">
                  Schedule Deep Balancing
                </ActionButton>
                <ActionButton icon="build" variant="primary" module="maintenance-warranty" size="compact">
                  Create Work Order
                </ActionButton>
                <ActionButton icon="power_settings_new" variant="destructive" module="battery" size="compact">
                  Take Pack Offline
                </ActionButton>
              </div>
            </div>
          </Panel>
        </div>
      ) : (
        <Panel>
          <EmptyState
            icon="construction"
            title={`${tab} — design pending`}
            body={`The Overview tab is built to the delivered design. "${tab}" is wired and routable; drop its design in and it replaces this placeholder.`}
          />
        </Panel>
      )}
    </div>
  )
}
