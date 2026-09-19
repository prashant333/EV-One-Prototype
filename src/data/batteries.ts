/**
 * Battery portfolio data — Cluster 2, Assets & Finance.
 * Transcribed from Design/Battery_intellicar_one_ev_platform/.
 *
 * A Battery is an asset in its own right: it outlives the vehicle it is fitted
 * to, moves through swap stations, carries its own warranty term and its own
 * residual value. Packs deployed in a vehicle reference the fleet roster so the
 * two workspaces stay reconciled.
 */

import { HUBS, VEHICLES, getVehicle } from './fleet'

export type Chemistry = 'NMC' | 'LFP'
export type SohStatus = 'healthy' | 'grade-a' | 'grade-b' | 'watch' | 'critical' | 'claim-alert'
export type WarrantyState = 'active' | 'under-review' | 'ready-to-claim' | 'expired'
export type DeploymentKind = 'vehicle' | 'station' | 'depot'
export type LifecyclePhase = 'manufactured' | 'commissioned' | 'active' | 'triage' | 'second-life' | 'recycle'

export interface Battery {
  id: string
  serial: string
  model: string
  oem: string
  chemistry: Chemistry
  chemistryDetail: string
  nominalVoltage: number
  capacityAh: number
  capacityKwh: number
  sohPct: number
  socPct: number
  usableKwh: number
  cycleCount: number
  cycleDesign: number
  packTempC: number
  /** Annual fade rate, % per year. */
  fadeRatePct: number
  cellDeltaMv: number
  internalResistanceMohm: number
  sohStatus: SohStatus
  warranty: WarrantyState
  warrantyMonthsLeft: number
  warrantyTermMonths: number
  sohFloorPct: number
  /** Where the pack physically is right now. */
  deployment: { kind: DeploymentKind; label: string; detail: string; vehicleId?: string }
  hub: string
  phase: LifecyclePhase
  commissioned: string
  estimatedRulYears: number
  thermalState: 'nominal' | 'elevated' | 'throttled' | 'high-thermal'
}

// --- Portfolio KPI strip -----------------------------------------------------

export interface PortfolioKpi {
  id: string
  label: string
  icon: string
  value: string
  unit?: string
  badge?: string
  badgeTone?: 'ok' | 'warn' | 'crit' | 'info'
  caption: string
  captionTone: 'ok' | 'warn' | 'crit' | 'neutral'
  rows: Array<{ label: string; value: string; tone?: 'ok' | 'warn' | 'crit' | 'neutral' }>
  progress: number
  progressTone: 'ok' | 'warn' | 'crit' | 'primary'
}

export const PORTFOLIO_KPIS: PortfolioKpi[] = [
  {
    id: 'total-batteries',
    label: 'Total Batteries',
    icon: 'battery_charging_full',
    value: '12,480',
    caption: '↗ +184 this mo · 11,850 in-service',
    captionTone: 'ok',
    rows: [],
    progress: 95,
    progressTone: 'primary',
  },
  {
    id: 'portfolio-health',
    label: 'Portfolio Health',
    icon: 'donut_large',
    value: '86.9%',
    caption: '10,842 Healthy',
    captionTone: 'ok',
    rows: [
      { label: '1,124 Watch', value: '', tone: 'warn' },
      { label: '214 Critical', value: '', tone: 'crit' },
    ],
    progress: 86.9,
    progressTone: 'ok',
  },
  {
    id: 'avg-soh-fade',
    label: 'Avg SoH & Fade',
    icon: 'speed',
    value: '87.4%',
    unit: '/ 88.0% bench',
    caption: '2.8% / yr (0.3% better than SLA)',
    captionTone: 'ok',
    rows: [{ label: 'Degradation curve tracking nominal', value: '', tone: 'ok' }],
    progress: 87.4,
    progressTone: 'ok',
  },
  {
    id: 'thermal-alerts',
    label: 'Thermal Alerts',
    icon: 'local_fire_department',
    value: '86',
    unit: 'Active',
    badge: '14 >52°C',
    badgeTone: 'crit',
    caption: 'Peak: 54.2°C @ Indiranagar',
    captionTone: 'crit',
    rows: [{ label: 'Cooling Derate Applied', value: '12 Bays' }],
    progress: 34,
    progressTone: 'crit',
  },
  {
    id: 'predictive-risk',
    label: 'Predictive Risk (30D)',
    icon: 'troubleshoot',
    value: '42',
    unit: 'Packs',
    badge: 'High ML Prob',
    badgeTone: 'crit',
    caption: '18 Warranty Claims actionable',
    captionTone: 'warn',
    rows: [{ label: '<70% SoH prior to month 36', value: '' }],
    progress: 42,
    progressTone: 'warn',
  },
]

