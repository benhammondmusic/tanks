/*!
 tanks
 */

// returns random int >= low && < high
const getRandomInt = function (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
};

const canvasLandscape = document.querySelector("#landscape");
// canvasLandscape.width = document.body.clientWidth;
// canvasLandscape.width = 800;
// canvasLandscape.height = document.body.clientHeight;
canvasLandscape.height = 400;
canvasLandscape.width = canvasLandscape.height * 2;
const ctxL = canvasLandscape.getContext("2d");

// DRAW SKY
ctxL.beginPath();
ctxL.rect(0, 0, canvasLandscape.width, canvasLandscape.height);
ctxL.fillStyle = "skyblue";
ctxL.fill();

// DRAW GROUND

ctxL.beginPath();
let startPoint = [0, getRandomInt(canvasLandscape.height * 0.5, canvasLandscape.height * 0.95)];
let previousPoint = startPoint;
let nextPoint = [0, 0];

// random hills
for (let i = 0; i <= 4; i++) {
  //   console.log(previousPoint, "prev");

  //   ctxL.moveTo(previousPoint[0], previousPoint[1]);
  nextPoint[0] = canvasLandscape.width * (i / 4);
  nextPoint[1] = getRandomInt(canvasLandscape.height * 0.5, canvasLandscape.height * 0.8);
  //   console.log(nextPoint, "next");
  ctxL.lineTo(nextPoint[0], nextPoint[1]);
  previousPoint = nextPoint;
}

// connect polygon along bottom edges
// ctxL.moveTo(previousPoint[0], previousPoint[1]);
ctxL.lineTo(canvasLandscape.width, canvasLandscape.height);
// ctxL.moveTo(canvasLandscape.width, canvasLandscape.height);
ctxL.lineTo(0, canvasLandscape.height);
// ctxL.moveTo(0, canvasLandscape.height);
// ctxL.lineTo(startPoint[0], startPoint[1]);

ctxL.stroke();

ctxL.closePath();
ctxL.fillStyle = "#00EE00";
ctxL.fill();
