// Modelos de la DB
const db = require("../models/index");
const { enviarValidacion } = require("../middleware/mailConfig");
const { generar_codigo } = require("../middleware/util");
const Usuario = db.Usuario;

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
                correo: datos.correo
            },
        });

        // Si es asi, el registro se interrumpe
        if (existeUsuario) {
            return respuesta.status(400).json({
                message: `El correo ${datos.correo} ya existe!`
            })
        }

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
            idRol: 1,
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
