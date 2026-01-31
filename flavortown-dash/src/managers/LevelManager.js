/**
 * Flavortown Dash - Level Manager
 * Handles loading, saving, and managing game levels
 */

import { CONFIG, OBJECT_TYPES } from '../config.js';

export class LevelManager {
    constructor() {
        this.levels = [];
        this.customLevels = [];
        this.currentLevel = null;

        // Load custom levels from storage
        this.loadCustomLevels();
    }

    /**
     * Initialize with built-in levels
     */
    init() {
        this.levels = [
            this.createBuiltInLevel1(),
            this.createBuiltInLevel2(),
            this.createBuiltInLevel3()
        ];
    }

    /**
     * Create built-in level 1 - Tutorial/Easy
     */
    createBuiltInLevel1() {
        return {
            id: 'level_1',
            name: 'First Steps',
            author: 'Flavortown',
            difficulty: 1,
            bpm: 128,
            music: '/assets/music.mp3',
            backgroundColor: '#0f0f23',
            groundColor: '#1a1a3e',
            accentColor: '#00d4ff',
            objects: [
                // Easy intro section
                { type: OBJECT_TYPES.SPIKE, x: 800 },
                { type: OBJECT_TYPES.SPIKE, x: 1200 },
                { type: OBJECT_TYPES.BLOCK, x: 1600, y: 50 },
                { type: OBJECT_TYPES.SPIKE, x: 2000 },
                { type: OBJECT_TYPES.SPIKE, x: 2050 },

                // Platform section
                { type: OBJECT_TYPES.BLOCK, x: 2400, y: 50 },
                { type: OBJECT_TYPES.BLOCK, x: 2450, y: 50 },
                { type: OBJECT_TYPES.BLOCK, x: 2450, y: 100 },
                { type: OBJECT_TYPES.SPIKE, x: 2800 },

                // Ship portal
                { type: OBJECT_TYPES.PORTAL_SHIP, x: 3200 },

                // Ship section
                { type: OBJECT_TYPES.BLOCK, x: 3600, y: 300 },
                { type: OBJECT_TYPES.BLOCK, x: 3650, y: 300 },
                { type: OBJECT_TYPES.BLOCK, x: 4000, y: 150 },

                // Back to cube
                { type: OBJECT_TYPES.PORTAL_CUBE, x: 4400 },

                // Final section
                { type: OBJECT_TYPES.SPIKE, x: 4800 },
                { type: OBJECT_TYPES.SPIKE, x: 4850 },
                { type: OBJECT_TYPES.SPIKE, x: 4900 },
                { type: OBJECT_TYPES.BLOCK, x: 5200, y: 50 },
                { type: OBJECT_TYPES.BLOCK, x: 5250, y: 50 },
                { type: OBJECT_TYPES.BLOCK, x: 5250, y: 100 },
                { type: OBJECT_TYPES.BLOCK, x: 5300, y: 50 },

                // Finish
                { type: OBJECT_TYPES.FINISH, x: 5800 }
            ]
        };
    }

    /**
     * Create built-in level 2 - Medium
     */
    createBuiltInLevel2() {
        return {
            id: 'level_2',
            name: 'Neon Rush',
            author: 'Flavortown',
            difficulty: 2,
            bpm: 140,
            music: '/assets/music.mp3',
            backgroundColor: '#1a0a2e',
            groundColor: '#2d1b4e',
            accentColor: '#ff0080',
            objects: [
                // Fast intro
                { type: OBJECT_TYPES.SPIKE, x: 600 },
                { type: OBJECT_TYPES.SPIKE, x: 650 },
                { type: OBJECT_TYPES.BLOCK, x: 900, y: 50 },
                { type: OBJECT_TYPES.SPIKE, x: 950, y: 100 },
                { type: OBJECT_TYPES.SPIKE, x: 1100 },
                { type: OBJECT_TYPES.SPIKE, x: 1150 },
                { type: OBJECT_TYPES.SPIKE, x: 1200 },

                // Platform challenge
                { type: OBJECT_TYPES.BLOCK, x: 1500, y: 50 },
                { type: OBJECT_TYPES.BLOCK, x: 1550, y: 100 },
                { type: OBJECT_TYPES.BLOCK, x: 1600, y: 150 },
                { type: OBJECT_TYPES.SPIKE, x: 1650, y: 200 },

                { type: OBJECT_TYPES.SPIKE, x: 1900 },
                { type: OBJECT_TYPES.SPIKE, x: 1950 },
                { type: OBJECT_TYPES.BLOCK, x: 2100, y: 50 },

                // Ship section
                { type: OBJECT_TYPES.PORTAL_SHIP, x: 2400 },
                { type: OBJECT_TYPES.BLOCK, x: 2700, y: 400 },
                { type: OBJECT_TYPES.BLOCK, x: 2750, y: 400 },
                { type: OBJECT_TYPES.BLOCK, x: 3000, y: 200 },
                { type: OBJECT_TYPES.BLOCK, x: 3300, y: 350 },
                { type: OBJECT_TYPES.BLOCK, x: 3350, y: 350 },
                { type: OBJECT_TYPES.BLOCK, x: 3600, y: 150 },

                // Back to cube
                { type: OBJECT_TYPES.PORTAL_CUBE, x: 3900 },

                // Hard ending
                { type: OBJECT_TYPES.SPIKE, x: 4200 },
                { type: OBJECT_TYPES.SPIKE, x: 4250 },
                { type: OBJECT_TYPES.BLOCK, x: 4300, y: 50 },
                { type: OBJECT_TYPES.SPIKE, x: 4350, y: 100 },
                { type: OBJECT_TYPES.SPIKE, x: 4500 },
                { type: OBJECT_TYPES.SPIKE, x: 4550 },
                { type: OBJECT_TYPES.SPIKE, x: 4600 },
                { type: OBJECT_TYPES.SPIKE, x: 4650 },

                // Finish
                { type: OBJECT_TYPES.FINISH, x: 5000 }
            ]
        };
    }

