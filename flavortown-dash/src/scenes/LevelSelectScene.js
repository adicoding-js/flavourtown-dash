/**
 * Flavortown Dash - Level Select Scene
 * Choose from built-in and custom levels
 */

import { Scene } from './Scene.js';
import { CONFIG, SCENES } from '../config.js';
import { LevelManager } from '../managers/LevelManager.js';

export class LevelSelectScene extends Scene {
    constructor(game) {
        super(game);

        this.levelManager = new LevelManager();
        this.levels = [];
        this.currentPage = 0;
        this.levelsPerPage = 6;

        this.hoveredLevel = null;
        this.hoveredButton = null;

        // Animation
        this.time = 0;
    }

    async init(data = {}) {
        this.levelManager.init();
        this.levels = this.levelManager.getAllLevels();
        this.isReady = true;
    }

    update(dt) {
        this.time += dt;

        const input = this.game.inputManager;
        const mousePos = input.getPointerPosition();

        // Reset hover states
        this.hoveredLevel = null;
        this.hoveredButton = null;

        // Check back button
        const backBtn = { x: 30, y: 30, width: 100, height: 50 };
        if (this.isPointInRect(mousePos.x, mousePos.y, backBtn)) {
            this.hoveredButton = 'back';
        }

        // Check level cards
        const startX = 100;
        const startY = 150;
        const cardWidth = 350;
        const cardHeight = 150;
        const gap = 30;
        const cols = 3;

        const pageStart = this.currentPage * this.levelsPerPage;
        const pageLevels = this.levels.slice(pageStart, pageStart + this.levelsPerPage);

        for (let i = 0; i < pageLevels.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (cardWidth + gap);
            const y = startY + row * (cardHeight + gap);

            if (this.isPointInRect(mousePos.x, mousePos.y, { x, y, width: cardWidth, height: cardHeight })) {
                this.hoveredLevel = pageLevels[i].id;
            }
        }

        // Check pagination
        if (this.levels.length > this.levelsPerPage) {
            const prevBtn = { x: CONFIG.CANVAS.WIDTH / 2 - 100, y: CONFIG.CANVAS.HEIGHT - 80, width: 80, height: 50 };
            const nextBtn = { x: CONFIG.CANVAS.WIDTH / 2 + 20, y: CONFIG.CANVAS.HEIGHT - 80, width: 80, height: 50 };

            if (this.isPointInRect(mousePos.x, mousePos.y, prevBtn) && this.currentPage > 0) {
                this.hoveredButton = 'prev';
            }
            if (this.isPointInRect(mousePos.x, mousePos.y, nextBtn) &&
                (this.currentPage + 1) * this.levelsPerPage < this.levels.length) {
                this.hoveredButton = 'next';
            }
        }

        // Handle clicks
        if (input.justPressed) {
            if (this.hoveredButton === 'back') {
                this.game.sceneManager.switchTo(SCENES.MENU);
            } else if (this.hoveredButton === 'prev') {
                this.currentPage--;
            } else if (this.hoveredButton === 'next') {
                this.currentPage++;
            } else if (this.hoveredLevel) {
                const level = this.levelManager.getLevel(this.hoveredLevel);
                this.game.sceneManager.switchTo(SCENES.PLAY, { level });
            }
        }
    }

    render(ctx) {
        // Background
        ctx.fillStyle = CONFIG.COLORS.DARK;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Title
        this.drawText(ctx, 'SELECT LEVEL', CONFIG.CANVAS.WIDTH / 2, 70, {
            font: 'bold 48px Outfit, sans-serif',
            color: CONFIG.COLORS.PRIMARY
        });

        // Back button
        this.drawButton(ctx, '← BACK', 80, 55, 100, 50, this.hoveredButton === 'back', {
            fontSize: 18,
            color: CONFIG.COLORS.SECONDARY
        });

        // Level cards
        this.renderLevelCards(ctx);

        // Pagination
        if (this.levels.length > this.levelsPerPage) {
            this.renderPagination(ctx);
        }
    }

    renderLevelCards(ctx) {
        const startX = 100;
        const startY = 150;
        const cardWidth = 350;
        const cardHeight = 150;
        const gap = 30;
        const cols = 3;

        const pageStart = this.currentPage * this.levelsPerPage;
        const pageLevels = this.levels.slice(pageStart, pageStart + this.levelsPerPage);

        for (let i = 0; i < pageLevels.length; i++) {
            const level = pageLevels[i];
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (cardWidth + gap);
            const y = startY + row * (cardHeight + gap);

            const isHovered = this.hoveredLevel === level.id;

            // Card background
            ctx.fillStyle = isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
            ctx.strokeStyle = level.accentColor || CONFIG.COLORS.PRIMARY;
            ctx.lineWidth = isHovered ? 3 : 2;

            ctx.beginPath();
            ctx.roundRect(x, y, cardWidth, cardHeight, 12);
            ctx.fill();
            ctx.stroke();

            if (isHovered) {
                ctx.shadowColor = level.accentColor || CONFIG.COLORS.PRIMARY;
                ctx.shadowBlur = 20;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Level name
            ctx.font = 'bold 24px Outfit, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(level.name, x + 20, y + 40);

            // Author
            ctx.font = '16px Outfit, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText(`by ${level.author}`, x + 20, y + 70);

            // Difficulty stars
            const difficulty = level.difficulty || 1;
            ctx.fillStyle = CONFIG.COLORS.ACCENT;
            let stars = '';
            for (let s = 0; s < 5; s++) {
                stars += s < difficulty ? '★' : '☆';
            }
            ctx.font = '20px sans-serif';
            ctx.fillText(stars, x + 20, y + 100);

            // Custom level indicator
            if (level.isCustom) {
                ctx.fillStyle = CONFIG.COLORS.SECONDARY;
                ctx.font = '14px Outfit, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText('CUSTOM', x + cardWidth - 20, y + 40);
            }

            // Play icon
            ctx.font = '36px sans-serif';
            ctx.fillStyle = level.accentColor || CONFIG.COLORS.PRIMARY;
            ctx.textAlign = 'right';
            ctx.fillText('▶', x + cardWidth - 25, y + cardHeight - 30);
        }
    }

    renderPagination(ctx) {
        const totalPages = Math.ceil(this.levels.length / this.levelsPerPage);
        const y = CONFIG.CANVAS.HEIGHT - 55;

        // Previous button
        if (this.currentPage > 0) {
            this.drawButton(ctx, '◀', CONFIG.CANVAS.WIDTH / 2 - 60, y, 80, 50,
                this.hoveredButton === 'prev', { fontSize: 20 });
        }

        // Page indicator
        this.drawText(ctx, `${this.currentPage + 1} / ${totalPages}`, CONFIG.CANVAS.WIDTH / 2, y, {
            font: '20px Outfit, sans-serif',
            color: 'rgba(255,255,255,0.6)'
        });

        // Next button
        if ((this.currentPage + 1) * this.levelsPerPage < this.levels.length) {
            this.drawButton(ctx, '▶', CONFIG.CANVAS.WIDTH / 2 + 60, y, 80, 50,
                this.hoveredButton === 'next', { fontSize: 20 });
        }
    }
}
