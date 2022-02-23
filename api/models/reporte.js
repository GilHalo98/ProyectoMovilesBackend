'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reporte extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reporte.belongsTo(models.Producto, {foreignKey: "id_producto"});
    }
  };
  Reporte.init({
    fecha: DataTypes.DATE,
    descripcion: DataTypes.TEXT,
    tipo: DataTypes.STRING,
    id_producto: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Reporte',
    tableName: 'Reportes',
  });
  return Reporte;
};
