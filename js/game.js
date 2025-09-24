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
    
    // Memuat beberapa gambar partikel dengan warna berbeda untuk efek kembang api
    this.load.image("red", "https://labs.phaser.io/assets/particles/red.png");
    this.load.image("yellow", "https://labs.phaser.io/assets/particles/yellow.png");
    this.load.image("green", "https://labs.phaser.io/assets/particles/green.png");
}

function create() {
    // Tambahkan background
    const background = this.add.image(0, 0, "background").setOrigin(0, 0);
    background.displayWidth = this.sys.game.config.width;
    background.displayHeight = this.sys.game.config.height;

    // Buat sistem partikel dengan beberapa gambar
    particles = this.add.particles(['red', 'yellow', 'green']);
    
    // Konfigurasi emitter untuk efek kembang api yang lebih kompleks
    emitter = particles.createEmitter({
        // Kecepatan dan sudut menyebar dari titik ledakan
        speed: { min: -200, max: 200 },
        angle: { min: 0, max: 360, steps: 32 },
        
        // Ukuran partikel mengecil seiring waktu
        scale: { start: 0.8, end: 0 },
        
        // Partikel memudar dan menghilang
        alpha: { start: 1, end: 0, ease: 'Cubic.easeOut' },
        
        // Efek gravitasi agar partikel terlihat jatuh
        gravityY: 300,
        
        // Partikel hidup hanya sebentar (1 detik)
        lifespan: 1000,
        
        // Atur agar partikel meledak dari satu titik, bukan terus-menerus
        emitZone: {
            type: 'random',
            source: new Phaser.Geom.Circle(0, 0, 1)
        },
        
        quantity: 100, // Jumlah partikel yang meledak jauh lebih banyak
        
        active: false,
        blendMode: 'SCREEN',
        follow: ball, // Partikel mengikuti bola, jadi ledakan terjadi di posisi bola
        frequency: -1 // Ini memastikan partikel hanya meledak sekali saat dipicu
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
            // Ledakan partikel kembang api
            emitter.explode(100, ball.x, ball.y);
        }
    });
}

function update() {}
