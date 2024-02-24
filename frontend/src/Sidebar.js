import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
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
                        {/* Use Link component for navigation */}
                        <Link to={`/${category.catid}`}>{category.name}</Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
