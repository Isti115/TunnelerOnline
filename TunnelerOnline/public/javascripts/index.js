"use strict";

window.addEventListener('load', index_init, false);

function index_init() {
  var message = localStorage.getItem('message');
  if (message !== null) {
    document.getElementById('message').innerHTML = 'Message: ' + message;
    localStorage.removeItem('message');
  }
  
  if (localStorage.getItem('sessionID') !== null) {
    localStorage.removeItem('sessionID');
  }
  
  console.log('Index initialized.');
}

function messageIn(object) {
  console.log(object);
}
