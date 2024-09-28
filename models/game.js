// models/game.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    static associate(models) {
      // Many-to-Many Beziehung zu Consoles über `game_consoles`
      Game.belongsToMany(models.Console, {
        through: 'game_consoles',
        foreignKey: 'game_id',
        otherKey: 'console_id',
        as: 'consoles',
      });

      // Beziehung zu Genre
      Game.belongsTo(models.Genre, { foreignKey: 'genre_id', as: 'genre' });
    }
  }

  Game.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'items',
          key: 'id',
        },
      },
      console_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      region: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      genre_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      release_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cover_url: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      developer: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      publisher: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pegi_rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      disc_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      player_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      compatible_on: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      upc_number: {
        type: DataTypes.STRING(200),
        allowNull: true,
        unique: true,
      },
      gtin_number: {
        type: DataTypes.STRING(200),
        allowNull: true,
        unique: true,
      },
      asin_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      cartridge_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      package_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      loose_avg_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      cib_avg_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      new_avg_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'EUR',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    },
    {
      sequelize,
      modelName: 'Game',
      tableName: 'games',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: false,
          fields: ['console_id'],
          name: 'idx_games_console_id',
        },
        {
          unique: false,
          fields: ['genre_id'],
          name: 'idx_games_genre_id',
        },
        {
          unique: true,
          fields: ['upc_number'],
          name: 'idx_games_upc_number_unique',
        },
        {
          unique: true,
          fields: ['gtin_number'],
          name: 'idx_games_gtin_number_unique',
        },
        {
          unique: true,
          fields: ['asin_number'],
          name: 'idx_games_asin_number_unique',
        },
      ],
    }
  );

  return Game;
};
