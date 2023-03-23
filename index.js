const SWING_FREQ = 1.3 * 2*Math.PI;
const ARM_AMPL = 30;
const BEEN_AMPL = 15;

const WINDOW_WIDTH = 800;
const WINDOW_HEIGHT = 600;
const MIN_OBST_DIST = 300;
const JUMP_HEIGHT = 50;
const JUMP_DURATION = 0.5;

const tekening = document.getElementById("tekening");
tekening.setAttribute("width", WINDOW_WIDTH);
tekening.setAttribute("height", WINDOW_HEIGHT);
tekening.setAttribute("viewBox", `${0} ${-WINDOW_HEIGHT/2} ${WINDOW_WIDTH} ${WINDOW_HEIGHT}`);

// Maak kopie van obstakel en verwijder oorspronkelijke uit tekening
const obstakelOrig = document.getElementById("obstakel");
const obstakel = obstakelOrig.cloneNode(true);
obstakelOrig.remove();

// Doe hetzelfde voor het leven-tekeningetje
const levenOrig = document.getElementById("leven");
const leven = levenOrig.cloneNode(true);
levenOrig.remove();

function step() {
  updateModel();
  updateView();

  if (isGameOver()) {
    if (isHighScore()) {
      saveHighScore();
      updateView();
    }
    window.alert("GAME OVER!")
  } else {
    window.requestAnimationFrame(step);
  }
}

function updateModel() {
  updateModelTime();
  updateModelXY();
  updateModelObstacles();
  updateModelLevens();
}

function updateView() {
  updateObstaclesView();
  updateScoreView();
  updateHighScoreView();
  updateLevensView();
  updateCreatureView();
}

function updateModelTime() {
  const timestamp = Date.now() / 1000;

  if (MODEL.startTime === null) {
    MODEL.startTime = timestamp;
  }

  MODEL.prevTime = MODEL.time;
  MODEL.time = timestamp - MODEL.startTime;
}

function updateModelXY() {
  const dt = MODEL.time - MODEL.prevTime;
  MODEL.x += dt * MODEL.speed;
  MODEL.y = computeModelY();
}

function updateModelObstacles() {
  removeOldObstacles();

  if (shouldAddNewObstacle()) {
    addNewObstacle();
  }
}

function updateModelLevens() {
  if (detectCollision()) {
    removeLeven();
  }
}

function computeModelY() {
  if (!MODEL.jumping) {
    MODEL.prevJumping = false;
    return 0;
  }
  if (!MODEL.prevJumping) {
    MODEL.jumpStart = MODEL.time;
    MODEL.prevJumping = true;
  }
  const t = MODEL.time - MODEL.jumpStart;

  const y = 4 * JUMP_HEIGHT/Math.pow(JUMP_DURATION, 2) * Math.pow(t, 2) - 4*JUMP_HEIGHT/JUMP_DURATION * t;
  if (y > 0) {
    MODEL.jumping = false;
    return 0;
  }
  return y;
}

function detectCollision() {
  let isCollided = false;

  MODEL.obstacles.forEach(o => {
    if (
      MODEL.x >= o.x
        && MODEL.x < o.x + o.width
        && MODEL.y > o.y - o.height
        && MODEL.y <= o.y
        && !o.collided
        && !isCollided
    ) {
      isCollided = true;
      o.collided = true;
    }
  });

  return isCollided;
}

function removeOldObstacles() {
  MODEL.obstacles = MODEL.obstacles.filter(
    o => {
      if (o.x < MODEL.x - WINDOW_WIDTH/2) {
        o.el.remove();
        return false;
      }
      return true;
    }
  );
}

function shouldAddNewObstacle() {
  return MODEL.obstacles.length === 0
    || (
      MODEL.x + WINDOW_WIDTH/2
      - MODEL.obstacles[MODEL.obstacles.length - 1].x
      > MIN_OBST_DIST
  );
}

function addNewObstacle() {
  const newObs = obstakel.cloneNode(true);
  tekening.appendChild(newObs);
  const bbox = newObs.getBBox();

  MODEL.obstacles.push({
    x: MODEL.x + WINDOW_WIDTH/2 + Math.random()*MIN_OBST_DIST,
    y: 0,
    el: newObs,
    width: bbox.width,
    height: bbox.height,
    collided: false,
  });
}

function removeLeven() {
  const el = MODEL.levens.pop();
  el.remove();
}

function updateObstaclesView() {
  MODEL.obstacles.forEach(o => {
    o.el.setAttribute("transform", `translate(${o.x - MODEL.x + WINDOW_WIDTH/2},${o.y - o.el.getBBox().height})`);
  });
}

function updateLevensView() {
  MODEL.levens.forEach((el, i) => {
    const bbox = el.getBBox();
    el.setAttribute("transform", `translate(${WINDOW_WIDTH - 2*(i + 1)*bbox.width},${-WINDOW_HEIGHT/2 + bbox.height})`);
  });
}

function updateScoreView() {
  const score = document.getElementById("score")
  score.innerHTML = `Score: ${getScore()}`;
}

function updateHighScoreView() {
  const highScoreEl = document.getElementById("high-score");
  const highScore = getHighScore();

  if (highScore !== null) {
    highScoreEl.innerHTML = `High score: ${highScore}`;
  }
}

function updateCreatureView() {
  updateCreaturePositionView()
  updateCreaturePoseView()
}

function updateCreaturePositionView() {
  const wezen = document.getElementById("wezen");
  wezen.setAttribute("transform", `translate(${WINDOW_WIDTH/2}, ${MODEL.y - wezen.getBBox().height})`);
}

function jump() {
  MODEL.jumping = true;
}

function resetGame() {
  if (MODEL.obstacles !== undefined) {
    MODEL.obstacles.forEach(o => o.el.remove());
  }
  if (MODEL.levens !== undefined) {
    MODEL.levens.forEach(el => el.remove());
  }
  MODEL.x = 0;
  MODEL.y = 0;
  MODEL.speed = 500;
  MODEL.obstacles = [];
  MODEL.levens = Array(3).fill(null).map(x => {
    const el = leven.cloneNode(true);
    tekening.appendChild(el);
    return el;
  });

  MODEL.jumping = false;
  MODEL.prevJumping = false;
  MODEL.jumpStart = null;

  MODEL.time = null;
  MODEL.startTime = null;
  MODEL.prevTime = null;
}

function restartGame() {
  resetGame();
  window.requestAnimationFrame(step);
}

function getScore() {
  return Math.round(MODEL.x / 100);
}

function saveHighScore() {
  document.cookie = `highScore=${getScore()}`;
}

function isHighScore() {
  return getScore() > getHighScore();
}

function getHighScore() {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("highScore="))
    ?.split("=")[1];
  return cookieValue !== undefined ?
      parseInt(cookieValue)
      : null;
}

function isGameOver() {
  return MODEL.levens.length === 0;
}

function handleClick() {
  if (isGameOver()) {
    restartGame();
  } else {
    jump();
  }
}

const MODEL = {};

document.addEventListener('touchstart', handleClick);
document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
    handleClick()
  }
});

restartGame();