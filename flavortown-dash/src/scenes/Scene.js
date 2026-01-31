/**
 * Flavortown Dash - Base Scene Class
 * Abstract base class for all game scenes
 */

export class Scene {
    constructor(game) {
        this.game = game;
        this.isReady = false;
    }

    /**
     * Initialize the scene with optional data
     */
    async init(data = {}) {
        // Override in subclasses
        this.isReady = true;
    }

    /**
     * Called when scene becomes active
     */
    async enter() {
        // Override in subclasses
    }

    /**
     * Called when leaving the scene
     */
    async exit() {
        // Override in subclasses
    }

    /**
     * Update scene logic
     */
    update(dt) {
        // Override in subclasses
    }

    /**
     * Render scene
     */
    render(ctx) {
        // Override in subclasses
    }

    /**
     * Helper: Draw text with outline
     */
    drawText(ctx, text, x, y, options = {}) {
        const {
            font = '24px Outfit, sans-serif',
            color = '#ffffff',
            align = 'center',
            baseline = 'middle',
            outline = true,
            outlineColor = '#000000',
            outlineWidth = 3
        } = options;

        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;

        if (outline) {
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = outlineWidth;
            ctx.strokeText(text, x, y);
        }

        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    /**
     * Helper: Draw button
     */
    drawButton(ctx, text, x, y, width, height, isHovered = false, options = {}) {
        const {
            color = '#00d4ff',
            hoverColor = '#00ffff',
            textColor = '#ffffff',
            fontSize = 24
        } = options;

        const btnColor = isHovered ? hoverColor : color;

        // Button background
        ctx.fillStyle = btnColor + '40';
        ctx.strokeStyle = btnColor;
        ctx.lineWidth = 3;

        // Rounded rectangle
        const radius = 12;
        ctx.beginPath();
        ctx.roundRect(x - width / 2, y - height / 2, width, height, radius);
        ctx.fill();
        ctx.stroke();

        // Glow on hover
        if (isHovered) {
            ctx.shadowColor = btnColor;
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Button text
        this.drawText(ctx, text, x, y, {
            font: `bold ${fontSize}px Outfit, sans-serif`,
            color: textColor
        });

        return { x: x - width / 2, y: y - height / 2, width, height };
    }

    /**
     * Helper: Check if point is inside rectangle
     */
    isPointInRect(px, py, rect) {
        return (
            px >= rect.x &&
            px <= rect.x + rect.width &&
            py >= rect.y &&
            py <= rect.y + rect.height
        );
    }
}
