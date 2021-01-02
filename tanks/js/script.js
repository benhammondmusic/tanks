/*!
 tanks
 */

//////////////////////////////////////
// returns random int >= low && < high
const getRandomInt = function (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
};

//////////////////////////////////////
// draws random elevation ground and sky
// ctx = canvas 2d context to draw on
// numSlopes = how many changes in elevatio per screen width
// steepness = %
const drawBackground = function (ctx, width, height, numSlopes, steepnessPercent) {
  // SKY
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.fillStyle = "skyblue";
  ctx.fill();

  // GROUND
  ctx.beginPath();

  let startPoint = [0, getRandomInt(height * 0.55, height)]; // TODO need to integrate steepness%
  let previousPoint = startPoint;
  let nextPoint = [];

  // random hills
  for (let i = 0; i <= numSlopes; i++) {
    nextPoint[0] = width * (i / numSlopes);
    nextPoint[1] = getRandomInt(height * 0.55, height);
    ctx.lineTo(nextPoint[0], nextPoint[1]);
    previousPoint = nextPoint;
  }

  // connect polygon
  // to bottom right corner
  ctxL.lineTo(width, height);
  // to bottom left corner
  ctxL.lineTo(0, canvasLandscape.height);
  // back to start
  ctxL.closePath();
  ctxL.fillStyle = "#00EE00";
  ctxL.fill();
};

/// SCREEN LOAD

const canvasLandscape = document.querySelector("#landscape");
canvasLandscape.height = 400;
canvasLandscape.width = canvasLandscape.height * 2;
const ctxL = canvasLandscape.getContext("2d");

// DRAW SKY AND GROUND
drawBackground(ctxL, canvasLandscape.width, canvasLandscape.height, 5, 1);
