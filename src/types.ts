export interface DrawingPath {
  id: string;
  name: string;
  d: string;
  stroke: string;
  strokeWidth: number;
  fill?: string;
  durationPercent: number; // percentage of scene time this element takes to draw
  order: number;
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  voiceoverText: string;
  visualSummary: string;
  visualElementsList: string[];
  durationSeconds: number; // e.g., 8
  minDuration: number;
  maxDuration: number;
  animateTime: number; // e.g. 2.0s
  pauseTime: number; // e.g. 1.0s
  relatedArticles: string[]; // e.g. ['المادة 1', 'المادة 6']
  category: 'general' | 'discipline' | 'safety' | 'environment' | 'partnership' | 'exams' | 'pledge';
  themeColor: string;
  camera: {
    x: number;
    y: number;
    zoom: number; // 1 = 100%
  };
  svgIllustrationKey: string;
}

export interface StoryboardTrack {
  id: string;
  title: string;
  description: string;
  badge: string;
  scenes: StoryboardScene[];
}

export interface OfficialArticle {
  number: number;
  chapterNumber: number;
  chapterTitle: string;
  text: string;
  tags: string[];
  keyHighlight?: string;
  studentExplanation?: string; // الشرح المبسط للطلبة والتلاميذ
}

export interface OfficialChapter {
  id: number;
  title: string;
  articles: OfficialArticle[];
}

export interface PledgeFormData {
  academicYear: string;
  directorate: string;
  schoolName: string;
  studentName: string;
  studentClass: string;
  guardianName: string;
  idNumber: string;
  idIssuer: string;
  idDate: string;
  acceptInternalRules: boolean;
  allowActivities: 'yes' | 'no' | null;
  signatureDataUrl?: string;
}

export type SupervisorCategory =
  | 'الكل'
  | 'إداري وقانوني'
  | 'بيداغوجي وتربوي'
  | 'انضباطي وسلوكي'
  | 'حالات طارئة وأمنية'
  | 'علاقات وأولياء الأمور';

export type SupervisorBadgeType = 'admin' | 'pedagogy' | 'discipline' | 'emergency' | 'community';

export interface SupervisorFieldCard {
  id: string;
  title: string;
  category: Exclude<SupervisorCategory, 'الكل'>;
  badgeType: SupervisorBadgeType;
  badgeLabel: string;
  preview: string;
  immediateAction: string[];
  legalBasis: {
    articles: string;
    description: string;
  };
  forbiddenActions: string[];
  pedagogicalSolution: string;
  documentTemplate?: {
    name: string;
    content: string;
  };
  audioSummary?: string;
}

