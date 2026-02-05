import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';

const LearnerDashboard = () => {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCourses();
        fetchMyEnrollments();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses?published=true');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchMyEnrollments = async () => {
        try {
            const { data } = await api.get('/classrooms/my-enrollments');
            setMyEnrollments(data);
        } catch (error) {
            console.error('Failed to fetch enrollments', error);
        }
    };

    const handleEnroll = async (courseId) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/classrooms/enroll', { courseId });
            setMessage({ type: 'success', text: 'Enrolled successfully! You have been assigned to a classroom.' });
            fetchMyEnrollments(); // Refresh enrollments to show new status
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to enroll. Course might be full or unavailable.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async (classroomId) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/classrooms/unenroll', { classroomId });
            setMessage({ type: 'success', text: 'Successfully quit the course.' });
            fetchMyEnrollments();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to quit course.' });
        } finally {
            setLoading(false);
        }
    };

    const isEnrolled = (courseId) => {
        return myEnrollments.some(enrollment => enrollment.course?._id === courseId);
    };

    return (
        <div className="min-h-screen bg-transparent p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-space-blue/50 backdrop-blur-md p-6 rounded-lg text-white shadow-md border border-white/10">
                    <div>
                        <h1 className="text-3xl font-bold">Learner Dashboard</h1>
                        <p className="text-gray-300">Welcome, {user?.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600/90 text-white rounded hover:bg-red-700 transition shadow-sm backdrop-blur-sm"
                    >
                        Logout
                    </button>
                </header>

                {message.text && (
                    <div className={`mb-6 p-4 rounded ${message.type === 'error' ? 'bg-red-500/80' : 'bg-green-500/80'} text-white shadow-lg`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-space-blue/30 backdrop-blur-md rounded-lg shadow-xl p-6 border border-white/10">
                    <h2 className="text-2xl font-semibold mb-6 text-white border-b border-white/10 pb-4">Available Courses</h2>

                    {courses.length === 0 ? (
                        <p className="text-gray-400">No courses available at the moment.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => {
                                const enrolled = isEnrolled(course._id);
                                return (
                                    <div key={course._id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/15 transition group flex flex-col h-full">
                                        <div className="h-48 bg-gray-800 relative">
                                            {course.coverImage && course.coverImage !== 'no-photo.jpg' ? (
                                                <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-900">
                                                    <span className="text-4xl opacity-20">📚</span>
                                                </div>
                                            )}
                                            {enrolled && (
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                                                    ENROLLED
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-space-light transition">{course.title}</h4>
                                            <p className="text-sm text-gray-300 line-clamp-3 mb-4 flex-grow">{course.description}</p>

                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">{course.modules?.length || 0} Modules</span>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                                                {enrolled ? (
                                                    <>
                                                        <button className="w-full py-2 bg-green-600/80 text-white rounded cursor-default">
                                                            Continue Learning
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const enrollment = myEnrollments.find(e => e.course?._id === course._id);
                                                                if (enrollment && window.confirm('Are you sure you want to quit this course? You will lose your spot in the classroom.')) {
                                                                    handleUnenroll(enrollment._id);
                                                                }
                                                            }}
                                                            className="w-full py-1 text-sm text-red-400 hover:text-red-300 hover:underline"
                                                        >
                                                            Quit Course
                                                        </button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleEnroll(course._id)}
                                                        isLoading={loading}
                                                        className="w-full"
                                                    >
                                                        Enroll Now
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LearnerDashboard;
