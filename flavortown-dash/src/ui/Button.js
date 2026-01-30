import Phaser from 'phaser';

export class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, callback) {
    super(scene, x, y);

    const bg = scene.add.rectangle(0, 0, 200, 50, 0xff00cc)
      .setStrokeStyle(2, 0xffffff);
    
    const label = scene.add.text(0, 0, text, { 
      fontSize: '24px', 
      fontFamily: 'Arial',
      color: '#fff' 
    }).setOrigin(0.5);

    this.add([bg, label]);
    
    // Interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => bg.setFillStyle(0xff00aa)) // Hover effect
      .on('pointerout', () => bg.setFillStyle(0xff00cc))
      .on('pointerdown', () => {
        bg.setFillStyle(0xaa0088); // Click effect
        callback();
      });

    scene.add.existing(this);
  }
}