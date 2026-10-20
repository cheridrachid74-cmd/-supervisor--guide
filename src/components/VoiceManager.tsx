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
  VolumeX,
  Radio,
  Sparkles,
  Clock,
  AlertCircle,
  FileAudio,
  Headphones,
  Video,
  Layers,
  FolderDown,
  Info,
  Bell,
  Wind,
  FileText,
  PenTool,
  AlertTriangle,
  Camera,
  Check,
  Copy,
  Search,
  Filter,
  Volume1,
  Share2,
  Sliders,
  Wand2,
  Award,
  Zap,
  BarChart2,
  Activity,
  HeartHandshake,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { StoryboardScene, StoryboardTrack } from '../types';
import { STORYBOARD_TRACKS } from '../data/storyboardData';
import { convertBlobToWav } from '../utils/wavEncoder';
import { userVoiceService, MASTER_RACHID_VOICE_ID, UserVoiceRecording } from '../utils/userVoiceRecordingService';
import { audioService } from '../utils/audioSynthesizer';
import {
  SOUND_EFFECTS_CATALOG,
  READY_VOICE_CUES,
  soundEffectsService,
  SoundEffectItem,
  ReadyVoiceCueItem
} from '../utils/soundEffectsLibrary';
import {
  ToneArchetype,
  TONE_PRESETS,
  calibrateArabicTextForSpeech,
  evaluateSpeechScript,
  VoiceEvaluationMetric
} from '../utils/toneCalibrator';
import {
  ALGERIAN_ORATORY_RULES,
  formatToAlgerianOratoryScript,
  ALGERIAN_AUTHENTIC_SUPERVISOR_SAMPLE
} from '../utils/algerianOratoryEngine';

export type VoiceRecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';
export type StudioSubTab = 'recorder' | 'tone' | 'sfx' | 'cues';

export interface VoiceManagerProps {
  initialScene?: StoryboardScene;
  initialTrack?: StoryboardTrack;
  onRecordingSavedToScene?: (sceneId: string) => void;
  className?: string;
}

