const db = require("../models/index");
const TipoProducto = db.Tipo_Producto;
const Producto = db.Producto;

// Retorna los tipos de productos.
exports.getTipoProductos = async(request, respuesta) => {
    // GET request.
    const parametros = request.query;

    var busqueda;
    var atributos;
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
        atributos = Object.keys(TipoProducto.rawAttributes);
    }

    const totalTipos = await TipoProducto.count({
        where: busqueda,
    });

    if (!parametros.limit && !parametros.pagina) {
        limite = totalTipos;
        offset = 0;
        totalPaginas = 1;
    } else {
        totalPaginas = Math.ceil(totalTipos / parseInt(parametros.limit));
        limite = parseInt(parametros.limit);
        offset = (parseInt(parametros.pagina) * limite) - limite;
    }

    try {
        const tipos = await TipoProducto.findAll({
            attributes: atributos,
            where: busqueda,
            offset: offset,
            limit: limite,
        });

        // Se conecto a la db, retorna los tipos de productos.
        return respuesta.status(200).json({
            paginas_totales: totalPaginas,
            datos: tipos
        });

    } catch(excepcion) {
        // No se conecto a la db.
        return respuesta.status(500).send({message: `${excepcion}`});
    }
};


// Agrega un nuevo tipo de producto.
exports.addTipoProducto = async(request, respuesta) => {
  // POST Request.
  const datos = request.body;

  // Verificar si la informacion esta completa.
  if(!datos.tipo || !datos.descripcion) {
    return respuesta.status(400).send({
      message: "Información incompleta para el registro!",
    });
  }

  // Verifica si el tipo de producto ya fue registrado.
  const tipo = await TipoProducto.findOne({
    where: {
      tipo: datos.tipo,
    },
  });

  // Si el tipo de producto ya esta registrado, manda una alerta.
  if(tipo) {
    return respuesta.status(409).json({
      message: `El tipo de producto ${tipo.tipo} ya existe`
    });
  }

  try {
    const tipo_producto = {
      tipo: datos.tipo,
      descripcion: datos.descripcion,
    };

    TipoProducto.create(tipo_producto).then((resultado) => {
      respuesta.status(201).json({
        message: "El tipo de producto se agrego exitosamente!",
      });
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};


// Elimina un tipo de producto de la base de datos.
exports.deleteTipoProducto = async(request, respuesta) => {
  // DELETE request.

  // Se obtiene el id del tipo de producto.
  const {id} = request.params;

  // Busca si el tipo de producto con id existe.
  const tipo = await TipoProducto.findOne({
    where: {
      id,
    },
  });

  // Si no existe, se manda una alerta.
  if (!tipo) {
    return respuesta.status(404).send({
      message: `El tipo de producto con id ${id} no existe`,
    });
  }

  // Verificamos si no hay reportes asignados al productos.
  const producto = await Producto.findOne({
      where: {
          id_proveedor: id,
      },
  });

  // Si no existe, se manda una alerta.
  if (producto) {
    return respuesta.status(409).send({
      message: `El Tipo de Producto con id ${id} tiene productos anexados`,
    });
  }

  try {
    // Elimina el tipo de producto
    tipo.destroy();

    return respuesta.send({
      message: `${tipo.tipo} fue eliminado exitosamente!`,
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};


// Cambia los datos de un tipo de producto.
exports.updateTipoProducto = async(request, respuesta) => {
  // PUT request.
  const datos = request.body;

  // Id del objeto a modificar.
  const {id} = request.params;

  // Busca si existe el tipo de producto si existe.
  const tipo = await TipoProducto.findOne({
    where: {
      id: id
    }
  });

  // Si no existe el tipo de producto
  if(!tipo) {
    return respuesta.status(404).json({
      message: `El tipo de producto ${id} no existe`
    });
  }

  // Se realian los cambios
  if(datos.tipo) {
    tipo.tipo = datos.tipo;
  }
  if(datos.descripcion) {
    tipo.descripcion = datos.descripcion;
  }

  // Si existe se actualiza su informacion.
  try {
    // Guarda los cambios.
    tipo.save();

    return respuesta.send({
      message: `El tipo de producto ${id} se actualizo exitosamente!`,
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};
