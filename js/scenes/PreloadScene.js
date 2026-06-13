// PreloadScene.js — โหลด assets แล้วไป WorldScene
// M1: ยังไม่มี asset จริง — ข้ามไป WorldScene ทันที
// ห้ามใช้ let/const

var PreloadScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function PreloadScene() {
    Phaser.Scene.call(this, { key: 'PreloadScene' });
  },

  preload: function () {
    // M1: placeholder — ยังไม่มี sprite จริง
    // เพิ่ม this.load.image(...) ที่นี่เมื่อมี asset
  },

  create: function () {
    this.scene.start('WorldScene');
  }
});
