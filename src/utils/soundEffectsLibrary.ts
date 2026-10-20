// High-Fidelity Web Audio Sound Effects Synthesizer for VideoScribe Whiteboard Projects
import { encodeAudioBufferToWav } from './wavEncoder';

export interface SoundEffectItem {
  id: string;
  name: string;
  category: 'transition' | 'alert' | 'feedback' | 'whiteboard' | 'ambience';
  categoryLabel: string;
  description: string;
  durationSeconds: number;
  iconName: string;
  suggestedUse: string;
}

export interface ReadyVoiceCueItem {
  id: string;
  title: string;
  category: 'rules' | 'encouragement' | 'warning' | 'intro';
  categoryLabel: string;
  text: string;
  durationSeconds: number;
  speaker: string;
}

// 1. SOUND EFFECTS CATALOG
export const SOUND_EFFECTS_CATALOG: SoundEffectItem[] = [
  {
    id: 'swoosh_transition',
    name: 'سحب انتقالي سريع (Whoosh Transition)',
    category: 'transition',
    categoryLabel: 'انتقال حركي',
    description: 'صوت حركة هوائية سريعة وناعمة يناسب انتقال الكاميرا أو مسح السبورة بين مشهدين.',
    durationSeconds: 0.6,
    iconName: 'Wind',
    suggestedUse: 'عند انتقال الكاميرا أو الانتقال لمادة قانونية جديدة'
  },
  {
    id: 'school_bell',
    name: 'رنين جرس المؤسسة (School Bell)',
    category: 'alert',
    categoryLabel: 'تنبيه مدرسي',
    description: 'رنين جرس الثنائية الترددية للمؤسسة التعليمية يعطي طابعاً واقعياً لبداية الميثاق أو الحصص.',
    durationSeconds: 2.2,
    iconName: 'Bell',
    suggestedUse: 'المشهد الافتتاحي، مشهد الدخول، والمواعيد الرسمية'
  },
  {
    id: 'chime_attention',
    name: 'نغمة انتباه ذكية (Attention Chime)',
    category: 'alert',
    categoryLabel: 'تنبيه راقٍ',
    description: 'نغمة كروية زجاجية هادئة وجذابة لشد انتباه التلميذ عند ظهور معلومة جوهرية.',
    durationSeconds: 1.1,
    iconName: 'Sparkles',
    suggestedUse: 'عند ظهور رقم المادة أو التنبيه لأمر مهم في القانون الداخلي'
  },
  {
    id: 'page_flip',
    name: 'تقليب ورقة الميثاق (Paper Flip)',
    category: 'transition',
    categoryLabel: 'حركة ورقية',
    description: 'صوت خشخشة واحتكاك ورقة دفتر الملاحظات أو ميثاق التلميذ أثناء تصفحه.',
    durationSeconds: 0.5,
    iconName: 'FileText',
    suggestedUse: 'عند استعراض مواد النظام أو توقيع التعهد المدرسي'
  },
  {
    id: 'marker_stroke',
    name: 'حكة قلم السبورة (Marker Scratch)',
    category: 'whiteboard',
    categoryLabel: 'رسم وايت بورد',
    description: 'صوت احتكاك قلم اللباد بالسبورة البيضاء يعزز واقعية حركة يد الرسام في VideoScribe.',
    durationSeconds: 1.4,
    iconName: 'PenTool',
    suggestedUse: 'تحت مشاهد رسم الرسوم التوضيحية أو التسطير تحت الكلمات'
  },
  {
    id: 'success_chime',
    name: 'نغمة إنجاز ومكافأة (Success Chime)',
    category: 'feedback',
    categoryLabel: 'إشادة وتحفيز',
    description: 'نغمات متصاعدة إيجابية تناسب السلوكيات الإيجابية، التفوق، وتكريم التلاميذ النجباء.',
    durationSeconds: 1.3,
    iconName: 'CheckCircle2',
    suggestedUse: 'مشاهد المكافآت، المواظبة، والنتائج الإيجابية'
  },
  {
    id: 'warning_buzzer',
    name: 'تنبيه تحذيري هادئ (Warning Tone)',
    category: 'feedback',
    categoryLabel: 'تحذير ومنع',
    description: 'تردد ثنائي منخفض وواضح يرمز للممنوعات والسلوكيات غير المقبولة دون إزعاج سمعي.',
    durationSeconds: 0.9,
    iconName: 'AlertTriangle',
    suggestedUse: 'مشاهد منع الهاتف النقال، التأخرات غير المبررة، أو الإتلاف'
  },
  {
    id: 'stamp_approval',
    name: 'ختم المصادقة الرسمي (Official Stamp)',
    category: 'feedback',
    categoryLabel: 'اعتماد رسمي',
    description: 'ضربة ختم قوية وواثقة مع ارتداد ورقي تعبر عن اعتماد الوثائق والتوقيع على التعهد.',
    durationSeconds: 0.7,
    iconName: 'Stamp',
    suggestedUse: 'في نهاية مشهد استمارة التعهد أو القرارات التأديبية والإدارية'
  },
  {
    id: 'camera_shutter',
    name: 'التقاط تركيز الكاميرا (Camera Click)',
    category: 'transition',
    categoryLabel: 'تركيز وتكبير',
    description: 'صوت مصراع ميكانيكي سريع مناسب جداً لحركات زووم VideoScribe على عناصر معينة.',
    durationSeconds: 0.4,
    iconName: 'Camera',
    suggestedUse: 'عند عمل زووم (Zoom In) على رقم المادة القانونية'
  }
];

