require('dotenv').config();


const express = require('express');
const router = express.Router();
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const app = express();
const path = require('path');
const port = 8000;
const saltRounds = 10;
const cors = require('cors');
//const dbPath = path.resolve(__dirname, './mydatabase.db');
const session = require('express-session');
const userRoutes = require('./routes/users');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { body, validationResult, param } = require('express-validator');
const corsOptions = {
    origin: 'https://secure.s18.ierg4210.ie.cuhk.edu.hk/',
    credentials: true,
  };
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use('/api/users', userRoutes);
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true, // Set to true if you're using https
        sameSite: 'lax' // Consider 'none' if your frontend and backend are on different domains and using https
    }
}));


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


app.get('/get-nonce', (req, res) => {
    const nonce = crypto.randomBytes(16).toString('base64'); // Generate a nonce

    // Set a cookie directly with the nonce value
    res.setHeader('Set-Cookie', `nonce=${nonce}; HttpOnly; Path=/; SameSite=Strict; Secure`);

    // Respond with the nonce for client-side use if needed
    res.json({ nonce });
});



// Endpoint to validate session
app.get('/validate-session', (req, res) => {
    const token = req.cookies.auth; // Assuming 'auth' is your cookie name
    if (!token) {
        return res.status(401).json({ message: 'No session' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid session' });
        }

        // If the token is valid, return user information (avoid sensitive info)
        res.json({ user: { email: decoded.email, adminFlag: decoded.adminFlag, userId: decoded.userId } });
    });
});


app.post('/change-password', async (req, res) => {
    const { userId, oldPassword, newPassword, nonce } = req.body;
    const nonceFromCookie = req.cookies['nonce'];
    if (!nonce || nonce !== nonceFromCookie) {
        return res.status(403).json({ message: 'Invalid nonce' });
    }
    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // SQLite query to find user by ID, including the salt
    const queryFindUser = 'SELECT * FROM user WHERE userid = ?';

    db.get(queryFindUser, [userId], async (err, user) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'An error occurred while fetching the user' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare old password using the salt from the database
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        // Generate a new salt for the new password
        const newSalt = await bcrypt.genSalt(saltRounds);
        const hashedNewPassword = await bcrypt.hash(newPassword, newSalt);

        // SQLite query to update user's password and salt
        const queryUpdatePassword = 'UPDATE user SET password = ?, salt = ? WHERE userid = ?';

        db.run(queryUpdatePassword, [hashedNewPassword, newSalt, userId], (updateErr) => {
            if (updateErr) {
                console.error(updateErr.message);
                return res.status(500).json({ message: 'An error occurred while updating the password' });
            }
            res.clearCookie('auth');
            res.status(200).json({ message: 'Password changed successfully' });
        });
    });
});

app.post('/logout', (req, res) => {
    res.clearCookie('auth'); // 'auth' is the name of your authentication cookie
    res.json({ message: 'Logout successful' });
});

