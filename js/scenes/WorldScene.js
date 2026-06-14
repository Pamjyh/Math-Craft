// WorldScene.js — main game world (M1.5)
// ห้ามใช้ let/const

var WorldScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function WorldScene() {
    Phaser.Scene.call(this, { key: 'WorldScene' });
    this._target       = null;
    this._moving       = false;
    this._tapDir       = 'down';
    this._player       = null;
    this._marker       = null;
    this._dayText      = null;
    this._lastDir      = 'down';
    this._torches      = [];
    this._torchIdx     = 0;
    this._torchTick    = 0;
    this._transitioning = false;
    this._zoneBanner   = null;
    this._bannerTimer  = 0;
    this._currentZone  = 'village';
  },

  // ── Seeded RNG ──────────────────────────────────
  _rng: function (seed) {
    var s = ((seed + 1) * 6364136) % 2147483648;
    return function () {
      s = (s * 1664525 + 1013904223) % 2147483648;
      if (s < 0) s += 2147483648;
      return s / 2147483648;
    };
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

    // ── World base ───────────────────────────────
    var base = this.add.graphics().setDepth(0);
    base.fillStyle(0x080C14, 1);
    base.fillRect(0, 0, W, H);

    // ── Procedural zone backgrounds ──────────────
    var bg = this.add.graphics().setDepth(1);
    this._drawForest (bg, fz, this._rng(42));
    this._drawMine   (bg, mz, this._rng(73));
    this._drawFarm   (bg, az, this._rng(19));
    this._drawVillage(bg, vz, this._rng(88));

    // ── Zone borders ─────────────────────────────
    var border = this.add.graphics().setDepth(2);
    border.lineStyle(3, 0x000000, 0.40);
    border.strokeRect(fz.x, fz.y, fz.w, fz.h);
    border.strokeRect(mz.x, mz.y, mz.w, mz.h);
    border.strokeRect(az.x, az.y, az.w, az.h);
    border.strokeRect(vz.x, vz.y, vz.w, vz.h);

    // ── VILLAGE deco ─────────────────────────────
    this._deco('deco_house',  vz.x + 180, vz.y + 300, 0.55, 3);
    this._deco('deco_temple', vz.x + 620, vz.y + 180, 0.70, 3);
    this._deco('deco_stall',  vz.x + 580, vz.y + 430, 0.65, 3);
    this._deco('deco_fence',  vz.x + 60,  vz.y + 900, 0.70, 3);
    this._deco('deco_fence',  vz.x + 240, vz.y + 900, 0.70, 3);
    this._deco('deco_fence',  vz.x + 420, vz.y + 900, 0.70, 3);
    this._deco('deco_fence',  vz.x + 600, vz.y + 900, 0.70, 3);

    // Notice board
    var bx = vz.x + vz.w / 2;
    var by = vz.y + 90;
    var board = this.add.graphics().setDepth(4);
    board.fillStyle(0x6B3F1F, 1);
    board.fillRoundedRect(bx - 90, by, 180, 100, 10);
    board.fillStyle(0xF5E6C8, 1);
    board.fillRoundedRect(bx - 80, by + 8, 160, 84, 7);
    this.add.text(bx, by + 38, '📋 สะพานจักรวาล', {
      fontSize: '15px', fontFamily: 'Sarabun, sans-serif', color: '#5c3d1a',
    }).setOrigin(0.5).setDepth(5);
    this.add.text(bx, by + 68, '0 / 100 ชิ้น', {
      fontSize: '18px', fontFamily: 'Sarabun, sans-serif', color: '#2d6a2d', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    // Workbench
    var wbg = this.add.graphics().setDepth(4);
    wbg.fillStyle(0x5A3010, 1);
    wbg.fillRoundedRect(vz.x + 360, vz.y + 760, 80, 60, 6);
    this.add.text(vz.x + 400, vz.y + 785, '🔨', { fontSize: '26px' }).setOrigin(0.5).setDepth(5);
    this.add.text(vz.x + 400, vz.y + 817, 'craft', {
      fontSize: '12px', fontFamily: 'Sarabun, sans-serif', color: '#ffffff',
    }).setOrigin(0.5).setDepth(5);

    // ── FOREST deco ───────────────────────────────
    this._deco('deco_tree_big', fz.x + 90,  fz.y + 120, 0.75, 3);
    this._deco('deco_tree_big', fz.x + 490, fz.y + 300, 0.65, 3);
    this._deco('deco_tree_big', fz.x + 150, fz.y + 700, 0.80, 3);
    this._deco('deco_tree_big', fz.x + 560, fz.y + 950, 0.60, 3);
    this._deco('deco_pillar',   fz.x + 320, fz.y + 180, 0.55, 3);
    this._deco('deco_pillar',   fz.x + 600, fz.y + 650, 0.50, 3);
    this._deco('deco_tree_sm',  fz.x + 640, fz.y + 1100, 0.55, 3);
    this._deco('deco_tree_sm',  fz.x + 300, fz.y + 1050, 0.50, 3);
    // หมายเหตุ: ข้ามดeco_ruins/stump เพราะ crop มีพื้นหลังติดมา

    // ── MINE deco ─────────────────────────────────
    this._deco('deco_cave',    mz.x + 350,  mz.y + 200, 0.70, 3);
    this._deco('deco_cave',    mz.x + 1100, mz.y + 180, 0.65, 3);
    this._deco('deco_cave',    mz.x + 1900, mz.y + 200, 0.70, 3);
    this._deco('deco_crystal', mz.x + 200,  mz.y + 380, 0.80, 4);
    this._deco('deco_crystal', mz.x + 600,  mz.y + 300, 0.65, 4);
    this._deco('deco_crystal', mz.x + 900,  mz.y + 420, 0.75, 4);
    this._deco('deco_crystal', mz.x + 1400, mz.y + 320, 0.70, 4);
    this._deco('deco_crystal', mz.x + 1700, mz.y + 400, 0.80, 4);
    this._deco('deco_crystal', mz.x + 2200, mz.y + 370, 0.65, 4);
    this._deco('deco_rocks',   mz.x + 800,  mz.y + 220, 0.55, 3);
    this._deco('deco_rocks',   mz.x + 1600, mz.y + 440, 0.50, 3);

    // Torches
    var torchXs = [180, 600, 1050, 1500, 2000, 2300];
    var ti;
    for (ti = 0; ti < torchXs.length; ti++) {
      var t = this.add.image(mz.x + torchXs[ti], mz.y + 80, 'torch_0');
      t.setScale(0.38).setDepth(4).setAlpha(0.95);
      this._torches.push(t);
    }

    // ── FARM deco ─────────────────────────────────
    this._deco('deco_barn',       az.x + 560, az.y + 100,  0.60, 3);
    this._deco('deco_scarecrow',  az.x + 200, az.y + 700,  0.70, 4);
    this._deco('deco_waterwheel', az.x + 650, az.y + 1000, 0.70, 4);

    // ── RESOURCE NODES ────────────────────────────
    this._addNode(vz.x + 680, vz.y + 700, 'node_iron',    'แร่เหล็ก',  0.9);
    this._addNode(fz.x + 250, fz.y + 400, 'node_wood',    'ไม้โอ๊ค',   0.85);
    this._addNode(fz.x + 550, fz.y + 800, 'node_herb',    'ใบไม้',     1.0);
    this._addNode(mz.x + 500, mz.y + 380, 'node_crystal', 'แร่ผลึก',   1.1);
    this._addNode(mz.x + 1300,mz.y + 350, 'node_iron',    'หินแกรนิต', 0.9);
    this._addNode(az.x + 150, az.y + 500, 'node_wheat',   'ข้าวสาลี',  0.9);
    this._addNode(az.x + 380, az.y + 900, 'node_carrot',  'แครอท',     0.85);

    // ── ZONE LABELS ───────────────────────────────
    var lStyle = {
      fontSize: '22px', fontFamily: 'Sarabun, sans-serif',
      color: '#ffffff', stroke: '#00000088', strokeThickness: 4,
    };
    this.add.text(fz.x + fz.w/2, fz.y + 16, '🌲 ป่า',       lStyle).setOrigin(0.5,0).setDepth(9);
    this.add.text(mz.x + mz.w/2, mz.y + 16, '🏔 เหมือง',    lStyle).setOrigin(0.5,0).setDepth(9);
    this.add.text(az.x + az.w/2, az.y + 16, '🌾 ไร่นา',     lStyle).setOrigin(0.5,0).setDepth(9);
    this.add.text(vz.x + vz.w/2, vz.y + 16, '🏘 หมู่บ้าน', lStyle).setOrigin(0.5,0).setDepth(9);

    // ── PLAYER ────────────────────────────────────
    var startX = vz.x + vz.w / 2;
    var startY = vz.y + 300;
    this._player = this.add.sprite(startX, startY, 'player', 1);
    this._player.setScale(0.38).setDepth(6);
    this._player.setFrame(1);

    // ── TAP MARKER ────────────────────────────────
    this._marker = this.add.graphics().setDepth(7);

    // ── ZONE BANNER (Stardew-style) ───────────────
    this._zoneBanner = this.add.text(
      this.scale.width / 2, this.scale.height - 80,
      '', {
        fontSize: '28px', fontFamily: 'Sarabun, sans-serif',
        color: '#FFE566', stroke: '#00000099', strokeThickness: 5,
        backgroundColor: '#00000066', padding: { x:24, y:10 },
      }
    ).setScrollFactor(0).setDepth(11).setOrigin(0.5, 1).setAlpha(0);

    // ── CAMERA ────────────────────────────────────
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this._player, true, 0.10, 0.10);
    this.cameras.main.setZoom(this._calcZoom());
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // ── INPUT ─────────────────────────────────────
    this.input.on('pointerdown', function (ptr) {
      if (!self._transitioning) self._setTarget(ptr.worldX, ptr.worldY);
    });
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd    = this.input.keyboard.addKeys({ up:'W', down:'S', left:'A', right:'D' });

    // ── HUD ───────────────────────────────────────
    this._dayText = this.add.text(16, 16, '☀ กลางวัน', {
      fontSize: '17px', fontFamily: 'Sarabun, sans-serif',
      color: '#FFE566', stroke: '#00000099', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(10);

    this.add.text(16, 38, 'Math Craft ' + MC_CONFIG.VERSION, {
      fontSize: '11px', fontFamily: 'Sarabun, sans-serif', color: '#ffffff66',
    }).setScrollFactor(0).setDepth(10);
  },

  // ══════════════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════════════
  update: function (time, delta) {
    if (this._transitioning) return;

    var speed = MC_CONFIG.PLAYER_SPEED;
    var dt    = delta / 1000;
    var px    = this._player.x;
    var py    = this._player.y;
    var moved = false;
    var dir   = this._lastDir;

    // ── Keyboard ──────────────────────────────────
    var kbX = 0; var kbY = 0;
    if (this._cursors.left.isDown  || this._wasd.left.isDown)  kbX = -1;
    if (this._cursors.right.isDown || this._wasd.right.isDown) kbX =  1;
    if (this._cursors.up.isDown    || this._wasd.up.isDown)    kbY = -1;
    if (this._cursors.down.isDown  || this._wasd.down.isDown)  kbY =  1;

    if (kbX !== 0 || kbY !== 0) {
      var kbLen = Math.sqrt(kbX * kbX + kbY * kbY);
      px += (kbX / kbLen) * speed * dt;
      py += (kbY / kbLen) * speed * dt;
      this._target = null; this._moving = false;
      dir = (Math.abs(kbX) > Math.abs(kbY))
        ? (kbX > 0 ? 'right' : 'left')
        : (kbY > 0 ? 'down'  : 'up');
      moved = true;
    }

    // ── Tap-to-move ────────────────────────────────
    if (!moved && this._moving && this._target) {
      var dx   = this._target.x - px;
      var dy   = this._target.y - py;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var step = speed * dt;
      if (dist <= step + 1) {
        px = this._target.x; py = this._target.y;
        this._moving = false;
        this._marker.clear();
      } else {
        px += (dx / dist) * step;
        py += (dy / dist) * step;
      }
      dir   = this._tapDir;
      moved = true;
    }

    // ── Clamp ──────────────────────────────────────
    var r = MC_CONFIG.PLAYER_RADIUS;
    px = Phaser.Math.Clamp(px, r, MC_CONFIG.WORLD_WIDTH  - r);
    py = Phaser.Math.Clamp(py, r, MC_CONFIG.WORLD_HEIGHT - r);

    // ── Zone transition check ──────────────────────
    if (moved) this._checkTransition(px, py);

    // ── Player sprite ─────────────────────────────
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

    // ── Zone banner fade ───────────────────────────
    if (this._bannerTimer > 0) {
      this._bannerTimer -= delta;
      if (this._bannerTimer <= 600) {
        this._zoneBanner.setAlpha(Math.max(0, this._bannerTimer / 600));
      }
    }

    // ── Torch flicker ─────────────────────────────
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

  // ══════════════════════════════════════════════════
  // ZONE TRANSITION (Stardew-style)
  // ══════════════════════════════════════════════════
  _checkTransition: function (px, py) {
    var trList = MC_CONFIG.TRANSITIONS;
    var zones  = MC_CONFIG.ZONES;
    var self   = this;
    var i, tr, inRange;

    for (i = 0; i < trList.length; i++) {
      tr = trList[i];

      // ตรวจว่า player อยู่ใน source zone ปัจจุบัน
      if (tr.from !== this._currentZone) continue;

      // ตรวจทิศ
      if (tr.axis === 'x') {
        inRange = (py >= tr.range[0] && py <= tr.range[1]);
        if (!inRange) continue;
        // trigger ถ้าข้าม border
        if ((tr.from === 'forest'  && px >= tr.val) ||
            (tr.from === 'village' && tr.to === 'forest' && px <= tr.val) ||
            (tr.from === 'village' && tr.to === 'farm'   && px >= tr.val) ||
            (tr.from === 'farm'    && px <= tr.val)) {
          this._doTransition(tr, px, py);
          return;
        }
      } else { // axis === 'y'
        inRange = (px >= tr.range[0] && px <= tr.range[1]);
        if (!inRange) continue;
        if ((tr.from === 'forest' || tr.from === 'farm') && py <= tr.val) {
          this._doTransition(tr, px, py);
          return;
        }
        if (tr.from === 'mine' && py >= tr.val) {
          this._doTransition(tr, px, py);
          return;
        }
      }
    }
  },

  _doTransition: function (tr, px, py) {
    var self  = this;
    var zones = MC_CONFIG.ZONES;
    this._transitioning = true;
    this._moving        = false;
    this._target        = null;
    this._marker.clear();

    // หยุด animation player
    this._player.anims.stop();
    this._player.setFrame(1);

    // Fade out
    this.cameras.main.fadeOut(450, 0, 0, 0);

    this.time.delayedCall(480, function () {
      // คำนวณ entry point ของ zone ปลายทาง
      var ex = tr.entryX !== null ? tr.entryX : px;
      var ey = tr.entryY !== null ? tr.entryY : py;

      // clamp ให้อยู่ใน zone ปลายทาง
      var tz = zones[tr.to];
      ex = Phaser.Math.Clamp(ex, tz.x + 20, tz.x + tz.w - 20);
      ey = Phaser.Math.Clamp(ey, tz.y + 20, tz.y + tz.h - 20);

      self._player.x = ex;
      self._player.y = ey;
      self._currentZone = tr.to;

      // Fade in
      self.cameras.main.fadeIn(450, 0, 0, 0);

      // แสดง zone banner
      self._showZoneBanner(tr.to);

      self.time.delayedCall(460, function () {
        self._transitioning = false;
      });
    });
  },

  _showZoneBanner: function (zoneKey) {
    var labels = {
      village: '🏘 หมู่บ้าน',
      forest:  '🌲 ป่า',
      mine:    '🏔 เหมือง',
      farm:    '🌾 ไร่นา',
    };
    this._zoneBanner.setText(labels[zoneKey] || zoneKey);
    this._zoneBanner.setAlpha(1);
    this._bannerTimer = 2200; // แสดง 2.2 วินาทีแล้วค่อยๆ จาง
  },

  // ══════════════════════════════════════════════════
  // PROCEDURAL BG
  // ══════════════════════════════════════════════════
  _drawForest: function (g, z, R) {
    var i, rx, ry, rw, rh, gx, gy;
    g.fillStyle(0x1A380C, 1);
    g.fillRect(z.x, z.y, z.w, z.h);
    g.fillStyle(0x0E2408, 0.55);
    for (i = 0; i < 14; i++) {
      g.fillEllipse(z.x + R()*z.w, z.y + R()*z.h, 60+R()*130, 35+R()*70);
    }
    g.fillStyle(0x2D5E18, 0.5);
    for (i = 0; i < 16; i++) {
      g.fillEllipse(z.x + R()*z.w, z.y + R()*z.h, 25+R()*70, 15+R()*40);
    }
    g.fillStyle(0x4A8A22, 0.4);
    for (i = 0; i < 10; i++) {
      g.fillEllipse(z.x + R()*z.w, z.y + R()*z.h, 10+R()*30, 8+R()*18);
    }
    var dp = [0x1E4A0C, 0x2A6018, 0x366828, 0x183808, 0x3A7020, 0x4A8028];
    for (i = 0; i < 260; i++) {
      rx = z.x + R()*z.w; ry = z.y + R()*z.h;
      g.fillStyle(dp[Math.floor(R()*dp.length)], 0.55+R()*0.45);
      g.fillCircle(rx, ry, 1.5+R()*3.5);
    }
    g.lineStyle(1, 0x0C1E06, 0.22);
    for (i = 0; i < 18; i++) {
      ry = z.y + R()*z.h; rx = z.x + R()*(z.w*0.6);
      g.lineBetween(rx, ry, rx+80+R()*300, ry+(R()-0.5)*24);
    }
    g.lineStyle(1, 0x254010, 0.09);
    for (gy = z.y; gy < z.y+z.h; gy += 48) g.lineBetween(z.x, gy, z.x+z.w, gy);
    for (gx = z.x; gx < z.x+z.w; gx += 48) g.lineBetween(gx, z.y, gx, z.y+z.h);
  },

  _drawMine: function (g, z, R) {
    var i, bx, by, sx, ex, sy, ey, row, col, ci;
    g.fillStyle(0x090D18, 1);
    g.fillRect(z.x, z.y, z.w, z.h);
    var brickW = 64; var brickH = 36;
    var bc = [0x131826, 0x0F1320, 0x16202E, 0x111824, 0x0D111C];
    row = 0;
    for (by = z.y+2; by < z.y+z.h-2; by += brickH+2) {
      var offset = (row%2===0) ? 0 : brickW/2;
      col = 0;
      for (bx = z.x-brickW+offset; bx < z.x+z.w+brickW; bx += brickW+2) {
        ci = (row*7+col*3) % bc.length;
        sx = Math.max(bx, z.x); ex = Math.min(bx+brickW, z.x+z.w);
        sy = by;                 ey = Math.min(by+brickH, z.y+z.h);
        if (ex>sx && ey>sy) { g.fillStyle(bc[ci],1); g.fillRect(sx,sy,ex-sx,ey-sy); }
        col++;
      }
      row++;
    }
    g.lineStyle(2, 0x1A3A7A, 0.30);
    for (i = 0; i < 5; i++) {
      bx = z.x+R()*z.w; by = z.y+R()*z.h;
      g.lineBetween(bx, by, bx+120+R()*200, by+30+R()*80);
    }
    var gc = [0x3355CC,0x4466DD,0x5599DD,0x33AACC,0x55BBDD,0x6644BB];
    for (i = 0; i < 80; i++) {
      bx = z.x+R()*z.w; by = z.y+R()*z.h;
      var gci = gc[Math.floor(R()*gc.length)]; var gr = 1+R()*2.5;
      g.fillStyle(gci, 0.5+R()*0.5); g.fillCircle(bx, by, gr);
      if (gr > 2) {
        g.lineStyle(1, gci, 0.6);
        g.lineBetween(bx-gr*2,by,bx+gr*2,by);
        g.lineBetween(bx,by-gr*2,bx,by+gr*2);
      }
    }
    var txs = [180,600,1050,1500,2000,2300];
    for (i = 0; i < txs.length; i++) {
      g.fillStyle(0xFF8822,0.06); g.fillCircle(z.x+txs[i],z.y+80,90);
      g.fillStyle(0xFF9933,0.05); g.fillCircle(z.x+txs[i],z.y+80,55);
    }
  },

  _drawFarm: function (g, z, R) {
    var i, fy, fx, rx, ry;
    g.fillStyle(0x2A1508, 1);
    g.fillRect(z.x, z.y, z.w, z.h);
    var fc = [0x3A1E0C,0x201008,0x341A0A,0x281408];
    var fh = 22; i = 0;
    for (fy = z.y; fy < z.y+z.h; fy += fh) {
      g.fillStyle(fc[i%fc.length],0.8);
      g.fillRect(z.x, fy, z.w, Math.min(fh-1,(z.y+z.h)-fy)); i++;
    }
    var cc = [0x3A6010,0x508020,0x446614,0x2E5008]; i = 0;
    for (fy = z.y+11; fy < z.y+z.h; fy += fh*3, i++) {
      for (fx = z.x+20; fx < z.x+z.w-80; fx += 18) {
        var ccc = cc[Math.floor(R()*cc.length)]; var h = 5+R()*6;
        g.lineStyle(1,ccc,0.7);
        g.lineBetween(fx,fy,fx,fy-h);
        g.lineBetween(fx,fy-h*0.5,fx-4,fy-h*0.8);
        g.lineBetween(fx,fy-h*0.5,fx+4,fy-h*0.8);
      }
    }
    g.fillStyle(0x08182A,0.75); g.fillRect(z.x+z.w-80,z.y,60,z.h);
    g.fillStyle(0x0A2035,0.5);  g.fillRect(z.x+z.w-78,z.y,56,z.h);
    g.lineStyle(1,0x1A4060,0.4);
    for (ry = z.y+30; ry < z.y+z.h; ry += 40)
      g.lineBetween(z.x+z.w-68,ry,z.x+z.w-28,ry+8);
    for (i = 0; i < 60; i++) {
      rx = z.x+R()*(z.w-80); ry = z.y+R()*z.h;
      g.fillStyle(0x180A04,0.35+R()*0.35);
      g.fillEllipse(rx,ry,6+R()*10,4+R()*6);
    }
  },

  _drawVillage: function (g, z, R) {
    var i, cx, cy, cw, ch, sx, ex, sy, ey, row, col;
    g.fillStyle(0x5C4A2E, 1);
    g.fillRect(z.x, z.y, z.w, z.h);
    var sc = [0x6C5A3A,0x7A6848,0x5A4828,0x745E40,0x4E3E22,0x806A44];
    var sH = 22; var bW = 52; row = 0;
    for (cy = z.y+2; cy < z.y+z.h-2; cy += sH+2) {
      var rOffset = (row%2===0) ? 0 : 28; col = 0;
      for (cx = z.x-bW+rOffset; cx < z.x+z.w+bW; cx += bW+3) {
        cw = bW-2+Math.floor(R()*14); ch = sH-1;
        sx = Math.max(cx,z.x+1); ex = Math.min(cx+cw,z.x+z.w-1);
        sy = cy; ey = Math.min(cy+ch,z.y+z.h-1);
        if (ex>sx+4 && ey>sy+4) {
          g.fillStyle(sc[(row*5+col*3)%sc.length],1);
          g.fillRoundedRect(sx,sy,ex-sx,ey-sy,2);
          g.fillStyle(0xFFFFFF,0.04); g.fillRect(sx,sy,ex-sx,2);
        }
        col++;
      }
      row++;
    }
    var roadX = z.x+z.w/2-36;
    g.fillStyle(0x8A7250,0.75); g.fillRect(roadX,z.y,72,z.h);
    var pc = [0x9A8258,0x8A7248,0xA08860];
    for (i = 0; i*28 < z.h; i++) {
      g.fillStyle(pc[i%pc.length],0.7);
      g.fillRect(roadX+2,z.y+i*28,68,26);
    }
    var crossY = z.y+z.h/2-24;
    g.fillStyle(0x8A7250,0.65); g.fillRect(z.x,crossY,z.w,48);
    for (i = 0; i*28 < z.w; i++) {
      g.fillStyle(pc[i%pc.length],0.55);
      g.fillRect(z.x+i*28,crossY+2,26,44);
    }
    for (i = 0; i < 60; i++) {
      cx = z.x+R()*z.w; cy = z.y+R()*z.h;
      g.fillStyle(0x3A2E1A,0.45+R()*0.35);
      g.fillCircle(cx,cy,1+R()*2);
    }
  },

  // ══════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════
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
      .setScale(scale || 1).setDepth(5).setOrigin(0.5, 1);
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
