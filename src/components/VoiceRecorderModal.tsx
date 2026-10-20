import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Volume2,
  ChevronRight,
  ChevronLeft,
  X,
  Radio,
  Sparkles,
  Clock,
  AlertCircle,
  FileAudio,
  Headphones,
  Info,
  ShieldCheck
} from 'lucide-react';
import { StoryboardScene, StoryboardTrack } from '../types';
import { userVoiceService, UserVoiceRecording } from '../utils/userVoiceRecordingService';
import { audioService } from '../utils/audioSynthesizer';
import { RACHID_SUPERVISOR } from '../data/rachidSupervisorPersona';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: StoryboardScene;
  track: StoryboardTrack;
  onSelectScene?: (scene: StoryboardScene) => void;
  onRecordingSaved?: () => void;
}

type RecordingState = 'idle' | 'countdown' | 'recording' | 'preview';

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  scene,
  track,
  onSelectScene,
  onRecordingSaved
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [previewDuration, setPreviewDuration] = useState<number>(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState<number>(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const [existingRecording, setExistingRecording] = useState<UserVoiceRecording | undefined>(undefined);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [useCountdown, setUseCountdown] = useState<boolean>(false); // default false for instant response

  // Audio Context & MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const recordedDurationRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Safe time formatting that NEVER prints Infinity or NaN
  const formatSeconds = (sec: number): string => {
    if (!Number.isFinite(sec) || isNaN(sec) || sec <= 0) {
      return '00:00.0';
    }
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Load existing recording for current scene
  useEffect(() => {
    if (!isOpen) return;
    stopAllHardware();
    const rec = userVoiceService.getRecording(scene.id);
    setExistingRecording(rec);
    if (rec && rec.audioUrl) {
      setPreviewAudioUrl(rec.audioUrl);
      const dur = Number.isFinite(rec.duration) && rec.duration > 0 ? rec.duration : 5;
      setPreviewDuration(dur);
      recordedDurationRef.current = dur;
      setRecordingState('preview');
    } else {
      setPreviewAudioUrl(null);
      setPreviewDuration(0);
      recordedDurationRef.current = 0;
      setRecordingState('idle');
    }
    setPreviewCurrentTime(0);
    setRecordingDuration(0);
    setErrorMessage(null);
    setSaveSuccessNotice(false);
  }, [scene.id, isOpen]);

  // Clean up media streams and audio when modal closes or unmounts
  useEffect(() => {
    return () => {
      stopAllHardware();
    };
  }, []);

  const stopAllHardware = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
    }

    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.pause();
      } catch {
        // ignore
      }
      previewAudioRef.current = null;
    }
    setIsPreviewPlaying(false);
  };

  // Start live waveform rendering on Canvas
  const startWaveformVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dark background
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = Math.max(3, (dataArray[i] / 255) * canvas.height * 0.85);

          // Warm golden/amber wave
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 1, barHeight);

          x += barWidth + 1;
        }

        animFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.warn('Canvas visualizer setup failed:', err);
    }
  };

  // Start Recording workflow
  const handleInitiateRecording = async () => {
    setErrorMessage(null);
    setSaveSuccessNotice(false);

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('المتصفح لا يدعم الوصول للميكروفون مباشرة في هذا الوضع. يمكنك استخدام زر رفع ملف صوتي.');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      if (useCountdown) {
        setRecordingState('countdown');
        setCountdown(3);
        let count = 3;
        countdownIntervalRef.current = window.setInterval(() => {
          count -= 1;
          if (count > 0) {
            setCountdown(count);
          } else {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            startActualMediaRecorder(stream);
          }
        }, 1000);
      } else {
        startActualMediaRecorder(stream);
      }
    } catch (err: unknown) {
      console.error('Microphone access denied:', err);
      const errorMsg = (err instanceof Error) ? err.message : String(err);
      if (errorMsg.includes('Permission') || errorMsg.includes('denied') || errorMsg.includes('NotAllowed')) {
        setErrorMessage('تم حظر الوصول إلى الميكروفون بواسطة المتصفح. يُرجى السماح بالمايكروفون من شريط العنوان، أو فتح التطبيق في نافذة جديدة، أو رفع ملف صوتي مسجل بهاتفك.');
      } else {
        setErrorMessage('تعذر فتح الميكروفون: ' + errorMsg);
      }
      setRecordingState('idle');
    }
  };

  const startActualMediaRecorder = (stream: MediaStream) => {
    audioChunksRef.current = [];

    // Choose supported mimeType
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else {
        mimeType = '';
      }
    }

    try {
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Compute accurate duration
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        const finalDuration = Math.max(1, Math.round(elapsed * 10) / 10);
        recordedDurationRef.current = finalDuration;
        setRecordingDuration(finalDuration);
        setPreviewDuration(finalDuration);

        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => {
            try {
              t.stop();
            } catch {}
          });
          streamRef.current = null;
        }
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }

        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });

        if (finalBlob.size === 0) {
          setErrorMessage('لم يتم التقاط أي صوت من الميكروفون. تأكد من توصيل المايك وحاول ثانية.');
          setRecordingState('idle');
          return;
        }

        const url = URL.createObjectURL(finalBlob);
        setPreviewAudioUrl(url);

        // Automatically save immediately to IndexedDB and activate!
        try {
          const saved = await userVoiceService.saveRecording(
            scene.id,
            finalBlob,
            finalDuration,
            {
              title: scene.title,
              voiceoverText: scene.voiceoverText
            }
          );
          setExistingRecording(saved);
          audioService.setVoiceMode('user');
          setSaveSuccessNotice(true);
          onRecordingSaved?.();
          setTimeout(() => setSaveSuccessNotice(false), 4000);
        } catch (saveErr) {
          console.warn('Auto-save error:', saveErr);
        }

        setRecordingState('preview');
      };

      mediaRecorder.start(200); // chunk every 200ms
      recordingStartTimeRef.current = Date.now();
      recordedDurationRef.current = 0;
      setRecordingDuration(0);
      setRecordingState('recording');

      // Update timer every 100ms
      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        recordedDurationRef.current = elapsed;
        setRecordingDuration(elapsed);
      }, 100);

      // Start visualizer
      startWaveformVisualizer(stream);
    } catch (e: unknown) {
      console.error('Error starting MediaRecorder:', e);
      setErrorMessage('حدث خطأ أثناء تشغيل مسجل الصوت: ' + ((e instanceof Error) ? e.message : ''));
      setRecordingState('idle');
    }
  };

  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.requestData();
      } catch {}
      mediaRecorderRef.current.stop();
    }
  };

  // Playback preview logic
  const handleTogglePreviewPlay = () => {
    if (!previewAudioUrl) return;

    if (previewAudioRef.current) {
      if (isPreviewPlaying) {
        previewAudioRef.current.pause();
        setIsPreviewPlaying(false);
        return;
      } else {
        previewAudioRef.current.play().then(() => {
          setIsPreviewPlaying(true);
        }).catch(err => {
          console.warn('Preview play error:', err);
          setIsPreviewPlaying(false);
        });
        return;
      }
    }

    const audio = new Audio(previewAudioUrl);
    previewAudioRef.current = audio;

    audio.ontimeupdate = () => {
      if (Number.isFinite(audio.currentTime)) {
        setPreviewCurrentTime(audio.currentTime);
      }
    };

    audio.onended = () => {
      setIsPreviewPlaying(false);
      setPreviewCurrentTime(0);
    };

    audio.onerror = () => {
      setIsPreviewPlaying(false);
      setErrorMessage('تعذر تشغيل المعاينة الصوتية.');
    };

    audio.play().then(() => {
      setIsPreviewPlaying(true);
    }).catch(err => {
      console.warn('Preview play failed:', err);
      setIsPreviewPlaying(false);
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (!Number.isFinite(time)) return;
    setPreviewCurrentTime(time);
    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.currentTime = time;
      } catch {}
    }
  };

  const handleDeleteSavedRecording = async () => {
    if (confirm('هل أنت متأكد من حذف هذا التسجيل؟ سيعود التطبيق لاستخدام الصوت الاصطناعي الافتراضي.')) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      setIsPreviewPlaying(false);
      await userVoiceService.deleteRecording(scene.id);
      setExistingRecording(undefined);
      setPreviewAudioUrl(null);
      setPreviewDuration(0);
      setPreviewCurrentTime(0);
      recordedDurationRef.current = 0;
      setRecordingState('idle');
      onRecordingSaved?.();
    }
  };

  const handleDownload = () => {
    if (existingRecording) {
      userVoiceService.downloadRecording(scene.id, `تسجيل_المشرف_رشيد_المشهد_${scene.sceneNumber}.webm`);
    } else if (previewAudioUrl) {
      const a = document.createElement('a');
      a.href = previewAudioUrl;
      a.download = `تسجيل_المشرف_رشيد_المشهد_${scene.sceneNumber}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const saved = await userVoiceService.importAudioFile(scene.id, file, {
        title: scene.title,
        voiceoverText: scene.voiceoverText
      });
      setExistingRecording(saved);
      setPreviewAudioUrl(saved.audioUrl);
      const dur = Number.isFinite(saved.duration) && saved.duration > 0 ? saved.duration : 5;
      setPreviewDuration(dur);
      recordedDurationRef.current = dur;
      audioService.setVoiceMode('user');
      setSaveSuccessNotice(true);
      setRecordingState('preview');
      onRecordingSaved?.();
      setTimeout(() => setSaveSuccessNotice(false), 4000);
    } catch (err: unknown) {
      setErrorMessage('تعذر قراءة أو استيراد الملف الصوتي: ' + ((err instanceof Error) ? err.message : ''));
    }
  };

  // Navigate to prev / next scene directly
  const currentIndex = track.scenes.findIndex(s => s.id === scene.id);
  const prevScene = currentIndex > 0 ? track.scenes[currentIndex - 1] : null;
  const nextScene = currentIndex < track.scenes.length - 1 ? track.scenes[currentIndex + 1] : null;

  const navigateToScene = (targetScene: StoryboardScene) => {
    stopAllHardware();
    if (onSelectScene) {
      onSelectScene(targetScene);
    }
  };

  if (!isOpen) return null;

  const activeDuration = Number.isFinite(previewDuration) && previewDuration > 0
    ? previewDuration
    : Number.isFinite(recordedDurationRef.current) && recordedDurationRef.current > 0
    ? recordedDurationRef.current
    : 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="voice-recorder-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden text-stone-900"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white px-4 py-3 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/60 border border-amber-400/40 flex items-center justify-center shadow-inner">
              <Mic className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">استوديو تسجيل صوتك الحقيقي</h3>
                <span className="bg-amber-600 text-amber-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/40">
                  {RACHID_SUPERVISOR.role}
                </span>
              </div>
              <p className="text-amber-200/90 text-[11px]">
                سجّل بصوتك ولكنتك الطبيعية ليتم اعتماده كصوت الراوي في فيديو الوايت بورد!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAllHardware();
              onClose();
            }}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-amber-800/80 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scene Selector Strip */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 font-bold">
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded font-mono text-[11px]">
              مشهد {scene.sceneNumber} / {track.scenes.length}
            </span>
            <span className="truncate max-w-[200px] sm:max-w-xs text-stone-800">{scene.title}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => prevScene && navigateToScene(prevScene)}
              disabled={!prevScene}
              className="px-2 py-1 rounded bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold text-[11px]"
              title="المشهد السابق"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>السابق</span>
            </button>
            <button
              onClick={() => nextScene && navigateToScene(nextScene)}
              disabled={!nextScene}
              className="px-2 py-1 rounded bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold text-[11px]"
              title="المشهد التالي"
            >
              <span>التالي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1">
          {/* Success or Error Banners */}
          {saveSuccessNotice && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-2.5 flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تم حفظ واعتماد تسجيلك الصوتي بنجاح! سيتم تشغيله تلقائياً في الوايت بورد بصوتك الحقيقي.</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-300 text-red-900 rounded-xl p-2.5 flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Teleprompter Card (What to say) */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-xs font-extrabold text-amber-950">النص المطلوب قراءته (نص المشرف رشيد):</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-mono">
                <span className="bg-amber-200/60 px-1.5 py-0.5 rounded font-bold">
                  {scene.voiceoverText.split(/\s+/).length} كلمة
                </span>
                <span className="bg-white border border-amber-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  {scene.minDuration}-{scene.maxDuration}ث
                </span>
              </div>
            </div>

            {/* High-visibility Teleprompter Text */}
            <div className="bg-white border border-amber-200 rounded-lg p-3 text-stone-900 leading-relaxed font-bold text-sm sm:text-base selection:bg-amber-200">
              "{scene.voiceoverText}"
            </div>
          </div>

          {/* Recording Station & Visualizer Box */}
          <div className="bg-stone-900 rounded-xl p-3 text-white shadow-md flex flex-col items-center justify-center relative overflow-hidden border border-stone-800">
            {/* Visualizer Canvas */}
            <canvas
              ref={canvasRef}
              width={500}
              height={50}
              className="w-full h-12 rounded opacity-90 mb-2"
            />

            {/* Countdown Overlay */}
            {recordingState === 'countdown' && (
              <div className="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center z-10 animate-in zoom-in-95">
                <span className="text-4xl font-black text-amber-400 font-mono animate-bounce">{countdown}</span>
                <p className="text-xs text-stone-300 mt-1 font-bold">استعد... سيبدأ التسجيل بعد ثوانٍ</p>
                <button
                  onClick={() => {
                    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                    if (streamRef.current) startActualMediaRecorder(streamRef.current);
                  }}
                  className="mt-2 text-[11px] text-amber-400 underline font-bold"
                >
                  ابدأ فوراً
                </button>
              </div>
            )}

            {/* Status Information */}
            <div className="flex items-center justify-between w-full px-1 text-xs mb-3">
              <div className="flex items-center gap-2">
                {recordingState === 'recording' && (
                  <span className="flex items-center gap-1 text-red-400 font-bold bg-red-950/70 px-2 py-0.5 rounded border border-red-700 animate-pulse">
                    <Radio className="w-3.5 h-3.5 text-red-500" />
                    جارٍ التسجيل المباشر...
                  </span>
                )}
                {recordingState === 'idle' && (
                  <span className="text-stone-400 flex items-center gap-1 font-medium">
                    <Mic className="w-3.5 h-3.5 text-amber-400" />
                    الميكروفون جاهز للتسجيل
                  </span>
                )}
                {recordingState === 'preview' && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/60">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تم تسجيل صوتك واعتماده
                  </span>
                )}
              </div>

              {/* Live Timer Display (Guaranteed Safe Time) */}
              <div className="font-mono text-sm font-bold bg-stone-800 px-2.5 py-0.5 rounded border border-stone-700 text-amber-300">
                {recordingState === 'recording'
                  ? formatSeconds(recordingDuration)
                  : recordingState === 'preview'
                  ? `${formatSeconds(previewCurrentTime)} / ${formatSeconds(activeDuration)}`
                  : '00:00.0'}
              </div>
            </div>

            {/* DIRECT ACTION BUTTONS (ALWAYS VISIBLE) */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 border-t border-stone-800">
              {recordingState === 'idle' && (
                <div className="flex items-center gap-3 w-full justify-center flex-wrap">
                  <button
                    id="start-recording-btn"
                    onClick={handleInitiateRecording}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Mic className="w-4 h-4 text-white" />
                    <span>ابدأ تسجيل صوتك الآن</span>
                  </button>

                  <label className="text-[11px] text-stone-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCountdown}
                      onChange={(e) => setUseCountdown(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span>عدّ تمهيدي (3 ثوانٍ)</span>
                  </label>
                </div>
              )}

              {recordingState === 'recording' && (
                <button
                  id="stop-recording-btn"
                  onClick={handleStopRecording}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center gap-2 shadow-lg animate-pulse hover:scale-[1.02]"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>⏹️ إيقاف وحفظ التسجيل الآن</span>
                </button>
              )}

              {recordingState === 'preview' && (
                <div className="w-full flex flex-col gap-2">
                  {/* Scrubber Range */}
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="range"
                      min={0}
                      max={activeDuration || 1}
                      step={0.1}
                      value={previewCurrentTime}
                      onChange={handleSeek}
                      className="w-full accent-amber-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Player Controls Bar */}
                  <div className="flex items-center justify-between w-full flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTogglePreviewPlay}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        {isPreviewPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>إيقاف مؤقت</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>استمع لتسجيلك</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleInitiateRecording}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 border border-stone-700 transition-colors"
                        title="تسجيل مرة أخرى"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>إعادة التسجيل</span>
                      </button>

                      <button
                        onClick={async () => {
                          if (existingRecording?.blob) {
                            await userVoiceService.saveMasterRecording(
                              existingRecording.blob,
                              existingRecording.duration,
                              {
                                title: `البصمة الصوتية الرسمية للمشرف رشيد (مأخوذة من مشهد ${scene.sceneNumber})`,
                                voiceoverText: scene.voiceoverText
                              }
                            );
                            setSaveSuccessNotice(true);
                            setTimeout(() => setSaveSuccessNotice(false), 3500);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="تعيين هذا التسجيل كبصمة صوتية رئيسية معتمدة للمشرف رشيد لكافة المشاهد"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تعيين كبصمة المشرف رشيد</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleDownload}
                        className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                        title="تنزيل الملف الصوتي (WebM)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleDeleteSavedRecording}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-stone-800 transition-colors"
                        title="حذف التسجيل والرجوع للصوت الافتراضي"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alternative: File Import & External Mic Helper */}
          <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-[11px]">
                هل سجّلت صوتك مسبقاً بهاتفك الذكي أو ميكروفون خارجي؟
              </span>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 font-bold flex items-center gap-1 shadow-2xs text-[11px]"
              >
                <Upload className="w-3 h-3 text-stone-600" />
                <span>رفع ملف صوتي (MP3 / WAV / WebM)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 border-t border-stone-200 px-4 py-2.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700 text-[11px]">حالة المشهد الحالي:</span>
            {existingRecording ? (
              <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                صوتك الحقيقي معتمد ({existingRecording.duration} ثانية)
              </span>
            ) : (
              <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300 text-[11px]">
                الصوت الاصطناعي الافتراضي (في انتظار تسجيلك)
              </span>
            )}
          </div>

          <button
            onClick={() => {
              stopAllHardware();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold transition-colors text-xs"
          >
            إغلاق الاستوديو
          </button>
        </div>
      </div>
    </div>
  );
};
