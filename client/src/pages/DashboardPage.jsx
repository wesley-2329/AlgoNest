// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [aiCoach, setAiCoach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingCoach, setLoadingCoach] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get('/api/users/dashboard-stats');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleAskCoach = async () => {
        setLoadingCoach(true);
        try {
            const res = await axios.get('/api/ai/learning-coach');
            setAiCoach(res.data);
        } catch (error) {
            console.error('Failed to get coach feedback', error);
        } finally {
            setLoadingCoach(false);
        }
    };

    if (loading) return <div className="text-center pt-20 text-purple-600 font-bold animate-pulse">Loading dashboard analytics...</div>;

    const heatmapDays = stats?.heatmapData || [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 text-slate-800 dark:text-white">
            <h1 className="text-4xl font-extrabold mb-10 tracking-tight text-slate-900 dark:text-white">
                Dashboard & Insights
            </h1>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-200">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Problems Solved</span>
                    <span className="text-5xl font-black mt-4 text-purple-700 dark:text-purple-300">{stats?.solvedCount || 0}</span>
                </div>
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-200">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Submissions</span>
                    <span className="text-5xl font-black mt-4 text-purple-700 dark:text-purple-300">{stats?.totalSubmissions || 0}</span>
                </div>
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-200">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Acceptance Rate</span>
                    <span className="text-5xl font-black mt-4 text-emerald-600 dark:text-emerald-400">{stats?.acceptanceRate || 0}%</span>
                </div>
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 flex flex-col justify-between transition-transform hover:-translate-y-0.5 duration-200">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Streak</span>
                    <span className="text-5xl font-black mt-4 text-orange-500 dark:text-orange-400">🔥 {stats?.streak || 0} days</span>
                </div>
            </div>

            {/* Middle Grid - Heatmap & Language Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                
                {/* Heatmap Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5">
                    <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Submission Activity (Last 30 Days)</h2>
                    <div className="flex flex-wrap gap-2.5 mt-4 p-4 bg-purple-50/50 dark:bg-slate-950/40 rounded-xl border border-purple-100/50 dark:border-purple-950/20">
                        {Array.from({ length: 30 }).map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (29 - i));
                            const dateStr = date.toISOString().split('T')[0];
                            const dayData = heatmapDays.find(d => d.date === dateStr);
                            const count = dayData ? dayData.count : 0;
                            
                            let color = 'bg-purple-100/50 dark:bg-slate-800/40';
                            if (count > 0 && count <= 2) color = 'bg-purple-300 dark:bg-purple-900/60';
                            else if (count > 2 && count <= 5) color = 'bg-purple-500 dark:bg-purple-600/80';
                            else if (count > 5) color = 'bg-purple-700 dark:bg-purple-400';

                            return (
                                <div 
                                    key={i} 
                                    className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center text-xs font-bold transition-all hover:scale-110 cursor-pointer ${count > 0 ? 'text-white' : 'text-slate-400/80'}`}
                                    title={`${dateStr}: ${count} submission(s)`}
                                >
                                    {count > 0 ? count : ''}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Languages Section */}
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5">
                    <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Languages Distribution</h2>
                    <div className="space-y-4">
                        {Object.entries(stats?.languageStats || {}).length > 0 ? (
                            Object.entries(stats?.languageStats).map(([lang, count]) => (
                                <div key={lang} className="flex justify-between items-center p-3 bg-purple-50/40 dark:bg-slate-950/20 rounded-xl border border-purple-100/30 dark:border-purple-950/10">
                                    <span className="capitalize font-mono font-bold text-sm text-slate-800 dark:text-slate-200">{lang}</span>
                                    <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg text-xs font-bold">{count} sub(s)</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-400 dark:text-slate-500 text-center py-6 text-sm">No submissions recorded.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Grid - Topic stats & AI Learning Coach */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Topic stats */}
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5">
                    <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Topic Performance</h2>
                    <div className="space-y-5 mt-4">
                        {Object.entries(stats?.topicStats || {}).length > 0 ? (
                            Object.entries(stats?.topicStats).map(([topic, count]) => (
                                <div key={topic} className="flex flex-col">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{topic}</span>
                                        <span className="font-bold text-purple-700 dark:text-purple-400">{count} Solved</span>
                                    </div>
                                    <div className="w-full bg-purple-100/60 dark:bg-slate-800/40 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, count * 20)}%` }}></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-400 dark:text-slate-500 text-center py-10 text-sm">No solved topics. Start solving problems!</div>
                        )}
                    </div>
                </div>

                {/* AI Learning Coach Panel */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-100/50 dark:from-purple-950/15 dark:to-violet-900/10 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-900/45 shadow-xl shadow-purple-950/5 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                            <span>🤖</span> AI Learning Coach
                        </h2>
                        
                        {!aiCoach ? (
                            <div className="py-12 text-center flex flex-col items-center justify-center">
                                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm max-w-sm">
                                    Receive personalized strategy guidance, target problem recommendations, and concept highlights.
                                </p>
                                <Button 
                                    onClick={handleAskCoach} 
                                    disabled={loadingCoach}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md"
                                >
                                    {loadingCoach ? 'Analyzing History...' : 'Generate Roadmap'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/25">
                                        <h4 className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Strong Pillars</h4>
                                        <p className="text-xs font-semibold mt-1 text-slate-800 dark:text-slate-200">{aiCoach.stats.strongTopics.join(', ') || 'Solving to analyze...'}</p>
                                    </div>
                                    <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/25">
                                        <h4 className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Weak Areas</h4>
                                        <p className="text-xs font-semibold mt-1 text-slate-800 dark:text-slate-200">{aiCoach.stats.weakTopics.join(', ') || 'No weaknesses!'}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-950 rounded-xl p-4 overflow-y-auto max-h-[220px] border border-purple-900/30">
                                    <pre className="whitespace-pre-wrap font-sans text-xs text-purple-200 leading-relaxed">{aiCoach.coachAdvice}</pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {aiCoach && (
                        <Button 
                            onClick={handleAskCoach} 
                            disabled={loadingCoach}
                            variant="outline"
                            className="mt-4 border-purple-200 text-purple-700 dark:text-purple-300 dark:border-purple-800 text-xs self-end h-8 font-semibold"
                        >
                            {loadingCoach ? 'Syncing...' : 'Refresh Strategy'}
                        </Button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
