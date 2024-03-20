import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './sidebar.css';

const Sidebar = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate(); // Use the useNavigate hook

    const handleCategoryClick = (catId) => {
        navigate(`/${catId}`); // Use navigate to change the path
    };

    useEffect(() => {
        fetch('http://localhost:8000/categories') // Updated to use the full path
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.error('Error fetching categories:', error));
    }, []);

    return (
        <aside className="sidebar">
            <h2>Categories</h2>
            <ul className="category-list">
                {categories.map(category => (
                    <li key={category.catid} onClick={() => handleCategoryClick(category.catid)} style={{ cursor: 'pointer' }}>
                        {/* Replace the <a> tag with a <span> or <div> that is clickable */}
                        <span>{category.name}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
