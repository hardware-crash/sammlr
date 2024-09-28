// migrations/20240927177000-create-genres.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('genres', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: { // Typ des Items, zu dem dieses Genre gehört
        type: Sequelize.ENUM('Game', 'Card'),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    // Hinzufügen von Indizes
    await queryInterface.addIndex('genres', ['type', 'name'], {
      unique: true,
      name: 'idx_genres_type_name_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('genres');
  },
};
