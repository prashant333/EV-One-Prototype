/**
 * Schedule and Trips — trip lifecycle, corridor adherence and dispatch.
 * Built to match Design/intellicar_one_ev_platform/vehicles_trips_intellicar_one.
 */

import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/layout/AppShell'
import { KpiStrip } from '@/components/KpiStrip'
import { ActionButton } from '@/components/ActionButton'
import { EmptyState, Icon, Panel, PanelHeader, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { TRIP_KPIS } from '@/data/kpis'
import {
  DEPARTURE_DENSITY_SERIES,
  DISPATCH_QUEUE,
  HUBS,
  SPEED_SLA_SERIES,
  TRIPS,
  getDriver,
  getVehicle,
  type Trip,
} from '@/data/fleet'

const CORRIDOR_DOT = ['bg-state-ok', 'bg-state-ok', 'bg-secondary', 'bg-state-ok']

function CorridorChip({
  label,
  count,
  active,
  onClick,
  dot,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
  dot?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-body-sm text-body-sm flex items-center gap-1.5 whitespace-nowrap rounded-xl px-space-md py-1.5 transition-colors ${
        active
          ? 'bg-primary font-semibold text-on-primary shadow-level-1'
          : 'border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
      }`}
    >
      {dot && !active && <span className={`h-2 w-2 rounded-pill ${dot}`} />}
      {label}
      {count !== undefined && (
        <span className={`font-telemetry-sm text-telemetry-sm tnum ${active ? '' : 'text-primary'}`}>
          {count} EVs
        </span>
      )}
    </button>
  )
}

function driftDisplay(trip: Trip) {
  if (trip.status === 'delayed') {
    return <span className="font-semibold text-state-crit">+{trip.driftMinutes}m Delay</span>
  }
  if (trip.driftMinutes > 0) {
    return <span className="font-semibold text-secondary">+{trip.driftMinutes}m Variance</span>
  }
  return (
    <span className="font-semibold text-state-ok">
      On-Time ({trip.driftMinutes === 0 ? '±0m' : `${trip.driftMinutes}m`})
    </span>
  )
}

function corridorStateBadge(trip: Trip) {
  switch (trip.corridorState) {
    case 'route-deviation':
      return (
        <StatusBadge tone="crit" pulse>
          Route Deviation
        </StatusBadge>
      )
    case 'approaching-gate':
      return <StatusBadge tone="info">Approaching Gate</StatusBadge>
    case 'swap-required':
      return <StatusBadge tone="warn">Swap Required</StatusBadge>
    default:
      return <StatusBadge tone="ok">In Corridor</StatusBadge>
  }
}

function TripsTable({ trips }: { trips: Trip[] }) {
  const [tab, setTab] = useState<'active' | 'breaches'>('active')
  const [filter, setFilter] = useState('')

  const rows = useMemo(() => {
    const base =
      tab === 'breaches'
        ? trips.filter((t) => t.corridorState === 'route-deviation')
        : trips.filter((t) => t.status !== 'completed')
    if (!filter) return base
    const q = filter.toLowerCase()
    return base.filter((t) => {
      const v = getVehicle(t.vehicleId)
      const d = getDriver(t.driverId)
      return `${t.id} ${v?.registration ?? ''} ${d?.name ?? ''} ${t.corridor} ${t.origin} ${t.destination}`
        .toLowerCase()
        .includes(q)
    })
  }, [trips, tab, filter])

  return (
    <Panel padded={false}>
      <div className="flex flex-wrap items-center gap-space-sm p-space-lg pb-space-sm">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`font-body-sm text-body-sm flex items-center gap-space-sm rounded-xl px-space-lg py-2 transition-colors ${
            tab === 'active'
              ? 'bg-primary font-semibold text-on-primary shadow-level-1'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          Active Trips
          <span className="font-telemetry-sm text-telemetry-sm tnum">1,180</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('breaches')}
          className={`font-body-sm text-body-sm flex items-center gap-space-sm rounded-xl px-space-lg py-2 transition-colors ${
            tab === 'breaches'
              ? 'bg-state-crit font-semibold text-white shadow-level-1'
              : 'text-state-crit hover:bg-state-crit-fill'
          }`}
        >
          Breaches
          <span
            className={`font-telemetry-sm text-telemetry-sm tnum rounded-pill px-1.5 ${
              tab === 'breaches' ? 'bg-white/20' : 'bg-state-crit text-white'
            }`}
          >
            14
          </span>
        </button>

        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-[320px]">
          <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[16px] text-outline" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter active trips..."
            className="font-body-sm text-body-sm h-9 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-8 pr-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <ActionButton icon="tune" size="compact" className="!px-2">
          <span className="sr-only">Advanced filters</span>
        </ActionButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="bg-surface">
              {[
                'Trip ID & Priority',
                'Vehicle & Model',
                'Driver & Dispatch',
                'Corridor / Geo-Route',
                'Dep / ETA Drift',
                'SoC & Range',
                'Corridor State',
              ].map((h) => (
                <th
                  key={h}
                  className="font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm text-left uppercase text-on-surface-variant"
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
              const isBreach = trip.corridorState === 'route-deviation'

              return (
                <tr
                  key={trip.id}
                  className={`border-b border-surface-container-high transition-colors hover:bg-surface ${
                    isBreach ? 'bg-state-crit-fill/40' : ''
                  }`}
                >
                  <td className="px-space-md py-space-md align-top">
                    <p className="font-telemetry-md text-telemetry-md font-semibold text-primary">{trip.id}</p>
                    <p
                      className={`font-body-sm text-body-sm flex items-center gap-1 ${
                        trip.priority === 'High Priority' ? 'font-semibold text-state-crit' : 'text-on-surface-variant'
                      }`}
                    >
                      {trip.priority === 'High Priority' && (
                        <span className="h-1.5 w-1.5 rounded-pill bg-state-crit" />
                      )}
                      {trip.priority}
                    </p>
                  </td>

                  <td className="px-space-md py-space-md align-top">
                    <p className="font-telemetry-md text-telemetry-md font-semibold text-on-surface">
                      {vehicle?.registration}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{vehicle?.model}</p>
                  </td>

                  <td className="px-space-md py-space-md align-top">
                    <p className="font-body-sm text-body-sm font-semibold text-on-surface">{driver?.name}</p>
                    <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">{driver?.phone}</p>
                  </td>

                  <td className="px-space-md py-space-md align-top">
                    <p className="font-body-sm text-body-sm flex items-center gap-1.5 text-on-surface">
                      {trip.origin}
                      <Icon name="arrow_forward" className="text-[14px] text-outline" />
                      {trip.destination}
                    </p>
                    <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">{trip.corridor}</p>
                  </td>

                  <td className="font-telemetry-sm text-telemetry-sm px-space-md py-space-md align-top">
                    <p className="text-on-surface">
                      {trip.departure} · ETA {trip.eta}
                    </p>
                    <p>{driftDisplay(trip)}</p>
                  </td>

                  <td className="px-space-md py-space-md text-right align-top">
                    <p
                      className={`font-telemetry-md text-telemetry-md tnum font-semibold ${
                        (vehicle?.soc ?? 0) < 25 ? 'text-state-crit' : 'text-state-ok'
                      }`}
                    >
                      {vehicle?.soc}% SoC
                    </p>
                    <p className="font-telemetry-sm text-telemetry-sm tnum text-on-surface-variant">
                      {vehicle?.rangeKm} km est.
                    </p>
                  </td>

                  <td className="px-space-md py-space-md align-top">{corridorStateBadge(trip)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <EmptyState
            icon="search_off"
            title={tab === 'breaches' ? 'No corridor breaches' : 'No trips match this filter'}
            body={
              tab === 'breaches'
                ? 'Every active trip is currently inside its designated corridor for the selected zone.'
                : 'Clear the filter, or select a different corridor above.'
            }
          />
        )}
      </div>

      <div className="font-body-sm text-body-sm flex flex-wrap items-center justify-between gap-space-sm p-space-lg text-on-surface-variant">
        <span>
          Showing <strong className="text-on-surface">1–{rows.length}</strong> of{' '}
          <strong className="text-on-surface">1,180</strong> active trips
        </span>
        <span className="flex items-center gap-space-sm">
          <span>Rows:</span>
          <select className="font-telemetry-sm text-telemetry-sm rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1">
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </select>
          <span className="font-telemetry-sm text-telemetry-sm ml-space-sm">1 / 236</span>
        </span>
      </div>
    </Panel>
  )
}

function GeofenceRail() {
  const zone = HUBS.find((h) => h.zoneId === 'GF-PEE-04')!
  const [acknowledged, setAcknowledged] = useState(false)

  return (
    <div className="flex flex-col gap-space-md">
      <Panel>
        <PanelHeader
          title="Peenya Logistics Corridor"
          action={<StatusBadge tone="ok">Active Zone</StatusBadge>}
        />

        <div className="relative mb-space-sm overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container">
          {/* Schematic zone plan — the live map lives on Live Tracking. */}
          <svg viewBox="0 0 320 140" className="h-[140px] w-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#c4c5d7" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="320" height="140" fill="url(#grid)" />
            <polygon
              points="60,30 200,20 270,70 220,120 90,110 40,70"
              fill="#0037b0"
              fillOpacity="0.12"
              stroke="#0037b0"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
            {[
              [110, 55],
              [160, 45],
              [200, 80],
              [140, 95],
              [95, 78],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4" fill="#0037b0" stroke="#fff" strokeWidth="1.5" />
            ))}
            <circle cx="245" cy="95" r="4" fill="#e11d48" stroke="#fff" strokeWidth="1.5" />
          </svg>

          <span className="font-telemetry-sm text-telemetry-sm absolute left-2 top-2 rounded-lg bg-surface-container-lowest/95 px-1.5 py-0.5 font-semibold">
            Zone ID: {zone.zoneId}
          </span>
          <span className="font-telemetry-sm text-telemetry-sm absolute right-2 top-2 rounded-lg bg-primary px-1.5 py-0.5 font-semibold text-on-primary">
            {zone.evCount} EVs Live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          {[
            { label: 'Perimeter Area', value: `${zone.perimeterKm2} km² (Poly-Hex)` },
            { label: 'In-Transit SLA', value: `${zone.slaAdherencePct}% Adherent` },
            { label: 'Speed Cap', value: `${zone.speedCapKmh} km/h` },
            { label: 'Max Idle', value: `${zone.maxIdleMins} mins` },
            { label: 'Gate SoC', value: `> ${zone.gateSocPct}%` },
          ].map((cell) => (
            <div key={cell.label} className="rounded-xl bg-surface-container-low p-space-sm">
              <p className="font-label-sm text-label-sm uppercase text-outline">{cell.label}</p>
              <p className="font-telemetry-md text-telemetry-md tnum font-semibold text-on-surface">{cell.value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="border-state-crit-border bg-state-crit-fill">
        <div className="mb-space-sm flex items-center justify-between gap-space-sm">
          <h3 className="font-headline-sm text-headline-sm flex items-center gap-1.5 font-semibold text-state-crit-text">
            <Icon name="shield" className="text-[18px]" />
            Critical Geofence Breach
          </h3>
          <span className="font-telemetry-sm text-telemetry-sm text-state-crit">4m ago</span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface">
          Vehicle <span className="font-telemetry-md text-telemetry-md font-semibold">KA 03 MN 7821</span> breached
          designated <strong>Peenya Exit Gate 3</strong>.
        </p>
        <p className="font-telemetry-sm text-telemetry-sm mt-space-xs text-state-crit-text">
          Deviation vector: +1.2 km North of designated arterial corridor.
        </p>

        {acknowledged ? (
          <div className="font-body-sm text-body-sm mt-space-md flex items-center gap-1.5 rounded-xl bg-surface-container-lowest px-space-md py-2 font-semibold text-state-ok-text">
            <Icon name="check_circle" className="text-[18px]" />
            Acknowledged — driver notified
          </div>
        ) : (
          <div className="mt-space-md flex flex-wrap gap-space-sm">
            <ActionButton
              variant="secondary"
              module="operational-alerts"
              size="compact"
              onClick={() => setAcknowledged(true)}
            >
              Acknowledge
            </ActionButton>
            <ActionButton
              variant="destructive"
              icon="priority_high"
              module="operational-alerts"
              size="compact"
              onClick={() => setAcknowledged(true)}
            >
              Push Alert to Driver
            </ActionButton>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Automated Dispatches"
          subtitle="Scheduled for next 60 minutes"
          action={<StatusBadge tone="info">8 Queued</StatusBadge>}
        />

        <ul className="space-y-space-sm">
          {DISPATCH_QUEUE.map((d) => (
            <li
              key={d.registration}
              className="flex items-center gap-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary">
                <Icon name="local_shipping" className="text-[18px] text-on-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-telemetry-md text-telemetry-md truncate font-semibold text-on-surface">
                  {d.registration}
                </p>
                <p className="font-body-sm text-body-sm truncate text-on-surface-variant">
                  {d.from} → {d.to}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-telemetry-sm text-telemetry-sm tnum font-semibold text-primary">In {d.etaMinutes}m</p>
                <p
                  className={`font-telemetry-sm text-telemetry-sm tnum ${
                    d.ready ? 'text-state-ok' : 'text-state-warn'
                  }`}
                >
                  {d.ready ? `SoC ${d.socPct}% Ready` : `Charging (${d.socPct}%)`}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <ActionButton
          variant="ghost"
          icon="arrow_forward"
          className="mt-space-sm w-full justify-center"
          module="routes-corridors"
          requires="view"
        >
          Manage Full Dispatch Queue
        </ActionButton>
      </Panel>
    </div>
  )
}

function CorridorCharts() {
  return (
    <div className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
      <Panel>
        <PanelHeader
          title="Speed SLA Compliance in Corridors"
          subtitle="Last 4 hours CAN-bus aggregated velocity"
          action={
            <span className="font-telemetry-sm text-telemetry-sm text-right font-semibold text-state-ok">
              99.4% inside
              <br />
              &lt;45km/h
            </span>
          }
        />
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SPEED_SLA_SERIES} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid stroke="#e2e7ff" vertical={false} />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: '#eaedff' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #c4c5d7', fontFamily: 'Inter', fontSize: 12 }}
                formatter={(v: number) => [`${v} vehicles`, 'Count']}
              />
              <Bar dataKey="vehicles" radius={[4, 4, 0, 0]}>
                {SPEED_SLA_SERIES.map((entry) => (
                  // Buckets above the 45 km/h corridor cap are the exceptions.
                  <Cell
                    key={entry.bucket}
                    fill={['45-50', '50-55', '>55'].includes(entry.bucket) ? '#0037b0' : '#c3c0ff'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Geofence Departure Density"
          subtitle="Gate departures vs scheduled SLA slots"
          action={
            <span className="font-telemetry-sm text-telemetry-sm text-right font-semibold text-primary">
              184 dispatches
              <br />/ hr
            </span>
          }
        />
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DEPARTURE_DENSITY_SERIES} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
              <CartesianGrid stroke="#e2e7ff" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#747686', fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #c4c5d7', fontFamily: 'Inter', fontSize: 12 }}
                formatter={(v: number) => [`${v} dispatches`, 'Volume']}
              />
              <Line
                type="monotone"
                dataKey="dispatches"
                stroke="#0037b0"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0037b0' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  )
}

export function VehiclesTripsPage() {
  const { scope } = useWorkspace()
  const [corridor, setCorridor] = useState('All Zones')

  const trips = useMemo(() => {
    if (corridor === 'All Zones') return TRIPS
    const hub = HUBS.find((h) => h.name === corridor)
    if (!hub) return TRIPS
    return TRIPS.filter((t) => getVehicle(t.vehicleId)?.hub === hub.name)
  }, [corridor])

  return (
    <>
      <PageHeader
        title="Schedule and Trips"
        breadcrumb="Schedule and Trips"
        live
        actions={
          <>
            <ActionButton icon="download" module="reports-analytics" requires="view">
              Export Trip Logs
            </ActionButton>
            <ActionButton icon="my_location" module="geofences">
              Define Geofence
            </ActionButton>
            <ActionButton icon="add_circle" variant="primary" module="vehicles-trips">
              Create Schedules & Trip
            </ActionButton>
          </>
        }
      />

      <div className="mb-space-md flex flex-wrap items-center gap-space-sm">
        {[
          { tone: 'ok' as const, text: '1,180 Active Trips' },
          { tone: 'info' as const, text: '98.4% On-Schedule SLA' },
          { tone: 'info' as const, text: '42 Active Geofences' },
          { tone: 'crit' as const, text: '14 Corridor Breaches Flagged' },
        ].map((pill) => (
          <StatusBadge key={pill.text} tone={pill.tone} pulse className="!py-1">
            {pill.text}
          </StatusBadge>
        ))}
        <span className="font-body-sm text-body-sm ml-auto text-on-surface-variant">
          Scope: {scope.region} · {scope.site} · {scope.timeWindow}
        </span>
      </div>

      <KpiStrip label="Trip Operations Metrics" kpiIds={TRIP_KPIS} customisable={false} />

      <Panel className="mb-space-md flex flex-wrap items-center gap-space-sm !py-space-sm">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          Corridors:
        </span>
        <CorridorChip
          label="All Zones (42)"
          active={corridor === 'All Zones'}
          onClick={() => setCorridor('All Zones')}
        />
        {HUBS.map((hub, i) => (
          <CorridorChip
            key={hub.id}
            label={hub.name}
            count={hub.evCount}
            dot={CORRIDOR_DOT[i]}
            active={corridor === hub.name}
            onClick={() => setCorridor(hub.name)}
          />
        ))}
      </Panel>

      <div className="grid grid-cols-1 gap-space-md xl:grid-cols-3">
        <div className="flex flex-col gap-space-md xl:col-span-2">
          <TripsTable trips={trips} />
          <CorridorCharts />
        </div>
        <GeofenceRail />
      </div>
    </>
  )
}
