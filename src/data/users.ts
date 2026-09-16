/**
 * Organisation user directory.
 *
 * Users are distinct from Drivers: a Driver operates a vehicle, a User signs
 * into the platform. A user carries a role (which modules, at what level) and an
 * asset grant (which assets those permissions apply to) — the two halves of the
 * PRD's access-control model on page 3.
 */

import { ROLES } from './roles'

export interface UserAssetAccess {
  /** 'tenant' = every asset in the org. 'restricted' = only what is listed. */
  kind: 'tenant' | 'restricted'
  hubs: string[]
  depots: string[]
  vehicleIds: string[]
}

export interface OrgUser {
  id: string
  name: string
  email: string
  phone: string
  roleId: string
  designation: string
  /** Display date, e.g. "12 Mar 2024". */
  dateAdded: string
  /** Display label, e.g. "2h ago" or "Never". */
  lastLogin: string
  /** Minutes since last sign-in; null when the invite was never accepted. */
  lastLoginMinutesAgo: number | null
  active: boolean
  access: UserAssetAccess
}

export const DESIGNATIONS = [
  'Fleet Operations Manager',
  'Depot Supervisor',
  'Dispatch Coordinator',
  'Maintenance Lead',
  'Service Technician',
  'Energy & Charging Analyst',
  'Safety & Compliance Officer',
  'Regional Head — South',
  'Telematics Engineer',
  'Finance Controller',
]

const TENANT_ACCESS: UserAssetAccess = { kind: 'tenant', hubs: [], depots: [], vehicleIds: [] }

/** The named users — the ones worth recognising across the prototype. */
const SEEDED_USERS: OrgUser[] = [
  {
    id: 'USR-1001',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@abcmobility.in',
    phone: '+91 98450 11020',
    roleId: 'org-admin',
    designation: 'Regional Head — South',
    dateAdded: '04 Jan 2024',
    lastLogin: '8m ago',
    lastLoginMinutesAgo: 8,
    active: true,
    access: TENANT_ACCESS,
  },
  {
    id: 'USR-1002',
    name: 'Karthik Menon',
    email: 'karthik.menon@abcmobility.in',
    phone: '+91 99001 44872',
    roleId: 'ops-lead',
    designation: 'Fleet Operations Manager',
    dateAdded: '17 Jan 2024',
    lastLogin: '42m ago',
    lastLoginMinutesAgo: 42,
    active: true,
    access: TENANT_ACCESS,
  },
  {
    id: 'USR-1003',
    name: 'Divya Raghavan',
    email: 'divya.raghavan@abcmobility.in',
    phone: '+91 98862 30514',
    roleId: 'hub-supervisor',
    designation: 'Depot Supervisor',
    dateAdded: '02 Feb 2024',
    lastLogin: '3h ago',
    lastLoginMinutesAgo: 180,
    active: true,
    access: {
      kind: 'restricted',
      hubs: ['Koramangala Hub', 'Peenya Corridor'],
      depots: ['DEP-IND'],
      vehicleIds: [],
    },
  },
  {
    id: 'USR-1004',
    name: 'Rajesh Kulkarni',
    email: 'rajesh.kulkarni@abcmobility.in',
    phone: '+91 90083 41200',
    roleId: 'maintenance-tech',
    designation: 'Maintenance Lead',
    dateAdded: '22 Feb 2024',
    lastLogin: '1d ago',
    lastLoginMinutesAgo: 1440,
    active: true,
    access: {
      kind: 'restricted',
      hubs: ['Whitefield Ring'],
      depots: ['DEP-WHI'],
      vehicleIds: ['VEH-0914', 'VEH-5120'],
    },
  },
  {
    id: 'USR-1005',
    name: 'Meera Subramanian',
    email: 'meera.s@abcmobility.in',
    phone: '+91 97411 68203',
    roleId: 'read-only-auditor',
    designation: 'Safety & Compliance Officer',
    dateAdded: '11 Mar 2024',
    lastLogin: '5d ago',
    lastLoginMinutesAgo: 7200,
    active: true,
    access: TENANT_ACCESS,
  },
  {
    id: 'USR-1006',
    name: 'Imran Qureshi',
    email: 'imran.qureshi@abcmobility.in',
    phone: '+91 98803 55129',
    roleId: 'ops-lead',
    designation: 'Energy & Charging Analyst',
    dateAdded: '08 Apr 2024',
    lastLogin: '19m ago',
    lastLoginMinutesAgo: 19,
    active: true,
    access: {
      kind: 'restricted',
      hubs: [],
      depots: ['DEP-IND', 'DEP-WHI', 'DEP-PEE'],
      vehicleIds: [],
    },
  },
  {
    id: 'USR-1007',
    name: 'Sneha Pillai',
    email: 'sneha.pillai@abcmobility.in',
    phone: '+91 96320 77410',
    roleId: 'hub-supervisor',
    designation: 'Dispatch Coordinator',
    dateAdded: '30 May 2024',
    lastLogin: 'Never',
    lastLoginMinutesAgo: null,
    active: false,
    access: { kind: 'restricted', hubs: ['Airport Arterial'], depots: [], vehicleIds: [] },
  },
  {
    id: 'USR-1008',
    name: 'Vikas Deshpande',
    email: 'vikas.deshpande@abcmobility.in',
    phone: '+91 99720 18345',
    roleId: 'maintenance-tech',
    designation: 'Service Technician',
    dateAdded: '14 Jun 2024',
    lastLogin: '2d ago',
    lastLoginMinutesAgo: 2880,
    active: false,
    access: { kind: 'restricted', hubs: ['Peenya Corridor'], depots: ['DEP-PEE'], vehicleIds: [] },
  },
]

