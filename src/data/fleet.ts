/**
 * Representational fleet data. There is no database in this prototype — per
 * claude.md, all data lives at code level. Values are transcribed from the
 * delivered designs so the prototype matches the screens 1:1.
 */

import type { SegmentId } from './platform'

export type VehicleStatus = 'on-trip' | 'thermal-alert' | 'staging' | 'charging' | 'offline'

/** Overall health grade shown on the Vehicles and Health roster. */
export type HealthGrade = 'A' | 'B' | 'C'

/** Firmware state per the FOTA column of the Vehicle Health design. */
export type FirmwareStatus = 'up-to-date' | 'queued' | 'flashing' | 'update-required'

export interface Dtc {
  /** OBD-II / UDS trouble code, e.g. P0A7F. */
  code: string
  label: string
  subsystem: Subsystem
}

export type Subsystem = 'bms-battery' | 'powertrain-inverter' | 'tcu-telemetry' | 'motor-coolant'

export const SUBSYSTEM_LABELS: Record<Subsystem, string> = {
  'bms-battery': 'BMS & Battery',
  'powertrain-inverter': 'Powertrain & Inverter',
  'tcu-telemetry': 'TCU & Telemetry',
  'motor-coolant': 'Motor & Coolant',
}

export interface Vehicle {
  id: string
  registration: string
  model: string
  /** e.g. "Cargo Box · Last Mile" — the fleet-type line under the model. */
  fleetType: string
  vin: string
  status: VehicleStatus
  driverId: string | null
  soc: number
  rangeKm: number
  speedKmh: number
  packTempC: number
  motorTempC: number
  /** Short motor/inverter state label, e.g. "Stator OK", "Thermal Warning". */
  motorLabel: string
  efficiencyWhKm: number | null
  odometerKm: number
  /** Cell voltage deviation (ΔV) in millivolts. */
  cellDeviationMv: number
  packSohPct: number
  hub: string
  packId: string
  lastPingSeconds: number
  position: { lat: number; lng: number }
  activeTripId: string | null

  // --- Vehicles and Health ---
  healthGrade: HealthGrade
  healthScore: number
  dtcs: Dtc[]
  firmwareVersion: string
  firmwareStatus: FirmwareStatus
}

export interface Driver {
  id: string
  name: string
  phone: string
  rating: number
  efficiencyPct: number
  safetyScore: number
  harshEvents: number
  harshEventLabel: string
  efficiencyWhKm: number
  grade: 'Elite' | 'Grade A' | 'Flagged'
  hub: string
}

export type TripStatus = 'on-time' | 'delayed' | 'completed'
export type TripPriority = 'High Priority' | 'Standard' | 'Standard Express' | 'Passenger Feeder' | 'Heavy Cargo'

export interface Trip {
  id: string
  tripCode: string
  vehicleId: string
  driverId: string
  priority: TripPriority
  origin: string
  destination: string
  corridor: string
  departure: string
  eta: string
  driftMinutes: number
  status: TripStatus
  /** Corridor-adherence state shown in the Vehicles & Trips table. */
  corridorState: 'in-corridor' | 'route-deviation' | 'approaching-gate' | 'swap-required'
  routeName: string
}

export interface Hub {
  id: string
  name: string
  zoneId: string
  evCount: number
  position: { lat: number; lng: number }
  perimeterKm2: number
  slaAdherencePct: number
  speedCapKmh: number
  maxIdleMins: number
  gateSocPct: number
}

export type AlertSeverity = 'critical' | 'warning' | 'scheduled'

export interface HealthAlert {
  id: string
  vehicleId: string
  registration: string
  severity: AlertSeverity
  riskLabel: string
  title: string
  detail: string
  footnote: string
  action: string
  /** Module the action belongs to — used to gate it behind RBAC. */
  actionModule: 'maintenance' | 'operational-alerts'
}

// --- Drivers -----------------------------------------------------------------

