'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reportes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // Propiedades de clase.
      fecha: {
        type: Sequelize.DATE
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      tipo: {
        type: Sequelize.STRING
      },

      // FK
      id_producto: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
        references: {
          model: {
            tableName: "Productos",
          },
          key: "id",
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Reportes');
  }
};
