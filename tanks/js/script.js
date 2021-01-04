/*!
 tanks
 */

// TODO: IMPLEMENT RESET BUTTON
const game = {
  currentPlayer: 1,
  nextPlayersTurn: function () {
    this.currentPlayer += 1; // rotate turns
    if (this.currentPlayer > NUM_PLAYERS) {
      this.currentPlayer = this.currentPlayer % NUM_PLAYERS; // player 1 after last player
    }
  },
};

let NUM_PLAYERS = 3;
const PLAYER_COLORS = ["orange", "red", "yellow", "purple", "blue", "black", "aqua", "pink"];
const TURRET_INCREMENT = 3;
const TANK_SIZE = 20;
const EXPLOSION_RADIUS = 20;
const terrainArray = [];
const TERRAIN_BUMPS = 20;
const STEEPNESS = 1;

//////////////////////////////////////
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

//////////////////////////////////////
class Tank {
  constructor(x, playerNumber) {
    this.x = x;
    this.y = dropItem(this).y; // lower from sky until contacts terrain shape
    this.radius = TANK_SIZE;
    this.playerNumber = playerNumber;
    this.hitpoints = 1;
    this.turret = {
      angle: 180 - getRandomInt(((playerNumber - 1) / NUM_PLAYERS) * 180, (playerNumber / NUM_PLAYERS) * 180),
      length: TANK_SIZE * 3,
    };
  }
  // tank methods
  fire() {
    let angle = this.turret.angle;
    const thisShot = new Bullet(this.x - Math.cos(degreesToRadians(angle)) * (this.turret.length + this.radius), this.y - Math.sin(degreesToRadians(angle)) * (this.turret.length + this.radius));

    // TODO: change to while loop, end condition is collision with ground, or shot off of horiztonal screen.
    // TODO: test for tank collision... need to re define tanks like redefined terrain before test
    // TODO: animate shot rather than tracing path

    for (i = 0; i < 500; i += 1) {
      // cycle through tanks and check if explosion hit them
      tankObjects.forEach((tank) => {
        if (Math.abs(tank.x - thisShot.x) < EXPLOSION_RADIUS + TANK_SIZE && Math.abs(tank.y - thisShot.y) < EXPLOSION_RADIUS + TANK_SIZE) {
          console.log("HIT!");
          showExplosion(thisShot);
          destroyGround(thisShot);
          // TODO bullet doesn't fly after hitting a tank
        }
      });

      // if no tanks were hit above, check for ground collision
      if (hitGround(thisShot)) {
        showExplosion(thisShot);
        destroyGround(thisShot);
        break;
        // check if shot went off screen horizontally.
        // TODO maybe implement wrap around shots? ? ?
      } else if (offX(thisShot)) {
        break;
      } else {
        ctx.beginPath();
        ctx.arc(thisShot.x, thisShot.y, 2, 0, 2 * Math.PI);

        // 0-180 degrees = 0 to PI radians
        // sin of radians: 0 on the sides, 1 straight up
        // bullets were going backwards, so used decrement

        // fire based on turret angle; -i gives gravity over time
        thisShot.y -= 25 * Math.sin(degreesToRadians(angle)) - i;
        thisShot.x -= 25 * Math.cos(degreesToRadians(angle));

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
}

//////////////////////////////////////
// CLEAR CANVAS
const clearCanvas = function (ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas
};

//////////////////////////////////////
// REFRESH SCREEN
const refreshScreen = function () {
  clearCanvas(ctx);
  drawBackground();
  drawPlayers(ctx, tankObjects);
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
  } else {
    for (let i = 0; i <= numSlopes; i++) {
      terrainArray[i] = [width * (i / numSlopes), getRandomInt(height * 0.55, height)];
    }
  }

  // TODO need to integrate steepness%
};

//////////////////////////////////////
// draws sky and stored terrain array
const drawBackground = function () {
  // SKY
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "skyblue";
  ctx.fill();

  defineTerrain();
  ctx.fillStyle = "#00EE00";
  ctx.fill();
};

//////////////////////////////////////
// DEFINE TERRAIN
const defineTerrain = function () {
  ctx.beginPath();

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
};

//////////////////////////////////////
// SHOW EXPLOSION
const showExplosion = function (thisShot) {
  // console.log("EXPLOSION!");
  ctx.beginPath();
  ctx.arc(thisShot.x, thisShot.y, 10, 0, 2 * Math.PI);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.stroke();
};

//////////////////////////////////////
// DESTROY GROUND
const destroyGround = function (thisShot) {
  // console.log("DESTROY GROUND");
  // TODO: determine y values at edges of explosion (use item drop method)
  // TODO create new mini terrain array around the impact, starting with first edge, randomized crater ending at second edge
  // load up terrain array, which is already sorted by x value
  // splice crater array into terrain array
  // replacing any existing terrain nodes that are within crater array range
};

//////////////////////////////////////
// DROP ITEM
// detects top edge of terrain, sets that y value and returns the item
const dropItem = function (item) {
  item.y = 0;
  for (i = 0; i < canvas.height; i++) {
    item.y++;
    if (hitGround(item)) {
      break;
    }
  }
  return item;
};

//////////////////////////////////////
// OFF X - test if an item is horiztonally off-screen
// had to be explicit with returns, was getting weird errors
const offX = function (aPoint) {
  let shotOffX = false;
  if (aPoint.x < 0) {
    shotOffX = true;
    // console.log("off left");
  }
  if (aPoint.x > canvas.width) {
    shotOffX = true;
    // console.log("off right");
  }
  return shotOffX;
};

//////////////////////////////////////
// DRAW PLAYERS
const drawPlayers = function (ctx, tankObjects) {
  for (let tank of tankObjects) {
    // TANK BODY
    ctx.beginPath();
    ctx.arc(tank.x, tank.y, tank.radius, 0, 2 * Math.PI);
    // cycle thru colors array CONSTANT for fill
    ctx.fillStyle = PLAYER_COLORS[tank.playerNumber];
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();

    drawTurret(tank);
  }
};

//////////////////////////////////////
// DRAW TURRET  rotate, draw straight line, then rotate back
const drawTurret = function (tank) {
  ctx.save();
  ctx.translate(tank.x, tank.y);
  ctx.rotate(degreesToRadians(tank.turret.angle));
  ctx.beginPath();
  ctx.moveTo(-1 * tank.radius, 0);
  ctx.lineTo(-1 * tank.turret.length, 0);
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();
};

//////////////////////////////////////
// ADJUST TURRET
const adjustTurret = function (amount) {
  let currentTank = tankObjects[game.currentPlayer - 1];
  let angle = currentTank.turret.angle + amount;
  if (angle < 0) {
    angle = 180;
  } else if (angle > 180) {
    angle = 0;
  }
  currentTank.turret.angle = angle;
  refreshScreen();
};

//////////////////////////////////////
// HIT GROUND
const hitGround = function (aPoint) {
  // redefine but dont draw the terrain again
  defineTerrain();
  return ctx.isPointInStroke(aPoint.x, aPoint.y) || ctx.isPointInPath(aPoint.x, aPoint.y);
};

//////////////////////////////////////
// HANDLE KEYBOARD INPUT
// https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
const listenKeys = function (e) {
  switch (e.code) {
    case "ArrowLeft":
      adjustTurret(TURRET_INCREMENT * -1);
      break;
    case "ArrowRight":
      adjustTurret(TURRET_INCREMENT);
      break;
    case "Space":
      refreshScreen();
      tankObjects[game.currentPlayer - 1].fire(); // array 0 is player 1
      game.nextPlayersTurn();
      break;
  }
};

/// SCREEN LOAD
const canvas = document.querySelector("#canvas");
canvas.height = 600;
canvas.width = canvas.height * 2;
const ctx = canvas.getContext("2d");

// RANDOMLY GENERATE TERRAIN AND STORE TO ARRAY FOR REFRESHES
// 0 as numSlopes bypasses random function and just adds a rectangle
generateTerrain(canvas.width, canvas.height, TERRAIN_BUMPS, STEEPNESS);

// DRAW SKY AND GROUND
drawBackground();

// CREATE TANK OBJECTS
const tankObjects = [];
for (ii = 1; ii <= NUM_PLAYERS; ii++) {
  // space out tanks evenly along horizontal
  const tank = new Tank(Math.floor((canvas.width * ii) / (NUM_PLAYERS + 1)), ii);
  // TODO: spreak taks further apart

  tankObjects.push(tank);
}

// DRAW TANKS
// context canvas to draw on, array of tanks to draw
drawPlayers(ctx, tankObjects);

if (tankObjects.length > 1) {
  // LISTEN FOR USER KEYBOARD INPUT TO ADJUST TURRET ANGLE
  document.onkeydown = listenKeys;
} else {
  alert(`Player Number ${tankObjects.pop().playerNumber} Wins!`);
}

// TODO ANIMATE BULLET
// TODO MAP MOUSE INPUT TO CORRESPONDING KEY BINDINGS
