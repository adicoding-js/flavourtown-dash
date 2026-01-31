/**
 * Flavortown Dash - Menu Scene
 * Geometry Dash style main menu
 */

import { Scene } from './Scene.js';
import { CONFIG, SCENES } from '../config.js';

export class MenuScene extends Scene {
    constructor(game) {
        super(game);

        // Animation
        this.time = 0;
        this.bgOffset = 0;

        // Title animation
        this.titleBounce = 0;

        // Buttons
        this.hoveredButton = null;

        // Sprite modal
        this.showSpriteModal = false;
        this.selectedSprite = 'default';
        this.sprites = ['default', 'fire', 'ice', 'gold', 'neon'];

        // Social links
        this.socials = [
            { id: 'github', iconPath: '/assets/github.png', url: 'https://github.com/adicoding-js' },
            { id: 'slack', iconPath: '/assets/slack.png', url: 'https://hackclub.enterprise.slack.com/team/U0A1XMKQU6S' }
        ];

        // Pre-load social icons
        this.socialImages = {};
        this.socials.forEach(social => {
            if (social.iconPath) {
                const img = new Image();
                img.src = social.iconPath;
                this.socialImages[social.id] = img;
            }
        });

        // File input for skin upload
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);

        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    try {
                        localStorage.setItem('flavortown_custom_skin', dataUrl);
                        localStorage.setItem('flavortown_sprite', 'custom');
                        this.selectedSprite = 'custom';
                    } catch (err) {
                        console.error('Failed to save skin (too large?):', err);
                        alert('Image too large to save! Try a smaller image.');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    async init(data = {}) {
        // Load saved sprite preference
        const saved = localStorage.getItem('flavortown_sprite');
        if (saved) {
            this.selectedSprite = saved;
        }
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

        // Update background scroll
        this.bgOffset += dt * 20;

        // Check button hover
        const input = this.game.inputManager;
        const mousePos = input.getPointerPosition();

        this.hoveredButton = null;

        if (this.showSpriteModal) {
            this.updateSpriteModal(mousePos, input);
            return;
        }

        // Check main buttons
        const buttons = this.getButtonPositions();
        for (const btn of buttons) {
            if (this.isPointInRect(mousePos.x, mousePos.y, btn.rect)) {
                this.hoveredButton = btn.id;
            }
        }

        // Check social icons
        const socialY = CONFIG.CANVAS.HEIGHT - 50;
        const socialStartX = 40;
        const socialSize = 40;
        const socialGap = 55;

        for (let i = 0; i < this.socials.length; i++) {
            const x = socialStartX + i * socialGap;
            if (this.isPointInRect(mousePos.x, mousePos.y, { x: x - socialSize / 2, y: socialY - socialSize / 2, width: socialSize, height: socialSize })) {
                this.hoveredButton = this.socials[i].id;
            }
        }

        // Handle clicks
        if (input.justPressed) {
            this.handleClick();
        }
    }

    updateSpriteModal(mousePos, input) {
        // Check sprite options
        const modalX = CONFIG.CANVAS.WIDTH / 2 - 200;
        const modalY = CONFIG.CANVAS.HEIGHT / 2 - 150;
        const optionSize = 60;
        const gap = 20;

        for (let i = 0; i < this.sprites.length; i++) {
            const x = modalX + 40 + i * (optionSize + gap);
            const y = modalY + 100;
            if (this.isPointInRect(mousePos.x, mousePos.y, { x, y, width: optionSize, height: optionSize })) {
                this.hoveredButton = `sprite_${this.sprites[i]}`;
            }
        }

        // Custom/Upload option (next to others)
        const customX = modalX + 40 + this.sprites.length * (optionSize + gap);
        const customY = modalY + 100;
        if (this.isPointInRect(mousePos.x, mousePos.y, { x: customX, y: customY, width: optionSize, height: optionSize })) {
            this.hoveredButton = 'sprite_custom_upload';
        }

        // Close button
        const closeBtn = { x: modalX + 150, y: modalY + 220, width: 100, height: 40 };
        if (this.isPointInRect(mousePos.x, mousePos.y, closeBtn)) {
            this.hoveredButton = 'close_modal';
        }

        // Handle clicks
        if (input.justPressed) {
            if (this.hoveredButton?.startsWith('sprite_')) {
                if (this.hoveredButton === 'sprite_custom_upload') {
                    // Trigger file upload
                    this.fileInput.click();
                } else {
                    this.selectedSprite = this.hoveredButton.replace('sprite_', '');
                    localStorage.setItem('flavortown_sprite', this.selectedSprite);
                }
            } else if (this.hoveredButton === 'close_modal') {
                this.showSpriteModal = false;
            }
        }

        // ESC to close
        if (input.isKeyJustPressed('Escape')) {
            this.showSpriteModal = false;
        }
    }

    getButtonPositions() {
        const centerX = CONFIG.CANVAS.WIDTH / 2;
        const centerY = CONFIG.CANVAS.HEIGHT / 2;

        return [
            // Main Play button (center)
            {
                id: 'play',
                rect: { x: centerX - 80, y: centerY - 60, width: 160, height: 160 },
                icon: '▶',
                label: 'PLAY',
                size: 'large'
            },
            // Cube sprite customizer (left of play)
            {
                id: 'sprite',
                rect: { x: centerX - 200, y: centerY - 40, width: 80, height: 80 },
                icon: '🎨',
                label: '',
                size: 'medium'
            },
            // Editor button (left bottom)
            {
                id: 'editor',
                rect: { x: centerX - 200, y: centerY + 60, width: 80, height: 80 },
                icon: '🛠️',
                label: '',
                size: 'medium'
            },
            // Settings (bottom center)
            {
                id: 'settings',
                rect: { x: centerX - 80, y: CONFIG.CANVAS.HEIGHT - 100, width: 160, height: 50 },
                icon: '⚙',
                label: 'SETTINGS',
                size: 'small'
            }
        ];
    }

    handleClick() {
        switch (this.hoveredButton) {
            case 'play':
                this.game.sceneManager.switchTo(SCENES.LEVEL_SELECT);
                break;
            case 'editor':
                this.game.sceneManager.switchTo(SCENES.EDITOR);
                break;
            case 'settings':
                this.game.sceneManager.switchTo(SCENES.SETTINGS);
                break;
            case 'sprite':
                this.showSpriteModal = true;
                break;
            case 'github':
                window.open('https://github.com/adicoding-js', '_blank');
                break;
            case 'slack':
                window.open('https://slack.com', '_blank');
                break;
        }
    }

    render(ctx) {
        // Purple gradient background
        this.renderBackground(ctx);

        // Grid pattern
        this.renderGrid(ctx);

        // Diamond decoration (left side)
        this.renderDiamond(ctx);

        // Title
        this.renderTitle(ctx);

        // Main buttons
        this.renderButtons(ctx);

        // Branding and socials
        this.renderBranding(ctx);

        // Sprite modal
        if (this.showSpriteModal) {
            this.renderSpriteModal(ctx);
        }
    }

    renderBackground(ctx) {
        // Purple gradient like GD
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

        // Vertical lines
        for (let x = -offset; x < CONFIG.CANVAS.WIDTH + gridSize; x += gridSize) {
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

    renderDiamond(ctx) {
        // White diamond/chevron decoration on left side (like GD)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const startX = 30;
        const midY = CONFIG.CANVAS.HEIGHT / 2 + 50;
        const size = 120;

        ctx.beginPath();
        ctx.moveTo(startX, midY - size);
        ctx.lineTo(startX + size, midY);
        ctx.lineTo(startX, midY + size);
        ctx.stroke();

        // Inner line
        ctx.beginPath();
        ctx.moveTo(startX + 30, midY - size + 40);
        ctx.lineTo(startX + size - 20, midY);
        ctx.lineTo(startX + 30, midY + size - 40);
        ctx.stroke();
    }

    renderTitle(ctx) {
        const centerX = CONFIG.CANVAS.WIDTH / 2;
        const titleY = 100 + this.titleBounce;

        ctx.save();

        // Title text with GD-style blocky look
        ctx.font = 'bold 64px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Black outline/shadow
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.strokeText('FLAVORTOWN', centerX + 3, titleY + 3);
        ctx.strokeText('DASH', centerX + 3, titleY + 63);

        // Green gradient fill
        const gradient = ctx.createLinearGradient(0, titleY - 40, 0, titleY + 100);
        gradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
        gradient.addColorStop(0.5, CONFIG.COLORS.GD_GREEN);
        gradient.addColorStop(1, CONFIG.COLORS.GD_GREEN_DARK);

        ctx.fillStyle = gradient;
        ctx.lineWidth = 4;
        ctx.strokeText('FLAVORTOWN', centerX, titleY);
        ctx.fillText('FLAVORTOWN', centerX, titleY);
        ctx.strokeText('DASH', centerX, titleY + 60);
        ctx.fillText('DASH', centerX, titleY + 60);

        ctx.restore();
    }

    renderButtons(ctx) {
        const buttons = this.getButtonPositions();

        for (const btn of buttons) {
            const isHovered = this.hoveredButton === btn.id;
            this.renderGDButton(ctx, btn, isHovered);
        }
    }

    renderGDButton(ctx, btn, isHovered) {
        const { rect, icon, label, size } = btn;
        const scale = isHovered ? 1.05 : 1;

        ctx.save();

        // Center and scale
        const cx = rect.x + rect.width / 2;
        const cy = rect.y + rect.height / 2;
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);

        // Button shape (rounded square with thick black outline)
        const radius = size === 'large' ? 20 : size === 'medium' ? 15 : 10;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(rect.x + 4, rect.y + 4, rect.width, rect.height, radius);
        ctx.fill();

        // Green gradient fill
        const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height);
        gradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
        gradient.addColorStop(0.3, CONFIG.COLORS.GD_GREEN);
        gradient.addColorStop(1, CONFIG.COLORS.GD_GREEN_DARK);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
        ctx.fill();

        // Black outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Inner highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rect.x + 4, rect.y + 4, rect.width - 8, rect.height / 2 - 4, radius - 2);
        ctx.stroke();

        // Icon
        const fontSize = size === 'large' ? 64 : size === 'medium' ? 36 : 24;
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Icon shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillText(icon, cx + 2, cy - (label ? 10 : 0) + 2);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(icon, cx, cy - (label ? 10 : 0));

        // Label (if any)
        if (label) {
            ctx.font = `bold ${size === 'large' ? 20 : 14}px Outfit, sans-serif`;
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillText(label, cx + 1, cy + (size === 'large' ? 50 : 25) + 1);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, cx, cy + (size === 'large' ? 50 : 25));
        }

        ctx.restore();
    }

