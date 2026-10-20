import React, { useState, useRef } from 'react';
import { Printer, FileCheck, PenTool, RotateCcw, Download, CheckCircle2, ShieldCheck, Loader2, FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PledgeFormData } from '../types';

export const PledgeFormGenerator: React.FC = () => {
  const [formData, setFormData] = useState<PledgeFormData>({
    academicYear: '2026 / 2027',
    directorate: 'الجزائر وسط',
    schoolName: 'ثانوية ابن الهيثم التقنية – محمد بلوزداد',
    studentName: '',
    studentClass: '',
    guardianName: '',
    idNumber: '',
    idIssuer: '',
    idDate: '',
    acceptInternalRules: true,
    allowActivities: 'yes'
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const formSheetRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a'; // Ink blue
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleDownloadPdf = async () => {
    if (!formSheetRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfSuccess(false);

    try {
      const element = formSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
      pdf.save(`استمارة_التعهد_${formData.studentName ? formData.studentName.replace(/\\s+/g, '_') : 'الرسمية'}.pdf`);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating pledge PDF:', err);
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    if (!formSheetRef.current) {
      window.print();
      return;
    }
    try {
      const content = formSheetRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>استمارة التعهد وترخيص الأنشطة</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Cairo', sans-serif; background: #fff; color: #1c1917; direction: rtl; }
    @media print {
      body { padding: 0 !important; }
      @page { margin: 8mm; size: A4; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="p-6 max-w-3xl mx-auto">
  <div class="no-print mb-4 flex justify-between items-center p-3 bg-stone-100 rounded-xl">
    <span>استمارة التعهد الرسمية 2026/2027</span>
    <button onclick="window.print()" class="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-lg">🖨️ طباعة الآن</button>
  </div>
  ${content}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileCheck className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-stone-900">استمارة التعهد وترخيص الأنشطة الرسمية</h2>
          </div>
          <p className="text-stone-600 text-xs sm:text-sm">
            الاستمارة المعتمدة المطابقة لأسفل المنشور الوزاري 2026/2027 الموجهة لتوقيع ولي الأمر وتسليمها للمؤسسة.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>جاري حفظ الـ PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-amber-300" />
                <span>تحميل كـ PDF</span>
              </>
            )}
          </button>

          <button
            id="print-pledge-btn"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الاستمارة الرسمية</span>
          </button>
        </div>
      </div>

      {pdfSuccess && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم تنزيل استمارة التعهد بصيغة PDF بنجاح على جهازك!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form Settings */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col gap-4">
          <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
            بيانات التلميذ والولي
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">المؤسسة التعليمية (المدرسة / المتوسطة / الثانوية):</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="مثال: ثانوية أحمد توفيق المدني"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-stone-700 mb-1">اسم ولقب التلميذ(ة):</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="محمد بن عبد الله"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">قسم التلميذ(ة):</label>
                <input
                  type="text"
                  value={formData.studentClass}
                  onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                  placeholder="3 متوسط 2"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">اسم ولقب ولي الأمر:</label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="عبد الله بن سالم"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block font-bold text-stone-700 mb-1">رقم بطاقة التعريف / رخصة السياقة:</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  placeholder="1098765432"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">الصادرة عن:</label>
                <input
                  type="text"
                  value={formData.idIssuer}
                  onChange={(e) => setFormData({ ...formData, idIssuer: e.target.value })}
                  placeholder="دائرة الحراش"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900"
                />
              </div>
            </div>

            {/* Activities permission */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block font-bold text-stone-800 mb-2">
                ترخيص المشاركة في الأنشطة الثقافية والرياضية والترفيهية (داخل وخارج المؤسسة):
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <input
                    type="radio"
                    name="allowActivities"
                    checked={formData.allowActivities === 'yes'}
                    onChange={() => setFormData({ ...formData, allowActivities: 'yes' })}
                    className="accent-emerald-600"
                  />
                  <span>نعم (أسمح بالمشاركة)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                  <input
                    type="radio"
                    name="allowActivities"
                    checked={formData.allowActivities === 'no'}
                    onChange={() => setFormData({ ...formData, allowActivities: 'no' })}
                    className="accent-stone-600"
                  />
                  <span>لا</span>
                </label>
              </div>
            </div>

            {/* Digital Signature Pad */}
            <div className="pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-stone-800 flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5 text-blue-600" />
                  التوقيع الرقمي للولي (ارسم بيدك أو الفأرة):
                </span>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  مسح التوقيع
                </button>
              </div>
              <div className="border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={110}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[110px] touch-none cursor-crosshair bg-white"
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">
                تظهر هذه الإمضاءة مباشرة داخل الخانة الرسمية في الورقة.
              </span>
            </div>
          </div>
        </div>

        {/* Printable Official Sheet Preview */}
        <div
          ref={formSheetRef}
          className="lg:col-span-7 bg-white p-6 rounded-2xl border-2 border-stone-800 shadow-lg text-stone-900 font-serif print:m-0 print:border-none print:shadow-none printable-document"
        >
          {/* Official Document Header */}
          <div className="text-center border-b-2 border-stone-900 pb-3 mb-4">
            <h4 className="font-bold text-xs tracking-wide">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
            <h3 className="font-bold text-sm tracking-wide mt-0.5">وزارة التربية الوطنية</h3>
            <div className="flex justify-between items-center text-xs mt-2 px-2 text-stone-700">
              <span>مديرية التربية لولاية {formData.directorate || '................'}</span>
              <span>السنة الدراسية {formData.academicYear}</span>
            </div>
            <div className="mt-1 font-bold text-xs text-stone-800">
              المؤسسة: {formData.schoolName || '...........................................'}
            </div>
          </div>

          <div className="text-center my-3">
            <h2 className="text-lg font-black inline-block border-2 border-stone-900 px-6 py-1 rounded-md bg-stone-50">
              وثيقة التعهد والالتزام بالنظام الداخلي
            </h2>
          </div>

          {/* Form Content matching OCR exactly */}
          <div className="border-2 border-stone-900 p-4 rounded-xl space-y-4 text-xs leading-relaxed">
            <div className="bg-stone-100 p-2.5 rounded-lg border border-stone-300 font-bold text-stone-900 text-center">
              تعهد
            </div>

            <p className="font-bold text-stone-900 text-sm leading-relaxed">
              أتعهد بصفتي ولي أمر التلميذ(ة) باحترام النظام الداخلي للمؤسسة والتعاون لضمان تمدرسه/ها وانضباطه/ها.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200">
              <div>
                <span className="font-bold">اسم ولقب التلميذ(ة): </span>
                <span className="font-mono font-bold text-blue-900">{formData.studentName || '...................................'}</span>
              </div>
              <div>
                <span className="font-bold">قسم التلميذ(ة): </span>
                <span className="font-mono font-bold text-blue-900">{formData.studentClass || '................'}</span>
              </div>
            </div>

            <div>
              <span className="font-bold">اسم ولقب ولي أمره: </span>
              <span className="font-mono font-bold text-blue-900">{formData.guardianName || '...................................................'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <span className="font-bold">رقم بطاقة التعريف الوطنية / رخصة السياقة: </span>
                <span className="font-mono font-bold text-blue-900">{formData.idNumber || '.........................'}</span>
              </div>
              <div>
                <span className="font-bold">عن: </span>
                <span className="font-mono font-bold text-blue-900">{formData.idIssuer || '................'}</span>
              </div>
            </div>

            {/* Activities Authorization Box */}
            <div className="border border-stone-400 p-3 rounded-lg bg-stone-50/50 mt-3">
              <div className="font-bold text-stone-900 mb-2">
                ترخيص المشاركة في الأنشطة الثقافية والرياضية والترفيهية (داخل وخارج المؤسسة)
              </div>
              <div className="flex items-center justify-between">
                <span>أسمح لابني / ابنتي بالمشاركة في الأنشطة المقررة:</span>
                <div className="flex items-center gap-6 font-bold">
                  <span className="flex items-center gap-1.5">
                    نعم
                    <span className={`w-4 h-4 border border-stone-900 inline-flex items-center justify-center text-xs ${formData.allowActivities === 'yes' ? 'bg-emerald-700 text-white font-bold' : ''}`}>
                      {formData.allowActivities === 'yes' ? '✓' : ''}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    لا
                    <span className={`w-4 h-4 border border-stone-900 inline-flex items-center justify-center text-xs ${formData.allowActivities === 'no' ? 'bg-red-700 text-white font-bold' : ''}`}>
                      {formData.allowActivities === 'no' ? '✓' : ''}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Signature Box */}
            <div className="grid grid-cols-2 gap-4 pt-3 items-end">
              <div>
                <span className="text-[11px] text-stone-500 block mb-1">
                  حرر بتاريخ: {new Date().toLocaleDateString('ar-DZ')}
                </span>
                <span className="text-[11px] text-stone-500">
                  توقيع وختم إدارة المؤسسة
                </span>
                <div className="h-16 border border-dashed border-stone-300 rounded mt-1"></div>
              </div>

              <div className="border-2 border-stone-900 rounded-lg p-2 text-center bg-white">
                <span className="font-bold text-xs text-stone-900 block mb-1">
                  خانة مخصصة لإمضاء الولي
                </span>
                <div className="h-16 flex items-center justify-center overflow-hidden">
                  {hasSignature && canvasRef.current ? (
                    <img
                      src={canvasRef.current.toDataURL()}
                      alt="توقيع الولي"
                      className="max-h-14 object-contain"
                    />
                  ) : (
                    <span className="text-stone-300 text-xs italic">مكان التوقيع</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
