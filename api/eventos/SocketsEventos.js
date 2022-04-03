const Eventos = require("../utils/EventosSockets");
const EVENTOS = new Eventos.EventosSockets();

const diccionarioUsuarios = {}

module.exports = (io) => {
  io.on(EVENTOS.CONEXION, (socket) => {
    console.log('a user connected');

    socket.on(EVENTOS.DESCONEXION, () => {
      console.log('user disconnected');
    });

    socket.on(EVENTOS.MENSAJE_ENVIADO, (msg) => {
      console.log('message: ' + msg);
      socket.broadcast.emit(EVENTOS.MENSAJE_ENVIADO, msg);
    });

    socket.on(EVENTOS.USUARIO_DISPONIBLE, (cliente) => {
      console.log('cliente conectado: ' + cliente);
      diccionarioUsuarios[cliente] = socket.id;
      console.log(diccionarioUsuarios);
      socket.broadcast.emit(EVENTOS.USUARIO_DISPONIBLE, cliente);
    });
  });
};