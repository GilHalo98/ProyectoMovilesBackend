// Modelos de la DB
const db = require("../models/index");
const { enviarValidacion } = require("../middleware/mailConfig");
const { generar_codigo } = require("../middleware/util");
const Usuario = db.Usuario;
const Preferencia = db.Preferencia;
const Rol = db.Rol;

// Para encriptar la contraseña
const bcrypjs = require("bcryptjs");

// Registra un usuario en la db
exports.registrar = async(request, respuesta) => {
    // POST request.
    const datos = request.body;

    // Verifica si los datos basicos para el registro no son nulos.
    if (!datos.nombreUsuario || !datos.correo || !datos.password) {
        return respuesta.status(400).send({
            message: "Información incompleta para el registro!",
        })
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
                message: `El usuario ${datos.nombreUsuario} ya existe!`
            })
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
                message: `El correo ${datos.correo} ya existe!`
            })
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
                message: "Configuracion por default no existe!"
            })
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
                    message: "La cuenta fue creada exitosamente!"
                });
            });

        });

    } catch(excepcion) {
        return respuesta.status(500).send({
            message: `Error con la API: ${excepcion}`
        });
    }
};

// Verifica si un nombre de usuario se encuentra en la db
exports.verificarUserName = async(request, respuesta) => {
    // GET request.
    const datos = request.body;

    // Verificamos si hay datos en la consulta.
    if (!datos.nombreUsuario) {
        return respuesta.status(400).send({
            message: "Información incompleta!",
            nombreUsuarioEncontrado: true,
        })
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
                message: `El usuario ${datos.nombreUsuario} ya existe!`,
                nombreUsuarioEncontrado: true,
            })
        } else {
            return respuesta.status(400).json({
                message: '',
                nombreUsuarioEncontrado: false,
            })
        }
    } catch(excepcion) {
        return respuesta.status(500).send({
            message: `Error con la API: ${excepcion}`
        });
    }
};

// Verifica si el correo ya existe en la db
exports.verificarCorreo = async(request, respuesta) => {
    // GET request.
    const datos = request.body;

    // Verificamos si hay datos en la consulta.
    if (!datos.correo) {
        return respuesta.status(400).send({
            message: "Información incompleta!",
            correoEncontrado: true,
        })
    }

    try {
        // Verificamos si el username no existe en la base de datos.
        let existeUsuario = await Usuario.findOne({
            where: {
                correo: datos.correo,
            },
        });

        // Si es asi, el registro se interrumpe
        if (existeUsuario) {
            return respuesta.status(400).json({
                message: `El correo ${datos.correo} ya existe!`,
                correoEncontrado: true,
            })
        } else {
            return respuesta.status(400).json({
                message: '',
                correoEncontrado: false,
            })
        }
    } catch(excepcion) {
        return respuesta.status(500).send({
            message: `Error con la API: ${excepcion}`
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
                message: `El correo ${datos.correo} no se encuentra registrado!`
            });
        }

        // Si el correo ya se encuentra verificado, entonces manda un mensaje.
        if (usuario.correoVerificado) {
            return respuesta.status(400).json({
                message: `El correo ${datos.correo} ya se encuentra validado!`
            });
        }

        // Si se encuentra un usuario, entonces compara los codigos.
        if (parseInt(datos.codigo) === parseInt(usuario.codigoVerificacion)) {
            // Si los codigos son iguales, entones se valida el correo.
            usuario.correoVerificado = true;

            // Se guardan los cambios.
            usuario.save().then((resultado) => {

                // Se manda un mensaje de confirmado
                respuesta.status(201).json({
                    message: `El correo ${datos.correo} fue validado exitosamente!`
                });
            });

        } else {
            // De lo contrario, envia un mensaje.
            return respuesta.status(400).json({
                message: 'El codigo ingresado es diferente!'
            });
        }

    } catch(excepcion) {
        return respuesta.status(500).send({
            message: `Error con la API: ${excepcion}`
        });
    }
};

