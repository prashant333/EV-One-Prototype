/**
 * Vehicles and Health data.
 *
 * Fleet-level health KPIs, the active FOTA rollout, and the per-vehicle detail
 * record behind the five tabs on the vehicle health page. Values transcribed
 * from Design/intellicar_one_ev_platform-vehicle_and_health/.
 */

import { VEHICLES, type Subsystem } from './fleet'

// --- Fleet-level KPI strip ---------------------------------------------------

export interface HealthKpi {
  id: string
  label: string
  icon: string
  value: string
  unit?: string
  caption: string
  captionTone: 'ok' | 'warn' | 'crit' | 'neutral'
  footnote: string
  /** Bar fill 0-100 */
  progress: number
  progressTone: 'ok' | 'warn' | 'crit' | 'primary'
}

export const HEALTH_KPIS: HealthKpi[] = [
  {
    id: 'fleet-health-index',
    label: 'Fleet Health Index',
    icon: 'monitor_heart',
    value: '96.4%',
    caption: '↑ +0.8% vs last 7d',
    captionTone: 'ok',
    footnote: '1,368 Healthy · 52 Under Watch',
    progress: 96.4,
    progressTone: 'ok',
  },
  {
    id: 'active-fault-dtcs',
    label: 'Active Fault DTCs',
    icon: 'gpp_maybe',
    value: '6',
    unit: 'Vehicles flagged',
    caption: 'High Severity: Inverter & BMS',
    captionTone: 'crit',
    footnote: '2 Isolation · 4 Cell Imbalance',
    progress: 22,
    progressTone: 'crit',
  },
  {
    id: 'fota-build-status',
    label: 'FOTA Build Status',
    icon: 'browser_updated',
    value: '94.2%',
    caption: 'v4.2.1 Stable Rollout',
    captionTone: 'neutral',
    footnote: '82 Outdated nodes remaining',
    progress: 94.2,
    progressTone: 'primary',
  },
  {
    id: 'motor-operating-temp',
    label: 'Motor Operating Temp',
    icon: 'device_thermostat',
    value: '46.8',
    unit: '°C',
    caption: 'Nominal (Threshold <65°C)',
    captionTone: 'ok',
    footnote: 'Peak Recorded: 58.4°C in Hub-2',
    progress: 72,
    progressTone: 'ok',
  },
  {
    id: 'hv-isolation-integrity',
    label: 'HV Isolation Integrity',
    icon: 'bolt',
    value: '99.8%',
    caption: 'Safe (Mean 820 kΩ > 500 kΩ)',
    captionTone: 'ok',
    footnote: '2 vehicles under degradation triage',
    progress: 99.8,
    progressTone: 'ok',
  },
]

// --- Active FOTA rollout banner ---------------------------------------------

export const ACTIVE_ROLLOUT = {
  campaignId: '#FOTA-8812',
  title: 'Powertrain Inverter Thermal Optimization Patch',
  release: 'v4.2.1-prod-rc4',
  failSafe: 'Dual-Bank A/B Fail-Safe',
  target: 'Tata Ace EV & Euler HiLoad',
  canArbitration: '0x7DF / 0x7E0',
  progressPct: 84,
  flashed: 1192,
  staged: 140,
  scheduled: 88,
  failed: 4,
}

// --- Roster filter options ---------------------------------------------------

export const SUBSYSTEM_FILTERS: Array<{ value: Subsystem | 'all'; label: string }> = [
  { value: 'all', label: 'Subsystem: All' },
  { value: 'bms-battery', label: 'BMS & Battery' },
  { value: 'powertrain-inverter', label: 'Powertrain & Inverter' },
  { value: 'tcu-telemetry', label: 'TCU & Telemetry' },
  { value: 'motor-coolant', label: 'Motor & Coolant' },
]

export const FOTA_FILTERS = [
  { value: 'all', label: 'FOTA: All Statuses' },
  { value: 'up-to-date', label: 'v4.2.1 Up to date' },
  { value: 'flashing', label: 'v4.2.1 Flashing' },
  { value: 'queued', label: 'v4.2.0 Queued' },
  { value: 'update-required', label: 'Update Required' },
] as const

// --- Detail page: subsystem cards -------------------------------------------

export interface SubsystemCard {
  name: string
  icon: string
  state: string
  stateTone: 'ok' | 'warn' | 'crit' | 'info'
  rows: Array<{ label: string; value: string }>
}

