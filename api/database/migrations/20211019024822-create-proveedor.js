'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Proveedores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // Propiedades de clase.
      nombre: {
        type: Sequelize.STRING
      },

      locacion: {
        type: Sequelize.STRING
      },

      pagina_web: {
        type: Sequelize.STRING
      },

      numero_telefonico: {
        type: Sequelize.STRING
      },

      correo_electronico: {
        type: Sequelize.STRING
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Proveedores');
  }
};
