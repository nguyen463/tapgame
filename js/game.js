// game.js - Game logic for 12 different games

class GameManager {
    constructor() {
        this.games = {};
        this.currentGame = null;
        
        this.init();
    }
    
    init() {
        // Initialize all games
        this.games.ticTacToe = new TicTacToeGame();
        this.games.rps = new RockPaperScissorsGame();
        this.games.memory = new MemoryGame();
        this.games.snake = new SnakeGame();
        this.games.hangman = new HangmanGame();
        this.games.dice = new DiceGame();
        this.games.guesser = new NumberGuesserGame();
        this.games.trivia = new TriviaGame();
        this.games.reaction = new ReactionTestGame();
        this.games.scramble = new WordScrambleGame();
        this.games.color = new ColorMatchGame();
        this.games.math = new MathChallengeGame();
        
        this.setupGameSelection();
    }
    
    initAllGames() {
        // Initialize each game
        for (const gameName in this.games) {
            if (this.games[gameName].init) {
                this.games[gameName].init();
            }
        }
        
        // Setup player name based on wallet
        if (window.walletLogin && window.walletLogin.getConnectionStatus()) {
            const publicKey = window.walletLogin.getPublicKey();
            const shortAddress = publicKey.substring(0, 6) + '...' + publicKey.substring(publicKey.length - 4);
            
            // Update player name in games that display it
            if (this.games.ticTacToe.playerX) {
                this.games.ticTacToe.playerX.textContent = shortAddress;
            }
        }
    }
    
    resetAllGames() {
        // Reset each game
        for (const gameName in this.games) {
            if (this.games[gameName].resetGame) {
                this.games[gameName].resetGame();
            }
        }
    }
    
    setupGameSelection() {
        // Game selection buttons
        const gameButtons = {
            'ticTacToeBtn': 'ticTacToeGame',
            'rpsBtn': 'rpsGame',
            'memoryBtn': 'memoryGame',
            'snakeBtn': 'snakeGame',
            'hangmanBtn': 'hangmanGame',
            'diceBtn': 'diceGame',
            'guesserBtn': 'guesserGame',
            'triviaBtn': 'triviaGame',
            'reactionBtn': 'reactionGame',
            'scrambleBtn': 'scrambleGame',
            'colorBtn': 'colorGame',
            'mathBtn': 'mathGame'
        };
        
        // Add event listeners to game buttons
        for (const btnId in gameButtons) {
            const button = document.getElementById(btnId);
            const gameId = gameButtons[btnId];
            
            if (button) {
                button.addEventListener('click', () => {
                    this.showGame(gameId);
                });
            }
        }
    }
    
    showGame(gameId) {
        // Hide all game contents
        const gameContents = document.querySelectorAll('.game-content');
        gameContents.forEach(content => {
            content.style.display = 'none';
        });
        
        // Show selected game
        const selectedGame = document.getElementById(gameId);
        if (selectedGame) {
            selectedGame.style.display = 'block';
            this.currentGame = gameId.replace('Game', '');
            
            // Reset the game when switching to it
            if (this.games[this.currentGame] && this.games[this.currentGame].resetGame) {
                this.games[this.currentGame].resetGame();
            }
        }
    }
}

// Tic-Tac-Toe Game
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0, draw: 0 };
        
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
        this.createBoard();
        this.resetButton.addEventListener('click', () => this.resetGame());
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
        if (!this.gameActive || this.board[index] !== '' || this.currentPlayer !== 'X') return;
        
        this.makeMove(index, this.currentPlayer);
        this.checkGameStatus();
        
        if (this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.computerMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateBoard();
        this.currentPlayer = player === 'X' ? 'O' : 'X';
        this.currentPlayerSpan.textContent = this.currentPlayer;
    }
    
    computerMove() {
        if (!this.gameActive) return;
        
        let moveIndex = this.findWinningMove('O');
        if (moveIndex === -1) moveIndex = this.findWinningMove('X');
        if (moveIndex === -1) moveIndex = this.findRandomMove();
        
        if (moveIndex !== -1) {
            this.makeMove(moveIndex, 'O');
            this.checkGameStatus();
        }
    }
    
    findWinningMove(player) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            const board = this.board;
            
            if ((board[a] === player && board[b] === player && board[c] === '') ||
                (board[a] === player && board[c] === player && board[b] === '') ||
                (board[b] === player && board[c] === player && board[a] === '')) {
                
                if (board[a] === '') return a;
                if (board[b] === '') return b;
                if (board[c] === '') return c;
            }
        }
        return -1;
    }
    
    findRandomMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        if (emptyCells.length === 0) return -1;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    
    checkGameStatus() {
        let roundWon = false;
        let winner = null;
        
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
            this.scores[winner]++;
            this.updateScoreboard();
            this.gameStatus.innerHTML = `Winner: <span class="winner">Player ${winner}</span>`;
            this.highlightWinningCells(winner);
            return;
        }
        
        if (!this.board.includes('')) {
            this.gameActive = false;
            this.scores.draw++;
            this.updateScoreboard();
            this.gameStatus.innerHTML = `<span class="winner">Game Draw!</span>`;
            return;
        }
        
        this.gameStatus.innerHTML = `Turn: <span id="currentPlayer">${this.currentPlayer}</span>`;
    }
    
    highlightWinningCells(winner) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            
            if (this.board[a] !== '' && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                
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
            
            if (this.board[i] === 'X') cells[i].classList.add('x');
            else if (this.board[i] === 'O') cells[i].classList.add('o');
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
        this.currentPlayerSpan.textContent = this.currentPlayer;
        this.gameStatus.innerHTML = `Turn: <span id="currentPlayer">${this.currentPlayer}</span>`;
        this.createBoard();
    }
}

