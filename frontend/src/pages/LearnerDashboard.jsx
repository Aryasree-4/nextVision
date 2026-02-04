import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const LearnerDashboard = () => {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses?published=true');
                setCourses(data);
            } catch (error) {
                console.error('Failed to fetch courses', error);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="min-h-screen bg-transparent p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-space-blue/50 backdrop-blur-md p-6 rounded-lg text-white shadow-md border border-white/10">
                    <h1 className="text-3xl font-bold">Learner Dashboard</h1>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600/90 text-white rounded hover:bg-red-700 transition shadow-sm backdrop-blur-sm"
                    >
                        Logout
                    </button>
                </header>
                <div className="bg-space-blue/30 backdrop-blur-md rounded-lg shadow-xl p-6 border border-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-white">Welcome back, {user?.name}!</h2>
                    <p className="text-gray-300">You are logged in as a <strong>{user?.role}</strong>.</p>

                    <div className="mt-8 border-t border-white/10 pt-4">
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Available Courses</h3>

                        {courses.length === 0 ? (
                            <p className="text-gray-400">No courses available at the moment.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <div key={course._id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/20 transition group cursor-pointer">
                                        <div className="h-40 bg-gray-800 relative">
                                            {course.coverImage !== 'no-photo.jpg' ? (
                                                <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-space-light transition">{course.title}</h4>
                                            <p className="text-sm text-gray-300 line-clamp-2">{course.description}</p>
                                            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                                                <span>{course.modules?.length || 0} Modules</span>
                                                <button className="px-3 py-1 bg-space-light text-white rounded hover:bg-space-blue transition">Start Learning</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnerDashboard;
