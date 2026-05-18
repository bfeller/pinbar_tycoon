import React from 'react';

// All geometry is drawn in canonical N-orientation (50×100 viewBox)
// then matrix-transformed for S/E/W orientations.
//
// Layout (N):
//   y 0–50  : headbox (backglass image overlays this via CSS)
//     y 0–3  : back-cap accent stripe
//     y 3–48 : display area (image appears here, speaker vents at y 40–48)
//     y 48–52: shoulder ridge
//   y 52–88 : playfield (felt, rails, shooter, bumpers, slingshots)
//   y 88–98 : apron (flippers, drain)

const TRANSFORMS = {
  N: null,
  S: 'matrix(-1,0,0,-1,50,100)',
  E: 'matrix(0,1,-1,0,100,0)',
  W: 'matrix(0,1,1,0,0,0)',
};

export default function PinballMachineSVG({ orientation = 'N' }) {
  const isVertical = orientation === 'N' || orientation === 'S';
  const vbW = isVertical ? 50 : 100;
  const vbH = isVertical ? 100 : 50;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <g transform={TRANSFORMS[orientation] || undefined}>

        {/* Cabinet body */}
        <rect x="0" y="0" width="50" height="100" rx="2" fill="#1a1628"/>

        {/* Side walls */}
        <rect x="0"  y="0" width="3" height="100" fill="#0e0c17"/>
        <rect x="47" y="0" width="3" height="100" fill="#0e0c17"/>

        {/* Headbox: back-cap accent stripe */}
        <rect x="3" y="0" width="44" height="3" fill="#4a3570"/>

        {/* Headbox: display area (very dark — backglass image overlays this) */}
        <rect x="3" y="3" width="44" height="45" fill="#07050e"/>

        {/* Headbox: inner side bezels */}
        <rect x="3"  y="3" width="2" height="45" fill="#2e2248"/>
        <rect x="45" y="3" width="2" height="45" fill="#2e2248"/>

        {/* Headbox: lower face (visible below the perspective-compressed image) */}
        <rect x="5" y="40" width="40" height="8" fill="#130f22"/>
        {/* Speaker vent slits — left cluster */}
        <rect x="7"  y="42" width="12" height="1" fill="#1e1730" opacity="0.8"/>
        <rect x="7"  y="44" width="12" height="1" fill="#1e1730" opacity="0.8"/>
        <rect x="7"  y="46" width="12" height="1" fill="#1e1730" opacity="0.8"/>
        {/* Speaker vent slits — right cluster */}
        <rect x="31" y="42" width="12" height="1" fill="#1e1730" opacity="0.8"/>
        <rect x="31" y="44" width="12" height="1" fill="#1e1730" opacity="0.8"/>
        <rect x="31" y="46" width="12" height="1" fill="#1e1730" opacity="0.8"/>

        {/* Shoulder / transition ridge */}
        <rect x="0" y="48" width="50" height="4" fill="#221a38"/>

        {/* Playfield body */}
        <rect x="3" y="52" width="44" height="46" fill="#110f1d"/>

        {/* Left metal side rail */}
        <rect x="3" y="52" width="3" height="36" fill="#3d3660"/>

        {/* Right metal side rail */}
        <rect x="41" y="52" width="3" height="36" fill="#3d3660"/>

        {/* Shooter lane */}
        <rect x="44" y="52" width="3" height="34" fill="#1c110a"/>
        <circle cx="45.5" cy="55" r="1.5" fill="#3a2815"/>

        {/* Main felt surface */}
        <rect x="6" y="52" width="35" height="36" fill="#0c1a0e"/>
        {/* Glass reflection highlight at felt top edge */}
        <rect x="6" y="52" width="35" height="1" fill="white" fillOpacity="0.06"/>

        {/* Pop bumpers — classic triangle cluster */}
        <circle cx="16" cy="62" r="2.5" fill="#0c1a0e" stroke="#225525" strokeWidth="0.8"/>
        <circle cx="24" cy="68" r="2.5" fill="#0c1a0e" stroke="#225525" strokeWidth="0.8"/>
        <circle cx="16" cy="74" r="2.5" fill="#0c1a0e" stroke="#225525" strokeWidth="0.8"/>

        {/* Slingshot triangles */}
        <polygon points="7,79 7,85 11,85"  fill="#101e10"/>
        <polygon points="34,79 34,85 30,85" fill="#101e10"/>

        {/* Apron */}
        <rect x="3" y="88" width="44" height="10" fill="#15121e"/>

        {/* Drain gap */}
        <rect x="18" y="88" width="5" height="3" fill="#09070f"/>

        {/* Left flipper */}
        <line x1="6"  y1="93" x2="18" y2="90" stroke="#4a3f6b" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Right flipper */}
        <line x1="23" y1="90" x2="35" y2="93" stroke="#4a3f6b" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Bottom trim */}
        <rect x="3" y="97" width="44" height="2" fill="#2e2248"/>

      </g>
    </svg>
  );
}
