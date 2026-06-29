import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminProblemsListPage = () => {
    const [problems, setProblems] = useState([]);

    const fetchProblems = async () => {
        try {
            const res = await axios.get('/api/problems'); // We can reuse the public endpoint
            setProblems(res.data);
        } catch (error) {
            console.error('Failed to fetch problems', error);
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
                fetchProblems(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete problem', error);
                alert('Failed to delete problem.');
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Problems</h1>
                <Link to="/admin/add-problem" className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
                    Add New Problem
                </Link>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Title</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Difficulty</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {problems.map((problem) => (
                            <tr key={problem._id} className="border-t hover:bg-gray-100">
                                <td className="text-left py-3 px-4">{problem.title}</td>
                                <td className="text-left py-3 px-4">{problem.difficulty}</td>
                                <td className="text-left py-3 px-4">
                                    <Link to={`/admin/problems/edit/${problem._id}`} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-yellow-600">Edit</Link>
                                    <button onClick={() => handleDelete(problem._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProblemsListPage;