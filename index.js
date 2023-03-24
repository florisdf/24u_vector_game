const TEKENING_ID = "tekening";
const WEZEN_ID = "wezen";
const OBSTAKEL_ID = "obstakel";
const LEVEN_ID = "leven";
const R_BEEN_ID = "rechterbeen";
const L_BEEN_ID = "linkerbeen";
const R_ARM_ID = "rechterarm";
const L_ARM_ID = "linkerarm";
const SCORE_ID = "score";
const HIGH_SCORE_ID = "high-score"


const tekening = document.getElementById(TEKENING_ID);
const creature = document.getElementById(WEZEN_ID);
const obstakelOrig = document.getElementById(OBSTAKEL_ID);
const levenOrig = document.getElementById(LEVEN_ID);

const origCreatureBBox = creature.getBBox();
const origObstakelBBox = obstakelOrig.getBBox();
const origLevenBBox = levenOrig.getBBox();

const WINDOW_WIDTH = tekening.getAttribute("width");
const WINDOW_HEIGHT = tekening.getAttribute("height");
const JUMP_HEIGHT = origObstakelBBox.height*2;
const JUMP_DURATION = 0.5;
const MIN_OBST_DIST = origObstakelBBox.width * 15;
const SPEED = WINDOW_WIDTH/2;

const obstakel = obstakelOrig.cloneNode(true);
const leven = levenOrig.cloneNode(true);

obstakelOrig.remove();
levenOrig.remove();
tekening.setAttribute("viewBox", `${0} ${-WINDOW_HEIGHT/2} ${WINDOW_WIDTH} ${WINDOW_HEIGHT}`);

function step() {
  updateModel();
  updateView();

  if (isGameOver()) {
    if (isHighScore()) {
      saveHighScore();
      updateView();
    }
    window.requestAnimationFrame(() => window.alert("GAME OVER!"));
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

function initView() {
  const rBeen = document.getElementById(R_BEEN_ID);
  const lBeen = document.getElementById(L_BEEN_ID);
  const rArm = document.getElementById(R_ARM_ID);
  const lArm = document.getElementById(L_ARM_ID);

  [rBeen, lBeen, rArm, lArm].forEach(el => {
    const bbox = el.getBBox();
    el.setAttribute("transform-origin", `${bbox.x + bbox.width/2} ${bbox.y + bbox.height/10}`);
  })

  creature.setAttribute("transform-origin", `${origCreatureBBox.x + origCreatureBBox.width/2} ${origCreatureBBox.y + origCreatureBBox.height}`);

  const scoreEl = document.getElementById(SCORE_ID);
  const hScoreEl = document.getElementById(HIGH_SCORE_ID);
  const scoreElBBox = scoreEl.getBBox();
  const hScoreElBBox = hScoreEl.getBBox();
  scoreEl.setAttribute("transform", `translate(${-scoreElBBox.x + WINDOW_WIDTH - 1.5*scoreElBBox.width},${-scoreElBBox.y + WINDOW_HEIGHT - 4*scoreElBBox.height})`);
  hScoreEl.setAttribute("transform", `translate(${-hScoreElBBox.x + WINDOW_WIDTH - 1.5*scoreElBBox.width},${-hScoreElBBox.y + WINDOW_HEIGHT - 2*scoreElBBox.height})`)
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
    o.el.setAttribute("transform", `translate(${o.x - MODEL.x + WINDOW_WIDTH/2 - origObstakelBBox.x},${o.y - o.el.getBBox().height - origObstakelBBox.y})`);
  });
}

function updateLevensView() {
  MODEL.levens.forEach((el, i) => {
    const bbox = el.getBBox();
    el.setAttribute("transform", `translate(${WINDOW_WIDTH - 1.5*(i + 1)*bbox.width - origLevenBBox.x},${-WINDOW_HEIGHT/2 + bbox.height - origLevenBBox.y})`);
  });
}

function updateScoreView() {
  const score = document.getElementById(SCORE_ID)
  score.innerHTML = `Score: ${getScore()}`;
}

function updateHighScoreView() {
  const highScoreEl = document.getElementById(HIGH_SCORE_ID);
  const highScore = getHighScore();

  if (highScore !== null) {
    highScoreEl.innerHTML = `High score: ${highScore}`;
  }
}

function updateCreatureView() {
  updateCreaturePositionView()
  updateCreaturePoseView(MODEL.time)
}

function updateCreaturePositionView() {
  const wezen = document.getElementById(WEZEN_ID);
  wezen.setAttribute("transform", `translate(${WINDOW_WIDTH/2 - origCreatureBBox.x}, ${MODEL.y - origCreatureBBox.y - wezen.getBBox().height})`);
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
  MODEL.speed = SPEED;
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

initView();
restartGame();