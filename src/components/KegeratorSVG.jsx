// Top-down view of a commercial kegerator unit.
//
// Layout (N orientation, bartender approaches from bottom):
//   y 0–6   : ventilation grilles (back)
//   y 6–32  : main stainless steel cabinet top
//   y 20–30 : two tap faucet handles (protruding up, seen from above as knobs)
//   y 32–42 : drip tray shelf
//   y 42–50 : front edge with handle

const TRANSFORMS = {
  N: null,
  S: 'matrix(-1,0,0,-1,50,50)',
  E: 'matrix(0,1,-1,0,50,0)',
  W: 'matrix(0,-1,1,0,0,50)',
};

export default function KegeratorSVG({ orientation = 'N' }) {
  return (
    <svg
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <g transform={TRANSFORMS[orientation] || undefined}>

        {/* ── Cabinet body ── */}
        <rect x="0" y="0" width="50" height="50" fill="#7a8e98"/>

        {/* Main top surface — stainless steel */}
        <rect x="2" y="2" width="46" height="46" fill="#9fb5c0"/>

        {/* Surface sheen — light catching the top face */}
        <rect x="2"  y="2" width="46" height="2"  fill="#b8ccd4" opacity="0.7"/>
        <rect x="2"  y="2" width="2"  height="46" fill="#b8ccd4" opacity="0.5"/>
        <rect x="46" y="2" width="2"  height="46" fill="#6a7e88" opacity="0.5"/>

        {/* ── Ventilation grilles (back edge) ── */}
        <rect x="2" y="2" width="46" height="7" fill="#5e7080"/>
        {/* Vent slits */}
        <rect x="5"  y="3.5" width="40" height="1" fill="#4a5e6a" opacity="0.8"/>
        <rect x="5"  y="5.5" width="40" height="1" fill="#4a5e6a" opacity="0.8"/>
        <rect x="5"  y="7.5" width="40" height="1" fill="#6a7e8a" opacity="0.5"/>

        {/* ── Keg indicator / brand badge ── */}
        <rect x="16" y="10" width="18" height="8" rx="1.5" fill="#7a9298" opacity="0.7"/>
        <rect x="18" y="11.5" width="14" height="5" rx="1" fill="#5a7280" opacity="0.8"/>
        {/* Little label lines */}
        <rect x="19" y="13" width="12" height="1" fill="#8aaab0" opacity="0.6"/>
        <rect x="20" y="14.5" width="8" height="0.8" fill="#8aaab0" opacity="0.4"/>

        {/* ── Tap faucet handles (top-down: circular knob + shaft) ── */}

        {/* Tap 1 — left */}
        {/* Base collar mounted to cabinet top */}
        <circle cx="17" cy="28" r="5.5" fill="#687e8a"/>
        <circle cx="17" cy="28" r="4"   fill="#8aa0ac"/>
        {/* Faucet body / shaft seen from above */}
        <rect x="14.5" y="23" width="5" height="10" rx="2.5" fill="#9ab0bc"/>
        {/* Tap knob (top of handle) */}
        <ellipse cx="17" cy="24" rx="3.5" ry="2.5" fill="#c8d8de"/>
        <ellipse cx="17" cy="24" rx="2.5" ry="1.8" fill="#dce8ec"/>
        <circle cx="17" cy="24" r="0.8" fill="#a0b4bc"/>
        {/* Handle grip (the lever part, seen from above as a narrow rectangle) */}
        <rect x="16" y="25" width="2" height="7" rx="1" fill="#b0c4cc"/>
        {/* Drip spout */}
        <circle cx="17" cy="33" r="1.2" fill="#5a7080" opacity="0.8"/>

        {/* Tap 2 — right */}
        <circle cx="33" cy="28" r="5.5" fill="#687e8a"/>
        <circle cx="33" cy="28" r="4"   fill="#8aa0ac"/>
        <rect x="30.5" y="23" width="5" height="10" rx="2.5" fill="#9ab0bc"/>
        <ellipse cx="33" cy="24" rx="3.5" ry="2.5" fill="#c8d8de"/>
        <ellipse cx="33" cy="24" rx="2.5" ry="1.8" fill="#dce8ec"/>
        <circle cx="33" cy="24" r="0.8" fill="#a0b4bc"/>
        <rect x="32" y="25" width="2" height="7" rx="1" fill="#b0c4cc"/>
        <circle cx="33" cy="33" r="1.2" fill="#5a7080" opacity="0.8"/>

        {/* ── Drip tray ── */}
        <rect x="4" y="36" width="42" height="8" rx="1" fill="#6a7e88"/>
        <rect x="5" y="37" width="40" height="6" rx="0.5" fill="#587080"/>
        {/* Tray grid texture */}
        <line x1="13" y1="37" x2="13" y2="43" stroke="#4a6070" strokeWidth="0.6" opacity="0.6"/>
        <line x1="21" y1="37" x2="21" y2="43" stroke="#4a6070" strokeWidth="0.6" opacity="0.6"/>
        <line x1="29" y1="37" x2="29" y2="43" stroke="#4a6070" strokeWidth="0.6" opacity="0.6"/>
        <line x1="37" y1="37" x2="37" y2="43" stroke="#4a6070" strokeWidth="0.6" opacity="0.6"/>
        <line x1="5" y1="40" x2="45" y2="40" stroke="#4a6070" strokeWidth="0.6" opacity="0.6"/>
        {/* Spilled beer suggestion */}
        <ellipse cx="25" cy="40" rx="5" ry="2" fill="#8a6020" opacity="0.25"/>

        {/* ── Front edge / handle ── */}
        <rect x="0" y="45" width="50" height="5" fill="#5e7080"/>
        {/* Door handle */}
        <rect x="18" y="46" width="14" height="2.5" rx="1.2" fill="#8aa0ac"/>
        <rect x="19" y="46.3" width="12" height="1.8" rx="0.8" fill="#b0c4cc" opacity="0.6"/>

      </g>
    </svg>
  );
}
