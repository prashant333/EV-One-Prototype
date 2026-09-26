/**
 * Charging Sessions & Energy Operations data.
 * Transcribed from Design/intellicar_one_ev_platform-session_and_driver/charging_sessions_intellicar_one.
 *
 * Depots are a new entity, distinct from Hubs: a Hub is an operational base
 * (geofence, dispatch, driver roster), a Depot is the charging infrastructure
 * sited at one. Sessions reference real roster vehicles so Inspect can deep-link
 * through to Vehicles and Health.
 */

import { VEHICLES, getVehicle, type Vehicle } from './fleet'

export type SessionState = 'active' | 'completed' | 'faulted' | 'scheduled'

export type SessionStatus =
  | 'fast-charge'
  | 'top-off-balancing'
  | 'thermal-throttled'
  | 'rapid-180'
  | 'completed'
  | 'terminated'
  | 'queued'

export type PortType = 'dc-fast' | 'ac-type2' | 'trickle'

export interface Depot {
  id: string
  name: string
  /** Operational hub this depot is sited at. */
  hub: string
  dcFastGuns: number
  acType2Guns: number
  trickleSockets: number
  sanctionedKw: number
  currentDemandKw: number
  solarKw: number
  essKwh: number
  essSocPct: number
}

export interface ChargingSession {
  id: string
  state: SessionState
  status: SessionStatus
  vehicleId: string
  depotId: string
  /** e.g. "Bay #02", "DC-04" */
  bay: string
  /** e.g. "DC Fast 60kW (Gun A)" */
  dispenser: string
  portType: PortType
  ratedKw: number
  durationLabel: string
  durationNote: string
  /** Elapsed minutes — 0 for scheduled sessions that have not started. */
  durationMinutes: number
  socStart: number
  socNow: number
  energyKwh: number
  /** Instantaneous draw. Only meaningful while a session is active. */
  liveRateKw: number
  rateNote: string
  /** Mean kW across the session — the figure that reconciles with energy and cost. */
  avgRateKw: number
  /** Highest draw observed during the session. */
  peakRateKw: number
  costInr: number
  tariffTier: string
  /** Minutes until start — scheduled sessions only. */
  startsInMinutes?: number
  /** Fault reason — faulted sessions only. */
  faultReason?: string
}

// --- Depots ------------------------------------------------------------------

export const DEPOTS: Depot[] = [
  {
    id: 'DEP-IND',
    name: 'Indiranagar Depot',
    hub: 'Koramangala Hub',
    dcFastGuns: 34,
    acType2Guns: 18,
    trickleSockets: 6,
    sanctionedKw: 1200,
    currentDemandKw: 840,
    solarKw: 218,
    essKwh: 450,
    essSocPct: 92,
  },
  {
    id: 'DEP-WHI',
    name: 'Whitefield Hub',
    hub: 'Whitefield Ring',
    dcFastGuns: 22,
    acType2Guns: 16,
    trickleSockets: 4,
    sanctionedKw: 900,
    currentDemandKw: 612,
    solarKw: 164,
    essKwh: 320,
    essSocPct: 88,
  },
  {
    id: 'DEP-PEE',
    name: 'Peenya Terminal',
    hub: 'Peenya Corridor',
    dcFastGuns: 18,
    acType2Guns: 12,
    trickleSockets: 4,
    sanctionedKw: 750,
    currentDemandKw: 498,
    solarKw: 96,
    essKwh: 280,
    essSocPct: 79,
  },
  {
    id: 'DEP-AIR',
    name: 'Airport Cargo Depot',
    hub: 'Airport Arterial',
    dcFastGuns: 4,
    acType2Guns: 2,
    trickleSockets: 2,
    sanctionedKw: 400,
    currentDemandKw: 118,
    solarKw: 42,
    essKwh: 120,
    essSocPct: 96,
  },
]

export function getDepot(id: string): Depot | undefined {
  return DEPOTS.find((d) => d.id === id)
}

// --- Port architecture & mix -------------------------------------------------

export const PORT_MIX = [
  { label: 'DC Fast CCS-2 (60kW - 180kW)', pct: 62, count: '78 guns', tone: 'primary' as const },
  { label: 'AC Type-2 Fast Dual (22kW)', pct: 26, count: '48 guns', tone: 'secondary' as const },
  { label: '15A Overnight Trickle Socket', pct: 12, count: '16 plugs', tone: 'idle' as const },
]

