// PreloadScene.js — โหลด assets แล้วไป WorldScene
// ห้ามใช้ let/const

var PreloadScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function PreloadScene() {
    Phaser.Scene.call(this, { key: 'PreloadScene' });
  },

  preload: function () {
    var W = this.scale.width;
    var H = this.scale.height;

    // ── Loading bar ──────────────────────────────────
    var barBg = this.add.graphics();
    barBg.fillStyle(0x333355, 1);
    barBg.fillRoundedRect(W/2 - 160, H/2 - 12, 320, 24, 8);

    var bar = this.add.graphics();

    this.add.text(W/2, H/2 - 36, 'กำลังโหลด...', {
      fontSize: '18px', fontFamily: 'Sarabun, sans-serif', color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', function (value) {
      bar.clear();
      bar.fillStyle(0x88AAFF, 1);
      bar.fillRoundedRect(W/2 - 158, H/2 - 10, 316 * value, 20, 6);
    });

    // ── Player sprite sheet ──────────────────────────
    // player-sheet.png: 570x696, frame=190x174, 3 cols x 4 rows
    // row0=ลง (frames 0-2), row1=ซ้าย (3-5), row2=ขวา (6-8), row3=ขึ้น (9-11)
    this.load.spritesheet('player', 'assets/sprites/player-sheet.png', {
      frameWidth:  190,
      frameHeight: 174,
    });

    // ── Resource node sprites ────────────────────────
    this.load.image('node_iron',    'assets/sprites/nodes/iron.png');
    this.load.image('node_wood',    'assets/sprites/nodes/wood.png');
    this.load.image('node_crystal', 'assets/sprites/nodes/crystal.png');
    this.load.image('node_wheat',   'assets/sprites/nodes/wheat.png');
    this.load.image('node_carrot',  'assets/sprites/nodes/carrot.png');
    this.load.image('node_herb',    'assets/sprites/nodes/herb.png');

    // ── FX frames ────────────────────────────────────
    this.load.image('torch_0', 'assets/fx/torch_0.png');
    this.load.image('torch_1', 'assets/fx/torch_1.png');
    this.load.image('torch_2', 'assets/fx/torch_2.png');

    this.load.image('water_0', 'assets/fx/water_0.png');
    this.load.image('water_1', 'assets/fx/water_1.png');
    this.load.image('water_2', 'assets/fx/water_2.png');
  },

  create: function () {
    // ── สร้าง walk animations ─────────────────────────
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 8 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: 'idle-down',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 1 }),
      frameRate: 1, repeat: 0,
    });

    this.scene.start('WorldScene');
  },
});
