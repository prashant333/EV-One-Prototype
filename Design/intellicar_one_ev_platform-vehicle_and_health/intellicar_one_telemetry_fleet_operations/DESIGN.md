---
name: Intellicar One Telemetry & Fleet Operations
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#004f35'
  on-tertiary: '#ffffff'
  tertiary-container: '#006948'
  on-tertiary-container: '#76eab6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.025em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.05em
  telemetry-lg:
    fontFamily: JetBrains Mono
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.02em
  telemetry-md:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: -0.01em
  telemetry-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

The design system is engineered for mission-critical electric vehicle (EV) fleet orchestration, battery swap network management, and real-time OEM telemetry. It embodies precision, technical competence, and uncompromising operational clarity. 

The aesthetic is **Corporate / Modern High-Density Engineering**:
- Crisp, clinical, and data-dense without visual friction or cognitive fatigue.
- Optimized for continuous monitoring in network operation centers (NOCs), field engineering consoles, and executive telemetry dashboards.
- Visual hierarchy prioritizes scanability, rapid anomaly detection, and predictable interaction models over decorative embellishments.
- Tactile reassurance is delivered through crisp micro-borders, quiet structural elevations, and distinct operational chromatic indicators.

## Colors

The system uses a calibrated cool-slate architecture designed for high ambient light visibility and relentless 24/7 monitoring.

### Core Canvas & Structure
- **App Canvas (Background):** `#F8FAFC` (Slate-50) creates an eye-resting base that separates working containers from background space.
- **Card & Panel Surface:** `#FFFFFF` pure white ensures maximum contrast for live metrics, graphs, and tabular logs.
- **Subtle Layering Surface:** `#F1F5F9` (Slate-100) used for secondary side panels, table headers, and nested telemetry blocks.
- **Structural Borders:** `#E2E8F0` (Slate-200) for standard layout divisions; `#CBD5E1` (Slate-300) for active borders and subtle divider accents.

### Interactive Primaries
- **Primary Brand / Action:** `#1D4ED8` (Cobalt 700) for default interactive states; `#2563EB` (Cobalt 600) for hover states; `#1E40AF` for pressed/selected tabs.
- **Engineering / Advanced Telemetry Accent:** `#4F46E5` (Indigo 600) for specialized OEM diagnostic tools, firmware payload traces, and deep-inspection triggers.

### Operational State Accents
State colors follow strict industrial semantics:
- **Operational / Optimal:** `#059669` (Emerald 600) / `#10B981` (Emerald 500) with `#ECFDF5` fill for regular state badges, fully charged battery indicators, and healthy CAN bus connections.
- **Warning / Degradation:** `#D97706` (Amber 600) / `#F59E0B` (Amber 500) with `#FFFBEB` fill for thermal anomalies, low State of Health (SoH), or queue congestion at swap stations.
- **Critical Alert / Emergency:** `#E11D48` (Rose 600) / `#EF4444` (Red 500) with `#FFF1F2` fill for active thermal runaways, hardware faults, disconnected trackers, and geo-fence breaches.
- **Offline / Inactive:** `#64748B` (Slate 500) with `#F1F5F9` fill for disconnected packs, decommissioned chassis, or idle charging bays.

### Typography Hierarchy
- **Base Text Primary:** `#0F172A` (Slate-900) ensures extreme crispness and reading precision.
- **Base Text Secondary:** `#475569` (Slate-600) for supportive labels, metric dimensions, and secondary descriptors.
- **Muted / Placeholder:** `#94A3B8` (Slate-400) for disabled states, inactive tracks, and empty fields.

## Typography

Typography in this design system must support dense data rendering without jumping or horizontal shifting.

- **Proportional Text:** `Inter` handles all navigation, dashboard titles, form fields, and standard body text. It provides neutral, clean, highly-legible character rendering at small scales (11px to 14px).
- **Tabular Figures & Telemetry Data:** `JetBrains Mono` or tabular figures (`tnum`, `cv01`) in `Inter` are strictly mandated for CAN bus signals, voltage ratings, battery temperatures, VIN numbers, latitude/longitude coordinates, and speed values. This guarantees numbers stack identically in vertical grids.
- **Casing Rules:** Metadata headers, column sorting tags, and battery state labels must be set in uppercase via `label-sm` or `label-md` with slight positive letter spacing (`0.025em` to `0.05em`) to balance legibility across high-density layouts.

## Layout & Spacing

The layout is built around a rigorous 4px base increment to support rich multi-column telemetry arrays.

### Grid Philosophy
- **Fluid Multi-Pane Grid:** Standard desktop view uses a 12-column responsive fluid grid. 
- **Telemetry Shell Architecture:** Standard layout uses a fixed 64px collapsible navigation rail, a flexible 280px-360px filter/list secondary rail, and an expansive flex canvas hosting primary telemetry cards, maps, or data-tables.
- **Density Control:** Data density is king. Standard component inner spacing leverages `space-sm` (8px) and `space-md` (12px), avoiding oversized white gaps that force telemetry out of the primary viewport.

### Responsive Breakpoints & Adaptations
- **Desktop (>= 1280px):** 12 columns, `1.5rem` outer margin, `1.5rem` gutters. Accommodates simultaneous split map, telemetry graph, and live log stream.
- **Tablet / Operational Console (768px - 1279px):** 8 columns, `1rem` outer margin, `1rem` gutters. Filters collapse into modal drawers or secondary sheets; telemetry graphs stack vertically above data tables.
- **Field Mobile (< 768px):** 4 columns, `1rem` outer margin, `0.75rem` gutters. Map transitions to full viewport with bottom-sheet metric cards; high-level KPI cards collapse to horizontal swipe reels.

