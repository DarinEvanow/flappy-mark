import Phaser from "phaser";
import PreloadScene from "./scanes/PreloadScene";
import MenuScene from "./scenes/MenuScene";
import PlayScene from "./scenes/PlayScene";

const WIDTH = 800;
const HEIGHT = 600;
const INITIAL_BIRD_POSITION = { x: WIDTH / 10, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  initialBirdPosition: INITIAL_BIRD_POSITION,
};

const SCENES = [PreloadScene, MenuScene, PlayScene];

const createScene = (Scene) => new Scene(SHARED_CONFIG);
const initScenes = () => SCENES.map(createScene);

const config = {
  type: Phaser.AUTO, // WebGL
  ...SHARED_CONFIG,
  physics: {
    default: "arcade", // Arcade physics plugin, manages physics simulation
  },
  scene: initScenes(),
};

new Phaser.Game(config);
