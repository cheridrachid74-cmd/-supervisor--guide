import React, { useState } from 'react';
import { Video, Camera, Clock, Move, Volume2, PenTool, CheckCircle, ChevronDown, ChevronUp, Sparkles, AlertCircle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
  duration: string;
  summary: string;
  instructions: string[];
  proTip: string;
}

export const VideoScribeGuide: React.FC = () => {
  const [openStep, setOpenStep] = useState<number | null>(1);

  const steps: Step[] = [
    {
      id: 1,
      title: 'الخطوة 1: استيراد ملف الصوت (Voiceover)',
      icon: <Volume2 className="w-5 h-5 text-amber-600" />,
      duration: 'دقيقة واحدة',
      summary: 'تسجيل النص الصوتي الكامل بنبرة واضحة ومحفزة وإدراجه في الفيديو.',
      instructions: [
        'استخدم تبويب "استوديو الصوت (VoiceManager)" لتسجيل صوتك بميزة الإيقاف المؤقت والمعاينة الحية.',
        'استعن بـ "مكتبة المؤثرات الصوتية" لتنزيل أصوات الانتقال (Whoosh)، رنين جرس المدرسة، ونغمات التنبيه بصيغة WAV نقية.',
        'قم بتنزيل الملفات بصيغة WAV (.wav) المجهزة خصيصاً للتوافق التام مع VideoScribe وبرامج المونتاج.',
        'احرص على ألا تتجاوز مدة كل مشهد 7 إلى 10 ثوانٍ ليبقى انتباه المشاهد متقداً.',
        'في واجهة VideoScribe الرئيسية، اضغط على أيقونة الميكروفون (Voiceover) أعلى الشريط العلوي.',
        'اختر "Import mp3 or wav" وارفع ملف الصوت الذي قمت بتنزيله، واضبط مستوى الصوت على 85% لتجنب التشويش.'
      ],
      proTip: 'صيغة WAV المتوفرة في VoiceManager هي 16-bit PCM قياسية تعمل مباشرة وبأعلى جودة نقاء صوتي في VideoScribe دون الحاجة لأي برامج تحويل إضافية.'
    },
    {
      id: 2,
      title: 'الخطوة 2: إسقاط المشاهد وتحديد وقت الرسم (Animate Time)',
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      duration: '10 دقائق',
      summary: 'إدراج ملفات SVG المفرغة وضبط زمن الرسم بين 1.5 إلى 2.5 ثانية لكل عنصر.',
      instructions: [
        'من تبويب "مصدّر SVG" في تطبيقنا، حمّل العناوين والرسومات المفرغة بالترتيب.',
        'اضغط على زر إضافة صورة في VideoScribe واستورد ملفات الـ SVG لتجنب مشكلة تقطع الحروف العربية.',
        'انقر نقراً مزدوجاً على العنصر في الشريط السفلي للدخول إلى "Element Properties".',
        'اضبط وقت الرسم (Animate Time) لكل عنصر بين 1.5s إلى 2.2s ليتطابق مع نطق الكلمة في الصوت.',
        'اضبط وقت التوقف (Pause Time) بين 0.5s إلى 1.0s لمنح التلميذ فرصة استيعاب الرسمة قبل الانتقال.'
      ],
      proTip: 'لا تفرط في زمن الرسم! الأزمنة التي تزيد عن 3 ثوانٍ للعنصر الواحد تسبب ملل المشاهد وتفقد الفيديو حركته السلسة.'
    },
    {
      id: 3,
      title: 'الخطوة 3: تثبيت زوايا الكاميرا (Set Camera)',
      icon: <Camera className="w-5 h-5 text-emerald-600" />,
      duration: '3 دقائق',
      summary: 'أهم خطوة لضمان ثبات اللوحة وعدم تحرك الكاميرا العشوائي أثناء ظهور العناصر.',
      instructions: [
        'بعد ترتيب عناصر المشهد الواحد بالكامل على اللوحة البيضاء، حدد جميع عناصره (عبر الضغط على Ctrl والضغط عليها في التايم لاين).',
        'اضغط على أيقونة الكاميرا التي عليها علامة صح خضراء (Set Camera to current canvas view) أسفل اليمين.',
        'هذا يضمن أن الكاميرا ستبقى ثابتة بإطار المشهد ولن تقفز بشكل مفاجئ بين العناصر داخل نفس المشهد.'
      ],
      proTip: 'إذا نسيت الضغط على Set Camera، سيقوم VideoScribe تلقائياً بعمل زووم مفرط على كل خطوة صغيرة مما يشتت الذهن!'
    },
    {
      id: 4,
      title: 'الخطوة 4: الانتقال السلس بين المشاهد (Smooth Pan)',
      icon: <Move className="w-5 h-5 text-purple-600" />,
      duration: '5 دقائق',
      summary: 'تحريك الكاميرا بسلاسة من مساحة المشهد الأول إلى الثاني على اللوحة اللامتناهية.',
      instructions: [
        'بعد الانتهاء من المشهد الأول وتثبيت كاميرته، اسحب اللوحة البيضاء بالماوس لليمين أو اليسار بمقدار شاشة كاملة.',
        'ابدأ برسم عناصر المشهد الثاني في هذه المساحة النظيفة الجديدة.',
        'اضبط وقت الانتقال (Transition Time) على 1.0 ثانية بنوع انتقال سلس (Smooth).',
        'ستلاحظ انتقال الكاميرا بحركة أفقية سينمائية راقية تأخذ المشاهد من مشهد المقدمة إلى مشهد المواعيد والانضباط.'
      ],
      proTip: 'اجعل مسار حركة الكاميرا من اليمين إلى اليسار ليناسب اتجاه القراءة والكتابة باللغة العربية.'
    },
    {
      id: 5,
      title: 'الخطوة 5: نوع اليد والمؤثرات الصوتية (Marker Sound)',
      icon: <PenTool className="w-5 h-5 text-rose-600" />,
      duration: '3 دقائق',
      summary: 'اختيار يد كلاسيكية تحمل قلماً أزرق أو أسود، وتفعيل صوت احتكاك القلم على اللوحة.',
      instructions: [
        'اضغط على أيقونة اليد (Hand Icon) في الشريط العلوي لتغيير شكل يد الرسام.',
        'اختر يداً كلاسيكية تحمل قلماً أزرق أو أسود يتناسب مع الطابع المدرسي التربوي الوقور.',
        'من مكتبة الأصوات أو من ملفات المؤثرات، أضف صوت قلم الماركر (Whiteboard Marker Squeak) لإضفاء إحساس واقعي بالرسم الحي.'
      ],
      proTip: 'يمكنك أيضاً معاينة المؤثر الصوتي وحركة اليد مباشرة داخل مشغل الوايت بورد في تطبيقنا لتجربة النتيجة قبل التصدير.'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
              <Video className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-stone-900">دليل التنفيذ الاحترافي داخل VideoScribe</h2>
          </div>
          <p className="text-stone-600 text-xs sm:text-sm">
            خطوات تطبيق السيناريو على لوحة VideoScribe البيضاء من البداية وحتى تصدير الفيديو النهائي.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-stone-600 bg-stone-100 px-3 py-2 rounded-xl">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>معد لمعايير الدخول المدرسي 2026/2027</span>
        </div>
      </div>

      {/* Accordion Steps */}
      <div className="flex flex-col gap-4">
        {steps.map((st) => {
          const isOpen = openStep === st.id;
          return (
            <div
              key={st.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isOpen ? 'border-purple-500 shadow-md ring-2 ring-purple-500/10' : 'border-stone-200 shadow-xs hover:border-stone-300'
              }`}
            >
              <button
                id={`step-header-btn-${st.id}`}
                onClick={() => setOpenStep(isOpen ? null : st.id)}
                className="w-full p-5 text-right flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 shrink-0">
                    {st.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-stone-900">{st.title}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{st.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                    {st.duration}
                  </span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-stone-100 flex flex-col gap-4">
                  <div className="space-y-2.5 pt-2">
                    {st.instructions.map((inst, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip Box */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">نصيحة المخرج (Pro Tip): </span>
                      {st.proTip}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