export const DRIVERS: Driver[] = [
  {
    id: 'DRV-1001',
    name: 'Rahul Sharma',
    phone: '+91 98450 22110',
    rating: 4.9,
    efficiencyPct: 96.1,
    safetyScore: 98,
    harshEvents: 0,
    harshEventLabel: '0 Harsh Events',
    efficiencyWhKm: 94.2,
    grade: 'Elite',
    hub: 'Koramangala Hub',
  },
  {
    id: 'DRV-1002',
    name: 'Vikram Patil',
    phone: '+91 94481 44521',
    rating: 4.6,
    efficiencyPct: 91.4,
    safetyScore: 94,
    harshEvents: 1,
    harshEventLabel: '1 Harsh Braking',
    efficiencyWhKm: 98.1,
    grade: 'Grade A',
    hub: 'Peenya Corridor',
  },
  {
    id: 'DRV-1003',
    name: 'Suresh Nair',
    phone: '+91 99801 76230',
    rating: 4.1,
    efficiencyPct: 82.7,
    safetyScore: 79,
    harshEvents: 3,
    harshEventLabel: '3 Aggressive Accels',
    efficiencyWhKm: 118.4,
    grade: 'Flagged',
    hub: 'Whitefield Ring',
  },
  {
    id: 'DRV-1004',
    name: 'Ramesh K.',
    phone: '+91 98402 12093',
    rating: 4.7,
    efficiencyPct: 93.2,
    safetyScore: 92,
    harshEvents: 1,
    harshEventLabel: '1 Harsh Cornering',
    efficiencyWhKm: 99.6,
    grade: 'Grade A',
    hub: 'Peenya Corridor',
  },
  {
    id: 'DRV-1005',
    name: 'Anil Sharma',
    phone: '+91 97118 78239',
    rating: 4.5,
    efficiencyPct: 89.9,
    safetyScore: 90,
    harshEvents: 2,
    harshEventLabel: '2 Harsh Braking',
    efficiencyWhKm: 104.3,
    grade: 'Grade A',
    hub: 'Airport Arterial',
  },
  {
    id: 'DRV-1006',
    name: 'Mohammad Rafi',
    phone: '+91 99023 55198',
    rating: 4.8,
    efficiencyPct: 94.8,
    safetyScore: 96,
    harshEvents: 0,
    harshEventLabel: '0 Harsh Events',
    efficiencyWhKm: 96.1,
    grade: 'Elite',
    hub: 'Whitefield Ring',
  },
  {
    id: 'DRV-1007',
    name: 'Santosh Deshmukh',
    phone: '+91 93240 88219',
    rating: 4.4,
    efficiencyPct: 88.1,
    safetyScore: 88,
    harshEvents: 2,
    harshEventLabel: '2 Overspeed Events',
    efficiencyWhKm: 108.7,
    grade: 'Grade A',
    hub: 'Peenya Corridor',
  },
  {
    id: 'DRV-1008',
    name: 'Vijay S.',
    phone: '+91 94481 44521',
    rating: 4.6,
    efficiencyPct: 92.0,
    safetyScore: 93,
    harshEvents: 1,
    harshEventLabel: '1 Harsh Braking',
    efficiencyWhKm: 97.4,
    grade: 'Grade A',
    hub: 'Koramangala Hub',
  },
  {
    id: 'DRV-1009',
    name: 'Rajesh K.',
    phone: '+91 90083 41200',
    rating: 4.5,
    efficiencyPct: 90.6,
    safetyScore: 91,
    harshEvents: 1,
    harshEventLabel: '1 Aggressive Accel',
    efficiencyWhKm: 101.2,
    grade: 'Grade A',
    hub: 'Whitefield Ring',
  },
  {
    id: 'DRV-1010',
    name: 'Amit Verma',
    phone: '+91 98111 30022',
    rating: 4.7,
    efficiencyPct: 93.5,
    safetyScore: 95,
    harshEvents: 0,
    harshEventLabel: '0 Harsh Events',
    efficiencyWhKm: 95.8,
    grade: 'Elite',
    hub: 'Airport Arterial',
  },
  {
    id: 'DRV-1011',
    name: 'Priya M.',
    phone: '+91 96322 71845',
    rating: 4.8,
    efficiencyPct: 95.2,
    safetyScore: 97,
    harshEvents: 0,
    harshEventLabel: '0 Harsh Events',
    efficiencyWhKm: 93.1,
    grade: 'Elite',
    hub: 'Koramangala Hub',
  },
  {
    id: 'DRV-1012',
    name: 'S. Karthik',
    phone: '+91 97890 41562',
    rating: 4.7,
    efficiencyPct: 94.1,
    safetyScore: 95,
    harshEvents: 0,
    harshEventLabel: '0 Harsh Events',
    efficiencyWhKm: 42.6,
    grade: 'Elite',
    hub: 'Airport Arterial',
  },
  {
    id: 'DRV-1013',
    name: 'Jayesh Dave',
    phone: '+91 98255 60417',
    rating: 4.6,
    efficiencyPct: 92.4,
    safetyScore: 93,
    harshEvents: 1,
    harshEventLabel: '1 Harsh Braking',
    efficiencyWhKm: 98.4,
    grade: 'Grade A',
    hub: 'Whitefield Ring',
  },
]

// --- Hubs / geofence zones ---------------------------------------------------

