module.exports = (app) => {
    // Controlador del endpoint.
    const admin = require("../controladores/ControladorAdmin.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // Controlador para enrutar los usuarios en la DB.
    router.get("/usuarios/:email", admin.listarUsuarios);
    router.get("/usuarios/", admin.listarUsuarios);

    router.delete("/usuario/eliminar", admin.eliminarUsuario);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "admin", router);
}