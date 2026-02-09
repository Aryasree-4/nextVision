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

    if (loading && !submitted) return <div className="text-white text-center p-10">Preparing Assessment...</div>;
    if (!quiz && !loading) return <div className="text-white text-center p-10">Quiz not available.</div>;

    if (result) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center animate-fade-in shadow-2xl">
                {result.passed ? (
                    <>
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-green-500/20">✓</div>
                        <h2 className="text-4xl font-bold text-white mb-4">Congratulations!</h2>
                        <p className="text-gray-300 text-xl mb-8">{result.message}</p>

                        <div className="grid grid-cols-2 gap-4 mb-10 max-w-md mx-auto">
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <p className="text-gray-400 text-xs uppercase mb-1 font-bold">Your Score</p>
                                <p className="text-3xl font-bold text-white">{result.score} / {result.totalQuestions}</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <p className="text-gray-400 text-xs uppercase mb-1 font-bold">Percentage</p>
                                <p className="text-3xl font-bold text-white">{result.percentage.toFixed(1)}%</p>
                            </div>
                        </div>

                        <div className="text-left mb-10 bg-black/20 rounded-xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4">Correct Answers Review:</h3>
                            <ul className="space-y-3">
                                {quiz.questions.map((q, idx) => (
                                    <li key={idx} className="text-sm border-b border-white/5 pb-2">
                                        <p className="text-gray-400 mb-1">{q.question}</p>
                                        <p className="text-green-400 font-medium">✓ {result.correctAnswers[idx]}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button onClick={() => onComplete(result)} className="w-full md:w-auto px-12 py-3 rounded-full text-lg shadow-xl translate-y-0 hover:-translate-y-1 transition duration-300">
                            Next Module &rarr;
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-red-500/20">✕</div>
                        <h2 className="text-4xl font-bold text-white mb-4">Keep Going!</h2>
                        <p className="text-gray-300 text-xl mb-8">{result.message}</p>
                        <p className="text-gray-500 mb-10">Don't worry, you can retry unlimited times until you pass.</p>
                        <Button onClick={() => window.location.reload()} className="w-full md:w-auto px-12 py-3 rounded-full text-lg bg-red-600 hover:bg-red-500">
                            Retry Quiz
                        </Button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 bg-black/30 border-b border-white/10 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">{moduleTitle} Assessment</h2>
                    <p className="text-xs text-gray-400 mt-1">Answer all questions correctly (Min 50% to pass)</p>
                </div>
                <div className={`flex flex-col items-end ${timeLeft < 60 ? 'text-red-500' : 'text-space-light'}`}>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Time Remaining</span>
                    <span className="text-3xl font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
            </div>

            <div className="p-10 space-y-12 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="animate-slide-up" style={{ animationDelay: `${qIndex * 0.1}s` }}>
                        <h3 className="text-xl text-white font-medium mb-6 flex gap-4">
                            <span className="text-space-light/40 font-mono">0{qIndex + 1}</span>
                            {q.question}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, oIndex) => (
                                <label
                                    key={oIndex}
                                    className={`relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group
                                        ${answers[qIndex] === opt
                                            ? 'bg-space-light/20 border-space-light shadow-[0_0_20px_rgba(30,144,255,0.2)]'
                                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                                >
                                    <input
                                        type="radio"
                                        name={`q-${qIndex}`}
                                        className="hidden"
                                        onChange={() => handleOptionChange(qIndex, opt)}
                                    />
                                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all
                                        ${answers[qIndex] === opt ? 'border-space-light bg-space-light' : 'border-gray-600'}`}>
                                        {answers[qIndex] === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="text-gray-200 group-hover:text-white transition">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-black/30 border-t border-white/10 flex flex-col items-center">
                <Button
                    onClick={() => handleSubmit(false)}
                    isLoading={loading}
                    disabled={Object.keys(answers).length < quiz.questions.length}
                    className="w-full max-w-sm rounded-full py-4 text-xl shadow-2xl"
                >
                    Submit Assessment
                </Button>
                {Object.keys(answers).length < quiz.questions.length && (
                    <p className="text-gray-500 text-sm mt-4 italic">Please answer all questions to submit</p>
                )}
            </div>
        </div>
    );
};

export default QuizInterface;