export const HUBS: Hub[] = [
  {
    id: 'HUB-KOR',
    name: 'Koramangala Hub',
    zoneId: 'GF-KOR-01',
    evCount: 148,
    position: { lat: 12.9352, lng: 77.6245 },
    perimeterKm2: 11.4,
    slaAdherencePct: 99.6,
    speedCapKmh: 40,
    maxIdleMins: 12,
    gateSocPct: 40,
  },
  {
    id: 'HUB-PEE',
    name: 'Peenya Corridor',
    zoneId: 'GF-PEE-04',
    evCount: 84,
    position: { lat: 13.0287, lng: 77.5194 },
    perimeterKm2: 14.2,
    slaAdherencePct: 99.2,
    speedCapKmh: 45,
    maxIdleMins: 15,
    gateSocPct: 35,
  },
  {
    id: 'HUB-AIR',
    name: 'Airport Arterial',
    zoneId: 'GF-AIR-02',
    evCount: 32,
    position: { lat: 13.1189, lng: 77.6309 },
    perimeterKm2: 22.8,
    slaAdherencePct: 98.4,
    speedCapKmh: 60,
    maxIdleMins: 20,
    gateSocPct: 55,
  },
  {
    id: 'HUB-WHI',
    name: 'Whitefield Ring',
    zoneId: 'GF-WHI-07',
    evCount: 96,
    position: { lat: 12.9698, lng: 77.7499 },
    perimeterKm2: 18.1,
    slaAdherencePct: 99.0,
    speedCapKmh: 45,
    maxIdleMins: 15,
    gateSocPct: 35,
  },
]

// --- Vehicles ----------------------------------------------------------------
/**
 * The eight designed vehicles. Health attributes (grade, DTCs, ΔV, firmware,
 * motor label) come from the Vehicle Health design; operational values (SoC,
 * driver, hub, active trip) stay as already established so the same vehicle
 * reads identically on the Dashboard and Schedule and Trips screens.
 */
