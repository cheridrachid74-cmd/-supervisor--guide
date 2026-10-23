import React, { useState, useRef } from 'react';
import {
  FileDown,
  Printer,
  Sparkles,
  X,
  Check,
  Copy,
  BookOpen,
  Megaphone,
  Bookmark,
  Award,
  ShieldCheck,
  GraduationCap,
  Layers,
  FileText,
  Loader2,
  ExternalLink,
  Code
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  NINE_REGULATION_PILLARS,
  REGULATION_SPEECHES,
  REGULATION_VOCABULARY,
  REGULATION_MOTTOS
} from '../data/simplifiedRegulationsSummary';

interface RegulationPdfDownloadModalProps {
  buttonVariant?: 'header' | 'prominent' | 'card' | 'sidebar' | 'none';
  className?: string;
  isOpenControlled?: boolean;
  onCloseControlled?: () => void;
}

export const RegulationPdfDownloadModal: React.FC<RegulationPdfDownloadModalProps> = ({
  buttonVariant = 'header',
  className = '',
  isOpenControlled,
  onCloseControlled
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = isOpenControlled !== undefined;
  const isOpen = isControlled ? isOpenControlled : internalIsOpen;

  const handleOpen = () => {
    setInternalIsOpen(true);
  };

  const handleClose = () => {
    if (onCloseControlled) {
      onCloseControlled();
    }
    setInternalIsOpen(false);
  };
  const [activeDocType, setActiveDocType] = useState<'all' | 'speeches' | 'pillars'>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const printDocRef = useRef<HTMLDivElement>(null);

  // Generate real PDF file using html2canvas & jsPDF
  const handleDownloadDirectPdf = async () => {
    if (!printDocRef.current || isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    setDownloadSuccess(false);
    setDownloadError(null);
    setProgressMessage('جاري تحضير صفحات الوثيقة للتحويل إلى PDF...');

    try {
      const element = printDocRef.current;

      // Small delay to ensure layout rendering
      await new Promise((resolve) => setTimeout(resolve, 150));

      setProgressMessage('جاري معالجة النصوص والصور بجودة عالية...');

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for crisp printing
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1024,
      });

      setProgressMessage('جاري تقسيم الصفحات وتجميع ملف الـ PDF...');

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First Page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Multi-page handling
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const fileTitle =
        activeDocType === 'speeches'
          ? 'خطب_وتوجيهات_القانون_الداخلي_المشرف_رشيد.pdf'
          : activeDocType === 'pillars'
          ? 'ملخص_أركان_القانون_الداخلي_المشرف_رشيد.pdf'
          : 'وثيقة_ملخصات_وخطب_القانون_الداخلي_المشرف_رشيد.pdf';

      pdf.save(fileTitle);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err: any) {
      console.error('PDF generation error, fallback initiated:', err);
      setDownloadError('تعذر التحميل المباشر للـ PDF عبر المتصفح الحالي. جاري تشغيل خيار الطباعة/الحفظ البديل...');
      // Automatic fallback
      handleOpenPrintWindow();
    } finally {
      setIsGeneratingPdf(false);
      setProgressMessage('');
    }
  };

  // Open standalone clean print window (bypasses iframe sandboxing)
  const handleOpenPrintWindow = () => {
    if (!printDocRef.current) return;
    try {
      const content = printDocRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>وثيقة ملخصات وخطب وتوجيهات القانون الداخلي - المشرف ش. رشيد</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Cairo', sans-serif; background: #fff; color: #1c1917; direction: rtl; }
    .page-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
    @media print {
      body { padding: 0 !important; }
      @page { margin: 10mm; size: A4; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="p-6 max-w-4xl mx-auto">
  <div class="no-print mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-4">
    <div>
      <h2 class="text-sm font-black text-emerald-950">نافذة الطباعة الرسمية والحفظ بتنسيق PDF</h2>
      <p class="text-xs text-emerald-800">إشراف: المشرف التربوي ش. رشيد • ثانوية ابن الهيثم التقنية</p>
    </div>
    <button onclick="window.print()" class="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
      🖨️ اضغط للطباعة أو الحفظ كـ PDF
    </button>
  </div>
  ${content}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`);
        printWindow.document.close();
      } else {
        // If popup was blocked by browser, trigger standard print
        window.print();
      }
    } catch (e) {
      window.print();
    }
  };

  // Download Standalone Self-Contained HTML document
  const handleDownloadStandaloneHtml = () => {
    if (!printDocRef.current) return;
    const content = printDocRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>وثيقة ملخصات وخطب القانون الداخلي - المشرف ش. رشيد</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Cairo', sans-serif; background: #ffffff; color: #1c1917; direction: rtl; }
    .page-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
    @media print {
      body { padding: 0 !important; }
      @page { margin: 10mm; size: A4; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="p-8 max-w-4xl mx-auto">
  <div class="no-print mb-6 p-4 bg-stone-100 border border-stone-300 rounded-2xl flex items-center justify-between gap-4">
    <div>
      <h2 class="text-sm font-black text-stone-900">مستند رسمي - النظام الداخلي الموحد</h2>
      <p class="text-xs text-stone-600">إشراف وتنسيق: المشرف التربوي ش. رشيد • 2026/2027</p>
    </div>
    <button onclick="window.print()" class="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
      🖨️ طباعة المستند أو الحفظ كـ PDF
    </button>
  </div>
  ${content}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'وثيقة_ملخصات_وخطب_القانون_الداخلي_المشرف_رشيد.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyFullText = () => {
    let fullText = `الجمهورية الجزائرية الديمقراطية الشعبية\nوزارة التربية الوطنية\nثانوية ابن الهيثم التقنية – محمد بلوزداد (الجزائر وسط)\nوثيقة ملخصات وخطب وتوجيهات النظام الداخلي الموحد (2026/2027)\nإعداد وإشراف: المشرف التربوي ش. رشيد\n\n`;

    if (activeDocType === 'all' || activeDocType === 'speeches') {
      fullText += `=== أولاً: خطب وكلمات القانون الداخلي وميثاق الشرف ===\n\n`;
      REGULATION_SPEECHES.forEach((sp) => {
        fullText += `[${sp.title}]\nالمتحدث: ${sp.speaker} (${sp.speakerRole})\nالمناسبة: ${sp.context}\nالنص:\n${sp.text}\n\n`;
      });
    }

    if (activeDocType === 'all' || activeDocType === 'pillars') {
      fullText += `=== ثانياً: ملخص الأركان الـ 9 للمواد الـ 55 للنظام الداخلي ===\n\n`;
      NINE_REGULATION_PILLARS.forEach((p) => {
        fullText += `الركن ${p.number}: ${p.title} (${p.articlesRange})\n${p.headline}\nالملخص: ${p.summary}\nالواجب: ${p.studentDuty}\nالحق: ${p.studentRight}\nالشعار: ${p.goldenRule}\n\n`;
      });
    }

    if (activeDocType === 'all') {
      fullText += `=== ثالثاً: قاموس المصطلحات القانونية المدرسية ===\n\n`;
      REGULATION_VOCABULARY.forEach((v) => {
        fullText += `• ${v.term} (${v.legalArticleRef}): ${v.simpleDefinition}\n`;
      });
    }

    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      {/* ================= DISTINCTIVE CREATIVE BUTTON / ICON TRIGGER ================= */}
      {buttonVariant === 'header' && (
        <button
          onClick={handleOpen}
          className={`group relative flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-700 to-red-800 hover:from-red-500 hover:to-rose-800 text-white shadow-md shadow-red-900/20 hover:shadow-lg hover:shadow-red-800/30 transition-all duration-300 border border-red-400/40 transform hover:-translate-y-0.5 cursor-pointer ${className}`}
          title="تحميل ملخصات وخطب القانون الداخلي PDF - إشراف المشرف ش. رشيد"
        >
          {/* Creative PDF Icon Badge */}
          <div className="relative flex items-center justify-center">
            <span className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-[10px] font-black tracking-wider border border-white/30 shadow-inner">
              PDF
            </span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-red-700 animate-pulse"></span>
          </div>

          {/* Texts */}
          <div className="flex flex-col text-right leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight group-hover:text-amber-200 transition-colors">
                ملخصات وخطب القانون الداخلي
              </span>
              <FileDown className="w-3.5 h-3.5 text-amber-300 group-hover:animate-bounce" />
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-200 font-bold">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>إشراف: المشرف ش. رشيد</span>
            </div>
          </div>
        </button>
      )}

      {buttonVariant === 'prominent' && (
        <button
          onClick={handleOpen}
          className={`group relative overflow-hidden flex items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-gradient-to-l from-red-700 via-rose-800 to-stone-900 text-white shadow-xl shadow-red-950/20 border-2 border-red-500/30 hover:border-amber-400 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer ${className}`}
        >
          <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform"></div>

          <div className="flex items-center gap-3.5 z-10">
            {/* Iconic PDF Symbol with Shield */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex flex-col items-center justify-center shadow-md border border-white/20 shrink-0 group-hover:rotate-[-4deg] transition-transform">
              <span className="text-[11px] font-black text-white tracking-widest leading-none">PDF</span>
              <FileDown className="w-4 h-4 text-amber-300 mt-0.5" />
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-white group-hover:text-amber-200 transition-colors">
                  تحميل ملخصات وخطب القانون الداخلي بصيغة PDF
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-sans shadow-xs">
                  تحميل مباشر + طباعة
                </span>
              </div>
              <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                ملف متكامل يشمل الأركان الـ 9، خطب وتوجيهات المشرف، قسم التلميذ، وقاموس المصطلحات المدرسية.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end shrink-0 z-10 border-r border-white/20 pr-4">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>إشراف المشرف ش. رشيد</span>
            </span>
            <span className="text-[10px] text-stone-300">ثانوية ابن الهيثم التقنية</span>
          </div>
        </button>
      )}

      {/* ================= FULL PDF DOCUMENT PREVIEW & EXPORT MODAL ================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200 overflow-hidden relative">
            
            {/* Modal Top Bar (Screen Only) */}
            <div className="p-3.5 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 print:hidden shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 border border-white/20">
                  PDF
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>وثيقة ملخصات وخطب وتوجيهات القانون الداخلي</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                      إشراف: المشرف ش. رشيد
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-300 font-medium">
                    ثانوية ابن الهيثم التقنية • تحميل فوري بصيغة PDF أو طباعة رسمية
                  </p>
                </div>
              </div>

              {/* Action Buttons in Modal Header */}
              <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                {/* PRIMARY ACTION: DIRECT PDF DOWNLOAD */}
                <button
                  onClick={handleDownloadDirectPdf}
                  disabled={isGeneratingPdf}
                  className={`px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-red-950/40 border border-red-400/40 cursor-pointer ${
                    isGeneratingPdf ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02]'
                  }`}
                  title="تحميل مباشر لملف PDF على جهازك"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
                      <span>جاري إنشاء الـ PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 text-amber-300" />
                      <span>تحميل ملف PDF مباشر</span>
                    </>
                  )}
                </button>

                {/* SECONDARY ACTION: PRINT / STANDALONE WINDOW */}
                <button
                  onClick={handleOpenPrintWindow}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
                  title="فتح نافذة طباعة مخصصة أو الحفظ كـ PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-300" />
                  <span className="hidden sm:inline">نافذة طباعة / حفظ</span>
                </button>

                {/* STANDALONE HTML FILE DOWNLOAD */}
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-2.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors border border-stone-700 cursor-pointer"
                  title="تنزيل المستند كملف HTML مستقل قابل للفتح بدون إنترنت"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">ملف HTML</span>
                </button>

                {/* COPY TEXT */}
                <button
                  onClick={handleCopyFullText}
                  className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
                  title="نسخ محتوى الوثيقة نصياً"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 text-[11px]">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-300" />
                      <span className="text-[11px] hidden sm:inline">نسخ</span>
                    </>
                  )}
                </button>

                {/* CLOSE */}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* REAL-TIME PROGRESS & STATUS BANNERS */}
            {isGeneratingPdf && (
              <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-xs font-bold shadow-inner print:hidden animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>{progressMessage || 'جاري تجهيز وتحميل ملف الـ PDF عالي الدقة... يرجى الانتظار ثوانٍ معدودة'}</span>
              </div>
            )}

            {downloadSuccess && (
              <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-inner print:hidden">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>تم تحميل ملف الـ PDF بنجاح! تفقد مجلد التنزيلات (Downloads) في جهازك.</span>
                </div>
                <button
                  onClick={() => setDownloadSuccess(false)}
                  className="text-white hover:text-emerald-200 text-xs font-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {downloadError && (
              <div className="bg-amber-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-inner print:hidden">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>{downloadError}</span>
                </div>
                <button
                  onClick={() => setDownloadError(null)}
                  className="text-white hover:text-amber-200 text-xs font-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Scope Filter Tabs (Screen Only) */}
            <div className="px-4 sm:px-6 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-xs font-bold print:hidden shrink-0">
              <span className="text-stone-500 shrink-0">محتوى الوثيقة للتحميل:</span>
              <button
                onClick={() => setActiveDocType('all')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeDocType === 'all'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                الوثيقة الشاملة الكاملة (الملخص + الخطب + المصطلحات)
              </button>
              <button
                onClick={() => setActiveDocType('speeches')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeDocType === 'speeches'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                خطب وتوجيهات المشرف وقسم التلميذ فقط
              </button>
              <button
                onClick={() => setActiveDocType('pillars')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeDocType === 'pillars'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                ملخص الأركان الـ 9 للمواد الـ 55 فقط
              </button>
            </div>

            {/* Printable Document Sheet (Scrollable Preview on screen, Pure Document on print) */}
            <div
              ref={printDocRef}
              className="printable-document flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-stone-900 font-['Cairo',sans-serif] leading-relaxed print:p-0 print:overflow-visible"
            >
              {/* Official Algerian Republic Header */}
              <div className="border-b-2 border-stone-800 pb-5 mb-6 text-center flex flex-col items-center gap-1.5">
                <div className="text-xs sm:text-sm font-black text-stone-900">
                  الجمهورية الجزائرية الديمقراطية الشعبية
                </div>
                <div className="text-xs sm:text-sm font-bold text-stone-800">
                  وزارة التربية الوطنية • مديرية التربية لولاية الجزائر وسط
                </div>
                <div className="inline-block px-4 py-1 rounded-full bg-stone-100 text-stone-900 text-xs sm:text-sm font-black border border-stone-300 mt-1">
                  ثانوية ابن الهيثم التقنية – محمد بلوزداد
                </div>
                <div className="text-[11px] font-bold text-stone-500">
                  السنة الدراسية: 2026 / 2027
                </div>

                <div className="mt-3 pt-3 border-t border-stone-200 w-full flex flex-col items-center">
                  <h1 className="text-lg sm:text-xl font-black text-red-800">
                    وثيقة ملخصات وخطب وتوجيهات النظام الداخلي الموحد
                  </h1>
                  <span className="text-xs font-bold text-stone-700 mt-0.5">
                    مستخلص رسمي للمواد الـ 55 للقرار الوزاري رقم 778 / 65 الخاص بمؤسسات التعليم الثانوي
                  </span>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>إعداد وإشراف وتنسيق: المشرف التربوي ش. رشيد</span>
                  </div>
                </div>
              </div>

              {/* SECTION: SPEECHES */}
              {(activeDocType === 'all' || activeDocType === 'speeches') && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 border-r-4 border-red-700 pr-3 py-1 mb-4 bg-stone-50 rounded-l-xl">
                    <Megaphone className="w-5 h-5 text-red-700" />
                    <h2 className="text-base font-black text-stone-900">
                      القسم الأول: خطب وكلمات وتوجيهات النظام الداخلي
                    </h2>
                  </div>

                  {/* Rachid's Speech */}
                  <div className="p-5 rounded-2xl border-2 border-stone-300 bg-stone-50/70 mb-5 page-break-inside-avoid">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                      <div>
                        <h3 className="text-sm font-black text-stone-900">
                          {REGULATION_SPEECHES[0].title}
                        </h3>
                        <span className="text-xs text-stone-600 font-bold">
                          المتحدث: {REGULATION_SPEECHES[0].speaker} ({REGULATION_SPEECHES[0].speakerRole})
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                        كلمة المشرف ش. رشيد
                      </span>
                    </div>

                    <div className="whitespace-pre-line text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                      {REGULATION_SPEECHES[0].text}
                    </div>
                  </div>

                  {/* Student Pledge Speech */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 mb-5 page-break-inside-avoid">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-200 mb-3">
                      <div>
                        <h3 className="text-sm font-black text-emerald-950">
                          {REGULATION_SPEECHES[1].title}
                        </h3>
                        <span className="text-xs text-emerald-800 font-bold">
                          المتحدث: {REGULATION_SPEECHES[1].speaker} ({REGULATION_SPEECHES[1].speakerRole})
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ميثاق شرف التلميذ
                      </span>
                    </div>

                    <div className="whitespace-pre-line text-xs sm:text-sm text-stone-800 leading-relaxed font-bold">
                      {REGULATION_SPEECHES[1].text}
                    </div>
                  </div>

                  {/* Wall Mottos */}
                  <div className="p-4 rounded-2xl border border-stone-300 bg-stone-50 page-break-inside-avoid">
                    <span className="text-xs font-black text-stone-900 block mb-2">
                      شعارات جدارية ملهمة للقانون الداخلي (جاهزة للتعليق في الأقسام والساحة):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {REGULATION_MOTTOS.map((m) => (
                        <div key={m.id} className="p-2.5 bg-white rounded-xl border border-stone-200">
                          <p className="font-bold text-stone-900">{m.motto}</p>
                          <span className="text-[10px] text-stone-500">{m.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: 9 PILLARS SUMMARY */}
              {(activeDocType === 'all' || activeDocType === 'pillars') && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 border-r-4 border-emerald-700 pr-3 py-1 mb-4 bg-stone-50 rounded-l-xl">
                    <BookOpen className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-base font-black text-stone-900">
                      القسم الثاني: ملخص الأركان الـ 9 الذهبية للمواد الـ 55
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {NINE_REGULATION_PILLARS.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl border border-stone-300 bg-white page-break-inside-avoid shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                              {p.number}
                            </span>
                            <h3 className="text-xs sm:text-sm font-black text-stone-900">
                              {p.title}
                            </h3>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                            {p.articlesRange}
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed font-medium mb-2">
                          {p.summary}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-stone-100">
                          <div className="text-emerald-900 bg-emerald-50/70 p-2 rounded-xl">
                            <strong>واجب التلميذ:</strong> {p.studentDuty}
                          </div>
                          <div className="text-blue-900 bg-blue-50/70 p-2 rounded-xl">
                            <strong>حق التلميذ:</strong> {p.studentRight}
                          </div>
                        </div>

                        <div className="mt-2 text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded-lg font-bold">
                          💡 القاعدة الذهبية: {p.goldenRule}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: VOCABULARY */}
              {activeDocType === 'all' && (
                <div className="mb-6 page-break-inside-avoid">
                  <div className="flex items-center gap-2 border-r-4 border-amber-600 pr-3 py-1 mb-4 bg-stone-50 rounded-l-xl">
                    <Bookmark className="w-5 h-5 text-amber-600" />
                    <h2 className="text-base font-black text-stone-900">
                      القسم الثالث: معجم الكلمات والمصطلحات القانونية المدرسية الأساسية
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {REGULATION_VOCABULARY.map((v, i) => (
                      <div key={i} className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-stone-900">{v.term}</strong>
                          <span className="text-[10px] text-emerald-800 font-bold">{v.legalArticleRef}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-relaxed">{v.simpleDefinition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OFFICIAL SIGNATURE AND ENDORSEMENT BLOCK */}
              <div className="pt-6 border-t-2 border-stone-800 mt-8 grid grid-cols-2 gap-6 text-center text-xs page-break-inside-avoid">
                <div className="p-4 rounded-2xl border border-stone-300 bg-stone-50 flex flex-col items-center justify-between min-h-[120px]">
                  <div>
                    <span className="font-black text-stone-900 block">إعداد وتأطير ومتابعة:</span>
                    <span className="font-bold text-red-800 block mt-1">المشرف التربوي ش. رشيد</span>
                    <span className="text-[10px] text-stone-500 block">ثانوية ابن الهيثم التقنية</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-4 border-t border-dashed border-stone-300 w-full pt-2">
                    التوقيع والتأشيرة
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-stone-300 bg-stone-50 flex flex-col items-center justify-between min-h-[120px]">
                  <div>
                    <span className="font-black text-stone-900 block">مصادقة إدارة المؤسسة:</span>
                    <span className="font-bold text-stone-800 block mt-1">مدير ثانوية ابن الهيثم التقنية</span>
                    <span className="text-[10px] text-stone-500 block">محمد بلوزداد – الجزائر وسط</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-4 border-t border-dashed border-stone-300 w-full pt-2">
                    الختم الرسمي للمؤسسة • © جميع الحقوق محفوظة 2026/2027
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Floating/Fixed Action Bar for immediate download when scrolling */}
            <div className="p-3 sm:p-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden shrink-0">
              <div className="flex items-center gap-2 text-xs text-stone-600 font-bold flex-wrap">
                <Award className="w-4 h-4 text-amber-600" />
                <span>إشراف المشرف التربوي ش. رشيد • ثانوية ابن الهيثم التقنية</span>
                <span className="px-2 py-0.5 rounded-lg bg-stone-200 text-stone-800 text-[10px] font-black">
                  © جميع الحقوق محفوظة
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={handleDownloadDirectPdf}
                  disabled={isGeneratingPdf}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-900/30 cursor-pointer ${
                    isGeneratingPdf ? 'opacity-80 cursor-wait' : ''
                  }`}
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>جاري حفظ وتحميل ملف الـ PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 text-amber-300" />
                      <span>تحميل / حفظ PDF (جاهز للطباعة والتحميل)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenPrintWindow}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 border border-stone-300 cursor-pointer"
                  title="طباعة عبر نافذة جديدة"
                >
                  <Printer className="w-4 h-4 text-stone-600" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
