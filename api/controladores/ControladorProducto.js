const db = require("../models/index");
const TipoProducto = db.Tipo_Producto;
const Proveedor = db.Proveedor;
const Producto = db.Producto;
const Reporte = db.Reporte;


// Retorna los productos.
exports.getProducto = async(request, respuesta) => {
    // GET request.
    const parametros = request.query;

    var atributos;
    var busqueda;
    var offset;
    var limite;
    var totalPaginas;

    if (parametros.busqueda) {
      busqueda = JSON.parse(parametros.busqueda);
    } else {
      busqueda = {};
    }

    if (parametros.atributos) {
        atributos = parametros.atributos;
    } else {
        atributos = Object.keys(Producto.rawAttributes);
    }

    const totalProductos = await Producto.count({
      where: busqueda,
    });

    if (!parametros.limit && !parametros.pagina) {
      limite = totalProductos;
      offset = 0;
      totalPaginas = 1;
    } else {
      totalPaginas = Math.ceil(totalProductos / parseInt(parametros.limit));
      limite = parseInt(parametros.limit);
      offset = (parseInt(parametros.pagina) * limite) - limite;
    }

    try {
      const productos = await Producto.findAll({
          attributes: atributos,
          where: busqueda,
          offset: offset,
          limit: limite,
      });

      // Se conecto a la db, retorna los tipos de productos.
      return respuesta.status(200).json({
          paginas_totales: totalPaginas,
          datos: productos
      });

    } catch(excepcion) {

      // No se conecto a la db.
      return respuesta.status(500).send({message: `${excepcion}`});
    }
};

// Agrega un producto a la db.
exports.addProducto = async(request, respuesta) => {
  // POST request.
  const datos = request.body;

  // Verifica si el tipo de registro es valido.
  const tipo_producto = await TipoProducto.findOne({
    where: {
      id: datos.id_tipo,
    },
  });

  // Si el tipo de registro no existe, manda un error.
  if(!tipo_producto) {
    return respuesta.status(404).json({
      message: `El tipo de producto ${tipo} no existe`
    });
  }

  // Verifica si el proveedor existe.
  const proveedor = await Proveedor.findOne({
    where: {
      id: datos.id_proveedor
    }
  });

  // Si no existe, envia una alerta.
  if(!proveedor) {
    return respuesta.status(404).json({
      message: `El proveedor ${datos.id_proveedor} no existe`
    });
  }

  // Verifia si los datos para el registro estan completos.
  if(
    !datos.numero_serie
    || !datos.costo
    || !datos.medidas
    || !datos.cantidad_stock
    || !datos.id_tipo
    || !datos.id_proveedor
  ) {
    return respuesta.status(400).send({
      message: "Información incompleta para el registro!",
    });
  }

  try {
    const producto = {
      numero_serie: datos.numero_serie,
      costo: datos.costo,
      medidas: datos.medidas,
      cantidad_stock: datos.cantidad_stock,
      id_tipo: datos.id_tipo,
      id_proveedor: datos.id_proveedor,
    };

    Producto.create(producto).then((resultado) => {
      respuesta.status(201).json({
        message: "El producto se agrego exitosamente!",
      });
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};


// Elimina un producto de la base de datos.
exports.deleteProducto = async(request, respuesta) => {
  // DELETE request.

  // Se obtiene el id del usuario.
  const {id} = request.params;

  // Busca si el usuario con id existe.
  const producto = await Producto.findOne({
    where: {
      id,
    },
  });

  // Si no existe, se manda una alerta.
  if (!producto) {
    return respuesta.status(404).send({
      message: `El producto con id ${id} no existe`,
    });
  }

  // Verificamos si no hay reportes asignados al productos.
  const reporte = await Reporte.findOne({
      where: {
          id_producto: id,
      },
  });

  // Si no existe, se manda una alerta.
  if (reporte) {
    return respuesta.status(409).send({
      message: `El producto con id ${id} tiene reportes anexados`,
    });
  }

  try {
    // Elimina el producto
    producto.destroy();

    return respuesta.send({
      message: `${producto.numero_serie} fue eliminado exitosamente!`,
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};


// Cambia los datos de un producto.
exports.updateProducto = async(request, respuesta) => {
  // PUT request.
  const datos = request.body;

  // Id del objeto a modificar.
  const {id} = request.params;

  // Busca si existe el producto si existe.
  const producto = await Producto.findOne({
    where: {
      id: id
    }
  });

  // Si no existe el producto
  if(!producto) {
    return respuesta.status(404).json({
      message: `El producto ${id} no existe`
    });
  }

  // Se realian los cambios
  if(datos.numero_serie) {
    producto.numero_serie = datos.numero_serie;
  }
  if(datos.costo) {
    producto.costo = datos.costo;
  }
  if(datos.medidas) {
    producto.medidas = datos.medidas;
  }
  if(datos.cantidad_stock) {
    producto.cantidad_stock = datos.cantidad_stock;
  }
  if(datos.id_tipo) {
    // Verifica si el tipo de registro es valido.
    const tipo_producto = await TipoProducto.findOne({
      where: {
        id: datos.id_tipo,
      },
    });

    // Si el tipo de registro no existe, manda un error.
    if(!tipo_producto) {
      return respuesta.status(404).json({
        message: `El tipo de producto ${datos.id_tipo} no existe`
      });
    }

    //  Se cambia el tipo de producto.
    producto.id_tipo = tipo_producto.id;
  }

  if(datos.id_proveedor) {
    // Verifica si el tipo de registro es valido.
    const tipo_producto = await Proveedor.findOne({
      where: {
        id: datos.id_proveedor,
      },
    });

    // Si el tipo de registro no existe, manda un error.
    if(!tipo_producto) {
      return respuesta.status(404).json({
        message: `El proveedor ${datos.id_proveedor} no existe`
      });
    }

    //  Se cambia el tipo de producto.
    producto.id_proveedor = tipo_producto.id;
  }

  // Si existe se actualiza su informacion.
  try {
    // Guarda los cambios.
    producto.save();

    return respuesta.send({
      message: `El producto ${id} se actualizo exitosamente!`,
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};
