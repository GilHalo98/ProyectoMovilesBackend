'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.bulkInsert('Roles', [
          {
              descripcionRol: 'Rol de Usuario regular',
          },
          {
              descripcion}Rol: 'Rol de Administrador',
          },
      ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {})
  }
};
