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
        Usuario.belongsTo(
          models.Rol,
          {foreignKey: 'idRol'}
        )

        Usuario.belongsTo(
          models.Preferencia,
          {foreignKey: 'idPreferencia'}
        )
    }
  }

  Usuario.init({
    nombreUsuario: DataTypes.STRING,
    correo: DataTypes.STRING,
    codigoVerificacion: DataTypes.INTEGER,
    correoVerificado: DataTypes.BOOLEAN,
    password: DataTypes.STRING,

    // FK
    idRol: DataTypes.INTEGER,
    idPreferencia: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
  });

  return Usuario;
};
