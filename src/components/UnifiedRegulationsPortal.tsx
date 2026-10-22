import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Copy,
  Check,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Share2,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';
import { OFFICIAL_REGULATIONS } from '../data/officialRegulations';
import { OfficialArticle, OfficialChapter } from '../types';
import { RegulationPdfDownloadModal } from './RegulationPdfDownloadModal';
import { PWAInstallModal } from './PWAInstallModal';

interface ChapterVisualMeta {
  id: number;
  title: string;
  shortTitle: string;
  articlesCount: number;
  articlesRange: string;
  bgGradient: string;
  hoverGradient: string;
  accentColor: string;
  icon: string;
  summary: string;
}

const CHAPTERS_META: ChapterVisualMeta[] = [
  {
    id: 1,
    title: 'الفصل الأول: أحكام عامة',
    shortTitle: 'أحكام عامة',
    articlesCount: 3,
    articlesRange: 'المواد 1 - 3',
    bgGradient: 'from-blue-700 to-indigo-850 bg-blue-700',
    hoverGradient: 'hover:from-blue-600 hover:to-indigo-800',
    accentColor: '#1d4ed8',
    icon: '⚖️',
    summary: 'أهداف النظام، الهوية والقيم الوطنية، ترسيخ المواطنة، ونبذ كافة أشكال العنف والتمييز.'
  },
  {
    id: 2,
    title: 'الفصل الثاني: تنظيم مؤسسة التربية والتعليم وسيرها',
    shortTitle: 'تنظيم المؤسسة وسيرها',
    articlesCount: 10,
    articlesRange: 'المواد 4 - 13',
    bgGradient: 'from-teal-700 to-emerald-850 bg-teal-700',
    hoverGradient: 'hover:from-teal-600 hover:to-emerald-800',
    accentColor: '#0f766e',
    icon: '🏫',
    summary: 'مواعيد الدخول والخروج، تحية العلم الوطني، تأطير الحركة في الساحة، وحفظ حرمة المؤسسة.'
  },
  {
    id: 3,
    title: 'الفصل الثالث: تنظيم الحياة المدرسية',
    shortTitle: 'تنظيم الحياة المدرسية',
    articlesCount: 9,
    articlesRange: 'المواد 14 - 22',
    bgGradient: 'from-emerald-700 to-green-850 bg-emerald-700',
    hoverGradient: 'hover:from-emerald-600 hover:to-green-800',
    accentColor: '#15803d',
    icon: '📋',
    summary: 'المواظبة، رخصة الدخول، تبرير الغيابات في 48 ساعة، النزاهة وعقوبة الغش في الامتحانات.'
  },
  {
    id: 4,
    title: 'الفصل الرابع: تنظيم المطعم المدرسي والنظامين الداخلي ونصف الداخلي',
    shortTitle: 'المطعم المدرسي والنظام الداخلي',
    articlesCount: 5,
    articlesRange: 'المواد 23 - 27',
    bgGradient: 'from-amber-700 to-yellow-900 bg-amber-700',
    hoverGradient: 'hover:from-amber-600 hover:to-yellow-850',
    accentColor: '#b45309',
    icon: '🍲',
    summary: 'الوجبة الساخنة المتوازنة، الوجبة الشاهدة لـ 5 أيام، آداب المطعم، والنقل المدرسي.'
  },
  {
    id: 5,
    title: 'الفصل الخامس: الوقاية، الصحة، النظافة والأمن',
    shortTitle: 'الوقاية والصحة والنظافة والأمن',
    articlesCount: 14,
    articlesRange: 'المواد 28 - 41',
    bgGradient: 'from-orange-800 to-red-900 bg-orange-800',
    hoverGradient: 'hover:from-orange-700 hover:to-red-850',
    accentColor: '#c2410c',
    icon: '🛡️',
    summary: 'حظر الأسلحة والممنوعات والتدخين، الهندام اللائق، وحدة الكشف والمتابعة الصحية والتحاليل الوقائية.'
  },
  {
    id: 6,
    title: 'الفصل السادس: تقنين استعمال وسائل الإعلام والاتصال المؤسساتية والخاصة',
    shortTitle: 'تقنين وسائل الإعلام والاتصال',
    articlesCount: 3,
    articlesRange: 'المواد 42 - 44',
    bgGradient: 'from-violet-800 to-purple-950 bg-violet-800',
    hoverGradient: 'hover:from-violet-700 hover:to-purple-900',
    accentColor: '#6d28d9',
    icon: '📵',
    summary: 'حظر الهواتف الذكية داخل الأقسام، منع تصوير الأساتذة والتلاميذ، وحماية الخصوصية الرقمية.'
  },
  {
    id: 7,
    title: 'الفصل السابع: الحقوق والواجبات',
    shortTitle: 'الحقوق والواجبات',
    articlesCount: 7,
    articlesRange: 'المواد 45 - 51',
    bgGradient: 'from-cyan-800 to-sky-950 bg-cyan-800',
    hoverGradient: 'hover:from-cyan-700 hover:to-sky-900',
    accentColor: '#0e7490',
    icon: '🌟',
    summary: 'حقوق وواجبات التلميذ، المئزر المدرسي، واجبات الأساتذة، حقوق الأولياء وجمعية الأولياء.'
  },
  {
    id: 8,
    title: 'الفصل الثامن: أحكام خاصة',
    shortTitle: 'أحكام خاصة',
    articlesCount: 3,
    articlesRange: 'المواد 52 - 54',
    bgGradient: 'from-fuchsia-800 to-pink-950 bg-fuchsia-800',
    hoverGradient: 'hover:from-fuchsia-700 hover:to-pink-900',
    accentColor: '#86198f',
    icon: '🤝',
    summary: 'رعاية ذوي الاحتياجات الخاصة، التكفل بالحوادث المدرسية وتأمينها، وواجب اليقظة وحماية التلاميذ.'
  },
  {
    id: 9,
    title: 'الفصل التاسع: أحكام ختامية',
    shortTitle: 'أحكام ختامية',
    articlesCount: 1,
    articlesRange: 'المادة 55',
    bgGradient: 'from-slate-700 to-stone-900 bg-slate-700',
    hoverGradient: 'hover:from-slate-600 hover:to-stone-850',
    accentColor: '#334155',
    icon: '📜',
    summary: 'إلزامية إشهار النظام الداخلي وإتاحته رقمياً لكافة الأساتذة والأولياء والتلاميذ.'
  }
];

