import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Printer,
  X,
  FileText,
  HeartHandshake,
  CheckCircle2,
  HelpCircle,
  PhoneCall,
  Flame,
  ArrowRight
} from 'lucide-react';
import { SUPERVISOR_FIELD_CARDS } from '../data/supervisorFieldCards';
import { SupervisorCategory, SupervisorFieldCard } from '../types';
import { RACHID_SUPERVISOR } from '../data/rachidSupervisorPersona';

interface SupervisorFieldGuideProps {
  onBackToPortal?: () => void;
}

export const SupervisorFieldGuide: React.FC<SupervisorFieldGuideProps> = ({ onBackToPortal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SupervisorCategory>('الكل');
  const [selectedCard, setSelectedCard] = useState<SupervisorFieldCard | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const categories: SupervisorCategory[] = [
    'الكل',
    'إداري وقانوني',
    'بيداغوجي وتربوي',
    'انضباطي وسلوكي',
    'حالات طارئة وأمنية',
    'علاقات وأولياء الأمور'
  ];

  // Filtering logic
  const filteredCards = useMemo(() => {
    return SUPERVISOR_FIELD_CARDS.filter((card) => {
      const matchesCategory =
        selectedCategory === 'الكل' || card.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch =
        card.title.toLowerCase().includes(q) ||
        card.preview.toLowerCase().includes(q) ||
        card.immediateAction.some((step) => step.toLowerCase().includes(q)) ||
        card.legalBasis.articles.toLowerCase().includes(q) ||
        card.legalBasis.description.toLowerCase().includes(q) ||
        card.forbiddenActions.some((f) => f.toLowerCase().includes(q)) ||
        card.pedagogicalSolution.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Audio Speech Synthesis Handler
  const handleToggleAudio = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('ميزة القراءة الصوتية غير مدعومة في متصفحك الحالي');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = RACHID_SUPERVISOR.voiceSettings.lang || 'ar-DZ';
    utterance.rate = RACHID_SUPERVISOR.voiceSettings.rate || 0.85;
    utterance.pitch = RACHID_SUPERVISOR.voiceSettings.pitch || 0.85;

    // Try finding Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Close modal and stop audio
  const handleCloseModal = () => {
    if (isPlayingAudio && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
    setSelectedCard(null);
  };

  // Copy document template
  const handleCopyDoc = (card: SupervisorFieldCard) => {
    if (!card.documentTemplate) return;
    navigator.clipboard.writeText(card.documentTemplate.content).then(() => {
      setCopiedDocId(card.id);
      setTimeout(() => setCopiedDocId(null), 2500);
    });
  };

  // Copy complete card action plan
  const handleCopyCardPlan = (card: SupervisorFieldCard) => {
    const text = `📋 بطاقة التدخل الميداني: ${card.title}
التصنيف: ${card.category}
السند القانوني: ${card.legalBasis.articles}

⚡ الإجراء الفوري:
${card.immediateAction.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

⛔ المحظورات:
${card.forbiddenActions.map((f) => `• ${f}`).join('\n')}

🌱 المعالجة التربوية:
${card.pedagogicalSolution}

المصدر: المساعد الذكي للإشراف التربوي - ثانوية ابن الهيثم التقنية 2026/2027 • جميع الحقوق محفوظة ©`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedCardId(card.id);
      setTimeout(() => setCopiedCardId(null), 2500);
    });
  };

  // Print single card
  const handlePrintCard = (card: SupervisorFieldCard) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>بطاقة تدخل ميداني - ${card.title}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 25px; color: #0f172a; line-height: 1.6; }
          .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 1.3rem; font-weight: 800; color: #1e3a8a; margin: 0 0 6px 0; }
          .subtitle { font-size: 0.85rem; color: #64748b; }
          .badge { display: inline-block; background: #e2e8f0; color: #1e293b; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; margin-bottom: 15px; }
          .box { margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; background: #f8fafc; border-right: 5px solid #3b82f6; }
          .box.danger { border-right-color: #dc2626; background: #fef2f2; }
          .box.warning { border-right-color: #d97706; background: #fffbeb; }
          .box.success { border-right-color: #16a34a; background: #f0fdf4; }
          .box-title { font-weight: 800; font-size: 0.95rem; margin-bottom: 6px; }
          ul, ol { margin: 0; padding-right: 20px; }
          li { margin-bottom: 4px; }
          .template { white-space: pre-wrap; font-family: monospace; background: #ffffff; border: 1px dashed #94a3b8; padding: 12px; border-radius: 6px; font-size: 0.85rem; margin-top: 15px; }
          .footer { margin-top: 30px; font-size: 0.75rem; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">المساعد الذكي للإشراف التربوي - بطاقة معالجة ميدانية</div>
          <div class="subtitle">الجمهورية الجزائرية الديمقراطية الشعبية • ثانوية ابن الهيثم التقنية (محمد بلوزداد)</div>
        </div>
        <div class="badge">${card.category}</div>
        <h2 style="margin-bottom: 12px; color: #0f172a;">${card.title}</h2>
        
        <div class="box">
          <div class="box-title" style="color: #1e3a8a;">⚡ الإجراء الفوري للمشرف التربوي:</div>
          <ol>
            ${card.immediateAction.map((s) => `<li>${s}</li>`).join('')}
          </ol>
        </div>

        <div class="box warning">
          <div class="box-title" style="color: #d97706;">⚖️ السند القانوني والمواد المرجعية:</div>
          <div><strong>المواد:</strong> ${card.legalBasis.articles}</div>
          <div>${card.legalBasis.description}</div>
        </div>

        <div class="box danger">
          <div class="box-title" style="color: #dc2626;">⛔ المحظورات والتصرفات الممنوعة تجنبها:</div>
          <ul>
            ${card.forbiddenActions.map((f) => `<li>${f}</li>`).join('')}
          </ul>
        </div>

        <div class="box success">
          <div class="box-title" style="color: #16a34a;">🌱 الحل والمعالجة البيداغوجية التربوية:</div>
          <div>${card.pedagogicalSolution}</div>
        </div>

        ${
          card.documentTemplate
            ? `
          <div style="margin-top: 20px;">
            <div style="font-weight: bold; margin-bottom: 5px;">📄 النموذج الإداري الميداني: ${card.documentTemplate.name}</div>
            <div class="template">${card.documentTemplate.content}</div>
          </div>
        `
            : ''
        }

        <div class="footer">
          حرر للاستخدام الميداني الداخلي بمصلحة الاستشارة التربوية • ثانوية ابن الهيثم التقنية 2026/2027 • © جميع الحقوق محفوظة
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const getBadgeStyle = (badgeType: SupervisorFieldCard['badgeType']) => {
    switch (badgeType) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pedagogy':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'discipline':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'emergency':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'community':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 animate-fade-in font-['Cairo',sans-serif]">
      {/* Top Banner / Hero Card with Supervisor Persona */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-blue-700/40 relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                مصلحة الاستشارة التربوية
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
                ثانوية ابن الهيثم التقنية
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold">
                12 بطاقة تدخل فوري
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mb-2">
              المساعد الذكي للإشراف التربوي
            </h1>
            <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              بطاقات التدخل السريع والمعالجة الميدانية لمعضلات الحياة المدرسية اليومية؛ خطوات إجرائية فورية، أسانيد قانونية موثقة، ونماذج إدارية قابلة للنسخ والطباعة تحت إشراف الأستاذ رشيد.
            </p>
          </div>

          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              className="self-start md:self-center px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لفصول النظام الداخلي</span>
            </button>
          )}
        </div>
      </div>

      {/* Sticky Filter & Search Control Panel */}
      <div className="sticky top-16 z-30 bg-stone-100/90 backdrop-blur-md pt-1 pb-3">
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-stone-200 space-y-3">
          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن معضلة، قانون، مادة، أو حل ميداني..."
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-200 text-stone-900 placeholder-stone-400 text-xs sm:text-sm bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-700'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {cat}
                  {cat !== 'الكل' && (
                    <span
                      className={`mr-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-blue-700 text-blue-100' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {SUPERVISOR_FIELD_CARDS.filter((c) => c.category === cat).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards Count Summary */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1 font-medium">
        <span>
          عرض <strong className="text-blue-900">{filteredCards.length}</strong> بطاقة معالجة ميدانية
          {selectedCategory !== 'الكل' && <span> في تصنيف ({selectedCategory})</span>}
        </span>
        <span className="text-[11px] text-stone-400 hidden sm:inline">
          انقر على أي بطاقة لعرض تفاصيل التدخل الفوري والسند القانوني
        </span>
      </div>

      {/* Grid of Intervention Cards */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 shadow-sm space-y-3">
          <HelpCircle className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">لا توجد بطاقة تطابق بحثك</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            جرب كلمات بحث أخرى مثل "طرد"، "هاتف"، "شجار"، "غياب"، أو اختر تصنيفاً آخر من القائمة.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('الكل');
            }}
            className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition-colors"
          >
            إعادة تعيين البحث
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCards.map((card) => {
            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="bg-white border border-stone-200 hover:border-blue-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] text-right"
              >
                <div>
                  {/* Card Header with Category Badge & Steps indicator */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${getBadgeStyle(
                        card.badgeType
                      )}`}
                    >
                      {card.badgeLabel}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {card.immediateAction.length} خطوات تدخل
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-sm sm:text-base font-black text-stone-900 group-hover:text-blue-900 transition-colors leading-snug mb-2">
                    {card.title}
                  </h3>

                  {/* Preview Text */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                    {card.preview}
                  </p>
                </div>

                {/* Card Footer Features */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700 font-bold group-hover:underline flex items-center gap-1">
                      عرض الدليل الإجرائي
                      <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  {card.documentTemplate && (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      <FileText className="w-3 h-3" />
                      نموذج وثيقة
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Supervisor Guide Section Footer */}
      <div className="mt-6 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500 font-bold px-2">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="px-3 py-1 rounded-xl bg-blue-900 text-white font-black">
            دليل الإشراف التربوي الميداني 2026 / 2027
          </span>
          <span>ثانوية ابن الهيثم التقنية – محمد بلوزداد</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="px-2.5 py-1 rounded-xl bg-stone-200 text-stone-800 font-black">
            © جميع الحقوق محفوظة
          </span>
          <span className="text-stone-600">إعداد وتنسيق: المشرف التربوي ش. رشيد</span>
        </div>
      </div>

      {/* Detail Modal / Sliding Bottom Sheet */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  ⚡
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBadgeStyle(
                      selectedCard.badgeType
                    )}`}
                  >
                    {selectedCard.category}
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-stone-900 leading-tight mt-0.5">
                    {selectedCard.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {selectedCard.audioSummary && (
                  <button
                    onClick={() => handleToggleAudio(selectedCard.audioSummary!)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                        : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700'
                    }`}
                    title={isPlayingAudio ? 'إيقاف الصوت' : 'استمع لتوجيه الأستاذ رشيد'}
                  >
                    {isPlayingAudio ? (
                      <VolumeX className="w-4 h-4 text-amber-700" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-blue-900" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => handlePrintCard(selectedCard)}
                  className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
                  title="طباعة بطاقة المعالجة"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer ml-1"
                  title="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: The 4 Distinct Section Boxes */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-800">
              {/* Box 1: Immediate Field Action (Primary Blue border) */}
              <div className="bg-blue-50/60 border-r-4 border-blue-600 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-blue-900 font-bold text-xs uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 font-black">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    الإجراء الفوري للمشرف التربوي
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold">
                    {selectedCard.immediateAction.length} خطوات
                  </span>
                </div>
                <ol className="space-y-1.5 list-decimal list-inside pr-1 text-stone-800 leading-relaxed font-medium">
                  {selectedCard.immediateAction.map((step, idx) => (
                    <li key={idx} className="marker:text-blue-700 marker:font-bold">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Box 2: Legal Basis & References (Amber/Warning border) */}
              <div className="bg-amber-50/60 border-r-4 border-amber-500 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs uppercase tracking-wider">
                  <Scale className="w-4 h-4 text-amber-600" />
                  السند القانوني والمواد المرجعية
                </div>
                <div className="text-amber-950 font-bold text-xs">
                  {selectedCard.legalBasis.articles}
                </div>
                <p className="text-stone-700 leading-relaxed text-xs">
                  {selectedCard.legalBasis.description}
                </p>
              </div>

              {/* Box 3: Forbidden Actions (Red/Danger border) */}
              <div className="bg-red-50/60 border-r-4 border-red-600 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-red-900 font-black text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  المحظورات والتصرفات الممنوعة (تجنبها تماماً)
                </div>
                <ul className="space-y-1 list-disc list-inside pr-1 text-red-950 text-xs leading-relaxed">
                  {selectedCard.forbiddenActions.map((forbidden, idx) => (
                    <li key={idx} className="marker:text-red-600">
                      {forbidden}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Box 4: Pedagogical Solution (Green/Success border) */}
              <div className="bg-emerald-50/60 border-r-4 border-emerald-600 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  المعالجة التربوية والتسوية البيداغوجية
                </div>
                <p className="text-stone-700 leading-relaxed text-xs">
                  {selectedCard.pedagogicalSolution}
                </p>
              </div>

              {/* Box 5: Document Template (if present) */}
              {selectedCard.documentTemplate && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-stone-900 font-black text-xs">
                      <FileText className="w-4 h-4 text-stone-600" />
                      النموذج الإداري الفوري: {selectedCard.documentTemplate.name}
                    </span>
                    <button
                      onClick={() => handleCopyDoc(selectedCard)}
                      className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedDocId === selectedCard.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-stone-600" />
                          <span>نسخ النموذج</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-white p-3 rounded-lg border border-stone-200 text-[11px] text-stone-700 font-mono whitespace-pre-wrap leading-relaxed select-all">
                    {selectedCard.documentTemplate.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions Footer */}
            <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => handleCopyCardPlan(selectedCard)}
                className="px-3.5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCardId === selectedCard.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تم نسخ الخطة!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-600" />
                    <span>نسخ خطة البطاقة</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCloseModal}
                className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                إغلاق البطاقة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
