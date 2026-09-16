/**
 * An action button bound to the RBAC model.
 *
 * PRD: "Each module has View and Edit permission allowing users to do only
 * assigned activity as per the role." Any control that mutates state declares
 * the module it belongs to; if the active role only has View on that module the
 * control renders disabled, with a tooltip naming the role that blocked it.
 */

import type { ReactNode } from 'react'
import type { ModuleId } from '@/data/platform'
import { useWorkspace } from '@/state/WorkspaceContext'
import { Icon } from './primitives'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'

const VARIANTS: Record<Variant, string> = {
  // DESIGN.md "Buttons & Drill-Down Triggers"
  primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-level-1',
  secondary:
    'bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface shadow-level-1',
  ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  destructive: 'bg-state-crit text-white hover:brightness-110 shadow-level-1',
}

export function ActionButton({
  children,
  icon,
  variant = 'secondary',
  module,
  requires = 'edit',
  onClick,
  className = '',
  size = 'standard',
}: {
  children: ReactNode
  icon?: string
  variant?: Variant
  /** Module this action mutates. Omit for navigation-only controls. */
  module?: ModuleId
  requires?: 'view' | 'edit'
  onClick?: () => void
  className?: string
  size?: 'compact' | 'standard'
}) {
  const { can, role } = useWorkspace()
  const allowed = module ? can(module, requires) : true

  const height = size === 'compact' ? 'h-9' : 'h-10'

  return (
    <button
      type="button"
      onClick={allowed ? onClick : undefined}
      disabled={!allowed}
      title={
        allowed
          ? undefined
          : `${role.name} has ${requires === 'edit' ? 'view-only' : 'no'} access to this module`
      }
      aria-disabled={!allowed}
      className={`font-body-sm text-body-sm inline-flex ${height} shrink-0 items-center gap-space-xs whitespace-nowrap rounded-xl px-space-md font-semibold transition-all ${
        allowed ? VARIANTS[variant] : 'cursor-not-allowed border border-outline-variant/40 bg-surface-container text-outline'
      } ${className}`}
    >
      {icon && <Icon name={allowed ? icon : 'lock'} className="text-[18px]" />}
      {children}
    </button>
  )
}
