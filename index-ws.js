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

process.on('SIGINT', () => {
  console.log('Shutting down server');
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(()=>{
    shutownDB()
  }) 
});

wss.on('connection', (ws) => {
  const numClients = wss.clients.size;
  console.log(`Client connected. Total clients: ${numClients}`);

  wss.broadcast('current visitors: ' + numClients);

  if(ws.readyState === ws.OPEN){
    ws.send('Welcome to my server');
  }

  db.run(`
    INSERT INTO visitors (count, time)
    VALUES (${numClients}, datetime('now'))
    `);

});

wss.on('close', () => { 
  wss.broadcast(`Current visitors: ${numClients}`);
  console.log(`Client disconnected. Total clients: ${numClients}`);
});

wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if(client.readyState === client.OPEN){
      client.send(data);
    }
  });
}



// end of websocket implementation
// begin database implementation

const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `);
});


function getCounts(){
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);  
  })
};

function shutownDB(){
  getCounts();
  console.log('Shutting down database');
  db.close();
}