import React, { useState } from 'react';
import {
  GraduationCap,
  HelpCircle,
  Sparkles,
  Clock,
  ShieldAlert,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  Award,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
  Printer,
  FileText,
  Bookmark,
  Share2,
  Quote,
  ShieldCheck,
  Megaphone,
  Check,
  UserCheck
} from 'lucide-react';
import {
  NINE_REGULATION_PILLARS,
  REGULATION_SPEECHES,
  REGULATION_VOCABULARY,
  REGULATION_MOTTOS,
  RegulationPillar,
  RegulationSpeech,
  RegulationTerm
} from '../data/simplifiedRegulationsSummary';
import { RegulationPdfDownloadModal } from './RegulationPdfDownloadModal';

// Interactive Student Scenario Quiz (اختبر وعيك بالنظام الداخلي)
interface QuizQuestion {
  id: number;
  situation: string;
  options: { text: string; isCorrect: boolean; explanation: string }[];
  relatedLaw: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    situation: 'دق جرس المؤسسة وتأخرت 5 دقائق عن تحية العلم، ما هو التصرف القانوني والتربوي السليم؟',
    options: [
      {
        text: 'أنتظر في هدوء عند المدخل حتى ينتهي رفع العلم الوطني، ثم أدخل لتسجيل تأخري لدى مستشار التربية واستلام رخصة الدخول.',
        isCorrect: true,
        explanation: 'صحيح تماماً! الباب يغلق قبل تحية العلم بـ 5 دقائق احتراماً للنشيد والعلم الوطني، وبعدها تسوى الوضعية نظامياً برخصة دخول.'
      },
      {
        text: 'أحاول التسلق أو الدخول عبر أي ممر جانبي لتجنب التسجيل.',
        isCorrect: false,
        explanation: 'خطأ جسيم ويعرضك لإجراءات تأديبية ومخاطر حقيقية على سلامتك الجسدية.'
      },
      {
        text: 'أغادر فوراً وأعود إلى البيت دون إعلام الإدارة أو الولي.',
        isCorrect: false,
        explanation: 'خطأ! المؤسسة والولي يجب أن يكونا على علم لحمايتك وضمان سلامتك وتجنب تسجيل غياب غير مبرر.'
      }
    ],
    relatedLaw: 'المادتان 4 و 16 من النظام الداخلي'
  },
  {
    id: 2,
    situation: 'أحضر زميلك هاتفه النقال إلى القسم وحاول التقاط صورة تذكارية للسبورة وللأستاذ، ما موقف القانون الداخلي؟',
    options: [
      {
        text: 'ممنوع منعاً باتاً، ويترتب عليه حجز الهاتف مؤقتاً واستدعاء الولي، لأن تصوير الأساتذة والتلاميذ ممنوع قانوناً لحماية الخصوصية.',
        isCorrect: true,
        explanation: 'أحسنت! المادتان 43 و 44 تمنعان إحضار الهواتف وتمنعان أي تصوير أو تسجيل داخل الحرم المدرسي دون ترخيص رسمي مسبق.'
      },
      {
        text: 'مسموح ما دام الهدف هو التقاط صورة تذكارية للذكريات فقط.',
        isCorrect: false,
        explanation: 'غير صحيح! القانون صريح بنص المادة 44: يمنع التصوير أو التسجيل السمعي البصري داخل المؤسسة دون رخصة رسمية لحماية الخصوصية.'
      }
    ],
    relatedLaw: 'المادتان 43 و 44 من النظام الداخلي'
  },
  {
    id: 3,
    situation: 'أصبت بوعكة صحية وغبت يومين عن الدروس، كيف تستأنف دراستك بطريقة قانونية دون تسجيل إنذار في ملفك؟',
    options: [
      {
        text: 'أحضر برفقة ولي أمري أو أحضر شهادة طبية تبرر العجز خلال 48 ساعة للحصول على رخصة دخول من مصلحة الاستشارة التربوية.',
        isCorrect: true,
        explanation: 'ممتاز! المادة 15 توجب تبرير الغياب خلال 48 ساعة بالحضور أو الشهادة الطبية لاستلام رخصة الدخول الرسمية.'
      },
      {
        text: 'أدخل مباشرة إلى القسم وأخبر الأستاذ شفهياً بأنني كنت مريضاً.',
        isCorrect: false,
        explanation: 'غير صحيح! الأستاذ لا يسمح لك بالدخول إلا برخصة دخول رسمية مسلمة من مستشار التربية تجنباً للخلل الإداري.'
      }
    ],
    relatedLaw: 'المادة 15 من النظام الداخلي'
  },
  {
    id: 4,
    situation: 'أثناء فرض محروس في مادة الرياضيات، حاول زميل أن يطلب منك إجابة السؤال الثاني، ما المترتب القانوني عند الاستجابة له؟',
    options: [
      {
        text: 'منح علامة الصفر (00) فوراً لكليكما والإحالة المباشرة على مجلس التأديب لتطبيق العقوبات المناسبة.',
        isCorrect: true,
        explanation: 'إجابة دقيقة! المادة 21 واضحة وحازمة: الغش أو محاولة الغش أو المساعدة فيه توجب علامة 00 فوراً مع الإحالة على مجلس التأديب.'
      },
      {
        text: 'تنبيه شفهي بسيط فقط مع خصم نقطة واحدة من الورقة.',
        isCorrect: false,
        explanation: 'خطأ! وزارة التربية شددت الإجراءات لحماية النزاهة وتكافؤ الفرص، والعقوبة رسمياً هي علامة الصفر ومجلس التأديب.'
      }
    ],
    relatedLaw: 'المادة 21 من النظام الداخلي'
  },
  {
    id: 5,
    situation: 'قام تلميذ بتوسيخ طاولة دراسية بالكتابة عليها، ما هو الإجراء التربوي البديل المقترح وفق النظام الحديث؟',
    options: [
      {
        text: 'تكليفه بإجراء بديل ذي نفع مدرسي مثل تنظيف طاولات القاعة وصيانتها مع التعهد بعدم تكرار ذلك، كبديل إيجابي عن الطرد.',
        isCorrect: true,
        explanation: 'رائع! المواد 51 و 55 تشجع العقوبات البديلة ذات النفع العام لإصلاح السلوك دون حرمان التلميذ من متابعة دروسه.'
      },
      {
        text: 'طرده نهائياً من المؤسسة وحرمانه من الدراسة طوال العام.',
        isCorrect: false,
        explanation: 'غير صحيح! العقاب البدني أو الإقصاء التعسفي ممنوع، ومبدأ المرافقة التربوية يسبق أي عقاب صارم.'
      }
    ],
    relatedLaw: 'المواد 23 و 51 و 55 من النظام الداخلي'
  }
];

