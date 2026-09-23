const bmLogo = `${import.meta.env.BASE_URL}imgs/bm-logo.png`

interface Props {
  title: string
  onBack?: () => void
  backLabel?: string
  action?: React.ReactNode
  showLogo?: boolean
}

/**
 * Unified mobile header: [Back?] | Logo? | Title | [Action?]
 * Max 3 visual groups, no redundant branding, RTL.
 */
export default function MobileHeader({
  title,
  onBack,
  backLabel = 'بازگشت',
  action,
  showLogo = false,
}: Props) {
  return (
    <div
      className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: '1px solid #1e1e22', background: 'rgba(13,13,15,0.95)', backdropFilter: 'blur(12px)' }}
      dir="rtl"
    >
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          aria-label={backLabel}
          className="btn-game flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: '#1a1a1c', border: '1px solid #2e2e32', color: '#9a9b9e' }}
        >
          →
        </button>
      )}

      {/* Subtle logo (optional) */}
      {showLogo && (
        <img src={bmLogo} alt="" className="h-5 object-contain opacity-50 flex-shrink-0" />
      )}

      {/* Page title */}
      <h1 className="flex-1 font-display font-black text-white text-base leading-tight truncate">
        {title}
      </h1>

      {/* Optional action slot */}
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
