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
    this.load.image("sparkle", "https://labs.phaser.io/assets/particles/blue.png");
}

function create() {
    // Tambahkan background
    this.add.image(0, 0, "background").setOrigin(0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Buat sistem partikel utama untuk ledakan
    particles = this.add.particles("sparkle");
    
    // Emitter utama untuk ledakan besar
    emitter = particles.createEmitter({
        speed: { min: 100, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 1, end: 0 },
        blendMode: 'ADD',
        lifespan: 1500,
        gravityY: 200,
        frequency: -1, // Tidak memancarkan terus menerus
        quantity: 50,
        on: false // Matikan sampai dipanggil
    });
    
    // Emitter kedua untuk efek tambahan
    const trailEmitter = particles.createEmitter({
        speed: 50,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.8, end: 0 },
        blendMode: 'ADD',
        lifespan: 800,
        quantity: 5,
        on: false
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

        // Efek partikel kecil setiap kali klik
        trailEmitter.explode(5, ball.x, ball.y);

        // Cek apakah skor mencapai kelipatan 10 (diubah dari 100 agar lebih sering terlihat)
        if (score > 0 && score % 10 === 0) {
            // Ledakan besar di posisi bola
            emitter.explode(50, ball.x, ball.y);
            
            // Tambahkan efek beruntun setelah ledakan utama
            this.time.delayedCall(200, () => {
                trailEmitter.explode(10, ball.x, ball.y);
            });
            
            // Tambahkan efek beruntun kedua
            this.time.delayedCall(400, () => {
                trailEmitter.explode(5, ball.x, ball.y);
            });
        }
    });
}

function update() {}
