// game.js - Logika game Tic-Tac-Toe

class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameState = 'ongoing'; // ongoing, win, draw
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };
        
        // Element references
        this.gameBoard = document.getElementById('gameBoard');
        this.gameStatus = document.getElementById('gameStatus');
        this.currentPlayerSpan = document.getElementById('currentPlayer');
        this.scoreX = document.getElementById('scoreX');
        this.scoreO = document.getElementById('scoreO');
        this.scoreDraw = document.getElementById('scoreDraw');
        this.resetButton = document.getElementById('resetGame');
        this.playerX = document.getElementById('playerX');
        this.playerO = document.getElementById('playerO');
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Baris
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Kolom
            [0, 4, 8], [2, 4, 6]             // Diagonal
        ];
        
        this.init();
    }
    
    init() {
        // Setup nama pemain berdasarkan wallet
        if (window.walletLogin && window.walletLogin.getConnectionStatus()) {
            const publicKey = window.walletLogin.getPublicKey();
            const shortAddress = publicKey.substring(0, 6) + '...' + publicKey.substring(publicKey.length - 4);
            this.playerX.textContent = shortAddress;
        }
        
        // Buat papan game
        this.createBoard();
        
        // Event listener untuk tombol reset
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        // Update skor
        this.updateScoreboard();
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', () => this.handleCellClick(i));
            this.gameBoard.appendChild(cell);
        }
        
        this.updateBoard();
    }
    
    handleCellClick(index) {
        // Cek apakah game masih aktif dan cell kosong
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }
        
        // Hanya biarkan player X (manusia) melakukan gerakan
        if (this.currentPlayer !== 'X') {
            return;
        }
        
        // Lakukan gerakan
        this.makeMove(index, this.currentPlayer);
        
        // Cek status game setelah gerakan manusia
        this.checkGameStatus();
        
        // Jika game masih berlangsung, biarkan komputer (O) bergerak
        if (this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.computerMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateBoard();
        
        // Ganti pemain
        this.currentPlayer = player === 'X' ? 'O' : 'X';
        this.currentPlayerSpan.textContent = this.currentPlayer;
    }
    
    computerMove() {
        if (!this.gameActive) return;
        
        // AI sederhana: coba menang, blokir, atau gerakan acak
        let moveIndex = this.findWinningMove('O'); // Coba menang
        
        if (moveIndex === -1) {
            moveIndex = this.findWinningMove('X'); // Blokir pemain
        }
        
        if (moveIndex === -1) {
            moveIndex = this.findRandomMove(); // Gerakan acak
        }
        
        if (moveIndex !== -1) {
            this.makeMove(moveIndex, 'O');
            this.checkGameStatus();
        }
    }
    
    findWinningMove(player) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            const board = this.board;
            
            // Jika dua cell sudah diisi player dan satu kosong
            if ((board[a] === player && board[b] === player && board[c] === '') ||
                (board[a] === player && board[c] === player && board[b] === '') ||
                (board[b] === player && board[c] === player && board[a] === '')) {
                
                // Kembalikan index cell yang kosong
                if (board[a] === '') return a;
                if (board[b] === '') return b;
                if (board[c] === '') return c;
            }
        }
        
        return -1; // Tidak ada gerakan menang
    }
    
    findRandomMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        if (emptyCells.length === 0) return -1;
        
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        return emptyCells[randomIndex];
    }
    
    checkGameStatus() {
        let roundWon = false;
        let winner = null;
        
        // Cek kondisi menang
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            
            if (this.board[a] !== '' && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                roundWon = true;
                winner = this.board[a];
                break;
            }
        }
        
        if (roundWon) {
            this.gameActive = false;
            this.gameState = 'win';
            this.scores[winner]++;
            this.updateScoreboard();
            
            this.gameStatus.innerHTML = `Pemenang: <span class="winner">Player ${winner}</span>`;
            this.highlightWinningCells(winner);
            return;
        }
        
        // Cek seri
        if (!this.board.includes('')) {
            this.gameActive = false;
            this.gameState = 'draw';
            this.scores.draw++;
            this.updateScoreboard();
            
            this.gameStatus.innerHTML = `<span class="winner">Permainan Seri!</span>`;
            return;
        }
        
        // Game masih berlangsung
        this.gameStatus.innerHTML = `Giliran: <span id="currentPlayer">${this.currentPlayer}</span>`;
    }
    
    highlightWinningCells(winner) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            
            if (this.board[a] !== '' && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                
                // Highlight sel-sel pemenang
                const cells = this.gameBoard.children;
                cells[a].style.background = 'rgba(76, 209, 55, 0.3)';
                cells[b].style.background = 'rgba(76, 209, 55, 0.3)';
                cells[c].style.background = 'rgba(76, 209, 55, 0.3)';
                break;
            }
        }
    }
    
    updateBoard() {
        const cells = this.gameBoard.children;
        
        for (let i = 0; i < cells.length; i++) {
            cells[i].textContent = this.board[i];
            cells[i].className = 'cell';
            
            if (this.board[i] === 'X') {
                cells[i].classList.add('x');
            } else if (this.board[i] === 'O') {
                cells[i].classList.add('o');
            }
        }
    }
    
    updateScoreboard() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
        this.scoreDraw.textContent = this.scores.draw;
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameState = 'ongoing';
        
        this.currentPlayerSpan.textContent = this.currentPlayer;
        this.gameStatus.innerHTML = `Giliran: <span id="currentPlayer">${this.currentPlayer}</span>`;
        
        this.createBoard();
    }
}

// Inisialisasi game saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    window.game = new TicTacToeGame();
});
