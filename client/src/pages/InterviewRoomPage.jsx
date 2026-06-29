// client/src/pages/InterviewRoomPage.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { AuthContext } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useTheme } from "@/components/ThemeProvider";

const InterviewRoomPage = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { authUser } = useContext(AuthContext);
    const { theme } = useTheme();

    // Landing view states
    const [interviews, setInterviews] = useState([]);
    const [candidateEmail, setCandidateEmail] = useState('');
    const [problems, setProblems] = useState([]);
    const [selectedProblemId, setSelectedProblemId] = useState('');
    const [loadingSessions, setLoadingSessions] = useState(true);

    // Workspace states
    const [sessionInfo, setSessionInfo] = useState(null);
    const [role, setRole] = useState(null); // 'interviewer' | 'candidate'
    const [code, setCode] = useState('// Your code here');
    const [language, setLanguage] = useState('cpp');
    const [isLocked, setIsLocked] = useState(false);
    const [hintsRevealed, setHintsRevealed] = useState([]); // indices of revealed hints
    const [availableHints, setAvailableHints] = useState([]); // generated hints texts
    const [loadingHint, setLoadingHint] = useState(false);
    const [notes, setNotes] = useState(''); // Interviewer private notes
    const [feedback, setFeedback] = useState(''); // Summary feedback
    const [customInput, setCustomInput] = useState('');
    const [runOutput, setRunOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    const socketRef = useRef(null);

    // Fetch list of interviews and problems for landing view
    useEffect(() => {
        if (!sessionId && authUser) {
            const fetchData = async () => {
                try {
                    const [interviewsRes, problemsRes] = await Promise.all([
                        axios.get('/api/interviews'),
                        axios.get('/api/problems')
                    ]);
                    setInterviews(interviewsRes.data);
                    setProblems(problemsRes.data);
                    if (problemsRes.data.length > 0) {
                        setSelectedProblemId(problemsRes.data[0]._id);
                    }
                } catch (err) {
                    console.error('Error fetching interview landing data', err);
                } finally {
                    setLoadingSessions(false);
                }
            };
            fetchData();
        }
    }, [sessionId, authUser]);

    // Active session Socket connection & state sync
    useEffect(() => {
        if (sessionId && authUser) {
            const fetchSessionDetails = async () => {
                try {
                    const res = await axios.get(`/api/interviews/${sessionId}`);
                    setSessionInfo(res.data);
                    setCode(res.data.code);
                    setLanguage(res.data.language);
                    setIsLocked(res.data.isLocked);
                    setHintsRevealed(res.data.hintsRevealed || []);
                    setNotes(res.data.notes || '');
                    setFeedback(res.data.feedback || '');

                    // Determine Role
                    if (res.data.interviewerId._id === authUser._id) {
                        setRole('interviewer');
                    } else if (res.data.candidateId._id === authUser._id) {
                        setRole('candidate');
                    } else {
                        alert('You are not authorized for this interview session');
                        navigate('/interview');
                    }
                } catch (err) {
                    console.error('Error loading session details', err);
                    alert('Interview session not found or access denied');
                    navigate('/interview');
                }
            };
            fetchSessionDetails();

            // Connect WebSocket
            const socket = io('http://localhost:5001', { withCredentials: true });
            socketRef.current = socket;

            socket.on('connect', () => {
                socket.emit('join-room', {
                    roomId: sessionId,
                    userId: authUser._id,
                    username: authUser.username
                });
            });

            // Sync Code changes
            socket.on('code-change', ({ code: newCode, language: newLang }) => {
                setCode(newCode);
                setLanguage(newLang);
            });

            // Sync Lock states
            socket.on('interview-lock-change', ({ isLocked: newLockState }) => {
                setIsLocked(newLockState);
            });

            // Sync hints revealed
            socket.on('interview-reveal-hint', ({ hintIndex }) => {
                setHintsRevealed(prev => {
                    if (!prev.includes(hintIndex)) {
                        return [...prev, hintIndex].sort((a, b) => a - b);
                    }
                    return prev;
                });
            });

            // Sync problem changes
            socket.on('interview-change-problem', async ({ problemId }) => {
                try {
                    const res = await axios.get(`/api/interviews/${sessionId}`);
                    setSessionInfo(res.data);
                    setHintsRevealed([]);
                    setAvailableHints([]);
                } catch (err) {
                    console.error('Failed to sync new problem details', err);
                }
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [sessionId, authUser, navigate]);

    // Generate/fetch hints locally using Gemini API when triggered
    const handleRevealHint = async () => {
        if (!sessionInfo?.problemId) return;
        setLoadingHint(true);
        try {
            const res = await axios.post('/api/ai/hint', {
                problemId: sessionInfo.problemId._id,
                hintsRevealed
            });

            const nextIndex = hintsRevealed.length;
            setAvailableHints(prev => [...prev, res.data.hint]);
            
            setHintsRevealed(prev => [...prev, nextIndex]);

            // Sync via Socket.io
            if (socketRef.current) {
                socketRef.current.emit('interview-reveal-hint', {
                    sessionId,
                    hintIndex: nextIndex
                });
            }
        } catch (err) {
            console.error('Failed to get hint', err);
        } finally {
            setLoadingHint(false);
        }
    };

    // Candidate polls/reveals local hint copies if revealed by interviewer
    useEffect(() => {
        const syncClientHints = async () => {
            if (role === 'candidate' && hintsRevealed.length > availableHints.length && sessionInfo?.problemId) {
                setLoadingHint(true);
                try {
                    const newHints = [];
                    for (let i = 0; i < hintsRevealed.length; i++) {
                        const res = await axios.post('/api/ai/hint', {
                            problemId: sessionInfo.problemId._id,
                            hintsRevealed: Array.from({ length: i })
                        });
                        newHints.push(res.data.hint);
                    }
                    setAvailableHints(newHints);
                } catch (err) {
                    console.error('Error fetching hints', err);
                } finally {
                    setLoadingHint(false);
                }
            }
        };
        syncClientHints();
    }, [hintsRevealed, role, sessionInfo]);

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/interviews', {
                candidateEmail,
                problemId: selectedProblemId
            });
            navigate(`/interview/${res.data.sessionId}`);
        } catch (err) {
            alert('Failed to start interview: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCodeChange = (value) => {
        setCode(value);
        if (socketRef.current) {
            socketRef.current.emit('code-change', {
                roomId: sessionId,
                code: value,
                language
            });
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        if (socketRef.current) {
            socketRef.current.emit('code-change', {
                roomId: sessionId,
                code,
                language: newLang
            });
        }
    };

    const handleToggleLock = () => {
        const nextLockState = !isLocked;
        setIsLocked(nextLockState);
        if (socketRef.current) {
            socketRef.current.emit('interview-lock-change', {
                sessionId,
                isLocked: nextLockState
            });
        }
    };

    const handleProblemChange = (e) => {
        const newProbId = e.target.value;
        if (socketRef.current) {
            socketRef.current.emit('interview-change-problem', {
                sessionId,
                problemId: newProbId
            });
        }
    };

    const handleSaveNotes = async () => {
        try {
            await axios.put(`/api/interviews/${sessionId}/feedback`, { notes });
            alert('Interviewer notes auto-saved.');
        } catch (err) {
            alert('Failed to save notes');
        }
    };

    const handleCompleteInterview = async () => {
        try {
            await axios.put(`/api/interviews/${sessionId}/feedback`, {
                notes,
                feedback,
                status: 'completed'
            });
            alert('Interview marked as completed successfully!');
            navigate('/interview');
        } catch (err) {
            alert('Failed to save feedback');
        }
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setRunOutput('');
        try {
            const res = await axios.post('/api/submissions/run-custom', {
                language,
                code,
                input: customInput
            });
            setRunOutput(res.data.output || res.data.error || 'No output returned.');
        } catch (error) {
            setRunOutput('Error running code.');
        } finally {
            setIsRunning(false);
        }
    };

    if (!authUser) return <div className="text-center pt-20 text-purple-600 font-bold">Please log in.</div>;

    // LANDING VIEW (Session list/creation)
    if (!sessionId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12 text-slate-800 dark:text-white">
                <h1 className="text-4xl font-extrabold mb-8 text-slate-900 dark:text-white">
                    Interview Room Workspace
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Create Interview Session */}
                    <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-8 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5">
                        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Initialize New Interview Session</h2>
                        <form onSubmit={handleCreateSession} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Candidate Email Address</label>
                                <input 
                                    type="email" 
                                    value={candidateEmail}
                                    onChange={(e) => setCandidateEmail(e.target.value)}
                                    placeholder="candidate@email.com"
                                    className="w-full px-4 py-2.5 border border-purple-100 dark:border-purple-900/35 text-slate-900 dark:text-white bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/80 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Assign First Problem</label>
                                <select 
                                    value={selectedProblemId}
                                    onChange={(e) => setSelectedProblemId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-purple-100 dark:border-purple-900/35 text-slate-900 dark:text-white bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/80 text-sm"
                                >
                                    {problems.map(p => (
                                        <option key={p._id} value={p._id}>{p.title} ({p.difficulty})</option>
                                    ))}
                                </select>
                            </div>
                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-2.5 rounded-xl shadow-md shadow-purple-600/10">
                                Start Interview Session
                            </Button>
                        </form>
                    </div>

                    {/* Interview History list */}
                    <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-8 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 flex flex-col">
                        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Scheduled Sessions</h2>
                        {loadingSessions ? (
                            <p className="text-slate-400 font-bold animate-pulse">Loading interview sessions...</p>
                        ) : interviews.length > 0 ? (
                            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                                {interviews.map(session => (
                                    <div key={session.sessionId} className="flex justify-between items-center p-4 bg-purple-50/30 dark:bg-slate-950/20 rounded-xl border border-purple-100/50 hover:border-purple-300 dark:hover:border-purple-800 transition-all">
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Interviewer: {session.interviewerId?.username}</h4>
                                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">Candidate: {session.candidateId?.username}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Problem: {session.problemId?.title || 'None assigned'}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${session.status === 'completed' ? 'bg-green-500/20 text-green-700' : 'bg-blue-500/20 text-blue-700'}`}>
                                                {session.status}
                                            </span>
                                            <Button onClick={() => navigate(`/interview/${session.sessionId}`)} variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50 text-[10px] h-7 rounded-xl font-bold">
                                                Enter Room
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 my-auto text-center text-sm font-semibold py-8">No scheduled interviews found.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // WORKSPACE VIEW (Active Interview Room)
    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-background text-slate-800 dark:text-white transition-colors duration-200">
            <PanelGroup direction="horizontal" className="flex-1">
                
                {/* Left Panel: Problem & Revealed Hints */}
                <Panel defaultSize={30} minSize={20} className="border-r border-purple-100 dark:border-purple-950/20 flex flex-col h-full bg-purple-50/10 dark:bg-slate-950/5">
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        {sessionInfo?.problemId ? (
                            <div>
                                <h2 className="text-2xl font-extrabold mb-2 text-slate-900 dark:text-white">{sessionInfo.problemId.title}</h2>
                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${sessionInfo.problemId.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : sessionInfo.problemId.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {sessionInfo.problemId.difficulty}
                                </span>
                                <div className="mt-6 prose dark:prose-invert text-sm max-w-none text-slate-700 dark:text-slate-355 border-b border-purple-100 dark:border-purple-950/20 pb-6 leading-relaxed">
                                    <p className="whitespace-pre-wrap">{sessionInfo.problemId.statement}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center pt-20 text-slate-400">
                                <h3>No Problem Assigned</h3>
                                {role === 'interviewer' && <p className="text-xs mt-2">Assign one from the middle panel.</p>}
                            </div>
                        )}

                        {/* Hints list */}
                        <div className="space-y-4">
                            <h3 className="text-base font-bold text-purple-900 dark:text-purple-300">Revealed Clues</h3>
                            {availableHints.length > 0 ? (
                                availableHints.map((hint, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-900/60 border border-purple-100 dark:border-purple-950/20 p-4 rounded-xl shadow-sm text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                        <span className="font-bold text-purple-700 dark:text-purple-400 block mb-1.5">Hint #{idx + 1}:</span>
                                        <p className="whitespace-pre-wrap">{hint}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400">No clues revealed yet.</p>
                            )}
                        </div>
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-purple-100 dark:bg-purple-950 hover:bg-purple-500 transition-colors" />

                {/* Middle Panel: Monaco Editor & Local Execution */}
                <Panel defaultSize={50} minSize={30} className="flex flex-col h-full">
                    {/* Header bar controls */}
                    <div className="flex justify-between items-center p-3 border-b border-purple-100 dark:border-purple-950/20 bg-purple-50/20 dark:bg-slate-900/10">
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Role: <span className="capitalize">{role}</span></span>
                        
                        <div className="flex items-center gap-3">
                            {role === 'interviewer' && (
                                <>
                                    <select 
                                        value={sessionInfo?.problemId?._id || ''} 
                                        onChange={handleProblemChange}
                                        className="p-1 border border-purple-100 dark:border-purple-950 text-xs rounded-lg bg-card text-foreground focus:outline-none"
                                    >
                                        <option value="">-- Assign Problem --</option>
                                        {problems.map(p => (
                                            <option key={p._id} value={p._id}>{p.title}</option>
                                        ))}
                                    </select>
                                    <Button size="xs" onClick={handleRevealHint} disabled={loadingHint} className="bg-purple-600 hover:bg-purple-700 h-7 text-[11px] font-bold text-white rounded-lg px-3">
                                        {loadingHint ? 'Generating Hint...' : `Hint #${hintsRevealed.length + 1}`}
                                    </Button>
                                    <Button size="xs" onClick={handleToggleLock} className={`h-7 text-[11px] font-bold text-white rounded-lg px-3 ${isLocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                                        {isLocked ? 'Unlock Editor' : 'Lock Editor'}
                                    </Button>
                                </>
                            )}
                            <select 
                                value={language} 
                                onChange={handleLanguageChange} 
                                disabled={role === 'candidate' && isLocked}
                                className="p-1 border border-purple-100 dark:border-purple-950 text-xs rounded-lg bg-card text-foreground focus:outline-none"
                            >
                                <option value="cpp">C++</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                    </div>

                    {/* Monaco Editor Panel */}
                    <PanelGroup direction="vertical" className="flex-grow">
                        <Panel defaultSize={70} minSize={30}>
                            {role === 'candidate' && isLocked && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 select-none">
                                    <span className="bg-orange-600/90 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-lg tracking-wider">
                                        🔒 Editor Locked by Interviewer
                                    </span>
                                </div>
                            )}
                            <Editor 
                                height="100%" 
                                language={language} 
                                value={code} 
                                onChange={handleCodeChange}
                                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                options={{
                                    readOnly: isLocked && role === 'candidate',
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineHeight: 22
                                }}
                            />
                        </Panel>

                        <PanelResizeHandle className="h-1.5 bg-purple-100 dark:bg-purple-950 hover:bg-purple-500 transition-colors" />

                        {/* Local Run Console */}
                        <Panel defaultSize={30} minSize={20} className="border-t border-purple-100 dark:border-purple-950/20 bg-purple-50/10 dark:bg-slate-900/10 flex flex-col">
                            <div className="p-2 border-b border-purple-100 dark:border-purple-950/10 bg-purple-50/20 dark:bg-slate-900/20 flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Execution Console</span>
                                <Button size="sm" onClick={handleRunCode} disabled={isRunning} className="bg-purple-600 hover:bg-purple-700 h-7 text-xs font-bold text-white rounded-lg px-3 shadow-md">
                                    {isRunning ? 'Running...' : 'Run Code'}
                                </Button>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-2 p-2 overflow-hidden h-[120px]">
                                <textarea 
                                    value={customInput} 
                                    onChange={(e) => setCustomInput(e.target.value)} 
                                    placeholder="Enter input parameters..."
                                    className="w-full h-full p-2 border border-purple-100 dark:border-purple-900/35 rounded-xl font-mono text-xs bg-background text-foreground focus:outline-none resize-none"
                                />
                                <pre className="w-full h-full p-2 border border-purple-100 dark:border-purple-900/35 rounded-xl bg-slate-950 text-purple-200 font-mono text-xs overflow-y-auto whitespace-pre-wrap">
                                    {runOutput || 'Execution output logs appear here...'}
                                </pre>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-purple-100 dark:bg-purple-950 hover:bg-purple-500 transition-colors" />

                {/* Right Panel: Interviewer Private Notes */}
                <Panel defaultSize={20} minSize={15} className="border-l border-purple-100 dark:border-purple-950/20 flex flex-col h-full bg-purple-50/10 dark:bg-slate-950/5">
                    {role === 'interviewer' ? (
                        <div className="flex-1 flex flex-col p-4 space-y-6 h-full overflow-y-auto">
                            <div className="flex flex-col flex-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-2">Private Notes</label>
                                <textarea 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)} 
                                    placeholder="Assess logical flow and complexity..."
                                    className="flex-1 w-full p-3 border border-purple-100 dark:border-purple-900/35 rounded-xl bg-background text-foreground text-xs resize-none focus:outline-none h-[150px]"
                                />
                                <Button size="xs" onClick={handleSaveNotes} className="bg-purple-50 dark:bg-slate-950 border border-purple-200 text-purple-700 dark:text-purple-300 text-xs font-bold mt-2 h-8 rounded-xl hover:bg-purple-100">
                                    Save Notes
                                </Button>
                            </div>

                            <div className="flex flex-col flex-1 border-t border-purple-100 dark:border-purple-950/20 pt-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-2">Final Feedback</label>
                                <textarea 
                                    value={feedback} 
                                    onChange={(e) => setFeedback(e.target.value)} 
                                    placeholder="Write candidate review summary..."
                                    className="flex-1 w-full p-3 border border-purple-100 dark:border-purple-900/35 rounded-xl bg-background text-foreground text-xs resize-none focus:outline-none h-[150px]"
                                />
                                <Button onClick={handleCompleteInterview} className="bg-green-600 hover:bg-green-700 text-xs font-bold text-white mt-4 py-2.5 rounded-xl shadow-md">
                                    Complete Session
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center p-6 text-center text-slate-400">
                            <div>
                                <span className="text-3xl block mb-3">🧑‍💻</span>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Candidate Workspace</h4>
                                <p className="text-xs leading-relaxed max-w-xs">Your interviewer is observing your logic, code updates, and explanation skills in real-time.</p>
                            </div>
                        </div>
                    )}
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default InterviewRoomPage;