// Valida el codigo de verificacion de un correo e inicia sesion
exports.validarCorreoLogin = async(request, respuesta) => {
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
                message: `El correo ${datos.correo} no se encuentra registrado!`,
                codigo_interno: 5,
                userData: {},
            });
        }

        // Si el correo ya se encuentra verificado, entonces manda un mensaje.
        if (usuario.correoVerificado) {
            return respuesta.status(400).json({
                message: `El correo ${datos.correo} ya se encuentra validado!`,
                codigo_interno: 6,
                userData: {},
            });
        }

        // Buscamos el rol al que pertenece el usuario.
        let rol = await Rol.findOne({
            where: {
                id: usuario.idRol,
            },
        });

        // Si el usuario no tiene asignado un rol.
        if (!rol) {
            return respuesta.status(404).json({
                message: "El usuario no tiene un rol!"
            })
        }

        // Buscamos las preferencias del usaurio.
        let preferencia = await Preferencia.findOne({
            where: {
                id: usuario.idPreferencia,
            },
        });

        // Si el usuario no tiene configurado las preferencias.
        if (!preferencia) {
            return respuesta.status(404).json({
                message: "Configuracion del usuario no existe!"
            })
        }

        // Si se encuentra un usuario, entonces compara los codigos.
        if (parseInt(datos.codigo) === parseInt(usuario.codigoVerificacion)) {
            // Si los codigos son iguales, entones se valida el correo.
            usuario.correoVerificado = true;

            // Se guardan los cambios.
            usuario.save().then((resultado) => {
                // Se manda un mensaje de confirmado
                respuesta.status(201).json({
                    message: `El correo ${datos.correo} fue validado exitosamente!`,
                    codigo_interno: 0,
                    userData: {
                        'nombreUsuario': usuario.nombreUsuario,
                        'correo': usuario.correo,
                        'rol': {
                            'nombre': rol.nombreRol,
                            'descripcion': rol.descripcion,
                        },
                        'preferencias': {
                            'idioma': preferencia.idioma,
                            'pais': preferencia.pais,
                            'estadoPerfil': preferencia.estadoPerfil
                        }
                    },
                });
            });

        } else {
            // De lo contrario, envia un mensaje.
            return respuesta.status(400).json({
                message: 'El codigo ingresado es diferente!',
                codigo_interno: -1,
                userData: {},
            });
        }

    } catch(excepcion) {
        return respuesta.status(500).send({
            message: `Error con la API: ${excepcion}`,
            codigo_interno: -1,
            userData: {},
        });
    }
}

// Envia un email al usuario, para validar su correo.
exports.enviarCorreo = async(request, respuesta) => {
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
                message: `El correo ${datos.correo} no se encuentra registrado!`
            });
        }

        // Si el correo ya se encuentra verificado, entonces manda un mensaje.
        if (usuario.correoVerificado) {
            return respuesta.status(400).json({
                message: `El correo ${datos.correo} ya se encuentra validado!`
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
                message: `El codigo fue enviado a ${datos.correo}!`
            });
        });

    } catch(excepcion) {
        return respuesta.status(500).send({
            message: `Error con la API: ${excepcion}`
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
            message: "Información incompleta para el inicio de sesión!",
            codigo_interno: 1,
            userData: {},
        })
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
                message: `El correo ${datos.correo} no se encuentra registrado!`,
                codigo_interno: 2,
                userData: {},
            });
        }

        // Checamos que el correo ya este validado.
        if (!usuario.correoVerificado) {
            return respuesta.status(500).json({
                message: `El correo ${datos.correo} no se encuentra validado!`,
                codigo_interno: 3,
                userData: {},
            });
        }

        // Buscamos el rol al que pertenece el usuario.
        let rol = await Rol.findOne({
            where: {
                id: usuario.idRol,
            },
        });

        // Si el usuario no tiene asignado un rol.
        if (!rol) {
            return respuesta.status(404).json({
                message: "El usuario no tiene un rol!"
            })
        }

        // Buscamos las preferencias del usaurio.
        let preferencia = await Preferencia.findOne({
            where: {
                id: usuario.idPreferencia,
            },
        });

        // Si el usuario no tiene configurado las preferencias.
        if (!preferencia) {
            return respuesta.status(404).json({
                message: "Configuracion del usuario no existe!"
            })
        }

        // Verificamos la contraseña.
        bcrypjs.compare(datos.password, usuario.password, function(error, igual) {
            if (igual) {
                respuesta.status(201).json({
                    message: `Bienvenido ${usuario.nombreUsuario}!`,
                    codigo_interno: 0,
                    userData: {
                        'nombreUsuario': usuario.nombreUsuario,
                        'correo': usuario.correo,
                        'rol': {
                            'nombre': rol.nombreRol,
                            'descripcion': rol.descripcion,
                        },
                        'preferencias': {
                            'idioma': preferencia.idioma,
                            'pais': preferencia.pais,
                            'estadoPerfil': preferencia.estadoPerfil
                        }
                    },
                });

            } else {
                return respuesta.status(500).json({
                    message: 'Contraseña incorrecta',
                    codigo_interno: 4,
                    userData: {},
                });
            }
        });

    } catch(excepcion) {
        return respuesta.status(500).send({
            message: `Error con la API: ${excepcion}`,
            codigo_interno: -1,
            userData: {},
        });
    }
};
