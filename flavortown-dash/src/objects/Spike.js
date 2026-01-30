import Phaser from 'phaser';

export class Spike extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // We use a triangle texture we'll make in the scene
    super(scene, x, y, 'spike');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Make it static (so it doesn't fall or get pushed)
    this.setImmovable(true);
    this.body.allowGravity = false;

    // Make the hitbox smaller so it's not "unfair"
    // (Real GD players know hitboxes are smaller than the art)
    this.body.setSize(20, 20); 
    this.body.setOffset(5, 10);
  }
}