export const SUBSYSTEM_CARDS: SubsystemCard[] = [
  {
    name: 'HV BMS',
    icon: 'battery_charging_full',
    state: 'Optimal',
    stateTone: 'ok',
    rows: [
      { label: 'Cell Max ΔV', value: '12 mV' },
      { label: 'Pack SoH', value: '96.4%' },
      { label: 'Balancing', value: '96S Active' },
      { label: 'Insulation (HV+)', value: '18.4 MΩ' },
    ],
  },
  {
    name: 'Powertrain',
    icon: 'settings_input_component',
    state: 'Optimal',
    stateTone: 'ok',
    rows: [
      { label: 'Phase Current', value: '48.2 A (RMS)' },
      { label: 'DC Bus Voltage', value: '392.4 V' },
      { label: 'Motor RPM', value: '2,840 RPM' },
      { label: 'Output Torque', value: '64.5 Nm' },
    ],
  },
  {
    name: 'TCU Edge',
    icon: 'sensors',
    state: 'Nominal',
    stateTone: 'info',
    rows: [
      { label: '4G LTE RSSI', value: '−68 dBm' },
      { label: 'GNSS Fix', value: '14 Sats (3D Fix)' },
      { label: 'CAN Rate', value: '500 kbps (0 err)' },
      { label: 'Buffer Depth', value: '0 frames' },
    ],
  },
  {
    name: 'Thermal',
    icon: 'ac_unit',
    state: 'Cooling',
    stateTone: 'info',
    rows: [
      { label: 'Coolant Flow', value: '3.8 L/min' },
      { label: 'Inlet Temp', value: '29.5°C' },
      { label: 'Radiator Fan', value: '42% Duty' },
      { label: 'Chiller Valve', value: 'Port A Open' },
    ],
  },
  {
    name: 'KERS / Regen',
    icon: 'autorenew',
    state: 'Optimal',
    stateTone: 'ok',
    rows: [
      { label: 'Regen Efficiency', value: '18.4%' },
      { label: 'Peak Regen KW', value: '−18.6 kW' },
      { label: 'Brake Pad Life', value: '88% Est.' },
      { label: 'ABS/ESP Flags', value: 'All Clear' },
    ],
  },
]

// --- Detail page: CAN oscilloscope ------------------------------------------

/** Three CAN signals over the last 15 minutes, normalised for co-plotting. */
export const CAN_WAVEFORMS = Array.from({ length: 61 }, (_, i) => {
  const t = i / 60
  return {
    t: `14:${String(Math.floor(i / 4)).padStart(2, '0')}`,
    busVoltage: 62 + 14 * Math.sin(t * 7.2) + 6 * Math.sin(t * 19),
    motorRpm: 48 + 34 * Math.sin(t * 11.5 + 1.2) + 9 * Math.cos(t * 23),
    torque: 38 + 16 * Math.sin(t * 5.1 + 2.4),
  }
})

export const OSCILLOSCOPE_STATS = {
  busVoltage: '392.4 V Bus',
  motorRpm: '2,840 RPM',
  torque: '64.5 Nm',
  scale: 'Scale: 360V – 420V DC',
  stability: 'Stability Index 99.8% (0 transient spikes)',
}

export const SIGNAL_QUALITY = [
  { label: 'Ripple Voltage', value: '0.42 Vpp', caption: 'Within 1.5V tolerance' },
  { label: 'Current Draw Peak', value: '112.4 A', caption: 'During ramp-up @ 14:08' },
  { label: 'Harmonic Distortion', value: '2.1% THD', caption: 'Optimal class 1' },
]

export const DIGITAL_TWIN = {
  payloadLabel: 'EV-L7 Payload',
  payloadMax: 'Payload: 600 kg Max',
  grossWeight: '1,840 kg',
  tirePressure: '42 PSI (All 4)',
}

export const DTC_PANEL = {
  activeCount: 0,
  description:
    'Real-time OBD-II/UDS polling active over ISO 14229. No MIL or Warning lamps illuminated.',
  lastCleared: {
    code: 'P0562',
    label: 'Auxiliary 12V Transient Voltage Low',
    resolved: 'Resolved 14 days ago',
    by: 'By: Rajesh K. (NOC)',
  },
}

// --- Detail page: Trip History tab ------------------------------------------

export const LIVE_TRIP = {
  id: '#TRP-8492',
  state: 'In-Transit · Live',
  route: 'Koramangala Hub → Indiranagar Zone 3 Hub',
  departed: '14:10 IST',
  estArrival: '15:05 IST',
  distance: '11.2 / 18.4 km',
  progressPct: 61,
  liveSpeed: '32 km/h',
  liveEfficiency: '92.0',
}

export const COMPLETED_TRIPS = [
  {
    id: '#TRP-8488',
    route: 'Silk Board → Domlur Radial',
    timeline: 'Today 09:30 – 11:15',
    driver: 'Rahul Sharma',
    distanceKm: 24.2,
    efficiency: 89.0,
    harshEvents: 0,
  },
  {
    id: '#TRP-8451',
    route: 'Peenya Logistics Corridor → Whitefield',
    timeline: 'Yesterday 13:00 – 15:40',
    driver: 'Suresh Nair',
    distanceKm: 42.8,
    efficiency: 98.0,
    harshEvents: 0,
  },
  {
    id: '#TRP-8412',
    route: 'Electronic City Ring Radial Depot',
    timeline: '2 days ago 10:15 – 12:00',
    driver: 'Rahul Sharma',
    distanceKm: 31.0,
    efficiency: 94.0,
    harshEvents: 0,
  },
]

