<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Game dengan Login Solana</title>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
    <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
    <script src="https://unpkg.com/@solana/wallet-adapter-base@latest/lib/index.iife.js"></script>
    <script src="https://unpkg.com/@solana/wallet-adapter-wallets@latest/lib/index.iife.js"></script>
    <script src="https://unpkg.com/@solana/wallet-adapter-phantom@latest/lib/index.iife.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        #login-container, #game-container {
            text-align: center;
            padding: 20px;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
        }
        button:hover {
            background: #0056b3;
        }
        #wallet-info {
            margin-top: 20px;
            background: #1a1a1a;
            padding: 15px;
            border-radius: 5px;
        }
        #game-container {
            display: none;
        }
        #loading {
            display: none;
            margin: 20px;
        }
        #error-message {
            display: none;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin: 20px;
            max-width: 400px;
        }
    </style>
</head>
<body>
    <div id="login-container">
        <h2>Login dengan Wallet Solana</h2>
        <button id="connect-button">Connect Wallet</button>
        <div id="loading">Memuat wallet...</div>
        <div id="wallet-info" style="display: none;">
            <p>Connected: <span id="wallet-address"></span></p>
            <button id="disconnect-button">Disconnect</button>
        </div>
    </div>

    <div id="game-container"></div>
    
    <div id="error-message"></div>

    <noscript>
        <div style="text-align: center; padding: 50px;">
            <h2>JavaScript Diperlukan</h2>
            <p>Game ini membutuhkan JavaScript untuk berjalan. Mohon aktifkan di browser Anda.</p>
        </div>
    </noscript>

    <script>
        // Variabel global
        let point = 0;
        let pointText;
        let ball;
        let bomb;
        let particles;
        let emitter;
        let bombVisible = false;
        let gameScene;
        let walletAddress = '';
        let wallet;
        let connection;
        let game; // Variabel game dideklarasikan di sini

        // Konfigurasi Solana
        const SOLANA_NETWORK = 'https://api.devnet.solana.com';

        // Element references
        const connectButton = document.getElementById('connect-button');
        const disconnectButton = document.getElementById('disconnect-button');
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error-message');

        function showError(message) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        function hideError() {
            errorElement.style.display = 'none';
        }

        function showLoading() {
            loadingElement.style.display = 'block';
        }

        function hideLoading() {
            loadingElement.style.display = 'none';
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
                    document.getElementById('wallet-address').textContent = walletAddress;
                    document.getElementById('wallet-info').style.display = 'block';
                    document.getElementById('login-container').style.display = 'none';
                    document.getElementById('game-container').style.display = 'block';
                    hideLoading();
                    hideError();
                    
                    // Inisialisasi game setelah wallet terhubung
                    initGame();
                });
                
                wallet.on('disconnect', () => {
                    console.log('Disconnected from wallet');
                    walletAddress = '';
                    document.getElementById('wallet-info').style.display = 'none';
                    document.getElementById('login-container').style.display = 'block';
                    document.getElementById('game-container').style.display = 'none';
                    hideLoading();
                    
                    // Hentikan game jika sedang berjalan
                    if (game) {
                        game.destroy(true);
                    }
                });

                // Event listeners untuk tombol
                connectButton.addEventListener('click', connectWallet);
                disconnectButton.addEventListener('click', disconnectWallet);

            } catch (error) {
                console.error('Error initializing wallet:', error);
                showError('Gagal memuat wallet adapter. Pastikan koneksi internet stabil.');
            }
        }

        // Connect wallet
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
                showError('Error connecting wallet. Pastikan Phantom wallet terinstall.');
            }
        }

        // Disconnect wallet
        async function disconnectWallet() {
            try {
                await wallet.disconnect();
            } catch (error) {
                console.error('Error disconnecting wallet:', error);
                showError('Error disconnecting wallet.');
            }
        }

        // Simpan point (simulasi - untuk production perlu smart contract)
        async function savePointToBlockchain() {
            if (!wallet.connected || !walletAddress) return false;
            
            try {
                localStorage.setItem(`point_${walletAddress}`, point.toString());
                console.log('Point saved locally for wallet:', walletAddress);
                return true;
            } catch (error) {
                console.error('Error saving point:', error);
                return false;
            }
        }

        // Load point
        async function loadPointFromBlockchain() {
            if (!walletAddress) return 0;
            
            try {
                const savedPoint = localStorage.getItem(`point_${walletAddress}`);
                if (savedPoint) {
                    point = parseInt(savedPoint);
                    return point;
                }
                return 0;
            } catch (error) {
                console.error('Error loading point:', error);
                return 0;
            }
        }

        // Inisialisasi game Phaser
        function initGame() {
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

            try {
                game = new Phaser.Game(config);
            } catch (error) {
                console.error('Error initializing game:', error);
                showError('Gagal memuat game. Refresh halaman.');
            }
        }

        function preload() {
            this.load.image("background", "https://labs.phaser.io/assets/skies/space4.png");
            this.load.image("ball", "https://labs.phaser.io/assets/sprites/mushroom2.png");
            this.load.image("bomb", "https://labs.phaser.io/assets/sprites/bomb.png");
            this.load.image("sparkle", "https://labs.phaser.io/assets/particles/blue.png");
        }

        function create() {
            gameScene = this;

            // Background
            this.add.image(0, 0, "background").setOrigin(0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

            // Sistem partikel
            particles = this.add.particles("sparkle");
            
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

            const ballSize = this.sys.game.config.width / 6;

            // Bola
            ball = this.add.sprite(
                this.sys.game.config.width / 2,
                this.sys.game.config.height / 2,
                "ball"
            ).setInteractive();
            ball.setDisplaySize(ballSize, ballSize);

            // Bom
            const bombSize = this.sys.game.config.width / 8;
            bomb = this.add.sprite(
                this.sys.game.config.width / 2,
                this.sys.game.config.height / 2,
                "bomb"
            ).setInteractive();
            bomb.setDisplaySize(bombSize, bombSize);
            bomb.setVisible(false);
            bombVisible = false;

            // Teks point
            pointText = this.add.text(10, 10, `Point: ${point}`, {
                fontSize: "24px",
                fill: "#fff",
                fontStyle: "bold"
            });

            // Event handlers
            ball.on("pointerdown", handleBallClick);
            bomb.on("pointerdown", handleBombClick);

            this.time.delayedCall(5000, showBomb);
        }

        async function handleBallClick() {
            point++;
            pointText.setText(`Point: ${point}`);
            await savePointToBlockchain();

            const ballSize = ball.displayWidth;
            const newX = Phaser.Math.Between(ballSize, this.sys.game.config.width - ballSize);
            const newY = Phaser.Math.Between(ballSize, this.sys.game.config.height - ballSize);

            this.tweens.add({
                targets: ball,
                x: newX,
                y: newY,
                duration: 150,
                ease: "Power1",
            });

            if (point > 0 && point % 10 === 0) {
                emitter.explode(50, ball.x, ball.y);
            }
        }

        async function handleBombClick() {
            point = Math.max(0, point - 5);
            pointText.setText(`Point: ${point}`);
            await savePointToBlockchain();
            
            bomb.setVisible(false);
            bombVisible = false;
            this.time.delayedCall(Phaser.Math.Between(3000, 8000), showBomb);
        }

        function showBomb() {
            if (!bombVisible && gameScene) {
                const bombSize = bomb.displayWidth;
                const newX = Phaser.Math.Between(bombSize, gameScene.sys.game.config.width - bombSize);
                const newY = Phaser.Math.Between(bombSize, gameScene.sys.game.config.height - bombSize);
                
                bomb.setPosition(newX, newY);
                bomb.setVisible(true);
                bombVisible = true;
                
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

        // Inisialisasi ketika halaman dimuat
        window.addEventListener('load', () => {
            initWallet();
        });

        // Error handling global
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            showError('Terjadi kesalahan. Silakan refresh halaman.');
        });
    </script>
</body>
</html>
