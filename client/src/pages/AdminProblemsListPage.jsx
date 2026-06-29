// client/src/pages/AdminProblemsListPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const AdminProblemsListPage = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchProblems();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                await axios.delete(`/api/problems/${id}`);
                alert('Problem deleted successfully!');
                fetchProblems();
            } catch (error) {
                console.error('Failed to delete problem', error);
                alert('Failed to delete problem.');
            }
        }
    };

    if (loading) return <div className="text-center pt-20 text-purple-600 font-bold animate-pulse">Loading admin problem set...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 text-slate-800 dark:text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                        Manage Problems
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Create, edit, and moderate challenge sets.
                    </p>
                </div>
                <Link to="/admin/add-problem">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl shadow-md transition-all">
                        ➕ Add New Problem
                    </Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-purple-100/50 dark:divide-purple-950/20">
                        <thead className="bg-purple-50/55 dark:bg-purple-950/15">
                            <tr>
                                <th className="text-left py-4 px-6 uppercase font-bold text-xs tracking-wider text-purple-900 dark:text-purple-300">Title</th>
                                <th className="text-left py-4 px-6 uppercase font-bold text-xs tracking-wider text-purple-900 dark:text-purple-300">Difficulty</th>
                                <th className="text-left py-4 px-6 uppercase font-bold text-xs tracking-wider text-purple-900 dark:text-purple-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100/30 dark:divide-purple-950/10 text-slate-700 dark:text-slate-300">
                            {problems.length > 0 ? (
                                problems.map((problem) => (
                                    <tr key={problem._id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/10 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-sm">
                                            {problem.title}
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
                                        <td className="py-4 px-6 flex items-center gap-2">
                                            <Link to={`/admin/problems/edit/${problem._id}`}>
                                                <Button size="xs" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 text-[11px] h-7 font-bold">
                                                    ✏️ Edit
                                                </Button>
                                            </Link>
                                            <Button 
                                                onClick={() => handleDelete(problem._id)} 
                                                size="xs" 
                                                variant="destructive" 
                                                className="text-[11px] h-7 font-bold"
                                            >
                                                🗑️ Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-8 px-6 text-center text-slate-400">
                                        No problems loaded. Click add new problem to start.
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

export default AdminProblemsListPage;