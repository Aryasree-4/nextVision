import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ProfileIcon from '../components/ProfileIcon';
import Button from '../components/Button';
import LearningContainer from '../components/LearningContainer';
import ConfirmModal from '../components/ConfirmModal';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';

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
            setMessage({ type: 'success', text: 'Successfully withdrawn from the course.' });
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

    const hasActiveEnrollment = Array.isArray(myEnrollments) && myEnrollments.length > 0;

    if (!user) return null;

    return (
        <div className="min-h-screen px-6 py-10 relative overflow-hidden font-body">
            <SpaceBackground mode="static" />

            <div className="max-w-7xl mx-auto space-y-12">
                <GlassCard className="p-8 flex flex-col md:flex-row justify-between items-center gap-6" hover={false}>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-1">Learner Dashboard</h1>
                        <p className="text-gray-400 font-light tracking-wide">Welcome back, <span className="text-space-light font-medium">{user?.name}</span>.</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="glass-panel p-1.5 rounded-full border-white/10">
                            <ProfileIcon />
                        </div>
                        <button
                            onClick={logout}
                            className="text-gray-500 hover:text-error text-xs font-black uppercase tracking-[0.2em] transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </GlassCard>

                {message.text && (
                    <div className={`p-4 rounded-xl border animate-fade-in ${message.type === 'error' ? 'bg-error/10 border-error/20 text-error' : 'bg-success/10 border-success/20 text-success'} backdrop-blur-md shadow-lg flex items-center gap-3 text-sm`}>
                        <span>{message.type === 'error' ? '❌' : '✅'}</span>
                        {message.text}
                    </div>
                )}

                {/* --- MY LEARNING JOURNEY --- */}
                {Array.isArray(myEnrollments) && myEnrollments.length > 0 && (
                    <section className="animate-fade-in">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-6 w-1 bg-space-light rounded-full"></div>
                            <h2 className="text-xl font-bold text-white tracking-[0.1em] uppercase">My Courses</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myEnrollments.map(enrollment => {
                                if (!enrollment || !enrollment.course) return null;
                                const course = enrollment.course;
                                return (
                                    <GlassCard key={enrollment._id} className="overflow-hidden flex flex-col h-full group">
                                        <div className="h-44 bg-gray-900 relative">
                                            {course.coverImage && course.coverImage !== 'no-photo.jpg' ? (
                                                <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/10 text-6xl">🚀</div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-space-navy/80 backdrop-blur-md text-space-light border border-space-light/20 text-[10px] tracking-[0.2em] font-black px-4 py-1.5 rounded-full uppercase shadow-xl">
                                                In Progress
                                            </div>
                                        </div>

                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="mb-8">
                                                <h4 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-space-light transition-colors">{course.title}</h4>
                                                <p className="text-xs text-gray-500 font-medium">Mentor: {enrollment.mentor?.name || 'TBA'}</p>
                                            </div>

                                            <div className="flex flex-col gap-4 mt-auto">
                                                <Button
                                                    onClick={() => setSelectedEnrollment(enrollment)}
                                                    className="w-full py-4 text-xs font-black uppercase tracking-[0.2em]"
                                                >
                                                    Continue Learning
                                                </Button>
                                                <button
                                                    onClick={() => {
                                                        setUnenrollTarget(enrollment._id);
                                                        setShowUnenrollConfirm(true);
                                                    }}
                                                    className="w-full py-2 text-[10px] font-bold text-gray-600 hover:text-error uppercase tracking-[0.2em] transition-colors"
                                                >
                                                    Leave Course
                                                </button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* --- AVAILABLE COURSES --- */}
                <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-white/5 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-6 w-1 bg-white/10 rounded-full"></div>
                            <h2 className="text-xl font-bold text-white tracking-[0.1em] uppercase">Available Classes</h2>
                        </div>
                        {hasActiveEnrollment && (
                            <div className="text-[10px] tracking-widest font-black text-warning bg-warning/5 px-6 py-2.5 rounded-full border border-warning/10 flex items-center gap-3 uppercase">
                                <span>🔒</span> Concurrent Pathways Restricted
                            </div>
                        )}
                    </div>

                    {(!Array.isArray(courses) || courses.filter(c => !isEnrolled(c?._id)).length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-24 glass-panel border-dashed text-center opacity-40">
                            <span className="text-6xl mb-6">🔭</span>
                            <p className="text-gray-400 font-light">No new classes available at this time.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.filter(c => !isEnrolled(c?._id)).map(course => {
                                if (!course) return null;
                                const isLocked = hasActiveEnrollment;

                                return (
                                    <GlassCard key={course._id} className={`flex flex-col h-full group ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                        <div className="h-44 bg-gray-900 relative overflow-hidden">
                                            {course.coverImage && course.coverImage !== 'no-photo.jpg' ? (
                                                <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/5 text-6xl">📖</div>
                                            )}
                                            {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-4xl">🔒</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-8 flex-1 flex flex-col">
                                            <h4 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-space-light transition-colors">{course.title}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-3 mb-8 flex-grow leading-relaxed font-light">{course.description}</p>

                                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                                                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                    {course.modules?.length || 0} Modules
                                                </span>
                                            </div>

                                            <Button
                                                onClick={() => handleEnroll(course._id)}
                                                isLoading={loading}
                                                disabled={isLocked}
                                                variant={isLocked ? 'secondary' : 'primary'}
                                                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                                            >
                                                {isLocked ? 'Class Locked' : 'Join Class'}
                                            </Button>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    )}
                </section>

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

                <ConfirmModal
                    isOpen={showUnenrollConfirm}
                    onClose={() => setShowUnenrollConfirm(false)}
                    onConfirm={handleUnenroll}
                    title="Leave Learning Course?"
                    message="You will lose access to this course content. You can re-enroll later."
                    confirmText="Leave Course"
                    variant="danger"
                />
            </div>
        </div>
    );
};

export default LearnerDashboard;
