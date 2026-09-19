# Intellicar One — interactive prototype

A clickable web prototype of the Intellicar One unified platform, built against
`PRD/Intellicar Unified Platform.pdf` and the design system in `Design/`.

The prototype's job is to make the PRD's central claim tangible:

> One deployment + one core platform + modular capabilities + 2 experience clusters.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` type-checks and produces a static bundle in `dist/`.

## What to click

The prototype is built around three switchers that change real behaviour, not
just labels:

1. **Workspace switcher** (top bar, next to the logo) — switch between B2B Fleet,
   Last-Mile Mobility and Vehicle OEM. The navigation rail, the KPI strip and the
   dashboard panels all change, because the PRD's module matrix withholds
   Geofencing, Routes/Trips and Hubs from Vehicle OEM.

   The **Assets & Finance** workspace is live: switching to a Cluster 2 segment
   swaps the entire rail (Battery Health, Battery Lifecycle, Swap Stations…),
   changes the dashboard, and moves you to that cluster's default role, since a
   fleet role carries no permissions there.

2. **Role switcher** (top bar, far right) — switch between Org Admin, Operations
   Lead, Hub Supervisor, Maintenance Technician and Read-only Auditor. Modules
   disappear from the rail, view-only modules get an eye icon, and every Edit
   action disables with a tooltip naming the blocking role. *Hub Supervisor* also
   demonstrates the PRD's per-asset scoping: the vehicle list shrinks to two hubs.

3. **Customize KPIs** (dashboard) — 5 of 16 metrics are displayed. Swap them.
   Changing segment restores that segment's defaults.

**Organization & Settings** has two tabs: a permission-by-role matrix, and a user
directory where each person's asset grant is editable.

The PRD publishes a module matrix for Cluster 1 only (page 4). Cluster 2's gating
is a working proposal, documented inline in `platform.ts` above the module list.

## Architecture

```
src/
  data/          The "database" — no DB is connected, all data is at code level
    platform.ts    Clusters, segments, modules, and the PRD module matrix
    roles.ts       RBAC: per-module View/Edit + per-asset scoping
    fleet.ts       Vehicles, drivers, trips, hubs, alerts, chart series
    health.ts      Health KPIs, FOTA rollout, per-vehicle detail records
    charging.ts    Depots, charging sessions, depot power curve, port mix
    batteries.ts   Battery portfolio, SoH distribution, pack detail (Cluster 2)
    users.ts       Organisation user directory and per-user asset grants
    driverAnalytics.ts  Per-driver scorecards, coaching queue, tier bands
    kpis.ts        16-metric catalogue + per-segment defaults
  state/
    WorkspaceContext.tsx   Active segment + role; derives visible modules
  layout/        AppShell, TopBar (switchers), Sidebar (computed nav)
  components/    Primitives, KPI strip, RBAC-gated ActionButton, MapView
  modules/       One folder per platform module
```

Two rules keep the prototype honest:

- **Navigation is computed, never written down.** A module appears in the rail
  only if the active segment grants it *and* the active role can view it. Adding
  a row to the matrix in `platform.ts` changes the UI with no other edits.
- **Every mutating control declares its module.** `ActionButton` takes a
  `module` prop and resolves its own enabled state from the active role, so
  permissions can't drift out of sync with the UI.

## Screens

| Module | State |
|---|---|
| Dashboard | Built to the delivered design |
| Schedule and Trips | Built to the delivered design |
| Vehicles and Health | Built to the delivered design (roster + detail, 5 tabs) |
| Charging Sessions | Built to the delivered design (+ inspector sheet, remote-charge modal) |
| Driver Analytics | Built to the delivered design (roster + selected-driver panel) |
| Organization & Settings | Built (roles matrix + users directory) |
| All other Cluster 1 modules | Routable stubs marked *Design Pending* |

### Cluster 2 — Assets & Finance

| Module | State |
|---|---|
| Dashboard (Assets & Finance) | Built (no design supplied — composed from the design system) |
| Battery Health | Built to the delivered design (portfolio + pack detail) |
| All other Cluster 2 modules | Routable stubs marked *Design Pending* |

**Vehicles and Health** is the one two-page module: `/vehicles-health` is the
fleet roster and `/vehicles-health/:vehicleId` the individual record. Clicking a
row or its **360 Health** button opens the detail page, which carries five
populated tabs — Health & Diagnostics, Trip History, Charging History, Driver
Assignment & Score, and Maintenance & Service.

Its "Digital Twin Snapshot" is a drawn SVG rather than the photo in the design
file: the source was a generated `googleusercontent` asset that would expire.
The same applies to the bay-rotation card on Charging Sessions.

**Hubs vs Depots.** A Hub is an operational base — geofence, dispatch, driver
roster. A Depot is charging infrastructure sited at one. The four hubs
(Koramangala, Peenya Corridor, Airport Arterial, Whitefield Ring) are unchanged;
`charging.ts` adds four depots on top of them.

Stubs are deliberate. Route, nav entry, segment gating and permission state are
already wired for every module; only the visual design is pending. As each design
arrives, drop it into `src/modules/<module>/` and register it in
`DESIGNED_SCREENS` in `src/App.tsx`.

## Maps

The map is provider-agnostic. With no configuration it renders free
OpenStreetMap tiles, so nothing is blocked on a credential. Drop a Mapbox token
into `.env.local` (see `.env.example`) to upgrade the basemap. The active
provider is shown on the Settings screen.

## Branding

`public/intellicar-logo.png` is the supplied brand asset, copied unmodified from
`Design/Intellicar_logo.png`. Its "INTELLICAR" wordmark is set in `#F3F4F5` —
near-white — so the logo is built for a dark ground and would be invisible on
this shell's light surfaces. [BrandLogo.tsx](src/components/BrandLogo.tsx)
therefore places it on an `inverse-surface` chip rather than recolouring or
cropping it. One component, used by the top bar; change it there and every
instance follows.

`public/favicon.png` is derived from the same asset — the logo centred on a
256×256 `#283044` square, since the source is 2.8:1 and would be squashed as a
favicon.

## Design system

Tokens in `tailwind.config.js` are lifted verbatim from `DESIGN.md` and the
delivered `code.html` — same palette, type scale, spacing and elevation levels.
Telemetry numerals use JetBrains Mono with tabular figures, as the design system
mandates.