## Elevation & Depth

Visual hierarchy relies on structural containment using flat borders and ultra-subtle ambient micro-shadows rather than heavy skeuomorphic drop shadows.

- **Level 0 (App Canvas):** `#F8FAFC`. Zero elevation, non-interactive ground plane.
- **Level 1 (Card & Module Surface):** `#FFFFFF` with a 1px solid border `#E2E8F0` and micro-shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`. Used for grid cards, table wrappers, and operational summary panels.
- **Level 2 (Active / Hover / Filter Bars):** `#FFFFFF` with a 1px solid border `#CBD5E1` and light shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`. Used for active map popups, elevated table row selections, and sticky filter bars.
- **Level 3 (Overlays & Flyout Panels):** `#FFFFFF` with border `#CBD5E1` and distinct directional shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`. Used for telemetry drill-down side sheets, command menus, and diagnostic tooltips.
- **Level 4 (Critical Modals & Emergency Overrides):** Heavy shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)` combined with a 20% `#0F172A` backdrop blur. Used for battery cutoff commands and remote immobilizations.

## Shapes

The design system maintains a calibrated, technical shape language prioritizing precision and modularity.

- **Corner Radius Level 1 (Soft):**
  - Standard components (Buttons, Input Fields, Metric Cards, Segmented Tabs): `6px` (`0.375rem`) to `8px` (`0.5rem`). This strikes an intentional balance between industrial rigidity and clean modern SaaS aesthetics.
  - Micro-components (Pills, Status Dots, Counter Badges, Tags): `4px` (`0.25rem`) or fully circular for dedicated state indicators (`rounded-full`).
  - Large Surface Containers (Modal sheets, persistent panels): `8px` (`0.5rem`).
- **Border Enforcements:** Avoid borderless floating white containers. All cards, dropdowns, and modules must have explicit `1px` borders in `#E2E8F0` to preserve panel definition over variable dashboard layouts.

## Components

### Buttons & Drill-Down Triggers
- **Primary Action:** Solid `#1D4ED8`, white text, `6px` radius, height `36px` (compact) or `40px` (standard), text `Inter` semi-bold 14px. Hover: `#2563EB`. Active: `#1E40AF`.
- **Secondary Action:** Pure white background, `1px` solid `#CBD5E1`, text `#0F172A`. Hover: `#F8FAFC` background with `#0F172A` border.
- **Contextual Drill-Down Button:** Ghost button with trailing micro-arrow icon, slate-700 text, 12px height padding. Hover: subtle `#F1F5F9` background fill.
- **Destructive Action (Remote Kill / Disconnect):** Rose outline `#E11D48` or solid rose fill `#E11D48` requiring two-factor modal confirmation.

### Status Badges & Operational Indicators
- **Architecture:** `6px` border radius, padding `2px 8px`, `JetBrains Mono` or `Inter` 11px uppercase weight 600.
- **Operational Green:** Background `#ECFDF5`, text `#065F46`, border `1px solid #A7F3D0`. Prefixed by a pulsing green `6px` dot when receiving live telemetry packets.
- **Warning Amber:** Background `#FFFBEB`, text `#92400E`, border `1px solid #FDE68A`.
- **Alert Rose:** Background `#FFF1F2`, text `#9F1239`, border `1px solid #FECDD3`.
- **Inactive / Muted Slate:** Background `#F8FAFC`, text `#475569`, border `1px solid #E2E8F0`.

### Data Tables & Telemetry Logs
- **Header:** Height `36px`, background `#F8FAFC`, bottom border `1px solid #E2E8F0`, typography `label-sm` uppercase `#475569`.
- **Rows:** Height `44px` (dense) or `52px` (standard), white background, alternating zebra stripes are prohibited—use subtle hover state `#F8FAFC` and bottom border `1px solid #F1F5F9`.
- **Telemetry Cells:** Numeric entries (SoC %, Temperature °C, Voltage V, Range km) must be right-aligned with fixed tabular figures.

### Form Inputs & Filter Bars
- **Filter Bar Container:** Integrated inline above telemetry lists, height `48px`, `#FFFFFF` surface with `1px solid #E2E8F0`, zero horizontal margins relative to table boundaries.
- **Search & Text Input:** Height `36px`, border `1px solid #CBD5E1`, background `#FFFFFF`, font size 14px. Focus state: `2px` ring of `#1D4ED8` with `0` offset.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** `16px x 16px`, `4px` border radius, `#CBD5E1` border. Checked state: `#1D4ED8` background with crisp white check icon.
- **Radio Buttons:** `16px x 16px`, circular, `#CBD5E1` border. Checked state: white center with `#1D4ED8` ring.

### Domain-Specific Components
- **Battery Health Gauge (SoH / SoC):** Segmented bar with discrete cell markers or linear bar with integrated state coloring (0-15% Rose, 16-35% Amber, 36-100% Emerald).
- **Swap Bay Matrix:** Miniature visual matrix showing bay availability, robotic gripper state, and battery readiness counters with live status rings.
- **CAN Signal Sparkline:** Micro-charts (120px x 24px) rendered inline within table cells displaying voltage stability over the last 15 minutes.