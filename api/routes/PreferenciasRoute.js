module.exports = (app) => {
    // Controlador del endpoint.
    const preferencia = require("../controladores/ControladorPreferencias.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // Agrega un contacto a la lista de contactos.
    router.post("/contactos/agregar/", preferencia.addContacto);

    // Envia los contactos del usuario dado.
    router.get("/contactos/", preferencia.contactosUsuario);

    // Envia los datos de un usuario dado.
    router.get("/datos/", preferencia.datosUsuario);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "preferencia", router);
};