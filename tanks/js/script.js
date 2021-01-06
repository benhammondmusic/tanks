/*!
 tanks
  */

const TEST_MODE = true;

// TODO better animation
// TODO smaller buttons so all fit in a row with resume button
// TODO: add chemtrails
// animate explosion AFTER shot lands

const game = {
  // NEW GAME
  newGame: function (numHumans, numRobots) {
    // initialize players
    this.numHumans = numHumans;
    this.numRobots = numRobots;
    // values for after tanks die so new game can have same number players
    this.numHumansAtStart = numHumans;
    this.numRobotsAtStart = numRobots;
    this.currentPlayer = 0;
    this.winningPlayer = null;

    // populate terrain array
    this.terrainArray = generateTerrain(canvas.width, canvas.height, TERRAIN_BUMPS, STEEPNESS);

    // DRAW SKY AND GROUND
    drawBackground();

    // CREATE / RECREATE TANK OBJECTS
    this.tankObjects = [];
    for (let ii = 0; ii < this.numHumans + this.numRobots; ii++) {
      // space out tanks evenly along horizontal
      const tank = new Tank(Math.floor((canvas.width * (ii + 1)) / (this.numHumans + this.numRobots + 1)), ii);

      this.tankObjects.push(tank);
    }

    // DRAW TANKS
    drawPlayers(ctx, this.tankObjects);
  },
  nextPlayersTurn: function () {
    this.currentPlayer += 1; // rotate turns
    if (this.currentPlayer >= this.numHumans + this.numRobots) {
      this.currentPlayer = 0; // player 0 after last player
    }
    $("#canvas").css("border", `1px dashed ${PLAYER_COLORS[this.currentPlayer]}`);
  },
};

// GAME CONSTANTS
const PLAYER_COLORS = [color("bs-purple"), color("fire-opal"), color("ruby"), color("papaya-whip"), color("mantis"), color("magic-mint2")];
const TURRET_INCREMENT = 3;
const TANK_SIZE = 20;
const EXPLOSION_RADIUS = 40;
const TERRAIN_BUMPS = 20;
const STEEPNESS = 1;
const DEFAULT_NUM_HUMANS = 2;
const DEFAULT_NUM_ROBOTS = 0;
const GRAVITY = 0.04;
const SHOT_DELAY = 0.2;
const X_BOOSTER = 1.5;

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
    this.playerNumber = playerNumber; // there is a player 0
    this.hitpoints = 1;
    this.turret = {
      angle: getRandomInt(180 - (playerNumber / game.numHumans + game.numRobots) * 180, 180 - ((playerNumber + 1) / (game.numHumans + game.numRobots)) * 180),
      length: TANK_SIZE * 3,
    };
  }
  // tank methods
  fire() {
    let angle = this.turret.angle;
    const thisShot = new Bullet(this.x - Math.cos(degreesToRadians(angle)) * (this.turret.length + this.radius), this.y - Math.sin(degreesToRadians(angle)) * (this.turret.length + this.radius));

    let hitTank = null;

    // shot placements
    for (let i = 0; i < canvas.height * 10; i += 10) {
      // cycle through tanks and check if explosion hit them
      for (let idx in game.tankObjects) {
        let tank = game.tankObjects[idx];

        if (Math.abs(tank.x - thisShot.x) < EXPLOSION_RADIUS && Math.abs(tank.y - thisShot.y) < EXPLOSION_RADIUS) {
          showExplosion(thisShot);
          destroyGround(thisShot);
          hitTank = game.tankObjects[idx];
          break;
        }
      }
      if (hitTank) {
        hitTank.hitpoints--;
        // remove dead tanks from the array
        game.tankObjects = game.tankObjects.filter((tank) => tank.hitpoints > 0);
        // TODO: this needs to decrement either computers or humans
        game.numHumans--;
        break;
      }
      // if no tanks were hit above, check for ground collision
      else if (hitGround(thisShot)) {
        showExplosion(thisShot);
        destroyGround(thisShot);
        break;
        // check if shot went off screen horizontally.
      } else if (offX(thisShot)) {
        break;
      } else {
        const oldShot = { x: thisShot.x, y: thisShot.y };

        // fire based on turret angle;
        thisShot.y -= TANK_SIZE * Math.sin(degreesToRadians(angle)) - i * GRAVITY; // i gives gravity
        thisShot.x -= TANK_SIZE * X_BOOSTER * Math.cos(degreesToRadians(angle));

        // using jCanvas
        // start at old bullet spot, animate to new bullet spot
        $("#jcanvas").drawRect({
          layer: true,
          name: "shot",
          fillStyle: color("black-coffee"),
          x: oldShot.x,
          y: oldShot.y,
          width: 4,
          height: 4,
        });

        // Animate layer properties
        $("#jcanvas").animateLayer(
          "shot",
          {
            x: thisShot.x,
            y: thisShot.y,
            width: 10,
            height: 10,
          },
          SHOT_DELAY
        );

        // draw chemtrails
        // $("#canvas").drawRect({
        //   layer: true,
        //   name: "chemTrails",
        //   fillStyle: color("papaya-whip"),
        //   x: oldShot.x,
        //   y: oldShot.y,
        //   width: 2,
        //   height: 2,
        // });

        // OLD ONE
        // ctx.beginPath();
        // ctx.strokeStyle = color("black-coffee");
        // ctx.lineWidth = 2;
        // ctx.arc(thisShot.x, thisShot.y, 2, 0, 2 * Math.PI);
        // ctx.stroke();

        // console.log("here");
        // $("#jcanvas").clearCanvas();

        // refreshScreen();
      }
    }
  }
}

