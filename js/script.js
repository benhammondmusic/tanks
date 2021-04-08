/*!
 TANKS! Ben Hammond
  */

// SET GAME MODES
const ALLOW_ROBOTS = false;
if (!ALLOW_ROBOTS) {
  $('#num-robots-button').hide();
}
const TEST_MODE = false;
// const TEST_MODE = true;

// GAME CONSTANTS
const PLAYER_COLORS = [`#56EBC3`, `#A955EB`, `#97EB55`, `#55E2EB`, `#B8D81E`, `#EBC356`, `#1ED89B`, `#3E1ED8`, `#1DD75B`, `#1DD7D7`, `#D3E1FD`, color('papaya-whip'), color('fire-opal'), color('ruby'), color('black-coffee')];
const TURRET_INCREMENT = 0.5;
const TANK_SIZE = 25;
const EXPLOSION_RADIUS = 50;
const EXPLOSION_DELAY = 750;
const TERRAIN_BUMPS = 20;
const STEEPNESS = 1;
const HORIZON_DEPTH = 0.25; // 0-1
let DEFAULT_NUM_HUMANS = 2;
if (TEST_MODE) DEFAULT_NUM_HUMANS = 6;
const DEFAULT_NUM_ROBOTS = 0;
const GRAVITY = 0.06;
const SHOT_DELAY = 0.05;
const X_BOOSTER = 1.5;

/* FORCE LANDSCAPE ON MOBILE with PLEASEROTATE.JS */
PleaseRotateOptions = {
  message: 'Please Rotate Your Device And Then Reload Page',
};

const game = {
  // NEW GAME
  newGame: function (numHumans, numRobots) {
    // initialize players
    this.numHumans = numHumans;
    this.numRobots = numRobots;
    // values for after tanks die so new game can have same number players
    this.numHumansAtStart = numHumans;
    this.numRobotsAtStart = numRobots;
    this.currentPlayerIdx = 0;
    this.winningPlayer = null;

    clrCanvas(ctx);
    // set dom button to show number of current players at game-start
    $('#num-players-display').text(`: ${this.numHumansAtStart + this.numRobotsAtStart} Players`);

    // populate terrain array
    this.terrainArray = generateTerrain(canvas.width, canvas.height, TERRAIN_BUMPS, STEEPNESS);

    // DRAW SKY AND GROUND

    // loadClouds(); // this is now set as CSS background on <body>
    drawBackground();

    // CREATE / RECREATE TANK OBJECTS
    this.tankObjects = [];
    for (let ii = 0; ii < this.numHumans + this.numRobots; ii++) {
      // space out tanks evenly along horizontal
      const tank = new Tank(Math.floor((canvas.width * (ii + 1)) / (this.numHumans + this.numRobots + 1)), ii);

      this.tankObjects.push(tank);
    }

    setPlayerDisplay(this.tankObjects[this.currentPlayerIdx].playerNumber);

    // DRAW TANKS
    drawPlayers(ctx, this.tankObjects);
  },
  nextPlayersTurn: function () {
    // cycle thrugh remaing tanks in array
    let nextPlayerIdx = this.currentPlayerIdx + 1;
    if (nextPlayerIdx >= this.tankObjects.length) {
      nextPlayerIdx = 0;
    }
    this.currentPlayerIdx = nextPlayerIdx;
    setPlayerDisplay(this.tankObjects[this.currentPlayerIdx].playerNumber);
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
    this.y = 0;
    this.dropSelf(); // lower from sky until contacts terrain shape
    this.color = PLAYER_COLORS[playerNumber % PLAYER_COLORS.length]; // cycle around options using % if num players bigger than color array
    this.radius = TANK_SIZE;
    this.playerNumber = playerNumber; // NOTE: there is a player 0, but all player numbers displayed to USER are +1
    this.hitpoints = 1;
    this.turret = {
      angle: getRandomInt(180 - (playerNumber / game.numHumans + game.numRobots) * 180, 180 - ((playerNumber + 1) / (game.numHumans + game.numRobots)) * 180),
      length: TANK_SIZE * 3,
    };
  }
  dropSelf() {
    this.y = dropItem(this).y;
  }
  // tank methods
  fire() {
    let angle = this.turret.angle;
    const thisShot = new Bullet(this.x - Math.cos(degreesToRadians(angle)) * EXPLOSION_RADIUS * 1.5, this.y - Math.sin(degreesToRadians(angle)) * EXPLOSION_RADIUS * 1.5);

    let hitTank = null;

    // shot placements
    for (let i = 0; i < canvas.height * 10; i += 10) {
      // cycle through tanks and check if explosion hit each
      for (let idx in game.tankObjects) {
        let tank = game.tankObjects[idx];
        let xProx = Math.abs(tank.x - thisShot.x);
        let yProx = Math.abs(tank.y - thisShot.y);
        if (xProx < EXPLOSION_RADIUS && yProx < EXPLOSION_RADIUS) {
          showExplosion(thisShot, 2000);
          destroyGround(thisShot);
          dropNearbyTanks(thisShot);
          hitTank = game.tankObjects[idx];
          break;
        }
      }
      if (hitTank) {
        hitTank.hitpoints--;

        // HACK fixes bug where killing self or a tank to the left makes turn skip the next tank to the right
        if (hitTank.playerNumber <= this.playerNumber) {
          console.log('kill left neighbor / skip right neighbor bug');
          game.currentPlayerIdx--;
        }

        // remove dead tanks from the array
        const livingTanks = game.tankObjects.filter((tank) => tank.hitpoints > 0);
        game.tankObjects = livingTanks;
        // TODO: this needs to decrement either computers or humans
        refreshScreen();
        break;
      }
      // if no tanks were hit, check for ground collision
      else if (hitGround(thisShot)) {
        showExplosion(thisShot, 100);
        destroyGround(thisShot);
        dropNearbyTanks(thisShot);
        break;
        // explode if went off screen horizontally.
      } else if (offX(thisShot)) {
        showExplosion(thisShot, 500);
        break;
      } else {
        const oldShot = { x: thisShot.x, y: thisShot.y };

        // fire based on turret angle;
        thisShot.y -= TANK_SIZE * Math.sin(degreesToRadians(angle)) - i * GRAVITY; // i gives gravity
        thisShot.x -= TANK_SIZE * X_BOOSTER * Math.cos(degreesToRadians(angle));

        // using jCanvas
        // start at old bullet spot, animate to new bullet spot
        $('#jcanvas').drawRect({
          layer: true,
          name: 'shot',
          fillStyle: color('black-coffee'),
          x: oldShot.x,
          y: oldShot.y,
          width: 4,
          height: 4,
        });

        // // Animate layer properties
        $('#jcanvas').animateLayer(
          'shot',
          {
            x: thisShot.x,
            y: thisShot.y,
            width: 10,
            height: 10,
          },
          SHOT_DELAY,
          function (layer) {
            // Callback function
          }
        );
      }
    }
  }
}

