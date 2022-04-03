// Modelos de la DB
const db = require("../models/index");
const Respuestas = require("../utils/CodigoApp")

const { getToken, getTokenData } = require("../middleware/jwtConfig")
const { enviarValidacion } = require("../middleware/mailConfig");
const { generar_codigo } = require("../middleware/util");

const Usuario = db.Usuario;
const Preferencia = db.Preferencia;
const Rol = db.Rol;

const CODIGOS = new Respuestas.CodigoApp()

// Para encriptar la contraseña
const bcrypjs = require("bcryptjs");

// Para generar tokens.
const jwt = require('jsonwebtoken');

// Templatate de vistas.
const { template_chat } = require("../template/chat");

exports.vistaChat = async(request, respuesta) => {
    // GET Request.
    const headers = request.headers;

    try {
        // Verificamos que el header tenga un token para validar el usuario.
        if (!headers.token) {
            return respuesta.status(511).json({
                codigo_respuesta: "Token no ingresado",
            });
        }
    
        // Desencriptamos el payload del token
        const payload = getTokenData(headers.token);
    
        // Verificamos que el payload sea valido.
        if (!payload) {
            return respuesta.status(401).json({
                codigo_respuesta: "token invalido",
            });
    
        }

        // Consultamos la DB para encontrar el username del usuario.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            },
            attributes: ['nombreUsuario']
        });

        // Validamos que el usuario exista en la DB.
        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO,
            });
        }

        respuesta.status(200).send(
            template_chat(usuario.nombreUsuario)
        );

    } catch(excepcion) {
        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};