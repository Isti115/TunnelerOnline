var WebSocketServer = require('ws').Server;

var rooms = {};

module.exports.init = function(server) {
  var webSocketServer = new WebSocketServer({server:server});
  
  webSocketServer.addListener('connection', function(webSocketConnection) {
    
    webSocketConnection.addListener('message', function(message) {
      
      var parsedMessage = JSON.parse(message);
      
      if(parsedMessage.type == 'Join')
      {
        webSocketConnection.username = parsedMessage.data.username;
        webSocketConnection.room = parsedMessage.data.room;
        
        console.log(parsedMessage.data.username + ' joined room ' + parsedMessage.data.room);
        
        if(!(parsedMessage.data.room in rooms))
        {
          rooms[parsedMessage.data.room] = [];
          console.log('new room : ' + parsedMessage.data.room)
        }
        rooms[parsedMessage.data.room].push(webSocketConnection);
        
        updateUserList(parsedMessage.data.room);
      }
      
      //roomLog();
      else if (parsedMessage.type == 'CircleData')
      {
        for(var i = 0; i < rooms[webSocketConnection.room].length; i++)
        {
          rooms[webSocketConnection.room][i].send(message);
        }
      }
      
    });
    
    
    console.log('client connected with ip: ' + webSocketConnection._socket.remoteAddress);
    
    webSocketConnection.addListener('close', function() {
      console.log(webSocketConnection.username + ' left');
      
      if(webSocketConnection.username) {
        var index = rooms[webSocketConnection.room].indexOf(webSocketConnection);
        
        rooms[webSocketConnection.room].splice(index, 1);
        
        updateUserList(webSocketConnection.room);
        
        if(rooms[webSocketConnection.room].length == 0) {
          delete rooms[webSocketConnection.room];
        }
      }
    });
    
  });
  
};

var updateUserList = function(room) {
  var players = [];
    
    for(var i = 0; i < rooms[room].length; i++)
    {
        players.push(rooms[room][i].username);
    }
    
    for(var i = 0; i < rooms[room].length; i++)
    {
        rooms[room][i].send(JSON.stringify({type:'PlayerList', data: players}));
    }
};

var roomLog = function() {
  console.log('rooms:');
  
  for(var room in rooms)
  {
    console.log('--' + room);
    for(var i = 0; i < rooms[room].length; i++)
    {
      console.log('----' + rooms[room][i].username);
    }
  }
};