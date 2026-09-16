/**
 * KPI catalogue. The dashboard design shows "ACTIVE FLEET METRICS (5 of 16 displayed)"
 * with a "Customize KPIs (5/16)" control — so 16 KPIs are defined here and each
 * segment gets its own default five, chosen to answer that segment's primary
 * business question from the PRD.
 */

import type { SegmentId } from './platform'

export type KpiTone = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'critical'

export interface Kpi {
  id: string
  label: string
  icon: string
  value: string
  /** Small emphasised figure beside the value (delta, share, target). */
  badge?: string
  badgeTone?: KpiTone
  footLabel: string
  footValue: string
  footTone?: KpiTone
  /** Progress bar fill, 0-100. Omit to hide the bar. */
  progress?: number
  tone: KpiTone
}

export const KPI_CATALOGUE: Kpi[] = [
  {
    id: 'total-vehicles',
    label: 'Total Vehicles',
    icon: 'directions_car',
    value: '1,420',
    badge: '↑ 98.4%',
    badgeTone: 'tertiary',
    footLabel: 'Connected Link',
    footValue: '1,397 Active CANs',
    footTone: 'tertiary',
    progress: 98.4,
    tone: 'primary',
  },
  {
    id: 'active-on-trip',
    label: 'Active on Trip',
    icon: 'moving',
    value: '1,180',
    badge: '83.1%',
    badgeTone: 'secondary',
    footLabel: 'Live Trips Target',
    footValue: 'Peak Demand',
    footTone: 'secondary',
    progress: 83.1,
    tone: 'secondary',
  },
  {
    id: 'idle-staging',
    label: 'Idle / Staging',
    icon: 'hourglass_empty',
    value: '142',
    badge: '10.0% Fleet',
    badgeTone: 'neutral',
    footLabel: 'Avg Staging Delay',
    footValue: '18.4 mins',
    footTone: 'neutral',
    progress: 10,
    tone: 'neutral',
  },
  {
    id: 'energy-efficiency',
    label: 'Energy Efficiency',
    icon: 'bolt',
    value: '94.2',
    badge: 'Wh/km',
    badgeTone: 'neutral',
    footLabel: 'Target: <105 Wh/km',
    footValue: '−10.2% Net',
    footTone: 'tertiary',
    progress: 89.8,
    tone: 'tertiary',
  },
  {
    id: 'require-attention',
    label: 'Require Attention',
    icon: 'notifications_active',
    value: '14',
    badge: '1.0% Critical',
    badgeTone: 'critical',
    footLabel: '3 Thermal · 8 SoC',
    footValue: '3 Overdue',
    footTone: 'critical',
    progress: 100,
    tone: 'critical',
  },
  {
    id: 'total-trips-today',
    label: 'Total Trips Today',
    icon: 'directions_car',
    value: '2,410',
    badge: '+14.2%',
    badgeTone: 'tertiary',
    footLabel: 'Target 3,000 / day',
    footValue: '80.3%',
    footTone: 'neutral',
    progress: 80.3,
    tone: 'primary',
  },
  {
    id: 'dispatch-sla',
    label: 'Dispatch SLA',
    icon: 'schedule',
    value: '98.2%',
    badge: 'SLA Compliant',
    badgeTone: 'tertiary',
    footLabel: '< 3m gate variance',
    footValue: 'On Target',
    footTone: 'tertiary',
    progress: 98.2,
    tone: 'tertiary',
  },
  {
    id: 'geofence-compliance',
    label: 'Geofence Compliance',
    icon: 'shield',
    value: '99.1%',
    badge: '9 deviations',
    badgeTone: 'critical',
    footLabel: 'Across 42 arterial routes',
    footValue: '42 Zones',
    footTone: 'neutral',
    progress: 99.1,
    tone: 'secondary',
  },
  {
    id: 'avg-turnaround',
    label: 'Avg Turnaround',
    icon: 'history',
    value: '42.4m',
    badge: '↓ 3.8m avg',
    badgeTone: 'tertiary',
    footLabel: 'Cycle: Dock-to-Hub',
    footValue: 'Improving',
    footTone: 'tertiary',
    progress: 76,
    tone: 'primary',
  },
  {
    id: 'idle-staging-delay',
    label: 'Idle Staging Delay',
    icon: 'hourglass_empty',
    value: '6.2m',
    badge: 'Target <8.0m',
    badgeTone: 'tertiary',
    footLabel: '32 docks currently active',
    footValue: 'Within Target',
    footTone: 'tertiary',
    progress: 77.5,
    tone: 'tertiary',
  },
  {
    id: 'deliveries-per-vehicle',
    label: 'Deliveries / Vehicle',
    icon: 'inventory_2',
    value: '38.4',
    badge: '+6.1%',
    badgeTone: 'tertiary',
    footLabel: 'Target 42 / day',
    footValue: '91.4%',
    footTone: 'neutral',
    progress: 91.4,
    tone: 'primary',
  },
  {
    id: 'vehicle-availability',
    label: 'Vehicle Availability',
    icon: 'event_available',
    value: '93.6%',
    badge: '↑ 2.4%',
    badgeTone: 'tertiary',
    footLabel: 'Uptime, rolling 7d',
    footValue: '1,329 Ready',
    footTone: 'tertiary',
    progress: 93.6,
    tone: 'tertiary',
  },
  {
    id: 'fleet-dtc-open',
    label: 'Open DTCs',
    icon: 'error',
    value: '86',
    badge: '12 Severity A',
    badgeTone: 'critical',
    footLabel: 'Across 41 ECU variants',
    footValue: '6.1% of Fleet',
    footTone: 'critical',
    progress: 100,
    tone: 'critical',
  },
  {
    id: 'firmware-adoption',
    label: 'Firmware Adoption',
    icon: 'system_update',
    value: '87.2%',
    badge: 'v4.2.1',
    badgeTone: 'secondary',
    footLabel: '1,238 of 1,420 units',
    footValue: '182 Pending',
    footTone: 'neutral',
    progress: 87.2,
    tone: 'secondary',
  },
  {
    id: 'warranty-claim-rate',
    label: 'Warranty Claim Rate',
    icon: 'verified',
    value: '2.4%',
    badge: '↓ 0.6%',
    badgeTone: 'tertiary',
    footLabel: 'Rolling 90 days',
    footValue: '34 Open Claims',
    footTone: 'neutral',
    progress: 24,
    tone: 'tertiary',
  },
  {
    id: 'charge-swap-events',
    label: 'Charge / Swap Events',
    icon: 'ev_station',
    value: '612',
    badge: 'Today',
    badgeTone: 'neutral',
    footLabel: '18 Swaps / Hr peak',
    footValue: 'Indiranagar Stn',
    footTone: 'secondary',
    progress: 68,
    tone: 'secondary',
  },
]