//////////////////////////////////////
// LOAD MODAL
// loadModal(stringTitle, stringMessage)
// resume button will be displayed if game is in progress
const loadModal = function (strTitle, strMsg) {
  if (strTitle) {
    $("#modal-title").text(strTitle);
  } else {
    $("#modal-title").text(`Tanks!`);
  }
  if (strMsg) {
    $("#modal-message").text(strMsg);
  }

  $("#modal").modal("show");
};

//////////////////////////////////////
// COLOR
// takes css variable name, prepends double dashes and returns HEX
// needs functional decl to access CSS colors at top
function color(cssVar) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${cssVar}`);
}

//////////////////////////////////////
// CLEAR CANVAS
const clrCanvas = function (ctx) {
  // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas

  // using jCanvas
  $("#canvas").clearCanvas();
};

//////////////////////////////////////
// REFRESH SCREEN
const refreshScreen = function () {
  clrCanvas(ctx);
  drawBackground();
  drawPlayers(ctx, game.tankObjects);
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
// https://flaviocopes.com/how-to-slow-loop-javascript/
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

//////////////////////////////////////
// generate random elevation ground and sky
// numSlopes = how many changes in elevatio per screen width
// steepness = % (currently not implemented)
const generateTerrain = function (width, height, numSlopes, steepnessPercent) {
  const arr = [];
  if (numSlopes === 0) {
    arr[0] = [0, height * 0.7];
    arr[1] = [width, height * 0.7];
    return;
    // TODO: eliminate extra zero numSlopes, was added for testing
  } else {
    for (let i = 0; i <= numSlopes; i++) {
      arr[i] = [width * (i / numSlopes), getRandomInt(height * 0.55, height)];
    }
  }
  return arr;
};

//////////////////////////////////////
// draws sky and stored terrain array
const drawBackground = function () {
  // SKY
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = color("opal");
  ctx.fill();

  defineTerrain();
  ctx.fillStyle = color("black-coffee");
  ctx.fill();
};

//////////////////////////////////////
// DEFINE TERRAIN
const defineTerrain = function () {
  ctx.beginPath();

  let previousPoint = game.terrainArray[0];
  let nextPoint = [];

  // random hills
  for (let i = 0; i < game.terrainArray.length; i++) {
    ctx.lineTo(game.terrainArray[i][0], game.terrainArray[i][1]);
  }
  // connect polygon
  ctx.lineTo(canvas.width, canvas.height); // to bottom right corner
  ctx.lineTo(0, canvas.height); // to bottom left corner
  ctx.closePath(); // back to start
};

//////////////////////////////////////
// SHOW EXPLOSION
const showExplosion = function (thisShot) {
  ctx.lineWidth = 1;

  // first set of circles
  ctx.beginPath();
  ctx.lineWidth = 1;
  for (let i = 0; i < EXPLOSION_RADIUS; i += EXPLOSION_RADIUS / 24) {
    ctx.stroke();
    ctx.strokeStyle = color("papaya-whip");
    ctx.arc(thisShot.x, thisShot.y, i + EXPLOSION_RADIUS / 40, 0, 2 * Math.PI);
  }
  ctx.stroke();

  // other color alternate circles
  ctx.beginPath();
  ctx.lineWidth = 3;
  for (let i = 0; i < EXPLOSION_RADIUS; i += EXPLOSION_RADIUS / 16) {
    ctx.strokeStyle = color("fire-opal");
    ctx.arc(thisShot.x, thisShot.y, i, degreesToRadians(getRandomInt(0, 360)), degreesToRadians(getRandomInt(0, 360)));
  }
  ctx.stroke();
};

//////////////////////////////////////
// DESTROY GROUND
const destroyGround = function (thisShot) {
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
  for (let i = 0; i < canvas.height; i++) {
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
  }
  if (aPoint.x > canvas.width) {
    shotOffX = true;
  }
  return shotOffX;
};

//////////////////////////////////////
// DRAW PLAYERS
const drawPlayers = function (ctx, tankObjects) {
  for (let tank of game.tankObjects) {
    // TANK BODY
    ctx.beginPath();
    ctx.arc(tank.x, tank.y, tank.radius, 0, 2 * Math.PI);
    // cycle thru colors array CONSTANT for fill
    ctx.fillStyle = PLAYER_COLORS[tank.playerNumber % PLAYER_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = color("papaya-whip");
    ctx.lineWidth = 3;
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
  // TODO: rf send tank to adjust in a arg rather than changing
  console.log(game.tankObjects);
  let currentTank = game.tankObjects[game.currentPlayer];
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
// GET WINNER
const getWinner = function () {
  if (game.tankObjects.length === 1) {
    // only one tank left in array = alive
    game.winningPlayer = game.tankObjects[0].playerNumber;
    refreshScreen();
    return true;
  } else return false;
};

//////////////////////////////////////
// HANDLE KEYBOARD INPUT
// https://keycode.info/ by WES BOS useful for extracting code instead of numberic code
const listenKeys = function (e) {
  switch (e.code) {
    case "ArrowLeft":
      refreshScreen();
      console.log(game.currentPlayer);
      adjustTurret(TURRET_INCREMENT * -1);
      break;
    case "ArrowRight":
      refreshScreen();
      adjustTurret(TURRET_INCREMENT);
      break;
    case "ArrowUp":
      refreshScreen();

      // up arrow fine adjusts towards top of screen
      let fineAdjustmentUp = 1;
      if (game.tankObjects[game.currentPlayer].turret.angle > 90) {
        fineAdjustmentUp *= -1;
      }
      adjustTurret(fineAdjustmentUp);
      break;
    case "ArrowDown":
      refreshScreen();
      // down arrow fine adjusts towards top of screen
      let fineAdjustmentDown = 1;
      if (game.tankObjects[game.currentPlayer].turret.angle < 90) {
        fineAdjustmentDown *= -1;
      }
      adjustTurret(fineAdjustmentDown);
      break;
    case "Space":
      refreshScreen();
      let currentTank = game.tankObjects[game.currentPlayer];

      currentTank.fire();

      if (getWinner()) {
        loadModal(`Player ${game.winningPlayer + 1} Is A Big Winner!`, "What Would You Like To Do?");

        // return;
      } else {
        // game.nextPlayersTurn();
      }

      game.nextPlayersTurn();
  }
};

//////////////////////////////////////
// HANDLE CLICK
const handleClick = (e) => {
  // by #ID
  switch (e.target.id) {
    case "resume-button":
      $("#resume-button").hide();
      $("#modal").modal("hide");
      break;
    case "new-button":
      const prevNumHumans = game.numHumansAtStart;
      game.newGame(prevNumHumans, 0);
      break;
    case "change-players-button":
      // show or hide player dropdowns
      $("#change-players-container").toggle();
      break;
    case "change-terrain-button":
      // show or hide player dropdowns
      // populate terrain array
      // game.terrainArray = generateTerrain(canvas.width, canvas.height, TERRAIN_BUMPS, STEEPNESS);
      // refreshScreen;
      break;
    case "options":
      $("#resume-button").show();
      loadModal();
      break;
  }

  // by .CLASS
  if ($(e.target).hasClass("dropdown-item-humans")) {
    //set number of humans
    game.numHumansAtStart = $(e.target).data("humans");
    // might have to disable this once robots can play
    game.newGame(game.numHumansAtStart, 0);
    // rehide player dropdown in modal for next time
    $("#change-players-container").toggle();
    // close modal
    $("#modal").modal("hide");
  } else if ($(e.target).hasClass("dropdown-item-robots")) {
    // set number robots
    game.numRobotsAtStart = $(e.target).data("robots");
  }
};

/// SCREEN LOAD
const canvas = document.querySelector("#canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const ctx = canvas.getContext("2d");

const jcanvas = document.querySelector("#jcanvas");
jcanvas.height = window.innerHeight;
jcanvas.width = window.innerWidth;
// const ctx = canvas.getContext("2d");

// START GAME
// newGame({num of humans}, {num of computer players})
game.newGame(DEFAULT_NUM_HUMANS, DEFAULT_NUM_ROBOTS);
if (!TEST_MODE) {
  loadModal("Welcome to Tanks!", "What goes up, must come down. Take turns lobbing projectiles at one another. Adjust the angle of your shot using the arrow left and right keys, and fire using the space bar. Tanks receiving a hit are eliminated; the last tank remaining is the winner!");
}

// USER INPUT
document.onkeydown = listenKeys;
$("body").click((e) => handleClick(e));
