// client/src/App.jsx
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { useTheme } from './components/ThemeProvider'; 
import { Toaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddProblemPage from './pages/AddProblemPage';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import ProblemsListPage from './pages/ProblemsListPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import AdminProblemsListPage from './pages/AdminProblemsListPage';
import EditProblemPage from './pages/EditProblemPage';

import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PairProgrammingPage from './pages/PairProgrammingPage';
import InterviewRoomPage from './pages/InterviewRoomPage';
import { CursorTrail } from './components/CursorTrail';

const HomePage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      {/* Launch Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/40 border border-purple-200/50 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
        <span>✨</span> AlgoNest V2 is officially Live
      </div>

      {/* Hero Headline */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.1] mb-6">
        The Intelligent Workspace for
        <br />
        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Mastering Algorithms
        </span>
      </h1>

      {/* Hero Subtitle */}
      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-10">
        Accelerate your software engineering growth with real-time pair programming, isolated async code runner execution, and progressive AI coaching.
      </p>

      {/* Call to Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
        <Link to="/problems">
          <button className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 transition-all hover:-translate-y-0.5 duration-200 cursor-pointer">
            Explore Problems
          </button>
        </Link>
        <Link to="/pair-programming">
          <button className="px-8 py-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 hover:border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 font-bold transition-all hover:-translate-y-0.5 duration-200 cursor-pointer">
            Collaborative Coding
          </button>
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
        <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-xl mb-6">
            💻
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Real-Time Pairing</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Code simultaneously in our Monaco Editor. Sync selections, cursors, custom run diagnostics, and voice chat immediately.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-xl mb-6">
            🤖
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">AI-Powered Coaching</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Gain hints progressive logic clues, full code reviews, and structured learning roadmaps built from your history.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-8 rounded-2xl border border-purple-100 dark:border-purple-950/30 shadow-xl shadow-purple-950/5 hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-xl mb-6">
            ⚡
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Async Grading Sandbox</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Execute submissions securely inside isolated containers. Grade tests via enqueued BullMQ workers with real-time socket alerts.
          </p>
        </div>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-[#0F0D1E] via-[#16122C] to-[#0A0714]' 
        : 'bg-gradient-to-b from-[#F9F8FF] via-[#F2EEFE] to-[#E7E2FC]'
    }`}>
      <CursorTrail />
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/problems" element={<ProblemsListPage />} />
          <Route path="/problems/:id" element={<ProblemDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Collaborative V2 Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/pair-programming" element={<PairProgrammingPage />} />
          <Route path="/pair-programming/:roomId" element={<PairProgrammingPage />} />
          <Route path="/interview" element={<InterviewRoomPage />} />
          <Route path="/interview/:sessionId" element={<InterviewRoomPage />} />

          {/* Admin-Only Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/problems" element={<AdminProblemsListPage />} />
            <Route path="/admin/add-problem" element={<AddProblemPage />} />
            <Route path="/admin/problems/edit/:id" element={<EditProblemPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;