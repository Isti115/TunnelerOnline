"use strict";

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
  
  console.log('Index initialized.');
}

function messageIn(object) {
  console.log(object);
}
