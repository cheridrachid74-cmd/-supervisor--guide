import React, { useState } from 'react';
import {
  Download,
  X,
  CheckCircle2,
  Smartphone,
  Share2,
  Copy,
  ExternalLink,
  ChevronDown,
  Sparkles,
  HelpCircle,
  ArrowDown,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isSamsung,
    isInAppBrowser,
    installSuccess,
    triggerInstall,
    copyAppUrl,
    shareApp,
  } = usePWAInstall();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'samsung' | 'chrome' | 'inapp' | 'ios'>(
    isIOS ? 'ios' : isSamsung ? 'samsung' : isInAppBrowser ? 'inapp' : 'samsung'
  );

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    const success = await copyAppUrl();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDirectInstall = async () => {
    const success = await triggerInstall();
    if (success) {
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header with App Identity */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 flex items-center justify-center shrink-0 shadow-inner">
              <img src="/icon.svg" alt="شعار النظام الداخلي" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-white">
                  تثبيت تطبيق النظام الداخلي الموحد
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">
                ثانوية ابن الهيثم التقنية • يعمل كبرنامج كامل وسريع على هاتفك
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          
          {/* Status if already installed */}
          {isInstalled && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-xs sm:text-sm font-black block">التطبيق مثبت بالفعل على جهازك!</strong>
                <p className="text-[11px] text-emerald-800">
                  يمكنك فتحه مباشرة من الشاشة الرئيسية لهاتفك في أي وقت دون الحاجة لمتصفح.
                </p>
              </div>
            </div>
          )}

          {/* PRIMARY ONE-CLICK DIRECT INSTALL BUTTON */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleDirectInstall}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg shadow-emerald-900/25 transition-all duration-200 flex items-center justify-between border-2 border-emerald-400 cursor-pointer transform hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3 text-right">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Download className="w-5 h-5 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black block text-amber-200">
                    اضغط هنا للتثبيت الفوري التلقائي
                  </span>
                  <span className="text-[11px] text-emerald-100">
                    تثبيت مباشر بنقرة واحدة دون الحاجة للبحث في القوائم
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white text-emerald-900 shrink-0">
                تثبيت الآن
              </span>
            </button>

            {installSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>تم إرسال أمر التثبيت بنجاح إلى شاشة هاتفك!</span>
              </div>
            )}
          </div>

          {/* EXPLANATION: WHY YOU DID NOT FIND THE THREE DOTS */}
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-black text-amber-900 mb-0.5">
                لماذا لم تجد الثلاث نقاط (⋮) في هاتفك؟
              </strong>
              <p className="text-[11px] text-amber-900">
                في أغلب الهواتف (خاصة سامسونج أو المتصفحات الحديثة)، لا توجد ثلاث نقاط في الأعلى، بل <strong>ثلاثة خطوط أفقية (☰) في أسفل الشاشة على اليمين</strong>، أو أن شريط المتصفح يختفي تلقائياً عند التمرير. اختر نوع هاتفك أدناه للحل السريع:
              </p>
            </div>
          </div>

          {/* TABS SELECTOR FOR PHONE TYPE */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('samsung')}
              className={`flex-1 py-2 px-2 rounded-xl transition-all text-center cursor-pointer ${
                activeTab === 'samsung'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              هواتف سامسونج
            </button>
            <button
              onClick={() => setActiveTab('chrome')}
              className={`flex-1 py-2 px-2 rounded-xl transition-all text-center cursor-pointer ${
                activeTab === 'chrome'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              متصفح Chrome
            </button>
            <button
              onClick={() => setActiveTab('inapp')}
              className={`flex-1 py-2 px-2 rounded-xl transition-all text-center cursor-pointer ${
                activeTab === 'inapp'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              واتساب / فيسبوك
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 px-2 rounded-xl transition-all text-center cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200'
              }`}
            >
              هواتف آيفون
            </button>
          </div>

          {/* TAB CONTENT: SAMSUNG */}
          {activeTab === 'samsung' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-stone-900 font-black">
                <span className="w-6 h-6 rounded-lg bg-blue-700 text-white flex items-center justify-center text-xs">1</span>
                <span>على هواتف سامسونج (Samsung Internet):</span>
              </div>
              <div className="space-y-2 text-stone-700 text-[11px] leading-relaxed mr-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-stone-200 flex items-center justify-center font-bold text-xs">☰</span>
                  <span>انظر إلى <strong>أسفل الشاشة على اليمين</strong> واضغط على زر القائمة (ثلاثة خطوط أفقية ☰).</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-stone-200 flex items-center justify-center font-bold text-xs">+</span>
                  <span>اختر <strong>«+ إضافة الصفحة إلى»</strong> ثم اختر <strong>«الشاشة الرئيسية (Home screen)»</strong>.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <span>✓</span>
                  <span>سيتم إضافة أيقونة التطبيق الرسمية فوراً على شاشتك.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: CHROME */}
          {activeTab === 'chrome' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-stone-900 font-black">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">2</span>
                <span>متصفح جوجل كروم (Google Chrome):</span>
              </div>
              <div className="space-y-2 text-stone-700 text-[11px] leading-relaxed mr-2">
                <div className="flex items-center gap-2">
                  <ArrowDown className="w-4 h-4 text-emerald-700 animate-bounce" />
                  <span><strong>إذا كان الشريط العلوي مخفياً:</strong> اسحب الشاشة بإصبعك برفق إلى الأسفل ليظهر شريط العنوان فوراً.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-stone-200 flex items-center justify-center font-bold text-xs">⋮</span>
                  <span>اضغط على الثلاث نقاط (⋮) في أعلى يسار أو يمين المتصفح.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>اختر <strong>«تثبيت التطبيق» (Install app)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: IN-APP BROWSER (WHATSAPP / FACEBOOK) */}
          {activeTab === 'inapp' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-stone-900 font-black">
                <span className="w-6 h-6 rounded-lg bg-rose-700 text-white flex items-center justify-center text-xs">3</span>
                <span>إذا فتحت الرابط من داخل (واتساب أو فيسبوك):</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                المتصفح الداخلي لواتساب وفيسبوك يمنع التثبيت المباشر. أفضل حل سهل وفعال:
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم نسخ الرابط!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-300" />
                      <span>انسخ رابط التطبيق وافتحه في Chrome</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: IOS SAFARI */}
          {activeTab === 'ios' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-stone-900 font-black">
                <span className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center text-xs">4</span>
                <span>على هواتف آبل آيفون (Apple Safari):</span>
              </div>
              <div className="space-y-2 text-stone-700 text-[11px] leading-relaxed mr-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-stone-200 flex items-center justify-center font-bold text-xs">⎋</span>
                  <span>اضغط على زر المشاركة (Share ⎋) في أسفل شاشة المتصفح.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-stone-200 flex items-center justify-center font-bold text-xs">+</span>
                  <span>اختر <strong>«إضافة إلى الصفحة الرئيسية» (Add to Home Screen)</strong>.</span>
                </div>
              </div>
            </div>
          )}

          {/* SHARE & QUICK UTILITIES */}
          <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">تم نسخ الرابط بنجاح</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>نسخ الرابط المباشر</span>
                </>
              )}
            </button>

            <button
              onClick={() => shareApp()}
              className="py-2 px-3.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="مشاركة التطبيق"
            >
              <Share2 className="w-3.5 h-3.5 text-stone-500" />
              <span>مشاركة</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 font-bold">
            ⚡ تثبيت خفيف وسريع • لا يستهلك سعة الذاكرة
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
