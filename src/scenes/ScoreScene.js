import BaseScene from "./BaseScene";

class ScoreScene extends BaseScene {
  constructor(config) {
    super("ScoreScene", { ...config, canGoBack: true });
  }

  create() {
    super.create();

    this.showHighScore();
  }

  showHighScore() {
    const highScore = localStorage.getItem("flappyMarkHighScore");
    const highScoreText = `High score: ${highScore || 0}`;

    this.add
      .text(...this.screenCenter, highScoreText, this.fontOptions)
      .setOrigin(0.5);
  }
}

export default ScoreScene;
