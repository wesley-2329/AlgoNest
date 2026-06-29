import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
export const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        // This function will run once when the component mounts
        const fetchCurrentUser = async () => {
            try {
                // Check if a user is already logged in
                const res = await axios.get('/api/auth/me');
                setAuthUser(res.data);
            } catch (error) {
                // No user is logged in, or the token is invalid
                setAuthUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []); // The empty array ensures this runs only once on initial load

    // Don't render the app until we've checked for a user
    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};