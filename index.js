const WEZEN_ID = "wezen";
const R_BEEN_ID = "rechterbeen";
const L_BEEN_ID = "linkerbeen";
const R_ARM_ID = "rechterarm";
const L_ARM_ID = "linkerarm";
const SCORE_ID = "score";
const HIGH_SCORE_ID = "high-score";
const OBSTAKEL_ID = "bom";
const LEVEN_ID = "leven";

const WINDOW_WIDTH = Math.min(screen.width, 600);
const WINDOW_HEIGHT = Math.min(screen.height, 400);

const svgNS = "http://www.w3.org/2000/svg";

const tekening = document.getElementsByTagName("svg")[0];
tekening.setAttributeNS(null, "viewBox", `0 0 ${WINDOW_WIDTH} ${WINDOW_HEIGHT}`);

const creature = document.getElementById(WEZEN_ID);

const obstakelOrig = document.createElementNS(svgNS, "g");
obstakelOrig.id = OBSTAKEL_ID;
obstakelOrig.innerHTML = `
    <g transform="scale(0.5)">
    <ellipse cx="579.77" cy="499.62" fill="#000000" id="svg_22" rx="22.52" ry="22.52" stroke-width="0"/>
    <path d="m579.39,473.28c0,-20.61 19.85,-23.66 19.85,-23.66" fill="none" id="svg_24" stroke="#999999" stroke-width="2"/>
    <rect fill="#000000" height="12.21" id="svg_23" stroke-width="0" width="12.21" x="573.66" y="468.7"/>
    </g>
`;
tekening.appendChild(obstakelOrig);
const levenOrig = document.createElementNS(svgNS, "g");
levenOrig.id = LEVEN_ID;
levenOrig.innerHTML = `
    <g transform="scale(0.6)">
      <path d="m764.12,103.05c0,-13.74 -26.72,-19.08 -26.72,1.53c0,20.61 23.67,16.79 24.43,34.35" fill="#FFAAB8" id="svg_26"/>
      <path d="m758.78,103.05c0,-13.74 24.43,-19.08 24.43,1.53c0,20.61 -21.64,16.79 -22.34,34.35" fill="#FFAAB8" id="svg_27"/>
    </g>
`;
tekening.appendChild(levenOrig);


const scoreEl = document.createElementNS(svgNS, "text");
scoreEl.id = SCORE_ID;
scoreEl.setAttributeNS(null, "x", "789");
scoreEl.setAttributeNS(null, "y", "33");
scoreEl.setAttributeNS(null, "font-size", "24");
scoreEl.setAttributeNS(null, "font-family", "&#x27;Quicksand&#x27;");
scoreEl.setAttributeNS(null, "font-weight", "normal");
scoreEl.setAttributeNS(null, "text-anchor", "end");
scoreEl.setAttributeNS(null, "fill", "#000000");
const scoreTextNode = document.createTextNode("Score: 0");
scoreEl.appendChild(scoreTextNode);
tekening.appendChild(scoreEl);

const hScoreEl = document.createElementNS(svgNS, "text");
hScoreEl.id = HIGH_SCORE_ID;
hScoreEl.setAttributeNS(null, "x", "789");
hScoreEl.setAttributeNS(null, "y", "67");
hScoreEl.setAttributeNS(null, "font-size", "24");
hScoreEl.setAttributeNS(null, "font-family", "&#x27;Quicksand&#x27;");
hScoreEl.setAttributeNS(null, "font-weight", "normal");
hScoreEl.setAttributeNS(null, "text-anchor", "end");
hScoreEl.setAttributeNS(null, "fill", "#000000");
const hScoreTextNode = document.createTextNode("High Score: 0");
hScoreEl.appendChild(hScoreTextNode);
// tekening.appendChild(hScoreEl);

const origCreatureBBox = creature.getBBox();

const origObstakelBBox = obstakelOrig.getBBox();
const origLevenBBox = levenOrig.getBBox();

const CREATURE_HEIGHT = 1/4 * WINDOW_HEIGHT;
const CREATURE_SCALE = CREATURE_HEIGHT/origCreatureBBox.height;
const CREATURE_WIDTH = CREATURE_SCALE*origCreatureBBox.width;

const OBSTAKEL_HEIGHT = 1/10 * WINDOW_HEIGHT;
const OBSTAKEL_SCALE = OBSTAKEL_HEIGHT/origObstakelBBox.height;
const OBSTAKEL_WIDTH = OBSTAKEL_SCALE * origObstakelBBox.width;

