let score = 0;
let scoreText;
let ball;
let particles;
let emitter; // Pindahkan deklarasi emitter ke luar fungsi

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600
    },
    backgroundColor: "#87CEEB",
    parent: 'game-container',
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
    this.load.image("spark", "https://labs.phaser.io/assets/particles/red.png");
}

function create() {
    // Tambahkan background
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);
    background.displayWidth = this.sys.game.config.width;
    background.displayHeight = this.sys.game.config.height;

    // Buat sistem partikel untuk efek kembang api
    particles = this.add.particles("spark");
    emitter = particles.createEmitter({
        speed: { min: 200, max: 400 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        gravityY: 400,
        lifespan: 1000,
        quantity: 30,
        active: false,
        blendMode: 'SCREEN' // Menambahkan blend mode agar partikel terlihat lebih terang dan menyatu
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
        fill: "#fff",
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
            duration: 150,
            ease: "Power1",
        });

        // Cek apakah skor mencapai kelipatan 100
        if (score > 0 && score % 10 === 0) {
            // Tampilkan kembang api di posisi acak
            emitter.setPosition(
                Phaser.Math.Between(0, this.sys.game.config.width),
                Phaser.Math.Between(0, this.sys.game.config.height)
            );
            emitter.explode(50); // Panggil explode tanpa x dan y, karena sudah diset di setPosition
        }
    });
}

function update() {}
