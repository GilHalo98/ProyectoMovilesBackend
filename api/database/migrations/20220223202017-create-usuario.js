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

      correoVerificado: {
        type: Sequelize.BOOLEAN
      },

      // FK
      idRol: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
        references: {
            model: {
                tableName: "Rol"
            },
            key: "id",
        }
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Usuarios');
  }
};
