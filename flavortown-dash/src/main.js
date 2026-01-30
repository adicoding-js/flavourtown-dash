import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene'; // <--- Import
import { MenuScene } from './scenes/MenuScene';
import { EditorScene } from './scenes/EditorScene';
import { PlayScene } from './scenes/PlayScene';
import { UIScene } from './scenes/UIScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: '#000',
  parent: 'app',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
    
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  // ADD UIScene TO THE LIST
  scene: [PreloadScene, MenuScene, EditorScene, PlayScene, UIScene] 
};

const game = new Phaser.Game(config);

const fileInput = document.getElementById('level-upload');
if (fileInput) {
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const levelData = JSON.parse(e.target.result);
        game.scene.stop('MenuScene');
        game.scene.stop('EditorScene');
        game.scene.start('PlayScene', { levelData: levelData });
      } catch (err) {
        alert("Error loading file.");
      }
    };
    reader.readAsText(file);
  });
}