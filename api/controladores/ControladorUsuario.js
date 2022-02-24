// Modelos de la DB
const db = require("../models/index");
const Usuario = db.Usuario;

// Para encriptar la contraseña
const bcrypjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
            correoVerificado: false,
            idRol: 1,
        }

        // Agregamos la instancia a la DB.
        Usuario.create(usuario).then((resultado) => {
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
