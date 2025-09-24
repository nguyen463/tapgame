let point = 0;
let pointText;
let ball;
let bomb;
let particles;
let emitter;
let bombVisible = false;
let gameScene;

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
    this.load.image("ball", "../assets/ball.png");
    this.load.image("bomb", "../assets/bomb.png");
    this.load.image("sparkle", "https://labs.phaser.io/assets/particles/red.png");
}

function create() {
    gameScene = this;

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
        frequency: -1,
        quantity: 50,
        on: false
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

    // Buat bom yang bisa diklik
    const bombSize = this.sys.game.config.width / 8;
    bomb = this.add.sprite(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        "bomb"
    ).setInteractive();
    bomb.setDisplaySize(bombSize, bombSize);
    bomb.setVisible(false);
    bombVisible = false;

    // Tambahkan teks point
    pointText = this.add.text(10, 10, "Point: 0", {
        fontSize: "24px",
        fill: "#fff",
        fontStyle: "bold"
    });

    // Event saat bola di-tap atau di-klik
    ball.on("pointerdown", () => {
        point++;
        pointText.setText(`Point: ${point}`);

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

        // Cek apakah point mencapai kelipatan 10
        if (point > 0 && point % 10 === 0) {
            emitter.explode(50, ball.x, ball.y);
            
            this.time.delayedCall(200, () => {
                trailEmitter.explode(10, ball.x, ball.y);
            });
            
            this.time.delayedCall(400, () => {
                trailEmitter.explode(5, ball.x, ball.y);
            });
        }
    });

    // Event saat bom di-tap atau di-klik
    bomb.on("pointerdown", () => {
        point = Math.max(0, point - 5);
        pointText.setText(`Point: ${point}`);
        
        // Efek partikel merah untuk bom
        const bombEmitter = particles.createEmitter({
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: 0xff0000,
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 20,
            on: false
        });
        
        bombEmitter.explode(20, bomb.x, bomb.y);
        
        // Sembunyikan bom
        bomb.setVisible(false);
        bombVisible = false;
        
        // Jadwalkan munculnya bom berikutnya
        this.time.delayedCall(Phaser.Math.Between(3000, 8000), showBomb);
    });

    // Jadwalkan munculnya bom pertama
    this.time.delayedCall(5000, showBomb);
}

// Fungsi untuk menampilkan bom di posisi random
function showBomb() {
    if (!bombVisible) {
        const bombSize = bomb.displayWidth;
        const newX = Phaser.Math.Between(bombSize, gameScene.sys.game.config.width - bombSize);
        const newY = Phaser.Math.Between(bombSize, gameScene.sys.game.config.height - bombSize);
        
        bomb.setPosition(newX, newY);
        bomb.setVisible(true);
        bombVisible = true;
        
        // Animasi kedip-kedip pada bom untuk peringatan
        gameScene.tweens.add({
            targets: bomb,
            alpha: 0.5,
            duration: 300,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                bomb.setAlpha(1);
            }
        });
        
        // Bom akan hilang otomatis setelah 5 detik jika tidak diklik
        gameScene.time.delayedCall(5000, () => {
            if (bombVisible) {
                bomb.setVisible(false);
                bombVisible = false;
                gameScene.time.delayedCall(Phaser.Math.Between(3000, 8000), showBomb);
            }
        });
    }
}

function update() {}
