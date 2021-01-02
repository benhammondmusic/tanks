/*!
 tanks
 */

const game = {
  currentPlayer: 1,
};

let NUM_PLAYERS = 2;
const PLAYER_COLORS = ["null", "red", "yellow", "purple,", "blue", "black"];
const TURRET_INCREMENT = 5;
const terrainArray = [];

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
    return "SHOT FIRED!";
  }
}

//////////////////////////////////////
// CLEAR CANVAS
const clearCanvas = function (ctx) {
  // console.log(ctx.canvas);
  // const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas
};

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
// generate random elevation ground and sky
// numSlopes = how many changes in elevatio per screen width
// steepness = % (currently not implemented)
const generateTerrain = function (width, height, numSlopes, steepnessPercent) {
  if (numSlopes === 0) {
    terrainArray[0] = [0, height * 0.7];
    terrainArray[1] = [width, height * 0.7];
    return;
  }
  // let startPoint = [0, getRandomInt(height * 0.55, height)]; // TODO need to integrate steepness%
  // let previousPoint = startPoint;
  // let nextPoint = [];

  // random hills
  // for (let i = 0; i <= numSlopes; i++) {
  //   nextPoint[0] = width * (i / numSlopes);
  //   nextPoint[1] = getRandomInt(height * 0.55, height);
  //   ctx.lineTo(nextPoint[0], nextPoint[1]);
  //   previousPoint = nextPoint;
  // }
};

//////////////////////////////////////
// draws sky and stored terrain array
const drawBackground = function () {
  // SKY
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "skyblue";
  ctx.fill();

  // GROUND
  ctx.beginPath();
  // if (numSlopes === 0) {
  //   // ctx.beginPath();
  //   ctx.rect(0, height * 0.7, width, height);
  //   ctx.fillStyle = "#00EE00";
  //   ctx.fill();
  //   return;
  // }

  let previousPoint = terrainArray[0]; // TODO need to integrate steepness%
  let nextPoint = [];

  // random hills
  for (let i = 0; i < terrainArray.length; i++) {
    ctx.lineTo(terrainArray[i][0], terrainArray[i][1]);
  }
  // connect polygon
  ctx.lineTo(canvas.width, canvas.height); // to bottom right corner
  ctx.lineTo(0, canvas.height); // to bottom left corner
  ctx.closePath(); // back to start
  ctx.fillStyle = "#00EE00";
  ctx.fill();
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

    // DRAW TURRET
    drawTurret(tank);
  }
};

//////////////////////////////////////
// DRAW TURRET
const drawTurret = function (tank) {
  // rotate turret based on the tank center
  // 0deg all the way left, 180deg all the way right
  ctx.save();
  ctx.translate(tank.x, tank.y);
  ctx.rotate(degreesToRadians(tank.turret.angle));
  ctx.beginPath();
  ctx.moveTo(-35, 0);
  ctx.lineTo(-10, 0);
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();
  // console.log(tank);
};

//////////////////////////////////////
// ADJUST TURRET
const adjustTurret = function (amount) {
  let angle = (tankObjects[game.currentPlayer - 1].turret.angle + amount) % 180;
  if (angle < 0) {
    angle = 180;
  }

  tankObjects[0].turret.angle = angle;
  clearCanvas(ctx);
  drawBackground();
  drawPlayers(ctx, tankObjects);
};

//////////////////////////////////////
// HANDLE KEYBOARD INPUT
// https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
const listenKeys = function (e) {
  e = e || window.event; // TODO figure out what this is all about

  // TODO Figure out why == not ===

  // LEFT ARROW DECREASES ANGLE (counter clockwise across top only)
  if (e.keyCode == "37") {
    adjustTurret(TURRET_INCREMENT * -1);

    // RIGHT ARROW INCREASES ANGLE ( clockwise across top only)
  } else if (e.keyCode == "39") {
    adjustTurret(TURRET_INCREMENT);
  }

  // if (e.keyCode == "38") {
  //   // up arrow
  // } else if (e.keyCode == "40") {
  //   // down arrow
  // }
};

/// SCREEN LOAD
const canvas = document.querySelector("#canvas");
canvas.height = 400;
canvas.width = canvas.height * 2;
const ctx = canvas.getContext("2d");

// RANDOMLY GENERATE TERRAIN AND STORE TO ARRAY FOR REFRESHES
// 0 as numSlopes bypasses random function and just adds a rectangle
generateTerrain(canvas.width, canvas.height, 0, 1);

// DRAW SKY AND GROUND
drawBackground();

// CREATE TANK OBJECTS
const tankObjects = [];
for (i = 1; i <= NUM_PLAYERS; i++) {
  // space out tanks evenly along horizontal
  const tank = new Tank(Math.floor((canvas.width * i) / (NUM_PLAYERS + 1)), canvas.height * 0.7, i);
  tankObjects.push(tank);
  // console.log(`PLAYER ${tank.playerNumber}`, tank.fire());
}

// DRAW TANKS
// context canvas to draw on, array of tanks to draw
drawPlayers(ctx, tankObjects);

// LISTEN FOR USER KEYBOARD INPUT TO ADJUST TURRET ANGLE
document.onkeydown = listenKeys;

//// REDRAW TANKS

// LISTEN FOR USER KEYBOARD INPUT TO FIRE
//// ANIMATE BULLET
//// CHECK FOR COLLISION
////// ANIMATE TANK COLLISION AND END GAME
////// OR ANIMATE GROUND COLLISION AND SWITCH TURNS

// MAP MOUSE INPUT TO CORRESPONDING KEY BINDINGS

// ADD RANDOM TERRAIN, DROP TANKS APPROPRIATE HEIGHTS
