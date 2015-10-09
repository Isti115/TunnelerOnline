"use strict";

var webSocket = new WebSocket('ws://localhost:3000/');

var logIncomingMessages = false;

webSocket.addEventListener('open', function (e) {
  console.log('Connection open.')
}, false);

webSocket.addEventListener('close', function (e) {
  console.log('Connection closed.')
}, false);

webSocket.addEventListener('message', function (message) {
  if (logIncomingMessages) {console.log('Incoming message:' + message.data);}
}, false);

webSocket.addEventListener('error', function (e) {
  console.log('Error:' + e.data)
}, false);

webSocket.addEventListener('message', function (message) {
  messageIn(JSON.parse(message.data));
}, false);

function messageOut(object) {
  webSocket.send(JSON.stringify(object));
}