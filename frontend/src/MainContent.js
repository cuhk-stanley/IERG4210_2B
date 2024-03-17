import React, { useState, useEffect } from 'react';
import Breadcrumb from './Breadcrumb';
import ImageWithFallback from './ImageWithFallback';
import './maincontent.css';

const MainContent = () => {
    const [categories, setCategories] = useState([]);
    const breadcrumbItems = [{ label: 'Home', path: '/' }];

    const handleCategoryClick = (catId) => {
        window.location = `${catId}`;
    };
    

    useEffect(() => {
        fetch('http://localhost:8000/categories')
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.error('Error fetching categories:', error));
    }, []);

    return (
        <main>
            <div>
            <Breadcrumb items={breadcrumbItems} />
            {/* Rest of your homepage content */}
            </div>
            <section className="category">
                <h2>Categories</h2>
                <div className="category-list">
                {categories.map((category) => (
                    <div className="category-item" key={category.catid} onClick={() => handleCategoryClick(category.catid)}>
                            <h3>{category.name}</h3>
                            <div className="bottom-image">
                            <ImageWithFallback imageName={category.name} alt={category.name} />
                            </div>
                    </div>
                ))}
                </div>
            </section>
        </main>
    );
};

export default MainContent;