    /**
     * Create built-in level 3 - Hard
     */
    createBuiltInLevel3() {
        return {
            id: 'level_3',
            name: 'Chaos Theory',
            author: 'Flavortown',
            difficulty: 3,
            bpm: 160,
            music: '/assets/music.mp3',
            backgroundColor: '#0a1628',
            groundColor: '#162a4a',
            accentColor: '#ffcc00',
            objects: this.generateHardLevel()
        };
    }

    /**
     * Generate objects for hard level
     */
    generateHardLevel() {
        const objects = [];
        let x = 500;

        // Generate challenging patterns
        for (let i = 0; i < 20; i++) {
            const pattern = Math.floor(Math.random() * 5);

            switch (pattern) {
                case 0: // Triple spike
                    objects.push({ type: OBJECT_TYPES.SPIKE, x });
                    objects.push({ type: OBJECT_TYPES.SPIKE, x: x + 50 });
                    objects.push({ type: OBJECT_TYPES.SPIKE, x: x + 100 });
                    x += 300;
                    break;

                case 1: // Platform with spike
                    objects.push({ type: OBJECT_TYPES.BLOCK, x, y: 50 });
                    objects.push({ type: OBJECT_TYPES.BLOCK, x: x + 50, y: 50 });
                    objects.push({ type: OBJECT_TYPES.SPIKE, x: x + 100, y: 100 });
                    x += 300;
                    break;

                case 2: // Staircase
                    objects.push({ type: OBJECT_TYPES.BLOCK, x, y: 50 });
                    objects.push({ type: OBJECT_TYPES.BLOCK, x: x + 50, y: 100 });
                    objects.push({ type: OBJECT_TYPES.BLOCK, x: x + 100, y: 150 });
                    objects.push({ type: OBJECT_TYPES.SPIKE, x: x + 150 });
                    x += 350;
                    break;

                case 3: // Ship portal
                    if (i % 5 === 0 && i > 0) {
                        objects.push({ type: OBJECT_TYPES.PORTAL_SHIP, x });
                        x += 200;
                        // Add some ship obstacles
                        objects.push({ type: OBJECT_TYPES.BLOCK, x, y: 300 });
                        objects.push({ type: OBJECT_TYPES.BLOCK, x: x + 200, y: 150 });
                        x += 400;
                        objects.push({ type: OBJECT_TYPES.PORTAL_CUBE, x });
                        x += 200;
                    } else {
                        objects.push({ type: OBJECT_TYPES.SPIKE, x });
                        x += 200;
                    }
                    break;

                case 4: // Double jump challenge
                    objects.push({ type: OBJECT_TYPES.BLOCK, x, y: 50 });
                    objects.push({ type: OBJECT_TYPES.SPIKE, x: x + 100 });
                    objects.push({ type: OBJECT_TYPES.BLOCK, x: x + 200, y: 100 });
                    objects.push({ type: OBJECT_TYPES.SPIKE, x: x + 300 });
                    x += 450;
                    break;
            }
        }

        // Finish line
        objects.push({ type: OBJECT_TYPES.FINISH, x: x + 300 });

        return objects;
    }

    /**
     * Get all levels (built-in + custom)
     */
    getAllLevels() {
        return [...this.levels, ...this.customLevels];
    }

    /**
     * Get a level by ID
     */
    getLevel(id) {
        return this.getAllLevels().find(level => level.id === id);
    }

    /**
     * Load custom levels from localStorage
     */
    loadCustomLevels() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE.LEVELS);
            if (saved) {
                this.customLevels = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load custom levels:', error);
            this.customLevels = [];
        }
    }

    /**
     * Save custom levels to localStorage
     */
    saveCustomLevels() {
        try {
            localStorage.setItem(CONFIG.STORAGE.LEVELS, JSON.stringify(this.customLevels));
        } catch (error) {
            console.error('Failed to save custom levels:', error);
        }
    }

    /**
     * Add a new custom level
     */
    addCustomLevel(level) {
        level.id = 'custom_' + Date.now();
        level.isCustom = true;
        this.customLevels.push(level);
        this.saveCustomLevels();
        return level.id;
    }

    /**
     * Update an existing custom level
     */
    updateCustomLevel(id, levelData) {
        const index = this.customLevels.findIndex(l => l.id === id);
        if (index !== -1) {
            this.customLevels[index] = { ...this.customLevels[index], ...levelData };
            this.saveCustomLevels();
            return true;
        }
        return false;
    }

    /**
     * Delete a custom level
     */
    deleteCustomLevel(id) {
        this.customLevels = this.customLevels.filter(l => l.id !== id);
        this.saveCustomLevels();
    }

    /**
     * Export level as JSON
     */
    exportLevel(level) {
        const json = JSON.stringify(level, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${level.name.replace(/\s+/g, '_')}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Import level from JSON
     */
    async importLevel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const level = JSON.parse(e.target.result);
                    // Validate level structure
                    if (!level.name || !level.objects) {
                        throw new Error('Invalid level format');
                    }
                    const id = this.addCustomLevel(level);
                    resolve(id);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Create empty level template
     */
    createEmptyLevel() {
        return {
            name: 'New Level',
            author: 'Player',
            difficulty: 1,
            bpm: 128,
            music: '/assets/music.mp3',
            backgroundColor: '#0f0f23',
            groundColor: '#1a1a3e',
            accentColor: '#00d4ff',
            objects: [
                { type: OBJECT_TYPES.FINISH, x: 3000 }
            ]
        };
    }
}