const LEVEN_HEIGHT = 1/10 * WINDOW_HEIGHT;
const LEVEN_SCALE = LEVEN_HEIGHT/origLevenBBox.height;
const LEVEN_WIDTH = LEVEN_SCALE * origLevenBBox.width;

const JUMP_HEIGHT = OBSTAKEL_HEIGHT*2;
const JUMP_DURATION = 0.5;
const MIN_OBST_DIST = OBSTAKEL_WIDTH * 15;
const SPEED = WINDOW_WIDTH/2;

const obstakel = obstakelOrig.cloneNode(true);
const leven = levenOrig.cloneNode(true);

const MODEL = {};
resetGame();

obstakelOrig.remove();
levenOrig.remove();
tekening.setAttribute("height", WINDOW_HEIGHT);
tekening.setAttribute("width", WINDOW_WIDTH);

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
  updateCreaturePositionView();

  const rBeen = document.getElementById(R_BEEN_ID);
  const lBeen = document.getElementById(L_BEEN_ID);
  const rArm = document.getElementById(R_ARM_ID);
  const lArm = document.getElementById(L_ARM_ID);

  [rBeen, lBeen, rArm, lArm].forEach(el => {
    const bbox = el.getBBox();
    el.setAttribute("transform-origin", `${bbox.x + bbox.width/2} ${bbox.y + bbox.height/10}`);
  })

  scoreEl.setAttribute("text-anchor", "start");
  hScoreEl.setAttribute("text-anchor", "start");
  const scoreElBBox = scoreEl.getBBox();
  const hScoreElBBox = hScoreEl.getBBox();
  scoreEl.setAttribute("transform", `translate(0,${scoreElBBox.height}) translate(${-scoreElBBox.x},${-scoreElBBox.y})`);
  hScoreEl.setAttribute("transform", `translate(0,${2*scoreElBBox.height}) translate(${-hScoreElBBox.x},${-hScoreElBBox.y})`);
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
        && MODEL.x < o.x + OBSTAKEL_WIDTH
        && MODEL.y > o.y - OBSTAKEL_HEIGHT
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
      if (o.x < MODEL.x - WINDOW_WIDTH/2 - OBSTAKEL_WIDTH) {
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
    collided: false,
  });
}

function removeLeven() {
  const el = MODEL.levens.pop();
  el.remove();
}

function updateObstaclesView() {
  MODEL.obstacles.forEach(o => {
    o.el.setAttribute("transform-origin", `0 0`);
    o.el.setAttribute("transform", `translate(${WINDOW_WIDTH/2 + o.x - MODEL.x},${WINDOW_HEIGHT - OBSTAKEL_HEIGHT}) scale(${OBSTAKEL_SCALE}) translate(${-origObstakelBBox.x},${-origObstakelBBox.y})`);
  });
}

function updateLevensView() {
  MODEL.levens.forEach((el, i) => {
    el.setAttribute("transform-origin", `0 0`);
    el.setAttribute("transform", `translate(${WINDOW_WIDTH - 1.5*(i + 1)*LEVEN_WIDTH},${LEVEN_HEIGHT}) scale(${LEVEN_SCALE}) translate(${-origLevenBBox.x},${-origLevenBBox.y})`);
  });
}

function updateScoreView() {
  const score = document.getElementById(SCORE_ID)
  score.innerHTML = `Score: ${getScore()}`;
}

function updateHighScoreView() {
  const highScore = getHighScore();

  if (highScore !== null) {
    hScoreEl.innerHTML = `High score: ${highScore}`;
  }
}

function updateCreatureView() {
  updateCreaturePositionView()
  updateCreaturePoseView(MODEL.time)
}

function updateCreaturePositionView() {
  creature.setAttribute("transform-origin", `0 0`);
  creature.setAttribute("transform", `translate(${WINDOW_WIDTH/2 - CREATURE_WIDTH/2},${WINDOW_HEIGHT + MODEL.y - CREATURE_HEIGHT}) scale(${CREATURE_SCALE}) translate(${-origCreatureBBox.x},${-origCreatureBBox.y})`);
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

function setCookie(name, value, hours) {
    var expires = "";
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime() + (hours*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function saveHighScore() {
  setCookie("highScore", `${getScore()}`, 24);
}

function isHighScore() {
  return getScore() > getHighScore();
}

function getHighScore() {
  const cookieValue = getCookie("highScore");
  return cookieValue !== null ?  parseInt(cookieValue) : 0;
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

document.addEventListener('touchstart', handleClick);
document.addEventListener('keydown', event => {
  if (event.code === 'Space') {
    handleClick()
  }
});

initView();
restartGame();