export const ROTATION_CARD = {
  title: 'Indiranagar Central Bay 04',
  caption: '32 Electric Cargo Vans Currently In Charging Rotation',
}

// --- Energy KPIs -------------------------------------------------------------

export interface EnergyKpi {
  id: string
  label: string
  icon: string
  value: string
  unit?: string
  caption: string
  captionTone: 'ok' | 'warn' | 'crit' | 'neutral' | 'primary'
  rows: Array<{ label: string; value: string; tone?: 'ok' | 'primary' | 'secondary' | 'neutral' }>
  progress: number
  progressTone: 'ok' | 'warn' | 'crit' | 'primary' | 'secondary'
  badge?: string
}

export const ENERGY_KPIS: EnergyKpi[] = [
  {
    id: 'energy-delivered',
    label: 'Energy Delivered Today',
    icon: 'bolt',
    value: '14.82',
    unit: 'MWh',
    caption: '↑ +8.4% vs prev 7d avg',
    captionTone: 'ok',
    rows: [],
    progress: 74,
    progressTone: 'primary',
  },
  {
    id: 'active-sessions',
    label: 'Active Sessions',
    icon: 'ev_station',
    value: '142',
    unit: 'Guns Connected',
    caption: '',
    captionTone: 'neutral',
    badge: '94% Util.',
    rows: [
      { label: '78 DC Fast CCS', value: '', tone: 'primary' },
      { label: '64 AC Type-2', value: '', tone: 'secondary' },
    ],
    progress: 94,
    progressTone: 'primary',
  },
  {
    id: 'charging-efficiency',
    label: 'Charging Efficiency',
    icon: 'eco',
    value: '93.6%',
    caption: 'Grid-to-Pack conversion ratio',
    captionTone: 'ok',
    rows: [
      { label: 'Electrical Loss', value: '6.4%' },
      // { label: 'HVAC Parasitic', value: '1.6%' },
    ],
    progress: 93.6,
    progressTone: 'ok',
  },
  {
    id: 'avg-cost-session',
    label: 'Avg Cost / Session',
    icon: 'payments',
    value: '₹342.50',
    caption: '₹1.14L saved via peak-shift',
    captionTone: 'ok',
    rows: [
      { label: 'Blend', value: '₹6.82/kWh' },
      { label: '41% Solar Tier', value: '', tone: 'primary' },
    ],
    progress: 62,
    progressTone: 'secondary',
  },
  {
    id: 'depot-peak-demand',
    label: 'Depot Peak Demand',
    icon: 'speed',
    value: '840',
    unit: '/ 1,200 kW',
    caption: 'Capacity Headroom: 360 kW (30%)',
    captionTone: 'ok',
    rows: [],
    progress: 70,
    progressTone: 'ok',
  },
]

// --- Depot aggregate power curve --------------------------------------------

/** 24h demand curve: DC fast load and AC plug load against the sanctioned max. */
export const DEPOT_POWER_SERIES = [
  { time: '00:00', dc: 210, ac: 150 },
  { time: '01:00', dc: 240, ac: 180 },
  { time: '02:00', dc: 290, ac: 220 },
  { time: '03:00', dc: 360, ac: 265 },
  { time: '04:00', dc: 430, ac: 300 },
  { time: '05:00', dc: 505, ac: 330 },
  { time: '06:00', dc: 560, ac: 352 },
  { time: '07:00', dc: 592, ac: 366 },
  { time: '08:00', dc: 604, ac: 372 },
  { time: '09:00', dc: 588, ac: 360 },
  { time: '10:00', dc: 620, ac: 344 },
  { time: '11:00', dc: 712, ac: 330 },
  { time: '12:00', dc: 790, ac: 318 },
  { time: '13:00', dc: 742, ac: 300 },
  { time: '14:00', dc: 640, ac: 286 },
  { time: '15:00', dc: 548, ac: 272 },
  { time: '16:00', dc: 512, ac: 268 },
  { time: '17:00', dc: 560, ac: 300 },
  { time: '18:00', dc: 748, ac: 392 },
  { time: '19:00', dc: 920, ac: 470 },
  { time: '20:00', dc: 1010, ac: 512 },
  { time: '21:00', dc: 1042, ac: 528 },
  { time: '22:00', dc: 880, ac: 470 },
  { time: '23:00', dc: 812, ac: 430 },
  { time: '23:59', dc: 838, ac: 414 },
]

