/**
 * Flavortown Dash - Settings Scene
 * Game settings and options
 */

import { Scene } from './Scene.js';
import { CONFIG, SCENES } from '../config.js';

export class SettingsScene extends Scene {
    constructor(game) {
        super(game);

        // Settings values
        this.settings = {
            masterVolume: 0.7,
            musicVolume: 0.5,
            sfxVolume: 0.8,
            showFPS: false,
            reducedMotion: false
        };

        // UI state
        this.hoveredItem = null;
        this.draggingSlider = null;

        // Animation
        this.time = 0;
    }

    async init(data = {}) {
        // Load saved settings
        this.loadSettings();
        this.isReady = true;
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE.SETTINGS);
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load settings');
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(CONFIG.STORAGE.SETTINGS, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings');
        }

        // Apply audio settings
        this.game.audioManager.setMasterVolume(this.settings.masterVolume);
        this.game.audioManager.setMusicVolume(this.settings.musicVolume);
        this.game.audioManager.setSFXVolume(this.settings.sfxVolume);
    }

    update(dt) {
        this.time += dt;

        const input = this.game.inputManager;
        const mousePos = input.getPointerPosition();

        // Reset hover
        this.hoveredItem = null;

        // Check back button
        const backBtn = { x: CONFIG.CANVAS.WIDTH / 2 - 100, y: CONFIG.CANVAS.HEIGHT - 100, width: 200, height: 50 };
        if (this.isPointInRect(mousePos.x, mousePos.y, backBtn)) {
            this.hoveredItem = 'back';
        }

        // Check sliders
        const sliders = this.getSliderRects();
        for (const slider of sliders) {
            if (this.isPointInRect(mousePos.x, mousePos.y, slider.rect)) {
                this.hoveredItem = slider.id;
            }
        }

        // Handle slider dragging
        if (this.draggingSlider && input.isPressed) {
            const slider = sliders.find(s => s.id === this.draggingSlider);
            if (slider) {
                const value = (mousePos.x - slider.rect.x) / slider.rect.width;
                this.settings[this.draggingSlider] = Math.max(0, Math.min(1, value));
                this.saveSettings();
            }
        } else {
            this.draggingSlider = null;
        }

        // Handle clicks
        if (input.justPressed) {
            if (this.hoveredItem === 'back') {
                this.game.sceneManager.switchTo(SCENES.MENU);
            } else if (this.hoveredItem && this.hoveredItem.includes('Volume')) {
                this.draggingSlider = this.hoveredItem;
            }
        }
    }

    getSliderRects() {
        const sliderWidth = 300;
        const sliderHeight = 20;
        const startY = 200;
        const gap = 80;
        const centerX = CONFIG.CANVAS.WIDTH / 2;

        return [
            {
                id: 'masterVolume',
                label: 'Master Volume',
                rect: { x: centerX - sliderWidth / 2, y: startY, width: sliderWidth, height: sliderHeight }
            },
            {
                id: 'musicVolume',
                label: 'Music Volume',
                rect: { x: centerX - sliderWidth / 2, y: startY + gap, width: sliderWidth, height: sliderHeight }
            },
            {
                id: 'sfxVolume',
                label: 'SFX Volume',
                rect: { x: centerX - sliderWidth / 2, y: startY + gap * 2, width: sliderWidth, height: sliderHeight }
            }
        ];
    }

    render(ctx) {
        // Background
        ctx.fillStyle = CONFIG.COLORS.DARK;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Title
        this.drawText(ctx, 'SETTINGS', CONFIG.CANVAS.WIDTH / 2, 80, {
            font: 'bold 48px Outfit, sans-serif',
            color: CONFIG.COLORS.ACCENT
        });

        // Sliders
        const sliders = this.getSliderRects();
        for (const slider of sliders) {
            this.renderSlider(ctx, slider);
        }

        // Back button
        this.drawButton(ctx, '← BACK', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 75,
            200, 50, this.hoveredItem === 'back', { color: CONFIG.COLORS.SECONDARY });

        // Credits
        ctx.font = '16px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText('Flavortown Dash v1.0', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 30);
    }

    renderSlider(ctx, slider) {
        const { id, label, rect } = slider;
        const value = this.settings[id];
        const isHovered = this.hoveredItem === id || this.draggingSlider === id;

        // Label
        ctx.font = '20px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(label, rect.x + rect.width / 2, rect.y - 20);

        // Slider track
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.roundRect(rect.x, rect.y, rect.width, rect.height, rect.height / 2);
        ctx.fill();

        // Slider fill
        const color = isHovered ? CONFIG.COLORS.PRIMARY : CONFIG.COLORS.ACCENT;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(rect.x, rect.y, rect.width * value, rect.height, rect.height / 2);
        ctx.fill();

        // Slider handle
        const handleX = rect.x + rect.width * value;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(handleX, rect.y + rect.height / 2, rect.height / 2 + 5, 0, Math.PI * 2);
        ctx.fill();

        if (isHovered) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Value text
        ctx.font = '16px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(value * 100) + '%', rect.x + rect.width + 50, rect.y + rect.height / 2 + 5);
    }
}
