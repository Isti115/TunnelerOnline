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
    startGame();
  }, false);

  var formFields = document.getElementsByClassName('formField');
  [].forEach.call(formFields, function(currField) {
    currField.addEventListener('keypress', function(e) {
      if (e.keyCode == 13) {
        startGame();
      }
    }, false)
  });
  
  console.log('Index initialized.');
}

function startGame() {
  sessionStorage.setItem('userName', document.getElementById('startUserName').value);
  
  location.href = location.origin + '/lobby#' + document.getElementById('createGameLobbyName').value;
}

function messageIn(message) {
  console.log(message);
}
