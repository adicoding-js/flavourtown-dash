/**
 * Flavortown Dash - Asset Manager
 * Handles loading images and other assets
 */

export class AssetManager {
    constructor() {
        this.images = new Map();
        this.loaded = false;
        this.loadProgress = 0;
    }

    /**
     * Load all game assets
     */
    async loadAll() {
        const assets = [
            { name: 'player', path: '/assets/player.png' },
            { name: 'ship', path: '/assets/ship.png' },
            { name: 'spike', path: '/assets/spike.png' },
            { name: 'floor', path: '/assets/floor.png' },
            { name: 'bg', path: '/assets/bg.png' },
            { name: 'portal_cube', path: '/assets/portal_cube.png' },
            { name: 'portal_ship', path: '/assets/portal_ship.png' },
            { name: 'finish', path: '/assets/finish.png' }
        ];

        const total = assets.length;
        let loaded = 0;

        const promises = assets.map(async (asset) => {
            const img = await this.loadImage(asset.path);
            this.images.set(asset.name, img);
            loaded++;
            this.loadProgress = loaded / total;
        });

        await Promise.all(promises);
        this.loaded = true;
    }

    /**
     * Load a single image
     */
    loadImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Failed to load image: ${path}`);
                // Create a placeholder
                const canvas = document.createElement('canvas');
                canvas.width = 50;
                canvas.height = 50;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(0, 0, 50, 50);
                resolve(canvas);
            };
            img.src = path;
        });
    }

    /**
     * Get a loaded image
     */
    get(name) {
        return this.images.get(name);
    }

    /**
     * Check if assets are loaded
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Get loading progress (0-1)
     */
    getProgress() {
        return this.loadProgress;
    }
}
