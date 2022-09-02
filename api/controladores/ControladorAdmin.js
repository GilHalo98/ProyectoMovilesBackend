// Modelos de la DB
const db = require("../models/index");

const Respuestas = require("../utils/CodigoApp");
const { Op } = require("sequelize");

const { getToken, getTokenData } = require("../middleware/jwtConfig");

const Usuario = db.Usuario;
const Rol = db.Rol;
const Preferencia = db.Preferencia;

const CODIGOS = new Respuestas.CodigoApp();

// Enlista los usuarios de la db.
exports.listarUsuarios = async(request, respuesta) => {
    // GET Request.
    const headers = request.headers;
    const parametros = request.params;
    const cuerpo = request.body;

    // Instanciamos la lista de los usuarios.
    let usuarios = [];

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

        // Buscamos por el id de rol de administrador.
        let rol = await Rol.findOne ({
            where: {
                nombreRol: 'Administrador',
            },
            attributes: ['id']
        })

        // Si no existe el rol, manda un error.
        if (!rol) {
            return respuesta.status(500).send({
                codigo_respuesta: CODIGOS.API_ERROR,
            });
        }

        // Verificamos que el rol de usuario sea de administrador.
        if (rol.id !== payload.rol) {
            return respuesta.status(401).json({
                codigo_respuesta: CODIGOS.ROL_INVALIDO,
            });
        }

        // Si es busqueda de coincidencia por Email.
        if (parametros.email) {
            // Enlistamos los usuarios con coincidencia de Email.
            usuarios = await Usuario.findAll({
                where: {
                    correo: {
                        [Op.like]: `%${parametros.email}%`,
                        [Op.notLike]: `${usuario.correo}`
                    }
                },
                attributes: ['id', 'nombreUsuario', 'correo', 'idRol']
            });

        } else {
            // Enlistamos todos los usuarios en la DB.
            usuarios = await Usuario.findAll({
                where: {
                    correo: {
                        [Op.notLike]: `${usuario.correo}`
                    }
                },
                attributes: ['id', 'nombreUsuario', 'correo', 'idRol']
            });
        }

        // Si no se encuentra ningun contacto, envia un codigo de error.
        if (!usuarios) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_ENCONTRADO,
            });
        }

        respuesta.status(201).json({
            codigo_respuesta: CODIGOS.USUARIOS_ENCONTRADOS,
            usuarios,
        });

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

// Elimina un usuario de a DB.
exports.eliminarUsuario = async(request, respuesta) => {
    // DELETE Request.
    const headers = request.headers;
    const parametros = request.params;
    const cuerpo = request.body;

    try {
        // Se obtiene el payload del token.
        let payload = getTokenData(headers.token);

        // En caso de que el token sea invalido.
        if (!payload) {
            return respuesta.status(401).json({
                codigo_respuesta: CODIGOS.TOKEN_INVALIDO,
            });
        }

        // Si los datos para realizar la operacion estan incompletos
        // retorna un mensaje.
        if (!parametros.usuarioEliminar) {
            return respuesta.status(400).json({
                codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
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
            return respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_ENCONTRADO,
            });
        }

        // Buscamos por el id de rol de administrador.
        let rol = await Rol.findOne({
            where: {
                nombreRol: 'Administrador',
            },
            attributes: ['id']
        })

        // Si no existe el rol, manda un error.
        if (!rol) {
            return respuesta.status(500).send({
                codigo_respuesta: CODIGOS.API_ERROR,
            });
        }

        // Verificamos que el rol de usuario sea de administrador.
        if (rol.id !== payload.rol) {
            return respuesta.status(401).json({
                codigo_respuesta: CODIGOS.ROL_INVALIDO,
            });
        }

        // Busca el usuario a eliminar.
        let usuarioEliminar = await Usuario.findOne({
            where: {
                id: parametros.usuarioEliminar,
            }
        });

        // Si el usuario a eliminar no se encuentra, manda un mensaje.
        if (!usuarioEliminar) {
            return respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_ENCONTRADO,
            });
        }

        // Se busca las preferencias del usuario.
        let preferenciaEliminar = await Preferencia.findOne({
            where: {
                id: usuarioEliminar.idPreferencia
            }
        });

        // Si no se encuentran, manda un mensaje.
        if (!preferenciaEliminar) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_SIN_CONFIGURACIONES
            });
        }

        // El primer paso para eliminar el usuario es eliminarlo de las
        // listas de contacto que pertenece.

        // Si la lista de contactos no esta vacia.
        if (preferenciaEliminar.contactos.length > 0) {
            // Consultamos todos los contactos.
            let contactos = await Usuario.findAll({
                where: {
                    id: {
                        [Op.or]: preferenciaEliminar.contactos
                    }
                },
                attributes: ['id']
            });

            // Por cada contacto, se consultan su lista de contactos.
            for (let index in contactos) {
                var coincidencia = contactos[index];

                // Consultamos la preferencia del contacto.
                var preferenciaContacto = await Preferencia.findOne({
                    where: {
                        id: coincidencia.id,
                    },
                    attributes: ['contactos']
                });

                // Si no se encuentran, manda un mensaje.
                if (!preferenciaContacto) {
                    respuesta.status(404).json({
                        codigo_respuesta: CODIGOS.USUARIO_SIN_CONFIGURACIONES
                    });
                }

                // Buscamos por el id del usuario a eliminar en los
                // contactos y lo filtramos.
                var nuevoContactos = preferenciaContacto.contactos.filter((idContacto) => {
                    return parseInt(idContacto) !== parseInt(parametros.usuarioEliminar); 
                });

                // Guardamos los cambios.
                preferenciaContacto.contactos = nuevoContactos;
                preferenciaContacto.save();
            }
        }

        // Despues se elimina el usuario.
        usuarioEliminar.destroy().then((resultado) => {
            // Por ultimo se elimina las preferencias.
            preferenciaEliminar.destroy().then((resultado) => {
                return respuesta.status(201).json({
                    codigo_respuesta: CODIGOS.USUARIO_ELIMINADO,
                });
            });
        });

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};