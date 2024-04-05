import React, { createContext, useContext, useState, useEffect  } from 'react';
import { useCart } from './CartContext';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { clearCart } = useCart();


  const rehydrateUser = async () => {
    const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/validate-session', {
      credentials: 'include', // Important to include credentials for cookies to be sent
    });
    if (response.ok) {
      const data = await response.json();
        setUser(data.user);
    } else {
      console.error('Failed to rehydrate user session');
      setUser(null);
    }
  };

  useEffect(() => {
    rehydrateUser(); // Call this function when the component mounts
  }, []);

  const login = async (email, password, nonce) => {
    const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, nonce }),
      credentials: 'include'
    });

    const data = await response.json();
    if (response.ok) {
      setUser({
        adminFlag: data.user.adminFlag,
        email: data.user.email,
        userId: data.user.userId,
      });
    } else {
      throw new Error(data.message);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('https://secure.s18.ierg4210.ie.cuhk.edu.hk/api/logout', {
        method: 'POST',
        credentials: 'include' // Ensure cookies are sent with the request
      });

      if (response.ok) {
        setUser(null);
        clearCart();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    rehydrateUser,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
