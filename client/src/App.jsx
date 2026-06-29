// client/src/App.jsx
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useTheme } from './components/ThemeProvider'; // Import useTheme instead of ThemeContext
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

// New V2 Pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PairProgrammingPage from './pages/PairProgrammingPage';
import InterviewRoomPage from './pages/InterviewRoomPage';

const HomePage = () => (
  <div className="flex justify-center items-start pt-32 min-h-[calc(100vh-4rem)]">
    <h1 className="text-3xl text-center text-white">
      Welcome to
      <br />
      <span
        style={{
          fontFamily: 'Consolas, Monaco, monospace',
          letterSpacing: '-0.5px',
          marginTop: '20px',
          fontSize: '70px',
          display: 'inline-block',
        }}
      >
        AlgoNest
      </span>
    </h1>
  </div>
);

const MainLayout = () => {
  const { theme } = useTheme(); // Use the useTheme hook here

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-violet-950 to-violet-900' 
        : 'bg-gradient-to-b from-purple-50 to-violet-100'
    }`}>
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