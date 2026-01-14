// ===== ELEMENTS =====
const board = document.querySelector(".board");
const playBtn = document.querySelector(".btn");
const resetBtn = document.querySelector(".reset");
const displayScore = document.querySelector(".score");
const displayLevel = document.querySelector(".level");
const displayLives = document.querySelector(".lives");
const displayHighScore = document.querySelector(".high");
const gameOverEl = document.querySelector(".game-over");
const input = document.querySelector("#input");
const usernameEl = document.querySelector(".username");
const gameOverBtnEl = document.querySelector(".game-over-btn");

const boxSize = 50;

// ===== STATES =====
let rows;
let cols;
let blocks = [];
let intervalId = null;
let snake = [{ x: Math.floor(rows / 2), y: Math.floor(cols / 2) }];
let food = {};
let direction = "right"; // movement
let nextDirection = "right"; // movement
let headDirection = "right"; // eyes


let score = Number(localStorage.getItem("score")) || 0;
let level = Number(localStorage.getItem("level")) || 0;
let lives = Number(localStorage.getItem("lives")) || 3;
let speed = Number(localStorage.getItem("speed")) || 600;
let highScore = Number(localStorage.getItem("highScore")) || 25;

displayScore.innerText = `Score : ${score}`;
displayLevel.innerText = `Level : ${level}`;
displayLives.innerText = `Lives : ${lives}`;
displayHighScore.innerText = `HighScore : ${highScore}`;

// ===== CREATE BOARD =====

function createGrid() {
  board.innerHTML = "";
  blocks = [];

  rows = Math.floor(board.clientHeight / boxSize);
  cols = Math.floor(board.clientWidth / boxSize);

  board.style.gridTemplateColumns = `repeat(${cols}),$({boxSize}px)`;
  board.style.gridTemplateRows = `repeat(${rows}),$({boxSize}px)`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const box = document.createElement("div");
      box.classList.add("box");
      board.appendChild(box);
      blocks[`${row}-${col}`] = box;
    }
  }
}

// ===== RENDER SNAKE  =====
function renderSnake() {
  snake.forEach((part, index) => {
    const box = blocks[`${part.x}-${part.y}`];
    if (!box) return;

    if (index === 0) {
      box.classList.add("snake-head", headDirection); // instant eyes
    } else {
      box.classList.add("snake");
    }
  });
}

// ===== RESPAWN SNAKE  =====
function respawnSnake() {
  const length = snake.length || 3;
  const startX = Math.floor(rows / 2);
  const startY = Math.floor(cols / 2);

  snake = [];

  for (let i = 0; i < length; i++) {
    snake.push({ x: startX, y: startY - i });
  }

  direction = "right";
  nextDirection = "right";
  headDirection = "right";

  renderSnake();
}

// ===== FOOD =====
function renderFood() {
  do {
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
  } while (snake.some((p) => p.x === food.x && p.y === food.y));

  blocks[`${food.x}-${food.y}`].classList.add("food");
}

// ===== GAME LOOP =====
function startGame() {
  clearInterval(intervalId);

  intervalId = setInterval(() => {
    direction = nextDirection; // APPLY buffered direction ONCE

    let head = { ...snake[0] };

    if (direction === "right") head.y++;
    if (direction === "left") head.y--;
    if (direction === "up") head.x--;
    if (direction === "down") head.x++;

    // WALL COLLISION
    if (head.x < 0 || head.y < 0 || head.x >= rows || head.y >= cols) {
      loseLife();
      return;
    }

    // SELF COLLISION
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        loseLife();
        return;
      }
    }

    // FOOD
    if (head.x === food.x && head.y === food.y) {
      blocks[`${food.x}-${food.y}`].classList.remove("food");
      snake.unshift(head);
      score++;
      displayScore.innerText = `Score : ${score}`;
      localStorage.setItem("score", score);
      updateLevel();
      renderFood();
    } else {
      snake.unshift(head);
      snake.pop();
    }

    // CLEAR OLD
    document
      .querySelectorAll(".snake, .snake-head")
      .forEach((el) =>
        el.classList.remove(
          "snake",
          "snake-head",
          "up",
          "down",
          "left",
          "right"
        )
      );

    renderSnake();
    canChangeDirection = true; // UNLOCK direction
  }, speed);
}

// ===== LEVEL SYSTEM =====
function updateLevel() {
  if ([5, 10, 15, 20, 25, 40].includes(score)) {
    level++;
    speed = Math.max(80, speed - 100);
    displayLevel.innerText = `Level : ${level}`;
    localStorage.setItem("level", level);
    localStorage.setItem("speed", speed);
    startGame();
  }
}

// ===== LIFE LOST =====
function loseLife() {
  lives--;
  displayLives.innerText = `Lives : ${lives}`;
  localStorage.setItem("lives", lives);
  clearInterval(intervalId);
  playBtn.classList.remove("play");

  setTimeout(() => {
    document
      .querySelectorAll(".snake, .snake-head")
      .forEach((el) =>
        el.classList.remove(
          "snake",
          "snake-head",
          "up",
          "down",
          "left",
          "right"
        )
      );
  }, 100);

  if (lives <= 0) {
    gameOverEl.style.display = "flex";
 
    if (score > highScore) {
      localStorage.setItem("highScore", score);
    }
       resetGameState()
    return;
  }

  setTimeout(() => {
    respawnSnake();
  }, 300);

  blocks[`${food.x}-${food.y}`]?.classList.remove("food");
  renderFood();
}

