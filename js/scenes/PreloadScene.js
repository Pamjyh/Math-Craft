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
    barBg.fillStyle(0x222233, 1);
    barBg.fillRect(0, 0, W, H);
    barBg.fillStyle(0x333355, 1);
    barBg.fillRoundedRect(W/2 - 160, H/2 - 12, 320, 24, 8);

    var bar    = this.add.graphics();
    var errTxt = this.add.text(W/2, H/2 + 46, '', {
      fontSize: '11px', fontFamily: 'Sarabun, sans-serif', color: '#ff8888',
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 - 40, '⚔ Math Craft', {
      fontSize: '28px', fontFamily: 'Sarabun, sans-serif', color: '#FFD700',
    }).setOrigin(0.5);
    this.add.text(W/2, H/2 + 20, 'กำลังโหลด...', {
      fontSize: '14px', fontFamily: 'Sarabun, sans-serif', color: '#aaaacc',
    }).setOrigin(0.5);

    this.load.on('progress', function (v) {
      bar.clear();
      bar.fillStyle(0xFFAA33, 1);
      bar.fillRoundedRect(W/2 - 158, H/2 - 10, 316 * v, 20, 6);
    });

    // แสดง error ถ้า asset โหลดไม่ได้ (debug)
    this.load.on('loaderror', function (file) {
      errTxt.setText('⚠ ' + file.key + ' — ' + file.src);
      console.warn('Asset failed:', file.key, file.src);
    });

    // ── Player sprite sheet ──────────────────────────
    // 570x696, frame 190x174, 3 cols x 4 rows
    // row0=ลง(0-2), row1=ซ้าย(3-5), row2=ขวา(6-8), row3=ขึ้น(9-11)
    this.load.spritesheet('player', 'assets/sprites/player-sheet.png', {
      frameWidth: 190, frameHeight: 174,
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

    // ── Village decorations ───────────────────────────
    this.load.image('deco_house',   'assets/deco/village_house.png');
    this.load.image('deco_temple',  'assets/deco/village_temple.png');
    this.load.image('deco_stall',   'assets/deco/village_stall.png');
    this.load.image('deco_fence',   'assets/deco/village_fence.png');

    // ── Forest decorations ────────────────────────────
    this.load.image('deco_tree_big', 'assets/deco/forest_tree_big.png');
    this.load.image('deco_pillar',   'assets/deco/forest_pillar.png');
    this.load.image('deco_ruins',    'assets/deco/forest_ruins.png');
    this.load.image('deco_tree_sm',  'assets/deco/forest_tree_small.png');
    this.load.image('deco_stump',    'assets/deco/forest_stump.png');

    // ── Mine decorations ──────────────────────────────
    this.load.image('deco_cave',    'assets/deco/mine_cave_entrance.png');
    this.load.image('deco_crystal', 'assets/deco/mine_crystal.png');
    this.load.image('deco_rocks',   'assets/deco/mine_rocks.png');

    // ── Farm decorations ──────────────────────────────
    this.load.image('deco_barn',       'assets/deco/farm_barn.png');
    this.load.image('deco_scarecrow',  'assets/deco/farm_scarecrow.png');
    this.load.image('deco_waterwheel', 'assets/deco/farm_waterwheel.png');
  },

  create: function () {
    // ── Walk animations ──────────────────────────────
    // ตรวจก่อนว่า 'player' โหลดได้จริง
    if (this.textures.exists('player')) {
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
    } else {
      console.warn('player texture missing — animations skipped');
    }

    this.scene.start('WorldScene');
  },
});
