/*!
 tanks
  */
// GAME CONSTANTS
const PLAYER_COLORS = [color("bs-purple"), color("fire-opal"), color("ruby"), color("papaya-whip"), color("mantis"), color("magic-mint2")];
const TURRET_INCREMENT = 1;
const TANK_SIZE = 20;
const EXPLOSION_RADIUS = 40;
const TERRAIN_BUMPS = 15;
const STEEPNESS = 1;
const DEFAULT_NUM_HUMANS = 2;
const DEFAULT_NUM_ROBOTS = 0;
const GRAVITY = 0.04;
const SHOT_DELAY = 0.2;
const X_BOOSTER = 1.5;

const TEST_MODE = false;
// const TEST_MODE = true;

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
    const thisShot = new Bullet(this.x - Math.cos(degreesToRadians(angle)) * EXPLOSION_RADIUS * 1.5, this.y - Math.sin(degreesToRadians(angle)) * EXPLOSION_RADIUS * 1.5);

    let hitTank = null;

    // shot placements
    for (let i = 0; i < canvas.height * 10; i += 10) {
      // cycle through tanks and check if explosion hit them
      for (let idx in game.tankObjects) {
        let tank = game.tankObjects[idx];
        console.log(tank);
        let xProx = Math.abs(tank.x - thisShot.x);
        let yProx = Math.abs(tank.y - thisShot.y);
        console.log({ xProx }, { yProx });
        if (xProx < EXPLOSION_RADIUS && yProx < EXPLOSION_RADIUS) {
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
        console.log(thisShot, "after explosion");
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

        // // Animate layer properties
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
  // $("#modal").focus();
  $("#new-button").first().focus();
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
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas

  // using jCanvas
  // $("#canvas").clearCanvas();
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
// generate random elevation ground and sky
// numSlopes = how many changes in elevatio per screen width. MUST BE > 0
// steepness = % (currently not implemented)
const generateTerrain = function (width, height, numSlopes, steepnessPercent) {
  const arr = [];

  for (let i = 0; i <= numSlopes; i++) {
    arr[i] = [width * (i / numSlopes), getRandomInt(height * 0.55, height)];
  }
  // in case of 0 slopes
  if (numSlopes === 0) {
    arr[1] = arr[0];
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
  // console.log(previousPoint);
  let nextPoint = [];

  // random hills
  for (let i = 0; i < game.terrainArray.length; i++) {
    ctx.lineTo(game.terrainArray[i][0], game.terrainArray[i][1]);

    // ATTEMPT CURVED GROUND, WAS GETTING WEIRD
    // const ctrlX = game.terrainArray[i][0] - EXPLOSION_RADIUS;
    // const ctrlY = game.terrainArray[i][1] - TANK_SIZE;
    // const endX = game.terrainArray[i][0];
    // const endY = game.terrainArray[i][1];
    // ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
  }
  // connect polygon
  ctx.lineTo(canvas.width, canvas.height); // to bottom right corner
  ctx.lineTo(0, canvas.height); // to bottom left corner
  ctx.closePath(); // back to start
};

//////////////////////////////////////
// SHOW EXPLOSION
const showExplosion = function (thisShot) {
  // using jCanvas
  // draw static shape
  $("#jcanvas").drawPolygon({
    layer: true,
    name: "explosion",
    fillStyle: color("fire-opal"),
    strokeStyle: color("papaya-whip"),
    strokeWidth: 1,
  });

  // set explosion values based on shot position
  $("#jcanvas")
    .setLayer("explosion", {
      radius: TANK_SIZE,
      x: thisShot.x,
      y: thisShot.y,
      sides: 3,
    })
    .drawLayers();

  // console.log(thisShot);

  // Animate layer properties
  $("#jcanvas").animateLayer(
    "explosion",
    {
      radius: EXPLOSION_RADIUS * 3,
      // x: "+=1",
      sides: 7,
      concavity: 0.9,
    },
    "fast",
    function (layer) {
      // Callback function
      $(this).animateLayer(
        layer,
        {
          radius: 0,
          rotate: 360,
        },
        "slow",
        "swing"
      );
    }
  );

  // OLD STATIC CODE BELOW WHICH HAD STOPPED WORKING
  // ctx.lineWidth = 1;
  // // first set of circles
  // ctx.beginPath();
  // ctx.lineWidth = 1;
  // for (let i = 0; i < EXPLOSION_RADIUS; i += EXPLOSION_RADIUS / 24) {
  //   ctx.stroke();
  //   ctx.strokeStyle = color("papaya-whip");
  //   ctx.arc(thisShot.x, thisShot.y, i + EXPLOSION_RADIUS / 40, 0, 2 * Math.PI);
  // }
  // ctx.stroke();
  // // other color alternate circles
  // ctx.beginPath();
  // ctx.lineWidth = 3;
  // for (let i = 0; i < EXPLOSION_RADIUS; i += EXPLOSION_RADIUS / 16) {
  //   ctx.strokeStyle = color("fire-opal");
  //   ctx.arc(thisShot.x, thisShot.y, i, degreesToRadians(getRandomInt(0, 360)), degreesToRadians(getRandomInt(0, 360)));
  // }
  // ctx.stroke();
};

//////////////////////////////////////
// DESTROY GROUND
const destroyGround = function (thisShot) {
  const crater = {
    leftEdge: { x: Math.floor(thisShot.x - EXPLOSION_RADIUS), y: 0 },
    rightEdge: { x: Math.floor(thisShot.x + EXPLOSION_RADIUS), y: 0 },
    terrainArray: [[]],
  };

  // set y values at X edges of explosion
  crater.leftEdge = dropItem(crater.leftEdge);
  crater.rightEdge = dropItem(crater.rightEdge);

  // fill first node of crater terrain array
  crater.terrainArray[0][0] = crater.leftEdge.x;
  crater.terrainArray[0][1] = crater.leftEdge.y;
  // dig deep
  crater.terrainArray.push([crater.leftEdge.x + 1, crater.leftEdge.y + EXPLOSION_RADIUS]);

  // generate crater inner shape
  // TODO: add random jagged edges
  //
  // for (let i = 0; i<1;i++){

  // }
  crater.terrainArray.push([thisShot.x, thisShot.y + getRandomInt(TANK_SIZE, EXPLOSION_RADIUS + TANK_SIZE)]);

  // dig deep
  crater.terrainArray.push([crater.rightEdge.x - 1, crater.rightEdge.y + EXPLOSION_RADIUS]);

  // fill last node of crater terrain
  crater.terrainArray.push([crater.rightEdge.x, crater.rightEdge.y]);

  // keep game terrainintact L and R of crater
  const terrainLeftOfCrater = game.terrainArray.filter((nodeX) => nodeX[0] < crater.leftEdge.x);
  const terrainRightOfCrater = game.terrainArray.filter((nodeX) => nodeX[0] > crater.rightEdge.x);

  // insert crater terrain into remaining game terrain
  game.terrainArray = [...terrainLeftOfCrater, ...crater.terrainArray, ...terrainRightOfCrater];

  refreshScreen();
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
    ctx.arc(tank.x, tank.y, tank.radius, Math.PI, Math.PI * 2);
    // cycle thru colors array CONSTANT for fill
    ctx.fillStyle = PLAYER_COLORS[tank.playerNumber % PLAYER_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = color("papaya-whip");
    ctx.lineWidth = 3;
    ctx.closePath();
    ctx.stroke();

    // SECOND COLOR TANK OUTLINE
    ctx.beginPath();
    ctx.strokeStyle = color("black-coffee");
    ctx.arc(tank.x, tank.y, tank.radius + 4, Math.PI, Math.PI * 2);
    ctx.closePath();
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

  // BLACK TURRET
  ctx.beginPath();
  ctx.moveTo(-1 * tank.radius, 0);
  ctx.lineTo(-1 * tank.turret.length, 0);
  ctx.lineWidth = 6;
  ctx.stroke();

  // WHITE LINE ON TURRET
  ctx.beginPath();
  ctx.moveTo(-1 * tank.radius, 0);
  ctx.lineTo(-1 * tank.turret.length + 5, 0);
  ctx.lineWidth = 2;
  ctx.strokeStyle = color("papaya-whip");
  ctx.stroke();

  ctx.restore();
};

//////////////////////////////////////
// ADJUST TURRET
const adjustTurret = function (amount) {
  // TODO: rf send tank to adjust in a arg rather than changing
  // console.log(game.tankObjects);
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
  // when modal is open
  if ($("#modal").hasClass("show")) {
    switch (e.code) {
      case "ArrowLeft":
        refreshScreen();
        // console.log(game.currentPlayer);
        adjustTurret(TURRET_INCREMENT * -1);
        break;
      case "ArrowRight":
        refreshScreen();
        adjustTurret(TURRET_INCREMENT);
        break;
      case "Enter":
        if (getWinner()) {
          $("#resume-button").hide();
          $("#new-button").click();
        } else {
          $("#resume-button").show();
        }
        loadModal();
        break;
      case "Space":
        $("#modal").modal("hide");
        break;
    }
  } else {
    // accept keyboard game controls when modal is closed
    switch (e.code) {
      case "ArrowLeft":
        // USE KEYDROWN.JS LIBRARY FOR SPEEDING UP WHEN KEY HELD
        kd.LEFT.down(function () {
          refreshScreen();
          adjustTurret((-1 * TURRET_INCREMENT) / 2);
        });

        kd.LEFT.up(function () {
          kd.stop();
        });

        kd.run(function () {
          kd.tick();
        });
        // refreshScreen();
        // adjustTurret(TURRET_INCREMENT);
        break;
      case "ArrowRight":
        // USE KEYDROWN.JS LIBRARY FOR SPEEDING UP WHEN KEY HELD
        kd.RIGHT.down(function () {
          refreshScreen();
          adjustTurret(TURRET_INCREMENT / 2);
        });

        kd.RIGHT.up(function () {
          kd.stop();
        });

        kd.run(function () {
          kd.tick();
        });
        // refreshScreen();
        // adjustTurret(TURRET_INCREMENT);
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
        }
        game.nextPlayersTurn();
        break;
      case "Escape":
        if (getWinner()) {
          $("#resume-button").hide();
          $("#new-button").click();
        } else {
          $("#resume-button").show();
        }
        loadModal();
        break;
    }
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
  if ($(e.target).hasClass("num-humans")) {
    //set number of humans
    game.numHumansAtStart = $(e.target).data("humans");
    // might have to disable this once robots can play
    game.newGame(game.numHumansAtStart, 0);
    // rehide player dropdown in modal for next time
    $("#change-players-container").toggle();
    // close modal
    $("#modal").modal("hide");
  } else if ($(e.target).hasClass("num-robots")) {
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