// Rock-Paper-Scissors Game
class RockPaperScissorsGame {
    constructor() {
        this.choices = ['rock', 'paper', 'scissors'];
        this.playerChoice = null;
        this.computerChoice = null;
        this.result = null;
        this.scores = { wins: 0, losses: 0, ties: 0 };
        
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
        this.choiceElements.forEach(choice => {
            choice.addEventListener('click', (e) => {
                if (this.playerChoice) return;
                this.playerChoice = e.currentTarget.getAttribute('data-choice');
                this.playGame();
            });
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.updateScoreboard();
    }
    
    playGame() {
        this.choiceElements.forEach(choice => {
            choice.classList.remove('selected');
            if (choice.getAttribute('data-choice') === this.playerChoice) {
                choice.classList.add('selected');
            }
        });
        
        this.computerChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
        this.determineWinner();
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
        const icons = {
            rock: '<i class="fas fa-hand-rock"></i>',
            paper: '<i class="fas fa-hand-paper"></i>',
            scissors: '<i class="fas fa-hand-scissors"></i>'
        };
        
        this.playerChoiceIcon.innerHTML = icons[this.playerChoice];
        this.computerChoiceIcon.innerHTML = icons[this.computerChoice];
    }
    
    updateStatus() {
        const statusMap = {
            win: `<span class="winner">You Win!</span>`,
            lose: `<span style="color: #ff4b2b;">You Lose!</span>`,
            tie: `<span style="color: #ffcc00;">It's a Tie!</span>`
        };
        
        this.rpsStatus.innerHTML = statusMap[this.result];
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
        this.rpsStatus.textContent = 'Make your choice!';
        this.playerChoiceIcon.textContent = '-';
        this.computerChoiceIcon.textContent = '-';
        this.choiceElements.forEach(choice => choice.classList.remove('selected'));
    }
}

// Memory Game
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gamesPlayed = 0;
        this.bestScore = Infinity;
        
        // Element references
        this.memoryBoard = document.getElementById('memoryBoard');
        this.memoryStatus = document.getElementById('memoryStatus');
        this.pairsFound = document.getElementById('pairsFound');
        this.memoryMoves = document.getElementById('memoryMoves');
        this.memoryGames = document.getElementById('memoryGames');
        this.memoryBest = document.getElementById('memoryBest');
        this.resetButton = document.getElementById('resetMemory');
    }
    
    init() {
        this.createBoard();
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.updateStats();
    }
    
    createBoard() {
        this.memoryBoard.innerHTML = '';
        this.cards = this.generateCards();
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.textContent = '?';
            cardElement.setAttribute('data-index', index);
            cardElement.addEventListener('click', () => this.flipCard(index));
            this.memoryBoard.appendChild(cardElement);
        });
    }
    
    generateCards() {
        const symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        let cards = [...symbols, ...symbols];
        
        // Shuffle the cards
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        
        return cards;
    }
    
    flipCard(index) {
        const cardElement = this.memoryBoard.children[index];
        
        // Don't allow flipping if already flipped or matched
        if (cardElement.classList.contains('flipped') || 
            cardElement.classList.contains('matched') ||
            this.flippedCards.length >= 2) {
            return;
        }
        
        // Flip the card
        cardElement.classList.add('flipped');
        cardElement.textContent = this.cards[index];
        this.flippedCards.push({ index, value: this.cards[index] });
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.memoryMoves.textContent = this.moves;
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.value === card2.value) {
            // Match found
            this.memoryBoard.children[card1.index].classList.add('matched');
            this.memoryBoard.children[card2.index].classList.add('matched');
            this.matchedPairs++;
            this.pairsFound.textContent = this.matchedPairs;
            
            if (this.matchedPairs === 8) {
                this.memoryStatus.innerHTML = `<span class="winner">You Win! Completed in ${this.moves} moves</span>`;
                this.gamesPlayed++;
                this.memoryGames.textContent = this.gamesPlayed;
                
                if (this.moves < this.bestScore) {
                    this.bestScore = this.moves;
                    this.memoryBest.textContent = this.bestScore;
                }
            }
        } else {
            // No match, flip cards back
            this.memoryBoard.children[card1.index].classList.remove('flipped');
            this.memoryBoard.children[card2.index].classList.remove('flipped');
            this.memoryBoard.children[card1.index].textContent = '?';
            this.memoryBoard.children[card2.index].textContent = '?';
        }
        
        this.flippedCards = [];
    }
    
    updateStats() {
        this.pairsFound.textContent = this.matchedPairs;
        this.memoryMoves.textContent = this.moves;
        this.memoryGames.textContent = this.gamesPlayed;
        this.memoryBest.textContent = this.bestScore === Infinity ? 0 : this.bestScore;
    }
    
    resetGame() {
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.createBoard();
        this.updateStats();
        this.memoryStatus.textContent = 'Find all matching pairs!';
    }
}

