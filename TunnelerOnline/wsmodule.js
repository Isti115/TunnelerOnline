'use strict';

var rooms = {};
var players = {};

var tank_shape = [
  [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2],
            [-1, -1], [0, -1], [1, -1],
            [-1,  0], [0,  0], [1,  0], [2,  0], [3,  0],
            [-1,  1], [0,  1], [1,  1],
  [-2,  2], [-1,  2], [0,  2], [1,  2], [2,  2]
];

var diagonal_tank_shape = [
                                [0, -3],
                                [0, -2], [1, -2],
                      [-1, -1], [0, -1], [1, -1], [2, -1],
  [-3,  0], [-2,  0], [-1,  0], [0,  0], [1,  0], [2,  0], [3,  0],
            [-2,  1], [-1,  1], [0,  1], [1,  1],
                      [-1,  2], [0,  2],          [2,  2],
                                [0,  3]
];

var directions = {
  0: {move: {x: 0, y:-1}},
  1: {move: {x: 1, y:-1}},
  2: {move: {x: 1, y: 0}},
  3: {move: {x: 1, y: 1}},
  4: {move: {x: 0, y: 1}},
  5: {move: {x:-1, y: 1}},
  6: {move: {x:-1, y: 0}},
  7: {move: {x:-1, y:-1}}
};