export const TELEMETRY_BANNER = {
  sync: 'Live Pack Telemetry Sync · 1s streaming Edge Engine v4.8',
  polling: 'Active Polling: 12,480 Packs across 42 Swap Hubs & Fleet Depots',
  ingestion: 'Telemetry Ingestion: 14,218 pkts/sec',
  lossRate: 'BMS Loss Rate: 0.002%',
}

// --- SoH distribution & 12-month trend --------------------------------------

export const SOH_TREND = [
  { month: 'M-12', measured: 99.2, warrantyFloor: 70, nominal: 98.6 },
  { month: 'M-9', measured: 96.4, warrantyFloor: 70, nominal: 95.4 },
  { month: 'M-6', measured: 93.8, warrantyFloor: 70, nominal: 92.3 },
  { month: 'M-3', measured: 90.9, warrantyFloor: 70, nominal: 89.1 },
  { month: 'Last Mo', measured: 88.6, warrantyFloor: 70, nominal: 86.4 },
  { month: 'Current', measured: 87.4, warrantyFloor: 70, nominal: 84.8 },
]

export const SOH_BINS = [
  { label: '> 90% SoH', pct: 59.5, packs: 7420, note: 'Tier 1 · Prime Express Route', tone: 'ok' as const },
  { label: '80% - 90% SoH', pct: 27.4, packs: 3422, note: 'Tier 2 · Standard Delivery', tone: 'info' as const },
  { label: '75% - 80% SoH', pct: 9.0, packs: 1124, note: 'Watchlist · Low C-Rate Only', tone: 'warn' as const },
  { label: '< 75% Critical', pct: 1.7, packs: 214, note: 'Immediate Quarantine', tone: 'crit' as const },
]

export const DEGRADATION_STATS = [
  { label: 'Annual Fade', value: '2.8% / yr', caption: 'Within OEM Limit' },
  { label: 'Expected Fade', value: '3.1% / yr', caption: 'Ambient Adjusted' },
  { label: 'Avg Cycle Count', value: '684 cycles', caption: 'Design: 2,500' },
  { label: 'Net Cap Loss', value: '4.8 kWh', caption: 'From 48 kWh base' },
  { label: 'Est. RUL', value: '4.2 yrs', caption: '~1,840 cycles left' },
]

export const SOH_SAMPLING = 'Sampling: 1,840,920 BMS records'

// --- Predictive health queue -------------------------------------------------

export interface PredictiveBatteryAlert {
  batteryId: string
  chemistryLabel: string
  riskLabel: string
  riskTone: 'crit' | 'warn' | 'info'
  detail: string
  sohPct: number
  cycles: number
  context: string
  recommendation: string
  primaryAction: string
}

export const PREDICTIVE_QUEUE: PredictiveBatteryAlert[] = [
  {
    batteryId: 'BAT-8821',
    chemistryLabel: 'NMC 622 · 48V 100Ah',
    riskLabel: 'Critical',
    riskTone: 'crit',
    detail:
      'Accelerated capacity fade with Cell #14 internal impedance mismatch. Automated quarantine flag raised.',
    sohPct: 71.2,
    cycles: 1140,
    context: 'MH 12 AB 4321',
    recommendation: 'Immediate Bay Quarantine & BMS Rebalance',
    primaryAction: 'Create Ticket',
  },
  {
    batteryId: 'BAT-6409',
    chemistryLabel: 'LFP 72V 60Ah',
    riskLabel: 'High Risk',
    riskTone: 'warn',
    detail:
      'Repetitive thermal throttling >51°C during 1.5C fast charging. Internal resistance increased 18%.',
    sohPct: 74.8,
    cycles: 890,
    context: 'Indiranagar Bay 04',
    recommendation: 'Derate charging rate to 0.5C and swap to tier-2 asset pool',
    primaryAction: 'Derate Rate',
  },
  {
    batteryId: 'BAT-9104',
    chemistryLabel: 'NMC 51.2V',
    riskLabel: 'Warranty Breach Risk',
    riskTone: 'info',
    detail:
      'Nearing OEM claim threshold (70.2% SoH at month 28 of 36 warranty period). Early warranty replacement flagged.',
    sohPct: 70.2,
    cycles: 1304,
    context: 'Cargo 3W KA-04',
    recommendation: 'Generate OEM Degradation Certificate & initiate vendor credit',
    primaryAction: 'File OEM Claim',
  },
]

