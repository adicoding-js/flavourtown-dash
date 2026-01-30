import Phaser from 'phaser';
import { Button } from '../ui/Button';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    // 1. Cool Background
    this.add.rectangle(400, 225, 800, 450, 0x1a1a2e);
    
    // 2. Title
    this.add.text(400, 100, 'FLAVORTOWN DASH', {
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#00ffcc',
      shadow: { offsetX: 4, offsetY: 4, color: '#ff0055', blur: 0, stroke: true, fill: true }
    }).setOrigin(0.5);

    // 3. Buttons
    new Button(this, 400, 250, 'PLAY DEMO', () => this.scene.start('PlayScene'));
    new Button(this, 400, 320, 'LEVEL EDITOR', () => this.scene.start('EditorScene'));
    
    // 4. Load Custom Level Button
    const loadBtn = new Button(this, 400, 390, 'LOAD LEVEL FILE', () => {
      // Trigger hidden HTML file input
      document.getElementById('level-upload').click();
    });
  }
}