// 2. READY-MADE EDUCATIONAL VOICE CUES (SUPERVISOR RACHID)
export const READY_VOICE_CUES: ReadyVoiceCueItem[] = [
  {
    id: 'cue_attention_students',
    title: 'تنبيه أبوي للتركيز',
    category: 'intro',
    categoryLabel: 'افتتاحية وتنبيه',
    text: 'انتبهوا جيداً يا أبنائي وبناتي، النظام الداخلي وُضِع لضمان سلامتكم ونجاحكم جميعاً في ثانوية ابن الهيثم.',
    durationSeconds: 5.5,
    speaker: 'المشرف رشيد'
  },
  {
    id: 'cue_phone_prohibition',
    title: 'تذكير بقاعدة الهاتف النقال',
    category: 'warning',
    categoryLabel: 'قاعدة تنظيمية',
    text: 'تذكير هام للجميع: يُمنع منعاً باتاً تشغيل أو استعمال الهاتف النقال والأجهزة الذكية داخل الحرم المدرسي والأقسام.',
    durationSeconds: 6.0,
    speaker: 'المشرف رشيد'
  },
  {
    id: 'cue_blouse_and_uniform',
    title: 'الهندام والمئزر الإلزامي',
    category: 'rules',
    categoryLabel: 'هندام مدرسي',
    text: 'ارتداء المئزر الأبيض الموحد والهندام اللائق واجب يومي يعكس احترامك للمؤسسة وزملائك.',
    durationSeconds: 5.0,
    speaker: 'المشرف رشيد'
  },
  {
    id: 'cue_punctuality_key',
    title: 'المواظبة ومواعيد الدخول',
    category: 'rules',
    categoryLabel: 'انضباط ومواقيت',
    text: 'الانضباط في المواعيد وحضور تحية العلم الوطني هو أول خطوة عملية نحو نيل شهادة البكالوريا بتفوق.',
    durationSeconds: 5.5,
    speaker: 'المشرف رشيد'
  },
  {
    id: 'cue_respect_facilities',
    title: 'المحافظة على التجهيزات التقنية',
    category: 'warning',
    categoryLabel: 'حماية الممتلكات',
    text: 'المخابر والورشات التقنية ملك مشترك لجميع التلاميذ، المحافظة عليها دليل وعيك ومسؤوليتك العالية.',
    durationSeconds: 5.5,
    speaker: 'المشرف رشيد'
  },
  {
    id: 'cue_success_wishes',
    title: 'خاتمة وتشجيع للنجاح',
    category: 'encouragement',
    categoryLabel: 'تشجيع وخاتمة',
    text: 'إدارة وأساتذة ثانوية ابن الهيثم يرافقونكم خطوة بخطوة، نتمنى لكم سنة دراسية مكللة بأعلى المراتب والنجاح.',
    durationSeconds: 6.0,
    speaker: 'المشرف رشيد'
  }
];

// 3. SYNTHESIS ENGINE (Web Audio API buffer generation)
class SoundEffectsSynthesizer {
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Synthesize specific sound effect buffer
  public generateEffectBuffer(effectId: string): AudioBuffer {
    const ctx = this.getAudioContext();
    const sampleRate = ctx.sampleRate;

    switch (effectId) {
      case 'swoosh_transition': {
        const duration = 0.6;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const progress = t / duration;
          // Shaped band-limited noise sweep
          const white = Math.random() * 2 - 1;
          const envelope = Math.sin(progress * Math.PI) ** 2;
          const pitchMod = Math.sin(t * (300 + 700 * progress) * 2 * Math.PI) * 0.3;
          data[i] = (white * 0.4 + pitchMod) * envelope * 0.45;
        }
        return buffer;
      }

      case 'school_bell': {
        const duration = 2.2;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        // Dual harmonic metallic strike with acoustic ringing
        const f1 = 820;
        const f2 = 1240;
        const f3 = 2480;
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const envelope = Math.exp(-t * 2.2);
          const strike = t < 0.05 ? (Math.random() * 2 - 1) * (1 - t / 0.05) * 0.3 : 0;
          const tone =
            Math.sin(2 * Math.PI * f1 * t) * 0.5 +
            Math.sin(2 * Math.PI * f2 * t) * 0.35 +
            Math.sin(2 * Math.PI * f3 * t) * 0.15;
          data[i] = (tone * envelope * 0.4) + strike;
        }
        return buffer;
      }

