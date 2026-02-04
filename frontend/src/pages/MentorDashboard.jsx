import { useAuth } from '../context/AuthContext';

const MentorDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-transparent p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-space-blue/50 backdrop-blur-md p-6 rounded-lg text-white shadow-md border border-white/10">
                    <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600/90 text-white rounded hover:bg-red-700 transition shadow-sm backdrop-blur-sm"
                    >
                        Logout
                    </button>
                </header>
                <div className="bg-space-blue/30 backdrop-blur-md rounded-lg shadow-xl p-6 border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-white">Welcome, Mentor {user?.name}!</h2>
                    <p className="text-gray-300">You are logged in as a <strong>{user?.role}</strong>.</p>
                    <div className="mt-8 border-t border-white/10 pt-4">
                        <h3 className="text-lg font-medium text-gray-200">Course Management</h3>
                        <button className="mt-4 px-4 py-2 bg-space-light text-white rounded hover:bg-blue-600 transition shadow-sm ring-1 ring-white/20">
                            Create New Course
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorDashboard;
