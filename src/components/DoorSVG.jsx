export default function DoorSVG({ isOpen = false }) {
  return (
    <svg
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {/* ── Floor ── */}
      <rect x="0" y="0" width="50" height="50" fill="#1e2a38"/>
      {/* Floor tile grid */}
      <line x1="0" y1="10" x2="50" y2="10" stroke="#263345" strokeWidth="0.6"/>
      <line x1="0" y1="20" x2="50" y2="20" stroke="#263345" strokeWidth="0.6"/>
      <line x1="0" y1="30" x2="50" y2="30" stroke="#263345" strokeWidth="0.6"/>
      <line x1="0" y1="40" x2="50" y2="40" stroke="#263345" strokeWidth="0.6"/>
      <line x1="10" y1="0" x2="10" y2="50" stroke="#263345" strokeWidth="0.6"/>
      <line x1="20" y1="0" x2="20" y2="50" stroke="#263345" strokeWidth="0.6"/>
      <line x1="30" y1="0" x2="30" y2="50" stroke="#263345" strokeWidth="0.6"/>
      <line x1="40" y1="0" x2="40" y2="50" stroke="#263345" strokeWidth="0.6"/>

      {/* ── Wall sections flanking the door gap ── */}
      <rect x="0"  y="38" width="14" height="12" fill="#3a3248"/>
      <rect x="36" y="38" width="14" height="12" fill="#3a3248"/>
      {/* Wall top-edge highlight */}
      <rect x="0"  y="38" width="14" height="1.5" fill="#4e4560"/>
      <rect x="36" y="38" width="14" height="1.5" fill="#4e4560"/>

      {/* ── Door frame posts ── */}
      <rect x="12"   y="36" width="2.5" height="14" fill="#6b4c2a"/>
      <rect x="35.5" y="36" width="2.5" height="14" fill="#6b4c2a"/>

      {isOpen ? (
        /* ── Open: dark entryway + green threshold glow ── */
        <>
          <rect x="14.5" y="38" width="21" height="12" fill="#0a0f1a"/>
          {/* Ambient light spill from inside bar */}
          <rect x="14.5" y="38" width="21" height="2" fill="#fbbf24" opacity="0.04"/>
          {/* Green threshold strip */}
          <rect x="14.5" y="49.2" width="21" height="0.8" fill="#10b981" opacity="0.8"/>
          {/* Soft green glow on floor just inside threshold */}
          <rect x="16" y="46" width="18" height="3" fill="#10b981" opacity="0.06"/>
        </>
      ) : (
        /* ── Closed: wooden door panel + knob + swing arc ── */
        <>
          {/* Door panel body */}
          <rect x="14.5" y="38" width="21" height="12" fill="#8B5E3C"/>
          {/* Recessed panel details */}
          <rect x="16"   y="39.5" width="8" height="4.5" rx="0.5" fill="#7a5230" opacity="0.6"/>
          <rect x="26"   y="39.5" width="8" height="4.5" rx="0.5" fill="#7a5230" opacity="0.6"/>
          <rect x="16"   y="45"   width="8" height="4"   rx="0.5" fill="#7a5230" opacity="0.6"/>
          <rect x="26"   y="45"   width="8" height="4"   rx="0.5" fill="#7a5230" opacity="0.6"/>
          {/* Brass door knob */}
          <circle cx="34" cy="44" r="1.5" fill="#d4a843"/>
          <circle cx="34" cy="44" r="0.8" fill="#f0c060"/>
          {/* Door swing arc (hinge at left post, opens inward) */}
          <path
            d="M 14.5 38 A 21 21 0 0 1 35.5 38"
            stroke="#10b981"
            strokeWidth="0.7"
            fill="none"
            strokeDasharray="2,1.5"
            opacity="0.45"
          />
          {/* Bottom threshold */}
          <rect x="14.5" y="49.5" width="21" height="0.5" fill="#5a3e20" opacity="0.8"/>
        </>
      )}
    </svg>
  );
}
