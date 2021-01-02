/*!
 tanks
 */

let NUM_PLAYERS = 2;
const PLAYER_COLORS = ["null", "red", "yellow", "purple,", "blue", "black"];

//////////////////////////////////////
class Tank {
  constructor(x, y, playerNumber) {
    this.x = x;
    this.y = y;
    this.playerNumber = playerNumber;
    this.hitpoints = 1;
    this.turret = {
      angle: getRandomInt(10, 170),
    };
  }
  // tank methods
  fire() {
    console.log("SHOT FIRED!");
  }
}

//////////////////////////////////////
// returns random int >= low && < high
const getRandomInt = function (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
};

//////////////////////////////////////
// http://www.dhtmlgoodies.com/tutorials/canvas-clock/
function degreesToRadians(degrees) {
  return (Math.PI / 180) * degrees;
}

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
  if (numSlopes === 0) {
    // ctx.beginPath();
    ctx.rect(0, height * 0.7, width, height);
    ctx.fillStyle = "#00EE00";
    ctx.fill();
    return;
  }
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
  ctxL.lineTo(width, height); // to bottom right corner
  ctxL.lineTo(0, canvasLandscape.height); // to bottom left corner
  ctxL.closePath(); // back to start
  ctxL.fillStyle = "#00EE00";
  ctxL.fill();
};

//////////////////////////////////////
// DRAW PLAYERS
const drawPlayers = function (ctx, tankObjects) {
  for (let tank of tankObjects) {
    // TANK BODY
    ctx.beginPath();
    ctx.arc(tank.x, tank.y, 10, 0, 2 * Math.PI);
    // cycle thru colors array CONSTANT for fill
    ctx.fillStyle = PLAYER_COLORS[tank.playerNumber];
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();

    // TURRET
    // rotate turret based on the tank center
    // 0deg all the way left, 180deg all the way right
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(degreesToRadians(tank.turret.angle));
    ctx.beginPath();
    ctx.moveTo(-35, 0);
    ctxL.lineTo(-10, 0);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
    console.log(tank);
  }
};

/// SCREEN LOAD
const canvasLandscape = document.querySelector("#landscape");
canvasLandscape.height = 400;
canvasLandscape.width = canvasLandscape.height * 2;
const ctxL = canvasLandscape.getContext("2d");

// DRAW SKY AND GROUND
// 0 as numSlopes bypasses random function and just adds a rectangle
drawBackground(ctxL, canvasLandscape.width, canvasLandscape.height, 0, 1);

// SECOND CANVAS FOR MOVING GAME ELEMENTS
const canvas = document.querySelector("#gameplay");
canvas.height = 400;
canvas.width = canvas.height * 2;
const ctx = canvasLandscape.getContext("2d");

// CREATE TANK OBJECTS
const tankObjects = [];
for (i = 1; i <= NUM_PLAYERS; i++) {
  // space out tanks evenly along horizontal
  const tank = new Tank(Math.floor((canvas.width * i) / (NUM_PLAYERS + 1)), canvas.height * 0.7, i);
  tankObjects.push(tank);
}

// DRAW TANKS
// context canvas to draw on, array of tanks to draw
drawPlayers(ctx, tankObjects);
