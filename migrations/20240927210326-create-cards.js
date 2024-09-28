// migrations/20240927173000-create-cards.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cards', {
      id: { // Verknüpfung zu `items`
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'items',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      genre_id: { // Referenz zu Genres
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'genres',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      edition_id: { // Referenz zu Editionen
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'editions',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      title: { // Titel der Karte
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: { // Beschreibung der Karte
        type: Sequelize.TEXT,
        allowNull: true,
      },
      card_number: { // Kartennummer
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pack_number: { // Packnummer
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      sku_number: { // SKU Nummer
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      gtin_number: { // GTIN Nummer
        type: Sequelize.STRING(200),
        allowNull: true,
        unique: true,
      },
      lowest_buy_price: { // Niedrigster Kaufpreis
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      highest_sell_price: { // Höchster Verkaufspreis
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      currency: { // ISO 4217 Code
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'EUR',
      },
      created_at: { // Erstellungsdatum
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: { // Aktualisierungsdatum
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
    await queryInterface.addIndex('cards', ['genre_id'], {
      unique: false,
      name: 'idx_cards_genre_id',
    });

    await queryInterface.addIndex('cards', ['edition_id'], {
      unique: false,
      name: 'idx_cards_edition_id',
    });

    await queryInterface.addIndex('cards', ['gtin_number'], {
      unique: true,
      name: 'idx_cards_gtin_number_unique',
    });

    await queryInterface.addIndex('cards', ['sku_number'], {
      unique: true,
      name: 'idx_cards_sku_number_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cards');
  },
};
