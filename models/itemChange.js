// models/itemChange.js

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemChange extends Model {
    static associate(models) {
      ItemChange.belongsTo(models.Item, { foreignKey: 'item_id' });
      ItemChange.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  ItemChange.init({
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    proposed_changes: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
  }, {
    sequelize,
    modelName: 'ItemChange',
    tableName: 'item_changes',
    underscored: true,
  });
  return ItemChange;
};
