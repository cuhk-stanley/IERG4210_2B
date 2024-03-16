import React from 'react';

const Breadcrumb = ({ items }) => {
    return (
        <nav aria-label="breadcrumb" style={{ padding: '10px' }}>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center' }}>
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index !== 0 && <li style={{ margin: '0 10px' }}>/</li>}
                        <li>
                            <a href={item.path}>{item.label}</a>
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};


export default Breadcrumb;
