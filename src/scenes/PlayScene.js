import Phaser from "phaser";

const FLAP_VELOCITY = 400;
const PIPES_TO_RENDER = 4;
const PIPE_VERTICAL_DISTANCE_RANGE = [150, 250];
const PIPE_HORIZONTAL_DISTANCE_RANGE = [350, 550];

class PlayScene extends Phaser.Scene {
  constructor(config) {
    super("PlayScene");
    this.config = config;

    // Bird variables
    this.bird = null;

    // Pipe variables
    this.pipes = null;
    this.pipeHorizontalDistance = 0;
    this.pipeHorizontalPosition = 0;
    this.pipeVerticalDistance = 0;
    this.pipeVerticalPosition = 0;
    this.rightmostPipeX = 0;

    // Score variables
    this.score = 0;
    this.scoreText = "";
    this.highScoreText = "";
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("bird", "assets/bird.png");
    this.load.image("pipe", "assets/pipe.png");
  }

  create() {
    this.createBackground();
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createEventHandlers();
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  createBackground() {
    this.add.image(0, 0, "sky").setOrigin(0);
  }

  createBird() {
    this.bird = this.physics.add
      .image(
        this.config.initialBirdPosition.x,
        this.config.initialBirdPosition.y,
        "bird"
      )
      .setOrigin(0);
    this.bird.body.gravity.y = 800;
    this.bird.setCollideWorldBounds(true);
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 1);

      const lowerPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 0);

      this.placePipes(upperPipe, lowerPipe);
    }
  }

  createColliders() {
    this.physics.add.collider(
      this.bird,
      this.pipes,
      this.resetGame,
      null,
      this
    );
  }

  createScore() {
    this.score = 0;
    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });

    const highScore = localStorage.getItem("flappyMarkHighScore");
    this.highScoreText = this.add.text(
      16,
      48,
      `High score: ${highScore || 0}`,
      {
        fontSize: "32px",
        fill: "#000",
      }
    );
  }

  createEventHandlers() {
    this.input.on("pointerdown", this.flap, this);
    this.input.keyboard.on("keydown_SPACE", this.flap, this);
  }

  checkGameStatus() {
    if (
      this.bird.y >= this.config.height - this.bird.height ||
      this.bird.y <= 0
    ) {
      this.resetGame();
    }
  }

  flap() {
    this.bird.body.velocity.y = -FLAP_VELOCITY;
  }

  recyclePipes() {
    const tempPipes = [];

    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right < 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipes(...tempPipes);
          this.increaseScore();
        }
      }
    });
  }

  placePipes(upperPipe, lowerPipe) {
    this.rightmostPipeX = this.getRightmostPipeX();
    this.pipeHorizontalDistance = Phaser.Math.Between(
      ...PIPE_HORIZONTAL_DISTANCE_RANGE
    );
    this.pipeHorizontalPosition = Phaser.Math.Between(
      this.rightmostPipeX + PIPE_HORIZONTAL_DISTANCE_RANGE[0],
      this.rightmostPipeX + this.pipeHorizontalDistance
    );

    this.pipeVerticalDistance = Phaser.Math.Between(
      ...PIPE_VERTICAL_DISTANCE_RANGE
    );
    this.pipeVerticalPosition = Phaser.Math.Between(
      20,
      this.config.height - 20 - this.pipeVerticalDistance
    );

    upperPipe.x = this.pipeHorizontalPosition;
    upperPipe.y = this.pipeVerticalPosition;

    lowerPipe.x = this.pipeHorizontalPosition;
    lowerPipe.y = this.pipeVerticalPosition + this.pipeVerticalDistance;

    this.pipes.setVelocityX(-200);
  }

  getRightmostPipeX() {
    let rightmostX = 0;

    this.pipes.getChildren().forEach((pipe) => {
      rightmostX = Math.max(pipe.x, rightmostX);
    });

    return rightmostX;
  }

  resetGame() {
    this.physics.pause();
    this.bird.setTint(0xee4824);

    this.setHighScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  setHighScore() {
    const highScoreText = localStorage.getItem("flappyMarkHighScore");
    const highScore = highScoreText && parseInt(highScoreText, 10);

    if (!highScore || this.score > highScore) {
      localStorage.setItem("flappyMarkHighScore", this.score);
    }
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

export default PlayScene;