const DESIGNED_VEHICLES: Vehicle[] = [
  {
    id: 'VEH-2210',
    registration: 'MH 12 AB 4321',
    model: 'Tata Ace EV',
    fleetType: 'Cargo Box · Last Mile',
    vin: 'MAT628004M12948',
    status: 'on-trip',
    driverId: 'DRV-1001',
    soc: 72,
    rangeKm: 86,
    speedKmh: 32,
    packTempC: 31.4,
    motorTempC: 48.0,
    motorLabel: 'Stator OK',
    efficiencyWhKm: 94.2,
    odometerKm: 14820,
    cellDeviationMv: 12,
    packSohPct: 96.4,
    hub: 'Koramangala Hub',
    packId: 'BAT-4587',
    lastPingSeconds: 4,
    position: { lat: 12.9352, lng: 77.6245 },
    activeTripId: 'TRP-8492',
    healthGrade: 'A',
    healthScore: 98,
    dtcs: [],
    firmwareVersion: 'v4.2.0',
    firmwareStatus: 'queued',
  },
  {
    id: 'VEH-0914',
    registration: 'KA 03 MN 7821',
    model: 'Mahindra Treo',
    fleetType: 'Electric Auto 3W',
    vin: 'MAH-TRE-9921',
    status: 'thermal-alert',
    driverId: 'DRV-1002',
    soc: 21,
    rangeKm: 19,
    speedKmh: 14,
    packTempC: 54.2,
    motorTempC: 63.8,
    motorLabel: 'Thermal Warning',
    efficiencyWhKm: 128.5,
    odometerKm: 38940,
    cellDeviationMv: 114,
    packSohPct: 81.2,
    hub: 'Peenya Corridor',
    packId: 'BAT-2201',
    lastPingSeconds: 2,
    position: { lat: 13.0287, lng: 77.5194 },
    activeTripId: 'TRP-8493',
    healthGrade: 'C',
    healthScore: 61,
    dtcs: [{ code: 'P0A7F', label: 'Pack Degraded', subsystem: 'bms-battery' }],
    firmwareVersion: 'v4.2.1',
    firmwareStatus: 'up-to-date',
  },
  {
    id: 'VEH-3301',
    registration: 'DL 01 EV 4582',
    model: 'Omega Seiki Rage+',
    fleetType: 'Electric Van · Cargo',
    vin: 'OME-VAN-1204',
    status: 'staging',
    driverId: null,
    soc: 98,
    rangeKm: 142,
    speedKmh: 0,
    packTempC: 26.1,
    motorTempC: 28.4,
    motorLabel: 'Cool',
    efficiencyWhKm: null,
    odometerKm: 20410,
    cellDeviationMv: 11,
    packSohPct: 97.8,
    hub: 'Airport Arterial',
    packId: 'BAT-7734',
    lastPingSeconds: 1,
    position: { lat: 13.1189, lng: 77.6309 },
    activeTripId: 'TRP-8495',
    healthGrade: 'A',
    healthScore: 97,
    dtcs: [],
    firmwareVersion: 'v4.2.1',
    firmwareStatus: 'up-to-date',
  },
  {
    id: 'VEH-5120',
    registration: 'KA 51 EA 9012',
    model: 'Piaggio Ape E-City',
    fleetType: 'Electric 3W Auto',
    vin: 'PIA-APE-7714',
    status: 'on-trip',
    driverId: 'DRV-1006',
    soc: 94,
    rangeKm: 112,
    speedKmh: 28,
    packTempC: 31.0,
    motorTempC: 44.2,
    motorLabel: 'Optimal',
    efficiencyWhKm: 96.1,
    odometerKm: 9120,
    cellDeviationMv: 18,
    packSohPct: 93.1,
    hub: 'Whitefield Ring',
    packId: 'BAT-5590',
    lastPingSeconds: 3,
    position: { lat: 12.9698, lng: 77.7499 },
    activeTripId: 'TRP-8494',
    healthGrade: 'B',
    healthScore: 91,
    dtcs: [],
    firmwareVersion: 'v4.2.1',
    firmwareStatus: 'flashing',
  },
  {
    id: 'VEH-1109',
    registration: 'KA 05 AB 1109',
    model: 'Euler HiLoad EV',
    fleetType: 'Heavy 3W Cargo',
    vin: 'EUL-HIL-8842',
    status: 'charging',
    // Charging at the hub between trips — no live assignment.
    driverId: null,
    soc: 62,
    rangeKm: 78,
    speedKmh: 0,
    packTempC: 34.7,
    motorTempC: 27.1,
    motorLabel: 'Cool',
    efficiencyWhKm: 93.1,
    odometerKm: 27650,
    cellDeviationMv: 12,
    packSohPct: 94.6,
    hub: 'Koramangala Hub',
    packId: 'BAT-3312',
    lastPingSeconds: 6,
    position: { lat: 12.9421, lng: 77.6112 },
    activeTripId: 'TRP-8488',
    healthGrade: 'A',
    healthScore: 95,
    dtcs: [],
    firmwareVersion: 'v4.2.1',
    firmwareStatus: 'up-to-date',
  },
  {
    id: 'VEH-1804',
    registration: 'MH 14 GH 9901',
    model: 'Mahindra Zor Grand',
    fleetType: 'Electric 3W Delivery',
    vin: 'MAH-ZOR-1150',
    status: 'on-trip',
    driverId: 'DRV-1007',
    soc: 18,
    rangeKm: 22,
    speedKmh: 36,
    packTempC: 38.9,
    motorTempC: 41.5,
    motorLabel: 'Optimal',
    efficiencyWhKm: 108.7,
    odometerKm: 44210,
    cellDeviationMv: 14,
    packSohPct: 88.4,
    hub: 'Peenya Corridor',
    packId: 'BAT-9018',
    lastPingSeconds: 5,
    position: { lat: 13.0102, lng: 77.5501 },
    activeTripId: 'TRP-89239',
    healthGrade: 'A',
    healthScore: 96,
    dtcs: [],
    firmwareVersion: 'v4.2.0',
    firmwareStatus: 'queued',
  },
  {
    id: 'VEH-4420',
    registration: 'KA 04 EP 8812',
    model: 'Tata Ace EV',
    fleetType: 'Cargo Box · Last Mile',
    vin: 'MAT628004M11099',
    status: 'staging',
    driverId: 'DRV-1009',
    soc: 92,
    rangeKm: 128,
    speedKmh: 0,
    packTempC: 27.4,
    motorTempC: 25.0,
    motorLabel: 'Cool',
    efficiencyWhKm: 95.4,
    odometerKm: 11240,
    cellDeviationMv: 9,
    packSohPct: 97.1,
    hub: 'Koramangala Hub',
    packId: 'BAT-6104',
    lastPingSeconds: 2,
    position: { lat: 12.9512, lng: 77.6398 },
    activeTripId: null,
    healthGrade: 'A',
    healthScore: 97,
    dtcs: [],
    firmwareVersion: 'v4.2.1',
    firmwareStatus: 'up-to-date',
  },
  {
    id: 'VEH-6650',
    registration: 'KA 53 TR 1190',
    model: 'Euler HiLoad EV',
    fleetType: 'Heavy 3W Cargo',
    vin: 'EUL-HIL-2077',
    status: 'staging',
    driverId: 'DRV-1010',
    soc: 88,
    rangeKm: 119,
    speedKmh: 0,
    packTempC: 28.2,
    motorTempC: 25.6,
    motorLabel: 'Cool',
    efficiencyWhKm: 97.8,
    odometerKm: 16880,
    cellDeviationMv: 11,
    packSohPct: 96.0,
    hub: 'Whitefield Ring',
    packId: 'BAT-4420',
    lastPingSeconds: 3,
    position: { lat: 12.9812, lng: 77.7261 },
    activeTripId: null,
    healthGrade: 'A',
    healthScore: 96,
    dtcs: [],
    firmwareVersion: 'v4.2.1',
    firmwareStatus: 'up-to-date',
  },

  // --- Additional vehicles introduced by the Vehicle Health design ---
  {
    id: 'VEH-1120',
    registration: 'KA 04 MM 1120',
    model: 'Euler HiLoad EV',
    fleetType: 'Heavy 3W Cargo',
    vin: 'MAT628004M14012',
    status: 'on-trip',
    driverId: 'DRV-1011',
    soc: 54,
    rangeKm: 58,
    speedKmh: 24,
    packTempC: 29.8,
    motorTempC: 39.0,
    motorLabel: 'Optimal',
    efficiencyWhKm: 101.4,
    odometerKm: 19240,
    cellDeviationMv: 22,
    packSohPct: 91.8,
    hub: 'Koramangala Hub',
    packId: 'BAT-1120',
    lastPingSeconds: 4,
    position: { lat: 12.9388, lng: 77.6301 },
    activeTripId: null,
    healthGrade: 'B',
    healthScore: 88,
    dtcs: [{ code: 'P0562', label: 'TCU Low Volt', subsystem: 'tcu-telemetry' }],
    firmwareVersion: 'v4.2.1',
    firmwareStatus: 'up-to-date',
  },
  {
    id: 'VEH-3014',
    registration: 'TN 09 CK 3014',
    model: 'Ather 450X',
    fleetType: 'Electric 2W Fleet',
    vin: 'ATH450X3029198',
    status: 'on-trip',
    driverId: 'DRV-1012',
    soc: 81,
    rangeKm: 88,
    speedKmh: 41,
    packTempC: 28.5,
    motorTempC: 36.2,
    motorLabel: 'Optimal',
    efficiencyWhKm: 42.6,
    odometerKm: 7310,
    cellDeviationMv: 8,
    packSohPct: 98.2,
    hub: 'Airport Arterial',
    packId: 'BAT-3014',
    lastPingSeconds: 2,
    position: { lat: 13.0921, lng: 77.6188 },
    activeTripId: null,
    healthGrade: 'A',
    healthScore: 95,
    dtcs: [],
    firmwareVersion: 'v4.2.1',
    firmwareStatus: 'up-to-date',
  },
  {
    id: 'VEH-1928',
    registration: 'GJ 06 TR 1928',
    model: 'Tata Ace EV',
    fleetType: 'Flatbed Industrial',
    vin: 'MAT628004M11097',
    status: 'on-trip',
    driverId: 'DRV-1013',
    soc: 76,
    rangeKm: 91,
    speedKmh: 33,
    packTempC: 33.2,
    motorTempC: 47.8,
    motorLabel: 'Optimal',
    efficiencyWhKm: 98.4,
    odometerKm: 22140,
    cellDeviationMv: 15,
    packSohPct: 95.2,
    hub: 'Whitefield Ring',
    packId: 'BAT-1928',
    lastPingSeconds: 3,
    position: { lat: 12.9744, lng: 77.7318 },
    activeTripId: null,
    healthGrade: 'A',
    healthScore: 97,
    dtcs: [],
    firmwareVersion: 'v4.2.1',
    firmwareStatus: 'up-to-date',
  },
]

