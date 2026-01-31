/**
 * Flavortown Dash - Menu Scene
 * Main menu with animated background
 */

import { Scene } from './Scene.js';
import { CONFIG, SCENES } from '../config.js';

export class MenuScene extends Scene {
    constructor(game) {
        super(game);

        // Animation
        this.time = 0;
        this.particles = [];

        // Buttons
        this.buttons = [];
        this.hoveredButton = null;

        // Background animation
        this.bgOffset = 0;

        // Title animation
        this.titleScale = 1;
        this.titleBounce = 0;
    }

    async init(data = {}) {
        // Initialize floating particles
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * CONFIG.CANVAS.WIDTH,
                y: Math.random() * CONFIG.CANVAS.HEIGHT,
                size: Math.random() * 4 + 2,
                speed: Math.random() * 30 + 10,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        // Define buttons
        const centerX = CONFIG.CANVAS.WIDTH / 2;
        const startY = 350;
        const spacing = 80;

        this.buttons = [
            { id: 'play', text: '▶  PLAY', x: centerX, y: startY, width: 280, height: 60, color: CONFIG.COLORS.PRIMARY },
            { id: 'editor', text: '🔧  EDITOR', x: centerX, y: startY + spacing, width: 280, height: 60, color: CONFIG.COLORS.SECONDARY },
            { id: 'settings', text: '⚙  SETTINGS', x: centerX, y: startY + spacing * 2, width: 280, height: 60, color: CONFIG.COLORS.ACCENT }
        ];

        this.isReady = true;
    }

    async enter() {
        // Resume audio context on user interaction
        this.game.canvas.addEventListener('click', () => {
            this.game.audioManager.resume();
        }, { once: true });
    }

    update(dt) {
        this.time += dt;

        // Update title bounce
        this.titleBounce = Math.sin(this.time * 3) * 5;
        this.titleScale = 1 + Math.sin(this.time * 2) * 0.02;

        // Update background
        this.bgOffset += dt * 30;

        // Update particles
        for (const p of this.particles) {
            p.y -= p.speed * dt;
            if (p.y < -10) {
                p.y = CONFIG.CANVAS.HEIGHT + 10;
                p.x = Math.random() * CONFIG.CANVAS.WIDTH;
            }
        }

        // Check button hover
        const input = this.game.inputManager;
        const mousePos = input.getPointerPosition();

        this.hoveredButton = null;
        for (const btn of this.buttons) {
            const rect = { x: btn.x - btn.width / 2, y: btn.y - btn.height / 2, width: btn.width, height: btn.height };
            if (this.isPointInRect(mousePos.x, mousePos.y, rect)) {
                this.hoveredButton = btn.id;
            }
        }

        // Check button click
        if (input.justPressed) {
            if (this.hoveredButton === 'play') {
                this.game.sceneManager.switchTo(SCENES.LEVEL_SELECT);
            } else if (this.hoveredButton === 'editor') {
                this.game.sceneManager.switchTo(SCENES.EDITOR);
            } else if (this.hoveredButton === 'settings') {
                this.game.sceneManager.switchTo(SCENES.SETTINGS);
            }
        }
    }

    render(ctx) {
        // Animated gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT);
        const hue1 = (this.time * 10) % 360;
        const hue2 = (hue1 + 60) % 360;
        gradient.addColorStop(0, `hsl(${hue1}, 50%, 8%)`);
        gradient.addColorStop(1, `hsl(${hue2}, 50%, 5%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Grid pattern
        this.renderGrid(ctx);

        // Floating particles
        for (const p of this.particles) {
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = CONFIG.COLORS.PRIMARY;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Title
        this.renderTitle(ctx);

        // Buttons
        for (const btn of this.buttons) {
            this.drawButton(
                ctx,
                btn.text,
                btn.x,
                btn.y,
                btn.width,
                btn.height,
                this.hoveredButton === btn.id,
                { color: btn.color }
            );
        }

        // Version / Credits
        ctx.font = '14px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.textAlign = 'center';
        ctx.fillText('v1.0 • Made with ❤️', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 30);

        // Controls hint
        ctx.fillText('SPACE / CLICK / TAP to jump', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 60);
    }

    renderGrid(ctx) {
        const gridSize = 50;
        const offset = this.bgOffset % gridSize;

        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = -offset; x < CONFIG.CANVAS.WIDTH; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CONFIG.CANVAS.HEIGHT);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < CONFIG.CANVAS.HEIGHT; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CONFIG.CANVAS.WIDTH, y);
            ctx.stroke();
        }
    }

    renderTitle(ctx) {
        const centerX = CONFIG.CANVAS.WIDTH / 2;
        const titleY = 150 + this.titleBounce;

        ctx.save();
        ctx.translate(centerX, titleY);
        ctx.scale(this.titleScale, this.titleScale);

        // Glow effect
        ctx.shadowColor = CONFIG.COLORS.PRIMARY;
        ctx.shadowBlur = 30;

        // Main title
        ctx.font = 'bold 72px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Gradient text
        const textGradient = ctx.createLinearGradient(-200, 0, 200, 0);
        textGradient.addColorStop(0, CONFIG.COLORS.PRIMARY);
        textGradient.addColorStop(0.5, CONFIG.COLORS.ACCENT);
        textGradient.addColorStop(1, CONFIG.COLORS.SECONDARY);

        ctx.fillStyle = textGradient;
        ctx.fillText('FLAVORTOWN', 0, 0);

        // Subtitle
        ctx.shadowBlur = 15;
        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('DASH', 0, 55);

        ctx.restore();
    }
}
