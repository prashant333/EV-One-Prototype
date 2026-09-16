/**
 * The platform model, transcribed directly from the PRD
 * (PRD/Intellicar Unified Platform.pdf, pages 2-4).
 *
 * This file is the single source of truth for the prototype's central claim:
 * one deployment + one core platform + modular capabilities + 2 experience clusters.
 * Navigation, KPIs and permissions are all derived from the structures below —
 * nothing about cluster/segment/module gating is hard-coded in the UI.
 */

export type ClusterId = 'fleet-mobility' | 'asset-finance'
export type SegmentId =
  | 'b2b-fleet'
  | 'last-mile'
  | 'vehicle-oem'
  | 'battery-oem'
  | 'swapping-station'
  | 'finance-leasing'

export type ModuleId =
  | 'dashboard'
  | 'assets-registry'
  | 'live-tracking'
  | 'vehicles-trips'
  | 'battery'
  | 'operational-alerts'
  | 'maintenance'
  | 'geofences'
  | 'routes-corridors'
  | 'charging-sessions'
  | 'driver-analytics'
  | 'vehicle-telemetry'
  | 'fota'
  | 'asset-intelligence'
  | 'reports-analytics'
  | 'integrations-apis'
  | 'organization-settings'

export type NavGroup = 'core' | 'workspace' | 'intelligence' | 'system'

export interface Cluster {
  id: ClusterId
  name: string
  tagline: string
  /** Cluster 2 is out of scope for this build — rendered as a placeholder. */
  available: boolean
  segments: SegmentId[]
}

export interface Segment {
  id: SegmentId
  cluster: ClusterId
  name: string
  /** PRD page 2, "Primary Business question" column. */
  businessQuestion: string
  /** PRD page 2, "Market players" column. */
  marketPlayers: string[]
  /** Demo tenant shown in the sidebar footer when this segment is active. */
  tenant: string
  tier: string
}

export interface PlatformModule {
  id: ModuleId
  name: string
  /** Material Symbols ligature name. */
  icon: string
  route: string
  group: NavGroup
  /**
   * Which segments get this module, per the PRD's Cluster 1 module matrix (page 4).
   * `null` means the module is part of the shared core and is always present.
   */
  segments: SegmentId[] | null
  /** True once a design has been delivered for this module. */
  designed: boolean
  /** Short description used on stub screens awaiting design. */
  purpose: string
}

export const CLUSTERS: Cluster[] = [
  {
    id: 'fleet-mobility',
    name: 'Fleet & Mobility',
    tagline: 'Vehicle, driver and trip operations',
    available: true,
    segments: ['b2b-fleet', 'last-mile', 'vehicle-oem'],
  },
  {
    id: 'asset-finance',
    name: 'Asset Intelligence & Finance',
    tagline: 'Battery, swap network and asset risk',
    available: false,
    segments: ['battery-oem', 'swapping-station', 'finance-leasing'],
  },
]

export const SEGMENTS: Segment[] = [
  {
    id: 'b2b-fleet',
    cluster: 'fleet-mobility',
    name: 'B2B Fleet',
    businessQuestion: 'How efficiently are my vehicles and drivers operating?',
    marketPlayers: ['Greencell Mobility', 'Zivo'],
    tenant: 'ABC Mobility',
    tier: 'Pro Tier',
  },
  {
    id: 'last-mile',
    cluster: 'fleet-mobility',
    name: 'Last-Mile Mobility',
    businessQuestion: 'How do I maximize vehicle availability and deliveries per vehicle?',
    marketPlayers: ['Bounce'],
    tenant: 'Milo Logistics',
    tier: 'Growth Tier',
  },
  {
    id: 'vehicle-oem',
    cluster: 'fleet-mobility',
    name: 'Vehicle OEM',
    businessQuestion: 'How are my vehicles performing in the real world?',
    marketPlayers: ['MG', 'Tata'],
    tenant: 'Tata Motors EV',
    tier: 'Enterprise Tier',
  },
  {
    id: 'battery-oem',
    cluster: 'asset-finance',
    name: 'Battery OEM',
    businessQuestion: 'How healthy are my batteries and how long will they remain usable?',
    marketPlayers: [],
    tenant: 'Exponent Energy',
    tier: 'Pro Tier',
  },
  {
    id: 'swapping-station',
    cluster: 'asset-finance',
    name: 'Swapping Station',
    businessQuestion: 'How efficiently is my swapping network operating?',
    marketPlayers: ['Battery Smart', 'PointO'],
    tenant: 'Battery Smart',
    tier: 'Enterprise Tier',
  },
  {
    id: 'finance-leasing',
    cluster: 'asset-finance',
    name: 'Finance & Leasing',
    businessQuestion: 'What is the current risk and value of the EV asset I have financed?',
    marketPlayers: ['Revfin', 'Vidyut'],
    tenant: 'Revfin Capital',
    tier: 'Pro Tier',
  },
]

