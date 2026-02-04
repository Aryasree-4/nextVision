import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import LearnerDashboard from './pages/LearnerDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourseForm from './pages/AdminCourseForm';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['learner']} />}>
        <Route path="/learner-dashboard" element={<LearnerDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-course" element={<AdminCourseForm />} />
        <Route path="/admin/edit-course/:id" element={<AdminCourseForm />} />
      </Route>

      {/* Fallback for /dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Navigate to="/learner-dashboard" replace />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
