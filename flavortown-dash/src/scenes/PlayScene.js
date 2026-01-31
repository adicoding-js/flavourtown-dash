/**
 * Flavortown Dash - Play Scene
 * Main gameplay with music sync and visual effects
 */

import { Scene } from './Scene.js';
import { CONFIG, SCENES, GAME_MODES } from '../config.js';
import { Camera } from '../engine/Camera.js';
import { Player } from '../objects/Player.js';
import { Ground } from '../objects/Ground.js';
import { createGameObject } from '../objects/Obstacles.js';
import { ParticleManager } from '../managers/ParticleManager.js';
import { LevelManager } from '../managers/LevelManager.js';

export class PlayScene extends Scene {
    constructor(game) {
        super(game);

        // Core systems
        this.camera = new Camera(game);
        this.particleManager = new ParticleManager();
        this.levelManager = new LevelManager();

        // Game objects
        this.player = null;
        this.ground = null;
        this.objects = [];

        // Level data
        this.currentLevel = null;

        // Game state
        this.state = 'playing'; // playing, dead, won, paused
        this.attempts = 1;
        this.progress = 0;
        this.levelLength = 0;

        // Death/restart
        this.deathTimer = 0;
        this.deathDelay = 1.5;

        // Win state
        this.winTimer = 0;

        // Music sync effects
        this.beatIntensity = 0;
        this.bgPulse = 0;

        // Background
        this.bgImage = null;
        this.bgColor = CONFIG.COLORS.DARK;

        // UI
        this.isPaused = false;
        this.hoveredButton = null;

        // Progress bar animation
        this.displayProgress = 0;
    }

    async init(data = {}) {
        // Get level from data or load default
        if (data.level) {
            this.currentLevel = data.level;
        } else {
            this.levelManager.init();
            this.currentLevel = this.levelManager.levels[0];
        }

        // Set up level
        this.loadLevel(this.currentLevel);

        // Load and play music
        await this.game.audioManager.loadMusic(this.currentLevel.music || '/assets/music.mp3');
        this.game.audioManager.setBPM(this.currentLevel.bpm || 128);

        // Set up beat callback
        this.game.audioManager.onBeat(() => {
            this.onBeat();
        });

        // Load background image
        this.bgImage = this.game.assetManager.get('bg');

        this.isReady = true;
    }

    loadLevel(level) {
        // Set colors
        this.bgColor = level.backgroundColor || CONFIG.COLORS.DARK;

        // Create ground
        this.ground = new Ground(this.game);
        if (level.groundColor) {
            this.ground.setColors(level.groundColor, level.groundColor);
        }

        const groundY = this.ground.getSurfaceY();

        // Create player
        this.player = new Player(this.game, CONFIG.PLAYER.START_X, groundY - CONFIG.PLAYER.SIZE);
        this.player.color = level.accentColor || CONFIG.COLORS.PRIMARY;
        this.player.trailColor = level.accentColor || CONFIG.COLORS.PRIMARY;

        // Create level objects
        this.objects = [];
        let maxX = 0;

        for (const objData of level.objects) {
            const obj = createGameObject(objData, groundY);
            if (obj) {
                this.objects.push(obj);
                if (obj.x > maxX) maxX = obj.x;
            }
        }

        this.levelLength = maxX + 500;

        // Reset camera
        this.camera.reset();

        // Reset state
        this.state = 'playing';
        this.progress = 0;
        this.displayProgress = 0;
    }

    async enter() {
        // Start music
        this.game.audioManager.playMusic(false);
    }

    async exit() {
        // Stop music
        this.game.audioManager.stopMusic();
        this.game.audioManager.clearBeatCallbacks();
    }

    onBeat() {
        // Pulse effect on beat
        this.beatIntensity = 1;
        this.bgPulse = 0.15;

        // Beat particles at player
        if (this.player && !this.player.isDead) {
            this.particleManager.createBeatPulse(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.currentLevel?.accentColor || CONFIG.COLORS.ACCENT
            );
        }
    }

    update(dt) {
        if (this.isPaused) {
            this.updatePausedState(dt);
            return;
        }

        // Update audio manager for beat sync
        this.game.audioManager.update();

        // Update beat effects
        this.beatIntensity *= 0.9;
        this.bgPulse *= 0.95;

        // Update based on state
        switch (this.state) {
            case 'playing':
                this.updatePlaying(dt);
                break;
            case 'dead':
                this.updateDead(dt);
                break;
            case 'won':
                this.updateWon(dt);
                break;
        }

        // Update particles
        this.particleManager.update(dt);

        // Update progress bar smoothly
        this.displayProgress += (this.progress - this.displayProgress) * 0.1;

        // Check pause input
        if (this.game.inputManager.isKeyJustPressed('Escape')) {
            this.togglePause();
        }
    }

