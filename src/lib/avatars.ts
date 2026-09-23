/* Avatar images — order matches CHARS in Home.tsx (charIdx 0‑9) */
import char0  from '../imports/image-29.png'
import char1  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_2.png'
import char2  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_3.png'
import char3  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_4.png'
import char4  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_5.png'
import char5  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_6.png'
import char6  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_7.png'
import char7  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_8.png'
import char8  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_9.png'
import char9  from '../imports/ee103b69-ccc5-42ea-91da-aae0827e4549_10.png'
import aiAvatar from '../imports/ai-avatar.png'

export const AVATAR_IMGS = [char0, char1, char2, char3, char4, char5, char6, char7, char8, char9, aiAvatar]

export const AVATAR_NAMES = ['ملکه', 'نگهبان', 'ساحره', 'پزشک', 'شوالیه', 'شمشیرباز', 'قهرمان', 'جادوگر', 'پادشاه', 'سرباز', 'هوش‌مصنوعی']

export function avatarSrc(av: string): string {
  const idx = parseInt(av, 10)
  return AVATAR_IMGS[idx] ?? AVATAR_IMGS[0]
}
