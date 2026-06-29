// client/src/pages/AddProblemPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProblemPage = () => {
    const [title, setTitle] = useState('');
    const [statement, setStatement] = useState('');
    const [difficulty, setDifficulty] = useState('Easy');
    // New state for hidden test cases
    const [hiddenTestCases, setHiddenTestCases] = useState([{ input: '', output: '' }]);

    const navigate = useNavigate();

    const handleTestCaseChange = (index, event) => {
        const values = [...hiddenTestCases];
        values[index][event.target.name] = event.target.value;
        setHiddenTestCases(values);
    };

    const addTestCase = () => {
        setHiddenTestCases([...hiddenTestCases, { input: '', output: '' }]);
    };

    const removeTestCase = (index) => {
        const values = [...hiddenTestCases];
        values.splice(index, 1);
        setHiddenTestCases(values);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/problems', { 
                title, 
                statement, 
                difficulty, 
                hiddenTestCases 
            });
            alert('Problem added successfully!');
            navigate('/problems');
        } catch (error) {
            console.error('Failed to add problem:', error);
            alert(`Error: ${error.response.data.message}`);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Add New Problem</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                {/* Title, Statement, Difficulty fields remain the same */}
                <div>
                    <label className="block font-medium">Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block font-medium">Problem Statement</label>
                    <textarea value={statement} onChange={(e) => setStatement(e.target.value)} rows="10" className="w-full p-2 border rounded" required></textarea>
                </div>
                <div>
                    <label className="block font-medium">Difficulty</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-2 border rounded">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                {/* New section for Hidden Test Cases */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Hidden Test Cases</h2>
                    {hiddenTestCases.map((testCase, index) => (
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

                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Add Problem</button>
            </form>
        </div>
    );
};

export default AddProblemPage;