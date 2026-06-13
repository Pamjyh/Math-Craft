// BootScene.js — โหลด config แล้วไป PreloadScene
// ห้ามใช้ let/const

var BootScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function BootScene() {
    Phaser.Scene.call(this, { key: 'BootScene' });
  },

  create: function () {
    this.scene.start('PreloadScene');
  }
});
