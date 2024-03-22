const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, () => {
  console.log('Server started on port 3000');
});


// Begin websocket implementation

 const WebSocketServer = require('ws').Server;

 const wss = new WebSocketServer({ server: server });

  wss.on('connection', (ws) => {
    const numClients = wss.clients.size;
    console.log(`Client connected. Total clients: ${numClients}`);

    wss.broadcast('current visitors: ' + numClients);

    if(ws.readyState === ws.OPEN){
      ws.send('Welcome to my server');
    }
  });

  wss.on('close', () => { 
    console.log(`Client disconnected. Total clients: ${numClients}`);
  });

  wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
      if(client.readyState === client.OPEN){
        client.send(data);
      }
    });
  }