function resetGameState() {
  clearInterval(intervalId);

  // Reset game state
  score = 0;
  level = 0;
  lives = 3;
  speed = 600;
  highScore = localStorage.getItem('highScore') || 25

  snake = [{ x: Math.floor(rows / 2), y: Math.floor(cols / 2) }];
  direction = "right";
  nextDirection = "right";
  headDirection = "right";
  canChangeDirection = true;

  // Update UI
  displayScore.innerText = `Score : ${score}`;
  displayLevel.innerText = `Level : ${level}`;
  displayLives.innerText = `Lives : ${lives}`;
  displayHighScore.innerText = `HighScore : ${highScore}`;

  // Save ONLY game state (not user)
  localStorage.setItem("score", score);
  localStorage.setItem("level", level);
  localStorage.setItem("lives", lives);
  localStorage.setItem("speed", speed);

  // Clear board visuals
  document
    .querySelectorAll(".snake, .snake-head, .food")
    .forEach((el) =>
      el.classList.remove(
        "snake",
        "snake-head",
        "food",
        "up",
        "down",
        "left",
        "right"
      )
    );

  // Rebuild board & snake
  render();
  // Reset play button
  playBtn.classList.remove("play");
}
// ===== CONTROLS (KEYBOARD + MOBILE) =====

document.addEventListener("keydown", (e) => {

  // Prevent page scroll on space
  if (e.key === " ") {
    e.preventDefault();
  }

  // Stop multiple direction changes in one frame
  if (!canChangeDirection) return;

  // ===== MOVEMENT KEYS =====
  if (e.key === "ArrowUp" && direction !== "down") {
    nextDirection = "up";
    headDirection = "up";

  } else if (e.key === "ArrowDown" && direction !== "up") {
    nextDirection = "down";
    headDirection = "down";

  } else if (e.key === "ArrowLeft" && direction !== "right") {
    nextDirection = "left";
    headDirection = "left";

  } else if (e.key === "ArrowRight" && direction !== "left") {
    nextDirection = "right";
    headDirection = "right";

  // ===== RESTART GAME =====
  } else if (e.key === " ") {
    gameOverEl.style.display = "none";
    resetGameState();
  }

  // Lock direction until next tick
  canChangeDirection = false;
});


// ===== MOBILE BUTTON CONTROLS =====
document.querySelector("#up").onclick = () => mobileControl("up");
document.querySelector("#down").onclick = () => mobileControl("down");
document.querySelector("#left").onclick = () => mobileControl("left");
document.querySelector("#right").onclick = () => mobileControl("right");

// ===== FOR MOBILE BUTTON CONTROL =====
gameOverBtnEl.addEventListener('click',()=>{
  gameOverEl.style.display = "none";
    resetGameState();
})  


// ===== MOBILE CONTROL FUNCTION =====
function mobileControl(dir) {

  // Move Up
  if (dir === "up" && direction !== "down") {
    nextDirection = "up";
    headDirection = "up";
  }

  // Move Down
  if (dir === "down" && direction !== "up") {
    nextDirection = "down";
    headDirection = "down";
  }

  // Move Left
  if (dir === "left" && direction !== "right") {
    nextDirection = "left";
    headDirection = "left";
  }

  // Move Right
  if (dir === "right" && direction !== "left") {
    nextDirection = "right";
    headDirection = "right";
  }
}



// ===== BUTTONS =====
playBtn.addEventListener("click", function () {
  startGame();
  playBtn.classList.add("play");
});

resetBtn.addEventListener("click", () => {
  resetGameState();
});

// THROTTLING CONCEPT FOR CALCULATING GRID WHILE RESIZING THE SCREEN
function throttle(fn, delay) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

let onResize = throttle(function () {
  clearInterval(intervalId);
  playBtn.classList.remove("play");
  render();
}, 100);

window.addEventListener("resize", onResize);

// INIT

function render() {
  createGrid();
  respawnSnake();
  renderFood();
  renderSnake();
}

render();

window.addEventListener("load", () => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) {
    usernameEl.innerText = `Player: ${savedUser}`;
  } else {
    usernameEl.innerText = "Player: Guest";
  }
});

// ================= OVERLAY ELEMENTS =================
const landingOverlay = document.querySelector(".landing-overlay");
const signinOverlay = document.querySelector(".signin-overlay");
const signupOverlay = document.querySelector(".signup-overlay");

// ================= LANDING BUTTONS =================
const playGuestBtn = document.querySelector(".action-btn.guest");
const openSigninBtn = document.querySelector(".action-btn.signin");
const openSignupBtn = document.querySelector(".action-btn.signup");

// ================= BACK BUTTONS =================
const backBtns = document.querySelectorAll(".back-btn");

// ================= INITIAL LOAD =================
window.addEventListener("load", () => {
  landingOverlay.style.display = "flex";
  signinOverlay.style.display = "none";
  signupOverlay.style.display = "none";
});

// ================= PLAY AS GUEST =================
playGuestBtn.addEventListener("click", () => {
  landingOverlay.style.display = "none";
});

// ================= OPEN SIGN IN =================
openSigninBtn.addEventListener("click", () => {
  landingOverlay.style.display = "none";
  signinOverlay.style.display = "flex";
});

// ================= OPEN SIGN UP =================
openSignupBtn.addEventListener("click", () => {
  landingOverlay.style.display = "none";
  signupOverlay.style.display = "flex";
});

// ================= BACK BUTTONS =================
backBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    signinOverlay.style.display = "none";
    signupOverlay.style.display = "none";
    landingOverlay.style.display = "flex";
  });
});

// ================= AUTH FORM PREVENT RELOAD =================
document.querySelectorAll(".auth-form").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Auth successful (demo)");
    signinOverlay.style.display = "none";
    signupOverlay.style.display = "none";
  });
});

window.addEventListener("load", () => {
  const savedUser = localStorage.getItem("username");
  if (savedUser) {
    usernameEl.innerText = `Player: ${savedUser}`;
  } else {
    usernameEl.innerText = "Player: Guest";
  }
});
