'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Usuario.belongsTo(models.Rol, {foreingKey: 'idRol'})
    }
  }

  Usuario.init({
    nombreUsuario: DataTypes.STRING,
    correo: DataTypes.STRING,
    correoVerificado: DataTypes.BOOLEAN,

    // FK
    idRol: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
  });

  return Usuario;
};
