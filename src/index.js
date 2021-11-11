// Importing the Phaser library
import Phaser from "phaser";

const config = {
  type: Phaser.AUTO, // WebGL
  width: 800,
  height: 600,
  physics: {
    default: "arcade", // Arcade physics plugin, manages physics simulation
  },
  scene: {
    preload: preload, // Called before the game starts
    create: create,
  },
};

// Used to load assets such as images, animations, music, etc.
function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("bird", "assets/bird.png");
}

function create() {
  this.add.image(0, 0, "sky").setOrigin(0);
  this.add.image(config.width / 10, config.height / 2, "bird").setOrigin(0);
}

function update() {}

new Phaser.Game(config);
