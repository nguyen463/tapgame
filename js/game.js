let score = 0;
let scoreText;

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  backgroundColor: "#87CEEB",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  // Ganti ke asset kamu sendiri
  this.load.image("ball", "../assets/ball.png");
}

function create() {
  const ball = this.add.sprite(200, 300, "ball").setInteractive();

  // Event tap
  ball.on("pointerdown", () => {
    score++;
    scoreText.setText("Score: " + score);

    // Pindah posisi random
    ball.x = Phaser.Math.Between(50, 350);
    ball.y = Phaser.Math.Between(50, 550);
  });

  // Teks skor
  scoreText = this.add.text(10, 10, "Score: 0", {
    fontSize: "24px",
    fill: "#000",
  });
}

function update() {}

