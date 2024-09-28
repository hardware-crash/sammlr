'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Manufacturer extends Model {
    static associate(models) {
      // Beziehung zu Consoles
      Manufacturer.hasMany(models.Console, {
        foreignKey: 'manufacturer_id',
        as: 'consoles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Weitere Beziehungen, z.B. zu Items, wenn erforderlich
    }
  }

  Manufacturer.init(
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
      manufacturer_image: {
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
      modelName: 'Manufacturer',
      tableName: 'manufacturers',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'idx_manufacturers_name_unique',
        },
      ],
    }
  );

  return Manufacturer;
};
