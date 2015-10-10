"use strict";

window.addEventListener('load', game_init, false);

var playerId;

var keyDown = [];

var gameCanvas, gameContext;
var frameCanvas, frameContext;

var frame, tank, tank_diagonal;

var offsetX = 8, offsetY = 8, fieldWidth = 304, fieldHeight = 284;
var fieldCenterX = offsetX + fieldWidth / 2, fieldCenterY = offsetY + fieldHeight / 2;
var energyMeter = {x:88, y:316, width:176, height:16, color:'#F0E81C', value:100};
var shieldMeter = {x:88, y:360, width:176, height:16, color:'#28F0F0', value:100};

// var x = 0, y = 0;
var direction = 0, directions;

var tankColors = ['magenta', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'];
var tankImages = {};

var status = 'connecting';
var gameData = {players: []};

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
  
  gameCanvas.width = fieldWidth;
  gameCanvas.height = fieldHeight;
  
  frameCanvas = document.getElementById('frameCanvas');
  frameContext = frameCanvas.getContext('2d');
  
  frameCanvas.width = 320;
  frameCanvas.height = 400;
  
  loadImages();
  
  directions = {
    0: {move:{x: 0, y:-1}, image_type: 'tank', rotate: -90},
    1: {move:{x: 1, y:-1}, image_type: 'tank_diagonal', rotate: -90},
    2: {move:{x: 1, y: 0}, image_type: 'tank', rotate:   0},
    3: {move:{x: 1, y: 1}, image_type: 'tank_diagonal', rotate:   0},
    4: {move:{x: 0, y: 1}, image_type: 'tank', rotate:  90},
    5: {move:{x:-1, y: 1}, image_type: 'tank_diagonal', rotate:  90},
    6: {move:{x:-1, y: 0}, image_type: 'tank', rotate: 180},
    7: {move:{x:-1, y:-1}, image_type: 'tank_diagonal', rotate: 180}
  };
  
  console.log('Game initialized.');
  
  mainLoop(0);
}

function loadImages() {
  frame = new Image();
  frame.addEventListener('load', function(){frameContext.drawImage(frame, 0, 0);}, false);
  frame.src = '../images/frame.png';
  
  for (var i = 0; i < tankColors.length; i++) {
    tankImages[tankColors[i]] = {};
    
    tankImages[tankColors[i]].tank = new Image();
    tankImages[tankColors[i]].tank.src = '../images/tank/' + tankColors[i] + '_tank.png';
    tankImages[tankColors[i]].tank_diagonal = new Image();
    tankImages[tankColors[i]].tank_diagonal.src = '../images/tank/' + tankColors[i] + '_tank_diagonal.png';
  }
  
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
  
  window.requestAnimationFrame(mainLoop, frameCanvas);
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
  
  if (status == 'game' && moving) {
    messageOut({type: 'move', sender: playerId, data: {direction: direction}});
  }
  
  // if (moving) {
  //   x += directions[direction].move.x;
  //   y += directions[direction].move.y;
    
  //   if (energyMeter.value > 0) {
  //     energyMeter.value -= 0.5;
  //   }
  // }
  
  // shieldMeter.value -= (dt / 1000);
}

function draw(dt) {
  gameContext.clearRect(0, 0, fieldWidth, fieldHeight);
  frameContext.clearRect(offsetX, offsetY, fieldWidth, fieldHeight);
  
  drawMeter(energyMeter);
  drawMeter(shieldMeter);
  
  for (var i = 0; i < gameData.players.length; i++) {
    drawTank(gameData.players[i].x, gameData.players[i].y, gameData.players[i].direction, gameData.players[i].color);
  }
  
  frameContext.drawImage(gameCanvas, offsetX, offsetY);
}

function drawMeter(meter) {
  frameContext.save();
  
  frameContext.fillStyle = '#000000';
  frameContext.fillRect(meter.x, meter.y, meter.width, meter.height);
  
  frameContext.fillStyle = meter.color;
  frameContext.fillRect(meter.x, meter.y, meter.width * (meter.value / 100), meter.height);
  
  frameContext.restore();
}

function drawTank(x, y, direction, color) {
  gameContext.save();
  
  gameContext.translate(fieldCenterX + x*4, fieldCenterY + y*4);
  gameContext.rotate(rad(directions[direction].rotate));
  
  var currentImage = tankImages[color][directions[direction].image_type];
  
  gameContext.translate(-currentImage.width / 2, -currentImage.height / 2);
  gameContext.drawImage(currentImage, 0, 0);
  
  gameContext.restore();
}

function messageIn(message) {
  if (message.type == 'statusUpdate') {
    status = message.data.status;
  }
  
  if (message.type == 'gameUpdate') {
    gameData = message.data;
  }
}
