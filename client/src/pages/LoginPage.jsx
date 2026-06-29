// client/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from "@/components/ui/button";

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { setAuthUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', formData);
            console.log('Login successful:', res.data);
            setAuthUser(res.data);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error.response?.data?.message);
            alert(`Login failed: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-purple-100 dark:border-purple-950/30 shadow-2xl shadow-purple-950/5 w-full max-w-md transition-all duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your AlgoNest account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/10 hover:shadow-purple-600/25">
                        Log In
                    </Button>
                </form>
                
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;