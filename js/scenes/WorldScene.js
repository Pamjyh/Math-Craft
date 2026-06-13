// WorldScene.js — main game world (M1)
// Placeholder: วาด 4 โซนด้วย Graphics, ตัวละครเป็น circle, tap-to-move
// ห้ามใช้ let/const

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function WorldScene() {
    Phaser.Scene.call(this, { key: 'WorldScene' });

    // tap-to-move state
    this._target   = null;   // { x, y } ปลายทาง
    this._moving   = false;
    this._player   = null;
    this._marker   = null;   // วงกลมแสดงตำแหน่งที่แตะ
    this._dayText  = null;
  },

  // ─────────────────────────────────────────────────
  create: function () {
    var self  = this;
    var W     = MC_CONFIG.WORLD_WIDTH;
    var H     = MC_CONFIG.WORLD_HEIGHT;
    var zones = MC_CONFIG.ZONES;

    // ── วาด background + zones ──────────────────────
    var bg = this.add.graphics();

    // พื้นหลัง (สีดินอ่อน)
    bg.fillStyle(0xE8D5A3, 1);
    bg.fillRect(0, 0, W, H);

    // วาดแต่ละโซน
    var zoneKeys = Object.keys(zones);
    for (var i = 0; i < zoneKeys.length; i++) {
      var z = zones[zoneKeys[i]];
      bg.fillStyle(z.color, 0.85);
      bg.fillRect(z.x, z.y, z.w, z.h);
      // ขอบโซน
      bg.lineStyle(3, 0x00000033, 0.3);
      bg.strokeRect(z.x, z.y, z.w, z.h);
    }

    // ── วาด grid เบาๆ ให้รู้สึก tile-based ───────────
    var grid = this.add.graphics();
    grid.lineStyle(1, 0x00000015, 0.15);
    var ts = MC_CONFIG.TILE_SIZE;
    for (var gx = 0; gx <= W; gx += ts) {
      grid.beginPath();
      grid.moveTo(gx, 0);
      grid.lineTo(gx, H);
      grid.strokePath();
    }
    for (var gy = 0; gy <= H; gy += ts) {
      grid.beginPath();
      grid.moveTo(0, gy);
      grid.lineTo(W, gy);
      grid.strokePath();
    }

    // ── Label แต่ละโซน ────────────────────────────────
    var labelStyle = {
      fontSize: '28px',
      fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff',
      stroke: '#00000066',
      strokeThickness: 4,
      alpha: 0.9,
    };
    for (var zi = 0; zi < zoneKeys.length; zi++) {
      var zz = zones[zoneKeys[zi]];
      this.add.text(
        zz.x + zz.w / 2,
        zz.y + 40,
        zz.label,
        labelStyle
      ).setOrigin(0.5, 0);
    }

    // ── Notice board (หมู่บ้าน) ──────────────────────
    var vz = zones.village;
    var board = this.add.graphics();
    board.fillStyle(0x8B5E3C, 1);
    board.fillRoundedRect(vz.x + vz.w/2 - 80, vz.y + 100, 160, 90, 8);
    board.fillStyle(0xF5E6C8, 1);
    board.fillRoundedRect(vz.x + vz.w/2 - 72, vz.y + 108, 144, 74, 5);
    this.add.text(
      vz.x + vz.w / 2,
      vz.y + 138,
      '📋 สะพานจักรวาล',
      { fontSize: '16px', fontFamily: 'Sarabun, sans-serif', color: '#5c3d1a' }
    ).setOrigin(0.5, 0.5);
    this.add.text(
      vz.x + vz.w / 2,
      vz.y + 165,
      '0 / 100 ชิ้น',
      { fontSize: '20px', fontFamily: 'Sarabun, sans-serif', color: '#2d6a2d', fontStyle: 'bold' }
    ).setOrigin(0.5, 0.5);

    // ── Workbench ──────────────────────────────────
    var wb = this.add.graphics();
    wb.fillStyle(0x6B3F1F, 1);
    wb.fillRoundedRect(vz.x + 80, vz.y + 280, 80, 60, 6);
    this.add.text(vz.x + 120, vz.y + 305, '🔨', { fontSize: '28px' }).setOrigin(0.5, 0.5);
    this.add.text(vz.x + 120, vz.y + 340, 'craft', {
      fontSize: '13px', fontFamily: 'Sarabun, sans-serif', color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // ── Resource nodes (placeholder) ─────────────────
    this._addNode(vz.x + vz.w - 120, vz.y + 280, '🪨', 'แร่เหล็ก');
    this._addNode(zones.forest.x + 200, zones.forest.y + 400, '🪵', 'ไม้โอ๊ค');
    this._addNode(zones.forest.x + 500, zones.forest.y + 700, '🌿', 'ใบไม้');
    this._addNode(zones.mine.x + 400,   zones.mine.y + 300,   '💎', 'แร่ผลึก');
    this._addNode(zones.mine.x + 1200,  zones.mine.y + 300,   '🪨', 'หินแกรนิต');
    this._addNode(zones.farm.x + 200,   zones.farm.y + 300,   '🌾', 'ข้าวสาลี');
    this._addNode(zones.farm.x + 400,   zones.farm.y + 600,   '🥕', 'แครอท');

    // ── Player (placeholder circle) ───────────────────
    var startX = vz.x + vz.w / 2;
    var startY = vz.y + vz.h / 2 + 100;
    this._player = this.add.graphics();
    this._drawPlayer(startX, startY);
    this._player._px = startX;
    this._player._py = startY;

    // ── Tap marker ────────────────────────────────────
    this._marker = this.add.graphics();

    // ── Camera ────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this._player, true, 0.12, 0.12);
    this.cameras.main.setZoom(this._calcZoom());

    // ── Input: tap-to-move ────────────────────────────
    this.input.on('pointerdown', function (ptr) {
      // แปลงจาก screen → world coordinate
      var wx = ptr.worldX;
      var wy = ptr.worldY;
      self._setTarget(wx, wy);
    });

    // Keyboard (desktop)
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

    // ── Day/Night HUD ──────────────────────────────────
    this._dayText = this.add.text(16, 16, '☀ กลางวัน', {
      fontSize: '18px',
      fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff',
      stroke: '#00000088',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(10);

    // ── Version text ───────────────────────────────────
    this.add.text(16, 40, 'Math Craft ' + MC_CONFIG.VERSION, {
      fontSize: '12px',
      fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff88',
    }).setScrollFactor(0).setDepth(10);
  },

  // ─────────────────────────────────────────────────
  update: function (time, delta) {
    var speed  = MC_CONFIG.PLAYER_SPEED;
    var dt     = delta / 1000;
    var px     = this._player._px;
    var py     = this._player._py;
    var moved  = false;

    // ── Keyboard movement (override tap-to-move) ──────
    var kbX = 0;
    var kbY = 0;
    if (this._cursors.left.isDown  || this._wasd.left.isDown)  kbX = -1;
    if (this._cursors.right.isDown || this._wasd.right.isDown) kbX =  1;
    if (this._cursors.up.isDown    || this._wasd.up.isDown)    kbY = -1;
    if (this._cursors.down.isDown  || this._wasd.down.isDown)  kbY =  1;

    if (kbX !== 0 || kbY !== 0) {
      // normalize diagonal
      var kbLen = Math.sqrt(kbX * kbX + kbY * kbY);
      px += (kbX / kbLen) * speed * dt;
      py += (kbY / kbLen) * speed * dt;
      this._target = null;
      this._moving = false;
      moved = true;
    }

    // ── Tap-to-move ────────────────────────────────────
    if (!moved && this._moving && this._target) {
      var dx   = this._target.x - px;
      var dy   = this._target.y - py;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var step = speed * dt;

      if (dist <= step + 1) {
        // ถึงแล้ว
        px = this._target.x;
        py = this._target.y;
        this._moving = false;
        this._marker.clear();
      } else {
        px += (dx / dist) * step;
        py += (dy / dist) * step;
      }
      moved = true;
    }

    // ── Clamp ไม่ให้ออกนอก world ──────────────────────
    var r = MC_CONFIG.PLAYER_RADIUS;
    px = Phaser.Math.Clamp(px, r, MC_CONFIG.WORLD_WIDTH  - r);
    py = Phaser.Math.Clamp(py, r, MC_CONFIG.WORLD_HEIGHT - r);

    // ── วาด player ใหม่ถ้าขยับ ────────────────────────
    if (moved) {
      this._player._px = px;
      this._player._py = py;
      this._drawPlayer(px, py);
    }
  },

  // ─────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────

  _setTarget: function (wx, wy) {
    this._target = { x: wx, y: wy };
    this._moving = true;

    // วาด marker
    this._marker.clear();
    this._marker.lineStyle(2, 0xFFFFFF, 0.8);
    this._marker.strokeCircle(wx, wy, 14);
    this._marker.lineStyle(2, 0xFFFFFF, 0.5);
    this._marker.strokeCircle(wx, wy, 8);
  },

  _drawPlayer: function (x, y) {
    var g = this._player;
    g.clear();
    g.x = x;
    g.y = y;
    // เงา
    g.fillStyle(0x00000033, 0.4);
    g.fillEllipse(0, 10, 28, 12);
    // ตัว
    g.fillStyle(0xFF8C00, 1);
    g.fillCircle(0, 0, MC_CONFIG.PLAYER_RADIUS);
    // ขอบ
    g.lineStyle(2, 0xFFFFFF, 0.9);
    g.strokeCircle(0, 0, MC_CONFIG.PLAYER_RADIUS);
    // หน้า (dot สำหรับ direction — ชั่วคราว)
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(5, -4, 4);
  },

  _addNode: function (x, y, emoji, label) {
    // placeholder node — interactive ใน M2
    var g = this.add.graphics();
    g.fillStyle(0xFFFFFF, 0.25);
    g.fillCircle(0, 0, 28);
    g.lineStyle(2, 0xFFFFFF, 0.6);
    g.strokeCircle(0, 0, 28);
    g.x = x;
    g.y = y;
    this.add.text(x, y, emoji, { fontSize: '28px' }).setOrigin(0.5, 0.5);
    this.add.text(x, y + 36, label, {
      fontSize: '13px',
      fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff',
      stroke: '#00000099',
      strokeThickness: 3,
    }).setOrigin(0.5, 0);
  },

  _calcZoom: function () {
    // zoom ให้พอดีกับหน้าจอโดยประมาณ
    var screenW = window.innerWidth;
    var screenH = window.innerHeight;
    var zoomX   = screenW  / 1000;
    var zoomY   = screenH  / 750;
    return Math.min(Math.max(Math.min(zoomX, zoomY), 0.5), 1.2);
  },
});
