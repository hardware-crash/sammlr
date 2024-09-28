'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auctions', {
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
      seller_id: { // Verkäufer, verweist auf Users
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Pluralisierte Tabellenname
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      starting_price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      current_bid: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'active',
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
    await queryInterface.addIndex('auctions', ['item_id'], {
      unique: false,
      name: 'idx_auctions_item_id',
    });

    await queryInterface.addIndex('auctions', ['seller_id'], {
      unique: false,
      name: 'idx_auctions_seller_id',
    });

    await queryInterface.addIndex('auctions', ['status'], {
      unique: false,
      name: 'idx_auctions_status',
    });

    await queryInterface.addIndex('auctions', ['end_date'], {
      unique: false,
      name: 'idx_auctions_end_date',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auctions');
  },
};