export const StudentGuide: React.FC = () => {
  // Navigation tabs within StudentGuide
  const [activeSection, setActiveSection] = useState<'summary' | 'speeches' | 'vocabulary' | 'quiz'>('summary');
  
  // Summary Pillars state
  const [selectedPillarId, setSelectedPillarId] = useState<string>(NINE_REGULATION_PILLARS[0].id);
  
  // Speeches state
  const [selectedSpeechId, setSelectedSpeechId] = useState<string>(REGULATION_SPEECHES[0].id);
  const [speechCopied, setSpeechCopied] = useState<boolean>(false);

  // Vocabulary search & filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vocabCategory, setVocabCategory] = useState<string>('الكل');

  // Quiz state
  const [activeQuizIndex, setActiveQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  // Active items
  const activePillar = NINE_REGULATION_PILLARS.find((p) => p.id === selectedPillarId) || NINE_REGULATION_PILLARS[0];
  const activeSpeech = REGULATION_SPEECHES.find((s) => s.id === selectedSpeechId) || REGULATION_SPEECHES[0];
  const currentQuiz = QUIZ_QUESTIONS[activeQuizIndex];

  const handleCopySpeech = (text: string) => {
    navigator.clipboard.writeText(text);
    setSpeechCopied(true);
    setTimeout(() => setSpeechCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered Vocabulary
  const filteredVocabulary = REGULATION_VOCABULARY.filter((item) => {
    const matchesCategory = vocabCategory === 'الكل' || item.category === vocabCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simpleDefinition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.legalArticleRef.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectOption = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    setAnsweredCount((prev) => prev + 1);
    if (currentQuiz.options[idx].isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setSelectedOption(null);
    if (activeQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setActiveQuizIndex((prev) => prev + 1);
    } else {
      setActiveQuizIndex(0);
    }
  };

  return (
    <div className="flex flex-col gap-6 print:m-0">
      {/* Top Friendly Hero Banner for Students */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden print:bg-white print:text-stone-900 print:border print:border-stone-300">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-bold mb-3">
              <GraduationCap className="w-4 h-4 text-emerald-300" />
              <span>دليل وملخص القانون الداخلي • ثانوية ابن الهيثم التقنية 2026/2027</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-wide mb-2">
              ملخص سهل ومبسط مع كلمات ومصطلحات القانون الداخلي
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              دليلك الشامل والمبسّط لفهم <strong>المواد الـ 55 للنظام الداخلي</strong> في 9 أركان ذهبية ميسّرة، مصحوبة بـ{' '}
              <strong>كلمات المشرف رشيد وميثاق شرف التلميذ</strong>، وقاموس الكلمات والمصطلحات القانونية المدرسية.
            </p>
          </div>

          {/* Quick Actions / Print */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto print:hidden flex-wrap sm:flex-nowrap">
            <RegulationPdfDownloadModal buttonVariant="header" />
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs backdrop-blur-xs"
              title="طباعة الدليل والملخص"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>طباعة الملخص</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="mt-6 pt-5 border-t border-emerald-700/50 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none print:hidden">
          <button
            onClick={() => setActiveSection('summary')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'summary'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>1. الملخص السهل والمبسط (الأركان الـ 9 للمواد الـ 55)</span>
          </button>

          <button
            onClick={() => setActiveSection('speeches')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'speeches'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60'
            }`}
          >
            <Megaphone className="w-4 h-4 text-emerald-400" />
            <span>2. كلمات وخطب القانون الداخلي (رشيد وقسم التلميذ)</span>
          </button>

          <button
            onClick={() => setActiveSection('vocabulary')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'vocabulary'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>3. قاموس الكلمات والمصطلحات القانونية المدرسية</span>
          </button>

          <button
            onClick={() => setActiveSection('quiz')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'quiz'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-cyan-300" />
            <span>4. تحدي المواقف اليومية (اختبر وعيك)</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: الملخص السهل والمبسط (الأركان الـ 9) ================= */}
      {activeSection === 'summary' && (
        <div className="flex flex-col gap-6">
          {/* Quick Notice */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-amber-900">
                  فلسفة التبسيط: القانون الداخلي ميثاق نجاح وأمان وليس أداة عقاب
                </h4>
                <p className="text-xs text-amber-800">
                  جرى تلخيص المواد الـ 55 المعتمدة وزارياً في 9 أركان تربوية واضحة توضح لك ما يجب عليك القيام به وما يحميك ويوفر لك بيئة ممتازة للتفوق.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-200/60 text-amber-900 shrink-0 hidden sm:inline">
              55 مادة ملخصة
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 9 Pillars Selector */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-stone-500 mb-1 px-1">
                اختر الركن للقراءة والاستماع (الأركان الـ 9):
              </span>
              {NINE_REGULATION_PILLARS.map((pillar) => {
                const isSelected = pillar.id === selectedPillarId;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => setSelectedPillarId(pillar.id)}
                    className={`p-3.5 rounded-2xl text-right transition-all flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white/80 hover:bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <span className="text-xl p-2 bg-stone-50 rounded-xl shrink-0 border border-stone-100">
                      {pillar.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-black text-stone-900 truncate">
                          {pillar.number}. {pillar.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0">
                          {pillar.articlesRange}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{pillar.headline}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Detailed Card for Active Pillar */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs flex flex-col gap-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                      {activePillar.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          الركن {activePillar.number} من 9
                        </span>
                        <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
                          {activePillar.articlesRange}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-stone-900 mt-1">
                        {activePillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-800 mt-0.5">
                        {activePillar.headline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simplified Explanation */}
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
                  <span className="text-xs font-black text-stone-900 block mb-1.5 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>الملخص المبسط للأحكام:</span>
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {activePillar.summary}
                  </p>
                </div>

                {/* Key Points Bullet List */}
                <div>
                  <span className="text-xs font-black text-stone-800 block mb-2">
                    أهم النقاط التي يجب أن تعرفها:
                  </span>
                  <ul className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-stone-700">
                    {activePillar.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-stone-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rights vs Duties Comparison Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-emerald-900 font-black text-xs sm:text-sm mb-1.5">
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>واجبك الأساسي:</span>
                    </div>
                    <p className="text-xs text-stone-800 leading-relaxed font-medium">
                      {activePillar.studentDuty}
                    </p>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-blue-900 font-black text-xs sm:text-sm mb-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      <span>حقك الذهبي المكفول:</span>
                    </div>
                    <p className="text-xs text-stone-800 leading-relaxed font-medium">
                      {activePillar.studentRight}
                    </p>
                  </div>
                </div>

                {/* Golden Motto Bar */}
                <div className="bg-stone-900 text-white rounded-2xl px-4 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-amber-300 block">القاعدة والشعار الذهبي:</span>
                      <span className="text-xs font-bold text-stone-100">{activePillar.goldenRule}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono hidden md:inline">ابن الهيثم التقنية</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: كلمات وخطب القانون الداخلي ================= */}
      {activeSection === 'speeches' && (
        <div className="flex flex-col gap-6">
          {/* Header Description */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  كلمات وخطب رسمية وميثاق شرف القانون الداخلي
                </h3>
                <p className="text-xs text-stone-500">
                  خطب توجيهية تربوية مجهزة للإلقاء في الطابور الصباحي، لقاءات استقبال الأولياء، وتوقيع التعهد
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
                توجيهات وميثاق شرف معتمد
              </span>
            </div>
          </div>

          {/* Speeches Selection and Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left list */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-stone-500 mb-1 px-1">اختر الكلمة:</span>
              {REGULATION_SPEECHES.map((sp) => {
                const isSelected = sp.id === selectedSpeechId;
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      setSelectedSpeechId(sp.id);
                      setSpeechCopied(false);
                    }}
                    className={`p-4 rounded-2xl text-right transition-all flex flex-col gap-2 border ${
                      isSelected
                        ? 'bg-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white/80 hover:bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-stone-900 line-clamp-1">{sp.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 shrink-0">
                        {sp.speaker}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-2">{sp.context}</p>
                  </button>
                );
              })}

              {/* Inspiring Mottos mini-card */}
              <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>شعارات جدارية سريعة للقانون الداخلي:</span>
                </div>
                <ul className="space-y-2 text-[11px] text-stone-800">
                  {REGULATION_MOTTOS.slice(0, 3).map((m) => (
                    <li key={m.id} className="p-2 bg-white/80 rounded-xl border border-amber-200/50">
                      <span className="font-bold text-stone-900 block">{m.motto}</span>
                      <span className="text-[10px] text-stone-500">{m.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Display of Active Speech */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {activeSpeech.speakerRole}
                      </span>
                      <span className="text-xs font-bold text-stone-500">{activeSpeech.speaker}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-stone-900">{activeSpeech.title}</h3>
                    <p className="text-xs text-stone-500 mt-1">
                      <strong>المناسبة:</strong> {activeSpeech.context}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopySpeech(activeSpeech.text)}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-200"
                      title="نسخ نص الكلمة"
                    >
                      {speechCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-stone-600" />
                          <span>نسخ النص</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Speech Content with Quote Styling */}
                <div className="relative bg-stone-50/90 rounded-2xl p-6 sm:p-8 border border-stone-200">
                  <Quote className="w-12 h-12 text-emerald-800/10 absolute top-4 right-4 pointer-events-none" />
                  <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-stone-800 font-medium font-['Cairo',sans-serif]">
                    {activeSpeech.text}
                  </div>
                </div>

                {/* Tags & Footer Note */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-stone-500">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-700">الكلمات الدلالية:</span>
                    {activeSpeech.tags.map((t, idx) => (
                      <span key={idx} className="bg-stone-100 px-2.5 py-0.5 rounded-full text-stone-600 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>محرر ومعتمد لثانوية ابن الهيثم التقنية</span>
                  </div>
                </div>
              </div>

              {/* All Wall Mottos Gallery */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>باقة الكلمات والشعارات الجدارية المدرسية (جاهزة للاقتباس والتعليق)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-stone-500">{REGULATION_MOTTOS.length} شعارات</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {REGULATION_MOTTOS.map((motto) => (
                    <div
                      key={motto.id}
                      className="bg-stone-50 hover:bg-emerald-50/40 p-4 rounded-2xl border border-stone-200 transition-all flex flex-col justify-between gap-2"
                    >
                      <p className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                        {motto.motto}
                      </p>
                      <div className="flex items-center justify-between gap-2 text-[10px] text-stone-500 pt-2 border-t border-stone-200/50">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {motto.category}
                        </span>
                        <span>{motto.context}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: قاموس الكلمات والمصطلحات القانونية ================= */}
      {activeSection === 'vocabulary' && (
        <div className="flex flex-col gap-6">
          {/* Search and Filters Bar */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  معجم وقاموس كلمات ومصطلحات القانون الداخلي
                </h3>
                <p className="text-xs text-stone-500">
                  شرح مبسط وسهل لأهم المصطلحات القانونية والإدارية التي يراها التلميذ والولي في المؤسسة
                </p>
              </div>
            </div>

            {/* Filter buttons & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  placeholder="ابحث عن كلمة أو مصطلح..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pr-9 pl-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={vocabCategory}
                onChange={(e) => setVocabCategory(e.target.value)}
                className="bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="الكل">كل التصنيفات ({REGULATION_VOCABULARY.length})</option>
                <option value="إداري">إداري</option>
                <option value="بيداغوجي">بيداغوجي</option>
                <option value="انضباطي">انضباطي</option>
                <option value="حقوق ووقاية">حقوق ووقاية</option>
              </select>
            </div>
          </div>

          {/* Vocabulary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocabulary.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="font-bold text-sm">لم يتم العثور على أي مصطلح يطابق بحثك</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setVocabCategory('الكل');
                  }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              filteredVocabulary.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-stone-900 mb-1.5">{item.term}</h4>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium mb-3">
                      {item.simpleDefinition}
                    </p>

                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 mb-2">
                      <span className="text-[10px] font-bold text-emerald-900 block mb-0.5">لماذا يهمك؟</span>
                      <p className="text-[11px] text-stone-700 leading-relaxed">{item.whyImportant}</p>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                      <span className="text-[10px] font-bold text-stone-600 block mb-0.5">مثال تطبيقي واقعي:</span>
                      <p className="text-[11px] text-stone-600 leading-relaxed">{item.practicalExample}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500">
                    <span className="font-bold text-emerald-800">{item.legalArticleRef}</span>
                    <span className="text-stone-400">ثانوية ابن الهيثم</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION 4: مسابقة وتحدي المواقف ================= */}
      {activeSection === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">تحدي المواقف اليومية (اختبر وعيك بالنظام الداخلي)</h3>
                <p className="text-xs text-stone-500">
                  مواقف واقعية تحدث يومياً في المؤسسة.. اختر القرار القانوني السليم لتربح شارة التلميذ المثالي!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full">
                السؤال {activeQuizIndex + 1} من {QUIZ_QUESTIONS.length}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                النتيجة: {score} / {answeredCount}
              </span>
            </div>
          </div>

          {/* Question & Options */}
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              <span className="text-[11px] font-bold text-emerald-800 block mb-1">الموقف الواقعي:</span>
              <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-relaxed">
                {currentQuiz.situation}
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {currentQuiz.options.map((opt, idx) => {
                let btnStyle = 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800';
                if (showExplanation) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20';
                  } else if (selectedOption === idx) {
                    btnStyle = 'bg-red-50 border-red-500 text-red-900';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={showExplanation}
                    className={`p-4 rounded-2xl border text-right text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-white border border-stone-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx === 0 ? 'أ' : idx === 1 ? 'ب' : 'ج'}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Box */}
            {showExplanation && (
              <div className="p-4 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  {selectedOption !== null && currentQuiz.options[selectedOption].isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-amber-300 block mb-0.5">
                      {selectedOption !== null && currentQuiz.options[selectedOption].isCorrect
                        ? 'إجابة صحيحة! أحسنت الوعي القانوني'
                        : 'تنبيه تربوي وقانوني مهم:'}
                    </span>
                    <p className="text-xs text-stone-200 leading-relaxed">
                      {selectedOption !== null ? currentQuiz.options[selectedOption].explanation : ''}
                    </p>
                    <span className="text-[10px] text-stone-400 block mt-1">
                      السند القانوني: {currentQuiz.relatedLaw}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 self-end sm:self-center transition-colors"
                >
                  <span>{activeQuizIndex < QUIZ_QUESTIONS.length - 1 ? 'الموقف التالي' : 'إعادة التحدي'}</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
