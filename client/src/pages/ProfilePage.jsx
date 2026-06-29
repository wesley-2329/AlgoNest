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

    if (!authUser) return <div className="text-center pt-20 text-white">Please log in to view your profile.</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-white">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-8 mb-8">
                {/* Avatar */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center text-4xl font-extrabold shadow-lg">
                    {authUser.username[0].toUpperCase()}
                </div>
                
                {/* Details */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-extrabold mb-1 tracking-tight">{authUser.username}</h2>
                    <p className="text-purple-200 text-sm mb-4 font-mono">{authUser.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide border border-white/5">
                            Role: {authUser.role}
                        </span>
                        <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/10">
                            🔥 {stats?.streak || 0} Day Streak
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center shadow-lg">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2">Total Solved</h4>
                    <p className="text-4xl font-extrabold text-white">{stats?.solvedCount || 0}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center shadow-lg">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2">Attempts Made</h4>
                    <p className="text-4xl font-extrabold text-white">{stats?.totalSubmissions || 0}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center shadow-lg">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2">Platform Rank</h4>
                    <p className="text-4xl font-extrabold text-purple-300">Beta User</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
