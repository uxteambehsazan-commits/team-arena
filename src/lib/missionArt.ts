import artGuess      from '../imports/art-guess.png'
import artHide       from '../imports/art-memory.png'
import artTaboo      from '../imports/art-logic.png'
import artSpeed      from '../imports/art-speed.png'
import artWink       from '../imports/art-wink.png'
import artDoz        from '../imports/art-doz.png'
import artNameFamily from '../imports/art-namefamily.png'
import artClue       from '../imports/art-oneword.png'

export const MISSION_ART: Record<string, string> = {
  SPEED:       artGuess,
  MEMORY:      artHide,
  LOGIC:       artTaboo,
  FASTEST:     artSpeed,
  TEAM:        artWink,
  FINAL:       artDoz,
  NAME_FAMILY: artNameFamily,
  ONE_WORD:    artClue,
}
