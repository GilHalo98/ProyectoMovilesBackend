const db = require("../models/index");
const Reporte = db.Reporte;
const Producto = db.Producto;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Retorna todos los reportes registrados.
exports.getReportes = async(request, respuesta) => {
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
      atributos = Object.keys(Reporte.rawAttributes);
  }

  const totalReportes = await Reporte.count({
      where: busqueda,
  });

  if (!parametros.limit && !parametros.pagina) {
      limite = totalReportes;
      offset = 0;
      totalPaginas = 1;
  } else {
      totalPaginas = Math.ceil(totalReportes / parseInt(parametros.limit));
      limite = parseInt(parametros.limit);
      offset = (parseInt(parametros.pagina) * limite) - limite;
  }

  try {
    const reporte = await Reporte.findAll({
        attributes: atributos,
        order: [['fecha', 'DESC']],
        where: busqueda,
        offset: offset,
        limit: limite,
    });

    // Se conecto a la db, retorna las Merma.
    return respuesta.status(200).json({
        paginas_totales: totalPaginas,
        datos: reporte
    });

  } catch(excepcion) {
    // No se conecto a la db.
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};

// Elimina un reporte dado un id.
exports.deleteReporte = async(request, respuesta) => {
  // DELETE request.

  // Se obtiene el id del reporte.
  const {id} = request.params;

  // Busca si el id del reporte existe.
  const reporte = await Reporte.findOne({
    where: {
      id,
    },
  });

  // Si no existe, se manda una alerta.
  if (!reporte) {
    return respuesta.status(404).send({
      message: `El reporte con id ${id} no existe`,
    });
  }

  // En caso de existir.
  try {
    // Elimina el reporte.
    reporte.destroy();

    return respuesta.send({
      message: `el reporte ${reporte.id} fue eliminado exitosamente!`,
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};

// Agrega un reporte al registro
exports.addReporte = async(request, respuesta) => {
  // POST request.
  const datos = request.body;

  // Fecha actual.
  const fecha = (new Date()).toLocaleString("en-US");

  // Verificar si la informacion esta completa.
  if(
    !datos.descripcion
    || !datos.tipo
    || !datos.id_producto
  ) {
    return respuesta.status(400).send({
      message: "Información incompleta para el registro!",
    });
  }

  // Verifica si el cliente existe.
  const producto = await Producto.findOne({
    where: {
      id: datos.id_producto
    }
  });

  // Si no existe, envia una alerta.
  if(!producto) {
    return respuesta.status(404).json({
      message: `El producto ${datos.id_producto} no existe`
    });
  }

  // Realiza la reporte.
  try {
    // Crea una instancia reporte.
    const reporte = {
      fecha: fecha,
      descripcion: datos.descripcion,
      tipo: datos.tipo,
      id_producto: datos.id_producto,
    };

    Reporte.create(reporte).then((resultado) => {
      respuesta.status(201).json({
          message: "El reporte se agrego exitosamente!",
      });
    });

  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};

// Modifica un reporte del registro.
exports.updateReporte = async(request, respuesta) => {
  // POST request.
  const datos = request.body;

  // Se obtiene el id del reporte.
  const {id} = request.params;

  // Primero verificamos que el elemento a modificar existe.
  const reporte = await Reporte.findOne({
    where: {
      id
    }
  });

  // Si no existe, envia una alerta.
  if(!reporte) {
    return respuesta.status(404).json({
      message: `El reporte ${id} no existe`
    });
  }

  // Se realian los cambios
  if (datos.descripcion) {
      reporte.descripcion = datos.descripcion;
  }
  if (datos.tipo) {
      reporte.tipo = datos.tipo;
  }
  if (datos.id_producto) {
    // Verifica si el Producto existe.
    const producto = await Producto.findOne({
        where: {
            id: datos.id_producto
        }
    });

    // Si no existe, envia una alerta.
    if(!producto) {
        return respuesta.status(404).json({
            message: `El producto ${datos.id_producto} no existe`
        });
    }
    reporte.id_producto = datos.id_producto;
  }

  // Realiza la reporte.
  try {
    // Guarda los cambios.
    reporte.save().then((resultado) => {
        respuesta.status(201).json({
            message: "El reporte se modifico exitosamente!",
        });
    });

  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};
