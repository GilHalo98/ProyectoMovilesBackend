// Modelos de la DB
const db = require("../models/index");

const Respuestas = require("../utils/CodigoApp");
const { Op } = require("sequelize");

const { getToken, getTokenData } = require("../middleware/jwtConfig");
const { enviarValidacionCorreoNuevo } = require("../middleware/mailConfig");
const { generar_codigo } = require("../middleware/util");

const Usuario = db.Usuario;
const Preferencia = db.Preferencia;

const CODIGOS = new Respuestas.CodigoApp();

// Para encriptar la contraseña
const bcrypjs = require("bcryptjs");

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
            attributes: ['nombreUsuario', 'correo']
        });

        // Si el usuario no se encuentra, manda un mensaje.
        if (!usuario) {
            respuesta.status(404).json({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO,
            });
        }

        // Busca las preferencias del usuario.
        let preferencia = await Preferencia.findOne({
            where: {
                id: payload.preferencia
            },
            attributes: ['idioma', 'pais', 'estadoPerfil']
        });

        // Si no se encuentran, manda un mensaje.
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

// Cambia el estado del usuario.
exports.cambiarEstado = async(request, respuesta) => {
    // PUT Request.
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
        if (!cuerpo.estadoPerfil) {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
            });
        }

        // Buscamos las preferencias del usuario.
        let preferencia = await Preferencia.findOne({
            where: {
                id: payload.preferencia
            }
        });

        // Verificamos si el usuario tiene una preferencia.
        if (!preferencia) {
            return respuesta.status(404).send({
                codigo_respuesta: CODIGOS.USUARIO_SIN_CONFIGURACIONES
            });
        }

        if (preferencia.estadoPerfil !== cuerpo.estadoPerfil) {
            // Realizamos el cambio de idioma.
            preferencia.estadoPerfil = cuerpo.estadoPerfil;

        } else {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.DATO_EN_DB,
            });
        }

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

// Cambia el idioma del usuario.
exports.cambiarIdioma = async(request, respuesta) => {
    // PUT Request.
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

        // Verificamos que exista idioma nuevo.
        if (!cuerpo.idioma || !cuerpo.pais) {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
            });
        }

        // Buscamos las preferencias del usuario.
        let preferencia = await Preferencia.findOne({
            where: {
                id: payload.preferencia
            }
        });

        // Verificamos si el usuario tiene una preferencia.
        if (!preferencia) {
            return respuesta.status(404).send({
                codigo_respuesta: CODIGOS.USUARIO_SIN_CONFIGURACIONES
            });
        }

        if (preferencia.idioma !== cuerpo.idioma) {
            // Realizamos el cambio de idioma.
            preferencia.idioma = cuerpo.idioma
            preferencia.pais = cuerpo.pais

        } else {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.DATO_EN_DB,
            });
        }

        // Se guardan los cambios.
        preferencia.save().then((resultado) => {

            // Se regenera el token.
            respuesta.setHeader(
                'token',
                getToken({
                    'usuario': payload.usuario,
                    'rol': payload.rol,
                    'preferencia': payload.preferencia,
                    'idioma': resultado.idioma,
                    'pais': resultado.pais
                })
            );

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

// Cambia el idioma del usuario.
exports.cambiarNombreUsuario = async(request, respuesta) => {
    // PUT Request.
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

        // Verificamos que exista el nuevo username y la contraseña de
        // confirmacion.
        if (!cuerpo.nombreUsuario || !cuerpo.passwordConfirmacion) {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
            });
        }

        // Consultamos el usuario al que pertenece el token.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            }
        });

        // Si no se encuentra el usuario, manda un mensaje.
        if (!usuario) {
            return respuesta.status(404).send({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO
            });
        }

        // Verificamos si el nombre de usuario nuevo ya esta tomado.
        let nombreTomado = await Usuario.findOne({
            where: {
                nombreUsuario: cuerpo.nombreUsuario
            }
        });

        // Si el nombre de usuario ya esta tomado, manda un
        // mensaje.
        if (nombreTomado) {
            return respuesta.status(406).send({
                codigo_respuesta: CODIGOS.NOMBRE_USUARIO_TOMADO,
            })
        }

        if (usuario.nombreUsuario !== cuerpo.nombreUsuario) {
            // Hacemos los cambios.
            usuario.nombreUsuario = cuerpo.nombreUsuario

        } else {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.DATO_EN_DB,
            });
        }


        // Guardamos los cambios.
        usuario.save().then((resultado) => {
            respuesta.status(201).json({
                codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
            });
        });

        // Verificamos que la contraseña de confirmacion sea correcta.
        /*
        bcrypjs.compare(cuerpo.passwordConfirmacion, usuario.password, function(error, igual) {
            if (igual) {

                if (usuario.nombreUsuario !== cuerpo.nombreUsuario) {
                    // Hacemos los cambios.
                    usuario.nombreUsuario = cuerpo.nombreUsuario
        
                } else {
                    return respuesta.status(400).send({
                        codigo_respuesta: CODIGOS.DATO_EN_DB,
                    });
                }


                // Guardamos los cambios.
                usuario.save().then((resultado) => {
                    respuesta.status(201).json({
                        codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
                    });
                });

            } else {
                // Si la contraseña no coincide, se manda un mensaje.
                return respuesta.status(500).json({
                    codigo_respuesta: CODIGOS.PASSWORD_INCORRECTA,
                });
            }
        });
    */

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

