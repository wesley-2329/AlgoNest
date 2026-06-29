import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditProblemPage = () => {
    const [problem, setProblem] = useState({ title: '', statement: '', difficulty: 'Easy', hiddenTestCases: [] });
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await axios.get(`/api/problems/${id}`);
                setProblem(res.data);
            } catch (error) {
                console.error('Failed to fetch problem data', error);
            }
        };
        fetchProblem();
    }, [id]);

    // Handlers for form changes (similar to AddProblemPage)
    const handleChange = (e) => {
         setProblem({ ...problem, [e.target.name]: e.target.value });
    }
    const handleTestCaseChange = (index, event) => {
        const values = [...problem.hiddenTestCases];
        values[index][event.target.name] = event.target.value;
        setProblem({ ...problem, hiddenTestCases: values });
    };
    const addTestCase = () => {
         setProblem({ ...problem, hiddenTestCases: [...problem.hiddenTestCases, { input: '', output: '' }] });
    };
    const removeTestCase = (index) => {
        const values = [...problem.hiddenTestCases];
        values.splice(index, 1);
        setProblem({ ...problem, hiddenTestCases: values });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/problems/${id}`, problem);
            alert('Problem updated successfully!');
            navigate('/admin/problems');
        } catch (error) {
            console.error('Failed to update problem:', error);
            alert(`Error: ${error.response.data.message}`);
        }
    };

    return (
         <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Edit Problem</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <div>
                    <label className="block font-medium">Title</label>
                    <input type="text" name="title" value={problem.title} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block font-medium">Problem Statement</label>
                    <textarea name="statement" value={problem.statement} onChange={handleChange} rows="10" className="w-full p-2 border rounded" required></textarea>
                </div>
                <div>
                    <label className="block font-medium">Difficulty</label>
                    <select name="difficulty" value={problem.difficulty} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Hidden Test Cases</h2>
                    {problem.hiddenTestCases.map((testCase, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-2">
                            <h3 className="font-medium">Test Case {index + 1}</h3>
                            <div>
                                <label className="block text-sm">Input</label>
                                <textarea name="input" value={testCase.input} onChange={e => handleTestCaseChange(index, e)} rows="3" className="w-full p-2 border rounded"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm">Output</label>
                                <textarea name="output" value={testCase.output} onChange={e => handleTestCaseChange(index, e)} rows="3" className="w-full p-2 border rounded"></textarea>
                            </div>
                            <button type="button" onClick={() => removeTestCase(index)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addTestCase} className="bg-gray-600 text-white px-4 py-2 rounded">Add Test Case</button>
                </div>

                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Update Problem</button>
            </form>
        </div>
    );
};

export default EditProblemPage;