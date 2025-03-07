const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const scoreTag = document.createElement("p");
document.body.appendChild(scoreTag);
let score = 0;
scoreTag.textContent = `Ball Count: ${score}`;

const timerTag = document.createElement("p");
timerTag.classList.add("timer")
document.body.appendChild(timerTag);
let startTime = null;
let elapsedTime = 0;

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

class Shape {
  constructor(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }
}

class Ball extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY);
    this.color = color;
    this.size = size;
    this.exists = true;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    if (this.x + this.size >= width || this.x - this.size <= 0) {
      this.velX = -this.velX;
    }
    if (this.y + this.size >= height || this.y - this.size <= 0) {
      this.velY = -this.velY;
    }
    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    for (const ball of balls) {
      if (!(this === ball) && this.exists && ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.size + ball.size) {
          ball.color = this.color = randomRGB();
        }
      }
    }
  }
}

class EvilCircle extends Shape {
  constructor(x, y) {
    super(x, y, 7, 7);
    this.color = "rgb(255,255,255)";
    this.size = 15;
  }

  draw() {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  }

  move() {
    if (keys["a"]) this.x -= this.velX;
    if (keys["d"]) this.x += this.velX;
    if (keys["w"]) this.y -= this.velY;
    if (keys["s"]) this.y += this.velY;
  }

  checkBounds() {
    this.x = Math.max(this.size, Math.min(width - this.size, this.x));
    this.y = Math.max(this.size, Math.min(height - this.size, this.y));
  }

  collisionDetect() {
    for (const ball of balls) {
      if (ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + ball.size) {
          ball.exists = false;
          score++;
          scoreTag.textContent = `Ball Count: ${score}`;
          this.color = randomRGB();
          this.size += 10;
          this.velX += 1.5;
          this.velY += 1.5 ;
        }
      }
    }
  }
}

const balls = [];
while (balls.length < 25) {
  const size = random(10, 20);
  balls.push(new Ball(random(size, width - size), random(size, height - size), random(-7, 7), random(-7, 7), randomRGB(), size));
}

const evilBall = new EvilCircle(random(10, width - 10), random(10, height - 10));

const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function updateTimer() {
  if (startTime !== null) {
    elapsedTime = (performance.now() - startTime) / 1000;
    timerTag.textContent = `Time: ${elapsedTime.toFixed(2)}s`;
  }
}

function checkGameEnd() {
  if (balls.every(ball => !ball.exists)) {
    timerTag.textContent = `Final Time: ${elapsedTime.toFixed(2)}s`;
    return true;
  }
  return false;
}

let animationFrame;

function loop() {
  if (startTime === null) startTime = performance.now();

  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);

  balls.forEach(ball => {
    if (ball.exists) {
      ball.draw();
      ball.update();
      ball.collisionDetect();
    }
  });

  evilBall.move();
  evilBall.draw();
  evilBall.checkBounds();
  evilBall.collisionDetect();

  updateTimer();

  if (!checkGameEnd()) {
    animationFrame = requestAnimationFrame(loop);
  }
}

loop();