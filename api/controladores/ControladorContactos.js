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

        console.log(cuerpo.contacto)

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

        // Si la lista de contactos esta vacia, retorna una lista vacia.
        if (preferencia.contactos.length <= 0) {
            respuesta.status(201).json({
                codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
                coincidencias: [],
            });

        } else {
            // Si la lista de contactos no esta vacia buscamos
            // las intancias de los contactos.
            let contactos = await Usuario.findAll({
                where: {
                    id: {
                        [Op.or]: preferencia.contactos
                    }
                },
                attributes: ['id', 'nombreUsuario']
            });

            // Se agrega una propiedad del tipo de usuario.
            for (let index in contactos) {
                let coincidencia = contactos[index];

                coincidencia.dataValues.tipo = 1;
            }

            // Se retornan los contactos del usuario.
            respuesta.status(201).json({
                codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
                coincidencias: contactos,
            });
        }

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

// Busca un usuario dado su correo, tambien busca entre los contactos
// del usuario que realiza el querry.
exports.buscarUsuario = async(request, respuesta) => {
    // POST Request.
    const headers = request.headers;
    const parametros = request.params;

    let usuarios = [];
    let contactos = [];

    let coincidencias = [];

    try {
        // Se obtiene el payload del token.
        let payload = getTokenData(headers.token);

        // En caso de que el token sea invalido.
        if (!payload) {
            respuesta.status(401).json({
                codigo_respuesta: CODIGOS.TOKEN_INVALIDO,
            });
        }

        // Verificamos si el usuario que realiza la querry existe en la
        // db y obtenemos su correo para uso posterior.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            },
            attributes: ['correo']
        });

        // Si el usuario no existe se manda un codigo de error.
        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_ENCONTRADO,
            });
        }

        // Verificamos que se pasara un correo a buscar.
        if (!parametros.email || !parametros.agregarContactos) {
            respuesta.status(401).json({
                codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
            });
        }

        // Revisamos si el filtro para buscar tambien entre contactos
        // esta activo.
        if (parametros.agregarContactos === 'true' || parametros.agregarContactos === '1') {
            // Buscamos en las preferencias la lista de contactos.
            let preferencia = await Preferencia.findOne({
                where: {
                    id: payload.preferencia
                },
                attributes: ['contactos']
            });

            // Verificamos que el usuario tenga una
            // preferencia asignada.
            if (!preferencia) {
                respuesta.status(404).json({
                    codigo_respuesta: CODIGOS.USUARIO_SIN_CONFIGURACIONES
                });
            }

            // Por ultimo buscamos los contactos que tengan una
            // coincidencia con el correo electronico dado.
            contactos = await Usuario.findAll({
                where: {
                    id: {
                        [Op.or]: preferencia.contactos
                    },
                    correo: {
                        [Op.like]: `%${parametros.email}%`,
                    }
                },
                attributes: ['id', 'nombreUsuario']
            });

            // Buscamos los usuarios con coincidencia del email y se
            // excluye el usuario que realiza la peticion y los
            // contactos del usuario.
            usuarios = await Usuario.findAll({
                where: {
                    id: {
                        [Op.not]: preferencia.contactos
                    },
                    correo: {
                        [Op.like]: `%${parametros.email}%`,
                        [Op.notLike]: `${usuario.correo}`
                    }
                },
                attributes: ['id', 'nombreUsuario']
            });

        } else {
            // Buscamos los usuarios con coincidencia del email.
            usuarios = await Usuario.findAll({
                where: {
                    correo: {
                        [Op.like]: `%${parametros.email}%`,
                        [Op.notLike]: `${usuario.correo}`
                    }
                },
                attributes: ['id', 'nombreUsuario']
            });
        }

        // Si no se encuentra ningun contacto, envia un codigo de error.
        if (!usuarios || !contactos) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_ENCONTRADO,
            });
        }

        // Agregamos una nueva propiedad que indica si la coincidencia
        // es un contacto o un usuario.
        for (let index in contactos) {
            let coincidencia = contactos[index];

            coincidencia.dataValues.tipo = 1;
        }

        for (let index in usuarios) {
            let coincidencia = usuarios[index];

            coincidencia.dataValues.tipo = 2;
        }

        // Creamos una nueva lista con todas las coincidencias.
        coincidencias = [...contactos, ...usuarios];

        respuesta.status(201).json({
            codigo_respuesta: CODIGOS.USUARIOS_ENCONTRADOS,
            coincidencias,
        });

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};