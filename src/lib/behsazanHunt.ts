// ─── BEHSAZAN HUNT — BUILDING DATABASE & CLUE ENGINE ──────────────────────────
// All facts sourced ONLY from verified spec. Do not invent building information.

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
export type BuildingId = 'eram' | 'shamsayi' | 'mozhegan'

export interface Location {
  id: string
  buildingId: BuildingId
  floor: number          // 0 = ground, negative = parking/underground, 99 = rooftop
  unit: string           // unit name / description
  locationType: string   // e.g. "office", "restroom", "meeting", "food", "prayer"
  name: string           // Persian display name
  description: string
  rarity: Rarity
  funFact?: string
  active: boolean
  clues: Clue[]
}

export interface Clue {
  id: string
  text: string           // Persian clue text
  level: number          // 1 = hardest/first, higher = more revealing
  category: 'building' | 'floor' | 'unit-count' | 'structural' | 'function' | 'location' | 'count' | 'memory'
}

export interface Building {
  id: BuildingId
  name: string
  address: string
  undergroundFloors: number
  officeFloors: number
  hasRooftop: boolean
  rooftopDescription?: string
  unitsPerFloor: number   // dominant unit count
  specialFacts: string[]
  locations: Location[]
}

// ─── VERIFIED BUILDING DATA ───────────────────────────────────────────────────

