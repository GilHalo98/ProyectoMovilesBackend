module.exports = (app) => {
    // Controlador del endpoint.
    const chat = require("../controladores/ControladorChat.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // router.get("/chat/userToken=:token", chat.vistaChat);

    router.get("/globalChat/", chat.vistaChat);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "debug", router);
};
