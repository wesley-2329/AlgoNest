// client/src/pages/ProfilePage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ProfilePage = () => {
    const { authUser } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileStats = async () => {
            try {
                const res = await axios.get('/api/users/dashboard-stats');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch profile stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileStats();
    }, []);

    if (!authUser) return <div className="text-center pt-20 text-purple-600 font-bold">Please log in to view your profile.</div>;
    if (loading) return <div className="text-center pt-20 text-purple-600 font-bold animate-pulse">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-slate-800 dark:text-white">
            {/* Profile Hero Header Card */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 flex flex-col md:flex-row items-center gap-8 mb-8 transition-all">
                {/* Avatar Icon */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 text-white flex items-center justify-center text-4xl font-extrabold shadow-lg shadow-purple-600/10">
                    {authUser.username[0].toUpperCase()}
                </div>
                
                {/* Details list */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">{authUser.username}</h2>
                    <p className="text-purple-600 dark:text-purple-400 text-sm font-mono font-bold mb-4">{authUser.email}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50 px-3.5 py-1 rounded-full text-xs font-bold capitalize tracking-wide shadow-sm">
                            Role: {authUser.role}
                        </span>
                        <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-3.5 py-1 rounded-full text-xs font-bold shadow-sm">
                            🔥 {stats?.streak || 0} Day Streak
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 text-center shadow-xl shadow-purple-950/5 hover:-translate-y-0.5 transition-transform duration-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Solved</h4>
                    <p className="text-4xl font-black text-purple-700 dark:text-purple-300">{stats?.solvedCount || 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 text-center shadow-xl shadow-purple-950/5 hover:-translate-y-0.5 transition-transform duration-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Submissions</h4>
                    <p className="text-4xl font-black text-purple-700 dark:text-purple-300">{stats?.totalSubmissions || 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 text-center shadow-xl shadow-purple-950/5 hover:-translate-y-0.5 transition-transform duration-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Platform Rank</h4>
                    <p className="text-4xl font-black text-purple-600 dark:text-purple-300">Pro Code</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
