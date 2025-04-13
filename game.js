// game.js

// Dimensione di ogni cella della griglia
const tileSize = 32;

// Definizione del labirinto con una matrice (7 righe x 9 colonne)
// 0 = Parete, 1 = Pellet non raccolto, 2 = Spazio vuoto
const initialMaze = [
  [0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,0],
  [0,1,0,1,0,1,0,1,0],
  [0,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0]
];
// Cloniamo il labirinto per la partita corrente
let maze = JSON.parse(JSON.stringify(initialMaze));

const rows = maze.length;
const cols = maze[0].length;

// Funzione per contare i pellet rimanenti
function countPellets() {
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] === 1) count++;
    }
  }
  return count;
}

// Variabili di gioco
let score = 0;
let level = 1;
let lives = 3;

// Utilità: dato una coordinata in pixel, determina la cella di griglia corrispondente.
function getTileIndex(x, y) {
  return { col: Math.floor(x / tileSize), row: Math.floor(y / tileSize) };
}

// =======================
// Gestione di Pac-Man
// =======================

// Partenza di Pac-Man: posizionato al centro della cella [1,1]
const pacman = {
  x: tileSize + tileSize / 2,
  y: tileSize + tileSize / 2,
  radius: tileSize / 4,
  speed: 2, // velocità in pixel per frame
  // La direzione viene gestita come vettore (vx, vy)
  vx: 0,
  vy: 0,
  // Memorizziamo la direzione richiesta dall'utente
  desiredVx: 0,
  desiredVy: 0
};

// Verifica se, andando alla posizione (x, y), Pac-Man collisiona con una parete
function isWallCollision(x, y) {
  const { col, row } = getTileIndex(x, y);
  // Se fuori dai limiti: considera come parete
  if (row < 0 || row >= rows || col < 0 || col >= cols) return true;
  return maze[row][col] === 0;
}

// Aggiorna la posizione di Pac-Man controllando prima la direzione desiderata
function updatePacman() {
  // Proviamo a cambiare direzione se l'utente ha richiesto un cambiamento
  const nextX = pacman.x + pacman.desiredVx * pacman.speed;
  const nextY = pacman.y + pacman.desiredVy * pacman.speed;
  if (!isWallCollision(nextX, nextY)) {
    pacman.vx = pacman.desiredVx;
    pacman.vy = pacman.desiredVy;
  }
  
  // Calcola la nuova posizione in base alla direzione corrente
  const newX = pacman.x + pacman.vx * pacman.speed;
  const newY = pacman.y + pacman.vy * pacman.speed;
  
  // Se la nuova posizione non comporta collisione, allora muovi Pac-Man
  if (!isWallCollision(newX, newY)) {
    pacman.x = newX;
    pacman.y = newY;
  }
  
  // Gestione della raccolta del pellet
  const { col, row } = getTileIndex(pacman.x, pacman.y);
  // Se la cella contiene un pellet, lo raccogliamo
  if (maze[row][col] === 1) {
    maze[row][col] = 2; // rimuove il pellet
    score += 10;
    
    // Se non ci sono più pellet, aumenta il livello e reimposta il labirinto
    if (countPellets() === 0) {
      levelUp();
    }
  }
}

// Disegna Pac-Man sul canvas
function drawPacman() {
  ctx.beginPath();
  // L'angolo dell'arco può essere regolato in funzione della direzione
  let startAngle = 0.25 * Math.PI;
  let endAngle = 1.75 * Math.PI;
  
  // Per semplicità, qui non ruotiamo il disegno in base alla direzione
  ctx.arc(pacman.x, pacman.y, pacman.radius, startAngle, endAngle);
  ctx.lineTo(pacman.x, pacman.y);
  ctx.fillStyle = 'yellow';
  ctx.fill();
  ctx.closePath();
}

// =======================
// Gestione del labirinto
// =======================

// Disegna il labirinto: pareti e pellet
function drawMaze() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = maze[r][c];
      const x = c * tileSize;
      const y = r * tileSize;
      
      if (cell === 0) {
        // Disegna una parete
        ctx.fillStyle = 'blue';
        ctx.fillRect(x, y, tileSize, tileSize);
      } else {
        // Disegna lo sfondo (vuoto)
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, tileSize, tileSize);
        // Se c'è un pellet, disegnalo al centro della cella
        if (cell === 1) {
          ctx.beginPath();
          ctx.fillStyle = 'white';
          // Il pellet è un piccolo cerchietto
          ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 10, 0, 2 * Math.PI);
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }
}

// =======================
// Gestione del Fantasma
// =======================

// Definiamo un percorso circolare per il fantasma (in termini di indice di griglia)
// Ad esempio, lungo il perimetro interno di parte del labirinto.
const ghostPath = [
  { col: 7, row: 1 },
  { col: 7, row: 5 },
  { col: 1, row: 5 },
  { col: 1, row: 1 }
];

