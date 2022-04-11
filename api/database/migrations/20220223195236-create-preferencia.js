'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Preferencias', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      idioma: {
        type: Sequelize.STRING
      },

      pais: {
        type: Sequelize.STRING
      },

      estadoPerfil: {
        type: Sequelize.STRING
      },

      contactos: {
        type: Sequelize.STRING,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Preferencias');
  }
};