'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Console extends Model {
    static associate(models) {
      // Beziehung zu Manufacturer
      Console.belongsTo(models.Manufacturer, {
        foreignKey: 'manufacturer_id',
        as: 'manufacturer',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Beziehung zu Games (Many-to-Many über game_consoles)
      Console.belongsToMany(models.Game, {
        through: 'game_consoles',
        foreignKey: 'console_id',
        otherKey: 'game_id',
        as: 'games',
      });

      // Weitere Beziehungen, z.B. zu Items, wenn erforderlich
    }
  }

  Console.init(
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
      manufacturer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      release_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      console_image: {
        type: DataTypes.STRING(255),
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
      modelName: 'Console',
      tableName: 'consoles',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'idx_consoles_name_unique',
        },
        {
          unique: false,
          fields: ['manufacturer_id'],
          name: 'idx_consoles_manufacturer_id',
        },
      ],
    }
  );

  return Console;
};