// Snake Game
class SnakeGame {
    constructor() {
        this.boardSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.gameInterval = null;
        this.score = 0;
        this.highScore = 0;
        this.gamesPlayed = 0;
        this.gameActive = false;
        
        // Element references
        this.snakeBoard = document.getElementById('snakeBoard');
        this.snakeStatus = document.getElementById('snakeStatus');
        this.snakeScore = document.getElementById('snakeScore');
        this.snakeLength = document.getElementById('snakeLength');
        this.snakeHighScore = document.getElementById('snakeHighScore');
        this.snakeGames = document.getElementById('snakeGames');
        this.resetButton = document.getElementById('resetSnake');
        
        // Control buttons
        this.upButton = document.getElementById('snakeUp');
        this.downButton = document.getElementById('snakeDown');
        this.leftButton = document.getElementById('snakeLeft');
        this.rightButton = document.getElementById('snakeRight');
    }
    
    init() {
        this.createBoard();
        this.setupControls();
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.updateStats();
    }
    
    createBoard() {
        this.snakeBoard.innerHTML = '';
        this.snakeBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const cell = document.createElement('div');
                cell.classList.add('snake-cell');
                cell.setAttribute('data-x', x);
                cell.setAttribute('data-y', y);
                this.snakeBoard.appendChild(cell);
            }
        }
        
        this.updateBoard();
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;
            
            switch(e.key) {
                case 'ArrowUp': if (this.direction !== 'down') this.direction = 'up'; break;
                case 'ArrowDown': if (this.direction !== 'up') this.direction = 'down'; break;
                case 'ArrowLeft': if (this.direction !== 'right') this.direction = 'left'; break;
                case 'ArrowRight': if (this.direction !== 'left') this.direction = 'right'; break;
            }
        });
        
        // Button controls
        this.upButton.addEventListener('click', () => { if (this.direction !== 'down') this.direction = 'up'; });
        this.downButton.addEventListener('click', () => { if (this.direction !== 'up') this.direction = 'down'; });
        this.leftButton.addEventListener('click', () => { if (this.direction !== 'right') this.direction = 'left'; });
        this.rightButton.addEventListener('click', () => { if (this.direction !== 'left') this.direction = 'right'; });
    }
    
    startGame() {
        if (this.gameInterval) clearInterval(this.gameInterval);
        
        this.gameActive = true;
        this.gameInterval = setInterval(() => {
            this.moveSnake();
        }, 150);
    }
    
    moveSnake() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check for collisions with walls
        if (head.x < 0 || head.x >= this.boardSize || head.y < 0 || head.y >= this.boardSize) {
            this.gameOver();
            return;
        }
        
        // Check for collisions with self
        for (let segment of this.snake) {
            if (segment.x === head.x && segment.y === head.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.updateBoard();
        this.updateStats();
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.boardSize),
                y: Math.floor(Math.random() * this.boardSize)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    updateBoard() {
        // Clear the board
        const cells = this.snakeBoard.querySelectorAll('.snake-cell');
        cells.forEach(cell => {
            cell.classList.remove('snake', 'food');
        });
        
        // Draw snake
        this.snake.forEach(segment => {
            const cell = this.snakeBoard.querySelector(`[data-x="${segment.x}"][data-y="${segment.y}"]`);
            if (cell) cell.classList.add('snake');
        });
        
        // Draw food
        const foodCell = this.snakeBoard.querySelector(`[data-x="${this.food.x}"][data-y="${this.food.y}"]`);
        if (foodCell) foodCell.classList.add('food');
    }
    
    updateStats() {
        this.snakeScore.textContent = this.score;
        this.snakeLength.textContent = this.snake.length;
        this.snakeHighScore.textContent = this.highScore;
        this.snakeGames.textContent = this.gamesPlayed;
    }
    
    gameOver() {
        this.gameActive = false;
        clearInterval(this.gameInterval);
        this.snakeStatus.innerHTML = `<span style="color: #ff4b2b;">Game Over! Score: ${this.score}</span>`;
        this.gamesPlayed++;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        
        this.updateStats();
    }
    
    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameActive = false;
        
        if (this.gameInterval) clearInterval(this.gameInterval);
        
        this.updateBoard();
        this.updateStats();
        this.snakeStatus.textContent = 'Use arrow keys to control the snake!';
        
        // Auto-start the game after a short delay
        setTimeout(() => this.startGame(), 500);
    }
}

// Hangman Game
class HangmanGame {
    constructor() {
        this.words = {
            animals: ['ELEPHANT', 'GIRAFFE', 'KANGAROO', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY', 'CROCODILE', 'HIPPOPOTAMUS'],
            countries: ['CANADA', 'BRAZIL', 'AUSTRALIA', 'JAPAN', 'GERMANY', 'ITALY', 'EGYPT', 'ARGENTINA'],
            fruits: ['BANANA', 'WATERMELON', 'PINEAPPLE', 'STRAWBERRY', 'BLUEBERRY', 'RASPBERRY', 'POMEGRANATE', 'AVOCADO']
        };
        
        this.currentWord = '';
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 6;
        this.wins = 0;
        this.losses = 0;
        this.currentCategory = 'animals';
        
        // Element references
        this.hangmanWord = document.getElementById('hangmanWord');
        this.hangmanLetters = document.getElementById('hangmanLetters');
        this.hangmanFigure = document.getElementById('hangmanFigure');
        this.hangmanStatus = document.getElementById('hangmanStatus');
        this.hangmanGuesses = document.getElementById('hangmanGuesses');
        this.hangmanCategory = document.getElementById('hangmanCategory');
        this.hangmanWins = document.getElementById('hangmanWins');
        this.hangmanLosses = document.getElementById('hangmanLosses');
        this.resetButton = document.getElementById('resetHangman');
    }
    
    init() {
        this.setupLetters();
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.newWord();
        this.updateStats();
    }
    
    setupLetters() {
        this.hangmanLetters.innerHTML = '';
        
        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            const letterElement = document.createElement('div');
            letterElement.classList.add('hangman-letter');
            letterElement.textContent = letter;
            letterElement.addEventListener('click', () => this.guessLetter(letter));
            this.hangmanLetters.appendChild(letterElement);
        }
    }
    
