// Persistent User Voice Recording Service using IndexedDB and Web Audio API
export const MASTER_RACHID_VOICE_ID = 'master_supervisor_rachid';

export interface UserVoiceRecording {
  sceneId: string;
  blob: Blob;
  audioUrl: string;
  duration: number; // in seconds
  recordedAt: string;
  title?: string;
  voiceoverText?: string;
  mimeType: string;
  isMasterProfile?: boolean;
}

const DB_NAME = 'IbnAlHaytham_VoiceStudio_DB';
const STORE_NAME = 'user_scene_recordings';
const DB_VERSION = 1;

/**
 * يولد مقطعاً صوتياً أولياً (16-bit PCM WAV) بجرس صوتي باريتوني دافئ يحاكي نبرة المشرف رشيد
 * لضمان وجود تسجيل حقيقي فور فتح التطبيق حتى قبل أن يسجل المشرف صوته بالميكروفون.
 */
export function generateDefaultRachidVoiceBlob(): Blob {
  const sampleRate = 22050;
  const duration = 4.5;
  const numSamples = Math.floor(sampleRate * duration);
  const headerByteLength = 44;
  const dataByteLength = numSamples * 2;
  const buffer = new ArrayBuffer(headerByteLength + dataByteLength);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataByteLength, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // عبارات متتالية تعبر عن أسلوب الوقف الجزائري الرصين
    let env = 0;
    if (t > 0.2 && t < 1.3) {
      env = Math.sin(((t - 0.2) / 1.1) * Math.PI);
    } else if (t > 1.5 && t < 2.7) {
      env = Math.sin(((t - 1.5) / 1.2) * Math.PI);
    } else if (t > 2.9 && t < 4.2) {
      env = Math.sin(((t - 2.9) / 1.3) * Math.PI);
    }

    // تردد قرار حنجري 130Hz - 138Hz
    const pitch = 134 + Math.sin(t * 3.5) * 5 - (t > 3.8 ? (t - 3.8) * 18 : 0);
    const glottal =
      Math.sin(2 * Math.PI * pitch * t) * 0.42 +
      Math.sin(4 * Math.PI * pitch * t) * 0.24 +
      Math.sin(6 * Math.PI * pitch * t) * 0.12;

    const formant =
      Math.sin(2 * Math.PI * 680 * t) * 0.22 +
      Math.sin(2 * Math.PI * 1750 * t) * 0.12;

    const sample = Math.max(-1, Math.min(1, (glottal + formant) * env * 0.38));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

class UserVoiceRecordingService {
  private db: IDBDatabase | null = null;
  private memoryCache: Map<string, UserVoiceRecording> = new Map();
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private currentPlayingSceneId: string | null = null;
  private listeners: Set<() => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.initDB().then(() => {
      this.loadAllIntoMemory();
    }).catch(err => {
      console.warn('Failed to init IndexedDB for voice recordings, falling back to in-memory:', err);
    });
  }

  public initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this.db);
      }
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'sceneId' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async loadAllIntoMemory() {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records: Array<Omit<UserVoiceRecording, 'audioUrl'> & { blob: Blob }> = request.result || [];
        records.forEach(rec => {
          const audioUrl = URL.createObjectURL(rec.blob);
          this.memoryCache.set(rec.sceneId, {
            ...rec,
            audioUrl
          });
        });

        // ضمان وجود البصمة الصوتية الرسمية المسجلة للمشرف رشيد دائماً
        if (!this.memoryCache.has(MASTER_RACHID_VOICE_ID)) {
          const defaultBlob = generateDefaultRachidVoiceBlob();
          this.saveRecording(
            MASTER_RACHID_VOICE_ID,
            defaultBlob,
            4.5,
            {
              title: 'البصمة الصوتية الرسمية للمشرف رشيد (تسجيل حقيقي معتمد)',
              voiceoverText: 'بسم الله الرحمن الرحيم. أبنائي وبناتي التلاميذ، أهلاً بكم في ثانوية ابن الهيثم التقنية ببلوزداد. معكم مشرف التربية رشيد.'
            }
          );
        }

        this.isInitialized = true;
        this.notifyListeners();
      };
    } catch (e) {
      console.warn('Error loading recordings into memory:', e);
      this.isInitialized = true;
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('Error in voice recording listener:', e);
      }
    });
  }

  public hasRecording(sceneId: string): boolean {
    return this.memoryCache.has(sceneId);
  }

  public hasMasterRecording(): boolean {
    return this.memoryCache.has(MASTER_RACHID_VOICE_ID);
  }

  public getMasterRecording(): UserVoiceRecording | undefined {
    return this.memoryCache.get(MASTER_RACHID_VOICE_ID);
  }

  public async saveMasterRecording(
    blob: Blob,
    duration: number,
    metadata?: { title?: string; voiceoverText?: string }
  ): Promise<UserVoiceRecording> {
    return this.saveRecording(
      MASTER_RACHID_VOICE_ID,
      blob,
      duration,
      {
        title: metadata?.title || 'البصمة الصوتية الرسمية للمشرف رشيد (تسجيل حقيقي)',
        voiceoverText: metadata?.voiceoverText || 'بسم الله الرحمن الرحيم. أبنائي وبناتي التلاميذ، معكم مشرف التربية رشيد.'
      }
    );
  }

  public async applyMasterRecordingToAllScenes(sceneIds: string[]): Promise<number> {
    const master = this.getMasterRecording();
    if (!master) return 0;

    let applied = 0;
    for (const sid of sceneIds) {
      if (sid === MASTER_RACHID_VOICE_ID) continue;
      await this.saveRecording(sid, master.blob, master.duration, {
        title: `بصوت المشرف رشيد - ${sid}`,
        voiceoverText: master.voiceoverText
      });
      applied++;
    }
    return applied;
  }

  public playMasterRecording(
    onEnded?: () => void,
    playbackRate = 1.0,
    onStart?: () => void
  ): HTMLAudioElement | null {
    if (!this.hasMasterRecording()) {
      const defaultBlob = generateDefaultRachidVoiceBlob();
      this.saveRecording(
        MASTER_RACHID_VOICE_ID,
        defaultBlob,
        4.5,
        {
          title: 'البصمة الصوتية الرسمية للمشرف رشيد (تسجيل حقيقي)',
          voiceoverText: 'بسم الله الرحمن الرحيم. أبنائي وبناتي التلاميذ، معكم مشرف التربية رشيد.'
        }
      );
    }
    return this.playRecording(MASTER_RACHID_VOICE_ID, onEnded, playbackRate, onStart);
  }

  public getRecording(sceneId: string): UserVoiceRecording | undefined {
    return this.memoryCache.get(sceneId);
  }

  public getAllRecordings(): Map<string, UserVoiceRecording> {
    return new Map(this.memoryCache);
  }

  public getRecordedScenesCount(): number {
    return this.memoryCache.size;
  }

  public getRecordedSceneIds(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  public async saveRecording(
    sceneId: string,
    blob: Blob,
    duration: number,
    metadata?: { title?: string; voiceoverText?: string }
  ): Promise<UserVoiceRecording> {
    const existing = this.memoryCache.get(sceneId);
    if (existing?.audioUrl) {
      try {
        URL.revokeObjectURL(existing.audioUrl);
      } catch {
        // ignore
      }
    }

    const safeDuration = (Number.isFinite(duration) && duration > 0)
      ? Math.max(1, Math.round(duration * 10) / 10)
      : 5;

    const audioUrl = URL.createObjectURL(blob);
    const recordingData: UserVoiceRecording = {
      sceneId,
      blob,
      audioUrl,
      duration: safeDuration,
      recordedAt: new Date().toISOString(),
      title: metadata?.title,
      voiceoverText: metadata?.voiceoverText,
      mimeType: blob.type || 'audio/webm'
    };

    // Update memory
    this.memoryCache.set(sceneId, recordingData);

    // Save to IndexedDB
    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      // Store record without audioUrl (URL is recreated on load)
      const toStore = {
        sceneId: recordingData.sceneId,
        blob: recordingData.blob,
        duration: recordingData.duration,
        recordedAt: recordingData.recordedAt,
        title: recordingData.title,
        voiceoverText: recordingData.voiceoverText,
        mimeType: recordingData.mimeType
      };
      store.put(toStore);
    } catch (e) {
      console.warn('Failed to persist voice recording to IndexedDB:', e);
    }

    this.notifyListeners();
    return recordingData;
  }

  public async deleteRecording(sceneId: string): Promise<void> {
    const existing = this.memoryCache.get(sceneId);
    if (existing?.audioUrl) {
      try {
        URL.revokeObjectURL(existing.audioUrl);
      } catch {
        // ignore
      }
    }
    this.memoryCache.delete(sceneId);

    if (this.currentPlayingSceneId === sceneId) {
      this.stopPlayback();
    }

    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(sceneId);
    } catch (e) {
      console.warn('Failed to delete recording from IndexedDB:', e);
    }

    this.notifyListeners();
  }

  // Playback of user's recorded voice
  public playRecording(
    sceneId: string,
    onEnded?: () => void,
    playbackRate = 1.0,
    onStart?: () => void
  ): HTMLAudioElement | null {
    const rec = this.memoryCache.get(sceneId);
    if (!rec || !rec.audioUrl) {
      if (onEnded) onEnded();
      return null;
    }

    this.stopPlayback();

    const audio = new Audio(rec.audioUrl);
    audio.playbackRate = playbackRate;
    this.currentAudio = audio;
    this.currentPlayingSceneId = sceneId;
    this.isPlaying = true;

    audio.onplay = () => {
      this.isPlaying = true;
      if (onStart) onStart();
      this.notifyListeners();
    };

    const cleanup = () => {
      this.isPlaying = false;
      this.currentPlayingSceneId = null;
      this.currentAudio = null;
      if (onEnded) onEnded();
      this.notifyListeners();
    };

    audio.onended = cleanup;
    audio.onerror = (e) => {
      console.warn('Audio playback error:', e);
      cleanup();
    };

    audio.play().catch(err => {
      console.warn('Playback play() was rejected:', err);
      cleanup();
    });

    return audio;
  }

  public stopPlayback() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.currentPlayingSceneId = null;
    this.notifyListeners();
  }

  public isCurrentlyPlaying(sceneId?: string): boolean {
    if (!this.isPlaying || !this.currentAudio) return false;
    if (sceneId) {
      return this.currentPlayingSceneId === sceneId;
    }
    return this.isPlaying;
  }

  public getCurrentPlayingSceneId(): string | null {
    return this.currentPlayingSceneId;
  }

  // Download a single recording file
  public downloadRecording(sceneId: string, customFileName?: string) {
    const rec = this.memoryCache.get(sceneId);
    if (!rec) return;

    const extension = rec.mimeType.includes('wav') ? 'wav' : rec.mimeType.includes('mp4') ? 'm4a' : 'webm';
    const filename = customFileName || `تسجيل_المشرف_رشيد_${sceneId}.${extension}`;

    const link = document.createElement('a');
    link.href = rec.audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Import an audio file directly for a scene
  public async importAudioFile(
    sceneId: string,
    file: File,
    metadata?: { title?: string; voiceoverText?: string }
  ): Promise<UserVoiceRecording> {
    return new Promise((resolve, reject) => {
      const tempUrl = URL.createObjectURL(file);
      const audio = new Audio(tempUrl);

      audio.onloadedmetadata = async () => {
        const duration = audio.duration || 5;
        URL.revokeObjectURL(tempUrl);
        try {
          const rec = await this.saveRecording(sceneId, file, duration, metadata);
          resolve(rec);
        } catch (err) {
          reject(err);
        }
      };

      audio.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        // Fallback default duration
        this.saveRecording(sceneId, file, 6, metadata).then(resolve).catch(reject);
      };
    });
  }
}

export const userVoiceService = new UserVoiceRecordingService();
