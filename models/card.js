// models/card.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Card extends Model {
    static associate(models) {
      // Many-to-Many Beziehung zu Editionen über `card_editions`
      Card.belongsToMany(models.Edition, {
        through: 'card_editions',
        foreignKey: 'card_id',
        otherKey: 'edition_id',
        as: 'editions',
      });

      // Beziehung zu Genre
      Card.belongsTo(models.Genre, { foreignKey: 'genre_id', as: 'genre' });
    }
  }

  Card.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'items',
          key: 'id',
        },
      },
      genre_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      edition_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      card_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pack_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      sku_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      gtin_number: {
        type: DataTypes.STRING(200),
        allowNull: true,
        unique: true,
      },
      lowest_buy_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      highest_sell_price: {
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
      modelName: 'Card',
      tableName: 'cards',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: false,
          fields: ['edition_id'],
          name: 'idx_cards_edition_id',
        },
        {
          unique: false,
          fields: ['genre_id'],
          name: 'idx_cards_genre_id',
        },
        {
          unique: true,
          fields: ['sku_number'],
          name: 'idx_cards_sku_number_unique',
        },
        {
          unique: true,
          fields: ['gtin_number'],
          name: 'idx_cards_gtin_number_unique',
        },
      ],
    }
  );

  return Card;
};
