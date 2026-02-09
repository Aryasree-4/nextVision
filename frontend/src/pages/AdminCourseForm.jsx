import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';

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
        <div className="min-h-screen bg-admin-bg p-8 text-gray-800">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-admin-red">
                        {isEditMode ? 'Edit Course' : 'Create New Course'}
                    </h1>
                    <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="text-admin-red hover:underline"
                    >
                        &larr; Back to Dashboard
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-admin-pink/20">
                    {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

                    <div className="space-y-6">
                        <Input
                            id="course_title"
                            label="Course Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-admin-pink focus:ring-admin-pink sm:text-sm p-2 border"
                                rows="3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                            <input
                                type="file"
                                onChange={(e) => setCoverImage(e.target.files[0])}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-admin-pink/10 file:text-admin-red hover:file:bg-admin-pink/20"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="isPublished"
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="h-4 w-4 text-admin-red focus:ring-admin-pink border-gray-300 rounded"
                            />
                            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                                Publish Course (Visible to Learners)
                            </label>
                        </div>

                        {/* Modules Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-xl font-semibold text-admin-red mb-4">Course Modules</h2>

                            {modules.map((module, mIndex) => (
                                <div key={mIndex} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 mr-4">
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Module Title</label>
                                            <input
                                                type="text"
                                                value={module.title}
                                                onChange={(e) => handleModuleChange(mIndex, 'title', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-admin-pink focus:ring-admin-pink sm:text-sm p-1 border"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveModule(mIndex)}
                                            className="text-red-500 hover:text-red-700 text-sm mt-5"
                                        >
                                            Remove Module
                                        </button>
                                    </div>

                                    {/* Topics */}
                                    <div className="ml-4 pl-4 border-l-2 border-admin-pink/30">
                                        {module.topics.map((topic, tIndex) => (
                                            <div key={tIndex} className="mb-4 p-3 bg-white rounded border border-gray-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-xs font-medium text-gray-400 uppercase">Topic {tIndex + 1}</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTopic(mIndex, tIndex)}
                                                        className="text-red-400 hover:text-red-600 text-xs"
                                                    >
                                                        Delete Topic
                                                    </button>
                                                </div>

                                                <input
                                                    type="text"
                                                    value={topic.title}
                                                    onChange={(e) => handleTopicChange(mIndex, tIndex, 'title', e.target.value)}
                                                    placeholder="Topic Title"
                                                    className="mb-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-admin-pink focus:ring-admin-pink sm:text-sm p-1 border"
                                                />
                                                <textarea
                                                    value={topic.content}
                                                    onChange={(e) => handleTopicChange(mIndex, tIndex, 'content', e.target.value)}
                                                    placeholder="Content (Markdown supported)"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-admin-pink focus:ring-admin-pink sm:text-sm p-2 border h-24 font-mono text-xs"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => handleAddTopic(mIndex)}
                                            className="text-sm text-admin-red hover:text-admin-pink font-medium"
                                        >
                                            + Add Topic
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddModule}
                                className="w-full py-2 bg-gray-100 text-gray-600 rounded border border-dashed border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition"
                            >
                                + Add Module
                            </button>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-admin-red hover:bg-admin-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-pink"
                            >
                                {isEditMode ? 'Update Course' : 'Create Course'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCourseForm;
