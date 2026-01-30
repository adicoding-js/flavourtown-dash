import Phaser from 'phaser';
import { Button } from '../ui/Button';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    // 1. Settings Button (Gear Icon) - Always visible
    const gear = this.add.text(760, 20, '⚙️', { fontSize: '30px' })
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.togglePause());

    // 2. The Pause Menu Container (Hidden by default)
    this.menuContainer = this.add.container(400, 225).setVisible(false);

    // Dark Background Overlay
    const bg = this.add.rectangle(0, 0, 800, 450, 0x000000, 0.8);
    
    // Title
    const title = this.add.text(0, -100, 'PAUSED', { fontSize: '40px', color: '#fff' }).setOrigin(0.5);

    // Buttons
    const btnResume = new Button(this, 0, -20, 'RESUME', () => this.togglePause());
    const btnRestart = new Button(this, 0, 50, 'RESTART', () => {
      this.togglePause();
      this.scene.get('PlayScene').scene.restart();
    });
    const btnExit = new Button(this, 0, 120, 'EXIT TO MENU', () => {
      this.scene.stop('PlayScene');
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });

    this.menuContainer.add([bg, title, btnResume, btnRestart, btnExit]);

    // Keyboard 'ESC' support
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
  }

  togglePause() {
    const playScene = this.scene.get('PlayScene');
    const isPaused = this.menuContainer.visible;

    if (isPaused) {
      // Resume Game
      this.menuContainer.setVisible(false);
      playScene.physics.resume();
      playScene.isPaused = false;
    } else {
      // Pause Game
      this.menuContainer.setVisible(true);
      playScene.physics.pause();
      playScene.isPaused = true;
    }
  }
}