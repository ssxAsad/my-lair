const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreVal');
const highScoreEl = document.getElementById('highScoreVal');
const startScreen = document.getElementById('startScreen');

// --- CONFIG ---
const GRID_SIZE = 20; 
const TILE_COUNT = canvas.width / GRID_SIZE; 
let GAME_SPEED = 100; 

// --- STATE ---
let score = 0;
let highScore = localStorage.getItem('snake_highscore') || 0;
let gameInterval;
let isGameRunning = false;

let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;

highScoreEl.innerText = highScore;

// --- INITIALIZE ---
function startGame() {
    startScreen.style.display = 'none';
    
    // Reset Snake
    const mid = Math.floor(TILE_COUNT / 2);
    snake = [{ x: mid, y: mid }, { x: mid-1, y: mid }, { x: mid-2, y: mid }];
    
    score = 0;
    scoreEl.innerText = score;
    dx = 1; 
    dy = 0;
    GAME_SPEED = 100;
    isGameRunning = true;
    
    placeFood();
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, GAME_SPEED);
}

// --- GAME LOOP ---
function gameLoop() {
    if(!isGameRunning) return;
    moveSnake();
    checkCollisions();
    draw();
}

// --- LOGIC ---
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score;
        if(score % 50 === 0 && GAME_SPEED > 60) {
            clearInterval(gameInterval);
            GAME_SPEED -= 5;
            gameInterval = setInterval(gameLoop, GAME_SPEED);
        }
        placeFood();
    } else {
        snake.pop();
    }
}

function checkCollisions() {
    const head = snake[0];
    
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
         gameOver(); 
    }
    
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snake_highscore', highScore);
        highScoreEl.innerText = highScore;
    }
    startScreen.style.display = 'flex';
    document.querySelector('#startScreen h1').innerText = "SYSTEM FAILURE";
    document.querySelector('#startScreen h1').classList.add('text-red-500');
    document.querySelector('#startScreen p').innerText = `DATA COLLECTED: ${score}`;
    document.querySelector('#startScreen button').innerText = "REBOOT SYSTEM";
}

function placeFood() {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) placeFood();
    });
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#cffafe' : '#06b6d4';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#22d3ee';
        ctx.fillRect(part.x * GRID_SIZE + 1, part.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });
    
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ef4444';
    ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    ctx.shadowBlur = 0;
}

// ==========================================
// --- CONTROLS: UNIFIED (KEYBOARD + TOUCH + MOUSE) ---
// ==========================================

function changeDirection(direction) {
    if (direction === 'UP' && dy !== 1) { dx = 0; dy = -1; }
    if (direction === 'DOWN' && dy !== -1) { dx = 0; dy = 1; }
    if (direction === 'LEFT' && dx !== 1) { dx = -1; dy = 0; }
    if (direction === 'RIGHT' && dx !== -1) { dx = 1; dy = 0; }
}

// 1. Keyboard
document.addEventListener('keydown', (e) => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
    if (e.key === 'ArrowUp') changeDirection('UP');
    if (e.key === 'ArrowDown') changeDirection('DOWN');
    if (e.key === 'ArrowLeft') changeDirection('LEFT');
    if (e.key === 'ArrowRight') changeDirection('RIGHT');
});

// 2. Variable for Start Position
let startX = 0;
let startY = 0;

// 3. Shared Swipe Handler (Works for Mouse & Touch)
function handleSwipe(sX, sY, eX, eY) {
    let diffX = eX - sX;
    let diffY = eY - sY;
    const threshold = 30; // Minimum drag distance

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) changeDirection('RIGHT');
            else changeDirection('LEFT');
        }
    } else {
        if (Math.abs(diffY) > threshold) {
            if (diffY > 0) changeDirection('DOWN');
            else changeDirection('UP');
        }
    }
}

// 4. Touch Listeners (Mobile)
document.addEventListener('touchstart', function(e) {
    startX = e.changedTouches[0].screenX;
    startY = e.changedTouches[0].screenY;
}, {passive: false});

document.addEventListener('touchend', function(e) {
    let endX = e.changedTouches[0].screenX;
    let endY = e.changedTouches[0].screenY;
    handleSwipe(startX, startY, endX, endY);
}, {passive: false});

// 5. Mouse Listeners (Desktop Click & Drag)
document.addEventListener('mousedown', function(e) {
    startX = e.screenX;
    startY = e.screenY;
});

document.addEventListener('mouseup', function(e) {
    let endX = e.screenX;
    let endY = e.screenY;
    handleSwipe(startX, startY, endX, endY);
});