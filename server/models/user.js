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
  password: { // Rename this from 'hashedPassword' to 'password'
    type: Sequelize.STRING,
    allowNull: false
  },
  username: { // Add this field to match your database schema
    type: Sequelize.STRING
  }
}, {
  tableName: 'user',
  timestamps: false
});

module.exports = User;
