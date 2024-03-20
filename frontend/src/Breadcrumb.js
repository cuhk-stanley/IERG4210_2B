import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Breadcrumb = ({ items }) => {
    const navigate = useNavigate(); // Use the useNavigate hook

    const handleNavigation = (path) => {
        navigate(path); // Use navigate to change the path
    };

    return (
        <nav aria-label="breadcrumb" style={{ padding: '10px' }}>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center' }}>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index !== 0 && <li style={{ margin: '0 10px' }}>/</li>}
                        <li style={{ cursor: 'pointer' }} onClick={() => handleNavigation(item.path)}>
                            {/* Replace the <a> tag to avoid default navigation */}
                            <span>{item.label}</span>
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