const QUICK_TOPICS = [
  { label: '⏰ المواعيد وتحية العلم', query: 'تحية العلم' },
  { label: '📝 رخصة الدخول والغيابات', query: 'رخصة الدخول' },
  { label: '📵 منع الهواتف والتصوير', query: 'الهاتف' },
  { label: '⚖️ الغش ومجلس التأديب', query: 'الغش' },
  { label: '🥼 المئزر والهندام اللائق', query: 'المئزر' },
  { label: '🍲 المطعم والوجبة الشاهدة', query: 'المطعم' },
  { label: '🩺 الوقاية والصحة المدرسية', query: 'الصحة' },
  { label: '🌟 حقوق التلميذ', query: 'حقوق التلاميذ' },
  { label: '✍️ تعهد الأولياء', query: 'أولياء التلاميذ' }
];

interface UnifiedRegulationsPortalProps {
  onOpenSupervisorGuide?: () => void;
}

export const UnifiedRegulationsPortal: React.FC<UnifiedRegulationsPortalProps> = ({
  onOpenSupervisorGuide
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [selectedArticleModal, setSelectedArticleModal] = useState<OfficialArticle | null>(null);
  const [copiedArticleNum, setCopiedArticleNum] = useState<number | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);

  // Flatten all articles
  const allArticles = useMemo(() => {
    return OFFICIAL_REGULATIONS.flatMap((ch) => ch.articles);
  }, []);

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return allArticles.filter((art) => {
      const numMatch =
        `المادة ${art.number}`.includes(q) ||
        art.number.toString() === q ||
        `مادة ${art.number}`.includes(q);
      const textMatch = art.text.toLowerCase().includes(q);
      const tagMatch = art.tags.some((t) => t.toLowerCase().includes(q));
      const chapMatch = art.chapterTitle.toLowerCase().includes(q);
      const highlightMatch = art.keyHighlight ? art.keyHighlight.toLowerCase().includes(q) : false;
      const explanationMatch = art.studentExplanation
        ? art.studentExplanation.toLowerCase().includes(q)
        : false;

      return numMatch || textMatch || tagMatch || chapMatch || highlightMatch || explanationMatch;
    });
  }, [allArticles, searchQuery]);

  // Active chapter object
  const currentChapter = useMemo(() => {
    if (!activeChapterId) return null;
    return OFFICIAL_REGULATIONS.find((ch) => ch.id === activeChapterId) || null;
  }, [activeChapterId]);

  const currentChapterMeta = useMemo(() => {
    if (!activeChapterId) return null;
    return CHAPTERS_META.find((m) => m.id === activeChapterId) || null;
  }, [activeChapterId]);

  const handleCopyArticle = (art: OfficialArticle) => {
    const text = `الجمهورية الجزائرية الديمقراطية الشعبية\nوزارة التربية الوطنية - ثانوية ابن الهيثم التقنية\nالمادة ${art.number} (${art.chapterTitle}):\n${art.text}\n\n💡 الشرح المبسط:\n${art.studentExplanation || ''}\n\nالسنة الدراسية 2026/2027`;
    navigator.clipboard.writeText(text);
    setCopiedArticleNum(art.number);
    setTimeout(() => setCopiedArticleNum(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* ================= Institutional Header & Algeria Theme ================= */}
      <div className="bg-gradient-to-b from-sky-400/25 via-emerald-50/20 to-stone-100 rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs relative overflow-hidden">
        {/* Top Republic Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-xl shadow-xs shrink-0">
              🇩🇿
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-black text-emerald-900 block leading-tight">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-800 block">
                وزارة التربية الوطنية
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {onOpenSupervisorGuide && (
              <button
                onClick={onOpenSupervisorGuide}
                className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 border border-blue-700/40 cursor-pointer"
                title="فتح المساعد الذكي للإشراف التربوي - 20 بطاقة للتدخل السريع"
              >
                <img src="/supervisor-icon.svg" alt="أيقونة الإشراف" className="w-4 h-4 object-contain inline-block rounded-xs" />
                <span className="hidden sm:inline">دليل الإشراف الميداني</span>
                <span className="sm:hidden">دليل الإشراف</span>
                <span className="bg-amber-400 text-stone-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  20 بطاقة
                </span>
              </button>
            )}
            <RegulationPdfDownloadModal buttonVariant="header" />
            <button
              onClick={() => setShowInstallPrompt(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>تثبيت التطبيق</span>
            </button>
            <span className="hidden sm:inline text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-100/80 text-emerald-900 border border-emerald-200">
              ثانوية ابن الهيثم التقنية
            </span>
          </div>
        </div>

        {/* Central Title Pill (Hero like screenshot) */}
        <div className="py-6 flex flex-col items-center text-center gap-2">
          <div className="bg-white/95 backdrop-blur-md px-6 sm:px-10 py-3 rounded-full shadow-md border border-stone-200/80">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-red-700 tracking-tight">
              النظام الداخلي الموحد
            </h1>
          </div>
          <span className="text-sm sm:text-base font-black text-stone-800 mt-1">
            لمؤسسات التربية والتعليم
          </span>
          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
            <span className="text-xs font-bold text-stone-600 bg-stone-100/90 px-3 py-1 rounded-full border border-stone-200">
              القرار الوزاري رقم 778 / 65 والمرسوم 26-77
            </span>
            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              السنة الدراسية: 2026 - 2027
            </span>
          </div>

          {/* Top Quick Access Card for Supervisor Field Guide */}
          {onOpenSupervisorGuide && (
            <div className="mt-2.5 flex items-center justify-center w-full max-w-2xl px-2">
              <button
                onClick={onOpenSupervisorGuide}
                className="group w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white shadow-xl border-2 border-amber-400/80 hover:shadow-2xl hover:border-amber-300 transition-all cursor-pointer text-right"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="/supervisor-icon.svg"
                    alt="أيقونة دليل الإشراف"
                    className="w-11 h-11 rounded-xl bg-blue-950 p-0.5 shadow-md shrink-0 group-hover:scale-105 transition-transform border border-amber-400/50"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-white">
                        دليل الإشراف التربوي الميداني
                      </span>
                      <span className="bg-amber-400 text-stone-900 text-[10px] px-2 py-0.2 rounded-full font-black">
                        20 بطاقة كاملة
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-200 font-medium mt-0.5">
                      بطاقات التدخل السريع والمعالجة الميدانية (20 معضلة واقعية وحل بيداغوجي وقانوني معتمد)
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 group-hover:bg-white/20 transition-colors">
                  <span>فتح الدليل (20 بطاقة)</span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Main Instant Search Input (Central prominent white input) */}
        <div className="max-w-3xl mx-auto w-full mt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن مادة أو كلمة أو موضوع (مثال: الهاتف، المئزر، الغش، رخصة الدخول)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-10 py-3.5 sm:py-4 rounded-2xl sm:rounded-full bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm font-bold shadow-lg border border-stone-200 focus:outline-none focus:ring-3 focus:ring-emerald-500/40"
            />
            <Search className="w-5 h-5 text-emerald-700 absolute right-4 top-4" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-4 p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Topics */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
            <span className="text-[11px] font-bold text-stone-500 shrink-0">مواضيع سريعة:</span>
            {QUICK_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => setSearchQuery(topic.query)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/90 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200/80 shrink-0 transition-colors shadow-2xs"
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= Search Results View (When typing) ================= */}
      {searchQuery.trim() !== '' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-black text-stone-900">
                نتائج البحث عن «{searchQuery}»
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {searchResults.length} مادة مطابقة
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <p className="text-sm font-bold">لم نجد أي مادة مطابقة لكلمة البحث</p>
              <p className="text-xs text-stone-400 mt-1">
                جرب البحث برقم المادة (مثل: 43 أو 15) أو كلمات أخرى مثل: الغياب، الامتحان، المئزر.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-4 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
              >
                العودة لكافة الفصول
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((art) => (
                <div
                  key={art.number}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 bg-stone-50/50"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-black text-white bg-emerald-700 px-3 py-0.5 rounded-full">
                        المادة {art.number}
                      </span>
                      <span className="text-[11px] font-bold text-stone-500 truncate max-w-[180px]">
                        {art.chapterTitle}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium mb-3">
                      {art.text}
                    </p>

                    {art.studentExplanation && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 leading-relaxed font-semibold">
                        {art.studentExplanation}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyArticle(art)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        {copiedArticleNum === art.number ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-600" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setActiveChapterId(art.chapterNumber);
                        setSearchQuery('');
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
                    >
                      <span>عرض الفصل كاملاً</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= The 9 Official Chapters Grid (The Screenshot Design) ================= */}
      {!searchQuery && !activeChapterId && (
        <div className="flex flex-col gap-4">
          {/* Prominent Creative PDF Banner */}
          <RegulationPdfDownloadModal buttonVariant="prominent" />

          {/* New Official Supervisor Field Guide Banner */}
          {onOpenSupervisorGuide && (
            <div
              onClick={onOpenSupervisorGuide}
              className="w-full text-right bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white p-4 sm:p-5 rounded-3xl shadow-md border border-blue-600/40 hover:shadow-xl transition-all flex items-center justify-between gap-4 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
              <div className="flex items-center gap-3.5 relative z-10">
                <img
                  src="/supervisor-icon.svg"
                  alt="أيقونة دليل الإشراف"
                  className="w-12 h-12 rounded-2xl bg-blue-950 p-1 border border-amber-400/50 shadow-md shrink-0 group-hover:scale-105 transition-transform"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-white">
                      المساعد الذكي للإشراف التربوي الميداني
                    </span>
                    <span className="bg-amber-400 text-stone-900 text-[10px] px-2 py-0.2 rounded-full font-black">
                      20 بطاقة معالجة فورية
                    </span>
                    <span className="bg-blue-600/60 text-blue-100 text-[10px] px-2 py-0.2 rounded-full font-bold">
                      20 معضلة ميدانية وحل إجرائي موثق
                    </span>
                  </div>
                  <p className="text-xs text-blue-100/90 leading-relaxed font-medium">
                    خطوات إجرائية فورية لمشرفي ومستشاري التربية، أسانيد قانونية للمواد، ومحاضر رسمية جاهزة للنسخ والطباعة
                  </p>
                </div>
              </div>
              <div className="shrink-0 hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 group-hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 relative z-10">
                <span>تصفح الـ 20 بطاقة</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                الفصول الرسمية للنظام الداخلي (انقر على أي فصل للاطلاع على مواده):
              </h2>
            </div>
            <span className="text-xs font-bold text-stone-500">9 فصول • 55 مادة</span>
          </div>

          {/* 2-Column / 3-Column Responsive Grid matching the reference screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {CHAPTERS_META.map((chap) => (
              <button
                key={chap.id}
                onClick={() => setActiveChapterId(chap.id)}
                className={`text-right p-5 sm:p-6 rounded-3xl text-white shadow-md transition-all transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between gap-3 bg-gradient-to-br ${chap.bgGradient} ${chap.hoverGradient} relative overflow-hidden group`}
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-300"></div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-2xl p-2 bg-white/15 rounded-2xl backdrop-blur-xs">
                      {chap.icon}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                      {chap.articlesRange}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                    {chap.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 mt-1 leading-relaxed">
                    {chap.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
                  <span className="font-bold">{chap.articlesCount} مواد قانونية مشروحة</span>
                  <div className="flex items-center gap-1 font-bold group-hover:translate-x-[-4px] transition-transform">
                    <span>فتح المواد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= Active Chapter Reader (When a chapter is selected) ================= */}
      {!searchQuery && activeChapterId && currentChapter && currentChapterMeta && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Chapter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-3 rounded-2xl bg-stone-100">
                {currentChapterMeta.icon}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {currentChapterMeta.articlesRange}
                  </span>
                  <span className="text-xs font-bold text-stone-500">
                    {currentChapter.articles.length} مواد مشروحة
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
                  {currentChapter.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  {currentChapterMeta.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => setActiveChapterId(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-200"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة لشبكة الفصول</span>
              </button>
            </div>
          </div>

          {/* Articles List inside Active Chapter */}
          <div className="grid grid-cols-1 gap-5">
            {currentChapter.articles.map((art) => (
              <div
                key={art.number}
                id={`article-${art.number}`}
                className="p-5 sm:p-6 rounded-3xl border border-stone-200 bg-stone-50/70 hover:bg-white hover:border-emerald-500/60 hover:shadow-md transition-all flex flex-col gap-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {art.number}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-stone-900">
                      المادة {art.number}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyArticle(art)}
                      className="px-3 py-1.5 rounded-xl bg-stone-200/70 hover:bg-stone-300/80 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="نسخ المادة"
                    >
                      {copiedArticleNum === art.number ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-stone-600" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Official Text */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                  {art.text}
                </div>

                {/* Key Highlight & Student Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {art.keyHighlight && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed font-semibold">
                      <span className="block text-[11px] font-black text-amber-800 mb-0.5">
                        📌 جوهر المادة:
                      </span>
                      {art.keyHighlight}
                    </div>
                  )}

                  {art.studentExplanation && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 leading-relaxed font-semibold">
                      {art.studentExplanation}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {art.tags && art.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-stone-400">الكلمات الدالة:</span>
                    {art.tags.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(t)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 hover:bg-emerald-50 text-stone-600 hover:text-emerald-800 transition-colors"
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chapter Bottom Navigation (Prev / Next Chapter) */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            {activeChapterId > 1 ? (
              <button
                onClick={() => setActiveChapterId(activeChapterId - 1)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الفصل السابق ({activeChapterId - 1})</span>
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={() => setActiveChapterId(null)}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              العودة لكافة الفصول
            </button>

            {activeChapterId < 9 ? (
              <button
                onClick={() => setActiveChapterId(activeChapterId + 1)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-2"
              >
                <span>الفصل التالي ({activeChapterId + 1})</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}

      {/* ================= Footer Information (Like Screenshot) ================= */}
      <footer className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-bold px-2">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-black">
            السنة الدراسية: 2026 - 2027
          </span>
          <span>ثانوية ابن الهيثم التقنية – محمد بلوزداد (الجزائر وسط)</span>
        </div>

        <div className="flex items-center gap-2 text-stone-600 flex-wrap justify-center sm:justify-end">
          <span className="px-2.5 py-1 rounded-xl bg-red-700 text-white font-bold">
            إعداد وتصميم: المشرف التربوي رشيد
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-stone-200/80 text-stone-800 text-[11px] font-black">
            © جميع الحقوق محفوظة
          </span>
          <span className="text-[11px] text-stone-400">النسخة الرقمية المعتمدة</span>
        </div>
      </footer>

      {/* ================= Modern PWA Install Modal with Automatic One-Click & Guided Steps ================= */}
      <PWAInstallModal
        isOpen={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
      />
    </div>
  );
};
