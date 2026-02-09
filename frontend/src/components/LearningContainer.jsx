import React, { useState, useEffect } from 'react';
import Button from './Button';
import QuizInterface from './QuizInterface';
import api from '../api/axios';

const LearningContainer = ({ classroom, enrollment, onClose }) => {
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const { data } = await api.get(`/assessments/progress/${classroom._id}`);
            setProgress(data);

            // Find the furthest unlocked module
            const furthestModule = data.moduleProgress.filter(mp => mp.completed).length;
            setCurrentModuleIndex(Math.min(furthestModule, classroom.syllabus.length - 1));

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch progress', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white p-10 text-center">Loading Course Content...</div>;

    const currentModule = classroom.syllabus[currentModuleIndex];
    if (!currentModule) return <div className="text-white">Error: Module not found</div>;

    const currentTopic = currentModule.topics[currentTopicIndex];
    const isFirstTopic = currentTopicIndex === 0;
    const isLastTopic = currentTopicIndex === currentModule.topics.length - 1;
    const isLastModule = currentModuleIndex === classroom.syllabus.length - 1;

    const handleNext = () => {
        if (!isLastTopic) {
            setCurrentTopicIndex(currentTopicIndex + 1);
        } else {
            setShowQuiz(true);
        }
    };

    const handlePrev = () => {
        if (!isFirstTopic) {
            setCurrentTopicIndex(currentTopicIndex - 1);
        }
    };

    const handleQuizComplete = (result) => {
        setShowQuiz(false);
        if (result.passed) {
            fetchProgress(); // Refresh progress to unlock next module
        }
    };

    const handleFinishCourse = () => {
        // Just local UI state change, actual progress is already updated on last quiz pass
        setCurrentTopicIndex(-1); // Special index for completion page
    };

    if (currentTopicIndex === -1) {
        return (
            <div className="fixed inset-0 bg-space-blue z-[80] flex items-center justify-center p-8">
                <div className="max-w-2xl w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl animate-fade-in text-white">
                    <div className="text-6xl mb-8">🎓</div>
                    <h2 className="text-4xl font-bold mb-6 text-white leading-tight">Course Completed!</h2>
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
                        Congratulations on completing all modules! Your final assessment will be a
                        <span className="text-space-light font-bold"> mentor review</span>.
                        Stay tuned — your mentor will contact you soon for the next steps.
                    </p>
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8 text-sm text-gray-400 inline-block">
                        Total Modules: {classroom.syllabus.length} | Status: Pending Review
                    </div>
                    <div className="block">
                        <Button onClick={onClose} className="px-12 py-3 rounded-full text-lg">
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (showQuiz) {
        return (
            <div className="fixed inset-0 bg-space-blue z-[70] p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => setShowQuiz(false)} className="text-gray-400 hover:text-white mb-6">
                        &larr; Back to Content
                    </button>
                    <QuizInterface
                        classroomId={classroom._id}
                        moduleIndex={currentModuleIndex}
                        moduleTitle={currentModule.title}
                        onComplete={handleQuizComplete}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-space-blue z-[60] flex flex-col">
            <header className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    <div>
                        <h2 className="text-lg font-bold text-white">{classroom.course?.title}</h2>
                        <p className="text-xs text-gray-400">Module {currentModuleIndex + 1}: {currentModule.title}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {classroom.syllabus.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-8 h-1 rounded-full ${idx <= currentModuleIndex ? 'bg-space-light' : 'bg-gray-800'}`}
                        />
                    ))}
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-8 bg-stars-pattern bg-center">
                <div className="w-full max-w-3xl aspect-[4/3] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col group transition-all duration-500 hover:bg-white/10">
                    <div className="absolute top-0 left-0 w-1 h-full bg-space-light"></div>

                    <div className="p-12 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="mb-8">
                            <span className="text-xs uppercase tracking-[0.2em] text-space-light font-bold">Topic {currentTopicIndex + 1} of {currentModule.topics.length}</span>
                            <h1 className="text-3xl font-bold text-white mt-2">{currentTopic.title}</h1>
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed text-lg">
                            {currentTopic.content}
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-black/10 flex justify-between items-center">
                        <button
                            disabled={isFirstTopic}
                            onClick={handlePrev}
                            className={`px-6 py-2 rounded-full border border-white/20 text-white transition ${isFirstTopic ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10'}`}
                        >
                            &larr; Previous Topic
                        </button>

                        <div className="flex gap-1">
                            {currentModule.topics.map((_, idx) => (
                                <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentTopicIndex ? 'bg-space-light' : 'bg-white/20'}`} />
                            ))}
                        </div>

                        <Button
                            onClick={isLastTopic && isLastModule && progress?.isCourseCompleted ? handleFinishCourse : handleNext}
                            className="rounded-full px-8"
                        >
                            {isLastTopic ? (isLastModule && progress?.isCourseCompleted ? 'Finish Course' : 'Ready for Assessment') : 'Next Topic \u2192'}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LearningContainer;
