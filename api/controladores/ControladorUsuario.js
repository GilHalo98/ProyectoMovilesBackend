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

// Registra un usuario en la db
exports.registrar = async(request, respuesta) => {
    // POST request.
    const datos = request.body;

    // Verifica si los datos basicos para el registro no son nulos.
    if (!datos.nombreUsuario || !datos.correo || !datos.password) {
        return respuesta.status(400).send({
            codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
        });
    }

    try {
        // Verificamos si el username no existe en la base de datos.
        let existeUsuario = await Usuario.findOne({
            where: {
                nombreUsuario: datos.nombreUsuario,
            },
        });

        // Si es asi, el registro se interrumpe
        if (existeUsuario) {
            return respuesta.status(400).json({
                codigo_respuesta: CODIGOS.NOMBRE_USUARIO_REGISTRADO,
            });
        }

        // Verificamos si el correo no existe en la base de datos.
        existeUsuario = await Usuario.findOne({
            where: {
                correo: datos.correo,
            },
        });

        // Si es asi, el registro se interrumpe
        if (existeUsuario) {
            return respuesta.status(400).json({
                codigo_respuesta: CODIGOS.CORREO_REGISTRADO,
            });
        }

        // Se busca la preferencia por default.
        let preferenciaDefault = await Preferencia.findOne({
            where: {
                id: 1,
            },
        });

        // Si no existe la configuracion por defautl, se interrumpe el proceso.
        if (!preferenciaDefault) {
            return respuesta.status(404).json({
                codigo_respuesta: CODIGOS.CONFIGURACION_DEFAULT_INEXISTENTE,
            });
        }

        // Se crea una nueva preferencia a partir de la default.
        const preferencias = {
            'idioma': preferenciaDefault.idioma,
            'pais': preferenciaDefault.pais,
            'estadoPerfil': preferenciaDefault.estadoPerfil,
        }

        // Despues se registra la preferencia en la db.
        Preferencia.create(preferencias).then((resultado) => {
            // Una vez realizado el registro, se registra el usuario.

            // Realizamos una key para el encriptado.
            const salt = bcrypjs.genSaltSync(10);

            // Encriptamos la contraseña.
            const hash = bcrypjs.hashSync(datos.password, salt);

            // Generamos una instancia de la clase Usuario.
            const usuario = {
                nombreUsuario: datos.nombreUsuario,
                password: hash,
                correo: datos.correo,
                codigoVerificacion: generar_codigo(),
                correoVerificado: false,
                idRol: datos.rol,
                idPreferencia: resultado.id,
            }

            // Agregamos la instancia a la DB.
            Usuario.create(usuario).then((resultado) => {
                enviarValidacion(
                    usuario,
                    'Confirmación de Correo Electronico',
                    ''
                );

                respuesta.status(201).json({
                    codigo_respuesta: CODIGOS.REGISTRO_OK,
                });
            });

        });

    } catch(excepcion) {
        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

// Valida el codigo de verificacion de un correo electronico
exports.validarCorreo = async(request, respuesta) => {
    // GET Request
    const datos = request.params;

    try {
        // Buscamos al usuario al que le pertenece el correo.
        let usuario = await Usuario.findOne({
            where: {
                correo: datos.correo,
            },
        });

        // Si no se encontro el correo, entonces manda un mensaje.
        if (!usuario) {
            return respuesta.status(404).json({
                codigo_respuesta: CODIGOS.CORREO_NO_ENCONTRADO,
            });
        }

        // Si el correo ya se encuentra verificado, entonces manda un mensaje.
        if (usuario.correoVerificado) {
            return respuesta.status(400).json({
                codigo_respuesta: CODIGOS.CUENTA_YA_VALIDADA,
            });
        }

        // Si se encuentra un usuario, entonces compara los codigos.
        if (parseInt(datos.codigo) === parseInt(usuario.codigoVerificacion)) {
            // Si los codigos son iguales, entones se valida el correo.
            usuario.correoVerificado = true;

            if (datos.isLogin === 'true' || datos.isLogin === '1') {
                respuesta.setHeader(
                    'token',
                    getToken({
                        'usuario': usuario.id,
                        'rol': usuario.idRol,
                        'preferencia': usuario.idPreferencia
                    })
                );
            }

            // Se guardan los cambios.
            usuario.save().then((resultado) => {
                respuesta.status(201).json({
                    codigo_respuesta: CODIGOS.VALIDACION_OK,
                });
            });

        } else {
            // De lo contrario, envia un mensaje.
            return respuesta.status(400).json({
                codigo_respuesta: CODIGOS.CODIGO_DISTITO,
            });
        }

    } catch(excepcion) {
        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

// Envia un email al usuario, para validar su correo.
exports.enviarCorreo = async(request, respuesta) => {
    // GET Request
    const datos = request.params;

    console.log(datos.correo);

    try {
        // Buscamos al usuario al que le pertenece el correo.
        let usuario = await Usuario.findOne({
            where: {
                correo: datos.correo,
            },
        });

        // Si no se encontro el correo, entonces manda un mensaje.
        if (!usuario) {
            return respuesta.status(404).json({
                codigo_respuesta: CODIGOS.CORREO_NO_ENCONTRADO,
            });
        }

        // Si el correo ya se encuentra verificado, entonces manda un mensaje.
        if (usuario.correoVerificado) {
            return respuesta.status(400).json({
                codigo_respuesta: CODIGOS.CUENTA_YA_VALIDADA,
            });
        }

        // Generamos nuevamente el codigo.
        usuario.codigoVerificacion = generar_codigo();

        // Guardamos el cambio en la DB y enviamos el correo.
        usuario.save().then((resultado) => {
            enviarValidacion(
                usuario,
                'Confirmación de Correo Electronico',
                ''
            );

            // Se manda un mensaje de confirmado
            respuesta.status(201).json({
                codigo_respuesta: CODIGOS.CODIGO_REENVIADO_OK,
            });
        });

    } catch(excepcion) {
        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};

// Endpoint para Log-In.
exports.login = async(request, respuesta) => {
    // POST Request
    const datos = request.body;

    // Verificamos si hay datos en la consulta.
    if (!datos.correo || !datos.password) {
        return respuesta.status(400).send({
            codigo_respuesta: CODIGOS.INFORMACION_INCOMPLETA,
        });
    }

    try {
        // Buscamos al usuario al que le pertenece el correo.
        let usuario = await Usuario.findOne({
            where: {
                correo: datos.correo,
            },
        });

        // Si no se encontro el usuario, entonces manda un mensaje.
        if (!usuario) {
            return respuesta.status(404).json({
                codigo_respuesta: CODIGOS.CORREO_NO_ENCONTRADO,
            });
        }

        // Checamos que el correo ya este validado.
        if (!usuario.correoVerificado) {
            return respuesta.status(500).json({
                codigo_respuesta: CODIGOS.CORREO_NO_VALIDADO,
            });
        }

        // Verificamos la contraseña.
        bcrypjs.compare(datos.password, usuario.password, function(error, igual) {
            if (igual) {
                respuesta.setHeader(
                    'token',
                    getToken({
                        'usuario': usuario.id,
                        'rol': usuario.idRol,
                        'preferencia': usuario.idPreferencia
                    })
                );

                respuesta.status(201).json({
                    codigo_respuesta: CODIGOS.LOGIN_OK,
                });

            } else {
                return respuesta.status(500).json({
                    codigo_respuesta: CODIGOS.PASSWORD_INCORRECTA,
                });
            }
        });

    } catch(excepcion) {
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

// Realiza peticiones de preferencias del usuario. Es necesario un token.
exports.datosUsuario = async(request, respuesta) => {
    // GET Request.
    const headers = request.headers;

    try {
        // Se obtiene el payload del token.
        let payload = getTokenData(headers.token);

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
            usuario,
            preferencia,
        });

    } catch(excepcion) {
        return respuesta.status(500).send({
            codigo_respuesta: CODIGOS.API_ERROR,
        });
    }
};