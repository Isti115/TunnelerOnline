'use strict';

window.addEventListener('load', lobby_init, false);

function lobby_init() {
  var roomName = location.hash;
  
  if (roomName == '') {
    location.href = '/#NoRoomNameGiven';
    return;
  }
  
  roomName = roomName.substr(1);
  
  document.getElementById('roomName').innerHTML = 'Room name: ' + roomName;
  
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