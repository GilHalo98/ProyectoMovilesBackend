const db = require("../models/index");
const Proveedor = db.Proveedor;
const Producto = db.Producto;

// Retorna los tipos de productos.
exports.getProveedor = async(request, respuesta) => {
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
      atributos = Object.keys(Proveedor.rawAttributes);
  }

  const totalProveedores = await Proveedor.count({
    where: busqueda,
  });

  if (!parametros.limit && !parametros.pagina) {
    limite = totalProveedores;
    offset = 0;
    totalPaginas = 1;
  } else {
    totalPaginas = Math.ceil(totalProveedores / parseInt(parametros.limit));
    limite = parseInt(parametros.limit);
    offset = (parseInt(parametros.pagina) * limite) - limite;
  }

  try {
    const proveedores = await Proveedor.findAll({
        attributes: atributos,
        where: busqueda,
        offset: offset,
        limit: limite,
    });

    // Se conecto a la db, retorna los tipos de productos.
    return respuesta.status(200).json({
        paginas_totales: totalPaginas,
        datos: proveedores
    });

  } catch(excepcion) {

    // No se conecto a la db.
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};


// Agrega un nuevo tipo de producto.
exports.addProveedor = async(request, respuesta) => {
  // POST Request.
  const datos = request.body;

  // Verificar si la informacion esta completa.
  if(
    !datos.nombre
    || !datos.locacion
    || !datos.pagina_web
    || !datos.numero_telefonico
    || !datos.correo_electronico
  ) {
    return respuesta.status(400).send({
      message: "Información incompleta para el registro!",
    });
  }

  // Verifica si el proveedor ya fue registrado.
  const proveedor = await Proveedor.findOne({
    where: {
      nombre: datos.nombre,
    },
  });

  // Si el proveedor ya esta registrado, manda una alerta.
  if(proveedor) {
    return respuesta.status(409).json({
      message: `El proveedor ${datos.nombre} ya existe`
    });
  }

  try {
    const nuevo_proveedor = {
      nombre: datos.nombre,
      locacion: datos.locacion,
      pagina_web: datos.pagina_web,
      numero_telefonico: datos.numero_telefonico,
      correo_electronico: datos.correo_electronico
    };

    Proveedor.create(nuevo_proveedor).then((resultado) => {
      respuesta.status(201).json({
        message: "El proveedor se agrego exitosamente!",
      });
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};


// Elimina un tipo de producto de la base de datos.
exports.deleteProveedor = async(request, respuesta) => {
  // DELETE request.

  // Se obtiene el id del tipo de producto.
  const {id} = request.params;

  // Busca si el tipo de producto con id existe.
  const proveedor = await Proveedor.findOne({
    where: {
      id,
    },
  });

  // Si no existe, se manda una alerta.
  if (!proveedor) {
    return respuesta.status(404).send({
      message: `El proveedor con id ${id} no existe`,
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
      message: `El proveedor con id ${id} tiene productos anexados`,
    });
  }

  try {
    // Elimina el tipo de producto
    proveedor.destroy();

    return respuesta.send({
      message: `${proveedor.nombre} fue eliminado exitosamente!`,
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};


// Cambia los datos de un tipo de producto.
exports.updateProveedor = async(request, respuesta) => {
  // PUT request.
  const datos = request.body;

  // Id del objeto a modificar.
  const {id} = request.params;

  // Busca si existe el tipo de producto si existe.
  const proveedor = await Proveedor.findOne({
    where: {
      id: id
    }
  });

  // Si no existe el tipo de producto
  if(!proveedor) {
    return respuesta.status(404).json({
      message: `El proveedor ${id} no existe`
    });
  }

  // Se realian los cambios
  if(datos.nombre) {
    proveedor.nombre = datos.nombre;
  }
  if(datos.locacion) {
    proveedor.locacion = datos.locacion;
  }
  if(datos.pagina_web) {
    proveedor.pagina_web = datos.pagina_web;
  }
  if(datos.numero_telefonico) {
    proveedor.numero_telefonico = datos.numero_telefonico;
  }
  if(datos.correo_electronico) {
    proveedor.correo_electronico = datos.correo_electronico;
  }

  // Si existe se actualiza su informacion.
  try {
    // Guarda los cambios.
    proveedor.save();

    return respuesta.send({
      message: `El proveedor ${id} se actualizo exitosamente!`,
    });
  } catch(excepcion) {
    return respuesta.status(500).send({message: `${excepcion}`});
  }
};
