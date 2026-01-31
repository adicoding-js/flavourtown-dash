/**
 * Flavortown Dash - Editor Scene
 * GD-style level editor
 */

import { Scene } from './Scene.js';
import { CONFIG, SCENES, OBJECT_TYPES } from '../config.js';
import { LevelManager } from '../managers/LevelManager.js';
import { createGameObject } from '../objects/Obstacles.js';
import { Ground } from '../objects/Ground.js';

export class EditorScene extends Scene {
    constructor(game) {
        super(game);

        this.levelManager = new LevelManager();
        this.ground = new Ground(this.game);

        // Level data
        this.levelName = 'Untitled Level';
        this.objects = [];
        this.currentLevelId = null;

        // Camera
        this.cameraX = 0;
        this.isPanning = false;
        this.lastPanX = 0;

        // Editor state
        this.selectedTool = 'spike';
        this.hoveredButton = null;
        this.gridSize = CONFIG.EDITOR.GRID_SIZE;

        // Tools
        this.tools = [
            { id: 'spike', icon: '△', label: 'Spike' },
            { id: 'block', icon: '■', label: 'Block' },
            { id: 'portal_ship', icon: '◆', label: 'Ship' },
            { id: 'portal_cube', icon: '◇', label: 'Cube' },
            { id: 'finish', icon: '🏁', label: 'Finish' },
            { id: 'delete', icon: '🗑️', label: 'Delete' }
        ];

        // History for undo
        this.history = [];
        this.historyIndex = -1;

        // Animation
        this.time = 0;
        this.bgOffset = 0;
    }

    async init(data = {}) {
        this.levelManager.init();

        if (data.level) {
            this.loadLevel(data.level);
        } else {
            this.newLevel();
        }

        this.isReady = true;
    }

    newLevel() {
        this.levelName = 'Untitled Level';
        this.objects = [];
        this.currentLevelId = null;
        this.cameraX = 0;
        this.saveState();
    }

    loadLevel(level) {
        this.levelName = level.name;
        this.currentLevelId = level.id;
        this.objects = level.objects.map(obj => ({ ...obj }));
        this.cameraX = 0;
        this.saveState();
    }

