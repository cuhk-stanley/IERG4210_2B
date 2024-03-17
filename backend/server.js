const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const app = express();
const path = require('path');
const port = 8000;
const cors = require('cors');
//const dbPath = path.resolve(__dirname, './mydatabase.db');
const User = require('./models/user');
const userRoutes = require('./routes/users');
app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
console.log("Current directory:", __dirname);
const saltRounds = 10;


// Set up storage engine for Multer
const storage = multer.diskStorage({
   destination: function(req, file, cb) {
       cb(null, 'uploads/');
   },
   filename: function(req, file, cb) {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
       cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
   }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });


// Connect to SQLite database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
   if (err) {
       console.error(err.message);
   }
   console.log('Connected to the database.');
});


app.use(express.urlencoded({ extended: true }));


app.post('/register', async (req, res) => {
    try {
      const { email, password, username } = req.body;
      const hashedPassword = await bcrypt.hash(password, saltRounds); // Hashing the password
  
      // Using Sequelize to create a new user with the hashed password
      const newUser = await User.create({
        email: email,
        password: hashedPassword, // Storing the hashed password
        username: username
      });
  
      // Responding with success (don't include sensitive info in the response)
      res.status(201).json({
        message: 'User created successfully',
        user: {
          email: newUser.email,
          username: newUser.username
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while creating the user' });
    }
  });


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Authentication failed'});
      }
  
      // Your logic for successful authentication...
      res.json({
        message: 'Login successful',
        user: {
          name: user.username, // Do not return sensitive information
          email: user.email
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });
  
  


// Serve HTML forms
app.get('/admin-panel', (req, res) => {
   db.all("SELECT catid, name FROM categories", [], (err, categories) => {
       if (err) {
           console.error(err.message);
           res.send("Error retrieving categories from the database.");
           return;
       }


       let categoryOptions = categories.map(category => `<option value="${category.catid}">${category.name}</option>`).join('\n');


       // Use the constructed path to read the admin_panel.html file
       fs.readFile(adminPanelPath, 'utf8', (err, html) => {
           if (err) {
               console.error(err.message);
               res.send("Error loading the admin panel page.");
               return;
           }


           const finalHtml = html.replace('<!-- Options will be populated server-side -->', categoryOptions);
           res.send(finalHtml);
       });
   });
});


app.get('/categories', (req, res) => {
   db.all("SELECT catid, name FROM categories", [], (err, categories) => {
       if (err) {
           console.error(err.message);
           res.status(500).send("Error retrieving categories from the database.");
           return;
       }
       res.json(categories);
   });
});

app.get('/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, categories) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error retrieving categories from the database.");
            return;
        }
        res.json(categories);
    });
 });


// Assuming your existing setup and configurations are already in place

app.delete('/delete-category/:catid', (req, res) => {
    const { catid } = req.params;
    const deleteSql = 'DELETE FROM categories WHERE catid = ?';

    db.run(deleteSql, [catid], function(err) {
        if (err) {
            console.error("Database deletion error:", err);
            return res.status(500).send(`Error deleting category from the database: ${err.message}`);
        }
        if (this.changes > 0) {
            res.send('Category deleted successfully');
        } else {
            res.status(404).send('Category not found');
        }
    });
});


app.delete('/delete-product/:productId', (req, res) => {
    const { productId } = req.params;

    // First, get the product to retrieve the image path/filename
    db.get('SELECT image FROM products WHERE pid = ?', [productId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Error retrieving product from the database.");
        }
        if (row) {
            // Attempt to delete the image file
            const imagePath = path.join(__dirname, '../frontend/public/image', row.image);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('File deletion error:', err);
                    // Continue with deleting the database record even if the file deletion fails
                }
                // Proceed to delete the product from the database
                db.run('DELETE FROM products WHERE pid = ?', [productId], function(err) {
                    if (err) {
                        console.error("Database deletion error:", err);
                        return res.status(500).send(`Error deleting product from the database: ${err.message}`);
                    }
                    if (this.changes > 0) {
                        res.send('Product deleted successfully');
                    } else {
                        res.status(404).send('Product not found');
                    }
                });
            });
        } else {
            res.status(404).send('Product not found');
        }
    });
});


