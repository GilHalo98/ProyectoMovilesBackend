module.exports = (app) => {
    // Controlador del endpoint.
    const usuario = require("../controladores/ControladorUsuario.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // Registra un usuario en la db.
    router.post("/registrar/", usuario.registrar);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "usuario", router);
};
