// config.js — Math Craft global config
// ห้ามใช้ let/const — ใช้ var เสมอ (Safari compat)

var MC_CONFIG = {
  // ── World ────────────────────────────────────────
  WORLD_WIDTH:  2400,
  WORLD_HEIGHT: 1800,
  TILE_SIZE:    48,

  // ── Player ───────────────────────────────────────
  PLAYER_SPEED: 180,
  PLAYER_RADIUS: 16,

  // ── Day/Night ────────────────────────────────────
  DAY_DURATION: 15 * 60 * 1000,

  // ── Zones ────────────────────────────────────────
  // Layout:
  //  [────────────── MINE (เหมือง) ──────────────]
  //  [ FOREST(ป่า) ][ VILLAGE(หมู่บ้าน) ][ FARM(ไร่) ]
  ZONES: {
    mine:    { x: 0,    y: 0,   w: 2400, h: 600,  color: 0x7A7A8C, label: '🏔 เหมือง' },
    forest:  { x: 0,    y: 600, w: 800,  h: 1200, color: 0x5D8A3C, label: '🌲 ป่า' },
    village: { x: 800,  y: 600, w: 800,  h: 1200, color: 0xD4A96A, label: '🏘 หมู่บ้าน' },
    farm:    { x: 1600, y: 600, w: 800,  h: 1200, color: 0xC8D45A, label: '🌾 ไร่นา' },
  },

  // ── Zone Transitions (border x หรือ y ที่ trigger) ─
  // [from → to]: { axis, value, range: [min,max], entry: fn(px,py) → {x,y} }
  TRANSITIONS: [
    // ป่า → เหมือง (เดินขึ้น)
    { from:'forest',  to:'mine',    axis:'y', val:602,  range:[0,800],    entryX: null, entryY: 560 },
    // เหมือง → ป่า (เดินลง ฝั่งซ้าย)
    { from:'mine',    to:'forest',  axis:'y', val:598,  range:[0,800],    entryX: null, entryY: 650 },
    // ป่า → หมู่บ้าน (เดินขวา)
    { from:'forest',  to:'village', axis:'x', val:798,  range:[600,1800], entryX: 850,  entryY: null },
    // หมู่บ้าน → ป่า (เดินซ้าย)
    { from:'village', to:'forest',  axis:'x', val:802,  range:[600,1800], entryX: 750,  entryY: null },
    // หมู่บ้าน → ไร่นา (เดินขวา)
    { from:'village', to:'farm',    axis:'x', val:1598, range:[600,1800], entryX: 1650, entryY: null },
    // ไร่นา → หมู่บ้าน (เดินซ้าย)
    { from:'farm',    to:'village', axis:'x', val:1602, range:[600,1800], entryX: 1550, entryY: null },
    // ไร่นา → เหมือง (เดินขึ้น)
    { from:'farm',    to:'mine',    axis:'y', val:602,  range:[1600,2400], entryX: null, entryY: 560 },
    // เหมือง → ไร่นา (เดินลง ฝั่งขวา)
    { from:'mine',    to:'farm',    axis:'y', val:598,  range:[1600,2400], entryX: null, entryY: 650 },
  ],

  VERSION: '0.1.0-M1',
};