app.post('/login', async (req, res) => {
    const { email, password, nonce: nonceFromBody } = req.body;
    const nonceFromCookie = req.cookies['nonce']; // Assuming the nonce is stored in a cookie named 'nonce'
    // Validate nonce
    if (!nonceFromCookie || nonceFromBody !== nonceFromCookie) {
        return res.status(403).json({ message: 'Invalid nonce' });
    }  
    try {
        const queryFindUser = 'SELECT * FROM user WHERE email = ?';
        db.get(queryFindUser, [email], async (err, user) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'An error occurred' });
            }
  
            if (!user) {
                return res.status(401).json({ message: 'Authentication failed' });
            }
  
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: 'Authentication failed' });
            }
  
            // Generate a JWT token
            const token = jwt.sign(
                { userId: user.userid, email: user.email, adminFlag: user.adminFlag },
                process.env.SECRET_KEY,
                { expiresIn: '3d' } // Token expires in 3 days
            );  
            // Set the token in an httpOnly cookie
            res.cookie('auth', token, {
                httpOnly: true,
                maxAge: 259200000,
                sameSite: 'none',
		secure: true,
                path: '/',

            });
            
  
            // Respond with a success message
            res.json({
                message: 'Login successful',
                user: {
                    adminFlag: user.adminFlag,
                    userId: user.userid,
                    email: user.email
                }
            });
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
   db.all("SELECT * FROM categories", [], (err, categories) => {
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
    const nonce = req.headers['x-csrf-token'];
    const nonceFromCookie = req.cookies['nonce'];
    if (!nonce || nonce !== nonceFromCookie) {
        return res.status(403).json({ message: 'Invalid or missing nonce' });
    }
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
    const nonce = req.headers['x-csrf-token'];
    const nonceFromCookie = req.cookies['nonce'];
    if (!nonce || nonce !== nonceFromCookie) {
        return res.status(403).json({ message: 'Invalid or missing nonce' });
    }
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


app.post('/add-category', upload.single('image'),
[
    [
        body('name')
          .trim()
          .escape()
          .isLength({ min: 2, max: 50 })
          .withMessage('Category name must be between 2 and 50 characters long'),
      ],
],
(req, res) => {
    const { nonce } = req.body;
    const nonceFromCookie = req.cookies['nonce'];
    if (!nonce || nonce !== nonceFromCookie) {
        return res.status(403).json({ message: 'Invalid or missing nonce' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
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
    const nonce = req.body.nonce;
    const nonceFromCookie = req.cookies['nonce'];
    if (!nonce || nonce !== nonceFromCookie) {
        return res.status(403).json({ message: 'Invalid nonce' });
    }

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
app.post('/add-product', upload.single('image'), [
    body('nonce').custom((value, { req }) => {
        const nonceFromCookie = req.cookies['nonce'];
        if (!value || value !== nonceFromCookie) {
            throw new Error('Invalid nonce');
        }
        return true;
    }),
    body('category').isInt().withMessage('Category must be an integer'),
    body('name').matches(/^[A-Za-z0-9 ]{2,50}$/).withMessage('Product name must be 2-50 characters long and contain letters and numbers only'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('inventory').optional().isInt({ min: 0 }).withMessage('Inventory must be a non-negative integer'),
    body('description').optional().isString(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
        return res.status(400).send('No image file provided');
    }

    const { category, name, price, description, inventory } = req.body;
    const inventoryValue = inventory || 0;

    const sanitizedProductName = name.replace(/[^a-zA-Z0-9 ]/g, '_');
    const originalExtension = path.extname(req.file.originalname);
    const newFilename = `${sanitizedProductName.replace(/ /g, '_')}${originalExtension}`;

    db.run(`INSERT INTO products (catid, name, price, inventory, description, image) VALUES (?, ?, ?, ?, ?, ?)`,
        [category, name, price, inventoryValue, description, newFilename], function(err) {
            if (err) {
                console.error("Database insertion error:", err);
                return res.status(500).send(`Error adding product to the database: ${err.message}`);
            }
            res.send('Product added successfully');
        }
    );
});




// Endpoint to update a product
app.put('/update-product/:productId', upload.single('image'),
[
    param('productId').isInt().withMessage('Product ID must be an integer'),
    body('category').isInt().withMessage('Category must be an integer'),
    body('name').isString().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters long'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('inventory').isInt({ gt: -1 }).withMessage('Inventory must be a non-negative integer'),
    body('description').optional().isString(),
],
(req, res) => {
    const nonce = req.body.nonce;
    const nonceFromCookie = req.cookies['nonce'];
    if (!nonce || nonce !== nonceFromCookie) {
        return res.status(403).json({ message: 'Invalid nonce' });
    }

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId } = req.params;
    const { category, name, price, description, inventory } = req.body;
    let imagePath = '';

    if (req.file) {
        imagePath = req.file.path;
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

function generateSalt() {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex'); // Generates a 32-character hex string
}
function generateDigest(stringToHash) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(stringToHash).digest('hex'); // Returns a SHA-256 hash in hex format
}
function generateUUID() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4(); // Returns a UUID string
}

function insertOrder(uuid, username, digest, salt) {
    const insertQuery = `INSERT INTO orders (UUID, username, digest, salt) VALUES (?, ?, ?, ?)`;

    return new Promise((resolve, reject) => {
        db.run(insertQuery, [uuid, username, digest, salt], function(err) {
            if (err) {
                console.error("Error inserting order:", err.message);
                reject(err);
                return;
            }
            resolve(this.lastID); // Resolves with the last inserted row ID
        });
    });
}


function calculateTotal(cartItems) {
    let total = 0;
    for (const item of cartItems) {
        total += item.price * item.quantity; // Simplified total calculation
    }
    return total;
}



app.post('/my-server/create-order', async (req, res) => {
    const { cartItems, username } = req.body;
    const currencyCode = 'USD';
    const merchantEmail = 'merchant@example.com';

    try {
        const total = calculateTotal(cartItems); // Assuming this function exists
        const salt = generateSalt();
        const stringToHash = cartItems.map(item => `${item.pid}:${item.quantity}:${item.price}`).join('|') + `|${total}|${currencyCode}|${merchantEmail}|${salt}`;
        const digest = generateDigest(stringToHash);
        const uuid = generateUUID();
        await insertOrder(uuid, username, digest, salt);
        const orderDetails = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currencyCode,
                    value: total,
                    breakdown: {
                        item_total: { currency_code: currencyCode, value: total },
                    },
                },
                custom_id: digest,
                items: cartItems.map(item => ({
                    name: item.name,
                    unit_amount: { currency_code: currencyCode, value: item.price.toString() },
                    quantity: item.quantity.toString(),
                })),
            }],
            invoice_id: uuid,
        };

        res.status(200).json({ uuid, orderDetails });
    } catch (error) {
        res.status(500).send(`Error generating order details: ${error.message}`);
    }
});




app.post('/my-server/save-order', async (req, res) => {
    const { orderID, details, products } = req.body;
    // Step 1: Verify the payment with PayPal
    // You would typically use the PayPal SDK here to verify the orderID and payment details with PayPal
    const isPaymentVerified = true; // This should be the result of your verification logic

    if (!isPaymentVerified) {
        return res.status(400).send('Payment verification failed');
    }

    // Step 2: Update Inventory
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

    const updateOrderDetails = () => new Promise((resolve, reject) => {
        const updateOrderDetailsSql = `UPDATE orders SET orderDetails = ? WHERE UUID = ?`;
        db.run(updateOrderDetailsSql, [JSON.stringify(details), orderID], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });

    db.serialize(async () => {
        db.run('BEGIN TRANSACTION');

        try {
            // Step 1: Update inventory for each product
            for (const product of products) {
                await updateInventory(product);
            }

            // Step 2: Update the order details in the "orders" table
            await updateOrderDetails();

            // If all updates are successful, commit the transaction
            db.run('COMMIT', () => {
                res.send('Payment Successful');
            });
        } catch (error) {
            // If there's an error, rollback the transaction
            db.run('ROLLBACK', () => {
                console.error("Error during order processing:", error);
                res.status(500).send(`Order processing failed: ${error.message}`);
            });
        }
    });
});

function deleteOrder(uuid) {
    return new Promise((resolve, reject) => {
        const deleteQuery = `DELETE FROM orders WHERE UUID = ?`;

        db.run(deleteQuery, [uuid], function(err) {
            if (err) {
                console.error("Error deleting order:", err.message);
                reject(err);
                return;
            }
            if (this.changes === 0) {
                // No rows were deleted, indicating the UUID didn't match any records
                reject(new Error(`No order found with UUID: ${uuid}`));
                return;
            }
            console.log(`Order with UUID: ${uuid} deleted successfully.`);
            resolve();
        });
    });
}


app.post('/my-server/cancel-order', async (req, res) => {
    const { uuid } = req.body;
    try {
        await deleteOrder(uuid);
        res.json({ success: true });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/get-orders', (req, res) => {
    const userEmail = req.body.email; // Get the email from the request body

    // Server-side validation for userEmail to ensure it's a valid email could be added here

    const query = `SELECT UUID, username, orderDetails FROM orders WHERE username = ?`;

    db.all(query, [userEmail], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Error fetching orders');
        }
        res.json(rows);
    });
});



app.get('/api/orders', (req, res) => {
    const query = `SELECT UUID, username, orderDetails FROM orders`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching orders', err.message);
            res.status(500).send('Error fetching order data');
            return;
        }

        // Process each row to parse the orderDetails JSON string
        const orders = rows.map(row => ({
            UUID: row.UUID,
            username: row.username,
            orderDetails: JSON.parse(row.orderDetails)
        }));

        // Calculate total amount and include payment status for each order
        orders.forEach(order => {
            // Calculate total amount from orderDetails
            const totalAmount = order.orderDetails.purchase_units.reduce((total, unit) => {
                return total + parseFloat(unit.amount.value);
            }, 0);

            order.totalAmount = totalAmount.toFixed(2);
        });

        res.json(orders);
    });
});



app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`);
});
