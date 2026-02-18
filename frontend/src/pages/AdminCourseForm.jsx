import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';

const AdminCourseForm = () => {
    const { id } = useParams(); // If ID exists, we are editing
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [isPublished, setIsPublished] = useState(false);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchCourse();
        }
    }, [id]);

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/courses/${id}`);
            setTitle(data.title);
            setDescription(data.description);
            setIsPublished(data.isPublished);
            setModules(data.modules || []);
        } catch (err) {
            setError('Failed to fetch course details');
        }
    };

    const handleAddModule = () => {
        setModules([...modules, { title: 'New Module', topics: [] }]);
    };

    const handleModuleChange = (index, field, value) => {
        const newModules = [...modules];
        newModules[index][field] = value;
        setModules(newModules);
    };

    const handleAddTopic = (moduleIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].topics.push({ title: 'New Topic', content: '' });
        setModules(newModules);
    };

    const handleTopicChange = (moduleIndex, topicIndex, field, value) => {
        const newModules = [...modules];
        newModules[moduleIndex].topics[topicIndex][field] = value;
        setModules(newModules);
    };

    const handleRemoveModule = (index) => {
        const newModules = [...modules];
        newModules.splice(index, 1);
        setModules(newModules);
    };

    const handleRemoveTopic = (moduleIndex, topicIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].topics.splice(topicIndex, 1);
        setModules(newModules);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('isPublished', isPublished);
        formData.append('modules', JSON.stringify(modules));
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        try {
            if (isEditMode) {
                await api.put(`/courses/${id}`, formData);
            } else {
                await api.post('/courses', formData);
            }
            navigate('/admin-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden pb-10 font-body">
            <SpaceBackground mode="static" />

            <div className="max-w-4xl mx-auto px-6 pt-10">
                <GlassCard className="mb-8" hover={false}>
                    <div className="flex justify-between items-center p-4">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-1 bg-space-accent rounded-full"></div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight">
                                {isEditMode ? 'Modify Mission Data' : 'Initiate New Mission'}
                            </h1>
                        </div>
                        <button
                            onClick={() => navigate('/admin-dashboard')}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                        >
                            &larr; Return to HQ
                        </button>
                    </div>
                </GlassCard>

                <GlassCard className="p-8 animate-scale-in" hover={false}>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-bold uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <Input
                                id="course_title"
                                label="Course Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Sector Intelligence Brief</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="input-field min-h-[120px]"
                                    placeholder="Describe the mission objectives..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Mission Visual (Cover Image)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setCoverImage(e.target.files[0])}
                                    className="input-field file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-space-accent/20 file:text-space-accent hover:file:bg-space-accent/30 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                <input
                                    id="isPublished"
                                    type="checkbox"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="h-5 w-5 rounded border-white/10 bg-black/40 text-space-accent focus:ring-space-accent transition-all cursor-pointer"
                                />
                                <label htmlFor="isPublished" className="text-[10px] font-black uppercase tracking-widest text-white cursor-pointer select-none">
                                    Deploy to Network (Public Visibility)
                                </label>
                            </div>

                            <div className="border-t border-white/10 pt-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="h-5 w-1 bg-space-light rounded-full"></div>
                                    <h2 className="text-lg font-black text-white uppercase tracking-[0.1em]">Module Configuration</h2>
                                </div>

                                {modules.map((module, mIndex) => (
                                    <div key={mIndex} className="mb-8 p-6 bg-white/2 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-end mb-6">
                                            <div className="flex-1 mr-6">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Module {mIndex + 1} Identifier</label>
                                                <input
                                                    type="text"
                                                    value={module.title}
                                                    onChange={(e) => handleModuleChange(mIndex, 'title', e.target.value)}
                                                    className="input-field text-lg font-bold"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveModule(mIndex)}
                                                className="text-[10px] font-black uppercase tracking-widest text-error/60 hover:text-error transition-colors mb-3"
                                            >
                                                Decommission
                                            </button>
                                        </div>

                                        <div className="ml-6 pl-6 border-l border-white/10 space-y-4">
                                            {module.topics.map((topic, tIndex) => (
                                                <div key={tIndex} className="p-5 bg-black/40 rounded-xl border border-white/5 group relative">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-space-accent/60">Topic {tIndex + 1} Protocol</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTopic(mIndex, tIndex)}
                                                            className="text-[10px] font-black uppercase tracking-widest text-error/40 hover:text-error transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>

                                                    <input
                                                        type="text"
                                                        value={topic.title}
                                                        onChange={(e) => handleTopicChange(mIndex, tIndex, 'title', e.target.value)}
                                                        placeholder="Topic Title"
                                                        className="input-field mb-3"
                                                    />
                                                    <textarea
                                                        value={topic.content}
                                                        onChange={(e) => handleTopicChange(mIndex, tIndex, 'content', e.target.value)}
                                                        placeholder="Operational Instructions (Markdown enabled)"
                                                        className="input-field min-h-[100px] font-mono text-xs"
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handleAddTopic(mIndex)}
                                                className="text-[10px] font-black uppercase tracking-[0.2em] text-space-accent hover:text-white transition-colors py-2 px-1"
                                            >
                                                + Install New Topic
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleAddModule}
                                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 text-gray-500 border border-dashed border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                >
                                    + Synchronize New Module
                                </button>
                            </div>

                            <div className="pt-10">
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    className="w-full py-4 text-xs font-black uppercase tracking-[0.2em]"
                                >
                                    {isEditMode ? 'Authorize Database Update' : 'Initialize Mission Deployment'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};

export default AdminCourseForm;