var tankColors = ['magenta', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'];

var WebSocketServer = require('ws').Server;

module.exports.init = function(server) {
  directions[2].shape = JSON.parse(JSON.stringify(tank_shape));
  directions[3].shape = JSON.parse(JSON.stringify(diagonal_tank_shape));
  rotateShape(tank_shape);
  rotateShape(diagonal_tank_shape);
  directions[4].shape = JSON.parse(JSON.stringify(tank_shape));
  directions[5].shape = JSON.parse(JSON.stringify(diagonal_tank_shape));
  rotateShape(tank_shape);
  rotateShape(diagonal_tank_shape);
  directions[6].shape = JSON.parse(JSON.stringify(tank_shape));
  directions[7].shape = JSON.parse(JSON.stringify(diagonal_tank_shape));
  rotateShape(tank_shape);
  rotateShape(diagonal_tank_shape);
  directions[0].shape = JSON.parse(JSON.stringify(tank_shape));
  directions[1].shape = JSON.parse(JSON.stringify(diagonal_tank_shape));
  
  var webSocketServer = new WebSocketServer({server:server});
  
  webSocketServer.addListener('connection', connect);
  
  setInterval(update, 1000/25);
};

function rotateShape(shape) {
  for (var i = 0; i < shape.length; i++) {
    shape[i] = [shape[i][1], -shape[i][0]];
  }
}

function connect(webSocketConnection) {
  webSocketConnection.addListener('message', receive(webSocketConnection));
  webSocketConnection.addListener('close', disconnect(webSocketConnection));
}

function receive(webSocketConnection) {
  return function(message) {
    var parsedMessage = JSON.parse(message);
    console.log(parsedMessage);
    
    if (parsedMessage.type == 'lobbyJoin') {
      console.log('joined');
      
      var currentPlayer = {};
      
      currentPlayer.connection = webSocketConnection;
      
      var id = '';
      while(id == '' || id in players) {
        id = getRandomId(10);
      }
      
      webSocketConnection.id = id;
      currentPlayer.connection.send(JSON.stringify({type: 'id', data: {id: id}}));
      
      currentPlayer.userName = parsedMessage.data.userName;
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
      console.log('started');
      
      if (!(parsedMessage.sender in players)) {
        return; // TODO: throw back to index
      }
      
      var currentRoom = rooms[players[parsedMessage.sender].roomName];
      
      if (currentRoom.owner == parsedMessage.sender) {
        currentRoom.state = 'connecting';
        currentRoom.terrain = {};
        
        for (var x = 0; x < 76; x++) {
          currentRoom.terrain[x + '|' +  0] = {type: 'rock'};
          currentRoom.terrain[x + '|' + 71] = {type: 'rock'};
        }
        
        for (var y = 0; y < 71; y++) {
          currentRoom.terrain[ 0 + '|' + y] = {type: 'rock'};
          currentRoom.terrain[76 + '|' + y] = {type: 'rock'};
        }
        
        for (var i = 0; i < currentRoom.players.length; i++) {
          players[currentRoom.players[i]].color = tankColors[Math.floor(Math.random() * tankColors.length)];
          
          players[currentRoom.players[i]].position = {x: 38, y: 35};
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
      console.log('gameJoined');
      
      if (!(parsedMessage.sender in players)) {
        return; // TODO: throw back to index
      }
      
      players[parsedMessage.sender].connection = webSocketConnection;
      webSocketConnection.id = parsedMessage.sender;
      
      players[parsedMessage.sender].state = 'game';
    }
    
    if (parsedMessage.type == 'move') {
      console.log('moved');
      
      if (!(parsedMessage.sender in players)) {
        return; // TODO: throw back to index
      }
      
      players[parsedMessage.sender].direction = parsedMessage.data.direction;
      players[parsedMessage.sender].moved = true;
    }
    
    if (parsedMessage.type == 'shot') {
      console.log('shot');
      
      if (!(parsedMessage.sender in players)) {
        return; // TODO: throw back to index
      }
      
      var currentPlayer = players[parsedMessage.sender];
      
      if (currentPlayer.coolDown > 0) {
        return;
      }
      
      if (currentPlayer.shots.length < 5) {
        currentPlayer.shots.push({position: {x: currentPlayer.position.x + directions[currentPlayer.direction].move.x * 4,
                                             y: currentPlayer.position.y + directions[currentPlayer.direction].move.y * 4,
                                            }, direction: currentPlayer.direction});
        
        currentPlayer.coolDown = 10;
      }
    }
  }
}

function getRandomId(length) {
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
  }
}

function update() {
  // console.log(rooms);
  for (var room in rooms) {
    if (rooms[room].state == 'lobby') {
      var lobbyData = {};
      
      lobbyData.players = [];
      
      for (var i = 0; i < rooms[room].players.length; i++) {
        lobbyData.players.push(players[rooms[room].players[i]].userName + ' : ' + rooms[room].players[i]);
      }
      
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
      
      gameData.map = JSON.parse(JSON.stringify(rooms[room].terrain));
      
      gameData.players = [];
      gameData.shots = [];
      
      for (var i = 0; i < rooms[room].players.length; i++) {
        var currentPlayer = players[rooms[room].players[i]];
        if (currentPlayer.moved) {
          currentPlayer.position.x += directions[currentPlayer.direction].move.x;
          currentPlayer.position.y += directions[currentPlayer.direction].move.y;
          currentPlayer.moved = false;
        }
        
        for (var j = 0; j < directions[currentPlayer.direction].shape.length; j++) {
          gameData.map[(currentPlayer.position.x + directions[currentPlayer.direction].shape[j][0]) + '|' +
                       (currentPlayer.position.y + directions[currentPlayer.direction].shape[j][1])] = {type: 'player', id: rooms[room].players[i]};
        }
        
        gameData.players.push({x: currentPlayer.position.x, y: currentPlayer.position.y, direction: currentPlayer.direction, color: currentPlayer.color});
      }
      
      for (var i = 0; i < rooms[room].players.length; i++) {
        var currentPlayer = players[rooms[room].players[i]];
        
        if (currentPlayer.coolDown > 0) {
          currentPlayer.coolDown--;
        }
        
        for (var j = 0; j < currentPlayer.shots.length; j++) {
          currentPlayer.shots[j].position.x += directions[currentPlayer.shots[j].direction].move.x;
          currentPlayer.shots[j].position.y += directions[currentPlayer.shots[j].direction].move.y;
          
          var currentPosition = gameData.map[currentPlayer.shots[j].position.x + '|' + currentPlayer.shots[j].position.y];
          
          if (currentPosition != null) {
            if (currentPosition.type == 'player') {
              players[currentPosition.id].shield -= 10;
              console.log(players[currentPosition.id]);
              if (players[currentPosition.id].shield <= 0) {
                players[currentPosition.id].position.y = 0;
              }
            }
            currentPlayer.shots.splice(j, 1);
          }
        }
        
        gameData.shots = gameData.shots.concat(currentPlayer.shots);
      }
      
      for (var i = 0; i < rooms[room].players.length; i++) {
        players[rooms[room].players[i]].connection.send(JSON.stringify({type: 'gameUpdate', data: gameData}));
        players[rooms[room].players[i]].connection.send(JSON.stringify({type: 'meterUpdate', data: {energy: players[rooms[room].players[i]].energy, shield: players[rooms[room].players[i]].shield}}));
      }
    }
  }
}