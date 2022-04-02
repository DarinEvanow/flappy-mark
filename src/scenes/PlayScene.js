import BaseScene from "./BaseScene";

const FLAP_VELOCITY = 400;
const TRASHCANS_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

    // Bird variables
    this.bird = null;

    // Trashcan variables
    this.trashcans = null;
    this.trashcanHorizontalDistance = 0;
    this.trashcanHorizontalPosition = 0;
    this.trashcanVerticalDistance = 0;
    this.trashcanVerticalPosition = 0;
    this.rightmostTrashcanX = 0;

    // Score variables
    this.score = 0;
    this.scoreText = "";
    this.highScoreText = "";

    // Difficulty variables
    this.currentDifficulty = "easy";
    this.difficulties = {
      easy: {
        trashcanVerticalDistanceRange: [200, 275],
        trashcanHorizontalDistanceRange: [350, 400],
      },
      normal: {
        trashcanVerticalDistanceRange: [175, 250],
        trashcanHorizontalDistanceRange: [320, 370],
      },
      hard: {
        trashcanVerticalDistanceRange: [150, 225],
        trashcanHorizontalDistanceRange: [290, 320],
      },
    };
  }

  create() {
    this.currentDifficulty = "easy";
    super.create();
    this.createBackground();
    this.createBird();
    this.createTrashcans();
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
    this.recycleTrashcans();
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

    this.bird.setBodySize(this.bird.width, this.bird.height - 8);
    this.bird.body.gravity.y = 800;
    this.bird.setCollideWorldBounds(true);
  }

  createTrashcans() {
    this.trashcans = this.physics.add.group();

    for (let i = 0; i < TRASHCANS_TO_RENDER; i++) {
      const upperTrashcan = this.trashcans
        .create(0, 0, "trashcan")
        .setImmovable(true)
        .setFlipY(true)
        .setOrigin(0, 1);

      const lowerTrashcan = this.trashcans
        .create(0, 0, "trashcan")
        .setImmovable(true)
        .setOrigin(0, 0);

      this.placeTrashcans(upperTrashcan, lowerTrashcan);
    }
  }

  createColliders() {
    this.physics.add.collider(
      this.bird,
      this.trashcans,
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
      this.bird.getBounds().bottom >= this.config.height ||
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

  recycleTrashcans() {
    const tempTrashcans = [];

    this.trashcans.getChildren().forEach((trashcan) => {
      if (trashcan.getBounds().right < 0) {
        tempTrashcans.push(trashcan);
        if (tempTrashcans.length === 2) {
          this.placeTrashcans(...tempTrashcans);
          this.increaseScore();
          this.setDifficulty();
        }
      }
    });
  }

  placeTrashcans(upperTrashcan, lowerTrashcan) {
    const { trashcanHorizontalDistanceRange, trashcanVerticalDistanceRange } =
      this.difficulties[this.currentDifficulty];
    this.rightmostTrashcanX = this.getRightmostTrashcanX();

    this.trashcanHorizontalDistance = Phaser.Math.Between(
      ...trashcanHorizontalDistanceRange
    );
    this.trashcanHorizontalPosition = Phaser.Math.Between(
      this.rightmostTrashcanX + trashcanHorizontalDistanceRange[0],
      this.rightmostTrashcanX + this.trashcanHorizontalDistance
    );

    this.trashcanVerticalDistance = Phaser.Math.Between(
      ...trashcanVerticalDistanceRange
    );
    this.trashcanVerticalPosition = Phaser.Math.Between(
      20,
      this.config.height - 20 - this.trashcanVerticalDistance
    );

    upperTrashcan.x = this.trashcanHorizontalPosition;
    upperTrashcan.y = this.trashcanVerticalPosition;

    lowerTrashcan.x = this.trashcanHorizontalPosition;
    lowerTrashcan.y =
      this.trashcanVerticalPosition + this.trashcanVerticalDistance;

    this.trashcans.setVelocityX(-200);
  }

  getRightmostTrashcanX() {
    let rightmostX = 0;

    this.trashcans.getChildren().forEach((trashcan) => {
      rightmostX = Math.max(trashcan.x, rightmostX);
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
