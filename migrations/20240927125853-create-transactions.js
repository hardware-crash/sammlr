'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: { // Buyer
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Pluralized table name
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      item_id: { // Purchased Item
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'items', // Pluralized table name
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      price_at_purchase: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
      },
      // Add other fields as necessary (e.g., status, payment_method)
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

    // Adding indexes
    await queryInterface.addIndex('transactions', ['user_id'], {
      unique: false,
      name: 'idx_transactions_user_id',
    });

    await queryInterface.addIndex('transactions', ['item_id'], {
      unique: false,
      name: 'idx_transactions_item_id',
    });

    await queryInterface.addIndex('transactions', ['transaction_date'], {
      unique: false,
      name: 'idx_transactions_transaction_date',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
  },
};
