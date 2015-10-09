"use strict";

window.addEventListener('load', lobby_init, false);

function lobby_init() {
  var roomName = location.hash;
  
  if (roomName == '') {
    location.href = '/#NoRoomNameGiven';
  }
  
  document.getElementById('roomName').innerHTML = 'Room name: ' + roomName;
  
  messageOut({type: 'lobbyJoin', roomName: roomName});
  
  console.log('Lobby initialized.');
}

function messageIn(message) {
  console.log(message);
  
  if (message.type == 'id') {
    localStorage.setItem('id', message.id);
  }
}
