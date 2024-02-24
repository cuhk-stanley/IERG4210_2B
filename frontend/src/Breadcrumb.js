// Breadcrumb.js
import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
    return (
        <nav aria-label="breadcrumb" style={{ padding: '10px' }}>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center' }}>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index !== 0 && <li style={{ margin: '0 10px' }}>/</li>}
                        <li>
                            <Link to={item.path}>{item.label}</Link>
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