    newWord() {
        const categoryWords = this.words[this.currentCategory];
        this.currentWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.updateWordDisplay();
        this.updateFigure();
        this.updateStats();
        this.hangmanStatus.textContent = 'Guess the word before the hangman is complete!';
    }
    
    guessLetter(letter) {
        if (this.guessedLetters.includes(letter) || this.isGameOver()) return;
        
        this.guessedLetters.push(letter);
        const letterElement = Array.from(this.hangmanLetters.children).find(el => el.textContent === letter);
        if (letterElement) letterElement.classList.add('used');
        
        if (!this.currentWord.includes(letter)) {
            this.wrongGuesses++;
            this.updateFigure();
        }
        
        this.updateWordDisplay();
        this.checkGameStatus();
        this.updateStats();
    }
    
    updateWordDisplay() {
        let display = '';
        
        for (let letter of this.currentWord) {
            if (this.guessedLetters.includes(letter)) {
                display += letter + ' ';
            } else {
                display += '_ ';
            }
        }
        
        this.hangmanWord.textContent = display.trim();
    }
    
    updateFigure() {
        const figures = [
            `-----\n|   |\n|   \n|   \n|   \n|`,
            `-----\n|   |\n|   O\n|   \n|   \n|`,
            `-----\n|   |\n|   O\n|   |\n|   \n|`,
            `-----\n|   |\n|   O\n|  /|\n|   \n|`,
            `-----\n|   |\n|   O\n|  /|\\\n|   \n|`,
            `-----\n|   |\n|   O\n|  /|\\\n|  / \n|`,
            `-----\n|   |\n|   O\n|  /|\\\n|  / \\\n|`
        ];
        
        this.hangmanFigure.textContent = figures[this.wrongGuesses];
    }
    
    checkGameStatus() {
        if (this.isWordGuessed()) {
            this.hangmanStatus.innerHTML = `<span class="winner">You Win! The word was ${this.currentWord}</span>`;
            this.wins++;
        } else if (this.wrongGuesses >= this.maxWrongGuesses) {
            this.hangmanStatus.innerHTML = `<span style="color: #ff4b2b;">Game Over! The word was ${this.currentWord}</span>`;
            this.losses++;
        }
    }
    
    isWordGuessed() {
        for (let letter of this.currentWord) {
            if (!this.guessedLetters.includes(letter)) return false;
        }
        return true;
    }
    
    isGameOver() {
        return this.isWordGuessed() || this.wrongGuesses >= this.maxWrongGuesses;
    }
    
    updateStats() {
        this.hangmanGuesses.textContent = this.maxWrongGuesses - this.wrongGuesses;
        this.hangmanCategory.textContent = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
        this.hangmanWins.textContent = this.wins;
        this.hangmanLosses.textContent = this.losses;
    }
    
    resetGame() {
        // Switch category for variety
        const categories = Object.keys(this.words);
        this.currentCategory = categories[Math.floor(Math.random() * categories.length)];
        
        this.newWord();
        
        // Reset letter buttons
        Array.from(this.hangmanLetters.children).forEach(el => {
            el.classList.remove('used');
        });
    }
}

// Dice Game
class DiceGame {
    constructor() {
        this.diceValues = [1, 1, 1];
        this.rollHistory = [];
        this.rolls = 0;
        this.bestRoll = 0;
        
        // Element references
        this.dice1 = document.getElementById('dice1');
        this.dice2 = document.getElementById('dice2');
        this.dice3 = document.getElementById('dice3');
        this.diceStatus = document.getElementById('diceStatus');
        this.diceTotal = document.getElementById('diceTotal');
        this.diceRolls = document.getElementById('diceRolls');
        this.diceBest = document.getElementById('diceBest');
        this.diceAverage = document.getElementById('diceAverage');
        this.diceHistory = document.getElementById('diceHistory');
        this.rollButton = document.getElementById('rollDice');
    }
    
    init() {
        this.rollButton.addEventListener('click', () => this.rollDice());
        this.updateDice();
        this.updateStats();
    }
    
    rollDice() {
        this.diceValues = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        
        const total = this.diceValues.reduce((sum, value) => sum + value, 0);
        this.rollHistory.push({ values: [...this.diceValues], total });
        this.rolls++;
        
        if (total > this.bestRoll) {
            this.bestRoll = total;
        }
        
        this.updateDice();
        this.updateStats();
        this.updateHistory();
        
        // Special messages for certain rolls
        if (this.diceValues[0] === this.diceValues[1] && this.diceValues[1] === this.diceValues[2]) {
            this.diceStatus.innerHTML = `<span class="winner">Three of a kind! Amazing!</span>`;
        } else if (this.diceValues.includes(6) && this.diceValues.includes(1)) {
            this.diceStatus.textContent = "High and low! Interesting roll.";
        } else {
            this.diceStatus.textContent = `You rolled ${total}!`;
        }
    }
    
