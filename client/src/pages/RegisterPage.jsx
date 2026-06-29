import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    // State to hold the form data (username, email, password)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    // This function updates the state whenever you type in an input field
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // This function runs when you click the "Register" button
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the browser from reloading the page
        try {
            // Send the form data to your backend API endpoint
            // The Vite proxy redirects '/api/...' to 'http://localhost:5000/api/...'
            const res = await axios.post('/api/auth/register', formData);

            console.log('Registration successful:', res.data);
            alert('Registration successful!'); // Show a success message
            
        } catch (error) {
            // If the API returns an error (e.g., user already exists)
            console.error('Registration error:', error.response.data.message);
            alert(`Registration failed: ${error.response.data.message}`); // Show an error message
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
                
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-bold text-gray-700">Username</label>
                    <input
                        type="text"
                        name="username"
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                
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
                    Register
                </button>
                <p className="text-center text-gray-600 text-sm mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;