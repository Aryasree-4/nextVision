import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import ProfileIcon from '../components/ProfileIcon';
import { useNotifications } from '../context/NotificationContext';

const MentorDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('browse');
    const [courses, setCourses] = useState([]);
    const [myClassrooms, setMyClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [editingTopic, setEditingTopic] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [performanceData, setPerformanceData] = useState([]);
    const [activeSubTab, setActiveSubTab] = useState('syllabus'); // syllabus, performance
    const [editingQuiz, setEditingQuiz] = useState(null); // { moduleIndex, questions }

    const { broadcastNotification } = useNotifications();
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastLink, setBroadcastLink] = useState('');

    useEffect(() => {
        fetchCourses();
        fetchMyClassrooms();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses?published=true');
            if (Array.isArray(data)) setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchMyClassrooms = async () => {
        try {
            const { data } = await api.get('/classrooms/my-classrooms');
            if (Array.isArray(data)) setMyClassrooms(data);
        } catch (error) {
            console.error('Failed to fetch classrooms', error);
        }
    };

    const handleActivateCourse = async (courseId) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/classrooms/activate', { courseId });
            setMessage({ type: 'success', text: 'Course activated! Classroom created.' });
            fetchMyClassrooms();
            setActiveTab('classrooms');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to activate course' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditTopic = (module, topic) => {
        if (!module || !topic) return;
        setEditingTopic({ moduleId: module._id, topicId: topic._id, title: topic.title });
        setEditContent(topic.content || '');
    };

    const handleSaveContent = async () => {
        if (!selectedClassroom || !editingTopic) return;
        setLoading(true);
        try {
            await api.put(`/classrooms/${selectedClassroom._id}/content`, {
                moduleId: editingTopic.moduleId,
                topicId: editingTopic.topicId,
                content: editContent
            });

            // Update local state 
            const updatedClassroom = { ...selectedClassroom };
            const modIndex = updatedClassroom.syllabus.findIndex(m => m._id === editingTopic.moduleId);
            if (modIndex !== -1) {
                const topicIndex = updatedClassroom.syllabus[modIndex].topics.findIndex(t => t._id === editingTopic.topicId);
                if (topicIndex !== -1) {
                    updatedClassroom.syllabus[modIndex].topics[topicIndex].content = editContent;
                    setSelectedClassroom(updatedClassroom);

                    // Also update in myClassrooms list
                    const classroomIndex = myClassrooms.findIndex(c => c._id === selectedClassroom._id);
                    if (classroomIndex !== -1) {
                        const updatedClassrooms = [...myClassrooms];
                        updatedClassrooms[classroomIndex] = updatedClassroom;
                        setMyClassrooms(updatedClassrooms);
                    }
                }
            }

            setEditingTopic(null);
            setMessage({ type: 'success', text: 'Content updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update content' });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkSyllabusViewed = async (classroomId) => {
        try {
            const { data } = await api.put(`/classrooms/${classroomId}/view-syllabus`);
            setSelectedClassroom(data);
            setMessage({ type: 'success', text: 'Syllabus marked as viewed!' });
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveQuiz = async () => {
        if (!selectedClassroom || !editingQuiz) return;
        setLoading(true);
        try {
            const { data } = await api.put(`/classrooms/${selectedClassroom._id}/quiz`, editingQuiz);
            setSelectedClassroom(data);
            setEditingQuiz(null);
            setMessage({ type: 'success', text: 'Quiz updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update quiz' });
        } finally {
            setLoading(false);
        }
    };

    const handleActivateClassroom = async () => {
        if (!selectedClassroom) return;
        setLoading(true);
        try {
            const { data } = await api.put(`/classrooms/${selectedClassroom._id}/activate-now`);
            setSelectedClassroom(data.classroom);
            setMessage({ type: 'success', text: data.message });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Activation failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!selectedClassroom || !broadcastMessage) return;
        setLoading(true);
        try {
            await broadcastNotification(selectedClassroom._id, broadcastMessage, broadcastLink);
            setMessage({ type: 'success', text: 'Broadcast message sent successfully!' });
            setBroadcastMessage('');
            setBroadcastLink('');
            setShowBroadcastModal(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to send broadcast message' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPerformance = async (classroomId) => {
        try {
            const { data } = await api.get(`/classrooms/${classroomId}/performance`);
            setPerformanceData(data);
        } catch (error) {
            console.error('Failed to fetch performance data', error);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-transparent p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-space-blue/50 backdrop-blur-md p-6 rounded-lg text-white shadow-md border border-white/10">
                    <div>
                        <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
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
                    <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-red-500/80' : 'bg-green-500/80'} text-white`}>
                        {message.text}
                    </div>
                )}

                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => { setActiveTab('browse'); setSelectedClassroom(null); }}
                        className={`px-4 py-2 rounded-md transition ${activeTab === 'browse' ? 'bg-space-light text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                    >
                        Browse Courses
                    </button>
                    <button
                        onClick={() => setActiveTab('classrooms')}
                        className={`px-4 py-2 rounded-md transition ${activeTab === 'classrooms' ? 'bg-space-light text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                    >
                        My Classrooms ({Array.isArray(myClassrooms) ? myClassrooms.length : 0})
                    </button>
                </div>

                <div className="bg-space-blue/30 backdrop-blur-md rounded-lg shadow-xl p-6 border border-white/10 min-h-[500px]">
                    {activeTab === 'browse' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.isArray(courses) && courses.map(course => (
                                course && (
                                    <div key={course._id} className="bg-white/10 border border-white/10 rounded-xl overflow-hidden hover:bg-white/15 transition flex flex-col">
                                        <div className="h-40 bg-gray-800 relative">
                                            {course.coverImage && course.coverImage !== 'no-photo.jpg' ? (
                                                <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                                            )}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                                            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{course.description}</p>
                                            <div className="mt-auto">
                                                <Button
                                                    onClick={() => handleActivateCourse(course._id)}
                                                    isLoading={loading}
                                                    className="w-full"
                                                >
                                                    Activate & Create Classroom
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                            {(!Array.isArray(courses) || courses.length === 0) && <p className="text-gray-400">No courses available to activate.</p>}
                        </div>
                    )}

                    {activeTab === 'classrooms' && !selectedClassroom && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.isArray(myClassrooms) && myClassrooms.map(classroom => (
                                classroom && (
                                    <div key={classroom._id} className="bg-white/10 border border-white/10 rounded-xl p-6 hover:bg-white/15 transition cursor-pointer" onClick={() => setSelectedClassroom(classroom)}>
                                        <h3 className="text-xl font-bold text-white mb-2">{classroom.course?.title}</h3>
                                        <p className="text-sm text-gray-300 mb-4">Students: {classroom.students?.length || 0} / 20</p>

                                        {classroom.students && classroom.students.length > 0 && (
                                            <div className="mb-4 bg-black/20 p-3 rounded text-sm">
                                                <p className="text-gray-400 text-xs uppercase mb-2">Enrolled Students:</p>
                                                <ul className="space-y-1">
                                                    {classroom.students.slice(0, 3).map(student => (
                                                        student && (
                                                            <li key={student._id} className="text-white flex items-center gap-2">
                                                                <div className="w-5 h-5 rounded-full bg-space-light/20 flex items-center justify-center text-[10px] overflow-hidden">
                                                                    {student.profilePicture && student.profilePicture !== 'default-profile.png' ?
                                                                        <img src={`http://localhost:5000/uploads/${student.profilePicture}`} alt={student.name} className="w-full h-full object-cover" /> :
                                                                        (student.name?.charAt(0) || '?')
                                                                    }
                                                                </div>
                                                                {student.name}
                                                            </li>
                                                        )
                                                    ))}
                                                    {classroom.students.length > 3 && <li className="text-gray-500 text-xs italic">+{classroom.students.length - 3} more</li>}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold">Status: {classroom.isActive ? 'Active' : 'Inactive'}</div>
                                        <button className="mt-4 text-sm text-space-light hover:underline">Manage Syllabus &rarr;</button>
                                    </div>
                                )
                            ))}
                            {(!Array.isArray(myClassrooms) || myClassrooms.length === 0) && <p className="text-gray-400">You haven't activated any classrooms yet.</p>}
                        </div>
                    )}

                    {activeTab === 'classrooms' && selectedClassroom && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Managing: {selectedClassroom.course?.title}</h2>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowBroadcastModal(true)}
                                        className="bg-space-light hover:bg-space-light/80 text-white px-4 py-2 rounded-md text-sm font-bold shadow-lg shadow-space-light/20 flex items-center gap-2 transition"
                                    >
                                        📢 Broadcast Message
                                    </button>
                                    <div className="flex bg-black/20 rounded-lg p-1">
                                        <button
                                            onClick={() => setActiveSubTab('syllabus')}
                                            className={`px-4 py-1.5 rounded-md text-sm transition ${activeSubTab === 'syllabus' ? 'bg-space-light text-white' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Syllabus & Quizzes
                                        </button>
                                        <button
                                            onClick={() => { setActiveSubTab('performance'); fetchPerformance(selectedClassroom._id); }}
                                            className={`px-4 py-1.5 rounded-md text-sm transition ${activeSubTab === 'performance' ? 'bg-space-light text-white' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Performance Tracking
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {!selectedClassroom.isActive && activeSubTab === 'syllabus' && (
                                <div className="mb-8 bg-blue-900/40 border border-blue-500/30 rounded-xl p-6 backdrop-blur-md">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm">🚀</span>
                                        Classroom Activation Checklist
                                    </h3>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${selectedClassroom.syllabusViewed ? 'bg-green-500' : 'bg-gray-600'}`}>
                                                {selectedClassroom.syllabusViewed ? '✓' : '1'}
                                            </div>
                                            <span className={selectedClassroom.syllabusViewed ? 'text-green-400' : 'text-gray-300'}>View the entire syllabus</span>
                                            {!selectedClassroom.syllabusViewed && (
                                                <button
                                                    onClick={() => handleMarkSyllabusViewed(selectedClassroom._id)}
                                                    className="ml-auto text-xs bg-space-light px-3 py-1 rounded hover:bg-space-light/80"
                                                >
                                                    Mark as Viewed
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${selectedClassroom.quizzes?.some(q => q.moduleIndex === 0) ? 'bg-green-500' : 'bg-gray-600'}`}>
                                                {selectedClassroom.quizzes?.some(q => q.moduleIndex === 0) ? '✓' : '2'}
                                            </div>
                                            <span className={selectedClassroom.quizzes?.some(q => q.moduleIndex === 0) ? 'text-green-400' : 'text-gray-300'}>Create Module 1 Quiz (Min 4 questions)</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleActivateClassroom}
                                        disabled={!selectedClassroom.syllabusViewed || !selectedClassroom.quizzes?.some(q => q.moduleIndex === 0)}
                                        isLoading={loading}
                                        className="w-full md:w-auto"
                                    >
                                        Activate Classroom Now
                                    </Button>
                                </div>
                            )}

                            {activeSubTab === 'performance' ? (
                                <div className="bg-black/20 border border-white/5 rounded-lg overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                                <th className="p-4">Learner Name</th>
                                                <th className="p-4">Module-wise Marks</th>
                                                <th className="p-4">Attempts</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Finished</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-gray-300 divide-y divide-white/5">
                                            {performanceData.map(data => (
                                                <tr key={data._id} className="hover:bg-white/5 transition">
                                                    <td className="p-4">
                                                        <div className="font-medium text-white">{data.studentId?.name}</div>
                                                        <div className="text-xs text-gray-500">{data.studentId?.email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            {data.moduleProgress.map(mp => (
                                                                <div key={mp._id} className={`px-2 py-1 rounded text-[10px] ${mp.passStatus ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`} title={`Module ${mp.moduleIndex + 1}`}>
                                                                    M{mp.moduleIndex + 1}: {mp.quizScore}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {data.moduleProgress.reduce((acc, curr) => acc + curr.attempts, 0)} total
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${data.isCourseCompleted ? 'bg-green-500 text-white' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                            {data.isCourseCompleted ? 'CERTIFIED' : 'IN PROGRESS'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {data.isCourseCompleted ? '✅' : '⏳'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {performanceData.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="p-8 text-center text-gray-500 italic">No student performance data available yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8 bg-black/20 border border-white/5 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Enrolled Learners ({selectedClassroom.students?.length || 0})</h3>
                                        {(!selectedClassroom.students || selectedClassroom.students.length === 0) ? (
                                            <p className="text-gray-400 italic">No students enrolled yet.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {selectedClassroom.students.map(student => (
                                                    student && (
                                                        <div key={student._id} className="flex items-center gap-3 bg-white/5 p-3 rounded hover:bg-white/10 transition group">
                                                            <div className="w-10 h-10 rounded-full bg-space-light/20 flex items-center justify-center text-sm font-bold overflow-hidden">
                                                                {student.profilePicture && student.profilePicture !== 'default-profile.png' ?
                                                                    <img src={`http://localhost:5000/uploads/${student.profilePicture}`} alt={student.name} className="w-full h-full object-cover" /> :
                                                                    (student.name?.charAt(0) || '?')
                                                                }
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-white font-medium">{student.name}</p>
                                                                <a
                                                                    href={`/profile/${student._id}`}
                                                                    className="text-xs text-space-light hover:underline opacity-0 group-hover:opacity-100 transition"
                                                                    onClick={(e) => { e.stopPropagation(); }}
                                                                >
                                                                    View Profile
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        {Array.isArray(selectedClassroom.syllabus) && selectedClassroom.syllabus.map((module, mIndex) => (
                                            module && (
                                                <div key={module._id} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                                    <h3 className="text-lg font-semibold text-space-light mb-3">Module {mIndex + 1}: {module.title}</h3>
                                                    <div className="space-y-3 pl-4 border-l-2 border-white/10">
                                                        {Array.isArray(module.topics) && module.topics.map(topic => (
                                                            topic && (
                                                                <div key={topic._id} className="bg-white/5 p-3 rounded hover:bg-white/10 transition">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h4 className="font-medium text-white">{topic.title}</h4>
                                                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{topic.content}</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleEditTopic(module, topic)}
                                                                            className="text-xs bg-blue-600/50 hover:bg-blue-600 text-white px-2 py-1 rounded transition"
                                                                        >
                                                                            Edit Content
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        ))}
                                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                                            <div className="text-xs text-gray-400">
                                                                {selectedClassroom.quizzes?.some(q => q.moduleIndex === mIndex) ?
                                                                    <span className="text-green-500">✓ Quiz Created ({selectedClassroom.quizzes.find(q => q.moduleIndex === mIndex).questions.length} Questions)</span> :
                                                                    <span className="text-yellow-500/80">⚠ No Quiz Created</span>
                                                                }
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    const existing = selectedClassroom.quizzes?.find(q => q.moduleIndex === mIndex);
                                                                    setEditingQuiz({
                                                                        moduleIndex: mIndex,
                                                                        questions: existing ? existing.questions : [{ question: '', options: ['', '', '', ''], correctAnswer: '' }]
                                                                    });
                                                                }}
                                                                className="text-xs bg-space-light hover:bg-space-light/80 text-white px-3 py-1 rounded transition shadow-sm"
                                                            >
                                                                {selectedClassroom.quizzes?.some(q => q.moduleIndex === mIndex) ? 'Edit Quiz' : 'Add Quiz'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {editingQuiz && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[60] overflow-y-auto">
                        <div className="bg-space-blue border border-white/20 rounded-xl p-8 w-full max-w-4xl shadow-2xl my-8">
                            <h3 className="text-2xl font-bold text-white mb-6">Module {editingQuiz.moduleIndex + 1} Assessment Quiz</h3>
                            <div className="space-y-8 mb-8">
                                {editingQuiz.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="bg-white/5 p-6 rounded-lg border border-white/10 relative group">
                                        <button
                                            onClick={() => {
                                                const newQuestions = [...editingQuiz.questions];
                                                newQuestions.splice(qIndex, 1);
                                                setEditingQuiz({ ...editingQuiz, questions: newQuestions });
                                            }}
                                            className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition"
                                            title="Remove Question"
                                        >
                                            ✕
                                        </button>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Question {qIndex + 1}</label>
                                            <input
                                                type="text"
                                                value={q.question}
                                                onChange={(e) => {
                                                    const newQuestions = [...editingQuiz.questions];
                                                    newQuestions[qIndex].question = e.target.value;
                                                    setEditingQuiz({ ...editingQuiz, questions: newQuestions });
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-white focus:ring-2 focus:ring-space-light outline-none"
                                                placeholder="Enter question text..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex}>
                                                    <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Option {oIndex + 1}</label>
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newQuestions = [...editingQuiz.questions];
                                                            newQuestions[qIndex].options[oIndex] = e.target.value;
                                                            setEditingQuiz({ ...editingQuiz, questions: newQuestions });
                                                        }}
                                                        className="w-full bg-black/20 border border-white/5 rounded p-2 text-sm text-white focus:border-space-light outline-none"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Correct Answer</label>
                                            <select
                                                value={q.correctAnswer}
                                                onChange={(e) => {
                                                    const newQuestions = [...editingQuiz.questions];
                                                    newQuestions[qIndex].correctAnswer = e.target.value;
                                                    setEditingQuiz({ ...editingQuiz, questions: newQuestions });
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-white outline-none focus:ring-2 focus:ring-space-light"
                                            >
                                                <option value="">Select Correct Option</option>
                                                {q.options.map((opt, oIndex) => (
                                                    <option key={oIndex} value={opt}>{opt || `Option ${oIndex + 1}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <button
                                    onClick={() => {
                                        setEditingQuiz({
                                            ...editingQuiz,
                                            questions: [...editingQuiz.questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]
                                        });
                                    }}
                                    className="px-4 py-2 border border-space-light text-space-light rounded hover:bg-space-light/10 transition"
                                >
                                    + Add Question
                                </button>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setEditingQuiz(null)}
                                        className="px-6 py-2 bg-transparent text-gray-300 hover:text-white transition"
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        onClick={handleSaveQuiz}
                                        isLoading={loading}
                                        disabled={editingQuiz.questions.length < 4 || editingQuiz.questions.some(q => !q.question || q.options.some(o => !o) || !q.correctAnswer)}
                                    >
                                        Save Quiz
                                    </Button>
                                </div>
                            </div>
                            {editingQuiz.questions.length < 4 && (
                                <p className="text-red-400 text-xs mt-4">Minimum 4 questions required to save.</p>
                            )}
                        </div>
                    </div>
                )}

                {editingTopic && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-space-blue border border-white/20 rounded-xl p-6 w-full max-w-2xl shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Edit Topic: {editingTopic.title}</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Content (Markdown supported)</label>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows="10"
                                    className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-white focus:ring-2 focus:ring-space-light outline-none font-mono text-sm"
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setEditingTopic(null)}
                                    className="px-4 py-2 bg-transparent text-gray-300 hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <Button onClick={handleSaveContent} isLoading={loading} className="w-auto">
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {showBroadcastModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                        <div className="bg-space-blue border border-white/20 rounded-xl p-6 w-full max-w-lg shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">📢</span> Broadcast to Classroom
                            </h3>
                            <form onSubmit={handleBroadcast} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                    <textarea
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        rows="4"
                                        className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-white focus:ring-2 focus:ring-space-light outline-none text-sm"
                                        placeholder="Type your announcement here..."
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Attachment Link (Optional)</label>
                                    <input
                                        type="url"
                                        value={broadcastLink}
                                        onChange={(e) => setBroadcastLink(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-white focus:ring-2 focus:ring-space-light outline-none text-sm"
                                        placeholder="https://meet.google.com/..."
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Useful for meeting links or external resources.</p>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowBroadcastModal(false)}
                                        className="px-4 py-2 bg-transparent text-gray-300 hover:text-white transition"
                                    >
                                        Cancel
                                    </button>
                                    <Button type="submit" isLoading={loading} className="w-auto">
                                        Send Now
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorDashboard;