const FLEET = 'b2b-fleet' as const
const LAST_MILE = 'last-mile' as const
const OEM = 'vehicle-oem' as const

const BATTERY_OEM = 'battery-oem' as const
const SWAPPING = 'swapping-station' as const
const FINANCE = 'finance-leasing' as const

/**
 * Cluster 1 module matrix — PRD page 4.
 *
 *   Module                      B2B fleet | Last mile | Vehicle OEM
 *   Geofencing                     yes    |    yes    |     -
 *   Live Tracking                  yes    |    yes    |    yes
 *   Routes, schedules and trips    yes    |    yes    |     -
 *   Vehicle health                 yes    |    yes    |    yes
 *   Charging event                 yes    |    yes    |    yes
 *   Hubs and vehicles              yes    |    yes    |     -
 *   Alerts                         yes    |    yes    |    yes
 *   FOTA                           yes    |    yes    |    yes
 *   Driver analytics               yes    |    yes    |    yes
 *   Vehicle telemetry              yes    |    yes    |    yes
 *   Maintenance                    yes    |    yes    |    yes
 */
export const MODULES: PlatformModule[] = [
  // --- Shared core (present for every segment) ---
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'home',
    route: '/dashboard',
    group: 'core',
    segments: null,
    designed: true,
    purpose: 'Segment-specific landing view aggregating the KPIs that answer the primary business question.',
  },
  {
    id: 'assets-registry',
    name: 'Assets Registry',
    icon: 'database',
    route: '/assets-registry',
    group: 'core',
    segments: null,
    designed: false,
    purpose: 'Master record of every onboarded asset — vehicles, batteries, devices — and their provisioning state.',
  },
  {
    id: 'live-tracking',
    name: 'Live Tracking',
    icon: 'map',
    route: '/live-tracking',
    group: 'core',
    segments: null,
    designed: false,
    purpose: 'Real-time position, status and telemetry of every connected asset on a live map.',
  },

  // --- Cluster 1 workspace modules (gated by the PRD matrix) ---
  {
    id: 'vehicles-trips',
    name: 'Schedule and Trips',
    icon: 'directions_car',
    route: '/vehicles-trips',
    group: 'workspace',
    // PRD: "Routes, schedules and trips" + "Hubs and vehicles" — both excluded for OEM
    segments: [FLEET, LAST_MILE],
    designed: true,
    purpose: 'Trip lifecycle, dispatch SLA, corridor adherence and hub-to-hub scheduling.',
  },
  {
    // Merges the PRD's "Vehicle health" and "Vehicle telemetry" rows into one module.
    id: 'vehicle-telemetry',
    name: 'Vehicles and Health',
    icon: 'monitor_heart',
    route: '/vehicles-health',
    group: 'workspace',
    segments: [FLEET, LAST_MILE, OEM],
    designed: true,
    purpose:
      'Vehicle health state, raw CAN/ECU signal streams, DTC monitoring and deep-inspection diagnostics.',
  },
  {
    id: 'charging-sessions',
    name: 'Charging Sessions',
    icon: 'ev_station',
    route: '/charging-sessions',
    group: 'workspace',
    // PRD: Charging event — yes / yes / yes
    segments: [FLEET, LAST_MILE, OEM],
    designed: true,
    purpose: 'Charge and swap events, energy drawn, session cost and depot utilisation.',
  },
  {
    id: 'driver-analytics',
    name: 'Driver Analytics',
    icon: 'speed',
    route: '/driver-analytics',
    group: 'workspace',
    // PRD: Driver analytics — yes / yes / yes
    segments: [FLEET, LAST_MILE, OEM],
    designed: true,
    purpose: 'Telemetry-graded driving behaviour, harsh-event scoring and efficiency leaderboards.',
  },
  {
    id: 'operational-alerts',
    name: 'Alerts',
    icon: 'warning',
    route: '/operational-alerts',
    group: 'workspace',
    segments: [FLEET, LAST_MILE, OEM],
    designed: false,
    purpose: 'Triage queue for thermal, geofence, connectivity and driver-behaviour exceptions.',
  },
  {
    id: 'maintenance',
    name: 'Operation and Maintenance',
    icon: 'emergency',
    route: '/maintenance',
    group: 'workspace',
    segments: [FLEET, LAST_MILE, OEM],
    designed: false,
    purpose: 'Predictive service triage, bay booking, work orders and maintenance history.',
  },
  {
    id: 'geofences',
    name: 'Geofences',
    icon: 'share_location',
    route: '/geofences',
    group: 'workspace',
    // PRD: Geofencing — yes / yes / (blank for Vehicle OEM)
    segments: [FLEET, LAST_MILE],
    designed: false,
    purpose: 'Zone definitions, entry/exit rules, dwell limits and breach escalation policy.',
  },
  {
    id: 'routes-corridors',
    name: 'Routes & Corridors',
    icon: 'alt_route',
    route: '/routes-corridors',
    group: 'workspace',
    // PRD: Routes, schedules and trips — yes / yes / (blank for Vehicle OEM)
    segments: [FLEET, LAST_MILE],
    designed: false,
    purpose: 'Arterial corridor design, schedule templates and route-level SLA targets.',
  },
  {
    id: 'fota',
    name: 'FOTA',
    icon: 'system_update',
    route: '/fota',
    group: 'workspace',
    // PRD: FOTA — yes / yes / yes
    segments: [FLEET, LAST_MILE, OEM],
    designed: false,
    purpose: 'Firmware campaign rollout, cohort targeting, rollback and device version fleet-wide.',
  },

  // --- Cluster 2 workspace modules (not shown in Fleet & Mobility) ---
  {
    // Battery belongs to Asset Intelligence & Finance, not Fleet & Mobility.
    id: 'battery',
    name: 'Battery',
    icon: 'battery_charging_full',
    route: '/battery',
    group: 'workspace',
    segments: [BATTERY_OEM, SWAPPING, FINANCE],
    designed: false,
    purpose: 'Pack-level SoC/SoH, thermal profile, cell deviation and degradation trend.',
  },

  // --- Intelligence & analytics (shared core) ---
  {
    id: 'asset-intelligence',
    name: 'Asset Intelligence',
    icon: 'insights',
    route: '/asset-intelligence',
    group: 'intelligence',
    segments: null,
    designed: false,
    purpose: 'Cross-module ML layer: residual value, predictive failure and utilisation modelling.',
  },
  {
    id: 'reports-analytics',
    name: 'Reports & Analytics',
    icon: 'bar_chart',
    route: '/reports-analytics',
    group: 'intelligence',
    segments: null,
    designed: false,
    purpose: 'Scheduled reporting, custom cohort analysis and export to downstream BI.',
  },

  // --- System & settings (shared core) ---
  {
    id: 'integrations-apis',
    name: 'Integrations & APIs',
    icon: 'hub',
    route: '/integrations-apis',
    group: 'system',
    segments: null,
    designed: false,
    purpose: 'Device onboarding protocols, webhook subscriptions and partner API credentials.',
  },
  {
    id: 'organization-settings',
    name: 'Organization & Settings',
    icon: 'settings',
    route: '/organization-settings',
    group: 'system',
    segments: null,
    designed: true,
    purpose: 'Tenant profile, user directory and role-based access control.',
  },
]

