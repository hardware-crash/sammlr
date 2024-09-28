'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Price extends Model {
    /**
     * Define associations here.
     * This method is called automatically by Sequelize.
     */
    static associate(models) {
      // Each Price belongs to one Game
      Price.belongsTo(models.Game, { foreignKey: 'game_id', as: 'game' });

      // Each Price belongs to one Auction (optional)
      Price.belongsTo(models.Auction, { foreignKey: 'auction_id', as: 'auction' });

      // ... other associations can be defined here
    }

    /**
     * Serialize method to format Price data for API responses.
     */
    serialize() {
      return {
        id: this.id,
        game_id: this.game_id,
        auction_id: this.auction_id,
        price: this.price,
        date: this.date,
        currency: this.currency,
        condition: this.condition,
      };
    }
  }

  Price.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'games', // Ensure this matches your games table name (plural)
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        validate: {
          isInt: {
            msg: 'Game ID must be an integer.',
          },
          notNull: {
            msg: 'Game ID cannot be null.',
          },
        },
      },
      auction_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'auctions', // Ensure this matches your auctions table name (plural)
          key: 'id',
        },
        onDelete: 'SET NULL', // If an auction is deleted, set auction_id to null
        onUpdate: 'CASCADE',
        validate: {
          isInt: {
            msg: 'Auction ID must be an integer.',
          },
        },
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: {
            msg: 'Price must be a valid number.',
          },
          min: {
            args: [0],
            msg: 'Price must be a positive number.',
          },
          notNull: {
            msg: 'Price cannot be null.',
          },
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: {
            msg: 'Date must be a valid date.',
          },
          notNull: {
            msg: 'Date cannot be null.',
          },
        },
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'EUR',
        validate: {
          isIn: {
            args: [['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD']], // Extend as needed
            msg: 'Currency must be a valid ISO 4217 currency code.',
          },
          notEmpty: {
            msg: 'Currency cannot be empty.',
          },
        },
      },
      condition: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Unknown',
        validate: {
          isIn: {
            args: [['New', 'Used', 'Refurbished', 'Unknown']], // Define allowed conditions
            msg: 'Condition must be one of: New, Used, Refurbished, Unknown.',
          },
          notEmpty: {
            msg: 'Condition cannot be empty.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Price',
      tableName: 'prices',        // Pluralized table name
      underscored: true,          // Use snake_case for automatically added attributes
      timestamps: true,           // Enable createdAt and updatedAt
      paranoid: false,            // Disable soft deletes; set to true if needed
      hooks: {
        beforeCreate: (price) => {
          if (!price.date) {
            price.date = new Date();
          }
        },
        // Add any additional hooks here if necessary
      },
      indexes: [
        {
          unique: false,
          fields: ['game_id'],
          name: 'idx_price_game_id',
        },
        {
          unique: false,
          fields: ['auction_id'],
          name: 'idx_price_auction_id',
        },
        // Add composite indexes if needed, e.g., for frequent query combinations
      ],
      validate: {
        // Add model-level validations here if necessary
      },
    }
  );

  return Price;
};
