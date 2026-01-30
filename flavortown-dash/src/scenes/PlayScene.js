import Phaser from 'phaser';
import { Spike, Portal, Finish } from '../objects/LevelObjects';

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create(data) {
    this.scene.launch('UIScene');
    this.isPaused = false;

    // 1. ADD BACKGROUND (Parallax)
    // We make it huge so it covers the screen
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg')
      .setOrigin(0)
      .setScrollFactor(0); // Fix it to camera (we move the texture manually)

    // 2. PHYSICS
    this.physics.world.gravity.y = 2000; 
    this.physics.world.setBounds(0, 0, 100000, 500);

    // 3. GROUPS
    const staticConfig = { allowGravity: false, immovable: true };
    this.floors = this.physics.add.staticGroup();
    this.spikes = this.physics.add.group(staticConfig);
    this.portals = this.physics.add.group(staticConfig);
    this.finishLine = this.physics.add.group(staticConfig);

    // 4. LOAD LEVEL
    let levelData = data.levelData || [{x:0, y:400, type:'floor', width:2000}];
    
    // Start Floor
    this.createFloor(200, 400, 800);

    levelData.forEach(obj => {
      if (obj.type === 'floor') {
        this.createFloor(obj.x, obj.y, obj.width || 40);
      } 
      else if (obj.type === 'spike') {
        this.spikes.add(new Spike(this, obj.x, obj.y));
      } 
      else if (obj.type.startsWith('portal')) {
        this.portals.add(new Portal(this, obj.x, obj.y, obj.type));
      } 
      else if (obj.type === 'finish') {
        this.finishLine.add(new Finish(this, obj.x, obj.y));
      }
    });

    // 5. PLAYER
    this.player = this.physics.add.sprite(100, 200, 'player');
    this.player.setCollideWorldBounds(true);
    this.gameMode = 'CUBE'; 

    // 6. COLLISIONS
    this.physics.add.collider(this.player, this.floors);
    this.physics.add.overlap(this.player, this.spikes, () => this.die(), null, this);
    this.physics.add.overlap(this.player, this.finishLine, () => this.win(), null, this);
    this.physics.add.overlap(this.player, this.portals, (p, portal) => this.switchMode(portal.portalType), null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', () => this.jumpInput = true);
    this.input.on('pointerup', () => this.jumpInput = false);
    this.spaceKey = this.input.keyboard.addKey('SPACE');
  }

  // --- NEW HELPER FOR TEXTURED FLOORS ---
  createFloor(x, y, width) {
    // A TileSprite repeats the texture instead of stretching it!
    const floor = this.add.tileSprite(x, y, width, 40, 'floor');
    this.physics.add.existing(floor, true); // true = Static Body
    floor.body.updateFromGameObject(); // Sync physics body to new size
    this.floors.add(floor);
  }

  update() {
    if (this.isPaused) return;

    this.player.setVelocityX(350);
    this.cameras.main.scrollX = this.player.x - 200;

    // --- PARALLAX EFFECT ---
    // Move the background texture slowly to create depth
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.5;

    const isActive = this.spaceKey.isDown || this.jumpInput || this.input.activePointer.isDown;

    if (this.gameMode === 'CUBE') {
      if (isActive && this.player.body.touching.down) {
        this.player.setVelocityY(-600);
      }
      if (!this.player.body.touching.down) this.player.angle += 5;
      else this.player.angle = Math.round(this.player.angle / 90) * 90;
    } else if (this.gameMode === 'SHIP') {
      this.player.angle = this.player.body.velocity.y * 0.1;
      if (isActive) this.player.setVelocityY(-350);
      else if (this.player.body.velocity.y > 400) this.player.setVelocityY(400);
    }

    if (this.player.y > 500) this.die();
  }

  switchMode(newMode) {
    if (this.gameMode === newMode) return;
    this.gameMode = newMode;
    if (newMode === 'SHIP') {
      this.player.setScale(1.2, 0.6); 
      this.physics.world.gravity.y = 1500; 
    } else {
      this.player.setScale(1); 
      this.player.angle = 0;
      this.physics.world.gravity.y = 2000; 
    }
  }

  die() { this.scene.restart(); }

  win() {
    this.scene.pause();
    this.add.text(this.player.x, 200, 'VICTORY!', { fontSize: '40px', color: '#0f0', backgroundColor: '#000' }).setOrigin(0.5);
    this.time.delayedCall(2000, () => {
        this.scene.stop('UIScene');
        this.scene.start('MenuScene');
    });
  }
}