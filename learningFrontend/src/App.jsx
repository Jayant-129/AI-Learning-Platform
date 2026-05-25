import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LearnersPage from './pages/LearnersPage';
import LearnerDetailPage from './pages/LearnerDetailPage';
import PlacementDrivesPage from './pages/PlacementDrivesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import PredictionsPage from './pages/PredictionsPage';
import NotificationsPage from './pages/NotificationsPage';
import AssessmentsPage from './pages/AssessmentsPage';
import UsersPage from './pages/UsersPage';
import MyProfilePage from './pages/MyProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="learners" element={<LearnersPage />} />
                <Route path="learners/:id" element={<LearnerDetailPage />} />
                <Route path="assessments" element={<AssessmentsPage />} />
                <Route path="placements" element={<PlacementDrivesPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="predictions" element={<PredictionsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="my-profile" element={<MyProfilePage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              toastStyle={{
                background: '#1e293b',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
                color: '#e2e8f0',
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
