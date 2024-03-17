import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart} from './CartContext'; // Adjust the path as necessary

function Header() {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, calculateTotal, checkoutCart  } = useCart();
    const goToAdminPanel = () => {
        navigate('/admin'); // Assuming your AdminPanel route is '/admin'
    };

    const handleQuantityChange = (pid, quantity) => {
        updateQuantity(pid, quantity);
    };

    const handleRemoveItem = (pid) => {
        removeFromCart(pid);
    };

    return (
        <header>
            <h1>IERG4210 phase_2 Ecommerce Site</h1>
            <div className="shopping-cart">
                <span><img src={`/image/cart.png`} alt="Cart" /></span>
                <div className="shopping-list">
                    {cart.map((item) => (
                        <div key={item.pid} className="cart-item">
                            <span>{item.name}</span>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.pid, parseInt(e.target.value))}
                            />
                            <button onClick={() => handleRemoveItem(item.pid)}>Remove</button>
                        </div>
                    ))}
                    <div>Total: ${calculateTotal()}</div>
                    <button className="checkout-button" onClick={checkoutCart}>Checkout</button>
                </div>
            </div>
            <button onClick={goToAdminPanel} className="admin-panel-button">Admin Panel</button>
        </header>
    );
}

export default Header;