    updatePlaying(dt) {
        // Update player
        this.player.update(
            dt,
            this.game.inputManager,
            this.ground.getSurfaceY(),
            this.particleManager
        );

        // Trail particles
        if (Math.random() < 0.3) {
            this.particleManager.createTrailParticle(
                this.player.x,
                this.player.y + this.player.height / 2,
                this.player.trailColor
            );
        }

        // Update camera
        this.camera.follow(this.player);
        this.camera.update(dt);

        // Update objects
        for (const obj of this.objects) {
            if (obj.update) {
                obj.update(dt);
            }
        }

        // Check collisions
        this.checkCollisions();

        // Update progress
        this.progress = Math.min(1, this.player.x / this.levelLength);
    }

    updateDead(dt) {
        this.deathTimer += dt;

        // Update camera
        this.camera.update(dt);

        // Restart after delay
        if (this.deathTimer >= this.deathDelay) {
            this.restart();
        }
    }

    updateWon(dt) {
        this.winTimer += dt;

        // Celebration particles
        if (this.winTimer < 3 && Math.random() < 0.3) {
            this.particleManager.createCelebration(
                this.player.x - 50,
                100,
                200,
                300
            );
        }

        // Check for continue
        if (this.winTimer > 2 && this.game.inputManager.isJumpJustPressed()) {
            this.game.sceneManager.switchTo(SCENES.LEVEL_SELECT);
        }
    }

    updatePausedState(dt) {
        const input = this.game.inputManager;
        const mousePos = input.getPointerPosition();

        // Check button hovers
        this.hoveredButton = null;

        const centerX = CONFIG.CANVAS.WIDTH / 2;
        const centerY = CONFIG.CANVAS.HEIGHT / 2;

        const resumeBtn = { x: centerX - 100, y: centerY - 20, width: 200, height: 50 };
        const restartBtn = { x: centerX - 100, y: centerY + 50, width: 200, height: 50 };
        const menuBtn = { x: centerX - 100, y: centerY + 120, width: 200, height: 50 };

        if (this.isPointInRect(mousePos.x, mousePos.y, resumeBtn)) {
            this.hoveredButton = 'resume';
        } else if (this.isPointInRect(mousePos.x, mousePos.y, restartBtn)) {
            this.hoveredButton = 'restart';
        } else if (this.isPointInRect(mousePos.x, mousePos.y, menuBtn)) {
            this.hoveredButton = 'menu';
        }

        // Handle clicks
        if (input.justPressed) {
            if (this.hoveredButton === 'resume') {
                this.togglePause();
            } else if (this.hoveredButton === 'restart') {
                this.isPaused = false;
                this.restart();
            } else if (this.hoveredButton === 'menu') {
                this.game.sceneManager.switchTo(SCENES.MENU);
            }
        }

        // ESC to resume
        if (input.isKeyJustPressed('Escape')) {
            this.togglePause();
        }
    }

    checkCollisions() {
        const playerBounds = this.player.getBounds();

        for (const obj of this.objects) {
            // Skip if not visible
            if (!obj.isVisible(this.camera.x, CONFIG.CANVAS.WIDTH)) {
                continue;
            }

            const objBounds = obj.getBounds();

            if (this.intersects(playerBounds, objBounds)) {
                if (obj.isDeadly) {
                    // Player dies
                    this.player.die(this.particleManager, this.camera);
                    this.state = 'dead';
                    this.deathTimer = 0;
                    return;
                }

                if (obj.isPortal) {
                    // Change mode
                    this.player.setMode(obj.toMode, this.particleManager);
                }

                if (obj.isFinish) {
                    // Player wins
                    this.player.win(this.particleManager);
                    this.state = 'won';
                    this.winTimer = 0;
                    return;
                }

                if (obj.isSolid) {
                    // Collision with solid block
                    this.handleSolidCollision(playerBounds, objBounds);
                }
            }
        }
    }

    handleSolidCollision(player, block) {
        // Check if player is hitting the side (death) or landing on top
        const playerBottom = player.y + player.height;
        const playerRight = player.x + player.width;

        // If player's bottom was above block's top, they're landing
        if (playerBottom - this.player.vy * 0.016 <= block.y + 5) {
            // Land on top
            this.player.y = block.y - this.player.height;
            this.player.vy = 0;
            this.player.isGrounded = true;
        } else {
            // Hit from side - die
            this.player.die(this.particleManager, this.camera);
            this.state = 'dead';
            this.deathTimer = 0;
        }
    }

    intersects(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    restart() {
        this.player.reset();
        this.camera.reset();
        this.particleManager.clear();
        this.state = 'playing';
        this.attempts++;
        this.progress = 0;

        // Restart music
        this.game.audioManager.playMusic(false, 0);
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.game.audioManager.stopMusic();
        } else {
            this.game.audioManager.playMusic(false, this.game.audioManager.getMusicTime());
        }
    }