/**
 * Default KPI selection per segment — the "specialized KPIs" the PRD calls for.
 * Same catalogue, different five, chosen against each segment's business question.
 */
export const DEFAULT_KPIS: Record<SegmentId, string[]> = {
  // "How efficiently are my vehicles and drivers operating?"
  'b2b-fleet': ['total-vehicles', 'active-on-trip', 'idle-staging', 'energy-efficiency', 'require-attention'],
  // "How do I maximize vehicle availability and deliveries per vehicle?"
  'last-mile': [
    'vehicle-availability',
    'deliveries-per-vehicle',
    'active-on-trip',
    'charge-swap-events',
    'require-attention',
  ],
  // "How are my vehicles performing in the real world?"
  'vehicle-oem': [
    'total-vehicles',
    'fleet-dtc-open',
    'firmware-adoption',
    'warranty-claim-rate',
    'energy-efficiency',
  ],
  'battery-oem': ['total-vehicles', 'energy-efficiency', 'require-attention', 'charge-swap-events', 'warranty-claim-rate'],
  'swapping-station': ['charge-swap-events', 'vehicle-availability', 'idle-staging', 'require-attention', 'total-vehicles'],
  'finance-leasing': ['total-vehicles', 'vehicle-availability', 'energy-efficiency', 'warranty-claim-rate', 'require-attention'],
}

/** KPI strip shown on the Vehicles & Trips screen (matches the delivered design). */
export const TRIP_KPIS = [
  'total-trips-today',
  'dispatch-sla',
  'geofence-compliance',
  'avg-turnaround',
  'idle-staging-delay',
]

export function getKpi(id: string): Kpi | undefined {
  return KPI_CATALOGUE.find((k) => k.id === id)
}
