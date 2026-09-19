/**
 * Driver Analytics data.
 * Transcribed from Design/intellicar_one_ev_platform-session_and_driver/driver_analytics_intellicar_one.
 *
 * Kept separate from the core Driver record in fleet.ts: fleet.ts holds who a
 * driver is, this holds how they are performing. Explicit entries for the five
 * drivers drawn in the design, deterministic fill for the rest of the roster.
 */

import { DRIVERS, VEHICLES, type Driver } from './fleet'

export type DriverTier = 'elite' | 'standard' | 'coaching'

export const TIER_LABELS: Record<DriverTier, string> = {
  elite: 'Elite Tier',
  standard: 'Standard',
  coaching: 'Coaching Needed',
}

export interface DriverAnalytics {
  driverId: string
  licence: string
  tier: DriverTier
  /** Asset registration as assigned; falls back to the roster assignment. */
  assignedReg: string
  distanceKmMonth: number
  tripsMonth: number
  safetyScore: number
  energyWhKm: number
  benchmarkWhKm: number
  /** Infractions per 100km: harsh braking / harsh turn / over-speed. */
  harshBraking: number
  harshTurn: number
  overSpeed: number
  regenPct: number
  onTimeSlaPct: number
  joined: string
  cluster: string
  online: boolean
}

// --- Summary tiles -----------------------------------------------------------

export const ROSTER_SUMMARY = [
  {
    id: 'roster-allocation',
    icon: 'badge',
    label: 'Roster Allocation',
    value: '1,420',
    caption: '↑98.4% On-Duty',
    tone: 'ok' as const,
  },
  {
    id: 'safety-composite',
    icon: 'shield',
    label: 'Fleet Safety Composite',
    value: '92',
    unit: '/100',
    caption: 'Superior',
    tone: 'ok' as const,
  },
  {
    id: 'eco-efficiency',
    icon: 'bolt',
    label: 'Fleet Eco-Efficiency',
    value: '94.2',
    unit: 'Wh/km',
    caption: '-4.1% vs Target',
    tone: 'ok' as const,
  },
]

// --- KPI strip ---------------------------------------------------------------

export interface DriverKpi {
  id: string
  label: string
  icon: string
  value: string
  unit?: string
  caption: string
  captionTone: 'ok' | 'warn' | 'crit' | 'neutral'
  progress: number
  progressTone: 'ok' | 'warn' | 'crit' | 'primary' | 'secondary'
  stars?: number
}

export const DRIVER_KPIS: DriverKpi[] = [
  {
    id: 'fleet-driver-rating',
    label: 'Fleet Driver Rating',
    icon: 'star',
    value: '4.82',
    unit: '/ 5.00',
    caption: '★ Top 5% Commercial EV Fleets',
    captionTone: 'neutral',
    progress: 96.4,
    progressTone: 'warn',
    stars: 4.5,
  },
  {
    id: 'harsh-braking',
    label: 'Harsh Braking',
    icon: 'do_not_disturb_on',
    value: '0.42',
    unit: '/100km',
    caption: '↘ -28% MoM improvement',
    captionTone: 'ok',
    progress: 42,
    progressTone: 'primary',
  },
  {
    id: 'harsh-accel',
    label: 'Harsh Acceleration',
    icon: 'speed',
    value: '0.38',
    unit: '/100km',
    caption: 'Within 0.40 SLA Threshold',
    captionTone: 'neutral',
    progress: 38,
    progressTone: 'primary',
  },
  {
    id: 'regen-yield',
    label: 'Regen Energy Yield',
    icon: 'autorenew',
    value: '18.4%',
    unit: 'recovered',
    caption: '+2.1 kWh/shift per vehicle',
    captionTone: 'ok',
    progress: 18.4 * 4,
    progressTone: 'ok',
  },
  {
    id: 'excessive-idling',
    label: 'Excessive Idling',
    icon: 'hourglass_empty',
    value: '4.1%',
    unit: 'of shift',
    caption: 'Optimal thermal HVAC state',
    captionTone: 'neutral',
    progress: 41,
    progressTone: 'secondary',
  },
]

// --- Tier distribution -------------------------------------------------------

export const TIER_DISTRIBUTION = {
  target: 'Target: >90% Standard+',
  bands: [
    { tier: 'elite' as DriverTier, pct: 64, drivers: 908, range: '(90-100)', note: 'Qualifies for max bonus' },
    { tier: 'standard' as DriverTier, pct: 28, drivers: 398, range: '(75-89)', note: 'Nominal SLA compliance' },
    { tier: 'coaching' as DriverTier, pct: 8, drivers: 114, range: '(<75)', note: 'Priority remediation' },
  ],
  calibration: 'Calibrated across 1,420 telematics streams',
}

