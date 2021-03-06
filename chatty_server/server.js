// server.js

const express = require('express');
const WebSocket = require('ws');
const SocketServer = WebSocket.Server;
const uuid         = require('uuid');

// Set the port to 2001
const PORT = 2001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });


const activeSockets = {
  "type": "activeSockets",
  "number": 0
}


//broadcasting function
wss.broadcast = function broadcast(message) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  activeSockets.number++;
  wss.broadcast(JSON.stringify(activeSockets));
  console.log('Client connected', activeSockets);

  ws.on('message', function incoming(data) {
    const message = JSON.parse(data);
    console.log(`const message = ${message}`)
      if (message.type == "postMessage") {
        message.id = uuid.v4();
        message.type = "incomingMessage";
      } else if (message.type == "postNotification") {
        message.id = uuid.v4();
        message.type = "incomingNotification";
      }
    messageReturn = JSON.stringify(message);
    wss.broadcast(messageReturn);
    console.log(`message to be received by app: ${messageReturn}`);

  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    activeSockets.number--;
    wss.broadcast(JSON.stringify(activeSockets));
    console.log('Client disconnected', JSON.stringify(activeSockets));
  });
});
