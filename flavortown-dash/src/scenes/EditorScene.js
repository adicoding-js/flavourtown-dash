import Phaser from 'phaser';

export class EditorScene extends Phaser.Scene {
  constructor() {
    super('EditorScene');
  }

  preload() {
    // Textures need to be here too for the editor preview
    const makeTex = (name, color) => {
        if (!this.textures.exists(name)) this.make.graphics().fillStyle(color).fillRect(0,0,40,40).generateTexture(name, 40, 40);
    };
    makeTex('player', 0x00ffcc);
    makeTex('floor', 0xff0055);
    makeTex('portal_ship', 0xff00ff);
    makeTex('portal_cube', 0x00ff00);
    makeTex('finish', 0xffff00);
    if (!this.textures.exists('spike')) {
       const spike = this.make.graphics().fillStyle(0xff0000);
       spike.beginPath(); spike.moveTo(0, 40); spike.lineTo(20, 0); spike.lineTo(40, 40); spike.closePath(); spike.fillPath();
       spike.generateTexture('spike', 40, 40);
    }
  }

  create() {
    this.cameras.main.setBackgroundColor('#111');
    this.add.grid(0, 0, 20000, 1000, 40, 40, 0x222222).setOrigin(0);
    
    this.tool = 'floor';
    this.levelData = []; 
    this.previewObjects = this.add.group();

    this.add.text(10, 10, 
      'TOOLS: [1] Floor [2] Spike [3] Eraser [4] Ship [5] Cube [6] Finish\n[S] Save  [Enter] Play  [Esc] Menu', 
      { fontSize: '14px', backgroundColor: '#000', padding: { x: 5, y: 5 } }
    ).setScrollFactor(0).setDepth(100);

    this.toolText = this.add.text(10, 60, 'TOOL: FLOOR', { fontSize: '20px', color: '#0f0' })
      .setScrollFactor(0).setDepth(100);

    this.marker = this.add.graphics().setDepth(50);

    this.input.on('pointerdown', this.handleInput, this);
    
    // Keybinds for tools
    this.input.keyboard.on('keydown-ONE', () => this.setTool('floor'));
    this.input.keyboard.on('keydown-TWO', () => this.setTool('spike'));
    this.input.keyboard.on('keydown-THREE', () => this.setTool('eraser'));
    this.input.keyboard.on('keydown-FOUR', () => this.setTool('portal_ship'));
    this.input.keyboard.on('keydown-FIVE', () => this.setTool('portal_cube'));
    this.input.keyboard.on('keydown-SIX', () => this.setTool('finish'));

    this.input.keyboard.on('keydown-S', () => this.saveLevel());
    this.input.keyboard.on('keydown-ENTER', () => this.scene.start('PlayScene', { levelData: this.levelData }));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
  }

  update(time, delta) {
    const speed = 700;
    if (this.keys.A.isDown) this.cameras.main.scrollX -= speed * (delta / 1000);
    if (this.keys.D.isDown) this.cameras.main.scrollX += speed * (delta / 1000);

    const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
    const gridX = Math.floor(worldPoint.x / 40) * 40;
    const gridY = Math.floor(worldPoint.y / 40) * 40;

    this.marker.clear();
    this.marker.lineStyle(2, 0xffffff);
    this.marker.strokeRect(gridX, gridY, 40, 40);
  }

  setTool(name) {
    this.tool = name;
    this.toolText.setText(`TOOL: ${name.toUpperCase().replace('_', ' ')}`);
    this.toolText.setColor(name === 'eraser' ? '#f00' : '#0f0');
  }

  handleInput(pointer) {
    const worldPoint = pointer.positionToCamera(this.cameras.main);
    const gridX = Math.floor(worldPoint.x / 40) * 40;
    const gridY = Math.floor(worldPoint.y / 40) * 40;

    this.removeFromData(gridX, gridY);

    if (this.tool !== 'eraser') {
      const sprite = this.add.image(gridX + 20, gridY + 20, this.tool);
      this.previewObjects.add(sprite);
      this.levelData.push({ x: gridX + 20, y: gridY + 20, type: this.tool, width: 40 });
    }
  }

  removeFromData(x, y) {
    this.levelData = this.levelData.filter(obj => 
      !(Math.abs(obj.x - (x + 20)) < 1 && Math.abs(obj.y - (y + 20)) < 1)
    );
    this.previewObjects.getChildren().forEach(child => {
      if (Math.abs(child.x - (x + 20)) < 1 && Math.abs(child.y - (y + 20)) < 1) {
        child.destroy();
      }
    });
  }

  saveLevel() {
    const jsonContent = JSON.stringify(this.levelData);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", "level.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  }
}