// config.js — Math Craft global config
// ห้ามใช้ let/const — ใช้ var เสมอ (Safari compat)

var MC_CONFIG = {
  // ── World ────────────────────────────────────────
  WORLD_WIDTH:  2400,   // ความกว้าง world ทั้งหมด (px)
  WORLD_HEIGHT: 1800,   // ความสูง world ทั้งหมด (px)
  TILE_SIZE:    48,     // ขนาด tile (px)

  // ── Player ───────────────────────────────────────
  PLAYER_SPEED: 180,    // px/second
  PLAYER_RADIUS: 16,    // รัศมีตัวละคร (placeholder)

  // ── Day/Night ────────────────────────────────────
  DAY_DURATION: 15 * 60 * 1000,  // 15 นาที (ms) — 1 วันในเกม

  // ── Zones (x, y, width, height) ─────────────────
  // World แบ่งเป็น 4 โซน:
  //   หมู่บ้าน (กลาง-ล่าง), ป่า (ซ้าย), เหมือง (บน), ไร่นา (ขวา-ล่าง)
  ZONES: {
    village: { x: 800,  y: 1100, w: 800,  h: 700,  color: 0xD4A96A, label: '🏘 หมู่บ้าน' },
    forest:  { x: 0,    y: 600,  w: 800,  h: 1200, color: 0x5D8A3C, label: '🌲 ป่า' },
    mine:    { x: 0,    y: 0,    w: 2400, h: 600,  color: 0x7A7A8C, label: '🏔 เหมือง' },
    farm:    { x: 1600, y: 600,  w: 800,  h: 1200, color: 0xC8D45A, label: '🌾 ไร่นา' },
  },

  // ── Version ──────────────────────────────────────
  VERSION: '0.1.0-M1',
};