export const BUILDINGS: Building[] = [
  {
    id: 'eram',
    name: 'ارم',
    address: 'خیابان دولت',
    undergroundFloors: 2,
    officeFloors: 5,
    hasRooftop: true,
    rooftopDescription: 'رستوران / فضای غذا',
    unitsPerFloor: 1,
    specialFacts: ['هر طبقه فقط یک واحد دارد', '۲ طبقه پارکینگ زیرزمینی', '۵ طبقه اداری'],
    locations: [
      {
        id: 'eram-f1-unit1', buildingId: 'eram', floor: 1,
        unit: 'واحد اداری', locationType: 'office',
        name: 'واحد طبقه اول — ارم',
        description: 'تنها واحد اداری در طبقه اول ساختمان ارم',
        rarity: 'common', active: true,
        clues: [
          { id: 'e-f1-c1', level: 1, category: 'unit-count', text: 'در این ساختمان، هر طبقه فقط یک واحد دارد.' },
          { id: 'e-f1-c2', level: 2, category: 'building', text: 'ساختمان در خیابان دولت واقع شده است.' },
          { id: 'e-f1-c3', level: 3, category: 'floor', text: 'این مکان در پایین‌ترین طبقه اداری قرار دارد.' },
          { id: 'e-f1-c4', level: 4, category: 'structural', text: 'طبقه‌ای که یک واحد دارد و اولین طبقه اداری است.' },
        ],
      },
      {
        id: 'eram-f2-unit1', buildingId: 'eram', floor: 2,
        unit: 'واحد اداری', locationType: 'office',
        name: 'واحد طبقه دوم — ارم',
        description: 'تنها واحد اداری در طبقه دوم ساختمان ارم',
        rarity: 'common', active: true,
        clues: [
          { id: 'e-f2-c1', level: 1, category: 'unit-count', text: 'در این ساختمان، هر طبقه فقط یک واحد دارد.' },
          { id: 'e-f2-c2', level: 2, category: 'building', text: 'ساختمان ۵ طبقه اداری و یک بام دارد.' },
          { id: 'e-f2-c3', level: 3, category: 'floor', text: 'طبقه موردنظر زوج است.' },
          { id: 'e-f2-c4', level: 4, category: 'structural', text: 'دومین طبقه اداری — فضایی خلوت با یک واحد.' },
        ],
      },
      {
        id: 'eram-f3-unit1', buildingId: 'eram', floor: 3,
        unit: 'واحد اداری', locationType: 'office',
        name: 'واحد طبقه سوم — ارم',
        description: 'تنها واحد اداری در طبقه سوم ساختمان ارم',
        rarity: 'rare', active: true,
        clues: [
          { id: 'e-f3-c1', level: 1, category: 'unit-count', text: 'در این ساختمان، هر طبقه فقط یک واحد دارد.' },
          { id: 'e-f3-c2', level: 2, category: 'floor', text: 'طبقه موردنظر فرد است.' },
          { id: 'e-f3-c3', level: 3, category: 'structural', text: 'میان طبقات اداری — نه اول، نه آخر.' },
          { id: 'e-f3-c4', level: 4, category: 'floor', text: 'سومین طبقه در ساختمانی با ۵ طبقه اداری.' },
        ],
      },
      {
        id: 'eram-f4-unit1', buildingId: 'eram', floor: 4,
        unit: 'واحد اداری', locationType: 'office',
        name: 'واحد طبقه چهارم — ارم',
        description: 'تنها واحد اداری در طبقه چهارم ساختمان ارم',
        rarity: 'rare', active: true,
        clues: [
          { id: 'e-f4-c1', level: 1, category: 'unit-count', text: 'در این ساختمان، هر طبقه فقط یک واحد دارد.' },
          { id: 'e-f4-c2', level: 2, category: 'floor', text: 'طبقه موردنظر زوج است.' },
          { id: 'e-f4-c3', level: 3, category: 'structural', text: 'یکی مانده به آخرین طبقه اداری.' },
          { id: 'e-f4-c4', level: 4, category: 'floor', text: 'چهارمین طبقه از پایین در یک ساختمان ۵‌طبقه.' },
        ],
      },
      {
        id: 'eram-f5-unit1', buildingId: 'eram', floor: 5,
        unit: 'واحد اداری', locationType: 'office',
        name: 'واحد طبقه پنجم — ارم',
        description: 'تنها واحد اداری در طبقه پنجم ساختمان ارم',
        rarity: 'epic', active: true,
        clues: [
          { id: 'e-f5-c1', level: 1, category: 'unit-count', text: 'در این ساختمان، هر طبقه فقط یک واحد دارد.' },
          { id: 'e-f5-c2', level: 2, category: 'building', text: 'ساختمانی با ۵ طبقه اداری و بامی که غذا می‌دهد.' },
          { id: 'e-f5-c3', level: 3, category: 'floor', text: 'بالاترین طبقه اداری این ساختمان.' },
          { id: 'e-f5-c4', level: 4, category: 'floor', text: 'یک پله زیر بام، یک پله بالاتر از طبقه چهارم.' },
        ],
      },
      {
        id: 'eram-rooftop', buildingId: 'eram', floor: 99,
        unit: 'رستوران / فضای غذا', locationType: 'food',
        name: 'بام ارم — رستوران',
        description: 'فضای غذای روی بام ساختمان ارم',
        rarity: 'legendary', active: true,
        funFact: 'ارم تنها ساختمان بهسازان است که بامش رستوران دارد!',
        clues: [
          { id: 'e-rt-c1', level: 1, category: 'function', text: 'این مکان برای خوردن و استراحت طراحی شده.' },
          { id: 'e-rt-c2', level: 2, category: 'building', text: 'در ساختمانی که هر طبقه‌اش یک واحد دارد.' },
          { id: 'e-rt-c3', level: 3, category: 'floor', text: 'این مکان در بالاترین نقطه ساختمان قرار دارد.' },
          { id: 'e-rt-c4', level: 4, category: 'function', text: 'رستورانی با چشم‌انداز — نه یک واحد اداری.' },
        ],
      },
    ],
  },

  {
    id: 'shamsayi',
    name: 'شمسایی',
    address: 'خیابان دیباجی جنوبی، کوچه شمسایی',
    undergroundFloors: 2,
    officeFloors: 9,
    hasRooftop: true,
    rooftopDescription: 'نمازخانه',
    unitsPerFloor: 4,
    specialFacts: ['هر طبقه ۴ واحد دارد', 'طبقات زوج: سرویس بانوان (۴ سرویس کنار هم)', 'طبقات فرد: سرویس آقایان', '۹ طبقه اداری', 'فضای غذا در طبقه همکف'],
    locations: [
      {
        id: 'sha-f1-4units', buildingId: 'shamsayi', floor: 1,
        unit: '۴ واحد اداری', locationType: 'office',
        name: 'طبقه اول — شمسایی',
        description: 'طبقه اول با ۴ واحد اداری در ساختمان شمسایی',
        rarity: 'common', active: true,
        clues: [
          { id: 'sha-f1-c1', level: 1, category: 'unit-count', text: 'در این ساختمان هر طبقه ۴ واحد دارد.' },
          { id: 'sha-f1-c2', level: 2, category: 'building', text: 'ساختمانی با ۹ طبقه اداری.' },
          { id: 'sha-f1-c3', level: 3, category: 'floor', text: 'طبقه موردنظر فرد است.' },
          { id: 'sha-f1-c4', level: 4, category: 'floor', text: 'اولین طبقه اداری این ساختمان بزرگ.' },
        ],
      },
      {
        id: 'sha-f2-restroom', buildingId: 'shamsayi', floor: 2,
        unit: 'بخش سرویس بانوان', locationType: 'restroom',
        name: 'سرویس بانوان — طبقه ۲ شمسایی',
        description: 'در طبقات زوج شمسایی، ۴ سرویس بهداشتی بانوان کنار هم قرار دارند',
        rarity: 'rare', active: true,
        funFact: 'در شمسایی، طبقات زوج سرویس بانوان دارند — ۴ سرویس کنار هم!',
        clues: [
          { id: 'sha-f2-c1', level: 1, category: 'unit-count', text: 'در این ساختمان هر طبقه ۴ واحد دارد.' },
          { id: 'sha-f2-c2', level: 2, category: 'structural', text: 'طبقه موردنظر زوج است و یک ویژگی خاص دارد.' },
          { id: 'sha-f2-c3', level: 3, category: 'function', text: 'در این طبقه، ۴ سرویس بهداشتی کنار هم قرار دارند.' },
          { id: 'sha-f2-c4', level: 4, category: 'memory', text: 'سرویس بانوان در طبقه زوج — دومین طبقه از پایین.' },
        ],
      },
      {
        id: 'sha-f3-restroom', buildingId: 'shamsayi', floor: 3,
        unit: 'بخش سرویس آقایان', locationType: 'restroom',
        name: 'سرویس آقایان — طبقه ۳ شمسایی',
        description: 'در طبقات فرد شمسایی، سرویس آقایان قرار دارد',
        rarity: 'common', active: true,
        clues: [
          { id: 'sha-f3-c1', level: 1, category: 'unit-count', text: 'در این ساختمان هر طبقه ۴ واحد دارد.' },
          { id: 'sha-f3-c2', level: 2, category: 'structural', text: 'طبقه موردنظر فرد است.' },
          { id: 'sha-f3-c3', level: 3, category: 'function', text: 'سرویس بهداشتی آقایان در این طبقه قرار دارد.' },
          { id: 'sha-f3-c4', level: 4, category: 'floor', text: 'سومین طبقه از ۹ طبقه اداری.' },
        ],
      },
      {
        id: 'sha-ground-food', buildingId: 'shamsayi', floor: 0,
        unit: 'فضای غذا', locationType: 'food',
        name: 'فضای غذا — همکف شمسایی',
        description: 'فضای غذای طبقه همکف ساختمان شمسایی',
        rarity: 'rare', active: true,
        clues: [
          { id: 'sha-gf-c1', level: 1, category: 'function', text: 'این مکان برای صرف غذا طراحی شده.' },
          { id: 'sha-gf-c2', level: 2, category: 'building', text: 'ساختمانی با ۹ طبقه اداری و ۴ واحد در هر طبقه.' },
          { id: 'sha-gf-c3', level: 3, category: 'floor', text: 'این مکان در طبقه همکف است، نه یک طبقه اداری.' },
          { id: 'sha-gf-c4', level: 4, category: 'location', text: 'ورودی ساختمان شمسایی — طبقه صفر، فضای غذا.' },
        ],
      },
      {
        id: 'sha-rooftop-prayer', buildingId: 'shamsayi', floor: 99,
        unit: 'نمازخانه', locationType: 'prayer',
        name: 'نمازخانه بام — شمسایی',
        description: 'نمازخانه روی بام ساختمان شمسایی',
        rarity: 'epic', active: true,
        clues: [
          { id: 'sha-rt-c1', level: 1, category: 'function', text: 'این مکان برای نماز و معنویت طراحی شده.' },
          { id: 'sha-rt-c2', level: 2, category: 'building', text: 'ساختمانی با ۹ طبقه و ۴ واحد در هر طبقه.' },
          { id: 'sha-rt-c3', level: 3, category: 'floor', text: 'این مکان بالاتر از همه طبقات اداری است.' },
          { id: 'sha-rt-c4', level: 4, category: 'location', text: 'نمازخانه بالای ۹ طبقه شمسایی.' },
        ],
      },
    ],
  },

  {
    id: 'mozhegan',
    name: 'مژگان',
    address: 'مژگان',
    undergroundFloors: 1,
    officeFloors: 5,
    hasRooftop: true,
    rooftopDescription: 'نمازخانه',
    unitsPerFloor: 4,
    specialFacts: [
      'هر طبقه ۴ واحد دارد',
      'طبقه اول: ۳ واحد IT + ۱ اتاق جلسات عمومی',
      'پارکینگ -۱: ۲ سرویس بهداشتی',
      'حیاط: ۳ ژنراتور برق',
      'اتاق سیگار مخصوص',
      '۵ طبقه اداری',
    ],
    locations: [
      {
        id: 'moz-f1-meeting', buildingId: 'mozhegan', floor: 1,
        unit: 'اتاق جلسات عمومی', locationType: 'meeting',
        name: 'اتاق جلسات عمومی — مژگان طبقه ۱',
        description: 'اتاق جلسات عمومی در طبقه اول مژگان، در کنار ۳ واحد IT',
        rarity: 'epic', active: true,
        funFact: 'طبقه اول مژگان منحصربه‌فرد است: ۳ واحد IT و یک اتاق جلسات کنار هم!',
        clues: [
          { id: 'moz-f1m-c1', level: 1, category: 'unit-count', text: 'در این ساختمان هر طبقه چهار واحد دارد.' },
          { id: 'moz-f1m-c2', level: 2, category: 'building', text: 'ساختمان موردنظر ۵ طبقه اداری دارد.' },
          { id: 'moz-f1m-c3', level: 3, category: 'structural', text: 'در طبقه موردنظر، سه واحد IT قرار دارد.' },
          { id: 'moz-f1m-c4', level: 4, category: 'function', text: 'یک اتاق جلسات عمومی نیز در همین طبقه است.' },
        ],
      },
      {
        id: 'moz-f1-it', buildingId: 'mozhegan', floor: 1,
        unit: 'واحدهای IT', locationType: 'office',
        name: 'واحدهای IT — مژگان طبقه ۱',
        description: 'سه واحد IT در طبقه اول ساختمان مژگان',
        rarity: 'rare', active: true,
        clues: [
          { id: 'moz-it-c1', level: 1, category: 'unit-count', text: 'در این ساختمان هر طبقه چهار واحد دارد.' },
          { id: 'moz-it-c2', level: 2, category: 'building', text: 'ساختمانی با ۵ طبقه اداری و حیاط.' },
          { id: 'moz-it-c3', level: 3, category: 'function', text: 'این طبقه با IT شناخته می‌شود.' },
          { id: 'moz-it-c4', level: 4, category: 'count', text: 'سه واحد IT در کنار یک اتاق جلسات — طبقه اول.' },
        ],
      },
      {
        id: 'moz-p1-restroom', buildingId: 'mozhegan', floor: -1,
        unit: 'سرویس بهداشتی', locationType: 'restroom',
        name: 'سرویس بهداشتی پارکینگ — مژگان',
        description: '۲ سرویس بهداشتی در پارکینگ زیرزمینی مژگان',
        rarity: 'rare', active: true,
        clues: [
          { id: 'moz-pr-c1', level: 1, category: 'building', text: 'ساختمانی با ۱ پارکینگ زیرزمینی و ۵ طبقه اداری.' },
          { id: 'moz-pr-c2', level: 2, category: 'floor', text: 'این مکان زیر همکف است.' },
          { id: 'moz-pr-c3', level: 3, category: 'function', text: 'سرویس بهداشتی — زیرزمین.' },
          { id: 'moz-pr-c4', level: 4, category: 'count', text: 'دو سرویس بهداشتی در پارکینگ زیرزمینی مژگان.' },
        ],
      },
      {
        id: 'moz-courtyard-gen', buildingId: 'mozhegan', floor: 0,
        unit: 'حیاط — ژنراتورها', locationType: 'technical',
        name: 'حیاط — ژنراتورها — مژگان',
        description: 'سه ژنراتور برق در حیاط ساختمان مژگان',
        rarity: 'legendary', active: true,
        funFact: 'مژگان تنها ساختمانی است که در حیاطش ۳ ژنراتور برق دارد!',
        clues: [
          { id: 'moz-gen-c1', level: 1, category: 'building', text: 'ساختمانی که حیاط دارد.' },
          { id: 'moz-gen-c2', level: 2, category: 'function', text: 'در حیاط این ساختمان تجهیزات برق وجود دارد.' },
          { id: 'moz-gen-c3', level: 3, category: 'count', text: 'سه ژنراتور برق کنار هم در فضای باز.' },
          { id: 'moz-gen-c4', level: 4, category: 'location', text: 'حیاط مژگان — جایی که ژنراتورها نگهداری می‌شوند.' },
        ],
      },
      {
        id: 'moz-smoking', buildingId: 'mozhegan', floor: 0,
        unit: 'اتاق سیگار', locationType: 'smoking',
        name: 'اتاق سیگار — مژگان',
        description: 'اتاق مخصوص سیگار در ساختمان مژگان',
        rarity: 'epic', active: true,
        clues: [
          { id: 'moz-sm-c1', level: 1, category: 'function', text: 'این مکان برای افراد سیگاری در نظر گرفته شده.' },
          { id: 'moz-sm-c2', level: 2, category: 'building', text: 'ساختمانی با حیاط و ۵ طبقه اداری.' },
          { id: 'moz-sm-c3', level: 3, category: 'location', text: 'مکانی خاص برای سیگار کشیدن — نه اداری، نه پارکینگ.' },
          { id: 'moz-sm-c4', level: 4, category: 'memory', text: 'اتاق سیگار مژگان — یک مکان شناخته‌شده.' },
        ],
      },
      {
        id: 'moz-rooftop-prayer', buildingId: 'mozhegan', floor: 99,
        unit: 'نمازخانه', locationType: 'prayer',
        name: 'نمازخانه بام — مژگان',
        description: 'نمازخانه روی بام ساختمان مژگان',
        rarity: 'rare', active: true,
        clues: [
          { id: 'moz-rt-c1', level: 1, category: 'function', text: 'این مکان برای نماز و عبادت طراحی شده.' },
          { id: 'moz-rt-c2', level: 2, category: 'building', text: 'ساختمانی با ۵ طبقه اداری و حیاط.' },
          { id: 'moz-rt-c3', level: 3, category: 'floor', text: 'بالاترین نقطه این ساختمان ۵‌طبقه.' },
          { id: 'moz-rt-c4', level: 4, category: 'location', text: 'نمازخانه بام مژگان.' },
        ],
      },
      {
        id: 'moz-f2-unit', buildingId: 'mozhegan', floor: 2,
        unit: 'واحدهای اداری', locationType: 'office',
        name: 'طبقه دوم — مژگان',
        description: '۴ واحد اداری در طبقه دوم مژگان',
        rarity: 'common', active: true,
        clues: [
          { id: 'moz-f2-c1', level: 1, category: 'unit-count', text: 'در این ساختمان هر طبقه چهار واحد دارد.' },
          { id: 'moz-f2-c2', level: 2, category: 'building', text: 'ساختمانی با ۵ طبقه، حیاط و اتاق سیگار.' },
          { id: 'moz-f2-c3', level: 3, category: 'floor', text: 'طبقه موردنظر دومین طبقه اداری است.' },
          { id: 'moz-f2-c4', level: 4, category: 'floor', text: 'زوج، بالاتر از طبقه اول با واحدهای IT.' },
        ],
      },
    ],
  },
]