/** 7-day aggregated Wh/km velocity — the kinetic recovery sparkline. */
export const KINETIC_RECOVERY_SERIES = [
  { day: 'D-6', whKm: 98.4 },
  { day: 'D-5', whKm: 97.1 },
  { day: 'D-4', whKm: 95.8 },
  { day: 'D-3', whKm: 96.4 },
  { day: 'D-2', whKm: 94.2 },
  { day: 'D-1', whKm: 93.1 },
  { day: 'Today', whKm: 94.2 },
]

// --- Automated coaching queue ------------------------------------------------

export const COACHING_QUEUE = {
  urgentCount: 12,
  primary: {
    title: 'Aggressive Incline Launches',
    driverCount: 12,
    location: 'Peenya Hill Route · Cluster #4B',
    detail:
      'Excess torque pulse (>320 Nm instantly at 12% grade) triggering premature inverter thermal protection.',
    module: 'Smooth Grade Ascent',
    action: 'Assign Batch',
  },
  secondary: {
    title: 'Late-apex braking: Koramangala Outer Ring',
    driverCount: 7,
    action: 'View 7 Drivers',
  },
}

// --- Per-driver analytics ----------------------------------------------------

const DESIGNED_ANALYTICS: DriverAnalytics[] = [
  {
    driverId: 'DRV-2041',
    licence: 'KA-01-2018-92',
    tier: 'elite',
    assignedReg: 'MH 12 AB 4321',
    distanceKmMonth: 2410,
    tripsMonth: 142,
    safetyScore: 98,
    energyWhKm: 91.4,
    benchmarkWhKm: 96,
    harshBraking: 0,
    harshTurn: 1,
    overSpeed: 0,
    regenPct: 21.2,
    onTimeSlaPct: 99.2,
    joined: 'Jan 2022',
    cluster: 'Koramangala Operating Cluster',
    online: true,
  },
  {
    driverId: 'DRV-1104',
    licence: 'KA-05-2017-41',
    tier: 'elite',
    assignedReg: 'KA 03 MN 7821',
    distanceKmMonth: 2180,
    tripsMonth: 128,
    safetyScore: 94,
    energyWhKm: 93.8,
    benchmarkWhKm: 96,
    harshBraking: 1,
    harshTurn: 0,
    overSpeed: 0,
    regenPct: 19.5,
    onTimeSlaPct: 97.8,
    joined: 'Mar 2021',
    cluster: 'Peenya Operating Cluster',
    online: true,
  },
  {
    driverId: 'DRV-1980',
    licence: 'KL-07-2015-88',
    tier: 'standard',
    assignedReg: 'KA 51 EA 9012',
    distanceKmMonth: 1890,
    tripsMonth: 112,
    safetyScore: 86,
    energyWhKm: 97.1,
    benchmarkWhKm: 96,
    harshBraking: 2,
    harshTurn: 1,
    overSpeed: 0,
    regenPct: 17.1,
    onTimeSlaPct: 95.4,
    joined: 'Aug 2020',
    cluster: 'Whitefield Operating Cluster',
    online: false,
  },
  {
    driverId: 'DRV-0914',
    licence: 'KA-04-2021-12',
    tier: 'coaching',
    assignedReg: 'KA 04 EP 8812',
    distanceKmMonth: 1640,
    tripsMonth: 98,
    safetyScore: 74,
    energyWhKm: 108.6,
    benchmarkWhKm: 96,
    harshBraking: 5,
    harshTurn: 3,
    overSpeed: 1,
    regenPct: 11.4,
    onTimeSlaPct: 89.1,
    joined: 'Nov 2022',
    cluster: 'Whitefield Operating Cluster',
    online: false,
  },
  {
    driverId: 'DRV-2311',
    licence: 'KA-53-2020-55',
    tier: 'elite',
    assignedReg: 'KA 05 AB 1109',
    distanceKmMonth: 2320,
    tripsMonth: 134,
    safetyScore: 97,
    energyWhKm: 92.0,
    benchmarkWhKm: 96,
    harshBraking: 0,
    harshTurn: 0,
    overSpeed: 0,
    regenPct: 20.8,
    onTimeSlaPct: 99.5,
    joined: 'Feb 2021',
    cluster: 'Koramangala Operating Cluster',
    online: true,
  },
]