    render(ctx) {
        // Background with beat pulse
        this.renderBackground(ctx);

        // Apply camera transform
        this.camera.applyTransform(ctx);

        // Ground
        this.ground.render(ctx, this.camera.x);

        // Objects (only visible ones)
        for (const obj of this.objects) {
            if (obj.isVisible(this.camera.x, CONFIG.CANVAS.WIDTH)) {
                obj.render(ctx, this.game.assetManager);
            }
        }

        // Particles
        this.particleManager.render(ctx);

        // Player
        this.player.render(ctx, this.game.assetManager);

        // Reset camera transform
        this.camera.resetTransform(ctx);

        // UI
        this.renderUI(ctx);

        // Pause overlay
        if (this.isPaused) {
            this.renderPauseMenu(ctx);
        }

        // Win screen
        if (this.state === 'won') {
            this.renderWinScreen(ctx);
        }
    }

    renderBackground(ctx) {
        // Base color with pulse
        const pulseAmount = this.bgPulse * 50;
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Animated gradient overlay
        const bassLevel = this.game.audioManager.getBassLevel();
        if (bassLevel > 0.3) {
            const gradient = ctx.createRadialGradient(
                CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2, 0,
                CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2, CONFIG.CANVAS.WIDTH
            );
            const color = this.currentLevel?.accentColor || CONFIG.COLORS.PRIMARY;
            gradient.addColorStop(0, color + '20');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
        }

        // Background image parallax
        if (this.bgImage) {
            const parallax = this.camera.x * 0.3;
            ctx.globalAlpha = 0.3 + this.bgPulse;
            ctx.drawImage(
                this.bgImage,
                -parallax % CONFIG.CANVAS.WIDTH,
                0,
                CONFIG.CANVAS.WIDTH,
                CONFIG.CANVAS.HEIGHT
            );
            ctx.drawImage(
                this.bgImage,
                CONFIG.CANVAS.WIDTH - (parallax % CONFIG.CANVAS.WIDTH),
                0,
                CONFIG.CANVAS.WIDTH,
                CONFIG.CANVAS.HEIGHT
            );
            ctx.globalAlpha = 1;
        }
    }

    renderUI(ctx) {
        // Progress bar
        const barWidth = 400;
        const barHeight = 8;
        const barX = (CONFIG.CANVAS.WIDTH - barWidth) / 2;
        const barY = 30;

        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, 4);
        ctx.fill();

        // Progress
        const color = this.currentLevel?.accentColor || CONFIG.COLORS.PRIMARY;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth * this.displayProgress, barHeight, 4);
        ctx.fill();

        // Percentage
        ctx.font = '16px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(
            Math.floor(this.displayProgress * 100) + '%',
            CONFIG.CANVAS.WIDTH / 2,
            barY + 30
        );

        // Attempts
        ctx.textAlign = 'left';
        ctx.fillText(`Attempt: ${this.attempts}`, 30, 40);

        // Level name
        ctx.textAlign = 'right';
        ctx.fillText(this.currentLevel?.name || 'Unknown', CONFIG.CANVAS.WIDTH - 30, 40);
    }

    renderPauseMenu(ctx) {
        // Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Title
        this.drawText(ctx, 'PAUSED', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 - 100, {
            font: 'bold 48px Outfit, sans-serif',
            color: '#ffffff'
        });

        // Buttons
        const centerX = CONFIG.CANVAS.WIDTH / 2;
        const centerY = CONFIG.CANVAS.HEIGHT / 2;

        this.drawButton(ctx, 'RESUME', centerX, centerY, 200, 50,
            this.hoveredButton === 'resume', { color: CONFIG.COLORS.PRIMARY });
        this.drawButton(ctx, 'RESTART', centerX, centerY + 70, 200, 50,
            this.hoveredButton === 'restart', { color: CONFIG.COLORS.ACCENT });
        this.drawButton(ctx, 'MENU', centerX, centerY + 140, 200, 50,
            this.hoveredButton === 'menu', { color: CONFIG.COLORS.SECONDARY });
    }

    renderWinScreen(ctx) {
        // Overlay
        const alpha = Math.min(1, this.winTimer);
        ctx.fillStyle = `rgba(0,0,0,${alpha * 0.6})`;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        if (this.winTimer > 0.5) {
            // Title
            this.drawText(ctx, '🎉 LEVEL COMPLETE! 🎉', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 - 50, {
                font: 'bold 56px Outfit, sans-serif',
                color: CONFIG.COLORS.SUCCESS
            });

            // Stats
            this.drawText(ctx, `Attempts: ${this.attempts}`, CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 + 20, {
                font: '24px Outfit, sans-serif',
                color: '#ffffff'
            });

            if (this.winTimer > 2) {
                this.drawText(ctx, 'Click or press SPACE to continue', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 + 80, {
                    font: '20px Outfit, sans-serif',
                    color: 'rgba(255,255,255,0.7)'
                });
            }
        }
    }
}