    saveState() {
        // Trim future history
        this.history = this.history.slice(0, this.historyIndex + 1);
        // Add current state
        this.history.push(JSON.stringify(this.objects));
        this.historyIndex++;
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.objects = JSON.parse(this.history[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.objects = JSON.parse(this.history[this.historyIndex]);
        }
    }

    update(dt) {
        this.time += dt;
        this.bgOffset += dt * 10;

        const input = this.game.inputManager;
        const mousePos = input.getPointerPosition();

        this.hoveredButton = null;

        // Check keyboard shortcuts
        if (input.isKeyJustPressed('KeyZ') && input.isKeyDown('ControlLeft')) {
            this.undo();
        }
        if (input.isKeyJustPressed('KeyY') && input.isKeyDown('ControlLeft')) {
            this.redo();
        }
        if (input.isKeyJustPressed('Escape')) {
            this.game.sceneManager.switchTo(SCENES.MENU);
            return;
        }

        // Toolbar buttons
        const toolbarY = CONFIG.CANVAS.HEIGHT - 80;
        const toolStartX = 20;
        const toolSize = 60;
        const toolGap = 10;

        for (let i = 0; i < this.tools.length; i++) {
            const x = toolStartX + i * (toolSize + toolGap);
            const rect = { x, y: toolbarY, width: toolSize, height: toolSize };
            if (this.isPointInRect(mousePos.x, mousePos.y, rect)) {
                this.hoveredButton = this.tools[i].id;
            }
        }

        // Action buttons
        const actionBtns = this.getActionButtons();
        for (const btn of actionBtns) {
            if (this.isPointInRect(mousePos.x, mousePos.y, btn.rect)) {
                this.hoveredButton = btn.id;
            }
        }

        // Back button
        const backBtn = { x: 20, y: 20, width: 80, height: 50 };
        if (this.isPointInRect(mousePos.x, mousePos.y, backBtn)) {
            this.hoveredButton = 'back';
        }

        // Handle panning
        if (input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight')) {
            if (input.isPressed) {
                if (!this.isPanning) {
                    this.isPanning = true;
                    this.lastPanX = mousePos.x;
                } else {
                    const dx = mousePos.x - this.lastPanX;
                    this.cameraX -= dx;
                    this.cameraX = Math.max(0, this.cameraX);
                    this.lastPanX = mousePos.x;
                }
            } else {
                this.isPanning = false;
            }
        } else {
            this.isPanning = false;
        }

        // Handle clicks
        if (input.justPressed) {
            this.handleClick(mousePos);
        }
    }

    getActionButtons() {
        const rightX = CONFIG.CANVAS.WIDTH - 100;
        const btnWidth = 80;
        const btnHeight = 50;
        const gap = 10;

        return [
            { id: 'save', label: '💾 Save', rect: { x: rightX, y: 20, width: btnWidth, height: btnHeight } },
            { id: 'test', label: '▶ Test', rect: { x: rightX, y: 20 + btnHeight + gap, width: btnWidth, height: btnHeight } },
            { id: 'export', label: '📤 Export', rect: { x: rightX, y: 20 + (btnHeight + gap) * 2, width: btnWidth, height: btnHeight } }
        ];
    }

    handleClick(mousePos) {
        // Check toolbar
        if (this.hoveredButton && this.tools.find(t => t.id === this.hoveredButton)) {
            this.selectedTool = this.hoveredButton;
            return;
        }

        // Check action buttons
        if (this.hoveredButton === 'save') {
            this.saveLevel();
            return;
        }
        if (this.hoveredButton === 'test') {
            this.testLevel();
            return;
        }
        if (this.hoveredButton === 'export') {
            this.exportLevel();
            return;
        }
        if (this.hoveredButton === 'back') {
            this.game.sceneManager.switchTo(SCENES.MENU);
            return;
        }

        // Check if clicking in editor area
        if (mousePos.y > CONFIG.CANVAS.HEIGHT - 100) return;
        if (mousePos.y < 100) return;

        // Convert to world coordinates
        const worldX = mousePos.x + this.cameraX;
        const worldY = mousePos.y;

        // Snap to grid
        const snappedX = Math.floor(worldX / this.gridSize) * this.gridSize;
        const snappedY = Math.floor(worldY / this.gridSize) * this.gridSize;

        if (this.selectedTool === 'delete') {
            // Delete object at position
            const hitSize = this.gridSize * 1.5; // Larger hit area
            this.objects = this.objects.filter(obj => {
                const objX = obj.x;
                const objY = obj.y || (CONFIG.PLAYER.GROUND_Y - 50); // Fallback if Y missing

                // Check if snapped position is close to object center
                // Note: objects stored with top-left coordinates typically?
                // Let's use simple distance check to the click point (worldX, worldY)
                // instead of the snapped point to be more intuitive for deletion.

                const centerX = objX + CONFIG.EDITOR.GRID_SIZE / 2;
                const centerY = objY + CONFIG.EDITOR.GRID_SIZE / 2;

                const dist = Math.sqrt((centerX - worldX) ** 2 + (centerY - worldY) ** 2);

                return dist > hitSize / 2; // Keep object if distance is greater than radius
            });
            this.saveState();
        } else {
            // Check if object already exists at this position
            const exists = this.objects.some(obj => {
                const objY = obj.y || (CONFIG.PLAYER.GROUND_Y - 50);
                return Math.abs(obj.x - snappedX) < 5 && Math.abs(objY - snappedY) < 5;
            });

            if (!exists) {
                // Add new object
                const newObj = {
                    type: this.selectedTool,
                    x: snappedX,
                    y: snappedY
                };
                this.objects.push(newObj);
                this.saveState();
            }
        }
    }

    saveLevel() {
        const level = {
            id: this.currentLevelId || `custom_${Date.now()}`,
            name: this.levelName,
            author: 'Custom',
            difficulty: 1,
            bpm: 120,
            isCustom: true,
            objects: this.objects
        };

        if (this.currentLevelId) {
            this.levelManager.updateLevel(level);
        } else {
            this.currentLevelId = level.id;
            this.levelManager.addLevel(level);
        }

        console.log('Level saved!');
    }

    testLevel() {
        const level = {
            id: 'test_level',
            name: this.levelName,
            author: 'Test',
            bpm: 120,
            objects: this.objects
        };

        this.game.sceneManager.switchTo(SCENES.PLAY, { level, fromEditor: true });
    }

    exportLevel() {
        const level = {
            name: this.levelName,
            author: 'Custom',
            bpm: 120,
            objects: this.objects
        };

        const json = JSON.stringify(level, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.levelName.replace(/\s+/g, '_')}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    render(ctx) {
        // Background
        this.renderBackground(ctx);
        this.renderGrid(ctx);

        // Editor grid
        this.renderEditorGrid(ctx);

        // Ground
        ctx.save();
        ctx.translate(-this.cameraX, 0);
        this.ground.render(ctx, this.cameraX - 100, CONFIG.CANVAS.WIDTH + 200);

        // Objects
        const groundY = this.ground.getSurfaceY();
        for (const objData of this.objects) {
            const obj = createGameObject(objData, groundY);
            if (obj && obj.x > this.cameraX - 100 && obj.x < this.cameraX + CONFIG.CANVAS.WIDTH + 100) {
                obj.render(ctx, this.game.assetManager);
            }
        }
        ctx.restore();

        // UI
        this.renderToolbar(ctx);
        this.renderTopBar(ctx);

        // Instructions
        ctx.font = '14px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('SHIFT + Drag to pan • ESC to exit', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT - 10);
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

    renderEditorGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        const offsetX = -this.cameraX % this.gridSize;

        for (let x = offsetX; x < CONFIG.CANVAS.WIDTH; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 100);
            ctx.lineTo(x, CONFIG.CANVAS.HEIGHT - 100);
            ctx.stroke();
        }

        for (let y = 100; y < CONFIG.CANVAS.HEIGHT - 100; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CONFIG.CANVAS.WIDTH, y);
            ctx.stroke();
        }
    }

