const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const connectedUsers = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join', (data) => {
    const { name, key } = data;
    if (key === '1234') {
      connectedUsers[socket.id] = { name, color: 'green' };
      io.emit('userList', Object.values(connectedUsers));
      console.log(`${name} joined the chat`);
    } else {
      socket.emit('error', 'Invalid key');
    }
  });

  socket.on('disconnect', () => {
    const user = connectedUsers[socket.id];
    if (user) {
      delete connectedUsers[socket.id];
      io.emit('userList', Object.values(connectedUsers));
      console.log(`${user.name} disconnected`);
    }
  });

  socket.on('chatMessage', (data) => {
    const user = connectedUsers[socket.id];
    if (user) {
      const message = { user, text: data.text };
      io.emit('chatMessage', message);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
