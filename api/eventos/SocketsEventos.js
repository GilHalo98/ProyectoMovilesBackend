module.exports = (io) => {
  io.on('connect', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      socket.broadcast.emit('chat message', msg);
    });
  });
};