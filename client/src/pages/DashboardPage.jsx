import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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

    if (loading) return <div className="text-center pt-20 text-white">Loading your Dashboard...</div>;

    const heatmapDays = stats?.heatmapData || [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 text-white">
            <h1 className="text-4xl font-extrabold mb-8 tracking-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Dashboard & Learning Insights
            </h1>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg flex flex-col justify-between">
                    <span className="text-sm font-semibold text-purple-200 uppercase tracking-wider">Problems Solved</span>
                    <span className="text-5xl font-extrabold mt-4 text-white">{stats?.solvedCount || 0}</span>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg flex flex-col justify-between">
                    <span className="text-sm font-semibold text-purple-200 uppercase tracking-wider">Total Submissions</span>
                    <span className="text-5xl font-extrabold mt-4 text-white">{stats?.totalSubmissions || 0}</span>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg flex flex-col justify-between">
                    <span className="text-sm font-semibold text-purple-200 uppercase tracking-wider">Acceptance Rate</span>
                    <span className="text-5xl font-extrabold mt-4 text-green-400">{stats?.acceptanceRate || 0}%</span>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg flex flex-col justify-between">
                    <span className="text-sm font-semibold text-purple-200 uppercase tracking-wider">Current Streak</span>
                    <span className="text-5xl font-extrabold mt-4 text-orange-400">🔥 {stats?.streak || 0} days</span>
                </div>
            </div>

            {/* Middle Grid - Heatmap & Language Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                
                {/* Heatmap Section */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Submission Activity (Last 30 Days)</h2>
                    <div className="flex flex-wrap gap-2 mt-4 p-4 bg-black/20 rounded-lg">
                        {Array.from({ length: 30 }).map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (29 - i));
                            const dateStr = date.toISOString().split('T')[0];
                            const dayData = heatmapDays.find(d => d.date === dateStr);
                            const count = dayData ? dayData.count : 0;
                            
                            let color = 'bg-white/10';
                            if (count > 0 && count <= 2) color = 'bg-purple-900';
                            else if (count > 2 && count <= 5) color = 'bg-purple-600';
                            else if (count > 5) color = 'bg-purple-300';

                            return (
                                <div 
                                    key={i} 
                                    className={`w-8 h-8 rounded ${color} flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 cursor-pointer`}
                                    title={`${dateStr}: ${count} submission(s)`}
                                >
                                    {count > 0 ? count : ''}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Languages Section */}
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Languages Used</h2>
                    <div className="space-y-4">
                        {Object.entries(stats?.languageStats || {}).length > 0 ? (
                            Object.entries(stats?.languageStats).map(([lang, count]) => (
                                <div key={lang} className="flex justify-between items-center">
                                    <span className="capitalize font-mono">{lang}</span>
                                    <span className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded text-sm font-semibold">{count} submission(s)</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400 text-center py-6 text-sm">No submissions recorded.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Grid - Topic stats & AI Learning Coach */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Topic stats */}
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Topics Solved</h2>
                    <div className="space-y-4">
                        {Object.entries(stats?.topicStats || {}).length > 0 ? (
                            Object.entries(stats?.topicStats).map(([topic, count]) => (
                                <div key={topic} className="flex flex-col">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{topic}</span>
                                        <span className="font-semibold">{count} Solved</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-purple-500 to-violet-300 h-full rounded-full" style={{ width: `${Math.min(100, count * 20)}%` }}></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-400 text-center py-6 text-sm">No solved problems recorded.</div>
                        )}
                    </div>
                </div>

                {/* AI Learning Coach Panel */}
                <div className="bg-gradient-to-br from-purple-950/40 to-violet-900/40 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 shadow-2xl flex flex-col">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>🤖</span> AI Learning Coach
                    </h2>
                    
                    {!aiCoach ? (
                        <div className="flex-grow flex flex-col items-center justify-center py-10 text-center">
                            <p className="text-gray-300 mb-6 text-sm max-w-sm">
                                Let the AI evaluate your submission history and formulate a personalized practice strategy.
                            </p>
                            <Button 
                                onClick={handleAskCoach} 
                                disabled={loadingCoach}
                                className="bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 font-bold px-6 py-2 shadow-lg"
                            >
                                {loadingCoach ? 'Analyzing Performance...' : 'Generate Learning Roadmap'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                    <h4 className="text-xs font-bold text-green-300 uppercase">Strong Topics</h4>
                                    <p className="text-sm mt-1">{aiCoach.stats.strongTopics.join(', ') || 'Keep solving to identify!'}</p>
                                </div>
                                <div className="flex-1 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    <h4 className="text-xs font-bold text-red-300 uppercase">Weak Topics</h4>
                                    <p className="text-sm mt-1">{aiCoach.stats.weakTopics.join(', ') || 'None found (Great job!)'}</p>
                                </div>
                            </div>
                            <div className="bg-black/35 rounded-lg p-5 overflow-y-auto max-h-[300px] prose prose-invert prose-sm text-gray-200">
                                <pre className="whitespace-pre-wrap font-sans text-sm">{aiCoach.coachAdvice}</pre>
                            </div>
                            <Button 
                                onClick={handleAskCoach} 
                                disabled={loadingCoach}
                                variant="outline"
                                className="mt-4 border-purple-500/30 text-purple-200 hover:bg-purple-950/20 text-xs self-end"
                            >
                                {loadingCoach ? 'Analyzing...' : 'Refresh Coach Advice'}
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