// --- Roster filters ----------------------------------------------------------

export const CHEMISTRY_FILTERS = ['Chem: All (NMC/LFP)', 'NMC', 'LFP'] as const
export const HEALTH_FILTERS = [
  'Health: All Statuses',
  'Healthy',
  'At Risk',
  'Critical / Quarantined',
  'Warranty Claim Review',
] as const
export const WARRANTY_FILTERS = [
  'Warranty: Active & Review',
  'Active',
  'Under Review',
  'Ready to Claim',
  'Expired',
] as const

// --- The designed packs ------------------------------------------------------

const DESIGNED: Battery[] = [
  {
    id: 'BAT-8821',
    serial: 'TC-8821-2023-B4',
    model: 'Tata AutoComp NMC 48V 100Ah',
    oem: 'Tata AutoComp Systems Ltd',
    chemistry: 'NMC',
    chemistryDetail: 'NMC 622',
    nominalVoltage: 51.8,
    capacityAh: 100,
    capacityKwh: 48,
    sohPct: 71.2,
    socPct: 82,
    usableKwh: 39.4,
    cycleCount: 1140,
    cycleDesign: 2500,
    packTempC: 48.5,
    fadeRatePct: 4.8,
    cellDeltaMv: 92,
    internalResistanceMohm: 38.4,
    sohStatus: 'critical',
    warranty: 'active',
    warrantyMonthsLeft: 8,
    warrantyTermMonths: 36,
    sohFloorPct: 70,
    deployment: { kind: 'vehicle', label: 'Tata Ace EV', detail: 'MH 12 AB 4321', vehicleId: 'VEH-2210' },
    hub: 'Koramangala Hub',
    phase: 'triage',
    commissioned: '14 Oct 2023',
    estimatedRulYears: 1.8,
    thermalState: 'high-thermal',
  },
  {
    id: 'BAT-4512',
    serial: 'EX-4512-2024-A1',
    model: 'Exide Energy LFP 51.2V 80Ah',
    oem: 'Exide Energy Solutions',
    chemistry: 'LFP',
    chemistryDetail: 'LFP Prismatic',
    nominalVoltage: 51.2,
    capacityAh: 80,
    capacityKwh: 41,
    sohPct: 94.8,
    socPct: 64,
    usableKwh: 26.2,
    cycleCount: 240,
    cycleDesign: 3000,
    packTempC: 31.2,
    fadeRatePct: 1.9,
    cellDeltaMv: 14,
    internalResistanceMohm: 22.1,
    sohStatus: 'grade-a',
    warranty: 'active',
    warrantyMonthsLeft: 32,
    warrantyTermMonths: 48,
    sohFloorPct: 70,
    deployment: { kind: 'vehicle', label: 'Mahindra Treo 3W', detail: 'KA-05-EJ-9021', vehicleId: 'VEH-0914' },
    hub: 'Peenya Corridor',
    phase: 'active',
    commissioned: '02 Feb 2024',
    estimatedRulYears: 6.4,
    thermalState: 'nominal',
  },
  {
    id: 'BAT-6409',
    serial: 'AR-6409-2023-F9',
    model: 'Amara Raja LFP 72V 60Ah',
    oem: 'Amara Raja Energy',
    chemistry: 'LFP',
    chemistryDetail: 'LFP Blade',
    nominalVoltage: 72,
    capacityAh: 60,
    capacityKwh: 43,
    sohPct: 74.8,
    socPct: 98,
    usableKwh: 42.1,
    cycleCount: 890,
    cycleDesign: 2500,
    packTempC: 51.8,
    fadeRatePct: 3.4,
    cellDeltaMv: 61,
    internalResistanceMohm: 34.8,
    sohStatus: 'watch',
    warranty: 'under-review',
    warrantyMonthsLeft: 14,
    warrantyTermMonths: 36,
    sohFloorPct: 70,
    deployment: { kind: 'station', label: 'Koramangala Station #02', detail: 'Slot B4 (Charging 0.5C)' },
    hub: 'Koramangala Hub',
    phase: 'triage',
    commissioned: '21 Jun 2023',
    estimatedRulYears: 2.6,
    thermalState: 'throttled',
  },
  {
    id: 'BAT-1092',
    serial: 'OC-1092-2023-C2',
    model: 'Octillion NMC 72V 120Ah',
    oem: 'Octillion Power Systems',
    chemistry: 'NMC',
    chemistryDetail: 'NMC 811',
    nominalVoltage: 72,
    capacityAh: 120,
    capacityKwh: 86,
    sohPct: 88.5,
    socPct: 45,
    usableKwh: 38.8,
    cycleCount: 580,
    cycleDesign: 2000,
    packTempC: 36.4,
    fadeRatePct: 2.6,
    cellDeltaMv: 21,
    internalResistanceMohm: 26.4,
    sohStatus: 'healthy',
    warranty: 'active',
    warrantyMonthsLeft: 20,
    warrantyTermMonths: 36,
    sohFloorPct: 70,
    deployment: { kind: 'vehicle', label: 'Euler HiLoad EV', detail: 'DL-1L-AA-5012', vehicleId: 'VEH-3301' },
    hub: 'Airport Arterial',
    phase: 'active',
    commissioned: '11 Sep 2023',
    estimatedRulYears: 4.8,
    thermalState: 'nominal',
  },
  {
    id: 'BAT-7734',
    serial: 'SM-7734-2022-P9',
    model: 'Sun Mobility LFP 48V 75Ah',
    oem: 'Sun Mobility',
    chemistry: 'LFP',
    chemistryDetail: 'LFP Standard',
    nominalVoltage: 48,
    capacityAh: 75,
    capacityKwh: 36,
    sohPct: 81.2,
    socPct: 22,
    usableKwh: 7.9,
    cycleCount: 1020,
    cycleDesign: 2500,
    packTempC: 33.0,
    fadeRatePct: 2.9,
    cellDeltaMv: 33,
    internalResistanceMohm: 29.7,
    sohStatus: 'grade-b',
    warranty: 'active',
    warrantyMonthsLeft: 12,
    warrantyTermMonths: 36,
    sohFloorPct: 70,
    deployment: { kind: 'vehicle', label: 'Piaggio Ape E-City', detail: 'KA-01-EQ-1822', vehicleId: 'VEH-5120' },
    hub: 'Whitefield Ring',
    phase: 'active',
    commissioned: '19 Mar 2022',
    estimatedRulYears: 3.1,
    thermalState: 'nominal',
  },
  {
    id: 'BAT-9104',
    serial: 'CS-9104-2022-X1',
    model: 'Coslight NMC 51.2V 90Ah',
    oem: 'Coslight India Telecom',
    chemistry: 'NMC',
    chemistryDetail: 'NMC Cylindrical',
    nominalVoltage: 51.2,
    capacityAh: 90,
    capacityKwh: 46,
    sohPct: 70.4,
    socPct: 76,
    usableKwh: 35.2,
    cycleCount: 1304,
    cycleDesign: 2200,
    packTempC: 39.1,
    fadeRatePct: 4.1,
    cellDeltaMv: 78,
    internalResistanceMohm: 41.2,
    sohStatus: 'claim-alert',
    warranty: 'ready-to-claim',
    warrantyMonthsLeft: 8,
    warrantyTermMonths: 36,
    sohFloorPct: 70,
    deployment: { kind: 'vehicle', label: 'Omega Seiki Rage+', detail: 'KA-03-D-8811', vehicleId: 'VEH-1804' },
    hub: 'Peenya Corridor',
    phase: 'triage',
    commissioned: '06 May 2022',
    estimatedRulYears: 1.2,
    thermalState: 'elevated',
  },
]

