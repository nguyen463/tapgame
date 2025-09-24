let score = 0;
let scoreText;
let ball;

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 400,
    height: 600,
  },
  backgroundColor: "#87CEEB",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("ball", "https://labs.phaser.io/assets/sprites/mushroom2.png");
}

function create() {
  // Define game constants at the top for clarity
  const targetSize = this.sys.game.config.width / 6;

  // Create the ball sprite
  ball = this.add
    .sprite(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      "ball"
    )
    .setInteractive();
  ball.setDisplaySize(targetSize, targetSize);

  // Create the score text
  scoreText = this.add.text(10, 10, "Score: 0", {
    fontSize: "24px",
    fill: "#000",
  });

  // Set up the tap event handler
  ball.on("pointerdown", () => {
    score++;
    scoreText.setText(`Score: ${score}`); // Use template literals for cleaner string formatting

    // Calculate new random position to avoid the ball going off-screen
    const newX = Phaser.Math.Between(targetSize, this.sys.game.config.width - targetSize);
    const newY = Phaser.Math.Between(targetSize, this.sys.game.config.height - targetSize);
    
    // Animate the ball to the new position for a smoother effect
    this.tweens.add({
      targets: ball,
      x: newX,
      y: newY,
      duration: 100, // Duration in milliseconds
      ease: 'Power1'
    });
  });
}

function update() {}
