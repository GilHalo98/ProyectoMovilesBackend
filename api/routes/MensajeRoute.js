module.exports = (app) => {
    // Controlador del endpoint.
    const mensaje = require("../controladores/ControladorMensaje.js");

    // Se importan las variables del ambiente.
    require("dotenv").config();

    // Enrutador de funciones.
    var router = require("express").Router();

    // Retorna una lista con los clientes conectados.
    router.get("/historial/destinatario=:idDestinatario", mensaje.historialMensajes);

    // Retorna el ultimo mensaje recivido.
    router.get("/historial/ultimoMensaje/destinatario=:idDestinatario", mensaje.utimoMensaje);

    // Ruta general de usaurios.
    app.use(process.env.API_URL + "mensaje", router);
};