// Cambia el correo electronico del usuario.
exports.cambiarCorreoElectronico = async(request, respuesta) => {
    // PUT Request.
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

        // Verificamos que exista el nuevo username y la contraseña de
        // confirmacion.
        if (!cuerpo.correo || !cuerpo.passwordConfirmacion) {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
            });
        }

        // Consultamos el usuario al que pertenece el token.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            }
        });

        // Si no se encuentra el usuario, manda un mensaje.
        if (!usuario) {
            return respuesta.status(404).send({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO
            });
        }

        // Verificamos si el correo electronico nuevo ya esta tomado.
        let correoTomado = await Usuario.findOne({
            where: {
                nombreUsuario: cuerpo.correo
            }
        });

        // Si el correo electronico ya esta tomado, manda un
        // mensaje.
        if (correoTomado) {
            return respuesta.status(406).send({
                codigo_respuesta: CODIGOS.NOMBRE_USUARIO_TOMADO,
            });
        }

        // Almacenamos el correo antiguo.
        let correoAntiguo = usuario.correo;

        if (usuario.correo !== cuerpo.correo) {
            // Hacemos los cambios.
            usuario.correo = cuerpo.correo;

        } else {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.DATO_EN_DB,
            });
        }

        // Se cambia el estado del correo verificado a falso 
        usuario.correoVerificado = false;

        // Se regenera el codigo de verificacion.
        usuario.codigoVerificacion = generar_codigo();

        // Guardamos los cambios.
        usuario.save().then((resultado) => {
            // Una vez cambiado el correo electronico, se
            // manda un correo de verificacion al correo nuevo.
            enviarValidacionCorreoNuevo(
                usuario,
                correoAntiguo,
                'Confirmación de cambio de correo electrónico',
                ''
            );

            respuesta.status(201).json({
                codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
            });
        });

        // Verificamos que la contraseña de confirmacion sea correcta.
        /*
        bcrypjs.compare(cuerpo.passwordConfirmacion, usuario.password, function(error, igual) {
            if (igual) {
                // Almacenamos el correo antiguo.
                let correoAntiguo = usuario.correo;

                if (usuario.correo !== cuerpo.correo) {
                    // Hacemos los cambios.
                    usuario.correo = cuerpo.correo;
        
                } else {
                    return respuesta.status(400).send({
                        codigo_respuesta: CODIGOS.DATO_EN_DB,
                    });
                }

                // Se cambia el estado del correo verificado a falso 
                usuario.correoVerificado = false;

                // Se regenera el codigo de verificacion.
                usuario.codigoVerificacion = generar_codigo();

                // Guardamos los cambios.
                usuario.save().then((resultado) => {
                    // Una vez cambiado el correo electronico, se
                    // manda un correo de verificacion al correo nuevo.
                    enviarValidacionCorreoNuevo(
                        usuario,
                        correoAntiguo,
                        'Confirmación de cambio de correo electrónico',
                        ''
                    );

                    respuesta.status(201).json({
                        codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
                    });
                });

            } else {
                // Si la contraseña no coincide, se manda un mensaje.
                return respuesta.status(500).json({
                    codigo_respuesta: CODIGOS.PASSWORD_INCORRECTA,
                });
            }
        });
        */

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

// Cambia la contraseña del usuario.
exports.cambiarPassword = async(request, respuesta) => {
    // PUT Request.
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

        // Verificamos que exista el nuevo username y la contraseña de
        // confirmacion.
        if (!cuerpo.password || !cuerpo.passwordConfirmacion) {
            return respuesta.status(400).send({
                codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
            });
        }

        // Consultamos el usuario al que pertenece el token.
        let usuario = await Usuario.findOne({
            where: {
                id: payload.usuario
            }
        });

        // Si no se encuentra el usuario, manda un mensaje.
        if (!usuario) {
            return respuesta.status(404).send({
                codigo_respuesta: CODIGOS.USUARIO_NO_REGISTRADO
            });
        }

        // Verificamos que la contraseña de confirmacion sea correcta.
        bcrypjs.compare(cuerpo.passwordConfirmacion, usuario.password, function(error, igual) {
            if (igual) {
                // Realizamos una key para el encriptado.
                const salt = bcrypjs.genSaltSync(10);

                // Encriptamos la contraseña nueva.
                const hash = bcrypjs.hashSync(cuerpo.password, salt);

                // Guardamos la nueva contraseña
                usuario.password = hash;

                // Guardamos los cambios.
                usuario.save().then((resultado) => {
                    respuesta.status(201).json({
                        codigo_respuesta: CODIGOS.DATOS_USUARIO_OK,
                    });
                });

            } else {
                // Si la contraseña no coincide, se manda un mensaje.
                return respuesta.status(500).json({
                    codigo_respuesta: CODIGOS.PASSWORD_INCORRECTA,
                });
            }
        });

    } catch(excepcion) {
        console.log(excepcion);

        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};