'use strict';

window.addEventListener('load', index_init, false);

function index_init() {
  var message = sessionStorage.getItem('message');
  if (message !== null) {
    document.getElementById('message').innerHTML = 'Message: ' + message;
    sessionStorage.removeItem('message');
  }
  
  if (sessionStorage.getItem('sessionID') !== null) {
    sessionStorage.removeItem('sessionID');
  }
  
  // location.hash = '';
  
  document.getElementById('createGameButton').addEventListener('click', function() {
    sessionStorage.setItem('userName', document.getElementById('startUserName').value);
    
    location.href = location.origin + '/lobby#' + document.getElementById('createGameLobbyName').value;
  }, false);
  
  document.getElementById('joinGameButton').addEventListener('click', function() {
    sessionStorage.setItem('userName', document.getElementById('joinUserName').value);
    
    location.href = location.origin + '/lobby#' +  document.getElementById('joinGameLobbyName').value;
  }, false);
  
  console.log('Index initialized.');
}

function messageIn(message) {
  console.log(message);
}
