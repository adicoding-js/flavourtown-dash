/**
 * Flavortown Dash - Settings Scene
 * GD-style settings menu
 */

import { Scene } from './Scene.js';
import { CONFIG, SCENES } from '../config.js';

export class SettingsScene extends Scene {
    constructor(game) {
        super(game);

        this.settings = {
            masterVolume: CONFIG.AUDIO.MASTER_VOLUME,
            musicVolume: CONFIG.AUDIO.MUSIC_VOLUME,
            sfxVolume: CONFIG.AUDIO.SFX_VOLUME
        };

        this.time = 0;
        this.bgOffset = 0;
        this.hoveredButton = null;
        this.draggingSlider = null;
    }

    async init(data = {}) {
        // Load saved settings
        this.loadSettings();
        this.isReady = true;
    }

    loadSettings() {
        const saved = localStorage.getItem(CONFIG.STORAGE.SETTINGS);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.settings = { ...this.settings, ...data };
            } catch (e) { }
        }
    }

    saveSettings() {
        localStorage.setItem(CONFIG.STORAGE.SETTINGS, JSON.stringify(this.settings));

        // Apply to audio manager
        this.game.audioManager.setMasterVolume(this.settings.masterVolume);
        this.game.audioManager.setMusicVolume(this.settings.musicVolume);
        this.game.audioManager.setSFXVolume(this.settings.sfxVolume);
    }

    update(dt) {
        this.time += dt;
        this.bgOffset += dt * 20;

        const input = this.game.inputManager;
        const mousePos = input.getPointerPosition();

        this.hoveredButton = null;

        // Check back button
        const backBtn = { x: 20, y: 20, width: 80, height: 50 };
        if (this.isPointInRect(mousePos.x, mousePos.y, backBtn)) {
            this.hoveredButton = 'back';
        }

        // Check sliders
        const sliders = this.getSliderPositions();
        if (input.isPressed) {
            for (const slider of sliders) {
                if (this.isPointInRect(mousePos.x, mousePos.y, {
                    x: slider.x - 10, y: slider.y - 15,
                    width: slider.width + 20, height: 30
                })) {
                    this.draggingSlider = slider.id;
                    const value = Math.max(0, Math.min(1, (mousePos.x - slider.x) / slider.width));
                    this.settings[slider.id] = value;
                    this.saveSettings();
                }
            }
        } else {
            this.draggingSlider = null;
        }

        // Handle clicks
        if (input.justPressed) {
            if (this.hoveredButton === 'back') {
                this.game.sceneManager.switchTo(SCENES.MENU);
            }
        }
    }

    getSliderPositions() {
        const centerX = CONFIG.CANVAS.WIDTH / 2;
        const startY = 220;
        const gap = 100;
        const sliderWidth = 400;

        return [
            { id: 'masterVolume', label: 'MASTER VOLUME', x: centerX - sliderWidth / 2, y: startY, width: sliderWidth },
            { id: 'musicVolume', label: 'MUSIC VOLUME', x: centerX - sliderWidth / 2, y: startY + gap, width: sliderWidth },
            { id: 'sfxVolume', label: 'SFX VOLUME', x: centerX - sliderWidth / 2, y: startY + gap * 2, width: sliderWidth }
        ];
    }

    render(ctx) {
        // Purple background
        this.renderBackground(ctx);
        this.renderGrid(ctx);

        // Title
        this.renderTitle(ctx, 'SETTINGS', CONFIG.CANVAS.WIDTH / 2, 80);

        // Back button
        this.renderGDButton(ctx, 20, 20, 80, 50, '←', '', this.hoveredButton === 'back');

        // Sliders
        const sliders = this.getSliderPositions();
        for (const slider of sliders) {
            this.renderSlider(ctx, slider);
        }

        // Footer
        ctx.font = '14px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('Settings are saved automatically', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 40);
    }

    renderBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT);
        gradient.addColorStop(0, CONFIG.COLORS.GD_PURPLE);
        gradient.addColorStop(1, CONFIG.COLORS.GD_PURPLE_DARK);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    }

    renderGrid(ctx) {
        const gridSize = 80;
        const offset = this.bgOffset % gridSize;

        ctx.strokeStyle = 'rgba(74, 18, 89, 0.8)';
        ctx.lineWidth = 3;

        for (let x = -offset; x < CONFIG.CANVAS.WIDTH + gridSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CONFIG.CANVAS.HEIGHT);
            ctx.stroke();
        }

        for (let y = 0; y < CONFIG.CANVAS.HEIGHT; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CONFIG.CANVAS.WIDTH, y);
            ctx.stroke();
        }
    }

    renderTitle(ctx, text, x, y) {
        ctx.font = 'bold 48px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.strokeText(text, x, y);

        const gradient = ctx.createLinearGradient(x - 150, y - 30, x + 150, y + 30);
        gradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
        gradient.addColorStop(0.5, CONFIG.COLORS.GD_GREEN);
        gradient.addColorStop(1, CONFIG.COLORS.GD_GREEN_DARK);
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);
    }

    renderGDButton(ctx, x, y, width, height, icon, label, isHovered) {
        const scale = isHovered ? 1.05 : 1;
        const cx = x + width / 2;
        const cy = y + height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, width, height, 10);
        ctx.fill();

        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
        gradient.addColorStop(0.3, CONFIG.COLORS.GD_GREEN);
        gradient.addColorStop(1, CONFIG.COLORS.GD_GREEN_DARK);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, cx, cy);

        ctx.restore();
    }

    renderSlider(ctx, slider) {
        const value = this.settings[slider.id];
        const x = slider.x;
        const y = slider.y;
        const width = slider.width;

        // Label
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(slider.label, x, y - 30);

        // Value percentage
        ctx.textAlign = 'right';
        ctx.fillStyle = CONFIG.COLORS.GD_YELLOW;
        ctx.fillText(`${Math.round(value * 100)}%`, x + width, y - 30);

        // Track background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(x, y - 8, width, 16, 8);
        ctx.fill();

        // Track border
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Filled portion
        const gradient = ctx.createLinearGradient(x, y, x + width * value, y);
        gradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_DARK);
        gradient.addColorStop(1, CONFIG.COLORS.GD_GREEN);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y - 8, width * value, 16, 8);
        ctx.fill();

        // Handle/thumb
        const thumbX = x + width * value;

        // Thumb shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(thumbX + 2, y + 2, 14, 0, Math.PI * 2);
        ctx.fill();

        // Thumb
        const thumbGradient = ctx.createRadialGradient(thumbX - 4, y - 4, 0, thumbX, y, 14);
        thumbGradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
        thumbGradient.addColorStop(1, CONFIG.COLORS.GD_GREEN);

        ctx.fillStyle = thumbGradient;
        ctx.beginPath();
        ctx.arc(thumbX, y, 14, 0, Math.PI * 2);
        ctx.fill();

        // Thumb border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}
