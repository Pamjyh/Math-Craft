// WorldScene.js — main game world (M1.5)
// ห้ามใช้ let/const

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function WorldScene() {
    Phaser.Scene.call(this, { key: 'WorldScene' });
    this._target    = null;
    this._moving    = false;
    this._tapDir    = 'down';
    this._player    = null;
    this._marker    = null;
    this._dayText   = null;
    this._lastDir   = 'down';
    this._torches   = [];
    this._torchIdx  = 0;
    this._torchTick = 0;
  },

  // ─────────────────────────────────────────────────
  create: function () {
    var self  = this;
    var W     = MC_CONFIG.WORLD_WIDTH;
    var H     = MC_CONFIG.WORLD_HEIGHT;
    var zones = MC_CONFIG.ZONES;
    var vz    = zones.village;
    var fz    = zones.forest;
    var mz    = zones.mine;
    var az    = zones.farm;

    // ── World base (ท้องฟ้าสีเข้ม) ──────────────────
    var base = this.add.graphics().setDepth(0);
    base.fillStyle(0x0D1117, 1);
    base.fillRect(0, 0, W, H);

    // ── Zone backgrounds (Graphics — ไม่พึ่ง texture) ─
    // เพิ่ม grid pattern เล็กๆ ทำให้ดู tiled
    var bg = this.add.graphics().setDepth(1);
    var gi, gStep;

    // FOREST — เขียวเข้ม
    bg.fillStyle(0x2A5018, 1);
    bg.fillRect(fz.x, fz.y, fz.w, fz.h);
    // accent patches
    bg.fillStyle(0x345E20, 0.6);
    bg.fillRect(fz.x + 60,  fz.y + 80,  220, 160);
    bg.fillRect(fz.x + 400, fz.y + 500, 280, 200);
    bg.fillRect(fz.x + 100, fz.y + 900, 200, 180);
    // grid
    bg.lineStyle(1, 0x3A6828, 0.18);
    gStep = 48;
    for (gi = fz.y; gi < fz.y + fz.h; gi += gStep) bg.lineBetween(fz.x, gi, fz.x + fz.w, gi);
    for (gi = fz.x; gi < fz.x + fz.w; gi += gStep) bg.lineBetween(gi, fz.y, gi, fz.y + fz.h);

    // MINE — น้ำเงินเข้ม / หิน
    bg.fillStyle(0x131825, 1);
    bg.fillRect(mz.x, mz.y, mz.w, mz.h);
    bg.fillStyle(0x1E2535, 0.7);
    bg.fillRect(mz.x + 200, mz.y + 30,  600, 120);
    bg.fillRect(mz.x + 900, mz.y + 50,  500, 100);
    bg.fillRect(mz.x + 1600,mz.y + 30,  700, 130);
    // grid diagonal-ish
    bg.lineStyle(1, 0x252C40, 0.30);
    for (gi = mz.y; gi < mz.y + mz.h; gi += 40) bg.lineBetween(mz.x, gi, mz.x + mz.w, gi);
    for (gi = mz.x; gi < mz.x + mz.w; gi += 40) bg.lineBetween(gi, mz.y, gi, mz.y + mz.h);

    // FARM — ดินน้ำตาล / พื้นนา
    bg.fillStyle(0x3A2010, 1);
    bg.fillRect(az.x, az.y, az.w, az.h);
    // แถบนาข้าว
    bg.fillStyle(0x4A6030, 0.55);
    bg.fillRect(az.x + 40,  az.y + 200, 720, 80);
    bg.fillRect(az.x + 40,  az.y + 400, 720, 80);
    bg.fillRect(az.x + 40,  az.y + 600, 720, 80);
    bg.fillRect(az.x + 40,  az.y + 800, 720, 80);
    bg.lineStyle(1, 0x4A3020, 0.25);
    for (gi = az.y; gi < az.y + az.h; gi += 40) bg.lineBetween(az.x, gi, az.x + az.w, gi);
    for (gi = az.x; gi < az.x + az.w; gi += 64) bg.lineBetween(gi, az.y, gi, az.y + az.h);

    // VILLAGE — หิน/ไม้สีอบอุ่น
    bg.fillStyle(0x7A5A28, 1);
    bg.fillRect(vz.x, vz.y, vz.w, vz.h);
    // ถนนกลาง
    bg.fillStyle(0x9A7A48, 0.5);
    bg.fillRect(vz.x + vz.w/2 - 40, vz.y, 80, vz.h);
    bg.fillStyle(0x8A6A38, 0.4);
    bg.fillRect(vz.x, vz.y + vz.h/2 - 30, vz.w, 60);
    bg.lineStyle(1, 0xAA8A50, 0.18);
    for (gi = vz.y; gi < vz.y + vz.h; gi += 48) bg.lineBetween(vz.x, gi, vz.x + vz.w, gi);
    for (gi = vz.x; gi < vz.x + vz.w; gi += 48) bg.lineBetween(gi, vz.y, gi, vz.y + vz.h);

    // ── Zone borders ─────────────────────────────────
    var border = this.add.graphics().setDepth(2);
    border.lineStyle(4, 0x000000, 0.40);
    border.strokeRect(fz.x, fz.y, fz.w, fz.h);
    border.strokeRect(mz.x, mz.y, mz.w, mz.h);
    border.strokeRect(az.x, az.y, az.w, az.h);
    border.strokeRect(vz.x, vz.y, vz.w, vz.h);

    // ── VILLAGE deco ─────────────────────────────────
    this._deco('deco_house',  vz.x + 180, vz.y + 300, 0.55, 3);
    this._deco('deco_temple', vz.x + 620, vz.y + 180, 0.70, 3);
    this._deco('deco_stall',  vz.x + 580, vz.y + 430, 0.65, 3);
    this._deco('deco_fence',  vz.x + 80,  vz.y + 600, 0.70, 3);
    this._deco('deco_fence',  vz.x + 270, vz.y + 600, 0.70, 3);
    this._deco('deco_fence',  vz.x + 460, vz.y + 600, 0.70, 3);
    this._deco('deco_fence',  vz.x + 650, vz.y + 600, 0.70, 3);

    // Notice board
    var bx = vz.x + vz.w/2;
    var by = vz.y + 90;
    var board = this.add.graphics().setDepth(4);
    board.fillStyle(0x6B3F1F, 1);
    board.fillRoundedRect(bx - 90, by, 180, 100, 10);
    board.fillStyle(0xF5E6C8, 1);
    board.fillRoundedRect(bx - 80, by + 8, 160, 84, 7);
    this.add.text(bx, by + 38, '📋 สะพานจักรวาล', {
      fontSize: '15px', fontFamily: 'Sarabun, sans-serif', color: '#5c3d1a',
    }).setOrigin(0.5, 0.5).setDepth(5);
    this.add.text(bx, by + 68, '0 / 100 ชิ้น', {
      fontSize: '18px', fontFamily: 'Sarabun, sans-serif', color: '#2d6a2d', fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(5);

    // Workbench
    var wbg = this.add.graphics().setDepth(4);
    wbg.fillStyle(0x5A3010, 1);
    wbg.fillRoundedRect(vz.x + 360, vz.y + 560, 80, 60, 6);
    this.add.text(vz.x + 400, vz.y + 585, '🔨', { fontSize: '26px' }).setOrigin(0.5, 0.5).setDepth(5);
    this.add.text(vz.x + 400, vz.y + 617, 'craft', {
      fontSize: '12px', fontFamily: 'Sarabun, sans-serif', color: '#ffffff',
    }).setOrigin(0.5, 0.5).setDepth(5);

    // ── FOREST deco ───────────────────────────────────
    this._deco('deco_tree_big', fz.x + 90,  fz.y + 120,  0.75, 3);
    this._deco('deco_tree_big', fz.x + 490, fz.y + 250,  0.65, 3);
    this._deco('deco_tree_big', fz.x + 150, fz.y + 700,  0.80, 3);
    this._deco('deco_tree_big', fz.x + 560, fz.y + 900,  0.60, 3);
    this._deco('deco_pillar',   fz.x + 320, fz.y + 150,  0.55, 3);
    this._deco('deco_pillar',   fz.x + 600, fz.y + 600,  0.50, 3);
    this._deco('deco_ruins',    fz.x + 200, fz.y + 500,  0.65, 3);
    this._deco('deco_ruins',    fz.x + 520, fz.y + 400,  0.55, 3);
    this._deco('deco_stump',    fz.x + 400, fz.y + 820,  0.60, 3);
    this._deco('deco_stump',    fz.x + 100, fz.y + 1050, 0.55, 3);
    this._deco('deco_tree_sm',  fz.x + 640, fz.y + 1100, 0.55, 3);
    this._deco('deco_tree_sm',  fz.x + 300, fz.y + 1050, 0.50, 3);

    // ── MINE deco ─────────────────────────────────────
    this._deco('deco_cave',    mz.x + 350,  mz.y + 180, 0.70, 3);
    this._deco('deco_cave',    mz.x + 1100, mz.y + 160, 0.65, 3);
    this._deco('deco_cave',    mz.x + 1900, mz.y + 180, 0.70, 3);
    this._deco('deco_crystal', mz.x + 200,  mz.y + 350, 0.80, 4);
    this._deco('deco_crystal', mz.x + 600,  mz.y + 280, 0.65, 4);
    this._deco('deco_crystal', mz.x + 900,  mz.y + 400, 0.75, 4);
    this._deco('deco_crystal', mz.x + 1400, mz.y + 300, 0.70, 4);
    this._deco('deco_crystal', mz.x + 1700, mz.y + 380, 0.80, 4);
    this._deco('deco_crystal', mz.x + 2200, mz.y + 350, 0.65, 4);
    this._deco('deco_rocks',   mz.x + 800,  mz.y + 200, 0.55, 3);
    this._deco('deco_rocks',   mz.x + 1600, mz.y + 420, 0.50, 3);

    // Animated torches
    var torchXs = [180, 600, 1050, 1500, 2000, 2300];
    var ti;
    for (ti = 0; ti < torchXs.length; ti++) {
      var t = this.add.image(mz.x + torchXs[ti], mz.y + 80, 'torch_0');
      t.setScale(0.38).setDepth(4).setAlpha(0.95);
      this._torches.push(t);
    }

    // ── FARM deco ─────────────────────────────────────
    this._deco('deco_barn',       az.x + 560, az.y + 100,  0.60, 3);
    this._deco('deco_scarecrow',  az.x + 200, az.y + 600,  0.70, 4);
    this._deco('deco_waterwheel', az.x + 650, az.y + 1000, 0.70, 4);

    // ── RESOURCE NODES ────────────────────────────────
    this._addNode(vz.x + 680, vz.y + 500, 'node_iron',    'แร่เหล็ก',  0.9);
    this._addNode(fz.x + 250, fz.y + 350, 'node_wood',    'ไม้โอ๊ค',   0.85);
    this._addNode(fz.x + 550, fz.y + 750, 'node_herb',    'ใบไม้',     1.0);
    this._addNode(mz.x + 500, mz.y + 380, 'node_crystal', 'แร่ผลึก',   1.1);
    this._addNode(mz.x + 1300,mz.y + 350, 'node_iron',    'หินแกรนิต', 0.9);
    this._addNode(az.x + 150, az.y + 400, 'node_wheat',   'ข้าวสาลี',  0.9);
    this._addNode(az.x + 380, az.y + 800, 'node_carrot',  'แครอท',     0.85);

    // ── ZONE LABELS ───────────────────────────────────
    var lStyle = {
      fontSize: '22px', fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff', stroke: '#00000088', strokeThickness: 4,
    };
    this.add.text(fz.x + fz.w/2, fz.y + 16, '🌲 ป่า',       lStyle).setOrigin(0.5,0).setDepth(9);
    this.add.text(mz.x + mz.w/2, mz.y + 16, '🏔 เหมือง',    lStyle).setOrigin(0.5,0).setDepth(9);
    this.add.text(az.x + az.w/2, az.y + 16, '🌾 ไร่นา',     lStyle).setOrigin(0.5,0).setDepth(9);
    this.add.text(vz.x + vz.w/2, vz.y + 16, '🏘 หมู่บ้าน', lStyle).setOrigin(0.5,0).setDepth(9);

    // ── PLAYER ────────────────────────────────────────
    var startX = vz.x + vz.w/2;
    var startY = vz.y + vz.h/2;
    this._player = this.add.sprite(startX, startY, 'player', 1);
    this._player.setScale(0.38).setDepth(6);
    this._player.setFrame(1); // idle-down

    // ── TAP MARKER ───────────────────────────────────
    this._marker = this.add.graphics().setDepth(7);

    // ── CAMERA ───────────────────────────────────────
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this._player, true, 0.10, 0.10);
    this.cameras.main.setZoom(this._calcZoom());
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // ── INPUT ─────────────────────────────────────────
    this.input.on('pointerdown', function (ptr) {
      self._setTarget(ptr.worldX, ptr.worldY);
    });
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd    = this.input.keyboard.addKeys({ up:'W', down:'S', left:'A', right:'D' });

    // ── HUD ───────────────────────────────────────────
    this._dayText = this.add.text(16, 16, '☀ กลางวัน', {
      fontSize: '17px', fontFamily: 'Sarabun, sans-serif',
      color: '#FFE566', stroke: '#00000099', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(10);

    this.add.text(16, 38, 'Math Craft ' + MC_CONFIG.VERSION, {
      fontSize: '11px', fontFamily: 'Sarabun, sans-serif', color: '#ffffff66',
    }).setScrollFactor(0).setDepth(10);
  },

  // ─────────────────────────────────────────────────
  update: function (time, delta) {
    var speed = MC_CONFIG.PLAYER_SPEED;
    var dt    = delta / 1000;
    var px    = this._player.x;
    var py    = this._player.y;
    var moved = false;
    var dir   = this._lastDir;

    // ── Keyboard ─────────────────────────────────────
    var kbX = 0; var kbY = 0;
    if (this._cursors.left.isDown  || this._wasd.left.isDown)  kbX = -1;
    if (this._cursors.right.isDown || this._wasd.right.isDown) kbX =  1;
    if (this._cursors.up.isDown    || this._wasd.up.isDown)    kbY = -1;
    if (this._cursors.down.isDown  || this._wasd.down.isDown)  kbY =  1;

    if (kbX !== 0 || kbY !== 0) {
      var kbLen = Math.sqrt(kbX*kbX + kbY*kbY);
      px += (kbX/kbLen) * speed * dt;
      py += (kbY/kbLen) * speed * dt;
      this._target = null; this._moving = false;
      dir = (Math.abs(kbX) > Math.abs(kbY))
        ? (kbX > 0 ? 'right' : 'left')
        : (kbY > 0 ? 'down'  : 'up');
      moved = true;
    }

    // ── Tap-to-move ───────────────────────────────────
    if (!moved && this._moving && this._target) {
      var dx   = this._target.x - px;
      var dy   = this._target.y - py;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var step = speed * dt;
      if (dist <= step + 1) {
        px = this._target.x; py = this._target.y;
        this._moving = false;
        this._marker.clear();
      } else {
        px += (dx/dist) * step;
        py += (dy/dist) * step;
      }
      dir   = this._tapDir;
      moved = true;
    }

    // ── Clamp ─────────────────────────────────────────
    var r = MC_CONFIG.PLAYER_RADIUS;
    px = Phaser.Math.Clamp(px, r, MC_CONFIG.WORLD_WIDTH  - r);
    py = Phaser.Math.Clamp(py, r, MC_CONFIG.WORLD_HEIGHT - r);

    // ── Player sprite + animation ─────────────────────
    if (moved) {
      this._player.x = px;
      this._player.y = py;
      if (dir !== this._lastDir || !this._player.anims.isPlaying) {
        this._player.play('walk-' + dir, true);
        this._lastDir = dir;
      }
    } else {
      if (this._player.anims.isPlaying) {
        this._player.anims.stop();
        var idleFrames = { down:1, left:4, right:7, up:10 };
        this._player.setFrame(idleFrames[this._lastDir] || 1);
      }
    }

    // ── Torch flicker ────────────────────────────────
    this._torchTick += delta;
    if (this._torchTick > 150) {
      this._torchTick = 0;
      this._torchIdx  = (this._torchIdx + 1) % 3;
      var tk = 'torch_' + this._torchIdx;
      for (var ti = 0; ti < this._torches.length; ti++) {
        this._torches[ti].setTexture(tk);
      }
    }
  },

  // ─────────────────────────────────────────────────
  _setTarget: function (wx, wy) {
    var dx = wx - this._player.x;
    var dy = wy - this._player.y;
    this._tapDir = (Math.abs(dx) >= Math.abs(dy))
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down'  : 'up');

    this._target = { x: wx, y: wy };
    this._moving = true;
    this._marker.clear();
    this._marker.lineStyle(2, 0xFFFFFF, 0.8);
    this._marker.strokeCircle(wx, wy, 14);
    this._marker.lineStyle(2, 0xFFFFFF, 0.4);
    this._marker.strokeCircle(wx, wy, 8);
  },

  _deco: function (key, x, y, scale, depth) {
    this.add.image(x, y, key)
      .setScale(scale || 1)
      .setDepth(depth || 3)
      .setOrigin(0.5, 1);
  },

  _addNode: function (x, y, textureKey, label, scale) {
    var g = this.add.graphics().setDepth(4);
    g.lineStyle(2, 0xFFFFFF, 0.3);
    g.strokeCircle(x, y, 40);
    this.add.image(x, y, textureKey)
      .setScale(scale || 1)
      .setDepth(5)
      .setOrigin(0.5, 1);
    this.add.text(x, y + 10, label, {
      fontSize: '13px', fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff', stroke: '#00000099', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(5);
  },

  _calcZoom: function () {
    var zX = window.innerWidth  / 1000;
    var zY = window.innerHeight / 750;
    return Math.min(Math.max(Math.min(zX, zY), 0.5), 1.2);
  },
});
