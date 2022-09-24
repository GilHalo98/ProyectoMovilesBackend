// Modelos de la DB
const db = require("../models/index");

const Respuestas = require("../utils/CodigoApp");
const { Op } = require("sequelize");

const { getToken, getTokenData } = require("../middleware/jwtConfig");

const Mensaje = db.Mensaje;
const Usuario = db.Usuario;

const CODIGOS = new Respuestas.CodigoApp();


// Cambia el estado del usuario.
exports.historialMensajes = async(request, respuesta) => {
    // GET Request.
    const headers = request.headers;
    const cuerpo = request.body;
    const parametros = request.params;

    try {
        // Se obtiene el payload del token.
        let payload = getTokenData(headers.token);

        // En caso de que el token sea invalido.
        if (!payload) {
            respuesta.status(401).json({
                codigo_respuesta: CODIGOS.TOKEN_INVALIDO,
            });
        }

        // Verificamos que exista un nuevo estado.
        if (!parametros.idDestinatario) {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
            });
        }

        // Verificamos que el destinatario exista
        let usuario = await Usuario.findOne({
            where: {
                id: parametros.idDestinatario
            },
        });

        // Si el usuario no existe se manda un codigo de error.
        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_ENCONTRADO,
            });
        }

        // Buscamos los mensajes que pertenescan al
        // remitente y el destinatario.
        const mensajes_enviados = await Mensaje.findAll({
            where: {
                idRemitente: payload.usuario,
                idDestinatario: parametros.idDestinatario,
            }
        });

        const mensaje_recividos = await Mensaje.findAll({
            where: {
                idDestinatario: payload.usuario,
                idRemitente: parametros.idDestinatario,
            }
        });

        // Combinamos las dos listas de mensajes enviados y recividos.
        const mensajes = mensajes_enviados.concat(mensaje_recividos);

        // Los organizamos por fechas de envios.
        mensajes.sort((date1, date2) => {
                return new Date(date1.fecha) - new Date(date2.fecha);
            }
        );

        // Retorna los mensajes
        respuesta.status(201).json({
            codigo_respuesta: CODIGOS.HISTORIAL_MENSAJES_ENCONTRADOS,
            mensajes,
        });

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

exports.utimoMensaje = async(request, respuesta) => {
    // GET Request.
    const headers = request.headers;
    const cuerpo = request.body;
    const parametros = request.params;

    try {
        // Se obtiene el payload del token.
        let payload = getTokenData(headers.token);

        // En caso de que el token sea invalido.
        if (!payload) {
            respuesta.status(401).json({
                codigo_respuesta: CODIGOS.TOKEN_INVALIDO,
            });
        }

        // Verificamos que exista un nuevo estado.
        if (!parametros.idDestinatario) {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
            });
        }

        // Verificamos que el destinatario exista
        let usuario = await Usuario.findOne({
            where: {
                id: parametros.idDestinatario
            },
        });

        // Si el usuario no existe se manda un codigo de error.
        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_ENCONTRADO,
            });
        }

        // Buscamos los mensajes que pertenescan al
        // remitente y el destinatario.
        const mensajes_enviados = await Mensaje.findAll({
            where: {
                idRemitente: payload.usuario,
                idDestinatario: parametros.idDestinatario,
            }
        });

        const mensaje_recividos = await Mensaje.findAll({
            where: {
                idDestinatario: payload.usuario,
                idRemitente: parametros.idDestinatario,
            }
        });

        // Combinamos las dos listas de mensajes enviados y recividos.
        const mensajes = mensajes_enviados.concat(mensaje_recividos);

        // Los organizamos por fechas de envios.
        mensajes.sort((date1, date2) => {
                return new Date(date1.fecha) - new Date(date2.fecha);
            }
        );

        // Retorna los mensajes
        respuesta.status(201).json({
            codigo_respuesta: CODIGOS.HISTORIAL_MENSAJES_ENCONTRADOS,
            utimo_mensaje: mensajes[mensajes.length - 1],
        });

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};