// --- Generated portfolio -----------------------------------------------------

const OEMS: Array<[string, Chemistry, string]> = [
  ['Tata AutoComp Systems Ltd', 'NMC', 'NMC 622'],
  ['Exide Energy Solutions', 'LFP', 'LFP Prismatic'],
  ['Amara Raja Energy', 'LFP', 'LFP Blade'],
  ['Octillion Power Systems', 'NMC', 'NMC 811'],
  ['Sun Mobility', 'LFP', 'LFP Standard'],
  ['Coslight India Telecom', 'NMC', 'NMC Cylindrical'],
]

function generate(count: number): Battery[] {
  let seed = 88211024
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
  const between = (lo: number, hi: number, dp = 0) => Number((lo + rand() * (hi - lo)).toFixed(dp))

  const out: Battery[] = []
  for (let i = 0; i < count; i++) {
    const [oem, chemistry, chemistryDetail] = pick(OEMS)
    const hub = pick(HUBS).name
    const cycleDesign = chemistry === 'LFP' ? 3000 : 2200

    // SoH falls out of cycle count, so the two columns never contradict.
    const cycleCount = Math.round(between(80, 1500))
    const fadePerCycle = chemistry === 'LFP' ? 0.016 : 0.024
    const sohPct = Number(Math.max(62, 100 - cycleCount * fadePerCycle - between(0, 3, 2)).toFixed(1))

    const sohStatus: SohStatus =
      sohPct < 75 ? 'critical' : sohPct < 80 ? 'watch' : sohPct < 88 ? 'grade-b' : sohPct < 94 ? 'grade-a' : 'healthy'

    const capacityKwh = between(36, 86)
    const socPct = Math.round(between(18, 99))
    const packTempC = sohStatus === 'critical' ? between(44, 54, 1) : between(28, 40, 1)

    const warrantyTermMonths = chemistry === 'LFP' ? 48 : 36
    const warrantyMonthsLeft = Math.round(between(0, warrantyTermMonths))
    const warranty: WarrantyState =
      warrantyMonthsLeft === 0 ? 'expired' : sohPct <= 72 ? 'ready-to-claim' : sohPct < 80 ? 'under-review' : 'active'

    // Roughly half the portfolio is fitted to a vehicle; the rest sits in the
    // swap network or on a depot shelf.
    const roll = rand()
    const vehicle = roll > 0.5 ? pick(VEHICLES) : null
    const deployment: Battery['deployment'] = vehicle
      ? { kind: 'vehicle', label: vehicle.model, detail: vehicle.registration, vehicleId: vehicle.id }
      : roll > 0.22
        ? { kind: 'station', label: `${hub.split(' ')[0]} Station #0${Math.round(between(1, 6))}`, detail: `Slot ${pick(['A', 'B', 'C'])}${Math.round(between(1, 8))}` }
        : { kind: 'depot', label: `${hub.split(' ')[0]} Depot Shelf`, detail: `Rack ${Math.round(between(1, 20))}` }

    const phase: LifecyclePhase =
      sohPct < 75 ? 'triage' : sohPct < 80 ? (rand() > 0.6 ? 'second-life' : 'active') : 'active'

    out.push({
      id: `BAT-${2000 + i * 7}`,
      serial: `${oem.slice(0, 2).toUpperCase()}-${2000 + i * 7}-202${Math.round(between(2, 4))}-${pick(['A', 'B', 'C', 'F', 'P', 'X'])}${Math.round(between(1, 9))}`,
      model: `${oem.split(' ')[0]} ${chemistry} ${between(48, 72)}V ${between(60, 120)}Ah`,
      oem,
      chemistry,
      chemistryDetail,
      nominalVoltage: pick([48, 51.2, 72]),
      capacityAh: Math.round(between(60, 120)),
      capacityKwh,
      sohPct,
      socPct,
      usableKwh: Number(((capacityKwh * sohPct * socPct) / 10000).toFixed(1)),
      cycleCount,
      cycleDesign,
      packTempC,
      fadeRatePct: Number((fadePerCycle * 365 * 0.18 + between(0, 1.2, 2)).toFixed(1)),
      cellDeltaMv: Math.round(sohStatus === 'critical' ? between(55, 110) : between(8, 34)),
      internalResistanceMohm: Number(between(20, 44, 1)),
      sohStatus: warranty === 'ready-to-claim' ? 'claim-alert' : sohStatus,
      warranty,
      warrantyMonthsLeft,
      warrantyTermMonths,
      sohFloorPct: 70,
      deployment,
      hub,
      phase,
      commissioned: `${Math.round(between(1, 28))} ${pick(['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'])} 202${Math.round(between(2, 4))}`,
      estimatedRulYears: Number(Math.max(0.4, (sohPct - 70) / 4.2).toFixed(1)),
      thermalState:
        packTempC > 50 ? 'throttled' : packTempC > 45 ? 'high-thermal' : packTempC > 40 ? 'elevated' : 'nominal',
    })
  }
  return out
}

