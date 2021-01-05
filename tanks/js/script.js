/*!
 tanks
  */
//  REQUIREMENTS:
// TODO animate shots, explosions, tank death
// TODO finish implement options from modal

//  WOULD BE COOL:
// TODO: IMPLEMENT RESET BUTTON
// TODO: MOVE TITLE / maybe buttons? OVER CANVAS
// TODO: randomize start tank. weight towards those in the middle since they are most in danger?
// TODO: spreak tanks further apart
// TODO: animate shot rather than tracing path
// TODO: use while loop, end is collision with ground, or shot off of horiztonal screen.
// TODO add TANK_SIZE and include SIN / COS for more accurate circle target
// TODO maybe implement wraparound shots? ? ?
// TODO  integrate terrain steepness%
// TODO snow capped mountains
// TODO: math make sure shot can go across whole screen
// TODO: add computer logic for 1 player mode
// -
// TODO:Explosions
// TODO:- Ground destroyed
// TODO:- Utilize actual images / improve graphics: use Bézier curves for terrain
// TODO:- Testing / edge cases / stretch goals
// TODO:- Read me:, screenshots
// TODO:- Demonstration
// TODO:- Build your own level / defenses: clock add terrain node
// TODO:- Day/night/wind
// TODO:- Add my trees

// TODO:- Fine tuned aiming

const game = {
  // NEW GAME
  newGame: function (numHumans, numComputers) {
    // initialize players
    this.numHumans = numHumans;
    this.numComputers = numComputers;
    this.currentPlayer = 0;
    this.winningPlayer = null;

    // populate terrain array
    this.terrainArray = generateTerrain(canvas.width, canvas.height, TERRAIN_BUMPS, STEEPNESS);

    // DRAW SKY AND GROUND
    drawBackground();

    // CREATE / RECREATE TANK OBJECTS
    this.tankObjects = [];
    for (let ii = 0; ii < this.numHumans + this.numComputers; ii++) {
      // space out tanks evenly along horizontal
      const tank = new Tank(Math.floor((canvas.width * (ii + 1)) / (this.numHumans + this.numComputers + 1)), ii);

      this.tankObjects.push(tank);
    }

    // DRAW TANKS
    // console.log(this.tankObjects);
    drawPlayers(ctx, this.tankObjects);
  },
  nextPlayersTurn: function () {
    this.currentPlayer += 1; // rotate turns
    if (this.currentPlayer >= this.numHumans + this.numComputers) {
      this.currentPlayer = 0; // player 0 after last player
    }
    $("#canvas").css("border", `1px dashed ${PLAYER_COLORS[this.currentPlayer]}`);
    // console.log(this.currentPlayer, "new current player");
  },
};

// GAME CONSTANTS
const PLAYER_COLORS = [color("bs-purple"), color("fire-opal"), color("ruby"), color("papaya-whip"), color("mantis"), color("magic-mint2")];
const TURRET_INCREMENT = 3;
const TANK_SIZE = 20;
const EXPLOSION_RADIUS = 40;
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
    this.playerNumber = playerNumber; // there is a player 0
    this.hitpoints = 1;
    this.turret = {
      angle: getRandomInt(180 - (playerNumber / game.numHumans + game.numComputers) * 180, 180 - ((playerNumber + 1) / (game.numHumans + game.numComputers)) * 180),
      length: TANK_SIZE * 3,
    };
  }
  // tank methods
  fire() {
    let angle = this.turret.angle;
    const thisShot = new Bullet(this.x - Math.cos(degreesToRadians(angle)) * (this.turret.length + this.radius), this.y - Math.sin(degreesToRadians(angle)) * (this.turret.length + this.radius));

    let hitTank = null;

    for (let i = 0; i < canvas.height * 2; i += 1) {
      // cycle through tanks and check if explosion hit them
      for (let idx in game.tankObjects) {
        let tank = game.tankObjects[idx];

        if (Math.abs(tank.x - thisShot.x) < EXPLOSION_RADIUS && Math.abs(tank.y - thisShot.y) < EXPLOSION_RADIUS) {
          // console.log("HIT!");
          showExplosion(thisShot);
          destroyGround(thisShot);
          hitTank = game.tankObjects[idx];
          break;
        }
      }
      if (hitTank) {
        // console.log(hitTank, "hit");
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
        ctx.beginPath();
        ctx.arc(thisShot.x, thisShot.y, 2, 0, 2 * Math.PI);

        // 0-180 degrees = 0 to PI radians
        // sin of radians: 0 on the sides, 1 straight up
        // bullets were going backwards, so used decrement

        // fire based on turret angle; -i gives gravity over time
        // TODO adjust spacing if not animating every frame
        thisShot.y -= TANK_SIZE * Math.sin(degreesToRadians(angle)) - i;
        thisShot.x -= TANK_SIZE * Math.cos(degreesToRadians(angle));

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
}

//////////////////////////////////////
// LOAD MODAL
// loadModal(stringTitle, stringMessage)
// resume message will be appended if game is in progress
const loadModal = function (strTitle, strMsg) {
  if (strTitle) {
    $("#modal-title").text(strTitle);
  } else {
    $("#modal-title").text(`Tanks!`);
  }

  // `Player ${game.winningPlayer + 1} Is A Big Winner!`
  // `Please select an option.`
  if (strMsg) {
    $("#modal-message").text(strMsg);
  } else {
    $("#modal-message").hide();
  }
  $("#modal").modal("show");
};

//////////////////////////////////////
// COLOR
// takes css variable name, prepends double dashes and returns HEX
// needs functional decl to access CSS colors above
function color(cssVar) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${cssVar}`);
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
  // console.log("EXPLOSION!");
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
  for (let tank of game.tankObjects) {
    // TANK BODY
    ctx.beginPath();
    ctx.arc(tank.x, tank.y, tank.radius, 0, 2 * Math.PI);
    // cycle thru colors array CONSTANT for fill
    ctx.fillStyle = PLAYER_COLORS[tank.playerNumber % PLAYER_COLORS.length];
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
// https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
// https://keycode.info/ by WES BOS useful for extracting code instead of numberic code
const listenKeys = function (e) {
  switch (e.code) {
    case "ArrowLeft":
      refreshScreen();
      adjustTurret(TURRET_INCREMENT * -1);
      break;
    case "ArrowRight":
      refreshScreen();
      adjustTurret(TURRET_INCREMENT);
      break;
    case "Space":
      refreshScreen();
      let currentTank = game.tankObjects[game.currentPlayer];
      currentTank.fire(); // array 0 is player 0
      if (getWinner()) {
        loadModal();

        return;
      } else {
        game.nextPlayersTurn();
        break;
      }
  }
};

//////////////////////////////////////
// HANDLE CLICK
const handleClick = (e) => {
  console.log(e.target);
  switch (e.target.id) {
    case "play-button":
      // TODO new game with last number of players
      game.newGame(2, 0);
  }
};

/// SCREEN LOAD
const canvas = document.querySelector("#canvas");
canvas.height = 600;
canvas.width = canvas.height * 2;
const ctx = canvas.getContext("2d");

// START GAME
// newGame({num of humans}, {num of computer players})
game.newGame(2, 0);

document.onkeydown = listenKeys;
$("body").click((e) => handleClick(e));

// TODO MAP MOUSE INPUT TO CORRESPONDING KEY BINDINGS
