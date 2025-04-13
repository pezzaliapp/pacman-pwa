// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Definizione di base del personaggio Pac-Man
let pacman = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  speed: 2,
  direction: 0  // 0 = destra, 1 = giù, 2 = sinistra, 3 = su
};

function drawPacman() {
  ctx.beginPath();
  // Disegno di un arc per simulare il classico "mordere" del personaggio
  ctx.arc(pacman.x, pacman.y, pacman.radius, 0.2 * Math.PI, 1.8 * Math.PI);
  ctx.lineTo(pacman.x, pacman.y);
  ctx.fillStyle = 'yellow';
  ctx.fill();
  ctx.closePath();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updatePacman() {
  // Aggiorna la posizione in base alla direzione
  switch (pacman.direction) {
    case 0: // Destra
      pacman.x += pacman.speed;
      if (pacman.x - pacman.radius > canvas.width) pacman.x = -pacman.radius;
      break;
    case 1: // Giù
      pacman.y += pacman.speed;
      if (pacman.y - pacman.radius > canvas.height) pacman.y = -pacman.radius;
      break;
    case 2: // Sinistra
      pacman.x -= pacman.speed;
      if (pacman.x + pacman.radius < 0) pacman.x = canvas.width + pacman.radius;
      break;
    case 3: // Su
      pacman.y -= pacman.speed;
      if (pacman.y + pacman.radius < 0) pacman.y = canvas.height + pacman.radius;
      break;
  }
}

function gameLoop() {
  clearCanvas();
  updatePacman();
  drawPacman();
  requestAnimationFrame(gameLoop);
}

gameLoop();

// Gestione degli eventi da tastiera per cambiare la direzione
document.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowRight':
      pacman.direction = 0;
      break;
    case 'ArrowDown':
      pacman.direction = 1;
      break;
    case 'ArrowLeft':
      pacman.direction = 2;
      break;
    case 'ArrowUp':
      pacman.direction = 3;
      break;
  }
});
