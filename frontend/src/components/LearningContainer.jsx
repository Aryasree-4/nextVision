import React, { useState, useEffect } from 'react';
import Button from './Button';
import QuizInterface from './QuizInterface';
import api from '../api/axios';
import { useNotifications } from '../context/NotificationContext';
import NotificationBoard from './NotificationBoard';
import SpaceBackground from './SpaceBackground';
import GlassCard from './GlassCard';

const LearningContainer = ({ classroom, enrollment, onClose }) => {
    const { unreadCount, setCurrentClassroomId } = useNotifications();
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchProgress();
        setCurrentClassroomId(classroom._id);
        return () => setCurrentClassroomId(null);
    }, [classroom._id, setCurrentClassroomId]);

    const fetchProgress = async () => {
        try {
            const { data } = await api.get(`/assessments/progress/${classroom._id}`);
            setProgress(data);

            // Find the furthest unlocked module
            const furthestModule = data.moduleProgress.filter(mp => mp.completed).length;
            const targetModuleIndex = Math.min(furthestModule, classroom.syllabus.length - 1);

            // Only reset topic if we actually moved to a different module
            if (targetModuleIndex !== currentModuleIndex) {
                setCurrentModuleIndex(targetModuleIndex);
                setCurrentTopicIndex(0);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch progress', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white p-10 text-center">Loading Course Content...</div>;

    const currentModule = classroom.syllabus && classroom.syllabus[currentModuleIndex];
    if (!currentModule) return <div className="text-white p-10 text-center">Error: Module not found</div>;

    const isLastModule = classroom.syllabus && currentModuleIndex === classroom.syllabus.length - 1;

    if (currentTopicIndex === -1) {
        return (
            <div className="fixed inset-0 bg-[#02040a] z-[80] flex items-center justify-center p-8 overflow-hidden">
                <SpaceBackground mode="interactive" />
                <GlassCard className="max-w-2xl w-full p-16 text-center animate-scale-in" hover={false}>
                    <div className="w-24 h-24 bg-space-accent/20 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl shadow-[0_0_50px_rgba(0,240,255,0.2)] animate-float">
                        🎓
                    </div>
                    <h2 className="text-4xl font-black mb-6 text-white uppercase tracking-tight">Course Completed</h2>
                    <p className="text-gray-300 text-lg mb-10 leading-relaxed font-medium">
                        You have successfully processed all operational modules. Your final mission data will undergo
                        <span className="text-space-accent font-black uppercase tracking-widest px-2"> Mentor Evaluation</span>.
                    </p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 inline-block">
                        Modules Secured: {classroom.syllabus?.length || 0} | Status: Pending Authorization
                    </div>
                    <div className="block">
                        <Button onClick={onClose} className="px-16 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            Back to Dashboard
                        </Button>
                    </div>
                </GlassCard>
            </div>
        );
    }

    if (!currentModule.topics || currentModule.topics.length === 0) {
        return <div className="text-white p-10 text-center">Error: Module has no topics defined.</div>;
    }

    const currentTopic = currentModule.topics[currentTopicIndex];
    const isFirstTopic = currentTopicIndex === 0;
    const isLastTopic = currentTopicIndex === currentModule.topics.length - 1;

    // Safety check for currentTopic to avoid blank screen/crash
    if (!currentTopic) {
        return (
            <div className="fixed inset-0 bg-[#02040a] z-[60] flex items-center justify-center p-8">
                <SpaceBackground mode="static" />
                <GlassCard className="max-w-md p-10 text-center" hover={false}>
                    <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Signal Interference</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-8 text-center leading-relaxed">The content stream for this sector has been interrupted. Re-synchronization required.</p>
                    <Button onClick={() => { setCurrentTopicIndex(0); fetchProgress(); }} className="w-full">
                        Initialize Re-Sync
                    </Button>
                </GlassCard>
            </div>
        );
    }

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



    if (showQuiz) {
        return (
            <div className="fixed inset-0 bg-[#02040a] z-[70] p-8 overflow-y-auto">
                <SpaceBackground mode="static" />
                <div className="max-w-4xl mx-auto relative z-10">
                    <button
                        onClick={() => setShowQuiz(false)}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                    >
                        &larr; Back to Lesson
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
        <div className="fixed inset-0 bg-[#02040a] z-[60] flex flex-col font-body overflow-hidden">
            <SpaceBackground mode="static" />

            <header className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md relative z-20">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-black text-sm"
                    >
                        ✕
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">{classroom.course?.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="h-1 w-1 bg-space-accent rounded-full animate-pulse"></span>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                Module {currentModuleIndex + 1}: {currentModule.title}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {!showQuiz && (
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`relative p-3 rounded-xl border transition-all duration-300 group shadow-lg ${unreadCount > 0
                                ? 'bg-error/10 text-error border-error/30 ring-4 ring-error/5 pulse-shadow'
                                : 'bg-space-accent/5 text-space-accent border-space-accent/30 ring-4 ring-space-accent/5'
                                }`}
                            title="Announcements"
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform block">
                                {unreadCount > 0 ? '📡' : '🛰️'}
                            </span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-error text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce ring-2 ring-error/50">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    )}
                    <div className="flex gap-1.5 px-4 h-8 items-center bg-white/5 border border-white/5 rounded-full">
                        {classroom.syllabus.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-6 h-1 rounded-full transition-all duration-700 ${idx <= currentModuleIndex ? 'bg-space-accent shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-gray-800'}`}
                            />
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-8 relative z-10">
                <NotificationBoard
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                />

                <GlassCard
                    className={`w-full max-w-4xl h-[80vh] flex flex-col group transition-all duration-700 ${showNotifications ? 'blur-md grayscale-[0.5] scale-[0.98] opacity-20' : ''}`}
                    hover={false}
                >
                    <div className="absolute top-0 left-0 w-2 h-full bg-space-accent/40"></div>

                    <div className="p-12 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="mb-10 animate-fade-in">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-space-accent/60">Sequence {currentTopicIndex + 1} // Intelligence Stream</span>
                            <h1 className="text-4xl font-black text-white mt-4 uppercase tracking-tight">{currentTopic.title}</h1>
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg font-medium animate-fade-in stagger-fade-item">
                            {currentTopic.content}
                        </div>
                    </div>

                    <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md flex justify-between items-center relative z-20">
                        <button
                            disabled={isFirstTopic}
                            onClick={handlePrev}
                            className={`px-8 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 transition-all ${isFirstTopic ? 'opacity-10 cursor-not-allowed' : 'hover:bg-white/5 hover:text-white hover:border-white/20'}`}
                        >
                            &larr; Back
                        </button>

                        <div className="flex gap-2">
                            {currentModule.topics.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentTopicIndex ? 'w-8 bg-space-accent' : 'w-2 bg-white/10'}`}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={isLastTopic && isLastModule && progress?.isCourseCompleted ? handleFinishCourse : handleNext}
                            className="rounded-full px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                            {isLastTopic ? (isLastModule && progress?.isCourseCompleted ? 'Finish Course' : 'Start Quiz') : 'Next \u2192'}
                        </Button>
                    </div>
                </GlassCard>
            </main>
        </div>
    );
};

export default LearningContainer;