// show user current player
const setPlayerDisplay = function (playerNum) {
  $('#nav-text').css('color', PLAYER_COLORS[playerNum]);
  $('.navbar').css('border-bottom', `7px solid ${PLAYER_COLORS[playerNum]}`);
  $('.navbar').css('border-left', `7px solid ${PLAYER_COLORS[playerNum]}`);
  $('.navbar').css('border-right', `7px solid ${PLAYER_COLORS[playerNum]}`);
  $('#nav-text').text(`READY PLAYER ${playerNum + 1}`);
};

//////////////////////////////////////
// LOAD MODAL
// loadModal(stringTitle, stringMessage)
// resume button will be displayed if game is in progress
const loadModal = function (strTitle, strMsg) {
  if (strTitle) {
    $('#modal-title').text(strTitle);
  } else {
    $('#modal-title').text(`Tanks! by benhammond.tech`);
  }
  if (strMsg) {
    $('#modal-message').html(strMsg);
  } else {
    $('#modal-message').html(
      `
      <p><em>What goes up, must come down.</em></p>
      <p>Take turns adjusting your turret angle and lobbing projectiles at one another. Tanks receiving a hit are eliminated; the last tank remaining is the winner!</p>
      <ul>
      <li>&leftarrow; &rightarrow;: Quickly Adjust Angle </li>
      <li>&uparrow; &downarrow;: Precisely Adjust Angle</li>
      <li> SPACE BAR: FIRE!
      <li> ESC KEY: OPTIONS
      </ul>
      
      `
    );
  }

  $('#modal').modal('show');
  $('#new-button').first().focus();
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
    arr[i] = [width * (i / numSlopes), getRandomInt(height * HORIZON_DEPTH, height)];
  }
  // in case of 0 slopes
  if (numSlopes === 0) {
    arr[1] = arr[0];
  }

  return arr;
};

