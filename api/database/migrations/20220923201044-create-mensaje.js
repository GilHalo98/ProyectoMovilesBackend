'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Mensajes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      contenido: {
        type: Sequelize.STRING
      },

      fecha: {
        type: Sequelize.DATE
      },

      idRemitente: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
        references: {
          model: {
            tableName: "Usuarios",
          },
          key: "id",
        }
      },

      idDestinatario: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
        references: {
          model: {
            tableName: "Usuarios",
          },
          key: "id",
        }
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Mensajes');
  }
};