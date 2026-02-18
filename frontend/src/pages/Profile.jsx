import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';

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
    const [success, setSuccess] = useState('');
    const [imgError, setImgError] = useState(false);

    const isSelf = !id || (currentUser && id === currentUser._id);

    useEffect(() => {
        if (!loading || currentUser || id) {
            fetchProfile();
        }
    }, [id, currentUser]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

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
        setError('');
        setSuccess('');

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
            setSelectedFile(null);
            setSuccess('Profile updated successfully!');
            setError('');
        } catch (err) {
            console.error('Update Profile Error:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Check engine parameters.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profileUser) return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <SpaceBackground mode="static" />
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-space-light"></div>
        </div>
    );

    if (!profileUser && !loading) {
        return (
            <div className="min-h-screen relative overflow-hidden p-8 flex flex-col justify-center items-center text-white font-body">
                <SpaceBackground mode="static" />
                <div className="text-6xl mb-6 animate-float">🛸</div>
                <h2 className="text-3xl font-bold mb-6 tracking-tight">User Not Found</h2>
                <Button onClick={() => navigate(-1)} variant="secondary">
                    Back
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden pb-20 pt-10 px-6 md:px-8 font-body">
            <SpaceBackground mode="static" />

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-white transition-all flex items-center gap-3 group text-xs font-black uppercase tracking-[0.2em]"
                >
                    <span className="group-hover:-translate-x-1 transition-transform mb-0.5">&larr;</span> Back
                </button>

                {error && (
                    <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl animate-fade-in shadow-lg flex items-center gap-3 text-sm">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success && (
                    <div className="bg-success/10 border border-success/20 text-success p-4 rounded-xl animate-fade-in shadow-lg flex items-center gap-3 text-sm">
                        <span>✅</span> {success}
                    </div>
                )}

                <GlassCard className="overflow-hidden animate-scale-in" hover={false}>
                    <div className="flex flex-col md:flex-row min-h-[500px]">
                        {/* Profile Header Side */}
                        <div className="w-full md:w-2/5 p-10 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-white/5 bg-white/5 backdrop-blur-sm">
                            <div className="relative group mb-8">
                                <div className="w-48 h-48 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl relative group-hover:scale-[1.02] transition-transform duration-500 bg-gray-900/50">
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : profileUser?.profilePicture && profileUser.profilePicture !== 'default-profile.png' && !imgError ? (
                                        <img
                                            src={`http://localhost:5000/uploads/${profileUser.profilePicture}`}
                                            alt={profileUser.name}
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-space-light/40 to-space-blue-dark text-white text-6xl font-black">
                                            {(profileUser?.name?.charAt(0) || '?').toUpperCase()}
                                        </div>
                                    )}

                                    {isSelf && isEditing && (
                                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                                            <span className="text-3xl mb-2">📸</span>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Photo</span>
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
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-[#0B0D17] shadow-lg"></div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-3xl font-extrabold text-white tracking-tight">{profileUser?.name}</h1>
                                <div className="flex items-center justify-center">
                                    <span className="px-4 py-1.5 bg-space-light/10 text-space-light text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-space-light/20">
                                        {profileUser?.role}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm font-medium tracking-wide">{profileUser?.email}</p>
                            </div>

                            <div className="mt-12 pt-10 border-t border-white/5 w-full grid grid-cols-2 gap-4">
                                <div className="glass-panel p-4 rounded-2xl border-white/5 bg-white/2">
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1 tracking-widest">Status</p>
                                    <p className="text-white text-xs font-bold tracking-wide">Active</p>
                                </div>
                                <div className="glass-panel p-4 rounded-2xl border-white/5 bg-white/2">
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1 tracking-widest">Origin</p>
                                    <p className="text-white text-xs font-bold tracking-wide">{new Date(profileUser?.createdAt).getFullYear()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="w-full md:w-3/5 p-12 flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-1 bg-space-light rounded-full"></div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-[0.1em]">
                                        About Me
                                    </h3>
                                </div>
                                {isSelf && !isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 hover:text-space-light transition-colors flex items-center gap-2"
                                    >
                                        Edit Bio
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col">
                                {isSelf && isEditing ? (
                                    <form onSubmit={handleUpdate} className="flex-1 flex flex-col space-y-6">
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="flex-1 w-full min-h-[250px] input-field p-6 text-sm leading-relaxed"
                                            placeholder="Transmit your biography into the network..."
                                        />
                                        <div className="flex gap-4 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setBio(profileUser.bio || '');
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                                className="px-6 py-2 text-gray-600 hover:text-white text-xs font-bold tracking-widest uppercase transition-all"
                                            >
                                                Discard
                                            </button>
                                            <Button
                                                type="submit"
                                                isLoading={loading}
                                                className="px-8 py-3 text-xs font-black uppercase tracking-[0.2em]"
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="glass-panel p-8 min-h-[250px] border-white/5 bg-white/2 rounded-[2rem]">
                                        <p className="text-gray-400 leading-relaxed font-light tracking-wide italic">
                                            {profileUser?.bio ? (
                                                `"${profileUser.bio}"`
                                            ) : (
                                                <span className="opacity-40">Astronaut's chronicle not yet established.</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {!isEditing && (
                                    <div className="mt-12 grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-xl bg-white/5">🛸</div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Missions</p>
                                                <p className="text-white font-bold text-sm tracking-wide">Elite</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-xl bg-white/5">✨</div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Rank</p>
                                                <p className="text-white font-bold text-sm tracking-wide">Voyager</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default Profile;
