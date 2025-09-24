// Variabel global game
let game;
let score = 0;
let timeLeft = 60;
let level = 1;
let combo = 0;
let maxCombo = 0;
let highestLevel = 1;
let isGameRunning = false;
let timer;

// Referensi elemen UI
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const levelDisplay = document.getElementById('level-display');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const highestLevelDisplay = document.getElementById('highest-level');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Deteksi ukuran layar
function getScreenSize() {
    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? window.innerWidth : 800;
    const height = isMobile ? window.innerHeight : 600;
    return { width, height, isMobile };
}

// Konfigurasi game Phaser
function createGameConfig() {
    const { width, height, isMobile } = getScreenSize();
    
    return {
        type: Phaser.AUTO,
        width: width,
        height: height,
        parent: 'game-container',
        backgroundColor: '#0f3460',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: {
            key: 'main',
            preload: preload,
            create: create,
            update: update
        }
    };
}

// Fungsi preload assets
function preload() {
    // Load gambar target
    this.load.image('blueTarget', 'https://labs.phaser.io/assets/sprites/orb-blue.png');
    this.load.image('redTarget', 'https://labs.phaser.io/assets/sprites/orb-red.png');
    this.load.image('background', 'https://labs.phaser.io/assets/skies/space4.png');
    this.load.image('particle', 'https://labs.phaser.io/assets/particles/blue.png');
}

// Fungsi create - inisialisasi game objects
function create() {
    const { width, height, isMobile } = getScreenSize();
    
    // Tambahkan background
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);
    
    // Buat grup untuk target
    this.blueTargets = this.physics.add.group();
    this.redTargets = this.physics.add.group();
    
    // Buat partikel efek
    this.particles = this.add.particles('particle');
    
    // Emitter untuk efek biru (target baik)
    this.blueEmitter = this.particles.createEmitter({
        speed: 100,
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        lifespan: 500,
        on: false
    });
    
    // Emitter untuk efek merah (target buruk)
    this.redEmitter = this.particles.createEmitter({
        speed: 100,
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        tint: 0xff0000,
        lifespan: 500,
        on: false
    });
    
    // Event untuk menangani klik pada target (mobile friendly)
    this.input.on('pointerdown', (pointer, gameObjects) => {
        if (!isGameRunning) return;
        
        if (gameObjects.length > 0) {
            const gameObject = gameObjects[0];
            handleTargetClick(this, gameObject);
        }
    });
    
    // Juga tangani gameobjectdown untuk kompatibilitas
    this.input.on('gameobjectdown', (pointer, gameObject) => {
        if (!isGameRunning) return;
        handleTargetClick(this, gameObject);
    });
    
    // Spawn target biru awal
    const initialTargets = isMobile ? 2 : 3;
    for (let i = 0; i < initialTargets; i++) {
        spawnBlueTarget(this);
    }
    
    // Timer untuk spawn target merah
    this.time.addEvent({
        delay: isMobile ? 4000 : 5000, // Lebih cepat di mobile
        callback: () => {
            if (isGameRunning && this.redTargets.getLength() < (isMobile ? 1 : 2)) {
                spawnRedTarget(this);
            }
        },
        loop: true
    });
}

// Fungsi untuk menangani klik target
function handleTargetClick(scene, gameObject) {
    if (gameObject.texture.key === 'blueTarget') {
        // Kena target biru - tambah poin dan combo
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        score += level; // Poin berdasarkan level
        scoreDisplay.textContent = `Skor: ${score}`;
        
        // Efek partikel
        scene.blueEmitter.explode(10, gameObject.x, gameObject.y);
        
        // Hapus target dan buat yang baru
        gameObject.destroy();
        spawnBlueTarget(scene);
        
        // Cek jika perlu naik level
        if (score % 20 === 0) {
            levelUp();
        }
    } 
    else if (gameObject.texture.key === 'redTarget') {
        // Kena target merah - reset combo dan kurangi poin
        combo = 0;
        score = Math.max(0, score - 5);
        scoreDisplay.textContent = `Skor: ${score}`;
        
        // Efek partikel
        scene.redEmitter.explode(10, gameObject.x, gameObject.y);
        
        // Hapus target
        gameObject.destroy();
    }
}

