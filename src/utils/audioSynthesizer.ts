// Web Audio API Marker Sound Synthesizer & Speech Voiceover
import { RACHID_SUPERVISOR } from '../data/rachidSupervisorPersona';
import { userVoiceService } from './userVoiceRecordingService';
import { calibrateArabicTextForSpeech, ToneArchetype, TONE_PRESETS } from './toneCalibrator';

export type VoiceMode = 'user' | 'tts';

class AudioPlayerService {
  private audioCtx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isDrawingSoundActive = false;
  private soundEnabled = true;
  private isSpeakingActive = false;
  private voiceMode: VoiceMode = 'user'; // Default to user recording if available!
  private activeToneArchetype: ToneArchetype = 'algerian_educator';

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopMarkerSound();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Generate realistic whiteboard marker squeak & scratch sound using filtered noise + resonant peaks
  public startMarkerSound() {
    if (!this.soundEnabled || this.isDrawingSoundActive) return;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const bufferSize = this.audioCtx.sampleRate * 2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate brown-ish noise with occasional friction jitter
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Friction modulated random
        const friction = Math.sin(i * 0.08) * 0.15;
        data[i] = (lastOut + (0.02 * white) + friction) / 1.02;
        lastOut = data[i];
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Bandpass filter to mimic marker felt tip tip rubbing on whiteboard
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1850;
      filter.Q.value = 3.2;

      // Secondary high shelf for slight squeak
      const highPass = this.audioCtx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.value = 800;

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);

      noise.connect(filter);
      filter.connect(highPass);
      highPass.connect(gain);
      gain.connect(this.audioCtx.destination);

