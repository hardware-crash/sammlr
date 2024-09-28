// models/user.js

'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt'); // Assuming bcrypt is used for password hashing

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Define associations here.
     * This method is called automatically by Sequelize.
     */
    static associate(models) {
      // Each User has many Wishlist items
      User.hasMany(models.Wishlist, { foreignKey: 'user_id', as: 'wishlist_items' });

      // Each User has many Transactions
      User.hasMany(models.Transaction, { foreignKey: 'user_id', as: 'transactions' });

      // Each User has many Items
      User.hasMany(models.Item, { foreignKey: 'user_id', as: 'items' });

      // Each User has many ItemChanges
      User.hasMany(models.ItemChange, { foreignKey: 'user_id', as: 'item_changes' });

      // ... other associations can be defined here
    }

    /**
     * Instance method to validate password.
     * @param {string} password - Plain text password to validate.
     * @returns {boolean} - Returns true if password is valid, else false.
     */
    validatePassword(password) {
      return bcrypt.compareSync(password, this.password);
    }

    /**
     * Serialize method to format User data for API responses.
     */
    serialize() {
      return {
        id: this.id,
        username: this.username,
        email: this.email,
        is_admin: this.is_admin, // Falls du es in der API zurückgeben möchtest
        // Exclude password and other sensitive fields
        // Include related data if necessary
      };
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          args: true,
          msg: 'Username already in use!',
        },
        validate: {
          notEmpty: {
            msg: 'Username cannot be empty.',
          },
          len: {
            args: [3, 50],
            msg: 'Username must be between 3 and 50 characters.',
          },
          is: {
            args: /^[a-zA-Z0-9_]+$/i,
            msg: 'Username can only contain letters, numbers, and underscores.',
          },
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          args: true,
          msg: 'Email address already in use!',
        },
        validate: {
          notEmpty: {
            msg: 'Email cannot be empty.',
          },
          isEmail: {
            msg: 'Must be a valid email address.',
          },
          len: {
            args: [5, 100],
            msg: 'Email must be between 5 and 100 characters.',
          },
        },
      },
      password: { // Ensure this field exists
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Password cannot be empty.',
          },
          len: {
            args: [6, 255],
            msg: 'Password must be at least 6 characters long.',
          },
        },
      },
      is_admin: { // Stelle sicher, dass dieses Feld existiert
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // ... other fields can be added here with appropriate validations
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',           // Pluralized table name
      underscored: true,            // Use snake_case for automatically added attributes
      timestamps: true,             // Enable createdAt and updatedAt
      paranoid: false,              // Disable soft deletes; set to true if needed
      defaultScope: {
        attributes: { exclude: ['password'] }, // Exclude password by default for security
      },
      scopes: {
        withPassword: {
          attributes: { }, // Include all attributes when this scope is applied
        },
        // ... other scopes can be defined here
      },
      hooks: {
        /**
         * Hash the user's password before creating.
         */
        beforeCreate: async (user, options) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        /**
         * Hash the user's password before updating, if it has been changed.
         */
        beforeUpdate: async (user, options) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
      indexes: [
        {
          unique: true,
          fields: ['username'],
          name: 'idx_users_username_unique',
        },
        {
          unique: true,
          fields: ['email'],
          name: 'idx_users_email_unique',
        },
        {
          unique: false,
          fields: ['is_admin'],
          name: 'idx_users_is_admin',
        },
        // Add additional indexes here if necessary
      ],
      validate: {
        // Add model-level validations here if necessary
      },
    }
  );

  return User;
};
