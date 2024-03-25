import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import ImageWithFallback from './ImageWithFallback';
import { useCart } from './CartContext'; // Import useCart hook
import './ProductPage.css';

const ProductPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);

    const { addToCart } = useCart(); // Use the addToCart function from CartContext

    const handleAddToCart = () => {
        if (product) {
            addToCart({ ...product, pid: productId }, 1); // Assuming product object has all necessary info
            alert(`${product.name} added to cart!`);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/product/${productId}`);
                const data = await response.json();
                setProduct(data);
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        if (productId) fetchData();
    }, [productId]);

    if (!product) {
        return <div>Loading...</div>;
    }

    const breadcrumbItems = [
        { label: 'Home', path: '/' },
        { label: product.categoryName, path: `/${product.categoryId}` },
        { label: product.name, path: `/product/${productId}` },
    ];

    return (
        <div className="product-container">
            <Breadcrumb items={breadcrumbItems} />
            <div className="product-layout">
                <div className="product-image">
                    <ImageWithFallback imageName={product.image} alt={product.name} />
                </div>
                <div className="product-details">
                    <h2>{product.name}</h2>
                    <p>Description: {product.description}</p>
                    <p>Price: ${product.price}</p>
                    
                    {product.inventory <= 3 ? (
                        <p style={{color: 'red'}}>Inventory: Only {product.inventory} left!</p>
                    ) : (
                        <p>Inventory: {product.inventory}</p>
                    )}
                    <button onClick={handleAddToCart}>Add to Cart</button>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
