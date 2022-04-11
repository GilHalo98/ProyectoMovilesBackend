const { getToken, getTokenData } = require("../middleware/jwtConfig");

const Eventos = require("../utils/EventosSockets");
const EVENTOS = new Eventos.EventosSockets();

const diccionarioUsuarios = {}

module.exports = (io) => {
  io.on(EVENTOS.CONEXION, (socket) => {
    console.log('a user connected');

    socket.on(EVENTOS.DESCONEXION, () => {
      console.log('user disconnected');
    });

    socket.on(EVENTOS.MENSAJE_ENVIADO_PRIVADO, (msg, to) => {
      console.log('mensaje ' + msg + ' para ' + to);
    });

    socket.on(EVENTOS.MENSAJE_ENVIADO, (msg) => {
      console.log('message: ' + msg);
      socket.broadcast.emit(EVENTOS.MENSAJE_ENVIADO, msg);
    });

    socket.on(EVENTOS.CLIENTE_DISPONIBLE, (tokenCliente) => {
      console.log('Cliente disponible');
      payload = getTokenData(tokenCliente);
      diccionarioUsuarios[payload.usuario] = socket.id;

      socket.broadcast.emit(
        EVENTOS.CLIENTE_DISPONIBLE,
        "cliente " + payload.usuario + " conectado"
      );

      console.log(diccionarioUsuarios);
    });

    socket.on(EVENTOS.CLIENTE_TERMINADO, (tokenCliente) => {
      console.log('Cliente terminado');
      payload = getTokenData(tokenCliente);
      delete diccionarioUsuarios[payload.usuario];

      socket.broadcast.emit(
        EVENTOS.CLIENTE_TERMINADO,
        "cliente " + payload.usuario + " desconectado"
      );

      console.log(diccionarioUsuarios);
    });
  });
};