export const NAV_GROUP_LABELS: Record<NavGroup, string | null> = {
  core: null,
  workspace: 'Workspace',
  intelligence: 'Intelligence and Analytics',
  system: 'System & Settings',
}

/** Modules visible to a segment, per the PRD matrix. */
export function modulesForSegment(segmentId: SegmentId): PlatformModule[] {
  return MODULES.filter((m) => m.segments === null || m.segments.includes(segmentId))
}

/** Modules the PRD matrix withholds from a segment — shown as the "what you don't get" story. */
export function modulesExcludedForSegment(segmentId: SegmentId): PlatformModule[] {
  return MODULES.filter((m) => m.segments !== null && !m.segments.includes(segmentId))
}

export function getSegment(id: SegmentId): Segment {
  const segment = SEGMENTS.find((s) => s.id === id)
  if (!segment) throw new Error(`Unknown segment: ${id}`)
  return segment
}

export function getCluster(id: ClusterId): Cluster {
  const cluster = CLUSTERS.find((c) => c.id === id)
  if (!cluster) throw new Error(`Unknown cluster: ${id}`)
  return cluster
}

export function getModule(id: ModuleId): PlatformModule {
  const found = MODULES.find((m) => m.id === id)
  if (!found) throw new Error(`Unknown module: ${id}`)
  return found
}
