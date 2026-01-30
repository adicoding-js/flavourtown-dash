import Phaser from 'phaser';

// 1. THE SPIKE
export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'spike');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    // Shrink hitbox slightly to be fair
    this.body.setSize(this.width * 0.5, this.height * 0.5); 
  }
}

// 2. THE PORTAL (Switch Game Modes)
export class Portal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    // type is 'portal_ship' or 'portal_cube'
    super(scene, x, y, type); 
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    
    // Store the mode this portal activates
    this.portalType = type === 'portal_ship' ? 'SHIP' : 'CUBE';
  }
}

// 3. THE FINISH LINE (Win Level)
export class Finish extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'finish');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
  }
}