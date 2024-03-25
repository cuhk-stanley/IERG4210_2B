import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import Breadcrumb from './Breadcrumb';
import ImageWithFallback from './ImageWithFallback';
import { useCart } from './CartContext';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const navigate = useNavigate(); // Use the useNavigate hook
    const [categoryNameDisplay, setCategoryNameDisplay] = useState('');
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1); // Track current page for pagination
    const { addToCart } = useCart();
    const loader = useRef(null); // Ref for the loader element

useEffect(() => {
    const fetchProducts = async () => {
        try {
            const response = await fetch(`https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/products/category/${categoryName}?page=${page}`);
            const data = await response.json();
            setProducts(data); // Set products directly instead of appending
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    if (categoryName) {
        // Clear the products list and reset the page number when the category changes
        setProducts([]);
        setPage(1);
        fetchProducts();
    }
}, [categoryName]); // Depend on categoryName to trigger the effect when it changes


    // Intersection Observer for infinite scrolling
    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '20px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver(handleObserver, options);
        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, []);

    const handleObserver = (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
            setPage(prevPage => prevPage + 1); // Load next page of products
        }
    };

    const handleAddToCart = (event, product) => {
        event.stopPropagation();
        event.preventDefault(); // To prevent navigating when clicking the button
        addToCart(product);
        alert(`${product.name} added to cart!`);
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`); // Use navigate for navigation
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
                    <div className="product-item" key={product.pid} onClick={() => handleProductClick(product.pid)} style={{ cursor: 'pointer' }}>
                        <h3>{product.name}</h3>
                        <ImageWithFallback imageName={product.image} alt={product.name} />
                        <p>Price: ${product.price}</p>
                        <button onClick={(e) => handleAddToCart(e, product)}>Add to Cart</button>
                    </div>
                ))}
                <div ref={loader} style={{ clear: 'both', textAlign: 'center', marginTop: '20px' }}>
                    Loading...
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