export const BATTERIES: Battery[] = [...DESIGNED, ...generate(38)]

export function getBattery(id: string): Battery | undefined {
  return BATTERIES.find((b) => b.id === id)
}

export function batteryVehicle(battery: Battery) {
  return battery.deployment.vehicleId ? getVehicle(battery.deployment.vehicleId) : undefined
}

export const SOH_STATUS_LABELS: Record<SohStatus, string> = {
  healthy: 'Healthy',
  'grade-a': 'Grade A',
  'grade-b': 'Grade B',
  watch: 'Watch',
  critical: 'Critical',
  'claim-alert': 'Claim Alert',
}

export const WARRANTY_LABELS: Record<WarrantyState, string> = {
  active: 'Active',
  'under-review': 'Under Review',
  'ready-to-claim': 'Ready for Claim',
  expired: 'Expired',
}

export const PHASE_LABELS: Record<LifecyclePhase, string> = {
  manufactured: 'Manufactured',
  commissioned: 'Commissioned',
  active: 'Active',
  triage: 'Triage',
  'second-life': 'Second Life',
  recycle: 'Recycle',
}

// --- Detail page: BAT-8821 ---------------------------------------------------

export const PACK_ARCHITECTURE = [
  { label: 'Topology / Arrangement', value: '14S 3P Pouch (NMC 622)' },
  { label: 'Nominal / Operating Voltage', value: '51.8 V (42.0V - 58.8V)' },
  { label: 'Rated Capacity vs Current', value: '48.0 kWh → 34.2 kWh', tone: 'crit' as const },
  { label: 'Lifetime Capacity Loss', value: '-13.8 kWh (-28.8%)', tone: 'crit' as const },
  { label: 'Internal Resistance (IR)', value: '38.4 mΩ (↑ +24% from 31.0)', tone: 'crit' as const },
  { label: 'OEM Manufacturer', value: 'Tata AutoComp Systems Ltd' },
  { label: 'Manufacturing Date', value: '12 Aug 2023 (Pune Plant)' },
  { label: 'Last Swap Station', value: 'Koramangala Hub #02' },
  { label: 'Last Swapped Timestamp', value: '18 Sep 2024, 09:14 AM' },
]

