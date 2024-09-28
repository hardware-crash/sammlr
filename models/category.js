'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Define associations here.
     * This method is called automatically by Sequelize.
     */
    static associate(models) {
      // Each Category has many Games
      Category.hasMany(models.Game, { foreignKey: 'category_id', as: 'games' });
      
      // ... other associations can be defined here
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // Ensure category names are unique
        validate: {
          notEmpty: true, // Prevent empty strings
          len: {
            args: [1, 100],
            msg: 'Name must be between 1 and 100 characters.',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories',    // Pluralized table name
      underscored: true,         // Use snake_case for automatically added attributes
      timestamps: true,          // Enable createdAt and updatedAt
      paranoid: false,           // Disable soft deletes; set to true if needed
      validate: {
        // Custom validations can be added here
      },
    }
  );

  return Category;
};
