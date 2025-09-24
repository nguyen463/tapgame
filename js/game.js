// game.js - Game logic

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
        this.gameBoard = document.getElementById('ticTacToeBoard');
        this.gameStatus = document.getElementById('gameStatus');
        this.currentPlayerSpan = document.getElementById('currentPlayer');
        this.scoreX = document.getElementById('scoreX');
        this.scoreO = document.getElementById('scoreO');
        this.scoreDraw = document.getElementById('scoreDraw');
        this.resetButton = document.getElementById('resetTicTacToe');
        this.playerX = document.getElementById('playerX');
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
    }
    
    init() {
        // Setup player name based on wallet
        if (window.walletLogin && window.walletLogin.getConnectionStatus()) {
            const publicKey = window.walletLogin.getPublicKey();
            const shortAddress = publicKey.substring(0, 6) + '...' + publicKey.substring(publicKey.length - 4);
            this.playerX.textContent = shortAddress;
        }
        
        // Create game board
        this.createBoard();
        
        // Event listener for reset button
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        // Update score
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
        // Check if game is active and cell is empty
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }
        
        // Only allow player X (human) to make moves
        if (this.currentPlayer !== 'X') {
            return;
        }
        
        // Make move
        this.makeMove(index, this.currentPlayer);
        
        // Check game status after human move
        this.checkGameStatus();
        
        // If game is still active, let computer (O) move
        if (this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.computerMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateBoard();
        
        // Switch players
        this.currentPlayer = player === 'X' ? 'O' : 'X';
        this.currentPlayerSpan.textContent = this.currentPlayer;
    }
    
    computerMove() {
        if (!this.gameActive) return;
        
        // Simple AI: try to win, block, or make random move
        let moveIndex = this.findWinningMove('O'); // Try to win
        
        if (moveIndex === -1) {
            moveIndex = this.findWinningMove('X'); // Block player
        }
        
        if (moveIndex === -1) {
            moveIndex = this.findRandomMove(); // Random move
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
            
            // If two cells are filled by player and one is empty
            if ((board[a] === player && board[b] === player && board[c] === '') ||
                (board[a] === player && board[c] === player && board[b] === '') ||
                (board[b] === player && board[c] === player && board[a] === '')) {
                
                // Return the index of the empty cell
                if (board[a] === '') return a;
                if (board[b] === '') return b;
                if (board[c] === '') return c;
            }
        }
        
        return -1; // No winning move found
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
        
        // Check win conditions
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
            
            this.gameStatus.innerHTML = `Winner: <span class="winner">Player ${winner}</span>`;
            this.highlightWinningCells(winner);
            return;
        }
        
        // Check for draw
        if (!this.board.includes('')) {
            this.gameActive = false;
            this.gameState = 'draw';
            this.scores.draw++;
            this.updateScoreboard();
            
            this.gameStatus.innerHTML = `<span class="winner">Game Draw!</span>`;
            return;
        }
        
        // Game still ongoing
        this.gameStatus.innerHTML = `Turn: <span id="currentPlayer">${this.currentPlayer}</span>`;
    }
    
    highlightWinningCells(winner) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            
            if (this.board[a] !== '' && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                
                // Highlight winning cells
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
        this.gameStatus.innerHTML = `Turn: <span id="currentPlayer">${this.currentPlayer}</span>`;
        
        this.createBoard();
    }
}

class RockPaperScissorsGame {
    constructor() {
        this.choices = ['rock', 'paper', 'scissors'];
        this.playerChoice = null;
        this.computerChoice = null;
        this.result = null;
        this.scores = {
            wins: 0,
            losses: 0,
            ties: 0
        };
        
        // Element references
        this.rpsStatus = document.getElementById('rpsStatus');
        this.playerChoiceIcon = document.getElementById('playerChoice');
        this.computerChoiceIcon = document.getElementById('computerChoice');
        this.rpsWins = document.getElementById('rpsWins');
        this.rpsLosses = document.getElementById('rpsLosses');
        this.rpsTies = document.getElementById('rpsTies');
        this.resetButton = document.getElementById('resetRPS');
        this.choiceElements = document.querySelectorAll('.rps-choice');
    }
    
