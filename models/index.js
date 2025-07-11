const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
require('dotenv').config();

const db = {};
const sequelize = require('../config/database');
const Sequelize = require('sequelize');


// Load all models dynamically
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Apply associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define relationships
if (db.Shareholder && db.Vote) {
  db.Shareholder.hasMany(db.Vote, {
    foreignKey: 'shareholderId',
    as: 'votes'
  });
  db.Vote.belongsTo(db.Shareholder, {
    foreignKey: 'shareholderId',
    as: 'shareholder'
  });
}

if (db.Resolution && db.Vote) {
  db.Resolution.hasMany(db.Vote, {
    foreignKey: 'resolutionId',
    as: 'votes'
  });
  db.Vote.belongsTo(db.Resolution, {
    foreignKey: 'resolutionId',
    as: 'resolution'
  });
}

// Add custom methods to models
db.Shareholder.prototype.getVotingHistory = async function() {
  return db.Vote.findAll({
    where: { shareholderId: this.id },
    include: [db.Resolution],
    order: [['createdAt', 'DESC']]
  });
};

db.Resolution.prototype.getVoteSummary = async function() {
  return db.Vote.findAll({
    where: { resolutionId: this.id },
    attributes: [
      'vote',
      [Sequelize.fn('SUM', Sequelize.col('votingPower')), 'totalPower'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'voteCount']
    ],
    group: ['vote']
  });
};

// Add hooks
db.Shareholder.addHook('beforeCreate', async (shareholder) => {
  if (shareholder.phoneNumber) {
    const salt = await bcrypt.genSalt(10);
    shareholder.phoneNumber = await bcrypt.hash(shareholder.phoneNumber, salt);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models with database
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized.');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
})();

module.exports = db;