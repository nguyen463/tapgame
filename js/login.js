// login.js - Menangani koneksi ke Solana Wallet

class SolanaWalletLogin {
    constructor() {
        this.provider = null;
        this.publicKey = null;
        this.connection = null;
        this.isConnected = false;
        
        this.connectButton = document.getElementById('connectButton');
        this.disconnectButton = document.getElementById('disconnectButton');
        this.walletInfo = document.getElementById('walletInfo');
        this.walletAddress = document.getElementById('walletAddress');
        this.walletBalance = document.getElementById('walletBalance');
        this.loginSection = document.getElementById('loginSection');
        this.gameSection = document.getElementById('gameSection');
        
        this.init();
    }
    
    init() {
        // Cek apakah Phantom wallet terinstall
        if (window.solana && window.solana.isPhantom) {
            this.provider = window.solana;
            this.setupEventListeners();
        } else {
            this.connectButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Install Phantom Wallet';
            this.connectButton.disabled = true;
            alert('Silakan install Phantom Wallet terlebih dahulu!');
        }
        
        // Setup event listeners untuk tombol
        this.connectButton.addEventListener('click', () => this.connectWallet());
        this.disconnectButton.addEventListener('click', () => this.disconnectWallet());
    }
    
    setupEventListeners() {
        // Event listener untuk perubahan koneksi wallet
        this.provider.on('connect', () => {
            console.log('Wallet connected!');
            this.handleConnected();
        });
        
        this.provider.on('disconnect', () => {
            console.log('Wallet disconnected!');
            this.handleDisconnected();
        });
        
        // Jika wallet sudah terhubung sebelumnya
        if (this.provider.isConnected) {
            this.handleConnected();
        }
    }
    
    async connectWallet() {
        try {
            // Meminta koneksi ke wallet
            const response = await this.provider.connect();
            this.publicKey = response.publicKey.toString();
            console.log('Connected with public key:', this.publicKey);
        } catch (err) {
            console.error('Error connecting wallet:', err);
            alert('Gagal menghubungkan wallet. Silakan coba lagi.');
        }
    }
    
    async handleConnected() {
        this.isConnected = true;
        this.publicKey = this.provider.publicKey.toString();
        
        // Update UI
        this.connectButton.style.display = 'none';
        this.disconnectButton.style.display = 'inline-flex';
        this.walletInfo.style.display = 'block';
        this.walletAddress.textContent = this.publicKey;
        
        // Tampilkan section game
        this.gameSection.style.display = 'block';
        
        // Dapatkan saldo wallet
        await this.getWalletBalance();
        
        // Inisialisasi game setelah wallet terhubung
        if (typeof game !== 'undefined') {
            game.init();
        }
    }
    
    handleDisconnected() {
        this.isConnected = false;
        this.publicKey = null;
        
        // Update UI
        this.connectButton.style.display = 'inline-flex';
        this.disconnectButton.style.display = 'none';
        this.walletInfo.style.display = 'none';
        this.gameSection.style.display = 'none';
        
        // Reset game state
        if (typeof game !== 'undefined') {
            game.resetGame();
        }
    }
    
    async disconnectWallet() {
        try {
            await this.provider.disconnect();
        } catch (err) {
            console.error('Error disconnecting wallet:', err);
        }
    }
    
    async getWalletBalance() {
        try {
            // Buat koneksi ke cluster Solana (gunakan devnet untuk testing)
            this.connection = new solanaWeb3.Connection(
                solanaWeb3.clusterApiUrl('devnet'),
                'confirmed'
            );
            
            // Dapatkan saldo
            const publicKey = new solanaWeb3.PublicKey(this.publicKey);
            const balance = await this.connection.getBalance(publicKey);
            const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
            
            this.walletBalance.textContent = solBalance.toFixed(4);
        } catch (err) {
            console.error('Error getting wallet balance:', err);
            this.walletBalance.textContent = 'Error';
        }
    }
    
    // Method untuk mendapatkan public key (digunakan oleh game.js)
    getPublicKey() {
        return this.publicKey;
    }
    
    // Method untuk mengecek status koneksi
    getConnectionStatus() {
        return this.isConnected;
    }
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    window.walletLogin = new SolanaWalletLogin();
});
