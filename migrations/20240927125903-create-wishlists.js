'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wishlists', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Pluralized table name
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'items', // Pluralized table name
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      added_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      // Add other fields as necessary
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
    await queryInterface.addIndex('wishlists', ['user_id'], {
      unique: false,
      name: 'idx_wishlists_user_id',
    });

    await queryInterface.addIndex('wishlists', ['item_id'], {
      unique: false,
      name: 'idx_wishlists_item_id',
    });

    // Optional: Composite unique index to prevent duplicate wishlist entries per user-item pair
    await queryInterface.addIndex('wishlists', ['user_id', 'item_id'], {
      unique: true,
      name: 'idx_wishlists_user_item_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wishlists');
  },
};
