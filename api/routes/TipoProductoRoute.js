module.exports = (app) => {
  // Funcionalidad de controladores.
  const tiposProductos = require("../controladores/ControladorTipoProducto.js");

  // Importando variables de ambiente.
  require("dotenv").config();

  // Enrutador de funciones.
  var router = require("express").Router();

  // Retorna todos los tipos de productos registrados
  router.get("/", tiposProductos.getTipoProductos);

  // Agrega un tipo de producto al registro
  router.post("/add/", tiposProductos.addTipoProducto);

  // Elimina un tipo de producto dado un id del registro
  router.delete("/del/:id", tiposProductos.deleteTipoProducto);

  // Elimina un tipo de producto dado un id del registro
  router.put("/update/:id", tiposProductos.updateTipoProducto);

  // Ruta general de clientes.
  app.use(process.env.API_URL + "tiposProductos", router);
};
