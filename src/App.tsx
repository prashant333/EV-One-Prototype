/**
 * Routing.
 *
 * Every module in the platform registry gets a route, so the whole information
 * architecture is clickable. Modules with a delivered design render their real
 * screen; the rest render ModuleStub until their design arrives.
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/layout/AppShell'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { AssetsFinanceDashboard } from '@/modules/dashboard/AssetsFinanceDashboard'
import { VehiclesTripsPage } from '@/modules/vehicles-trips/VehiclesTripsPage'
import { SettingsPage } from '@/modules/settings/SettingsPage'
import { VehicleHealthPage } from '@/modules/vehicles-health/VehicleHealthPage'
import { VehicleHealthDetailPage } from '@/modules/vehicles-health/VehicleHealthDetailPage'
import { ChargingSessionsPage } from '@/modules/charging-sessions/ChargingSessionsPage'
import { DriverAnalyticsPage } from '@/modules/driver-analytics/DriverAnalyticsPage'
import { BatteryHealthPage } from '@/modules/battery-health/BatteryHealthPage'
import { BatteryDetailPage } from '@/modules/battery-health/BatteryDetailPage'
import { ModuleStub } from '@/modules/ModuleStub'
import { MODULES } from '@/data/platform'
import { useWorkspace } from '@/state/WorkspaceContext'

/** Modules with a delivered design. Add an entry here as each design lands. */
const DESIGNED_SCREENS: Partial<Record<string, JSX.Element>> = {
  'vehicles-trips': <VehiclesTripsPage />,
  'vehicle-telemetry': <VehicleHealthPage />,
  'charging-sessions': <ChargingSessionsPage />,
  'driver-analytics': <DriverAnalyticsPage />,
  battery: <BatteryHealthPage />,
  'organization-settings': <SettingsPage />,
}

/**
 * The dashboard is the one route whose screen depends on the active workspace:
 * a Battery OEM tenant should not land on fleet trip KPIs.
 */
function DashboardRoute() {
  const { clusterId } = useWorkspace()
  return clusterId === 'asset-finance' ? <AssetsFinanceDashboard /> : <DashboardPage />
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {MODULES.map((module) => (
          <Route
            key={module.id}
            path={module.route}
            element={
              module.id === 'dashboard' ? (
                <DashboardRoute />
              ) : (
                (DESIGNED_SCREENS[module.id] ?? <ModuleStub moduleId={module.id} />)
              )
            }
          />
        ))}

        {/* Drill-down routes that sit under a module rather than replacing it. */}
        <Route path="/vehicles-health/:vehicleId" element={<VehicleHealthDetailPage />} />
        <Route path="/battery-health/:batteryId" element={<BatteryDetailPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
