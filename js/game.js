let score = 0;
let scoreText;
let ball;
let particles;
let emitter;

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600
    },
    backgroundColor: "#000033",
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
    
    // Memuat gambar partikel yang lebih keren untuk efek kembang api
    this.load.image("sparkle", "https://labs.phaser.io/assets/particles/flare.png"); // Gambar baru
}

function create() {
    // Tambahkan background
    this.add.image(0, 0, "background").setOrigin(0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Buat sistem partikel utama untuk ledakan
    particles = this.add.particles("sparkle"); // Ganti "pixel" jadi "sparkle"
    
    emitter = particles.createEmitter({
        speed: { min: 200, max: 400 },
        angle: { start: 0, end: 360, steps: 32 },
        scale: { start: 1, end: 0.1, ease: 'Cubic.easeOut' },
        alpha: { start: 1, end: 0, ease: 'Cubic.easeOut' },
        gravityY: 300,
        lifespan: 1500,
        emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 1) },
        quantity: 150,
        active: false,
        blendMode: 'ADD',
    });
    
    // Buat emitter sekunder untuk efek percikan
    const sparkleEmitter = particles.createEmitter({
        speed: { min: 50, max: 100 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0, ease: 'Cubic.easeOut' },
        lifespan: 500,
        quantity: 10,
        active: false,
        blendMode: 'ADD',
        frequency: -1,
        follow: emitter
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
            emitter.setPosition(ball.x, ball.y);
            emitter.explode(150);
            
            this.time.delayedCall(100, () => {
                 sparkleEmitter.explode(10, ball.x, ball.y);
            });
        }
    });
}

function update() {}
