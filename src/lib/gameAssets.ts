/**
 * Authoritative game asset registry.
 * Every game must have ONE canonical image used across all screens.
 * Import this, never duplicate art references in individual components.
 */

// General mission art (public games)
import artGuess      from '../imports/art-guess.png'      // حدس بزن / SPEED
import artTaboo      from '../imports/art-logic.png'      // کلمه ممنوعه / LOGIC
import artSpeed      from '../imports/art-speed.png'      // بازی سرعتی نهایی / FASTEST
import artWink       from '../imports/art-wink.png'       // چشمک / TEAM
import artDoz        from '../imports/art-doz.png'        // دوز / FINAL
import artNameFamily from '../imports/art-namefamily.png' // اسم‌فامیل / NAME_FAMILY
import artClue       from '../imports/art-oneword.png'    // یک کلمه / ONE_WORD
import artHide       from '../imports/art-hide.png'       // شکار بهسازانی (hide/seek)
import artItWar      from '../imports/art-it-war.png'    // جنگ IT

// Behsazani game art
import artBMafia      from '../imports/art-b-mafia.png'
import artBSpy        from '../imports/art-b-spy.png'
import artBCouncil    from '../imports/art-b-council.png'
import artBCodebreak  from '../imports/art-b-codebreak.png'
import artBSecretcode from '../imports/art-b-secretcode.png'
import artBOneword    from '../imports/art-b-oneword.png'
import artBDesigner   from '../imports/art-b-designer.png'
import artBBigrace    from '../imports/art-b-bigrace.png'

/**
 * Keyed by the canonical gameId used across the entire app.
 * Public mission games use their MISSION_ID.
 * Behsazani games use their behsazaniId.
 * Solo/special games use their soloGameId.
 */
export const GAME_ASSETS: Record<string, string> = {
  // Public mission games (keyed by MISSION_ID)
  SPEED:       artGuess,
  MEMORY:      artHide,   // MemoryMaster / قایم‌باشک
  LOGIC:       artTaboo,
  FASTEST:     artSpeed,
  TEAM:        artWink,
  FINAL:       artDoz,
  NAME_FAMILY: artNameFamily,
  ONE_WORD:    artClue,

  // Behsazani games
  behsazani_hunt:             artHide,      // شکار بهسازانی — was incorrectly artBBigrace
  behsazani_mafia:            artBMafia,
  behsazani_spy:              artBSpy,
  behsazani_project_council:  artBCouncil,
  behsazani_code_breakers:    artBCodebreak,
  behsazani_project_code:     artBSecretcode,
  behsazani_one_word:         artBOneword,
  behsazani_naghghashi:       artBDesigner,
  behsazani_it_quiz:          artBBigrace,
}

/** Map from Home.tsx game key → canonical asset */
export const GAME_KEY_TO_ASSET: Record<string, string> = {
  'g-namefamily': artNameFamily,
  'g-speed':      artGuess,
  'g-oneword':    artClue,
  'g-final':      artDoz,
  'g-logic':      artTaboo,
  'g-itwar':      artItWar,
  'g-team':       artWink,
  'b-hunt':       artHide,
  'b-mafia':      artBMafia,
  'b-spy':        artBSpy,
  'b-council':    artBCouncil,
  'b-codebreak':  artBCodebreak,
  'b-secretcode': artBSecretcode,
  'b-oneword':    artBOneword,
  'b-bigrace':    artBBigrace,
  'b-naghghashi': artBDesigner,
}
