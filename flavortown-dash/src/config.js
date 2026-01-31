/**
 * Flavortown Dash - Game Configuration
 * Central configuration for all game constants and settings
 */

export const CONFIG = {
    // Canvas & Display
    CANVAS: {
        WIDTH: 1280,
        HEIGHT: 720,
        BACKGROUND: '#0f0f23'
    },

    // Physics
    PHYSICS: {
        GRAVITY: 2800,
        JUMP_FORCE: -850,
        PLAYER_SPEED: 600,
        SHIP_LIFT: -1200,
        SHIP_FALL: 800,
        TERMINAL_VELOCITY: 1200
    },

    // Player
    PLAYER: {
        SIZE: 50,
        START_X: 150,
        GROUND_Y: 500,
        ROTATION_SPEED: 400, // degrees per second
        TRAIL_LENGTH: 8
    },

    // Ground
    GROUND: {
        HEIGHT: 170,
        TILE_WIDTH: 100
    },

    // Game Objects
    OBJECTS: {
        SPIKE: { WIDTH: 50, HEIGHT: 50 },
        BLOCK: { SIZE: 50 },
        PORTAL: { WIDTH: 80, HEIGHT: 150 }
    },

    // Colors - Modern Geometry Dash style
    COLORS: {
        PRIMARY: '#00d4ff',
        SECONDARY: '#ff0080',
        ACCENT: '#ffcc00',
        SUCCESS: '#00ff88',
        DANGER: '#ff3366',
        DARK: '#0f0f23',
        DARKER: '#070714',
        LIGHT: '#ffffff',
        GROUND: '#1a1a3e',
        GROUND_TOP: '#2d2d5a'
    },

    // Audio
    AUDIO: {
        MASTER_VOLUME: 0.7,
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.8
    },

    // Camera
    CAMERA: {
        OFFSET_X: 350,
        SHAKE_INTENSITY: 10,
        SHAKE_DURATION: 200
    },

    // Particles
    PARTICLES: {
        DEATH_COUNT: 30,
        TRAIL_LIFETIME: 300,
        JUMP_BURST: 8
    },

    // UI
    UI: {
        FONT_FAMILY: "'Outfit', sans-serif",
        TITLE_SIZE: '72px',
        HEADING_SIZE: '36px',
        BODY_SIZE: '18px',
        BUTTON_PADDING: '20px 40px',
        BORDER_RADIUS: '12px',
        TRANSITION: '0.3s ease'
    },

    // Level Editor
    EDITOR: {
        GRID_SIZE: 50,
        SNAP_TO_GRID: true
    },

    // Storage Keys
    STORAGE: {
        LEVELS: 'flavortown_custom_levels',
        SETTINGS: 'flavortown_settings',
        PROGRESS: 'flavortown_progress'
    }
};

// Game modes
export const GAME_MODES = {
    CUBE: 'cube',
    SHIP: 'ship'
};

// Object types for level data
export const OBJECT_TYPES = {
    SPIKE: 'spike',
    BLOCK: 'block',
    PORTAL_CUBE: 'portal_cube',
    PORTAL_SHIP: 'portal_ship',
    FINISH: 'finish'
};

// Scene names
export const SCENES = {
    MENU: 'menu',
    LEVEL_SELECT: 'levelSelect',
    PLAY: 'play',
    EDITOR: 'editor',
    SETTINGS: 'settings'
};
