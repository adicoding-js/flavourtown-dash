/**
 * Flavortown Dash - Main Entry Point
 * Initialize and start the game
 */

import { Game } from './engine/Game.js';
import { SCENES } from './config.js';

// Import all scenes
import { MenuScene } from './scenes/MenuScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { PlayScene } from './scenes/PlayScene.js';
import { EditorScene } from './scenes/EditorScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 Flavortown Dash - Starting...');

    // Show loading screen
    const loadingElement = document.getElementById('loading');

    try {
        // Create game instance
        const game = new Game('game-canvas');

        // Register all scenes
        game.sceneManager.register(SCENES.MENU, MenuScene);
        game.sceneManager.register(SCENES.LEVEL_SELECT, LevelSelectScene);
        game.sceneManager.register(SCENES.PLAY, PlayScene);
        game.sceneManager.register(SCENES.EDITOR, EditorScene);
        game.sceneManager.register(SCENES.SETTINGS, SettingsScene);

        // Initialize game (load assets, etc.)
        await game.init();

        // Hide loading screen
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 500);
        }

        // Start with menu scene
        await game.sceneManager.switchTo(SCENES.MENU, {}, false);

        // Start game loop
        game.start();

        // Make game accessible globally for debugging
        window.game = game;

        console.log('🚀 Game started!');
    } catch (error) {
        console.error('Failed to start game:', error);

        if (loadingElement) {
            loadingElement.innerHTML = `
                <div style="color: #ff3366; font-size: 24px;">
                    Error loading game
                </div>
                <div style="color: #888; font-size: 16px; margin-top: 10px;">
                    ${error.message}
                </div>
            `;
        }
    }
});
