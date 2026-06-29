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

    if (loading) return <div>Loading problems...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Problemset</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Title</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Difficulty</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Tags</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {problems.map((problem) => (
                            <tr key={problem._id} className="hover:bg-gray-100">
                                <td className="text-left py-3 px-4">
                                    <Link to={`/problems/${problem._id}`} className="text-blue-600 hover:underline">
                                        {problem.title}
                                    </Link>
                                </td>
                                <td className="text-left py-3 px-4">{problem.difficulty}</td>
                                <td className="text-left py-3 px-4">{problem.tags.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProblemsListPage;