import React, { useState, useEffect } from 'react';
import Button from './Button';
import QuizInterface from './QuizInterface';
import api from '../api/axios';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import NotificationBoard from './NotificationBoard';
import SpaceBackground from './SpaceBackground';
import GlassCard from './GlassCard';

const LearningContainer = ({ classroom, enrollment, onClose }) => {
    const { unreadCount, setCurrentClassroomId } = useNotifications();
    const { user } = useAuth();
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    const downloadCertificate = () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Simple Border
        doc.setLineWidth(2);
        doc.rect(10, 10, 277, 190);
        doc.setLineWidth(0.5);
        doc.rect(12, 12, 273, 186);

        // Header
        doc.setFontSize(40);
        doc.setTextColor(30, 64, 175); // Blue
        doc.text('Certificate of Completion', 148.5, 50, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text('Issued by Next Vision', 148.5, 65, { align: 'center' });

        // Learner Name
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('This is to certify that', 148.5, 90, { align: 'center' });

        doc.setFontSize(32);
        doc.setTextColor(0, 0, 0);
        doc.text(user?.name || 'Learner', 148.5, 110, { align: 'center' });

        // Course Title
        doc.setFontSize(18);
        doc.text('has successfully completed the course', 148.5, 130, { align: 'center' });

        doc.setFontSize(26);
        doc.setTextColor(30, 64, 175);
        doc.text(classroom.course?.title || 'Course', 148.5, 150, { align: 'center' });

        // Footer Information
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        
        const mentorName = classroom.mentor?.name || 'TBA';
        const dateCompleted = new Date().toLocaleDateString();

        doc.text(`Mentor: ${mentorName}`, 40, 180);
        doc.text(`Date: ${dateCompleted}`, 200, 180);

        doc.save(`${classroom.course?.title || 'Course'}_Certificate.pdf`);
    };

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
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={onClose} variant="secondary" className="px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            Back to Dashboard
                        </Button>
                        <Button onClick={downloadCertificate} className="px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            Download Certificate
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
    if (!currentTopic && !showQuiz) {
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

    const furthestModuleIndex = progress ? progress.moduleProgress.filter(mp => mp.completed).length : 0;

    const handleSidebarNav = (mIdx, tIdx, isQuizBtn = false) => {
        if (mIdx > furthestModuleIndex) return; // Locked

        setCurrentModuleIndex(mIdx);
        if (isQuizBtn) {
            setShowQuiz(true);
            // Optionally, we could set currentTopicIndex to logic that preserves current reading state
            // But since topics aren't strictly saved individually, we can just leave it as is or set it to 0
        } else {
            setShowQuiz(false);
            setCurrentTopicIndex(tIdx);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#02040a] z-[60] flex font-body overflow-hidden">
            <SpaceBackground mode="static" />

            {/* --- SIDEBAR --- */}
            <aside className="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col relative z-30 transition-all duration-300">
                <div className="p-6 border-b border-white/10 flex flex-col gap-2">
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] leading-relaxed truncate" title={classroom.course?.title}>
                        {classroom.course?.title}
                    </h2>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Syllabus Explorer</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {classroom.syllabus.map((module, mIdx) => {
                        const isLocked = mIdx > furthestModuleIndex;
                        const isCurrentModule = mIdx === currentModuleIndex;
                        return (
                            <div key={mIdx} className={`space-y-3 ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-[10px] font-black text-space-accent uppercase tracking-[0.15em] leading-relaxed">
                                        M{mIdx + 1}: {module.title}
                                    </h3>
                                    {isLocked && <span className="text-[10px]">🔒</span>}
                                </div>
                                <div className="pl-4 ml-2 border-l border-white/10 space-y-1">
                                    {module.topics.map((topic, tIdx) => {
                                        const isActive = isCurrentModule && currentTopicIndex === tIdx && !showQuiz;
                                        return (
                                            <button
                                                key={tIdx}
                                                disabled={isLocked}
                                                onClick={() => handleSidebarNav(mIdx, tIdx, false)}
                                                className={`block w-full text-left text-[11px] font-medium transition-all p-2 rounded-md ${
                                                    isActive 
                                                        ? 'text-white bg-white/10 font-bold shadow-sm' 
                                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                                } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                {topic.title}
                                            </button>
                                        )
                                    })}
                                    <button
                                        disabled={isLocked}
                                        onClick={() => handleSidebarNav(mIdx, 0, true)}
                                        className={`flex items-center gap-2 w-full text-left text-[10px] uppercase tracking-widest mt-3 p-2 rounded-md border transition-all ${
                                            isCurrentModule && showQuiz
                                                ? 'border-space-light/50 bg-space-light/10 text-space-light font-black shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                                : isLocked 
                                                    ? 'border-transparent text-gray-600'
                                                    : 'border-white/10 text-gray-400 hover:border-space-light/30 hover:text-space-light'
                                        }`}
                                    >
                                        <span>🎯</span> Module Assessment
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-6 border-t border-white/10">
                    <Button onClick={onClose} variant="secondary" className="w-full text-[10px] py-3 uppercase tracking-widest font-black transition-all hover:bg-white/10 hover:border-white/20">
                        &larr; Exit Mission
                    </Button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col relative z-20 overflow-hidden">
                <header className="px-8 py-5 border-b border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md">
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-2.5 rounded-full border border-white/10">
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-space-light rounded-full animate-pulse"></span>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                                MOD {currentModuleIndex + 1}
                            </p>
                        </div>
                        <span className="text-white/10">|</span>
                        <p className="text-xs text-white font-black uppercase tracking-[0.1em] truncate max-w-[200px] md:max-w-md">
                            {showQuiz ? 'FINAL ASSESSMENT' : currentTopic?.title}
                        </p>
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
                        <div className="flex gap-1.5 px-4 h-9 items-center bg-white/5 border border-white/5 rounded-full">
                            {classroom.syllabus.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-6 h-1 rounded-full transition-all duration-700 ${idx <= currentModuleIndex ? 'bg-space-light shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-gray-800'}`}
                                />
                            ))}
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex justify-center p-8 relative overflow-y-auto custom-scrollbar">
                    <NotificationBoard
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                    />

                    {showQuiz ? (
                        <div className="w-full max-w-4xl mx-auto rounded-3xl relative z-10 transition-all duration-500 animate-scale-in my-auto h-auto min-h-0 bg-space-navy/50 backdrop-blur-md border border-white/10 p-6 overflow-hidden">
                            <QuizInterface
                                classroomId={classroom._id}
                                moduleIndex={currentModuleIndex}
                                moduleTitle={currentModule.title}
                                onComplete={handleQuizComplete}
                            />
                        </div>
                    ) : (
                        <GlassCard
                            className={`w-full max-w-4xl min-h-[70vh] flex flex-col items-stretch transition-all duration-700 mx-auto my-auto ${showNotifications ? 'blur-md grayscale-[0.5] scale-[0.98] opacity-20' : ''}`}
                            hover={false}
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-space-light to-space-accent/20 rounded-l-2xl"></div>

                            <div className="p-12 pl-14 flex-1">
                                <div className="mb-10 animate-fade-in">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-space-accent/60 flex items-center gap-2">
                                        <span className="w-4 h-[1px] bg-space-accent/60"></span>
                                        Sequence {currentTopicIndex + 1} // Intelligence Stream
                                    </span>
                                    <h1 className="text-4xl font-black text-white mt-4 uppercase tracking-tight">{currentTopic?.title}</h1>
                                </div>

                                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg font-medium animate-fade-in stagger-fade-item">
                                    {currentTopic?.content}
                                </div>
                            </div>

                            <div className="px-12 py-8 border-t border-white/5 bg-black/40 backdrop-blur-md flex justify-between items-center relative z-20 rounded-b-2xl">
                                <button
                                    disabled={isFirstTopic}
                                    onClick={handlePrev}
                                    className={`px-8 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isFirstTopic ? 'opacity-10 cursor-not-allowed text-gray-500' : 'text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20'}`}
                                >
                                    &larr; Back
                                </button>

                                <div className="flex gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/5">
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
                    )}
                </div>
            </main>
        </div>
    );
};

export default LearningContainer;
