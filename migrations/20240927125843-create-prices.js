'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'items', // Pluralisierte Tabellenname
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0,
        },
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
        validate: {
          isIn: [['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD']],
        },
      },
      effective_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
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
    });

    // Hinzufügen von Indizes
    await queryInterface.addIndex('prices', ['item_id'], {
      unique: false,
      name: 'idx_prices_item_id',
    });

    await queryInterface.addIndex('prices', ['effective_date'], {
      unique: false,
      name: 'idx_prices_effective_date',
    });

    await queryInterface.addIndex('prices', ['currency'], {
      unique: false,
      name: 'idx_prices_currency',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('prices');
  },
};