/**
 * Generated fill so the roster's grade tabs, hub filter, subsystem filter and
 * pagination act on real rows. Deterministic (seeded LCG) — the same list every
 * reload, no randomness between renders.
 */
function generateFleet(count: number): Vehicle[] {
  let seed = 20260916
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
  const between = (lo: number, hi: number, dp = 0) =>
    Number((lo + rand() * (hi - lo)).toFixed(dp))

  const models: Array<[string, string, string]> = [
    ['Tata Ace EV', 'Cargo Box · Last Mile', 'MAT'],
    ['Mahindra Treo', 'Electric Auto 3W', 'MAH'],
    ['Euler HiLoad EV', 'Heavy 3W Cargo', 'EUL'],
    ['Piaggio Ape E-City', 'Electric 3W Auto', 'PIA'],
    ['Omega Seiki Rage+', 'Electric Van · Cargo', 'OME'],
    ['Ather 450X', 'Electric 2W Fleet', 'ATH'],
  ]
  const statePrefixes = ['KA', 'MH', 'TN', 'DL', 'GJ', 'AP']
  const hubNames = HUBS.map((h) => h.name)
  const faults: Dtc[] = [
    { code: 'P0A7F', label: 'Pack Degraded', subsystem: 'bms-battery' },
    { code: 'P0562', label: 'TCU Low Volt', subsystem: 'tcu-telemetry' },
    { code: 'P0A0D', label: 'HV Isolation Fault', subsystem: 'bms-battery' },
    { code: 'P1A3C', label: 'Inverter Over-Temp', subsystem: 'powertrain-inverter' },
    { code: 'P0128', label: 'Coolant Below Threshold', subsystem: 'motor-coolant' },
    { code: 'U0100', label: 'Lost Comms With ECM', subsystem: 'tcu-telemetry' },
  ]

  const out: Vehicle[] = []
  for (let i = 0; i < count; i++) {
    const [model, fleetType, vinPrefix] = pick(models)
    const hub = pick(hubNames)
    const hubPos = HUBS.find((h) => h.name === hub)!.position

    // Grade distribution mirrors the design's KPI split: mostly A, some B, few C.
    const roll = rand()
    const grade: HealthGrade = roll > 0.93 ? 'C' : roll > 0.74 ? 'B' : 'A'
    const dtcs =
      grade === 'C' ? [pick(faults), pick(faults)].slice(0, 1) : grade === 'B' && rand() > 0.5 ? [pick(faults)] : []

    const fwRoll = rand()
    const firmwareStatus: FirmwareStatus =
      fwRoll > 0.88 ? 'update-required' : fwRoll > 0.76 ? 'flashing' : fwRoll > 0.6 ? 'queued' : 'up-to-date'

    const soc = between(12, 99)
    const statusRoll = rand()
    const status: VehicleStatus =
      grade === 'C' && rand() > 0.5
        ? 'thermal-alert'
        : statusRoll > 0.62
          ? 'on-trip'
          : statusRoll > 0.4
            ? 'staging'
            : statusRoll > 0.2
              ? 'charging'
              : 'offline'

    const onTrip = status === 'on-trip'
    const serial = 1000 + i * 7

    out.push({
      id: `VEH-${8000 + i}`,
      registration: `${pick(statePrefixes)} ${String(between(1, 60)).padStart(2, '0')} ${pick([
        'AB',
        'CD',
        'EP',
        'GH',
        'MN',
        'TR',
        'CK',
      ])} ${serial + Math.floor(rand() * 900)}`,
      model,
      fleetType,
      vin: `${vinPrefix}${600000 + i * 137}M${10000 + i * 31}`,
      status,
      driverId: onTrip ? pick(DRIVERS).id : null,
      soc,
      rangeKm: Math.round(soc * between(1.0, 1.6, 2)),
      speedKmh: onTrip ? between(8, 52) : 0,
      packTempC: between(24, grade === 'C' ? 56 : 39, 1),
      motorTempC: between(22, grade === 'C' ? 68 : 52, 1),
      motorLabel: grade === 'C' ? 'Thermal Warning' : onTrip ? 'Optimal' : 'Cool',
      efficiencyWhKm: model === 'Ather 450X' ? between(38, 52, 1) : between(88, 132, 1),
      odometerKm: Math.round(between(4000, 62000)),
      cellDeviationMv: Math.round(grade === 'C' ? between(60, 130) : between(6, 28)),
      packSohPct: between(grade === 'C' ? 76 : 88, 99, 1),
      hub,
      packId: `BAT-${4000 + i * 13}`,
      lastPingSeconds: Math.round(between(1, 12)),
      // Scatter around the hub so the live map reads as a real fleet.
      position: {
        lat: hubPos.lat + (rand() - 0.5) * 0.06,
        lng: hubPos.lng + (rand() - 0.5) * 0.06,
      },
      activeTripId: null,
      healthGrade: grade,
      healthScore: Math.round(grade === 'C' ? between(48, 72) : grade === 'B' ? between(82, 92) : between(93, 99)),
      dtcs,
      firmwareVersion: firmwareStatus === 'up-to-date' || firmwareStatus === 'flashing' ? 'v4.2.1' : 'v4.2.0',
      firmwareStatus,
    })
  }
  return out
}

