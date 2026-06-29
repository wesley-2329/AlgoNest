import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { authUser, logout, isLoading } = useContext(AuthContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            setShowDropdown(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-purple-100/80 dark:border-purple-950/30 transition-colors duration-300 shadow-sm shadow-purple-950/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Logo and Problems link */}
                    <div className="flex items-center space-x-10">
                        <Link
                            to="/"
                            className="text-2xl font-black text-purple-900 dark:text-purple-300 tracking-tight hover:opacity-90 transition-opacity"
                            style={{
                                fontFamily: 'Outfit, system-ui, sans-serif',
                            }}
                        >
                            Algo<span className="text-purple-600 dark:text-purple-400">Nest</span>
                        </Link>
                        
                        <div className="hidden md:flex items-center space-x-8">
                            <Link 
                                to="/problems" 
                                className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-semibold text-sm transition-colors"
                            >
                                Problems
                            </Link>
                            {authUser && (
                                <>
                                    <Link 
                                        to="/dashboard" 
                                        className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-semibold text-sm transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link 
                                        to="/pair-programming" 
                                        className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-semibold text-sm transition-colors"
                                    >
                                        Pair Programming
                                    </Link>
                                    <Link 
                                        to="/interview" 
                                        className="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-semibold text-sm transition-colors"
                                    >
                                        Interview Prep
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right side - Theme toggle and auth buttons */}
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        
                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMobileMenu}
                                className="text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-900 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {showMobileMenu ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </Button>
                        </div>

                        {/* Desktop auth buttons */}
                        <div className="hidden md:flex items-center space-x-3">
                            {authUser ? (
                                <div className="flex items-center space-x-4 relative">
                                    {authUser.role === 'admin' && (
                                        <Link 
                                            to="/admin/problems" 
                                            className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    
                                    {/* User dropdown menu */}
                                    <div className="relative">
                                        <button 
                                            onClick={toggleDropdown}
                                            className="flex items-center space-x-2 focus:outline-none text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-semibold text-sm transition-colors py-1.5 px-3 rounded-lg hover:bg-purple-50/50 dark:hover:bg-slate-900"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-600/10">
                                                {authUser.username[0].toUpperCase()}
                                            </div>
                                            <span>{authUser.username}</span>
                                            <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        
                                        {showDropdown && (
                                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1.5 bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-950/30 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <div className="flex items-center">
                                                        👤 Profile
                                                    </div>
                                                </Link>
                                                <div className="border-t border-purple-100 dark:border-purple-950/30 my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    disabled={isLoading}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 flex items-center"
                                                >
                                                    🚪 {isLoading ? 'Logging out...' : 'Logout'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        className="px-4 py-1.5 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-900 border border-purple-100 dark:border-purple-950/30 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className="px-4 py-1.5 text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile Navigation */}
            {showMobileMenu && (
                <div className="md:hidden border-t border-purple-100 dark:border-purple-950/30 bg-white/95 dark:bg-slate-950/95 py-3 px-4 space-y-2">
                    <Link
                        to="/problems"
                        className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-900"
                        onClick={() => setShowMobileMenu(false)}
                    >
                        Problems
                    </Link>
                    {authUser && (
                        <>
                            <Link
                                to="/dashboard"
                                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-900"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/pair-programming"
                                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-900"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Pair Programming
                            </Link>
                            <Link
                                to="/interview"
                                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-900"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Interview Prep
                            </Link>
                            <Link
                                to="/profile"
                                className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-900"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Profile
                            </Link>
                            <div className="border-t border-purple-100 dark:border-purple-950/30 my-2"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-red-600 hover:bg-purple-50 dark:hover:bg-slate-900"
                            >
                                Logout
                            </button>
                        </>
                    )}
                    {!authUser && (
                        <div className="pt-2 flex flex-col gap-2">
                            <Link
                                to="/login"
                                className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold border border-purple-100 text-slate-700"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;