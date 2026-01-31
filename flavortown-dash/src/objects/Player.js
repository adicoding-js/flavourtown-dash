/**
 * Flavortown Dash - Player Controller
 * Handles player movement, physics, and game modes
 */

import { CONFIG, GAME_MODES } from '../config.js';

export class Player {
    constructor(game, x, y) {
        this.game = game;

        // Position
        this.x = x || CONFIG.PLAYER.START_X;
        this.y = y || CONFIG.PLAYER.GROUND_Y;
        this.startX = this.x;
        this.startY = this.y;

        // Size
        this.width = CONFIG.PLAYER.SIZE;
        this.height = CONFIG.PLAYER.SIZE;

        // Physics
        this.vx = CONFIG.PHYSICS.PLAYER_SPEED;
        this.vy = 0;
        this.gravity = CONFIG.PHYSICS.GRAVITY;

        // State
        this.mode = GAME_MODES.CUBE;
        this.isGrounded = true;
        this.isDead = false;
        this.hasWon = false;

        // Visuals
        this.rotation = 0;
        this.targetRotation = 0;
        this.color = CONFIG.COLORS.PRIMARY;
        this.trailColor = CONFIG.COLORS.PRIMARY;

        // Load sprite preference
        const spritePref = localStorage.getItem('flavortown_sprite');
        this.customImage = null;

        if (spritePref === 'custom') {
            const customData = localStorage.getItem('flavortown_custom_skin');
            if (customData) {
                const img = new Image();
                img.src = customData;
                this.customImage = img;
            }
        } else if (spritePref) {
            // Set colors for built-in skins
            const spriteColors = {
                'fire': '#ff4400',
                'ice': '#00ccff',
                'gold': CONFIG.COLORS.GD_YELLOW,
                'neon': '#ff00ff'
            };
            if (spriteColors[spritePref]) {
                this.color = spriteColors[spritePref];
                this.trailColor = this.color;
            }
        }

        // Trail
        this.trail = [];
        this.trailMaxLength = CONFIG.PLAYER.TRAIL_LENGTH;
        this.trailTimer = 0;

        // Jump state
        this.jumpCount = 0;
        this.jumpBufferTimer = 0;

        // Animation
        this.scale = 1;
        this.squash = { x: 1, y: 1 };
    }

    /**
     * Update player physics and state
     */
    update(dt, input, groundY, particleManager) {
        if (this.isDead || this.hasWon) return;

        // Store previous position for trail
        this.updateTrail(dt);

        // Handle input based on game mode
        if (this.mode === GAME_MODES.CUBE) {
            this.updateCubeMode(dt, input, groundY, particleManager);
        } else if (this.mode === GAME_MODES.SHIP) {
            this.updateShipMode(dt, input, groundY);
        }

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Ground collision
        const groundLimit = groundY - this.height;
        if (this.y >= groundLimit) {
            this.y = groundLimit;
            this.vy = 0;
            this.isGrounded = true;
            this.jumpCount = 0;

            // Cube rotation snaps to 90 degrees when landing
            if (this.mode === GAME_MODES.CUBE) {
                this.rotation = Math.round(this.rotation / 90) * 90;
            }
        } else {
            this.isGrounded = false;
        }

        // Ceiling collision (for ship mode)
        if (this.y < 50) {
            this.y = 50;
            this.vy = 0;
        }

        // Update rotation
        this.updateRotation(dt);

        // Update squash/stretch animation
        this.updateSquash(dt);
    }

    /**
     * Cube mode physics - tap to jump
     */
    updateCubeMode(dt, input, groundY, particleManager) {
        // Apply gravity
        this.vy += this.gravity * dt;

        // Clamp velocity
        if (this.vy > CONFIG.PHYSICS.TERMINAL_VELOCITY) {
            this.vy = CONFIG.PHYSICS.TERMINAL_VELOCITY;
        }

        // Update jump buffer
        if (input.isJumpJustPressed()) {
            this.jumpBufferTimer = 0.1; // 100ms buffer
        }
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer -= dt;
        }

        // Jump logic (grounded or double jump)
        if (this.jumpBufferTimer > 0) {
            if (this.isGrounded) {
                this.jump(particleManager);
                this.jumpBufferTimer = 0; // Consume buffer
            } else if (this.jumpCount < 2) {
                this.jump(particleManager);
                this.jumpBufferTimer = 0; // Consume buffer
            }
        }

