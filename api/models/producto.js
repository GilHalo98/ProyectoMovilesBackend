'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Producto extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Producto.belongsTo(models.Proveedor, {foreignKey: "id_proveedor"});
      Producto.belongsTo(models.Tipo_Producto, {foreignKey: "id_tipo"});
    }
  };
  Producto.init({
    numero_serie: DataTypes.STRING,
    costo: DataTypes.FLOAT,
    medidas: DataTypes.STRING,
    cantidad_stock: DataTypes.INTEGER,

    // FK
    id_tipo: DataTypes.INTEGER,
    id_proveedor: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Producto',
    tableName: 'Productos',
  });
  return Producto;
};
