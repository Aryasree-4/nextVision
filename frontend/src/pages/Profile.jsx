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

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('bio', bio);
        if (selectedFile) {
            formData.append('profilePicture', selectedFile);
        }

        try {
            const { data } = await api.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfileUser(data);
            if (isSelf && updateUserData) {
                updateUserData(data);
            }
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profileUser) return <div className="p-8 text-white">Loading...</div>;

    if (!profileUser && !loading) {
        return (
            <div className="min-h-screen bg-transparent p-8 flex flex-col justify-center items-center text-white">
                <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
                <button onClick={() => navigate(-1)} className="text-space-light hover:underline">&larr; Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-8 flex justify-center items-start pt-20">
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/20">
                <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-white mb-6 text-sm flex items-center gap-1">
                    &larr; Back
                </button>

                {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded mb-6">{error}</div>}

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/30 shadow-lg mb-4 bg-gray-800">
                            {profileUser?.profilePicture && profileUser.profilePicture !== 'default-profile.png' ? (
                                <img
                                    src={`http://localhost:5000/uploads/${profileUser.profilePicture}`}
                                    alt={profileUser.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-space-light text-space-dark text-4xl font-bold">
                                    {(profileUser?.name?.charAt(0) || '?').toUpperCase()}
                                </div>
                            )}
                        </div>

                        {isSelf && isEditing && (
                            <label className="block text-sm text-gray-400 text-center cursor-pointer hover:text-white">
                                <span className="bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition">Change Photo</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    accept="image/*"
                                />
                                {selectedFile && <p className="text-xs text-green-400 mt-1">{selectedFile.name}</p>}
                            </label>
                        )}
                    </div>

                    <div className="w-full md:w-2/3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">{profileUser?.name}</h1>
                                <p className="text-space-light font-medium capitalize">{profileUser?.role}</p>
                                <p className="text-gray-400 text-sm mt-1">{profileUser?.email}</p>
                            </div>

                            {isSelf && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition text-sm"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mb-4">About</h3>

                            {isSelf && isEditing ? (
                                <form onSubmit={handleUpdate}>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full h-32 bg-black/20 border border-white/10 rounded p-3 text-white focus:outline-none focus:border-space-light transition resize-none"
                                        placeholder="Write a short bio about yourself..."
                                    />
                                    <div className="flex gap-3 justify-end mt-4">
                                        <button
                                            type="button"
                                            onClick={() => { setIsEditing(false); setBio(profileUser.bio || ''); setSelectedFile(null); }}
                                            className="px-4 py-2 text-gray-400 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <Button
                                            type="submit"
                                            isLoading={loading}
                                            className="px-6 py-2 bg-space-light text-space-dark font-bold rounded hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {profileUser?.bio || <span className="text-gray-500 italic">No bio provided yet.</span>}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