app.post('/add-category', upload.single('image'), (req, res) => {
    const { name } = req.body;

    if (!req.file) {
        return res.status(400).send('No image file provided');
    }

    const targetDir = path.resolve(__dirname, '../frontend/public/image');
    // Sanitize the category name: replace non-alphanumeric characters except spaces with an underscore
    const sanitizedCategoryName = name.replace(/[^a-zA-Z0-9 ]/g, '_');
    const originalExtension = path.extname(req.file.originalname);
    // Replace spaces with underscores for the filename to ensure URL compatibility
    const newFilename = `${sanitizedCategoryName.replace(/ /g, '_')}${originalExtension}`;
    const newPath = path.join(targetDir, newFilename);

    // Move and rename the file
    fs.rename(req.file.path, newPath, (err) => {
        if (err) {
            console.error('Error moving the file:', err);
            return res.status(500).send('Error processing image file');
        }

        // Insert into the categories table
        const insertSql = `INSERT INTO categories (name, image) VALUES (?, ?)`;
        // Note: Storing the filename with spaces replaced by underscores for URL compatibility
        db.run(insertSql, [name, newFilename], function(err) {
            if (err) {
                console.error("Database insertion error:", err);
                return res.status(500).send(`Error adding category to the database: ${err.message}`);
            }
            res.send('Category added successfully');
        });
    });
});


app.post('/update-category/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).send('No image file provided');
    }

    if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).send('Please upload an image file');
    }

    // Placeholder for the category name retrieval. Adjust the query as necessary for your database schema.
    const getCategoryNameQuery = `SELECT name FROM categories WHERE catid = ?`;

    db.get(getCategoryNameQuery, [id], (err, row) => {
        if (err || !row) {
            console.error('Error fetching category name:', err);
            return res.status(500).send('Error fetching category name');
        }

        const categoryName = row.name;
        const sanitizedProductName = categoryName.replace(/[^a-zA-Z0-9 ]/g, '_');
        const originalExtension = path.extname(req.file.originalname);
        const newFilename = `${sanitizedProductName.replace(/ /g, '_')}${originalExtension}`;
        const targetDir = path.resolve(__dirname, '../frontend/public/image');
        const newPath = path.join(targetDir, newFilename);

        // Move and rename the file
        fs.rename(req.file.path, newPath, (err) => {
            if (err) {
                console.error('Error moving the file:', err);
                return res.status(500).send('Error processing image file');
            }

            // Update the categories table
            const updateSql = `UPDATE categories SET image = ? WHERE catid = ?`;
            db.run(updateSql, [newFilename, id], function(err) {
                if (err) {
                    console.error("Database update error:", err);
                    return res.status(500).send(`Error updating category in the database: ${err.message}`);
                }
                res.status(200).json({ message: 'Category image updated successfully' });
            });
        });
    });
});






// Endpoint to handle adding products
app.post('/add-product', upload.single('image'), (req, res) => {
    const { category, name, price, description, inventory } = req.body;
    const inventoryValue = inventory || 0;

    const targetDir = path.resolve(__dirname, '../frontend/public/image');

    const sanitizedProductName = name.replace(/[^a-zA-Z0-9 ]/g, '_');
    const originalExtension = path.extname(req.file.originalname);
    const newFilename = `${sanitizedProductName.replace(/ /g, '_')}${originalExtension}`;
    //const newFilename = `${sanitizedProductName}${originalExtension}`;
    const newPath = path.join(targetDir, newFilename);


    // Move and rename the file
    fs.rename(req.file.path, newPath, (err) => {
        if (err) {
            console.error('Error moving the file:', err);
            return res.status(500).send('Error processing image file');
        }

        // Now includes 'inventory' in the INSERT statement
        // Adjust the database query to include the new path or filename as needed
        db.run(`INSERT INTO products (catid, name, price, inventory, description, image) VALUES (?, ?, ?, ?, ?, ?)`,
            [category, name, price, inventoryValue, description, newPath], function(err) {
                if (err) {
                    console.error("Database insertion error:", err);
                    return res.status(500).send(`Error adding product to the database: ${err.message}`);
                }
                res.send('Product added successfully');
            }
        );
    });
});

