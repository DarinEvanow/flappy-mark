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

new Phaser.Game(config);
