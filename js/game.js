let score = 0;
let scoreText;
let monster;

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
  this.load.image("monster", "assets/ball.png"); // ganti ke gambar kamu
}

function create() {
  // Tambah sprite
  monster = this.add.sprite(config.width / 2, config.height / 2, "monster").setInteractive();

  // Atur ukuran kecil biar pas di mobile
  const targetSize = config.width / 6;
  monster.setDisplaySize(targetSize, targetSize);

  // Event tap dengan animasi
  monster.on("pointerdown", () => {
    score++;
    scoreText.setText("Score: " + score);

    // Animasi: membesar lalu mengecil
    this.tweens.add({
      targets: monster,
      scaleX: monster.scaleX * 1.3,
      scaleY: monster.scaleY * 1.3,
      duration: 150,
      yoyo: true,
      ease: "Bounce.easeOut",
      onComplete: () => {
        // Setelah animasi selesai → pindah posisi random
        monster.x = Phaser.Math.Between(targetSize, config.width - targetSize);
        monster.y = Phaser.Math.Between(targetSize, config.height - targetSize);
      }
    });
  });

  // Teks skor
  scoreText = this.add.text(10, 10, "Score: 0", {
    fontSize: "24px",
    fill: "#000",
  });
}

function update() {}
