// Modelos de la DB
const db = require("../models/index");
const Preferencia = db.Preferencia;

const { getToken, getTokenData } = require("../middleware/jwtConfig");

const Eventos = require("../utils/EventosSockets");
const EVENTOS = new Eventos.EventosSockets();

const diccionarioUsuarios = {};

module.exports = (io) => {
  io.on(EVENTOS.CONEXION, (socket) => {
    const token = socket.handshake.auth.token;
    const payload = getTokenData(token);
    diccionarioUsuarios[payload.usuario] = socket.id;

    console.log('a user connected');

    socket.on(EVENTOS.DESCONEXION, () => {
      console.log('user disconnected');
      delete diccionarioUsuarios[payload.usuario];

      console.log('cliente ' + payload.usuario + ' terminado');

      socket.broadcast.emit(EVENTOS.CLIENTE_TERMINADO, payload.usuario);
    });

    socket.on(EVENTOS.CLIENTE_DISPONIBLE, () => {
      console.log('cliente ' + payload.usuario + ' disponible');

      socket.broadcast.emit(EVENTOS.CLIENTE_DISPONIBLE, payload.usuario);
    });

    socket.on(EVENTOS.MENSAJE_ENVIADO_PRIVADO, (msg, destino) => {
      console.log('mensaje ' + msg + ' para ' + destino);

      socket.broadcast.to(
        diccionarioUsuarios[destino]
      ).emit(EVENTOS.MENSAJE_ENVIADO_PRIVADO, msg);
    });

    socket.on(EVENTOS.CONSULTA_CONTACTOS, () => {
      // Se consultan los contactos del usuario.
      let idsContactos = Preferencia.findOne({
        where: {
          id: payload.preferencia
        },
        attributes: ['contactos']
      });

      var contactosDisponibles = [];

      for (const idContacto in idsContactos) {
        var contactoContectado = diccionarioUsuarios.find(idUsuario => {
          idContacto === idUsuario
        });

        if (contactoContectado) {
          contactosDisponibles.push(idContacto);
        }
      }

      console.log(contactosDisponibles);
    });

    socket.on(EVENTOS.CONSULTA_CLIENTES, () => {
      console.log('Peticion de consulta de clientes de ' + payload.usuario);

      socket.emit(EVENTOS.CONSULTA_CLIENTES, Object.keys(diccionarioUsuarios));
    });

    socket.on(EVENTOS.STREAMING_VIDEO_LLAMADA, (imagen, destino) => {
      socket.broadcast.to(
        diccionarioUsuarios[destino]
      ).emit(EVENTOS.STREAMING_VIDEO_LLAMADA, imagen);
    });

    socket.on(EVENTOS.PETICION_VIDEO_LLAMADA, (destino) => {
      socket.broadcast.to(
        diccionarioUsuarios[destino]
      ).emit(EVENTOS.PETICION_VIDEO_LLAMADA);
    });

    socket.on(EVENTOS.VIDEO_LLAMADA_ACEPTADA, (destino) => {
      socket.broadcast.to(
        diccionarioUsuarios[destino]
      ).emit(EVENTOs.VIDEO_LLAMADA_ACEPTADA);
    });

    socket.on(EVENTOS.VIDEO_LLAMADA_NEGADA, (destino) => {
      socket.broadcast.to(
        diccionarioUsuarios[destino]
      ).emit(EVENTOs.VIDEO_LLAMADA_NEGADA);
    });
  });
};