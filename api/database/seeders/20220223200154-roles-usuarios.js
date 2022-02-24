'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.bulkInsert('Roles', [
          {
              descripcion: 'Rol de Usuario regular',
          },
          {
              descripcion: 'Rol de Administrador',
          },
      ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {})
  }
};
