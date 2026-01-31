/**
 * Flavortown Dash - Editor Scene
 * Create and edit custom levels
 */

import { Scene } from './Scene.js';
import { CONFIG, SCENES, OBJECT_TYPES, GAME_MODES } from '../config.js';
import { Camera } from '../engine/Camera.js';
import { Ground } from '../objects/Ground.js';
import { createGameObject } from '../objects/Obstacles.js';
import { LevelManager } from '../managers/LevelManager.js';

export class EditorScene extends Scene {
    constructor(game) {
        super(game);

        this.levelManager = new LevelManager();
        this.camera = new Camera(game);
        this.ground = null;

        // Current level being edited
        this.level = null;
        this.objects = [];

        // Editor state
        this.selectedTool = OBJECT_TYPES.SPIKE;
        this.isPlacing = false;
        this.gridSize = CONFIG.EDITOR.GRID_SIZE;

        // Camera controls
        this.isDragging = false;
        this.lastMouseX = 0;

        // UI
        this.toolbarHeight = 120;
        this.hoveredButton = null;

        // Tools available
        this.tools = [
            { id: OBJECT_TYPES.SPIKE, name: 'Spike', icon: '▲', color: CONFIG.COLORS.DANGER },
            { id: OBJECT_TYPES.BLOCK, name: 'Block', icon: '■', color: CONFIG.COLORS.GROUND_TOP },
            { id: OBJECT_TYPES.PORTAL_SHIP, name: 'Ship Portal', icon: '✈', color: CONFIG.COLORS.SECONDARY },
            { id: OBJECT_TYPES.PORTAL_CUBE, name: 'Cube Portal', icon: '◆', color: CONFIG.COLORS.PRIMARY },
            { id: OBJECT_TYPES.FINISH, name: 'Finish', icon: '🏁', color: CONFIG.COLORS.SUCCESS },
            { id: 'delete', name: 'Delete', icon: '✕', color: '#ff3333' },
            { id: 'move', name: 'Move', icon: '✥', color: '#888888' }
        ];

        // Undo/redo stacks
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndo = 50;
    }

    async init(data = {}) {
        this.levelManager.init();

        // Load existing level or create new
        if (data.levelId) {
            this.level = this.levelManager.getLevel(data.levelId);
        } else {
            this.level = this.levelManager.createEmptyLevel();
        }

        this.loadLevelObjects();

        // Setup ground
        this.ground = new Ground(this.game);
        this.ground.setColors(this.level.groundColor, this.level.groundColor);

        // Reset camera
        this.camera.reset();

        this.isReady = true;
    }

    loadLevelObjects() {
        this.objects = [];
        const groundY = CONFIG.CANVAS.HEIGHT - CONFIG.GROUND.HEIGHT;

        for (const objData of this.level.objects) {
            const obj = createGameObject(objData, groundY);
            if (obj) {
                obj.originalData = objData; // Keep reference to original data
                this.objects.push(obj);
            }
        }
    }

    update(dt) {
        const input = this.game.inputManager;
        const mousePos = input.getPointerPosition();

        // Check if in toolbar area
        const inToolbar = mousePos.y < this.toolbarHeight;

        // Update hover states
        this.updateHoverState(mousePos);

        // Handle toolbar clicks
        if (inToolbar && input.justPressed) {
            this.handleToolbarClick(mousePos);
        }

        // Handle canvas interactions
        if (!inToolbar) {
            this.handleCanvasInteraction(input, mousePos, dt);
        }

        // Keyboard shortcuts
        this.handleKeyboardShortcuts(input);

        // Update camera smoothly
        this.camera.update(dt);
    }

