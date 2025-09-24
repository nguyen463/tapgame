document.addEventListener('DOMContentLoaded', function() {
    // Game variables
    let game;
    let score = 0;
    let timeLeft = 60;
    let level = 1;
    let combo = 0;
    let gameActive = false;
    let targetInterval;
    let timerInterval;
    let highestLevel = 1;
    
    // DOM elements
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const scoreDisplay = document.getElementById('score-display');
    const timerDisplay = document.getElementById('timer-display');
    const levelDisplay = document.getElementById('level-display');
    const finalScoreDisplay = document.getElementById('final-score');
    const highestLevelDisplay = document.getElementById('highest-level');
    
    // Initialize Phaser game
    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'game-container',
        backgroundColor: '#16213e',
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    
    // Game functions
    function preload() {
        // Preload assets if needed
    }
    
    function create() {
        // Create game elements
        this.targets = this.add.group();
        
        // Input handling
        this.input.on('gameobjectdown', function(pointer, gameObject) {
            if (gameActive) {
                handleTargetClick(gameObject);
            }
        });
    }
    
    function update() {
        // Game update logic
    }
    
    // Start the game
    startButton.addEventListener('click', function() {
        startGame();
    });
    
    // Restart the game
    restartButton.addEventListener('click', function() {
        restartGame();
    });
    
    function startGame() {
        // Hide start screen
        startScreen.style.display = 'none';
        
        // Reset game variables
        score = 0;
        timeLeft = 60;
        level = 1;
        combo = 0;
        gameActive = true;
        
        // Update UI
        updateUI();
        
        // Start game timers
        startTimers();
        
        // Initialize Phaser game if not already done
        if (!game) {
            game = new Phaser.Game(config);
        }
    }
    
    function restartGame() {
        // Hide game over screen
        gameOverScreen.style.display = 'none';
        
        // Reset game variables
        score = 0;
        timeLeft = 60;
        level = 1;
        combo = 0;
        gameActive = true;
        
        // Update UI
        updateUI();
        
        // Start game timers
        startTimers();
    }
    
    function startTimers() {
        // Clear any existing intervals
        clearInterval(targetInterval);
        clearInterval(timerInterval);
        
        // Start target spawning
        targetInterval = setInterval(spawnTarget, 1000);
        
        // Start game timer
        timerInterval = setInterval(function() {
            timeLeft--;
            updateUI();
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }
    
    function spawnTarget() {
        if (game && game.scene && game.scene.scenes[0]) {
            const scene = game.scene.scenes[0];
            
            // Determine target type (80% blue, 20% red)
            const isBadTarget = Math.random() < 0.2;
            const targetColor = isBadTarget ? 0xff0000 : 0x00a8ff;
            
            // Create target
            const target = scene.add.circle(
                Phaser.Math.Between(50, scene.sys.game.config.width - 50),
                Phaser.Math.Between(100, scene.sys.game.config.height - 50),
                30,
                targetColor,
                0.8
            );
            
            // Make target interactive
            target.setInteractive();
            
            // Add to targets group
            scene.targets.add(target);
            
            // Set target properties
            target.isBad = isBadTarget;
            target.lifespan = 3000 - (level * 200); // Decrease with level
            
            // Animate target appearance
            scene.tweens.add({
                targets: target,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true,
                ease: 'Back.out'
            });
            
            // Remove target after lifespan
            setTimeout(function() {
                if (target.active) {
                    target.destroy();
                    if (!target.isBad) {
                        // Reset combo if blue target disappears
                        combo = 0;
                    }
                }
            }, target.lifespan);
        }
    }
    
    function handleTargetClick(target) {
        if (target.isBad) {
            // Bad target - decrease score and reset combo
            score = Math.max(0, score - 10);
            combo = 0;
            createParticles(target.x, target.y, '#ff0000');
        } else {
            // Good target - increase score and combo
            score += 10 + (combo * 2);
            combo++;
            createParticles(target.x, target.y, '#00ff00');
            
            // Check for level up
            if (score >= level * 100) {
                levelUp();
            }
        }
        
        // Animate target destruction
        if (game && game.scene && game.scene.scenes[0]) {
            const scene = game.scene.scenes[0];
            scene.tweens.add({
                targets: target,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 200,
                onComplete: function() {
                    target.destroy();
                }
            });
        }
        
        // Update UI
        updateUI();
    }
    
    function levelUp() {
        level++;
        if (level > highestLevel) {
            highestLevel = level;
        }
        
        // Speed up target spawning
        clearInterval(targetInterval);
        const spawnRate = Math.max(300, 1000 - (level * 100));
        targetInterval = setInterval(spawnTarget, spawnRate);
        
        // Visual feedback for level up
        if (game && game.scene && game.scene.scenes[0]) {
            const scene = game.scene.scenes[0];
            scene.cameras.main.flash(200, 0, 255, 0);
            scene.cameras.main.shake(100, 0.01);
        }
    }
    
    function updateUI() {
        scoreDisplay.textContent = `Score: ${score}`;
        timerDisplay.textContent = `Time: ${timeLeft}`;
        levelDisplay.textContent = `Level: ${level}`;
    }
    
    function endGame() {
        gameActive = false;
        
        // Clear intervals
        clearInterval(targetInterval);
        clearInterval(timerInterval);
        
        // Clear all targets
        if (game && game.scene && game.scene.scenes[0]) {
            const scene = game.scene.scenes[0];
            scene.targets.clear(true, true);
        }
        
        // Show game over screen
        finalScoreDisplay.textContent = `Score: ${score}`;
        highestLevelDisplay.textContent = highestLevel;
        gameOverScreen.style.display = 'flex';
    }
    
    function createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.backgroundColor = color;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            document.getElementById('game-container').appendChild(particle);
            
            // Animate particle
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(0)`, opacity: 0 }
            ], {
                duration: 500 + Math.random() * 500,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            }).onfinish = function() {
                particle.remove();
            };
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (game) {
            game.scale.resize(window.innerWidth, window.innerHeight);
        }
    });
});
