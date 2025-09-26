const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const speedEl = document.getElementById('speed');
const statusEl = document.getElementById('status');
const pauseBtn = document.getElementById('pause');
const controlButtons = document.querySelectorAll('.controls .btn[data-dir]');

const BOARD_SIZE = 20;
const TILE_SIZE = canvas.width / BOARD_SIZE;
const BASE_SPEED = 6;
const SPEED_STEP = 0.75;
const MAX_SPEED = 16;

let snake;
let direction;
let nextDirection;
let food;
let score;
let gameSpeed;
let lastFrameTime = 0;
let accumulatedTime = 0;
let isPaused = false;
let isGameOver = false;
let blinkTimer = 0;
let blinkVisible = true;

function getStoredHighScore() {
  const stored = Number.parseInt(localStorage.getItem('snake-high-score'), 10);
  return Number.isNaN(stored) ? 0 : stored;
}

let highScore = getStoredHighScore();
highScoreEl.textContent = highScore;

function setStatus(message = '') {
  statusEl.textContent = message;
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function createInitialSnake() {
  const center = Math.floor(BOARD_SIZE / 2);
  return [
    { x: center - 1, y: center },
    { x: center - 2, y: center },
    { x: center - 3, y: center }
  ];
}

function spawnFood() {
  let newFood;
  do {
    newFood = { x: randomInt(BOARD_SIZE), y: randomInt(BOARD_SIZE) };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}

function resetGame() {
  snake = createInitialSnake();
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  food = spawnFood();
  score = 0;
  gameSpeed = BASE_SPEED;
  lastFrameTime = 0;
  accumulatedTime = 0;
  isPaused = false;
  isGameOver = false;
  blinkTimer = 0;
  blinkVisible = true;
  scoreEl.textContent = score;
  speedEl.textContent = `${(gameSpeed / BASE_SPEED).toFixed(1)}x`;
  setStatus('Press space or tap ⏯ to pause.');
}

function updateSpeed() {
  const level = Math.floor(score / 5);
  gameSpeed = Math.min(BASE_SPEED + level * SPEED_STEP, MAX_SPEED);
  const multiplier = (gameSpeed / BASE_SPEED).toFixed(1);
  speedEl.textContent = `${multiplier}x`;
}

function moveSnake() {
  const head = snake[0];
  const newHead = {
    x: head.x + nextDirection.x,
    y: head.y + nextDirection.y
  };

  direction = { ...nextDirection };

  if (
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= BOARD_SIZE ||
    newHead.y >= BOARD_SIZE ||
    snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 1;
    scoreEl.textContent = score;
    highScore = Math.max(score, highScore);
    highScoreEl.textContent = highScore;
    localStorage.setItem('snake-high-score', highScore);
    food = spawnFood();
    updateSpeed();
  } else {
    snake.pop();
  }
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Snake
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#0c2f0c' : '#1b4d1b';
    ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#0f1f0f';
    ctx.strokeRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  });

  // Food (blink)
  if (blinkVisible) {
    ctx.fillStyle = '#d7f171';
    ctx.beginPath();
    ctx.arc(
      food.x * TILE_SIZE + TILE_SIZE / 2,
      food.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function update(timestamp) {
  if (isPaused || isGameOver) {
    requestAnimationFrame(update);
    return;
  }

  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  accumulatedTime += delta;
  blinkTimer += delta;

  const frameDuration = 1000 / gameSpeed;

  while (accumulatedTime > frameDuration) {
    accumulatedTime -= frameDuration;
    moveSnake();
    if (isGameOver) break;
  }

  if (blinkTimer > 250) {
    blinkVisible = !blinkVisible;
    blinkTimer = 0;
  }

  drawBoard();
  requestAnimationFrame(update);
}

function endGame() {
  isGameOver = true;
  setStatus('Game over! Press Enter to play again.');
}

function togglePause() {
  if (isGameOver) {
    resetGame();
    return;
  }
  isPaused = !isPaused;
  setStatus(isPaused ? 'Paused' : 'Press space or tap ⏯ to pause.');
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  switch (key) {
    case 'arrowup':
    case 'w':
      if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
      break;
    case 'arrowdown':
    case 's':
      if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
      break;
    case 'arrowleft':
    case 'a':
      if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
      break;
    case 'arrowright':
    case 'd':
      if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
      break;
    case ' ':
      event.preventDefault();
      togglePause();
      break;
    case 'enter':
      if (isGameOver) {
        resetGame();
      }
      break;
    default:
      break;
  }
}

function handleControlButton(event) {
  const directionKey = event.currentTarget.dataset.dir;
  switch (directionKey) {
    case 'up':
      if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
      break;
    case 'down':
      if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
      break;
    case 'left':
      if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
      break;
    case 'right':
      if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
      break;
    default:
      break;
  }
}

pauseBtn.addEventListener('click', togglePause);
controlButtons.forEach(button => {
  button.addEventListener('click', handleControlButton);
  button.addEventListener('touchstart', handleControlButton, { passive: true });
});

document.addEventListener('keydown', handleKeydown);

canvas.addEventListener('touchstart', event => {
  // Focus canvas for mobile keyboard events
  canvas.focus({ preventScroll: true });
});

resetGame();
requestAnimationFrame(update);