/** Derives analytics for roster drivers the design does not draw. */
function deriveAnalytics(driver: Driver, index: number): DriverAnalytics {
  let seed = 4400 + index * 977
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const between = (lo: number, hi: number, dp = 0) => Number((lo + rand() * (hi - lo)).toFixed(dp))

  const score = driver.safetyScore
  const tier: DriverTier = score >= 90 ? 'elite' : score >= 75 ? 'standard' : 'coaching'
  const assigned = VEHICLES.find((v) => v.driverId === driver.id)

  return {
    driverId: driver.id,
    licence: `KA-${String(Math.round(between(1, 60))).padStart(2, '0')}-20${Math.round(between(15, 22))}-${Math.round(between(10, 99))}`,
    tier,
    assignedReg: assigned?.registration ?? '— Unassigned',
    distanceKmMonth: Math.round(between(1200, 2600)),
    tripsMonth: Math.round(between(74, 150)),
    safetyScore: score,
    energyWhKm: driver.efficiencyWhKm,
    benchmarkWhKm: 96,
    harshBraking: driver.harshEvents,
    harshTurn: Math.round(between(0, tier === 'coaching' ? 3 : 1)),
    overSpeed: tier === 'coaching' ? Math.round(between(0, 2)) : 0,
    regenPct: between(tier === 'coaching' ? 10 : 16, tier === 'elite' ? 22 : 18, 1),
    onTimeSlaPct: between(tier === 'coaching' ? 87 : 94, 99.6, 1),
    joined: `${['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'][Math.floor(rand() * 6)]} 20${Math.round(between(19, 23))}`,
    cluster: `${driver.hub.split(' ')[0]} Operating Cluster`,
    online: rand() > 0.35,
  }
}

export const DRIVER_ANALYTICS: DriverAnalytics[] = DRIVERS.map((driver, i) => {
  const designed = DESIGNED_ANALYTICS.find((d) => d.driverId === driver.id)
  return designed ?? deriveAnalytics(driver, i)
})

export function getDriverAnalytics(driverId: string): DriverAnalytics | undefined {
  return DRIVER_ANALYTICS.find((d) => d.driverId === driverId)
}

// --- Selected-driver detail panel -------------------------------------------

export const DRIVER_INCENTIVE = {
  amount: '₹4,200',
  delta: '+₹850 vs last cycle',
  rationale:
    'Achieved via sustained efficiency <95 Wh/km across 142 complete duty cycles without thermal threshold warnings.',
  payoutDate: '31 AUG 2024',
}

export const SHIFT_LOGS = [
  {
    id: '#TR-8821',
    route: 'Silk Board to Domlur',
    efficiency: '89 Wh/km',
    detail: '14.2 km · 28 min · 0 Harsh Events',
  },
  {
    id: '#TR-8810',
    route: 'Koramangala Hub to HSR',
    efficiency: '92 Wh/km',
    detail: '9.6 km · 19 min · 0 Harsh Events',
  },
  {
    id: '#TR-8798',
    route: 'Hub Pre-Dispatch Calibration',
    efficiency: '94 Wh/km',
    detail: '3.1 km · 8 min · Automated Battery Test',
  },
]

/** Continuous velocity profile — speed consistency over the shift. */
export const VELOCITY_PROFILE = Array.from({ length: 40 }, (_, i) => {
  const t = i / 39
  return {
    t: i,
    speed: 30 + 14 * Math.sin(t * 5.4) + 5 * Math.sin(t * 13.1) + 3 * Math.cos(t * 21),
  }
})

export const VELOCITY_STATS = {
  state: 'Smooth',
  peakLabel: '48 km/h (Limit: 50)',
  cruiseRatio: '71.8%',
  torqueRipple: '0.02 G (Nominal)',
}

/** IMU G-force scatter — lateral vs longitudinal, in G. */
export const IMU_SAMPLES = [
  { lateral: 0.04, longitudinal: -0.06 },
  { lateral: -0.02, longitudinal: 0.03 },
  { lateral: 0.08, longitudinal: -0.11 },
  { lateral: 0.12, longitudinal: 0.05 },
  { lateral: -0.06, longitudinal: -0.14 },
  { lateral: 0.18, longitudinal: -0.04 },
  { lateral: 0.05, longitudinal: 0.09 },
  { lateral: -0.11, longitudinal: -0.18 },
  { lateral: 0.24, longitudinal: -0.12 },
  { lateral: 0.02, longitudinal: -0.28 },
  { lateral: -0.15, longitudinal: 0.07 },
  { lateral: 0.09, longitudinal: -0.21 },
]

export const IMU_STATS = [
  { label: 'Peak Lateral Acceleration', value: '0.24 G (Threshold: 0.50 G)' },
  { label: 'Max Longitudinal Decel', value: '0.28 G (Smooth Stop)' },
  { label: 'Zero Critical Impact Flag', value: 'Confirmed Safe' },
]

export const DRIVER_FILTERS = {
  hubs: 'All Hubs (Koramangala, Peenya, Whitefield)',
  shifts: ['Day + Night Full-Time', 'Day Shift Only', 'Night Shift Only', 'Relief / Part-Time'],
  tiers: ['All Tiers', 'Elite Tier', 'Standard', 'Coaching Needed'],
}
