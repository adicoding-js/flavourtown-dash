/**
 * Flavortown Dash - Audio Manager
 * Web Audio API with music synchronization and beat detection
 */

import { CONFIG } from '../config.js';

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;

        // Music state
        this.currentMusic = null;
        this.musicSource = null;
        this.musicBuffer = null;
        this.musicStartTime = 0;
        this.isPlaying = false;

        // Beat sync
        this.bpm = 128;
        this.beatInterval = 60 / this.bpm;
        this.lastBeatTime = 0;
        this.beatCallbacks = [];

        // Analyser for visualizations
        this.analyser = null;
        this.frequencyData = null;

        // Sound effects cache
        this.sfxBuffers = new Map();

        // Settings
        this.masterVolume = CONFIG.AUDIO.MASTER_VOLUME;
        this.musicVolume = CONFIG.AUDIO.MUSIC_VOLUME;
        this.sfxVolume = CONFIG.AUDIO.SFX_VOLUME;
        this.isMuted = false;
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create gain nodes
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();

            // Create analyser for visualizations
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

            // Connect audio graph
            this.musicGain.connect(this.analyser);
            this.analyser.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);

            // Set initial volumes
            this.updateVolumes();

            console.log('🔊 Audio initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    /**
     * Resume audio context (required after user interaction)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Load music from URL
     */
    async loadMusic(url) {
        if (!this.audioContext) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log(`🎵 Music loaded: ${url}`);
        } catch (error) {
            console.error('Failed to load music:', error);
        }
    }

    /**
     * Play the loaded music
     */
    playMusic(loop = true, startTime = 0) {
        if (!this.audioContext || !this.musicBuffer) return;

        this.stopMusic();

        this.musicSource = this.audioContext.createBufferSource();
        this.musicSource.buffer = this.musicBuffer;
        this.musicSource.loop = loop;
        this.musicSource.connect(this.musicGain);

        this.musicSource.start(0, startTime);
        this.musicStartTime = this.audioContext.currentTime - startTime;
        this.isPlaying = true;
        this.lastBeatTime = startTime;
    }

    /**
     * Stop music playback
     */
    stopMusic() {
        if (this.musicSource) {
            try {
                this.musicSource.stop();
            } catch (e) {
                // Already stopped
            }
            this.musicSource = null;
        }
        this.isPlaying = false;
    }

    /**
     * Get current music playback time
     */
    getMusicTime() {
        if (!this.audioContext || !this.isPlaying) return 0;
        return this.audioContext.currentTime - this.musicStartTime;
    }

    /**
     * Set BPM for beat sync
     */
    setBPM(bpm) {
        this.bpm = bpm;
        this.beatInterval = 60 / bpm;
    }

    /**
     * Register callback for beat events
     */
    onBeat(callback) {
        this.beatCallbacks.push(callback);
    }

    /**
     * Clear beat callbacks
     */
    clearBeatCallbacks() {
        this.beatCallbacks = [];
    }

    /**
     * Update - check for beats
     */
    update() {
        if (!this.isPlaying) return;

        const currentTime = this.getMusicTime();
        const expectedBeatTime = this.lastBeatTime + this.beatInterval;

        if (currentTime >= expectedBeatTime) {
            this.lastBeatTime = expectedBeatTime;

            // Trigger beat callbacks
            for (const callback of this.beatCallbacks) {
                callback(currentTime);
            }
        }

        // Update frequency data for visualizations
        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.frequencyData);
        }
    }

    /**
     * Get frequency data for visualizations
     */
    getFrequencyData() {
        return this.frequencyData;
    }

    /**
     * Get bass level (for effects)
     */
    getBassLevel() {
        if (!this.frequencyData) return 0;

        // Average of low frequencies
        let sum = 0;
        const bassRange = 8;
        for (let i = 0; i < bassRange; i++) {
            sum += this.frequencyData[i];
        }
        return sum / (bassRange * 255);
    }

    /**
     * Load a sound effect
     */
    async loadSFX(name, url) {
        if (!this.audioContext) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sfxBuffers.set(name, buffer);
        } catch (error) {
            console.error(`Failed to load SFX ${name}:`, error);
        }
    }

    /**
     * Play a sound effect
     */
    playSFX(name) {
        if (!this.audioContext || this.isMuted) return;

        const buffer = this.sfxBuffers.get(name);
        if (!buffer) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.sfxGain);
        source.start();
    }

    /**
     * Update volume settings
     */
    updateVolumes() {
        if (!this.masterGain) return;

        const master = this.isMuted ? 0 : this.masterVolume;
        this.masterGain.gain.setValueAtTime(master, this.audioContext.currentTime);
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateVolumes();
        return this.isMuted;
    }

    /**
     * Set master volume (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    /**
     * Set music volume (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    /**
     * Set SFX volume (0-1)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }
}
