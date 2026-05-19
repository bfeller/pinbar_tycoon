// Top-down view of a pub bar counter.
//
// Layout (N orientation, player approaches from bottom):
//   The counter surface fills most of the cell.
//   The bar rail runs along the player-facing edge (bottom in N).
//   A couple of pint glasses sit on the surface.
//
// Orientation transforms rotate so the rail always faces the player.

const TRANSFORMS = {
  N: null,
  S: 'matrix(-1,0,0,-1,50,50)',  // 180° around centre
  E: 'matrix(0,1,-1,0,50,0)',    // 90° CCW → rail faces left
  W: 'matrix(0,-1,1,0,0,50)',    // 90° CW  → rail faces right
};

export default function BartopSVG({ orientation = 'N' }) {
  return (
    <svg
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <g transform={TRANSFORMS[orientation] || undefined}>

        {/* ── Bar counter body ── */}
        <rect x="0" y="0" width="50" height="50" fill="#2e1a0e"/>

        {/* Wood surface — warm dark mahogany */}
        <rect x="2" y="2" width="46" height="41" rx="1" fill="#3d2210"/>

        {/* Wood grain lines (long grain running back-to-front) */}
        <line x1="9"  y1="2" x2="9"  y2="43" stroke="#2a1609" strokeWidth="0.8" opacity="0.5"/>
        <line x1="16" y1="2" x2="16" y2="43" stroke="#4a2a12" strokeWidth="0.6" opacity="0.4"/>
        <line x1="22" y1="2" x2="22" y2="43" stroke="#2a1609" strokeWidth="0.5" opacity="0.35"/>
        <line x1="30" y1="2" x2="30" y2="43" stroke="#4a2a12" strokeWidth="0.7" opacity="0.4"/>
        <line x1="38" y1="2" x2="38" y2="43" stroke="#2a1609" strokeWidth="0.5" opacity="0.35"/>
        <line x1="44" y1="2" x2="44" y2="43" stroke="#4a2a12" strokeWidth="0.6" opacity="0.3"/>

        {/* Surface highlight — light catching the near edge of the counter top */}
        <rect x="2" y="2" width="46" height="1.5" fill="#5a3018" opacity="0.6"/>
        <rect x="2" y="2" width="1.5" height="41" fill="#5a3018" opacity="0.4"/>
        <rect x="46.5" y="2" width="1.5" height="41" fill="#1a0c06" opacity="0.4"/>

        {/* ── Pint glass 1 (left side) ── */}
        {/* Glass body — viewed from above: a circle with a slight taper suggestion */}
        <circle cx="14" cy="20" r="7"   fill="#c8860a" opacity="0.85"/>  {/* amber beer */}
        <circle cx="14" cy="20" r="7"   fill="none" stroke="#8a5c06" strokeWidth="1.2"/>
        {/* Foam ring */}
        <circle cx="14" cy="20" r="5.5" fill="#e8d48a" opacity="0.45"/>
        <circle cx="14" cy="20" r="4"   fill="#c8860a" opacity="0.5"/>
        {/* Glass rim highlight */}
        <path d="M 9 17 A 7 7 0 0 1 19 17" stroke="#e0a030" strokeWidth="1" fill="none" opacity="0.6"/>
        {/* Condensation drop */}
        <circle cx="20" cy="15" r="0.8" fill="#a06010" opacity="0.5"/>
        <circle cx="8"  cy="25" r="0.6" fill="#a06010" opacity="0.4"/>

        {/* ── Pint glass 2 (right side, already half drunk) ── */}
        <circle cx="36" cy="22" r="6.5" fill="#b07808" opacity="0.7"/>
        <circle cx="36" cy="22" r="6.5" fill="none" stroke="#8a5c06" strokeWidth="1.2"/>
        {/* Less foam — it's half empty */}
        <circle cx="36" cy="22" r="5"   fill="#d4b060" opacity="0.3"/>
        <circle cx="36" cy="22" r="3.5" fill="#b07808" opacity="0.4"/>
        <path d="M 31 19 A 6.5 6.5 0 0 1 41 19" stroke="#d09028" strokeWidth="1" fill="none" opacity="0.5"/>

        {/* ── Bar mat / drip mat (under the glasses) ── */}
        <rect x="6"  y="13" width="16" height="14" rx="2" fill="#1a0e06" opacity="0.3"/>
        <rect x="28" y="15" width="16" height="14" rx="2" fill="#1a0e06" opacity="0.25"/>

        {/* ── Bar rail (customer-facing edge, bottom) ── */}
        {/* Main rail — brass/chrome bar */}
        <rect x="0" y="43" width="50" height="3.5" fill="#4a3a1a"/>
        <rect x="0" y="43" width="50" height="1"   fill="#7a6030" opacity="0.8"/>
        {/* Rail highlight — polished brass */}
        <rect x="0" y="43" width="50" height="0.5" fill="#c0a050" opacity="0.5"/>

        {/* ── Counter front face (visible edge facing player) ── */}
        <rect x="0" y="46.5" width="50" height="3.5" fill="#1e0e06"/>
        {/* Subtle edge highlight */}
        <rect x="0" y="46.5" width="50" height="0.5" fill="#3a1e0a" opacity="0.7"/>

      </g>
    </svg>
  );
}
