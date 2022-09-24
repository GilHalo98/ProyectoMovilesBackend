'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mensaje extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Mensaje.belongsTo(
        models.Usuario,
        {foreignKey: 'idRemitente'}
      )

      Mensaje.belongsTo(
        models.Usuario,
        {foreignKey: 'idDestinatario'}
      )
    }
  }
  Mensaje.init({
    contenido: DataTypes.STRING,
    fecha: DataTypes.DATE,

    // FK
    idRemitente: DataTypes.INTEGER,
    idDestinatario: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Mensaje',
    tableName: 'Mensajes',
  });
  return Mensaje;
};