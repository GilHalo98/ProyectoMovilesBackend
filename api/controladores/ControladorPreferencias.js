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

// Agrega un contacto a un usuario dado.
exports.addContacto= async(request, respuesta) => {
    // POST Request.
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

        // Verificamos si existen datos en el body, si no es asi
        // se envia un error.
        if (!cuerpo.contacto) {
            respuesta.status(400).json({
                codigo_respuesta: CODIGOS.DATOS_CONTACTO_INVALIDO,
            });
        }

        // Verificamos si el contacto a agregar existe.
        let contacto = await Usuario.findOne({
            where: {
                id: cuerpo.contacto,
            }
        });

        // Si no lo encuentra, envia un error.
        if (!contacto) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.CONTACTO_INEXISTENTE
            });
        }

        // Se cargan las preferencias del usuario.
        let preferencia = await Preferencia.findOne({
            where: {
                id: payload.preferencia
            },
        });

        // Si no existen las preferencias del usuario manda un error.
        if (!preferencia) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_SIN_CONFIGURACIONES
            });
        }

        // Realizamos los cambios.
        preferencia.contactos = cuerpo.contacto;

        // Se guardan los cambios.
        preferencia.save().then((resultado) => {
            respuesta.status(201).json({
                codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
            });
        });

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

// Retorna los contactos de un usuario.
exports.contactosUsuario = async(request, respuesta) => {
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

        // Se retornan los contactos del usuario.
        respuesta.status(201).json({
            codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
            contactos: contactos,
        });

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

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