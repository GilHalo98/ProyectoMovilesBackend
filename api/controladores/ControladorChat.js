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
    try {
        // Retorna un html con js y socket.io integrado
        respuesta.status(200).send(
            template_chat()
        );

    } catch(excepcion) {
        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};