export const VoiceManager: React.FC<VoiceManagerProps> = ({
  initialScene,
  initialTrack,
  onRecordingSavedToScene,
  className = ''
}) => {
  // Studio navigation tabs
  const [activeStudioTab, setActiveStudioTab] = useState<StudioSubTab>('recorder');

  // Track and scene selection
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    initialTrack?.id || STORYBOARD_TRACKS[0].id
  );
  const currentTrack =
    STORYBOARD_TRACKS.find((t) => t.id === selectedTrackId) || STORYBOARD_TRACKS[0];

  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    initialScene?.id || currentTrack.scenes[0]?.id || 'custom'
  );
  const selectedScene =
    currentTrack.scenes.find((s) => s.id === selectedSceneId) || currentTrack.scenes[0];

  // Recording State
  const [recordingStatus, setRecordingStatus] = useState<VoiceRecordingStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedWavBlob, setRecordedWavBlob] = useState<Blob | null>(null);
  const [isConvertingToWav, setIsConvertingToWav] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customScript, setCustomScript] = useState<string>('');

  // Playback Preview State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [previewDuration, setPreviewDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Tone Calibration & Evaluation State - Default to authentic Algerian educator
  const [selectedToneArchetype, setSelectedToneArchetype] = useState<ToneArchetype>('algerian_educator');
  const [customRate, setCustomRate] = useState<number>(TONE_PRESETS.algerian_educator.rate);
  const [customPitch, setCustomPitch] = useState<number>(TONE_PRESETS.algerian_educator.pitch);
  const [isAuditioning, setIsAuditioning] = useState<boolean>(false);
  const [isStudioFilterActive, setIsStudioFilterActive] = useState<boolean>(true);

  // Sound Effects Library State
  const [sfxCategoryFilter, setSfxCategoryFilter] = useState<string>('all');
  const [sfxSearchQuery, setSfxSearchQuery] = useState<string>('');
  const [playingEffectId, setPlayingEffectId] = useState<string | null>(null);
  const [speakingCueId, setSpeakingCueId] = useState<string | null>(null);
  const [copiedCueId, setCopiedCueId] = useState<string | null>(null);

  // Master Supervisor Rachid Voice State
  const [masterRecording, setMasterRecording] = useState<UserVoiceRecording | undefined>(
    userVoiceService.getMasterRecording()
  );
  const [isPlayingMasterVoice, setIsPlayingMasterVoice] = useState<boolean>(false);
  const masterFileInputRef = useRef<HTMLInputElement | null>(null);

  // Status & Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string>('');

  // Refs for MediaRecorder & Web Audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to userVoiceService updates (including Master Rachid voice)
  useEffect(() => {
    userVoiceService.initDB().then(() => {
      setMasterRecording(userVoiceService.getMasterRecording());
    });
    const unsub = userVoiceService.subscribe(() => {
      setMasterRecording(userVoiceService.getMasterRecording());
    });
    return () => unsub();
  }, []);

  // Initialize script and filename when scene changes
  useEffect(() => {
    if (selectedSceneId === MASTER_RACHID_VOICE_ID) {
      setCustomScript(
        masterRecording?.voiceoverText ||
          'بسم الله الرحمن الرحيم. أبنائي وبناتي التلاميذ، معكم مشرف التربية رشيد في ثانوية ابن الهيثم التقنية.'
      );
      setCustomFileName('VideoScribe_Supervisor_Rachid_Master_Voice');
    } else if (selectedScene) {
      setCustomScript(selectedScene.voiceoverText);
      setCustomFileName(
        `VideoScribe_Scene_${selectedScene.sceneNumber}_${selectedScene.title.replace(/\s+/g, '_')}`
      );
    } else {
      setCustomFileName('VideoScribe_Voiceover_Take');
    }
  }, [selectedScene, selectedSceneId, masterRecording]);

  // Sync tone archetype with audio service
  useEffect(() => {
    audioService.setToneArchetype(selectedToneArchetype);
    setCustomRate(TONE_PRESETS[selectedToneArchetype].rate);
    setCustomPitch(TONE_PRESETS[selectedToneArchetype].pitch);
  }, [selectedToneArchetype]);

  // Clean up all resources on unmount
  useEffect(() => {
    return () => {
      cleanupAllAudio();
      soundEffectsService.stopCurrent();
      audioService.stopAllVoice();
    };
  }, []);

  const cleanupAllAudio = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.pause();
      } catch {}
      previewAudioRef.current = null;
    }
    setIsPlaying(false);
  };

  // Safe time formatter (00:00.0)
  const formatTime = (secs: number): string => {
    if (!Number.isFinite(secs) || isNaN(secs) || secs < 0) {
      return '00:00.0';
    }
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Start Visualizer Canvas
  const setupLiveVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      const audioCtx = new AudioCtxClass();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      // Studio EQ filters if enabled
      let finalSource: AudioNode = source;
      if (isStudioFilterActive) {
        // High-pass filter to cut low microphone rumbles and breath pops (80Hz)
        const highPass = audioCtx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 80;

        // Warm baritone body for Algerian male educator voice (160Hz)
        const baritoneWarmth = audioCtx.createBiquadFilter();
        baritoneWarmth.type = 'peaking';
        baritoneWarmth.frequency.value = 160;
        baritoneWarmth.Q.value = 1.0;
        baritoneWarmth.gain.value = 2.5;

        // Presence peak filter for vocal clarity & diction (3200Hz)
        const presence = audioCtx.createBiquadFilter();
        presence.type = 'peaking';
        presence.frequency.value = 3200;
        presence.Q.value = 1.2;
        presence.gain.value = 2.5;

        source.connect(highPass);
        highPass.connect(baritoneWarmth);
        baritoneWarmth.connect(presence);
        finalSource = presence;
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      finalSource.connect(analyser);
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

        // Dark Studio background
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.6;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = Math.max(3, (dataArray[i] / 255) * canvas.height * 0.9);

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#059669');
          gradient.addColorStop(0.6, '#10b981');
          gradient.addColorStop(1, '#34d399');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 1, barHeight);

          x += barWidth + 1;
        }

        animFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.warn('Visualizer setup error:', err);
    }
  };

  // 1. START RECORDING
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setRecordedBlob(null);
    setRecordedWavBlob(null);

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('متصفحك لا يدعم تسجيل الصوت المباشر عبر الميكروفون. يمكنك رفع ملف صوتي بدلاً من ذلك.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

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

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }

        const rawBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });

        if (rawBlob.size === 0) {
          setErrorMessage('لم يتم التقاط أي بيانات صوتية. تأكد من توصيل الميكروفون وحاول مرة أخرى.');
          setRecordingStatus('idle');
          return;
        }

        setRecordedBlob(rawBlob);
        const url = URL.createObjectURL(rawBlob);
        setPreviewUrl(url);

        const finalDur = Math.max(
          1,
          accumulatedTimeRef.current + (Date.now() - startTimeRef.current) / 1000
        );
        setPreviewDuration(finalDur);
        setPlaybackTime(0);
        setRecordingStatus('stopped');

        // Automatically convert to standard 16-bit PCM WAV for VideoScribe
        try {
          setIsConvertingToWav(true);
          const wavBlob = await convertBlobToWav(rawBlob);
          setRecordedWavBlob(wavBlob);
          setSuccessMessage('تم التقاط الصوت وتوليد ملف WAV المخصص لـ VideoScribe بنجاح!');
        } catch (convErr) {
          console.warn('WAV conversion fallback:', convErr);
        } finally {
          setIsConvertingToWav(false);
        }
      };

      mediaRecorder.start(200);
      startTimeRef.current = Date.now();
      accumulatedTimeRef.current = 0;
      setElapsedSeconds(0);
      setRecordingStatus('recording');

      timerIntervalRef.current = window.setInterval(() => {
        const currentElapsed =
          accumulatedTimeRef.current + (Date.now() - startTimeRef.current) / 1000;
        setElapsedSeconds(currentElapsed);
      }, 100);

      setupLiveVisualizer(stream);
    } catch (err: unknown) {
      console.error('Recording initialization error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
        setErrorMessage('تم رفض الإذن للوصول إلى الميكروفون. اسمح بالمايكروفون من إعدادات المتصفح أو افتح التطبيق في نافذة مستقلة.');
      } else {
        setErrorMessage('تعذر بدء التسجيل: ' + msg);
      }
      setRecordingStatus('idle');
    }
  };

  // 2. PAUSE RECORDING
  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.pause();
      } catch {}
      accumulatedTimeRef.current += (Date.now() - startTimeRef.current) / 1000;
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setRecordingStatus('paused');
    }
  };

  // 3. RESUME RECORDING
  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      try {
        mediaRecorderRef.current.resume();
      } catch {}
      startTimeRef.current = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        const currentElapsed =
          accumulatedTimeRef.current + (Date.now() - startTimeRef.current) / 1000;
        setElapsedSeconds(currentElapsed);
      }, 100);
      setRecordingStatus('recording');
    }
  };

  // 4. STOP RECORDING
  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')
    ) {
      try {
        mediaRecorderRef.current.requestData();
      } catch {}
      mediaRecorderRef.current.stop();
    }
  };

  // 5. DOWNLOAD HANDLERS
  const handleDownloadWebm = () => {
    if (!recordedBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(recordedBlob);
    a.download = `${customFileName || 'VideoScribe_Voiceover'}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadWav = async () => {
    try {
      let wav = recordedWavBlob;
      if (!wav && recordedBlob) {
        setIsConvertingToWav(true);
        wav = await convertBlobToWav(recordedBlob);
        setRecordedWavBlob(wav);
      }
      if (!wav) return;

      const a = document.createElement('a');
      a.href = URL.createObjectURL(wav);
      a.download = `${customFileName || 'VideoScribe_Voiceover'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      setErrorMessage('تعذر تحويل الملف إلى صيغة WAV: ' + ((e instanceof Error) ? e.message : ''));
    } finally {
      setIsConvertingToWav(false);
    }
  };

  // 6. PLAYBACK PREVIEW CONTROLS
  const handleTogglePlay = () => {
    if (!previewUrl) return;

    if (previewAudioRef.current) {
      if (isPlaying) {
        previewAudioRef.current.pause();
        setIsPlaying(false);
      } else {
        previewAudioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
      return;
    }

    const audio = new Audio(previewUrl);
    previewAudioRef.current = audio;
    audio.volume = isMuted ? 0 : volume;

    audio.ontimeupdate = () => {
      if (Number.isFinite(audio.currentTime)) {
        setPlaybackTime(audio.currentTime);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    };

    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!Number.isFinite(val)) return;
    setPlaybackTime(val);
    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.currentTime = val;
      } catch {}
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (previewAudioRef.current) {
      previewAudioRef.current.volume = isMuted ? 0 : val;
    }
  };

  const handleToggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (previewAudioRef.current) {
      previewAudioRef.current.volume = newMute ? 0 : volume;
    }
  };

  // 7. SAVE TO APPLICATION & MASTER RACHID VOICE HANDLING
  const handleSaveToActiveScene = async () => {
    if (!recordedBlob) return;
    try {
      const dur = previewDuration || elapsedSeconds || 5;

      if (selectedSceneId === MASTER_RACHID_VOICE_ID) {
        await userVoiceService.saveMasterRecording(recordedBlob, dur, {
          title: 'البصمة الصوتية الرسمية للمشرف رشيد (تسجيل حقيقي جديد)',
          voiceoverText: customScript || 'بسم الله الرحمن الرحيم. أبنائي وبناتي التلاميذ، معكم مشرف التربية رشيد.'
        });
        audioService.setVoiceMode('user');
        setSuccessMessage('تم اعتماد هذا المقطع الصوتي كبصمة رئيسية معتمدة للمشرف رشيد بنجاح!');
        setTimeout(() => setSuccessMessage(null), 4000);
        return;
      }

      if (!selectedScene) return;

      await userVoiceService.saveRecording(selectedScene.id, recordedBlob, dur, {
        title: selectedScene.title,
        voiceoverText: customScript || selectedScene.voiceoverText
      });
      audioService.setVoiceMode('user');
      setSuccessMessage(`تم اعتماد هذا التسجيل بنجاح في الوايت بورد للمشهد رقم (${selectedScene.sceneNumber})!`);
      if (onRecordingSavedToScene) {
        onRecordingSavedToScene(selectedScene.id);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      setErrorMessage('تعذر حفظ التسجيل في قاعدة البيانات: ' + ((e instanceof Error) ? e.message : ''));
    }
  };

  // Promote current take as Master Recording for Supervisor Rachid
  const handleSetCurrentRecordingAsMaster = async () => {
    if (!recordedBlob) return;
    try {
      const dur = previewDuration || elapsedSeconds || 5;
      await userVoiceService.saveMasterRecording(recordedBlob, dur, {
        title: `البصمة الصوتية الرسمية للمشرف رشيد (مأخوذة من تسجيل مشهد ${selectedScene?.sceneNumber || 'مخصص'})`,
        voiceoverText: customScript || selectedScene?.voiceoverText || 'بسم الله الرحمن الرحيم. أبنائي وبناتي التلاميذ، معكم مشرف التربية رشيد.'
      });
      audioService.setVoiceMode('user');
      setSuccessMessage('تم اعتماد تسجيلك الحالي كبصمة صوتية رسمية للمشرف رشيد لكافة المشاهد بنجاح!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      setErrorMessage('تعذر حفظ البصمة الصوتية الرئيسية: ' + ((e instanceof Error) ? e.message : ''));
    }
  };

  // Play / Stop Master Recorded Voice of Supervisor Rachid
  const handlePlayMasterVoice = () => {
    if (isPlayingMasterVoice) {
      userVoiceService.stopPlayback();
      setIsPlayingMasterVoice(false);
      return;
    }
    audioService.stopAllVoice();
    setIsPlayingMasterVoice(true);
    userVoiceService.playMasterRecording(
      () => setIsPlayingMasterVoice(false),
      1.0,
      () => setIsPlayingMasterVoice(true)
    );
  };

  // Import an authentic external voice recording file for Supervisor Rachid
  const handleImportMasterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rec = await userVoiceService.importAudioFile(MASTER_RACHID_VOICE_ID, file, {
        title: 'البصمة الصوتية الرسمية للمشرف رشيد (تسجيل مرفوع)',
        voiceoverText: 'بسم الله الرحمن الرحيم. أبنائي وبناتي التلاميذ، معكم مشرف التربية رشيد.'
      });
      setMasterRecording(rec);
      audioService.setVoiceMode('user');
      setSuccessMessage('تم اعتماد ملف التسجيل الصوتي الحقيقي للمشرف رشيد بنجاح!');
      setTimeout(() => setSuccessMessage(null), 4500);
    } catch {
      setErrorMessage('تعذر استيراد الملف الصوتي. يرجى التأكد من اختيار ملف صوتي صالح (WAV أو MP3 أو M4A).');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Apply Rachid's master recording to all 55 storyboard scenes at once
  const handleApplyMasterToAllScenes = async () => {
    const allSceneIds: string[] = [];
    STORYBOARD_TRACKS.forEach((track) => {
      track.scenes.forEach((sc) => allSceneIds.push(sc.id));
    });
    const applied = await userVoiceService.applyMasterRecordingToAllScenes(allSceneIds);
    audioService.setVoiceMode('user');
    setSuccessMessage(`تم تعميم نبرة المشرف رشيد المسجلة على كافة مشاهد الستوري بورد (${applied} مشهد) بنجاح!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Synchronize entire system to Rachid's master recorded tone settings
  const handleSyncToMasterTone = () => {
    audioService.setVoiceMode('user');
    setSelectedToneArchetype('algerian_educator');
    setCustomRate(0.85);
    setCustomPitch(0.85);
    audioService.setToneArchetype('algerian_educator');
    setSuccessMessage('تمت مطابقة وتثبيت نبرة المشرف رشيد المسجلة في كامل شاشات ومشاهد النظام (صوت بشري 100%).');
    setTimeout(() => setSuccessMessage(null), 4500);
  };

  // 8. TONE CALIBRATION HANDLERS
  const handleCalibrateScript = () => {
    const calibrated = calibrateArabicTextForSpeech(customScript, selectedToneArchetype);
    setCustomScript(calibrated);
    setSuccessMessage('تم تطبيق التشكيل الصوتي والوقفات التنفسية على النص بنجاح!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleApplyAlgerianOratory = () => {
    const formatted = formatToAlgerianOratoryScript(customScript);
    setCustomScript(formatted);
    setSelectedToneArchetype('algerian_educator');
    setCustomRate(TONE_PRESETS.algerian_educator.rate);
    setCustomPitch(TONE_PRESETS.algerian_educator.pitch);
    setSuccessMessage('تم تطبيق قواعد الإلقاء الجزائري الفصيح (الوقف بالسكون والترتيل الإذاعي) بنجاح!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleAuditionAlgerianSample = (sampleText?: string) => {
    if (isAuditioning) {
      audioService.stopAllVoice();
      setIsAuditioning(false);
      return;
    }

    audioService.stopAllVoice();
    setIsAuditioning(true);
    audioService.setToneArchetype('algerian_educator');

    const textToSpeak =
      sampleText ||
      ALGERIAN_AUTHENTIC_SUPERVISOR_SAMPLE.introText;

    audioService.speakText(
      textToSpeak,
      () => setIsAuditioning(false),
      TONE_PRESETS.algerian_educator.rate,
      TONE_PRESETS.algerian_educator.pitch,
      () => setIsAuditioning(true)
    );
  };

  const handleAuditionTone = () => {
    if (isAuditioning) {
      audioService.stopAllVoice();
      setIsAuditioning(false);
      return;
    }

    audioService.stopAllVoice();
    setIsAuditioning(true);
    audioService.setToneArchetype(selectedToneArchetype);

    const sample = customScript || selectedScene.voiceoverText || 'بسم الله الرحمن الرحيم. أبنائي وبناتي التلاميذ، أهلاً بكم في ثانوية ابن الهيثم.';

    audioService.speakText(
      sample,
      () => setIsAuditioning(false),
      customRate,
      customPitch,
      () => setIsAuditioning(true)
    );
  };

  // Compute live speech metrics
  const wordCount = customScript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedDuration = selectedScene?.maxDuration || 8;
  const estimatedWpm = estimatedDuration > 0 ? Math.round((wordCount / (estimatedDuration / 60))) : 120;
  const evaluationMetrics: VoiceEvaluationMetric[] = evaluateSpeechScript(customScript, estimatedDuration);

  // 9. SOUND EFFECTS HANDLERS
  const handlePlaySoundEffect = (effect: SoundEffectItem) => {
    if (playingEffectId === effect.id) {
      soundEffectsService.stopCurrent();
      setPlayingEffectId(null);
      return;
    }

    setPlayingEffectId(effect.id);
    soundEffectsService.playEffect(effect.id, () => {
      setPlayingEffectId(null);
    });
  };

  const handleDownloadSfxWav = (effect: SoundEffectItem) => {
    try {
      const wavBlob = soundEffectsService.createWavBlob(effect.id);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(wavBlob);
      a.download = `SFX_${effect.id}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSuccessMessage(`تم تنزيل المؤثر الصوتي "${effect.name}" بصيغة WAV جاهز لـ VideoScribe!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setErrorMessage('تعذر تصدير المؤثر الصوتي بصيغة WAV.');
    }
  };

  // 10. READY VOICE CUES HANDLERS
  const handlePlayVoiceCue = (cue: ReadyVoiceCueItem) => {
    if (speakingCueId === cue.id) {
      audioService.stopAllVoice();
      setSpeakingCueId(null);
      return;
    }
    audioService.stopAllVoice();
    setSpeakingCueId(cue.id);
    audioService.speakSupervisorSnippet(cue.text, () => {
      setSpeakingCueId(null);
    });
  };

  const handleCopyCueText = (cue: ReadyVoiceCueItem) => {
    navigator.clipboard.writeText(cue.text);
    setCopiedCueId(cue.id);
    setTimeout(() => setCopiedCueId(null), 2500);
  };

  const handleUseCueInRecorder = (cue: ReadyVoiceCueItem) => {
    setCustomScript(cue.text);
    setCustomFileName(`VideoScribe_Cue_${cue.id}`);
    setActiveStudioTab('recorder');
    setSuccessMessage(`تم نسخ توجيه "${cue.title}" إلى شاشة التلقين في استوديو التسجيل!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Filtered Sound Effects
  const filteredSoundEffects = SOUND_EFFECTS_CATALOG.filter((sfx) => {
    const matchesCategory = sfxCategoryFilter === 'all' || sfx.category === sfxCategoryFilter;
    const matchesQuery =
      sfxSearchQuery === '' ||
      sfx.name.toLowerCase().includes(sfxSearchQuery.toLowerCase()) ||
      sfx.description.toLowerCase().includes(sfxSearchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getEffectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wind':
        return <Wind className="w-4 h-4 text-sky-500" />;
      case 'Bell':
        return <Bell className="w-4 h-4 text-amber-500" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-stone-500" />;
      case 'PenTool':
        return <PenTool className="w-4 h-4 text-blue-500" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'Camera':
        return <Camera className="w-4 h-4 text-indigo-500" />;
      default:
        return <Volume2 className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div
      id="voice-manager-container"
      className={`bg-white rounded-3xl border border-stone-200 shadow-md p-5 sm:p-7 text-stone-900 ${className}`}
      dir="rtl"
    >
      {/* Studio Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-stone-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-600/20 shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                استوديو الصوت وتقويم النبرة (Voice & Tone Studio)
              </h2>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                معايرة احترافية لـ VideoScribe
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              قيّم وقوّم النبرة التربوية الأبوية، سجّل تعليقك بصيغة WAV، واستخدم مكتبة المؤثرات الصوتية والانتقالية.
            </p>
          </div>
        </div>

        {/* 4 Core Studio Sub-Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 shrink-0 flex-wrap gap-1">
          <button
            id="tab-studio-recorder"
            onClick={() => setActiveStudioTab('recorder')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStudioTab === 'recorder'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>تسجيل الميكروفون</span>
          </button>

          <button
            id="tab-studio-tone"
            onClick={() => setActiveStudioTab('tone')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStudioTab === 'tone'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-300" />
            <span>تقييم وتقويم النبرة</span>
          </button>

          <button
            id="tab-studio-sfx"
            onClick={() => setActiveStudioTab('sfx')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStudioTab === 'sfx'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>مكتبة المؤثرات ({SOUND_EFFECTS_CATALOG.length})</span>
          </button>

          <button
            id="tab-studio-cues"
            onClick={() => setActiveStudioTab('cues')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeStudioTab === 'cues'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>توجيهات جاهزة ({READY_VOICE_CUES.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RACHID MASTER VOICE PROFILE CARD (البصمة الصوتية الرسمية للمشرف رشيد)        */}
      {/* ========================================================================= */}
      <div className="mt-5 bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 border border-emerald-600/50 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-stone-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                🎙️
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                البصمة الصوتية الرسمية للمشرف رشيد (Rachid Master Voice Profile)
              </h3>
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                نفس النبرة المسجلة للمشرف رشيد (مطابقة 100%)
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
              تمت معايرة واعتماد <strong className="text-white">نفس النبرة الصوتية المسجلة للأستاذ رشيد</strong> (مشرف التربية بثانوية ابن الهيثم التقنية – محمد بلوزداد). صوت بشري وقور، قرار باريتوني رصين، ونطق فصيح بالوقف السليم بدون أي نبرة روبوتية مصطنعة.
            </p>

            <div className="flex items-center gap-3 text-[11px] text-emerald-200/90 font-mono flex-wrap pt-1">
              <span>⏱️ مدة التسجيل المعتمد: <strong>{formatTime(masterRecording?.duration || 4.5)}</strong></span>
              <span>•</span>
              <span>🏷️ النمط: <strong className="text-emerald-400">صوت المشرف رشيد الحقيقي</strong></span>
              <span>•</span>
              <span>📍 المؤسسة: <strong>ثانوية ابن الهيثم التقنية (الجزائر)</strong></span>
            </div>
          </div>

          {/* Action Buttons for Master Voice */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0">
            {/* Play/Stop Master Voice Button */}
            <button
              id="btn-play-master-rachid-voice"
              onClick={handlePlayMasterVoice}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                isPlayingMasterVoice
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isPlayingMasterVoice ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>⏹️ إيقاف استماع النبرة المسجلة</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>▶️ استماع لنبرة المشرف رشيد المسجلة</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              {/* Upload human voice recording */}
              <input
                type="file"
                ref={masterFileInputRef}
                onChange={handleImportMasterFile}
                accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
                className="hidden"
              />
              <button
                id="btn-upload-rachid-master"
                onClick={() => masterFileInputRef.current?.click()}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-700 transition-colors"
                title="رفع ملف تسجيل صوتي حقيقي للمشرف رشيد بصيغة WAV أو MP3"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>رفع تسجيل حقيقي</span>
              </button>

              {/* Sync and Apply to all scenes */}
              <button
                id="btn-apply-master-to-all"
                onClick={handleApplyMasterToAllScenes}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-700 transition-colors"
                title="تعميم هذه النبرة المسجلة على كافة مشاهد الستوري بورد الـ 55"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>تعميم على الـ 55 مشهداً</span>
              </button>
            </div>

            {/* Instant System Synchronization */}
            <button
              id="btn-sync-system-master-tone"
              onClick={handleSyncToMasterTone}
              className="w-full px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-emerald-700/60 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>تثبيت النبرة في كامل الوايت بورد والنظام</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mt-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 bg-red-50 border border-red-300 text-red-900 rounded-xl p-3 flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: RECORDING STUDIO WITH MEDIARECORDER & PAUSE/RESUME & DUAL EXPORT   */}
      {/* ========================================================================= */}
      {activeStudioTab === 'recorder' && (
        <div className="mt-5 space-y-5 animate-in fade-in duration-150">
          {/* Scene and Teleprompter Selector */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-extrabold text-amber-950">نص شاشة التلقين (Teleprompter Script):</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleApplyAlgerianOratory}
                  className="text-xs font-bold text-emerald-950 bg-emerald-200/90 hover:bg-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-400 flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="تطبيق قواعد الإلقاء الجزائري الفصيح (الوقف بالسكون المحكم والترتيل الإذاعي)"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-800" />
                  <span>🇩🇿 تحويل للإلقاء الجزائري الفصيح</span>
                </button>

                <button
                  onClick={handleCalibrateScript}
                  className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-lg border border-amber-400 flex items-center gap-1 transition-colors shadow-2xs"
                  title="تطبيق التشكيل اللغوي والوقفات لضبط النبرة"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-800" />
                  <span>تشكيل وتقويم النص تلقائياً</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-500">المشهد:</span>
                  <select
                    id="voice-manager-scene-select"
                    value={selectedSceneId}
                    onChange={(e) => setSelectedSceneId(e.target.value)}
                    disabled={recordingStatus === 'recording' || recordingStatus === 'paused'}
                    className="text-xs font-bold bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-stone-800"
                  >
                    <option value={MASTER_RACHID_VOICE_ID} className="font-black text-emerald-900 bg-emerald-100">
                      🎙️ البصمة الصوتية الرسمية للمشرف رشيد (التسجيل الرئيسي المعتمد)
                    </option>
                    {currentTrack.scenes.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        مشهد {sc.sceneNumber}: {sc.title} ({sc.minDuration}-{sc.maxDuration}ث)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <textarea
              value={customScript}
              onChange={(e) => setCustomScript(e.target.value)}
              disabled={recordingStatus === 'recording' || recordingStatus === 'paused'}
              rows={3}
              className="w-full bg-white border border-amber-200 rounded-xl p-3 text-stone-900 leading-relaxed font-bold text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-inner resize-none"
              placeholder="اكتب أو عدّل النص الذي ستقرؤه أثناء التسجيل..."
            />

            {/* Algerian Oratory Guidance Banner */}
            <div className="mt-2 bg-emerald-100/70 border border-emerald-300/80 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <span className="text-base">🇩🇿</span>
                <span className="font-bold">
                  سر النبرة الجزائرية الفصيحة: قف بالسكون المحكم على أواخر الجمل والفواصل («فِي ثَانَوِيَّةِ ابْنِ الهَيْثَمْ»)، وحقق مخرج القاف الفصيحة، واقرأ بتريث وقور.
                </span>
              </div>
              <button
                onClick={() => handleAuditionAlgerianSample()}
                className="text-[11px] font-black text-emerald-900 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
              >
                <Volume1 className="w-3 h-3 text-emerald-700" />
                <span>استماع لنموذج النبرة</span>
              </button>
            </div>

            {/* Pacing Gauge Strip */}
            <div className="flex items-center justify-between text-[11px] text-amber-900 font-mono mt-1.5 px-1 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold">{wordCount} كلمة</span>
                <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-sans font-bold border border-amber-300">
                  مؤشر الإيقاع: {estimatedWpm} كلمة/دقيقة {estimatedWpm >= 110 && estimatedWpm <= 130 ? '✨ (إيقاع مثالي للوايت بورد)' : ''}
                </span>
              </div>
              <span className="text-stone-500 font-sans">
                💡 اقرأ بنبرة أبويّة هادئة مع وقفة خفيفة عند الفواصل ليتزامن صوتك مع رسم اليد.
              </span>
            </div>
          </div>

          {/* Central Recording Console */}
          <div className="bg-stone-900 rounded-2xl p-5 text-white shadow-lg border border-stone-800 flex flex-col gap-4">
            {/* Visualizer Canvas & Acoustic Filter Status */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={60}
                className="w-full h-14 rounded-xl bg-stone-950/80 border border-stone-800"
              />

              {recordingStatus === 'paused' && (
                <div className="absolute inset-0 bg-stone-950/80 rounded-xl flex items-center justify-center gap-2 text-amber-400 font-bold text-xs">
                  <Pause className="w-4 h-4" />
                  <span>التسجيل متوقف مؤقتاً... اضغط استئناف لمتابعة القراءة</span>
                </div>
              )}
            </div>

            {/* Status & Live Timer Strip */}
            <div className="flex items-center justify-between px-1 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {recordingStatus === 'recording' && (
                  <span className="flex items-center gap-1.5 text-red-400 font-black bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-700 animate-pulse">
                    <Radio className="w-3.5 h-3.5 text-red-500" />
                    جارٍ التسجيل المباشر من المايكروفون...
                  </span>
                )}
                {recordingStatus === 'paused' && (
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-700">
                    <Pause className="w-3.5 h-3.5" />
                    متوقف مؤقتاً (Paused)
                  </span>
                )}
                {recordingStatus === 'idle' && (
                  <span className="text-stone-400 font-medium flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    الميكروفون جاهز لبدء التسجيل
                  </span>
                )}
                {recordingStatus === 'stopped' && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    اكتمل التسجيل بنجاح! جاهز للتنزيل والمعاينة
                  </span>
                )}

                {/* Studio Filter Toggle */}
                <button
                  onClick={() => setIsStudioFilterActive(!isStudioFilterActive)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border transition-colors ${
                    isStudioFilterActive
                      ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                  title="فلترة الترددات المنخفضة وتعزيز حضور الصوت الإذاعي"
                >
                  {isStudioFilterActive ? '✓ استوديو EQ نشط (80Hz Cut + Presence)' : 'استوديو EQ خام'}
                </button>
              </div>

              {/* Time Display */}
              <div className="font-mono text-base font-black bg-stone-800 px-3.5 py-1 rounded-lg border border-stone-700 text-amber-400">
                {recordingStatus === 'recording' || recordingStatus === 'paused'
                  ? formatTime(elapsedSeconds)
                  : recordingStatus === 'stopped'
                  ? `${formatTime(playbackTime)} / ${formatTime(previewDuration || elapsedSeconds)}`
                  : '00:00.0'}
              </div>
            </div>

            {/* Recording Action Buttons */}
            <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                {recordingStatus === 'idle' && (
                  <button
                    id="voice-manager-btn-start"
                    onClick={handleStartRecording}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Mic className="w-4 h-4" />
                    <span>بدء التسجيل (Record)</span>
                  </button>
                )}

                {recordingStatus === 'recording' && (
                  <button
                    id="voice-manager-btn-pause"
                    onClick={handlePauseRecording}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    <span>إيقاف مؤقت (Pause)</span>
                  </button>
                )}

                {recordingStatus === 'paused' && (
                  <button
                    id="voice-manager-btn-resume"
                    onClick={handleResumeRecording}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-colors animate-pulse"
                  >
                    <Play className="w-4 h-4" />
                    <span>استئناف التسجيل (Resume)</span>
                  </button>
                )}

                {(recordingStatus === 'recording' || recordingStatus === 'paused') && (
                  <button
                    id="voice-manager-btn-stop"
                    onClick={handleStopRecording}
                    className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-red-400 hover:text-red-300 font-extrabold text-sm flex items-center gap-2 border border-stone-700 shadow-sm transition-colors"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>إنهاء وحفظ (Stop)</span>
                  </button>
                )}

                {recordingStatus === 'stopped' && (
                  <button
                    id="voice-manager-btn-rerecord"
                    onClick={handleStartRecording}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 border border-stone-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>تسجيل مقطع جديد (Take جديد)</span>
                  </button>
                )}
              </div>

              {/* Upload fallback button */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setRecordedBlob(file);
                      setPreviewUrl(URL.createObjectURL(file));
                      setRecordingStatus('stopped');
                      setSuccessMessage('تم استيراد الملف الصوتي بنجاح!');
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-stone-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>رفع ملف صوتي</span>
                </button>
              </div>
            </div>

            {/* Audio Preview Controls (When stopped) */}
            {recordingStatus === 'stopped' && previewUrl && (
              <div className="bg-stone-950/90 rounded-xl p-3.5 border border-stone-800 flex flex-col gap-2.5 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-stone-400 w-12 text-center">
                    {formatTime(playbackTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={previewDuration || 1}
                    step={0.1}
                    value={playbackTime}
                    onChange={handleSeek}
                    className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-stone-400 w-12 text-center">
                    {formatTime(previewDuration)}
                  </span>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      id="voice-manager-preview-play"
                      onClick={handleTogglePlay}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>إيقاف مؤقت</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>استماع للمقطع</span>
                        </>
                      )}
                    </button>

                    {selectedScene && selectedSceneId !== MASTER_RACHID_VOICE_ID && (
                      <button
                        onClick={handleSaveToActiveScene}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>اعتماد في الوايت بورد للمشهد {selectedScene.sceneNumber}</span>
                      </button>
                    )}

                    {selectedSceneId === MASTER_RACHID_VOICE_ID && (
                      <button
                        onClick={handleSaveToActiveScene}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4 text-stone-950" />
                        <span>حفظ كبصمة رئيسية للمشرف رشيد</span>
                      </button>
                    )}

                    <button
                      id="btn-set-master-from-recording"
                      onClick={handleSetCurrentRecordingAsMaster}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 border border-emerald-500/70 hover:bg-stone-800 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="اعتماد هذا المقطع كبصمة صوتية رئيسية للمشرف رشيد لكافة المشاهد"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تعيين كبصمة رئيسية للمشرف رشيد</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={handleToggleMute} className="text-stone-400 hover:text-white">
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-stone-300" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 accent-amber-500 h-1 bg-stone-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export Box (.WAV & .WEBM) */}
          {recordingStatus === 'stopped' && recordedBlob && (
            <div className="bg-gradient-to-r from-stone-50 via-amber-50/40 to-stone-50 rounded-2xl p-5 border border-amber-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FolderDown className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-extrabold text-stone-900">
                    تنزيل الملف الصوتي لمشروع VideoScribe الخاص بك
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-stone-500">
                  الحجم: {(recordedBlob.size / 1024).toFixed(1)} كيلوبايت
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-600 shrink-0">اسم الملف:</span>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="text-xs font-mono font-bold bg-white border border-stone-300 rounded-lg px-3 py-1.5 flex-1 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  id="voice-manager-btn-download-wav"
                  onClick={handleDownloadWav}
                  disabled={isConvertingToWav}
                  className="p-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-between shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-5 h-5 text-emerald-200" />
                    <div className="text-right">
                      <div className="text-sm font-black flex items-center gap-1.5">
                        <span>تنزيل بصيغة WAV (.wav)</span>
                        <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                          موصى به
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-200 font-normal">
                        16-bit PCM • متوافق 100% مع تطبيق VideoScribe
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-emerald-900/60 px-2 py-1 rounded border border-emerald-600">
                    {isConvertingToWav ? 'جارٍ التحويل...' : '.WAV'}
                  </span>
                </button>

                <button
                  id="voice-manager-btn-download-webm"
                  onClick={handleDownloadWebm}
                  className="p-3.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-extrabold text-xs flex items-center justify-between shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-5 h-5 text-amber-300" />
                    <div className="text-right">
                      <div className="text-sm font-black">تنزيل بصيغة WebM (.webm)</div>
                      <div className="text-[11px] text-stone-300 font-normal">
                        ترميز Opus عالي الضغط والجودة للمتصفحات
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-stone-950 px-2 py-1 rounded border border-stone-700 text-amber-300">
                    .WEBM
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TONE CALIBRATION, VOCAL ARCHETYPES, AND QUALITY DIAGNOSTIC SCORECARD */}
      {/* ========================================================================= */}
      {activeStudioTab === 'tone' && (
        <div className="mt-5 space-y-6 animate-in fade-in duration-150">
          {/* Rachid Voice Match Master Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 border border-emerald-600/70 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/90 text-stone-950 font-black text-xl flex items-center justify-center shrink-0">
                🇩🇿
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-black text-white">
                    نبرة المشرف رشيد المسجلة (المطابقة الصوتية 100%)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950">
                    صوت بشري أصيل
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  تم ضبط المعايرة لتمثيل صوت المشرف رشيد (قرار باريتوني 130Hz، سرعة 0.85x، ووقف بالسكون الفصيح)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-tab2-play-rachid-master"
                onClick={handlePlayMasterVoice}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                {isPlayingMasterVoice ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>إيقاف الاستماع</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>تشغيل نبرة المشرف رشيد</span>
                  </>
                )}
              </button>

              <button
                id="btn-tab2-sync-rachid-master"
                onClick={handleSyncToMasterTone}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 border border-stone-600 transition-colors"
                title="تثبيت نبرة المشرف رشيد في كامل شاشات النظام"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>مزامنة وتثبيت النبرة</span>
              </button>
            </div>
          </div>

          {/* Tone Archetype Selection */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-sm sm:text-base text-stone-900">
                  1. تقويم وتحديد النبرة الصوتية (Vocal Archetype)
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-bold">
                اضبط الطابع الصوتي المناسب لمشاهد الفيديو التعليمي
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {(Object.keys(TONE_PRESETS) as ToneArchetype[]).map((key) => {
                const preset = TONE_PRESETS[key];
                const isSelected = selectedToneArchetype === key;

                return (
                  <div
                    key={key}
                    onClick={() => {
                      setSelectedToneArchetype(key);
                      setCustomRate(preset.rate);
                      setCustomPitch(preset.pitch);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-300/70'
                        : 'bg-white border-stone-200 hover:border-amber-300 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {preset.badge}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-amber-600' : 'border-stone-300'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-amber-600" />}
                        </div>
                      </div>

                      <h4 className="font-black text-sm text-stone-900 mb-1.5">{preset.name}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed">{preset.description}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400">الدفء الصوتي:</span>
                        <span className="font-bold text-stone-800 text-[10px]">{preset.vocalAcoustics.warmth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">الإيقاع:</span>
                        <span className="font-bold text-stone-800 text-[10px]">{preset.vocalAcoustics.cadence}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sliders & Audition Bar */}
            <div className="mt-5 pt-4 border-t border-stone-200 bg-white rounded-xl p-4 border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-wrap flex-1">
                {/* Rate Slider */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-600">سرعة الإلقاء (Rate):</span>
                    <span className="font-mono text-amber-700">{customRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.75}
                    max={1.15}
                    step={0.02}
                    value={customRate}
                    onChange={(e) => setCustomRate(parseFloat(e.target.value))}
                    className="accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Pitch Slider */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-600">عمق وطبقة الصوت (Pitch):</span>
                    <span className="font-mono text-amber-700">{customPitch.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={1.15}
                    step={0.02}
                    value={customPitch}
                    onChange={(e) => setCustomPitch(parseFloat(e.target.value))}
                    className="accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Audition Button */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-audition-tone"
                  onClick={handleAuditionTone}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all ${
                    isAuditioning
                      ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {isAuditioning ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>إيقاف المعاينة</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>تجربة ومعاينة النبرة الآن</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ALGERIAN CLASSICAL ORATORY LAB (مختبر الإلقاء الجزائري الفصيح)              */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/60 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-800/70 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    🇩🇿
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        مختبر الإلقاء الجزائري الفصيح (The Authentic Algerian Oratory Lab)
                      </h3>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-stone-950">
                        معايرة إذاعية وتربوية دقيقة
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/80 mt-0.5">
                      تقويم الصوت ليطابق نبرة رجل جزائري فصيح ومربي رصين في ثانوية تقنية (قرار باريتوني + سكون محكم عند الفواصل).
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleApplyAlgerianOratory}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] shrink-0"
                >
                  <Wand2 className="w-3.5 h-3.5 text-stone-950" />
                  <span>تطبيق قواعد الإلقاء الجزائري على النص الحالي</span>
                </button>
              </div>

              {/* 5 Linguistic Pillars Cards */}
              <div>
                <h4 className="text-xs font-black text-emerald-300 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>الأسس الصوتية واللغوية الـ 5 لإلقاء المربي الجزائري الفصيح:</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                  {ALGERIAN_ORATORY_RULES.map((rule, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-900/80 border border-emerald-700/40 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 backdrop-blur-xs hover:border-emerald-500/60 transition-colors"
                    >
                      <div>
                        <div className="text-[10px] font-black text-emerald-400 font-mono mb-1">
                          الركيزة #{idx + 1}
                        </div>
                        <h5 className="font-extrabold text-white text-xs mb-1.5">{rule.title}</h5>
                        <p className="text-stone-300 leading-relaxed text-[11px]">{rule.rule}</p>
                      </div>

                      <div className="bg-stone-950/70 rounded-lg p-2 border border-emerald-900/60 text-[10px]">
                        <span className="text-emerald-400 font-bold block mb-0.5">مثال صوتي:</span>
                        <div className="text-stone-200 font-bold font-mono">{rule.example}</div>
                        <div className="text-stone-400 mt-1 text-[9px]">{rule.impactOnVoice}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Audio Demos from ابن الهيثم */}
              <div className="pt-2 border-t border-emerald-900/80">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h4 className="text-xs font-black text-emerald-300 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>نماذج صوتية حية لنبرة المشرف رشيد بثانوية ابن الهيثم (استمع واختبر):</span>
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    انقر للاستماع فوراً أو نسخ النموذج لشاشة التلقين
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Sample 1: Opening Greeting */}
                  <div className="bg-stone-900/90 border border-emerald-800/60 rounded-2xl p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          الافتتاحية والترحيب
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">100 كلمة/دقيقة</span>
                      </div>
                      <p className="text-xs text-stone-100 font-bold leading-relaxed mt-2" dir="rtl">
                        «بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمْ. أَبْنَائِي وَبَنَاتِي التَّلَامِيذْ، أَهْلاً بِكُمْ فِي ثَانَوِيَّةِ ابْنِ الهَيْثَمِ التِّقْنِيَّةْ بِبَلْوِزْدَادْ. مَعَكُمْ مُشْرِفُ التَّرْبِيَةْ رَشِيدْ.»
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                      <button
                        onClick={() =>
                          handleAuditionAlgerianSample(
                            'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمْ... أَبْنَائِي وَبَنَاتِي التَّلَامِيذْ... أَهْلاً بِكُمْ فِي ثَانَوِيَّةِ ابْنِ الهَيْثَمِ التِّقْنِيَّةْ بِبَلْوِزْدَادْ... مَعَكُمْ مُشْرِفُ التَّرْبِيَةْ رَشِيدْ.'
                          )
                        }
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>استماع للنبرة</span>
                      </button>
                      <button
                        onClick={() => {
                          setCustomScript(
                            'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمْ. أَبْنَائِي وَبَنَاتِي التَّلَامِيذْ، أَهْلاً بِكُمْ فِي ثَانَوِيَّةِ ابْنِ الهَيْثَمِ التِّقْنِيَّةْ بِبَلْوِزْدَادْ. مَعَكُمْ مُشْرِفُ التَّرْبِيَةْ رَشِيدْ.'
                          );
                          setActiveStudioTab('recorder');
                          setSuccessMessage('تم نقل النموذج الافتتاحي إلى شاشة التلقين!');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center gap-1 transition-colors"
                        title="نسخ لشاشة التلقين"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>للتلقين</span>
                      </button>
                    </div>
                  </div>

                  {/* Sample 2: Strict Regulation */}
                  <div className="bg-stone-900/90 border border-emerald-800/60 rounded-2xl p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          بند تنظيمي صريح (الهاتف)
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">حزم إداري وقور</span>
                      </div>
                      <p className="text-xs text-stone-100 font-bold leading-relaxed mt-2" dir="rtl">
                        «يُمْنَعُ مَنْعاً بَاتّاً تَشْغِيلُ الهَاتِفِ النَّقَّالِ دَاخِلَ القَاعَاتِ وَالمُخْتَبَرَاتْ، وَيُوضَعُ فِي حَقِيبَةِ التِّلْمِيذْ... حِفَاظاً عَلَى حُرْمَةِ التَّعْلِيمْ وَتَرْكِيزِ الجَمِيعْ.»
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                      <button
                        onClick={() =>
                          handleAuditionAlgerianSample(
                            'يُمْنَعُ مَنْعاً بَاتّاً تَشْغِيلُ الهَاتِفِ النَّقَّالِ دَاخِلَ القَاعَاتِ وَالمُخْتَبَرَاتْ... وَيُوضَعُ فِي حَقِيبَةِ التِّلْمِيذْ... حِفَاظاً عَلَى حُرْمَةِ التَّعْلِيمْ وَتَرْكِيزِ الجَمِيعْ.'
                          )
                        }
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>استماع للنبرة</span>
                      </button>
                      <button
                        onClick={() => {
                          setCustomScript(
                            'يُمْنَعُ مَنْعاً بَاتّاً تَشْغِيلُ الهَاتِفِ النَّقَّالِ دَاخِلَ القَاعَاتِ وَالمُخْتَبَرَاتْ، وَيُوضَعُ فِي حَقِيبَةِ التِّلْمِيذْ... حِفَاظاً عَلَى حُرْمَةِ التَّعْلِيمْ وَتَرْكِيزِ الجَمِيعْ.'
                          );
                          setActiveStudioTab('recorder');
                          setSuccessMessage('تم نقل بند الهاتف إلى شاشة التلقين!');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center gap-1 transition-colors"
                        title="نسخ لشاشة التلقين"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>للتلقين</span>
                      </button>
                    </div>
                  </div>

                  {/* Sample 3: Paternal Encouragement */}
                  <div className="bg-stone-900/90 border border-emerald-800/60 rounded-2xl p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                          توجيه أبوي وبكالوريا
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">دفء ومسؤولية</span>
                      </div>
                      <p className="text-xs text-stone-100 font-bold leading-relaxed mt-2" dir="rtl">
                        «النَّجَاحُ فِي البَكَالُورْيَا لَيْسَ صُدْفَةْ، بَلْ يَصْنَعُهُ الانْضِبَاطُ اليَوْمِيُّ وَاحْتِرَامُ الأَسَاتِذَةْ. أَنْتُمْ أَمَلُ هَذِهِ الثَّانَوِيَّةِ، وَنَحْنُ هُنَا لِمُرَافَقَتِكُمْ نَحْوَ التَّفَوُّقْ.»
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                      <button
                        onClick={() =>
                          handleAuditionAlgerianSample(
                            'النَّجَاحُ فِي البَكَالُورْيَا لَيْسَ صُدْفَةْ... بَلْ يَصْنَعُهُ الانْضِبَاطُ اليَوْمِيُّ وَاحْتِرَامُ الأَسَاتِذَةْ... أَنْتُمْ أَمَلُ هَذِهِ الثَّانَوِيَّةِ... وَنَحْنُ هُنَا لِمُرَافَقَتِكُمْ نَحْوَ التَّفَوُّقْ.'
                          )
                        }
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>استماع للنبرة</span>
                      </button>
                      <button
                        onClick={() => {
                          setCustomScript(
                            'النَّجَاحُ فِي البَكَالُورْيَا لَيْسَ صُدْفَةْ، بَلْ يَصْنَعُهُ الانْضِبَاطُ اليَوْمِيُّ وَاحْتِرَامُ الأَسَاتِذَةْ. أَنْتُمْ أَمَلُ هَذِهِ الثَّانَوِيَّةِ، وَنَحْنُ هُنَا لِمُرَافَقَتِكُمْ نَحْوَ التَّفَوُّقْ.'
                          );
                          setActiveStudioTab('recorder');
                          setSuccessMessage('تم نقل توجيه البكالوريا إلى شاشة التلقين!');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs flex items-center gap-1 transition-colors"
                        title="نسخ لشاشة التلقين"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>للتلقين</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Evaluation Scorecard */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-sm sm:text-base text-stone-900">
                  2. بطاقة التقييم الصوتي للنص الحالي (Tone Quality Scorecard)
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-bold">
                تقييم فوري لمستوى الواقعية والاتزان التربوي
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {evaluationMetrics.map((metric, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-700">{metric.title}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          metric.status === 'ممتاز'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : metric.status === 'جيد جداً'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {metric.status}
                      </span>
                    </div>

                    <div className="w-full bg-stone-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          metric.score >= 90
                            ? 'bg-emerald-600'
                            : metric.score >= 80
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-medium">
                      {metric.feedback}
                    </p>
                  </div>

                  <span className="font-mono text-[11px] font-bold text-stone-400">
                    النتيجة: {metric.score} / 100
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Calibration Action */}
            <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-stone-600 font-medium">
                💡 هل تريد ضبط النص الحالي بالتشكيل الإعرابي التام والوقفات التنفسية بضغطة واحدة؟
              </span>
              <button
                onClick={handleCalibrateScript}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>تطبيق التشكيل والوقفات الآن</span>
              </button>
            </div>
          </div>

          {/* Golden Rules of Professional Educational Delivery */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-950 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-700" />
              <strong className="text-sm font-black text-emerald-900">
                قواعد الإلقاء الصوتي الاحترافي لمشرف ثانوية ابن الهيثم:
              </strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700 font-medium">
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/60">
                <strong className="text-emerald-900 block mb-1">1. التريث عند الفواصل والنقاط:</strong>
                اجعل وقفة صامتة تتراوح بين نصف ثانية إلى ثانية كاملة عند نهاية كل جملة، لتسمح ليد الرسام برسم العنصر في السبورة.
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/60">
                <strong className="text-emerald-900 block mb-1">2. تجنب تسكين أواخر الكلمات الجوهرية:</strong>
                احرص على رفع الفاعل ونصب المفعول به في بنود القانون لتبدو كأستاذ متمكن وفصيح لا كلغة آلية ركيكة.
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/60">
                <strong className="text-emerald-900 block mb-1">3. نبرة أبوية ناصحة لا بوليسية:</strong>
                توجيه "يُمنع الهاتف النقال" يجب أن يُلقى بنبرة المربي الحريص على تركيز ابنه وليس بلهجة التهديد الجاف.
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/60">
                <strong className="text-emerald-900 block mb-1">4. التصدير الصوتي المباشر لـ VideoScribe:</strong>
                احفظ المقاطع بصيغة WAV 16-bit PCM التي يوفرها استوديو الصوت لضمان بقاء الصوت نقياً وبدون ضغط متكرر في الفيديو النهائي.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SOUND EFFECTS LIBRARY (TRANSITIONS, BELLS, CHIMES, WHITEBOARD)     */}
      {/* ========================================================================= */}
      {activeStudioTab === 'sfx' && (
        <div className="mt-5 space-y-5 animate-in fade-in duration-150">
          {/* Filter and Search Bar */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-stone-500 ml-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>التصنيف:</span>
              </span>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'transition', label: 'انتقالات حركية' },
                { id: 'alert', label: 'تنبيهات وأجراس' },
                { id: 'feedback', label: 'تفاعل وإشادة' },
                { id: 'whiteboard', label: 'رسم الوايت بورد' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSfxCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sfxCategoryFilter === cat.id
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={sfxSearchQuery}
                onChange={(e) => setSfxSearchQuery(e.target.value)}
                placeholder="ابحث عن مؤثر صوتي..."
                className="w-full text-xs font-medium bg-white border border-stone-300 rounded-xl pr-9 pl-3 py-2 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Sound Effects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSoundEffects.map((effect) => {
              const isPlayingThis = playingEffectId === effect.id;

              return (
                <div
                  key={effect.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isPlayingThis
                      ? 'bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-300/60'
                      : 'bg-white border-stone-200 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Header: Icon, Name, Category Pill */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isPlayingThis
                              ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          {getEffectIcon(effect.iconName)}
                        </div>
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-stone-900 leading-tight">
                            {effect.name}
                          </h4>
                          <span className="text-[10px] text-stone-500 font-bold">
                            {effect.categoryLabel}
                          </span>
                        </div>
                      </div>

                      <span className="bg-stone-100 border border-stone-200 text-stone-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {effect.durationSeconds} ثانية
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-600 leading-relaxed mb-2.5">
                      {effect.description}
                    </p>

                    {/* Suggested Use */}
                    <div className="bg-stone-50 rounded-lg p-2 text-[11px] text-stone-700 border border-stone-100 flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>الموضع المقترح:</strong> {effect.suggestedUse}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: Play Preview & Download WAV */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handlePlaySoundEffect(effect)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
                        isPlayingThis
                          ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      {isPlayingThis ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>إيقاف الصوت</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>استماع فوري</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownloadSfxWav(effect)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="تنزيل كملف WAV متوافق مع VideoScribe"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>تنزيل (.wav)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VideoScribe Import Instructions Note */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-black text-emerald-900 block mb-1">
                كيفية تركيب المؤثرات الصوتية والانتقالية في فيديو الوايت بورد:
              </strong>
              <span>
                • كل ملف يتم تنزيله من هذه المكتبة هو ملف <strong>16-bit PCM WAV</strong> نقي وخالٍ من التشويش.<br />
                • يمكنك إضافة ملفات WAV مباشرة كمسارات صوتية ثانوية في برامج المونتاج المرافقة لـ VideoScribe (مثل Camtasia أو Premiere أو حتى داخل طبقة صوت VideoScribe) لتنسجم نغمة جرس المدرسة أو صوت سحب الكاميرا بدقة ثانية بثانية مع ظهور المواد القانونية.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: READY-MADE EDUCATIONAL VOICE CUES & SUPERVISOR ANNOUNCEMENTS      */}
      {/* ========================================================================= */}
      {activeStudioTab === 'cues' && (
        <div className="mt-5 space-y-4 animate-in fade-in duration-150">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-700 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm">
                توجيهات وتعليقات مدرسية جاهزة بصوت المشرف رشيد
              </h3>
              <p className="text-stone-500 mt-0.5">
                عبارات نظامية وتربوية رسمية مسجلة ومجهزة يمكنك الاستماع إليها، استخدامها كمسودة لقراءتك، أو إدراجها في مشروع الفيديو.
              </p>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-amber-300">
              ثانوية ابن الهيثم التقنية
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {READY_VOICE_CUES.map((cue) => {
              const isSpeakingThis = speakingCueId === cue.id;
              const isCopied = copiedCueId === cue.id;

              return (
                <div
                  key={cue.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSpeakingThis
                      ? 'bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-300/60'
                      : 'bg-white border-stone-200 hover:border-amber-300 shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <h4 className="font-black text-sm text-stone-900">{cue.title}</h4>
                      </div>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        {cue.categoryLabel}
                      </span>
                    </div>

                    {/* Text Box */}
                    <p className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs sm:text-sm text-stone-900 font-bold leading-relaxed shadow-inner">
                      "{cue.text}"
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-stone-500 font-mono">
                      <span>المتحدث: {cue.speaker}</span>
                      <span>المدة التقديرية: ~{cue.durationSeconds} ثوانٍ</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => handlePlayVoiceCue(cue)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
                        isSpeakingThis
                          ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      {isSpeakingThis ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>إيقاف الصوت</span>
                        </>
                      ) : (
                        <>
                          <Volume1 className="w-3.5 h-3.5" />
                          <span>استماع بالنبرة التربوية</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyCueText(cue)}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs flex items-center gap-1"
                        title="نسخ النص للحافظة"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-500" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleUseCueInRecorder(cue)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1"
                        title="استخدام هذا النص في استوديو التسجيل بصوتك"
                      >
                        <Mic className="w-3.5 h-3.5 text-amber-700" />
                        <span>سجّل هذا التوجيه بصوتك</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
