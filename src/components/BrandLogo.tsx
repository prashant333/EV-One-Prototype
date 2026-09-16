/**
 * Intellicar brand lockup.
 *
 * The supplied asset (Design/Intellicar_logo.png) pairs a crimson mark with an
 * "INTELLICAR" wordmark set in #F3F4F5 — near-white, so it is built for a dark
 * ground. It is used here unmodified on an inverse-surface chip rather than
 * recoloured or cropped, which is why the logo sits on a dark plate against the
 * otherwise light shell.
 */

export const LOGO_SRC = '/intellicar-logo.png'

export function LogoMark({ className = 'h-9 w-auto' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-inverse-surface px-2 py-1.5 ${className}`}
    >
      <img
        src={LOGO_SRC}
        alt="Intellicar"
        className="h-full w-auto object-contain"
        width={527}
        height={187}
      />
    </span>
  )
}

/** Full lockup: mark plus the product wordmark, as in the delivered header design. */
export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-space-sm">
      <LogoMark className={compact ? 'h-7' : 'h-9'} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
            INTELLICAR<span className="ml-1 font-bold text-primary">ONE</span>
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Enterprise Telemetry
          </span>
        </span>
      )}
    </span>
  )
}
