'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    /**
     * Define associations here.
     * This method is called automatically by Sequelize.
     */
    static associate(models) {
      // Each Wishlist belongs to one User
      Wishlist.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      // Each Wishlist belongs to one Game
      Wishlist.belongsTo(models.Game, { foreignKey: 'game_id', as: 'game' });

      // ... other associations can be defined here
    }

    /**
     * Serialize method to format Wishlist data for API responses.
     */
    serialize() {
      return {
        id: this.id,
        user: this.user ? this.user.username : null, // Assuming User model has a 'username' field
        game: this.game ? this.game.title : null,     // Assuming Game model has a 'title' field
        added_at: this.added_at,
      };
    }
  }

  Wishlist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      added_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: {
            msg: 'Added At must be a valid date.',
          },
          notNull: {
            msg: 'Added At cannot be null.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Wishlist',
      tableName: 'wishlists',       // Pluralized table name
      underscored: true,            // Use snake_case for automatically added attributes
      timestamps: true,             // Enable createdAt and updatedAt
      paranoid: false,              // Disable soft deletes; set to true if needed
      defaultScope: {
        attributes: { exclude: ['created_at', 'updated_at'] }, // Exclude Sequelize's default timestamps if not needed
      },
      scopes: {
        withTimestamps: {
          attributes: { }, // Include all attributes including timestamps when this scope is applied
        },
        // ... other scopes can be defined here
      },
      hooks: {
        /**
         * Set 'added_at' to current date before creating a Wishlist entry.
         */
        beforeCreate: (wishlist) => {
          if (!wishlist.added_at) {
            wishlist.added_at = new Date();
          }
        },
        /**
         * Optionally, update 'added_at' before updating a Wishlist entry.
         * Uncomment if 'added_at' should be mutable.
         */
        // beforeUpdate: (wishlist) => {
        //   wishlist.added_at = new Date();
        // },
      },
      indexes: [
        {
          unique: false,
          fields: ['user_id'],
          name: 'idx_wishlist_user_id',
        },
        {
          unique: false,
          fields: ['game_id'],
          name: 'idx_wishlist_game_id',
        },
        {
          unique: false,
          fields: ['added_at'],
          name: 'idx_wishlist_added_at',
        },
        // Add composite indexes if needed, e.g., ['user_id', 'game_id']
      ],
      validate: {
        // Add model-level validations here if necessary
      },
    }
  );

  return Wishlist;
};
