// Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
function Header() {
    const navigate = useNavigate();
    const goToAdminPanel = () => {
        navigate('/admin'); // Assuming your AdminPanel route is '/admin'
    };
    return (
        <header>
            <h1>IERG4210 phase_2 Ecommerce Site</h1>
            <div className="shopping-cart">
                <span><img src={`/image/cart.png`} alt="Cart" /></span>
                <div className="shopping-list">
                    <div className="cart-item">
                        <span>Product Name <input type="number" name="quantity" value="1" /></span>
                    </div>
                    <button className="checkout-button">Checkout</button>
                </div>
            </div>
            <button onClick={goToAdminPanel} className="admin-panel-button">Admin Panel</button> {/* Add this button */}
        </header>
    );
}

export default Header;