import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { UserProvider, useUser } from './context/UserContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Kanban from './pages/Kanban';
import Members from './pages/Members';
import Login from './pages/Login';


function AppContent() {
  const { currentUser, loading } = useUser();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!currentUser) return <Login />;

  return (
    <TaskProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="members" element={<Members />} />

          <Route path="*" element={<div>Not Found</div>} />
        </Route>
      </Routes>
    </TaskProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
