// Tone Calibrator & Arabic Phonetic Prosody Preprocessor
// Evaluates and shapes the vocal delivery for Supervisor Rachid and educational whiteboards

export type ToneArchetype = 'algerian_educator' | 'paternal' | 'regulatory' | 'inspirational';

export interface TonePreset {
  id: ToneArchetype;
  name: string;
  badge: string;
  description: string;
  rate: number;
  pitch: number;
  pauseWeight: number; // multiplier for punctuation pauses
  vocalAcoustics: {
    warmth: string;
    cadence: string;
    authority: string;
  };
}

export const TONE_PRESETS: Record<ToneArchetype, TonePreset> = {
  algerian_educator: {
    id: 'algerian_educator',
    name: 'نبرة المربي الجزائري الفصيح (الإذاعية الوقورة)',
    badge: 'الأكثر واقعية وأصالة',
    description: 'صوت رجل جزائري فصيح، رصين، يجمع بين هيبة القرار الرخيم والوقف بالسكون المحكم على أواخر الجمل وفصاحة مخارج الحروف.',
    rate: 0.85,
    pitch: 0.88,
    pauseWeight: 1.4,
    vocalAcoustics: {
      warmth: 'قرار باريتون إذاعي دافئ (120 - 200Hz)',
      cadence: 'متريث وقور مع سكون أواخر الجمل (95 - 105 كلمة/دقيقة)',
      authority: 'هيبة تربوية جزائرية وأبوة مسؤولة لا تعرف التصنع'
    }
  },
  paternal: {
    id: 'paternal',
    name: 'نبرة تربوية أبوية هادئة',
    badge: 'للتوجيه والإرشاد',
    description: 'نبرة عميقة، دافئة، متزنة تجمع بين عطف الأب الحريص وهيبة المربي في ثانوية ابن الهيثم.',
    rate: 0.88,
    pitch: 0.92,
    pauseWeight: 1.25,
    vocalAcoustics: {
      warmth: 'عالية (نغمات دافئة مطمئنة)',
      cadence: 'متزن مع وقفات تنفسية مريحة (115 كلمة/دقيقة)',
      authority: 'سلطة أدبية ناصحة وموجهة'
    }
  },
  regulatory: {
    id: 'regulatory',
    name: 'نبرة إدارية رسمية حازمة',
    badge: 'للممنوعات والمواد الصريحة',
    description: 'نبرة منضبطة، واضحة الحروف، نبرتها حاسمة لتأكيد حرمة الحرم المدرسي ومنع المخالفات.',
    rate: 0.92,
    pitch: 0.87,
    pauseWeight: 1.1,
    vocalAcoustics: {
      warmth: 'معتدلة ورسمية',
      cadence: 'حازم ومحدد المقاطع (125 كلمة/دقيقة)',
      authority: 'قوة القانون الداخلي والردع الإداري'
    }
  },
  inspirational: {
    id: 'inspirational',
    name: 'نبرة تحفيزية دافئة ومشرقة',
    badge: 'للمكافآت والبكالوريا',
    description: 'نبرة متفائلة، مشجعة تعزز روح الطموح والجد والمواظبة لدى التلاميذ.',
    rate: 0.94,
    pitch: 1.01,
    pauseWeight: 1.0,
    vocalAcoustics: {
      warmth: 'عالية جداً ومحفزة',
      cadence: 'انسيابي ومرن (130 كلمة/دقيقة)',
      authority: 'مرافقة إيجابية نحو النجاح'
    }
  }
};

/**
 * Phonetic Diacritic Map:
 * Enriches common school regulatory words with full diacritics (Tashkeel)
 * to prevent robotic butchering by browser speech synthesis engines.
 */
const PHONETIC_DIACRITIC_DICTIONARY: [RegExp, string][] = [
  [/\bثانوية ابن الهيثم\b/g, 'ثَانَوِيَّةُ ابْنِ الهَيْثَمْ'],
  [/\bمشرف تربية\b/g, 'مُشْرِفُ تَرْبِيَةْ'],
  [/\bالقانون الداخلي\b/g, 'القَانُونُ الدَّاخِلِيْ'],
  [/\bالميثاق المدرسي\b/g, 'المِيثَاقُ المَدْرَسِيْ'],
  [/\bالمئزر الأبيض\b/g, 'المِئْزَرُ الأَبْيَضْ'],
  [/\bالهاتف النقال\b/g, 'الهَاتِفُ النَّقَّالْ'],
  [/\bالبكالوريا\b/g, 'البَكَالُورْيَا'],
  [/\bأبنائي وبناتي\b/g, 'أَبْنَائِي وَبَنَاتِي'],
  [/\bالتلاميذ\b/g, 'التَّلَامِيذْ'],
  [/\bالتلميذ\b/g, 'التِّلْمِيذْ'],
  [/\bالجمهورية الجزائرية\b/g, 'الجُمْهُورِيَّةُ الجَزَائِرِيَّةُ الدِّيمُقْرَاطِيَّةُ الشَّعْبِيَّةْ'],
  [/\bوزارة التربية الوطنية\b/g, 'وِزَارَةُ التَّرْبِيَةِ الوَطَنِيَّةْ'],
  [/\bالمواظبة والانضباط\b/g, 'المُوَاظَبَةُ وَالانْضِبَاطْ'],
  [/\bمحمد بلوزداد\b/g, 'مُحَمَّد بَلْوِزْدَادْ']
];

