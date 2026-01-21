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
const soundBtn = document.getElementById("soundToggle");
const logoutBtn = document.querySelector(".logout-btn");
const API_BASE = "http://localhost:5000/api/auth";

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
window.addEventListener("load", async () => {
  // ================== 1. GOOGLE REDIRECT TOKEN ==================
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("token");

  if (urlToken) {
    localStorage.setItem("token", urlToken);

    // clean URL
    window.history.replaceState({}, document.title, "/frontend/index.html");
  }

  // ================== 2. CHECK TOKEN ==================
  const token = localStorage.getItem("token");

  landingOverlay.style.display = "none";
  signinOverlay.style.display = "none";
  signupOverlay.style.display = "none";

  if (!token) {
    landingOverlay.style.display = "flex";
    document.querySelector(".username").textContent = "Player : Guest";
    document.body.style.visibility = "visible";
    return;
  }

  // ================== 3. FETCH USER ==================
  try {
    const res = await axios.get(`${API_BASE}/userProfile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = res.data.user;

    // ================== 4. UPDATE UI ==================
    document.querySelector(".username").textContent =
      `Player : ${user.username}`;

    landingOverlay.style.display = "none";
  } catch (err) {
    console.error("Auth failed:", err.response?.data || err.message);

    // invalid / expired token
    localStorage.removeItem("token");
    landingOverlay.style.display = "flex";
    document.querySelector(".username").textContent = "Player : Guest";
  }

  // ================== 5. SHOW PAGE ==================
  document.body.style.visibility = "visible";
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

// ================= LOGOUT =================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.reload();
});

// ================= AUTH FORM PREVENT RELOAD =================
document.querySelectorAll(".auth-form").forEach(form => {
  form.addEventListener("submit", async e => {
    e.preventDefault();

    // ================== SETUP ==================
    const type = form.dataset.type; // signup | signin
    const errorEls = form.querySelectorAll(".error");
    const formData = new FormData(form);

    const payload = {
      email: formData.get("email")?.trim(),
      password: formData.get("password")?.trim(),
    };

    if (type === "signup") {
      payload.username = formData.get("username")?.trim();
    }

    const showError = (message) => {
      errorEls.forEach(el => {
        el.style.display = "flex";
        el.textContent = message;

        setTimeout(() => {
          el.textContent = "";
          el.style.display = "none";
        }, 2000);
      });
    };

    if (type === "signup") {
      if (!payload.email || !payload.password || !payload.username) {
        showError("All fields are required");
        return;
      }
    }

    if (type === "signin") {
      if (!payload.email || !payload.password) {
        showError("Email and password are required");
        return;
      }
    }

    // ================== API CALL ==================
    try {
      
      const url =
        type === "signup"
          ? `${API_BASE}/register`
          : `${API_BASE}/login`;

      const res = await axios.post(url, payload);

      
      if (type === "signup") {
        console.log("🎉 Registered successfully!");
        form.reset()
        signupOverlay.style.display = "none";
        signinOverlay.style.display = "flex";
        return;
      }

      if (type === "signin") {
        localStorage.setItem("token", res.data.token);
        usernameEl.innerText = `Player: ${res.data.user.username}`;
        signinOverlay.style.display = "none";
        form.reset()
        console.log("✅ Logged in successfully!");
      }

    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong";
        showError(message);
    }
  });
});


// ===== GOOGLE LOGIN =====
document.getElementById("googleLogin").addEventListener("click", () => {
  window.location.href = "http://localhost:5000/api/auth/google";
});

// ===== GOOGLE RESIGTER =====
document.getElementById("googleRegister").addEventListener("click", () => {
  window.location.href = "http://localhost:5000/api/auth/google";
});

// ===== SOUND STATE =====
let soundEnabled = JSON.parse(localStorage.getItem("soundEnabled")) ?? true;

// ===== SOUNDS =====
const sounds = {
  eat: new Audio("sounds/eat.mp3"),
  crash: new Audio("sounds/crash.mp3"),
  gameOver: new Audio("sounds/gameOver.mp3"),
};

const bgMusic = new Audio("sounds/bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.35;

// sync UI on reload
syncSoundUI();

bgMusic.play();

document.addEventListener(
  "click",
  () => {
    if (soundEnabled && bgMusic.paused) {
      bgMusic.play().catch(() => {});
    }
  },
  { once: false },
);

soundBtn.addEventListener("click", () => {
  if (soundEnabled) {
    bgMusic.pause();
  } else {
    bgMusic.play().catch(() => {});
  }

  soundEnabled = !soundEnabled;
  localStorage.setItem("soundEnabled", soundEnabled);

  syncSoundUI();
});

function syncSoundUI() {
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
  soundBtn.classList.toggle("muted", !soundEnabled);
  bgMusic.muted = !soundEnabled;
}

function playSound(sound) {
  if (!soundEnabled) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

// ===== GAME CONSTANTS =====
const boxSize = 50;

// ===== STATES =====
let rows;
let cols;
let blocks = [];
let intervalId = null;
let snake = [{ x: Math.floor(rows / 2), y: Math.floor(cols / 2) }];
let food = {};
let direction = "right";
let nextDirection = "right";
let headDirection = "right";
let canChangeDirection = true;

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

// ===== RENDER SNAKE =====
function renderSnake() {
  snake.forEach((part, index) => {
    const box = blocks[`${part.x}-${part.y}`];
    if (!box) return;

    if (index === 0) {
      box.classList.add("snake-head", headDirection);
    } else {
      box.classList.add("snake");
    }
  });
}

// ===== RESPAWN SNAKE =====
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
    direction = nextDirection;

    let head = { ...snake[0] };

    if (direction === "right") head.y++;
    if (direction === "left") head.y--;
    if (direction === "up") head.x--;
    if (direction === "down") head.x++;

    if (head.x < 0 || head.y < 0 || head.x >= rows || head.y >= cols) {
      loseLife();
      return;
    }

    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        loseLife();
        return;
      }
    }

    if (head.x === food.x && head.y === food.y) {
      playSound(sounds.eat);
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

    document
      .querySelectorAll(".snake, .snake-head")
      .forEach((el) =>
        el.classList.remove(
          "snake",
          "snake-head",
          "up",
          "down",
          "left",
          "right",
        ),
      );

    renderSnake();
    canChangeDirection = true;
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
  playSound(sounds.crash);
  screenShake();
  lives--;
  displayLives.innerText = `Lives : ${lives}`;
  localStorage.setItem("lives", lives);
  clearInterval(intervalId);
  playBtn.classList.remove("play");

  if (lives <= 0) {
    gameOverEl.style.display = "flex";
    playSound(sounds.gameOver);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", score);
    }

    bgMusic.pause();
    showScore(score, highScore);
    resetGameState();
    return;
  }

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
        "right",
      ),
    );

  setTimeout(() => {
    respawnSnake();
  }, 300);

  blocks[`${food.x}-${food.y}`]?.classList.remove("food");
  renderFood();
}

// ===== RESET GAME =====
function resetGameState() {
  clearInterval(intervalId);

  score = 0;
  level = 0;
  lives = 3;
  speed = 600;
  highScore = localStorage.getItem("highScore") || 25;

  snake = [{ x: Math.floor(rows / 2), y: Math.floor(cols / 2) }];
  direction = "right";
  nextDirection = "right";
  headDirection = "right";
  canChangeDirection = true;

  displayScore.innerText = `Score : ${score}`;
  displayLevel.innerText = `Level : ${level}`;
  displayLives.innerText = `Lives : ${lives}`;
  displayHighScore.innerText = `HighScore : ${highScore}`;

  localStorage.setItem("score", score);
  localStorage.setItem("level", level);
  localStorage.setItem("lives", lives);
  localStorage.setItem("speed", speed);

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
        "right",
      ),
    );

  render();
  playBtn.classList.remove("play");
}

// ===== CONTROLS =====
document.addEventListener("keydown", (e) => {
  if (e.key === " ") e.preventDefault();
  if (!canChangeDirection) return;

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
  } else if (e.key === " ") {
    gameOverEl.style.display = "none";
    resetGameState();
  }

  canChangeDirection = false;
});

// ===== MOBILE CONTROLS =====
document.querySelector("#up").onclick = () => mobileControl("up");
document.querySelector("#down").onclick = () => mobileControl("down");
document.querySelector("#left").onclick = () => mobileControl("left");
document.querySelector("#right").onclick = () => mobileControl("right");

gameOverBtnEl.addEventListener("click", () => {
  gameOverEl.style.display = "none";
  resetGameState();
});

function mobileControl(dir) {
  if (dir === "up" && direction !== "down") {
    nextDirection = "up";
    headDirection = "up";
  }
  if (dir === "down" && direction !== "up") {
    nextDirection = "down";
    headDirection = "down";
  }
  if (dir === "left" && direction !== "right") {
    nextDirection = "left";
    headDirection = "left";
  }
  if (dir === "right" && direction !== "left") {
    nextDirection = "right";
    headDirection = "right";
  }
}

// ===== BUTTONS =====
playBtn.addEventListener("click", () => {
  startGame();
  playBtn.classList.add("play");
});

resetBtn.addEventListener("click", resetGameState);

// ===== RESIZE THROTTLING CONECEPT =====
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

let onResize = throttle(() => {
  clearInterval(intervalId);
  playBtn.classList.remove("play");
  render();
}, 100);

window.addEventListener("resize", onResize);

// ===== INIT =====
function render() {
  createGrid();
  respawnSnake();
  renderFood();
  renderSnake();
}

render();

function showScore(score, highScore) {
  document.querySelector("#yourScore").textContent = score;
  document.querySelector("#highScore").textContent = highScore;
}

function screenShake() {
  board.classList.remove("shake");
  void board.offsetWidth;
  board.classList.add("shake");
}

const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardPanel = document.getElementById("leaderboard-wrapper");
const closeBoard = document.getElementById("closeBoard");

leaderboardBtn.addEventListener("click", () => {
  leaderboardPanel.classList.add("active");
});

closeBoard.addEventListener("click", () => {
  leaderboardPanel.classList.remove("active");
});
