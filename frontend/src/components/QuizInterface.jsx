import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Button from './Button';

const QuizInterface = ({ classroomId, moduleIndex, moduleTitle, onComplete }) => {
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchQuiz();
        startTimer();
        return () => clearInterval(timerRef.current);
    }, []);

    const fetchQuiz = async () => {
        try {
            const { data } = await api.get(`/assessments/${classroomId}/quiz/${moduleIndex}`);
            setQuiz(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch quiz', error);
            setLoading(false);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleOptionChange = (qIndex, option) => {
        setAnswers({ ...answers, [qIndex]: option });
    };

    const handleSubmit = async (isAutoSub = false) => {
        if (submitted) return;
        setSubmitted(true);
        clearInterval(timerRef.current);
        setLoading(true);

        try {
            const { data } = await api.post('/assessments/submit', {
                classroomId,
                moduleIndex,
                answers: Object.values(answers)
            });
            setResult(data);
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading && !submitted) {
        return (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-16 text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-space-accent/20 border-t-space-accent rounded-full animate-spin mx-auto mb-8"></div>
                <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Synchronizing Parameters</h2>
                <p className="text-[9px] text-gray-500 mt-4 font-black uppercase tracking-widest">Retrieving module intelligence from sector servers...</p>
            </div>
        );
    }

    if (!quiz && !loading) {
        return (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-16 text-center">
                <div className="text-5xl mb-8 opacity-20">📡</div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4">Intelligence Gap</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-10">The assessment stream for this module is currently off-line.</p>
                <Button onClick={() => window.location.reload()} className="px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Re-initialize Comm Link
                </Button>
            </div>
        );
    }

    if (result) {
        return (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-12 text-center animate-scale-in shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-space-light/30"></div>
                {result.passed ? (
                    <>
                        <div className="w-24 h-24 bg-space-accent/20 border border-space-accent/40 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-[0_0_40px_rgba(0,240,255,0.2)] animate-float">
                            🛰️
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Mission Success</h2>
                        <p className="text-gray-400 text-lg mb-10 font-medium uppercase tracking-widest">{result.message}</p>

                        <div className="grid grid-cols-2 gap-6 mb-12 max-w-md mx-auto">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Data Accuracy</p>
                                <p className="text-3xl font-black text-white">{result.score} / {result.totalQuestions}</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Yield Alpha</p>
                                <p className="text-3xl font-black text-space-accent">{result.percentage.toFixed(1)}%</p>
                            </div>
                        </div>

                        <div className="text-left mb-12 bg-black/40 rounded-2xl p-8 border border-white/5">
                            <h3 className="text-xs font-black text-white mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
                                <span className="h-1.5 w-1.5 bg-space-accent rounded-full animate-pulse"></span>
                                intelligence log review
                            </h3>
                            <ul className="space-y-4">
                                {quiz.questions.map((q, idx) => (
                                    <li key={idx} className="border-b border-white/5 pb-4 last:border-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 truncate">{q.question}</p>
                                        <p className="text-xs text-space-accent font-bold">&gt;&gt; VERIFIED: {result.correctAnswers[idx]}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button onClick={() => onComplete(result)} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            Advance to Next Sector &rarr;
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="w-24 h-24 bg-error/10 border border-error/30 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-[0_0_40px_rgba(255,59,48,0.2)] animate-pulse">
                            ⚠️
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Mission Stalled</h2>
                        <p className="text-gray-400 text-lg mb-8 font-medium uppercase tracking-widest">{result.message}</p>
                        <p className="text-[10px] text-gray-600 mb-12 uppercase tracking-widest">Re-calibration required. Operational integrity below threshold.</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-full bg-error/20 border-error/50 hover:bg-error transition-all"
                        >
                            Execute Re-Try Protocol
                        </Button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white/2 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-body animate-scale-in">
            <div className="p-8 bg-black/40 border-b border-white/10 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <div className="flex flex-col">
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">{moduleTitle} Evaluation</h2>
                    <p className="text-[9px] text-gray-500 mt-2 font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-space-light animate-pulse"></span>
                        Status: Active Intelligence Audit
                    </p>
                </div>
                <div className={`flex flex-col items-end ${timeLeft < 60 ? 'text-error' : 'text-space-accent'}`}>
                    <span className="text-[9px] uppercase font-black tracking-widest opacity-40 mb-1">Decay Timer</span>
                    <span className="text-3xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            <div className="p-12 space-y-16 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="animate-fade-in" style={{ animationDelay: `${qIndex * 0.1}s` }}>
                        <div className="flex gap-6 items-start mb-8">
                            <span className="text-[10px] font-black font-mono text-space-accent/40 bg-white/5 px-2 py-1 rounded border border-white/5">0{qIndex + 1}</span>
                            <h3 className="text-xl text-white font-black uppercase tracking-tight leading-snug">
                                {q.question}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                            {q.options.map((opt, oIndex) => (
                                <label
                                    key={oIndex}
                                    className={`relative flex items-center p-5 rounded-2xl border transition-all duration-300 cursor-pointer group
                                        ${answers[qIndex] === opt
                                            ? 'bg-space-light/10 border-space-light/50 shadow-[0_0_30px_rgba(0,240,255,0.15)] ring-1 ring-space-light/20'
                                            : 'bg-white/2 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                                >
                                    <input
                                        type="radio"
                                        name={`q-${qIndex}`}
                                        className="hidden"
                                        onChange={() => handleOptionChange(qIndex, opt)}
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 mr-5 flex items-center justify-center transition-all duration-500
                                        ${answers[qIndex] === opt ? 'border-space-light bg-space-light scale-110 shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'border-white/10'}`}>
                                        {answers[qIndex] === opt && <div className="w-2 h-2 bg-white rounded-full shadow-inner"></div>}
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${answers[qIndex] === opt ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-10 bg-black/40 border-t border-white/10 flex flex-col items-center relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <Button
                    onClick={() => handleSubmit(false)}
                    isLoading={loading}
                    disabled={Object.keys(answers).length < quiz.questions.length}
                    className="w-full max-w-sm py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                    Authorize Data Submission
                </Button>
                {Object.keys(answers).length < quiz.questions.length && (
                    <p className="text-[9px] text-gray-600 mt-6 font-black uppercase tracking-widest animate-pulse">
                        Awaiting Complete Intelligence Parameter Set ({Object.keys(answers).length} / {quiz.questions.length})
                    </p>
                )}
            </div>
        </div>
    );
};

export default QuizInterface;
