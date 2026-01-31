/**
 * Flavortown Dash - Main Game Engine
 * Handles game loop, canvas rendering, and core systems
 */

import { CONFIG } from '../config.js';
import { SceneManager } from './SceneManager.js';
import { InputManager } from '../managers/InputManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { AssetManager } from '../managers/AssetManager.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Set up canvas sizing
        this.setupCanvas();

        // Core systems
        this.sceneManager = new SceneManager(this);
        this.inputManager = new InputManager(this.canvas);
        this.audioManager = new AudioManager();
        this.assetManager = new AssetManager();

        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        this.accumulator = 0;

        // State
        this.isRunning = false;
        this.isPaused = false;

        // Performance monitoring
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTime = 0;

        // Handle window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth || window.innerWidth;
        const containerHeight = container.clientHeight || window.innerHeight;

        // Calculate scale to fit while maintaining aspect ratio
        const scaleX = containerWidth / CONFIG.CANVAS.WIDTH;
        const scaleY = containerHeight / CONFIG.CANVAS.HEIGHT;
        const scale = Math.min(scaleX, scaleY);

        // Set display size (CSS)
        this.canvas.style.width = `${CONFIG.CANVAS.WIDTH * scale}px`;
        this.canvas.style.height = `${CONFIG.CANVAS.HEIGHT * scale}px`;

        // Set actual canvas size
        this.canvas.width = CONFIG.CANVAS.WIDTH;
        this.canvas.height = CONFIG.CANVAS.HEIGHT;

        // Store scale for input calculations
        this.scale = scale;
        this.offsetX = (containerWidth - CONFIG.CANVAS.WIDTH * scale) / 2;
        this.offsetY = (containerHeight - CONFIG.CANVAS.HEIGHT * scale) / 2;

        // Update input manager with new scale
        if (this.inputManager) {
            this.inputManager.setScale(scale, this.offsetX, this.offsetY);
        }
    }

    async init() {
        console.log('🎮 Flavortown Dash - Initializing...');

        // Load all assets
        await this.assetManager.loadAll();
        console.log('✅ Assets loaded');

        // Initialize audio
        await this.audioManager.init();
        console.log('✅ Audio initialized');

        console.log('🚀 Game ready!');
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    stop() {
        this.isRunning = false;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Clamp delta time to prevent spiral of death
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;

        // FPS calculation
        this.frameCount++;
        this.fpsTime += this.deltaTime;
        if (this.fpsTime >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = 0;
        }

        // Update and render if not paused
        if (!this.isPaused) {
            this.update(this.deltaTime);
            this.render();
        }

        // Request next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(dt) {
        // Update current scene
        this.sceneManager.update(dt);

        // Update input state
        this.inputManager.update();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.CANVAS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render current scene
        this.sceneManager.render(this.ctx);
    }

    // Utility: Convert screen coordinates to game coordinates
    screenToGame(screenX, screenY) {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }

    // Get canvas dimensions
    get width() {
        return CONFIG.CANVAS.WIDTH;
    }

    get height() {
        return CONFIG.CANVAS.HEIGHT;
    }
}
