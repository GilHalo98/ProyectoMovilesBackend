'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Preferencia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Preferencia.init({
    idioma: DataTypes.STRING,
    pais: DataTypes.STRING,
    estadoPerfil: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Preferencia',
    tableName: 'Preferencias'
  });
  return Preferencia;
};