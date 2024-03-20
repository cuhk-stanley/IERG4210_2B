import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import './Header.css';
function Header() {
    const { cart, updateQuantity, removeFromCart, calculateTotal, checkoutCart } = useCart();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
      };

      return (
        <header>
            <h1>IERG4210 Ecommerce Site</h1>
            <div className="header-right">
                <div className="user-info">
                    Welcome, {user ? user.name : 'Guest'}
                    <div className="user-actions">
                        {user ? (
                            <>
                                <button onClick={handleLogout} className="btn log-out-btn">Logout</button>
                                <button onClick={() => navigate('/change-password')} className="btn change-password-btn">Change Password</button>
                            </>
                        ) : (
                            <button onClick={handleLogout} className="btn sign-in-btn">Login</button>
                        )}
                    </div>
                </div>
                <div className="shopping-cart">
                    <img src={`/image/cart.png`} alt="Cart" />
                    <div className="shopping-list">
                        {cart.map((item) => (
                            <div key={item.pid} className="cart-item">
                                <span>{item.name}</span>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.pid, parseInt(e.target.value))}
                                />
                                <button onClick={() => removeFromCart(item.pid)}>Remove</button>
                            </div>
                        ))}
                        <div>Total: ${calculateTotal()}</div>
                        <button className="checkout-button" onClick={checkoutCart}>Checkout</button>
                    </div>
                </div>
            </div>
        </header>
    );
    
    
}

export default Header;