export const SANCTIONED_MAX_KW = 1200

/** Peak DISCOM tariff window highlighted on the chart. */
export const PEAK_TARIFF_WINDOW = { from: '18:00', to: '22:00', label: 'Peak Tariff Zone' }

export const POWER_AXIS_NOTES = [
  { time: '00:00', note: 'Night Basel.' },
  { time: '08:00', note: 'Morning Rush' },
  { time: '12:00', note: 'Solar Peak' },
  { time: '18:00', note: 'Peak DISCOM' },
]

export const ENERGY_ASSETS = [
  { icon: 'solar_power', label: 'Depot Rooftop Solar Gen', value: '218 kW (Active Direct Feed)' },
  { icon: 'balance', label: 'Virtual Battery ESS Backup', value: '450 kWh Ready · 92% SoC' },
  { icon: 'speed', label: 'Dynamic Throttle Limit', value: 'Cap @ 60kW/gun during peak' },
]

// --- Remote charge authorisation form ---------------------------------------

export const REMOTE_CHARGE_OPTIONS = {
  dispensers: [
    'Whitefield Hub — Bay #04 (60kW DC CCS-2)',
    'Indiranagar Depot — Bay #09 (120kW DC CCS-2)',
    'Peenya Terminal — Bay #02 (22kW AC Type-2)',
  ],
  cutoffSoc: ['85% (Optimal Pack Life)', '90% (Standard Dispatch)', '100% (Long-Haul Shift)'],
  currentLimit: ['Max Available (Dynamic)', 'Eco Mode (30 kW Throttled)'],
}

// --- Sessions ----------------------------------------------------------------

/** The four sessions drawn in the design, bound to real roster vehicles. */
const DESIGNED_SESSIONS: ChargingSession[] = [
  {
    id: 'CHG-9021',
    state: 'active',
    status: 'fast-charge',
    vehicleId: 'VEH-3301', // DL 01 EV 4582
    depotId: 'DEP-WHI',
    bay: 'Whitefield Bay #02',
    dispenser: 'DC Fast 60kW (Gun A)',
    portType: 'dc-fast',
    ratedKw: 60,
    durationLabel: '38m 14s',
    durationNote: 'Est. 12m to 85%',
    durationMinutes: 38.23,
    socStart: 18,
    socNow: 84,
    energyKwh: 14.28,
    liveRateKw: 48.2,
    rateNote: '124A @ 388V',
    avgRateKw: 22.4,
    peakRateKw: 52.4,
    costInr: 102.8,
    tariffTier: 'Solar Tier',
  },
  {
    id: 'CHG-9022',
    state: 'active',
    status: 'top-off-balancing',
    vehicleId: 'VEH-1804', // MH 14 GH 9901, Mahindra Zor Grand
    depotId: 'DEP-IND',
    bay: 'Indiranagar DC-04',
    dispenser: 'DC Fast 120kW (Dual Gun)',
    portType: 'dc-fast',
    ratedKw: 120,
    durationLabel: '51m 20s',
    durationNote: 'Cell Balancing Phase',
    durationMinutes: 51.33,
    socStart: 12,
    socNow: 96,
    energyKwh: 9.8,
    liveRateKw: 3.4,
    rateNote: 'Tapered Top-Off',
    avgRateKw: 11.5,
    peakRateKw: 112.0,
    costInr: 70.5,
    tariffTier: 'Base Off-peak',
  },
  {
    id: 'CHG-9018',
    state: 'active',
    status: 'thermal-throttled',
    vehicleId: 'VEH-6650', // KA 53 TR 1190, Euler HiLoad EV
    depotId: 'DEP-PEE',
    bay: 'Peenya Bay #08',
    dispenser: 'DC Fast 30kW',
    portType: 'dc-fast',
    ratedKw: 30,
    durationLabel: '22m 04s',
    durationNote: 'T-Limit Enacted',
    durationMinutes: 22.07,
    socStart: 35,
    socNow: 62,
    energyKwh: 4.15,
    liveRateKw: 8.0,
    rateNote: 'Pack: 44.5°C',
    avgRateKw: 11.3,
    peakRateKw: 28.6,
    costInr: 32.4,
    tariffTier: 'Standard',
  },
  {
    id: 'CHG-9025',
    state: 'active',
    status: 'rapid-180',
    vehicleId: 'VEH-2210', // MH 12 AB 4321
    depotId: 'DEP-IND',
    bay: 'Indiranagar DC-01',
    dispenser: 'High-Power 180kW CCS',
    portType: 'dc-fast',
    ratedKw: 180,
    durationLabel: '14m 10s',
    durationNote: 'Est. 44m to 90%',
    durationMinutes: 14.17,
    socStart: 22,
    socNow: 48,
    energyKwh: 31.5,
    liveRateKw: 132.4,
    rateNote: '240A @ 551V',
    avgRateKw: 133.4,
    peakRateKw: 178.2,
    costInr: 236.2,
    tariffTier: 'Bulk Enterprise',
  },
]

