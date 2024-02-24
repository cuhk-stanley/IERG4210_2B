import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import ImageWithFallback from './ImageWithFallback';
import './ProductPage.css';

const ProductPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/product/${productId}`);
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
                <ImageWithFallback imageName={product.name} alt={product.name} />
                </div>
                <div className="product-details">
                    <h2>{product.name}</h2>
                    <p>Description: {product.description}</p>
                    <p>Price: ${product.price}</p>
                    
                    {product.inventory <= 3 ? (
                            <p style={{color: 'red'}}>Inventory: Only {product.inventory} left!</p>
                        ) : (
                            <p>Inventory: {product.inventory}</p> // Or simply don't display anything
                        )}
                    <button onClick={() => alert('Add to Cart functionality not implemented')}>Add to Cart</button>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