export const VEHICLES: Vehicle[] = [...DESIGNED_VEHICLES, ...generateFleet(32)]

/** Vehicles shown on the live map / dashboard — the designed set, kept legible. */
export const FEATURED_VEHICLES: Vehicle[] = DESIGNED_VEHICLES

// --- Trips -------------------------------------------------------------------

export const TRIPS: Trip[] = [
  {
    id: 'TRP-89211',
    tripCode: '#TRP-8492',
    vehicleId: 'VEH-2210',
    driverId: 'DRV-1004',
    priority: 'High Priority',
    origin: 'Peenya Hub 4',
    destination: 'Electronic City Dock',
    corridor: 'Arterial Corridor 1A',
    departure: '14:10',
    eta: '15:45',
    driftMinutes: 18,
    status: 'delayed',
    corridorState: 'route-deviation',
    routeName: 'Koramangala → Indiranagar',
  },
  {
    id: 'TRP-89218',
    tripCode: '#TRP-8493',
    vehicleId: 'VEH-0914',
    driverId: 'DRV-1008',
    priority: 'Standard',
    origin: 'Koramangala 5th',
    destination: 'Indiranagar Depot',
    corridor: 'Inner Ring Radial',
    departure: '14:25',
    eta: '15:05',
    driftMinutes: 0,
    status: 'on-time',
    corridorState: 'in-corridor',
    routeName: 'Peenya Express Hub-to-Hub',
  },
  {
    id: 'TRP-89224',
    tripCode: '#TRP-8495',
    vehicleId: 'VEH-3301',
    driverId: 'DRV-1005',
    priority: 'Standard Express',
    origin: 'Okhla Phase III',
    destination: 'Noida Sector 62',
    corridor: 'Expressway Geobelt',
    departure: '13:50',
    eta: '14:55',
    driftMinutes: 3,
    status: 'on-time',
    corridorState: 'approaching-gate',
    routeName: 'Airport Cargo Radial #4',
  },
  {
    id: 'TRP-89230',
    tripCode: '#TRP-8494',
    vehicleId: 'VEH-5120',
    driverId: 'DRV-1006',
    priority: 'Passenger Feeder',
    origin: 'Baiyappanahalli Metro',
    destination: 'Whitefield GRTP',
    corridor: 'IT Corridor Polygon',
    departure: '14:30',
    eta: '15:20',
    driftMinutes: -1,
    status: 'on-time',
    corridorState: 'in-corridor',
    routeName: 'Whitefield Tech Corridor',
  },
  {
    id: 'TRP-89239',
    tripCode: '#TRP-8488',
    vehicleId: 'VEH-1804',
    driverId: 'DRV-1007',
    priority: 'Heavy Cargo',
    origin: 'Bhosari Industrial Hub',
    destination: 'Chakan Gate 1',
    corridor: 'Pune Auto Cluster',
    departure: '14:00',
    eta: '14:48',
    driftMinutes: 2,
    status: 'on-time',
    corridorState: 'swap-required',
    routeName: 'Peenya–Chakan Cargo Line',
  },
  {
    id: 'TRP-89244',
    tripCode: '#TRP-8488',
    vehicleId: 'VEH-1109',
    driverId: 'DRV-1011',
    priority: 'Passenger Feeder',
    origin: 'Koramangala Hub 2',
    destination: 'Ejipura Ring Gate',
    corridor: 'Inner Ring Radial',
    departure: '12:40',
    eta: '13:25',
    driftMinutes: 0,
    status: 'completed',
    corridorState: 'in-corridor',
    routeName: 'Koramangala Ring Feeder',
  },
]

