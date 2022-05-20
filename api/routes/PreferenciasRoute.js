module.exports = (app) => {
    // Controlador del endpoint.
    const preferencia = require("../controladores/ControladorPreferencias.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // Envia los datos de un usuario dado.
    router.get("/datos/", preferencia.datosUsuario);

    // Cambia el idioma de las preferencias del usuario.
    router.put("/cambiar/idioma/", preferencia.cambiarIdioma);

    // Cambia el estado del perfil del usuario.
    router.put("/cambiar/estado/", preferencia.cambiarEstado);

    // Cambia el nombre de usuario.
    router.put("/cambiar/username/", preferencia.cambiarNombreUsuario);

    // Cambia el correo electronico del usuario.
    router.put("/cambiar/email/", preferencia.cambiarCorreoElectronico);

    // Cambia la contraseña del usuario.
    router.put("/cambiar/password/", preferencia.cambiarPassword);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "preferencia", router);
};