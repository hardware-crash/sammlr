// migrations/20240927133000-create-users.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      is_admin: { // Hinzufügen des is_admin Feldes
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // Weitere Felder können hier hinzugefügt werden
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
      engine: 'InnoDB', // Sicherstellen, dass InnoDB verwendet wird (wichtig für Fremdschlüssel)
      charset: 'utf8mb4', // Optional: Unterstützung für Unicode
      collate: 'utf8mb4_unicode_ci', // Optional: Unicode-Kollation
    });

    // Hinzufügen von Indizes
    await queryInterface.addIndex('users', ['username'], {
      unique: true,
      name: 'idx_users_username_unique',
    });

    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'idx_users_email_unique',
    });

    // Optional: Index für is_admin, falls häufig nach Admin-Benutzern gesucht wird
    await queryInterface.addIndex('users', ['is_admin'], {
      unique: false,
      name: 'idx_users_is_admin',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  },
};
