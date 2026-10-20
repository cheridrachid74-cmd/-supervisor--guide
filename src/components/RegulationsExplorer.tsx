import React, { useState, useMemo, useRef } from 'react';
import { Search, BookOpen, Copy, Check, Filter, Bookmark, ExternalLink, Volume2, Square, Sparkles, Building2, Flag, GraduationCap, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';
import { OFFICIAL_REGULATIONS } from '../data/officialRegulations';
import { OfficialArticle } from '../types';
import { audioService } from '../utils/audioSynthesizer';

interface RegulationsExplorerProps {
  initialSearchArticle?: number | null;
  onSelectSceneForArticle?: (articleNumber: number) => void;
}

export const RegulationsExplorer: React.FC<RegulationsExplorerProps> = ({
  initialSearchArticle,
  onSelectSceneForArticle
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(
    initialSearchArticle ? `المادة ${initialSearchArticle}` : ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedNumber, setCopiedNumber] = useState<number | null>(null);
  const [speakingNumber, setSpeakingNumber] = useState<number | null>(null);
  const [activeArticleNumber, setActiveArticleNumber] = useState<number | null>(
    initialSearchArticle || null
  );

  // Flatten articles
  const allArticles = useMemo(() => {
    return OFFICIAL_REGULATIONS.flatMap((ch) => ch.articles);
  }, []);

  // Quick categories
  const categories = [
    { id: 'all', label: 'كل المواد (55 مادة)' },
    { id: 'discipline', label: '⏰ المواعيد والانضباط (4، 14، 16)', numbers: [4, 5, 6, 14, 16] },
    { id: 'absence', label: '📝 الغيابات ورخص الدخول (15، 20)', numbers: [15, 20] },
    { id: 'integrity', label: '⚖️ النزاهة ومجلس التأديب (21)', numbers: [21] },
    { id: 'mobile', label: '📵 الهواتف وحظر التصوير (43، 44)', numbers: [43, 44] },
    { id: 'canteen', label: '🍲 المطعم والسلامة الغذائية (23، 24، 25)', numbers: [23, 24, 25] },
    { id: 'health', label: '🩺 الكشف الصحي والوقاية (36-41)', numbers: [11, 36, 37, 38, 39, 40, 41] },
    { id: 'student_rights', label: '🌟 حقوق التلميذ (45)', numbers: [45] },
    { id: 'student_duties', label: '🛡️ واجبات التلميذ والمئزر (46)', numbers: [46] },
    { id: 'parents', label: '🤝 ميثاق الأولياء وتعهدهم (49، 50)', numbers: [49, 50, 51] }
  ];

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return allArticles.filter((art) => {
      // Filter by chapter
      if (selectedChapterId !== 'all' && art.chapterNumber !== selectedChapterId) {
        return false;
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        const catObj = categories.find((c) => c.id === selectedCategory);
        if (catObj && catObj.numbers && !catObj.numbers.includes(art.number)) {
          return false;
        }
      }

      // Filter by search term
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      const numMatch = `المادة ${art.number}`.includes(q) || art.number.toString() === q || `مادة ${art.number}`.includes(q);
      const textMatch = art.text.toLowerCase().includes(q);
      const tagMatch = art.tags.some((t) => t.toLowerCase().includes(q));
      const chapMatch = art.chapterTitle.toLowerCase().includes(q);
      const highlightMatch = art.keyHighlight ? art.keyHighlight.toLowerCase().includes(q) : false;
      const explanationMatch = art.studentExplanation ? art.studentExplanation.toLowerCase().includes(q) : false;

      return numMatch || textMatch || tagMatch || chapMatch || highlightMatch || explanationMatch;
    });
  }, [allArticles, selectedChapterId, selectedCategory, searchTerm]);

  const handleCopy = (art: OfficialArticle) => {
    const text = `المادة ${art.number} (${art.chapterTitle}):\n${art.text}\n\nجوهر المادة: ${art.keyHighlight || ''}\nالشرح المبسط: ${art.studentExplanation || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedNumber(art.number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleSpeak = (art: OfficialArticle) => {
    if (speakingNumber === art.number) {
      audioService.stopSpeech();
      setSpeakingNumber(null);
    } else {
      audioService.stopSpeech();
      setSpeakingNumber(art.number);
      const speechText = `المادة ${art.number}. ${art.keyHighlight || ''}. الشرح الميسر للتلميذ: ${art.studentExplanation || art.text}`;
      audioService.speakText(speechText, () => {
        setSpeakingNumber(null);
      }, 0.95);
    }
  };

  const scrollToArticle = (num: number) => {
    setActiveArticleNumber(num);
    setSelectedChapterId('all');
    setSelectedCategory('all');
    setSearchTerm('');
    setTimeout(() => {
      const el = document.getElementById(`article-card-${num}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-emerald-400');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-emerald-400');
        }, 2000);
      }
    }, 100);
  };

  const getArticleColorClass = (num: number) => {
    if ([45, 12, 13, 23, 52].includes(num)) {
      return {
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        border: 'border-emerald-200 hover:border-emerald-400',
        tag: 'حقوق وامتيازات'
      };
    }
    if ([21, 35, 43, 44].includes(num)) {
      return {
        badge: 'bg-rose-100 text-rose-900 border-rose-300',
        border: 'border-rose-200 hover:border-rose-400',
        tag: 'محظورات وخطوط حمراء'
      };
    }
    if ([15, 16, 20, 46, 50].includes(num)) {
      return {
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        border: 'border-amber-200 hover:border-amber-400',
        tag: 'انضباط وواجبات ملزمة'
      };
    }
    if ([36, 37, 38, 39, 40, 41, 11, 24, 28, 53, 54].includes(num)) {
      return {
        badge: 'bg-blue-100 text-blue-900 border-blue-300',
        border: 'border-blue-200 hover:border-blue-400',
        tag: 'صحة وأمن ووقاية'
      };
    }
    return {
      badge: 'bg-stone-100 text-stone-800 border-stone-300',
      border: 'border-stone-200 hover:border-stone-400',
      tag: 'تنظيم وسير المؤسسة'
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* High School Identity & Institutional Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        {/* Background architectural watermark */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <Building2 className="w-56 h-56 text-emerald-200" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>الجمهورية الجزائرية الديمقراطية الشعبية • وزارة التربية الوطنية</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800/80 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
                <Building2 className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ثانوية ابن الهيثم التقنية – محمد بلوزداد
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 font-semibold mt-0.5">
                  مديرية التربية لولاية الجزائر وسط • الدليل التفسيري للنظام الداخلي للمؤسسة (2026 / 2027)
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-200 max-w-3xl leading-relaxed pt-1">
              شرح كامل ومفصل مادة بمادة (من المادة 01 إلى المادة 55) يجمع بين <strong>النص التشريعي الرسمي</strong> و<strong>جوهر المادة</strong> و<strong>الشرح التوجيهي المبسط للتلميذ</strong> لترسيخ الوعي القانوني والانضباط التربوي في الثانوية.
            </p>
          </div>

          {/* Quick Statistics Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex md:flex-col items-center justify-around gap-4 shrink-0 w-full md:w-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">55</div>
              <div className="text-[11px] text-stone-300 font-bold">مادة قانونية كاملة</div>
            </div>
            <div className="h-8 w-px md:h-px md:w-full bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">9</div>
              <div className="text-[11px] text-stone-300 font-bold">فصول تشريعية</div>
            </div>
          </div>
        </div>
      </div>

      {/* Numeric Jump Bar (01 to 55) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-black text-stone-800">
              الانتقال السريع لرقم المادة (من 01 إلى 55):
            </span>
          </div>
          <span className="text-[11px] font-bold text-stone-500">
            انقر على أي رقم للتنقل الفوري
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 scrollbar-thin">
          {allArticles.map((art) => {
            const isActive = activeArticleNumber === art.number;
            const style = getArticleColorClass(art.number);
            return (
              <button
                key={art.number}
                id={`quick-jump-art-${art.number}`}
                onClick={() => scrollToArticle(art.number)}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all border ${
                  isActive
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm scale-105'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900'
                }`}
                title={`المادة ${art.number}: ${art.keyHighlight || art.chapterTitle}`}
              >
                {art.number < 10 ? `0${art.number}` : art.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls: Search, Topic Filters, Chapter Chips */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex-1">
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>مستكشف نصوص النظام الداخلي مشروحاً للتلاميذ</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              يعرض النص التشريعي الأصلي إلى جانب التوجيه التربوي العملي للتلميذ
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="regulations-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم المادة أو النص أو الكلمات..."
              className="w-full pr-10 pl-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-stone-900 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 bg-stone-200 px-1.5 py-0.5 rounded"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Chapters filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-stone-100 scrollbar-none">
          <button
            onClick={() => setSelectedChapterId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
              selectedChapterId === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            كل الفصول ({allArticles.length})
          </button>

          {OFFICIAL_REGULATIONS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChapterId(ch.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                selectedChapterId === ch.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {ch.title.split('–')[0].trim()} ({ch.articles.length})
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-stone-600">
          يتم عرض {filteredArticles.length} مادة من إجمالي {allArticles.length} مادة قانونية
        </span>
        {(selectedChapterId !== 'all' || selectedCategory !== 'all' || searchTerm) && (
          <button
            onClick={() => {
              setSelectedChapterId('all');
              setSelectedCategory('all');
              setSearchTerm('');
            }}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            إعادة تعيين كافة الفلاتر
          </button>
        )}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
            <BookOpen className="w-14 h-14 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-black text-stone-800 mb-1">لا توجد مواد تطابق خيارات البحث</h3>
            <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mb-4">
              جرّب البحث برقم المادة (مثلاً: "المادة 15" أو "المادة 43") أو تصفح حسب الفصول والمحاور.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedChapterId('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 shadow-xs"
            >
              عرض كافة المواد الـ 55
            </button>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const colorMeta = getArticleColorClass(art.number);
            const isSpeaking = speakingNumber === art.number;

            return (
              <div
                key={art.number}
                id={`article-card-${art.number}`}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${colorMeta.border}`}
              >
                <div>
                  {/* Article Card Top Info */}
                  <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-xl font-black text-sm border ${colorMeta.badge}`}>
                        المادة {art.number < 10 ? `0${art.number}` : art.number}
                      </span>
                      <span className="text-xs font-bold text-stone-700">
                        {art.chapterTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Audio listen button */}
                      <button
                        onClick={() => handleSpeak(art)}
                        className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
                          isSpeaking
                            ? 'bg-rose-100 border-rose-300 text-rose-800 animate-pulse font-bold'
                            : 'border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                        title={isSpeaking ? 'إيقاف النطق الصوتي' : 'استماع صوتي للمادة وشرحها'}
                      >
                        {isSpeaking ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span className="text-[10px]">إيقاف</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">استماع</span>
                          </>
                        )}
                      </button>

                      {/* Copy button */}
                      <button
                        onClick={() => handleCopy(art)}
                        className="p-1.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs flex items-center gap-1 transition-colors"
                        title="نسخ نص المادة والشرح"
                      >
                        {copiedNumber === art.number ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold text-[11px]">تم</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Official Legal Text */}
                  <div className="mb-3.5 bg-stone-50/60 p-3.5 rounded-xl border border-stone-200/80">
                    <span className="text-[10px] font-black tracking-wider text-stone-500 uppercase block mb-1">
                      النص القانوني الرسمي:
                    </span>
                    <p className="text-stone-900 text-xs sm:text-sm leading-relaxed font-normal">
                      {art.text}
                    </p>
                  </div>

                  {/* Key Highlight Banner */}
                  {art.keyHighlight && (
                    <div className="bg-amber-50/90 border-r-3 border-amber-500 px-3.5 py-2 rounded-l-xl text-xs text-amber-950 font-bold mb-3 shadow-2xs">
                      <span className="text-amber-800 font-black">جوهر المادة: </span>
                      <span>{art.keyHighlight}</span>
                    </div>
                  )}

                  {/* Student Simple Explanation */}
                  {art.studentExplanation && (
                    <div className="bg-emerald-50/90 border border-emerald-200/80 px-3.5 py-2.5 rounded-xl text-xs text-emerald-950 font-medium mb-3 shadow-2xs leading-relaxed">
                      {art.studentExplanation}
                    </div>
                  )}
                </div>

                {/* Card Footer: Tags & Scene link */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 mt-2">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-800">
                      {colorMeta.tag}
                    </span>
                    {art.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {onSelectSceneForArticle && (
                    <button
                      onClick={() => onSelectSceneForArticle(art.number)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <span>المشهد بالوايت بورد</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
