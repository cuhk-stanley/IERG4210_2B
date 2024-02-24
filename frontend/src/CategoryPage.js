import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import ImageWithFallback from './ImageWithFallback';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const [categoryNameDisplay, setCategoryNameDisplay] = useState('');
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all categories then filter to find the matching one by ID
        const fetchAllCategories = async () => {
            try {
                const response = await fetch(`http://localhost:8000/categories`);
                const categories = await response.json();
                const category = categories.find(category => category.catid.toString() === categoryName);
                if (category) {
                    setCategoryNameDisplay(category.name);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        // Fetch Products by Category ID
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:8000/products/category/${categoryName}`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchAllCategories();
        fetchProducts();
    }, [categoryName]);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const breadcrumbItems = [
        { label: 'Home', path: '/' },
        { label: categoryNameDisplay, path: `/${categoryName}` },
    ];

    return (
        <div className="category-container">
            <Breadcrumb items={breadcrumbItems} />
            <h2>{categoryNameDisplay}</h2>
            <div className="products-list">
            {products.map((product) => (
            <div className="product-item" key={product.pid} onClick={() => handleProductClick(product.pid)} style={{cursor: 'pointer'}}>
                <h3>{product.name}</h3>
                {/* Use ImageWithFallback instead of a regular img tag */}
                <ImageWithFallback imageName={product.name} alt={product.name} />
                <p>Price: ${product.price}</p>
                <button>Add to Cart</button>
            </div>
            ))}
            </div>
        </div>
    );
};

export default CategoryPage;
