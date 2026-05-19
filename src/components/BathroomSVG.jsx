// Top-down floor plan of a small pub bathroom (2×2 cells = 100×100 viewBox).
//
// Layout:
//   Walls around all edges, door gap in the bottom wall (player-facing).
//   Toilet in the upper-right corner (tank + bowl from above).
//   Sink in the upper-left corner.
//   Hexagonal floor tiles throughout.

export default function BathroomSVG() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {/* ── Floor ── */}
      <rect x="0" y="0" width="100" height="100" fill="#d8d4cc"/>

      {/* Tile grid — small squares with grout lines */}
      {/* Horizontal grout lines */}
      {[10,20,30,40,50,60,70,80,90].map(y => (
        <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#bab6ae" strokeWidth="0.8"/>
      ))}
      {/* Vertical grout lines */}
      {[10,20,30,40,50,60,70,80,90].map(x => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#bab6ae" strokeWidth="0.8"/>
      ))}

      {/* ── Walls ── */}
      {/* Top wall */}
      <rect x="0" y="0" width="100" height="6" fill="#5a5660"/>
      {/* Left wall */}
      <rect x="0" y="0" width="6" height="100" fill="#5a5660"/>
      {/* Right wall */}
      <rect x="94" y="0" width="6" height="100" fill="#5a5660"/>
      {/* Bottom wall — door gap is in the LEFT cell (x=10–42), aligning with entry cell (bathroom.x, bathroom.y+2) */}
      <rect x="0"  y="94" width="10" height="6" fill="#5a5660"/>
      <rect x="42" y="94" width="58" height="6" fill="#5a5660"/>

      {/* Door frame posts */}
      <rect x="8"  y="91" width="2" height="9" fill="#7a6848"/>
      <rect x="40" y="91" width="2" height="9" fill="#7a6848"/>
      {/* Door swing arc — hinged at right post, opens inward to the left */}
      <path d="M 42 94 A 32 32 0 0 0 10 94" stroke="#8a7858" strokeWidth="1" fill="#c8b898" fillOpacity="0.25"/>

      {/* ── Toilet (upper-right corner) ── */}
      {/* Cistern / tank */}
      <rect x="66" y="8" width="22" height="14" rx="2" fill="#f4f2ee"/>
      <rect x="67" y="9" width="20" height="12" rx="1.5" fill="#fefcf8"/>
      {/* Tank lid shadow line */}
      <rect x="66" y="20" width="22" height="1" fill="#d8d4cc" opacity="0.8"/>
      {/* Flush button */}
      <circle cx="77" cy="14" r="3" fill="#e0dcd6"/>
      <circle cx="77" cy="14" r="2" fill="#eceae6"/>

      {/* Bowl seat (outer) */}
      <ellipse cx="77" cy="38" rx="13" ry="16" fill="#f4f2ee"/>
      {/* Bowl seat ring */}
      <ellipse cx="77" cy="38" rx="11" ry="14" fill="#fefcf8"/>
      {/* Water in bowl */}
      <ellipse cx="77" cy="39" rx="8"  ry="11" fill="#c8e8f4"/>
      {/* Tank-to-bowl connector */}
      <rect x="72" y="21" width="10" height="6" fill="#f0eee8"/>

      {/* ── Sink (upper-left corner) ── */}
      {/* Sink body */}
      <rect x="8" y="8" width="26" height="22" rx="3" fill="#ece8e0"/>
      <rect x="9" y="9" width="24" height="20" rx="2.5" fill="#f8f6f0"/>
      {/* Basin (inner bowl, visible from above) */}
      <ellipse cx="21" cy="19" rx="9" ry="8" fill="#dde8f0"/>
      <ellipse cx="21" cy="19" rx="7" ry="6" fill="#c8dce8"/>
      {/* Drain */}
      <circle cx="21" cy="20" r="1.5" fill="#a8b8c0"/>
      <circle cx="21" cy="20" r="0.8" fill="#8898a0"/>
      {/* Faucet */}
      <rect x="18" y="8.5" width="6" height="5" rx="1" fill="#b8c4c8"/>
      <rect x="19" y="8.5" width="4" height="3" rx="0.8" fill="#ccd6da"/>
      {/* Hot/cold taps */}
      <circle cx="17" cy="10" r="2" fill="#c0c8cc"/>
      <circle cx="25" cy="10" r="2" fill="#c0c8cc"/>

      {/* ── Bin / waste basket (bottom-left) ── */}
      <rect x="8" y="76" width="12" height="14" rx="2" fill="#706870"/>
      <rect x="9" y="77" width="10" height="12" rx="1.5" fill="#8a7e8a"/>
      <rect x="9" y="77" width="10" height="3" fill="#7a6e7a"/>

      {/* ── Toilet paper holder (right wall, next to toilet) ── */}
      <circle cx="91" cy="58" r="4" fill="#7a7480"/>
      <circle cx="91" cy="58" r="2.8" fill="#e8e4dc"/>
      <circle cx="91" cy="58" r="1.2" fill="#8a8490"/>

    </svg>
  );
}
