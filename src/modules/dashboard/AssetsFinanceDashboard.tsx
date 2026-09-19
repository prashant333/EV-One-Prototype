/**
 * Assets & Finance dashboard — Cluster 2 landing page.
 *
 * No design was supplied for this screen, so it is composed from the delivered
 * design system and the Battery Health design's own panels. Segment-aware in
 * the same way the fleet dashboard is: panels belonging to modules the active
 * segment does not receive drop out entirely.
 */

import { useNavigate } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { PageHeader } from '@/layout/AppShell'
import { ActionButton } from '@/components/ActionButton'
import { Icon, Panel, PanelHeader, StatusBadge } from '@/components/primitives'
import { useWorkspace } from '@/state/WorkspaceContext'
import { scopeToHubs } from '@/data/fleet'
import { BATTERIES, PORTFOLIO_KPIS, PREDICTIVE_QUEUE, SOH_BINS } from '@/data/batteries'
import { DEPOTS } from '@/data/charging'

const BIN_COLORS = ['#059669', '#0037b0', '#d97706', '#e11d48']

export function AssetsFinanceDashboard() {
  const { segment, role, visibleModules } = useWorkspace()
  const navigate = useNavigate()

  const scoped = scopeToHubs(BATTERIES, role.assetScope.hubs)

  const has = (id: string) => visibleModules.some((m) => m.id === id)

  const claimsDue = scoped.filter((b) => b.warranty === 'ready-to-claim').length
  const critical = scoped.filter((b) => b.sohStatus === 'critical').length
  const inVehicles = scoped.filter((b) => b.deployment.kind === 'vehicle').length
  const inStations = scoped.filter((b) => b.deployment.kind === 'station').length

  return (
    <>
      <PageHeader
        title={`${segment.name} Portfolio`}
        breadcrumb="Portfolio Overview"
        live
        liveLabel="Live"
        actions={
          <>
            <ActionButton icon="download" module="reports-analytics" requires="view">
              Export Portfolio
            </ActionButton>
            <ActionButton icon="add_circle" variant="primary" module="assets-registry">
              Commission New Pack
            </ActionButton>
          </>
        }
      />

      {role.assetScope.kind === 'hubs' && (
        <div className="mb-space-md flex justify-end">
          <StatusBadge tone="warn">
            <Icon name="lock" className="text-[12px]" />
            Scoped to {role.assetScope.hubs?.join(', ')}
          </StatusBadge>
        </div>
      )}

      {/* Portfolio KPI strip */}
      <div className="mb-space-md grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-5">
        {PORTFOLIO_KPIS.map((kpi) => (
          <div key={kpi.id} className="panel flex flex-col p-space-md">
            <div className="mb-space-xs flex items-start justify-between gap-space-sm">
              <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface-variant">
                {kpi.label}
              </span>
              <Icon
                name={kpi.icon}
                className={`text-[20px] ${
                  kpi.captionTone === 'crit'
                    ? 'text-state-crit'
                    : kpi.captionTone === 'warn'
                      ? 'text-state-warn'
                      : 'text-state-ok'
                }`}
              />
            </div>
            <div className="flex flex-wrap items-baseline gap-space-xs">
              <span className="font-telemetry-lg text-telemetry-lg tnum font-bold">{kpi.value}</span>
              {kpi.unit && <span className="font-body-sm text-body-sm text-on-surface-variant">{kpi.unit}</span>}
            </div>
            <p
              className={`font-body-sm text-body-sm mt-0.5 ${
                kpi.captionTone === 'crit'
                  ? 'text-state-crit'
                  : kpi.captionTone === 'warn'
                    ? 'text-state-warn'
                    : 'text-state-ok'
              }`}
            >
              {kpi.caption}
            </p>
            <div className="mt-auto pt-space-sm">
              <div className="h-1 w-full overflow-hidden rounded-pill bg-surface-container-high">
                <div
                  className={`h-full rounded-pill ${
                    kpi.progressTone === 'crit'
                      ? 'bg-state-crit'
                      : kpi.progressTone === 'warn'
                        ? 'bg-state-warn'
                        : kpi.progressTone === 'primary'
                          ? 'bg-primary'
                          : 'bg-state-ok'
                  }`}
                  style={{ width: `${kpi.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-space-md xl:grid-cols-3">
        <div className="flex flex-col gap-space-md xl:col-span-2">
          {/* Health distribution */}
          <Panel>
            <PanelHeader
              title="Portfolio Health Distribution"
              subtitle="Pack count by state-of-health band across the portfolio"
              action={
                <ActionButton
                  icon="arrow_forward"
                  variant="ghost"
                  module="battery"
                  requires="view"
                  size="compact"
                  onClick={() => navigate('/battery-health')}
                >
                  Open Battery Health
                </ActionButton>
              }
            />

            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SOH_BINS}
                      dataKey="pct"
                      nameKey="label"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {SOH_BINS.map((b, i) => (
                        <Cell key={b.label} fill={BIN_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #c4c5d7', fontFamily: 'Inter', fontSize: 12 }}
                      formatter={(v: number, n: string) => [`${v}%`, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="flex flex-col justify-center gap-space-sm">
                {SOH_BINS.map((b, i) => (
                  <li key={b.label} className="flex items-baseline gap-space-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: BIN_COLORS[i] }} />
                    <span className="font-body-sm text-body-sm flex-1 text-on-surface">{b.label}</span>
                    <span className="font-telemetry-sm text-telemetry-sm tnum font-semibold">
                      {b.packs.toLocaleString()}
                    </span>
                    <span className="font-telemetry-sm text-telemetry-sm tnum w-12 text-right text-on-surface-variant">
                      {b.pct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          {/* Where the assets are */}
          <Panel>
            <PanelHeader
              title="Asset Deployment"
              subtitle="Where packs in scope are currently accountable"
              action={<StatusBadge tone="info">{scoped.length} packs in scope</StatusBadge>}
            />
            <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-3">
              {[
                { icon: 'local_shipping', label: 'Fitted to vehicles', value: inVehicles },
                { icon: 'ev_station', label: 'In swap network', value: inStations },
                { icon: 'inventory_2', label: 'On depot shelf', value: scoped.length - inVehicles - inStations },
              ].map((t) => (
                <div key={t.label} className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-md">
                  <Icon name={t.icon} className="text-[20px] text-primary" />
                  <p className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">{t.value}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t.label}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Swap network — swapping-station segment only */}
          {has('swap-stations') && (
            <Panel padded={false}>
              <div className="p-space-lg pb-space-sm">
                <PanelHeader
                  title="Swap Network Summary"
                  subtitle="Station capacity and current demand"
                  action={
                    <ActionButton
                      icon="arrow_forward"
                      variant="ghost"
                      module="swap-stations"
                      requires="view"
                      size="compact"
                      onClick={() => navigate('/swap-stations')}
                    >
                      Open Swap Stations
                    </ActionButton>
                  }
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      {['Station', 'Hub', 'Bays', 'Sanctioned', 'Current Demand'].map((h) => (
                        <th
                          key={h}
                          className={`font-label-sm text-label-sm border-b border-outline-variant/40 px-space-md py-space-sm uppercase text-on-surface-variant ${
                            ['Bays', 'Sanctioned', 'Current Demand'].includes(h) ? 'text-right' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEPOTS.map((d) => (
                      <tr key={d.id} className="border-b border-surface-container-high hover:bg-surface">
                        <td className="font-body-sm text-body-sm px-space-md py-space-sm font-semibold">{d.name}</td>
                        <td className="font-body-sm text-body-sm px-space-md py-space-sm text-on-surface-variant">
                          {d.hub}
                        </td>
                        <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right">
                          {d.dcFastGuns + d.acType2Guns}
                        </td>
                        <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right">
                          {d.sanctionedKw.toLocaleString()} kW
                        </td>
                        <td className="font-telemetry-sm text-telemetry-sm tnum px-space-md py-space-sm text-right font-semibold text-primary">
                          {d.currentDemandKw.toLocaleString()} kW
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>

        <div className="flex flex-col gap-space-md">
          {/* Predictive queue */}
          <Panel>
            <PanelHeader
              title="Predictive Health Queue"
              subtitle="AI wear-triage, highest risk first"
              action={<StatusBadge tone="crit">{critical} Critical</StatusBadge>}
            />
            <ul className="space-y-space-sm">
              {PREDICTIVE_QUEUE.map((a) => (
                <li
                  key={a.batteryId}
                  className={`rounded-xl border p-space-sm ${
                    a.riskTone === 'crit' ? 'border-state-crit-border bg-state-crit-fill' : 'border-outline-variant/40'
                  }`}
                >
                  <div className="mb-space-xs flex flex-wrap items-center justify-between gap-space-xs">
                    <span className="font-telemetry-md text-telemetry-md font-semibold">{a.batteryId}</span>
                    <StatusBadge tone={a.riskTone}>{a.riskLabel}</StatusBadge>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{a.detail}</p>
                  <div className="mt-space-sm flex justify-end">
                    <ActionButton
                      size="compact"
                      module="battery"
                      requires="view"
                      onClick={() => navigate(`/battery-health/${a.batteryId}`)}
                    >
                      View Pack
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Warranty exposure — only where the module exists */}
          {has('maintenance-warranty') && (
            <Panel>
              <PanelHeader title="Warranty Exposure" subtitle="Claims actionable against OEM terms" />
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="rounded-xl bg-state-warn-fill p-space-md">
                  <p className="font-telemetry-lg text-telemetry-lg tnum font-bold text-state-warn-text">
                    {claimsDue}
                  </p>
                  <p className="font-body-sm text-body-sm text-state-warn-text">Ready to claim</p>
                </div>
                <div className="rounded-xl bg-surface-container-low p-space-md">
                  <p className="font-telemetry-lg text-telemetry-lg tnum font-bold text-on-surface">
                    {scoped.filter((b) => b.warranty === 'under-review').length}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Under review</p>
                </div>
              </div>
              <ActionButton
                icon="arrow_forward"
                variant="ghost"
                module="maintenance-warranty"
                requires="view"
                className="mt-space-sm w-full justify-center"
                onClick={() => navigate('/maintenance-warranty')}
              >
                Open Maintenance & Warranty
              </ActionButton>
            </Panel>
          )}

          {/* Book exposure — finance segment only */}
          {has('finance-leasing') && (
            <Panel>
              <PanelHeader title="Book Exposure" subtitle="Financed asset position" />
              <dl className="font-body-sm text-body-sm space-y-space-sm">
                {[
                  ['Assets financed', `${scoped.length} packs`],
                  ['Gross book value', '₹18.4 Cr'],
                  ['Residual at risk', '₹1.12 Cr'],
                  ['Overdue instalments', '34 accounts'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-space-sm">
                    <dt className="text-on-surface-variant">{label}</dt>
                    <dd className="font-telemetry-sm text-telemetry-sm font-semibold text-on-surface">{value}</dd>
                  </div>
                ))}
              </dl>
              <ActionButton
                icon="arrow_forward"
                variant="ghost"
                module="finance-leasing"
                requires="view"
                className="mt-space-sm w-full justify-center"
                onClick={() => navigate('/finance-leasing')}
              >
                Open Finance & Leasing
              </ActionButton>
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}