const FIRST_NAMES = [
  'Arjun', 'Nisha', 'Rohit', 'Kavya', 'Sanjay', 'Deepa', 'Harish', 'Lakshmi',
  'Manoj', 'Pooja', 'Girish', 'Swathi', 'Naveen', 'Ritu', 'Aakash', 'Shalini',
]
const LAST_NAMES = [
  'Bhat', 'Reddy', 'Nair', 'Gowda', 'Shetty', 'Verma', 'Joshi', 'Krishnan',
  'Rao', 'Desai', 'Hegde', 'Kamath', 'Prasad', 'Sharma', 'Naidu', 'Acharya',
]

/** Deterministic fill so the directory has enough rows to filter and page. */
function generateUsers(count: number): OrgUser[] {
  let seed = 771030
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
  const between = (lo: number, hi: number) => Math.round(lo + rand() * (hi - lo))

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const out: OrgUser[] = []
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const role = pick(ROLES)
    const active = rand() > 0.18

    // Roughly a fifth of accounts have never signed in; the rest range from
    // minutes to a couple of months ago.
    const neverLoggedIn = rand() > 0.86
    const minutesAgo = neverLoggedIn ? null : between(3, 86400)

    let lastLogin = 'Never'
    if (minutesAgo !== null) {
      if (minutesAgo < 60) lastLogin = `${minutesAgo}m ago`
      else if (minutesAgo < 1440) lastLogin = `${Math.round(minutesAgo / 60)}h ago`
      else lastLogin = `${Math.round(minutesAgo / 1440)}d ago`
    }

    out.push({
      id: `USR-${2000 + i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@abcmobility.in`,
      phone: `+91 ${between(90000, 99999)} ${between(10000, 99999)}`,
      roleId: role.id,
      designation: pick(DESIGNATIONS),
      dateAdded: `${String(between(1, 28)).padStart(2, '0')} ${pick(months)} ${pick([2023, 2024, 2025])}`,
      lastLogin,
      lastLoginMinutesAgo: minutesAgo,
      active,
      access:
        rand() > 0.55
          ? TENANT_ACCESS
          : {
              kind: 'restricted',
              hubs: [pick(['Koramangala Hub', 'Peenya Corridor', 'Airport Arterial', 'Whitefield Ring'])],
              depots: [],
              vehicleIds: [],
            },
    })
  }
  return out
}

export const ORG_USERS: OrgUser[] = [...SEEDED_USERS, ...generateUsers(22)]

/** Human summary of a grant, for the directory row and the modal header. */
export function describeAccess(access: UserAssetAccess): string {
  if (access.kind === 'tenant') return 'Tenant-wide'
  const parts: string[] = []
  if (access.hubs.length) parts.push(`${access.hubs.length} hub${access.hubs.length > 1 ? 's' : ''}`)
  if (access.depots.length) parts.push(`${access.depots.length} depot${access.depots.length > 1 ? 's' : ''}`)
  if (access.vehicleIds.length) parts.push(`${access.vehicleIds.length} vehicle${access.vehicleIds.length > 1 ? 's' : ''}`)
  return parts.length ? parts.join(' · ') : 'No assets granted'
}