    renderTopBar(ctx) {
        // Back button
        this.renderGDButton(ctx, 20, 20, 80, 50, '←', '', this.hoveredButton === 'back');

        // Level name
        ctx.font = 'bold 28px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.strokeText(this.levelName, CONFIG.CANVAS.WIDTH / 2, 50);
        ctx.fillText(this.levelName, CONFIG.CANVAS.WIDTH / 2, 50);

        // Action buttons
        const actionBtns = this.getActionButtons();
        for (const btn of actionBtns) {
            this.renderGDButton(ctx, btn.rect.x, btn.rect.y, btn.rect.width, btn.rect.height,
                btn.label.split(' ')[0], btn.label.split(' ')[1], this.hoveredButton === btn.id);
        }
    }

    renderToolbar(ctx) {
        const toolbarY = CONFIG.CANVAS.HEIGHT - 80;
        const toolStartX = 20;
        const toolSize = 60;
        const toolGap = 10;

        for (let i = 0; i < this.tools.length; i++) {
            const tool = this.tools[i];
            const x = toolStartX + i * (toolSize + toolGap);
            const isSelected = this.selectedTool === tool.id;
            const isHovered = this.hoveredButton === tool.id;

            this.renderToolButton(ctx, x, toolbarY, toolSize, tool, isSelected, isHovered);
        }
    }

    renderToolButton(ctx, x, y, size, tool, isSelected, isHovered) {
        const scale = isHovered ? 1.1 : 1;
        const cx = x + size / 2;
        const cy = y + size / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, size, size, 10);
        ctx.fill();

        // Button background
        let gradient;
        if (isSelected) {
            gradient = ctx.createLinearGradient(x, y, x, y + size);
            gradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
            gradient.addColorStop(0.3, CONFIG.COLORS.GD_GREEN);
            gradient.addColorStop(1, CONFIG.COLORS.GD_GREEN_DARK);
        } else {
            gradient = ctx.createLinearGradient(x, y, x, y + size);
            gradient.addColorStop(0, CONFIG.COLORS.GD_PURPLE);
            gradient.addColorStop(1, CONFIG.COLORS.GD_PURPLE_DARK);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 10);
        ctx.fill();

        // Border
        ctx.strokeStyle = isSelected ? CONFIG.COLORS.GD_GREEN_LIGHT : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icon
        ctx.font = '28px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tool.icon, cx, cy);

        ctx.restore();
    }

    renderGDButton(ctx, x, y, width, height, icon, label, isHovered) {
        const scale = isHovered ? 1.05 : 1;
        const cx = x + width / 2;
        const cy = y + height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, width, height, 10);
        ctx.fill();

        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, CONFIG.COLORS.GD_GREEN_LIGHT);
        gradient.addColorStop(0.3, CONFIG.COLORS.GD_GREEN);
        gradient.addColorStop(1, CONFIG.COLORS.GD_GREEN_DARK);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = label ? '18px sans-serif' : 'bold 24px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, cx, cy - (label ? 5 : 0));

        if (label) {
            ctx.font = 'bold 10px Outfit, sans-serif';
            ctx.fillText(label, cx, cy + 12);
        }

        ctx.restore();
    }
}
