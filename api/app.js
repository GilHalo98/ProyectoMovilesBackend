// Librerias de terceros
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

// Importa el ambiente en el que se trabaja.
require("dotenv").config();
const PORT = process.env.PORT;

// Instancia una app.
let app = express();

// Se configuran los request.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Se configura el frontend para recivir datos del backend.
app.use(cors({origin: "*"}));

// Aqui se agregan las rutas generales.
require("./routes/TipoProductoRoute")(app);
require("./routes/ProveedoresRoute")(app);
require("./routes/ProductoRoute")(app);
require("./routes/ReporteRoute")(app);

// Respuesta del servidor.
app.listen(PORT, (error) => {
  if (error) return console.log(`---| Cannot listen on Port: ${PORT}`);
  console.log(`---| Server is listening on: http://localhost:${PORT}/`);
});
