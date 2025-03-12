const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Set initial canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Score tracking
const scoreTag = document.createElement("p");
document.body.appendChild(scoreTag);
let score = 0;
scoreTag.textContent = `Ball Count: ${score}`;

// Timer tracking
const timerTag = document.createElement("p");
timerTag.classList.add("timer");
document.body.appendChild(timerTag);
let startTime = null;
let elapsedTime = 0;

// Utility functions
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

// Base class for shapes
class Shape {
  constructor(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }
}

// Ball class
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
    if (this.x + this.size >= canvas.width || this.x - this.size <= 0) {
      this.velX = -this.velX;
    }
    if (this.y + this.size >= canvas.height || this.y - this.size <= 0) {
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

// EvilCircle class 
class EvilCircle extends Ball {
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
    this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
    this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
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
          this.velY += 1.5;
        }
      }
    }
  }
}

// Create balls
const balls = [];
while (balls.length < 25) {
  const size = random(10, 20);
  balls.push(
    new Ball(
      random(size, canvas.width - size),
      random(size, canvas.height - size),
      random(-7, 7),
      random(-7, 7),
      randomRGB(),
      size
    )
  );
}

// Create EvilCircle 
const evilBall = new EvilCircle(
  random(10, canvas.width - 10),
  random(10, canvas.height - 10)
);

// Track keyboard input
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
  if (balls.every((ball) => !ball.exists)) {
    timerTag.textContent = `Final Time: ${elapsedTime.toFixed(2)}s`;
    return true;
  }
  return false;
}

// Resize event handler
window.addEventListener("resize", () => {

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  balls.forEach(ball => {
    ball.x = Math.max(ball.size, Math.min(canvas.width - ball.size, ball.x));
    ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
  });

  evilBall.x = Math.max(evilBall.size, Math.min(canvas.width - evilBall.size, evilBall.x));
  evilBall.y = Math.max(evilBall.size, Math.min(canvas.height - evilBall.size, evilBall.y));
});


function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let ballsRemaining = false;

  balls.forEach(ball => {
    if (ball.exists) {
      ball.draw();
      ball.update();
      ball.collisionDetect();
      ballsRemaining = true;
    }
  });

 
  evilBall.x = Math.max(evilBall.size, Math.min(canvas.width - evilBall.size, evilBall.x));
  evilBall.y = Math.max(evilBall.size, Math.min(canvas.height - evilBall.size, evilBall.y));

  evilBall.move();
  evilBall.draw();
  evilBall.checkBounds();
  evilBall.collisionDetect();

  updateTimer();

  if (ballsRemaining) {
    requestAnimationFrame(loop);
  } else {
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    evilBall.draw();
    timerTag.textContent = `Final Time: ${elapsedTime.toFixed(2)}s`;
  }
}

// Start game loop
loop();