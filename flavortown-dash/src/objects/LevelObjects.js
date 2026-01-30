import Phaser from 'phaser';

// 1. THE SPIKE (Kills you)
export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'spike');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setSize(20, 20); // Hitbox
  }
}

// 2. THE PORTAL (Changes Game Mode)
export class Portal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    // type is 'portal_ship' or 'portal_cube'
    super(scene, x, y, type);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.portalType = type === 'portal_ship' ? 'SHIP' : 'CUBE';
  }
}

// 3. THE FINISH LINE (You Win)
export class Finish extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'finish'); // We will make a yellow texture
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.displayHeight = 500; // Tall line to catch the player
    this.body.setSize(20, 500);
  }
}