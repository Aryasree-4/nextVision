import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';

const MentorDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'classrooms'
    const [courses, setCourses] = useState([]);
    const [myClassrooms, setMyClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [editingTopic, setEditingTopic] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCourses();
        fetchMyClassrooms();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses?published=true');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        }
    };

    const fetchMyClassrooms = async () => {
        try {
            const { data } = await api.get('/classrooms/my-classrooms');
            setMyClassrooms(data);
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
        setEditingTopic({ moduleId: module._id, topicId: topic._id, title: topic.title });
        setEditContent(topic.content);
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

            // Update local state to reflect changes without refetching everything
            const updatedClassroom = { ...selectedClassroom };
            const modIndex = updatedClassroom.syllabus.findIndex(m => m._id === editingTopic.moduleId);
            const topicIndex = updatedClassroom.syllabus[modIndex].topics.findIndex(t => t._id === editingTopic.topicId);
            updatedClassroom.syllabus[modIndex].topics[topicIndex].content = editContent;
            setSelectedClassroom(updatedClassroom);

            // Also update in myClassrooms list
            const classroomIndex = myClassrooms.findIndex(c => c._id === selectedClassroom._id);
            const updatedClassrooms = [...myClassrooms];
            updatedClassrooms[classroomIndex] = updatedClassroom;
            setMyClassrooms(updatedClassrooms);

            setEditingTopic(null);
            setMessage({ type: 'success', text: 'Content updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update content' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-space-blue/50 backdrop-blur-md p-6 rounded-lg text-white shadow-md border border-white/10">
                    <div>
                        <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
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
                    <div className={`mb-4 p-4 rounded ${message.type === 'error' ? 'bg-red-500/80' : 'bg-green-500/80'} text-white`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
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
                        My Classrooms ({myClassrooms.length})
                    </button>
                </div>

                <div className="bg-space-blue/30 backdrop-blur-md rounded-lg shadow-xl p-6 border border-white/10 min-h-[500px]">
                    {activeTab === 'browse' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map(course => (
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
                            ))}
                            {courses.length === 0 && <p className="text-gray-400">No courses available to activate.</p>}
                        </div>
                    )}

                    {activeTab === 'classrooms' && !selectedClassroom && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myClassrooms.map(classroom => (
                                <div key={classroom._id} className="bg-white/10 border border-white/10 rounded-xl p-6 hover:bg-white/15 transition cursor-pointer" onClick={() => setSelectedClassroom(classroom)}>
                                    <h3 className="text-xl font-bold text-white mb-2">{classroom.course?.title}</h3>
                                    <p className="text-sm text-gray-300 mb-4">Students: {classroom.students?.length} / 20</p>
                                    <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold">Status: {classroom.isActive ? 'Active' : 'Inactive'}</div>
                                    <button className="mt-4 text-sm text-space-light hover:underline">Manage Syllabus &rarr;</button>
                                </div>
                            ))}
                            {myClassrooms.length === 0 && <p className="text-gray-400">You haven't activated any classrooms yet.</p>}
                        </div>
                    )}

                    {activeTab === 'classrooms' && selectedClassroom && (
                        <div>
                            <button onClick={() => setSelectedClassroom(null)} className="mb-4 text-sm text-gray-400 hover:text-white">&larr; Back to Classrooms</button>
                            <h2 className="text-2xl font-bold text-white mb-6">Managing: {selectedClassroom.course?.title}</h2>

                            <div className="space-y-6">
                                {selectedClassroom.syllabus.map((module, mIndex) => (
                                    <div key={module._id} className="bg-black/20 rounded-lg p-4 border border-white/5">
                                        <h3 className="text-lg font-semibold text-space-light mb-3">Module {mIndex + 1}: {module.title}</h3>
                                        <div className="space-y-3 pl-4 border-l-2 border-white/10">
                                            {module.topics.map(topic => (
                                                <div key={topic._id} className="bg-white/5 p-3 rounded hover:bg-white/10 transition">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-white">{topic.title}</h4>
                                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{topic.content}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleEditTopic(module, topic)}
                                                            className="text-xs bg-blue-600/50 hover:bg-blue-600 text-white px-2 py-1 rounded"
                                                        >
                                                            Edit Content
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Modal / Overlay */}
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
            </div>
        </div>
    );
};

export default MentorDashboard;
