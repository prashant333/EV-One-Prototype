/**
 * Provider-agnostic map.
 *
 * Renders with Leaflet and swaps the tile source based on env config, so the
 * prototype works with no credentials today and upgrades the moment a key is
 * dropped into .env.local:
 *
 *   VITE_MAP_PROVIDER=osm                        (default — no key needed)
 *   VITE_MAP_PROVIDER=mapbox
 *   VITE_MAPBOX_TOKEN=pk.eyJ1...
 *
 * Google Maps is deliberately NOT a tile-layer swap — its terms require the
 * Maps JavaScript API rather than direct tile access. See `googleNotice` below.
 */

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Vehicle } from '@/data/fleet'

type Provider = 'osm' | 'mapbox'

interface TileConfig {
  url: string
  attribution: string
  maxZoom: number
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined
const CONFIGURED = (import.meta.env.VITE_MAP_PROVIDER as string | undefined)?.toLowerCase()

/** Falls back to OSM whenever the configured provider has no usable credential. */
export function activeProvider(): Provider {
  if (CONFIGURED === 'mapbox' && MAPBOX_TOKEN) return 'mapbox'
  return 'osm'
}

function tileConfig(provider: Provider): TileConfig {
  switch (provider) {
    case 'mapbox':
      return {
        url: `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
        attribution: '© Mapbox © OpenStreetMap',
        maxZoom: 20,
      }
    case 'osm':
    default:
      return {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }
  }
}

const STATUS_COLOR: Record<Vehicle['status'], string> = {
  'on-trip': '#0037b0',
  'thermal-alert': '#e11d48',
  staging: '#64748b',
  charging: '#059669',
  offline: '#94a3b8',
}

function markerIcon(vehicle: Vehicle, selected: boolean): L.DivIcon {
  const color = STATUS_COLOR[vehicle.status]
  const size = selected ? 18 : 14
  return L.divIcon({
    className: 'intellicar-marker',
    html: `<span style="
      display:block;width:${size}px;height:${size}px;border-radius:9999px;
      background:${color};border:2.5px solid #fff;
      box-shadow:0 0 0 ${selected ? 4 : 2}px ${color}33, 0 1px 3px rgba(15,23,42,.35);
      ${vehicle.status === 'thermal-alert' ? 'animation:intellicar-pulse 1.4s ease-in-out infinite;' : ''}
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function MapView({
  vehicles,
  selectedId,
  onSelect,
  center = [12.9716, 77.5946],
  zoom = 12,
  className = '',
}: {
  vehicles: Vehicle[]
  selectedId?: string | null
  onSelect?: (vehicleId: string) => void
  center?: [number, number]
  zoom?: number
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  // Keep the latest callback without forcing the marker layer to rebuild.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // Initialise once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
      touchZoom: true,
    })

    const { url, attribution, maxZoom } = tileConfig(activeProvider())
    L.tileLayer(url, { attribution, maxZoom }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
    // center/zoom are initial values only — deliberately not reactive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync markers to the vehicle list.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const seen = new Set<string>()

    for (const vehicle of vehicles) {
      seen.add(vehicle.id)
      const existing = markersRef.current.get(vehicle.id)
      const icon = markerIcon(vehicle, vehicle.id === selectedId)

      if (existing) {
        existing.setLatLng([vehicle.position.lat, vehicle.position.lng])
        existing.setIcon(icon)
      } else {
        const marker = L.marker([vehicle.position.lat, vehicle.position.lng], {
          icon,
          title: `${vehicle.registration} · ${vehicle.id}`,
        })
          .addTo(map)
          .on('click', () => onSelectRef.current?.(vehicle.id))
        markersRef.current.set(vehicle.id, marker)
      }
    }

    // Drop markers for vehicles no longer in scope (e.g. role hub restriction).
    for (const [id, marker] of markersRef.current) {
      if (!seen.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    }
  }, [vehicles, selectedId])

  return <div ref={containerRef} className={className} />
}

/** Shown in Settings so the map provider state is visible without reading code. */
export const mapProviderStatus = {
  active: activeProvider(),
  configured: CONFIGURED ?? 'osm (default)',
  hasMapboxToken: Boolean(MAPBOX_TOKEN),
  googleNotice:
    'Google Maps requires the Maps JavaScript API rather than raw tile access. Add a key and the Google loader to enable it.',
}
