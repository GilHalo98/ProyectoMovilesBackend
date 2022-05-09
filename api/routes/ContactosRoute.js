module.exports = (app) => {
    // Controlador del endpoint.
    const contactos = require("../controladores/ControladorContactos.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // Busca un contacto dado un correo electronico.
    router.get(
        "/buscar/:email/addContacts=:agregarContactos",
        contactos.buscarUsuario
    );

    // Agrega un contacto a la lista de contactos.
    router.post("/contactos/agregar/", contactos.addContacto);

    // Envia los contactos del usuario dado.
    router.get("/contactos/", contactos.contactosUsuario);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "usuarios", router);
};