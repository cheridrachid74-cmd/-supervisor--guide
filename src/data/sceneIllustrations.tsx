import React from 'react';

export interface SceneDrawStep {
  id: string;
  name: string;
  startProgress: number; // 0 to 1
  endProgress: number;   // 0 to 1
  pathCoord: { x: number; y: number };
}

export function renderSceneSvg(key: string, progress: number): React.ReactNode {
  // progress is 0.0 to 1.0
  // Each visual element becomes visible or reveals its stroke-dashoffset based on progress
  const clamp = (val: number, min = 0, max = 1) => Math.max(min, Math.min(max, val));

  switch (key) {
    case 'school_intro': {
      // Step 1: School building base (0 to 0.4)
      const p1 = clamp(progress / 0.4);
      // Step 2: Algerian Flag (0.35 to 0.7)
      const p2 = clamp((progress - 0.35) / 0.35);
      // Step 3: Arabic Calligraphy Title (0.65 to 1.0)
      const p3 = clamp((progress - 0.65) / 0.35);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle grid background like whiteboard */}
          <defs>
            <pattern id="wb-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="flag-green" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#006233" />
              <stop offset="100%" stopColor="#007a3d" />
            </linearGradient>
            <filter id="sketch-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.1" />
            </filter>
          </defs>
          <rect width="800" height="500" fill="url(#wb-grid)" />

          {/* Ground Line */}
          {p1 > 0.05 && (
            <path
              d="M 50 400 L 750 400"
              stroke="#334155"
              strokeWidth="3.5"
              strokeDasharray="700"
              strokeDashoffset={700 * (1 - p1)}
              strokeLinecap="round"
            />
          )}

          {/* School Building */}
          {p1 > 0.1 && (
            <g className="transition-opacity duration-300" style={{ opacity: p1 > 0.15 ? 1 : p1 * 5 }}>
              {/* Main Facade */}
              <rect
                x="200"
                y="180"
                width="400"
                height="220"
                rx="6"
                fill="#ffffff"
                stroke="#1e293b"
                strokeWidth="4"
                strokeDasharray="1240"
                strokeDashoffset={1240 * (1 - p1)}
              />

              {/* Pediment / Triangular Roof */}
              <polygon
                points="200,180 400,90 600,180"
                fill="#f8fafc"
                stroke="#1e293b"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeDasharray="900"
                strokeDashoffset={900 * (1 - p1)}
              />

              {/* Pediment Clock / Emblem */}
              {p1 > 0.6 && (
                <circle cx="400" cy="145" r="22" fill="#fef08a" stroke="#1e293b" strokeWidth="3" />
              )}
              {p1 > 0.7 && (
                <>
                  <line x1="400" y1="145" x2="400" y2="132" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="400" y1="145" x2="410" y2="145" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}

              {/* School Pillars */}
              {p1 > 0.5 && (
                <g stroke="#334155" strokeWidth="3.5" strokeLinecap="round">
                  <line x1="260" y1="180" x2="260" y2="400" />
                  <line x1="330" y1="180" x2="330" y2="400" />
                  <line x1="470" y1="180" x2="470" y2="400" />
                  <line x1="540" y1="180" x2="540" y2="400" />
                </g>
              )}

              {/* Central Main Entrance Door */}
              {p1 > 0.7 && (
                <g>
                  <path d="M 370 400 L 370 280 A 30 30 0 0 1 430 280 L 430 400 Z" fill="#e2e8f0" stroke="#0f172a" strokeWidth="3.5" />
                  <line x1="400" y1="265" x2="400" y2="400" stroke="#0f172a" strokeWidth="2.5" />
                  <circle cx="390" cy="345" r="3.5" fill="#0f172a" />
                  <circle cx="410" cy="345" r="3.5" fill="#0f172a" />
                  {/* Steps */}
                  <rect x="350" y="396" width="100" height="8" rx="2" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
                </g>
              )}

              {/* Classroom Windows */}
              {p1 > 0.8 && (
                <g fill="#e0f2fe" stroke="#0284c7" strokeWidth="3">
                  <rect x="220" y="220" width="30" height="45" rx="3" />
                  <rect x="220" y="300" width="30" height="45" rx="3" />
                  <rect x="550" y="220" width="30" height="45" rx="3" />
                  <rect x="550" y="300" width="30" height="45" rx="3" />
                </g>
              )}
            </g>
          )}

          {/* Algerian Flag flying proudly over the school */}
          {p2 > 0.05 && (
            <g>
              {/* Flag Pole */}
              <line
                x1="400"
                y1="90"
                x2="400"
                y2="20"
                stroke="#475569"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="70"
                strokeDashoffset={70 * (1 - p2)}
              />
              <circle cx="400" cy="18" r="4.5" fill="#eab308" />

              {/* Flag Banner */}
              {p2 > 0.3 && (
                <g transform="translate(400, 22)">
                  {/* Green Left / Right (Arabic perspective) */}
                  <rect x="0" y="0" width="45" height="55" fill="#006233" stroke="#006233" strokeWidth="1" />
                  <rect x="45" y="0" width="45" height="55" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Red Crescent & Star in Center */}
                  <g transform="translate(45, 27.5)">
                    {/* Crescent */}
                    <path
                      d="M 0 -13 A 13 13 0 0 1 0 13 A 10 10 0 0 0 0 -13 Z"
                      fill="#d21034"
                    />
                    {/* 5-pointed Star */}
                    <polygon
                      points="6,-4 7.8,-0.5 12,-0.5 8.5,2 10,6 6,3.5 2,6 3.5,2 0,-0.5 4.2,-0.5"
                      fill="#d21034"
                      transform="scale(0.8) translate(2, -2)"
                    />
                  </g>
                  {/* Flag Wave Border */}
                  <path d="M 0 0 C 30 -3, 60 4, 90 0 L 90 55 C 60 59, 30 52, 0 55 Z" fill="none" stroke="#0f172a" strokeWidth="2.5" />
                </g>
              )}
            </g>
          )}

          {/* Title Banner & Calligraphy */}
          {p3 > 0.1 && (
            <g transform="translate(400, 445)">
              <rect
                x="-250"
                y="-32"
                width="500"
                height="64"
                rx="32"
                fill="#ffffff"
                stroke="#059669"
                strokeWidth="3.5"
                filter="url(#sketch-shadow)"
              />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#065f46"
                fontWeight="800"
                fontSize="22"
                fontFamily="'Cairo', sans-serif"
              >
                النظام الداخلي للمؤسسة التعليمية
              </text>
              <text
                x="0"
                y="22"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#64748b"
                fontWeight="600"
                fontSize="12"
                fontFamily="'Tajawal', sans-serif"
              >
                السنة الدراسية 2026 / 2027 • وزارة التربية الوطنية
              </text>
            </g>
          )}

          {/* Welcoming Sunshine & Birds */}
          {progress > 0.85 && (
            <g>
              <circle cx="100" cy="80" r="30" fill="#fef08a" stroke="#eab308" strokeWidth="3" />
              <line x1="100" y1="35" x2="100" y2="20" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
              <line x1="100" y1="125" x2="100" y2="140" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
              <line x1="45" y1="80" x2="30" y2="80" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
              <line x1="155" y1="80" x2="170" y2="80" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
              <path d="M 670 70 Q 685 60 700 70 Q 715 60 730 70" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
        </svg>
      );
    }

    case 'discipline_timing': {
      // Scene 2: Clock (0 to 0.4), Pinafore Student (0.35 to 0.75), Bell & Motto (0.7 to 1.0)
      const p1 = clamp(progress / 0.4);
      const p2 = clamp((progress - 0.35) / 0.4);
      const p3 = clamp((progress - 0.7) / 0.3);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wb-grid-2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#wb-grid-2)" />

          {/* Clock: 07:45 before flag raising */}
          {p1 > 0.05 && (
            <g transform="translate(180, 190)">
              {/* Outer circle */}
              <circle
                cx="0"
                cy="0"
                r="95"
                fill="#ffffff"
                stroke="#1e40af"
                strokeWidth="7"
                strokeDasharray="600"
                strokeDashoffset={600 * (1 - p1)}
              />
              <circle cx="0" cy="0" r="105" fill="none" stroke="#93c5fd" strokeWidth="2.5" strokeDasharray="6 4" />
              <circle cx="0" cy="0" r="6" fill="#1e3a8a" />

              {/* Hour Marks */}
              {p1 > 0.4 && (
                <g stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round">
                  <line x1="0" y1="-80" x2="0" y2="-68" />
                  <line x1="80" y1="0" x2="68" y2="0" />
                  <line x1="0" y1="80" x2="0" y2="68" />
                  <line x1="-80" y1="0" x2="-68" y2="0" />
                </g>
              )}

              {/* Hands: Pointing to 07:45 */}
              {p1 > 0.6 && (
                <g strokeLinecap="round">
                  {/* Hour Hand towards 7/8 */}
                  <line x1="0" y1="0" x2="-35" y2="35" stroke="#1e293b" strokeWidth="6" />
                  {/* Minute Hand towards 9 (45 minutes) */}
                  <line x1="0" y1="0" x2="-68" y2="0" stroke="#dc2626" strokeWidth="4.5" />
                </g>
              )}

              {/* Digital Time Badge */}
              {p1 > 0.8 && (
                <g transform="translate(0, 50)">
                  <rect x="-42" y="-14" width="84" height="28" rx="6" fill="#1e293b" />
                  <text x="0" y="4" textAnchor="middle" fill="#22c55e" fontSize="14" fontFamily="monospace" fontWeight="bold">
                    07:45
                  </text>
                </g>
              )}

              {/* Clock Label */}
              {p1 > 0.9 && (
                <text x="0" y="135" textAnchor="middle" fill="#1e40af" fontWeight="700" fontSize="16">
                  قبل تحية العلم (المادة 4)
                </text>
              )}
            </g>
          )}

          {/* Student Wearing Neat Pinafore / School Apron */}
          {p2 > 0.05 && (
            <g transform="translate(420, 240)">
              {/* Head */}
              <circle cx="0" cy="-110" r="34" fill="#fed7aa" stroke="#1e293b" strokeWidth="3.5" />
              {/* Hair */}
              <path d="M -34 -115 C -34 -145, 34 -145, 34 -115 Z" fill="#475569" stroke="#1e293b" strokeWidth="3" />
              {/* Smiling Face */}
              {p2 > 0.4 && (
                <g>
                  <circle cx="-10" cy="-112" r="3" fill="#1e293b" />
                  <circle cx="10" cy="-112" r="3" fill="#1e293b" />
                  <path d="M -8 -100 Q 0 -92 8 -100" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}

              {/* School Apron / Pinafore (المئزر المدرسي - المادة 46) */}
              <path
                d="M -30 -70 L -45 50 L 45 50 L 30 -70 Z"
                fill="#dbeafe"
                stroke="#2563eb"
                strokeWidth="4"
                strokeDasharray="350"
                strokeDashoffset={350 * (1 - p2)}
              />

              {/* Collar & Buttons */}
              {p2 > 0.5 && (
                <g>
                  <polygon points="-15,-70 0,-50 15,-70" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                  <circle cx="0" cy="-35" r="3" fill="#2563eb" />
                  <circle cx="0" cy="-15" r="3" fill="#2563eb" />
                  <circle cx="0" cy="5" r="3" fill="#2563eb" />
                  {/* Pocket with Pen */}
                  <rect x="15" y="-30" width="18" height="22" rx="3" fill="#bfdbfe" stroke="#2563eb" strokeWidth="2" />
                  <line x1="24" y1="-36" x2="24" y2="-28" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}

              {/* Legs & Shoes */}
              {p2 > 0.7 && (
                <g stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round">
                  <line x1="-18" y1="50" x2="-18" y2="105" />
                  <line x1="18" y1="50" x2="18" y2="105" />
                  <rect x="-28" y="105" width="20" height="10" rx="3" fill="#334155" />
                  <rect x="8" y="105" width="20" height="10" rx="3" fill="#334155" />
                </g>
              )}

              {/* Student Backpack & Notebook */}
              {p2 > 0.8 && (
                <g transform="translate(-48, -40)">
                  <rect x="0" y="0" width="14" height="42" rx="4" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" />
                </g>
              )}

              <text x="0" y="140" textAnchor="middle" fill="#2563eb" fontWeight="700" fontSize="16">
                المئزر والهندام اللائق (المادة 46)
              </text>
            </g>
          )}

          {/* School Bell & Vibration Waves */}
          {p3 > 0.05 && (
            <g transform="translate(660, 190)">
              {/* Bell Body */}
              <path
                d="M -30 20 C -30 -35, 30 -35, 30 20 L 40 32 L -40 32 Z"
                fill="#fef08a"
                stroke="#ca8a04"
                strokeWidth="4"
              />
              <circle cx="0" cy="38" r="8" fill="#ca8a04" />
              <rect x="-10" y="-42" width="20" height="10" rx="4" fill="#a16207" />

              {/* Sound Ring Waves */}
              {p3 > 0.4 && (
                <g stroke="#eab308" strokeWidth="3" fill="none" strokeLinecap="round">
                  <path d="M 50 0 A 35 35 0 0 1 50 35" />
                  <path d="M 65 -15 A 55 55 0 0 1 65 50" />
                  <path d="M -50 0 A 35 35 0 0 0 -50 35" />
                  <path d="M -65 -15 A 55 55 0 0 0 -65 50" />
                </g>
              )}

              <text x="0" y="70" textAnchor="middle" fill="#854d0e" fontWeight="700" fontSize="16">
                جرس الانضباط
              </text>
            </g>
          )}

          {/* Bottom Banner */}
          {progress > 0.85 && (
            <g transform="translate(400, 445)">
              <rect x="-240" y="-28" width="480" height="56" rx="28" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3" />
              <text x="0" y="8" textAnchor="middle" fill="#1e3a8a" fontWeight="800" fontSize="20">
                «الانضباط سر التفوق.. ولا مكان لتضييع الوقت»
              </text>
            </g>
          )}
        </svg>
      );
    }

    case 'safety_focus': {
      // Scene 3: Banned Smartphone (0 to 0.45), Open Book/Study (0.4 to 0.8), Security Shield (0.7 to 1.0)
      const p1 = clamp(progress / 0.45);
      const p2 = clamp((progress - 0.4) / 0.4);
      const p3 = clamp((progress - 0.7) / 0.3);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wb-grid-3" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#wb-grid-3)" />

          {/* Smartphone with Prohibition Sign (المادة 43) */}
          {p1 > 0.05 && (
            <g transform="translate(220, 220)">
              {/* Phone Frame */}
              <rect
                x="-55"
                y="-95"
                width="110"
                height="190"
                rx="18"
                fill="#f8fafc"
                stroke="#334155"
                strokeWidth="5"
                strokeDasharray="600"
                strokeDashoffset={600 * (1 - p1)}
              />
              <rect x="-46" y="-78" width="92" height="150" rx="6" fill="#0f172a" />
              {/* Speaker / Camera notch */}
              <circle cx="0" cy="-86" r="3.5" fill="#64748b" />
              {/* Home bar */}
              <line x1="-20" y1="82" x2="20" y2="82" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />

              {/* Bold Red Ban Ring & Diagonal Slash (❌ / 🚫) */}
              {p1 > 0.4 && (
                <g>
                  <circle
                    cx="0"
                    cy="-3"
                    r="82"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="11"
                    strokeDasharray="520"
                    strokeDashoffset={520 * (1 - clamp((p1 - 0.4) / 0.4))}
                  />
                  <line
                    x1="-58"
                    y1="-61"
                    x2="58"
                    y2="55"
                    stroke="#dc2626"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {p1 > 0.8 && (
                <text x="0" y="130" textAnchor="middle" fill="#b91c1c" fontWeight="800" fontSize="16">
                  ممنوع منعا باتاً داخل الأقسام (المادة 43)
                </text>
              )}
            </g>
          )}

          {/* Open Book & Learning Tools */}
          {p2 > 0.05 && (
            <g transform="translate(560, 210)">
              {/* Book Spine & Pages */}
              <path
                d="M 0 45 Q -70 30 -140 45 L -140 -55 Q -70 -70 0 -55 Q 70 -70 140 -55 L 140 45 Q 70 30 0 45 Z"
                fill="#ffffff"
                stroke="#1e293b"
                strokeWidth="4"
                strokeDasharray="650"
                strokeDashoffset={650 * (1 - p2)}
              />
              {/* Center Fold */}
              <line x1="0" y1="-55" x2="0" y2="45" stroke="#0284c7" strokeWidth="3" />

              {/* Text Lines */}
              {p2 > 0.5 && (
                <g stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="-120" y1="-40" x2="-20" y2="-40" />
                  <line x1="-120" y1="-20" x2="-20" y2="-20" />
                  <line x1="-120" y1="0" x2="-40" y2="0" />
                  <line x1="-120" y1="20" x2="-30" y2="20" />

                  <line x1="20" y1="-40" x2="120" y2="-40" />
                  <line x1="20" y1="-20" x2="120" y2="-20" />
                  <line x1="40" y1="0" x2="120" y2="0" />
                  <line x1="30" y1="20" x2="120" y2="20" />
                </g>
              )}

              {/* Glowing Knowledge Bulb / Focus Star */}
              {p2 > 0.7 && (
                <g transform="translate(0, -95)">
                  <circle cx="0" cy="0" r="22" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
                  {/* Rays */}
                  <g stroke="#eab308" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="0" y1="-28" x2="0" y2="-38" />
                    <line x1="-22" y1="-18" x2="-30" y2="-26" />
                    <line x1="22" y1="-18" x2="30" y2="-26" />
                  </g>
                </g>
              )}

              {/* Pen resting on book */}
              {p2 > 0.85 && (
                <g transform="translate(50, 40) rotate(-35)">
                  <rect x="-6" y="-30" width="12" height="40" rx="3" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
                  <polygon points="-6,-30 0,-42 6,-30" fill="#cbd5e1" stroke="#1d4ed8" strokeWidth="1.5" />
                </g>
              )}

              <text x="0" y="85" textAnchor="middle" fill="#0369a1" fontWeight="800" fontSize="16">
                التركيز في الدرس والتحصيل (المادة 9)
              </text>
            </g>
          )}

          {/* Central Security Shield (المادة 35) */}
          {p3 > 0.05 && (
            <g transform="translate(390, 100)">
              <path
                d="M 0 -35 L 35 -15 L 35 15 C 35 38, 0 52, 0 52 C 0 52, -35 38, -35 15 L -35 -15 Z"
                fill="#dcfce7"
                stroke="#16a34a"
                strokeWidth="3.5"
              />
              <path d="M -12 12 L -4 20 L 15 2" fill="none" stroke="#15803d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          {/* Bottom Banner */}
          {progress > 0.85 && (
            <g transform="translate(400, 445)">
              <rect x="-270" y="-28" width="540" height="56" rx="28" fill="#fef2f2" stroke="#ef4444" strokeWidth="3" />
              <text x="0" y="8" textAnchor="middle" fill="#991b1b" fontWeight="800" fontSize="19">
                «داخل أقسامنا نركز في دروسنا ونبتعد عن كل ما يشتت الذهن أو يهدد السلامة»
              </text>
            </g>
          )}
        </svg>
      );
    }

    case 'environment_clean': {
      // Scene 4: Desk (0 to 0.4), Green Plant/Tree (0.35 to 0.75), Recycling/Canteen (0.7 to 1.0)
      const p1 = clamp(progress / 0.4);
      const p2 = clamp((progress - 0.35) / 0.4);
      const p3 = clamp((progress - 0.7) / 0.3);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wb-grid-4" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#wb-grid-4)" />

          {/* Clean Classroom Study Desk */}
          {p1 > 0.05 && (
            <g transform="translate(200, 260)">
              {/* Desk Top */}
              <polygon
                points="-100,-25 70,-45 130,-25 -40,-5"
                fill="#fed7aa"
                stroke="#9a3412"
                strokeWidth="4"
              />
              {/* Desk Legs */}
              <line x1="-95" y1="-20" x2="-95" y2="70" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
              <line x1="-35" y1="-5" x2="-35" y2="85" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
              <line x1="65" y1="-40" x2="65" y2="50" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
              <line x1="125" y1="-20" x2="125" y2="70" stroke="#475569" strokeWidth="5" strokeLinecap="round" />

              {/* Sparkling Clean Sparkles */}
              {p1 > 0.6 && (
                <g fill="#38bdf8">
                  <path d="M 10 -40 Q 15 -40 15 -45 Q 15 -40 20 -40 Q 15 -40 15 -35 Q 15 -40 10 -40 Z" />
                  <path d="M -60 -25 Q -55 -25 -55 -30 Q -55 -25 -50 -25 Q -55 -25 -55 -20 Q -55 -25 -60 -25 Z" />
                </g>
              )}

              <text x="15" y="115" textAnchor="middle" fill="#9a3412" fontWeight="700" fontSize="15">
                طاولة نظيفة ومرتبة (المادة 31)
              </text>
            </g>
          )}

          {/* Green Plant / Tree (المساحات الخضراء والبيئة المدرسية) */}
          {p2 > 0.05 && (
            <g transform="translate(420, 240)">
              {/* Pot */}
              <polygon points="-30,70 30,70 20,105 -20,105" fill="#f97316" stroke="#c2410c" strokeWidth="3" />
              <rect x="-35" y="65" width="70" height="8" rx="2" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />

              {/* Tree Trunk & Foliage */}
              <path d="M 0 65 L 0 -10" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
              {/* Foliage Clouds */}
              <circle cx="0" cy="-40" r="45" fill="#22c55e" stroke="#15803d" strokeWidth="4" />
              <circle cx="-30" cy="-25" r="30" fill="#16a34a" stroke="#15803d" strokeWidth="3" />
              <circle cx="30" cy="-25" r="30" fill="#4ade80" stroke="#15803d" strokeWidth="3" />
              <circle cx="0" cy="-70" r="28" fill="#86efac" stroke="#15803d" strokeWidth="3" />

              {/* Cute Apple or Flowers */}
              {p2 > 0.7 && (
                <g>
                  <circle cx="-15" cy="-45" r="6" fill="#ef4444" />
                  <circle cx="18" cy="-55" r="6" fill="#ef4444" />
                </g>
              )}

              <text x="0" y="135" textAnchor="middle" fill="#15803d" fontWeight="700" fontSize="15">
                المساحات الخضراء أمانة
              </text>
            </g>
          )}

          {/* Recycling Trash Bin & Canteen Plate */}
          {p3 > 0.05 && (
            <g transform="translate(620, 240)">
              {/* Recycling Bin */}
              <rect x="-35" y="10" width="70" height="90" rx="8" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3.5" />
              <rect x="-42" y="2" width="84" height="12" rx="4" fill="#1e40af" />
              {/* Universal Recycling Symbol */}
              {p3 > 0.4 && (
                <g fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" transform="translate(0, 55) scale(0.85)">
                  <path d="M -15 10 L 0 -18 L 15 10 Z" />
                  <path d="M 0 -18 L 6 -12" />
                  <path d="M 15 10 L 10 17" />
                  <path d="M -15 10 L -18 3" />
                </g>
              )}

              {/* Hot Healthy Meal Symbol (المطعم المدرسي المادة 23 و25) */}
              {p3 > 0.6 && (
                <g transform="translate(0, -60)">
                  <ellipse cx="0" cy="10" rx="38" ry="12" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                  <ellipse cx="0" cy="8" rx="26" ry="7" fill="#fde047" />
                  {/* Steam waves */}
                  <path d="M -10 -5 Q -15 -18 -8 -28" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 10 -5 Q 5 -18 12 -28" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}

              <text x="0" y="135" textAnchor="middle" fill="#1e40af" fontWeight="700" fontSize="15">
                نظافة المطعم والبيئة (المادتان 25 و31)
              </text>
            </g>
          )}

          {/* Bottom Banner */}
          {progress > 0.85 && (
            <g transform="translate(400, 445)">
              <rect x="-270" y="-28" width="540" height="56" rx="28" fill="#f0fdf4" stroke="#22c55e" strokeWidth="3" />
              <text x="0" y="8" textAnchor="middle" fill="#14532d" fontWeight="800" fontSize="19">
                «قسمنا، مطعمنا، ومساحاتنا الخضراء أمانة تعكس وعينا ونظافتنا»
              </text>
            </g>
          )}
        </svg>
      );
    }

    case 'partnership_hands': {
      // Scene 5: Handshake (0 to 0.45), Golden Word Stamps: انضباط تميز نجاح (0.4 to 0.85), Bridge (0.8 to 1.0)
      const p1 = clamp(progress / 0.45);
      const p2 = clamp((progress - 0.4) / 0.45);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wb-grid-5" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#wb-grid-5)" />

          {/* Two Hands Shaking (تكامل المدرسة والأسرة - المادتان 49 و50) */}
          {p1 > 0.05 && (
            <g transform="translate(400, 180)">
              {/* Left Hand / Sleeve (Educator / School) */}
              <g>
                <path d="M -180 -25 L -70 -20 L -60 10 L -180 20 Z" fill="#1e40af" stroke="#172554" strokeWidth="4" />
                <path d="M -70 -20 L -45 -18 L -35 15 L -60 10 Z" fill="#ffffff" stroke="#172554" strokeWidth="3" />
              </g>

              {/* Right Hand / Sleeve (Parent / Family) */}
              <g>
                <path d="M 180 -25 L 70 -20 L 60 10 L 180 20 Z" fill="#047857" stroke="#064e3b" strokeWidth="4" />
                <path d="M 70 -20 L 45 -18 L 35 15 L 60 10 Z" fill="#ffffff" stroke="#064e3b" strokeWidth="3" />
              </g>

              {/* Handshake Grip */}
              <path
                d="M -45 -18 C -20 -35, 20 -35, 45 -18 C 50 10, 10 40, -15 35 C -35 30, -50 10, -45 -18 Z"
                fill="#fed7aa"
                stroke="#1e293b"
                strokeWidth="4"
              />
              <path d="M -20 -15 Q 0 5 20 -15" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              <path d="M -15 5 Q 0 25 15 5" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

              {/* Radiating Cooperation Rays */}
              {p1 > 0.6 && (
                <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">
                  <line x1="0" y1="-50" x2="0" y2="-75" />
                  <line x1="-35" y1="-45" x2="-55" y2="-65" />
                  <line x1="35" y1="-45" x2="55" y2="-65" />
                </g>
              )}

              <text x="-120" y="55" textAnchor="middle" fill="#1e40af" fontWeight="800" fontSize="16">
                المؤسسة التعليمية
              </text>
              <text x="120" y="55" textAnchor="middle" fill="#047857" fontWeight="800" fontSize="16">
                الأسرة والأولياء
              </text>
            </g>
          )}

          {/* Three Success Badges / Stamps: انضباط • تميز • نجاح */}
          {p2 > 0.05 && (
            <g transform="translate(400, 310)">
              {/* Badge 1: انضباط */}
              <g transform="translate(-190, 0)">
                <circle cx="0" cy="0" r="48" fill="#fef3c7" stroke="#d97706" strokeWidth="4" strokeDasharray="8 4" />
                <circle cx="0" cy="0" r="40" fill="#ffffff" stroke="#d97706" strokeWidth="2.5" />
                <text x="0" y="8" textAnchor="middle" fill="#b45309" fontWeight="900" fontSize="20" fontFamily="'Cairo', sans-serif">
                  انضباط
                </text>
              </g>

              {/* Badge 2: تميز */}
              {p2 > 0.35 && (
                <g transform="translate(0, -10)">
                  <circle cx="0" cy="0" r="54" fill="#ede9fe" stroke="#7c3aed" strokeWidth="4" strokeDasharray="8 4" />
                  <circle cx="0" cy="0" r="45" fill="#ffffff" stroke="#7c3aed" strokeWidth="2.5" />
                  <text x="0" y="8" textAnchor="middle" fill="#6d28d9" fontWeight="900" fontSize="22" fontFamily="'Cairo', sans-serif">
                    تميز
                  </text>
                </g>
              )}

              {/* Badge 3: نجاح */}
              {p2 > 0.7 && (
                <g transform="translate(190, 0)">
                  <circle cx="0" cy="0" r="48" fill="#dcfce7" stroke="#16a34a" strokeWidth="4" strokeDasharray="8 4" />
                  <circle cx="0" cy="0" r="40" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
                  <text x="0" y="8" textAnchor="middle" fill="#15803d" fontWeight="900" fontSize="20" fontFamily="'Cairo', sans-serif">
                    نجاح
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Bottom Banner */}
          {progress > 0.85 && (
            <g transform="translate(400, 445)">
              <rect x="-270" y="-28" width="540" height="56" rx="28" fill="#fffbeb" stroke="#f59e0b" strokeWidth="3.5" />
              <text x="0" y="8" textAnchor="middle" fill="#92400e" fontWeight="800" fontSize="19">
                «معاً يداً بيد.. مرافقة الأولياء هي الجسر نحو مستقبل مشرق لأبنائنا»
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Comprehensive Chapter 1: General & Citizenship (Articles 1-3)
    case 'chapter_1_general': {
      const p1 = clamp(progress / 0.35);
      const p2 = clamp((progress - 0.3) / 0.35);
      const p3 = clamp((progress - 0.65) / 0.35);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ch1" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid-ch1)" />

          {/* School Building & Flag in Background */}
          {p1 > 0.05 && (
            <g transform="translate(400, 160)">
              {/* Secondary School Outline */}
              <polygon points="-160,-20 0,-90 160,-20" fill="#f8fafc" stroke="#0f172a" strokeWidth="3.5" />
              <rect x="-140" y="-20" width="280" height="110" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" rx="4" />
              <line x1="-80" y1="-20" x2="-80" y2="90" stroke="#475569" strokeWidth="3" />
              <line x1="80" y1="-20" x2="80" y2="90" stroke="#475569" strokeWidth="3" />
              <rect x="-30" y="20" width="60" height="70" fill="#e2e8f0" stroke="#0f172a" strokeWidth="3" rx="2" />
              {/* Algerian Flag flying */}
              <line x1="0" y1="-90" x2="0" y2="-145" stroke="#334155" strokeWidth="3" />
              <rect x="0" y="-145" width="30" height="35" fill="#006233" />
              <rect x="30" y="-145" width="30" height="35" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="30" cy="-127.5" r="7" fill="#d21034" />
            </g>
          )}

          {/* Official Document Seal & Principles of Citizenship (Articles 1, 2, 3) */}
          {p2 > 0.05 && (
            <g transform="translate(400, 310)">
              <rect x="-240" y="-55" width="480" height="110" rx="16" fill="#ffffff" stroke="#059669" strokeWidth="3.5" />
              {/* Scales of Justice & Citizenship */}
              <g transform="translate(-160, 0)">
                <circle cx="0" cy="0" r="32" fill="#ecfdf5" stroke="#059669" strokeWidth="2.5" />
                <path d="M -15 8 L 0 -15 L 15 8" fill="none" stroke="#059669" strokeWidth="2.5" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#059669" strokeWidth="2.5" />
                <line x1="-18" y1="15" x2="18" y2="15" stroke="#059669" strokeWidth="2.5" />
              </g>
              <text x="-90" y="-20" fill="#065f46" fontWeight="900" fontSize="18" textAnchor="start">
                الفصل 1: أحكام عامة وترسيخ المواطنة
              </text>
              <text x="-90" y="5" fill="#1e293b" fontWeight="700" fontSize="13" textAnchor="start">
                • وثيقة تنظيمية مقننة وملزمة للجميع (المادة 3)
              </text>
              <text x="-90" y="28" fill="#1e293b" fontWeight="700" fontSize="13" textAnchor="start">
                • نبذ العنف الجسدي واللفظي وترسيخ القدوة والأمانة (المادتان 1 و 2)
              </text>
            </g>
          )}

          {/* Banner bottom */}
          {p3 > 0.1 && (
            <g transform="translate(400, 445)">
              <rect x="-260" y="-26" width="520" height="52" rx="26" fill="#065f46" />
              <text x="0" y="7" textAnchor="middle" fill="#ffffff" fontWeight="800" fontSize="18">
                ثانوية ابن الهيثم التقنية • ميثاق السلوك والانضباط المشترك
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Comprehensive Chapter 2: Organization & Daily Operations (Articles 4-13)
    case 'chapter_2_timing_flag': {
      const p1 = clamp(progress / 0.4);
      const p2 = clamp((progress - 0.35) / 0.35);
      const p3 = clamp((progress - 0.7) / 0.3);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ch2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid-ch2)" />

          {/* Left: Timing Clock 07:45 & Gate (Article 4) */}
          {p1 > 0.05 && (
            <g transform="translate(200, 180)">
              <circle cx="0" cy="0" r="85" fill="#f8fafc" stroke="#0284c7" strokeWidth="4" />
              <circle cx="0" cy="0" r="5" fill="#0f172a" />
              {/* Hands at 07:45 */}
              <line x1="0" y1="0" x2="-38" y2="-12" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              <line x1="0" y1="0" x2="-65" y2="0" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
              <rect x="-70" y="45" width="140" height="30" rx="6" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
              <text x="0" y="65" textAnchor="middle" fill="#0369a1" fontWeight="800" fontSize="13">
                فتح الباب 15د قبل
              </text>
            </g>
          )}

          {/* Center: Flag Ceremony & Anthem (Article 6) */}
          {p2 > 0.05 && (
            <g transform="translate(430, 170)">
              <rect x="-10" y="-120" width="16" height="250" fill="#334155" rx="3" />
              {/* Algerian Flag */}
              <g transform="translate(6, -115)">
                <rect x="0" y="0" width="60" height="75" fill="#006233" />
                <rect x="60" y="0" width="60" height="75" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="60" cy="37.5" r="14" fill="#d21034" />
              </g>
              {/* Students in Line */}
              <g transform="translate(130, 20)">
                <circle cx="0" cy="-35" r="14" fill="#fed7aa" stroke="#0f172a" strokeWidth="2.5" />
                <rect x="-18" y="-18" width="36" height="55" rx="4" fill="#0284c7" stroke="#0f172a" strokeWidth="2.5" />
                <text x="0" y="60" textAnchor="middle" fill="#0f172a" fontWeight="800" fontSize="12">تحية العلم</text>
              </g>
            </g>
          )}

          {/* Bottom Card: Corridor Rules & Clubs (Articles 8, 9, 10, 12, 13) */}
          {p3 > 0.05 && (
            <g transform="translate(400, 395)">
              <rect x="-350" y="-55" width="700" height="100" rx="14" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
              <text x="-320" y="-20" fill="#0369a1" fontWeight="800" fontSize="16" textAnchor="start">
                الفصل 2: تنظيم المؤسسة (المواد 04 إلى 13)
              </text>
              <text x="-320" y="8" fill="#334155" fontWeight="600" fontSize="13" textAnchor="start">
                • غلق الأبواب 5 دقائق قبل تحية العلم (م4) • حماية حرمة الأقسام والهدوء في الممرات (م9 وم10)
              </text>
              <text x="-320" y="30" fill="#334155" fontWeight="600" fontSize="13" textAnchor="start">
                • استقبال الأولياء بشارة الزائر (م8) • النوادي العلمية والرياضية والخرجات الميدانية (م12 وم13)
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Comprehensive Chapter 3: Attendance, 48h, Zero Mark & Anti-Cheating (Articles 14-22)
    case 'chapter_3_pedagogy_exams':
    case 'absence_48h':
    case 'tardy_warnings':
    case 'exam_zero':
    case 'exam_integrity': {
      const p1 = clamp(progress / 0.35);
      const p2 = clamp((progress - 0.3) / 0.35);
      const p3 = clamp((progress - 0.65) / 0.35);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ch3" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid-ch3)" />

          {/* Calendar 48h (Article 15) */}
          {p1 > 0.05 && (
            <g transform="translate(190, 160)">
              <rect x="-85" y="-85" width="170" height="170" rx="14" fill="#ffffff" stroke="#ea580c" strokeWidth="4" />
              <rect x="-85" y="-85" width="170" height="45" rx="14" fill="#ea580c" />
              <text x="0" y="-55" textAnchor="middle" fill="#ffffff" fontWeight="800" fontSize="16">مهلة التبرير</text>
              <text x="0" y="15" textAnchor="middle" fill="#ea580c" fontWeight="900" fontSize="46">48</text>
              <text x="0" y="48" textAnchor="middle" fill="#1e293b" fontWeight="800" fontSize="16">ساعة قصوى</text>
              <text x="0" y="72" textAnchor="middle" fill="#64748b" fontWeight="700" fontSize="11">لرخصة الدخول (م15)</text>
            </g>
          )}

          {/* Exam Paper with 00/20 & Anti-Cheating (Articles 20 & 21) */}
          {p2 > 0.05 && (
            <g transform="translate(420, 160)">
              <rect x="-85" y="-95" width="170" height="190" rx="8" fill="#ffffff" stroke="#334155" strokeWidth="3.5" />
              <line x1="-60" y1="-60" x2="60" y2="-60" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="-60" y1="-35" x2="40" y2="-35" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="-60" y1="-10" x2="50" y2="-10" stroke="#cbd5e1" strokeWidth="3" />
              {/* Red Stamp: 00 / 20 */}
              <g transform="rotate(-15) translate(0, 20)">
                <rect x="-55" y="-22" width="110" height="44" rx="8" fill="#fef2f2" stroke="#dc2626" strokeWidth="3" strokeDasharray="6 3" />
                <text x="0" y="8" textAnchor="middle" fill="#dc2626" fontWeight="900" fontSize="22">00 / 20</text>
              </g>
              <text x="0" y="82" textAnchor="middle" fill="#b91c1c" fontWeight="800" fontSize="11">
                الغياب غير المبرر أو الغش
              </text>
            </g>
          )}

          {/* Discipline Council & Legal Scale (Article 21) */}
          {p2 > 0.5 && (
            <g transform="translate(640, 160)">
              <circle cx="0" cy="0" r="75" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="3.5" />
              {/* Gavel / Scale */}
              <path d="M -25 -10 L 15 30" stroke="#7c3aed" strokeWidth="6" strokeLinecap="round" />
              <rect x="-40" y="-30" width="30" height="20" rx="3" fill="#6d28d9" transform="rotate(45 -25 -20)" />
              <text x="0" y="48" textAnchor="middle" fill="#6d28d9" fontWeight="900" fontSize="13">مجلس التأديب</text>
              <text x="0" y="65" textAnchor="middle" fill="#4c1d95" fontWeight="700" fontSize="10">إحالة مباشرة (م21)</text>
            </g>
          )}

          {/* Explanatory Bottom Card (Articles 14-22) */}
          {p3 > 0.05 && (
            <g transform="translate(400, 395)">
              <rect x="-350" y="-55" width="700" height="100" rx="14" fill="#fff7ed" stroke="#ea580c" strokeWidth="3" />
              <text x="-320" y="-20" fill="#9a3412" fontWeight="800" fontSize="16" textAnchor="start">
                الفصل 3: تنظيم الحياة المدرسية والتقييم البيداغوجي (المواد 14 إلى 22)
              </text>
              <text x="-320" y="8" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • 3 تأخرات = إعذار خطي للولي (م16) • الدعم البيداغوجي مجاني في العطل لأقسام الامتحانات (م18)
              </text>
              <text x="-320" y="30" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • تكافؤ الفرص والنزاهة (م19) • إعفاء التربية البدنية يتطلب حضوراً نظرياً مستمراً (م22)
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Comprehensive Chapter 4: Canteen & Health Safety (Articles 23-27)
    case 'chapter_4_canteen_safety': {
      const p1 = clamp(progress / 0.4);
      const p2 = clamp((progress - 0.35) / 0.35);
      const p3 = clamp((progress - 0.7) / 0.3);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ch4" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid-ch4)" />

          {/* Balanced Hot Meal Dish (Article 23) */}
          {p1 > 0.05 && (
            <g transform="translate(230, 180)">
              <circle cx="0" cy="0" r="85" fill="#ffffff" stroke="#16a34a" strokeWidth="4" />
              <circle cx="0" cy="0" r="70" fill="#f0fdf4" stroke="#86efac" strokeWidth="2" />
              {/* Healthy Food Icons */}
              <circle cx="-25" cy="-20" r="22" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
              <circle cx="25" cy="-20" r="20" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2" />
              <ellipse cx="0" cy="25" rx="35" ry="18" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
              <text x="0" y="60" textAnchor="middle" fill="#15803d" fontWeight="900" fontSize="13">وجبة ساخنة وصحية</text>
            </g>
          )}

          {/* 5-Day Sample Meal Fridge & Veterinary Certificate (Article 24) */}
          {p2 > 0.05 && (
            <g transform="translate(520, 170)">
              <rect x="-110" y="-80" width="220" height="150" rx="12" fill="#ffffff" stroke="#0284c7" strokeWidth="3.5" />
              <rect x="-100" y="-70" width="200" height="35" rx="6" fill="#e0f2fe" />
              <text x="0" y="-47" textAnchor="middle" fill="#0369a1" fontWeight="800" fontSize="13">
                الوجبة الشاهدة (05 أيام)
              </text>
              <circle cx="-50" cy="10" r="22" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
              <path d="M -60 10 L -53 17 L -40 3" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
              <text x="25" y="5" textAnchor="middle" fill="#1e293b" fontWeight="800" fontSize="13">شهادة بيطرية</text>
              <text x="25" y="25" textAnchor="middle" fill="#64748b" fontWeight="600" fontSize="11">رقابة صحية يومية</text>
            </g>
          )}

          {/* Bottom Card: Table Etiquette & Transport (Articles 25, 26, 27) */}
          {p3 > 0.05 && (
            <g transform="translate(400, 395)">
              <rect x="-350" y="-55" width="700" height="100" rx="14" fill="#f0fdf4" stroke="#16a34a" strokeWidth="3" />
              <text x="-320" y="-20" fill="#166534" fontWeight="800" fontSize="16" textAnchor="start">
                الفصل 4: المطعم المدرسي، النظام الداخلي والنقل (المواد 23 إلى 27)
              </text>
              <text x="-320" y="8" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • آداب تناول الطعام ومنع التبذير أو إخراج الأواني (م25) • تعويض ما يُتلف عمداً (م25)
              </text>
              <text x="-320" y="30" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • مرافقة مشرفي التربية للمراقد والمطعم (م26) • تنظيم النقل المدرسي للرحلات (م27)
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Comprehensive Chapter 5: Security, 1111, Uniform & Prohibitions (Articles 28-35)
    case 'chapter_5_safety_decorum': {
      const p1 = clamp(progress / 0.35);
      const p2 = clamp((progress - 0.3) / 0.35);
      const p3 = clamp((progress - 0.65) / 0.35);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ch5" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid-ch5)" />

          {/* Shield & 1111 Child Protection Hotline (Articles 28, 29, 30) */}
          {p1 > 0.05 && (
            <g transform="translate(210, 175)">
              <path d="M 0 -85 L 75 -40 L 75 35 C 75 80, 0 110, 0 110 C 0 110, -75 80, -75 35 L -75 -40 Z" fill="#ffffff" stroke="#dc2626" strokeWidth="4" />
              <circle cx="0" cy="-5" r="42" fill="#fef2f2" stroke="#dc2626" strokeWidth="2.5" />
              <text x="0" y="4" textAnchor="middle" fill="#b91c1c" fontWeight="900" fontSize="24">1111</text>
              <text x="0" y="45" textAnchor="middle" fill="#0f172a" fontWeight="800" fontSize="12">الخط الأخضر لحماية الطفل</text>
            </g>
          )}

          {/* Pinafore Uniform & Decorum (Articles 33 & 34) */}
          {p2 > 0.05 && (
            <g transform="translate(420, 175)">
              <circle cx="0" cy="-50" r="22" fill="#fed7aa" stroke="#0f172a" strokeWidth="3" />
              {/* Pinafore with ID card */}
              <path d="M -35 -20 L 35 -20 L 45 60 L -45 60 Z" fill="#0284c7" stroke="#0f172a" strokeWidth="3.5" />
              <rect x="-15" y="-5" width="30" height="20" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <line x1="-10" y1="2" x2="10" y2="2" stroke="#0284c7" strokeWidth="2" />
              <text x="0" y="85" textAnchor="middle" fill="#0369a1" fontWeight="800" fontSize="13">
                المئزر والهندام اللائق (م33)
              </text>
            </g>
          )}

          {/* Prohibited Items: Weapons, Tobacco, Vapes (Article 35) */}
          {p2 > 0.5 && (
            <g transform="translate(630, 175)">
              <circle cx="0" cy="0" r="70" fill="#fff" stroke="#dc2626" strokeWidth="4" />
              <line x1="-50" y1="-50" x2="50" y2="50" stroke="#dc2626" strokeWidth="6" />
              <text x="0" y="-15" textAnchor="middle" fill="#7f1d1d" fontWeight="900" fontSize="13">حظر الأسلحة</text>
              <text x="0" y="8" textAnchor="middle" fill="#7f1d1d" fontWeight="900" fontSize="13">والتبغ والسجائر</text>
              <text x="0" y="30" textAnchor="middle" fill="#dc2626" fontWeight="800" fontSize="11">الإلكترونية (م35)</text>
            </g>
          )}

          {/* Bottom Card */}
          {p3 > 0.05 && (
            <g transform="translate(400, 395)">
              <rect x="-350" y="-55" width="700" height="100" rx="14" fill="#fef2f2" stroke="#dc2626" strokeWidth="3" />
              <text x="-320" y="-20" fill="#991b1b" fontWeight="800" fontSize="16" textAnchor="start">
                الفصل 5 (القسم الأول): الوقاية، الصحة، النظافة، الأمن، وحماية التلميذ (المواد 28 إلى 35)
              </text>
              <text x="-320" y="8" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • مخططات الإسعاف بالتنسيق مع الحماية المدنية (م28) • حظر إحضار المبالغ والأشياء الثمينة (م32)
              </text>
              <text x="-320" y="30" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • منع المساحيق وقصات الشعر غير اللائقة (م34) • حظر التحديات الرقمية الخطرة (م35)
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Comprehensive Chapter 5 (Part 2): Substance Screening & Strict Confidentiality (Articles 36-41)
    case 'chapter_5_substance_testing':
    case 'health_declaration': {
      const p1 = clamp(progress / 0.4);
      const p2 = clamp((progress - 0.35) / 0.35);
      const p3 = clamp((progress - 0.7) / 0.3);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ch5b" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid-ch5b)" />

          {/* UDS Health Unit & Medical Symbol (Articles 36 & 37) */}
          {p1 > 0.05 && (
            <g transform="translate(200, 180)">
              <circle cx="0" cy="0" r="80" fill="#ffffff" stroke="#0284c7" strokeWidth="4" />
              {/* Medical Red Cross */}
              <rect x="-12" y="-45" width="24" height="90" rx="4" fill="#ef4444" />
              <rect x="-45" y="-12" width="90" height="24" rx="4" fill="#ef4444" />
              <text x="0" y="60" textAnchor="middle" fill="#0369a1" fontWeight="900" fontSize="13">
                وحدة الكشف والمتابعة UDS
              </text>
            </g>
          )}

          {/* Written Consent & Strict Confidentiality Padlock (Articles 38 & 39) */}
          {p2 > 0.05 && (
            <g transform="translate(420, 175)">
              <rect x="-70" y="-80" width="140" height="150" rx="10" fill="#ffffff" stroke="#d97706" strokeWidth="3.5" />
              {/* Padlock Icon */}
              <rect x="-25" y="-15" width="50" height="45" rx="6" fill="#f59e0b" stroke="#b45309" strokeWidth="2.5" />
              <path d="M -15 -15 L -15 -35 A 15 15 0 0 1 15 -35 L 15 -15" fill="none" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
              <circle cx="0" cy="8" r="4" fill="#ffffff" />
              <text x="0" y="55" textAnchor="middle" fill="#92400e" fontWeight="800" fontSize="12">
                السرية الطبية والمهنية
              </text>
            </g>
          )}

          {/* No Punitive Action & Care Guarantee (Articles 40 & 41) */}
          {p2 > 0.5 && (
            <g transform="translate(630, 175)">
              <circle cx="0" cy="0" r="75" fill="#f0fdf4" stroke="#16a34a" strokeWidth="4" />
              <circle cx="0" cy="-15" r="25" fill="#ffffff" stroke="#16a34a" strokeWidth="3" />
              <path d="M -10 -15 L -3 -8 L 10 -22" fill="none" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
              <text x="0" y="30" textAnchor="middle" fill="#15803d" fontWeight="900" fontSize="14">لا إجراء عقابي</text>
              <text x="0" y="52" textAnchor="middle" fill="#166534" fontWeight="800" fontSize="11">مرافقة وعلاج (م41)</text>
            </g>
          )}

          {/* Bottom Card */}
          {p3 > 0.05 && (
            <g transform="translate(400, 395)">
              <rect x="-350" y="-55" width="700" height="100" rx="14" fill="#fefce8" stroke="#ca8a04" strokeWidth="3" />
              <text x="-320" y="-20" fill="#854d0e" fontWeight="800" fontSize="16" textAnchor="start">
                الفصل 5 (القسم الثاني): الكشف عن المؤثرات العقلية والسرية المطلقة (المواد 36 إلى 41)
              </text>
              <text x="-320" y="8" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • موافقة خطية صريحة من الولي مسبقاً (م38) • تدابير علاجية وتكفل وفق القانون 04-18 (م40)
              </text>
              <text x="-320" y="30" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • منع المساس بحق التمدرس (م41) • معاقبة إفشاء السر المهني لضمان طمأنينة التلميذ (م41)
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Comprehensive Chapter 6: Digital Technology, No-Mobile & Privacy (Articles 42-44)
    case 'chapter_6_mobile_privacy': {
      const p1 = clamp(progress / 0.4);
      const p2 = clamp((progress - 0.35) / 0.35);
      const p3 = clamp((progress - 0.7) / 0.3);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ch6" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid-ch6)" />

          {/* Pedagogical Screen / Tablet (Article 42) */}
          {p1 > 0.05 && (
            <g transform="translate(200, 180)">
              <rect x="-80" y="-60" width="160" height="110" rx="8" fill="#ffffff" stroke="#4f46e5" strokeWidth="3.5" />
              <rect x="-70" y="-50" width="140" height="80" rx="4" fill="#eef2ff" />
              <polygon points="-10,-15 15,0 -10,15" fill="#4f46e5" />
              <text x="0" y="45" textAnchor="middle" fill="#4338ca" fontWeight="800" fontSize="11">
                استعمال بيداغوجي حصري (م42)
              </text>
            </g>
          )}

          {/* Smartphone Forbidden Inside Class (Article 43) */}
          {p2 > 0.05 && (
            <g transform="translate(420, 175)">
              <rect x="-45" y="-80" width="90" height="150" rx="14" fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
              <rect x="-38" y="-68" width="76" height="120" rx="6" fill="#f8fafc" />
              {/* Prohibitory Circle & Slash */}
              <circle cx="0" cy="-5" r="50" fill="none" stroke="#dc2626" strokeWidth="6" />
              <line x1="-35" y1="-40" x2="35" y2="30" stroke="#dc2626" strokeWidth="6" />
              <text x="0" y="85" textAnchor="middle" fill="#b91c1c" fontWeight="900" fontSize="13">
                حظر الهواتف في الأقسام (م43)
              </text>
            </g>
          )}

          {/* Camera Cross: Strict No-Filming & No-Posting (Article 44) */}
          {p2 > 0.5 && (
            <g transform="translate(630, 175)">
              <rect x="-55" y="-40" width="110" height="80" rx="8" fill="#ffffff" stroke="#dc2626" strokeWidth="3.5" />
              <circle cx="0" cy="0" r="22" fill="#fef2f2" stroke="#dc2626" strokeWidth="3" />
              <line x1="-45" y1="-30" x2="45" y2="30" stroke="#dc2626" strokeWidth="5" />
              <text x="0" y="60" textAnchor="middle" fill="#991b1b" fontWeight="800" fontSize="12">
                منع التصوير والنشر (م44)
              </text>
            </g>
          )}

          {/* Bottom Card */}
          {p3 > 0.05 && (
            <g transform="translate(400, 395)">
              <rect x="-350" y="-55" width="700" height="100" rx="14" fill="#eef2ff" stroke="#4f46e5" strokeWidth="3" />
              <text x="-320" y="-20" fill="#312e81" fontWeight="800" fontSize="16" textAnchor="start">
                الفصل 6: استعمال تكنولوجيات الإعلام والاتصال (المواد 42 إلى 44)
              </text>
              <text x="-320" y="8" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • حجز الهاتف النقال فوراً عند المخالفة داخل القسم أو الممرات (م43)
              </text>
              <text x="-320" y="30" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • حظر تام لتصوير الأشخاص والمنشآت ونشرها على وسائل التواصل الاجتماعي (م44)
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Comprehensive Chapter 7: Rights, Duties & Parents Charter (Articles 45-51)
    case 'chapter_7_rights_duties':
    case 'parents_portal':
    case 'pledge_signature': {
      const p1 = clamp(progress / 0.35);
      const p2 = clamp((progress - 0.3) / 0.35);
      const p3 = clamp((progress - 0.65) / 0.35);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ch7" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid-ch7)" />

          {/* Student Rights & Duties Scales (Articles 45 & 46) */}
          {p1 > 0.05 && (
            <g transform="translate(200, 180)">
              <circle cx="0" cy="-60" r="18" fill="#f59e0b" />
              <line x1="0" y1="-45" x2="0" y2="40" stroke="#0f172a" strokeWidth="5" />
              <line x1="-55" y1="-20" x2="55" y2="-20" stroke="#0f172a" strokeWidth="4" />
              {/* Rights Pan */}
              <circle cx="-55" cy="15" r="28" fill="#dbeafe" stroke="#1e40af" strokeWidth="2.5" />
              <text x="-55" y="20" textAnchor="middle" fill="#1e40af" fontWeight="900" fontSize="13">حقوق</text>
              {/* Duties Pan */}
              <circle cx="55" cy="15" r="28" fill="#dcfce7" stroke="#166534" strokeWidth="2.5" />
              <text x="55" y="20" textAnchor="middle" fill="#166534" fontWeight="900" fontSize="13">واجبات</text>
              <text x="0" y="65" textAnchor="middle" fill="#0f172a" fontWeight="800" fontSize="12">
                ميثاق التلميذ (م45 وم46)
              </text>
            </g>
          )}

          {/* Parents Digital Space Portal (Article 49) */}
          {p2 > 0.05 && (
            <g transform="translate(420, 175)">
              <rect x="-80" y="-60" width="160" height="110" rx="10" fill="#ffffff" stroke="#0d9488" strokeWidth="3.5" />
              <rect x="-70" y="-50" width="140" height="30" rx="4" fill="#ccfbf1" />
              <text x="0" y="-30" textAnchor="middle" fill="#0f766e" fontWeight="900" fontSize="12">فضاء الأولياء الرقمي</text>
              <circle cx="-35" cy="10" r="14" fill="#fed7aa" />
              <line x1="-15" y1="5" x2="50" y2="5" stroke="#94a3b8" strokeWidth="3" />
              <line x1="-15" y1="18" x2="35" y2="18" stroke="#94a3b8" strokeWidth="3" />
              <text x="0" y="70" textAnchor="middle" fill="#0f766e" fontWeight="800" fontSize="12">
                متابعة النتائج والغيابات (م49)
              </text>
            </g>
          )}

          {/* Annual Pledge Signature & Association (Articles 50 & 51) */}
          {p2 > 0.5 && (
            <g transform="translate(630, 175)">
              <rect x="-70" y="-70" width="140" height="135" rx="8" fill="#ffffff" stroke="#d97706" strokeWidth="3" />
              <line x1="-50" y1="-45" x2="40" y2="-45" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="-50" y1="-25" x2="50" y2="-25" stroke="#cbd5e1" strokeWidth="3" />
              {/* Signature Line & Quill */}
              <path d="M -40 25 Q -10 15 10 30 T 40 20" fill="none" stroke="#1e293b" strokeWidth="3" />
              <text x="0" y="50" textAnchor="middle" fill="#92400e" fontWeight="900" fontSize="12">
                توقيع التعهد (م50)
              </text>
            </g>
          )}

          {/* Bottom Card */}
          {p3 > 0.05 && (
            <g transform="translate(400, 395)">
              <rect x="-350" y="-55" width="700" height="100" rx="14" fill="#fffbeb" stroke="#f59e0b" strokeWidth="3" />
              <text x="-320" y="-20" fill="#92400e" fontWeight="800" fontSize="16" textAnchor="start">
                الفصل 7: مصفوفة الحقوق والواجبات وشراكة الأولياء (المواد 45 إلى 51)
              </text>
              <text x="-320" y="8" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • حقوق وواجبات الأساتذة: القدوة الحسنة وحسن المعاملة وارتداء المئزر (م47 وم48)
              </text>
              <text x="-320" y="30" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • التصريح الصحي والتعهد بالتعويض المادي (م50) • دور جمعية الأولياء في دعم الأنشطة (م51)
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Comprehensive Chapters 8 & 9: Special Provisions, Insurance & Final Rules (Articles 52-55)
    case 'chapter_8_special_closing': {
      const p1 = clamp(progress / 0.4);
      const p2 = clamp((progress - 0.35) / 0.35);
      const p3 = clamp((progress - 0.7) / 0.3);

      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-ch8" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid-ch8)" />

          {/* Special Needs Inclusion (Article 52) */}
          {p1 > 0.05 && (
            <g transform="translate(200, 180)">
              <circle cx="0" cy="0" r="75" fill="#ffffff" stroke="#059669" strokeWidth="4" />
              <circle cx="0" cy="-25" r="16" fill="#059669" />
              <path d="M 0 -8 L 0 25 L -20 50" fill="none" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
              <path d="M 0 10 L 25 10 L 25 45" fill="none" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
              <circle cx="-5" cy="25" r="28" fill="none" stroke="#059669" strokeWidth="5" />
              <text x="0" y="65" textAnchor="middle" fill="#065f46" fontWeight="900" fontSize="13">
                ذوو الاحتياجات الخاصة (م52)
              </text>
            </g>
          )}

          {/* School Accidents Insurance & Vigilance (Articles 53 & 54) */}
          {p2 > 0.05 && (
            <g transform="translate(420, 175)">
              <rect x="-75" y="-65" width="150" height="120" rx="10" fill="#ffffff" stroke="#2563eb" strokeWidth="3.5" />
              <rect x="-65" y="-55" width="130" height="30" rx="4" fill="#dbeafe" />
              <text x="0" y="-35" textAnchor="middle" fill="#1d4ed8" fontWeight="800" fontSize="12">
                تعاضدية الحوادث (م53)
              </text>
              {/* Eye of Vigilance */}
              <path d="M -35 15 Q 0 -15 35 15 Q 0 45 -35 15 Z" fill="#eff6ff" stroke="#2563eb" strokeWidth="3" />
              <circle cx="0" cy="15" r="10" fill="#2563eb" />
              <text x="0" y="70" textAnchor="middle" fill="#1e40af" fontWeight="800" fontSize="12">
                واجب اليقظة والتبليغ (م54)
              </text>
            </g>
          )}

          {/* Digital Publication & Final Seal (Article 55) */}
          {p2 > 0.5 && (
            <g transform="translate(630, 175)">
              <circle cx="0" cy="0" r="75" fill="#fef3c7" stroke="#d97706" strokeWidth="4" strokeDasharray="6 3" />
              <rect x="-40" y="-35" width="80" height="60" rx="4" fill="#ffffff" stroke="#d97706" strokeWidth="2.5" />
              <text x="0" y="-10" textAnchor="middle" fill="#b45309" fontWeight="900" fontSize="13">النظام الداخلي</text>
              <text x="0" y="10" textAnchor="middle" fill="#b45309" fontWeight="800" fontSize="11">مشهر رقمياً</text>
              <text x="0" y="55" textAnchor="middle" fill="#78350f" fontWeight="900" fontSize="12">
                ساري المفعول (م55)
              </text>
            </g>
          )}

          {/* Bottom Card */}
          {p3 > 0.05 && (
            <g transform="translate(400, 395)">
              <rect x="-350" y="-55" width="700" height="100" rx="14" fill="#ecfdf5" stroke="#059669" strokeWidth="3" />
              <text x="-320" y="-20" fill="#065f46" fontWeight="800" fontSize="16" textAnchor="start">
                الفصلان 8 و 9: أحكام خاصة وختامية (المواد 52 إلى 55)
              </text>
              <text x="-320" y="8" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • تكييف الامتحانات لذوي الهمم (م52) • التكفل والتصريح الفوري بالحادث المدرسي (م53)
              </text>
              <text x="-320" y="30" fill="#1e293b" fontWeight="600" fontSize="13" textAnchor="start">
                • إخطار مديرية التربية بأي خطر (م54) • نشر النظام الداخلي في فضاء الأولياء وبداية كل سنة (م55)
              </text>
            </g>
          )}
        </svg>
      );
    }

    // Fallback Whiteboard scene template
    default: {
      return (
        <svg viewBox="0 0 800 500" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wb-grid-def" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#wb-grid-def)" />
          {/* Generic Whiteboard scene template */}
          <g transform="translate(400, 230)">
            <rect x="-260" y="-140" width="520" height="260" rx="16" fill="#ffffff" stroke="#475569" strokeWidth="3" />
            <circle cx="0" cy="-40" r="45" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
            <path d="M -20 -40 L -5 -25 L 20 -55" fill="none" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="0" y="45" textAnchor="middle" fill="#0f172a" fontWeight="800" fontSize="22">
              النظام الداخلي للمؤسسة التعليمية
            </text>
            <text x="0" y="80" textAnchor="middle" fill="#64748b" fontWeight="600" fontSize="16">
              ثانوية ابن الهيثم التقنية • المواد 01 إلى 55
            </text>
          </g>
        </svg>
      );
    }
  }
}
