import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import './Header.css';
function Header() {
    const { cart, updateQuantity, removeFromCart, calculateTotal, checkoutCart } = useCart();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    

    const handleChangePassword = async () => {
        navigate('/change-password');
    };


    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleAdminPanel = async () => {
        navigate('/admin');
    };

    const handleOrders = () => {
        navigate('/orders');
    };

    const getWelcomeMessage = () => {
        if (!user) return 'Welcome, Guest';
        return user.adminFlag === 1 ? 'Welcome, Admin' : 'Welcome, User';
    };

      return (
        <header>
            <h1>IERG4210 Ecommerce Site</h1>
            <div className="header-right">
                <div className="user-info">
                    {getWelcomeMessage()}
                    <div className="user-actions">
                        {user ? (
                            <>
                                {user.adminFlag === 1 && ( <button onClick={handleAdminPanel} className="btn admin-panel-btn">Admin Panel</button> )}
                                <button onClick={handleOrders} className="btn orders-btn">My Orders</button>
                                <button onClick={handleLogout} className="btn log-out-btn">Logout</button>
                                <button onClick={handleChangePassword} className="btn change-password-btn">Change Password</button>
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
