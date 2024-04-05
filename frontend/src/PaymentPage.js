import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PayPalCheckoutButton from './PayPalButton';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { total, cart } = location.state; // Retrieve total and cart from state

    return (
        <div>
            <button onClick={() => navigate('/')}>Home</button>
            <h2>Complete Your Payment</h2>
            <PayPalCheckoutButton total={total} cartItems={cart} />
        </div>
    );
};

export default PaymentPage;
