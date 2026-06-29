// client/src/pages/PairProgrammingPage.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { AuthContext } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useTheme } from "@/components/ThemeProvider";

const PairProgrammingPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { authUser } = useContext(AuthContext);
    const { theme } = useTheme();

    // Landing view states
    const [rooms, setRooms] = useState([]);
    const [newRoomTitle, setNewRoomTitle] = useState('');
    const [problems, setProblems] = useState([]);
    const [selectedProblemId, setSelectedProblemId] = useState('');
    const [loadingRooms, setLoadingRooms] = useState(true);

    // Workspace states
    const [roomInfo, setRoomInfo] = useState(null);
    const [code, setCode] = useState('// Collaborate on code here!');
    const [language, setLanguage] = useState('cpp');
    const [activeUsers, setActiveUsers] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [customInput, setCustomInput] = useState('');
    const [runOutput, setRunOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [remoteCursors, setRemoteCursors] = useState({});

    const socketRef = useRef(null);
    const editorRef = useRef(null);
    const cursorDecorationsRef = useRef([]);

    // Fetch lists for landing view
    useEffect(() => {
        if (!roomId && authUser) {
            const fetchData = async () => {
                try {
                    const [roomsRes, problemsRes] = await Promise.all([
                        axios.get('/api/rooms'),
                        axios.get('/api/problems')
                    ]);
                    setRooms(roomsRes.data);
                    setProblems(problemsRes.data);
                    if (problemsRes.data.length > 0) {
                        setSelectedProblemId(problemsRes.data[0]._id);
                    }
                } catch (err) {
                    console.error('Error fetching landing data', err);
                } finally {
                    setLoadingRooms(false);
                }
            };
            fetchData();
        }
    }, [roomId, authUser]);

    // Room connection and Socket.io setup
    useEffect(() => {
        if (roomId && authUser) {
            // Fetch initial room details
            const fetchRoomDetails = async () => {
                try {
                    const res = await axios.get(`/api/rooms/${roomId}`);
                    setRoomInfo(res.data);
                    setCode(res.data.code);
                    setLanguage(res.data.language);
                    setChatMessages(res.data.chat || []);
                } catch (err) {
                    console.error('Failed to load room details', err);
                    alert('Room not found or unauthorized');
                    navigate('/pair-programming');
                }
            };
            fetchRoomDetails();

            // Connect Socket
            const socket = io('http://localhost:5001', { withCredentials: true });
            socketRef.current = socket;

            socket.on('connect', () => {
                socket.emit('join-room', {
                    roomId,
                    userId: authUser._id,
                    username: authUser.username
                });
            });

            // Listen to real-time code changes
            socket.on('code-change', ({ code: newCode, language: newLang }) => {
                setCode(newCode);
                setLanguage(newLang);
            });

            // Listen to remote cursors
            socket.on('cursor-move', ({ cursor, username, socketId }) => {
                setRemoteCursors(prev => ({
                    ...prev,
                    [socketId]: { cursor, username }
                }));
            });

            // Listen to chat
            socket.on('receive-message', (chatMsg) => {
                setChatMessages(prev => [...prev, chatMsg]);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [roomId, authUser, navigate]);

    // Redraw cursor decorations whenever remoteCursors changes
    useEffect(() => {
        if (editorRef.current && Object.keys(remoteCursors).length > 0) {
            const editor = editorRef.current;
            const newDecorations = [];

            Object.entries(remoteCursors).forEach(([socketId, data]) => {
                const { cursor, username } = data;
                if (cursor) {
                    newDecorations.push({
                        range: new window.monaco.Range(
                            cursor.lineNumber,
                            cursor.column,
                            cursor.lineNumber,
                            cursor.column + 1
                        ),
                        options: {
                            className: 'bg-purple-600 w-[2px] animate-pulse',
                            hoverMessage: { value: username }
                        }
                    });
                }
            });

            cursorDecorationsRef.current = editor.deltaDecorations(
                cursorDecorationsRef.current,
                newDecorations
            );
        }
    }, [remoteCursors]);

    // Handle Editor mount
    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        // Monitor cursor position changes
        editor.onDidChangeCursorPosition((e) => {
            if (socketRef.current) {
                socketRef.current.emit('cursor-move', {
                    roomId,
                    cursor: e.position,
                    username: authUser.username
                });
            }
        });
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/rooms', {
                title: newRoomTitle || 'Untitled Collaboration Room',
                problemId: selectedProblemId
            });
            navigate(`/pair-programming/${res.data.roomId}`);
        } catch (err) {
            alert('Failed to create room: ' + err.message);
        }
    };

    const handleCodeChange = (value) => {
        setCode(value);
        if (socketRef.current) {
            socketRef.current.emit('code-change', {
                roomId,
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
                roomId,
                code,
                language: newLang
            });
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (socketRef.current) {
            socketRef.current.emit('send-message', {
                roomId,
                username: authUser.username,
                message: newMessage
            });
            setNewMessage('');
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

    // LANDING VIEW (Room creation/list)
    if (!roomId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12 text-slate-800 dark:text-white">
                <h1 className="text-4xl font-extrabold mb-8 text-slate-900 dark:text-white">
                    Pair Programming Rooms
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Create Room Form */}
                    <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-8 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5">
                        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Create Collaborative Session</h2>
                        <form onSubmit={handleCreateRoom} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Room Title</label>
                                <input 
                                    type="text" 
                                    value={newRoomTitle}
                                    onChange={(e) => setNewRoomTitle(e.target.value)}
                                    placeholder="Sync Session Name"
                                    className="w-full px-4 py-2.5 border border-purple-100 dark:border-purple-900/35 text-slate-900 dark:text-white bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/80 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Target Problem</label>
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
                                Create Room
                            </Button>
                        </form>
                    </div>

                    {/* Active Rooms List */}
                    <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-8 border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 flex flex-col">
                        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Active Coding Rooms</h2>
                        {loadingRooms ? (
                            <p className="text-slate-400 font-bold animate-pulse">Loading active sessions...</p>
                        ) : rooms.length > 0 ? (
                            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                                {rooms.map(room => (
                                    <div key={room.roomId} className="flex justify-between items-center p-4 bg-purple-50/30 dark:bg-slate-950/20 rounded-xl border border-purple-100/50 hover:border-purple-300 dark:hover:border-purple-800 transition-all">
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{room.title}</h4>
                                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">Problem: {room.problemId?.title || 'General Sandbox'}</p>
                                        </div>
                                        <Button onClick={() => navigate(`/pair-programming/${room.roomId}`)} variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-xl h-8">
                                            Join Room
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 my-auto text-center text-sm font-semibold py-8">No active rooms found. Start one above!</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // WORKSPACE VIEW (Collaborative editor)
    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-background text-slate-800 dark:text-white transition-colors duration-200">
            <PanelGroup direction="horizontal" className="flex-1">
                {/* Left Side: Problem Statement */}
                <Panel defaultSize={30} minSize={20} className="border-r border-purple-100 dark:border-purple-950/20 flex flex-col h-full bg-purple-50/10 dark:bg-slate-950/5">
                    <div className="p-6 overflow-y-auto flex-1">
                        {roomInfo?.problemId ? (
                            <div>
                                <h2 className="text-2xl font-extrabold mb-2 text-slate-900 dark:text-white">{roomInfo.problemId.title}</h2>
                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${roomInfo.problemId.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : roomInfo.problemId.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {roomInfo.problemId.difficulty}
                                </span>
                                <div className="mt-6 prose dark:prose-invert text-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                                    <p className="whitespace-pre-wrap">{roomInfo.problemId.statement}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center pt-20 text-slate-400">
                                <h3>General Collaboration Sandbox</h3>
                                <p className="text-xs mt-2">Write, edit and execute code together.</p>
                            </div>
                        )}
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-purple-100 dark:bg-purple-950 hover:bg-purple-500 transition-colors" />

                {/* Middle: Editor & Run Console */}
                <Panel defaultSize={50} minSize={30} className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-3 border-b border-purple-100 dark:border-purple-950/20 bg-purple-50/20 dark:bg-slate-900/10">
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Room: {roomInfo?.title}</span>
                        <select 
                            value={language} 
                            onChange={handleLanguageChange} 
                            className="p-1 border border-purple-100 dark:border-purple-950 text-xs rounded-lg bg-card text-foreground focus:outline-none"
                        >
                            <option value="cpp">C++</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                        </select>
                    </div>

                    <PanelGroup direction="vertical" className="flex-grow">
                        <Panel defaultSize={70} minSize={30}>
                            <Editor 
                                height="100%" 
                                language={language} 
                                value={code} 
                                onChange={handleCodeChange}
                                onMount={handleEditorDidMount}
                                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineHeight: 22
                                }}
                            />
                        </Panel>

                        <PanelResizeHandle className="h-1.5 bg-purple-100 dark:bg-purple-950 hover:bg-purple-500 transition-colors" />

                        {/* Custom Run Console */}
                        <Panel defaultSize={30} minSize={20} className="border-t border-purple-100 dark:border-purple-950/20 bg-purple-50/10 dark:bg-slate-900/10 flex flex-col">
                            <div className="p-2 border-b border-purple-100 dark:border-purple-950/10 bg-purple-50/20 dark:bg-slate-900/20 flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collaborative Console</span>
                                <Button size="sm" onClick={handleRunCode} disabled={isRunning} className="bg-purple-600 hover:bg-purple-700 h-7 text-xs font-bold text-white rounded-lg px-3 shadow-md">
                                    {isRunning ? 'Running...' : 'Run Code'}
                                </Button>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-2 p-2 overflow-hidden h-[120px]">
                                <textarea 
                                    value={customInput} 
                                    onChange={(e) => setCustomInput(e.target.value)} 
                                    placeholder="Enter input here..."
                                    className="w-full h-full p-2 border border-purple-100 dark:border-purple-900/35 rounded-xl font-mono text-xs bg-background text-foreground focus:outline-none resize-none"
                                />
                                <pre className="w-full h-full p-2 border border-purple-100 dark:border-purple-900/35 rounded-xl bg-slate-950 text-purple-200 font-mono text-xs overflow-y-auto whitespace-pre-wrap">
                                    {runOutput || 'Execution outputs appear here...'}
                                </pre>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>

                <PanelResizeHandle className="w-1.5 bg-purple-100 dark:bg-purple-950 hover:bg-purple-500 transition-colors" />

                {/* Right Side: Chat Panel */}
                <Panel defaultSize={20} minSize={15} className="border-l border-purple-100 dark:border-purple-950/20 flex flex-col h-full bg-purple-50/10 dark:bg-slate-950/5">
                    <div className="p-3 border-b border-purple-100 dark:border-purple-950/20 bg-purple-50/20 dark:bg-slate-900/20 font-bold text-xs uppercase tracking-wider text-slate-400">
                        Room Chat
                    </div>
                    {/* Chat Messages */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-3 flex flex-col">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className="flex flex-col bg-white dark:bg-slate-900/60 rounded-xl p-2.5 max-w-[90%] border border-purple-100 dark:border-purple-950/20 self-start shadow-sm shadow-purple-950/5">
                                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 font-mono mb-1">{msg.username}</span>
                                <span className="text-xs text-slate-800 dark:text-slate-200 break-words leading-relaxed">{msg.message}</span>
                            </div>
                        ))}
                    </div>
                    {/* Input message form */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-purple-100 dark:border-purple-950/20 bg-purple-50/20 dark:bg-slate-900/20 flex gap-2">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-3 py-1.5 border border-purple-100 dark:border-purple-900/35 rounded-xl text-xs bg-background text-foreground focus:outline-none"
                        />
                        <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs text-white font-bold h-8 rounded-xl px-3.5 shadow-md">
                            Send
                        </Button>
                    </form>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default PairProgrammingPage;
