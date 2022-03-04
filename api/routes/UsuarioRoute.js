module.exports = (app) => {
    // Controlador del endpoint.
    const usuario = require("../controladores/ControladorUsuario.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // Registra un usuario en la db.
    router.post("/registrar/", usuario.registrar);

    // Verifica si un nombre de usuario ya existe en la db.
    router.get("/verificar/username/", usuario.verificarUserName);

    // Verifica si un correo ya existe en la db.
    router.get("/verificar/correo/", usuario.verificarCorreo);

    // Valida un correo electronico.
    router.get("/validar/:correo/:codigo", usuario.validarCorreo);

    // Envia un correo para validar el email.
    router.get("/validar/:correo", usuario.enviarCorreo);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "usuario", router);
};