    updateHoverState(mousePos) {
        this.hoveredButton = null;

        // Check tool buttons
        const toolStartX = 20;
        const toolY = 60;
        const toolSize = 60;
        const toolGap = 10;

        for (let i = 0; i < this.tools.length; i++) {
            const x = toolStartX + i * (toolSize + toolGap);
            if (this.isPointInRect(mousePos.x, mousePos.y, { x, y: toolY, width: toolSize, height: toolSize })) {
                this.hoveredButton = this.tools[i].id;
            }
        }

        // Check action buttons
        const actionsX = CONFIG.CANVAS.WIDTH - 250;
        const btnWidth = 70;
        const btnHeight = 40;
        const btnGap = 10;

        const actions = ['save', 'test', 'export', 'back'];
        for (let i = 0; i < actions.length; i++) {
            const x = actionsX + (i % 2) * (btnWidth + btnGap);
            const y = 30 + Math.floor(i / 2) * (btnHeight + btnGap);
            if (this.isPointInRect(mousePos.x, mousePos.y, { x, y, width: btnWidth, height: btnHeight })) {
                this.hoveredButton = actions[i];
            }
        }
    }

    handleToolbarClick(mousePos) {
        // Tool selection
        const toolStartX = 20;
        const toolY = 60;
        const toolSize = 60;
        const toolGap = 10;

        for (let i = 0; i < this.tools.length; i++) {
            const x = toolStartX + i * (toolSize + toolGap);
            if (this.isPointInRect(mousePos.x, mousePos.y, { x, y: toolY, width: toolSize, height: toolSize })) {
                this.selectedTool = this.tools[i].id;
            }
        }

        // Action buttons
        if (this.hoveredButton === 'save') {
            this.saveLevel();
        } else if (this.hoveredButton === 'test') {
            this.testLevel();
        } else if (this.hoveredButton === 'export') {
            this.exportLevel();
        } else if (this.hoveredButton === 'back') {
            this.game.sceneManager.switchTo(SCENES.MENU);
        }
    }

