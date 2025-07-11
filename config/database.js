require('dotenv').config();
const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'production') {
  // Online database (PostgreSQL with SSL for production)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  });
} else {
  // Local database (MySQL or PostgreSQL without SSL)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'your_local_db_name',
    process.env.DB_USER || 'your_local_db_user',
    process.env.DB_PASSWORD || 'your_local_db_password',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: process.env.DB_DIALECT || 'postgres', 
      pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000
      },
      logging: console.log // Enable logging for debugging in development
    }
  );
}

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;