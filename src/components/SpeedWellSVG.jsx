const TRANSFORMS = {
  N: null,
  S: 'matrix(-1,0,0,-1,50,50)',
  E: 'matrix(0,1,-1,0,50,0)',
  W: 'matrix(0,-1,1,0,0,50)',
};

export default function SpeedWellSVG({ orientation = 'N' }) {
  return (
    <svg
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <g transform={TRANSFORMS[orientation] || undefined}>

        {/* Cabinet body */}
        <rect x="0" y="0" width="50" height="50" fill="#6a7e88"/>

        {/* Main top surface — stainless steel */}
        <rect x="2" y="2" width="46" height="46" fill="#a0b4be"/>

        {/* Surface sheen */}
        <rect x="2"  y="2" width="46" height="2"  fill="#bcd0d8" opacity="0.7"/>
        <rect x="2"  y="2" width="2"  height="46" fill="#bcd0d8" opacity="0.5"/>
        <rect x="46" y="2" width="2"  height="46" fill="#607888" opacity="0.5"/>

        {/* Ice bin (back third) */}
        <rect x="2" y="2" width="46" height="16" fill="#5e8898"/>
        <rect x="3" y="3" width="44" height="14" fill="#709aaa"/>
        {/* Ice chunks */}
        <rect x="6"  y="5"  width="5" height="4" rx="1" fill="#c8e4ee" opacity="0.7"/>
        <rect x="14" y="6"  width="4" height="3" rx="1" fill="#d8eef6" opacity="0.6"/>
        <rect x="22" y="4"  width="6" height="4" rx="1" fill="#c0dcea" opacity="0.7"/>
        <rect x="32" y="6"  width="4" height="3" rx="1" fill="#cce4f0" opacity="0.6"/>
        <rect x="39" y="5"  width="5" height="5" rx="1" fill="#b8d8e8" opacity="0.7"/>
        <rect x="10" y="10" width="5" height="3" rx="1" fill="#d0e8f4" opacity="0.5"/>
        <rect x="28" y="11" width="6" height="3" rx="1" fill="#c4e0ec" opacity="0.6"/>

        {/* Well openings — circular bottle/speed-well ports */}
        {[9, 19, 29, 39].map(cx => (
          <g key={cx}>
            <circle cx={cx} cy="29" r="5.5" fill="#4a6270"/>
            <circle cx={cx} cy="29" r="4"   fill="#354e5c"/>
            <circle cx={cx} cy="29" r="2.5" fill="#263a48"/>
            <circle cx={cx} cy="29" r="1"   fill="#1a2a34" opacity="0.8"/>
          </g>
        ))}

        {/* Speed rail — bar tool trough between ice bin and wells */}
        <rect x="2" y="20" width="46" height="4" fill="#889eaa"/>
        <line x1="2" y1="22" x2="48" y2="22" stroke="#6a8290" strokeWidth="0.5" opacity="0.6"/>

        {/* Front counter edge */}
        <rect x="0" y="42" width="50" height="8" fill="#567080"/>
        <rect x="2" y="43" width="46" height="2" fill="#7090a0" opacity="0.6"/>
        {/* Speed rail handle lip */}
        <rect x="4" y="43.5" width="42" height="1.5" rx="0.8" fill="#90a8b4" opacity="0.5"/>

      </g>
    </svg>
  );
}
