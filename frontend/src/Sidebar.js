import React, { useState, useEffect } from 'react';
import './sidebar.css';

const Sidebar = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/categories')
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.error('Error fetching categories:', error));
    }, []);

    return (
        <aside className="sidebar">
            <h2>Categories</h2>
            <ul className="category-list">
                {categories.map(category => (
                    <li key={category.catid}>
                        {/* Replace Link with an <a> tag */}
                        <a href={`/${category.catid}`}>{category.name}</a>
                    </li>
                ))}
            </ul>
        </aside>
    );
};


export default Sidebar;