// Fungsi update - logika game loop
function update() {
    // Animasi rotasi target
    this.blueTargets.getChildren().forEach(target => {
        target.rotation += 0.01;
    });
    
    this.redTargets.getChildren().forEach(target => {
        target.rotation += 0.02;
    });
}

// Fungsi untuk spawn target biru
function spawnBlueTarget(scene) {
    const { width, height, isMobile } = getScreenSize();
    const margin = isMobile ? 40 : 50;
    
    const x = Phaser.Math.Between(margin, width - margin);
    const y = Phaser.Math.Between(margin, height - margin);
    
    const target = scene.blueTargets.create(x, y, 'blueTarget');
    target.setInteractive();
    
    // Sesuaikan ukuran target untuk mobile
    const scale = isMobile ? 0.6 : 0.8;
    target.setScale(scale);
    
    // Animasi muncul
    scene.tweens.add({
        targets: target,
        scale: scale,
        duration: 300,
        ease: 'Back.easeOut'
    });
}

// Fungsi untuk spawn target merah
function spawnRedTarget(scene) {
    const { width, height, isMobile } = getScreenSize();
    const margin = isMobile ? 40 : 50;
    
    const x = Phaser.Math.Between(margin, width - margin);
    const y = Phaser.Math.Between(margin, height - margin);
    
    const target = scene.redTargets.create(x, y, 'redTarget');
    target.setInteractive();
    
    // Sesuaikan ukuran target untuk mobile
    const scale = isMobile ? 0.6 : 0.8;
    target.setScale(scale);
    
    // Animasi berdenyut
    scene.tweens.add({
        targets: target,
        scale: scale * 0.9,
        duration: 500,
        yoyo: true,
        repeat: -1
    });
}

// Fungsi untuk meningkatkan level
function levelUp() {
    level++;
    highestLevel = Math.max(highestLevel, level);
    levelDisplay.textContent = `Level: ${level}`;
    
    // Tambah target biru setiap naik level
    if (game && game.scene && game.scene.keys.main) {
        spawnBlueTarget(game.scene.keys.main);
    }
}

// Fungsi untuk memulai game
function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    isGameRunning = true;
    
    // Reset variabel game
    score = 0;
    timeLeft = 60;
    level = 1;
    combo = 0;
    
    // Update UI
    scoreDisplay.textContent = `Skor: ${score}`;
    timerDisplay.textContent = `Waktu: ${timeLeft}`;
    levelDisplay.textContent = `Level: ${level}`;
    
    // Inisialisasi game Phaser jika belum ada
    if (!game) {
        game = new Phaser.Game(createGameConfig());
    } else {
        // Hancurkan game lama dan buat yang baru dengan ukuran yang benar
        game.destroy(true);
        game = new Phaser.Game(createGameConfig());
    }
    
    // Mulai timer
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Waktu: ${timeLeft}`;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Fungsi untuk mengakhiri game
function endGame() {
    isGameRunning = false;
    clearInterval(timer);
    
    // Tampilkan layar game over
    gameOverScreen.style.display = 'flex';
    finalScoreDisplay.textContent = `Skor: ${score}`;
    highestLevelDisplay.textContent = highestLevel;
}

// Event listeners untuk tombol
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Handle resize window
window.addEventListener('resize', () => {
    if (game && isGameRunning) {
        // Restart game dengan ukuran baru
        game.scene.stop('main');
        game.scene.start('main');
    }
});

// Inisialisasi saat halaman dimuat
window.addEventListener('load', () => {
    // Tidak langsung memulai game, tunggu klik pengguna
    console.log('Game Tap-Tap siap dimainkan!');
    
    // Prevent default touch behaviors
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchend', function(e) {
        if (e.touches.length > 0) {
            e.preventDefault();
        }
    }, { passive: false });
});
