const bcrypt = require('bcrypt');
const User = require('../models/user');
const express = require('express');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Use the User model to create a new user with the hashed password
    const newUser = await User.create({
      email: email,
      hashedPassword: hashedPassword
    });
    res.json({ message: 'User created successfully', userId: newUser.userid });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Error registering new user');
  }
});

module.exports = router;