// ─── LOOKUP HELPERS ───────────────────────────────────────────────────────────

export function getBuildingById(id: BuildingId): Building {
  return BUILDINGS.find(b => b.id === id)!
}

export function getAllLocations(): Location[] {
  return BUILDINGS.flatMap(b => b.locations)
}

export function getActiveLocations(): Location[] {
  return getAllLocations().filter(l => l.active)
}

export function getLocation(id: string): Location | undefined {
  return getAllLocations().find(l => l.id === id)
}

// ─── CLUE ENGINE ─────────────────────────────────────────────────────────────

export interface RevealedClue extends Clue { revealedAt: number }

export function getNextClue(location: Location, revealed: RevealedClue[]): Clue | null {
  const usedIds = new Set(revealed.map(c => c.id))
  const sorted = [...location.clues].sort((a, b) => a.level - b.level)
  return sorted.find(c => !usedIds.has(c.id)) ?? null
}

export function getDistinguishingClues(location: Location): Clue[] {
  return location.clues.filter(c => c.level <= 2)
}

// Pick a random active location, optionally avoiding recently used ones
export function pickLocation(avoidIds: string[] = []): Location {
  const all = getActiveLocations()
  if (all.length === 0) throw new Error('No active locations available')
  const filtered = all.filter(l => !avoidIds.includes(l.id))
  const pool = filtered.length > 0 ? filtered : all
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── GAME STATE ───────────────────────────────────────────────────────────────

export type GamePhase = 'lobby' | 'role-reveal' | 'playing' | 'guessing' | 'reveal' | 'results'

export interface Guess {
  buildingId: BuildingId
  floor?: number
  locationId?: string
  confidence: 'low' | 'medium' | 'high'
  correct: boolean
  xpAwarded: number
  timestamp: number
}

export interface HuntGameState {
  phase: GamePhase
  locationId: string
  revealedClues: RevealedClue[]
  eliminated: { buildings: BuildingId[]; locationIds: string[] }
  guesses: Guess[]
  wrongGuesses: number
  startedAt: number
  timerSec: number
  mode: 'classic' | 'speed'
}

const ATLAS_KEY = 'ta_hunt_atlas'
const HISTORY_KEY = 'ta_hunt_history'

export interface AtlasEntry {
  locationId: string
  discoveredAt: number
  firstDiscoveredInSec: number
  cluesUsed: number
}

export function loadAtlas(): AtlasEntry[] {
  try { return JSON.parse(localStorage.getItem(ATLAS_KEY) ?? '[]') } catch { return [] }
}

export function addToAtlas(entry: AtlasEntry): void {
  const atlas = loadAtlas()
  if (!atlas.find(e => e.locationId === entry.locationId)) {
    atlas.push(entry)
    localStorage.setItem(ATLAS_KEY, JSON.stringify(atlas))
  }
}

export function getRecentLocationIds(limit = 5): string[] {
  try {
    const h = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as string[]
    return h.slice(-limit)
  } catch { return [] }
}

export function recordPlayedLocation(locationId: string): void {
  try {
    const h = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as string[]
    h.push(locationId)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-20)))
  } catch { /* ignore */ }
}

