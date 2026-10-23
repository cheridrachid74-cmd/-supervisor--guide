import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileCheck,
  GraduationCap,
  Scale,
  FileDown,
  Download,
  FileText,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { UnifiedRegulationsPortal } from './components/UnifiedRegulationsPortal';
import { StudentGuide } from './components/StudentGuide';
import { PledgeFormGenerator } from './components/PledgeFormGenerator';
import { RegulationPdfDownloadModal } from './components/RegulationPdfDownloadModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { SupervisorFieldGuide } from './components/SupervisorFieldGuide';
import { Decree171Modal } from './components/Decree171Modal';

type TabType = 'portal' | 'simplified' | 'pledge' | 'supervisor';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'supervisor' || window.location.hash === '#supervisor') return 'supervisor';
      if (tab === 'simplified' || window.location.hash === '#simplified') return 'simplified';
      if (tab === 'pledge' || window.location.hash === '#pledge') return 'pledge';
    }
    return 'portal';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showDecree171Modal, setShowDecree171Modal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Sync tab with URL hash for easy sharing and direct linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'supervisor') setActiveTab('supervisor');
      else if (hash === 'simplified') setActiveTab('simplified');
      else if (hash === 'pledge') setActiveTab('pledge');
      else if (hash === 'portal') setActiveTab('portal');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close mobile drawer on navigation
    window.location.hash = tab === 'portal' ? '' : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'portal':
        return 'الفصول الـ 9 والمواد الـ 55 الرسمية';
      case 'supervisor':
        return 'دليل الإشراف الميداني (20 بطاقة معالجة)';
      case 'simplified':
        return 'دليل التلميذ المبسط وقاموس المصطلحات';
      case 'pledge':
        return 'استمارة التعهد والالتزام المدرسي';
    }
  };

  return (
    <div dir="rtl" className="h-screen w-screen flex overflow-hidden bg-stone-100 text-stone-900 font-['Cairo',sans-serif]">
      {/* =========================================================================
          DESKTOP & MOBILE SIDEBAR NAVIGATION
          ========================================================================= */}
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-stone-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 flex flex-col bg-white border-l border-stone-200/90 shadow-lg lg:shadow-none transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20' : 'w-72 sm:w-80 lg:w-72'}`}
      >
        {/* Sidebar Header / Institution Branding */}
        <div className="p-4 border-b border-stone-200/80 flex items-center justify-between shrink-0 bg-stone-50/60">
          <div
            onClick={() => changeTab('portal')}
            className={`flex items-center gap-3 cursor-pointer group ${isSidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}
            title="ثانوية ابن الهيثم التقنية - محمد بلوزداد"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-lg font-bold shadow-xs shrink-0 group-hover:bg-emerald-800 transition-colors">
              🇩🇿
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden leading-tight">
                <h1 className="text-sm font-black text-stone-900 group-hover:text-emerald-700 transition-colors truncate">
                  ثانوية ابن الهيثم التقنية
                </h1>
                <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                  النظام الداخلي الموحد • 2026/2027
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle / Mobile Close Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
            >
              {isSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
          {/* Main Portals Group */}
          <div>
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase px-3 block mb-2">
                بوابات النظام والدلائل
              </span>
            )}
            <nav className="space-y-1">
              {/* 1. Portal Tab */}
              <button
                onClick={() => changeTab('portal')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'portal'
                    ? 'bg-emerald-700 text-white shadow-xs font-black'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
                title="الفصول الـ 9 والمواد الـ 55 للنظام الداخلي الموحد"
              >
                <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'portal' ? 'text-white' : 'text-emerald-700'}`} />
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-right">
                    <span>الفصول الـ 9 الرسمية</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'portal' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                      55 مادة
                    </span>
                  </div>
                )}
              </button>

              {/* 2. Supervisor Field Guide Tab */}
              <button
                onClick={() => changeTab('supervisor')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'supervisor'
                    ? 'bg-blue-900 text-white shadow-xs font-black ring-1 ring-blue-700'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
                title="دليل الإشراف الميداني - 20 بطاقة للتدخل السريع والمعالجة"
              >
                <img
                  src="/supervisor-icon.svg"
                  alt="أيقونة دليل الإشراف"
                  className="w-4 h-4 shrink-0 object-contain rounded-xs"
                />
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-right">
                    <span>دليل الإشراف الميداني</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${activeTab === 'supervisor' ? 'bg-amber-400 text-stone-950' : 'bg-blue-100 text-blue-900'}`}>
                      20 بطاقة
                    </span>
                  </div>
                )}
              </button>

              {/* 3. Decree 171 Sanctions Modal */}
              <button
                onClick={() => {
                  setShowDecree171Modal(true);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-stone-700 hover:bg-stone-100 hover:text-stone-950 ${
                  isSidebarCollapsed ? 'lg:justify-center' : ''
                }`}
                title="سلّم تصنيف أخطاء التلاميذ والعقوبات (القرار 171)"
              >
                <Scale className="w-4 h-4 shrink-0 text-amber-600" />
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-right">
                    <span>سلّم العقوبات (القرار 171)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600">
                      4 درجات
                    </span>
                  </div>
                )}
              </button>

              {/* 4. Student Guide Tab */}
              <button
                onClick={() => changeTab('simplified')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'simplified'
                    ? 'bg-emerald-700 text-white shadow-xs font-black'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
                title="دليل التلميذ المبسط وقاموس المصطلحات والاختبار"
              >
                <GraduationCap className={`w-4 h-4 shrink-0 ${activeTab === 'simplified' ? 'text-white' : 'text-emerald-700'}`} />
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-right">
                    <span>دليل التلميذ المبسط</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'simplified' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                      قاموس وشرح
                    </span>
                  </div>
                )}
              </button>

              {/* 5. Pledge Form Tab */}
              <button
                onClick={() => changeTab('pledge')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pledge'
                    ? 'bg-emerald-700 text-white shadow-xs font-black'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
                } ${isSidebarCollapsed ? 'lg:justify-center' : ''}`}
                title="استمارة التعهد والالتزام وترخيص الأنشطة"
              >
                <FileCheck className={`w-4 h-4 shrink-0 ${activeTab === 'pledge' ? 'text-white' : 'text-amber-600'}`} />
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-right">
                    <span>استمارة التعهد والالتزام</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'pledge' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                      طباعة
                    </span>
                  </div>
                )}
              </button>
            </nav>
          </div>

          {/* Quick Tools & Downloads Group */}
          <div>
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase px-3 block mb-2">
                الأدوات والتحميل الرسمي
              </span>
            )}
            <nav className="space-y-1">
              {/* PDF Document Modal Trigger */}
              <button
                onClick={() => {
                  setShowPdfModal(true);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition-colors cursor-pointer ${
                  isSidebarCollapsed ? 'lg:justify-center' : ''
                }`}
                title="تحميل وثيقة ملخصات وخطب القانون الداخلي بصيغة PDF أو طباعتها"
              >
                <FileDown className="w-4 h-4 text-red-600 shrink-0" />
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-right">
                    <span>تحميل النظام بصيغة PDF</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-50 text-red-700 border border-red-200">
                      طباعة
                    </span>
                  </div>
                )}
              </button>

              {/* Standalone HTML Guide Link */}
              <a
                href="/supervisor.html"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition-colors ${
                  isSidebarCollapsed ? 'lg:justify-center' : ''
                }`}
                title="فتح النسخة المستقلة الخفيفة بـ 20 بطاقة (صفحة HTML خفيفة لا تتطلب إنترنت)"
              >
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-right">
                    <span>النسخة المستقلة HTML</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                )}
              </a>

              {/* PWA Install Trigger */}
              <button
                onClick={() => {
                  setShowInstallModal(true);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition-colors cursor-pointer ${
                  isSidebarCollapsed ? 'lg:justify-center' : ''
                }`}
                title="تثبيت التطبيق على جهاز الكمبيوتر أو الهاتف الذكي"
              >
                <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-right">
                    <span>تثبيت التطبيق على الجهاز</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      PWA
                    </span>
                  </div>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer with Required Copyright Notice */}
        <div className="p-3.5 border-t border-stone-200/80 bg-stone-50 text-right shrink-0">
          {!isSidebarCollapsed ? (
            <div className="space-y-1 text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5 text-stone-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>جميع الحقوق محفوظة © 2026/2027</span>
              </div>
              <p className="text-stone-600 font-medium leading-tight">
                ثانوية ابن الهيثم التقنية • محمد بلوزداد
              </p>
              <p className="text-stone-400 text-[10px]">
                إعداد وتنسيق: المشرف التربوي ش. رشيد
              </p>
            </div>
          ) : (
            <div className="text-center font-bold text-[10px] text-stone-400" title="جميع الحقوق محفوظة © 2026/2027">
              © 2027
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================================
          MAIN WORKSPACE CANVAS & TOP APPLICATION BAR
          ========================================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sleek Institutional Top Bar */}
        <header className="h-14 sm:h-16 bg-white border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30 shadow-2xs">
          {/* Right Area: Hamburger Button (mobile) & Active Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="فتح القائمة الرئيسية"
              aria-label="القائمة الرئيسية"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-700">
              <span className="hidden sm:inline text-stone-500">البوابة الرسمية</span>
              <span className="hidden sm:inline text-stone-300">/</span>
              <span className="text-stone-900 font-black truncate max-w-[220px] sm:max-w-md">
                {getTabLabel(activeTab)}
              </span>
            </div>
          </div>

          {/* Left Area: Year Badge & Quick Action Triggers */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Context Switcher: Jump between 9 Chapters and 20 Cards easily */}
            {activeTab !== 'supervisor' ? (
              <button
                onClick={() => changeTab('supervisor')}
                className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="الانتقال إلى دليل الإشراف الميداني (20 بطاقة)"
              >
                <img src="/supervisor-icon.svg" alt="أيقونة دليل الإشراف" className="w-3.5 h-3.5 object-contain" />
                <span className="hidden md:inline font-extrabold">دليل الإشراف (20 بطاقة)</span>
                <span className="md:hidden text-[11px] font-extrabold">دليل الإشراف</span>
              </button>
            ) : (
              <button
                onClick={() => changeTab('portal')}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="العودة إلى الفصول الـ 9 الرسمية"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] sm:text-xs">الفصول الـ 9</span>
              </button>
            )}

            {/* Quick PDF Trigger in Header */}
            <button
              onClick={() => setShowPdfModal(true)}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors items-center gap-1.5 cursor-pointer border border-stone-200/80"
              title="تحميل وطباعة النظام بصيغة PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-red-600" />
              <span>تحميل PDF</span>
            </button>

            {/* School Season Badge */}
            <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              2026/2027
            </span>
          </div>
        </header>

        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 scrollbar-thin">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* TAB 1: PORTAL (The 9 Chapters and 55 Articles with Search and Audio) */}
            {activeTab === 'portal' && (
              <UnifiedRegulationsPortal onOpenSupervisorGuide={() => changeTab('supervisor')} />
            )}

            {/* TAB 2: SUPERVISOR FIELD GUIDE (Dedicated Section with 20 Cards) */}
            {activeTab === 'supervisor' && (
              <SupervisorFieldGuide onBackToPortal={() => changeTab('portal')} />
            )}

            {/* TAB 3: SIMPLIFIED SUMMARY & VOCABULARY & QUIZ */}
            {activeTab === 'simplified' && <StudentGuide />}

            {/* TAB 4: PLEDGE FORM GENERATOR */}
            {activeTab === 'pledge' && <PledgeFormGenerator />}

            {/* Official Institutional Document Footer */}
            <footer className="pt-8 pb-4 border-t border-stone-200 text-xs text-stone-500 space-y-3 print:hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
                <p className="font-bold text-stone-800">
                  الجمهورية الجزائرية الديمقراطية الشعبية • وزارة التربية الوطنية • ثانوية ابن الهيثم التقنية (محمد بلوزداد)
                </p>
                <p className="text-stone-500 font-semibold">
                  النظام الداخلي الموحد ودليل الإشراف التربوي الميداني • 2026 / 2027
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right border-t border-stone-200/60 pt-3">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <span className="px-2.5 py-0.5 rounded-md bg-stone-900 text-white font-bold text-[11px]">
                    جميع الحقوق محفوظة © 2026/2027
                  </span>
                  <span className="text-stone-600 font-bold text-[11px]">
                    إعداد وتصميم وتنسيق: المشرف التربوي ش. رشيد
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  المرجع المعتمد: القرار الوزاري رقم 778/65 والمرسوم التنفيذي 26-77 والقرار 171
                </span>
              </div>
            </footer>
          </div>
        </main>

        {/* =========================================================================
            MOBILE BOTTOM NAVIGATION BAR (Instant Access to The 9 Chapters & Tools)
            ========================================================================= */}
        <nav
          aria-label="التنقل السفلي للهاتف"
          className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200/90 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg"
        >
          {/* 1. Main Home: The 9 Chapters */}
          <button
            onClick={() => changeTab('portal')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'portal'
                ? 'text-emerald-800 bg-emerald-50 font-black'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <BookOpen className={`w-4 h-4 mb-0.5 ${activeTab === 'portal' ? 'text-emerald-700' : 'text-stone-500'}`} />
            <span>الفصول الـ 9</span>
          </button>

          {/* 2. Supervisor Field Guide */}
          <button
            onClick={() => changeTab('supervisor')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'supervisor'
                ? 'text-blue-900 bg-blue-50 font-black'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <img src="/supervisor-icon.svg" alt="" className="w-4 h-4 mb-0.5 object-contain" />
            <span>دليل الإشراف (20)</span>
          </button>

          {/* 3. Decree 171 Modal */}
          <button
            onClick={() => setShowDecree171Modal(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-stone-600 hover:text-stone-950 transition-all cursor-pointer"
          >
            <Scale className="w-4 h-4 mb-0.5 text-amber-600" />
            <span>القرار 171</span>
          </button>

          {/* 4. Student Simplified Guide */}
          <button
            onClick={() => changeTab('simplified')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'simplified'
                ? 'text-emerald-800 bg-emerald-50 font-black'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            <GraduationCap className={`w-4 h-4 mb-0.5 ${activeTab === 'simplified' ? 'text-emerald-700' : 'text-stone-500'}`} />
            <span>دليل التلميذ</span>
          </button>

          {/* 5. Full Menu / Drawer Trigger */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-stone-600 hover:text-stone-950 transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4 mb-0.5 text-stone-600" />
            <span>القائمة</span>
          </button>
        </nav>
      </div>

      {/* =========================================================================
          GLOBAL MODALS (CONTROLLED FROM SIDEBAR & TOP ACTIONS)
          ========================================================================= */}
      
      {/* 1. Decree 171 Infractions Scale Reference Modal */}
      <Decree171Modal
        isOpen={showDecree171Modal}
        onClose={() => setShowDecree171Modal(false)}
      />

      {/* 2. Official PDF Document Export Modal */}
      <RegulationPdfDownloadModal
        buttonVariant="none"
        isOpenControlled={showPdfModal}
        onCloseControlled={() => setShowPdfModal(false)}
      />

      {/* 3. PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}
