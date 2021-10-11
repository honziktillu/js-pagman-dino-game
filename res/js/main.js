/**
 * Variables
 */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreP = document.getElementById("score");
const highscoreP = document.getElementById("highscore");

const playButton = document.getElementById("playButton");
const menuWrapper = document.getElementsByClassName("menu-wrapper")[0];

const pagManImg = new Image();
pagManImg.src = "./res/img/PagMan.png";

const defaultGameSpeed = 10;
let gameSpeed = defaultGameSpeed;
let gravity = 1;
let score = 0;
let highscore = 0;
let player;
let keys = {};
let song = new Audio("./res/audio/audio.mp3");
song.volume = 0.3;

/**
 * Event listeners
 */
document.addEventListener("keydown", (e) => (keys[e.code] = true));
document.addEventListener("keyup", (e) => (keys[e.code] = false));

/**
 * Classes
 */

class Player {
  width = 50;
  height = 50;
  canJump = true;
  jumpCounter = 0;
  jumpForce = 20;
  dY = 0;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    if (keys["Space"] || keys["KeyW"]) {
      this.jump();
    } else {
      this.jumpCounter = 0;
    }
    this.y += this.dY;
    if (this.y + this.height < canvas.height) {
      this.canJump = true;
      this.dY += gravity;
    } else {
      this.canJump = false;
      this.y = canvas.height - this.height;
      this.dY = 0;
    }
    ctx.drawImage(pagManImg, this.x, this.y, this.width, this.height);
  }

  jump() {
    if (!this.canJump && this.jumpCounter === 0) {
      this.jumpCounter = 1;
      this.dY = -this.jumpForce;
      return;
    }
    if (this.jumpCounter > 0 && this.jumpCounter < this.jumpForce) {
      this.jumpCounter++;
      this.dY = -this.jumpForce - this.jumpCounter / 50;
    }
  }
}

class Obstacle {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dx = -gameSpeed;
    this.color = color;
  }

  update() {
    this.x += this.dx;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    this.dx = -gameSpeed;
  }
}

/**
 * Utils
 */

const random = (min, max) => Math.random() * (max - min) + min;

/**
 * Game logic
 */

let spawnTimerValue = 100;
let spawnTimer = spawnTimerValue;

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

playButton.onclick = () => {
  init();
  window.addEventListener("resize", resize, false);
};

const init = () => {
  menuWrapper.style.display = "none";
  song.play();
  player = new Player(50, 0);
  let savedHighScore = Cookies.get("highscore");
  if (savedHighScore !== undefined) {
    highscore = savedHighScore;
    highscoreP.innerHTML = `Highscore: ${highscore}`;
    console.log("Highscore loaded");
  } else {
    Cookies.set("highscore", 0);
    console.log("Highscore not found");
  }
  resize();
  window.requestAnimationFrame(gameLoop);
};

const gameLoop = () => {
  ctx.fillStyle = "rgb(24, 24, 27)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  spawnObstacles();
  player.update();
  score++;
  scoreP.innerHTML = `Score: ${score}`;
  if (score > highscore) {
    highscore = score;
    highscoreP.innerHTML = `Highscore: ${highscore}`;
  }
  gameSpeed += 0.005;
  window.requestAnimationFrame(gameLoop);
};

const obstacleW = 10;
let obstacles = [];

const createObstacle = () => {
  let size = random(50, 200);
  let r = random(0, 255);
  let g = random(0, 255);
  let b = random(0, 255);
  const newObstacle = new Obstacle(
    canvas.width + obstacleW,
    canvas.height - size,
    obstacleW,
    size,
    `rgb(${r}, ${g}, ${b})`
  );
  obstacles.push(newObstacle);
};

const maxObstacles = 2;
const spawnObstacles = () => {
  spawnTimer--;
  if (spawnTimer <= 0) {
    spawnTimer = spawnTimerValue - gameSpeed * 2;
    if (obstacles.length < maxObstacles) createObstacle();
    if (spawnTimer < 60) {
      spawnTimer = 60;
    }
  }

  obstacles.forEach((obstacle) => {
    if (obstacle.x + obstacle.w <= 0) {
      let size = random(50, 200);
      let r = random(0, 255);
      let g = random(0, 255);
      let b = random(0, 255);
      obstacle.x = canvas.width + obstacleW;
      obstacle.y = canvas.height - size;
      obstacle.h = size;
      obstacle.color = `rgb(${r}, ${g}, ${b})`;
    }

    if (
      player.x < obstacle.x + obstacle.w &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.h &&
      player.y + player.height > obstacle.y
    ) {
      let savedHighScore = Cookies.get("highscore");
      if (highscore > savedHighScore) Cookies.set("highscore", highscore);
      obstacles = [];
      score = 0;
      song.currentTime = 0;
      song.play();
      spawnTimer = spawnTimerValue;
      gameSpeed = defaultGameSpeed;
    }
    obstacle.update();
  });
};
