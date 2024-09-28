// models/card_edition.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CardEdition extends Model {
    static associate(models) {
      // Beziehungen werden bereits in den anderen Modellen definiert
    }
  }

  CardEdition.init(
    {
      card_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'cards',
          key: 'id',
        },
      },
      edition_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'editions',
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
      modelName: 'CardEdition',
      tableName: 'card_editions',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['card_id', 'edition_id'],
          name: 'pk_card_editions',
        },
        {
          unique: false,
          fields: ['edition_id'],
          name: 'idx_card_editions_edition_id',
        },
      ],
    }
  );

  return CardEdition;
};