// ─── SCORING ──────────────────────────────────────────────────────────────────

export interface ScoreResult {
  xp: number
  points: number
  label: string
}

export function calcScore(
  correct: boolean,
  cluesUsed: number,
  elapsedSec: number,
  confidence: 'low' | 'medium' | 'high',
  rarity: Rarity,
): ScoreResult {
  if (!correct) {
    const penalty = confidence === 'high' ? -80 : confidence === 'medium' ? -40 : -20
    return { xp: 10, points: penalty, label: 'تلاش' }
  }
  const rarityBonus: Record<Rarity, number> = { common: 100, rare: 200, epic: 350, legendary: 500 }
  const clueBonus = Math.max(0, (4 - cluesUsed) * 50)
  const timeBonus = Math.max(0, Math.floor((120 - elapsedSec) / 10) * 20)
  const confBonus = confidence === 'high' ? 100 : confidence === 'medium' ? 40 : 0
  const total = rarityBonus[rarity] + clueBonus + timeBonus + confBonus
  return {
    xp: Math.floor(total * 0.8),
    points: total,
    label: cluesUsed <= 1 ? '⚡ برق‌آسا!' : cluesUsed <= 2 ? '🎯 دقیق!' : '✓ درست!',
  }
}

// Floor display helper
export function floorLabel(floor: number): string {
  if (floor === 99) return 'بام'
  if (floor === 0) return 'همکف'
  if (floor < 0) return `پارکینگ ${floor}`
  return `طبقه ${floor}`
}

export const RARITY_META: Record<Rarity, { label: string; icon: string; color: string }> = {
  common:    { label: 'معمولی',    icon: '⭐',   color: '#9ca3af' },
  rare:      { label: 'نادر',      icon: '⭐⭐',  color: '#60a5fa' },
  epic:      { label: 'اپیک',      icon: '⭐⭐⭐', color: '#a855f7' },
  legendary: { label: 'افسانه‌ای', icon: '👑',   color: '#ffd700' },
}