//////////////////////////////////////
// loads cloud image as persistent backdrop behind mountains
const loadClouds = function () {
  var canvasClouds = document.getElementById('canvasClouds');
  canvasClouds.height = window.innerHeight;
  canvasClouds.width = window.innerWidth;
  var ctxClouds = canvasClouds.getContext('2d');
  var img = new Image();
  img.src = '/clouds.jpg';
  img.onload = function () {
    var pattern = ctxClouds.createPattern(img, 'no-repeat');
    ctxClouds.fillStyle = pattern;
    ctxClouds.fillRect(0, 0, canvas.width, canvas.height);
  };

  $('canvas').drawText({
    fillStyle: color('papaya-whip'),
    strokeStyle: color('papaya-whip'),
    strokeWidth: 1,
    x: canvas.width - 90,
    y: 15,
    fontSize: 16,
    fontFamily: 'Verdana, sans-serif',
    text: 'benhammond.tech',
  });
};
//////////////////////////////////////
// draws  stored terrain array
const drawBackground = function () {
  // Add SHADOWS TO EVERYTHING ON #CANVAS
  ctx.shadowColor = color('black-coffee');
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;

  // BUILD GROUND SHAPE
  defineTerrain();

  // THEN DRAW IT
  ctx.fillStyle = color('black-coffee');
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
const showExplosion = function (thisShot, size) {
  // using jCanvas
  // draw static shape
  $('#jcanvas').drawPolygon({
    layer: true,
    name: 'explosion',
    fillStyle: color('fire-opal'),
    strokeStyle: color('papaya-whip'),
    strokeWidth: 1,
    shadowColor: '#EBC356',
    shadowBlur: 15,
    shadowX: -2,
    shadowY: -2,
  });

  // reset explosion values based on shot position
  $('#jcanvas').stopLayer('explosion', true);
  $('#jcanvas')
    .setLayer('explosion', {
      radius: TANK_SIZE,
      x: thisShot.x,
      y: thisShot.y,
      sides: 3,
      rotate: getRandomInt(size, size * 2) - size, // spins in either direction
      concavity: 0.99,
    })
    .drawLayers();

  // DELAY EXPLOSION ANIMATION BASED ON HOW UP TURRET IS (higher shots take longer)
  // TODO: better to delay this until shot has hit something. should fix
  let turretUpness = Math.sin(degreesToRadians(game.tankObjects[game.currentPlayerIdx].turret.angle)); // range 0-1
  $('#jcanvas').delayLayer('explosion', turretUpness * EXPLOSION_DELAY);

  // GROW
  $('#jcanvas').animateLayer(
    'explosion',
    {
      radius: EXPLOSION_RADIUS + size / 3,
      sides: 7,
      concavity: 0.9,
    },
    'fast',
    function (layer) {
      // Callback function: SHRINK
      $(this).animateLayer(
        layer,
        {
          radius: 0,
          rotate: getRandomInt(size, size * 2) - size, // spins in either direction
          concavity: 0.7,
        },
        EXPLOSION_DELAY * 2,
        'swing'
      );
    }
  );
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
  // dig deep left side
  crater.terrainArray.push([crater.leftEdge.x + 1, crater.leftEdge.y + EXPLOSION_RADIUS]);

  // generate crater inner shape
  // TODO: add random jagged edges
  // random center depth
  crater.terrainArray.push([thisShot.x, thisShot.y + getRandomInt(TANK_SIZE, EXPLOSION_RADIUS + TANK_SIZE)]);

  // dig deep right side
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
// DROP NEARBY TANKS
const dropNearbyTanks = function (thisShot) {
  // TODO: optimize by only checking nearby tanks rather than all tanks

  // redrop all tanks
  for (let tank of game.tankObjects) {
    tank.dropSelf();
  }
  refreshScreen();
};

//////////////////////////////////////
// DROP ITEM
// detects top edge of terrain, sets that y value and returns the item
const dropItem = function (item) {
  // item.startY = item.y;
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
  for (let tank of tankObjects) {
    // TANK BODY
    ctx.beginPath();
    ctx.arc(tank.x, tank.y, tank.radius, Math.PI, Math.PI * 2);
    // TANK BODY COLOR
    ctx.fillStyle = tank.color;
    ctx.fill();
    // LIGHT OUTLINE
    ctx.strokeStyle = color('papaya-whip');
    ctx.lineWidth = 3;
    ctx.closePath();
    ctx.stroke();

    // SECOND DARK OUTLINE
    ctx.beginPath();

    ctx.strokeStyle = color('black-coffee');

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
  ctx.strokeStyle = color('papaya-whip');
  ctx.stroke();

  ctx.restore();
};

//////////////////////////////////////
// ADJUST TURRET
const adjustTurret = function (amount) {
  // TODO: rf send tank to adjust in a arg rather than changing
  let currentTank = game.tankObjects[game.currentPlayerIdx];
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
// https://keycode.info/ by WES BOS useful for extracting codes
const listenKeys = function (e) {
  // when modal is open
  if ($('#modal').hasClass('show')) {
    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        refreshScreen();
        adjustTurret(TURRET_INCREMENT * -1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        refreshScreen();
        adjustTurret(TURRET_INCREMENT);
        break;
      case 'Enter':
        if (getWinner()) {
          $('#resume-button').hide();
          $('#new-button').click();
        } else {
          $('#resume-button').show();
        }
        loadModal();
        break;
      case 'Space':
        $('#modal').modal('hide');
        break;
    }
  } else {
    // keyboard ctrls
    switch (e.code) {
      case 'ArrowLeft':
        // USE KEYDROWN.JS LIBRARY FOR SPEEDING UP WHEN KEY HELD
        kd.LEFT.down(function () {
          refreshScreen();
          adjustTurret(-1 * TURRET_INCREMENT);
        });

        kd.LEFT.up(function () {
          kd.stop();
        });

        kd.run(function () {
          kd.tick();
        });
        break;
      case 'ArrowRight':
        // USE KEYDROWN.JS LIBRARY FOR SPEEDING UP WHEN KEY HELD
        kd.RIGHT.down(function () {
          refreshScreen();
          adjustTurret(TURRET_INCREMENT);
        });

        kd.RIGHT.up(function () {
          kd.stop();
        });

        kd.run(function () {
          kd.tick();
        });
        break;
      case 'ArrowUp':
        $('#up-button').click();
        break;
      case 'ArrowDown':
        $('#down-button').click();
        break;
      case 'Space':
        $('#fire-button').click();
        break;
      case 'Escape':
        if (getWinner()) {
          $('#resume-button').hide();
          $('#new-button').click();
        } else {
          $('#resume-button').show();
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
    case 'up-button':
      // up arrow fine adjusts towards top of screen
      refreshScreen();
      let fineAdjustmentUp = 1;
      if (game.tankObjects[game.currentPlayerIdx].turret.angle > 90) {
        fineAdjustmentUp *= -1;
      }
      adjustTurret(fineAdjustmentUp);
      break;
    case 'down-button':
      refreshScreen();
      // down arrow fine adjusts turret lower on whichever side it's on
      let fineAdjustmentDown = 1;
      if (game.tankObjects[game.currentPlayerIdx].turret.angle < 90) {
        fineAdjustmentDown *= -1;
      }
      adjustTurret(fineAdjustmentDown);
      break;
    case 'left-button':
      // let mouseIsUp = false;
      refreshScreen();
      adjustTurret(-1 * 10 * TURRET_INCREMENT);

      break;
    case 'right-button':
      refreshScreen();
      adjustTurret(9 * TURRET_INCREMENT);
      break;
    case 'fire-button':
      refreshScreen();
      let currentTank = game.tankObjects[game.currentPlayerIdx];

      currentTank.fire();
      if (getWinner()) {
        loadModal(`Player ${game.winningPlayer + 1} Is A Big Winner!`, 'What Would You Like To Do?');
      } else {
        game.nextPlayersTurn();
      }

      break;
    case 'resume-button':
      $('#resume-button').hide();
      $('#modal').modal('hide');
      break;
    case 'new-button':
      const prevNumHumans = game.numHumansAtStart;
      game.newGame(prevNumHumans, 0);
      break;
    case 'change-players-button':
      // show or hide player dropdowns
      $('#change-players-container').toggle();
      break;

    case 'options':
      $('#resume-button').show();
      loadModal();
      break;
  }

  // by .CLASS
  if ($(e.target).hasClass('num-humans')) {
    //set number of humans
    game.numHumansAtStart = $(e.target).data('humans');
    // might have to disable this once robots can play
    game.newGame(game.numHumansAtStart, 0);
    // rehide player dropdown in modal for next time
    $('#change-players-container').toggle();
    $('#modal').modal('hide');
  } else if ($(e.target).hasClass('num-robots')) {
    // set number robots
    game.numRobotsAtStart = $(e.target).data('robots');
  }
};

/// SCREEN LOAD
const canvas = document.querySelector('#canvas');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const ctx = canvas.getContext('2d');

const jcanvas = document.querySelector('#jcanvas');
jcanvas.height = window.innerHeight;
jcanvas.width = window.innerWidth;

// START GAME
game.newGame(DEFAULT_NUM_HUMANS, DEFAULT_NUM_ROBOTS);
if (!TEST_MODE) {
  loadModal();
}

// USER INPUT
document.onkeydown = listenKeys;
$('body').click((e) => handleClick(e));
// REDRAW GAME IF USER RESIZES WINDOW
$(window).resize(function () {
  location.reload(true);
});
