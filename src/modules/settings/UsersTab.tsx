/**
 * Organisation & Settings — Users tab.
 *
 * The directory of people who sign into the platform, with the two halves of
 * the PRD access model on each row: the role they hold (which modules, at what
 * level) and the assets that role applies to (the Manage Access modal).
 */

import { useMemo, useState } from 'react'
import { ActionButton } from '@/components/ActionButton'
import { EmptyState, Icon, Panel, StatusBadge, Toggle } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { getRole } from '@/data/roles'
import { HUBS, VEHICLES } from '@/data/fleet'
import { DEPOTS } from '@/data/charging'
import { DESIGNATIONS, describeAccess, type OrgUser, type UserAssetAccess } from '@/data/users'

const ROWS_PER_PAGE = 8

// --- Manage access modal -----------------------------------------------------

function ManageAccessModal({
  user,
  onClose,
  onSave,
  canEdit,
}: {
  user: OrgUser
  onClose: () => void
  onSave: (access: UserAssetAccess) => void
  canEdit: boolean
}) {
  const [kind, setKind] = useState<UserAssetAccess['kind']>(user.access.kind)
  const [hubs, setHubs] = useState<string[]>(user.access.hubs)
  const [depots, setDepots] = useState<string[]>(user.access.depots)
  const [vehicleIds, setVehicleIds] = useState<string[]>(user.access.vehicleIds)
  const [vehicleQuery, setVehicleQuery] = useState('')

  const role = getRole(user.roleId)

  function toggleIn(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const vehicleMatches = useMemo(() => {
    const q = vehicleQuery.trim().toLowerCase()
    const base = q
      ? VEHICLES.filter((v) => `${v.registration} ${v.id} ${v.model} ${v.hub}`.toLowerCase().includes(q))
      : VEHICLES
    return base.slice(0, 40)
  }, [vehicleQuery])

  const restricted = kind === 'restricted'
  const grantedCount = hubs.length + depots.length + vehicleIds.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-space-lg backdrop-blur-sm">
      <div className="panel flex max-h-[88vh] w-full max-w-3xl flex-col p-0 shadow-level-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-space-sm border-b border-outline-variant/40 p-space-lg">
          <div className="flex items-start gap-space-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed">
              <Icon name="admin_panel_settings" className="text-[22px] text-primary" />
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-semibold">
                {canEdit ? 'Manage asset access' : 'Asset access (read-only)'}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                <strong className="text-on-surface">{user.name}</strong> · {role.name} · {user.designation}
              </p>
              <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
                The role decides <em>what</em> they can do. This decides <em>which assets</em> it applies to.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-space-lg">
          <fieldset className="mb-space-lg">
            <legend className="font-label-sm text-label-sm mb-space-sm uppercase tracking-wider text-on-surface-variant">
              Scope
            </legend>
            <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
              {(
                [
                  { value: 'tenant', title: 'Tenant-wide', body: 'Every asset in the organisation.' },
                  { value: 'restricted', title: 'Specific assets', body: 'Only the assets selected below.' },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-space-sm rounded-xl border p-space-md transition-colors ${
                    kind === opt.value
                      ? 'border-primary bg-primary-fixed/40'
                      : 'border-outline-variant/40 hover:bg-surface-container-low'
                  } ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="access-kind"
                    disabled={!canEdit}
                    checked={kind === opt.value}
                    onChange={() => setKind(opt.value)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="font-body-md text-body-md block font-semibold text-on-surface">{opt.title}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{opt.body}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={restricted ? '' : 'pointer-events-none opacity-40'}>
            {/* Hubs */}
            <section className="mb-space-lg">
              <p className="font-label-sm text-label-sm mb-space-sm uppercase tracking-wider text-on-surface-variant">
                Operational hubs ({hubs.length}/{HUBS.length})
              </p>
              <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                {HUBS.map((h) => (
                  <label
                    key={h.id}
                    className={`flex items-center gap-space-sm rounded-xl border p-space-sm ${
                      hubs.includes(h.name)
                        ? 'border-primary bg-primary-fixed/30'
                        : 'border-outline-variant/40'
                    } ${canEdit ? 'cursor-pointer hover:bg-surface-container-low' : 'cursor-not-allowed'}`}
                  >
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      checked={hubs.includes(h.name)}
                      onChange={() => toggleIn(hubs, setHubs, h.name)}
                      className="h-4 w-4 accent-primary"
                    />
                    <Icon name="share_location" className="text-[16px] text-on-surface-variant" />
                    <span className="font-body-sm text-body-sm flex-1 truncate">{h.name}</span>
                    <span className="font-telemetry-sm text-telemetry-sm text-outline">{h.evCount} EVs</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Depots */}
            <section className="mb-space-lg">
              <p className="font-label-sm text-label-sm mb-space-sm uppercase tracking-wider text-on-surface-variant">
                Charging depots ({depots.length}/{DEPOTS.length})
              </p>
              <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
                {DEPOTS.map((d) => (
                  <label
                    key={d.id}
                    className={`flex items-center gap-space-sm rounded-xl border p-space-sm ${
                      depots.includes(d.id) ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant/40'
                    } ${canEdit ? 'cursor-pointer hover:bg-surface-container-low' : 'cursor-not-allowed'}`}
                  >
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      checked={depots.includes(d.id)}
                      onChange={() => toggleIn(depots, setDepots, d.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <Icon name="ev_station" className="text-[16px] text-on-surface-variant" />
                    <span className="font-body-sm text-body-sm flex-1 truncate">{d.name}</span>
                    <span className="font-telemetry-sm text-telemetry-sm text-outline">
                      {d.dcFastGuns + d.acType2Guns} guns
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Individual vehicles */}
            <section>
              <div className="mb-space-sm flex flex-wrap items-center justify-between gap-space-sm">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Individual vehicles ({vehicleIds.length} selected)
                </p>
                <div className="relative min-w-[200px]">
                  <Icon
                    name="search"
                    className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[16px] text-outline"
                  />
                  <input
                    value={vehicleQuery}
                    onChange={(e) => setVehicleQuery(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Search registration, VIN, hub..."
                    className="font-body-sm text-body-sm h-9 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-8 pr-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto rounded-xl border border-outline-variant/40">
                {vehicleMatches.map((v) => (
                  <label
                    key={v.id}
                    className={`flex items-center gap-space-sm border-b border-surface-container-high px-space-sm py-2 last:border-b-0 ${
                      canEdit ? 'cursor-pointer hover:bg-surface-container-low' : 'cursor-not-allowed'
                    } ${vehicleIds.includes(v.id) ? 'bg-primary-fixed/30' : ''}`}
                  >
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      checked={vehicleIds.includes(v.id)}
                      onChange={() => toggleIn(vehicleIds, setVehicleIds, v.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="font-telemetry-sm text-telemetry-sm w-32 shrink-0 font-semibold">
                      {v.registration}
                    </span>
                    <span className="font-body-sm text-body-sm flex-1 truncate text-on-surface-variant">
                      {v.model}
                    </span>
                    <span className="font-body-sm text-body-sm shrink-0 text-outline">{v.hub}</span>
                  </label>
                ))}
                {vehicleMatches.length === 0 && (
                  <p className="font-body-sm text-body-sm p-space-md text-center text-on-surface-variant">
                    No vehicles match that search.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm border-t border-outline-variant/40 p-space-lg">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {restricted ? (
              grantedCount === 0 ? (
                <span className="font-semibold text-state-warn-text">
                  No assets selected — this user would see nothing.
                </span>
              ) : (
                <>
                  Granting <strong className="text-on-surface">{grantedCount}</strong> asset
                  {grantedCount > 1 ? 's' : ''}
                </>
              )
            ) : (
              'Full access to every asset in the tenant.'
            )}
          </span>

          <div className="flex items-center gap-space-sm">
            <ActionButton onClick={onClose}>Cancel</ActionButton>
            <ActionButton
              variant="primary"
              icon="save"
              module="organization-settings"
              onClick={() =>
                onSave(
                  kind === 'tenant'
                    ? { kind: 'tenant', hubs: [], depots: [], vehicleIds: [] }
                    : { kind: 'restricted', hubs, depots, vehicleIds },
                )
              }
            >
              Save Access
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Users table -------------------------------------------------------------

export function UsersTab({
  users,
  onChange,
}: {
  users: OrgUser[]
  onChange: (next: OrgUser[]) => void
}) {
  const { can, roles } = useWorkspace()
  const canEdit = can('organization-settings', 'edit')

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [designationFilter, setDesignationFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [managing, setManaging] = useState<OrgUser | null>(null)

  function update<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(0)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.roleId !== roleFilter) return false
      if (statusFilter === 'active' && !u.active) return false
      if (statusFilter === 'inactive' && u.active) return false
      if (designationFilter !== 'all' && u.designation !== designationFilter) return false
      if (q && !`${u.name} ${u.email} ${u.phone} ${u.designation} ${u.id}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [users, query, roleFilter, statusFilter, designationFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage = Math.min(page, pageCount - 1)
  const rows = filtered.slice(safePage * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE + ROWS_PER_PAGE)

  const activeCount = users.filter((u) => u.active).length

  function setUser(id: string, patch: Partial<OrgUser>) {
    onChange(users.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  return (
    <Panel padded={false}>
      {/* Toolbar */}
      <div className="flex flex-col gap-space-md p-space-lg pb-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm font-semibold">Organisation users</h2>
            <StatusBadge tone="ok">{activeCount} active</StatusBadge>
            <StatusBadge tone="idle">{users.length - activeCount} inactive</StatusBadge>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <ActionButton icon="download" module="reports-analytics" requires="view" size="compact">
              Export Directory
            </ActionButton>
            <ActionButton icon="person_add" variant="primary" module="organization-settings" size="compact">
              Invite User
            </ActionButton>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="relative min-w-[240px] flex-1 sm:max-w-[320px]">
            <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[16px] text-outline" />
            <input
              value={query}
              onChange={(e) => update(setQuery)(e.target.value)}
              placeholder="Search name, email, phone, designation..."
              className="font-body-sm text-body-sm h-9 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-8 pr-space-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <label className="font-body-sm text-body-sm flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => update(setRoleFilter)(e.target.value)}
              className="h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
            >
              <option value="all">All roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className="font-body-sm text-body-sm flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => update(setStatusFilter)(e.target.value as 'all' | 'active' | 'inactive')}
              className="h-9 rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="font-body-sm text-body-sm flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Designation:</span>
            <select
              value={designationFilter}
              onChange={(e) => update(setDesignationFilter)(e.target.value)}
              className="h-9 max-w-[220px] rounded-xl border border-outline-variant bg-surface-container-lowest px-space-sm"
            >
              <option value="all">All designations</option>
              {DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse">
          <thead>
            <tr className="bg-surface-container-low">
              {[
                { label: 'User', align: 'text-left' },
                { label: 'Contact', align: 'text-left' },
                { label: 'Role Assigned', align: 'text-left' },
                { label: 'Designation', align: 'text-left' },
                { label: 'Date Added', align: 'text-left' },
                { label: 'Last Login', align: 'text-left' },
                { label: 'Asset Access', align: 'text-left' },
                { label: 'Status', align: 'text-center' },
                { label: 'Actions', align: 'text-center' },
              ].map((h) => (
                <th
                  key={h.label}
                  className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm uppercase text-on-surface-variant ${h.align}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((u) => {
              const role = getRole(u.roleId)
              const never = u.lastLoginMinutesAgo === null
              const stale = u.lastLoginMinutesAgo !== null && u.lastLoginMinutesAgo > 43200

              return (
                <tr
                  key={u.id}
                  className={`border-b border-surface-container-high transition-colors hover:bg-surface ${
                    u.active ? '' : 'opacity-60'
                  }`}
                >
                  <td className="px-space-md py-space-md align-top">
                    <div className="flex items-start gap-space-sm">
                      <span className="font-label-sm text-label-sm flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-primary font-bold text-on-primary">
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-body-sm text-body-sm font-semibold text-on-surface">{u.name}</p>
                        <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">{u.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-space-md py-space-md align-top">
                    <p className="font-body-sm text-body-sm truncate text-primary">{u.email}</p>
                    <p className="font-telemetry-sm text-telemetry-sm text-on-surface-variant">{u.phone}</p>
                  </td>

                  <td className="px-space-md py-space-md align-top">
                    <StatusBadge tone={u.roleId === 'org-admin' ? 'info' : 'idle'}>{role.name}</StatusBadge>
                  </td>

                  <td className="font-body-sm text-body-sm px-space-md py-space-md align-top text-on-surface">
                    {u.designation}
                  </td>

                  <td className="font-telemetry-sm text-telemetry-sm px-space-md py-space-md align-top text-on-surface-variant">
                    {u.dateAdded}
                  </td>

                  <td className="px-space-md py-space-md align-top">
                    <span
                      className={`font-telemetry-sm text-telemetry-sm ${
                        never ? 'italic text-state-warn-text' : stale ? 'text-outline' : 'text-on-surface'
                      }`}
                    >
                      {u.lastLogin}
                    </span>
                  </td>

                  <td className="px-space-md py-space-md align-top">
                    <span
                      className={`font-body-sm text-body-sm ${
                        u.access.kind === 'tenant' ? 'text-on-surface-variant' : 'font-semibold text-state-warn-text'
                      }`}
                    >
                      {describeAccess(u.access)}
                    </span>
                  </td>

                  <td className="px-space-md py-space-md align-top">
                    <div className="flex flex-col items-center gap-1">
                      <Toggle
                        checked={u.active}
                        disabled={!canEdit}
                        label={`${u.active ? 'Deactivate' : 'Activate'} ${u.name}`}
                        onChange={(next) => setUser(u.id, { active: next })}
                      />
                      <span
                        className={`font-label-sm text-label-sm uppercase ${
                          u.active ? 'text-state-ok' : 'text-outline'
                        }`}
                      >
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>

                  <td className="px-space-md py-space-md align-top">
                    <div className="flex justify-center">
                      {/* Openable with view access so an auditor can review a
                          grant; the fields and Save stay edit-gated inside. */}
                      <ActionButton
                        icon="key"
                        module="organization-settings"
                        requires="view"
                        size="compact"
                        onClick={() => setManaging(u)}
                      >
                        {canEdit ? 'Manage Access' : 'View Access'}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <EmptyState
            icon="person_off"
            title="No users match these filters"
            body="Clear the search, role, status or designation filter to widen the directory."
          />
        )}
      </div>

      {/* Footer */}
      <div className="font-body-sm text-body-sm flex flex-wrap items-center justify-between gap-space-sm p-space-lg text-on-surface-variant">
        <span>
          Showing <strong className="text-on-surface">{filtered.length === 0 ? 0 : safePage * ROWS_PER_PAGE + 1}</strong>{' '}
          to <strong className="text-on-surface">{safePage * ROWS_PER_PAGE + rows.length}</strong> of{' '}
          <strong className="text-on-surface">{filtered.length}</strong> users
        </span>
        <span className="flex items-center gap-space-sm">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className="rounded-lg px-space-sm py-1 transition-colors enabled:hover:bg-surface-container disabled:text-outline"
          >
            Previous
          </button>
          <span className="font-telemetry-sm text-telemetry-sm">
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            className="rounded-lg px-space-sm py-1 transition-colors enabled:hover:bg-surface-container disabled:text-outline"
          >
            Next
          </button>
        </span>
      </div>

      {managing && (
        <ManageAccessModal
          user={managing}
          canEdit={canEdit}
          onClose={() => setManaging(null)}
          onSave={(access) => {
            setUser(managing.id, { access })
            setManaging(null)
          }}
        />
      )}
    </Panel>
  )
}
