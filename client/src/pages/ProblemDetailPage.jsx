// client/src/pages/ProblemDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { AuthContext } from '../context/AuthContext';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/ThemeProvider";
import { io } from 'socket.io-client';

const ProblemDetailPage = () => {
    // State for all features
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState('// Your code here');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [explanation, setExplanation] = useState('');
    const [isExplained, setIsExplained] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [debugExplanation, setDebugExplanation] = useState('');
    const [isDebugging, setIsDebugging] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [runOutput, setRunOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [review, setReview] = useState('');
    const [isReviewing, setIsReviewing] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    // New V2 states
    const [hints, setHints] = useState([]);
    const [loadingHint, setLoadingHint] = useState(false);
    
    const { authUser } = useContext(AuthContext);
    const { id: problemId } = useParams();
    const { theme } = useTheme();

    // Fetch initial data
    useEffect(() => { 
        const fetchProblem = async () => { 
            try { 
                const res = await axios.get(`/api/problems/${problemId}`); 
                setProblem(res.data); 
            } catch (error) { 
                console.error('Failed to fetch problem', error); 
            } finally { 
                setLoading(false); 
            } 
        }; 
        fetchProblem(); 
    }, [problemId]);

    useEffect(() => { 
        const fetchSubmissions = async () => { 
            if (authUser) { 
                try { 
                    const res = await axios.get(`/api/submissions/problem/${problemId}`); 
                    setSubmissions(res.data); 
                } catch (error) { 
                    console.error("Failed to fetch submissions", error); 
                } 
            } 
        }; 
        fetchSubmissions(); 
    }, [problemId, authUser, result]);

    // WebSocket connection for real-time submission updates
    useEffect(() => {
        if (!authUser) return;

        // Connect to Socket.io server
        const socket = io('http://localhost:5001', { withCredentials: true });

        socket.on('connect', () => {
            console.log('[WebSocket] Connected. Subscribing to user-', authUser._id);
            socket.emit('join-user', { userId: authUser._id });
        });

        socket.on('submission-verdict', (updatedSubmission) => {
            console.log('[WebSocket] Received updated submission verdict:', updatedSubmission);
            if (updatedSubmission.problemId === problemId) {
                setResult(updatedSubmission);
                setIsSubmitting(false);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [problemId, authUser]);

    const handleSubmit = async () => { 
        if (!authUser) { alert('Please log in.'); return; } 
        setIsSubmitting(true); 
        setResult(null); 
        setDebugExplanation(''); 
        try { 
            const res = await axios.post('/api/submissions', { language, code, problemId }); 
            setResult(res.data); // This sets verdict to 'Pending'
        } catch (error) { 
            setResult({ verdict: 'Error', output: 'Submission failed.' }); 
            setIsSubmitting(false);
        } 
    };

    const handleRunCode = async () => { 
        if (!authUser) { alert('Please log in.'); return; } 
        setIsRunning(true); 
        setRunOutput(null); 
        try { 
            const res = await axios.post('/api/submissions/run-custom', { language, code, input: customInput }); 
            setRunOutput(res.data); 
        } catch (error) { 
            setRunOutput({ verdict: 'Error', error: 'Run failed.' }); 
        } finally { 
            setIsRunning(false); 
        } 
    };

    const handleExplainProblem = async () => { 
        setIsExplaining(true); 
        try { 
            const res = await axios.post('/api/ai/explain', { problemId }); 
            setExplanation(res.data.explanation); 
            setIsExplained(true); 
        } catch (error) { 
            setExplanation("Couldn't get explanation."); 
        } finally { 
            setIsExplaining(false); 
        } 
    };

    const handleDebugCode = async () => { 
        setIsDebugging(true); 
        setDebugExplanation(''); 
        try { 
            const res = await axios.post('/api/ai/debug', { 
                problemId, 
                userCode: code, 
                language, 
                verdict: result.verdict, 
                actualOutput: result.output 
            }); 
            setDebugExplanation(res.data.explanation); 
        } catch (error) { 
            setDebugExplanation("Couldn't get debug hint."); 
        } finally { 
            setIsDebugging(false); 
        } 
    };

    const handleCodeReview = async () => { 
        if (!authUser) { alert('Please log in.'); return; } 
        setIsReviewModalOpen(true); 
        setIsReviewing(true); 
        setReview(''); 
        try { 
            const res = await axios.post('/api/ai/review', { language, code }); 
            setReview(res.data.review); 
        } catch (error) { 
            setReview('An error occurred.'); 
        } finally { 
            setIsReviewing(false); 
        } 
    };

    const handleRevealHint = async () => {
        setLoadingHint(true);
        try {
            const res = await axios.post('/api/ai/hint', {
                problemId,
                hintsRevealed: hints
            });
            setHints(prev => [...prev, res.data.hint]);
        } catch (error) {
            console.error('Failed to get hint', error);
        } finally {
            setLoadingHint(false);
        }
    };

    if (loading) return <div className="text-center pt-20 text-purple-600 font-bold animate-pulse">Loading problem...</div>;
    if (!problem) return <div className="text-center pt-20 text-purple-600 font-bold">Problem not found.</div>;

    return (
        <>
            {selectedSubmission && ( 
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-3/4 h-3/4 flex flex-col shadow-2xl border border-purple-100 dark:border-purple-950/40 overflow-hidden">
                        <div className="p-4 border-b border-purple-100 dark:border-purple-950/30 flex justify-between items-center text-slate-900 dark:text-white bg-purple-50/50 dark:bg-slate-950/40">
                            <h2 className="text-lg font-bold">Submitted Code ({selectedSubmission.language})</h2>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(null)} className="text-slate-500 hover:text-slate-900">
                                <span className="text-2xl">&times;</span>
                            </Button>
                        </div>
                        <div className="flex-grow">
                            <Editor 
                                height="100%" 
                                language={selectedSubmission.language} 
                                value={selectedSubmission.code} 
                                theme={theme === 'dark' ? 'vs-dark' : 'light'} 
                                options={{ readOnly: true, minimap: { enabled: false } }} 
                            />
                        </div>
                    </div>
                </div> 
            )}
            
            {isReviewModalOpen && ( 
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-1/2 h-3/4 flex flex-col shadow-2xl border border-purple-100 dark:border-purple-950/40 overflow-hidden text-slate-900 dark:text-white">
                        <div className="p-4 border-b border-purple-100 dark:border-purple-950/30 flex justify-between items-center bg-purple-50/50 dark:bg-slate-950/40">
                            <h2 className="text-lg font-bold flex items-center gap-2"><span>🤖</span> AI Code Review</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsReviewModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                                <span className="text-2xl">&times;</span>
                            </Button>
                        </div>
                        <div className="flex-grow p-6 overflow-y-auto bg-slate-950">
                            <pre className="whitespace-pre-wrap font-sans text-xs text-purple-200 leading-relaxed">{isReviewing ? 'AI reviewing your code...' : review}</pre>
                        </div>
                    </div>
                </div> 
            )}

            <PanelGroup direction="horizontal" className="p-4 h-[calc(100vh-64px)] text-slate-800 dark:text-white bg-background transition-colors duration-200">
                <Panel defaultSize={50} minSize={30} className="pr-4">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{problem.title}</h1>
                                <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{problem.difficulty}</span>
                            </div>
                        </div>

                        <Tabs defaultValue="problem" className="w-full mt-6 flex flex-col flex-grow overflow-hidden">
                            <TabsList className="grid w-full grid-cols-3 bg-purple-50/50 dark:bg-slate-950/40 border border-purple-100/50 dark:border-purple-950/30 p-1 rounded-xl">
                                <TabsTrigger value="problem" className="rounded-lg font-bold py-1.5">Problem Statement</TabsTrigger>
                                <TabsTrigger value="solutions" className="rounded-lg font-bold py-1.5">Official Solutions</TabsTrigger>
                                <TabsTrigger value="submissions" className="rounded-lg font-bold py-1.5">My Submissions</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="problem" className="flex-grow flex flex-col overflow-y-auto mt-4 space-y-6 pr-1">
                                <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Description</h2>
                                        <div className="flex gap-2">
                                            <Button onClick={handleRevealHint} disabled={loadingHint} variant="outline" size="sm" className="border-purple-200 text-purple-700 dark:text-purple-300 dark:border-purple-900 text-xs font-bold hover:bg-purple-50">
                                                {loadingHint ? 'Thinking...' : `🤖 Hint #${hints.length + 1}`}
                                            </Button>
                                            <Button onClick={handleExplainProblem} disabled={isExplaining} variant="outline" size="sm" className="border-purple-200 text-purple-700 dark:text-purple-300 dark:border-purple-900 text-xs font-bold hover:bg-purple-50">
                                                {isExplaining ? 'Thinking...' : '🤖 Explain'}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 text-sm leading-relaxed"><p className="whitespace-pre-wrap">{problem.statement}</p></div>
                                    
                                    {isExplained && (
                                        <div className="mt-6 pt-6 border-t border-purple-100 dark:border-purple-950/20">
                                            <h3 className="text-base font-bold text-purple-900 dark:text-purple-300 mb-3">AI Breakdown</h3>
                                            <div className="bg-purple-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-purple-100 dark:border-purple-950/20 prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs leading-relaxed"><p className="whitespace-pre-wrap">{explanation}</p></div>
                                        </div>
                                    )}

                                    {/* Progressive Hints List */}
                                    {hints.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-purple-100 dark:border-purple-950/20 space-y-3">
                                            <h3 className="text-base font-bold text-purple-900 dark:text-purple-300">Hints Logs</h3>
                                            {hints.map((hint, index) => (
                                                <div key={index} className="bg-purple-50/40 dark:bg-slate-950/20 border border-purple-100 dark:border-purple-950/30 p-4 rounded-xl">
                                                    <span className="font-bold text-xs text-purple-600 dark:text-purple-400 block mb-1.5">Clue #{index + 1}:</span>
                                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{hint}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {problem.examples && problem.examples.length > 0 && ( 
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Examples</h2>
                                        {problem.examples.map((example, index) => (
                                            <div key={index} className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 mb-4">
                                                <h3 className="font-bold text-sm text-purple-900 dark:text-purple-300">Example {index + 1}</h3>
                                                <div className="mt-3 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase">Input</p>
                                                        <pre className="bg-purple-50/50 dark:bg-slate-950/40 text-purple-950 dark:text-purple-200 p-2.5 rounded-lg border border-purple-100/50 dark:border-purple-900/20 mt-1 font-mono text-xs overflow-x-auto"><code>{example.input}</code></pre>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase">Output</p>
                                                        <pre className="bg-purple-50/50 dark:bg-slate-950/40 text-purple-950 dark:text-purple-200 p-2.5 rounded-lg border border-purple-100/50 dark:border-purple-900/20 mt-1 font-mono text-xs overflow-x-auto"><code>{example.output}</code></pre>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div> 
                                )}
                            </TabsContent>
                            
                            <TabsContent value="solutions" className="flex-grow overflow-y-auto mt-4 space-y-6 pr-1">
                                <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Official Explanation</h2>
                                    {problem.solutions?.explanation ? (
                                        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 text-xs leading-relaxed mb-6">
                                            <p className="whitespace-pre-wrap">{problem.solutions.explanation}</p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm">No complexity breakdown or explanation loaded.</p>
                                    )}

                                    <div className="border-t border-purple-100 dark:border-purple-950/20 pt-6">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Code Implementations</h2>
                                        {problem.solutions ? (
                                            <div className="space-y-6">
                                                {problem.solutions.cpp && (
                                                    <div>
                                                        <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">C++ Solution</h3>
                                                        <pre className="bg-slate-950 text-purple-200 p-4 rounded-xl border border-purple-900/30 font-mono text-xs overflow-x-auto">
                                                            <code>{problem.solutions.cpp}</code>
                                                        </pre>
                                                    </div>
                                                )}
                                                {problem.solutions.python && (
                                                    <div>
                                                        <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">Python Solution</h3>
                                                        <pre className="bg-slate-950 text-purple-200 p-4 rounded-xl border border-purple-900/30 font-mono text-xs overflow-x-auto">
                                                            <code>{problem.solutions.python}</code>
                                                        </pre>
                                                    </div>
                                                )}
                                                {problem.solutions.java && (
                                                    <div>
                                                        <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">Java Solution</h3>
                                                        <pre className="bg-slate-950 text-purple-200 p-4 rounded-xl border border-purple-900/30 font-mono text-xs overflow-x-auto">
                                                            <code>{problem.solutions.java}</code>
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-slate-400 text-sm">No code implementations loaded.</p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="submissions" className="flex-grow overflow-hidden flex flex-col mt-4">
                                <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 overflow-y-auto flex-grow">
                                    <table className="min-w-full divide-y divide-purple-100/50">
                                        <thead className="bg-purple-50/55 dark:bg-purple-950/15">
                                            <tr>
                                                <th className="text-left py-3.5 px-5 uppercase font-bold text-xs tracking-wider text-purple-900 dark:text-purple-300">When</th>
                                                <th className="text-left py-3.5 px-5 uppercase font-bold text-xs tracking-wider text-purple-900 dark:text-purple-300">Language</th>
                                                <th className="text-left py-3.5 px-5 uppercase font-bold text-xs tracking-wider text-purple-900 dark:text-purple-300">Verdict</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-100/30 text-slate-600 dark:text-slate-350">
                                            {submissions.length > 0 ? submissions.map(sub => (
                                                <tr key={sub._id} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/10 cursor-pointer transition-colors" onClick={() => setSelectedSubmission(sub)}>
                                                    <td className="py-3 px-5 text-xs">{new Date(sub.createdAt).toLocaleString()}</td>
                                                    <td className="py-3 px-5 text-xs capitalize">{sub.language}</td>
                                                    <td className={`py-3 px-5 text-xs font-bold ${
                                                        sub.verdict === 'Accepted' 
                                                            ? 'text-emerald-600 dark:text-emerald-400' 
                                                            : sub.verdict === 'Pending'
                                                                ? 'text-blue-500 animate-pulse'
                                                                : 'text-rose-600'
                                                    }`}>{sub.verdict}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-6 text-xs text-slate-400">No submissions recorded.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </Panel>
                
                <PanelResizeHandle className="w-1.5 bg-purple-100 dark:bg-purple-950 hover:bg-purple-500 transition-colors" />

                <Panel defaultSize={50} minSize={30} className="pl-4">
                    <div className="flex flex-col h-full">
                        <div className="flex justify-end items-center mb-3">
                            <select 
                                id="language-select" 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)} 
                                className="p-1.5 border border-purple-100 dark:border-purple-950 text-xs rounded-lg bg-card text-foreground focus:outline-none"
                            >
                                <option value="cpp">C++</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                        <PanelGroup direction="vertical" className="flex-grow rounded-2xl border border-purple-100 dark:border-purple-950/30 overflow-hidden shadow-lg">
                            <Panel defaultSize={65} minSize={20}>
                                <Editor 
                                    height="100%" 
                                    language={language} 
                                    value={code} 
                                    onChange={(value) => setCode(value)} 
                                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                />
                            </Panel>
                            <PanelResizeHandle className="h-1.5 bg-purple-100 dark:bg-purple-950 hover:bg-purple-500 transition-colors" />
                            <Panel defaultSize={35} minSize={20}>
                                <div className="h-full flex flex-col bg-purple-50/20 dark:bg-slate-900/40">
                                    <div className="p-2 border-b border-purple-100 dark:border-purple-950/20 font-bold text-xs uppercase tracking-wider text-slate-400">Test Custom input</div>
                                    <div className="flex-1 grid grid-cols-2 gap-2 p-2 overflow-hidden h-[120px]">
                                        <div className="flex flex-col h-full">
                                            <textarea 
                                                value={customInput} 
                                                onChange={(e) => setCustomInput(e.target.value)} 
                                                className="w-full h-full p-2.5 border border-purple-100 dark:border-purple-900/35 rounded-xl font-mono text-xs resize-none bg-background text-foreground focus:outline-none" 
                                                placeholder="Enter parameters..."
                                            />
                                        </div>
                                        <div className="flex flex-col h-full">
                                            <pre className="w-full h-full p-2.5 border border-purple-100 dark:border-purple-900/35 rounded-xl bg-slate-950 text-purple-200 font-mono text-xs whitespace-pre-wrap overflow-y-auto">
                                                {isRunning ? 'Executing test...' : (runOutput ? (runOutput.error || runOutput.output) : 'Execution logs appear here...')}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </PanelGroup>
                        <div className="mt-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCodeReview} disabled={isReviewing || isRunning || isSubmitting} className="border-purple-200 text-purple-700 hover:bg-purple-50 font-bold px-4 h-9 rounded-xl text-xs">
                                {isReviewing ? 'Analyzing...' : '🤖 AI Review'}
                            </Button>
                            <Button variant="outline" onClick={handleRunCode} disabled={isRunning || isSubmitting} className="border-purple-200 text-purple-700 hover:bg-purple-50 font-bold px-4 h-9 rounded-xl text-xs">
                                {isRunning ? 'Executing...' : 'Run Code'}
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting || isRunning} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 h-9 rounded-xl text-xs shadow-md">
                                {isSubmitting ? 'Queueing...' : 'Submit'}
                            </Button>
                        </div>
                        
                        {result && (
                            <div className="mt-6 overflow-y-auto">
                                <h2 className="text-lg font-bold mb-2">Verdict Status</h2>
                                <div className={`p-4 rounded-2xl border ${
                                    result.verdict === 'Accepted' 
                                        ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-800 dark:text-emerald-350' 
                                        : result.verdict === 'Pending'
                                            ? 'bg-blue-500/10 border-blue-500/35 text-blue-800 dark:text-blue-350 animate-pulse'
                                            : 'bg-rose-500/10 border-rose-500/35 text-rose-800 dark:text-rose-350'
                                }`}>
                                    <p className="font-extrabold text-sm tracking-wide">Verdict: {result.verdict}</p>
                                    {result.verdict !== 'Pending' && (
                                        <>
                                            <h3 className="font-bold text-xs mt-3 uppercase tracking-wider opacity-85">Output:</h3>
                                            <pre className="bg-slate-950 text-purple-200 p-2.5 rounded-xl border border-purple-900/30 mt-1 whitespace-pre-wrap text-xs">{result.output}</pre>
                                            {(result.verdict === 'Wrong Answer' || result.verdict === 'Runtime Error') && (
                                                <div className="mt-4">
                                                    <Button variant="destructive" onClick={handleDebugCode} disabled={isDebugging} className="text-xs font-bold rounded-xl h-8">
                                                        {isDebugging ? 'Searching error...' : '🤖 Ask Coach why it failed'}
                                                    </Button>
                                                </div>
                                            )}
                                            {debugExplanation && (
                                                <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-purple-900/40">
                                                    <h3 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wide">Coach Clues</h3>
                                                    <p className="whitespace-pre-wrap text-xs text-purple-200 leading-relaxed">{debugExplanation}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Panel>
            </PanelGroup>
        </>
    );
};

export default ProblemDetailPage;