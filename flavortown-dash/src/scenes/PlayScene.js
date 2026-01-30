import Phaser from 'phaser';
import { Spike, Portal, Finish } from '../objects/LevelObjects';

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create(data) {
    // 1. UI STUFF
    // Launch the pause menu on top (so we can rage quit later)
    this.scene.launch('UIScene');
    this.isPaused = false;

    // 2. BACKGROUND (Parallax babyyyy!)
    // We make this HUGE and scroll it slower than the camera for that 3D feel
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg')
      .setOrigin(0)
      .setScrollFactor(0); 

    // 3. PHYSICS ENGINE GO BRRR
    this.physics.world.gravity.y = 2000; // Heavy gravity so jumping feels snappy
    this.physics.world.setBounds(0, 0, 100000, 500); // The world is loooooong

    // 4. GROUPS (The squad)
    // IMPORTANT: Spikes/Portals float, so NO GRAVITY for them!
    const staticConfig = { allowGravity: false, immovable: true };

    this.floors = this.physics.add.staticGroup(); // Ground doesn't fall (hopefully)
    this.spikes = this.physics.add.group(staticConfig);      // Pointy things
    this.portals = this.physics.add.group(staticConfig);     // Magic doors
    this.finishLine = this.physics.add.group(staticConfig);  // The W

    // 5. LOAD THE MAP 🗺️
    // If editor gave us data, use it. If not, make a floor so we don't fall into the void.
    let levelData = data.levelData || [{x:0, y:400, type:'floor', width:2000}];
    
    // Safety floor at start (spawn protection lol)
    this.createFloor(200, 400, 800);

    // Loop through the list and spawn everything
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

    // 6. THE MAIN CHARACTER (You)
    this.player = this.physics.add.sprite(100, 200, 'player');
    this.player.setCollideWorldBounds(true); // Don't leave the screen pls
    this.gameMode = 'CUBE'; // We start as a box

    // 7. COLLISIONS (Ouch detection)
    this.physics.add.collider(this.player, this.floors); // Stand on floor
    this.physics.add.overlap(this.player, this.spikes, () => this.die(), null, this); // Touch spike = DED
    this.physics.add.overlap(this.player, this.finishLine, () => this.win(), null, this); // Touch yellow = WIN
    // Magic portal touching logic
    this.physics.add.overlap(this.player, this.portals, (p, portal) => {
        this.switchMode(portal.portalType);
    }, null, this);

    // 8. INPUTS (Clicky clicky)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', () => this.jumpInput = true); // Mouse/Touch
    this.input.on('pointerup', () => this.jumpInput = false);
    this.spaceKey = this.input.keyboard.addKey('SPACE'); // Spacebar
  }

  // --- HELPER TO MAKE FLOORS LOOK COOL ---
  createFloor(x, y, width) {
    // Using tileSprite so the texture repeats instead of looking like stretched gum
    const floor = this.add.tileSprite(x, y, width, 40, 'floor');
    this.physics.add.existing(floor, true); // TRUE means it's static (won't move)
    floor.body.updateFromGameObject(); // Tell physics "Yo, I'm wide now"
    this.floors.add(floor);
  }

  update() {
    // If paused, FREEZE EVERYTHING 🥶
    if (this.isPaused) return;

    // 1. ALWAYS RUNNING (Can't stop, won't stop)
    this.player.setVelocityX(350);
    
    // 2. STALKER CAMERA 📸
    // Keep player in the center-ish
    this.cameras.main.scrollX = this.player.x - 200;

    // 3. PARALLAX EFFECT
    // Move bg slower than camera to look deep
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.5;

    // Check if player wants to jump
    const isActive = this.spaceKey.isDown || this.jumpInput || this.input.activePointer.isDown;

    // --- CUBE MODE (Classic) ---
    if (this.gameMode === 'CUBE') {
      // Jump only if touching ground
      if (isActive && this.player.body.touching.down) {
        this.player.setVelocityY(-600); // YEET UP
      }
      
      // Rotate if in air (Style points)
      if (!this.player.body.touching.down) {
        this.player.angle += 5; // Spinny spin
      } else {
        // Snap back to flat when landing so we don't trip
        const nearest = Math.round(this.player.angle / 90) * 90;
        this.player.angle = Phaser.Math.Linear(this.player.angle, nearest, 0.2);
      }
    } 
    // --- SHIP MODE (Flappy Bird style) ---
    else if (this.gameMode === 'SHIP') {
      // Tilt ship based on speed (looks pro)
      this.player.angle = this.player.body.velocity.y * 0.1;
      
      if (isActive) {
        this.player.setVelocityY(-350); // FLY UP!
      } else {
        // Cap the fall speed so we don't plummet like a rock
        if (this.player.body.velocity.y > 400) this.player.setVelocityY(400);
      }
    }

    // 4. VOID CHECK
    // If you fell off the map... skill issue.
    if (this.player.y > 500) {
      this.die();
    }
  }

  switchMode(newMode) {
    // Don't switch if we are already that thing
    if (this.gameMode === newMode) return;
    
    this.gameMode = newMode;
    console.log("TRANSFORMING INTO:", newMode);
    
    if (newMode === 'SHIP') {
      // BECOME ROCKET 🚀
      this.player.setTexture('ship'); 
      this.physics.world.gravity.y = 1000; // Less gravity makes flying easier
    } else {
      // BECOME CUBE 🟦
      this.player.setTexture('player'); 
      this.player.angle = 0; // Fix rotation
      this.physics.world.gravity.y = 2000; // Heavy gravity needed for jumping
    }
  }

  die() {
    console.log("RIP BOZO 💀");
    this.scene.restart(); // Try again lol
  }

  win() {
    console.log("EZ CLAP 🏆");
    this.scene.pause(); // Stop time
    
    // Show giant text
    this.add.text(this.player.x, 200, 'GG WP!', { 
      fontSize: '60px', 
      fontStyle: 'bold',
      color: '#0f0', 
      backgroundColor: '#000',
      padding: { x: 20, y: 20 }
    }).setOrigin(0.5);

    // Wait 2 secs then go to menu
    this.time.delayedCall(2000, () => {
        this.scene.stop('UIScene');
        this.scene.start('MenuScene');
    });
  }
}