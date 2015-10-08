window.addEventListener('load', lobby_init, false);

function lobby_init() {
  var roomName = location.hash;
  
  if (roomName == '') {
    location.href = '/#NoRoomNameGiven';
  }
  
  document.getElementById('roomName').innerHTML = 'Room name: ' + roomName;
  
  console.log('Lobby initialized.');
}