    renderBranding(ctx) {
        const bottomY = CONFIG.CANVAS.HEIGHT - 30;

        // Username with GitHub styling
        ctx.font = 'bold 18px Outfit, sans-serif';
        ctx.textAlign = 'left';

        // GitHub-style username
        ctx.fillStyle = CONFIG.COLORS.GD_ORANGE;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText('@adicoding-js', 20, bottomY - 35);
        ctx.fillText('@adicoding-js', 20, bottomY - 35);

        // Social icons
        const socialStartX = 40;
        const socialY = bottomY;
        const iconSize = 35;

        for (let i = 0; i < this.socials.length; i++) {
            const social = this.socials[i];
            const x = socialStartX + i * 55;
            this.renderSocialIcon(ctx, x, socialY, social, iconSize);
        }

        // Controls hint (bottom right)
        ctx.font = '14px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('SPACE / CLICK / TAP to jump', CONFIG.CANVAS.WIDTH - 20, CONFIG.CANVAS.HEIGHT - 20);
    }

    renderSocialIcon(ctx, x, y, social, size) {
        const isHovered = this.hoveredButton === social.id;
        const scale = isHovered ? 1.2 : 1;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Circle background with GD style
        const gradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, size / 2);
        if (isHovered) {
            gradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
            gradient.addColorStop(1, CONFIG.COLORS.GD_GREEN);
        } else {
            gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
            gradient.addColorStop(1, 'rgba(255,255,255,0.1)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw custom icon image if loaded
        if (this.socialImages[social.id]) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(this.socialImages[social.id], -size / 2, -size / 2, size, size);
            ctx.restore();
        } else {
            // Fallback to emoji icon
            ctx.font = `${size * 0.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(social.icon || '?', 0, 0);
        }

        ctx.restore();
    }

    renderSpriteModal(ctx) {
        // Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Modal box
        const modalX = CONFIG.CANVAS.WIDTH / 2 - 200;
        const modalY = CONFIG.CANVAS.HEIGHT / 2 - 150;
        const modalWidth = 400;
        const modalHeight = 300;

        // Modal background
        const gradient = ctx.createLinearGradient(modalX, modalY, modalX, modalY + modalHeight);
        gradient.addColorStop(0, CONFIG.COLORS.GD_PURPLE);
        gradient.addColorStop(1, CONFIG.COLORS.GD_PURPLE_DARK);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(modalX, modalY, modalWidth, modalHeight, 20);
        ctx.fill();

        // Border
        ctx.strokeStyle = CONFIG.COLORS.GD_GREEN;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Title
        ctx.font = 'bold 28px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText('SELECT SPRITE', modalX + modalWidth / 2, modalY + 50);
        ctx.fillText('SELECT SPRITE', modalX + modalWidth / 2, modalY + 50);

        // Sprite options
        const optionSize = 60;
        const gap = 20;
        const startX = modalX + 40;
        const optionY = modalY + 100;

        const spriteColors = {
            'default': CONFIG.COLORS.PRIMARY,
            'fire': '#ff4400',
            'ice': '#00ccff',
            'gold': CONFIG.COLORS.GD_YELLOW,
            'neon': '#ff00ff'
        };

        for (let i = 0; i < this.sprites.length; i++) {
            const sprite = this.sprites[i];
            const x = startX + i * (optionSize + gap);
            const isSelected = this.selectedSprite === sprite;
            const isHovered = this.hoveredButton === `sprite_${sprite}`;

            // Option background
            ctx.fillStyle = isSelected ? CONFIG.COLORS.GD_GREEN : (isHovered ? CONFIG.COLORS.GD_PURPLE : 'rgba(0,0,0,0.3)');
            ctx.beginPath();
            ctx.roundRect(x, optionY, optionSize, optionSize, 10);
            ctx.fill();

            // Border
            ctx.strokeStyle = isSelected ? CONFIG.COLORS.GD_GREEN_LIGHT : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Cube preview
            ctx.fillStyle = spriteColors[sprite];
            ctx.fillRect(x + 10, optionY + 10, optionSize - 20, optionSize - 20);

            // Label
            ctx.font = '10px Outfit, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(sprite.toUpperCase(), x + optionSize / 2, optionY + optionSize + 15);
        }

        // Custom/Upload Option
        const customX = startX + this.sprites.length * (optionSize + gap);
        const isCustomSelected = this.selectedSprite === 'custom';
        const isCustomHovered = this.hoveredButton === 'sprite_custom_upload';

        ctx.fillStyle = isCustomSelected ? CONFIG.COLORS.GD_GREEN : (isCustomHovered ? CONFIG.COLORS.GD_PURPLE : 'rgba(0,0,0,0.3)');
        ctx.beginPath();
        ctx.roundRect(customX, optionY, optionSize, optionSize, 10);
        ctx.fill();

        ctx.strokeStyle = isCustomSelected ? CONFIG.COLORS.GD_GREEN_LIGHT : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Upload Icon
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📤', customX + optionSize / 2, optionY + optionSize / 2);

        ctx.font = '10px Outfit, sans-serif';
        ctx.fillText('UPLOAD', customX + optionSize / 2, optionY + optionSize + 15);

        // Close button
        const closeX = modalX + modalWidth / 2 - 50;
        const closeY = modalY + modalHeight - 60;
        const isCloseHovered = this.hoveredButton === 'close_modal';

        const btnGradient = ctx.createLinearGradient(closeX, closeY, closeX, closeY + 40);
        btnGradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
        btnGradient.addColorStop(0.3, CONFIG.COLORS.GD_GREEN);
        btnGradient.addColorStop(1, CONFIG.COLORS.GD_GREEN_DARK);

        ctx.fillStyle = btnGradient;
        ctx.beginPath();
        ctx.roundRect(closeX, closeY, 100, 40, 10);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('DONE', closeX + 50, closeY + 25);
    }
}