app.use('/image', express.static(path.join(__dirname, 'public', 'image')));


// Endpoint to update a product
app.put('/update-product/:productId', upload.single('image'), (req, res) => {
    const { productId } = req.params;
    const { category, name, price, description, inventory } = req.body;
    let imagePath = '';

    if (req.file) {
        imagePath = req.file.path; // If a new image is uploaded, use its path
    }

    const updateQuery = `UPDATE products SET name = ?, price = ?, description = ?, inventory = ? WHERE pid = ?`;

    // Execute the update query, including the image path if a new image was uploaded
    db.run(updateQuery, [name, price, description, inventory, productId], function(err) {
        if (err) {
            console.error("Database update error:", err);
            return res.status(500).send(`Error updating product in the database: ${err.message}`);
        }
        if (this.changes > 0) {
            res.send('Product updated successfully');
        } else {
            res.status(404).send('Product not found');
        }
    });
});



app.get('/product-image/:id', (req, res) => {
   const id = req.params.id;
   db.get(`SELECT image FROM products WHERE id = ?`, [id], (err, row) => {
       if (err) {
           res.status(500).send('Database error');
           return console.error(err.message);
       }
       if (row && row.image) {
           res.writeHead(200, {
               'Content-Type': 'image/jpeg', // Adjust the MIME type accordingly
               'Content-Length': row.image.length
           });
           res.end(row.image);
       } else {
           res.status(404).send('Image not found');
       }
   });
});

// Endpoint to fetch products by category ID
app.get('/products/category/:catid', (req, res) => {
    const catid = req.params.catid;
    db.all("SELECT * FROM products WHERE catid = ?", [catid], (err, products) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error retrieving products from the database.");
            return;
        }
        res.json(products);
    });
});

app.get('/category/:catid', (req, res) => {
    const catid = req.params.catid;
    db.get("SELECT * FROM categories WHERE catid = ?", [catid], (err, category) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error retrieving category from the database.");
            return;
        }
        if (!category) {
            res.status(404).send("Category not found");
            return;
        }
        res.json(category);
    });
});

app.get('/product/:productId', (req, res) => {
    const { productId } = req.params;
    // Adjusted query to include a JOIN with the categories table
    db.get(`
        SELECT p.*, c.name AS categoryName, c.catid AS categoryId 
        FROM products p
        JOIN categories c ON p.catid = c.catid
        WHERE p.pid = ?`, [productId], (err, product) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (product) {
            res.json(product);
        } else {
            res.status(404).send('Product not found');
        }
    });
});

app.post('/checkout', async (req, res) => {
    const { products } = req.body;

    const updateInventory = (product) => {
        return new Promise((resolve, reject) => {
            const updateInventorySql = `UPDATE products SET inventory = inventory - ? WHERE pid = ? AND inventory >= ?`;
            db.run(updateInventorySql, [product.quantity, product.pid, product.quantity], function(err) {
                if (err) {
                    return reject(err);
                }
                if (this.changes === 0) {
                    return reject(new Error(`Product ${product.pid} has insufficient inventory.`));
                }
                resolve();
            });
        });
    };
    

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        Promise.all(products.map(product => updateInventory(product)))
            .then(() => {
                db.run('COMMIT', (err) => {
                    if (err) {
                        throw err;
                    }
                    res.send('Checkout successful');
                });
            })
            .catch((error) => {
                db.run('ROLLBACK', (rollbackErr) => {
                    if (rollbackErr) {
                        console.error("Rollback error:", rollbackErr);
                    }
                    console.error("Checkout error:", error);
                    res.status(500).send(`Checkout failed: ${error.message}`);
                });
            });
    });
});




app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`);
});
