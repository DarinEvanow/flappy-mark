import BaseScene from "./BaseScene";

const FLAP_VELOCITY = 400;
const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

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

    // Difficulty variables
    this.currentDifficulty = "easy";
    this.difficulties = {
      easy: {
        pipeVerticalDistanceRange: [200, 275],
        pipeHorizontalDistanceRange: [350, 400],
      },
      normal: {
        pipeVerticalDistanceRange: [175, 250],
        pipeHorizontalDistanceRange: [320, 370],
      },
      hard: {
        pipeVerticalDistanceRange: [150, 225],
        pipeHorizontalDistanceRange: [290, 320],
      },
    };
  }

  create() {
    this.currentDifficulty = "easy";
    super.create();
    this.createBackground();
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.createEventHandlers();
    this.listenToEvents();

    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("bird", { start: 8, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });

    this.bird.play("fly");
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
      .sprite(
        this.config.initialBirdPosition.x,
        this.config.initialBirdPosition.y,
        "bird"
      )
      .setFlipX(true)
      .setScale(3)
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

  createPause() {
    this.isPaused = false;

    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, "pause")
      .setOrigin(1)
      .setScale(3)
      .setInteractive();

    pauseButton.on(
      "pointerdown",
      () => {
        this.isPaused = true;
        this.physics.pause();
        this.scene.pause();
        this.scene.launch("PauseScene");
      },
      this
    );
  }

  createEventHandlers() {
    this.input.on("pointerdown", this.flap, this);
    this.input.keyboard.on("keydown_SPACE", this.flap, this);
  }

  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }

    this.pauseEvent = this.events.on("resume", () => {
      this.initialTime = 3;
      this.countdownText = this.add
        .text(...this.screenCenter, this.initialTime, this.fontOptions)
        .setOrigin(0.5);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countdown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countdown() {
    this.initialTime--;
    this.countdownText.setText(this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countdownText.setText("");
      this.physics.resume();
      this.timedEvent.remove();
    }
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
    if (this.isPaused) {
      return;
    }
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
          this.setDifficulty();
        }
      }
    });
  }

  placePipes(upperPipe, lowerPipe) {
    const { pipeHorizontalDistanceRange, pipeVerticalDistanceRange } =
      this.difficulties[this.currentDifficulty];
    this.rightmostPipeX = this.getRightmostPipeX();

    this.pipeHorizontalDistance = Phaser.Math.Between(
      ...pipeHorizontalDistanceRange
    );
    this.pipeHorizontalPosition = Phaser.Math.Between(
      this.rightmostPipeX + pipeHorizontalDistanceRange[0],
      this.rightmostPipeX + this.pipeHorizontalDistance
    );

    this.pipeVerticalDistance = Phaser.Math.Between(
      ...pipeVerticalDistanceRange
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

  setDifficulty() {
    if (this.score >= 30) {
      this.currentDifficulty = "hard";
    }

    if (this.score >= 15 && this.score < 30) {
      this.currentDifficulty = "normal";
    }
  }
}

export default PlayScene;
