import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, Sparkles, Image, Info } from 'lucide-react';

interface SvgAsset {
  id: string;
  title: string;
  category: 'titles' | 'illustrations' | 'stamps';
  description: string;
  width: number;
  height: number;
  svgContent: string;
}

export const SvgExporter: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'titles' | 'illustrations' | 'stamps'>('all');

  const assets: SvgAsset[] = [
    {
      id: 'title-banner',
      title: 'شعار وعنوان: النظام الداخلي للمؤسسة التعليمية',
      category: 'titles',
      description: 'عنوان عريض مفرغ بدقة عالية مع الخط العربي المقروء متوافق 100% مع رسم يد VideoScribe دون تكسر الحروف.',
      width: 700,
      height: 160,
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 160" width="700" height="160">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.15" />
    </filter>
  </defs>
  <rect x="20" y="20" width="660" height="120" rx="30" fill="#ffffff" stroke="#059669" stroke-width="6" filter="url(#shadow)" />
  <rect x="35" y="35" width="630" height="90" rx="20" fill="none" stroke="#a7f3d0" stroke-width="2" stroke-dasharray="6 4" />
  <text x="350" y="82" text-anchor="middle" dominant-baseline="middle" fill="#065f46" font-family="'Cairo', 'Tajawal', sans-serif" font-weight="900" font-size="34">
    النظام الداخلي للمؤسسة التعليمية
  </text>
  <text x="350" y="112" text-anchor="middle" dominant-baseline="middle" fill="#047857" font-family="'Cairo', sans-serif" font-weight="700" font-size="16">
    السنة الدراسية 2026 / 2027 • وزارة التربية الوطنية
  </text>
</svg>`
    },
    {
      id: 'flag-school',
      title: 'رسم كرتوني: مبنى المدرسة وعلم الجزائر',
      category: 'illustrations',
      description: 'مبنى المدرسة مع علم الجزائر يرفرف في القمة وخط أرضي جاهز للرسم التتبعي المتسلسل بالماركر.',
      width: 500,
      height: 400,
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="500" height="400">
  <!-- Ground -->
  <line x1="30" y1="360" x2="470" y2="360" stroke="#1e293b" stroke-width="5" stroke-linecap="round" />
  <!-- Facade -->
  <rect x="90" y="180" width="320" height="180" rx="4" fill="#ffffff" stroke="#1e293b" stroke-width="5" />
  <!-- Roof -->
  <polygon points="90,180 250,90 410,180" fill="#f8fafc" stroke="#1e293b" stroke-width="5" stroke-linejoin="round" />
  <!-- Flag Pole -->
  <line x1="250" y1="90" x2="250" y2="25" stroke="#334155" stroke-width="4.5" stroke-linecap="round" />
  <circle cx="250" cy="22" r="5" fill="#eab308" />
  <!-- Algerian Flag -->
  <g transform="translate(250, 26)">
    <rect x="0" y="0" width="45" height="50" fill="#006233" stroke="#006233" stroke-width="1" />
    <rect x="45" y="0" width="45" height="50" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    <path d="M 45 13 A 12 12 0 0 1 45 37 A 9 9 0 0 0 45 13 Z" fill="#d21034" />
    <polygon points="51,21 53,23 57,23 54,26 55,29 52,27 49,29 50,26 47,23 51,23" fill="#d21034" />
    <path d="M 0 0 C 30 -3, 60 3, 90 0 L 90 50 C 60 53, 30 47, 0 50 Z" fill="none" stroke="#0f172a" stroke-width="3" />
  </g>
  <!-- School Pillars -->
  <line x1="140" y1="180" x2="140" y2="360" stroke="#475569" stroke-width="4" />
  <line x1="200" y1="180" x2="200" y2="360" stroke="#475569" stroke-width="4" />
  <line x1="300" y1="180" x2="300" y2="360" stroke="#475569" stroke-width="4" />
  <line x1="360" y1="180" x2="360" y2="360" stroke="#475569" stroke-width="4" />
  <!-- Main Entrance -->
  <path d="M 225 360 L 225 270 A 25 25 0 0 1 275 270 L 275 360 Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="4" />
</svg>`
    },
    {
      id: 'banned-phone',
      title: 'رمز الحظر: الهاتف الذكي الممنوع ❌',
      category: 'illustrations',
      description: 'هاتف ذكي مع دائرة الحظر الحمراء المائلة لتمثيل المادة 43 من النظام الداخلي بدقة.',
      width: 360,
      height: 360,
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" width="360" height="360">
  <!-- Phone Body -->
  <g transform="translate(180, 180)">
    <rect x="-60" y="-105" width="120" height="210" rx="20" fill="#f8fafc" stroke="#334155" stroke-width="6" />
    <rect x="-50" y="-85" width="100" height="165" rx="8" fill="#0f172a" />
    <circle cx="0" cy="-95" r="4" fill="#94a3b8" />
    <line x1="-22" y1="92" x2="22" y2="92" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <!-- Red Prohibitory Ring & Slash -->
    <circle cx="0" cy="0" r="95" fill="none" stroke="#dc2626" stroke-width="16" />
    <line x1="-66" y1="-68" x2="68" y2="66" stroke="#dc2626" stroke-width="16" stroke-linecap="round" />
  </g>
</svg>`
    },
    {
      id: 'pinafore-student',
      title: 'رسم تلميذ بمئزر مدرسي وهندام لائق',
      category: 'illustrations',
      description: 'تلميذ مبتسم يرتدي المئزر المدرسي المعتمد وحقيبة الظهر لتمثيل الانضباط والهندام (المادتان 33 و46).',
      width: 340,
      height: 400,
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 400" width="340" height="400">
  <g transform="translate(170, 200)">
    <!-- Head & Face -->
    <circle cx="0" cy="-110" r="42" fill="#fed7aa" stroke="#1e293b" stroke-width="4.5" />
    <path d="M -42 -115 C -42 -155, 42 -155, 42 -115 Z" fill="#334155" stroke="#1e293b" stroke-width="4" />
    <circle cx="-13" cy="-112" r="4" fill="#1e293b" />
    <circle cx="13" cy="-112" r="4" fill="#1e293b" />
    <path d="M -10 -98 Q 0 -88 10 -98" fill="none" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" />
    <!-- Pinafore / School Apron -->
    <path d="M -38 -65 L -55 65 L 55 65 L 38 -65 Z" fill="#dbeafe" stroke="#2563eb" stroke-width="5" />
    <polygon points="-18,-65 0,-40 18,-65" fill="#ffffff" stroke="#2563eb" stroke-width="3" />
    <circle cx="0" cy="-20" r="3.5" fill="#2563eb" />
    <circle cx="0" cy="5" r="3.5" fill="#2563eb" />
    <circle cx="0" cy="30" r="3.5" fill="#2563eb" />
    <!-- Pocket -->
    <rect x="20" y="-15" width="22" height="26" rx="4" fill="#bfdbfe" stroke="#2563eb" stroke-width="2.5" />
    <line x1="31" y1="-22" x2="31" y2="-12" stroke="#dc2626" stroke-width="3" stroke-linecap="round" />
    <!-- Legs -->
    <line x1="-22" y1="65" x2="-22" y2="135" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round" />
    <line x1="22" y1="65" x2="22" y2="135" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round" />
    <rect x="-35" y="135" width="26" height="12" rx="4" fill="#1e293b" />
    <rect x="9" y="135" width="26" height="12" rx="4" fill="#1e293b" />
  </g>
</svg>`
    },
    {
      id: 'handshake-coop',
      title: 'رمز الشراكة: مصافحة اليدين (المدرسة والأسرة)',
      category: 'illustrations',
      description: 'يدان تتصافحان ترمزان للتعاون والتكامل بين المدرسة والأولياء (المادتان 49 و50).',
      width: 440,
      height: 280,
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 280" width="440" height="280">
  <g transform="translate(220, 140)">
    <!-- School Sleeve -->
    <path d="M -170 -25 L -70 -20 L -60 10 L -170 20 Z" fill="#1e40af" stroke="#0f172a" stroke-width="4.5" />
    <path d="M -70 -20 L -45 -18 L -35 15 L -60 10 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
    <!-- Parent Sleeve -->
    <path d="M 170 -25 L 70 -20 L 60 10 L 170 20 Z" fill="#047857" stroke="#0f172a" stroke-width="4.5" />
    <path d="M 70 -20 L 45 -18 L 35 15 L 60 10 Z" fill="#ffffff" stroke="#0f172a" stroke-width="3.5" />
    <!-- Handshake -->
    <path d="M -45 -18 C -20 -35, 20 -35, 45 -18 C 50 10, 10 40, -15 35 C -35 30, -50 10, -45 -18 Z" fill="#fed7aa" stroke="#0f172a" stroke-width="4.5" />
    <path d="M -20 -15 Q 0 5 20 -15" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" />
    <path d="M -15 5 Q 0 25 15 5" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" />
  </g>
</svg>`
    },
    {
      id: 'stamp-indibat',
      title: 'ختم كلمات النجاح: انضباط',
      category: 'stamps',
      description: 'ختم دائري ذهبي محبب لكلمة "انضباط" ليكون خاتمة مؤثرة لمشاهد الانضباط والتأخرات.',
      width: 220,
      height: 220,
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">
  <circle cx="110" cy="110" r="95" fill="#fef3c7" stroke="#d97706" stroke-width="7" stroke-dasharray="10 5" />
  <circle cx="110" cy="110" r="82" fill="#ffffff" stroke="#d97706" stroke-width="3.5" />
  <text x="110" y="122" text-anchor="middle" dominant-baseline="middle" fill="#b45309" font-family="'Cairo', sans-serif" font-weight="900" font-size="40">
    انضباط
  </text>
</svg>`
    },
    {
      id: 'stamp-tamayoz',
      title: 'ختم كلمات النجاح: تميز',
      category: 'stamps',
      description: 'ختم أرجواني أنيق لكلمة "تميز" يرمز للتفوق والتحصيل العلمي النزيه.',
      width: 220,
      height: 220,
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">
  <circle cx="110" cy="110" r="95" fill="#ede9fe" stroke="#7c3aed" stroke-width="7" stroke-dasharray="10 5" />
  <circle cx="110" cy="110" r="82" fill="#ffffff" stroke="#7c3aed" stroke-width="3.5" />
  <text x="110" y="122" text-anchor="middle" dominant-baseline="middle" fill="#6d28d9" font-family="'Cairo', sans-serif" font-weight="900" font-size="40">
    تميز
  </text>
</svg>`
    },
    {
      id: 'stamp-najah',
      title: 'ختم كلمات النجاح: نجاح',
      category: 'stamps',
      description: 'ختم أخضر ساطع لكلمة "نجاح" للدلالة على ثمار احترام النظام الداخلي ومرافقة الأولياء.',
      width: 220,
      height: 220,
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220">
  <circle cx="110" cy="110" r="95" fill="#dcfce7" stroke="#16a34a" stroke-width="7" stroke-dasharray="10 5" />
  <circle cx="110" cy="110" r="82" fill="#ffffff" stroke="#16a34a" stroke-width="3.5" />
  <text x="110" y="122" text-anchor="middle" dominant-baseline="middle" fill="#15803d" font-family="'Cairo', sans-serif" font-weight="900" font-size="40">
    نجاح
  </text>
</svg>`
    },
    {
      id: 'videoscribe-realistic-hand',
      title: 'يد الرسام الاحترافية مع قلم الماركر (VideoScribe Style)',
      category: 'illustrations',
      description: 'يد واقعية ثلاثية الأبعاد بملامح تشريحية دقيقة وظلال متدرجة تمسك قلم ماركر سبورة، مخصصة للإدراج في برامج المونتاج والوايت بورد.',
      width: 220,
      height: 230,
      svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230" width="220" height="230">
  <defs>
    <filter id="handShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="8" dy="12" stdDeviation="6" flood-opacity="0.28" />
    </filter>
    <linearGradient id="barrelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#262626" />
      <stop offset="35%" stop-color="#525252" />
      <stop offset="70%" stop-color="#171717" />
    </linearGradient>
    <linearGradient id="skinGrad" x1="20%" y1="10%" x2="90%" y2="90%">
      <stop offset="0%" stop-color="#fed7aa" />
      <stop offset="40%" stop-color="#fdba74" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <linearGradient id="sleeveNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <g filter="url(#handShadow)">
    <!-- Pen Barrel -->
    <path d="M 28 25 L 42 39 L 102 100 L 88 114 L 28 54 Z" fill="url(#barrelGrad)" stroke="#09090b" stroke-width="1" />
    <!-- White label -->
    <path d="M 44 41 L 54 51 L 82 80 L 72 89 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8" />
    <!-- Collar & Chisel Nib -->
    <path d="M 19 13 L 26 21 L 34 29 L 26 36 L 19 28 Z" fill="#475569" stroke="#0f172a" stroke-width="0.8" />
    <path d="M 14 14 L 20 22 L 23 20 L 19 13 Z" fill="#171717" />
    <!-- Hand -->
    <path d="M 38 48 C 34 54 36 64 44 68 C 50 71 58 68 62 60 L 52 50 Z" fill="#c2410c" />
    <path d="M 44 32 C 38 34 32 40 33 46 C 34 50 38 52 44 48 C 50 44 62 36 70 42 C 78 48 84 54 88 64 L 98 56 C 94 44 84 34 72 30 C 60 26 50 30 44 32 Z" fill="url(#skinGrad)" stroke="#c2410c" stroke-width="0.8" />
    <path d="M 52 56 C 46 54 44 62 48 70 C 53 77 62 82 72 82 C 82 82 92 76 96 68 L 86 58 C 78 64 68 66 60 62 C 55 60 54 57 52 56 Z" fill="url(#skinGrad)" stroke="#c2410c" stroke-width="0.8" />
    <path d="M 72 30 C 86 28 102 36 112 46 C 120 54 126 66 128 78 C 130 90 126 102 118 112 C 108 120 96 122 84 116 C 74 110 68 98 72 82 L 96 68 C 92 56 82 46 72 30 Z" fill="url(#skinGrad)" stroke="#c2410c" stroke-width="0.8" />
    <!-- Cuff & Sleeve -->
    <path d="M 112 108 L 134 94 L 144 108 L 122 122 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
    <path d="M 120 120 L 142 106 L 210 178 L 180 216 L 118 136 Z" fill="url(#sleeveNavy)" stroke="#0f172a" stroke-width="1.2" />
  </g>
</svg>`
    }
  ];

  const filteredAssets = filter === 'all' ? assets : assets.filter((a) => a.category === filter);

  const handleDownloadSvg = (asset: SvgAsset) => {
    const blob = new Blob([asset.svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySvg = (asset: SvgAsset) => {
    navigator.clipboard.writeText(asset.svgContent);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & VideoScribe Pro Tip Note */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
              <FileCode className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-stone-900">مصدّر عناصر ورسوم SVG المفرغة لـ VideoScribe</h2>
          </div>
          <p className="text-stone-600 text-xs sm:text-sm">
            حل مشكلة الخطوط العربية في VideoScribe: حمّل العناوين والرموز كملفات SVG متجهة شفافة ليتم رسمها باليد بدقة عالية.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start md:self-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            الكل ({assets.length})
          </button>
          <button
            onClick={() => setFilter('titles')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filter === 'titles' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            العناوين
          </button>
          <button
            onClick={() => setFilter('illustrations')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filter === 'illustrations' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            الرسوم
          </button>
          <button
            onClick={() => setFilter('stamps')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filter === 'stamps' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            أختام الكلمات
          </button>
        </div>
      </div>

      {/* Educational Notice Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3 text-sky-950 text-xs sm:text-sm leading-relaxed">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">نصيحة تقنية من السيناريو: </span>
          برنامج VideoScribe قد يفكك الحروف العربية المتصلة عند كتابتها كنصوص عادية. استخدام ملفات الـ <strong>SVG</strong> المجهزة أدناه يضمن ظهور الخط العربي متصلاً وجميلاً، وتتبع يد الرسام للخطوط بشكل طبيعي وواقعي.
        </div>
      </div>

      {/* Grid of Ready-to-Use SVGs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-2xl border border-stone-200 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
          >
            {/* Visual Canvas with Checkerboard Transparency Pattern */}
            <div className="relative w-full h-48 bg-stone-100 flex items-center justify-center p-4 overflow-hidden border-b border-stone-100">
              {/* Checkerboard Pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                }}
              />

              {/* Rendered SVG Preview */}
              <div
                className="relative z-10 max-w-full max-h-full transition-transform duration-300 group-hover:scale-105"
                dangerouslySetInnerHTML={{ __html: asset.svgContent }}
              />

              {/* Badge Dimension */}
              <span className="absolute bottom-2 left-2 z-20 text-[10px] font-mono font-bold bg-stone-900/80 text-stone-200 px-2 py-0.5 rounded backdrop-blur-xs">
                {asset.width} × {asset.height} px
              </span>
            </div>

            {/* Information & Action footer */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm mb-1">{asset.title}</h3>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {asset.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                <button
                  id={`download-svg-${asset.id}`}
                  onClick={() => handleDownloadSvg(asset)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل SVG</span>
                </button>

                <button
                  id={`copy-svg-${asset.id}`}
                  onClick={() => handleCopySvg(asset)}
                  className="py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1 transition-colors"
                  title="نسخ كود الـ SVG المصدري"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
