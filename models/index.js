'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize'); // Destructure Sequelize for clarity
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const configPath = path.resolve(__dirname, '..', 'config', 'config.js');
const config = require(configPath)[env];
const db = {};

// Initialize Sequelize instance
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    logging: process.env.NODE_ENV === 'production' ? false : console.log, // Disable logging in production
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    logging: process.env.NODE_ENV === 'production' ? false : console.log, // Disable logging in production
  });
}

// Function to dynamically import all models
const importModels = () => {
  const modelsDir = __dirname;

  fs.readdirSync(modelsDir)
    .filter(file => {
      return (
        file.indexOf('.') !== 0 &&
        file !== basename &&
        (file.slice(-3) === '.js' || file.slice(-3) === '.ts')
      );
    })
    .forEach(file => {
      const modelPath = path.join(modelsDir, file);
      const model = require(modelPath)(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    });
};

// Import all models
importModels();

// Establish model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate && typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

// Attach Sequelize instance and classes to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
