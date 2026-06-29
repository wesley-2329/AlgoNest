// client/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/register', formData);
            console.log('Registration successful:', res.data);
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error.response?.data?.message);
            alert(`Registration failed: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-purple-100 dark:border-purple-950/30 shadow-2xl shadow-purple-950/5 w-full max-w-md transition-all duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start your coding journey with AlgoNest</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Username</label>
                        <input
                            type="text"
                            name="username"
                            onChange={handleChange}
                            placeholder="codemaster"
                            className="w-full px-4 py-2.5 border border-purple-100 dark:border-purple-900/30 text-slate-900 dark:text-white bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/80 focus:border-transparent text-sm transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2.5 border border-purple-100 dark:border-purple-900/30 text-slate-900 dark:text-white bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/80 focus:border-transparent text-sm transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Password</label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 border border-purple-100 dark:border-purple-900/30 text-slate-900 dark:text-white bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/80 focus:border-transparent text-sm transition-all"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/10 hover:shadow-purple-600/25 pt-2">
                        Sign Up
                    </Button>
                </form>
                
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;