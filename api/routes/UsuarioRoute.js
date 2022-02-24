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

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "usuario", router);
};
