'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Auction extends Model {
    /**
     * Define associations here.
     * This method is called automatically by Sequelize.
     */
    static associate(models) {
      // Each Auction belongs to one Game
      Auction.belongsTo(models.Game, { foreignKey: 'game_id', as: 'game' });
      
      // Each Auction can have multiple Prices
      Auction.hasMany(models.Price, { foreignKey: 'auction_id', as: 'prices' });
    }
  }

  Auction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      auction_item_id: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { 
          model: 'games', // Ensure this matches the actual table name
          key: 'id' 
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          notEmpty: true,
        },
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          notEmpty: true,
          isAfterStart(value) {
            if (value <= this.start_time) {
              throw new Error('End time must be after start time.');
            }
          },
        },
      },
      initial_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: true,
          min: 0,
        },
      },
      final_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          isFloat: true,
          min: 0,
        },
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'EUR',
        validate: {
          isIn: [['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD']], // Extend as needed
        },
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: [['active', 'completed', 'cancelled']], // Define allowed statuses
        },
      },
      condition: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Unknown',
        validate: {
          isIn: [['New', 'Used', 'Refurbished', 'Unknown']], // Define allowed conditions
        },
      },
    },
    {
      sequelize,
      modelName: 'Auction',
      tableName: 'auctions',       // Pluralized table name
      underscored: true,           // Use snake_case for automatically added attributes
      timestamps: true,            // Enable createdAt and updatedAt
      paranoid: false,             // Disable soft deletes; set to true if needed
      validate: {
        endTimeAfterStart() {
          if (this.end_time <= this.start_time) {
            throw new Error('End time must be after start time.');
          }
        },
      },
    }
  );

  return Auction;
};
