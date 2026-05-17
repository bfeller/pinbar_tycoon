/**
 * Random "seller" descriptions for used machines in the Pinball Net store.
 * Seeded by machine ID so the same machine always gets the same blurb.
 */

const BLURBS = [
  // Classic collector-speak
  "HUO, just don't play anymore.",
  "HUO, garage kept, non-smoking home.",
  "Worked fine when I put it in storage two years ago.",
  "Played great last time I turned it on (2 years ago).",
  "All original, never touched by an operator.",
  "Low plays. Bought it, played twice, wife said no.",
  "Barn find. Don't ask about the smell — it airs out.",
  "Saved from a bowling alley teardown. Fully functional.",
  "Purchased from an estate sale. Previous owner 'loved it'.",
  "Route pulled. Coins still in the coin box (bonus!).",
  "I have the original manual. Somewhere.",
  "Needs a bulb or two. Otherwise 100%.",
  "Flippers are strong. Very strong.",
  "Solid-state, so nothing to worry about. Mostly.",
  "The playfield glass has a small crack. Adds character.",

  // Comical
  "My kids used it as a table for six years. Plays fine.",
  "The cat chewed some wires. Fixed (I think).",
  "Stored in the basement. Basement flooded once. Unrelated.",
  "Selling to fund my next pinball. The cycle continues.",
  "My therapist says I have too many. She's right.",
  "It's not haunted. I can't prove it's not haunted, but it's probably not.",
  "Makes a sound on power-up I can't identify. Super chill sound though.",
  "One flipper is slightly weaker than the other. Skill issue.",
  "Rats got to the wiring harness. Rats have been evicted.",
  "She's a beauty. Don't look at the backbox hinge.",
  "Selling reluctantly. Wife says 'choose the machine or me'. Miss her already.",
  "Topper is missing. I don't know what happened to the topper.",
  "100% working except the part that doesn't work.",
  "I dropped it moving it in. It was fine before I dropped it.",
  "All boards recapped by a guy who seemed to know what he was doing.",
  "Displaying a score of 8,753,200. Set it yourself, I never got that high.",
  "The tilt is sensitive. Very, very sensitive.",
  "Translite has a small ding. I don't see it. You won't see it.",
  "Previous owner was an operator. Machine has... lived a full life.",
  "Price is firm. Unless you're local. Price is negotiable if you're local.",
];

/** Returns a consistent blurb for a given machine ID (not random per render) */
export function getUsedBlurb(machineId) {
  let hash = 0;
  for (let i = 0; i < machineId.length; i++) {
    hash = (hash * 31 + machineId.charCodeAt(i)) >>> 0;
  }
  return BLURBS[hash % BLURBS.length];
}
