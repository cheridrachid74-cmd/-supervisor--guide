import React from 'react';
import { Scale, X, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface Decree171ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Decree171Modal: React.FC<Decree171ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-stone-200 text-stone-900 font-['Cairo',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
              <Scale className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-500">
                  المرجع التشريعي المعتمد
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700">
                  وزارة التربية الوطنية
                </span>
              </div>
              <h2 className="text-base font-black text-stone-950 leading-tight">
                سلّم تصنيف أخطاء التلاميذ والعقوبات (القرار 171)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            title="إغلاق"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <p>
              يحدد <strong>القرار الوزاري رقم 171 المؤرخ في 1 جوان 1992</strong> النظام الانضباطي داخل المؤسسات التعليمية، ويصنف مخالفات التلاميذ إلى 4 درجات محددة الصلاحيات تجنباً للتعسف وضماناً للعدالة التربوية:
            </p>
          </div>

          {/* Degree 1 */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="font-black text-stone-900 text-sm">
                1. أخطاء الدرجة الأولى (مخالفات خفيفة)
              </span>
              <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                صلاحية: المشرف والأستاذ
              </span>
            </div>
            <div className="text-stone-600 text-xs">
              <strong className="text-stone-900">طبيعة الأخطاء:</strong> التأخرات الصباحية غير المتكررة، عدم ارتداء المئزر المدرسي، إهمال الأدوات المدرسية، التشويش البسيط في الرواق أو القسم.
            </div>
            <div className="text-emerald-800 font-semibold text-xs bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
              <strong>العقوبات المقررة:</strong> إنذار شفهي، تنبيه كتابي مسجل في الملف، تكليف التلميذ بنشاط نفعي تربوي (ترتيب مكتبة، نظافة الفناء).
            </div>
          </div>

          {/* Degree 2 */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="font-black text-amber-900 text-sm">
                2. أخطاء الدرجة الثانية (إخلال متكرر بالنظام)
              </span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                صلاحية: مستشار التربية والمدير
              </span>
            </div>
            <div className="text-stone-600 text-xs">
              <strong className="text-stone-900">طبيعة الأخطاء:</strong> الغياب غير المبرر المتكرر، التهرب من الحصص، رفض الامتثال للتعليمات التربوية، تمزيق أو إتلاف الوثائق المدرسية.
            </div>
            <div className="text-amber-900 font-semibold text-xs bg-amber-50/70 p-2 rounded-lg border border-amber-100">
              <strong>العقوبات المقررة:</strong> توبيخ كتابي رسمي يبلّغ لولي الأمر ويودع بالملف المدرسي، مع خصم من علامة المواظبة والسلوك.
            </div>
          </div>

          {/* Degree 3 */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="font-black text-orange-900 text-sm">
                3. أخطاء الدرجة الثالثة (أخطاء جسيمة)
              </span>
              <span className="text-[11px] font-bold text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                صلاحية: مجلس التأديب
              </span>
            </div>
            <div className="text-stone-600 text-xs">
              <strong className="text-stone-900">طبيعة الأخطاء:</strong> الشجار العنيف بالساحة، تسلق أسوار الثانوية والهروب، الغش الموثق في الاختبارات، إتلاف تجهيزات المخبر أو القسم، استخدام الهاتف للتصوير غير المرخص.
            </div>
            <div className="text-orange-950 font-semibold text-xs bg-orange-50/70 p-2 rounded-lg border border-orange-100">
              <strong>العقوبات المقررة:</strong> إنذار شديد اللهجة مع التسجيل ببطاقية السوابق، إحالة فورية على مجلس التأديب، إقصاء مؤقت من 1 إلى 3 أيام، وإلزام الولي بالتعويض المادي.
            </div>
          </div>

          {/* Degree 4 */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white space-y-2">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="font-black text-red-900 text-sm">
                4. أخطاء الدرجة الرابعة (أخطاء بالغة الخطورة)
              </span>
              <span className="text-[11px] font-bold text-red-800 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                صلاحية: مجلس التأديب + مديرية التربية
              </span>
            </div>
            <div className="text-stone-600 text-xs">
              <strong className="text-stone-900">طبيعة الأخطاء:</strong> حيازة الأسلحة البيضاء أو المفرقعات والمواد الخطرة، الاعتداء الجسدي العمدي، إهانة وشتم الأساتذة والموظفين (المادة 144 عقوبات)، التشهير والجرائم الإلكترونية، تزوير الأختام والمحررات.
            </div>
            <div className="text-red-950 font-semibold text-xs bg-red-50/70 p-2 rounded-lg border border-red-100">
              <strong>العقوبات المقررة:</strong> الإقصاء المؤقت لأكثر من 3 أيام، أو الإقصاء النهائي من المؤسسة مع التحويل لثانوية أخرى، واحتفاظ الإدارة بحق الشكوى القضائية.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500 font-medium">
            المصدر: القرار الوزاري رقم 171 • ثانوية ابن الهيثم التقنية
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
