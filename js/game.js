let score = 0;
let scoreText;
let ball;
let particles;

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600
    },
    backgroundColor: "#87CEEB",
    parent: 'game-container', // Menentukan wadah untuk canvas game
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image("background", "https://labs.phaser.io/assets/skies/space3.png");
    this.load.image("ball", "https://labs.phaser.io/assets/sprites/mushroom2.png");
    // Gambar partikel untuk efek kembang api
    this.load.image("spark", "https://labs.phaser.io/assets/particles/red.png");
}

function create() {
    // Tambahkan background
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);
    background.displayWidth = this.sys.game.config.width;
    background.displayHeight = this.sys.game.config.height;

    // Buat sistem partikel untuk efek kembang api
    particles = this.add.particles("spark");
    const emitter = particles.createEmitter({
        speed: { min: 200, max: 400 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        gravityY: 400,
        lifespan: 1000,
        quantity: 30,
        active: false,
    });

    // Sesuaikan ukuran bola
    const ballSize = this.sys.game.config.width / 6;

    // Buat bola yang bisa diklik
    ball = this.add.sprite(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        "ball"
    ).setInteractive();
    ball.setDisplaySize(ballSize, ballSize);

    // Tambahkan teks skor
    scoreText = this.add.text(10, 10, "Score: 0", {
        fontSize: "24px",
        fill: "#fff", // Ganti warna agar terlihat di background gelap
        fontStyle: "bold"
    });

    // Event saat bola di-tap atau di-klik
    ball.on("pointerdown", () => {
        score++;
        scoreText.setText(`Score: ${score}`);

        // Pindahkan bola ke posisi acak dengan animasi
        const newX = Phaser.Math.Between(ballSize, this.sys.game.config.width - ballSize);
        const newY = Phaser.Math.Between(ballSize, this.sys.game.config.height - ballSize);

        this.tweens.add({
            targets: ball,
            x: newX,
            y: newY,
            duration: 150, // Durasi animasi lebih cepat
            ease: "Power1",
        });

        // Cek apakah skor mencapai kelipatan 100
        if (score > 0 && score % 5 === 0) {
            // Tampilkan kembang api di posisi acak
            emitter.setPosition(
                Phaser.Math.Between(0, this.sys.game.config.width),
                Phaser.Math.Between(0, this.sys.game.config.height)
            );
            emitter.explode(50, emitter.x, emitter.y);
        }
    });
}

function update() {
    // Fungsi ini kosong karena semua logika game ada di event 'pointerdown'
}
