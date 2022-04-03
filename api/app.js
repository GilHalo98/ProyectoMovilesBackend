// Librerias de terceros
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require('http');

// Importa el ambiente en el que se trabaja.
require("dotenv").config();

// Variables del entorno.
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// Instancia una app.
let app = express();

// Se configuran los request.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Se configura el frontend para recivir datos del backend.
app.use(cors({origin: "*"}));

// Aqui se agregan las rutas generales.
require("./routes/UsuarioRoute")(app);
require("./routes/ChatRoute")(app)

// Instancia un objeto servidor.
const server = http.createServer(app);

// Se instancia el io para el socket.
const io = new Server(server);

// Aqui se agregan los eventos que puede manejar el socket.
require("./eventos/SocketsEventos")(io);

// Escuchamos sobre una IP y Puerto definido e instanciamos el servidor.
server.listen(PORT, HOST, (error) => {
  if (error) return console.log(`---| Cannot listen on Port: ${PORT}`);
  console.log(`---| Server is listening on: http://${HOST}:${PORT}/`);
});