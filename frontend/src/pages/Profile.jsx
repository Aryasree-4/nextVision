import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser, updateUserData } = useAuth();
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isSelf = !id || (currentUser && id === currentUser._id);

    useEffect(() => {
        if (!loading || currentUser || id) {
            fetchProfile();
        }
    }, [id, currentUser]);

    const fetchProfile = async () => {
        const profileId = id || currentUser?._id;
        if (!profileId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get(`/users/profile/${profileId}`);
            setProfileUser(data);
            setBio(data.bio || '');
            setError('');
        } catch (err) {
            console.error('Fetch Profile Error:', err);
            setError(err.response?.data?.message || 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('bio', bio);
        if (selectedFile) {
            formData.append('profilePicture', selectedFile);
        }

        try {
            const { data } = await api.put('/users/profile', formData);
            setProfileUser(data);
            if (isSelf && updateUserData) {
                updateUserData(data);
            }
            setIsEditing(false);
            setPreviewUrl(null);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profileUser) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-light"></div>
        </div>
    );

    if (!profileUser && !loading) {
        return (
            <div className="min-h-screen bg-transparent p-8 flex flex-col justify-center items-center text-white">
                <div className="text-6xl mb-4">🛸</div>
                <h2 className="text-3xl font-bold mb-4">Astronaut Not Found</h2>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    &larr; Return to Base
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-20 pt-10 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 text-gray-400 hover:text-white transition-all flex items-center gap-2 group text-sm font-medium"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
                </button>

                {/* Error Pulse */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl mb-8 animate-pulse shadow-lg flex items-center gap-3">
                        <span className="text-xl">⚠️</span> {error}
                    </div>
                )}

                {/* Main Profile Card - Modern Glassmorphism */}
                <div className="relative overflow-hidden bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl transition-all duration-500">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-r from-space-light/20 to-purple-600/20 blur-3xl -z-10"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-space-light/10 rounded-full blur-3xl -z-10"></div>

                    <div className="flex flex-col md:flex-row min-h-[500px]">
                        {/* Profile Header Side */}
                        <div className="w-full md:w-2/5 p-10 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-white/10 bg-black/10">
                            <div className="relative group mb-8">
                                <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative group-hover:scale-[1.02] transition-transform duration-500 bg-gray-900/50">
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : profileUser?.profilePicture && profileUser.profilePicture !== 'default-profile.png' ? (
                                        <img
                                            src={`http://localhost:5000/uploads/${profileUser.profilePicture}`}
                                            alt={profileUser.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-space-light to-blue-600 text-white text-6xl font-black">
                                            {(profileUser?.name?.charAt(0) || '?').toUpperCase()}
                                        </div>
                                    )}

                                    {/* Upload Overlay */}
                                    {isSelf && isEditing && (
                                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                                            <span className="text-3xl mb-2">📸</span>
                                            <span className="text-xs font-bold text-white uppercase tracking-widest">New Photo</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                            />
                                        </label>
                                    )}
                                </div>
                                {isSelf && !isEditing && (
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-space-dark shadow-lg"></div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-white tracking-tight">{profileUser?.name}</h1>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="px-3 py-1 bg-space-light/20 text-space-light text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-space-light/30">
                                        {profileUser?.role}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm font-medium">{profileUser?.email}</p>
                            </div>

                            <div className="mt-10 pt-10 border-t border-white/5 w-full">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Status</p>
                                        <p className="text-white text-sm font-bold">Active</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Since</p>
                                        <p className="text-white text-sm font-bold">{new Date(profileUser?.createdAt).getFullYear()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="w-full md:w-3/5 p-12 flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 bg-space-light rounded-full pulse"></span>
                                    Bio Information
                                </h3>
                                {isSelf && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="group bg-white/5 hover:bg-space-light text-white hover:text-space-dark px-6 py-2.5 rounded-2xl transition-all duration-300 text-sm font-bold border border-white/10 hover:border-space-light flex items-center gap-2 shadow-xl"
                                    >
                                        <span>Edit Profile</span>
                                        <span className="group-hover:rotate-12 transition-transform">⚙️</span>
                                    </button>
                                )}
                            </div>

                            <div className="flex-1">
                                {isSelf && isEditing ? (
                                    <form onSubmit={handleUpdate} className="h-full flex flex-col">
                                        <div className="relative flex-1">
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="w-full h-full min-h-[200px] bg-black/40 border-2 border-white/10 rounded-[1.5rem] p-6 text-white focus:outline-none focus:border-space-light transition-all duration-300 resize-none font-medium leading-relaxed"
                                                placeholder="Tell us about your cosmic journey..."
                                            />
                                            <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-600 uppercase">Markdown Enabled</div>
                                        </div>

                                        <div className="flex gap-4 justify-end mt-8">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setBio(profileUser.bio || '');
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                                className="px-8 py-3 text-gray-400 hover:text-white font-bold transition-all"
                                            >
                                                Discard
                                            </button>
                                            <Button
                                                type="submit"
                                                isLoading={loading}
                                                className="px-10 py-3 rounded-2xl text-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
                                            >
                                                Save Mission Data
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="bg-black/20 rounded-[1.5rem] p-8 border border-white/5 min-h-[200px]">
                                        <p className="text-gray-200 leading-relaxed text-lg italic opacity-90">
                                            {profileUser?.bio ? (
                                                `"${profileUser.bio}"`
                                            ) : (
                                                <span className="text-gray-500 italic font-medium">This astronaut hasn't written their cosmic chronicle yet.</span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Stats or Extra Info */}
                            {!isEditing && (
                                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 rounded-xl bg-space-light/20 flex items-center justify-center text-xl">🛸</div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">Missions</p>
                                            <p className="text-white font-bold text-lg">Active</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">✨</div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">Reputation</p>
                                            <p className="text-white font-bold text-lg">Supernova</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
