import Phaser from "phaser";

class PlayScene extends Phaser.Scene {
  constructor(config) {
    super("PlayScene");
    this.config = config;
    this.bird = null;
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("bird", "assets/bird.png");
  }

  create() {
    this.add.image(0, 0, "sky").setOrigin(0);
    this.bird = this.physics.add
      .image(
        this.config.initialBirdPosition.x,
        this.config.initialBirdPosition.y,
        "bird"
      )
      .setOrigin(0);
    this.bird.body.gravity.y = 800;
  }

  update() {}
}

export default PlayScene;
