import { useState } from 'react'
import { adminLogin } from '../../lib/adminAuth'
import bmLogo from '../../imports/03-BMC-Right_FA-EN_1.png'

interface Props { onSuccess: () => void; onClose: () => void }

export default function AdminLogin({ onSuccess, onClose }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const locked = attempts >= 5

  async function handleLogin() {
    if (locked || loading || !username.trim() || !password) return
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 700))
    const ok = adminLogin(username.trim(), password)
    setLoading(false)
    if (ok) {
      onSuccess()
    } else {
      setAttempts(a => a + 1)
      setError('نام کاربری یا کلمه عبور صحیح نیست.')
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }} dir="rtl">
      <div className="glass-panel rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 animate-pop-in"
        style={{ border: '1.5px solid #2e2e32', background: '#14141500' }}>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#CC222918', border: '1.5px solid #CC222944' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CC2229" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="font-black text-white text-base">ورود مدیر</h2>
            <p className="text-xs" style={{ color: '#6D6E71' }}>دسترسی به پنل مدیریت</p>
          </div>
          <img src={bmLogo} alt="" className="h-6 object-contain opacity-60" />
        </div>

        <div className="w-full h-px" style={{ background: '#2e2e32' }} />

        {locked ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🔒</div>
            <p className="font-bold text-white text-sm">دسترسی موقتاً قفل شد</p>
            <p className="text-xs mt-1" style={{ color: '#6D6E71' }}>لطفاً کمی صبر کنید و دوباره امتحان کنید.</p>
          </div>
        ) : (
          <>
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: '#6D6E71' }}>نام کاربری</label>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="نام کاربری را وارد کنید"
                dir="ltr"
                autoComplete="username"
                className="w-full rounded-xl px-4 py-3 text-white outline-none text-sm"
                style={{ background: '#1e1e20', border: `1.5px solid ${error ? '#CC2229' : '#2e2e32'}` }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold" style={{ color: '#6D6E71' }}>کلمه عبور</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3 text-white outline-none text-sm"
                  style={{ background: '#1e1e20', border: `1.5px solid ${error ? '#CC2229' : '#2e2e32'}`, paddingLeft: 40 }}
                />
                <button onClick={() => setShowPass(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 btn-game text-xs"
                  style={{ color: '#6D6E71' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-center animate-slide-up" style={{ color: '#e84249' }}>{error}</p>
            )}
          </>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="btn-game flex-1 py-3 rounded-2xl text-sm font-bold"
            style={{ background: '#1e1e20', border: '1.5px solid #2e2e32', color: '#6D6E71' }}>
            بازگشت
          </button>
          {!locked && (
            <button onClick={handleLogin}
              disabled={loading || !username.trim() || !password}
              className="btn-game flex-[2] py-3 rounded-2xl text-sm font-black text-white disabled:opacity-35"
              style={{ background: loading ? '#2a2a2c' : 'linear-gradient(135deg,#CC2229,#e84249)' }}>
              {loading ? '⏳ در حال ورود...' : 'ورود به پنل مدیریت'}
            </button>
          )}
        </div>

        <p className="text-center text-xs" style={{ color: '#3e3e42' }}>
          {5 - attempts} تلاش باقی‌مانده
        </p>
      </div>
    </div>
  )
}
