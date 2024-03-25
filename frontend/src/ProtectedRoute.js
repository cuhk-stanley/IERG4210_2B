import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, rehydrateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      await rehydrateUser(); // Rehydrate user session
      setIsLoading(false);
    };

    checkUser();
  }, [rehydrateUser]);

  if (isLoading) {
    return <div>Loading...</div>; // Or some loading spinner
  }

  if (!user || user.adminFlag !== 1) {
    alert('Please log in as an administrator.');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;