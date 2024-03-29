// Modelos de la DB
const db = require("../models/index");
const Preferencia = db.Preferencia;
const Mensaje = db.Mensaje;

const { getToken, getTokenData } = require("../middleware/jwtConfig");
const { generar_codigo_sala } = require("../middleware/util");

const Eventos = require("../utils/EventosSockets");
const EVENTOS = new Eventos.EventosSockets();


const Usuario = db.Usuario;

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
      console.log(
        'mensaje ' + msg
        + ' de ' + payload.usuario
        + ' para ' + destino
      );

      // Fecha actual.
      const fecha = (new Date()).toISOString();

      // El mensaje se agrega a la db.
      const mensaje = {
        'contenido': msg,
        'fecha': fecha,
        'idRemitente': payload.usuario,
        'idDestinatario': destino
      }

      // Despues se registra la preferencia en la db.
      Mensaje.create(mensaje)

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

    socket.on(EVENTOS.STREAMING_VIDEO_LLAMADA, (destinatario) => {
      let remitente = payload.usuario;

      let codigo = generar_codigo_sala(destinatario, remitente);

      // Enviamos el codigo a las dos partes.
      socket.emit(EVENTOS.STREAMING_VIDEO_LLAMADA, codigo);

      socket.broadcast.to(
        diccionarioUsuarios[destinatario]
      ).emit(EVENTOS.STREAMING_VIDEO_LLAMADA, codigo);
    });

    socket.on(EVENTOS.PETICION_VIDEO_LLAMADA, async (destinatario) => {
      let remitente = payload.usuario;

      let username = await Usuario.findOne({
        where: {
          id: payload.usuario,
        },
        attributes: ['nombreUsuario']
      })

      socket.broadcast.to(
        diccionarioUsuarios[destinatario]
      ).emit(
        EVENTOS.PETICION_VIDEO_LLAMADA,
        remitente,
        username.nombreUsuario
      );
    });

    socket.on(EVENTOS.VIDEO_LLAMADA_ACEPTADA, (destinatario) => {
      let remitente = payload.usuario;

      socket.broadcast.to(
        diccionarioUsuarios[destinatario]
      ).emit(EVENTOS.VIDEO_LLAMADA_ACEPTADA, remitente);
    });

    socket.on(EVENTOS.VIDEO_LLAMADA_NEGADA, (destinatario) => {
      let remitente = payload.usuario;

      socket.broadcast.to(
        diccionarioUsuarios[destinatario]
      ).emit(EVENTOS.VIDEO_LLAMADA_NEGADA, remitente);
    });
  });
};