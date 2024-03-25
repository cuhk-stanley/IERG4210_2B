const bcrypt = require('bcrypt');
const User = require('../models/user');
const express = require('express');
const router = express.Router();



// async function createDefaultUser() {
//   const email = "user1@ecommerce.com";
//   const password = "Passw0rd";
//   const adminFlag = 0;

//   try {
//     // Check if the user already exists
//     const userExists = await User.findOne({ where: { email: email } });

//     if (!userExists) {
//       const saltRounds = 12; // This is standard; you can adjust based on security needs
//       const salt = await bcrypt.genSalt(saltRounds); // Generates a new, random salt
//       const hashedPassword = await bcrypt.hash(password, salt); // Hashes the password with the random salt

//       // Create the user with the hashed password and random salt
//       await User.create({
//         email: email,
//         password: hashedPassword,
//         salt: salt, // Ensure your User model accepts a 'salt' field
//         adminFlag: adminFlag,
//       });

//       console.log('Default user created successfully');
//     } else {
//       console.log('Default user already exists');
//     }
//   } catch (error) {
//     console.error('Error creating default user:', error);
//   }
// }

// // Call the function to create a default user after the database connection is established
// createDefaultUser();

router.post('/register', async (req, res) => {
  const { email, password, adminFlag } = req.body; // Assuming you're including adminFlag in the request

  try {
    // Generate a unique salt for each user
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Use the User model to create a new user with the hashed password and salt
    const newUser = await User.create({
      email: email,
      password: hashedPassword, // Storing the hashed password
      salt: salt, // Storing the salt
      adminFlag: adminFlag // Assuming adminFlag is included in your request
    });

    res.json({ message: 'User created successfully', userId: newUser.userid });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Error registering new user');
  }
});


module.exports = router;