/** 14 series cells; #14 is the divergent one driving the quarantine flag. */
export const CELL_MATRIX = Array.from({ length: 14 }, (_, i) => {
  const id = `C${String(i + 1).padStart(2, '0')}`
  const divergent = i === 13
  return {
    id,
    voltage: divergent ? 3.48 : Number((3.55 + Math.sin(i * 1.7) * 0.015).toFixed(3)),
    divergent,
  }
})

export const CELL_SUMMARY = {
  deltaMv: 92,
  maxDeltaMv: 30,
  min: { label: 'Cell #14 (Severely Low)', value: '3.48 V' },
  max: { label: 'Cell #02 (Nominal)', value: '3.57 V' },
  balancing: 'Active Shunt',
  balancingDetail: 'Bleeding Cell 01-13',
  spectrum: 'Cell Voltage Spectrum (3.40V - 3.65V Floor-Ceiling)',
  divergentNote: 'Cell #14 Divergent',
  thermistors: [
    { label: 'T1 (Front Module)', value: '46.2°C' },
    { label: 'T2 (Center Hotspot)', value: '48.5°C', tone: 'crit' as const },
    { label: 'T3 (Rear Cooling Entry)', value: '44.1°C' },
  ],
}

export const PLATFORM_TELEMETRY = {
  status: 'OBD-II Online',
  vehicle: 'Tata Ace EV · Van #14',
  vin: 'MAT622089P3K9910',
  speed: '42 km/h',
  odometer: '38,410 km',
  busLoad: '62.4%',
  busLoadNote: '0 packet drops',
  sensors: '3 / 3 Live',
  sensorsNote: 'NTC 10k thermistors',
}

