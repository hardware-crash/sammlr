'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('consoles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      manufacturer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'manufacturers',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      release_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      console_image: {
        type: Sequelize.STRING(255),
        allowNull: true,
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
    await queryInterface.addIndex('consoles', ['name'], {
      unique: true,
      name: 'idx_consoles_name_unique',
    });

    await queryInterface.addIndex('consoles', ['manufacturer_id'], {
      unique: false,
      name: 'idx_consoles_manufacturer_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('consoles');
  },
};
