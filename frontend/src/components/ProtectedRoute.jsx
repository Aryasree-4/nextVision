import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
