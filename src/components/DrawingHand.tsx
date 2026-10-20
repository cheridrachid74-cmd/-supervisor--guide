import React from 'react';

export type HandStyle = 'classic' | 'school' | 'natural';

interface DrawingHandProps {
  markerColor: 'black' | 'blue' | 'red';
  handStyle?: HandStyle;
  isWriting?: boolean;
}

export const DrawingHand: React.FC<DrawingHandProps> = ({
  markerColor = 'black',
  handStyle = 'classic',
  isWriting = true
}) => {
  // Marker color theme values
  const colorSchemes = {
    black: {
      ink: '#171717',
      inkShine: '#404040',
      barrelGradStart: '#262626',
      barrelGradMid: '#525252',
      barrelGradEnd: '#171717',
      accent: '#38bdf8', // accent band
      ring: '#09090b',
      labelBg: '#ffffff',
      labelBorder: '#e5e7eb'
    },
    blue: {
      ink: '#1d4ed8',
      inkShine: '#60a5fa',
      barrelGradStart: '#1e40af',
      barrelGradMid: '#3b82f6',
      barrelGradEnd: '#172554',
      accent: '#93c5fd',
      ring: '#1e3a8a',
      labelBg: '#ffffff',
      labelBorder: '#bfdbfe'
    },
    red: {
      ink: '#dc2626',
      inkShine: '#f87171',
      barrelGradStart: '#b91c1c',
      barrelGradMid: '#ef4444',
      barrelGradEnd: '#7f1d1d',
      accent: '#fca5a5',
      ring: '#991b1b',
      labelBg: '#ffffff',
      labelBorder: '#fecaca'
    }
  };

  const scheme = colorSchemes[markerColor];

  // Sleeve color by style
  const sleeveConfig = {
    classic: {
      sleeveGradStart: '#1e293b',
      sleeveGradEnd: '#0f172a',
      cuffColor: '#f8fafc',
      cuffShadow: '#cbd5e1',
      hasWatch: false
    },
    school: {
      sleeveGradStart: '#2563eb',
      sleeveGradEnd: '#1d4ed8',
      cuffColor: '#ffffff',
      cuffShadow: '#93c5fd',
      hasWatch: false
    },
    natural: {
      sleeveGradStart: '#475569',
      sleeveGradEnd: '#334155',
      cuffColor: '#e2e8f0',
      cuffShadow: '#94a3b8',
      hasWatch: true
    }
  };

  const sleeve = sleeveConfig[handStyle] || sleeveConfig.classic;

  return (
    <div className="relative pointer-events-none select-none drop-shadow-xl filter">
      <svg
        width="220"
        height="230"
        viewBox="0 0 220 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-100 ease-out origin-[14px_14px] ${
          isWriting ? 'rotate-[0.5deg]' : 'rotate-[-1deg]'
        }`}
      >
        <defs>
          {/* Surface Shadow on whiteboard */}
          <filter id="surface-cast-shadow" x="-30%" y="-30%" width="180%" height="180%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
            <feOffset dx="10" dy="14" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.22" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Marker Barrel 3D Cylindrical Gradient */}
          <linearGradient id="markerBarrelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={scheme.barrelGradStart} />
            <stop offset="35%" stopColor={scheme.barrelGradMid} />
            <stop offset="70%" stopColor={scheme.barrelGradEnd} />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>

          {/* Marker Collar / Grip Gradient */}
          <linearGradient id="markerCollarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="45%" stopColor="#64748b" />
            <stop offset="85%" stopColor="#1e293b" />
          </linearGradient>

          {/* Skin Gradients */}
          <linearGradient id="skinMainGrad" x1="20%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="30%" stopColor="#fdba74" />
            <stop offset="70%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <linearGradient id="skinHighlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="60%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>

          <linearGradient id="skinShadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="70%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </linearGradient>

          {/* Sleeve Gradient */}
          <linearGradient id="sleeveGrad" x1="20%" y1="20%" x2="90%" y2="90%">
            <stop offset="0%" stopColor={sleeve.sleeveGradStart} />
            <stop offset="60%" stopColor={sleeve.sleeveGradEnd} />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Fingernail Gradient */}
          <linearGradient id="nailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="50%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
        </defs>

        {/* 1. Whiteboard Soft Cast Shadow underneath */}
        <g opacity="0.45" filter="url(#surface-cast-shadow)">
          {/* Shadow from marker nib & barrel */}
          <path
            d="M 16 16 L 36 38 L 88 92 L 68 106 L 24 44 Z"
            fill="#0f172a"
            opacity="0.5"
          />
          {/* Shadow from hand and wrist */}
          <ellipse cx="98" cy="116" rx="46" ry="34" transform="rotate(38 98 116)" fill="#0f172a" opacity="0.6" />
          <path d="M 95 110 L 195 195 L 155 225 L 80 145 Z" fill="#0f172a" opacity="0.5" />
        </g>

        {/* 2. Marker Pen */}
        <g id="marker-pen-group">
          {/* A. Chisel Tip (Nib) - Exact contact at (14, 14) */}
          <g id="marker-nib">
            {/* Dark Ink Chisel Tip */}
            <path
              d="M 14 14 L 20 22 L 23 20 L 19 13 Z"
              fill={scheme.ink}
            />
            {/* Chisel Bevel facet with subtle highlight */}
            <polygon
              points="14,14 17,13 22,18 20,22"
              fill={scheme.inkShine}
              opacity="0.8"
            />
          </g>

          {/* B. Plastic Collar / Chisel Holder */}
          <g id="marker-collar">
            <path
              d="M 19 13 L 26 21 L 34 29 L 26 36 L 19 28 Z"
              fill="url(#markerCollarGrad)"
              stroke="#0f172a"
              strokeWidth="0.8"
            />
            {/* Grip Ridges */}
            <line x1="22" y1="18" x2="27" y2="24" stroke="#475569" strokeWidth="0.8" />
            <line x1="25" y1="22" x2="30" y2="28" stroke="#475569" strokeWidth="0.8" />
          </g>

          {/* C. Marker Main Barrel (Cylindrical Dry-Erase Body) */}
          <g id="marker-barrel">
            {/* Main Body */}
            <path
              d="M 28 25 L 42 39 L 102 100 L 88 114 L 28 54 Z"
              fill="url(#markerBarrelGrad)"
              stroke="#09090b"
              strokeWidth="1"
            />

            {/* Specular Cylindrical Reflection Streak */}
            <path
              d="M 32 27 L 44 40 L 98 94 L 94 98 L 30 33 Z"
              fill="#ffffff"
              opacity="0.32"
            />

            {/* Dry-Erase Label Wrap */}
            <path
              d="M 44 41 L 54 51 L 82 80 L 72 89 Z"
              fill={scheme.labelBg}
              stroke={scheme.labelBorder}
              strokeWidth="0.6"
            />
            {/* Brand Logo & Text Markings on Barrel */}
            <g transform="translate(60, 62) rotate(45)" opacity="0.85">
              <rect x="-14" y="-2" width="28" height="4" rx="1" fill={scheme.ink} />
              <line x1="-12" y1="4" x2="12" y2="4" stroke="#64748b" strokeWidth="0.8" />
              <line x1="-12" y1="6" x2="8" y2="6" stroke="#94a3b8" strokeWidth="0.6" />
            </g>

            {/* Accent Color Band */}
            <path
              d="M 37 34 L 41 38 L 47 32 L 43 28 Z"
              fill={scheme.accent}
              opacity="0.9"
            />

            {/* End Cap */}
            <path
              d="M 98 96 L 108 106 L 98 116 L 88 106 Z"
              fill="#09090b"
              stroke="#1e293b"
              strokeWidth="0.8"
            />
          </g>
        </g>

        {/* 3. The Hand (Anatomically Realistic Drawing Hand) */}
        <g id="realistic-hand-group">
          {/* A. Middle Finger (Curled underneath the marker for realistic grip) */}
          <g id="middle-finger">
            {/* Finger body underneath barrel */}
            <path
              d="M 38 48 C 34 54 36 64 44 68 C 50 71 58 68 62 60 L 52 50 Z"
              fill="url(#skinShadowGrad)"
            />
            {/* Knuckle shadow */}
            <path
              d="M 40 56 C 44 62 50 63 56 58"
              stroke="#9a3412"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* B. Index Finger (Resting naturally and firmly on the marker grip) */}
          <g id="index-finger">
            {/* Main Finger Shaft */}
            <path
              d="M 44 32 C 38 34 32 40 33 46 C 34 50 38 52 44 48 C 50 44 62 36 70 42 C 78 48 84 54 88 64 L 98 56 C 94 44 84 34 72 30 C 60 26 50 30 44 32 Z"
              fill="url(#skinMainGrad)"
              stroke="#c2410c"
              strokeWidth="0.8"
            />

            {/* Index Finger Highlight */}
            <path
              d="M 40 38 C 37 42 38 46 42 45 C 48 42 60 34 68 38 C 74 42 80 48 84 55"
              stroke="url(#skinHighlightGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />

            {/* Fingernail of Index Finger */}
            <path
              d="M 34 42 C 34 39 37 38 40 40 C 41 42 40 45 37 46 C 35 46 34 44 34 42 Z"
              fill="url(#nailGrad)"
              stroke="#f97316"
              strokeWidth="0.6"
            />
            {/* Nail Gloss Sheen */}
            <path
              d="M 36 41 C 37 40 39 41 39 42"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Knuckle Creases */}
            <path
              d="M 64 33 C 66 36 67 39 65 42"
              stroke="#9a3412"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 76 40 C 78 44 79 48 77 51"
              stroke="#9a3412"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
          </g>

          {/* C. Thumb (Supporting the marker from opposite side with realistic curve) */}
          <g id="thumb">
            {/* Thumb Pad & Knuckle */}
            <path
              d="M 52 56 C 46 54 44 62 48 70 C 53 77 62 82 72 82 C 82 82 92 76 96 68 L 86 58 C 78 64 68 66 60 62 C 55 60 54 57 52 56 Z"
              fill="url(#skinMainGrad)"
              stroke="#c2410c"
              strokeWidth="0.8"
            />

            {/* Thumb Highlight curve */}
            <path
              d="M 50 64 C 54 72 62 76 72 76 C 78 76 84 72 88 66"
              stroke="url(#skinHighlightGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />

            {/* Thumb Nail */}
            <path
              d="M 48 60 C 47 57 50 56 53 58 C 55 60 54 64 51 64 C 49 64 48 62 48 60 Z"
              fill="url(#nailGrad)"
              stroke="#ea580c"
              strokeWidth="0.5"
            />
          </g>

          {/* D. Back of Hand and Palm */}
          <g id="hand-palm">
            <path
              d="M 72 30 C 86 28 102 36 112 46 C 120 54 126 66 128 78 C 130 90 126 102 118 112 C 108 120 96 122 84 116 C 74 110 68 98 72 82 L 96 68 C 92 56 82 46 72 30 Z"
              fill="url(#skinMainGrad)"
              stroke="#c2410c"
              strokeWidth="0.7"
            />

            {/* Palm & Wrist Tendon Highlight */}
            <path
              d="M 88 38 C 100 44 110 54 116 68 C 118 78 116 88 110 98"
              stroke="url(#skinHighlightGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />

            {/* Subtle Knuckle lines for ring and pinky fingers */}
            <path
              d="M 94 44 C 98 48 102 54 104 60"
              stroke="#c2410c"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </g>

          {/* E. Wrist & Watch (if natural style) */}
          {sleeve.hasWatch && (
            <g id="wrist-watch">
              {/* Watch Strap */}
              <path
                d="M 106 104 L 128 92 L 140 108 L 118 120 Z"
                fill="#78350f"
                stroke="#451a03"
                strokeWidth="1"
              />
              {/* Watch Dial */}
              <circle cx="123" cy="106" r="9" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
              <circle cx="123" cy="106" r="7" fill="#1e293b" />
              <line x1="123" y1="106" x2="123" y2="101" stroke="#f8fafc" strokeWidth="1" strokeLinecap="round" />
              <line x1="123" y1="106" x2="127" y2="106" stroke="#f8fafc" strokeWidth="1" strokeLinecap="round" />
            </g>
          )}

          {/* F. Shirt Cuff (Crisp white/clean dress shirt cuff) */}
          <g id="shirt-cuff">
            <path
              d="M 112 108 L 134 94 L 144 108 L 122 122 Z"
              fill={sleeve.cuffColor}
              stroke={sleeve.cuffShadow}
              strokeWidth="1.2"
            />
            {/* Cuff Seam / Button */}
            <circle cx="130" cy="106" r="1.8" fill="#94a3b8" />
            <line x1="116" y1="107" x2="136" y2="95" stroke="#cbd5e1" strokeWidth="1" />
          </g>

          {/* G. Arm Sleeve (Jacket / Blazer / Apron sleeve entering from bottom right) */}
          <g id="arm-sleeve">
            <path
              d="M 120 120 L 142 106 L 210 178 L 180 216 L 118 136 Z"
              fill="url(#sleeveGrad)"
              stroke="#0f172a"
              strokeWidth="1.2"
            />

            {/* Sleeve Fabric Fold / Wrinkle Lines */}
            <path
              d="M 148 124 C 160 142 170 156 186 170"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.18"
            />
            <path
              d="M 136 136 C 146 150 158 166 172 182"
              stroke="#000000"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
