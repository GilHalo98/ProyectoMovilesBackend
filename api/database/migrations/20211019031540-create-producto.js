'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Productos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // Propiedades de clase.
      numero_serie: {
        type: Sequelize.STRING
      },
      costo: {
        type: Sequelize.FLOAT
      },
      medidas: {
        type: Sequelize.STRING
      },
      cantidad_stock: {
        type: Sequelize.INTEGER
      },

      // FK
      id_tipo: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
        references: {
          model: {
            tableName: "Tipos_Productos",
          },
          key: "id",
        },
      },
      id_proveedor: {
        type: Sequelize.INTEGER,
        required: true,
        allowNull: false,
        references: {
          model: {
            tableName: "Proveedores",
          },
          key: "id",
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Productos');
  }
};
