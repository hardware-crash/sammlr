// models/edition.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Edition extends Model {
    static associate(models) {
      // Many-to-Many Beziehung zu Cards
      Edition.belongsToMany(models.Card, {
        through: 'card_editions',
        foreignKey: 'edition_id',
        otherKey: 'card_id',
        as: 'cards',
      });
    }
  }

  Edition.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      modelName: 'Edition',
      tableName: 'editions',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'idx_editions_name_unique',
        },
      ],
    }
  );

  return Edition;
};