// --- Detail page: Charging History tab --------------------------------------

export const CHARGING_SUMMARY = [
  { label: 'Month Delivered Energy', value: '642.0', unit: 'kWh Total', caption: '18 Total Depot & Field Sessions' },
  { label: 'DC Fast vs AC Ratio', value: '65%', unit: 'DC Fast / 35% AC', caption: 'Split across depot and opportunity' },
  { label: 'Average Session Duration', value: '42', unit: 'minutes', caption: 'Fast charger avg turnover' },
]

export const CHARGING_SESSIONS = [
  {
    id: '#CHG-9021',
    location: 'Whitefield Fast Charger Bay #02 (CCS2)',
    start: 'Today 06:15',
    duration: '38m 14s',
    deltaSoc: '18% → 84%',
    energyKwh: 14.28,
    peakKw: 48.2,
    maxTempC: 36.2,
    cost: '₹102.80',
  },
  {
    id: '#CHG-8942',
    location: 'Koramangala Hub AC Type-2 Gun A',
    start: 'Yesterday 22:00',
    duration: '4h 12m',
    deltaSoc: '24% → 100% (Balanced)',
    energyKwh: 21.4,
    peakKw: 7.2,
    maxTempC: 29.1,
    cost: '₹149.80',
  },
  {
    id: '#CHG-8871',
    location: 'Indiranagar Opportunity DC Fast #01',
    start: '3 days ago 16:30',
    duration: '22m 05s',
    deltaSoc: '32% → 70%',
    energyKwh: 9.8,
    peakKw: 45.0,
    maxTempC: 34.8,
    cost: '₹70.56',
  },
]

// --- Detail page: Driver Assignment tab -------------------------------------

export const ASSIGNED_DRIVER = {
  name: 'Rahul Sharma',
  id: 'ID #DRV-2041',
  tier: 'Elite Tier 1',
  rating: 4.9,
  verifiedRuns: 340,
  shift: 'Day Shift (07:00 – 16:30)',
  hoursInVehicle: '142.5 hrs',
  mobile: '+91 98402 12093',
  licence: 'KA-01-2018-92',
  score: 98,
  scorePercentile: 'Top 2% Fleet',
  metrics: [
    { label: 'Harsh Braking', value: '0 / 100km', caption: 'Threshold >0.3g' },
    { label: 'Harsh Accel', value: '0.2 / 100km', caption: 'Sub-nominal' },
    { label: 'Over-Speeding', value: '0 Incidents', caption: 'Speed cap: 60 km/h' },
    { label: 'Eco-Drive Index', value: '96.1%', caption: 'Max regen utilization' },
  ],
  relief: {
    name: 'Suresh Nair',
    id: '#DRV-1980',
    note: 'Operated vehicle yesterday during Peenya corridor relay (42.8 km)',
    score: 94.0,
    lastAudit: 'Last telematics calibration audit: 4 days ago',
  },
}

// --- Detail page: Maintenance & Service tab ---------------------------------

export const SCHEDULED_SERVICE = {
  title: '15,000 km Brake & Coolant Service',
  dueKm: '2,180 km',
  dueDays: '24 days',
  location: 'Pre-allocated at Koramangala Hub Workshop.',
}

export const WORK_ORDERS = [
  {
    id: '#MNT-4812',
    category: 'HV Inverter Thermal Anomaly',
    action: 'Replaced IGBT Module in Bay #03, firmware thermal maps recalibrated',
    tech: 'Rajesh K.',
    downtime: '2.1 hrs',
    cost: '₹2,400',
    signedOff: '3 days ago',
  },
  {
    id: '#MNT-3904',
    category: 'Scheduled 10,000 km Service',
    action: 'Wheel alignment, brake pad wear inspection (12mm remaining), BMS contactor cleaning',
    tech: 'David V.',
    downtime: '3.5 hrs',
    cost: '₹4,120',
    signedOff: '45 days ago',
  },
  {
    id: '#MNT-2218',
    category: 'Tire & TPMS Calibration',
    action: 'Rotated front/rear sets, programmed sensor IDs into central telematics gateway',
    tech: 'Rajesh K.',
    downtime: '1.2 hrs',
    cost: '₹900',
    signedOff: '90 days ago',
  },
]

// --- Derived counts used by the roster tabs ---------------------------------

export function gradeCounts() {
  return {
    all: VEHICLES.length,
    A: VEHICLES.filter((v) => v.healthGrade === 'A').length,
    B: VEHICLES.filter((v) => v.healthGrade === 'B').length,
    C: VEHICLES.filter((v) => v.healthGrade === 'C').length,
  }
}
