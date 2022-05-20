module.exports = (app) => {
    // Controlador del endpoint.
    const debug = require("../controladores/ControladorDebug.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // Retorna una lista con los clientes conectados.
    router.get("/clientes/userToken=:token", debug.vistaClientes);

    // Retorna una vista con una sala de chat privada para el debug.
    router.get("/chat/userToken=:token", debug.vistaChat);

    // Retorna una vista con una sala de video chat.
    router.get("/video/userToken=:token", debug.vistaVideoChat);

    // Retorna una vista con una sala de video chat.
    router.get("/video/recivido/userToken=:token", debug.vistaVideoChatRecivido);

    // Para hacer pruebas con tokens
    router.post("/unpackToken/", debug.unpackToken);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "debug", router);
};
