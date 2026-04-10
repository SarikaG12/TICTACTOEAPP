const API_BASE = '/api';

const app = {
    mode: null, // 'PvC' or 'PvP'
    difficulty: null,
    levelNumber: 1,
    player1Name: 'Player 1',
    player2Name: 'Computer',
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X', // X always goes first
    gameActive: false,
    timerInterval: null,
    secondsElapsed: 0,
    playerState: {
        username: '',
        highScore: 0,
        totalStars: 0,
        highestUnlockedLevel: 1
    },

    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

        if (screenId === 'levels-screen') {
            this.renderLevels();
            document.getElementById('total-stars-levels').innerText = this.playerState.totalStars;
        }
        
        if (screenId === 'game-screen') {
            this.startTimer();
        } else {
            this.stopTimer();
        }
    },

    selectMode(mode) {
        this.mode = mode;
        document.getElementById('pvc-btn').classList.toggle('selected', mode === 'PvC');
        document.getElementById('pvp-btn').classList.toggle('selected', mode === 'PvP');
        
        const nameInputs = document.getElementById('name-inputs');
        const p2Input = document.getElementById('player2-name');
        
        nameInputs.classList.remove('hidden');
        if (mode === 'PvP') {
            p2Input.classList.remove('hidden');
        } else {
            p2Input.classList.add('hidden');
        }
    },

    async proceedFromSetup() {
        if (!this.mode) {
            this.showToast('Please select a game mode');
            return;
        }

        const p1 = document.getElementById('player1-name').value.trim() || 'Player 1';
        this.player1Name = p1;
        
        if (this.mode === 'PvP') {
            const p2 = document.getElementById('player2-name').value.trim() || 'Player 2';
            this.player2Name = p2;
            this.startGame();
        } else {
            this.player2Name = 'Computer';
            this.playerState.username = p1;
            await this.loadPlayerState(p1);
            this.showScreen('difficulty-screen');
        }
    },

    setDifficulty(diff) {
        this.difficulty = diff;
        this.showScreen('levels-screen');
    },

    async loadPlayerState(username) {
        try {
            const res = await fetch(`${API_BASE}/player/${encodeURIComponent(username)}`);
            if (res.ok) {
                this.playerState = await res.json();
            }
        } catch (e) {
            console.error('Failed to load player state');
        }
    },

    async savePlayerState() {
        if (this.mode === 'PvP') return;
        try {
            await fetch(`${API_BASE}/player`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.playerState)
            });
        } catch (e) {
            console.error('Failed to save player state');
        }
    },

    renderLevels() {
        const grid = document.getElementById('levels-grid');
        grid.innerHTML = '';
        for (let i = 1; i <= 150; i++) {
            const btn = document.createElement('div');
            btn.className = 'level-btn ' + (i <= this.playerState.highestUnlockedLevel ? 'unlocked' : 'locked');
            btn.innerHTML = `<div>${i}</div>`;
            if (i < this.playerState.highestUnlockedLevel) {
                btn.innerHTML += `<div class="level-star">⭐⭐⭐</div>`;
            }
            if (i <= this.playerState.highestUnlockedLevel) {
                btn.onclick = () => {
                    this.levelNumber = i;
                    this.startGame();
                };
            }
            grid.appendChild(btn);
        }
    },

    startGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        document.getElementById('p1-name-display').innerText = this.player1Name;
        document.getElementById('p2-name-display').innerText = this.player2Name;
        document.getElementById('current-level-text').innerText = this.mode === 'PvP' ? 'Free Play' : this.levelNumber;
        document.getElementById('current-score-text').innerText = this.playerState.highScore;
        document.getElementById('high-score-text').innerText = this.playerState.highScore;
        
        document.getElementById('turn-indicator').innerText = `${this.currentPlayer}'S TURN`;
        document.getElementById('turn-indicator').style.color = this.currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';

        this.updateBoardUI();
        this.showScreen('game-screen');
    },

    async handleCellClick(e) {
        if (!this.gameActive) return;
        const index = e.target.getAttribute('data-index');
        
        if (this.board[index] !== '') return;
        
        this.makeMove(index, this.currentPlayer);

        if (this.mode === 'PvC' && this.gameActive && this.currentPlayer === 'X') {
            this.gameActive = false; // block UI while waiting
            await this.requestAiMove();
        }
    },

    makeMove(index, player) {
        this.board[index] = player;
        Sounds.move();
        this.updateBoardUI();

        if (this.mode === 'PvP') {
            this.checkLocalWinState();
        } else if (this.mode === 'PvC' && player === 'X') {
            // Wait for backend validation and AI response in requestAiMove
        }
    },

    checkLocalWinState() {
        const winLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        let winner = null;
        let winningLine = null;

        for (let line of winLines) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                winner = this.board[a];
                winningLine = line;
                break;
            }
        }

        if (winner) {
            this.gameActive = false;
            this.highlightWin(winningLine);
            setTimeout(() => this.showResult(winner === 'X' ? 'WIN' : 'WIN_P2'), 1000);
            return;
        }

        if (!this.board.includes('')) {
            this.gameActive = false;
            setTimeout(() => this.showResult('DRAW'), 1000);
            return;
        }

        this.swapTurn();
    },

    async requestAiMove() {
        try {
            const payload = {
                board: this.board.join(','),
                playerSide: 'X',
                difficulty: this.difficulty,
                levelNumber: this.levelNumber
            };

            const res = await fetch(`${API_BASE}/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                
                if (data.board) {
                    const newBoard = data.board.split(',');
                    for(let i=0; i<9; i++) {
                        if (newBoard[i] && !this.board[i]) {
                            this.board[i] = newBoard[i];
                            Sounds.move();
                        }
                    }
                    this.updateBoardUI();
                }

                if (data.status !== 'ONGOING') {
                    if (data.winningLine) this.highlightWin(data.winningLine);
                    setTimeout(() => this.showResult(data.status), 1000);
                } else {
                    this.gameActive = true;
                    this.currentPlayer = 'X';
                    this.updateTurnIndicator();
                }
            }
        } catch (e) {
            console.error('API Error', e);
            this.gameActive = true; // unblock on error
        }
    },

    async getHint() {
        if (!this.gameActive || (this.mode === 'PvC' && this.currentPlayer === 'O')) return;
        
        try {
            const payload = {
                board: this.board.join(','),
                playerSide: this.currentPlayer,
                difficulty: 'Hard',
                levelNumber: 150
            };

            const res = await fetch(`${API_BASE}/hint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                const cell = document.querySelector(`.cell[data-index="${data.suggestedIndex}"]`);
                if (cell) {
                    cell.classList.add('hint');
                    Sounds.hint();
                    setTimeout(() => cell.classList.remove('hint'), 1500);
                }
            }
        } catch (e) {
            console.error('Hint Failed', e);
        }
    },

    updateBoardUI() {
        document.querySelectorAll('.cell').forEach((cell, i) => {
            cell.innerText = this.board[i];
            cell.className = 'cell ' + (this.board[i] === 'X' ? 'x' : (this.board[i] === 'O' ? 'o' : ''));
        });
    },

    highlightWin(line) {
        line.forEach(index => {
            document.querySelector(`.cell[data-index="${index}"]`).classList.add('win');
        });
    },

    swapTurn() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnIndicator();
    },

    updateTurnIndicator() {
        const ind = document.getElementById('turn-indicator');
        if (this.mode === 'PvC') {
            ind.innerText = this.currentPlayer === 'X' ? "YOUR TURN" : "AI THINKING...";
        } else {
            const name = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
            ind.innerText = `${name}'S TURN`;
        }
        ind.style.color = this.currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
    },

    showResult(status) {
        this.stopTimer();
        this.showScreen('result-screen');
        
        const title = document.getElementById('result-title');
        let starsEarned = 0;

        if (status === 'WIN' || status === 'WIN_P2') {
            title.innerText = status === 'WIN' ? `${this.player1Name} WINS!` : `${this.player2Name} WINS!`;
            title.className = 'glow-text';
            title.style.color = status === 'WIN' ? 'var(--x-color)' : 'var(--o-color)';
            starsEarned = 3;
            Sounds.win();
        } else if (status === 'LOSS') {
            title.innerText = 'YOU LOSE!';
            title.className = 'glow-text';
            title.style.color = 'var(--secondary-color)';
            starsEarned = 0;
            Sounds.lose();
        } else {
            title.innerText = "IT'S A DRAW!";
            title.className = 'glow-text';
            title.style.color = '#fff';
            starsEarned = 1;
            Sounds.draw();
        }

        let currentScore = 0;

        if (this.mode === 'PvC') {
            if (status === 'WIN') {
                 const MAX_SCORE = 100;
                 const TIME_FACTOR = 1;

              currentScore = Math.max(0, MAX_SCORE - (this.secondsElapsed * TIME_FACTOR));
            }
            
            this.playerState.totalStars += starsEarned;
            
            if (currentScore > this.playerState.highScore) {
                this.playerState.highScore = currentScore;
            }

            if (status === 'WIN' && this.levelNumber === this.playerState.highestUnlockedLevel) {
                if (this.levelNumber < 150) {
                    this.playerState.highestUnlockedLevel++;
                    Sounds.levelUnlock();
                    this.showToast(`Level ${this.playerState.highestUnlockedLevel} Unlocked!`);
                }
            }
            this.savePlayerState();
            
            document.getElementById('btn-next-level').disabled = this.levelNumber >= this.playerState.highestUnlockedLevel;
            document.getElementById('btn-next-level').style.display = 'block';
            document.getElementById('btn-back-levels').style.display = 'block';
            
        } else {
            // PvP
            document.getElementById('btn-next-level').style.display = 'none';
            document.getElementById('btn-back-levels').style.display = 'none';
            starsEarned = 0;
            currentScore = 0;
        }

        document.getElementById('result-score').innerText = currentScore;
        document.getElementById('result-high-score').innerText = this.playerState.highScore;
        document.getElementById('result-stars').innerText = starsEarned;
    },

    startNextLevel() {
        this.levelNumber++;
        this.startGame();
    },

    restartMatch() {
        this.startGame();
    },

    openLevelsOrWarning() {
        if (this.mode === 'PvP') {
            this.showToast('Levels are only available in Player vs Computer mode.');
        } else {
            this.showScreen('levels-screen');
        }
    },

    startTimer() {
        this.stopTimer();
        this.secondsElapsed = 0;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            if(this.gameActive) {
                this.secondsElapsed++;
                this.updateTimerDisplay();
            }
        }, 1000);
    },

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    },

    updateTimerDisplay() {
        const m = Math.floor(this.secondsElapsed / 60).toString().padStart(2, '0');
        const s = (this.secondsElapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer-display').innerText = `${m}:${s}`;
    },

    showToast(msg) {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
