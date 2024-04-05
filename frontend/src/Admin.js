import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from './AuthContext';
import './AdminPanel.css';
const AdminPanel = () => {
    const [categories, setCategories] = useState([]);
    const [categoryImage, setCategoryImage] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [updateProductId, setupdateProductId] = useState('');
    const [categoryImagePreviewUrl, setCategoryImagePreviewUrl] = useState('');
    const [updateCategoryId, setUpdateCategoryId] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [newCategoryImagePreviewUrl, setNewCategoryImagePreviewUrl] = useState('');
    const [nonce, setNonce] = useState('');
    const { logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('Categories');

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [product, setProduct] = useState({
        category: '',
        name: '',
        price: '',
        description: '',
        inventory: '',
        image: null,
        imagePreviewUrl: null,
    });

    const [selectedProductDetails, setSelectedProductDetails] = useState({
        name: '',
        price: '',
        description: '',
        inventory: ''
      });

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        const fetchNonce = async () => {
            const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/get-nonce', {
                credentials: 'include',
            });
            const data = await response.json();
            setNonce(data.nonce);
        };
    
        fetchNonce();
    }, []);
    useEffect(() => {
        return () => {
            if (product.image) {
                URL.revokeObjectURL(product.image);
            }
        };
    }, [product.image]);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/api/orders');
                if (!response.ok) throw new Error('Failed to fetch orders');

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleLogout = () => {
        navigate('/login');
        logout();
      };

    const isValidPrice = (price) => {
        return price > 0;
    };

    const isValidName = (name) => {
        const regex = /^[A-Za-z0-9]{2,50}$/;
        return regex.test(name);
      };

    // Validate that the inventory is a positive integer
    const isValidInventory = (inventory) => {
        const num = parseInt(inventory, 10);
        return num >= 0 && num === parseFloat(inventory);
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/categories');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setCategories(data);
            if (data.length > 0) {
                setProduct(prevProduct => ({ ...prevProduct, category: data[0].catid }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/products');
        const data = await response.json();
        setProducts(data);
    };


    const deleteCategory = async () => {
        if (window.confirm(`Are you sure you want to delete this category?`)) {
            try {
                const response = await fetch(`https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/delete-category/${selectedCategoryId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': nonce, // Include the nonce here
                    },
                    credentials: 'include', // Ensure cookies are sent with the request
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                alert('Category deleted successfully');
                fetchCategories(); // Refresh categories list
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Error deleting category');
            }
        }
    };
    

    const deleteProduct = async () => {
        if (window.confirm(`Are you sure you want to delete this product?`)) {
            try {
                const response = await fetch(`https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/delete-product/${selectedProductId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': nonce,
                    },
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                alert('Product deleted successfully');
                fetchProducts(); // Refresh products list
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error deleting product');
            }
        }
    };


    const handleNewCategoryImageChange = (e) => {
        if (e.target.files[0]) {
            setNewCategoryImage(e.target.files[0]);
            setNewCategoryImagePreviewUrl(URL.createObjectURL(e.target.files[0]));
        }
    };


    const handleUpdateCategorySubmit = async (event) => {
        event.preventDefault();
        if (!updateCategoryId) {
            alert("Please select a category to update.");
            return;
        }
    
        if (!newCategoryImage || !newCategoryImage.type.startsWith('image/')) {
            alert("Please select an image file for the category.");
            return;
        }
    
        const formData = new FormData();
        formData.append("image", newCategoryImage);
        formData.append('nonce', nonce);
    
        try {
            const response = await fetch(`https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/update-category/${updateCategoryId}`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
    
            const result = await response.json();
            alert(result.message);
            fetchCategories();
    
        } catch (error) {
            console.error("Failed to update category", error);
            alert("Failed to update category. See console for more details.");
        }
    };
    
    

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        if (!isValidName(categoryName)) {
            alert('Category name must be 2-50 characters long and contain letters and numbers only.');
            return;
          }
        const formData = new FormData();
        formData.append('name', categoryName);
        if (categoryImage) formData.append('image', categoryImage);

        formData.append('nonce', nonce);
        try {
            const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/add-category', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text(); // Assuming the response is text
            alert(data);
            fetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Error adding category');
        }
    };
    

    
    
    
    const handleUpdateProductSubmit = async (e) => {
        e.preventDefault();
        if (!isValidName(selectedProductDetails.name)) {
            alert('Product name must be 2-50 characters long and contain letters and numbers only.');
            return;
          }
        if (!isValidPrice(selectedProductDetails.price)) {
            alert('Price must be a positive real number.');
            return;
        }
        if (!isValidInventory(selectedProductDetails.inventory)) {
            alert('Inventory must be a positive integer.');
            return;
        }
        const formData = new FormData();
        formData.append('name', selectedProductDetails.name);
        formData.append('price', selectedProductDetails.price);
        formData.append('description', selectedProductDetails.description);
        formData.append('inventory', selectedProductDetails.inventory);
        formData.append('category', product.category.toString());
        formData.append('nonce', nonce);
        try {
            const response = await fetch(`https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/update-product/${updateProductId}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to update product');
            }
            alert('Product updated successfully');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error updating product');
        }
    };
    
    
    
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        if (!isValidName(product.name)) {
            alert('Category name must be 2-50 characters long and contain letters and numbers only.');
            return;
          }
        if (!isValidPrice(product.price)) {
            alert('Price must be a positive real number.');
            return;
        }
        if (!isValidInventory(product.inventory)) {
            alert('Inventory must be a positive integer.');
            return;
        }
        const formData = new FormData();
        formData.append('category', product.category);
        formData.append('name', product.name);
        formData.append('price', product.price);
        formData.append('description', product.description);
        formData.append('inventory', product.inventory);
        if (product.image) formData.append('image', product.image); 
        formData.append('nonce', nonce);


        try {
            const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/add-product', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.text(); // Assuming the response is text
            alert(data);
            setProduct({
                ...product,
                category: '',
                name: '',
                price: '',
                description: '',
                inventory: '',
                image: null,
                imagePreviewUrl: null,
            });
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error adding product');
        }
    };


    const handleCategoryImageChange = (e) => {
        const file = e.target.files[0];
    
        if (file && file.type.startsWith('image/')) {
            setCategoryImage(file);
            setCategoryImagePreviewUrl(URL.createObjectURL(file));
        } else {
            alert('Only image files are allowed.');
            e.target.value = null;
        }
    };
    

    const handleImageChange = (e) => {
        const file = e.target.files[0]; // Get the selected file
    
        // Check if the file is an image
        if (file && file.type.startsWith('image/')) {
            setProduct({ ...product, image: file });
        } else {
            alert('Only image files are allowed.');
            // Reset the file input if the file is not an image
            e.target.value = null;
            // Optionally, reset the image in the product state if you're displaying a preview
            setProduct({ ...product, image: null });
        }
    };
    
    const navigate = useNavigate();

    return (
        <div>
            <h1>Admin Panel</h1>
            <button onClick={() => navigate('/')}>Home</button>
            <button onClick={handleLogout}>Logout</button>
            <div className="page-selection">
                <button onClick={() => setCurrentPage('Categories')}>Categories</button>
                <button onClick={() => setCurrentPage('Products')}>Products</button>
                <button onClick={() => setCurrentPage('Orders')}>Orders</button>
            </div>
            <div className="container admin-panel">
            {currentPage === 'Categories' && (
            <div className="grouped-section">
                <div className="form-section">
                <h2 className="section-title">Add Category</h2>
                    <form onSubmit={handleCategorySubmit}>
                        <label htmlFor="name">Category Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            pattern="[A-Za-z0-9]{2,50}"
                            title="Category name must be 2-50 characters long and contain letters and numbers only."
                        />
                        <label htmlFor="categoryImage">Category Image:</label>
                        <input
                            type="file"
                            id="categoryImage"
                            name="categoryImage"
                            onChange={handleCategoryImageChange}
                        />
                        {categoryImagePreviewUrl && (
                            <div className="thumbnail-preview">
                                <img src={categoryImagePreviewUrl} alt="Category Thumbnail Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                            </div>
                        )}
                        <input type="hidden" name="nonce" value={nonce} />
                        <input type="submit" value="Add Category" />
                    </form>
                </div>
                <div className="form-section">
                <h2 className="section-title">Delete Category</h2>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.catid} value={category.catid}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <input type="hidden" name="nonce" value={nonce} />
                    <button onClick={deleteCategory}>Delete Category</button>
                    </div>
                    <div className="form-section">
                    <h2 className="section-title">Update Category Image</h2>
                    <form onSubmit={handleUpdateCategorySubmit}>
                        <select
                            value={updateCategoryId}
                            onChange={(e) => setUpdateCategoryId(e.target.value)}
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.catid} value={category.catid}>{category.name}</option>
                            ))}
                        </select>
                        <label htmlFor="categoryImage">Category Image:</label>
                        <input
                            type="file"
                            onChange={handleNewCategoryImageChange}
                        />
                        {newCategoryImagePreviewUrl && (
                            <div className="thumbnail-preview">
                                <img src={newCategoryImagePreviewUrl} alt="New Category Thumbnail Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                            </div>
                        )}
                        <input type="hidden" name="nonce" value={nonce} />
                        <button type="submit">Update Category Image</button>
                    </form>
                </div>
                </div>
                )}
                {currentPage === 'Products' && (
                <div className="grouped-section">
                <div className="form-section">
                <h2 className="section-title">Add Product</h2>
                    <form onSubmit={handleProductSubmit} encType="multipart/form-data">
                        <label htmlFor="category">Category:</label>
                        <select
                            id="category"
                            name="category"
                            required
                            value={product.category}
                            onChange={(e) => setProduct({ ...product, category: e.target.value })}
                        >
                            {categories.map((category) => (
                                <option key={category.catid} value={category.catid}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <label htmlFor="name">Product Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={product.name}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                            pattern="[A-Za-z0-9]{2,50}"
                            title="Product name must be 2-50 characters long and contain letters and numbers only."
                        />
                        <label htmlFor="price">Price:</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            required
                            min="0.01"
                            step="0.01"
                            value={product.price}
                            onChange={(e) => setProduct({ ...product, price: e.target.value })}
                        />
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            value={product.description}
                            onChange={(e) => setProduct({ ...product, description: e.target.value })}
                        />
                        <label htmlFor="inventory">Inventory:</label>
                        <input
                            type="number"
                            id="inventory"
                            name="inventory"
                            required
                            min="0"
                            step="1"
                            value={product.inventory}
                            onChange={(e) => setProduct({ ...product, inventory: e.target.value })}
                        />

                        <label htmlFor="image">Image:</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                        />
                        {
                            product.image && (
                                <div className="thumbnail-preview">
                                    <img src={URL.createObjectURL(product.image)} alt="Thumbnail preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                                </div>
                            )
                        }
                        <input type="hidden" name="nonce" value={nonce} />
                        <input type="submit" value="Add Product" />
                    </form>
                </div>
                {/* New form section for Delete Product */}
                <div className="form-section">
                <h2 className="section-title">Delete Product</h2>
                    <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                            <option key={product.pid} value={product.pid}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    <input type="hidden" name="nonce" value={nonce} />
                    <button onClick={deleteProduct}>Delete Product</button>
                </div>
                <div className="form-section">
                <h2 className="section-title">Update Product</h2>
                <form onSubmit={handleUpdateProductSubmit}>
                <label htmlFor="productSelection">Select Product:</label>
                <select
                    id="productSelection"
                    value={updateProductId}
                    onChange={(e) => {
                        setupdateProductId(e.target.value);
                        const selectedProduct = products.find(product => product.pid.toString() === e.target.value);
                        if (selectedProduct) {
                            setSelectedProductDetails({
                                name: selectedProduct.name,
                                price: selectedProduct.price,
                                description: selectedProduct.description,
                                inventory: selectedProduct.inventory,
                            });                
                        }
                    }}
                    
                >
                    <option value="">Select a Product</option>
                    {products.map((product) => (
                        <option key={product.pid} value={product.pid}>{product.name}</option>
                    ))}
                </select>
                    <label htmlFor="updateProductPrice">Price:</label>
                    <input
                        type="number"
                        id="updateProductPrice"
                        name="updateProductPrice"
                        value={selectedProductDetails.price}
                        required
                        min="0.01"
                        step="0.01"
                        onChange={(e) => setSelectedProductDetails({ ...selectedProductDetails, price: e.target.value })}
                    />
                    <label htmlFor="updateProductDescription">Description:</label>
                    <textarea
                        id="updateProductDescription"
                        name="updateProductDescription"
                        value={selectedProductDetails.description}
                        onChange={(e) => setSelectedProductDetails({ ...selectedProductDetails, description: e.target.value })}
                    />
                    <label htmlFor="updateProductInventory">Inventory:</label>
                    <input
                        type="number"
                        id="updateProductInventory"
                        name="updateProductInventory"
                        value={selectedProductDetails.inventory}
                        required
                        min="0"
                        step="1"
                        onChange={(e) => setSelectedProductDetails({ ...selectedProductDetails, inventory: e.target.value })}
                    />
                    <input type="submit" value="Update Product" />
                </form>
                </div>

                </div>
                )}
                {currentPage === 'Orders' && (
                <div className="grouped-section">
                    <div>
            <h1>Orders</h1>
            {orders.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>UUID</th>
                            <th>Username</th>
                            <th>Payment Status</th>
                            <th>Product List</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.UUID}>
                                <td>{order.UUID}</td>
                                <td>{order.username}</td>
                                <td>{order.orderDetails ? 'Completed' : 'Pending'}</td>
                                <td>
                                    {order.orderDetails ? (
                                        <ul>
                                            {order.orderDetails.purchase_units[0].items.map((item, index) => (
                                                <li key={index}>{`${item.name} (Quantity: ${item.quantity})`}</li>
                                            ))}
                                        </ul>
                                    ) : 'N/A'}
                                </td>
                                <td>{order.orderDetails ? `$${order.totalAmount}` : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No orders found.</p>
            )}
        </div>
                </div>
                )}
            </div>
            
        </div>
    );
};

export default AdminPanel;
