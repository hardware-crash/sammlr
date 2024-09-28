// models/item.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      // 1:n Beziehung zu Games
      Item.hasMany(models.Game, { foreignKey: 'id', as: 'games', onDelete: 'CASCADE' });

      // 1:n Beziehung zu Cards
      Item.hasMany(models.Card, { foreignKey: 'id', as: 'cards', onDelete: 'CASCADE' });

      // Weitere 1:n Beziehungen zu Books, Accessories etc. können hier hinzugefügt werden

      // Many-to-Many Beziehung zu Genres
      Item.belongsToMany(models.Genre, {
        through: 'item_genres',
        foreignKey: 'item_id',
        otherKey: 'genre_id',
        as: 'genres',
      });

      // Weitere Many-to-Many Beziehungen, z.B. zu Consoles über Games
    }
  }

  Item.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM('Game', 'Book', 'Card', 'Accessory', 'Other'),
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
      modelName: 'Item',
      tableName: 'items',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: false,
          fields: ['type'],
          name: 'idx_items_type',
        },
      ],
    }
  );

  return Item;
};