const FAULT_REASONS = [
  'CCS handshake timeout (ISO 15118 SLAC failure)',
  'Ground fault interrupt tripped on Gun B',
  'Pack thermal cut-off — BMS refused contactor close',
  'Dispenser emergency stop engaged by operator',
  'Communication loss with charge point controller',
  'Under-voltage on DC bus during ramp-up',
]

/**
 * Generated fill so every tab, the depot chips, the filter and the pagination
 * act on real rows. Deterministic seed — same list every reload.
 */
function generateSessions(): ChargingSession[] {
  let seed = 90210
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
  const between = (lo: number, hi: number, dp = 0) => Number((lo + rand() * (hi - lo)).toFixed(dp))

  const out: ChargingSession[] = []
  let serial = 8400

  function makeOne(state: SessionState): ChargingSession {
    const depot = pick(DEPOTS)
    const vehicle = pick(VEHICLES)
    const portRoll = rand()
    const portType: PortType = portRoll > 0.45 ? 'dc-fast' : portRoll > 0.12 ? 'ac-type2' : 'trickle'
    const ratedKw = portType === 'dc-fast' ? pick([30, 60, 120, 180]) : portType === 'ac-type2' ? 22 : 3
    const socStart = between(8, 55)
    const socNow = state === 'scheduled' ? socStart : Math.min(100, socStart + between(12, 45))
    serial += 1

    // Duration and mean rate come first, then energy is DERIVED from them.
    // Generating energy independently produced impossible rows — a 3 kW trickle
    // socket delivering 20 kWh in 40 minutes — so the dispenser's rating bounds
    // the rate, and energy = rate x time follows from it.
    const durationMinutes = between(4, 58, 2)
    const durationSecs = Math.round((durationMinutes % 1) * 60)
    const utilisation = between(0.35, 0.86, 2)
    const avgRateKw = Number((ratedKw * utilisation).toFixed(1))
    const peakRateKw = Number(Math.min(ratedKw, avgRateKw * between(1.1, 1.45, 2)).toFixed(1))
    const energyKwh = Number((avgRateKw * (durationMinutes / 60)).toFixed(2))

    const base: ChargingSession = {
      id: `CHG-${serial}`,
      state,
      status: 'fast-charge',
      vehicleId: vehicle.id,
      depotId: depot.id,
      bay: `${depot.name.split(' ')[0]} Bay #${String(Math.round(between(1, 24))).padStart(2, '0')}`,
      dispenser:
        portType === 'dc-fast'
          ? `DC Fast ${ratedKw}kW`
          : portType === 'ac-type2'
            ? 'AC Type-2 22kW (Dual)'
            : '15A Trickle Socket',
      portType,
      ratedKw,
      durationLabel: `${Math.floor(durationMinutes)}m ${String(durationSecs).padStart(2, '0')}s`,
      durationNote: '',
      durationMinutes,
      socStart: Math.round(socStart),
      socNow: Math.round(socNow),
      energyKwh,
      liveRateKw: between(2, ratedKw * 0.85, 1),
      rateNote: '',
      avgRateKw,
      peakRateKw,
      costInr: Number((energyKwh * between(6.2, 9.4, 2)).toFixed(2)),
      tariffTier: pick(['Solar Tier', 'Base Off-peak', 'Standard', 'Bulk Enterprise', 'Peak DISCOM']),
    }

    if (state === 'active') {
      base.status = rand() > 0.82 ? 'top-off-balancing' : ratedKw >= 180 ? 'rapid-180' : 'fast-charge'
      base.durationNote = base.status === 'top-off-balancing' ? 'Cell Balancing Phase' : `Est. ${Math.round(between(6, 48))}m to 85%`
      base.rateNote = `${Math.round(between(40, 260))}A @ ${Math.round(between(330, 560))}V`
    } else if (state === 'completed') {
      base.status = 'completed'
      base.socNow = Math.round(between(85, 100))
      base.durationNote = 'Session closed'
      // No instantaneous draw once a session ends — the table shows the mean instead.
      base.liveRateKw = 0
      base.rateNote = `Peak: ${base.peakRateKw} kW`
    } else if (state === 'faulted') {
      base.status = 'terminated'
      base.faultReason = pick(FAULT_REASONS)
      base.durationNote = 'Terminated early'
      base.liveRateKw = 0
      base.rateNote = `Peak: ${base.peakRateKw} kW before cutoff`
    } else {
      base.status = 'queued'
      base.startsInMinutes = Math.round(between(4, 180))
      base.durationLabel = '—'
      base.durationNote = `Starts in ${base.startsInMinutes}m`
      base.durationMinutes = 0
      base.energyKwh = 0
      base.liveRateKw = 0
      base.avgRateKw = 0
      // Nothing has been drawn yet — the dispenser's rating is the ceiling.
      base.peakRateKw = 0
      base.costInr = 0
      base.rateNote = `Reserved @ ${ratedKw} kW`
    }
    return base
  }

  // Row counts per tab — enough to fill several pages without bloating the file.
  for (let i = 0; i < 20; i++) out.push(makeOne('active'))
  for (let i = 0; i < 18; i++) out.push(makeOne('completed'))
  for (let i = 0; i < 7; i++) out.push(makeOne('faulted'))
  for (let i = 0; i < 12; i++) out.push(makeOne('scheduled'))
  return out
}

