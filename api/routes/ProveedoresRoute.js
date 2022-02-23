module.exports = (app) => {
  // Funcionalidad de controladores.
  const proveedor = require("../controladores/ControladorProveedores.js");

  // Importando variables de ambiente.
  require("dotenv").config();

  // Enrutador de funciones.
  var router = require("express").Router();

  // Retorna todos los tipos de productos registrados
  router.get("/", proveedor.getProveedor);

  // Agrega un tipo de producto al registro
  router.post("/add/", proveedor.addProveedor);

  // Elimina un tipo de producto dado un id del registro
  router.delete("/del/:id", proveedor.deleteProveedor);

  // Elimina un tipo de producto dado un id del registro
  router.put("/update/:id", proveedor.updateProveedor);

  // Ruta general de clientes.
  app.use(process.env.API_URL + "proveedores", router);
};
