module.exports = (app) => {
    // Controlador del endpoint.
    const usuario = require("../controladores/ControladorUsuario.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // Registra un usuario en la db.
    router.post("/registrar/", usuario.registrar);

    // Valida un correo electronico.
    router.get("/validar/:correo/:codigo/asLogin=:isLogin", usuario.validarCorreo);

    // Envia un correo para validar el email.
    router.get("/validar/:correo", usuario.enviarCorreo);

    // Hace el login.
    router.post("/login/", usuario.login);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "usuario", router);
};
