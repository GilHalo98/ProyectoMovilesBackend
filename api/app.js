// Librerias de terceros
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

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

// Respuesta del servidor.
app.listen(PORT, HOST, (error) => {
  if (error) return console.log(`---| Cannot listen on Port: ${PORT}`);
  console.log(`---| Server is listening on: http://${HOST}:${PORT}/`);
});
