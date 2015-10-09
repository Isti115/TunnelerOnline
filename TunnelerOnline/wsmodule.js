var WebSocketServer = require('ws').Server;

module.exports.init = function(server) {
  var webSocketServer = new WebSocketServer({server:server});
  
  webSocketServer.addListener('connection', connect);
};

var clients = [];
var rooms = {};
var players = {};

function connect(webSocketConnection) {
  webSocketConnection.addListener('message', receive(webSocketConnection));
  webSocketConnection.addListener('close', disconnect(webSocketConnection));
  
  clients.push(webSocketConnection);
  
  console.log('client connected with ip: ' + webSocketConnection._socket.remoteAddress);
  console.log('client count: ' + clients.length);
}

function receive(webSocketConnection) {
  return function(message) {
    var parsedMessage = JSON.parse(message);
    console.log(parsedMessage);
    
    if (parsedMessage.type == 'lobbyJoin') {
      console.log("joined");
      
      var currentPlayer = {};
      
      currentPlayer.connection = webSocketConnection;
      
      currentPlayer.roomName = parsedMessage.roomName;
      
      var id = '';
      while(id == '' || id in players)
      {
        id = getRandomId(10);
      }
      
      currentPlayer.connection.send(JSON.stringify({type: 'id', id: id}));
      
      players[id] = currentPlayer;
    }
  }
}

function disconnect(webSocketConnection) {
  return function() {
    clients.splice(clients.indexOf(webSocketConnection), 1);
    console.log('client disconnected. remaining: ' + clients.length)
  }
}

function getRandomId(length) {
  // return Math.floor(1000000000 + Math.random() * 9000000000);
  
  var characters = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var id = '';
  
  for (var i = 0; i < length; i++) {
    id += characters[Math.floor(Math.random()*characters.length)];
  }
  
  return id;
}

// module.exports.broadcast = function(data) {
//   for (var i = 0; i < clients.length; i++) {
//     clients[i].send(JSON.stringify(data));
//   }
// }
