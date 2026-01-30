import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // 1. Load Images from the "public/assets" folder
    this.load.image('player', 'assets/player.png');
    this.load.image('spike', 'assets/spike.png');
    this.load.image('floor', 'assets/floor.png');
    this.load.image('bg', 'assets/bg.png');
    
    // Load Portal/Finish textures (using placeholders if you don't have art yet)
    // You can replace these with real load.image() calls later!
    const makeTex = (name, color) => {
        if (!this.textures.exists(name)) this.make.graphics().fillStyle(color).fillRect(0,0,40,40).generateTexture(name, 40, 40);
    };
    makeTex('portal_ship', 0xff00ff);
    makeTex('portal_cube', 0x00ff00);
    makeTex('finish', 0xffff00);
  }

  create() {
    // Once loaded, go to the Menu
    this.scene.start('MenuScene');
  }
}