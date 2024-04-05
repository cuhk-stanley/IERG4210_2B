import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from './CartContext';
import 'react-toastify/dist/ReactToastify.css';

const PayPalCheckoutButton = ({ cartItems }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { clearCart } = useCart();

    function formatOrderDetails(details) {
      return {
          purchase_units: details.purchase_units.map(unit => ({
              amount: {
                  currency_code: unit.amount.currency_code,
                  value: unit.amount.value,
                  breakdown: {
                      item_total: {
                          currency_code: unit.amount.breakdown.item_total.currency_code,
                          value: unit.amount.breakdown.item_total.value,
                      },
                  },
              },
              items: unit.items.map(item => ({
                  name: item.name,
                  unit_amount: {
                      currency_code: item.unit_amount.currency_code,
                      value: item.unit_amount.value,
                  },
                  quantity: item.quantity,
              })),
              custom_id: unit.custom_id,
              invoice_id: unit.invoice_id,
          })),
      };
  }
  
    const createOrder = async (data, actions) => {
        if (!user) {
          throw new Error('User not logged in');
        }
        // Updated to point to the new '/my-server/create-order' endpoint
        const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/my-server/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Assuming the cartItems structure matches what the backend expects
          body: JSON.stringify({ cartItems, username: user.email, }),
        });
    
        if (!response.ok) {
            throw new Error('Failed to create order on server');
        }
        const jsonResponse = await response.json();
    
        const { uuid, orderDetails } = jsonResponse;
        localStorage.setItem('orderUUID', uuid);
        return actions.order.create(orderDetails);
    };
    
    const onApprove = (data, actions) => {
      const orderUUID = localStorage.getItem('orderUUID');
      return actions.order.capture().then(async (details) => { 
          const formattedDetails = formatOrderDetails(details);
          const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/my-server/save-order', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  orderID: orderUUID,  // Use the stored UUID
                  details: formattedDetails,
                  products: cartItems,
              }),
          });
  
          if (!response.ok) {
              throw new Error('Payment approval failed');
          }
        clearCart();
        alert('Payment successful! Redirecting to home page.');
          navigate('/');  // Navigate to the desired route after successful payment
      });
  };
  
  
    
    const onCancel = async (data) => {
      const orderUUID = localStorage.getItem('orderUUID');
      if (orderUUID) {
          const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/my-server/cancel-order', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ uuid: orderUUID }), // Use the stored UUID
          });

          if (!response.ok) {
              console.error('Failed to cancel order on server');
              // Handle error...
          }
      }

      console.log('Payment cancelled:', data);
  };
    
    const onError = (err) => {
        console.error('Payment Error:', err);
        // Optionally, handle the error in your backend
    };

    return (
        <PayPalScriptProvider options={{ "client-id": "AaBxIZT53nOK-gUEkj_MzESj_Kndew_gLUO7ub_jnR0-0inPyDTC326BJfCADY3mU50Z7hAVveOx3kYR" }}>
            <PayPalButtons
                createOrder={(data, actions) => createOrder(data, actions)}
                onApprove={(data, actions) => onApprove(data, actions)}
                onCancel={(data) => onCancel(data)}
                onError={(err) => onError(err)}
            />
        </PayPalScriptProvider>
    );
};

export default PayPalCheckoutButton;
