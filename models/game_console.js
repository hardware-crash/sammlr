// models/game_console.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GameConsole extends Model {
    static associate(models) {
      // Beziehungen werden bereits in den anderen Modellen definiert
    }
  }

  GameConsole.init(
    {
      game_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'games',
          key: 'id',
        },
      },
      console_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'consoles',
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
      modelName: 'GameConsole',
      tableName: 'game_consoles',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['game_id', 'console_id'],
          name: 'pk_game_consoles',
        },
        {
          unique: false,
          fields: ['console_id'],
          name: 'idx_game_consoles_console_id',
        },
      ],
    }
  );

  return GameConsole;
};
