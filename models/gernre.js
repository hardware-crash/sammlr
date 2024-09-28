// models/genre.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    static associate(models) {
      // Many-to-Many Beziehung zu Items
      Genre.belongsToMany(models.Item, {
        through: 'item_genres',
        foreignKey: 'genre_id',
        otherKey: 'item_id',
        as: 'items',
      });

      // One-to-Many Beziehung zu Games und Cards
      Genre.hasMany(models.Game, { foreignKey: 'genre_id', as: 'games' });
      Genre.hasMany(models.Card, { foreignKey: 'genre_id', as: 'cards' });
    }
  }

  Genre.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: { // Typ des Items, zu dem dieses Genre gehört
        type: DataTypes.ENUM('Game', 'Book', 'Card', 'Accessory'),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
      modelName: 'Genre',
      tableName: 'genres',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['type', 'name'],
          name: 'idx_genres_type_name_unique',
        },
      ],
    }
  );

  return Genre;
};
