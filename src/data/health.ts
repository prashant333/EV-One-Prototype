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

export type SignalAxis = 'left' | 'right'

export interface SignalSeries {
  key: string
  label: string
  /** Literal hex — Recharts needs a colour value, not a Tailwind class. */
  color: string
  unit: string
  axis: SignalAxis
  render: 'area' | 'line'
  dashed?: boolean
  /** Latest value, shown as a legend chip above the plot. */
  current: string
}

export interface SignalGroup {
  id: string
  label: string
  icon: string
  headline: string
  description: string
  left: { domain: [number, number]; unit: string }
  right?: { domain: [number, number]; unit: string }
  series: SignalSeries[]
  scaleNote: string
  qualityNote: string
  /** The three summary tiles under the plot. */
  stats: Array<{ label: string; value: string; caption: string }>
}

export interface SignalSample {
  t: string
  speedKmh: number
  motorRpm: number
  torqueNm: number
  powerKw: number
  dcBusV: number
  phaseA: number
  packTempC: number
  motorTempC: number
  coolantInC: number
  ambientC: number
  socPct: number
  throttlePct: number
  brakePct: number
}

/**
 * One 15-minute drive cycle at 15s resolution, generated from a single speed
 * profile so every trace is physically consistent with the others: torque
 * follows acceleration, power follows torque x rpm, bus voltage sags under
 * load, and current follows power. Deterministic — no Math.random.
 */
function buildSamples(): SignalSample[] {
  const COUNT = 61
  const out: SignalSample[] = []

  const speedAt = (t: number) =>
    Math.max(0, 27 + 15 * Math.sin(t * 6.1) + 6 * Math.sin(t * 17.3 + 0.6) + 3 * Math.cos(t * 29))

  for (let i = 0; i < COUNT; i++) {
    const t = i / (COUNT - 1)
    const elapsedSec = i * 15
    const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0')
    const ss = String(elapsedSec % 60).padStart(2, '0')

    const speedKmh = speedAt(t)
    // Acceleration from the speed curve drives torque demand. The raw
    // derivative is in normalised-time units and swings far wider than a real
    // driveline, so it is scaled down and clamped to the motor's envelope.
    const rawAccel = (speedAt(Math.min(1, t + 0.01)) - speedAt(Math.max(0, t - 0.01))) / 0.02
    const accel = Math.max(-34, Math.min(52, rawAccel / 4.2))
    const motorRpm = speedKmh * 92
    const torqueNm = 30 + accel + 6 * Math.sin(t * 11.2)
    const powerKw = (torqueNm * motorRpm) / 9550
    // Pack sags under draw and recovers on regen.
    const dcBusV = 392.4 - powerKw * 0.32 + 2.1 * Math.sin(t * 23)
    const phaseA = Math.abs((powerKw * 1000) / (dcBusV * 1.732 * 0.95))

    out.push({
      t: `${mm}:${ss}`,
      speedKmh: Number(speedKmh.toFixed(1)),
      motorRpm: Math.round(motorRpm),
      torqueNm: Number(torqueNm.toFixed(1)),
      powerKw: Number(powerKw.toFixed(1)),
      dcBusV: Number(dcBusV.toFixed(1)),
      phaseA: Number(phaseA.toFixed(1)),
      // Pack warms slowly under sustained draw; motor tracks it faster.
      packTempC: Number((30.4 + t * 1.6 + 0.4 * Math.sin(t * 9)).toFixed(1)),
      motorTempC: Number((44.8 + t * 4.2 + 1.8 * Math.sin(t * 6.4 + 1)).toFixed(1)),
      coolantInC: Number((28.6 + t * 1.4 + 0.5 * Math.sin(t * 12)).toFixed(1)),
      ambientC: Number((27.1 + 0.3 * Math.sin(t * 4)).toFixed(1)),
      socPct: Number((72.9 - t * 0.9).toFixed(2)),
      throttlePct: Number(Math.max(0, Math.min(100, 42 + accel * 2.6)).toFixed(0)),
      brakePct: Number(Math.max(0, Math.min(100, -accel * 3.1)).toFixed(0)),
    })
  }
  return out
}

export const SIGNAL_SAMPLES: SignalSample[] = buildSamples()

/** Window label shown across the top of the plot. */
export const SIGNAL_WINDOW = {
  start: '14:00:00',
  marks: ['14:03:45', '14:07:30', '14:11:15'],
  end: '14:15:00 (NOW)',
  resolution: '15s resolution · 61 samples · CAN 500 kbps',
}

