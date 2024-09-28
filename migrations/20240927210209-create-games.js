// migrations/20240927210209-create-games.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('games', {
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
      console_id: { // Referenz zu Konsolen
        type: Sequelize.INTEGER,
        allowNull: true, // Erlaube NULL-Werte
        references: {
          model: 'consoles',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      title: { // Titel des Spiels
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      region: { // Region des Spiels (z.B. PAL, NTSC)
        type: Sequelize.STRING(50),
        allowNull: false,
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
      release_date: { // Veröffentlichungsdatum
        type: Sequelize.DATE,
        allowNull: true,
      },
      cover_url: { // URL zum Coverbild
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      description: { // Beschreibung des Spiels
        type: Sequelize.TEXT,
        allowNull: true,
      },
      developer: { // Entwickler des Spiels
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      publisher: { // Publisher des Spiels
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      pegi_rating: { // PEGI-Bewertung
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      disc_count: { // Anzahl der Discs
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      player_count: { // Empfohlene Spieleranzahl
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      compatible_on: { // Kompatible Plattformen/Konsolen
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      upc_number: { // UPC Nummer
        type: Sequelize.STRING(200),
        allowNull: true,
        unique: true,
      },
      gtin_number: { // GTIN Nummer
        type: Sequelize.STRING(200),
        allowNull: true,
        unique: true,
      },
      asin_number: { // ASIN Nummer
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      cartridge_number: { // Spezifisch für Cartridge-basierte Spiele
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      package_number: { // Spezifisch für Pakete
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      loose_avg_price: { // Durchschnittlicher Preis für lose Artikel
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      cib_avg_price: { // Durchschnittlicher CIB Preis
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      new_avg_price: { // Durchschnittlicher neuer Preis
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
    await queryInterface.addIndex('games', ['console_id'], {
      unique: false,
      name: 'idx_games_console_id',
    });

    await queryInterface.addIndex('games', ['genre_id'], {
      unique: false,
      name: 'idx_games_genre_id',
    });

    await queryInterface.addIndex('games', ['upc_number'], {
      unique: true,
      name: 'idx_games_upc_number_unique',
    });

    await queryInterface.addIndex('games', ['gtin_number'], {
      unique: true,
      name: 'idx_games_gtin_number_unique',
    });

    await queryInterface.addIndex('games', ['asin_number'], {
      unique: true,
      name: 'idx_games_asin_number_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('games');
  },
};
