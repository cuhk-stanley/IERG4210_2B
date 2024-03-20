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
    const {logout } = useAuth();

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
    }, []);
    useEffect(() => {
        return () => {
            if (product.image) {
                URL.revokeObjectURL(product.image);
            }
        };
    }, [product.image]);

    const handleLogout = () => {
        logout();
        navigate('/');
      };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8000/categories');
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
        const response = await fetch('http://localhost:8000/products');
        const data = await response.json();
        setProducts(data);
    };


    const deleteCategory = async () => {
        if (window.confirm(`Are you sure you want to delete this category?`)) {
            try {
                console.log(selectedCategoryId);
                const response = await fetch(`http://localhost:8000/delete-category/${selectedCategoryId}`, {
                    method: 'DELETE',
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
                console.log(selectedProductId);
                const response = await fetch(`http://localhost:8000/delete-product/${selectedProductId}`, {
                    method: 'DELETE',
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
        console.log("Updating category with ID:", updateCategoryId); // Check selected category ID
        console.log("Image selected for update:", newCategoryImage); // Log image info
    
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
    
        try {
            const response = await fetch(`http://localhost:8000/update-category/${updateCategoryId}`, {
                method: 'POST',
                body: formData,
            });
    
            const result = await response.json();
            console.log("Response from server:", result); // Log server response
            alert(result.message);
            fetchCategories();
    
        } catch (error) {
            console.error("Failed to update category", error);
            alert("Failed to update category. See console for more details.");
        }
    };
    
    

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', categoryName);
        if (categoryImage) formData.append('image', categoryImage);
        try {
            const response = await fetch('http://localhost:8000/add-category', {
                method: 'POST',
                body: formData,
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
        const formData = new FormData();
        formData.append('name', selectedProductDetails.name);
        formData.append('price', selectedProductDetails.price);
        formData.append('description', selectedProductDetails.description);
        formData.append('inventory', selectedProductDetails.inventory);
        try {
            const response = await fetch(`http://localhost:8000/update-product/${updateProductId}`, {
                method: 'PUT',
                body: formData,
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
        const formData = new FormData();
        formData.append('category', product.category);
        formData.append('name', product.name);
        formData.append('price', product.price);
        formData.append('description', product.description);
        if (product.image) formData.append('image', product.image);
        formData.append('inventory', product.inventory); // Add this line


        try {
            const response = await fetch('http://localhost:8000/add-product', {
                method: 'POST',
                body: formData,
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
            <button onClick={() => navigate('/home')}>Home</button>
            <button onClick={handleLogout}>Logout</button>
            <div className="container admin-panel">
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
        <button type="submit">Update Category Image</button>
    </form>
</div>


                </div>
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
                        />
                        <label htmlFor="price">Price:</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            required
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
                console.log(selectedProduct);
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
            onChange={(e) => setSelectedProductDetails({ ...selectedProductDetails, inventory: e.target.value })}
        />
        <input type="submit" value="Update Product" />
    </form>
</div>

                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