/**
 * Preprocess Arabic text for natural human-like cadence:
 * 1. Replaces raw dots and commas with micro-pauses for natural respiration
 * 2. Injects full phonetic Tashkeel on recurring regulatory concepts
 * 3. Strips excessive harsh punctuation
 */
export function calibrateArabicTextForSpeech(
  text: string,
  archetype: ToneArchetype = 'paternal'
): string {
  if (!text) return '';

  let calibrated = text;

  // Apply dictionary diacritics
  for (const [regex, enriched] of PHONETIC_DIACRITIC_DICTIONARY) {
    calibrated = calibrated.replace(regex, enriched);
  }

  // Adjust breath pauses based on tone archetype
  const pauseFactor = TONE_PRESETS[archetype].pauseWeight;

  if (pauseFactor > 1.1) {
    // Add deliberate thoughtful pauses at commas and semicolons
    calibrated = calibrated
      .replace(/،/g, '، ... ')
      .replace(/؛/g, '؛ ... ')
      .replace(/\./g, '. ..... ');
  } else {
    calibrated = calibrated
      .replace(/،/g, '، ')
      .replace(/\./g, '. .. ');
  }

  return calibrated;
}

/**
 * Voice Quality Diagnostic Scorecard
 */
export interface VoiceEvaluationMetric {
  title: string;
  score: number; // 0 - 100
  status: 'ممتاز' | 'جيد جداً' | 'يحتاج ضبط';
  feedback: string;
}

export function evaluateSpeechScript(script: string, durationSec: number): VoiceEvaluationMetric[] {
  const words = script.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const wpm = durationSec > 0 ? (wordCount / (durationSec / 60)) : 120;

  // 1. Pacing Metric (Ideal for whiteboard is 110 - 130 WPM)
  let pacingScore = 100;
  let pacingStatus: 'ممتاز' | 'جيد جداً' | 'يحتاج ضبط' = 'ممتاز';
  let pacingFeedback = 'الإيقاع الصوتي متزن تماماً مع سرعة حركة يد الرسام في VideoScribe.';

  if (wpm < 95) {
    pacingScore = 75;
    pacingStatus = 'يحتاج ضبط';
    pacingFeedback = `الإلقاء بطيء نوعاً ما (${Math.round(wpm)} ك/د). يُخشى أن يسبق الرسم الصوت في المشهد.`;
  } else if (wpm > 145) {
    pacingScore = 70;
    pacingStatus = 'يحتاج ضبط';
    pacingFeedback = `الإلقاء سريع جداً (${Math.round(wpm)} ك/د). التلاميذ يحتاجون وقتاً لاستيعاب المواد القانونية.`;
  } else if (wpm >= 110 && wpm <= 130) {
    pacingScore = 98;
    pacingStatus = 'ممتاز';
    pacingFeedback = `إيقاع نموذجي (${Math.round(wpm)} ك/د) يمنح الفيديو هيبة ووضوحاً إذاعياً فائقاً.`;
  } else {
    pacingScore = 88;
    pacingStatus = 'جيد جداً';
    pacingFeedback = `إيقاع مقبول (${Math.round(wpm)} ك/د)، يمكنك رفع التريث قليلاً عند الفواصل.`;
  }

  // 2. Articulation & Tashkeel Metric
  const hasDiacritics = /[\u064B-\u0652]/.test(script);
  let articulationScore = hasDiacritics ? 95 : 82;
  let articulationStatus: 'ممتاز' | 'جيد جداً' | 'يحتاج ضبط' = hasDiacritics ? 'ممتاز' : 'جيد جداً';
  let articulationFeedback = hasDiacritics
    ? 'النص مشكول لغوياً مما يضمن سلامة الإعراب وتفادي لكنة الروبوت.'
    : 'النص غير مشكول كلياً؛ يوصى باستخدام ميزة "تطبيق التشكيل والنبرة" لضبط مخارج الحروف.';

  // 3. Paternal Presence & Authority
  const paternalKeywords = ['أبنائي', 'بناتي', 'التلميذ', 'احترام', 'حرمة', 'النظام', 'مستقبل', 'نجاح', 'المؤسسة'];
  const matchedPaternal = paternalKeywords.filter(k => script.includes(k));
  let authorityScore = Math.min(100, 70 + matchedPaternal.length * 6);
  let authorityStatus: 'ممتاز' | 'جيد جداً' | 'يحتاج ضبط' = authorityScore >= 90 ? 'ممتاز' : 'جيد جداً';
  let authorityFeedback = matchedPaternal.length >= 3
    ? 'النص يحمل الصبغة التربوية الأبوية الصادقة للمشرف رشيد.'
    : 'النص رسمي وجيد، ويمكنك تعزيزه بعبارات التوجيه الأبوي المشجع.';

  return [
    { title: 'إيقاع الإلقاء والتزامن (Pacing & Cadence)', score: pacingScore, status: pacingStatus, feedback: pacingFeedback },
    { title: 'الفصاحة ومخارج الحروف (Phonetics & Diacritics)', score: articulationScore, status: articulationStatus, feedback: articulationFeedback },
    { title: 'الهيبة الأبوية والوقار التربوي (Authority & Presence)', score: authorityScore, status: authorityStatus, feedback: authorityFeedback }
  ];
}
