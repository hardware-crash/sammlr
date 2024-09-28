'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Define associations here.
     * This method is called automatically by Sequelize.
     */
    static associate(models) {
      // Each Transaction belongs to one Game
      Transaction.belongsTo(models.Game, { foreignKey: 'game_id', as: 'game' });

      // Each Transaction belongs to one User
      Transaction.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      // Each Transaction belongs to one Console
      Transaction.belongsTo(models.Console, { foreignKey: 'console_id', as: 'console' });

      // Each Transaction belongs to one Condition (assuming a Condition model exists)
      Transaction.belongsTo(models.Condition, { foreignKey: 'condition_id', as: 'condition' });

      // ... other associations can be defined here
    }

    /**
     * Serialize method to format Transaction data for API responses.
     */
    serialize() {
      return {
        id: this.id,
        game: this.game ? this.game.title : null,
        user: this.user ? this.user.username : null, // Assuming User model has a 'username' field
        console: this.console ? this.console.name : null,
        transaction_type: this.transaction_type,
        quantity: this.quantity,
        price: this.price,
        transaction_date: this.transaction_date,
        condition: this.condition ? this.condition.name : null, // Assuming Condition model has a 'name' field
        description: this.description,
        conditions: this.conditions,
      };
    }
  }

  Transaction.init(
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Ensure this matches your users table name (plural)
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        validate: {
          isInt: {
            msg: 'User ID must be an integer.',
          },
          notNull: {
            msg: 'User ID cannot be null.',
          },
        },
        index: true, // Index added for faster queries on user_id
      },
      console_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'consoles', // Ensure this matches your consoles table name (plural)
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        validate: {
          isInt: {
            msg: 'Console ID must be an integer.',
          },
          notNull: {
            msg: 'Console ID cannot be null.',
          },
        },
      },
      transaction_type: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          isIn: {
            args: [['purchase', 'sale']],
            msg: 'Transaction type must be either "purchase" or "sale".',
          },
          notEmpty: {
            msg: 'Transaction type cannot be empty.',
          },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isInt: {
            msg: 'Quantity must be an integer.',
          },
          min: {
            args: [1],
            msg: 'Quantity must be at least 1.',
          },
          notNull: {
            msg: 'Quantity cannot be null.',
          },
        },
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
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
      transaction_date: {
        type: DataTypes.DATEONLY, // Consider changing to DATE if time is relevant
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: {
            msg: 'Transaction date must be a valid date.',
          },
          notNull: {
            msg: 'Transaction date cannot be null.',
          },
        },
        index: true, // Index added for faster queries on transaction_date
      },
      condition_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'conditions', // Ensure this matches your conditions table name (plural)
          key: 'id',
        },
        onDelete: 'RESTRICT', // Prevent deletion if there are associated transactions
        onUpdate: 'CASCADE',
        validate: {
          isInt: {
            msg: 'Condition ID must be an integer.',
          },
          notNull: {
            msg: 'Condition ID cannot be null.',
          },
        },
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Description must be at most 255 characters long.',
          },
        },
      },
      conditions: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          len: {
            args: [0, 255],
            msg: 'Conditions must be at most 255 characters long.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',   // Pluralized table name
      underscored: true,           // Use snake_case for automatically added attributes
      timestamps: true,            // Enable createdAt and updatedAt
      paranoid: false,             // Disable soft deletes; set to true if needed
      hooks: {
        beforeCreate: (transaction) => {
          if (!transaction.transaction_date) {
            transaction.transaction_date = new Date();
          }
        },
        // Add any additional hooks here if necessary
      },
      indexes: [
        {
          unique: false,
          fields: ['game_id'],
          name: 'idx_transaction_game_id',
        },
        {
          unique: false,
          fields: ['user_id'],
          name: 'idx_transaction_user_id',
        },
        {
          unique: false,
          fields: ['console_id'],
          name: 'idx_transaction_console_id',
        },
        {
          unique: false,
          fields: ['transaction_date'],
          name: 'idx_transaction_date',
        },
        // Add composite indexes if needed, e.g., for frequent query combinations
      ],
      validate: {
        // Add model-level validations here if necessary
      },
    }
  );

  return Transaction;
};