    updateDice() {
        this.dice1.textContent = this.diceValues[0];
        this.dice2.textContent = this.diceValues[1];
        this.dice3.textContent = this.diceValues[2];
    }
    
    updateStats() {
        const total = this.diceValues.reduce((sum, value) => sum + value, 0);
        this.diceTotal.textContent = total;
        this.diceRolls.textContent = this.rolls;
        this.diceBest.textContent = this.bestRoll;
        
        if (this.rolls > 0) {
            const average = this.rollHistory.reduce((sum, roll) => sum + roll.total, 0) / this.rolls;
            this.diceAverage.textContent = average.toFixed(1);
        } else {
            this.diceAverage.textContent = '0';
        }
    }
    
    updateHistory() {
        this.diceHistory.innerHTML = '';
        
        // Show last 10 rolls
        const recentRolls = this.rollHistory.slice(-10);
        
        recentRolls.forEach(roll => {
            const rollElement = document.createElement('div');
            rollElement.textContent = `Dice: ${roll.values.join(', ')} = ${roll.total}`;
            this.diceHistory.appendChild(rollElement);
        });
    }
}

// Number Guesser Game
class NumberGuesserGame {
    constructor() {
        this.targetNumber = 0;
        this.guesses = [];
        this.attempts = 0;
        this.gamesPlayed = 0;
        this.bestScore = Infinity;
        
        // Element references
        this.guesserInput = document.getElementById('guesserInput');
        this.guesserStatus = document.getElementById('guesserStatus');
        this.guesserFeedback = document.getElementById('guesserFeedback');
        this.guesserAttempts = document.getElementById('guesserAttempts');
        this.guesserGames = document.getElementById('guesserGames');
        this.guesserBest = document.getElementById('guesserBest');
        this.guesserHistory = document.getElementById('guesserHistory');
        this.submitButton = document.getElementById('submitGuess');
        this.resetButton = document.getElementById('resetGuesser');
    }
    
    init() {
        this.newGame();
        this.submitButton.addEventListener('click', () => this.submitGuess());
        this.resetButton.addEventListener('click', () => this.newGame());
        this.guesserInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitGuess();
        });
        this.updateStats();
    }
    
    newGame() {
        this.targetNumber = Math.floor(Math.random() * 100) + 1;
        this.guesses = [];
        this.attempts = 0;
        this.guesserInput.value = '';
        this.guesserFeedback.textContent = '';
        this.guesserHistory.innerHTML = '';
        this.guesserStatus.textContent = "I'm thinking of a number between 1 and 100. Can you guess it?";
        this.updateStats();
    }
    
    submitGuess() {
        const guess = parseInt(this.guesserInput.value);
        
        if (isNaN(guess) || guess < 1 || guess > 100) {
            this.guesserFeedback.textContent = 'Please enter a valid number between 1 and 100.';
            return;
        }
        
        this.attempts++;
        this.guesses.push(guess);
        
        if (guess === this.targetNumber) {
            this.guesserFeedback.innerHTML = `<span class="winner">Correct! You found the number in ${this.attempts} attempts.</span>`;
            this.gamesPlayed++;
            
            if (this.attempts < this.bestScore) {
                this.bestScore = this.attempts;
            }
            
            this.updateStats();
        } else {
            const difference = Math.abs(guess - this.targetNumber);
            let feedback = '';
            
            if (difference <= 5) {
                feedback = 'Very hot!';
            } else if (difference <= 10) {
                feedback = 'Hot!';
            } else if (difference <= 20) {
                feedback = 'Warm';
            } else if (difference <= 30) {
                feedback = 'Cool';
            } else {
                feedback = 'Cold';
            }
            
            if (guess < this.targetNumber) {
                feedback += ' Try higher.';
            } else {
                feedback += ' Try lower.';
            }
            
            this.guesserFeedback.textContent = feedback;
        }
        
        this.updateHistory();
        this.guesserInput.value = '';
        this.updateStats();
    }
    
    updateHistory() {
        this.guesserHistory.innerHTML = '';
        
        this.guesses.forEach(guess => {
            const guessElement = document.createElement('div');
            const difference = Math.abs(guess - this.targetNumber);
            
            guessElement.textContent = `Guess: ${guess} (${difference === 0 ? 'Correct!' : `off by ${difference}`})`;
            this.guesserHistory.appendChild(guessElement);
        });
    }
    
    updateStats() {
        this.guesserAttempts.textContent = this.attempts;
        this.guesserGames.textContent = this.gamesPlayed;
        this.guesserBest.textContent = this.bestScore === Infinity ? 0 : this.bestScore;
    }
}

