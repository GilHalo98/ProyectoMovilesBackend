'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      nombreUsuario: {
        type: Sequelize.STRING
      },

      correo: {
        type: Sequelize.STRING
      },

      codigoVerificacion: {
        type: Sequelize.INTEGER  
      },

      correoVerificado: {
        type: Sequelize.BOOLEAN
      },

      password: {
        type: Sequelize.STRING
      },

      // FK
      idRol: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
        references: {
            model: {
                tableName: "Roles",
            },
            key: "id",
        },
      },

      idPreferencia: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
        references: {
            model: {
                tableName: "Preferencias",
            },
            key: "id",
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Usuarios');
  }
};