/**
 * 24-hour pack duty cycle at 30-minute resolution.
 *
 * Built as one continuous story so the four traces explain each other: the pack
 * charges overnight at the depot, discharges on the morning route, takes an
 * opportunity top-up at midday, discharges again through the afternoon peak and
 * returns to depot charge in the evening. SoC is integrated from current, and
 * both voltage and temperature respond to load — so the curves agree rather
 * than simply coexisting.
 */
export type PackMode = 'charging' | 'discharging' | 'idle'

export interface PackTelemetrySample {
  t: string
  /** Signed pack current: positive = discharging, negative = charging. */
  current: number
  voltage: number
  packTemp: number
  socPct: number
  power: number
  mode: PackMode
}

function buildPackTelemetry(): PackTelemetrySample[] {
  const SAMPLES = 48 // 30-minute buckets across 24h
  const out: PackTelemetrySample[] = []

  /**
   * Signed current demand in amps by hour of day. Depot charging on a 48V pack
   * runs near 95A (~5 kW) and the midday opportunity charger harder still, so
   * the pack actually refills against a 60-110A duty cycle.
   */
  const demandAt = (hour: number): number => {
    if (hour < 5.5) return -95 - 9 * Math.sin(hour * 1.1) // depot charge, overnight
    if (hour < 6.5) return -5 // taper to float
    if (hour < 12) return 72 + 30 * Math.sin(hour * 1.7) // morning route
    if (hour < 13.5) return -148 - 12 * Math.sin(hour) // midday opportunity fast charge
    if (hour < 19) return 80 + 30 * Math.sin(hour * 1.3) // afternoon peak
    if (hour < 20) return 4 // staging, near idle
    return -92 - 10 * Math.sin(hour) // evening depot charge
  }

  let soc = 34 // part-depleted at midnight, before the overnight charge
  let temp = 32.5

  for (let i = 0; i < SAMPLES; i++) {
    const hour = i / 2
    const current = demandAt(hour)

    // SoC integrates current across the half-hour bucket. The divisor is the
    // pack's amp-hour capacity expressed per percentage point.
    soc = Math.max(8, Math.min(100, soc - current * 0.034))

    // Heat rises with the square of current (I^2R) and bleeds off toward
    // ambient. Depot charging is gentler than traction load at the same current
    // because the bay's chiller loop assists, so it carries a lower gain.
    const ambient = 28
    const thermalGain = current > 0 ? 5.1 : 2.70
    temp += (Math.abs(current) ** 2 / 26000) * thermalGain - (temp - ambient) * 0.061
    temp = Math.max(29, Math.min(54, temp))

    // Terminal voltage: open-circuit follows SoC, then sags under load.
    const ocv = 44.6 + (soc / 100) * 9.2
    const voltage = ocv - current * 0.032

    const mode: PackMode = current < -6 ? 'charging' : current > 6 ? 'discharging' : 'idle'

    out.push({
      t: `${String(Math.floor(hour)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
      current: Number(current.toFixed(1)),
      voltage: Number(voltage.toFixed(1)),
      packTemp: Number(temp.toFixed(1)),
      socPct: Number(soc.toFixed(1)),
      power: Number(((voltage * current) / 1000).toFixed(2)),
      mode,
    })
  }
  return out
}

export const PACK_TELEMETRY: PackTelemetrySample[] = buildPackTelemetry()

/**
 * Contiguous runs of the same mode, so charge and idle periods can be drawn as
 * background bands behind the traces rather than as another competing line.
 */
export interface PackModeWindow {
  from: string
  to: string
  mode: PackMode
}

export const PACK_MODE_WINDOWS: PackModeWindow[] = (() => {
  const windows: PackModeWindow[] = []
  let run: PackModeWindow | null = null
  for (const sample of PACK_TELEMETRY) {
    if (run && run.mode === sample.mode) {
      run.to = sample.t
    } else {
      if (run) windows.push(run)
      run = { from: sample.t, to: sample.t, mode: sample.mode }
    }
  }
  if (run) windows.push(run)
  return windows
})()

/**
 * The four traces the combined view plots. Voltage and temperature share the
 * left axis because their ranges overlap; SoC and current each need their own.
 */
export const PACK_TELEMETRY_CHANNELS = [
  {
    key: 'voltage',
    label: 'Voltage (V)',
    color: '#0037b0',
    axis: 'left' as const,
    unit: 'V',
    render: 'line' as const,
  },
  {
    key: 'packTemp',
    label: 'Pack Temp (°C)',
    color: '#e11d48',
    axis: 'left' as const,
    unit: '°C',
    render: 'line' as const,
  },
  {
    key: 'socPct',
    label: 'State of Charge (%)',
    color: '#059669',
    axis: 'right' as const,
    unit: '%',
    render: 'area' as const,
  },
  {
    key: 'current',
    label: 'Current (A)',
    color: '#4b41e1',
    axis: 'current' as const,
    unit: 'A',
    render: 'line' as const,
  },
]

export const PACK_AXES = {
  /** Volts and Celsius overlap numerically, so they share one axis. */
  left: { domain: [28, 58] as [number, number], label: 'V / °C' },
  right: { domain: [0, 100] as [number, number], label: 'SoC %' },
  /** Current is opt-in and rescales onto the right axis when enabled. */
  current: { domain: [-170, 150] as [number, number], label: 'A' },
}

export const PACK_MODE_META: Record<PackMode, { label: string; fill: string; text: string }> = {
  charging: { label: 'Charging', fill: '#ecfdf5', text: '#065f46' },
  discharging: { label: 'Discharging', fill: 'transparent', text: '#434655' },
  idle: { label: 'Idle / Staging', fill: '#f1f5f9', text: '#475569' },
}

export const PACK_TELEMETRY_SUMMARY = {
  header: 'V_PACK: 46.2V - 53.4V   I_LOAD: -84A (Regen) to +112A (Peak)   T_MAX: 48.5°C   P_NET: 5.8 kW',
  footer: 'Timestamp: 14:28:11.450   Discharge Spike: +112.4 A   Sag: 46.2 V   Regen Peak: -84.0 A',
  sample: '10 Hz Sample',
  ranges: ['1H', '6H', '24H', '7D', '30D'],
}

export const LIFECYCLE_MILESTONES = {
  phases: [
    { label: 'Mfg 08/23', state: 'done' as const },
    { label: 'Comm 10/23', state: 'done' as const },
    { label: 'Active Crit', state: 'current' as const },
    { label: 'Triage', state: 'pending' as const },
    { label: "2nd Life '26", state: 'pending' as const },
    { label: 'Recycle', state: 'pending' as const },
  ],
  gate: 'Claim Eligible',
  terms: [
    { label: 'OEM Battery Warranty Term', value: '36 Months / 150,000 km' },
    { label: 'Remaining Time', value: '14 months remaining (Active)' },
    { label: 'Contractual SoH Retention Floor', value: '70.0% Minimum' },
    { label: 'Current Pack State', value: '71.2% (+1.2% above breach)', tone: 'crit' as const },
  ],
  classifier: 'High Warranty Claim Risk',
}

export const DUTY_PROFILE = {
  benchmark: 'Fleet Benchmark: High Abuse',
  tiles: [
    { label: 'Energy Throughput', value: '42.8 MWh', caption: 'Avg 37.5 kWh / cycle' },
    { label: 'Fast Charge Ratio', value: '78% (342 sessions)', caption: 'High DC Exposure > 1C' },
    { label: 'Swap Network Sessions', value: '86 Swaps', caption: 'Across 4 Depot Stations' },
    { label: 'Thermal Excursions (>45°C)', value: '184 Hours', caption: 'Primary degradation driver' },
  ],
  cohort: {
    label: 'Peer Cohort SoH Delta (NMC 2023 Batch)',
    delta: '-15.0% below mean',
    average: 86.2,
    current: 71.2,
  },
}

export const ANOMALY_BANNER = {
  title: 'Anomaly Diagnostic Confirmed: Accelerated Degradation & C14 Imbalance',
  detail:
    'Cell #14 internal impedance mismatch triggered automated quarantine flag. Deep cycle reconditioning required before redeployment.',
  actions: ['Schedule Deep Balancing', 'Create Work Order', 'Take Pack Offline'],
}

export const PACK_DETAIL_TABS = [
  'Overview',
  'Telemetry & Oscilloscope',
  'Degradation & AI Models',
  'Cell Diagnostics',
  'Usage & Swaps',
  'Warranty & Claims',
  'Alerts & Audit',
] as const
