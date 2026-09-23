import { PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'

interface Props {
  avatar: string
  colorIndex: number
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  isActive?: boolean
  rank?: number
}

const sizes = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-4xl',
  xl: 'w-28 h-28 text-6xl',
}

export default function PlayerAvatar({ avatar, colorIndex, name, size = 'md', showName, isActive, rank }: Props) {
  const color = PLAYER_COLORS[colorIndex % PLAYER_COLORS.length]
  const sz = sizes[size]

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sz} rounded-full flex items-center justify-center relative transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
        style={{
          background: `radial-gradient(circle at 35% 35%, ${color.light}33, ${color.bg}88)`,
          border: `2px solid ${color.bg}`,
          boxShadow: isActive ? `0 0 20px ${color.bg}` : `0 0 8px ${color.bg}44`,
        }}
      >
        <img src={avatarSrc(avatar)} alt="" className="w-full h-full object-cover rounded-full" />
        {rank && rank <= 3 && (
          <span className="absolute -top-1 -left-1 text-sm">
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </span>
        )}
      </div>
      {showName && name && (
        <span className="text-sm font-bold" style={{ color: color.light }}>{name}</span>
      )}
    </div>
  )
}
