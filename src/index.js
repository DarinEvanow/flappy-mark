// Importing the Phaser library
import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";

const WIDTH = 800;
const HEIGHT = 600;
const INITIAL_BIRD_POSITION = { x: WIDTH / 10, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  initialBirdPosition: INITIAL_BIRD_POSITION,
};

const config = {
  type: Phaser.AUTO, // WebGL
  ...SHARED_CONFIG,
  physics: {
    default: "arcade", // Arcade physics plugin, manages physics simulation
  },
  scene: [new PlayScene(SHARED_CONFIG)],
};

// Bird variables
let bird;
const FLAP_VELOCITY = 400;

// Pipe variables
let pipes;
const PIPES_TO_RENDER = 4;
const pipeVerticalDistanceRange = [150, 250];
const pipeHorizontalDistanceRange = [350, 550];
let pipeHorizontalDistance = 0;
let pipeHorizontalPosition = 0;
let pipeVerticalDistance = 0;
let pipeVerticalPosition = 0;
let rightmostPipeX = 0;
let upperPipe;
let lowerPipe;

// Used to load assets such as images, animations, music, etc.
function preload() {
  this.load.image("pipe", "assets/pipe.png");
}

// Used to set the initial scene, such as adding the background or title screen
function create() {
  pipes = this.physics.add.group();

  for (let i = 0; i <= PIPES_TO_RENDER; i++) {
    const upperPipe = pipes
      .create(pipeHorizontalPosition, pipeVerticalPosition, "pipe")
      .setOrigin(0, 1);

    const lowerPipe = pipes
      .create(
        pipeHorizontalPosition,
        upperPipe.y + pipeVerticalDistance,
        "pipe"
      )
      .setOrigin(0, 0);

    placePipes(upperPipe, lowerPipe);
  }

  this.input.on("pointerdown", flap);
  this.input.keyboard.on("keydown_SPACE", flap);
}

function update() {
  if (bird.y > config.height || bird.y < -bird.height) {
    resetGame();
  }

  recyclePipes();
}

function recyclePipes() {
  const tempPipes = [];

  pipes.getChildren().forEach((pipe) => {
    if (pipe.getBounds().right < 0) {
      tempPipes.push(pipe);
      if (tempPipes.length === 2) {
        placePipes(...tempPipes);
      }
    }
  });
}

function placePipes(upperPipe, lowerPipe) {
  rightmostPipeX = getRightmostPipeX();
  pipeHorizontalDistance = Phaser.Math.Between(...pipeHorizontalDistanceRange);
  pipeHorizontalPosition = Phaser.Math.Between(
    rightmostPipeX + pipeHorizontalDistanceRange[0],
    rightmostPipeX + pipeHorizontalDistance
  );

  pipeVerticalDistance = Phaser.Math.Between(...pipeVerticalDistanceRange);
  pipeVerticalPosition = Phaser.Math.Between(
    20,
    config.height - 20 - pipeVerticalDistance
  );

  upperPipe.x = pipeHorizontalPosition;
  upperPipe.y = pipeVerticalPosition;

  lowerPipe.x = pipeHorizontalPosition;
  lowerPipe.y = pipeVerticalPosition + pipeVerticalDistance;

  pipes.setVelocityX(-200);
}

function getRightmostPipeX() {
  let rightmostX = 0;

  pipes.getChildren().forEach((pipe) => {
    rightmostX = Math.max(pipe.x, rightmostX);
  });

  return rightmostX;
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
