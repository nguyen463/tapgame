let score = 0;
let scoreText;
let ball;

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,          // fit ke layar HP
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 400,
    height: 600
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
  // Pastikan path benar, kalau di folder assets sama level dengan index.html:
  this.load.image("ball", "assets/ball.png");
}

function create() {
  ball = this.add.sprite(config.width / 2, config.height / 2, "ball").setInteractive();

  // Sesuaikan ukuran biar pas (misal 1/6 dari lebar layar)
  const targetSize = config.width / 6;
  ball.setDisplaySize(targetSize, targetSize);

  // Event tap
  ball.on("pointerdown", () => {
    score++;
    scoreText.setText("Score: " + score);

    // Pindah posisi random
    ball.x = Phaser.Math.Between(targetSize, config.width - targetSize);
    ball.y = Phaser.Math.Between(targetSize, config.height - targetSize);
  });

  // Teks skor
  scoreText = this.add.text(10, 10, "Score: 0", {
    fontSize: "24px",
    fill: "#000",
  });
}

function update() {}
