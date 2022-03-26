'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.bulkInsert('Preferencias', [
          {
            idioma: 'es',
            pais: 'mx',
            estadoPerfil: '¡Hola, soy nuevo en la app!',
          },
      ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Preferencias', null, {})
  }
};