      case 'chime_attention': {
        const duration = 1.1;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        // Bright glass chime chord (C6, E6, G6)
        const freqs = [1046.5, 1318.5, 1567.98];
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const decay = Math.exp(-t * 3.5);
          let sum = 0;
          freqs.forEach((f, idx) => {
            sum += Math.sin(2 * Math.PI * f * t) * (1 / (idx + 1));
          });
          data[i] = sum * decay * 0.28;
        }
        return buffer;
      }

      case 'page_flip': {
        const duration = 0.5;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const env = Math.sin((t / duration) * Math.PI) ** 1.8;
          const rustle = (Math.random() * 2 - 1) * Math.sin(t * 1200 * Math.PI);
          data[i] = rustle * env * 0.35;
        }
        return buffer;
      }

      case 'marker_stroke': {
        const duration = 1.4;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const white = Math.random() * 2 - 1;
          const friction = Math.sin(i * 0.09) * 0.2;
          const envelope = Math.sin((t / duration) * Math.PI) ** 1.2;
          const current = (lastOut + 0.02 * white + friction) / 1.02;
          lastOut = current;
          data[i] = current * envelope * 0.6;
        }
        return buffer;
      }

      case 'success_chime': {
        const duration = 1.3;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        // Ascending 3-note arpeggio (F5 -> A5 -> C6)
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          let freq = 698.46; // F5
          let noteStart = 0;
          if (t >= 0.3) {
            freq = 1046.5; // C6
            noteStart = 0.3;
          } else if (t >= 0.15) {
            freq = 880.0; // A5
            noteStart = 0.15;
          }
          const noteT = t - noteStart;
          const env = Math.exp(-noteT * 4.0);
          data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.32;
        }
        return buffer;
      }

      case 'warning_buzzer': {
        const duration = 0.9;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        // Dual low dissonant pulse
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          const pulse = Math.sin(t * 18 * Math.PI) > 0 ? 1 : 0.2;
          const tone =
            Math.sin(2 * Math.PI * 220 * t) * 0.6 +
            Math.sin(2 * Math.PI * 233.08 * t) * 0.4; // Minor second tension
          const env = Math.exp(-t * 2.5);
          data[i] = tone * pulse * env * 0.3;
        }
        return buffer;
      }

      case 'stamp_approval': {
        const duration = 0.7;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          // Heavy low punch + surface paper rebound
          const thud = Math.sin(2 * Math.PI * (120 - 70 * t) * t) * Math.exp(-t * 14.0);
          const snap = (Math.random() * 2 - 1) * Math.exp(-t * 28.0) * 0.5;
          data[i] = (thud * 0.7 + snap) * 0.5;
        }
        return buffer;
      }

      case 'camera_shutter': {
        const duration = 0.4;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          // Double mechanical click
          const click1 = t < 0.08 ? (Math.random() * 2 - 1) * Math.exp(-t * 50) : 0;
          const click2 = t > 0.12 && t < 0.2 ? (Math.random() * 2 - 1) * Math.exp(-(t - 0.12) * 50) : 0;
          data[i] = (click1 + click2 * 0.8) * 0.6;
        }
        return buffer;
      }

      default: {
        // Fallback gentle beep
        const duration = 0.5;
        const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          data[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 5) * 0.3;
        }
        return buffer;
      }
    }
  }

  // Play effect in browser
  public playEffect(effectId: string, onEnded?: () => void) {
    this.stopCurrent();
    const ctx = this.getAudioContext();
    const buffer = this.generateEffectBuffer(effectId);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      this.currentSource = null;
      if (onEnded) onEnded();
    };

    source.start(0);
    this.currentSource = source;
  }

  public stopCurrent() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {}
      this.currentSource = null;
    }
  }

  // Generate WAV Blob ready for download
  public createWavBlob(effectId: string): Blob {
    const buffer = this.generateEffectBuffer(effectId);
    return encodeAudioBufferToWav(buffer);
  }
}

export const soundEffectsService = new SoundEffectsSynthesizer();