    init() {
        // Setup event listeners
        this.choiceElements.forEach(choice => {
            choice.addEventListener('click', (e) => {
                if (this.playerChoice) return; // Prevent changing choice after selection
                
                this.playerChoice = e.currentTarget.getAttribute('data-choice');
                this.playGame();
            });
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        this.updateScoreboard();
    }
    
    playGame() {
        // Highlight player's choice
        this.choiceElements.forEach(choice => {
            choice.classList.remove('selected');
            if (choice.getAttribute('data-choice') === this.playerChoice) {
                choice.classList.add('selected');
            }
        });
        
        // Computer makes random choice
        this.computerChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
        
        // Determine winner
        this.determineWinner();
        
        // Update UI
        this.updateChoices();
        this.updateStatus();
        this.updateScoreboard();
    }
    
    determineWinner() {
        if (this.playerChoice === this.computerChoice) {
            this.result = 'tie';
            this.scores.ties++;
        } else if (
            (this.playerChoice === 'rock' && this.computerChoice === 'scissors') ||
            (this.playerChoice === 'paper' && this.computerChoice === 'rock') ||
            (this.playerChoice === 'scissors' && this.computerChoice === 'paper')
        ) {
            this.result = 'win';
            this.scores.wins++;
        } else {
            this.result = 'lose';
            this.scores.losses++;
        }
    }
    
    updateChoices() {
        // Update player choice icon
        switch (this.playerChoice) {
            case 'rock':
                this.playerChoiceIcon.innerHTML = '<i class="fas fa-hand-rock"></i>';
                break;
            case 'paper':
                this.playerChoiceIcon.innerHTML = '<i class="fas fa-hand-paper"></i>';
                break;
            case 'scissors':
                this.playerChoiceIcon.innerHTML = '<i class="fas fa-hand-scissors"></i>';
                break;
        }
        
        // Update computer choice icon
        switch (this.computerChoice) {
            case 'rock':
                this.computerChoiceIcon.innerHTML = '<i class="fas fa-hand-rock"></i>';
                break;
            case 'paper':
                this.computerChoiceIcon.innerHTML = '<i class="fas fa-hand-paper"></i>';
                break;
            case 'scissors':
                this.computerChoiceIcon.innerHTML = '<i class="fas fa-hand-scissors"></i>';
                break;
        }
    }
    
    updateStatus() {
        switch (this.result) {
            case 'win':
                this.rpsStatus.innerHTML = `<span class="winner">You Win!</span>`;
                break;
            case 'lose':
                this.rpsStatus.innerHTML = `<span style="color: #ff4b2b;">You Lose!</span>`;
                break;
            case 'tie':
                this.rpsStatus.innerHTML = `<span style="color: #ffcc00;">It's a Tie!</span>`;
                break;
        }
    }
    
    updateScoreboard() {
        this.rpsWins.textContent = this.scores.wins;
        this.rpsLosses.textContent = this.scores.losses;
        this.rpsTies.textContent = this.scores.ties;
    }
    
    resetGame() {
        this.playerChoice = null;
        this.computerChoice = null;
        this.result = null;
        
        // Reset UI
        this.rpsStatus.textContent = 'Make your choice!';
        this.playerChoiceIcon.textContent = '-';
        this.computerChoiceIcon.textContent = '-';
        
        // Remove selection highlights
        this.choiceElements.forEach(choice => {
            choice.classList.remove('selected');
        });
    }
}

// Game selection logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize games
    window.ticTacToeGame = new TicTacToeGame();
    window.rpsGame = new RockPaperScissorsGame();
    
    // Game selection buttons
    const ticTacToeBtn = document.getElementById('ticTacToeBtn');
    const rpsBtn = document.getElementById('rpsBtn');
    const ticTacToeGameElement = document.getElementById('ticTacToeGame');
    const rpsGameElement = document.getElementById('rpsGame');
    
    ticTacToeBtn.addEventListener('click', () => {
        ticTacToeGameElement.style.display = 'block';
        rpsGameElement.style.display = 'none';
        
        // Reset RPS game when switching
        rpsGame.resetGame();
    });
    
    rpsBtn.addEventListener('click', () => {
        ticTacToeGameElement.style.display = 'none';
        rpsGameElement.style.display = 'block';
        
        // Reset Tic-Tac-Toe game when switching
        ticTacToeGame.resetGame();
    });
});
