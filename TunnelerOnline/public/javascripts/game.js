"use strict";

window.addEventListener('load', game_init, false);

var playerId;

var keyDown = [];

var gameCanvas, gameContext;

var frame, tank, tank_diagonal;

var offsetX = 8, offsetY = 8, fieldWidth = 304, fieldHeight = 284;

var fieldCenterX = offsetX + fieldWidth / 2, fieldCenterY = offsetY + fieldHeight / 2;
var energyMeter = {x:88, y:316, width:176, height:16, color:'#F0E81C', value:100};
var staminaMeter = {x:88, y:360, width:176, height:16, color:'#28F0F0', value:100};

var x = 0, y = 0;
var direction = 0, directions;

var lastTime = -1, passedTime = 0, updateTime = 50;

function game_init() {
  if (sessionStorage.getItem('id') === null) {
    sessionStorage.setItem('message', 'No game parameters given.');
    location.href = '/';
    return;
  }
  
  playerId = sessionStorage.getItem('id');
  
  webSocket.addEventListener('open', function() {
    messageOut({type: 'gameJoin', sender: playerId});
  }, false);
  
  window.addEventListener('keydown', function(e) {keyDown[e.keyCode] = true;}, false);
  window.addEventListener('keyup', function(e) {keyDown[e.keyCode] = false;}, false);
  
  gameCanvas = document.getElementById('gameCanvas');
  gameContext = gameCanvas.getContext('2d');
  
  gameCanvas.width = 320;
  gameCanvas.height = 400;
  
  loadImages();
  
  directions = {
    0: {move:{x: 0, y:-1}, image: tank, rotate: -90},
    1: {move:{x: 1, y:-1}, image: tank_diagonal, rotate: -90},
    2: {move:{x: 1, y: 0}, image: tank, rotate:   0},
    3: {move:{x: 1, y: 1}, image: tank_diagonal, rotate:   0},
    4: {move:{x: 0, y: 1}, image: tank, rotate:  90},
    5: {move:{x:-1, y: 1}, image: tank_diagonal, rotate:  90},
    6: {move:{x:-1, y: 0}, image: tank, rotate: 180},
    7: {move:{x:-1, y:-1}, image: tank_diagonal, rotate: 180}
  };
  
  console.log('Game initialized.');
  
  mainLoop(0);
}

function loadImages() {
  frame = new Image();
  frame.addEventListener('load', function(){gameContext.drawImage(frame, 0, 0);}, false);
  frame.src = '../images/frame.png';
  
  tank = new Image();
  tank.src = '../images/tank/blue_tank.png';
  tank_diagonal = new Image();
  tank_diagonal.src = '../images/tank/blue_tank_diagonal.png';
}

function rad(deg) {
  return deg * (Math.PI / 180);
}

function mainLoop(currentTime) {
  if (lastTime == -1) {
    lastTime = currentTime;
  }
  
  var dt = currentTime - lastTime;
  lastTime = currentTime;
  
  passedTime += dt;
  
  if (passedTime >= updateTime) {
    passedTime = 0;
  }
  
  update(dt);
  draw(dt);
  
  window.requestAnimationFrame(mainLoop, gameCanvas);
}

function update(dt) {
  //38:up; 39:right; 40: down; 37:left
  
  var moving = false;
  
  if (keyDown[38])                {direction = 0; moving = true;}
  if (keyDown[39])                {direction = 2; moving = true;}
  if (keyDown[40])                {direction = 4; moving = true;}
  if (keyDown[37])                {direction = 6; moving = true;}
  if (keyDown[38] && keyDown[39]) {direction = 1; moving = true;}
  if (keyDown[39] && keyDown[40]) {direction = 3; moving = true;}
  if (keyDown[40] && keyDown[37]) {direction = 5; moving = true;}
  if (keyDown[37] && keyDown[38]) {direction = 7; moving = true;}
  
  if (moving) {
    x += directions[direction].move.x;
    y += directions[direction].move.y;
    
    if (energyMeter.value > 0) {
      energyMeter.value -= 0.5;
    }
  }
  
  staminaMeter.value -= (dt / 1000);
}

function draw(dt) {
  gameContext.clearRect(offsetX, offsetY, fieldWidth, fieldHeight);
  
  drawMeter(energyMeter);
  drawMeter(staminaMeter);
  
  drawTank();
}

function drawMeter(meter) {
  gameContext.save();
  
  gameContext.fillStyle = '#000000';
  gameContext.fillRect(meter.x, meter.y, meter.width, meter.height);
  
  gameContext.fillStyle = meter.color;
  gameContext.fillRect(meter.x, meter.y, meter.width * (meter.value / 100), meter.height);
  
  gameContext.restore();
}

function drawTank() {
  gameContext.save();
  
  gameContext.translate(fieldCenterX + x*4, fieldCenterY + y*4);
  gameContext.rotate(rad(directions[direction].rotate));
  gameContext.translate(-directions[direction].image.width / 2, -directions[direction].image.height / 2);
  gameContext.drawImage(directions[direction].image, 0, 0);
  
  gameContext.restore();
}

function messageIn(object) {
  console.log(object);
}
