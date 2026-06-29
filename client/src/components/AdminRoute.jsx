// client/src/components/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = () => {
    const { authUser } = useContext(AuthContext);

    // If the user is logged in and their role is 'admin', render the child components (Outlet).
    // Otherwise, redirect them to the home page.
    return authUser && authUser.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;