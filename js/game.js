<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Game Tap-Tap dengan Login Solana</title>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
    <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
    <script src="https://unpkg.com/@solana/wallet-adapter-base@latest/lib/index.iife.js"></script>
    <script src="https://unpkg.com/@solana/wallet-adapter-wallets@latest/lib/index.iife.js"></script>
    <script src="https://unpkg.com/@solana/wallet-adapter-phantom@latest/lib/index.iife.js"></script>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        .container {
            width: 100%;
            max-width: 800px;
            text-align: center;
            padding: 20px;
        }
        
        #login-container, #game-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            margin-bottom: 20px;
        }
        
        h1, h2 {
            color: #00f7ff;
            text-shadow: 0 0 10px rgba(0, 247, 255, 0.5);
            margin-bottom: 20px;
        }
        
        h1 {
            font-size: 2.5rem;
        }
        
        h2 {
            font-size: 2rem;
        }
        
        p {
            line-height: 1.6;
            margin-bottom: 20px;
            font-size: 1.1rem;
        }
        
        button {
            background: linear-gradient(135deg, #00f7ff 0%, #008cff 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: bold;
            margin: 10px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4);
        }
        
        button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 247, 255, 0.6);
        }
        
        button:disabled {
            background: #666;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        #wallet-info {
            margin-top: 20px;
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 10px;
            display: none;
        }
        
        #game-container {
            display: none;
            position: relative;
            width: 100%;
            height: 600px;
            overflow: hidden;
        }
        
        #game-ui {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            padding: 20px;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            pointer-events: none;
        }
        
        .ui-panel {
            background: rgba(0, 0, 0, 0.6);
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: bold;
        }
        
        #loading {
            display: none;
            margin: 20px;
            font-size: 1.2rem;
        }
        
        #error-message {
            display: none;
            background: rgba(255, 68, 68, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin: 20px;
            max-width: 400px;
        }
        
        #game-over {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 20;
        }
        
        .spinner {
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 5px solid #00f7ff;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .instructions {
            background: rgba(0, 0, 0, 0.5);
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
            text-align: left;
        }
        
        .instructions h3 {
            color: #00f7ff;
            margin-bottom: 10px;
        }
        
        .instructions ul {
            padding-left: 20px;
        }
        
        .instructions li {
            margin-bottom: 8px;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }
            
            #game-container {
                height: 500px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="login-container">
            <h1>Game Tap-Tap dengan Solana</h1>
            <p>Kumpulkan poin sebanyak mungkin dengan mengetik target biru. Hindari target merah yang mengurangi poin!</p>
            
            <div class="instructions">
                <h3>Cara Bermain:</h3>
                <ul>
                    <li>Klik tombol "Connect Wallet" untuk menghubungkan wallet Solana</li>
                    <li>Klik target biru untuk mendapatkan poin</li>
                    <li>Hindari target merah yang akan mengurangi poin</li>
                    <li>Poin akan disimpan secara lokal di browser Anda</li>
                </ul>
            </div>
            
            <button id="connect-button">Connect Wallet</button>
            <div id="loading">
                <div class="spinner"></div>
                <p>Memuat wallet...</p>
            </div>
            <div id="wallet-info">
                <p>Wallet Terhubung: <span id="wallet-address"></span></p>
                <button id="disconnect-button">Disconnect</button>
            </div>
        </div>

        <div id="game-container">
            <div id="game-ui">
                <div class="ui-panel">Poin: <span id="point-counter">0</span></div>
                <div class="ui-panel">Waktu: <span id="timer">60</span>s</div>
            </div>
            <div id="game-over">
                <h2>Permainan Selesai!</h2>
                <p>Poin Akhir: <span id="final-points">0</span></p>
                <button id="restart-button">Main Lagi</button>
            </div>
        </div>
        
        <div id="error-message"></div>
    </div>

    <noscript>
        <div style="text-align: center; padding: 50px;">
            <h2>JavaScript Diperlukan</h2>
            <p>Game ini membutuhkan JavaScript untuk berjalan. Mohon aktifkan di browser Anda.</p>
        </div>
    </noscript>

    <script>
        // Variabel global
        let game;
        let points = 0;
        let gameTime = 60;
        let timerInterval;
        let isGameActive = false;
        let walletAddress = '';
        let wallet;
        
        // Element references
        const connectButton = document.getElementById('connect-button');
        const disconnectButton = document.getElementById('disconnect-button');
        const restartButton = document.getElementById('restart-button');
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error-message');
        const walletInfoElement = document.getElementById('wallet-info');
        const walletAddressElement = document.getElementById('wallet-address');
        const pointCounterElement = document.getElementById('point-counter');
        const timerElement = document.getElementById('timer');
        const finalPointsElement = document.getElementById('final-points');
        const gameOverElement = document.getElementById('game-over');
        const loginContainer = document.getElementById('login-container');
        const gameContainer = document.getElementById('game-container');

        // Fungsi utilitas
        function showError(message) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        function hideError() {
            errorElement.style.display = 'none';
        }

        function showLoading() {
            loadingElement.style.display = 'block';
            connectButton.disabled = true;
        }

        function hideLoading() {
            loadingElement.style.display = 'none';
            connectButton.disabled = false;
        }

        // Inisialisasi wallet adapter
        function initWallet() {
            try {
                const { PhantomWalletAdapter } = window['@solana/wallet-adapter-phantom'];
                if (!PhantomWalletAdapter) {
                    throw new Error('Phantom wallet adapter tidak tersedia');
                }
                
                wallet = new PhantomWalletAdapter();
                
                wallet.on('connect', (publicKey) => {
                    console.log('Connected to wallet:', publicKey.toBase58());
                    walletAddress = publicKey.toBase58();
                    walletAddressElement.textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
                    walletInfoElement.style.display = 'block';
                    loginContainer.style.display = 'none';
                    gameContainer.style.display = 'block';
                    hideLoading();
                    hideError();
                    
                    // Muat poin yang tersimpan
                    loadPoints();
                    // Mulai game
                    initGame();
                });
                
                wallet.on('disconnect', () => {
                    console.log('Disconnected from wallet');
                    walletAddress = '';
                    walletInfoElement.style.display = 'none';
                    loginContainer.style.display = 'block';
                    gameContainer.style.display = 'none';
                    hideLoading();
                    
                    if (game) {
                        game.destroy(true);
                        game = null;
                    }
                    
                    if (timerInterval) {
                        clearInterval(timerInterval);
                    }
                });

                connectButton.addEventListener('click', connectWallet);
                disconnectButton.addEventListener('click', disconnectWallet);
                restartButton.addEventListener('click', restartGame);

            } catch (error) {
                console.error('Error initializing wallet:', error);
                showError('Gagal memuat wallet adapter. Pastikan koneksi internet stabil.');
            }
        }

        async function connectWallet() {
            try {
                showLoading();
                hideError();
                
                if (!wallet.connected) {
                    await wallet.connect();
                }
            } catch (error) {
                console.error('Error connecting wallet:', error);
                hideLoading();
                showError('Error connecting wallet. Pastikan Phantom wallet terinstall dan sudah login.');
            }
        }

        async function disconnectWallet() {
            try {
                await wallet.disconnect();
            } catch (error) {
                console.error('Error disconnecting wallet:', error);
                showError('Error disconnecting wallet.');
            }
        }

        async function savePoints() {
            if (!walletAddress) return false;
            
            try {
                localStorage.setItem(`points_${walletAddress}`, points.toString());
                console.log('Points saved locally for wallet:', walletAddress);
                return true;
            } catch (error) {
                console.error('Error saving points:', error);
                return false;
            }
        }

        async function loadPoints() {
            if (!walletAddress) {
                points = 0;
                return;
            }
            
            try {
                const savedPoints = localStorage.getItem(`points_${walletAddress}`);
                if (savedPoints) {
                    points = parseInt(savedPoints);
                    pointCounterElement.textContent = points;
                } else {
                    points = 0;
                    pointCounterElement.textContent = '0';
                }
            } catch (error) {
                console.error('Error loading points:', error);
                points = 0;
                pointCounterElement.textContent = '0';
            }
        }

        function startGameTimer() {
            gameTime = 60;
            timerElement.textContent = gameTime;
            
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            
            timerInterval = setInterval(() => {
                gameTime--;
                timerElement.textContent = gameTime;
                
                if (gameTime <= 0) {
                    endGame();
                }
            }, 1000);
        }

        function endGame() {
            isGameActive = false;
            clearInterval(timerInterval);
            gameOverElement.style.display = 'flex';
            finalPointsElement.textContent = points;
            savePoints();
        }

        function restartGame() {
            points = 0;
            pointCounterElement.textContent = '0';
            gameOverElement.style.display = 'none';
            startGameTimer();
            isGameActive = true;
            
            // Reset game scene
            if (game) {
                game.scene.restart();
            }
        }

        function initGame() {
            const config = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                parent: 'game-container',
                backgroundColor: '#0f3460',
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 0 },
                        debug: false
                    }
                },
                scene: {
                    preload: preload,
                    create: create,
                    update: update
                }
            };

            try {
                game = new Phaser.Game(config);
                startGameTimer();
                isGameActive = true;
            } catch (error) {
                console.error('Error initializing game:', error);
                showError('Gagal memuat game. Refresh halaman.');
            }
        }

        function preload() {
            this.load.image('blueTarget', 'https://labs.phaser.io/assets/sprites/orb-blue.png');
            this.load.image('redTarget', 'https://labs.phaser.io/assets/sprites/orb-red.png');
            this.load.image('background', 'https://labs.phaser.io/assets/skies/space4.png');
            this.load.image('particle', 'https://labs.phaser.io/assets/particles/blue.png');
        }

        function create() {
            // Background
            this.add.image(400, 300, 'background').setDisplaySize(800, 600);
            
            // Grup untuk target
            this.blueTargets = this.physics.add.group();
            this.redTargets = this.physics.add.group();
            
            // Partikel efek
            this.particles = this.add.particles('particle');
            this.blueEmitter = this.particles.createEmitter({
                speed: 100,
                scale: { start: 0.5, end: 0 },
                blendMode: 'ADD',
                lifespan: 500,
                on: false
            });
            
            this.redEmitter = this.particles.createEmitter({
                speed: 100,
                scale: { start: 0.5, end: 0 },
                blendMode: 'ADD',
                lifespan: 500,
                on: false
            });
            
            // Event untuk klik target
            this.input.on('gameobjectdown', (pointer, gameObject) => {
                if (!isGameActive) return;
                
                if (gameObject.texture.key === 'blueTarget') {
                    // Kena target biru - tambah poin
                    points++;
                    pointCounterElement.textContent = points;
                    this.blueEmitter.explode(10, gameObject.x, gameObject.y);
                    gameObject.destroy();
                    spawnBlueTarget(this);
                    savePoints();
                } else if (gameObject.texture.key === 'redTarget') {
                    // Kena target merah - kurangi poin
                    points = Math.max(0, points - 2);
                    pointCounterElement.textContent = points;
                    this.redEmitter.explode(10, gameObject.x, gameObject.y);
                    gameObject.destroy();
                    spawnRedTarget(this);
                    savePoints();
                }
            });
            
            // Spawn target awal
            for (let i = 0; i < 5; i++) {
                spawnBlueTarget(this);
            }
            
            // Timer untuk spawn target merah
            this.time.addEvent({
                delay: 5000,
                callback: () => {
                    if (isGameActive) {
                        spawnRedTarget(this);
                    }
                },
                loop: true
            });
            
            // Timer untuk meningkatkan kesulitan
            this.time.addEvent({
                delay: 10000,
                callback: () => {
                    if (isGameActive) {
                        spawnBlueTarget(this);
                    }
                },
                loop: true
            });
        }

        function update() {
            // Animasi target berputar
            this.blueTargets.getChildren().forEach(target => {
                target.rotation += 0.01;
            });
            
            this.redTargets.getChildren().forEach(target => {
                target.rotation += 0.02;
            });
        }

        function spawnBlueTarget(scene) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);
            
            const target = scene.blueTargets.create(x, y, 'blueTarget');
            target.setInteractive();
            target.setScale(0.7);
            
            // Animasi muncul
            scene.tweens.add({
                targets: target,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut'
            });
        }

        function spawnRedTarget(scene) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);
            
            const target = scene.redTargets.create(x, y, 'redTarget');
            target.setInteractive();
            target.setScale(0.7);
            
            // Animasi berdenyut
            scene.tweens.add({
                targets: target,
                scale: 0.9,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        // Event listeners
        window.addEventListener('load', () => {
            initWallet();
        });

        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            showError('Terjadi kesalahan. Silakan refresh halaman.');
        });
    </script>
</body>
</html>