// --- Predictive health queue (dashboard right rail) --------------------------

export const HEALTH_QUEUE: HealthAlert[] = [
  {
    id: 'PHQ-001',
    vehicleId: 'VEH-2210',
    registration: 'MH 12 AB 4321',
    severity: 'warning',
    riskLabel: 'Risk: Med',
    title: 'Front brake friction disc wear',
    detail:
      'Front brake friction disc wear predicted in ~240 km based on regenerative delta telemetry.',
    footnote: 'Service Bay: Koramangala Hub',
    action: 'Book Bay',
    actionModule: 'maintenance',
  },
  {
    id: 'PHQ-002',
    vehicleId: 'VEH-0914',
    registration: 'KA 03 MN 7821',
    severity: 'critical',
    riskLabel: 'RISK: HIGH',
    title: 'Inverter IGBT thermal excursion',
    detail:
      'Inverter IGBT thermal sensor registering +18°C above profile norm under standard continuous amp draw.',
    footnote: 'Immediate stop recommended',
    action: 'Take Offline',
    actionModule: 'maintenance',
  },
  {
    id: 'PHQ-003',
    vehicleId: 'VEH-3301',
    registration: 'DL 01 EV 4582',
    severity: 'scheduled',
    riskLabel: 'Scheduled',
    title: '20,000 km diagnostic checklist overdue',
    detail:
      'Mandatory 20,000 km general diagnostic checklist overdue by 3 days (Current: 20,410 km).',
    footnote: 'Lead Tech: Assigned to Pool',
    action: 'Assign Tech',
    actionModule: 'maintenance',
  },
]

// --- Automated dispatch queue (Vehicles & Trips right rail) ------------------

export interface QueuedDispatch {
  registration: string
  from: string
  to: string
  etaMinutes: number
  socPct: number
  ready: boolean
}

