/**
 * Flavortown Dash - Obstacle Classes
 * All game obstacles: Spike, Block, Portal, Finish
 */

import { CONFIG, GAME_MODES, OBJECT_TYPES } from '../config.js';

/**
 * Base class for all game objects
 */
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isDeadly = false;
        this.isPortal = false;
        this.isFinish = false;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isVisible(cameraX, screenWidth) {
        return this.x + this.width > cameraX && this.x < cameraX + screenWidth + 100;
    }

    render(ctx, assets) {
        // Override in subclasses
    }
}

/**
 * Spike - Deadly triangle obstacle
 */
export class Spike extends GameObject {
    constructor(x, groundY) {
        const size = CONFIG.OBJECTS.SPIKE;
        super(x, groundY - size.HEIGHT, size.WIDTH, size.HEIGHT);
        this.isDeadly = true;
    }

    getBounds() {
        // Smaller hitbox for spikes (triangle shape)
        const margin = 10;
        return {
            x: this.x + margin,
            y: this.y + margin,
            width: this.width - margin * 2,
            height: this.height - margin
        };
    }

    render(ctx, assets) {
        const sprite = assets.get('spike');

        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback triangle
            ctx.fillStyle = CONFIG.COLORS.DANGER;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.closePath();
            ctx.fill();

            // Glow effect
            ctx.shadowColor = CONFIG.COLORS.DANGER;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

/**
 * Block - Solid platform
 */
export class Block extends GameObject {
    constructor(x, groundY, height = 50) {
        const size = CONFIG.OBJECTS.BLOCK.SIZE;
        // y is offset from ground
        super(x, groundY - height - size, size, size);
        this.isSolid = true;
    }

    render(ctx, assets) {
        const sprite = assets.get('floor');

        if (sprite) {
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback block
            ctx.fillStyle = CONFIG.COLORS.GROUND;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Border
            ctx.strokeStyle = CONFIG.COLORS.GROUND_TOP;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            // Inner highlight
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        }
    }
}

/**
 * Portal - Changes player game mode
 */
export class Portal extends GameObject {
    constructor(x, groundY, toMode) {
        const size = CONFIG.OBJECTS.PORTAL;
        super(x, groundY - size.HEIGHT, size.WIDTH, size.HEIGHT);
        this.toMode = toMode;
        this.isPortal = true;

        // Animation
        this.pulseTime = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.pulseTime += dt * 3;
    }

    render(ctx, assets) {
        const spriteName = this.toMode === GAME_MODES.SHIP ? 'portal_ship' : 'portal_cube';
        const sprite = assets.get(spriteName);

        // Pulse effect
        const pulse = Math.sin(this.pulseTime) * 0.1 + 1;
        const width = this.width * pulse;
        const height = this.height * pulse;
        const x = this.x - (width - this.width) / 2;
        const y = this.y - (height - this.height) / 2;

        if (sprite) {
            ctx.drawImage(sprite, x, y, width, height);
        } else {
            // Fallback portal
            const color = this.toMode === GAME_MODES.SHIP ? CONFIG.COLORS.SECONDARY : CONFIG.COLORS.PRIMARY;

            // Glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;

            // Outer ring
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.ellipse(
                x + width / 2,
                y + height / 2,
                width / 2 - 5,
                height / 2 - 5,
                0, 0, Math.PI * 2
            );
            ctx.stroke();

            // Inner fill
            ctx.fillStyle = color + '40';
            ctx.fill();

            ctx.shadowBlur = 0;

            // Icon
            ctx.fillStyle = color;
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                this.toMode === GAME_MODES.SHIP ? '✈' : '■',
                x + width / 2,
                y + height / 2
            );
        }
    }
}

/**
 * Finish Line - Level completion
 */
export class FinishLine extends GameObject {
    constructor(x, groundY) {
        super(x, 0, 100, groundY);
        this.isFinish = true;

        // Animation
        this.shimmerTime = 0;
    }

    update(dt) {
        this.shimmerTime += dt * 2;
    }

    render(ctx, assets) {
        const sprite = assets.get('finish');

        // Shimmer effect
        const shimmer = Math.sin(this.shimmerTime) * 0.2 + 0.8;

        if (sprite) {
            ctx.globalAlpha = shimmer;
            ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1;
        } else {
            // Fallback finish line
            const gradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
            gradient.addColorStop(0, CONFIG.COLORS.SUCCESS + '00');
            gradient.addColorStop(0.5, CONFIG.COLORS.SUCCESS + '80');
            gradient.addColorStop(1, CONFIG.COLORS.SUCCESS + '00');

            ctx.fillStyle = gradient;
            ctx.globalAlpha = shimmer;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1;

            // Checkered pattern at bottom
            const checkSize = 20;
            const rows = 3;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < Math.ceil(this.width / checkSize); col++) {
                    if ((row + col) % 2 === 0) {
                        ctx.fillStyle = '#ffffff';
                    } else {
                        ctx.fillStyle = '#000000';
                    }
                    ctx.fillRect(
                        this.x + col * checkSize,
                        this.height - (row + 1) * checkSize,
                        checkSize,
                        checkSize
                    );
                }
            }

            // "FINISH" text
            ctx.fillStyle = CONFIG.COLORS.SUCCESS;
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('FINISH', this.x + this.width / 2, this.height / 2);
        }
    }
}

/**
 * Factory function to create objects from level data
 */
export function createGameObject(data, groundY) {
    switch (data.type) {
        case OBJECT_TYPES.SPIKE:
            return new Spike(data.x, groundY);

        case OBJECT_TYPES.BLOCK:
            return new Block(data.x, groundY, data.y || 0);

        case OBJECT_TYPES.PORTAL_SHIP:
            return new Portal(data.x, groundY, GAME_MODES.SHIP);

        case OBJECT_TYPES.PORTAL_CUBE:
            return new Portal(data.x, groundY, GAME_MODES.CUBE);

        case OBJECT_TYPES.FINISH:
            return new FinishLine(data.x, groundY);

        default:
            console.warn(`Unknown object type: ${data.type}`);
            return null;
    }
}