const ghost = {
  // Partiamo dalla prima cella del percorso
  x: ghostPath[0].col * tileSize + tileSize / 2,
  y: ghostPath[0].row * tileSize + tileSize / 2,
  radius: tileSize / 4,
  speed: 1.5,
  targetIndex: 1  // prossima destinazione all'interno di ghostPath
};

// Aggiorna la posizione del fantasma lungo il percorso
function updateGhost() {
  // Punto di destinazione (centro della cella target)
  const targetCell = ghostPath[ghost.targetIndex];
  const targetX = targetCell.col * tileSize + tileSize / 2;
  const targetY = targetCell.row * tileSize + tileSize / 2;
  
  const dx = targetX - ghost.x;
  const dy = targetY - ghost.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Se il fantasma è molto vicino al target, passa al prossimo punto
  if (distance < ghost.speed) {
    ghost.x = targetX;
    ghost.y = targetY;
    ghost.targetIndex = (ghost.targetIndex + 1) % ghostPath.length;
  } else {
    // Muove il fantasma in modo lineare verso il target
    ghost.x += (dx / distance) * ghost.speed;
    ghost.y += (dy / distance) * ghost.speed;
  }
}

// Disegna il fantasma
function drawGhost() {
  ctx.beginPath();
  ctx.fillStyle = 'red';
  ctx.arc(ghost.x, ghost.y, ghost.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
}

// =======================
// Gestione di collisioni Pac-Man-Fantasma
// =======================

function checkGhostCollision() {
  const dx = pacman.x - ghost.x;
  const dy = pacman.y - ghost.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < pacman.radius + ghost.radius) {
    // Collisione: Pac-Man perde una vita e viene riportato alla posizione iniziale
    lives--;
    // Resetta la posizione di Pac-Man
    pacman.x = tileSize + tileSize / 2;
    pacman.y = tileSize + tileSize / 2;
    pacman.vx = 0;
    pacman.vy = 0;
    pacman.desiredVx = 0;
    pacman.desiredVy = 0;
    
    // Se le vite sono finite, si può decidere di bloccare il gioco
    if (lives <= 0) {
      alert("Game Over! Punteggio finale: " + score);
      resetGame();
    }
  }
}

// =======================
// Gestione del punteggio e livelli
// =======================

function drawHUD() {
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  ctx.fillText(`Punteggio: ${score}`, 10, 20);
  ctx.fillText(`Livello: ${level}`, 10, 40);
  ctx.fillText(`Vite: ${lives}`, 10, 60);
}

// Quando tutti i pellet sono raccolti, aumenta il livello
function levelUp() {
  level++;
  // Puoi incrementare la difficoltà, ad es. aumentando la velocità di Pac-Man o dei fantasmi
  pacman.speed += 0.5;
  ghost.speed += 0.2;
  // Ripristina il labirinto con i pellet (lasciando intatte le pareti)
  maze = JSON.parse(JSON.stringify(initialMaze));
  // Riporta Pac-Man alla posizione iniziale
  pacman.x = tileSize + tileSize / 2;
  pacman.y = tileSize + tileSize / 2;
}

// Reset completo del gioco (ad es. alla Game Over)
function resetGame() {
  score = 0;
  level = 1;
  lives = 3;
  pacman.speed = 2;
  ghost.speed = 1.5;
  maze = JSON.parse(JSON.stringify(initialMaze));
  pacman.x = tileSize + tileSize / 2;
  pacman.y = tileSize + tileSize / 2;
  pacman.vx = 0;
  pacman.vy = 0;
  pacman.desiredVx = 0;
  pacman.desiredVy = 0;
  ghost.x = ghostPath[0].col * tileSize + tileSize / 2;
  ghost.y = ghostPath[0].row * tileSize + tileSize / 2;
  ghost.targetIndex = 1;
}

// =======================
// Gestione degli input da tastiera
// =======================

document.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowRight':
      pacman.desiredVx = 1;
      pacman.desiredVy = 0;
      break;
    case 'ArrowLeft':
      pacman.desiredVx = -1;
      pacman.desiredVy = 0;
      break;
    case 'ArrowUp':
      pacman.desiredVx = 0;
      pacman.desiredVy = -1;
      break;
    case 'ArrowDown':
      pacman.desiredVx = 0;
      pacman.desiredVy = 1;
      break;
  }
});

// =======================
// Loop di gioco
// =======================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function gameLoop() {
  // Pulisci la canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Aggiorna e disegna il labirinto (inclusi pellet e pareti)
  drawMaze();
  
  // Aggiorna le posizioni di Pac-Man e del fantasma
  updatePacman();
  updateGhost();
  
  // Disegna Pac-Man e il fantasma
  drawPacman();
  drawGhost();
  
  // Verifica eventuali collisioni tra Pac-Man e il fantasma
  checkGhostCollision();
  
  // Disegna le informazioni di gioco (HUD)
  drawHUD();
  
  requestAnimationFrame(gameLoop);
}

gameLoop();
