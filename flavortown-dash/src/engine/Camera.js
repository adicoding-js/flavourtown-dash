/**
 * Flavortown Dash - Camera System
 * Smooth camera following with effects
 */

import { CONFIG } from '../config.js';

export class Camera {
    constructor(game) {
        this.game = game;

        // Position
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;

        // Smoothing
        this.smoothing = 0.1;

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTime = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        // Zoom (for future effects)
        this.zoom = 1;
        this.targetZoom = 1;
    }

    /**
     * Set camera to follow a target
     */
    follow(target) {
        this.targetX = target.x - CONFIG.CAMERA.OFFSET_X;
        this.targetY = 0; // Fixed vertical in Geometry Dash style
    }

    /**
     * Update camera position
     */
    update(dt) {
        // Smooth camera movement
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;

        // Clamp camera to not go negative
        if (this.x < 0) this.x = 0;

        // Update screen shake
        if (this.shakeTime > 0) {
            this.shakeTime -= dt * 1000;
            const progress = this.shakeTime / this.shakeDuration;
            const intensity = this.shakeIntensity * progress;
            this.shakeOffsetX = (Math.random() - 0.5) * 2 * intensity;
            this.shakeOffsetY = (Math.random() - 0.5) * 2 * intensity;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }

        // Smooth zoom
        this.zoom += (this.targetZoom - this.zoom) * 0.1;
    }

    /**
     * Trigger screen shake effect
     */
    shake(intensity = CONFIG.CAMERA.SHAKE_INTENSITY, duration = CONFIG.CAMERA.SHAKE_DURATION) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTime = duration;
    }

    /**
     * Apply camera transform to context
     */
    applyTransform(ctx) {
        ctx.save();
        ctx.translate(
            -this.x + this.shakeOffsetX,
            -this.y + this.shakeOffsetY
        );

        if (this.zoom !== 1) {
            const centerX = this.game.width / 2;
            const centerY = this.game.height / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(this.zoom, this.zoom);
            ctx.translate(-centerX, -centerY);
        }
    }

    /**
     * Reset camera transform
     */
    resetTransform(ctx) {
        ctx.restore();
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x + this.shakeOffsetX,
            y: worldY - this.y + this.shakeOffsetY
        };
    }

    /**
     * Check if a rectangle is visible on screen
     */
    isVisible(x, y, width, height) {
        const screenX = x - this.x;
        const screenY = y - this.y;

        return (
            screenX + width > 0 &&
            screenX < this.game.width &&
            screenY + height > 0 &&
            screenY < this.game.height
        );
    }

    /**
     * Reset camera to starting position
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.shakeTime = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.zoom = 1;
        this.targetZoom = 1;
    }
}
