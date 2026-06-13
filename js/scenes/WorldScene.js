// WorldScene.js — main game world (M1.5 — sprite integration)
// ห้ามใช้ let/const

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function WorldScene() {
    Phaser.Scene.call(this, { key: 'WorldScene' });

    this._target    = null;
    this._moving    = false;
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

    // ── Background + zones ───────────────────────────
    var bg = this.add.graphics();
    bg.fillStyle(0xE8D5A3, 1);
    bg.fillRect(0, 0, W, H);

    var zoneKeys = Object.keys(zones);
    for (var i = 0; i < zoneKeys.length; i++) {
      var z = zones[zoneKeys[i]];
      bg.fillStyle(z.color, 0.85);
      bg.fillRect(z.x, z.y, z.w, z.h);
      bg.lineStyle(3, 0x00000033, 0.3);
      bg.strokeRect(z.x, z.y, z.w, z.h);
    }

    // ── Grid ─────────────────────────────────────────
    var grid = this.add.graphics();
    grid.lineStyle(1, 0x00000015, 0.15);
    var ts = MC_CONFIG.TILE_SIZE;
    for (var gx = 0; gx <= W; gx += ts) {
      grid.beginPath(); grid.moveTo(gx, 0); grid.lineTo(gx, H); grid.strokePath();
    }
    for (var gy = 0; gy <= H; gy += ts) {
      grid.beginPath(); grid.moveTo(0, gy); grid.lineTo(W, gy); grid.strokePath();
    }

    // ── Zone labels ──────────────────────────────────
    var labelStyle = {
      fontSize: '28px', fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff', stroke: '#00000066', strokeThickness: 4,
    };
    for (var zi = 0; zi < zoneKeys.length; zi++) {
      var zz = zones[zoneKeys[zi]];
      this.add.text(zz.x + zz.w/2, zz.y + 40, zz.label, labelStyle).setOrigin(0.5, 0);
    }

    // ── Notice board ─────────────────────────────────
    var vz = zones.village;
    var board = this.add.graphics();
    board.fillStyle(0x8B5E3C, 1);
    board.fillRoundedRect(vz.x + vz.w/2 - 80, vz.y + 100, 160, 90, 8);
    board.fillStyle(0xF5E6C8, 1);
    board.fillRoundedRect(vz.x + vz.w/2 - 72, vz.y + 108, 144, 74, 5);
    this.add.text(vz.x + vz.w/2, vz.y + 138, '📋 สะพานจักรวาล', {
      fontSize: '16px', fontFamily: 'Sarabun, sans-serif', color: '#5c3d1a',
    }).setOrigin(0.5, 0.5);
    this.add.text(vz.x + vz.w/2, vz.y + 165, '0 / 100 ชิ้น', {
      fontSize: '20px', fontFamily: 'Sarabun, sans-serif', color: '#2d6a2d', fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // ── Workbench ────────────────────────────────────
    var wb = this.add.graphics();
    wb.fillStyle(0x6B3F1F, 1);
    wb.fillRoundedRect(vz.x + 80, vz.y + 280, 80, 60, 6);
    this.add.text(vz.x + 120, vz.y + 305, '🔨', { fontSize: '28px' }).setOrigin(0.5, 0.5);
    this.add.text(vz.x + 120, vz.y + 340, 'craft', {
      fontSize: '13px', fontFamily: 'Sarabun, sans-serif', color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    // ── Resource nodes ────────────────────────────────
    this._addNode(vz.x + vz.w - 120,          vz.y + 280,          'node_iron',    'แร่เหล็ก',  0.9);
    this._addNode(zones.forest.x + 200,        zones.forest.y + 400, 'node_wood',    'ไม้โอ๊ค',   0.9);
    this._addNode(zones.forest.x + 500,        zones.forest.y + 700, 'node_herb',    'ใบไม้',     1.0);
    this._addNode(zones.mine.x + 400,          zones.mine.y + 300,   'node_crystal', 'แร่ผลึก',   1.0);
    this._addNode(zones.mine.x + 1200,         zones.mine.y + 300,   'node_iron',    'หินแกรนิต', 0.9);
    this._addNode(zones.farm.x + 200,          zones.farm.y + 300,   'node_wheat',   'ข้าวสาลี',  1.0);
    this._addNode(zones.farm.x + 400,          zones.farm.y + 600,   'node_carrot',  'แครอท',     1.1);

    // ── Torches ในเหมือง ──────────────────────────────
    var mz = zones.mine;
    var torchPositions = [
      { x: mz.x + 300,  y: mz.y + 80 },
      { x: mz.x + 700,  y: mz.y + 80 },
      { x: mz.x + 1100, y: mz.y + 80 },
      { x: mz.x + 1500, y: mz.y + 80 },
      { x: mz.x + 1900, y: mz.y + 80 },
    ];
    for (var ti = 0; ti < torchPositions.length; ti++) {
      var t = this.add.image(torchPositions[ti].x, torchPositions[ti].y, 'torch_0');
      t.setScale(0.35);
      t.setAlpha(0.9);
      t.setDepth(2);
      this._torches.push(t);
    }

    // ── Player sprite ─────────────────────────────────
    var startX = vz.x + vz.w / 2;
    var startY = vz.y + vz.h / 2 + 100;
    this._player = this.add.sprite(startX, startY, 'player', 1);
    this._player.setScale(0.4);
    this._player.setDepth(5);
    this._player.play('idle-down');

    // ── Tap marker ────────────────────────────────────
    this._marker = this.add.graphics().setDepth(4);

    // ── Camera ────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this._player, true, 0.12, 0.12);
    this.cameras.main.setZoom(this._calcZoom());

    // ── Input ─────────────────────────────────────────
    this.input.on('pointerdown', function (ptr) {
      self._setTarget(ptr.worldX, ptr.worldY);
    });
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd    = this.input.keyboard.addKeys({ up:'W', down:'S', left:'A', right:'D' });

    // ── HUD ───────────────────────────────────────────
    this._dayText = this.add.text(16, 16, '☀ กลางวัน', {
      fontSize: '18px', fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff', stroke: '#00000088', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(10);

    this.add.text(16, 40, 'Math Craft ' + MC_CONFIG.VERSION, {
      fontSize: '12px', fontFamily: 'Sarabun, sans-serif', color: '#ffffff88',
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
    var kbX = 0;
    var kbY = 0;
    if (this._cursors.left.isDown  || this._wasd.left.isDown)  kbX = -1;
    if (this._cursors.right.isDown || this._wasd.right.isDown) kbX =  1;
    if (this._cursors.up.isDown    || this._wasd.up.isDown)    kbY = -1;
    if (this._cursors.down.isDown  || this._wasd.down.isDown)  kbY =  1;

    if (kbX !== 0 || kbY !== 0) {
      var kbLen = Math.sqrt(kbX*kbX + kbY*kbY);
      px += (kbX/kbLen) * speed * dt;
      py += (kbY/kbLen) * speed * dt;
      this._target = null;
      this._moving = false;
      if (Math.abs(kbX) >= Math.abs(kbY)) {
        dir = kbX > 0 ? 'right' : 'left';
      } else {
        dir = kbY > 0 ? 'down' : 'up';
      }
      moved = true;
    }

    // ── Tap-to-move ───────────────────────────────────
    if (!moved && this._moving && this._target) {
      var dx   = this._target.x - px;
      var dy   = this._target.y - py;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var step = speed * dt;

      if (dist <= step + 1) {
        px = this._target.x;
        py = this._target.y;
        this._moving = false;
        this._marker.clear();
      } else {
        px += (dx/dist) * step;
        py += (dy/dist) * step;
        if (Math.abs(dx) >= Math.abs(dy)) {
          dir = dx > 0 ? 'right' : 'left';
        } else {
          dir = dy > 0 ? 'down' : 'up';
        }
      }
      moved = true;
    }

    // ── Clamp ─────────────────────────────────────────
    var r = MC_CONFIG.PLAYER_RADIUS;
    px = Phaser.Math.Clamp(px, r, MC_CONFIG.WORLD_WIDTH  - r);
    py = Phaser.Math.Clamp(py, r, MC_CONFIG.WORLD_HEIGHT - r);

    // ── อัปเดต player ─────────────────────────────────
    if (moved) {
      this._player.x = px;
      this._player.y = py;
      if (dir !== this._lastDir || !this._player.anims.isPlaying) {
        this._player.play('walk-' + dir, true);
        this._lastDir = dir;
      }
    } else {
      // idle — หยุดที่เฟรมกลางของทิศ
      if (this._player.anims.isPlaying &&
          this._player.anims.currentAnim &&
          this._player.anims.currentAnim.key.indexOf('walk') !== -1) {
        this._player.anims.stop();
        var idleFrames = { down:1, left:4, right:7, up:10 };
        this._player.setFrame(idleFrames[this._lastDir] || 1);
      }
    }

    // ── Torch animation (150ms/frame) ─────────────────
    this._torchTick += delta;
    if (this._torchTick > 150) {
      this._torchTick = 0;
      this._torchIdx  = (this._torchIdx + 1) % 3;
      var torchKey = 'torch_' + this._torchIdx;
      for (var ti = 0; ti < this._torches.length; ti++) {
        this._torches[ti].setTexture(torchKey);
      }
    }
  },

  // ─────────────────────────────────────────────────
  _setTarget: function (wx, wy) {
    this._target = { x: wx, y: wy };
    this._moving = true;
    this._marker.clear();
    this._marker.lineStyle(2, 0xFFFFFF, 0.8);
    this._marker.strokeCircle(wx, wy, 14);
    this._marker.lineStyle(2, 0xFFFFFF, 0.5);
    this._marker.strokeCircle(wx, wy, 8);
  },

  _addNode: function (x, y, textureKey, label, scale) {
    var g = this.add.graphics().setDepth(2);
    g.lineStyle(2, 0xFFFFFF, 0.35);
    g.strokeCircle(x, y, 38);

    var img = this.add.image(x, y, textureKey);
    img.setScale(scale || 1.0);
    img.setDepth(3);

    this.add.text(x, y + 48, label, {
      fontSize: '13px', fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff', stroke: '#00000099', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(3);
  },

  _calcZoom: function () {
    var zoomX = window.innerWidth  / 1000;
    var zoomY = window.innerHeight / 750;
    return Math.min(Math.max(Math.min(zoomX, zoomY), 0.5), 1.2);
  },
});