export const DISPATCH_QUEUE: QueuedDispatch[] = [
  { registration: 'KA 04 EP 8812', from: 'Dock 04', to: 'Hebbal Hub', etaMinutes: 12, socPct: 92, ready: true },
  { registration: 'KA 53 TR 1190', from: 'Dock 07', to: 'Indiranagar Ring', etaMinutes: 24, socPct: 88, ready: true },
  { registration: 'MH 12 QW 3409', from: 'Dock 02', to: 'Electronic City', etaMinutes: 41, socPct: 62, ready: false },
]

// --- Chart series ------------------------------------------------------------

/** Fleet utilisation & duty cycle — hourly aggregated operational load. */
export const UTILISATION_SERIES = [
  { hour: '06:00', today: 41, baseline: 38 },
  { hour: '07:00', today: 58, baseline: 47 },
  { hour: '08:00', today: 72, baseline: 55 },
  { hour: '09:00', today: 81, baseline: 58 },
  { hour: '10:00', today: 86, baseline: 56 },
  { hour: '11:00', today: 88, baseline: 54 },
  { hour: '12:00', today: 79, baseline: 50 },
  { hour: '13:00', today: 68, baseline: 46 },
  { hour: '14:00', today: 64, baseline: 45 },
  { hour: '15:00', today: 69, baseline: 48 },
  { hour: '16:00', today: 78, baseline: 53 },
  { hour: '17:00', today: 87, baseline: 59 },
  { hour: '18:00', today: 92, baseline: 62 },
  { hour: '19:00', today: 84, baseline: 57 },
  { hour: '20:00', today: 66, baseline: 48 },
  { hour: '21:00', today: 52, baseline: 41 },
  { hour: '22:00', today: 38, baseline: 33 },
]

/** Speed SLA compliance in corridors — last 4 hours CAN-bus aggregated velocity. */
export const SPEED_SLA_SERIES = [
  { bucket: '<20', vehicles: 18 },
  { bucket: '20-25', vehicles: 34 },
  { bucket: '25-30', vehicles: 61 },
  { bucket: '30-35', vehicles: 88 },
  { bucket: '35-40', vehicles: 54 },
  { bucket: '40-45', vehicles: 39 },
  { bucket: '45-50', vehicles: 26 },
  { bucket: '50-55', vehicles: 47 },
  { bucket: '>55', vehicles: 72 },
]

/** Geofence departure density — gate departures vs scheduled SLA slots. */
export const DEPARTURE_DENSITY_SERIES = [
  { time: '10:00', dispatches: 96 },
  { time: '10:30', dispatches: 82 },
  { time: '11:00', dispatches: 104 },
  { time: '11:30', dispatches: 138 },
  { time: '12:00', dispatches: 166 },
  { time: '12:30', dispatches: 171 },
  { time: '13:00', dispatches: 142 },
  { time: '13:30', dispatches: 118 },
  { time: '14:00', dispatches: 184 },
]

// --- Lookups -----------------------------------------------------------------

export function getVehicle(id: string): Vehicle | undefined {
  return VEHICLES.find((v) => v.id === id)
}

export function getDriver(id: string | null): Driver | undefined {
  if (!id) return undefined
  return DRIVERS.find((d) => d.id === id)
}

export function getHub(name: string): Hub | undefined {
  return HUBS.find((h) => h.name === name)
}

/**
 * Restricts a collection to the hubs a role is scoped to.
 * PRD: "This access can be given per asset as well."
 */
export function scopeToHubs<T extends { hub: string }>(items: T[], hubs: string[] | undefined): T[] {
  if (!hubs) return items
  return items.filter((item) => hubs.includes(item.hub))
}

/**
 * Segment-specific vocabulary. The same underlying data is framed differently
 * per segment — the PRD's "specialized feature and user experience" on a
 * shared core.
 */
export const SEGMENT_COPY: Record<SegmentId, { pageTitle: string; breadcrumb: string; assetNoun: string }> = {
  'b2b-fleet': {
    pageTitle: 'Fleet Operations and Telemetry',
    breadcrumb: 'Live Fleet Operations',
    assetNoun: 'Vehicles',
  },
  'last-mile': {
    pageTitle: 'Delivery Operations & Availability',
    breadcrumb: 'Live Delivery Operations',
    assetNoun: 'Vehicles',
  },
  'vehicle-oem': {
    pageTitle: 'Real-World Vehicle Performance',
    breadcrumb: 'Field Telemetry Programme',
    assetNoun: 'Units in Field',
  },
  'battery-oem': { pageTitle: 'Battery Health & Warranty', breadcrumb: 'Pack Intelligence', assetNoun: 'Packs' },
  'swapping-station': {
    pageTitle: 'Swap Network Operations',
    breadcrumb: 'Network Operations',
    assetNoun: 'Stations',
  },
  'finance-leasing': { pageTitle: 'Asset Risk & Residual Value', breadcrumb: 'Portfolio Risk', assetNoun: 'Assets' },
}