      noise.start();
      this.noiseNode = noise;
      this.gainNode = gain;
      this.isDrawingSoundActive = true;
    } catch {
      // Audio autoplay or permissions restriction safe fallback
    }
  }

  public stopMarkerSound() {
    if (this.gainNode && this.audioCtx) {
      try {
        this.gainNode.gain.setTargetAtTime(0.001, this.audioCtx.currentTime, 0.05);
        setTimeout(() => {
          if (this.noiseNode) {
            try {
              this.noiseNode.stop();
              this.noiseNode.disconnect();
            } catch {
              // Ignore already stopped
            }
            this.noiseNode = null;
          }
          this.isDrawingSoundActive = false;
        }, 60);
      } catch {
        this.isDrawingSoundActive = false;
      }
    } else {
      this.isDrawingSoundActive = false;
    }
  }

  public playChime() {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.6);
    } catch {
      // safe fallback
    }
  }

  // Voiceover synthesis - tuned for Supervisor Rachid's dignified educational persona
  public speakText(
    text: string,
    onEnd?: () => void,
    rate?: number,
    pitch?: number,
    onStart?: () => void
  ): SpeechSynthesisUtterance | null {
    if (!('speechSynthesis' in window)) {
      if (onEnd) setTimeout(onEnd, 3000);
      return null;
    }

    window.speechSynthesis.cancel();
    this.isSpeakingActive = true;

    const preset = TONE_PRESETS[this.activeToneArchetype];
    const effectiveRate = rate !== undefined ? rate : preset.rate;
    const effectivePitch = pitch !== undefined ? pitch : preset.pitch;

    // Apply phonetic diacritics and respiration pauses
    const processedText = calibrateArabicTextForSpeech(text, this.activeToneArchetype);

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = RACHID_SUPERVISOR.voiceSettings.lang || 'ar-SA';
    utterance.rate = effectiveRate;
    utterance.pitch = effectivePitch;

    // Prioritize high-quality natural Arabic voices (Algerian dialect / baritone authoritative educational tone)
    const voices = window.speechSynthesis.getVoices();
    const algerianVoice = voices.find(v =>
      v.lang.toLowerCase().includes('dz') ||
      v.name.toLowerCase().includes('algeria') ||
      v.lang.toLowerCase().includes('ar-dz')
    );
    const arabicVoice =
      algerianVoice ||
      voices.find(v => (v.lang.startsWith('ar') || v.lang.includes('Arabic')) && (v.name.toLowerCase().includes('maged') || v.name.toLowerCase().includes('tarik') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('naayf') || v.name.toLowerCase().includes('hassan'))) ||
      voices.find(v => v.lang.startsWith('ar') || v.lang.includes('Arabic')) ||
      voices[0];

    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingActive = true;
      if (onStart) onStart();
    };

    const handleFinish = () => {
      this.isSpeakingActive = false;
      if (onEnd) onEnd();
    };

    utterance.onend = handleFinish;
    utterance.onerror = handleFinish;

    window.speechSynthesis.speak(utterance);
    return utterance;
  }

  public setToneArchetype(archetype: ToneArchetype) {
    this.activeToneArchetype = archetype;
  }

  public getToneArchetype(): ToneArchetype {
    return this.activeToneArchetype;
  }

  // Play Mr. Rachid's authentic recorded voice (or fallback to TTS)
  public speakSupervisorIntro(onStart?: () => void, onEnd?: () => void): SpeechSynthesisUtterance | null {
    if (this.voiceMode === 'user' && userVoiceService.hasMasterRecording()) {
      userVoiceService.playMasterRecording(onEnd, 1.0, onStart);
      return null;
    }

    return this.speakText(
      RACHID_SUPERVISOR.fullSpeechForAudio,
      onEnd,
      RACHID_SUPERVISOR.voiceSettings.rate,
      RACHID_SUPERVISOR.voiceSettings.pitch,
      onStart
    );
  }

  // Speak short supervisor snippet or announcement cue
  public speakSupervisorSnippet(text: string, onEnd?: () => void): SpeechSynthesisUtterance | null {
    if (this.voiceMode === 'user' && userVoiceService.hasMasterRecording()) {
      userVoiceService.playMasterRecording(onEnd, 1.0);
      return null;
    }

    return this.speakText(
      text,
      onEnd,
      RACHID_SUPERVISOR.voiceSettings.rate,
      RACHID_SUPERVISOR.voiceSettings.pitch
    );
  }

  public setVoiceMode(mode: VoiceMode) {
    this.voiceMode = mode;
  }

  public getVoiceMode(): VoiceMode {
    return this.voiceMode;
  }

  public isSpeaking(): boolean {
    const isTtsSpeaking = ('speechSynthesis' in window) && (window.speechSynthesis.speaking || this.isSpeakingActive);
    const isUserVoicePlaying = userVoiceService.isCurrentlyPlaying();
    return isTtsSpeaking || isUserVoicePlaying;
  }

  public stopSpeech() {
    this.isSpeakingActive = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    userVoiceService.stopPlayback();
  }

  public stopAllVoice() {
    this.stopSpeech();
  }

  /**
   * Plays the user's recorded voice if available and requested, otherwise uses TTS.
   * Priority: 1) Scene-specific recording, 2) Master Supervisor Rachid recorded voice, 3) Calibrated Algerian TTS
   */
  public playSceneAudio(
    sceneId: string,
    fallbackText: string,
    onEnd?: () => void,
    rate = 1.0,
    onStart?: () => void
  ): { isUserRecording: boolean; stop: () => void } {
    this.stopAllVoice();

    const hasUserRecording = userVoiceService.hasRecording(sceneId);

    // 1. Play specific scene recording
    if (this.voiceMode === 'user' && hasUserRecording) {
      userVoiceService.playRecording(sceneId, onEnd, rate, onStart);
      return {
        isUserRecording: true,
        stop: () => userVoiceService.stopPlayback()
      };
    }

    // 2. Play Supervisor Rachid's master recorded voice
    if (this.voiceMode === 'user' && userVoiceService.hasMasterRecording()) {
      userVoiceService.playMasterRecording(onEnd, rate, onStart);
      return {
        isUserRecording: true,
        stop: () => userVoiceService.stopPlayback()
      };
    }

    // 3. Fallback to TTS
    this.speakText(
      fallbackText,
      onEnd,
      RACHID_SUPERVISOR.voiceSettings.rate * rate,
      RACHID_SUPERVISOR.voiceSettings.pitch,
      onStart
    );

    return {
      isUserRecording: false,
      stop: () => this.stopSpeech()
    };
  }
}

export const audioService = new AudioPlayerService();
