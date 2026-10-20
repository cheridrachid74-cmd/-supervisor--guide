import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Maximize, Minimize, Video, Sparkles, Hand, Moon, Sun, BookOpen, Monitor, Radio } from 'lucide-react';
import { StoryboardScene, StoryboardTrack } from '../types';
import { renderSceneSvg } from '../data/sceneIllustrations';
import { audioService, VoiceMode } from '../utils/audioSynthesizer';
import { userVoiceService, UserVoiceRecording } from '../utils/userVoiceRecordingService';
import { RACHID_SUPERVISOR } from '../data/rachidSupervisorPersona';
import { DrawingHand, HandStyle } from './DrawingHand';
import { VoiceRecorderModal } from './VoiceRecorderModal';

export type CanvasThemeMode = 'whiteboard' | 'dark' | 'educational';

interface WhiteboardCanvasProps {
  currentScene: StoryboardScene;
  allScenes: StoryboardScene[];
  sceneIndex: number;
  onSelectSceneIndex: (index: number) => void;
  trackTitle: string;
  currentTrack?: StoryboardTrack;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  currentScene,
  allScenes,
  sceneIndex,
  onSelectSceneIndex,
  trackTitle,
  currentTrack
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1 for current scene
  const [speed, setSpeed] = useState<number>(1.0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState<boolean>(true);
  const [markerColor, setMarkerColor] = useState<'black' | 'blue' | 'red'>('black');
  const [handStyle, setHandStyle] = useState<HandStyle>('classic');
  const [showHand, setShowHand] = useState<boolean>(true);
  const [cameraZoomEnabled, setCameraZoomEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<CanvasThemeMode>('whiteboard');
  const [isPlayingIntro, setIsPlayingIntro] = useState<boolean>(false);
  const [isSpeakingSnippet, setIsSpeakingSnippet] = useState<boolean>(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState<boolean>(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('user');
  const [userRecording, setUserRecording] = useState<UserVoiceRecording | undefined>(undefined);
  const [recordedScenesCount, setRecordedScenesCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);

  // Calculate hand position based on scene and progress
  const getHandPosition = (p: number, sceneKey: string) => {
    // Generate organic hand tracking coordinates
    if (sceneKey === 'school_intro') {
      if (p < 0.4) {
        const sub = p / 0.4;
        return { x: 200 + sub * 400, y: 180 + Math.sin(sub * 12) * 40 + (sub > 0.5 ? 120 : 0) };
      } else if (p < 0.7) {
        const sub = (p - 0.4) / 0.3;
        return { x: 400 + sub * 80, y: 90 - sub * 65 + Math.sin(sub * 8) * 15 };
      } else {
        const sub = (p - 0.7) / 0.3;
        return { x: 180 + sub * 440, y: 445 + Math.sin(sub * 16) * 15 };
      }
    } else if (sceneKey === 'discipline_timing') {
      if (p < 0.4) {
        const sub = p / 0.4;
        const angle = sub * Math.PI * 2;
        return { x: 180 + Math.cos(angle) * 95, y: 190 + Math.sin(angle) * 95 };
      } else if (p < 0.75) {
        const sub = (p - 0.4) / 0.35;
        return { x: 420 + Math.sin(sub * 10) * 35, y: 150 + sub * 180 };
      } else {
        const sub = (p - 0.75) / 0.25;
        return { x: 660 + Math.sin(sub * 6) * 30, y: 190 + sub * 50 };
      }
    } else if (sceneKey === 'safety_focus') {
      if (p < 0.45) {
        const sub = p / 0.45;
        return { x: 220 + Math.sin(sub * 8) * 45, y: 140 + sub * 160 };
      } else if (p < 0.8) {
        const sub = (p - 0.45) / 0.35;
        return { x: 440 + sub * 220, y: 200 + Math.sin(sub * 10) * 40 };
      } else {
        return { x: 390 + Math.sin(p * 15) * 20, y: 100 + Math.cos(p * 15) * 20 };
      }
    } else if (sceneKey === 'environment_clean') {
      if (p < 0.4) {
        const sub = p / 0.4;
        return { x: 120 + sub * 160, y: 240 + Math.sin(sub * 6) * 30 };
      } else if (p < 0.75) {
        const sub = (p - 0.4) / 0.35;
        return { x: 420 + Math.cos(sub * 8) * 40, y: 180 + Math.sin(sub * 8) * 40 };
      } else {
        const sub = (p - 0.75) / 0.25;
        return { x: 620 + Math.sin(sub * 8) * 30, y: 220 + sub * 60 };
      }
    } else {
      // Partnership
      if (p < 0.45) {
        const sub = p / 0.45;
        return { x: 300 + sub * 200, y: 180 + Math.sin(sub * 8) * 25 };
      } else {
        const sub = (p - 0.45) / 0.55;
        return { x: 210 + sub * 380, y: 310 + Math.sin(sub * 12) * 30 };
      }
    }
  };

  const handPos = getHandPosition(progress, currentScene.svgIllustrationKey);

  // Sync user recorded voice for current scene (or fallback to Supervisor Rachid Master Voice)
  useEffect(() => {
    userVoiceService.initDB().then(() => {
      setUserRecording(
        userVoiceService.getRecording(currentScene.id) || userVoiceService.getMasterRecording()
      );
      setRecordedScenesCount(userVoiceService.getRecordedSceneIds().length);
    });

    const unsubscribe = userVoiceService.subscribe(() => {
      setUserRecording(
        userVoiceService.getRecording(currentScene.id) || userVoiceService.getMasterRecording()
      );
      setRecordedScenesCount(userVoiceService.getRecordedSceneIds().length);
    });

    return () => unsubscribe();
  }, [currentScene.id]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      lastTimeRef.current = null;
      audioService.stopMarkerSound();
      audioService.stopAllVoice();
      return;
    }

    if (soundEnabled && progressRef.current < 0.95) {
      audioService.startMarkerSound();
    }

    // Start voiceover (User's real recorded voice or TTS fallback) if at start
    if (voiceoverEnabled && progressRef.current < 0.05) {
      audioService.playSceneAudio(currentScene.id, currentScene.voiceoverText, undefined, speed);
    }

    const step = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Adjust duration dynamically to user's recorded audio length if available
      const hasUserRec = voiceMode === 'user' && !!userRecording;
      const baseDuration = hasUserRec ? userRecording.duration : currentScene.durationSeconds;
      const duration = Math.max(2, baseDuration) / speed;
      const deltaProgress = deltaTime / duration;
      const nextProgress = progressRef.current + deltaProgress;

      if (nextProgress >= 1.0) {
        // Check if there is a next scene
        if (sceneIndex < allScenes.length - 1) {
          audioService.playChime();
          progressRef.current = 0;
          setProgress(0);
          onSelectSceneIndex(sceneIndex + 1);
          return;
        } else {
          // End of track
          progressRef.current = 1.0;
          setProgress(1.0);
          setIsPlaying(false);
          audioService.stopMarkerSound();
          return;
        }
      }

      progressRef.current = nextProgress;
      setProgress(nextProgress);
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioService.stopMarkerSound();
    };
  }, [isPlaying, currentScene, sceneIndex, speed, soundEnabled, voiceoverEnabled, allScenes.length, onSelectSceneIndex, voiceMode, userRecording]);

  // When scene changes externally, reset progress
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
    audioService.stopAllVoice();
    if (isPlaying && voiceoverEnabled) {
      audioService.playSceneAudio(currentScene.id, currentScene.voiceoverText, undefined, speed);
    }
  }, [currentScene.id]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioService.stopMarkerSound();
      audioService.stopAllVoice();
    } else {
      if (progressRef.current >= 0.99) {
        progressRef.current = 0;
        setProgress(0);
      }
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    progressRef.current = 0;
    setProgress(0);
    audioService.stopAllVoice();
    if (voiceoverEnabled && isPlaying) {
      audioService.playSceneAudio(currentScene.id, currentScene.voiceoverText, undefined, speed);
    }
  };

  const handleNextScene = () => {
    if (sceneIndex < allScenes.length - 1) {
      progressRef.current = 0;
      setProgress(0);
      onSelectSceneIndex(sceneIndex + 1);
    }
  };

  const handlePrevScene = () => {
    if (sceneIndex > 0) {
      progressRef.current = 0;
      setProgress(0);
      onSelectSceneIndex(sceneIndex - 1);
    }
  };

  const handleToggleSupervisorSpeech = () => {
    if (isPlayingIntro) {
      audioService.stopAllVoice();
      setIsPlayingIntro(false);
      return;
    }
    audioService.stopAllVoice();
    setIsSpeakingSnippet(false);
    setIsPlayingIntro(true);
    audioService.speakSupervisorIntro(() => {
      setIsPlayingIntro(false);
    });
  };

  const handleTestSceneVoice = () => {
    if (isSpeakingSnippet) {
      audioService.stopAllVoice();
      setIsSpeakingSnippet(false);
      return;
    }
    audioService.stopAllVoice();
    setIsPlayingIntro(false);
    setIsSpeakingSnippet(true);
    audioService.playSceneAudio(currentScene.id, currentScene.voiceoverText, () => {
      setIsSpeakingSnippet(false);
    }, speed);
  };

  const handleSwitchVoiceMode = (mode: VoiceMode) => {
    setVoiceMode(mode);
    audioService.setVoiceMode(mode);
    audioService.stopAllVoice();
    setIsSpeakingSnippet(false);
    if (isPlaying && voiceoverEnabled) {
      audioService.playSceneAudio(currentScene.id, currentScene.voiceoverText, undefined, speed);
    }
  };

  // Listen to fullscreen changes (ESC or browser controls)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut 'F' or 'f' for fullscreen toggle if not typing in input
      if ((e.key === 'f' || e.key === 'F') && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        toggleFullscreen();
      }
      // Space for play/pause
      if (e.key === ' ' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handlePlayPause();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, progress]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.setSoundEnabled(next);
  };

  const toggleVoiceover = () => {
    const next = !voiceoverEnabled;
    setVoiceoverEnabled(next);
    if (!next) {
      audioService.stopSpeech();
    } else if (isPlaying) {
      audioService.speakText(currentScene.voiceoverText, undefined, speed);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          // Fallback to overlay fullscreen state if iframe blocks requestFullscreen
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // VideoScribe Camera transform
  const cameraTransform = cameraZoomEnabled
    ? `translate(${currentScene.camera.x * (1 - progress * 0.4)}px, ${currentScene.camera.y * (1 - progress * 0.4)}px) scale(${1 + (currentScene.camera.zoom - 1) * progress})`
    : 'translate(0px, 0px) scale(1)';

  // Calculate current elapsed time in scene
  const elapsedSec = (progress * currentScene.durationSeconds).toFixed(1);

  // Theme styling helpers
  const getThemeCanvasStyles = () => {
    switch (themeMode) {
      case 'dark':
        return {
          canvasBg: 'bg-[#0f172a]',
          canvasFilter: 'brightness(0.96) contrast(1.05)',
          svgFilter: 'invert(0.92) hue-rotate(180deg)',
          trayBorder: 'from-slate-700 to-slate-900 border-slate-700',
          badgeBg: 'bg-slate-900/90 text-slate-200 border-slate-700',
          traySlot: 'bg-slate-600',
        };
      case 'educational':
        // Classic chalkboard / green board
        return {
          canvasBg: 'bg-[#143d2c]', // Algerian chalkboard green
          canvasFilter: 'contrast(1.08)',
          svgFilter: 'invert(0.95) sepia(0.2) hue-rotate(95deg) brightness(1.15)',
          trayBorder: 'from-amber-900 to-amber-950 border-amber-800',
          badgeBg: 'bg-emerald-950/90 text-emerald-200 border-emerald-700',
          traySlot: 'bg-amber-700',
        };
      case 'whiteboard':
      default:
        return {
          canvasBg: 'bg-[#fbfcfd]',
          canvasFilter: 'none',
          svgFilter: 'none',
          trayBorder: 'from-stone-300 to-stone-400 border-stone-400/80',
          badgeBg: 'bg-white/90 text-stone-700 border-stone-200',
          traySlot: 'bg-stone-500',
        };
    }
  };

  const themeStyles = getThemeCanvasStyles();

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen flex justify-between bg-stone-950' : ''
      }`}
    >
      {/* Top Studio Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-900 text-stone-100 border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-emerald-500' : 'bg-stone-500'}`}></span>
            </span>
            <span className="font-bold text-xs sm:text-sm tracking-wide text-white">مشغل الوايت بورد التفاعلي</span>
          </div>
          <span className="text-stone-500 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-amber-300 font-medium px-2 py-0.5 bg-stone-800 rounded-full hidden md:inline">
            {trackTitle}
          </span>
          <span className="text-xs text-stone-300 font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
            المشهد {sceneIndex + 1} من {allScenes.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Mode Toggle (Whiteboard / Dark / Educational Chalkboard) */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-stone-800 p-0.5 rounded-lg border border-stone-700">
            <button
              id="theme-whiteboard-btn"
              onClick={() => setThemeMode('whiteboard')}
              title="اللوحة البيضاء (Whiteboard)"
              className={`p-1.5 sm:px-2 sm:py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors ${
                themeMode === 'whiteboard'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">لوحة بيضاء</span>
            </button>
            <button
              id="theme-educational-btn"
              onClick={() => setThemeMode('educational')}
              title="السبورة التعليمية الخضراء (School Chalkboard)"
              className={`p-1.5 sm:px-2 sm:py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors ${
                themeMode === 'educational'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">سبورة خضراء</span>
            </button>
            <button
              id="theme-dark-btn"
              onClick={() => setThemeMode('dark')}
              title="الوضع الليلي الحديث (Dark Slate)"
              className={`p-1.5 sm:px-2 sm:py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors ${
                themeMode === 'dark'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">ليلي</span>
            </button>
          </div>

          {/* Hand Style Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-stone-800 px-2 py-1 rounded-lg border border-stone-700">
            <Hand className="w-3.5 h-3.5 text-amber-400 ml-1 hidden sm:inline" />
            <span className="text-xs text-stone-400 ml-1">اليد:</span>
            <button
              id="hand-style-classic-btn"
              onClick={() => { setHandStyle('classic'); setShowHand(true); }}
              title="يد رسمية كلاسيكية (VideoScribe Classic)"
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                showHand && handStyle === 'classic'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              كلاسيكي
            </button>
            <button
              id="hand-style-school-btn"
              onClick={() => { setHandStyle('school'); setShowHand(true); }}
              title="يد بمئزر مدرسي أزرق"
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                showHand && handStyle === 'school'
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              مدرسي
            </button>
            <button
              id="hand-style-natural-btn"
              onClick={() => { setHandStyle('natural'); setShowHand(true); }}
              title="يد طبيعية مع ساعة يد"
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                showHand && handStyle === 'natural'
                  ? 'bg-emerald-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              مع ساعة
            </button>
            <button
              id="hand-toggle-btn"
              onClick={() => setShowHand(!showHand)}
              title={showHand ? 'إخفاء يد الرسم' : 'إظهار يد الرسم'}
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                !showHand ? 'bg-red-900/60 text-red-300 border border-red-700' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {showHand ? 'إخفاء' : 'إظهار'}
            </button>
          </div>

          {/* Pen Color selector */}
          <div className="flex items-center gap-1 bg-stone-800 px-2 py-1 rounded-lg border border-stone-700">
            <span className="text-xs text-stone-400 ml-1 hidden sm:inline">لون القلم:</span>
            <button
              id="marker-black-btn"
              onClick={() => setMarkerColor('black')}
              title={themeMode === 'educational' ? 'طباشير أبيض/أسود' : 'قلم أسود كلاسيكي'}
              className={`w-4 h-4 rounded-full bg-stone-900 border ${markerColor === 'black' ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
            />
            <button
              id="marker-blue-btn"
              onClick={() => setMarkerColor('blue')}
              title="قلم أزرق مدرسي"
              className={`w-4 h-4 rounded-full bg-blue-600 border ${markerColor === 'blue' ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
            />
            <button
              id="marker-red-btn"
              onClick={() => setMarkerColor('red')}
              title="قلم أحمر للتنبيهات"
              className={`w-4 h-4 rounded-full bg-red-600 border ${markerColor === 'red' ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
            />
          </div>

          {/* Voice Studio Recording Shortcut */}
          <button
            id="wb-open-voice-studio-btn"
            onClick={() => setIsVoiceRecorderOpen(true)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white flex items-center gap-1.5 hover:from-red-500 hover:to-amber-500 shadow-xs transition-all active:scale-95"
            title="استوديو تسجيل صوتك الحقيقي واستبدال الصوت الآلي"
          >
            <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="hidden sm:inline">سجّل صوتك</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full font-mono">
              {recordedScenesCount}/{allScenes.length}
            </span>
          </button>

          {/* Camera Animation Toggle */}
          <button
            id="camera-pan-toggle-btn"
            onClick={() => setCameraZoomEnabled(!cameraZoomEnabled)}
            className={`px-2 py-1 text-xs rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              cameraZoomEnabled
                ? 'bg-blue-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="محاكاة حركة الكاميرا والزووم (Set Camera)"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">الكاميرا</span>
          </button>

          {/* Fullscreen Button */}
          <button
            id="fullscreen-toggle-btn"
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${
              isFullscreen
                ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title={isFullscreen ? 'الخروج من ملء الشاشة (Esc)' : 'ملء الشاشة (F)'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
          </button>
        </div>
      </div>

      {/* Main Whiteboard Canvas Display Area */}
      <div
        className={`relative w-full overflow-hidden select-none cursor-default transition-colors duration-500 ${
          themeStyles.canvasBg
        } ${isFullscreen ? 'flex-1 h-full' : 'aspect-[16/9]'}`}
        style={{ filter: themeStyles.canvasFilter }}
      >
        {/* Subtle Whiteboard Surface Shadow & Texture with optional theme filter */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out origin-center"
          style={{
            transform: cameraTransform,
            filter: themeStyles.svgFilter
          }}
        >
          {renderSceneSvg(currentScene.svgIllustrationKey, progress)}
        </div>

        {/* Professional Animated Hand holding Marker Pen */}
        {showHand && progress < 0.98 && (
          <div
            className="absolute pointer-events-none transition-transform duration-75 ease-out z-20"
            style={{
              left: `${(handPos.x / 800) * 100}%`,
              top: `${(handPos.y / 500) * 100}%`,
              transform: 'translate(-14px, -14px)',
            }}
          >
            <DrawingHand
              markerColor={markerColor}
              handStyle={handStyle}
              isWriting={isPlaying && progress < 0.95}
            />
          </div>
        )}

        {/* VideoScribe Watermark / Mode Badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-2 backdrop-blur-sm border px-3 py-1.5 rounded-full shadow-sm ${themeStyles.badgeBg}`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold">
            {themeMode === 'educational'
              ? 'السبورة المدرسية (Educational Chalkboard)'
              : themeMode === 'dark'
              ? 'الوضع الليلي (Dark Canvas)'
              : 'VideoScribe Whiteboard Engine'}
          </span>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
            {elapsedSec}s / {userRecording && voiceMode === 'user' ? userRecording.duration : currentScene.durationSeconds}s
          </span>
          {isFullscreen && (
            <span className="text-[10px] text-amber-500 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
              ملء الشاشة
            </span>
          )}
        </div>

        {/* Legal Article Badge on Top-Right */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 max-w-[50%] justify-end">
          {currentScene.relatedArticles.map((art, idx) => (
            <span
              key={idx}
              className="text-xs font-bold bg-stone-900/85 text-amber-300 px-2.5 py-1 rounded-lg backdrop-blur-sm shadow border border-stone-700"
            >
              {art}
            </span>
          ))}
        </div>

        {/* Whiteboard Bottom Aluminum Marker Tray styling */}
        <div className={`absolute bottom-0 inset-x-0 h-2 bg-gradient-to-b ${themeStyles.trayBorder} shadow-inner flex items-center justify-center`}>
          <div className={`w-48 h-1 ${themeStyles.traySlot} rounded-full opacity-60`}></div>
        </div>
      </div>

      {/* Synchronized Voiceover Caption Bar with Real Voice Recording Support */}
      <div className="bg-amber-50/90 border-t border-b border-amber-200 px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 ${userRecording && voiceMode === 'user' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-amber-200 text-amber-900'}`}>
            <Mic className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>الصوت والراوي:</span>
                <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-black text-[11px] shadow-2xs">
                  {RACHID_SUPERVISOR.name} ({RACHID_SUPERVISOR.role} - {RACHID_SUPERVISOR.school})
                </span>
              </span>

              {/* Real Voice Status Badge */}
              {userRecording ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>🎙️ صوتك الحقيقي معتمد ({userRecording.duration}ث)</span>
                </span>
              ) : (
                <span className="text-[11px] text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>🤖 صوت اصطناعي (لم تسجّل بعد)</span>
                </span>
              )}

              {/* Voice Source Switcher (User voice vs TTS) */}
              {userRecording && (
                <div className="flex items-center bg-stone-200/90 p-0.5 rounded-lg border border-stone-300 text-[10px] font-bold">
                  <button
                    onClick={() => handleSwitchVoiceMode('user')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      voiceMode === 'user'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    صوت المشرف رشيد المسجّل
                  </button>
                  <button
                    onClick={() => handleSwitchVoiceMode('tts')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      voiceMode === 'tts'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    صوت آلي (TTS)
                  </button>
                </div>
              )}
            </div>

            <p className="text-stone-900 text-sm md:text-base font-bold leading-relaxed font-['Cairo',sans-serif]">
              "{currentScene.voiceoverText}"
            </p>
          </div>
        </div>

        {/* Audio Action Buttons: Record Voice, Test Audio, Supervisor Intro */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
          {/* Main User Voice Recording Studio Trigger */}
          <button
            id="wb-record-scene-btn"
            onClick={() => setIsVoiceRecorderOpen(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs border ${
              userRecording
                ? 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-transparent hover:from-red-500 hover:to-amber-500 shadow-md animate-pulse'
            }`}
            title="تسجيل صوتك الحقيقي لهذا المشهد بالمايكروفون"
          >
            <Mic className="w-4 h-4 text-inherit" />
            <span>{userRecording ? 'إعادة تسجيل صوتك' : '🎙️ سجّل صوتك الآن'}</span>
          </button>

          {/* Test Scene Voice */}
          <button
            id="wb-test-voice-btn"
            onClick={handleTestSceneVoice}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs border ${
              isSpeakingSnippet
                ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
                : 'bg-white text-stone-800 border-amber-300 hover:bg-amber-100/60'
            }`}
            title={userRecording && voiceMode === 'user' ? 'استمع لصوتك الحقيقي المسجّل' : 'استمع للمقطع بالصوت الاصطناعي'}
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {isSpeakingSnippet
                ? 'جارٍ الاستماع...'
                : userRecording && voiceMode === 'user'
                ? 'استماع لصوتك'
                : 'استماع للمقطع'}
            </span>
          </button>

          {/* Supervisor Intro speech */}
          <button
            id="wb-supervisor-intro-btn"
            onClick={handleToggleSupervisorSpeech}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs border ${
              isPlayingIntro
                ? 'bg-emerald-700 text-white border-emerald-800 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
            title="الاستماع للكلمة التوجيهية الافتتاحية للمشرف رشيد"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isPlayingIntro ? 'إيقاف المقدمة' : 'كلمة المشرف'}</span>
          </button>
        </div>
      </div>

      {/* Playback Controls & Timeline Scrubber */}
      <div className="p-4 bg-stone-50 flex flex-col gap-3">
        {/* Timeline Slider with visual markers */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-stone-600 w-10 text-left">
            {elapsedSec}s
          </span>
          <div className="relative flex-1 group">
            <input
              type="range"
              id="timeline-scrubber"
              min="0"
              max="1"
              step="0.005"
              value={progress}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                progressRef.current = val;
                setProgress(val);
              }}
              className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
            {/* Draw phase indicators */}
            <div className="flex justify-between text-[10px] text-stone-400 px-1 mt-1 font-mono">
              <span>0% (البداية)</span>
              <span>25% (الهيكل)</span>
              <span>50% (التفاصيل)</span>
              <span>75% (العناصر)</span>
              <span>100% (تثبيت المشهد)</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-stone-600 w-10 text-right">
            {currentScene.durationSeconds}s
          </span>
        </div>

        {/* Bottom Control Buttons Grid */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Main Action Group: Play, Pause, Next, Prev, Reset */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="wb-prev-scene-btn"
              onClick={handlePrevScene}
              disabled={sceneIndex === 0}
              className="p-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="المشهد السابق"
            >
              <SkipForward className="w-4 h-4 rotate-180" />
            </button>

            <button
              id="wb-play-pause-btn"
              onClick={handlePlayPause}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>تشغيل الوايت بورد</span>
                </>
              )}
            </button>

            <button
              id="wb-next-scene-btn"
              onClick={handleNextScene}
              disabled={sceneIndex === allScenes.length - 1}
              className="p-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="المشهد التالي"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              id="wb-restart-scene-btn"
              onClick={handleRestart}
              className="p-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 transition-colors"
              title="إعادة رسم المشهد من البداية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Scene Selector Tabs */}
          <div className="hidden lg:flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl">
            {allScenes.map((s, idx) => (
              <button
                key={s.id}
                id={`scene-tab-${idx + 1}`}
                onClick={() => onSelectSceneIndex(idx)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  sceneIndex === idx
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                مشهد {idx + 1}
              </button>
            ))}
          </div>

          {/* Audio, Speed & Speech Toggles */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="flex items-center bg-stone-200/80 rounded-lg p-0.5 text-xs font-bold">
              {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeed(spd)}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    speed === spd ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Marker Sound Effect */}
            <button
              id="wb-toggle-sound-btn"
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-stone-100 text-stone-400 border-stone-200'
              }`}
              title={soundEnabled ? 'صوت حركة قلم الماركر مفعّل' : 'صوت القلم مكتوم'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Voiceover Speech synthesis */}
            <button
              id="wb-toggle-voiceover-btn"
              onClick={toggleVoiceover}
              className={`p-2 rounded-xl border transition-colors ${
                voiceoverEnabled
                  ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                  : 'bg-stone-100 text-stone-400 border-stone-200'
              }`}
              title={voiceoverEnabled ? 'التعليق الصوتي الآلي مفعّل' : 'التعليق الصوتي متوقف'}
            >
              {voiceoverEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Voice Recording Studio Modal */}
      {isVoiceRecorderOpen && (
        <VoiceRecorderModal
          isOpen={isVoiceRecorderOpen}
          scene={currentScene}
          track={currentTrack || {
            id: 'current_track',
            title: trackTitle,
            description: trackTitle,
            badge: 'المسار النشط',
            scenes: allScenes
          }}
          onClose={() => setIsVoiceRecorderOpen(false)}
          onRecordingSaved={() => {
            setUserRecording(userVoiceService.getRecording(currentScene.id));
            setRecordedScenesCount(userVoiceService.getRecordedSceneIds().length);
          }}
        />
      )}
    </div>
  );
};
