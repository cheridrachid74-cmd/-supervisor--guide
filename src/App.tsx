import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileCheck,
  GraduationCap,
  ShieldAlert,
  Download,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UnifiedRegulationsPortal } from './components/UnifiedRegulationsPortal';
import { StudentGuide } from './components/StudentGuide';
import { PledgeFormGenerator } from './components/PledgeFormGenerator';
import { RegulationPdfDownloadModal } from './components/RegulationPdfDownloadModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { SupervisorFieldGuide } from './components/SupervisorFieldGuide';

type TabType = 'portal' | 'simplified' | 'pledge' | 'supervisor';

export default function App() {
  // Navigation focused on the essentials of understanding the internal regulations
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

  const [showInstallModal, setShowInstallModal] = useState(false);

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
    window.location.hash = tab === 'portal' ? '' : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Application Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          {/* Logo & School Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div 
              onClick={() => changeTab('portal')}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0 font-bold text-lg cursor-pointer hover:scale-105 transition-transform"
              title="العودة للصفحة الرئيسية"
            >
              🇩🇿
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 
                  onClick={() => changeTab('portal')}
                  className="text-sm sm:text-base font-black text-stone-900 leading-tight cursor-pointer hover:text-emerald-700 transition-colors"
                >
                  النظام الداخلي الموحد
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ثانوية ابن الهيثم التقنية
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 hidden md:inline">
                  2026 / 2027
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                بوابة الفصول الـ 9 والمواد الـ 55 • دليل الإشراف الميداني واستمارة التعهد
              </p>
            </div>
          </div>

          {/* Action triggers: Field Guide + Install PWA + PDF Download */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* SUPERVISOR GUIDE PROMINENT HEADER BUTTON */}
            <button
              onClick={() => changeTab('supervisor')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm ${
                activeTab === 'supervisor'
                  ? 'bg-blue-900 text-white border-blue-700 ring-2 ring-blue-500/50 shadow-md'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-blue-500/20'
              }`}
              title="المساعد الذكي للإشراف التربوي - بطاقات التدخل السريع"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="font-extrabold text-white">دليل الإشراف الميداني</span>
              <span className="bg-amber-400 text-stone-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                جديد
              </span>
            </button>

            <button
              onClick={() => setShowInstallModal(true)}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/20 border border-emerald-600/40 flex items-center gap-1 cursor-pointer"
              title="تثبيت التطبيق على هاتفك بنقرة واحدة"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">تثبيت التطبيق</span>
              <span className="sm:hidden text-[11px]">تثبيت</span>
            </button>
            <RegulationPdfDownloadModal buttonVariant="header" />
          </div>
        </div>

        {/* Main Navigation Tabs: Essential Pillars of Understanding the Law */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm font-bold">
            {/* Tab 1: The 9 Chapters Portal (Default & Main) */}
            <button
              id="nav-tab-portal"
              onClick={() => changeTab('portal')}
              className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'portal'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span className="font-black">الفصول الـ 9 الرسمية (المواد 01-55)</span>
            </button>

            {/* Tab 2: Supervisor Field Guide (The Requested Feature) */}
            <button
              id="nav-tab-supervisor"
              onClick={() => changeTab('supervisor')}
              className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                activeTab === 'supervisor'
                  ? 'bg-blue-900 text-white border-blue-700 shadow-md ring-2 ring-blue-400/40'
                  : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100 font-black'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span className="font-black">🛡️ دليل الإشراف الميداني (بطاقات التدخل)</span>
              <span className="bg-amber-400 text-stone-900 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                جديد
              </span>
            </button>

            {/* Tab 3: Simplified Summary & Vocabulary */}
            <button
              id="nav-tab-simplified"
              onClick={() => changeTab('simplified')}
              className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'simplified'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>الملخص السهل والمبسط وقاموس الكلمات</span>
            </button>

            {/* Tab 4: Pledge Form */}
            <button
              id="nav-tab-pledge"
              onClick={() => changeTab('pledge')}
              className={`py-2 px-3.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'pledge'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>استمارة التعهد وترخيص الأنشطة</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area (padding-bottom for mobile bottom navigation bar) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12 flex-1 w-full">
        {/* TAB 1: PORTAL (The 9 Chapters and 55 Articles with Search and Audio) */}
        {activeTab === 'portal' && (
          <UnifiedRegulationsPortal onOpenSupervisorGuide={() => changeTab('supervisor')} />
        )}

        {/* TAB 2: SUPERVISOR FIELD GUIDE (Dedicated Section) */}
        {activeTab === 'supervisor' && (
          <SupervisorFieldGuide onBackToPortal={() => changeTab('portal')} />
        )}

        {/* TAB 3: SIMPLIFIED SUMMARY & VOCABULARY & QUIZ */}
        {activeTab === 'simplified' && <StudentGuide />}

        {/* TAB 4: PLEDGE FORM GENERATOR */}
        {activeTab === 'pledge' && <PledgeFormGenerator />}
      </main>

      {/* =========================================================================
          PERMANENT FLOATING ACTION BUTTON (ALWAYS VISIBLE TO JUMP DIRECTLY TO GUIDE)
          ========================================================================= */}
      <div className="fixed bottom-20 md:bottom-6 left-4 z-40 print:hidden">
        {activeTab !== 'supervisor' ? (
          <button
            onClick={() => changeTab('supervisor')}
            className="group flex items-center gap-2.5 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white pl-4 pr-3 py-2.5 rounded-full shadow-2xl border-2 border-amber-400/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="انقر لفتح دليل الإشراف التربوي الميداني وبطاقات التدخل السريع"
          >
            <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
              🛡️
            </div>
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black">دليل الإشراف الميداني</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
              </div>
              <span className="text-[10px] text-blue-200 font-bold">بطاقات التدخل السريع (12 معضلة)</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => changeTab('portal')}
            className="group flex items-center gap-2 bg-stone-900/90 hover:bg-stone-900 text-white px-4 py-2.5 rounded-full shadow-xl border border-stone-700 hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs font-bold"
            title="العودة لبوابة الفصول الـ 9"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>العودة للفصول الـ 9</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          FIXED MOBILE BOTTOM NAVIGATION BAR (FOR EASY ACCESS ON SMARTPHONES)
          ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-2xl py-1 px-2 flex items-center justify-around print:hidden safe-area-bottom">
        {/* 1. Portal Tab */}
        <button
          onClick={() => changeTab('portal')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'portal'
              ? 'text-emerald-700 font-black'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'portal' ? 'text-emerald-700 stroke-[2.5]' : 'text-stone-400'}`} />
          <span className="text-[10px] mt-0.5">الفصول الـ 9</span>
        </button>

        {/* 2. SUPERVISOR GUIDE (PROMINENT & HIGHLIGHTED) */}
        <button
          onClick={() => changeTab('supervisor')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'supervisor'
              ? 'text-blue-900 font-black'
              : 'text-blue-700 font-extrabold'
          }`}
        >
          <div className="relative">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'supervisor'
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-blue-100 text-blue-900'
            }`}>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <span className="absolute -top-1 -right-2 bg-amber-400 text-stone-900 text-[8px] font-black px-1 rounded-full animate-bounce">
              جديد
            </span>
          </div>
          <span className="text-[10px] mt-0.5 font-black text-blue-900">دليل الإشراف</span>
        </button>

        {/* 3. Student Guide */}
        <button
          onClick={() => changeTab('simplified')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'simplified'
              ? 'text-emerald-700 font-black'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <GraduationCap className={`w-5 h-5 ${activeTab === 'simplified' ? 'text-emerald-700 stroke-[2.5]' : 'text-stone-400'}`} />
          <span className="text-[10px] mt-0.5">دليل التلميذ</span>
        </button>

        {/* 4. Pledge Form */}
        <button
          onClick={() => changeTab('pledge')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'pledge'
              ? 'text-emerald-700 font-black'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileCheck className={`w-5 h-5 ${activeTab === 'pledge' ? 'text-emerald-700 stroke-[2.5]' : 'text-stone-400'}`} />
          <span className="text-[10px] mt-0.5">التعهد</span>
        </button>

        {/* 5. Install Button */}
        <button
          onClick={() => setShowInstallModal(true)}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-stone-600 hover:text-emerald-700 cursor-pointer"
        >
          <Download className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] mt-0.5 font-bold">تثبيت</span>
        </button>
      </nav>

      {/* Global Official Footer with Copyright Notice */}
      <footer className="bg-white border-t border-stone-200 py-5 pb-24 md:pb-5 text-xs text-stone-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
            <p className="font-bold text-stone-800">
              الجمهورية الجزائرية الديمقراطية الشعبية • وزارة التربية الوطنية • ثانوية ابن الهيثم التقنية (محمد بلوزداد)
            </p>
            <p className="text-stone-500 font-semibold">
              النظام الداخلي الموحد ودليل الإشراف التربوي الميداني • الموسم الدراسي 2026 / 2027
            </p>
          </div>
          <div className="pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="px-3 py-1 rounded-full bg-stone-900 text-amber-300 font-black text-[11px] shadow-2xs">
                © جميع الحقوق محفوظة 2026 / 2027
              </span>
              <span className="text-stone-600 font-bold text-[11px]">
                إعداد وتصميم وتنسيق: المشرف التربوي ش. رشيد
              </span>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              النسخة الرقمية الرسمية المعتمدة لمصلحة التلميذ والولي والأسرة التربوية
            </span>
          </div>
        </div>
      </footer>

      {/* Modern PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}
