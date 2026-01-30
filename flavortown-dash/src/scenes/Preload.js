import Phaser from 'phaser';

export class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // We create a 1x1 white pixel texture programmatically 
    // so we don't need to download an asset just to test physics.
    const graphics = this.make.graphics().fillStyle(0xffffff).fillRect(0, 0, 1, 1);
    graphics.generateTexture('pixel', 1, 1);
  }

  create() {
    this.scene.start('PlayScene');
  }
}