export const CHARGING_SESSIONS_ALL: ChargingSession[] = [...DESIGNED_SESSIONS, ...generateSessions()]

/** Headline counts as drawn in the design — the tab labels use these. */
export const SESSION_TOTALS: Record<SessionState, number> = {
  active: 142,
  completed: 620,
  faulted: 8,
  scheduled: 45,
}

export function sessionVehicle(session: ChargingSession): Vehicle | undefined {
  return getVehicle(session.vehicleId)
}

// --- Session inspector sheet -------------------------------------------------

export const SESSION_INSPECTOR = {
  socRate: '+1.2% every 90 seconds',
  thermal: {
    state: 'Managed',
    detail: 'Active liquid coolant circulating via Depot Chiller loop.',
    startTempC: 28.0,
    currentTempC: 36.2,
    maxThresholdC: 48,
  },
  cellDelta: {
    value: '20 mV (Optimal)',
    maxCell: { label: 'Cell #28 (Max Voltage)', value: '4.120 V' },
    minCell: { label: 'Cell #04 (Min Voltage)', value: '4.100 V' },
  },
  station: [
    { label: 'Depot Charger Node', value: 'Whitefield DC-02 / Gun A' },
    { label: 'Inverter Model', value: 'Delta UltraFast 150kW SiC' },
    { label: 'Tariff Schedule', value: 'Solar-Offset Tier (₹7.20/kWh)' },
    { label: 'Session Operator', value: 'Auto-Scheduled Telematics' },
  ],
  actions: [
    { icon: 'tune', label: 'Set Max SoC Limit (Cap @ 85%)', variant: 'secondary' as const },
    { icon: 'notifications_active', label: 'Trigger Depot Disconnect SMS', variant: 'secondary' as const },
    { icon: 'power_settings_new', label: 'Emergency Stop Dispenser Session', variant: 'destructive' as const },
  ],
}
