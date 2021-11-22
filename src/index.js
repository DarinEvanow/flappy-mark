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
const initialBirdPosition = { x: config.width / 10, y: config.height / 2 };

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
    .image(initialBirdPosition.x, initialBirdPosition.y, "bird")
    .setOrigin(0);

  this.input.on("pointerdown", flap);
  this.input.keyboard.on("keydown_SPACE", flap);
}

function update() {
  if (bird.y > config.height || bird.y < -bird.height) {
    resetGame();
  }
}

function flap() {
  bird.body.velocity.y = -FLAP_VELOCITY;
}

function resetGame() {
  bird.x = initialBirdPosition.x;
  bird.y = initialBirdPosition.y;
  bird.body.velocity.y = 0;
}

new Phaser.Game(config);
