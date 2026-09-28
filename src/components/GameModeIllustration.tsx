import onlineImg from '@/assets/modes/game-mode-online-multiplayer.png'
import localImg  from '@/assets/modes/game-mode-local-single-device.png'
import cpuImg    from '@/assets/modes/game-mode-single-player-cpu.png'

export type GameMode =
  | 'ONLINE_MULTIPLAYER'
  | 'LOCAL_SINGLE_DEVICE'
  | 'SINGLE_PLAYER_CPU'

export type PrimaryModeKey = 'online_group' | 'local_device' | 'solo_cpu'

const ASSET_MAP: Record<GameMode, string> = {
  ONLINE_MULTIPLAYER:  onlineImg,
  LOCAL_SINGLE_DEVICE: localImg,
  SINGLE_PLAYER_CPU:   cpuImg,
}

export const PRIMARY_MODE_TO_GAME_MODE: Record<PrimaryModeKey, GameMode> = {
  online_group:  'ONLINE_MULTIPLAYER',
  local_device:  'LOCAL_SINGLE_DEVICE',
  solo_cpu:      'SINGLE_PLAYER_CPU',
}

export const GAME_MODE_LABEL: Record<GameMode, string> = {
  ONLINE_MULTIPLAYER:  'بازی آنلاین گروهی',
  LOCAL_SINGLE_DEVICE: 'بازی محلی با یک دستگاه',
  SINGLE_PLAYER_CPU:   'بازی انفرادی با CPU',
}

interface Props {
  mode: GameMode
  size?: number | string
  className?: string
  style?: React.CSSProperties
  alt?: string
}

export default function GameModeIllustration({ mode, size = 80, className, style, alt }: Props) {
  const src = ASSET_MAP[mode]
  const label = alt ?? GAME_MODE_LABEL[mode]
  const dim = typeof size === 'number' ? size : undefined
  return (
    <img
      src={src}
      alt={label}
      width={dim}
      height={dim}
      className={className}
      style={{
        width: typeof size === 'number' ? size : size,
        height: typeof size === 'number' ? size : size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
      loading="lazy"
      decoding="async"
    />
  )
}
