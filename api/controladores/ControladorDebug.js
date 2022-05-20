// Modelos de la DB
const db = require("../models/index");
const Respuestas = require("../utils/CodigoApp")
const { Op } = require("sequelize");

const { getToken, getTokenData } = require("../middleware/jwtConfig")
const { enviarValidacion } = require("../middleware/mailConfig");
const { generar_codigo } = require("../middleware/util");

const Usuario = db.Usuario;
const Preferencia = db.Preferencia;
const Rol = db.Rol;

const CODIGOS = new Respuestas.CodigoApp()

// Para generar tokens.
const jwt = require('jsonwebtoken');

// Templatate de vistas.
const { template_chat } = require("../template/chat");
const { template_listaClientes } = require("../template/listaClientes")
const { template_video_chat, template_video_chat_recivido } = require("../template/salaVideoChat")

exports.vistaChat = async(request, respuesta) => {
    // GET Request
    const parametros = request.params;

    try {
        // Busca el usuario por medio del token.
        const payload = getTokenData(parametros.token);

        // En caso de que el token sea invalido.
        if (!payload) {
            respuesta.status(401).json({
                codigo_respuesta: CODIGOS.TOKEN_INVALIDO,
            });
        }

        // Busca el usuario por medio del id proporcionado por el token.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            },
            attributes: ['id', 'nombreUsuario']
        });

        // Si no lo encuentra, envia un error.
        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO
            });
        }

        // Se busca la preferencia del usuario.
        let preferencia = await Preferencia.findOne({
            where: {
                id: payload.preferencia
            },
            attributes: ['contactos']
        });

        // Si el usuario no tiene una preferencia, entonces se envia un error.
        if (!preferencia) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_SIN_CONFIGURACIONES
            });
        }

        // Ahora buscamos las intancias de los contactos.
        let contactos = await Usuario.findAll({
            where: {
                id: {
                    [Op.or]: preferencia.contactos
                }
            },
            attributes: ['id', 'nombreUsuario']
        });

        // Retorna un html con js y socket.io integrado
        respuesta.status(200).send(
            template_chat(
                parametros.token,
                usuario.id,
                usuario.nombreUsuario,
                contactos
            )
        );

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

exports.vistaClientes = async(request, respuesta) => {
    // GET Request
    const parametros = request.params;

    try {
        // Busca el usuario por medio del token.
        const payload = getTokenData(parametros.token);

        // En caso de que el token sea invalido.
        if (!payload) {
            respuesta.status(401).json({
                codigo_respuesta: CODIGOS.TOKEN_INVALIDO,
            });
        }

        // Busca el usuario por medio del id proporcionado por el token.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            },
            attributes: ['id', 'nombreUsuario']
        });

        // Si no lo encuentra, envia un error.
        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO
            });
        }

        // Retorna un html con js y socket.io integrado
        respuesta.status(200).send(
            template_listaClientes(parametros.token)
        );

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

exports.vistaVideoChat = async(request, respuesta) => {
    // GET Request.
    const headers = request.headers;
    const cuerpo = request.body;
    const parametros = request.params;


    try {
        // Busca el usuario por medio del token.
        const payload = getTokenData(parametros.token);

        // En caso de que el token sea invalido.
        if (!payload) {
            respuesta.status(401).json({
                codigo_respuesta: CODIGOS.TOKEN_INVALIDO,
            });
        }

        // Busca el usuario por medio del id proporcionado por el token.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            },
            attributes: ['id', 'nombreUsuario']
        });

        // Si no lo encuentra, envia un error.
        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO
            });
        }

        // Retorna un html con js y socket.io integrado
        respuesta.status(200).send(
            template_video_chat(
                parametros.token,
                usuario.id,
                usuario.nombreUsuario
            )
        );

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

exports.vistaVideoChatRecivido = async(request, respuesta) => {
    // GET Request.
    const headers = request.headers;
    const cuerpo = request.body;
    const parametros = request.params;


    try {
        // Busca el usuario por medio del token.
        const payload = getTokenData(parametros.token);

        // En caso de que el token sea invalido.
        if (!payload) {
            respuesta.status(401).json({
                codigo_respuesta: CODIGOS.TOKEN_INVALIDO,
            });
        }

        // Busca el usuario por medio del id proporcionado por el token.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            },
            attributes: ['id', 'nombreUsuario']
        });

        // Si no lo encuentra, envia un error.
        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO
            });
        }

        // Retorna un html con js y socket.io integrado
        respuesta.status(200).send(
            template_video_chat_recivido(
                parametros.token,
                usuario.id,
                usuario.nombreUsuario
            )
        );

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

// Prueba para realizar el unpack de un token.
exports.unpackToken = async(request, respuesta) => {
    // POST Request
    const datos = request.body;

    try {
        let payload = getTokenData(datos.token);

        respuesta.status(201).json({
            payload: payload,
        });

    } catch(excepcion) {
        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};