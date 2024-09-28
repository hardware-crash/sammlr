// models/item_genre.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ItemGenre extends Model {
    static associate(models) {
      // Beziehungen werden bereits in den anderen Modellen definiert
    }
  }

  ItemGenre.init(
    {
      item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'items',
          key: 'id',
        },
      },
      genre_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'genres',
          key: 'id',
        },
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
      modelName: 'ItemGenre',
      tableName: 'item_genres',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['item_id', 'genre_id'],
          name: 'pk_item_genres',
        },
        {
          unique: false,
          fields: ['genre_id'],
          name: 'idx_item_genres_genre_id',
        },
      ],
    }
  );

  return ItemGenre;
};
