import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await api.delete(`/courses/${id}`);
                setCourses(courses.filter(course => course._id !== id));
            } catch (error) {
                console.error('Failed to delete course', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-admin-bg p-8 text-gray-800">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-lg border border-admin-pink/20">
                    <div>
                        <h1 className="text-3xl font-bold text-admin-red">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-admin-red text-white rounded hover:bg-admin-red/90 transition shadow-sm"
                    >
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow border border-admin-pink/20">
                            <h3 className="font-bold text-admin-red mb-4">Quick Actions</h3>
                            <button
                                onClick={() => navigate('/admin/create-course')}
                                className="w-full py-2 bg-admin-pink text-white rounded hover:bg-admin-pink/90 transition mb-2"
                            >
                                + Create New Course
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-bold text-admin-red mb-6">Manage Courses</h2>

                        {loading ? (
                            <p>Loading courses...</p>
                        ) : (
                            <div className="space-y-4">
                                {courses.length === 0 ? (
                                    <p className="text-gray-500 italic">No courses found. Create one to get started.</p>
                                ) : (
                                    courses.map(course => (
                                        <div key={course._id} className="bg-white p-6 rounded-xl shadow border border-admin-pink/20 flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                    {course.coverImage !== 'no-photo.jpg' ? (
                                                        <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{course.title}</h3>
                                                    <p className="text-sm text-gray-500">{course.modules?.length || 0} Modules • {course.isPublished ? <span className="text-green-600 font-medium">Published</span> : <span className="text-orange-500 font-medium">Draft</span>}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => navigate(`/admin/edit-course/${course._id}`)}
                                                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(course._id)}
                                                    className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
