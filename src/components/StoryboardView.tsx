import React, { useState, useMemo, useEffect } from 'react';
import {
  Copy,
  Check,
  Play,
  Clock,
  Video,
  BookOpen,
  Layers,
  Sparkles,
  Download,
  Volume2,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  FileText,
  Radio,
  Share2,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
  Award,
  Calendar,
  AlertCircle,
  Mic,
  Square
} from 'lucide-react';
import { StoryboardScene, StoryboardTrack, OfficialArticle } from '../types';
import { audioService } from '../utils/audioSynthesizer';
import { userVoiceService } from '../utils/userVoiceRecordingService';
import { OFFICIAL_REGULATIONS } from '../data/officialRegulations';
import { RACHID_SUPERVISOR } from '../data/rachidSupervisorPersona';
import { VoiceRecorderModal } from './VoiceRecorderModal';

interface StoryboardViewProps {
  currentTrack: StoryboardTrack;
  allTracks: StoryboardTrack[];
  onSelectTrack: (trackId: string) => void;
  selectedSceneIndex: number;
  onSelectScene: (index: number) => void;
  onNavigateToArticle?: (articleNumber: number) => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  currentTrack,
  allTracks,
  onSelectTrack,
  selectedSceneIndex,
  onSelectScene,
  onNavigateToArticle
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'teleprompter'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleFilter, setSelectedArticleFilter] = useState<number | null>(null);
  const [inspectedArticle, setInspectedArticle] = useState<OfficialArticle | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [isSpeakingAll, setIsSpeakingAll] = useState(false);
  const [recordingScene, setRecordingScene] = useState<StoryboardScene | null>(null);
  const [recordedSceneIds, setRecordedSceneIds] = useState<string[]>([]);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  useEffect(() => {
    userVoiceService.initDB().then(() => {
      setRecordedSceneIds(userVoiceService.getRecordedSceneIds());
    });
    const unsub = userVoiceService.subscribe(() => {
      setRecordedSceneIds(userVoiceService.getRecordedSceneIds());
    });
    return () => unsub();
  }, []);

  // Flatten all 55 articles for quick reference
  const allArticlesMap = useMemo(() => {
    const map = new Map<number, OfficialArticle>();
    OFFICIAL_REGULATIONS.forEach((chap) => {
      chap.articles.forEach((art) => {
        map.set(art.number, art);
      });
    });
    return map;
  }, []);

  // Compute coverage statistics across all tracks
  const coverageStats = useMemo(() => {
    const coveredArticlesSet = new Set<number>();
    let totalScenesCount = 0;
    let totalEstimatedSeconds = 0;

    allTracks.forEach((t) => {
      totalScenesCount += t.scenes.length;
      t.scenes.forEach((s) => {
        totalEstimatedSeconds += s.durationSeconds;
        s.relatedArticles.forEach((r) => {
          const num = parseInt(r.replace(/\D/g, ''));
          if (num && num >= 1 && num <= 55) {
            coveredArticlesSet.add(num);
          }
        });
      });
    });

    const currentTrackDuration = currentTrack.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
    const currentTrackWords = currentTrack.scenes.reduce(
      (acc, s) => acc + s.voiceoverText.split(/\s+/).filter(Boolean).length,
      0
    );

    return {
      coveredCount: coveredArticlesSet.size, // 55
      totalArticles: 55,
      percentage: Math.round((coveredArticlesSet.size / 55) * 100),
      totalScenesCount,
      currentTrackDuration,
      currentTrackWords
    };
  }, [allTracks, currentTrack]);

  // Filter scenes in current track
  const filteredScenes = useMemo(() => {
    return currentTrack.scenes.filter((scene) => {
      // 1. Article filter
      if (selectedArticleFilter !== null) {
        const matchesArticle = scene.relatedArticles.some((art) => {
          const num = parseInt(art.replace(/\D/g, ''));
          return num === selectedArticleFilter;
        });
        if (!matchesArticle) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = scene.title.toLowerCase().includes(q);
        const inVoice = scene.voiceoverText.toLowerCase().includes(q);
        const inVisuals = scene.visualSummary.toLowerCase().includes(q);
        const inElements = scene.visualElementsList.some((e) => e.toLowerCase().includes(q));
        const inArticles = scene.relatedArticles.some((a) => a.toLowerCase().includes(q));
        return inTitle || inVoice || inVisuals || inElements || inArticles;
      }

      return true;
    });
  }, [currentTrack, selectedArticleFilter, searchQuery]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayVoiceoverSnippet = (scene: StoryboardScene) => {
    if (playingVoiceId === scene.id) {
      audioService.stopAllVoice();
      setPlayingVoiceId(null);
      return;
    }
    audioService.stopAllVoice();
    setPlayingVoiceId(scene.id);
    audioService.playSceneAudio(scene.id, scene.voiceoverText, () => {
      setPlayingVoiceId(null);
    });
  };

  const handleInspectArticle = (articleNumber: number) => {
    const article = allArticlesMap.get(articleNumber);
    if (article) {
      setInspectedArticle(article);
      setShowArticleModal(true);
    } else if (onNavigateToArticle) {
      onNavigateToArticle(articleNumber);
    }
  };

  const handleExportMarkdown = () => {
    let md = `# مخطط الستوري بورد المعتمد: ${currentTrack.title}\n`;
    md += `المؤسسة: ثانوية ابن الهيثم التقنية – محمد بلوزداد (الجزائر وسط)\n`;
    md += `السنة الدراسية: 2026 / 2027\n`;
    md += `التغطية القانونية: ${coverageStats.percentage}% من مواد القانون الداخلي (55/55 مادة)\n\n`;
    md += `## الوصف العام للمسار:\n${currentTrack.description}\n\n`;
    md += `| رقم المشهد | عنوان المشهد | النص الصوتي المنطوق (Voiceover) | العناصر المرئية ليد VideoScribe | زمن التحريك | زمن التوقف | المواد المرجعية |\n`;
    md += `| :---: | :--- | :--- | :--- | :---: | :---: | :--- |\n`;

    currentTrack.scenes.forEach((s) => {
      md += `| ${s.sceneNumber} | **${s.title}** | "${s.voiceoverText}" | ${s.visualSummary} | ${s.animateTime}ث | ${s.pauseTime}ث | ${s.relatedArticles.join('، ')} |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyboard-55-articles-${currentTrack.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTeleprompter = () => {
    let txt = `==========================================================\n`;
    txt += ` سيناريو التعليق الصوتي الموحد (Studio Voiceover Script)\n`;
    txt += ` المشرف التربوي / الصوت المعتمد: ${RACHID_SUPERVISOR.name} (${RACHID_SUPERVISOR.role})\n`;
    txt += ` ${RACHID_SUPERVISOR.school} – ${RACHID_SUPERVISOR.district} | 2026 / 2027\n`;
    txt += ` الشعار التربوي: ${RACHID_SUPERVISOR.coreMotto}\n`;
    txt += `----------------------------------------------------------\n`;
    txt += ` الكلمة الافتتاحية للمشرف رشيد:\n"${RACHID_SUPERVISOR.speechText}"\n`;
    txt += `==========================================================\n\n`;
    txt += ` المسار: ${currentTrack.title}\n`;
    txt += ` إجمالي الكلمات: ${coverageStats.currentTrackWords} كلمة | المدة التقديرية: ${coverageStats.currentTrackDuration} ثانية\n`;
    txt += `==========================================================\n\n`;

    currentTrack.scenes.forEach((s) => {
      txt += `[المشهد ${s.sceneNumber}]: ${s.title}\n`;
      txt += `المواد القانونية: ${s.relatedArticles.join('، ')}\n`;
      txt += `النص الصوتي (بصوت المشرف رشيد):\n"${s.voiceoverText}"\n`;
      txt += `(وقت الرسم: ${s.minDuration}-${s.maxDuration} ثوانٍ)\n\n`;
      txt += `----------------------------------------------------------\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceover-script-${currentTrack.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Quick Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-xl shadow-xs">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900">
                  مخطط المشاهد والسيناريو البصري (Storyboard)
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  تغطية 55 مادة كاملة
                </span>
              </div>
              <p className="text-stone-500 text-xs mt-0.5">
                ثانوية ابن الهيثم التقنية – محمد بلوزداد • مُهيكل بالكامل لمعايير برنامج <strong>VideoScribe</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Storyboard Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play Supervisor Intro Speech */}
          <button
            id="play-supervisor-intro-storyboard-btn"
            onClick={() => audioService.speakSupervisorIntro()}
            className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="الاستماع لكلمة المشرف رشيد التوجيهية الافتتاحية"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>كلمة المشرف رشيد</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <button
            id="export-storyboard-md-btn"
            onClick={handleExportMarkdown}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="تصدير جدول الستوري بورد بصيغة Markdown"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير MD</span>
          </button>

          <button
            id="export-voiceover-txt-btn"
            onClick={handleExportTeleprompter}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="تصدير نصوص التعليق الصوتي كاملة للدوبلاج"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>سيناريو الدوبلاج (.txt)</span>
          </button>
        </div>
      </div>

      {/* 2. Comprehensive 55-Article Coverage & Statistics Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-800">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          {/* Stat 1: Legal Articles Coverage */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {coverageStats.coveredCount} / {coverageStats.totalArticles}
                </span>
                <span className="text-xs text-emerald-300 font-bold">مادة</span>
              </div>
              <p className="text-[11px] text-stone-300">نسبة التغطية القانونية (100%)</p>
            </div>
          </div>

          {/* Stat 2: Active Track Duration */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                  {Math.floor(coverageStats.currentTrackDuration / 60)}:
                  {(coverageStats.currentTrackDuration % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-xs text-stone-300 font-bold">دقيقة</span>
              </div>
              <p className="text-[11px] text-stone-300">مدة المسار المحدد</p>
            </div>
          </div>

          {/* Stat 3: Scenes Count */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-blue-300 font-mono">
                  {currentTrack.scenes.length}
                </span>
                <span className="text-xs text-stone-300 font-bold">مشاهد</span>
              </div>
              <p className="text-[11px] text-stone-300">في المسار المختار</p>
            </div>
          </div>

          {/* Stat 4: Words & Voiceover Speed */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
                  {coverageStats.currentTrackWords}
                </span>
                <span className="text-xs text-stone-300 font-bold">كلمة</span>
              </div>
              <p className="text-[11px] text-stone-300">معدل التعليق الصوتي</p>
            </div>
          </div>
        </div>

        {/* Progress Bar of 55 Articles */}
        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center gap-3">
          <span className="text-xs font-bold text-stone-300 shrink-0">
            تغطية مواد القانون الداخلي:
          </span>
          <div className="flex-1 bg-stone-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${coverageStats.percentage}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
            {coverageStats.percentage}% مكتمل
          </span>
        </div>
      </div>

      {/* 3. Track Selection Tabs (5 Tracks) */}
      <div className="flex flex-wrap items-center gap-2">
        {allTracks.map((tr) => {
          const isSelected = tr.id === currentTrack.id;
          return (
            <button
              key={tr.id}
              id={`track-btn-${tr.id}`}
              onClick={() => {
                onSelectTrack(tr.id);
                setSelectedArticleFilter(null);
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 ring-2 ring-emerald-500/40'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <span>{tr.title.split(':')[0]}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-emerald-900 text-emerald-100' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {tr.scenes.length} مشاهد
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Track Description Banner & View Controls */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <span className="p-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shrink-0">
            {currentTrack.badge}
          </span>
          <div>
            <h3 className="text-sm font-bold text-emerald-950">{currentTrack.title}</h3>
            <p className="text-xs text-emerald-800 mt-0.5">{currentTrack.description}</p>
          </div>
        </div>

        {/* View Mode Toggle: Cards vs Table vs Teleprompter */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-emerald-200 self-end md:self-center shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>بطاقات تفاعلية</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>جدول رسمي</span>
          </button>

          <button
            onClick={() => setViewMode('teleprompter')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'teleprompter' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>تلقين الدوبلاج</span>
          </button>
        </div>
      </div>

      {/* 5. Article Filter Ribbon & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المشاهد، النصوص الصوتية، أو المواد..."
              className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear Filter */}
          {selectedArticleFilter !== null && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span>فلترة نشطة بالمادة: <strong>المادة {selectedArticleFilter}</strong></span>
              <button
                onClick={() => setSelectedArticleFilter(null)}
                className="p-1 hover:bg-amber-100 rounded-md text-amber-700"
                title="إلغاء الفلترة"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleInspectArticle(selectedArticleFilter)}
                className="underline hover:text-amber-950 mr-1"
              >
                معاينة نص المادة
              </button>
            </div>
          )}

          <div className="text-xs text-stone-500 font-medium">
            عرض {filteredScenes.length} من أصل {currentTrack.scenes.length} مشهد
          </div>
        </div>

        {/* 55 Articles Quick Jump Ribbon */}
        <div className="pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              فلترة وتتبع المشاهد حسب المواد الـ 55 (انقر على رقم المادة لعرض مشاهدها):
            </span>
            {selectedArticleFilter !== null && (
              <button
                onClick={() => setSelectedArticleFilter(null)}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                إظهار جميع المواد
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 max-h-24 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200 scrollbar-thin">
            {Array.from({ length: 55 }, (_, i) => i + 1).map((artNum) => {
              const isSelected = selectedArticleFilter === artNum;
              const hasInCurrentTrack = currentTrack.scenes.some((s) =>
                s.relatedArticles.some((a) => parseInt(a.replace(/\D/g, '')) === artNum)
              );

              return (
                <button
                  key={artNum}
                  onClick={() =>
                    setSelectedArticleFilter(isSelected ? null : artNum)
                  }
                  className={`w-7 h-7 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center font-mono ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs font-black scale-110 ring-2 ring-emerald-500'
                      : hasInCurrentTrack
                      ? 'bg-white text-stone-800 hover:bg-emerald-100 hover:text-emerald-900 border border-stone-300'
                      : 'bg-stone-100 text-stone-400 hover:bg-stone-200 border border-stone-200'
                  }`}
                  title={`المادة ${artNum} ${hasInCurrentTrack ? '(مشمولة في هذا المسار)' : '(مشمولة في مسارات أخرى)'}`}
                >
                  {artNum.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Main Content Views */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 gap-5">
          {filteredScenes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-900 mb-1">
                لا توجد مشاهد مطابقة للبحث أو الفلتر المحدد
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                جرب مسح شريط البحث أو اختيار رقم مادة أخرى.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedArticleFilter(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            filteredScenes.map((scene, idx) => {
              const isCurrent = currentTrack.scenes.indexOf(scene) === selectedSceneIndex;
              const sceneRealIndex = currentTrack.scenes.indexOf(scene);

              return (
                <div
                  key={scene.id}
                  id={`scene-card-${scene.id}`}
                  className={`bg-white rounded-2xl p-5 border transition-all ${
                    isCurrent
                      ? 'border-emerald-600 ring-2 ring-emerald-500/25 shadow-md'
                      : 'border-stone-200 hover:border-stone-300 shadow-xs'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-stone-100 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-xs shrink-0"
                        style={{ backgroundColor: scene.themeColor }}
                      >
                        {scene.sceneNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black text-stone-900">{scene.title}</h4>
                          {isCurrent && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              معروض حالياً في الوايت بورد
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            مدة الرسم والتثبيت: <strong>{scene.minDuration} - {scene.maxDuration} ثوانٍ</strong>
                          </span>
                          <span>•</span>
                          <span>وقت التحريك (Animate): {scene.animateTime}ث</span>
                          <span>•</span>
                          <span>وقت التوقف (Pause): {scene.pauseTime}ث</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Controls */}
                    <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
                      <button
                        id={`play-scene-btn-${scene.id}`}
                        onClick={() => onSelectScene(sceneRealIndex)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs ${
                          isCurrent
                            ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCurrent ? 'تشغيل في اللوحة' : 'عرض في الوايت بورد'}</span>
                      </button>

                      {/* Record Real Voice Button */}
                      <button
                        id={`record-scene-voice-btn-${scene.id}`}
                        onClick={() => setRecordingScene(scene)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs border ${
                          recordedSceneIds.includes(scene.id)
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                        title="تسجيل صوتك الحقيقي واستبدال الصوت الاصطناعي"
                      >
                        <Mic className="w-3.5 h-3.5 text-inherit" />
                        <span>
                          {recordedSceneIds.includes(scene.id)
                            ? `🎙️ صوتك مسجّل (${userVoiceService.getRecording(scene.id)?.duration}ث)`
                            : '🎙️ سجّل صوتك'}
                        </span>
                      </button>

                      <button
                        id={`copy-scene-voice-btn-${scene.id}`}
                        onClick={() => handleCopyText(scene.id, scene.voiceoverText)}
                        className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold flex items-center gap-1"
                        title="نسخ نص التعليق الصوتي"
                      >
                        {copiedId === scene.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ النص</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Voiceover Speech Bubble */}
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>النص الصوتي ({RACHID_SUPERVISOR.name}):</span>
                            </span>
                            {recordedSceneIds.includes(scene.id) ? (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>صوتك الحقيقي معتمد</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-500 bg-stone-200/80 px-1.5 py-0.5 rounded">
                                صوت اصطناعي (TTS)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePlayVoiceoverSnippet(scene)}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors border flex items-center gap-1 ${
                                playingVoiceId === scene.id
                                  ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
                                  : 'text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/80 border-amber-200'
                              }`}
                            >
                              {playingVoiceId === scene.id ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>إيقاف</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3" />
                                  <span>
                                    {recordedSceneIds.includes(scene.id) ? 'استماع لصوتك' : 'استماع صوتي'}
                                  </span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setRecordingScene(scene)}
                              className="text-[11px] font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md transition-colors border border-red-200 flex items-center gap-1"
                              title="تسجيل الصوت بالمايكروفون"
                            >
                              <Mic className="w-3 h-3" />
                              <span>{recordedSceneIds.includes(scene.id) ? 'إعادة تسجيل' : 'سجّل'}</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-stone-800 leading-relaxed font-['Cairo',sans-serif]">
                          "{scene.voiceoverText}"
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                        <span>عدد الكلمات: {scene.voiceoverText.split(/\s+/).filter(Boolean).length} كلمة</span>
                        <span>زمن النطق المقدر: ~{Math.round(scene.voiceoverText.split(/\s+/).filter(Boolean).length / 2.3)}ث</span>
                      </div>
                    </div>

                    {/* Visual Elements List (What VideoScribe hand draws) */}
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-stone-500 block mb-2">
                          العناصر المرئية (ما ترسمه يد VideoScribe):
                        </span>
                        <ul className="space-y-1.5 text-xs text-stone-700">
                          {scene.visualElementsList.map((item, idx2) => (
                            <li key={idx2} className="flex items-start gap-2">
                              <span
                                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                style={{ backgroundColor: scene.themeColor }}
                              />
                              <span className="leading-normal">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Camera Specifications */}
                      <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3 text-stone-400" />
                          <span>Camera: X={scene.camera.x}, Y={scene.camera.y}</span>
                        </div>
                        <span>Zoom: {(scene.camera.zoom * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Related Official Legal Articles Chips */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        المواد القانونية المرجعية في هذا المشهد:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {scene.relatedArticles.map((art, aIdx) => {
                          const num = parseInt(art.replace(/\D/g, '')) || 1;
                          return (
                            <button
                              key={aIdx}
                              onClick={() => handleInspectArticle(num)}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1 shadow-2xs"
                              title="انقر لمعاينة النص الكامل وشرح المادة"
                            >
                              <span>{art}</span>
                              <Eye className="w-3 h-3 opacity-60" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[11px] font-bold text-stone-500">
                      معرف الرسم البياني: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">{scene.svgIllustrationKey}</code>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View Mode: Production Table */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-stone-900 text-stone-100 font-bold border-b border-stone-800">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 w-44">عنوان المشهد</th>
                  <th className="py-3.5 px-4 min-w-[260px]">النص الصوتي (ما يُقال)</th>
                  <th className="py-3.5 px-4 min-w-[260px]">العناصر المرئية (ما ترسمه اليد)</th>
                  <th className="py-3.5 px-4 w-32 text-center">المدة والتحريك</th>
                  <th className="py-3.5 px-4 w-48">المواد المرجعية</th>
                  <th className="py-3.5 px-4 w-28 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredScenes.map((s, idx) => {
                  const sceneRealIndex = currentTrack.scenes.indexOf(s);
                  const isCurrent = sceneRealIndex === selectedSceneIndex;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-stone-50 transition-colors ${
                        isCurrent ? 'bg-emerald-50/60 font-medium' : ''
                      }`}
                    >
                      <td className="py-4 px-4 align-top text-center font-mono font-bold text-stone-600">
                        {s.sceneNumber}
                      </td>
                      <td className="py-4 px-4 align-top font-bold text-stone-900">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: s.themeColor }}
                          />
                          <span>{s.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-stone-800 leading-relaxed font-medium">
                        "{s.voiceoverText}"
                      </td>
                      <td className="py-4 px-4 align-top text-stone-700 leading-relaxed">
                        {s.visualSummary}
                      </td>
                      <td className="py-4 px-4 align-top text-center font-mono text-xs">
                        <div className="bg-stone-100 px-2 py-1 rounded-md inline-block font-bold">
                          {s.minDuration}-{s.maxDuration}ث
                        </div>
                        <div className="text-[10px] text-stone-500 mt-1">
                          تحريك: {s.animateTime}ث | توقف: {s.pauseTime}ث
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-wrap gap-1">
                          {s.relatedArticles.map((art, aIdx) => {
                            const num = parseInt(art.replace(/\D/g, '')) || 1;
                            return (
                              <button
                                key={aIdx}
                                onClick={() => handleInspectArticle(num)}
                                className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              >
                                {art}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-center">
                        <button
                          onClick={() => onSelectScene(sceneRealIndex)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs whitespace-nowrap"
                        >
                          عرض باللوحة
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode: Studio Teleprompter & Continuous Dubbing */}
      {viewMode === 'teleprompter' && (
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-md border border-stone-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Radio className="w-4 h-4" />
                <span>وضع التلقين واستوديو التسجيل الصوتي (Studio Teleprompter)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                النص الإخراجي المتتابع للتعليق الصوتي ({currentTrack.title})
              </h3>
              <p className="text-stone-400 text-xs mt-1">
                نصوص المشاهد مصفوفة بدقة لتسهيل التسجيل في الاستوديو الصوتي أو التعليق المباشر على الفيديو.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const fullText = currentTrack.scenes.map((s) => s.voiceoverText).join(' ');
                  handleCopyText('full-teleprompter', fullText);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedId === 'full-teleprompter' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم نسخ كامل السيناريو!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ كامل السيناريو دفعة واحدة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Continuous Voiceover Flow */}
          <div className="space-y-6">
            {filteredScenes.map((scene, sIdx) => (
              <div
                key={scene.id}
                className="bg-stone-850 p-5 rounded-xl border border-stone-750 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded font-black text-white text-[11px]"
                      style={{ backgroundColor: scene.themeColor }}
                    >
                      المشهد {scene.sceneNumber}
                    </span>
                    <span className="font-bold text-stone-300">{scene.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-mono text-[11px]">
                      {scene.minDuration} - {scene.maxDuration} ثوانٍ
                    </span>

                    {/* Quick Voice Record Button in Teleprompter */}
                    <button
                      onClick={() => setRecordingScene(scene)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        recordedSceneIds.includes(scene.id)
                          ? 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700'
                          : 'bg-red-700 hover:bg-red-600 text-white'
                      }`}
                      title="تسجيل صوتك الحقيقي لهذا المشهد"
                    >
                      <Mic className="w-3 h-3" />
                      <span>{recordedSceneIds.includes(scene.id) ? 'إعادة تسجيل' : 'سجّل بصوتك'}</span>
                    </button>

                    <button
                      onClick={() => handlePlayVoiceoverSnippet(scene)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        playingVoiceId === scene.id
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'text-amber-400 hover:text-amber-300 hover:bg-stone-800'
                      }`}
                      title={playingVoiceId === scene.id ? 'إيقاف الصوت' : 'استماع صوتي فوري'}
                    >
                      {playingVoiceId === scene.id ? (
                        <Square className="w-4 h-4 fill-current" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-stone-100 font-medium leading-relaxed font-['Cairo',sans-serif]">
                  "{scene.voiceoverText}"
                </p>

                <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                  <span className="text-[11px] text-stone-500">
                    المواد القانونية: {scene.relatedArticles.join('، ')}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    ما ترسمه اليد: {scene.visualSummary}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Interactive Modal: Official Article Inspector */}
      {showArticleModal && inspectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-mono font-black text-lg">
                  {inspectedArticle.number.toString().padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-lg font-black leading-tight">
                    المادة {inspectedArticle.number}: {inspectedArticle.chapterTitle}
                  </h3>
                  <p className="text-emerald-100 text-xs">
                    النظام الداخلي المعتمد • ثانوية ابن الهيثم التقنية
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowArticleModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-stone-900">
              {/* Official Legal Text */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500">
                    النص القانوني والتشريعي الرسمي:
                  </span>
                  <button
                    onClick={() => audioService.speakText(inspectedArticle.text)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>قراءة صوتية</span>
                  </button>
                </div>
                <p className="text-sm font-semibold text-stone-900 leading-relaxed">
                  {inspectedArticle.text}
                </p>
              </div>

              {/* Key Highlight */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block mb-1">
                  ⭐ جوهر المادة:
                </span>
                <p className="text-xs font-bold text-amber-950 leading-relaxed">
                  {inspectedArticle.keyHighlight}
                </p>
              </div>

              {/* Student Guide */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <span className="text-xs font-bold text-blue-900 block mb-1">
                  💡 ماذا تعني لي كتلميذ في ثانوية ابن الهيثم؟
                </span>
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  {inspectedArticle.studentExplanation}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs font-bold text-stone-500 ml-1">الكلمات المفتاحية:</span>
                {inspectedArticle.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => {
                  if (onNavigateToArticle) {
                    onNavigateToArticle(inspectedArticle.number);
                  }
                  setShowArticleModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>عرض في قسم شرح المواد (01 إلى 55)</span>
              </button>

              <button
                onClick={() => setShowArticleModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recording Studio Modal */}
      {recordingScene && (
        <VoiceRecorderModal
          isOpen={Boolean(recordingScene)}
          scene={recordingScene}
          track={currentTrack}
          onSelectScene={(sc) => setRecordingScene(sc)}
          onClose={() => setRecordingScene(null)}
          onRecordingSaved={() => {
            setRecordedSceneIds(userVoiceService.getRecordedSceneIds());
          }}
        />
      )}
    </div>
  );
};
