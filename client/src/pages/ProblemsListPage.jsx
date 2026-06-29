// client/src/pages/ProblemsListPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProblemsListPage = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await axios.get('/api/problems');
                setProblems(res.data);
            } catch (error) {
                console.error('Failed to fetch problems', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    if (loading) return <div className="text-center pt-20 text-purple-600 font-bold animate-pulse">Loading problems...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 text-slate-800 dark:text-white">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                    Algorithm Matrix
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Challenge yourself, track your growth, and unlock coding progress.
                </p>
            </div>

            {/* Problems Card Grid Container */}
            <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-purple-100/50 dark:divide-purple-950/20">
                        <thead className="bg-purple-50/55 dark:bg-purple-950/15">
                            <tr>
                                <th className="text-left py-4 px-6 uppercase font-bold text-xs tracking-wider text-purple-900 dark:text-purple-300">Title</th>
                                <th className="text-left py-4 px-6 uppercase font-bold text-xs tracking-wider text-purple-900 dark:text-purple-300">Difficulty</th>
                                <th className="text-left py-4 px-6 uppercase font-bold text-xs tracking-wider text-purple-900 dark:text-purple-300">Tags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100/30 dark:divide-purple-950/10 text-slate-700 dark:text-slate-300">
                            {problems.length > 0 ? (
                                problems.map((problem) => (
                                    <tr key={problem._id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/10 transition-colors">
                                        <td className="py-4 px-6">
                                            <Link 
                                                to={`/problems/${problem._id}`} 
                                                className="text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 font-bold text-sm transition-colors"
                                            >
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                problem.difficulty === 'Easy' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : problem.difficulty === 'Medium' 
                                                        ? 'bg-yellow-100 text-yellow-700' 
                                                        : 'bg-red-100 text-red-700'
                                            }`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-wrap gap-1.5">
                                                {problem.tags.map((tag, idx) => (
                                                    <span 
                                                        key={idx} 
                                                        className="bg-purple-100/60 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-900/50 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-8 px-6 text-center text-slate-400">
                                        No problems loaded. Run seed script or contact admin.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProblemsListPage;