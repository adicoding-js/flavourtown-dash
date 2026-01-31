/**
 * Flavortown Dash - Ground System
 * Handles ground rendering and tiles
 */

import { CONFIG } from '../config.js';

export class Ground {
    constructor(game) {
        this.game = game;

        // Ground position
        this.y = CONFIG.CANVAS.HEIGHT - CONFIG.GROUND.HEIGHT;

        // Colors
        this.topColor = CONFIG.COLORS.GROUND_TOP;
        this.mainColor = CONFIG.COLORS.GROUND;

        // Tile settings
        this.tileWidth = CONFIG.GROUND.TILE_WIDTH;
        this.tileHeight = 50;
    }

    /**
     * Get the Y position of the ground surface
     */
    getSurfaceY() {
        return this.y;
    }

    /**
     * Set ground colors (for level theming)
     */
    setColors(topColor, mainColor) {
        this.topColor = topColor || CONFIG.COLORS.GROUND_TOP;
        this.mainColor = mainColor || CONFIG.COLORS.GROUND;
    }

    /**
     * Render the ground
     */
    render(ctx, cameraX) {
        const startTile = Math.floor(cameraX / this.tileWidth);
        const endTile = startTile + Math.ceil(CONFIG.CANVAS.WIDTH / this.tileWidth) + 2;

        // Main ground fill
        ctx.fillStyle = this.mainColor;
        ctx.fillRect(
            startTile * this.tileWidth,
            this.y,
            (endTile - startTile) * this.tileWidth,
            CONFIG.GROUND.HEIGHT
        );

        // Top accent line
        const gradient = ctx.createLinearGradient(0, this.y, 0, this.y + 10);
        gradient.addColorStop(0, this.topColor);
        gradient.addColorStop(1, this.mainColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(
            startTile * this.tileWidth,
            this.y,
            (endTile - startTile) * this.tileWidth,
            10
        );

        // Grid lines for tiles
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = startTile; i <= endTile; i++) {
            const x = i * this.tileWidth;
            ctx.beginPath();
            ctx.moveTo(x, this.y);
            ctx.lineTo(x, this.y + CONFIG.GROUND.HEIGHT);
            ctx.stroke();
        }

        // Horizontal lines
        const rows = Math.floor(CONFIG.GROUND.HEIGHT / this.tileHeight);
        for (let i = 1; i < rows; i++) {
            const y = this.y + i * this.tileHeight;
            ctx.beginPath();
            ctx.moveTo(startTile * this.tileWidth, y);
            ctx.lineTo(endTile * this.tileWidth, y);
            ctx.stroke();
        }
    }
}
