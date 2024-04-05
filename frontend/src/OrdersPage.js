import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            if (user && user.email) {
                const response = await fetch(`https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/get-orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: user.email }),
                    credentials: 'include',
                });

                if (!response.ok) {
                    console.error('Failed to fetch orders:', response.statusText);
                    return;
                }

                const data = await response.json();
                setOrders(data.slice(0, 5));
            }
        };

        fetchOrders();
    }, [user]);

    return (
        <div>
            <h2>My Orders</h2>
            {orders.length > 0 ? (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Status</th>
                            <th>Products</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            let details = null;
                            try {
                                details = order.orderDetails ? JSON.parse(order.orderDetails) : null;
                            } catch (error) {
                                console.error('Error parsing order details:', error);
                            }

                            return (
                                <tr key={order.UUID}>
                                    <td>{order.UUID}</td>
                                    <td>{details ? 'Completed' : 'Pending'}</td>
                                    <td>
                                        {details ? (
                                            <ul>
                                                {details.purchase_units[0].items.map((item, index) => (
                                                    <li key={index}>
                                                        {item.name} - Quantity: {item.quantity} - Price: ${item.unit_amount.value}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : 'N/A'}
                                    </td>
                                    <td>{details ? `$${details.purchase_units[0].amount.value}` : 'N/A'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p>You have no orders.</p>
            )}
        </div>
    );
};

export default OrdersPage;