// Trivia Game
class TriviaGame {
    constructor() {
        this.questions = [
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                answer: "Paris"
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                answer: "Mars"
            },
            {
                question: "What is the largest mammal in the world?",
                options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
                answer: "Blue Whale"
            },
            {
                question: "Who painted the Mona Lisa?",
                options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
                answer: "Leonardo da Vinci"
            },
            {
                question: "What is the chemical symbol for gold?",
                options: ["Go", "Gd", "Au", "Ag"],
                answer: "Au"
            }
        ];
        
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        
        // Element references
        this.triviaQuestion = document.getElementById('triviaQuestion');
        this.triviaOptions = document.getElementById('triviaOptions');
        this.triviaStatus = document.getElementById('triviaStatus');
        this.triviaCurrent = document.getElementById('triviaCurrent');
        this.triviaCategory = document.getElementById('triviaCategory');
        this.triviaCorrect = document.getElementById('triviaCorrect');
        this.triviaIncorrect = document.getElementById('triviaIncorrect');
        this.nextButton = document.getElementById('nextTrivia');
    }
    
    init() {
        this.nextButton.addEventListener('click', () => this.nextQuestion());
        this.loadQuestion();
        this.updateStats();
    }
    
    loadQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.triviaQuestion.textContent = "Quiz completed!";
            this.triviaOptions.innerHTML = '';
            this.triviaStatus.innerHTML = `<span class="winner">You got ${this.correctAnswers} out of ${this.questions.length} correct!</span>`;
            return;
        }
        
        const question = this.questions[this.currentQuestion];
        this.triviaQuestion.textContent = question.question;
        this.triviaOptions.innerHTML = '';
        
        question.options.forEach(option => {
            const optionElement = document.createElement('button');
            optionElement.classList.add('trivia-option');
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.checkAnswer(option));
            this.triviaOptions.appendChild(optionElement);
        });
        
        this.updateStats();
    }
    
    checkAnswer(selectedOption) {
        const question = this.questions[this.currentQuestion];
        const options = this.triviaOptions.querySelectorAll('.trivia-option');
        
        options.forEach(option => {
            option.disabled = true;
            if (option.textContent === question.answer) {
                option.classList.add('correct');
            } else if (option.textContent === selectedOption) {
                option.classList.add('incorrect');
            }
        });
        
        if (selectedOption === question.answer) {
            this.correctAnswers++;
            this.triviaStatus.innerHTML = `<span class="winner">Correct!</span>`;
        } else {
            this.incorrectAnswers++;
            this.triviaStatus.innerHTML = `<span style="color: #ff4b2b;">Incorrect! The answer was ${question.answer}.</span>`;
        }
        
        this.updateStats();
    }
    
    nextQuestion() {
        this.currentQuestion++;
        this.loadQuestion();
    }
    
    updateStats() {
        this.triviaCurrent.textContent = this.currentQuestion + 1;
        this.triviaCategory.textContent = "General Knowledge";
        this.triviaCorrect.textContent = this.correctAnswers;
        this.triviaIncorrect.textContent = this.incorrectAnswers;
    }
}

// Reaction Test Game
class ReactionTestGame {
    constructor() {
        this.startTime = 0;
        this.endTime = 0;
        this.reactionTimes = [];
        this.testActive = false;
        this.waiting = false;
        
        // Element references
        this.reactionArea = document.getElementById('reactionArea');
        this.reactionStatus = document.getElementById('reactionStatus');
        this.reactionLast = document.getElementById('reactionLast');
        this.reactionBest = document.getElementById('reactionBest');
        this.reactionTests = document.getElementById('reactionTests');
        this.reactionAverage = document.getElementById('reactionAverage');
        this.reactionResults = document.getElementById('reactionResults');
        this.startButton = document.getElementById('startReaction');
    }
    
    init() {
        this.startButton.addEventListener('click', () => this.startTest());
        this.reactionArea.addEventListener('click', () => this.react());
        this.updateStats();
    }
    
    startTest() {
        if (this.testActive) return;
        
        this.reactionArea.classList.remove('ready', 'too-soon');
        this.reactionArea.classList.add('waiting');
        this.reactionArea.textContent = 'Wait for green...';
        this.reactionStatus.textContent = 'Wait for the color to change to green, then click as fast as you can!';
        
        this.testActive = true;
        this.waiting = true;
        
        // Random delay between 1 and 5 seconds
        const delay = Math.random() * 4000 + 1000;
        
        setTimeout(() => {
            if (this.testActive && this.waiting) {
                this.reactionArea.classList.remove('waiting');
                this.reactionArea.classList.add('ready');
                this.reactionArea.textContent = 'Click Now!';
                this.startTime = Date.now();
                this.waiting = false;
            }
        }, delay);
    }
    
    react() {
        if (!this.testActive) return;
        
        if (this.waiting) {
            // Clicked too soon
            this.reactionArea.classList.remove('waiting');
            this.reactionArea.classList.add('too-soon');
            this.reactionArea.textContent = 'Too Soon!';
            this.reactionStatus.textContent = 'You clicked too early! Wait for green.';
            this.testActive = false;
            
            setTimeout(() => {
                this.reactionArea.classList.remove('too-soon');
                this.reactionArea.textContent = 'Click Start to try again';
            }, 2000);
        } else {
            // Valid reaction
            this.endTime = Date.now();
            const reactionTime = this.endTime - this.startTime;
            
            this.reactionTimes.push(reactionTime);
            this.reactionArea.textContent = `${reactionTime} ms`;
            this.reactionStatus.innerHTML = `<span class="winner">Reaction time: ${reactionTime} ms</span>`;
            this.testActive = false;
            
            this.updateStats();
            this.updateResults();
        }
    }
    
    updateStats() {
        if (this.reactionTimes.length > 0) {
            const lastTime = this.reactionTimes[this.reactionTimes.length - 1];
            this.reactionLast.textContent = lastTime;
            
            const bestTime = Math.min(...this.reactionTimes);
            this.reactionBest.textContent = bestTime;
            
            this.reactionTests.textContent = this.reactionTimes.length;
            
            const average = this.reactionTimes.reduce((sum, time) => sum + time, 0) / this.reactionTimes.length;
            this.reactionAverage.textContent = average.toFixed(0);
        } else {
            this.reactionLast.textContent = '0';
            this.reactionBest.textContent = '0';
            this.reactionTests.textContent = '0';
            this.reactionAverage.textContent = '0';
        }
    }
    
