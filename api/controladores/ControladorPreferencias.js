// Modelos de la DB
const db = require("../models/index");

const Respuestas = require("../utils/CodigoApp");
const { Op } = require("sequelize");

const { getToken, getTokenData } = require("../middleware/jwtConfig");
const { enviarValidacion } = require("../middleware/mailConfig");
const { generar_codigo } = require("../middleware/util");

const Usuario = db.Usuario;
const Preferencia = db.Preferencia;

const CODIGOS = new Respuestas.CodigoApp();

// Realiza peticiones de preferencias del usuario. Es necesario un token.
exports.datosUsuario = async(request, respuesta) => {
    // GET Request.
    const headers = request.headers;

    try {
        // Se obtiene el payload del token.
        let payload = getTokenData(headers.token);

        // En caso de que el token sea invalido.
        if (!payload) {
            respuesta.status(401).json({
                codigo_respuesta: CODIGOS.TOKEN_INVALIDO,
            });
        }

        // Buscamos el username al cual le pertenece el usuario.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            },
            attributes: ['nombreUsuario']
        });

        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO,
            });
        }

        let preferencia = await Preferencia.findOne({
            where: {
                id: payload.preferencia
            },
            attributes: ['idioma', 'pais', 'estadoPerfil']
        });

        if (!preferencia) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_SIN_CONFIGURACIONES
            });
        }

        respuesta.status(201).json({
            codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
            usuario,
            preferencia,
        });

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};