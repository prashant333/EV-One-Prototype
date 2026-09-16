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
import { VehiclesTripsPage } from '@/modules/vehicles-trips/VehiclesTripsPage'
import { SettingsPage } from '@/modules/settings/SettingsPage'
import { VehicleHealthPage } from '@/modules/vehicles-health/VehicleHealthPage'
import { VehicleHealthDetailPage } from '@/modules/vehicles-health/VehicleHealthDetailPage'
import { ChargingSessionsPage } from '@/modules/charging-sessions/ChargingSessionsPage'
import { DriverAnalyticsPage } from '@/modules/driver-analytics/DriverAnalyticsPage'
import { ModuleStub } from '@/modules/ModuleStub'
import { MODULES } from '@/data/platform'

/** Modules with a delivered design. Add an entry here as each design lands. */
const DESIGNED_SCREENS: Partial<Record<string, JSX.Element>> = {
  dashboard: <DashboardPage />,
  'vehicles-trips': <VehiclesTripsPage />,
  'vehicle-telemetry': <VehicleHealthPage />,
  'charging-sessions': <ChargingSessionsPage />,
  'driver-analytics': <DriverAnalyticsPage />,
  'organization-settings': <SettingsPage />,
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
            element={DESIGNED_SCREENS[module.id] ?? <ModuleStub moduleId={module.id} />}
          />
        ))}

        {/* Drill-down routes that sit under a module rather than replacing it. */}
        <Route path="/vehicles-health/:vehicleId" element={<VehicleHealthDetailPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
