// client/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react'; // Import useContext
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthContext } from '../context/AuthContext'; // Import our context

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { setAuthUser } = useContext(AuthContext); // Get the setter function
    const navigate = useNavigate(); // Hook for navigation

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', formData);
            console.log('Login successful:', res.data);
            setAuthUser(res.data); // <-- UPDATE GLOBAL STATE
            navigate('/'); // <-- REDIRECT TO HOME PAGE
        } catch (error) {
            console.error('Login error:', error.response.data.message);
            alert(`Login failed: ${error.response.data.message}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Password</label>
                    <input
                        type="password"
                        name="password"
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Login
                </button>
                
                <p className="text-center text-gray-600 text-sm mt-4">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;