        // Rotate while in air
        if (!this.isGrounded) {
            this.targetRotation += CONFIG.PLAYER.ROTATION_SPEED * dt;
        }
    }

    /**
     * Ship mode physics - hold to fly up
     */
    updateShipMode(dt, input, groundY) {
        if (input.isJumpPressed()) {
            // Fly up when holding
            this.vy += CONFIG.PHYSICS.SHIP_LIFT * dt;
        } else {
            // Fall when not holding
            this.vy += CONFIG.PHYSICS.SHIP_FALL * dt;
        }

        // Clamp velocity
        this.vy = Math.max(-800, Math.min(800, this.vy));

        // Tilt based on velocity
        this.targetRotation = this.vy * 0.05;
    }

    /**
     * Perform jump action
     */
    jump(particleManager) {
        this.vy = CONFIG.PHYSICS.JUMP_FORCE;
        this.isGrounded = false;
        this.jumpCount++;

        // Squash effect
        this.squash = { x: 1.3, y: 0.7 };

        // Jump particles
        if (particleManager) {
            particleManager.createJumpParticles(
                this.x + this.width / 2,
                this.y + this.height,
                this.trailColor
            );
        }
    }

    /**
     * Update rotation smoothly
     */
    updateRotation(dt) {
        if (this.mode === GAME_MODES.CUBE) {
            this.rotation += (this.targetRotation - this.rotation) * 0.2;
        } else {
            this.rotation += (this.targetRotation - this.rotation) * 0.1;
        }
    }

    /**
     * Update squash/stretch effect
     */
    updateSquash(dt) {
        this.squash.x += (1 - this.squash.x) * 0.2;
        this.squash.y += (1 - this.squash.y) * 0.2;
    }

    /**
     * Update trail effect
     */
    updateTrail(dt) {
        this.trailTimer += dt;

        if (this.trailTimer >= 0.03) {
            this.trailTimer = 0;

            this.trail.unshift({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                alpha: 1
            });

            // Limit trail length
            while (this.trail.length > this.trailMaxLength) {
                this.trail.pop();
            }
        }

        // Fade trail
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].alpha = 1 - (i / this.trailMaxLength);
        }
    }

    /**
     * Change game mode
     */
    setMode(mode, particleManager) {
        if (this.mode === mode) return;

        this.mode = mode;

        // Portal effect
        if (particleManager) {
            const color = mode === GAME_MODES.SHIP ? CONFIG.COLORS.SECONDARY : CONFIG.COLORS.PRIMARY;
            particleManager.createPortalEffect(
                this.x + this.width / 2,
                this.y + this.height / 2,
                color
            );
        }

        // Reset rotation for ship mode
        if (mode === GAME_MODES.SHIP) {
            this.targetRotation = 0;
        }
    }

    /**
     * Player death
     */
    die(particleManager, camera) {
        if (this.isDead) return;

        this.isDead = true;
        this.vx = 0;
        this.vy = 0;

        // Death explosion
        if (particleManager) {
            particleManager.createDeathExplosion(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.color
            );
        }

        // Screen shake
        if (camera) {
            camera.shake(15, 300);
        }
    }

    /**
     * Player wins
     */
    win(particleManager) {
        if (this.hasWon) return;

        this.hasWon = true;
        this.vx = 0;

        // Celebration
        if (particleManager) {
            particleManager.createCelebration(
                this.x - 100,
                0,
                300,
                CONFIG.CANVAS.HEIGHT
            );
        }
    }

    /**
     * Reset player to starting state
     */
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = CONFIG.PHYSICS.PLAYER_SPEED;
        this.vy = 0;
        this.rotation = 0;
        this.targetRotation = 0;
        this.mode = GAME_MODES.CUBE;
        this.isGrounded = true;
        this.isDead = false;
        this.hasWon = false;
        this.jumpCount = 0;
        this.jumpBufferTimer = 0;
        this.trail = [];
        this.squash = { x: 1, y: 1 };
    }

    /**
     * Get player bounding box for collision
     */
    getBounds() {
        // Slightly smaller hitbox for better game feel
        const margin = 5;
        return {
            x: this.x + margin,
            y: this.y + margin,
            width: this.width - margin * 2,
            height: this.height - margin * 2
        };
    }

    /**
     * Render player
     */
    render(ctx, assets) {
        if (this.isDead) return;

        // Render trail
        this.renderTrail(ctx);

        // Get sprite based on mode
        const sprite = this.mode === GAME_MODES.SHIP ? assets.get('ship') : assets.get('player');

        ctx.save();

        // Position at center
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Apply rotation
        ctx.rotate(this.rotation * Math.PI / 180);

        // Apply squash/stretch
        ctx.scale(this.squash.x, this.squash.y);

        // Draw sprite or fallback
        if (this.mode === GAME_MODES.CUBE && this.customImage) {
            // Draw custom skin
            ctx.drawImage(
                this.customImage,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else if (sprite) {
            ctx.drawImage(
                sprite,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Fallback to colored square
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // Add inner detail
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(-this.width / 4, -this.height / 4, this.width / 2, this.height / 2);
        }

        ctx.restore();
    }

    /**
     * Render player trail
     */
    renderTrail(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const size = (CONFIG.PLAYER.SIZE / 3) * point.alpha;

            ctx.globalAlpha = point.alpha * 0.5;
            ctx.fillStyle = this.trailColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}
