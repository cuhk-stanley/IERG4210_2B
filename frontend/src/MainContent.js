import React, { useState, useEffect } from 'react';
import Breadcrumb from './Breadcrumb';
import ImageWithFallback from './ImageWithFallback';
import './maincontent.css';

import { useNavigate } from 'react-router-dom';

const MainContent = () => {
    const [categories, setCategories] = useState([]);
    const breadcrumbItems = [{ label: 'Home', path: '/' }];
    const navigate = useNavigate();  // Using useNavigate hook

    const handleCategoryClick = (catId) => {
        navigate(`/${catId}`);  // Navigating without reloading the page
    };    

    useEffect(() => {
        fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/categories')
            .then(response => response.json())
            .then(data => {
                setCategories(data);
            })
            .catch(error => console.error('Error fetching categories:', error));
    }, []);
    

    return (
        <main>
            <div>
            <Breadcrumb items={breadcrumbItems} />
            </div>
            <section className="category">
                <h2>Categories</h2>
                <div className="category-list">
                {categories.map((category) => (
                    <div className="category-item" key={category.catid} onClick={() => handleCategoryClick(category.catid)}>
                            <h3>{category.name}</h3>
                            <div className="bottom-image">
                            <ImageWithFallback imageName={category.image} alt={category.name} />
                            </div>
                    </div>
                ))}
                </div>
            </section>
        </main>
    );
};

export default MainContent;
