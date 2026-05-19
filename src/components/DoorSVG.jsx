export default function DoorSVG({ isOpen = false }) {
  return (
    <svg
      viewBox="0 0 50 17"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '33%', pointerEvents: 'none' }}
    >
      {/* Frame: top lintel + side posts */}
      <rect x="0" y="0" width="50" height="3" fill="#6b4c2a"/>
      <rect x="0" y="0" width="3" height="17" fill="#6b4c2a"/>
      <rect x="47" y="0" width="3" height="17" fill="#6b4c2a"/>

      {isOpen ? (
        <>
          <rect x="3" y="3" width="44" height="14" fill="#0a0f1a"/>
          <rect x="3" y="16" width="44" height="1" fill="#10b981" opacity="0.8"/>
        </>
      ) : (
        <>
          <rect x="3" y="3" width="44" height="14" fill="#8B5E3C"/>
          <rect x="6" y="5" width="17" height="9" rx="0.5" fill="#7a5230" opacity="0.5"/>
          <rect x="27" y="5" width="17" height="9" rx="0.5" fill="#7a5230" opacity="0.5"/>
          <circle cx="44" cy="10" r="1.5" fill="#d4a843"/>
          <circle cx="44" cy="10" r="0.8" fill="#f0c060"/>
        </>
      )}
    </svg>
  );
}
