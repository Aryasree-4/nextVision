import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProfileIcon from '../components/ProfileIcon';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Tabs
    const [activeTab, setActiveTab] = useState('courses');

    // Data States
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showUserModal, setShowUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'learner' });
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [reassignData, setReassignData] = useState({ studentId: '', fromClassroomId: '', toClassroomId: '' });

    // Confirm Modals State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger'
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'courses') {
                const { data } = await api.get('/courses');
                if (Array.isArray(data)) setCourses(data);
            } else if (activeTab === 'users') {
                const { data } = await api.get('/users');
                if (Array.isArray(data)) setUsers(data);
            } else if (activeTab === 'classrooms') {
                const { data } = await api.get('/classrooms');
                if (Array.isArray(data)) setClassrooms(data);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Course Handlers ---
    const handleDeleteCourse = async (id) => {
        setConfirmState({
            isOpen: true,
            title: 'Delete Course?',
            message: 'This will permanently remove the course and all associated data. This action is irreversible.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/courses/${id}`);
                    setCourses(prev => prev.filter(c => c._id !== id));
                } catch (error) {
                    console.error('Failed to delete course', error);
                }
            }
        });
    };

    // --- User Handlers ---
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            setShowUserModal(false);
            setNewUser({ name: '', email: '', role: 'learner' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (id) => {
        setConfirmState({
            isOpen: true,
            title: 'Delete User?',
            message: 'All access for this user will be revoked. This cannot be undone.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/users/${id}`);
                    setUsers(prev => prev.filter(u => u._id !== id));
                } catch (error) {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    alert(error.response?.data?.message || 'Failed to delete user');
                }
            }
        });
    };

    // --- Classroom Handlers ---
    const handleDeleteClassroom = async (id) => {
        setConfirmState({
            isOpen: true,
            title: 'Delete Classroom?',
            message: 'Deleting a classroom will unenroll all its students. They will need to re-enroll in a different classroom.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/classrooms/${id}`);
                    setClassrooms(prev => prev.filter(c => c._id !== id));
                } catch (error) {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    alert(error.response?.data?.message || 'Failed to delete classroom');
                }
            }
        });
    };

    const initReassign = (studentId, fromClassroomId, courseId) => {
        if (!Array.isArray(classrooms)) return;
        const targets = classrooms.filter(c =>
            c && c.course?._id === courseId &&
            c._id !== fromClassroomId &&
            c.students?.length < 20
        );

        if (targets.length === 0) {
            setConfirmState({
                isOpen: true,
                title: 'No Available Rooms',
                message: 'There are no other classrooms for this course with space to reassign this student.',
                variant: 'primary',
                cancelText: 'OK',
                confirmText: '',
                onConfirm: () => { }
            });
            return;
        }

        setReassignData({ studentId, fromClassroomId, toClassroomId: targets[0]._id, targets });
        setShowReassignModal(true);
    };

    const handleReassign = async () => {
        setConfirmState({
            isOpen: true,
            title: 'Confirm Reassignment',
            message: 'Student will be moved to the selected classroom immediately.',
            variant: 'primary',
            onConfirm: async () => {
                try {
                    await api.put('/classrooms/reassign', {
                        studentId: reassignData.studentId,
                        fromClassroomId: reassignData.fromClassroomId,
                        toClassroomId: reassignData.toClassroomId
                    });
                    setShowReassignModal(false);
                    fetchData();
                } catch (error) {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    alert(error.response?.data?.message || 'Failed to reassign student');
                }
            }
        });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-admin-bg p-8 text-gray-800">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-lg border border-admin-pink/20">
                    <div>
                        <h1 className="text-3xl font-bold text-admin-red">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <ProfileIcon />
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-admin-red text-white rounded hover:bg-admin-red/90 transition shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow border border-admin-pink/20">
                            <h3 className="font-bold text-admin-red mb-4">Management</h3>
                            <nav className="space-y-2">
                                <button onClick={() => setActiveTab('courses')} className={`w-full text-left px-4 py-2 rounded transition ${activeTab === 'courses' ? 'bg-admin-red text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                                    Courses
                                </button>
                                <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-2 rounded transition ${activeTab === 'users' ? 'bg-admin-red text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                                    Users
                                </button>
                                <button onClick={() => setActiveTab('classrooms')} className={`w-full text-left px-4 py-2 rounded transition ${activeTab === 'classrooms' ? 'bg-admin-red text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                                    Classrooms
                                </button>
                            </nav>
                        </div>
                        {activeTab === 'courses' && (
                            <div className="bg-white p-6 rounded-xl shadow border border-admin-pink/20">
                                <button
                                    onClick={() => navigate('/admin/create-course')}
                                    className="w-full py-2 bg-admin-pink text-white rounded hover:bg-admin-pink/90 transition"
                                >
                                    + Create New Course
                                </button>
                            </div>
                        )}
                        {activeTab === 'users' && (
                            <div className="bg-white p-6 rounded-xl shadow border border-admin-pink/20">
                                <button
                                    onClick={() => setShowUserModal(true)}
                                    className="w-full py-2 bg-admin-pink text-white rounded hover:bg-admin-pink/90 transition"
                                >
                                    + Add New User
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-bold text-admin-red mb-6 capitalize">{activeTab} Management</h2>

                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                {activeTab === 'courses' && (
                                    <div className="space-y-4">
                                        {Array.isArray(courses) && courses.map(course => (
                                            course && (
                                                <div key={course._id} className="bg-white p-6 rounded-xl shadow border border-admin-pink/20 flex justify-between items-center">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                                            {course.coverImage && course.coverImage !== 'no-photo.jpg' ? (
                                                                <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover" />
                                                            ) : (<div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg text-gray-800">{course.title}</h3>
                                                            <p className="text-sm text-gray-500">{course.modules?.length || 0} Modules • {course.isPublished ? 'Published' : 'Draft'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => navigate(`/admin/edit-course/${course._id}`)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm">Edit</button>
                                                        <button onClick={() => handleDeleteCourse(course._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm">Delete</button>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'users' && (
                                    <div className="bg-white rounded-xl shadow border border-admin-pink/20 overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {Array.isArray(users) && users.map(u => (
                                                    u && (
                                                        <tr key={u._id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                <a href={`/profile/${u._id}`} className="text-blue-600 hover:text-blue-900 hover:underline">
                                                                    {u.name}
                                                                </a>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-800' : u.role === 'mentor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                                    {u.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button onClick={() => handleDeleteUser(u._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                                            </td>
                                                        </tr>
                                                    )
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'classrooms' && (
                                    <div className="space-y-6">
                                        {Array.isArray(classrooms) && classrooms.map(classroom => (
                                            classroom && (
                                                <div key={classroom._id} className="bg-white p-6 rounded-xl shadow border border-admin-pink/20">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-800">{classroom.course?.title || 'Unknown Course'}</h3>
                                                            <p className="text-sm text-gray-500">Mentor: <span className="font-medium text-blue-600">{classroom.mentor?.name || 'Unknown'}</span></p>
                                                        </div>
                                                        <button onClick={() => handleDeleteClassroom(classroom._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm">Delete Classroom</button>
                                                    </div>

                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Students ({classroom.students?.length || 0}/20)</h4>
                                                        {(!classroom.students || classroom.students.length === 0) ? (
                                                            <p className="text-xs text-gray-400">No students enrolled</p>
                                                        ) : (
                                                            <ul className="space-y-2">
                                                                {classroom.students.map(student => (
                                                                    student && (
                                                                        <li key={student._id} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100">
                                                                            <span>{student.name} <span className="text-gray-400 text-xs">({student.email})</span></span>
                                                                            <button
                                                                                onClick={() => initReassign(student._id, classroom._id, classroom.course?._id)}
                                                                                className="text-xs text-blue-600 hover:underline"
                                                                            >
                                                                                Reassign
                                                                            </button>
                                                                        </li>
                                                                    )
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {showUserModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">Add New User</h3>
                            <form onSubmit={handleCreateUser}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-admin-pink focus:ring-admin-pink sm:text-sm border p-2" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-admin-pink focus:ring-admin-pink sm:text-sm border p-2" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Role</label>
                                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-admin-pink focus:ring-admin-pink sm:text-sm border p-2" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                            <option value="learner">Learner</option>
                                            <option value="mentor">Mentor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-admin-pink text-white rounded hover:bg-admin-pink/90">Create User</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showReassignModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md animate-scale-up">
                            <h3 className="text-lg font-bold mb-4">Reassign Student</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Select Target Classroom</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-admin-pink focus:ring-admin-pink sm:text-sm border p-2"
                                        value={reassignData.toClassroomId}
                                        onChange={e => setReassignData({ ...reassignData, toClassroomId: e.target.value })}
                                    >
                                        {Array.isArray(reassignData.targets) && reassignData.targets.map(target => (
                                            target && (
                                                <option key={target._id} value={target._id}>
                                                    Mentor: {target.mentor?.name} ({target.students?.length || 0}/20)
                                                </option>
                                            )
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button type="button" onClick={() => setShowReassignModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                                    <button type="button" onClick={handleReassign} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Proceed to Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <ConfirmModal
                    isOpen={confirmState.isOpen}
                    onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                    onConfirm={confirmState.onConfirm}
                    title={confirmState.title}
                    message={confirmState.message}
                    variant={confirmState.variant}
                    confirmText={confirmState.confirmText}
                    cancelText={confirmState.cancelText}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
