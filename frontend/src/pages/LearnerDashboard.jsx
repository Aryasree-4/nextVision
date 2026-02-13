import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ProfileIcon from '../components/ProfileIcon';
import Button from '../components/Button';
import LearningContainer from '../components/LearningContainer';
import ConfirmModal from '../components/ConfirmModal';

const LearnerDashboard = () => {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);

    // Modal state
    const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
    const [unenrollTarget, setUnenrollTarget] = useState(null);

    useEffect(() => {
        fetchCourses();
        fetchMyEnrollments();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses?published=true');
            if (Array.isArray(data)) {
                setCourses(data);
            }
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchMyEnrollments = async () => {
        try {
            const { data } = await api.get('/classrooms/my-enrollments');
            if (Array.isArray(data)) {
                setMyEnrollments(data);
            }
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
            fetchMyEnrollments();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to enroll.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async () => {
        if (!unenrollTarget) return;
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/classrooms/unenroll', { classroomId: unenrollTarget });
            setMessage({ type: 'success', text: 'Successfully withdrawn from the course. You can now enroll in a new subject.' });
            fetchMyEnrollments();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to quit course.' });
        } finally {
            setLoading(false);
            setUnenrollTarget(null);
        }
    };

    const isEnrolled = (courseId) => {
        if (!Array.isArray(myEnrollments)) return false;
        return myEnrollments.some(enrollment => enrollment && enrollment.course?._id === courseId);
    };

    // Check if user has ANY incomplete enrollment
    const hasActiveEnrollment = Array.isArray(myEnrollments) && myEnrollments.some(e => {
        // We'll need to check the Progress model eventually, but for now 
        // we can assume if they are in an enrollment listed here, it's active.
        // Unless we add a status field to Enrollment/Classroom.
        // Actually, the server rule checks for 'isCourseCompleted: false' in Progress.
        // For the UI, we'll just check if they are in ANY course.
        return true; // Simplified for now, will refine if there's a completion flag on enrollment
    }) && myEnrollments.length > 0;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-transparent p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-space-blue/50 backdrop-blur-md p-6 rounded-lg text-white shadow-md border border-white/10">
                    <div>
                        <h1 className="text-3xl font-bold">Learner Dashboard</h1>
                        <p className="text-gray-300">Welcome, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <ProfileIcon />
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600/90 text-white rounded hover:bg-red-700 transition shadow-sm backdrop-blur-sm"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {message.text && (
                    <div className={`mb-8 p-4 rounded-xl border animate-fade-in ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-green-500/10 border-green-500/20 text-green-200'} backdrop-blur-md shadow-lg`}>
                        {message.type === 'error' ? '❌' : '✅'} {message.text}
                    </div>
                )}

                {/* --- MY LEARNING JOURNEY --- */}
                {Array.isArray(myEnrollments) && myEnrollments.length > 0 && (
                    <div className="mb-12 animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-1.5 bg-space-light rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">My Learning Journey</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myEnrollments.map(enrollment => {
                                if (!enrollment || !enrollment.course) return null;
                                const course = enrollment.course;
                                return (
                                    <div key={enrollment._id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 group shadow-2xl relative">
                                        <div className="h-40 bg-gray-900 relative">
                                            {course.coverImage && course.coverImage !== 'no-photo.jpg' ? (
                                                <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                    <span className="text-4xl">🚀</span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-space-light/20 backdrop-blur-md text-space-light border border-space-light/30 text-[10px] tracking-widest font-black px-3 py-1 rounded-full shadow-lg">
                                                IN PROGRESS
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="mb-4">
                                                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-space-light transition-colors">{course.title}</h4>
                                                <p className="text-xs text-gray-500 font-medium italic">Mentor: {enrollment.mentor?.name || 'TBA'}</p>
                                            </div>

                                            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                                                <button
                                                    onClick={() => setSelectedEnrollment(enrollment)}
                                                    className="w-full py-3 bg-space-light text-white rounded-xl font-bold hover:bg-space-light/80 transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <span>Continue Learning</span>
                                                    <span className="text-lg">→</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setUnenrollTarget(enrollment._id);
                                                        setShowUnenrollConfirm(true);
                                                    }}
                                                    className="w-full py-2 text-[10px] font-bold text-gray-500 hover:text-red-400 uppercase tracking-widest transition-colors text-center"
                                                >
                                                    Withdraw from Course
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- AVAILABLE COURSES --- */}
                <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-white/5 min-h-[400px]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Explore More Courses</h2>
                            <p className="text-sm text-gray-500 mt-1">Discover new skills and broaden your horizons.</p>
                        </div>
                        {hasActiveEnrollment && (
                            <div className="text-[10px] tracking-tighter font-bold text-amber-500 bg-amber-500/5 px-6 py-2 rounded-2xl border border-amber-500/20 shadow-inner flex items-center gap-2">
                                <span className="text-base leading-none">🔒</span> ENROLLMENT LOCKED: COMPLETE YOUR ACTIVE SUBJECT FIRST
                            </div>
                        )}
                    </div>

                    {(!Array.isArray(courses) || courses.filter(c => !isEnrolled(c?._id)).length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/2 rounded-2xl border border-dashed border-white/10 text-center">
                            <span className="text-5xl mb-4 opacity-20">🎓</span>
                            <p className="text-gray-500 font-medium">No new courses available to join right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.filter(c => !isEnrolled(c?._id)).map(course => {
                                if (!course) return null;
                                const isLocked = hasActiveEnrollment;

                                return (
                                    <div key={course._id} className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group flex flex-col h-full ${isLocked ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1'}`}>
                                        <div className="h-44 bg-gray-900 relative overflow-hidden">
                                            {course.coverImage && course.coverImage !== 'no-photo.jpg' ? (
                                                <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-space-blue/20">
                                                    <span className="text-4xl opacity-10">📖</span>
                                                </div>
                                            )}
                                            {isLocked && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                                                    <div className="bg-black/60 p-3 rounded-full border border-white/10 shadow-2xl">
                                                        <span className="text-2xl leading-none">🔒</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h4 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-space-light transition-colors">{course.title}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-3 mb-6 flex-grow leading-relaxed font-medium">{course.description}</p>

                                            <div className="flex justify-between items-center mb-6 pt-4 border-t border-white/5">
                                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                                                    {course.modules?.length || 0} Modules
                                                </span>
                                            </div>

                                            <Button
                                                onClick={() => handleEnroll(course._id)}
                                                isLoading={loading}
                                                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${isLocked ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border-none' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                                disabled={isLocked}
                                            >
                                                {isLocked ? 'Pathway Locked' : 'Start Journey'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {selectedEnrollment && (
                    <LearningContainer
                        classroom={selectedEnrollment}
                        enrollment={selectedEnrollment}
                        onClose={() => {
                            setSelectedEnrollment(null);
                            fetchMyEnrollments();
                        }}
                    />
                )}

                {/* Modern Confirmation Modal */}
                <ConfirmModal
                    isOpen={showUnenrollConfirm}
                    onClose={() => setShowUnenrollConfirm(false)}
                    onConfirm={handleUnenroll}
                    title="Withdraw from Course?"
                    message="You will lose your progress and your priority spot in the classroom. This action cannot be undone."
                    confirmText="Yes, Withdraw"
                    variant="danger"
                />
            </div>
        </div>
    );
};

export default LearnerDashboard;
