/**
 * Flavortown Dash - Level Select Scene
 * GD-style level browser
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
        this.levelsPerPage = 3;

        this.hoveredLevel = null;
        this.hoveredButton = null;

        // Animation
        this.time = 0;
        this.bgOffset = 0;
    }

    async init(data = {}) {
        this.levelManager.init();
        this.levels = this.levelManager.getAllLevels();
        this.isReady = true;
    }

    update(dt) {
        this.time += dt;
        this.bgOffset += dt * 20;

        const input = this.game.inputManager;
        const mousePos = input.getPointerPosition();

        // Reset hover states
        this.hoveredLevel = null;
        this.hoveredButton = null;

        // Check back button
        const backBtn = { x: 20, y: 20, width: 80, height: 50 };
        if (this.isPointInRect(mousePos.x, mousePos.y, backBtn)) {
            this.hoveredButton = 'back';
        }

        // Check level cards
        const startX = CONFIG.CANVAS.WIDTH / 2 - 250;
        const startY = 200;
        const cardWidth = 500;
        const cardHeight = 120;
        const gap = 20;

        const pageStart = this.currentPage * this.levelsPerPage;
        const pageLevels = this.levels.slice(pageStart, pageStart + this.levelsPerPage);

        for (let i = 0; i < pageLevels.length; i++) {
            const y = startY + i * (cardHeight + gap);
            const rect = { x: startX, y, width: cardWidth, height: cardHeight };

            if (this.isPointInRect(mousePos.x, mousePos.y, rect)) {
                this.hoveredLevel = pageLevels[i].id;
            }
        }

        // Check pagination
        if (this.levels.length > this.levelsPerPage) {
            const navY = CONFIG.CANVAS.HEIGHT - 80;
            const prevBtn = { x: CONFIG.CANVAS.WIDTH / 2 - 100, y: navY, width: 60, height: 50 };
            const nextBtn = { x: CONFIG.CANVAS.WIDTH / 2 + 40, y: navY, width: 60, height: 50 };

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
        // Purple gradient background
        this.renderBackground(ctx);
        this.renderGrid(ctx);

        // Title
        this.renderTitle(ctx, 'SELECT LEVEL', CONFIG.CANVAS.WIDTH / 2, 80);

        // Back button
        this.renderGDButton(ctx, 20, 20, 80, 50, '←', '', this.hoveredButton === 'back');

        // Level cards
        this.renderLevelCards(ctx);

        // Pagination
        if (this.levels.length > this.levelsPerPage) {
            this.renderPagination(ctx);
        }
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

        // Black outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.strokeText(text, x, y);

        // Green fill
        const gradient = ctx.createLinearGradient(x - 200, y - 30, x + 200, y + 30);
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

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, width, height, 10);
        ctx.fill();

        // Green gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
        gradient.addColorStop(0.3, CONFIG.COLORS.GD_GREEN);
        gradient.addColorStop(1, CONFIG.COLORS.GD_GREEN_DARK);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.fill();

        // Black outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icon
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, cx, cy - (label ? 5 : 0));

        if (label) {
            ctx.font = 'bold 12px Outfit, sans-serif';
            ctx.fillText(label, cx, cy + 15);
        }

        ctx.restore();
    }

    renderLevelCards(ctx) {
        const startX = CONFIG.CANVAS.WIDTH / 2 - 250;
        const startY = 200;
        const cardWidth = 500;
        const cardHeight = 120;
        const gap = 20;

        const pageStart = this.currentPage * this.levelsPerPage;
        const pageLevels = this.levels.slice(pageStart, pageStart + this.levelsPerPage);

        for (let i = 0; i < pageLevels.length; i++) {
            const level = pageLevels[i];
            const y = startY + i * (cardHeight + gap);
            const isHovered = this.hoveredLevel === level.id;

            this.renderLevelCard(ctx, startX, y, cardWidth, cardHeight, level, isHovered);
        }
    }

    renderLevelCard(ctx, x, y, width, height, level, isHovered) {
        const scale = isHovered ? 1.02 : 1;
        const cx = x + width / 2;
        const cy = y + height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(x + 4, y + 4, width, height, 15);
        ctx.fill();

        // Card background
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, isHovered ? CONFIG.COLORS.GD_GREEN : CONFIG.COLORS.GD_PURPLE);
        gradient.addColorStop(1, isHovered ? CONFIG.COLORS.GD_GREEN_DARK : CONFIG.COLORS.GD_PURPLE_DARK);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 15);
        ctx.fill();

        // Border
        ctx.strokeStyle = isHovered ? CONFIG.COLORS.GD_GREEN_LIGHT : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Level name
        ctx.font = 'bold 28px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(level.name, x + 20, y + 35);

        // Author
        ctx.font = '16px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(`by ${level.author}`, x + 20, y + 65);

        // Difficulty stars
        const difficulty = level.difficulty || 1;
        ctx.fillStyle = CONFIG.COLORS.GD_YELLOW;
        let stars = '';
        for (let s = 0; s < 5; s++) {
            stars += s < difficulty ? '★' : '☆';
        }
        ctx.font = '20px sans-serif';
        ctx.fillText(stars, x + 20, y + 95);

        // Play icon on right
        ctx.font = '40px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText('▶', x + width - 30, cy);

        // Custom badge
        if (level.isCustom) {
            ctx.font = 'bold 12px Outfit, sans-serif';
            ctx.fillStyle = CONFIG.COLORS.GD_ORANGE;
            ctx.textAlign = 'right';
            ctx.fillText('CUSTOM', x + width - 20, y + 25);
        }

        ctx.restore();
    }

    renderPagination(ctx) {
        const totalPages = Math.ceil(this.levels.length / this.levelsPerPage);
        const navY = CONFIG.CANVAS.HEIGHT - 80;
        const centerX = CONFIG.CANVAS.WIDTH / 2;

        // Previous button
        if (this.currentPage > 0) {
            this.renderGDButton(ctx, centerX - 100, navY, 60, 50, '◀', '', this.hoveredButton === 'prev');
        }

        // Page indicator
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.currentPage + 1} / ${totalPages}`, centerX, navY + 25);

        // Next button
        if ((this.currentPage + 1) * this.levelsPerPage < this.levels.length) {
            this.renderGDButton(ctx, centerX + 40, navY, 60, 50, '▶', '', this.hoveredButton === 'next');
        }
    }
}
