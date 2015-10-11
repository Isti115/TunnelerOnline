'use strict';

window.addEventListener('load', lobby_init, false);

var tankColors = ['magenta', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'];
var tankColorCodes = {
  'magenta': '#cd8ed9',
  'red': '#d98e8e',
  'orange': '#e1b487',
  'yellow': '#d9d98e',
  'green': '#00fc00',
  'cyan': '#8ed9d9',
  'blue': '#2c2cfc',
  'purple': '#b38ed9'
};

function lobby_init() {
  var roomName = location.hash;
  
  if (roomName == '') {
    location.href = '/#NoRoomNameGiven';
    return;
  }
  
  roomName = roomName.substr(1);
  
  document.getElementById('roomName').innerHTML = 'Room name: ' + roomName;
  
  var colorSelector = document.getElementById('colorSelector');
  
  for (var currentColor in tankColorCodes) {
    var currentOption = document.createElement('option');
    currentOption.innerHTML = currentColor;
    currentOption.value = currentColor;
    
    currentOption.style.backgroundColor = tankColorCodes[currentColor];
    
    colorSelector.appendChild(currentOption);
  }
  
  colorSelector.addEventListener('change', function(){
    sessionStorage.setItem('color', colorSelector.value);
    colorSelector.style.backgroundColor = tankColorCodes[colorSelector.value];
  }, false);
  
  var randomColor = tankColors[Math.floor(Math.random() * tankColors.length)];
  sessionStorage.setItem('color', randomColor);
  colorSelector.value = randomColor;
  colorSelector.style.backgroundColor = tankColorCodes[randomColor];
  
  webSocket.addEventListener('open', function() {
    messageOut({type: 'lobbyJoin', data: {userName: sessionStorage.getItem('userName'), roomName: roomName}});
  }, false);
  
  document.getElementById('startGameButton').addEventListener('click', startGame, false);
  
  console.log('Lobby initialized.');
}

function messageIn(message) {
  // console.log(message);
  
  if (message.type == 'id') {
    sessionStorage.setItem('id', message.data.id);
  }
  
  if (message.type == 'lobbyUpdate') {
    var roomInfo = '';
    
    for (var i = 0; i < message.data.players.length; i++) {
      roomInfo += message.data.players[i] + '<br />';
    }
    
    document.getElementById('roomInfo').innerHTML = roomInfo;
  }
  
  if (message.type == 'gameStart') {
    location.href = '/game';
  }
}

function startGame() {
  messageOut({type: 'gameStart', sender: sessionStorage.getItem('id')});
}