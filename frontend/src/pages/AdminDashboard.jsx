import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProfileIcon from '../components/ProfileIcon';
import ConfirmModal from '../components/ConfirmModal';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

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
        <div className="min-h-screen relative overflow-hidden pb-10 font-body">
            <SpaceBackground mode="static" />

            <div className="max-w-7xl mx-auto px-6 pt-10">
                <GlassCard className="mb-10 animate-fade-in" hover={false}>
                    <header className="flex flex-col md:flex-row justify-between items-center gap-6 p-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-1 bg-space-accent rounded-full"></div>
                            <div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Admin Dashboard</h1>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Administrator: {user?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <ProfileIcon />
                            <Button
                                onClick={logout}
                                variant="secondary"
                                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest"
                            >
                                Logout
                            </Button>
                        </div>
                    </header>
                </GlassCard>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <GlassCard className="p-6" hover={false}>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-space-accent mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-space-accent rounded-full"></span>
                                Admin Menu
                            </h3>
                            <nav className="space-y-4">
                                {[
                                    { id: 'courses', label: 'Courses' },
                                    { id: 'users', label: 'Users' },
                                    { id: 'classrooms', label: 'Classrooms' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-space-accent/10 text-space-accent border border-space-accent/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </GlassCard>

                        {activeTab === 'courses' && (
                            <Button
                                onClick={() => navigate('/admin/create-course')}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-widest"
                            >
                                Create Course
                            </Button>
                        )}
                        {activeTab === 'users' && (
                            <Button
                                onClick={() => setShowUserModal(true)}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-widest"
                            >
                                Add User
                            </Button>
                        )}
                    </div>

                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-5 w-1 bg-space-light rounded-full"></div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-[0.1em]">{activeTab} Management</h2>
                        </div>

                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                {activeTab === 'courses' && (
                                    <div className="space-y-6">
                                        {Array.isArray(courses) && courses.map(course => (
                                            course && (
                                                <GlassCard key={course._id} className="p-6 transition-all" hover={true}>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center space-x-6">
                                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/5 bg-gray-900/50">
                                                                {course.coverImage && course.coverImage !== 'no-photo.jpg' ? (
                                                                    <img src={`http://localhost:5000/uploads/${course.coverImage}`} alt={course.title} className="w-full h-full object-cover" />
                                                                ) : (<div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600 font-black uppercase tracking-widest">No Feed</div>)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-extrabold text-lg text-white tracking-tight">{course.title}</h3>
                                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{course.modules?.length || 0} Modules • {course.isPublished ? 'Operational' : 'Draft'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() => navigate(`/admin/edit-course/${course._id}`)}
                                                                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                                                            >
                                                                Modify
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCourse(course._id)}
                                                                className="text-[10px] font-black uppercase tracking-widest text-error/60 hover:text-error transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            )
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'users' && (
                                    <GlassCard className="overflow-hidden border-white/5" hover={false}>
                                        <table className="min-w-full divide-y divide-white/5">
                                            <thead>
                                                <tr className="bg-white/5">
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Users</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Identifier</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Role</th>
                                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {Array.isArray(users) && users.map(u => (
                                                    u && (
                                                        <tr key={u._id} className="hover:bg-white/2 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <a href={`/profile/${u._id}`} className="text-sm font-bold text-white hover:text-space-accent transition-colors">
                                                                    {u.name}
                                                                </a>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium tracking-wide">{u.email}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${u.role === 'admin' ? 'bg-error/10 text-error border-error/20' : u.role === 'mentor' ? 'bg-space-light/10 text-space-light border-space-light/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                                                    {u.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                                <button
                                                                    onClick={() => handleDeleteUser(u._id)}
                                                                    className="text-[10px] font-black uppercase tracking-widest text-error/60 hover:text-error transition-colors"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                ))}
                                            </tbody>
                                        </table>
                                    </GlassCard>
                                )}

                                {activeTab === 'classrooms' && (
                                    <div className="space-y-6">
                                        {Array.isArray(classrooms) && classrooms.map(classroom => (
                                            classroom && (
                                                <GlassCard key={classroom._id} className="p-8" hover={false}>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-1 bg-space-light rounded-full"></div>
                                                            <div>
                                                                <h3 className="text-xl font-bold text-white tracking-tight">{classroom.course?.title || 'Unknown Sector'}</h3>
                                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Commanding Officer: <span className="text-space-accent">{classroom.mentor?.name || 'Unknown'}</span></p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteClassroom(classroom._id)}
                                                            className="text-[10px] font-black uppercase tracking-widest text-error/60 hover:text-error transition-colors"
                                                        >
                                                            Delete Class
                                                        </button>
                                                    </div>

                                                    <div className="bg-white/2 border border-white/5 p-6 rounded-xl">
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                                                            <span>Enrolled Students</span>
                                                            <span className="text-space-light">{classroom.students?.length || 0} / 20 Enrolled</span>
                                                        </h4>
                                                        {(!classroom.students || classroom.students.length === 0) ? (
                                                            <p className="text-xs text-gray-600 italic">No students enrolled in this class.</p>
                                                        ) : (
                                                            <ul className="space-y-3">
                                                                {classroom.students.map(student => (
                                                                    student && (
                                                                        <li key={student._id} className="flex justify-between items-center text-sm bg-white/2 border border-white/5 p-3 rounded-lg group hover:border-white/10 transition-colors">
                                                                            <span className="font-bold text-white">{student.name} <span className="text-gray-600 font-medium ml-2">({student.email})</span></span>
                                                                            <button
                                                                                onClick={() => initReassign(student._id, classroom._id, classroom.course?._id)}
                                                                                className="text-[10px] font-black uppercase tracking-widest text-space-accent/60 hover:text-space-accent transition-colors"
                                                                            >
                                                                                Move
                                                                            </button>
                                                                        </li>
                                                                    )
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </GlassCard>
                                            )
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {showUserModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                        <GlassCard className="p-8 w-full max-w-md border-white/20 shadow-2xl animate-scale-in" hover={false}>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-5 w-1 bg-space-accent rounded-full"></div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-[0.1em]">Add User</h3>
                            </div>
                            <form onSubmit={handleCreateUser}>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Full Name</label>
                                        <input type="text" required className="input-field" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Email Identifier</label>
                                        <input type="email" required className="input-field" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">User Role</label>
                                        <select className="input-field appearance-none cursor-pointer" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                            <option value="learner">Learner</option>
                                            <option value="mentor">Mentor</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-10">
                                        <button type="button" onClick={() => setShowUserModal(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Abourt</button>
                                        <Button type="submit" className="w-auto px-8">Create User</Button>
                                    </div>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                )}

                {showReassignModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
                        <GlassCard className="p-8 w-full max-w-md border-white/20 shadow-2xl animate-scale-in" hover={false}>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-5 w-1 bg-space-light rounded-full"></div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-[0.1em]">Student Transfer</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Target Class</label>
                                    <select
                                        className="input-field appearance-none cursor-pointer"
                                        value={reassignData.toClassroomId}
                                        onChange={e => setReassignData({ ...reassignData, toClassroomId: e.target.value })}
                                    >
                                        {Array.isArray(reassignData.targets) && reassignData.targets.map(target => (
                                            target && (
                                                <option key={target._id} value={target._id}>
                                                    Class: {target.mentor?.name} ({target.students?.length || 0}/20 Students)
                                                </option>
                                            )
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-4 mt-10">
                                    <button type="button" onClick={() => setShowReassignModal(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Abourt</button>
                                    <Button onClick={handleReassign} variant="primary" className="w-auto px-8">Move Student</Button>
                                </div>
                            </div>
                        </GlassCard>
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
