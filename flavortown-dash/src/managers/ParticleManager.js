/**
 * Flavortown Dash - Particle Manager
 * Particle system for visual effects
 */

import { CONFIG } from '../config.js';

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 400;
        this.vy = options.vy || (Math.random() - 0.5) * 400;
        this.size = options.size || Math.random() * 8 + 4;
        this.color = options.color || CONFIG.COLORS.PRIMARY;
        this.life = options.life || 1;
        this.maxLife = this.life;
        this.gravity = options.gravity !== undefined ? options.gravity : 500;
        this.friction = options.friction || 0.98;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.shape = options.shape || 'square'; // square, circle
    }

    update(dt) {
        // Apply gravity
        this.vy += this.gravity * dt;

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Move
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Rotate
        this.rotation += this.rotationSpeed * dt;

        // Decrease life
        this.life -= dt;
    }

    render(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        const size = this.size * (0.5 + 0.5 * alpha);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-size / 2, -size / 2, size, size);
        }

        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

export class ParticleManager {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }

    /**
     * Update all particles
     */
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Render all particles
     */
    render(ctx) {
        for (const particle of this.particles) {
            particle.render(ctx);
        }
    }

    /**
     * Add a single particle
     */
    addParticle(x, y, options = {}) {
        if (this.particles.length < this.maxParticles) {
            this.particles.push(new Particle(x, y, options));
        }
    }

    /**
     * Create death explosion effect
     */
    createDeathExplosion(x, y, color = CONFIG.COLORS.PRIMARY) {
        const count = CONFIG.PARTICLES.DEATH_COUNT;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 200 + Math.random() * 300;

            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 12 + 6,
                color: color,
                life: 0.8 + Math.random() * 0.4,
                gravity: 400
            });
        }
    }

    /**
     * Create jump particles
     */
    createJumpParticles(x, y, color = CONFIG.COLORS.PRIMARY) {
        const count = CONFIG.PARTICLES.JUMP_BURST;

        for (let i = 0; i < count; i++) {
            const angle = Math.PI + (Math.random() - 0.5) * 1.5;
            const speed = 100 + Math.random() * 150;

            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 2,
                color: color,
                life: 0.3 + Math.random() * 0.2,
                gravity: 200,
                shape: 'circle'
            });
        }
    }

    /**
     * Create trail particle
     */
    createTrailParticle(x, y, color = CONFIG.COLORS.PRIMARY) {
        this.addParticle(x, y, {
            vx: -50 + Math.random() * 20,
            vy: (Math.random() - 0.5) * 50,
            size: Math.random() * 4 + 2,
            color: color,
            life: CONFIG.PARTICLES.TRAIL_LIFETIME / 1000,
            gravity: 0,
            friction: 0.95,
            shape: 'circle'
        });
    }

    /**
     * Create portal transition effect
     */
    createPortalEffect(x, y, color = CONFIG.COLORS.SECONDARY) {
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 30 + Math.random() * 20;

            this.addParticle(
                x + Math.cos(angle) * radius,
                y + Math.sin(angle) * radius,
                {
                    vx: Math.cos(angle) * 100,
                    vy: Math.sin(angle) * 100,
                    size: Math.random() * 8 + 4,
                    color: color,
                    life: 0.5 + Math.random() * 0.3,
                    gravity: 0,
                    shape: 'circle'
                }
            );
        }
    }

    /**
     * Create beat pulse effect (for music sync)
     */
    createBeatPulse(x, y, color = CONFIG.COLORS.ACCENT) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 150;

            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4,
                color: color,
                life: 0.3,
                gravity: 0,
                friction: 0.9,
                shape: 'circle'
            });
        }
    }

    /**
     * Create finish line celebration
     */
    createCelebration(x, y, width, height) {
        const colors = [CONFIG.COLORS.PRIMARY, CONFIG.COLORS.SECONDARY, CONFIG.COLORS.ACCENT, CONFIG.COLORS.SUCCESS];

        for (let i = 0; i < 50; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;

            this.addParticle(px, py, {
                vx: (Math.random() - 0.5) * 300,
                vy: -200 - Math.random() * 300,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1 + Math.random() * 1,
                gravity: 400
            });
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }
}
