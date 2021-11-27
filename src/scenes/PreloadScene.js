import BaseScene from "./BaseScene";

class PreloadScene extends BaseScene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("pause", "assets/pause.png");
    this.load.image("bird", "assets/bird.png");
    this.load.image("pipe", "assets/pipe.png");
  }

  create() {
    this.scene.start("MenuScene");
  }
}

export default PreloadScene;
