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
            alert('Failed to start interview: ' + err.response?.data?.message || err.message);
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

    if (!authUser) return <div className="text-center pt-20 text-white">Please log in.</div>;

    // LANDING VIEW (Session list/creation)
    if (!sessionId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12 text-white">
                <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 to-violet-200 bg-clip-text text-transparent">
                    Interview Preparation Room
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Create Interview Session (Interviewer role setup) */}
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6">Initialize New Interview Session</h2>
                        <form onSubmit={handleCreateSession} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Candidate Email Address</label>
                                <input 
                                    type="email" 
                                    value={candidateEmail}
                                    onChange={(e) => setCandidateEmail(e.target.value)}
                                    placeholder="candidate@email.com"
                                    className="w-full px-4 py-2 border border-white/10 rounded-lg text-gray-900 bg-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Assign First Problem</label>
                                <select 
                                    value={selectedProblemId}
                                    onChange={(e) => setSelectedProblemId(e.target.value)}
                                    className="w-full px-4 py-2 border border-white/10 rounded-lg text-gray-900 bg-white"
                                >
                                    {problems.map(p => (
                                        <option key={p._id} value={p._id}>{p.title} ({p.difficulty})</option>
                                    ))}
                                </select>
                            </div>
                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-2 rounded-lg">
                                Start Interview Session
                            </Button>
                        </form>
                    </div>

                    {/* Interview History list */}
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 shadow-xl flex flex-col">
                        <h2 className="text-2xl font-bold mb-6">My Scheduled Sessions</h2>
                        {loadingSessions ? (
                            <p className="text-gray-400">Loading interview sessions...</p>
                        ) : interviews.length > 0 ? (
                            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                                {interviews.map(session => (
                                    <div key={session.sessionId} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                                        <div>
                                            <h4 className="font-bold">Interviewer: {session.interviewerId?.username}</h4>
                                            <p className="text-xs text-purple-200 mt-1">Candidate: {session.candidateId?.username}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Problem: {session.problemId?.title || 'None assigned'}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${session.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                                {session.status}
                                            </span>
                                            <Button onClick={() => navigate(`/interview/${session.sessionId}`)} variant="secondary" size="xs" className="h-6 text-[10px]">
                                                Enter Room
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 my-auto text-center">No scheduled interviews found.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // WORKSPACE VIEW (Active Interview Room)
    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-background text-foreground text-white">
            <PanelGroup direction="horizontal" className="flex-1">
                
                {/* Left Panel: Problem & Revealed Hints */}
                <Panel defaultSize={30} minSize={20} className="border-r flex flex-col h-full bg-card/10">
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        {sessionInfo?.problemId ? (
                            <div>
                                <h2 className="text-2xl font-extrabold mb-2">{sessionInfo.problemId.title}</h2>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${sessionInfo.problemId.difficulty === 'Easy' ? 'bg-green-200 text-green-800' : sessionInfo.problemId.difficulty === 'Medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                                    {sessionInfo.problemId.difficulty}
                                </span>
                                <div className="mt-6 prose dark:prose-invert text-sm max-w-none border-b border-white/10 pb-6">
                                    <p className="whitespace-pre-wrap">{sessionInfo.problemId.statement}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center pt-20 text-gray-400">
                                <h3>No Problem Assigned</h3>
                                {role === 'interviewer' && <p className="text-xs mt-2">Assign one from the middle panel.</p>}
                            </div>
                        )}

                        {/* Hints list (Visible to both interviewer and candidate if revealed) */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-purple-300">Revealed Hints</h3>
                            {availableHints.length > 0 ? (
                                availableHints.map((hint, idx) => (
                                    <div key={idx} className="bg-purple-950/20 border border-purple-500/10 p-3 rounded-lg text-xs leading-relaxed text-gray-200">
                                        <span className="font-bold text-purple-300 block mb-1">Hint #{idx + 1}:</span>
                                        <p className="whitespace-pre-wrap">{hint}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400">No hints revealed yet.</p>
                            )}
                        </div>
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-border hover:bg-purple-600 transition-colors" />

                {/* Middle Panel: Monaco Editor & Local Execution */}
                <Panel defaultSize={50} minSize={30} className="flex flex-col h-full">
                    {/* Header bar controls */}
                    <div className="flex justify-between items-center p-3 border-b bg-card/20">
                        <span className="text-sm font-bold text-purple-200">Role: <span className="capitalize">{role}</span></span>
                        
                        <div className="flex items-center gap-3">
                            {role === 'interviewer' && (
                                <>
                                    <select 
                                        value={sessionInfo?.problemId?._id || ''} 
                                        onChange={handleProblemChange}
                                        className="p-1 border rounded bg-card text-xs text-foreground focus:outline-none"
                                    >
                                        <option value="">-- Assign Problem --</option>
                                        {problems.map(p => (
                                            <option key={p._id} value={p._id}>{p.title}</option>
                                        ))}
                                    </select>
                                    <Button size="xs" onClick={handleRevealHint} disabled={loadingHint} className="bg-purple-600 hover:bg-purple-700 h-7 text-xs font-bold text-white">
                                        {loadingHint ? 'Generating Hint...' : `Reveal Hint #${hintsRevealed.length + 1}`}
                                    </Button>
                                    <Button size="xs" onClick={handleToggleLock} className={`h-7 text-xs font-bold text-white ${isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                                        {isLocked ? 'Unlock Editor' : 'Lock Editor'}
                                    </Button>
                                </>
                            )}
                            <select 
                                value={language} 
                                onChange={handleLanguageChange} 
                                disabled={role === 'candidate' && isLocked}
                                className="p-1 border rounded bg-card text-xs text-foreground focus:outline-none"
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
                                    <span className="bg-orange-600/90 text-white font-bold px-4 py-1.5 rounded text-xs shadow-lg tracking-wider">
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

                        <PanelResizeHandle className="h-1.5 bg-border hover:bg-purple-600 transition-colors" />

                        {/* Local Run Console */}
                        <Panel defaultSize={30} minSize={20} className="border-t bg-card/10 flex flex-col">
                            <div className="p-2 border-b bg-card/20 flex justify-between items-center">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Execution Console</span>
                                <Button size="sm" onClick={handleRunCode} disabled={isRunning} className="bg-purple-600 hover:bg-purple-700 h-7 text-xs font-bold text-white">
                                    {isRunning ? 'Running...' : 'Run Code'}
                                </Button>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-2 p-2 overflow-hidden h-[120px]">
                                <textarea 
                                    value={customInput} 
                                    onChange={(e) => setCustomInput(e.target.value)} 
                                    placeholder="Enter input here..."
                                    className="w-full h-full p-2 border rounded font-mono text-xs resize-none bg-background text-foreground"
                                />
                                <pre className="w-full h-full p-2 border rounded bg-muted text-foreground font-mono text-xs overflow-y-auto whitespace-pre-wrap">
                                    {runOutput || 'Execution results will appear here...'}
                                </pre>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-border hover:bg-purple-600 transition-colors" />

                {/* Right Panel: Interviewer Private Notes & Feedback (visible only to interviewer) */}
                <Panel defaultSize={20} minSize={15} className="border-l flex flex-col h-full bg-card/10">
                    {role === 'interviewer' ? (
                        <div className="flex-1 flex flex-col p-4 space-y-6 h-full overflow-y-auto">
                            <div className="flex flex-col flex-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">Private Notes</label>
                                <textarea 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)} 
                                    placeholder="Write candidate evaluation notes..."
                                    className="flex-1 w-full p-3 border rounded bg-background text-foreground text-xs resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 h-[150px]"
                                />
                                <Button size="xs" onClick={handleSaveNotes} className="bg-white/10 hover:bg-white/20 text-xs font-bold border mt-2 text-white h-7">
                                    Save Notes
                                </Button>
                            </div>

                            <div className="flex flex-col flex-1 border-t border-white/10 pt-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">Final Summary Feedback</label>
                                <textarea 
                                    value={feedback} 
                                    onChange={(e) => setFeedback(e.target.value)} 
                                    placeholder="Write candidate feedback summary..."
                                    className="flex-1 w-full p-3 border rounded bg-background text-foreground text-xs resize-none focus:outline-none focus:ring-1 focus:ring-purple-500 h-[150px]"
                                />
                                <Button onClick={handleCompleteInterview} className="bg-green-600 hover:bg-green-700 text-xs font-bold text-white mt-4 py-2">
                                    Complete & Submit Review
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center p-6 text-center text-gray-400">
                            <div>
                                <span className="text-3xl block mb-3">🧑‍💻</span>
                                <h4 className="font-bold text-white mb-2">Candidate Workspace</h4>
                                <p className="text-xs">Your interviewer is observing your logic, code typing, and communication in real-time.</p>
                            </div>
                        </div>
                    )}
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default InterviewRoomPage;
