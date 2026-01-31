/**
 * Flavortown Dash - Scene Manager
 * Handles scene transitions and lifecycle
 */

export class SceneManager {
    constructor(game) {
        this.game = game;
        this.scenes = new Map();
        this.currentScene = null;
        this.currentSceneName = null;
        this.transitioning = false;
        this.transitionProgress = 0;
        this.transitionDuration = 0.3;
        this.nextSceneName = null;
        this.nextSceneData = null;
    }

    /**
     * Register a scene with the manager
     */
    register(name, SceneClass) {
        this.scenes.set(name, SceneClass);
    }

    /**
     * Switch to a new scene with optional transition
     */
    async switchTo(name, data = {}, transition = true) {
        if (!this.scenes.has(name)) {
            console.error(`Scene "${name}" not found!`);
            return;
        }

        if (transition && this.currentScene) {
            // Start transition
            this.transitioning = true;
            this.transitionProgress = 0;
            this.nextSceneName = name;
            this.nextSceneData = data;
        } else {
            // Immediate switch
            await this.loadScene(name, data);
        }
    }

    /**
     * Internal: Load and initialize a scene
     */
    async loadScene(name, data = {}) {
        // Exit current scene
        if (this.currentScene) {
            await this.currentScene.exit();
        }

        // Create new scene instance
        const SceneClass = this.scenes.get(name);
        this.currentScene = new SceneClass(this.game);
        this.currentSceneName = name;

        // Initialize the new scene
        await this.currentScene.init(data);
        await this.currentScene.enter();
    }

    /**
     * Update current scene
     */
    update(dt) {
        if (this.transitioning) {
            this.updateTransition(dt);
        }

        if (this.currentScene) {
            this.currentScene.update(dt);
        }
    }

    /**
     * Handle transition animation
     */
    updateTransition(dt) {
        this.transitionProgress += dt / this.transitionDuration;

        if (this.transitionProgress >= 1) {
            // Halfway through, switch scenes
            if (this.transitionProgress >= 1 && this.nextSceneName) {
                this.loadScene(this.nextSceneName, this.nextSceneData);
                this.nextSceneName = null;
                this.nextSceneData = null;
            }
        }

        if (this.transitionProgress >= 2) {
            // Transition complete
            this.transitioning = false;
            this.transitionProgress = 0;
        }
    }

    /**
     * Render current scene
     */
    render(ctx) {
        if (this.currentScene) {
            this.currentScene.render(ctx);
        }

        // Render transition overlay
        if (this.transitioning) {
            this.renderTransition(ctx);
        }
    }

    /**
     * Render transition effect (fade to black)
     */
    renderTransition(ctx) {
        let alpha;
        if (this.transitionProgress < 1) {
            // Fading out
            alpha = this.transitionProgress;
        } else {
            // Fading in
            alpha = 2 - this.transitionProgress;
        }

        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}
