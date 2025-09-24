// login.js - Handle connection to Solana Wallet

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
        // Check if Phantom wallet is installed
        if (window.solana && window.solana.isPhantom) {
            this.provider = window.solana;
            this.setupEventListeners();
        } else {
            this.connectButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Install Phantom Wallet';
            this.connectButton.disabled = true;
            alert('Please install Phantom Wallet first!');
        }
        
        // Setup event listeners for buttons
        this.connectButton.addEventListener('click', () => this.connectWallet());
        this.disconnectButton.addEventListener('click', () => this.disconnectWallet());
    }
    
    setupEventListeners() {
        // Event listener for wallet connection changes
        this.provider.on('connect', () => {
            console.log('Wallet connected!');
            this.handleConnected();
        });
        
        this.provider.on('disconnect', () => {
            console.log('Wallet disconnected!');
            this.handleDisconnected();
        });
        
        // If wallet is already connected
        if (this.provider.isConnected) {
            this.handleConnected();
        }
    }
    
    async connectWallet() {
        try {
            // Request connection to wallet
            const response = await this.provider.connect();
            this.publicKey = response.publicKey.toString();
            console.log('Connected with public key:', this.publicKey);
        } catch (err) {
            console.error('Error connecting wallet:', err);
            alert('Failed to connect wallet. Please try again.');
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
        
        // Show game section
        this.gameSection.style.display = 'block';
        
        // Get wallet balance
        await this.getWalletBalance();
        
        // Initialize games after wallet is connected
        if (typeof ticTacToeGame !== 'undefined') {
            ticTacToeGame.init();
        }
        if (typeof rpsGame !== 'undefined') {
            rpsGame.init();
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
        
        // Reset game states
        if (typeof ticTacToeGame !== 'undefined') {
            ticTacToeGame.resetGame();
        }
        if (typeof rpsGame !== 'undefined') {
            rpsGame.resetGame();
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
            // Create connection to Solana cluster (use devnet for testing)
            this.connection = new solanaWeb3.Connection(
                solanaWeb3.clusterApiUrl('devnet'),
                'confirmed'
            );
            
            // Get balance
            const publicKey = new solanaWeb3.PublicKey(this.publicKey);
            const balance = await this.connection.getBalance(publicKey);
            const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
            
            this.walletBalance.textContent = solBalance.toFixed(4);
        } catch (err) {
            console.error('Error getting wallet balance:', err);
            this.walletBalance.textContent = 'Error';
        }
    }
    
    // Method to get public key (used by game.js)
    getPublicKey() {
        return this.publicKey;
    }
    
    // Method to check connection status
    getConnectionStatus() {
        return this.isConnected;
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.walletLogin = new SolanaWalletLogin();
});