    updateResults() {
        this.reactionResults.innerHTML = '';
        
        // Show last 10 results
        const recentResults = this.reactionTimes.slice(-10);
        
        recentResults.forEach((time, index) => {
            const resultElement = document.createElement('div');
            resultElement.textContent = `Test ${index + 1}: ${time} ms`;
            this.reactionResults.appendChild(resultElement);
        });
    }
}

// Word Scramble Game
class WordScrambleGame {
    constructor() {
        this.words = [
            { word: "COMPUTER", hint: "An electronic device for processing data" },
            { word: "ELEPHANT", hint: "A large mammal with a trunk" },
            { word: "BUTTERFLY", hint: "An insect with colorful wings" },
            { word: "MOUNTAIN", hint: "A large natural elevation of the earth's surface" },
            { word: "HOSPITAL", hint: "A place where sick people are treated" }
        ];
        
        this.currentWord = '';
        this.scrambledWord = '';
        this.solved = 0;
        this.total = 0;
        
        // Element references
        this.scrambleWord = document.getElementById('scrambleWord');
        this.scrambleInput = document.getElementById('scrambleInput');
        this.scrambleStatus = document.getElementById('scrambleStatus');
        this.scrambleFeedback = document.getElementById('scrambleFeedback');
        this.scrambleSolved = document.getElementById('scrambleSolved');
        this.scrambleTotal = document.getElementById('scrambleTotal');
        this.scrambleRate = document.getElementById('scrambleRate');
        this.scrambleCategory = document.getElementById('scrambleCategory');
        this.checkButton = document.getElementById('checkScramble');
        this.nextButton = document.getElementById('nextScramble');
    }
    
    init() {
        this.checkButton.addEventListener('click', () => this.checkAnswer());
        this.nextButton.addEventListener('click', () => this.nextWord());
        this.scrambleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        this.nextWord();
        this.updateStats();
    }
    
    scrambleWordFunc(word) {
        let scrambled = word.split('');
        for (let i = scrambled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
        }
        return scrambled.join('');
    }
    
    nextWord() {
        const randomWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.currentWord = randomWord.word;
        this.scrambledWord = this.scrambleWordFunc(this.currentWord);
        
        // Make sure the scrambled word is different from the original
        while (this.scrambledWord === this.currentWord) {
            this.scrambledWord = this.scrambleWordFunc(this.currentWord);
        }
        
        this.scrambleWord.textContent = this.scrambledWord;
        this.scrambleInput.value = '';
        this.scrambleFeedback.textContent = `Hint: ${randomWord.hint}`;
        this.scrambleStatus.textContent = 'Unscramble the word!';
        this.total++;
        this.updateStats();
    }
    
    checkAnswer() {
        const guess = this.scrambleInput.value.toUpperCase().trim();
        
        if (guess === this.currentWord) {
            this.scrambleFeedback.innerHTML = `<span class="winner">Correct! The word was ${this.currentWord}.</span>`;
            this.solved++;
        } else {
            this.scrambleFeedback.innerHTML = `<span style="color: #ff4b2b;">Incorrect. Try again!</span>`;
        }
        
        this.updateStats();
    }
    
    updateStats() {
        this.scrambleSolved.textContent = this.solved;
        this.scrambleTotal.textContent = this.total;
        this.scrambleCategory.textContent = "Common Words";
        
        if (this.total > 0) {
            const successRate = (this.solved / this.total) * 100;
            this.scrambleRate.textContent = successRate.toFixed(1);
        } else {
            this.scrambleRate.textContent = '0';
        }
    }
}

// Color Match Game
class ColorMatchGame {
    constructor() {
        this.targetColor = '';
        this.options = [];
        this.correct = 0;
        this.incorrect = 0;
        this.total = 0;
        
        // Element references
        this.colorTarget = document.getElementById('colorTarget');
        this.colorOptions = document.getElementById('colorOptions');
        this.colorStatus = document.getElementById('colorStatus');
        this.colorCorrect = document.getElementById('colorCorrect');
        this.colorIncorrect = document.getElementById('colorIncorrect');
        this.colorTotal = document.getElementById('colorTotal');
        this.colorAccuracy = document.getElementById('colorAccuracy');
        this.nextButton = document.getElementById('nextColor');
    }
    
    init() {
        this.nextButton.addEventListener('click', () => this.nextColor());
        this.nextColor();
        this.updateStats();
    }
    
    generateColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    nextColor() {
        this.targetColor = this.generateColor();
        this.colorTarget.style.backgroundColor = this.targetColor;
        
        // Generate options (one correct, others similar but different)
        this.options = [this.targetColor];
        
        for (let i = 0; i < 5; i++) {
            const similarColor = this.generateSimilarColor(this.targetColor);
            this.options.push(similarColor);
        }
        
        // Shuffle options
        for (let i = this.options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.options[i], this.options[j]] = [this.options[j], this.options[i]];
        }
        
        // Display options
        this.colorOptions.innerHTML = '';
        this.options.forEach(color => {
            const option = document.createElement('div');
            option.classList.add('color-option');
            option.style.backgroundColor = color;
            option.addEventListener('click', () => this.checkAnswer(color));
            this.colorOptions.appendChild(option);
        });
        
