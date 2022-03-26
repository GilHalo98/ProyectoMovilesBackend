'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.bulkInsert('Roles', [
          {
            nombreRol: 'Usuario',
            descripcion: 'Rol de Usuario regular',
          },
          {
            nombreRol: 'Administrador',
            descripcion: 'Rol de Administrador',
          },
      ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {})
  }
};
