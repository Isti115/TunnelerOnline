"use strict";

var WebSocketServer = require('ws').Server;

module.exports.init = function(server) {
  var webSocketServer = new WebSocketServer({server:server});
  
  webSocketServer.addListener('connection', connect);
  
  setInterval(update, 1000/25);
};

// var clients = [];
var rooms = {};
var players = {};

var directions = {
  0: {x: 0, y:-1},
  1: {x: 1, y:-1},
  2: {x: 1, y: 0},
  3: {x: 1, y: 1},
  4: {x: 0, y: 1},
  5: {x:-1, y: 1},
  6: {x:-1, y: 0},
  7: {x:-1, y:-1}
};

var tankColors = ['magenta', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'];

function connect(webSocketConnection) {
  webSocketConnection.addListener('message', receive(webSocketConnection));
  webSocketConnection.addListener('close', disconnect(webSocketConnection));
  
  // clients.push(webSocketConnection);
  
  // console.log('client connected with ip: ' + webSocketConnection._socket.remoteAddress);
  // console.log('client count: ' + clients.length);
}

function receive(webSocketConnection) {
  return function(message) {
    var parsedMessage = JSON.parse(message);
    console.log(parsedMessage);
    
    if (parsedMessage.type == 'lobbyJoin') {
      console.log("joined");
      
      var currentPlayer = {};
      
      currentPlayer.connection = webSocketConnection;
      
      var id = '';
      while(id == '' || id in players) {
        id = getRandomId(10);
      }
      
      webSocketConnection.id = id;
      currentPlayer.connection.send(JSON.stringify({type: 'id', data: {id: id}}));
      
      currentPlayer.roomName = parsedMessage.data.roomName;
      currentPlayer.state = 'lobby';
      
      if (!(currentPlayer.roomName in rooms)) {
        var currentRoom = {};
        
        currentRoom.state = 'lobby';
        currentRoom.owner = id;
        currentRoom.players = [];
        
        rooms[currentPlayer.roomName] = currentRoom;
      }
      
      rooms[currentPlayer.roomName].players.push(id);
      
      players[id] = currentPlayer;
    }
    
    if (parsedMessage.type == 'gameStart') {
      console.log("started");
      
      if (!(parsedMessage.sender in players)) {
        return; // TODO: throw back to index
      }
      
      var currentRoom = rooms[players[parsedMessage.sender].roomName];
      
      if (currentRoom.owner == parsedMessage.sender) {
        currentRoom.state = 'connecting';
        
        for (var i = 0; i < currentRoom.players.length; i++) {
          players[currentRoom.players[i]].color = tankColors[Math.floor(Math.random() * tankColors.length)];
          
          players[currentRoom.players[i]].position = {x: 38, y: 35.5};
          players[currentRoom.players[i]].direction = 0;
          players[currentRoom.players[i]].moved = false;
          
          players[currentRoom.players[i]].shots = [];
          players[currentRoom.players[i]].coolDown = 0;
          
          players[currentRoom.players[i]].energy = 100;
          players[currentRoom.players[i]].shield = 100;
          
          players[currentRoom.players[i]].state = 'connecting';
          players[currentRoom.players[i]].connection.send(JSON.stringify({type: 'gameStart'}));
        }
      }
    }
    
    if (parsedMessage.type == 'gameJoin') {
      console.log("gameJoined");
      
      if (!(parsedMessage.sender in players)) {
        return; // TODO: throw back to index
      }
      
      players[parsedMessage.sender].connection = webSocketConnection;
      webSocketConnection.id = parsedMessage.sender;
      
      players[parsedMessage.sender].state = 'game';
    }
    
    if (parsedMessage.type == 'move') {
      console.log("moved");
      
      if (!(parsedMessage.sender in players)) {
        return; // TODO: throw back to index
      }
      
      players[parsedMessage.sender].direction = parsedMessage.data.direction;
      players[parsedMessage.sender].moved = true;
    }
    
    if (parsedMessage.type == 'shot') {
      console.log("shot");
      
      if (!(parsedMessage.sender in players)) {
        return; // TODO: throw back to index
      }
      
      var currentPlayer = players[parsedMessage.sender];
      
      if (currentPlayer.coolDown > 0) {
        currentPlayer.coolDown--;
        return;
      }
      
      if (currentPlayer.shots.length < 5) {
        currentPlayer.shots.push({position: JSON.parse(JSON.stringify(currentPlayer.position)), direction: currentPlayer.direction});
        currentPlayer.coolDown = 5;
      }
    }
  }
}

function getRandomId(length) {
  // return Math.floor(1000000000 + Math.random() * 9000000000);
  
  var characters = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var id = '';
  
  for (var i = 0; i < length; i++) {
    id += characters[Math.floor(Math.random() * characters.length)];
  }
  
  return id;
}

function disconnect(webSocketConnection) {
  return function() {
    if (webSocketConnection.id in players && players[webSocketConnection.id].state != 'connecting') {
      rooms[players[webSocketConnection.id].roomName].players.splice(rooms[players[webSocketConnection.id].roomName].players.indexOf(webSocketConnection.id), 1);
      if (rooms[players[webSocketConnection.id].roomName].players.length == 0) {
        delete rooms[players[webSocketConnection.id].roomName];
      }
      console.log('quit ' + webSocketConnection.id);
      delete players[webSocketConnection.id];
    }
    
    // clients.splice(clients.indexOf(webSocketConnection), 1);
    // console.log('client disconnected. remaining: ' + clients.length);
  }
}

function update() {
  // console.log(rooms);
  for (var room in rooms) {
    if (rooms[room].state == 'lobby') {
      var lobbyData = {};
      
      lobbyData.players = rooms[room].players;
      
      for (var i = 0; i < rooms[room].players.length; i++) {
        players[rooms[room].players[i]].connection.send(JSON.stringify({type: 'lobbyUpdate', data: lobbyData}));
      }
    }
    
    if (rooms[room].state == 'connecting') {
      var canStart = true;
      var i = 0;
      while (canStart && i < rooms[room].players.length) {
        if (players[rooms[room].players[i]].state == 'connecting') {
          canStart = false;
        }
        i++;
      }
      
      if (canStart) {
        rooms[room].state = 'game';
        
        for (var i = 0; i < rooms[room].players.length; i++) {
          players[rooms[room].players[i]].connection.send(JSON.stringify({type: 'statusUpdate', data: {status: 'game'}}));
        }
      }
    }
    
    if (rooms[room].state == 'game') {
      var gameData = {};
      gameData.players = [];
      gameData.shots = [];
      
      for (var i = 0; i < rooms[room].players.length; i++) {
        var currentPlayer = players[rooms[room].players[i]];
        if (currentPlayer.moved) {
          currentPlayer.position.x += directions[currentPlayer.direction].x;
          currentPlayer.position.y += directions[currentPlayer.direction].y;
          currentPlayer.moved = false;
        }
        
        for (var j = 0; j < currentPlayer.shots.length; j++) {
          currentPlayer.shots[j].position.x += directions[currentPlayer.shots[j].direction].x;
          currentPlayer.shots[j].position.y += directions[currentPlayer.shots[j].direction].y;
        }
        
        gameData.players.push({x: currentPlayer.position.x, y: currentPlayer.position.y, direction: currentPlayer.direction, color: currentPlayer.color});
        gameData.shots = gameData.shots.concat(currentPlayer.shots);
      }
      
      for (var i = 0; i < rooms[room].players.length; i++) {
        players[rooms[room].players[i]].connection.send(JSON.stringify({type: 'gameUpdate', data: gameData}));
      }
    }
  }
}