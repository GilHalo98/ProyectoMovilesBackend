'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Proveedor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };

  Proveedor.init({
    nombre: DataTypes.STRING,
    locacion: DataTypes.STRING,
    pagina_web: DataTypes.STRING,
    numero_telefonico: DataTypes.STRING,
    correo_electronico: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Proveedor',
    tableName: 'Proveedores',
  });
  return Proveedor;
};