export const SIGNAL_GROUPS: SignalGroup[] = [
  {
    id: 'powertrain',
    label: 'Powertrain',
    icon: 'settings_input_component',
    headline: 'Motor Speed & Torque Delivery',
    description: 'Rotor speed against commanded torque across the drive cycle.',
    left: { domain: [0, 4800], unit: 'RPM' },
    right: { domain: [-20, 100], unit: 'Nm' },
    series: [
      { key: 'motorRpm', label: 'Motor Speed', color: '#0037b0', unit: 'RPM', axis: 'left', render: 'area', current: '2,840 RPM' },
      { key: 'torqueNm', label: 'Output Torque', color: '#004f35', unit: 'Nm', axis: 'right', render: 'line', current: '64.5 Nm' },
    ],
    scaleNote: 'Left 0–4,800 RPM · Right −20–100 Nm',
    qualityNote: 'Stability Index 99.8% (0 transient spikes)',
    stats: [
      { label: 'Peak Rotor Speed', value: '3,182 RPM', caption: 'Within 4,500 RPM ceiling' },
      { label: 'Torque Ripple', value: '2.4%', caption: 'Smooth commutation' },
      { label: 'Regen Events', value: '11', caption: 'Negative torque intervals' },
    ],
  },
  {
    id: 'traction-power',
    label: 'Traction Power',
    icon: 'bolt',
    headline: 'DC Bus & Phase Current',
    description: 'Pack voltage sag against inverter phase current draw.',
    left: { domain: [340, 420], unit: 'V' },
    right: { domain: [0, 180], unit: 'A' },
    series: [
      { key: 'dcBusV', label: 'DC Bus Voltage', color: '#0037b0', unit: 'V', axis: 'left', render: 'area', current: '392.4 V' },
      { key: 'phaseA', label: 'Phase Current', color: '#4b41e1', unit: 'A', axis: 'right', render: 'line', current: '112.4 A' },
    ],
    scaleNote: 'Left 340–420 V DC · Right 0–180 A RMS',
    qualityNote: 'No under-voltage excursions below 355 V',
    stats: [
      { label: 'Ripple Voltage', value: '0.42 Vpp', caption: 'Within 1.5V tolerance' },
      { label: 'Current Draw Peak', value: '112.4 A', caption: 'During ramp-up @ 14:08' },
      { label: 'Harmonic Distortion', value: '2.1% THD', caption: 'Optimal class 1' },
    ],
  },
  {
    id: 'thermal',
    label: 'Thermal',
    icon: 'device_thermostat',
    headline: 'Thermal Loop Profile',
    description: 'Pack, motor and coolant temperatures against ambient.',
    left: { domain: [20, 70], unit: '°C' },
    series: [
      { key: 'motorTempC', label: 'Motor', color: '#d97706', unit: '°C', axis: 'left', render: 'line', current: '48.0 °C' },
      { key: 'packTempC', label: 'Battery Pack', color: '#0037b0', unit: '°C', axis: 'left', render: 'area', current: '31.4 °C' },
      { key: 'coolantInC', label: 'Coolant Inlet', color: '#004f35', unit: '°C', axis: 'left', render: 'line', current: '29.5 °C' },
      { key: 'ambientC', label: 'Ambient', color: '#747686', unit: '°C', axis: 'left', render: 'line', dashed: true, current: '27.1 °C' },
    ],
    scaleNote: 'All traces 20–70 °C · derating threshold 65 °C',
    qualityNote: 'Peak motor temp 49.2 °C — 15.8 °C of headroom',
    stats: [
      { label: 'Pack Rise Rate', value: '+1.6 °C / 15m', caption: 'Nominal under continuous draw' },
      { label: 'Coolant ΔT', value: '4.1 °C', caption: 'Inlet vs outlet across loop' },
      { label: 'Derate Events', value: '0', caption: 'No thermal throttling applied' },
    ],
  },
  {
    id: 'energy-flow',
    label: 'Energy Flow',
    icon: 'autorenew',
    headline: 'Traction Power & State of Charge',
    description: 'Instantaneous power draw and recovery against pack depletion.',
    left: { domain: [-40, 180], unit: 'kW' },
    right: { domain: [70, 75], unit: '%' },
    series: [
      { key: 'powerKw', label: 'Traction Power', color: '#0037b0', unit: 'kW', axis: 'left', render: 'area', current: '48.2 kW' },
      { key: 'socPct', label: 'State of Charge', color: '#004f35', unit: '%', axis: 'right', render: 'line', current: '72.0 %' },
    ],
    scaleNote: 'Left −40–180 kW (negative = regen) · Right 70–75% SoC',
    qualityNote: 'Net 0.9% SoC consumed over the window',
    stats: [
      { label: 'Energy Drawn', value: '2.84 kWh', caption: 'Across the 15m window' },
      { label: 'Regen Recovered', value: '0.52 kWh', caption: '18.3% recovery ratio' },
      { label: 'Mean Draw', value: '11.4 kW', caption: 'Duty-cycle average' },
    ],
  },
  {
    id: 'driver-input',
    label: 'Driver Input',
    icon: 'sports_esports',
    headline: 'Pedal Input & Road Speed',
    description: 'Throttle and brake application against resulting road speed.',
    left: { domain: [0, 100], unit: '%' },
    right: { domain: [0, 60], unit: 'km/h' },
    series: [
      { key: 'throttlePct', label: 'Throttle', color: '#0037b0', unit: '%', axis: 'left', render: 'area', current: '42 %' },
      { key: 'brakePct', label: 'Brake', color: '#e11d48', unit: '%', axis: 'left', render: 'line', current: '0 %' },
      { key: 'speedKmh', label: 'Road Speed', color: '#004f35', unit: 'km/h', axis: 'right', render: 'line', current: '32.0 km/h' },
    ],
    scaleNote: 'Left 0–100% pedal · Right 0–60 km/h',
    qualityNote: 'No simultaneous throttle and brake application detected',
    stats: [
      { label: 'Harsh Braking', value: '0 events', caption: 'Threshold >0.3g' },
      { label: 'Throttle Smoothness', value: '94.1%', caption: 'Low-jerk application' },
      { label: 'Coasting Ratio', value: '21.6%', caption: 'Pedal-off travel time' },
    ],
  },
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
