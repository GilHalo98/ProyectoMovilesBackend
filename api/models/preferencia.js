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

    estadoPerfil: DataTypes.STRING,

    contactos: {
      type: DataTypes.STRING,

      get() {
        let contactos = this.getDataValue('contactos');

        if (contactos) {
          return contactos.split(';');
        }

        return [];
      },

      set(idContacto) {
        let contactos = this.getDataValue('contactos');
        let lista = []

        if (contactos) {          
          lista = contactos.split(';');

          let contactoEncontrado = lista.find((contacto) => {
            return idContacto === contacto;
          });

          if (!contactoEncontrado) {
            lista.push(idContacto);
            this.setDataValue('contactos', lista.join(';'));
          }
        } else {
          lista.push(idContacto);
          this.setDataValue('contactos', lista.join(';'));
        }
      },
    },
  },
  {
    sequelize,
    modelName: 'Preferencia',
    tableName: 'Preferencias'
  });

  return Preferencia;
};