    handleCanvasInteraction(input, mousePos, dt) {
        const worldPos = this.camera.screenToWorld(mousePos.x, mousePos.y);
        const gridX = Math.floor(worldPos.x / this.gridSize) * this.gridSize;
        const gridY = Math.floor(worldPos.y / this.gridSize) * this.gridSize;

        // Right click or shift+drag to pan
        if (input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight')) {
            if (input.isPressed) {
                if (this.isDragging) {
                    const dx = mousePos.x - this.lastMouseX;
                    this.camera.targetX -= dx;
                    this.camera.x -= dx;
                }
                this.isDragging = true;
                this.lastMouseX = mousePos.x;
            } else {
                this.isDragging = false;
            }
        } else if (input.justPressed) {
            // Place/delete objects
            if (this.selectedTool === 'delete') {
                this.deleteObjectAt(worldPos.x, worldPos.y);
            } else if (this.selectedTool === 'move') {
                // TODO: Implement move
            } else {
                this.placeObject(gridX, this.selectedTool);
            }
        }

        // Scroll to pan
        if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
            this.camera.targetX += 500 * dt;
        }
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
            this.camera.targetX = Math.max(0, this.camera.targetX - 500 * dt);
        }
    }

    handleKeyboardShortcuts(input) {
        // Undo
        if (input.isKeyDown('ControlLeft') && input.isKeyJustPressed('KeyZ')) {
            this.undo();
        }

        // Redo
        if (input.isKeyDown('ControlLeft') && input.isKeyJustPressed('KeyY')) {
            this.redo();
        }

        // Test level
        if (input.isKeyJustPressed('KeyT') && !input.isKeyDown('ControlLeft')) {
            this.testLevel();
        }

        // Save
        if (input.isKeyDown('ControlLeft') && input.isKeyJustPressed('KeyS')) {
            this.saveLevel();
        }

        // Tool shortcuts
        if (input.isKeyJustPressed('Digit1')) this.selectedTool = OBJECT_TYPES.SPIKE;
        if (input.isKeyJustPressed('Digit2')) this.selectedTool = OBJECT_TYPES.BLOCK;
        if (input.isKeyJustPressed('Digit3')) this.selectedTool = OBJECT_TYPES.PORTAL_SHIP;
        if (input.isKeyJustPressed('Digit4')) this.selectedTool = OBJECT_TYPES.PORTAL_CUBE;
        if (input.isKeyJustPressed('Digit5')) this.selectedTool = OBJECT_TYPES.FINISH;
        if (input.isKeyJustPressed('KeyX')) this.selectedTool = 'delete';
    }

    placeObject(x, type) {
        // Check if object already exists at this position
        const existing = this.level.objects.find(obj => obj.x === x && obj.type === type);
        if (existing) return;

        // Create object data
        const objData = { type, x };

        // Add to level
        this.level.objects.push(objData);

        // Create visual object
        const groundY = CONFIG.CANVAS.HEIGHT - CONFIG.GROUND.HEIGHT;
        const obj = createGameObject(objData, groundY);
        if (obj) {
            obj.originalData = objData;
            this.objects.push(obj);
        }

        // Save to undo stack
        this.pushUndo({ action: 'add', data: objData });
    }

    deleteObjectAt(x, y) {
        const groundY = CONFIG.CANVAS.HEIGHT - CONFIG.GROUND.HEIGHT;

        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            if (this.isPointInRect(x, y, obj.getBounds())) {
                // Remove from objects array
                this.objects.splice(i, 1);

                // Remove from level data
                const dataIndex = this.level.objects.indexOf(obj.originalData);
                if (dataIndex !== -1) {
                    const deleted = this.level.objects.splice(dataIndex, 1)[0];
                    this.pushUndo({ action: 'delete', data: deleted });
                }

                return;
            }
        }
    }

    pushUndo(action) {
        this.undoStack.push(action);
        if (this.undoStack.length > this.maxUndo) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo on new action
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const action = this.undoStack.pop();
        this.redoStack.push(action);

        if (action.action === 'add') {
            // Remove the added object
            const index = this.level.objects.indexOf(action.data);
            if (index !== -1) {
                this.level.objects.splice(index, 1);
            }
        } else if (action.action === 'delete') {
            // Add back the deleted object
            this.level.objects.push(action.data);
        }

        this.loadLevelObjects();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const action = this.redoStack.pop();
        this.undoStack.push(action);

        if (action.action === 'add') {
            this.level.objects.push(action.data);
        } else if (action.action === 'delete') {
            const index = this.level.objects.indexOf(action.data);
            if (index !== -1) {
                this.level.objects.splice(index, 1);
            }
        }

        this.loadLevelObjects();
    }

    saveLevel() {
        if (this.level.id) {
            this.levelManager.updateCustomLevel(this.level.id, this.level);
        } else {
            this.level.id = this.levelManager.addCustomLevel(this.level);
        }

        console.log('Level saved!', this.level.id);
        // TODO: Show save confirmation UI
    }

    testLevel() {
        // Save first
        this.saveLevel();

        // Switch to play scene with this level
        this.game.sceneManager.switchTo(SCENES.PLAY, { level: this.level });
    }

    exportLevel() {
        this.levelManager.exportLevel(this.level);
    }

    render(ctx) {
        // Background
        ctx.fillStyle = this.level.backgroundColor || CONFIG.COLORS.DARK;
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

        // Apply camera
        this.camera.applyTransform(ctx);

        // Grid
        this.renderGrid(ctx);

        // Ground
        this.ground.render(ctx, this.camera.x);

        // Objects
        for (const obj of this.objects) {
            obj.render(ctx, this.game.assetManager);
        }

        // Ghost preview of current tool
        this.renderGhostPreview(ctx);

        // Reset camera
        this.camera.resetTransform(ctx);

        // Toolbar
        this.renderToolbar(ctx);
    }

    renderGrid(ctx) {
        const startX = Math.floor(this.camera.x / this.gridSize) * this.gridSize;
        const endX = startX + CONFIG.CANVAS.WIDTH + this.gridSize;
        const groundY = CONFIG.CANVAS.HEIGHT - CONFIG.GROUND.HEIGHT;

        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = startX; x < endX; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, groundY);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < groundY; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
    }

    renderGhostPreview(ctx) {
        if (this.selectedTool === 'delete' || this.selectedTool === 'move') return;

        const mousePos = this.game.inputManager.getPointerPosition();
        if (mousePos.y < this.toolbarHeight) return;

        const worldPos = this.camera.screenToWorld(mousePos.x, mousePos.y);
        const gridX = Math.floor(worldPos.x / this.gridSize) * this.gridSize;
        const groundY = CONFIG.CANVAS.HEIGHT - CONFIG.GROUND.HEIGHT;

        // Create temporary object for preview
        const previewData = { type: this.selectedTool, x: gridX };
        const preview = createGameObject(previewData, groundY);

        if (preview) {
            ctx.globalAlpha = 0.5;
            preview.render(ctx, this.game.assetManager);
            ctx.globalAlpha = 1;
        }
    }

    renderToolbar(ctx) {
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, this.toolbarHeight);

        // Border
        ctx.strokeStyle = CONFIG.COLORS.PRIMARY;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.toolbarHeight);
        ctx.lineTo(CONFIG.CANVAS.WIDTH, this.toolbarHeight);
        ctx.stroke();

        // Title
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText('LEVEL EDITOR', 20, 30);

        // Tools
        const toolStartX = 20;
        const toolY = 60;
        const toolSize = 60;
        const toolGap = 10;

        for (let i = 0; i < this.tools.length; i++) {
            const tool = this.tools[i];
            const x = toolStartX + i * (toolSize + toolGap);
            const isSelected = this.selectedTool === tool.id;
            const isHovered = this.hoveredButton === tool.id;

            // Button background
            ctx.fillStyle = isSelected ? tool.color + '60' : (isHovered ? tool.color + '30' : 'rgba(255,255,255,0.1)');
            ctx.strokeStyle = isSelected ? tool.color : (isHovered ? tool.color : 'rgba(255,255,255,0.3)');
            ctx.lineWidth = isSelected ? 3 : 1;

            ctx.beginPath();
            ctx.roundRect(x, toolY, toolSize, toolSize, 8);
            ctx.fill();
            ctx.stroke();

            // Icon
            ctx.font = '24px sans-serif';
            ctx.fillStyle = isSelected ? tool.color : '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tool.icon, x + toolSize / 2, toolY + toolSize / 2);
        }

        // Action buttons
        const actionsX = CONFIG.CANVAS.WIDTH - 250;
        const btnWidth = 70;
        const btnHeight = 40;
        const btnGap = 10;

        const actions = [
            { id: 'save', text: 'Save', color: CONFIG.COLORS.SUCCESS },
            { id: 'test', text: 'Test', color: CONFIG.COLORS.PRIMARY },
            { id: 'export', text: 'Export', color: CONFIG.COLORS.ACCENT },
            { id: 'back', text: 'Back', color: CONFIG.COLORS.SECONDARY }
        ];

        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const x = actionsX + (i % 2) * (btnWidth + btnGap);
            const y = 30 + Math.floor(i / 2) * (btnHeight + btnGap);
            const isHovered = this.hoveredButton === action.id;

            ctx.fillStyle = isHovered ? action.color + '60' : 'rgba(255,255,255,0.1)';
            ctx.strokeStyle = action.color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.roundRect(x, y, btnWidth, btnHeight, 6);
            ctx.fill();
            ctx.stroke();

            ctx.font = '14px Outfit, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(action.text, x + btnWidth / 2, y + btnHeight / 2);
        }

        // Instructions
        ctx.font = '12px Outfit, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('Click to place • Shift+Drag to pan • 1-5 for tools • X to delete', CONFIG.CANVAS.WIDTH - 20, this.toolbarHeight - 10);
    }
}
