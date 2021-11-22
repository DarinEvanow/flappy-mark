// Importing the Phaser library
import Phaser from "phaser";

const config = {
  type: Phaser.AUTO, // WebGL
  width: 800,
  height: 600,
  physics: {
    default: "arcade", // Arcade physics plugin, manages physics simulation
    arcade: {
      gravity: { y: 800 },
    },
  },
  scene: {
    preload: preload, // Called before the game starts
    create: create, // Called during game creation
    update: update, // Called every frame
  },
};

const FLAP_VELOCITY = 400;

let bird;

// Used to load assets such as images, animations, music, etc.
function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("bird", "assets/bird.png");
}

// Used to set the initial scene, such as adding the background or title screen
function create() {
  this.add.image(0, 0, "sky").setOrigin(0);
  bird = this.physics.add
    .image(config.width / 10, config.height / 2, "bird")
    .setOrigin(0);

  this.input.on("pointerdown", flap);
  this.input.keyboard.on("keydown_SPACE", flap);
}

function update() {}

function flap() {
  bird.body.velocity.y = -FLAP_VELOCITY;
}

new Phaser.Game(config);
