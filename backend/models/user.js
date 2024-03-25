const Sequelize = require('sequelize');
const sequelize = new Sequelize('sqlite:mydatabase.db');

const User = sequelize.define('user', {
  userid: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: { // This is your hashed password
    type: Sequelize.STRING,
    allowNull: false
  },
  salt: { // Adding the salt column
    type: Sequelize.STRING, // Salts are strings
    allowNull: false
  },
  adminFlag: { // Make sure this reflects your table structure
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'user',
  timestamps: false
});

module.exports = User;
