const canvas = document.getElementById("canvas");
const scoreDOM = document.getElementById("score");
const finalScore = document.getElementById("final-score");
const topScoreModal = document.getElementById("top-score");
const topScoreDOM = document.getElementById("top-score-dom");
const startBtn = document.getElementById("start-btn");
const modelEl = document.getElementById("modelEl");

const c = canvas.getContext("2d");
let topScore = localStorage.getItem("ballShooterTopScore");
let score = 0;

let cursorX;
let cursorY;

document.onmousemove = (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
};

if (topScore) {
  topScoreModal.innerText = topScore;
  topScoreDOM.innerText = topScore;
} else {
  topScoreModal.innerText = "NONE";
  topScoreDOM.innerText = "NONE";
}

scoreDOM.innerText = score;

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

function updateScore() {
  topScore = localStorage.getItem("ballShooterTopScore");
  if (topScore < score) {
    localStorage.setItem("ballShooterTopScore", score);
    topScoreModal.innerText = score;
  } else {
    topScoreModal.innerText = topScore;
  }
  topScoreModal.innerText = localStorage.getItem("ballShooterTopScore");
  finalScore.innerText = score;
  scoreDOM.innerText = 0;
  score = 0;
}

class Cursor {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, 10, 0, Math.PI * 2, false);
    c.strokeStyle = "#fff";
    c.stroke();
  }

  update(x, y) {
    this.x = x;
    this.y = y;
    this.draw();
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 20, "#fff");
let projectiles = [];
let enemies = [];
let particles = [];
let cursor = new Cursor(cursorX, cursorY);

let velocityTimes = 1.0;
let interval;

function init() {
  player = new Player(x, y, 20, "#fff");
  projectiles = [];
  enemies = [];
  particles = [];
  cursor = new Cursor(cursorX, cursorY);
  score = 0;
  scoreDOM.innerText = 0;
  velocityTimes = 1.0;
  topScoreDOM.innerText = localStorage.getItem("ballShooterTopScore");
}

function spawnEnemies() {
  interval = setInterval(() => {
    const radius = Math.random() * (50 - 10) + 10;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const randomHue = Math.floor(Math.random() * 360);
    const color = `hsl(${randomHue}, 70%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle) * velocityTimes,
      y: Math.sin(angle) * velocityTimes,
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
    console.log(enemies);
  }, 1000);
}

let animationId;
const animate = () => {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, 0.3)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  particles.forEach((particle, i) => {
    if (particle.alpha <= 0) {
      particles.splice(i, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, i) => {
    projectile.update();

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(i, 1);
      }, 0);
    }
  });
  enemies.forEach((enemy, eIndex) => {
    enemy.update();

    const pDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (pDist - player.radius - enemy.radius < 1) {
      setTimeout(() => {
        cancelAnimationFrame(animationId);
        clearInterval(interval);
        updateScore();
        modelEl.style.display = "flex";
      }, 0);
    }

    projectiles.forEach((projectile, pIndex) => {
      const eDist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      if (eDist - projectile.radius - enemy.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 3,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }
        if (enemy.radius - 10 > 15) {
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(pIndex, 1);
            scoreDOM.innerText = score++;
          }, 0);
        } else {
          setTimeout(() => {
            enemies.splice(eIndex, 1);
            projectiles.splice(pIndex, 1);
            velocityTimes = velocityTimes + 0.03;
            scoreDOM.innerText = score += 10;
          }, 0);
        }
      }
    });
  });
  cursor.update(cursorX, cursorY);
  //   console.log(animationId)
};
function handleAttack(e) {
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle) * 5.2,
    y: Math.sin(angle) * 5.2,
  };

  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "#fff", velocity)
  );
}

addEventListener("click", (e) => handleAttack(e));

startBtn.addEventListener("click", (e) => {
  init();
  animate();
  spawnEnemies();

  modelEl.style.display = "none";
});