        this.total++;
        this.updateStats();
    }
    
    generateSimilarColor(baseColor) {
        // Extract RGB values from base color
        const rgb = baseColor.match(/\d+/g).map(Number);
        const [r, g, b] = rgb;
        
        // Create a similar color by slightly modifying each component
        const newR = Math.max(0, Math.min(255, r + Math.floor(Math.random() * 60 - 30)));
        const newG = Math.max(0, Math.min(255, g + Math.floor(Math.random() * 60 - 30)));
        const newB = Math.max(0, Math.min(255, b + Math.floor(Math.random() * 60 - 30)));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }
    
    checkAnswer(selectedColor) {
        if (selectedColor === this.targetColor) {
            this.colorStatus.innerHTML = `<span class="winner">Correct! Well done.</span>`;
            this.correct++;
        } else {
            this.colorStatus.innerHTML = `<span style="color: #ff4b2b;">Incorrect. Try again!</span>`;
            this.incorrect++;
        }
        
        this.updateStats();
    }
    
    updateStats() {
        this.colorCorrect.textContent = this.correct;
        this.colorIncorrect.textContent = this.incorrect;
        this.colorTotal.textContent = this.total;
        
        if (this.total > 0) {
            const accuracy = (this.correct / this.total) * 100;
            this.colorAccuracy.textContent = accuracy.toFixed(1);
        } else {
            this.colorAccuracy.textContent = '0';
        }
    }
}

// Math Challenge Game
class MathChallengeGame {
    constructor() {
        this.currentProblem = {};
        this.correct = 0;
        this.incorrect = 0;
        this.total = 0;
        this.startTime = 0;
        this.times = [];
        
        // Element references
        this.mathProblem = document.getElementById('mathProblem');
        this.mathOptions = document.getElementById('mathOptions');
        this.mathStatus = document.getElementById('mathStatus');
        this.mathTimer = document.getElementById('mathTimer');
        this.mathCorrect = document.getElementById('mathCorrect');
        this.mathIncorrect = document.getElementById('mathIncorrect');
        this.mathTotal = document.getElementById('mathTotal');
        this.mathAverage = document.getElementById('mathAverage');
        this.nextButton = document.getElementById('nextMath');
    }
    
    init() {
        this.nextButton.addEventListener('click', () => this.nextProblem());
        this.nextProblem();
        this.updateStats();
    }
    
    generateProblem() {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer;
        
        switch(operation) {
            case '+':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 100) + 1;
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                break;
        }
        
        return {
            problem: `${num1} ${operation} ${num2}`,
            answer: answer,
            options: this.generateOptions(answer)
        };
    }
    
    generateOptions(correctAnswer) {
        const options = [correctAnswer];
        
        // Generate similar but wrong answers
        while (options.length < 4) {
            let option;
            if (correctAnswer < 10) {
                option = Math.floor(Math.random() * 20) + 1;
            } else {
                // Generate options within 30% of the correct answer
                const variance = Math.max(1, Math.floor(correctAnswer * 0.3));
                option = correctAnswer + Math.floor(Math.random() * variance * 2) - variance;
            }
            
            if (option > 0 && !options.includes(option)) {
                options.push(option);
            }
        }
        
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        return options;
    }
    
    nextProblem() {
        this.currentProblem = this.generateProblem();
        this.mathProblem.textContent = this.currentProblem.problem + " = ?";
        
        this.mathOptions.innerHTML = '';
        this.currentProblem.options.forEach(option => {
            const optionElement = document.createElement('button');
            optionElement.classList.add('math-option');
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.checkAnswer(option));
            this.mathOptions.appendChild(optionElement);
        });
        
        this.startTime = Date.now();
        this.startTimer();
        this.total++;
        this.updateStats();
    }
    
    startTimer() {
        let seconds = 0;
        const timerInterval = setInterval(() => {
            seconds++;
            this.mathTimer.textContent = `Time: ${seconds}s`;
            
            if (!this.mathOptions.querySelector('.math-option')) {
                clearInterval(timerInterval);
            }
        }, 1000);
    }
    
    checkAnswer(selectedAnswer) {
        const endTime = Date.now();
        const timeTaken = (endTime - this.startTime) / 1000;
        this.times.push(timeTaken);
        
        if (selectedAnswer === this.currentProblem.answer) {
            this.mathStatus.innerHTML = `<span class="winner">Correct! Time: ${timeTaken.toFixed(1)}s</span>`;
            this.correct++;
        } else {
            this.mathStatus.innerHTML = `<span style="color: #ff4b2b;">Incorrect! The answer was ${this.currentProblem.answer}. Time: ${timeTaken.toFixed(1)}s</span>`;
            this.incorrect++;
        }
        
        // Disable options after answer is selected
        const options = this.mathOptions.querySelectorAll('.math-option');
        options.forEach(option => {
            option.disabled = true;
        });
        
        this.updateStats();
    }
    
    updateStats() {
        this.mathCorrect.textContent = this.correct;
        this.mathIncorrect.textContent = this.incorrect;
        this.mathTotal.textContent = this.total;
        
        if (this.times.length > 0) {
            const average = this.times.reduce((sum, time) => sum + time, 0) / this.times.length;
            this.mathAverage.textContent = average.toFixed(1);
        } else {
            this.mathAverage.textContent = '0';
        }
    }
}

// Initialize the game manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});
