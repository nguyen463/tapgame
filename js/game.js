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
    backgroundColor: "#000033", // Ganti warna latar belakang jadi lebih gelap untuk efek kembang api
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
    
    // Memuat gambar partikel dengan warna-warni
    this.load.image("pixel", "https://labs.phaser.io/assets/particles/pixel.png");
    this.load.image("star_particle", "https://labs.phaser.io/assets/particles/blue.png");
}

function create() {
    // Tambahkan background
    this.add.image(0, 0, "background").setOrigin(0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Buat sistem partikel utama untuk ledakan
    particles = this.add.particles("pixel");
    
    emitter = particles.createEmitter({
        // Kecepatan partikel menyebar
        speed: { min: 200, max: 400 },
        // Sudut penyebaran partikel (360 derajat)
        angle: { start: 0, end: 360, steps: 32 },
        // Partikel mengecil seiring waktu
        scale: { start: 1, end: 0.1, ease: 'Cubic.easeOut' },
        // Transparansi partikel memudar
        alpha: { start: 1, end: 0, ease: 'Cubic.easeOut' },
        // Efek gravitasi
        gravityY: 300,
        // Usia partikel
        lifespan: 1500,
        // Partikel meledak dari satu titik
        emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 1) },
        // Jumlah partikel per ledakan
        quantity: 150,
        // Tidak aktif sampai dipicu
        active: false,
        // Efek pencahayaan kuat
        blendMode: 'ADD',
    });
    
    // Buat emitter sekunder untuk efek percikan
    const sparkleEmitter = particles.createEmitter({
        // Lebih lambat dan memudar lebih cepat
        speed: { min: 50, max: 100 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 1, end: 0, ease: 'Cubic.easeOut' },
        lifespan: 500,
        quantity: 10,
        active: false,
        blendMode: 'ADD',
        frequency: -1,
        // Partikel akan meledak di posisi yang sama dengan emitter utama
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
        if (score > 0 && score % 100 === 0) {
            // Posisikan emitter di posisi bola
            emitter.setPosition(ball.x, ball.y);
            // Ledakan partikel kembang api
            emitter.explode(150);
            
            // Ledakan partikel percikan sesaat setelah ledakan utama
            this.time.delayedCall(100, () => {
                 sparkleEmitter.explode(10, ball.x, ball.y);
            });
        }
    });
}

function update() {}
