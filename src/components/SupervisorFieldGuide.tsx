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
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { SUPERVISOR_FIELD_CARDS } from '../data/supervisorFieldCards';
import { SupervisorCategory, SupervisorFieldCard } from '../types';
import { RACHID_SUPERVISOR } from '../data/rachidSupervisorPersona';
import { Decree171Modal } from './Decree171Modal';

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
  const [showDecree171Modal, setShowDecree171Modal] = useState(false);

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
    const cardNum = SUPERVISOR_FIELD_CARDS.findIndex((c) => c.id === card.id) + 1;
    const text = `📋 بطاقة التدخل الميداني رقم [${cardNum} / 20]: ${card.title}
التصنيف: ${card.category}
السند القانوني: ${card.legalBasis.articles}

⚡ الإجراء الفوري:
${card.immediateAction.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

⛔ المحظورات:
${card.forbiddenActions.map((f) => `• ${f}`).join('\n')}

🌱 المعالجة التربوية:
${card.pedagogicalSolution}

المصدر: المساعد الذكي للإشراف التربوي - ثانوية ابن الهيثم التقنية 2026/2027 • جميع الحقوق محفوظة © للمشرف التربوي ش. رشيد`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedCardId(card.id);
      setTimeout(() => setCopiedCardId(null), 2500);
    });
  };

  // Force refresh cache for users who might be stuck on old 12-card cache
  const handleForceCacheRefresh = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  // Print single card
  const handlePrintCard = (card: SupervisorFieldCard) => {
    const cardNum = SUPERVISOR_FIELD_CARDS.findIndex((c) => c.id === card.id) + 1;
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
        <title>بطاقة معالجة ميدانية رقم ${cardNum} - ${card.title}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 25px; color: #0f172a; line-height: 1.6; }
          .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 1.3rem; font-weight: 800; color: #1e3a8a; margin: 0 0 6px 0; }
          .subtitle { font-size: 0.85rem; color: #64748b; }
          .badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; margin-bottom: 15px; }
          .box { margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; background: #f8fafc; border-right: 5px solid #3b82f6; }
          .box.danger { border-right-color: #dc2626; background: #fef2f2; }
          .box.warning { border-right-color: #d97706; background: #fffbeb; }
          .box.success { border-right-color: #16a34a; background: #f0fdf4; }
          .box-title { font-weight: 800; font-size: 0.95rem; margin-bottom: 6px; }
          ul, ol { margin: 0; padding-right: 20px; }
          li { margin-bottom: 4px; }
          .template { white-space: pre-wrap; font-family: monospace; background: #ffffff; border: 1px dashed #94a3b8; padding: 12px; border-radius: 6px; font-size: 0.85rem; margin-top: 15px; }
          .footer { margin-top: 30px; font-size: 0.75rem; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">المساعد الذكي للإشراف التربوي - بطاقة معالجة ميدانية رقم (${cardNum} من 20)</div>
          <div class="subtitle">الجمهورية الجزائرية الديمقراطية الشعبية • ثانوية ابن الهيثم التقنية (محمد بلوزداد) • مصلحة الاستشارة التربوية</div>
        </div>
        <div class="badge">بطاقة رقم ${cardNum} من 20 • ${card.category}</div>
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in font-['Cairo',sans-serif]">
      {/* Top Institutional Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src="/supervisor-icon.svg"
              alt="أيقونة دليل الإشراف التربوي الميداني"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-950 p-1.5 shadow-md shrink-0 object-contain"
            />
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 mb-1">
                <span>ثانوية ابن الهيثم التقنية</span>
                <span>·</span>
                <span>مصلحة الاستشارة التربوية</span>
                <span>·</span>
                <span className="text-blue-900 font-black">20 بطاقة معتمدة</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                المساعد الذكي للإشراف التربوي الميداني
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed mt-1">
                دليل التدخل السريع والمعالجة الميدانية لمعضلات الحياة المدرسية اليومية (20 بطاقة مهنية معتمدة)؛ حلول بيداغوجية وقانونية موثقة بنماذج إدارية ومحاضر رسمية جاهزة للنسخ والطباعة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-center shrink-0">
            <button
              onClick={() => setShowDecree171Modal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all border border-stone-200 flex items-center gap-1.5 cursor-pointer"
              title="عرض سلم تصنيف أخطاء التلاميذ والعقوبات الرسمية"
            >
              <Scale className="w-3.5 h-3.5 text-amber-700" />
              <span>القرار 171</span>
            </button>

            <button
              onClick={handleForceCacheRefresh}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
              title="تحديث ذاكرة التخزين المؤقت وضمان عرض الـ 20 بطاقة كاملة"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
              <span>تحديث الكاش</span>
            </button>

            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الفصول الـ 9</span>
              </button>
            )}
          </div>
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
              placeholder="ابحث عن معضلة، قانون، مادة، أو حل ميداني من بين الـ 20 بطاقة..."
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
              const count =
                cat === 'الكل'
                  ? SUPERVISOR_FIELD_CARDS.length
                  : SUPERVISOR_FIELD_CARDS.filter((c) => c.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-700'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards Count Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-stone-600 px-1 font-bold gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            عرض <strong className="text-blue-900 font-black text-sm">{filteredCards.length}</strong> من أصل{' '}
            <strong className="text-stone-900 font-black text-sm">{SUPERVISOR_FIELD_CARDS.length}</strong> بطاقة معالجة ميدانية موثقة
          </span>
          {selectedCategory !== 'الكل' && (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[11px]">
              في تصنيف ({selectedCategory})
            </span>
          )}
        </div>
        <span className="text-[11px] text-stone-500 font-medium">
          مرتبة وموثقة بيداغوجياً وقانونياً (البطاقات من 01 إلى 20)
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
            const cardGlobalIndex = SUPERVISOR_FIELD_CARDS.findIndex((c) => c.id === card.id) + 1;

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="bg-white border border-stone-200 hover:border-blue-500 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] text-right"
              >
                <div>
                  {/* Card Header with Exact Card Number, Category Badge & Steps indicator */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-blue-900 text-amber-300 border border-blue-800 shadow-2xs font-mono">
                        بطاقة {String(cardGlobalIndex).padStart(2, '0')} / 20
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${getBadgeStyle(
                          card.badgeType
                        )}`}
                      >
                        {card.badgeLabel}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-bold bg-stone-100 px-2 py-0.5 rounded-md">
                      {card.immediateAction.length} خطوات تدخل
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-sm sm:text-base font-black text-stone-900 group-hover:text-blue-900 transition-colors leading-snug mb-2">
                    {card.title}
                  </h3>

                  {/* Preview Text */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3 font-medium">
                    {card.preview}
                  </p>
                </div>

                {/* Card Footer Features */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700 font-black group-hover:underline flex items-center gap-1">
                      عرض الدليل الإجرائي
                      <ArrowRight className="w-3 h-3 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  {card.documentTemplate && (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <FileText className="w-3 h-3 text-emerald-600" />
                      نموذج وثيقة رسمية
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
                <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-blue-900 text-amber-300 font-mono shadow-2xs">
                      بطاقة {String(SUPERVISOR_FIELD_CARDS.findIndex((c) => c.id === selectedCard.id) + 1).padStart(2, '0')} / 20
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBadgeStyle(
                        selectedCard.badgeType
                      )}`}
                    >
                      {selectedCard.category}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-stone-900 leading-tight mt-1">
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
            <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2 shrink-0 flex-wrap">
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

              <span className="text-[11px] text-stone-500 font-bold hidden sm:inline">
                © جميع الحقوق محفوظة • ثانوية ابن الهيثم التقنية 2026/2027
              </span>

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

      {/* Decree 171 Infractions Scale Reference Modal */}
      <Decree171Modal
        isOpen={showDecree171Modal}
        onClose={() => setShowDecree171Modal(false)}
      />
    </div>
  );
};
