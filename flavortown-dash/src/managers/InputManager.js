/**
 * Flavortown Dash - Input Manager
 * Handles keyboard, mouse, and touch input
 */

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;

        // Scale and offset for coordinate conversion
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        // Keyboard state
        this.keys = new Map();
        this.keysJustPressed = new Set();
        this.keysJustReleased = new Set();

        // Mouse/Touch state
        this.isPressed = false;
        this.wasPressed = false;
        this.justPressed = false;
        this.justReleased = false;
        this.mouseX = 0;
        this.mouseY = 0;

        // Touch tracking
        this.touches = new Map();

        // Bind event listeners
        this.setupKeyboard();
        this.setupMouse();
        this.setupTouch();
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (!this.keys.get(e.code)) {
                this.keysJustPressed.add(e.code);
            }
            this.keys.set(e.code, true);

            // Prevent default for game keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
            this.keysJustReleased.add(e.code);
        });

        // Clear state when window loses focus
        window.addEventListener('blur', () => {
            this.keys.clear();
            this.isPressed = false;
        });
    }

    setupMouse() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isPressed = true;
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.isPressed = false;
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePosition(e);
        });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    setupTouch() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isPressed = true;
            this.updateTouchPosition(e.touches[0]);

            // Track all touches
            for (const touch of e.changedTouches) {
                this.touches.set(touch.identifier, {
                    x: this.screenToGame(touch.clientX, touch.clientY).x,
                    y: this.screenToGame(touch.clientX, touch.clientY).y
                });
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();

            // Remove ended touches
            for (const touch of e.changedTouches) {
                this.touches.delete(touch.identifier);
            }

            if (e.touches.length === 0) {
                this.isPressed = false;
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                this.updateTouchPosition(e.touches[0]);
            }
        });
    }

    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const pos = this.screenToGame(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        this.mouseX = pos.x;
        this.mouseY = pos.y;
    }

    updateTouchPosition(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const pos = this.screenToGame(
            touch.clientX - rect.left,
            touch.clientY - rect.top
        );
        this.mouseX = pos.x;
        this.mouseY = pos.y;
    }

    screenToGame(x, y) {
        // The canvas is scaled and the offset is in screen space
        // We need to account for the canvas display size vs actual size
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: x * scaleX,
            y: y * scaleY
        };
    }

    setScale(scale, offsetX, offsetY) {
        this.scale = scale;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    /**
     * Update input state - call at end of game loop
     */
    update() {
        // Update just pressed/released state
        this.justPressed = this.isPressed && !this.wasPressed;
        this.justReleased = !this.isPressed && this.wasPressed;
        this.wasPressed = this.isPressed;

        // Clear just pressed/released keys
        this.keysJustPressed.clear();
        this.keysJustReleased.clear();
    }

    // Keyboard checks
    isKeyDown(code) {
        return this.keys.get(code) === true;
    }

    isKeyJustPressed(code) {
        return this.keysJustPressed.has(code);
    }

    isKeyJustReleased(code) {
        return this.keysJustReleased.has(code);
    }

    // Action checks (for game controls)
    isJumpPressed() {
        return this.isPressed ||
            this.isKeyDown('Space') ||
            this.isKeyDown('ArrowUp') ||
            this.isKeyDown('KeyW');
    }

    isJumpJustPressed() {
        return this.justPressed ||
            this.keysJustPressed.has('Space') ||
            this.keysJustPressed.has('ArrowUp') ||
            this.keysJustPressed.has('KeyW');
    }

    // Get mouse/touch position
    getPointerPosition() {
        return { x: this.mouseX, y: this.mouseY };
    }
}
