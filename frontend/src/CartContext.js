import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    useEffect(() => {
        // Update localStorage when cart changes
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart((prevCart) => {
            const existingProductIndex = prevCart.findIndex((item) => item.pid === product.pid);
            if (existingProductIndex > -1) {
                // Update quantity if product already exists
                const updatedCart = [...prevCart];
                updatedCart[existingProductIndex].quantity += quantity;
                return updatedCart;
            } else {
                // Add new product to cart
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    const removeFromCart = (pid) => {
        setCart((prevCart) => prevCart.filter((item) => item.pid !== pid));
    };

    const updateQuantity = (pid, quantity) => {
        setCart((prevCart) =>
            prevCart.map((item) => (item.pid === pid ? { ...item, quantity: Math.max(0, quantity) } : item))
        );
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };


const checkoutCart = async () => {
    const total = calculateTotal();
    const isConfirmed = window.confirm(`Confirm to checkout? Total price: $${total}`);
    if (!isConfirmed) {
        return;
    }

    try {
        const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ products: cart }),
        });

        if (!response.ok) {
            throw new Error('Checkout failed');
        }

        alert(await response.text());
        setCart([]); // Clear the cart after successful checkout
    } catch (error) {
        alert(error.message);
    }
};


    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, calculateTotal, checkoutCart }}>
            {children}
        </CartContext.Provider>
    );
};
