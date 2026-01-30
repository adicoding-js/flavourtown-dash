import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // 1. Load the Environment
    this.load.image('bg', 'assets/bg.png');
    this.load.image('floor', 'assets/floor.png');
    this.load.image('spike', 'assets/spike.png');
    this.load.image('finish', 'assets/finish.png');

    // 2. Load the Player Forms
    this.load.image('player', 'assets/player.png'); // Cube
    this.load.image('ship', 'assets/ship.png');     // Rocket

    // 3. Load the Portals
    this.load.image('portal_ship', 'assets/portal_ship.png');
    this.load.image('portal_cube', 'assets/portal_cube.png');
  }

  create() {
    this.scene.start('MenuScene');
  }
}