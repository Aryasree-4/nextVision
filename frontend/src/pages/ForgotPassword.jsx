import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';
import Logo from '../components/Logo';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { verifyEmailAndGetQuestion, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const question = await verifyEmailAndGetQuestion(email);
            setSecurityQuestion(question);
            setStep(2);
        } catch (err) {
            console.error('Verify Email Error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to verify email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const missing = [];
        if (!/(?=.*[0-9])/.test(newPassword)) missing.push('one number');
        if (!/(?=.*[a-z])/.test(newPassword)) missing.push('one lowercase letter');
        if (!/(?=.*[A-Z])/.test(newPassword)) missing.push('one uppercase letter');
        if (!/(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-])/.test(newPassword)) missing.push('one special character');
        
        if (missing.length === 4) {
           setError('Password must contain at least one number, one lowercase letter, one uppercase letter and one special character');
           return;
        } else if (missing.length > 0) {
           setError(`Password is missing: ${missing.join(', ')}`);
           return;
        }

        setLoading(true);
        try {
            await resetPassword(email, securityAnswer, newPassword);
            setSuccess('Password successfuly reset!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('Reset Password Error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 lg:px-8 relative overflow-hidden">
            <SpaceBackground mode="interactive" />

            <div className="absolute top-8 left-8">
                <Link to="/">
                    <Logo className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            <div className="w-full max-w-xl mx-auto">
                <GlassCard className="p-10 animate-scale-in" hover={false}>
                    <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2 text-center">
                            Recover Account
                        </h2>
                        <p className="text-gray-500 text-sm text-center">
                            {step === 1 ? 'Enter your email to retrieve your security question.' : 'Answer your security question and create a new password.'}
                        </p>
                    </div>

                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        {error && (
                            <div className="bg-error/10 border border-error/20 text-error text-xs p-4 rounded-xl flex items-center gap-3 animate-fade-in mb-6">
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-success/10 border border-success/20 text-success text-xs p-4 rounded-xl flex items-center gap-3 animate-fade-in mb-6">
                                <span>✅</span>
                                {success}
                            </div>
                        )}

                        {step === 1 ? (
                            <form className="space-y-6" onSubmit={handleEmailSubmit} autoComplete="off">
                                <Input
                                    id="reset_email"
                                    type="email"
                                    label="Registered Email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                                <div className="pt-4">
                                    <Button type="submit" isLoading={loading} className="w-full py-4 uppercase tracking-[0.2em] text-xs">
                                        Next
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form className="space-y-6" onSubmit={handleResetSubmit} autoComplete="off">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400 ml-1">
                                        Security Question
                                    </label>
                                    <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white shadow-inner">
                                        {securityQuestion}
                                    </div>
                                </div>

                                <Input
                                    id="reset_security_answer"
                                    type="text"
                                    label="Your Answer"
                                    placeholder="enter your answer"
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                    required
                                    autoComplete="off"
                                />

                                <Input
                                    id="reset_new_password"
                                    type="password"
                                    label="New Password"
                                    placeholder="create new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    maxLength={20}
                                />

                                <Input
                                    id="reset_confirm_password"
                                    type="password"
                                    label="Confirm New Password"
                                    placeholder="confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    maxLength={20}
                                />

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); setError(''); }}
                                        className="w-1/3 py-4 uppercase tracking-[0.2em] text-xs font-semibold rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Back
                                    </button>
                                    <Button type="submit" isLoading={loading} className="w-2/3 py-4 uppercase tracking-[0.2em] text-xs">
                                        Reset Password
                                    </Button>
                                </div>
                            </form>
                        )}

                        <p className="mt-10 text-center text-sm text-gray-500">
                            Remember your password?{' '}
                            <Link to="/login" className="font-bold text-space-light hover:text-white transition-colors">
                                Return to login
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default ForgotPassword;
