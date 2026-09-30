import { useEffect, useRef, useState } from 'react'
import heroVideo from '../assets/hero-game.mp4'

declare const __APP_VERSION__: string

interface Props {
  onDone: () => void
}

export default function SplashScreen({ onDone }: Props) {
  const [phase, setPhase]       = useState<'in' | 'hold' | 'out'>('in')
  const [ready, setReady]       = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const exitingRef              = useRef(false)
  const base                    = import.meta.env.BASE_URL
  const heroBg                  = `${base}imgs/Bg.jpg`

  function exit() {
    if (exitingRef.current || !ready) return
    exitingRef.current = true
    setPhase('out')
    setTimeout(onDone, 550)
  }

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setReady(true), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const fading = phase === 'out'

  return (
    /*
     * Root: opacity only at 1 (no compositing during playback).
     * Fade-out is handled on root only at exit time.
     * NO filter, NO transform, NO backdropFilter on root.
     */
    <div
      dir="rtl"
      onClick={exit}
      onTouchStart={exit}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#050304',
        display: 'flex', flexDirection: 'column',
        transition: 'opacity 0.55s ease',
        opacity: fading ? 0 : 1,
        cursor: ready ? 'pointer' : 'default',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Layer 1: Fallback image — hidden once video is ready ── */}
      <img
        src={heroBg} alt="" aria-hidden
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'top',
          // Hide completely once video starts playing — no compositing on top of video
          opacity: videoReady ? 0 : 1,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
        }}
      />

      {/* ── Layer 2: Video — NO opacity, NO filter, NO transform ──
          Hardware-decoded directly. The darkening is handled by the
          overlay below, NOT by reducing video opacity.                */}
      <video
        src={heroVideo}
        autoPlay muted loop playsInline
        onCanPlay={() => setVideoReady(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          // opacity MUST be 1 — any value < 1 forces rasterization
          opacity: 1,
        }}
      />

      {/* ── Layer 3: Dark cinematic gradient overlay ──
          Separate div, not on the video itself.
          NO backdropFilter (would rasterize video behind it).         */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          // Darken top and bottom; leave mid-screen relatively bright
          background: 'linear-gradient(to bottom, rgba(5,3,4,0.50) 0%, rgba(5,3,4,0.15) 35%, rgba(5,3,4,0.20) 55%, rgba(5,3,4,0.88) 100%)',
        }}
      />

      {/* ── Layer 4: Bottom content panel ──
          Uses solid semi-transparent background instead of backdropFilter.
          backdropFilter on any element rasterizes all siblings below it,
          collapsing the video into a bitmap and destroying sharpness.  */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '28px 28px 44px',
          // Solid dark tint — NO backdropFilter / blur
          background: 'rgba(5, 3, 4, 0.72)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10,
          transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s ease',
          transform: phase === 'in' ? 'translateY(18px)' : 'translateY(0)',
          opacity: phase === 'in' ? 0 : 1,
        }}
      >
        {/* Title */}
        <h1 style={{
          color: '#fff',
          fontSize: 'clamp(1.7rem, 7.5vw, 2.6rem)',
          fontWeight: 900,
          letterSpacing: '-0.01em',
          textShadow: '0 2px 16px rgba(204,34,41,0.55)',
          margin: 0, textAlign: 'center',
          lineHeight: 1.2,
        }}>
          میدان هم‌تیمی‌ها
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.52)',
          fontSize: 13, fontWeight: 500,
          letterSpacing: '0.04em', margin: 0, textAlign: 'center',
        }}>
          بازی‌های گروهی ویژه تیم بهسازان ملت
        </p>

        {/* Tap hint / loading dots */}
        <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
          {!ready ? (
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#CC2229',
                  animation: `splash-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          ) : (
            <p style={{
              color: 'rgba(255,255,255,0.80)',
              fontSize: 13, fontWeight: 700,
              letterSpacing: '0.05em', margin: 0,
              animation: 'splash-pulse 1.6s ease-in-out infinite',
            }}>
              برای ورود لمس کن
            </p>
          )}
        </div>

        {/* Version */}
        <p style={{
          color: 'rgba(255,255,255,0.22)',
          fontSize: 10.5, fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.07em', margin: 0,
        }}>
          v{__APP_VERSION__}
        </p>
      </div>

      <style>{`
        @keyframes splash-dot {
          0%, 60%, 100% { opacity: 0.25; transform: scale(0.85); }
          30%            { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
