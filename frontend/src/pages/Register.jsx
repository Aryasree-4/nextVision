import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';
import Logo from '../components/Logo';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [role, setRole] = useState('learner');
    const [formErrors, setFormErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        let isValid = true;
        let newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required.';
            isValid = false;
        } else if (name.trim().length < 2 || name.trim().length > 50) {
            newErrors.name = 'Name must be between 2 and 50 characters.';
            isValid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(name)) {
            newErrors.name = 'Name can only contain letters and spaces.';
            isValid = false;
        }

        if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/.test(email)) {
             newErrors.email = 'Email can only contain letters, numbers, and the @ symbol.';
             isValid = false;
        }
        
        const trimmedPassword = password.trim();
        if (trimmedPassword.length < 8 || trimmedPassword.length > 20) {
            newErrors.password = 'Password must be between 8 and 20 characters.';
            isValid = false;
        } else {
            const missing = [];
            if (!/\d/.test(trimmedPassword)) missing.push('one number');
            if (!/[a-z]/.test(trimmedPassword)) missing.push('one lowercase letter');
            if (!/[A-Z]/.test(trimmedPassword)) missing.push('one uppercase letter');
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmedPassword)) missing.push('one special character');
            
            if (missing.length === 4) {
               newErrors.password = 'Password must contain at least one number, one lowercase letter, one uppercase letter and one special character';
               isValid = false;
            } else if (missing.length > 0) {
               newErrors.password = `Password is missing: ${missing.join(', ')}`;
               isValid = false;
            }
        }

        if (!/^[6-9]\d{9}$/.test(contactNumber)) {
            newErrors.contactNumber = 'Contact number must be exactly 10 digits and start with 9, 8, 7, or 6.';
            isValid = false;
        }

        if (!securityQuestion) {
            newErrors.securityQuestion = 'Please select a security question.';
            isValid = false;
        }

        if (!securityAnswer.trim()) {
            newErrors.securityAnswer = 'Security answer is required.';
            isValid = false;
        }

        setFormErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setError('');
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            await register(name, email, password, role, contactNumber, securityQuestion, securityAnswer);
            if (role === 'mentor') navigate('/mentor-dashboard');
            else if (role === 'admin') navigate('/admin-dashboard');
            else navigate('/learner-dashboard');
        } catch (err) {
            console.error('Registration Error:', err);
            if (err.response?.data?.errors) {
                const backendErrors = {};
                err.response.data.errors.forEach(e => {
                    const fieldName = e.path || e.param;
                    if (fieldName && !backendErrors[fieldName]) {
                        backendErrors[fieldName] = e.msg;
                    }
                });
                
                if (Object.keys(backendErrors).length > 0) {
                    setFormErrors(backendErrors);
                } else {
                    setError(err.response.data.errors.map(e => e.msg).join(', '));
                }
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(err.message || 'Registration failed. Please check if the server is running.');
            }
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

            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
                <div className="hidden lg:block animate-fade-in order-last lg:order-first">
                    <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Create Your <br />
                        <span className="text-space-light">Account</span>
                    </h2>
                    <p className="text-gray-400 text-lg font-light leading-relaxed max-w-md">
                        Join our community of future-oriented learners. Choose your role and start your journey.
                    </p>
                    <div className="mt-12 flex gap-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-3xl">⚛️</span>
                            <span className="text-xs font-bold tracking-widest text-space-light uppercase">Frontier Science</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-3xl">🧩</span>
                            <span className="text-xs font-bold tracking-widest text-space-light uppercase">Global Synthesis</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-3xl">🛰️</span>
                            <span className="text-xs font-bold tracking-widest text-space-light uppercase">Planetary Ops</span>
                        </div>
                    </div>
                </div>

                <GlassCard className="p-10 animate-scale-in" hover={false}>
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Sign Up
                        </h2>
                        <p className="text-gray-500 text-sm mb-10">
                            Create your credentials to begin.
                        </p>
                    </div>

                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                            {/* Dummy inputs to trap browser autofill */}
                            <input type="text" name="dummy_email" style={{ display: 'none' }} tabIndex="-1" />
                            <input type="password" name="dummy_password" style={{ display: 'none' }} tabIndex="-1" />

                            {error && (
                                <div className="bg-error/10 border border-error/20 text-error text-xs p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                                    <span>⚠️</span>
                                    {error}
                                </div>
                            )}

                            <Input
                                id="user_reg_name"
                                type="text"
                                label="Full Name"
                                placeholder="enter your full name"
                                value={name}
                                onChange={(e) => {
                                    const formattedValue = e.target.value
                                        .replace(/[^a-zA-Z\s]/g, '')
                                        .replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                                    setName(formattedValue);
                                    setFormErrors(prev => ({...prev, name: ''}));
                                }}
                                error={formErrors.name}
                                required
                                autoComplete="off"
                            />

                            <Input
                                id="user_reg_email"
                                type="email"
                                label="Email address"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => {setEmail(e.target.value); setFormErrors(prev => ({...prev, email: ''}))}}
                                error={formErrors.email}
                                required
                                autoComplete="off"
                            />

                            <Input
                                id="user_reg_password"
                                type="password"
                                label="Security Key"
                                placeholder="password must be between 8 and 20 characters"
                                value={password}
                                onChange={(e) => {setPassword(e.target.value); setFormErrors(prev => ({...prev, password: ''}))}}
                                error={formErrors.password}
                                required
                                minLength={8}
                                maxLength={20}
                                autoComplete="new-password"
                            />

                            <Input
                                id="user_reg_contactNumber"
                                type="text"
                                label="Contact Number"
                                placeholder="enter your contact number"
                                value={contactNumber}
                                onChange={(e) => {setContactNumber(e.target.value); setFormErrors(prev => ({...prev, contactNumber: ''}))}}
                                error={formErrors.contactNumber}
                                required
                                autoComplete="off"
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                    Security Question
                                </label>
                                <div className="relative">
                                    <select
                                        className={`input-field appearance-none cursor-pointer ${formErrors.securityQuestion ? 'border-error/50' : ''}`}
                                        value={securityQuestion}
                                        onChange={(e) => {setSecurityQuestion(e.target.value); setFormErrors(prev => ({...prev, securityQuestion: ''}))}}
                                    >
                                        <option value="" disabled className="bg-space-navy text-gray-500">Select a question</option>
                                        <option value="What is your favorite color?" className="bg-space-navy text-white">What is your favorite color?</option>
                                        <option value="In what city were you born?" className="bg-space-navy text-white">In what city were you born?</option>
                                        <option value="What is the name of your first school?" className="bg-space-navy text-white">What is the name of your first school?</option>
                                        <option value="What was your childhood pet's name?" className="bg-space-navy text-white">What was your childhood pet's name?</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2 text-gray-400">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                                        </svg>
                                    </div>
                                </div>
                                {formErrors.securityQuestion && (
                                    <div className="text-error text-xs font-semibold mt-2 ml-1 flex items-center gap-1 animate-fade-in">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                                        {formErrors.securityQuestion}
                                    </div>
                                )}
                            </div>

                            <Input
                                id="user_reg_securityAnswer"
                                type="text"
                                label="Security Answer"
                                placeholder="enter your answer"
                                value={securityAnswer}
                                onChange={(e) => {setSecurityAnswer(e.target.value); setFormErrors(prev => ({...prev, securityAnswer: ''}))}}
                                error={formErrors.securityAnswer}
                                required
                                autoComplete="off"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">
                                    Role
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRole('learner')}
                                        className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border ${role === 'learner' ? 'bg-space-light/20 border-space-light text-white shadow-lg shadow-space-light/10' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                                    >
                                        Learner
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('mentor')}
                                        className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border ${role === 'mentor' ? 'bg-space-light/20 border-space-light text-white shadow-lg shadow-space-light/10' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                                    >
                                        Mentor
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" isLoading={loading} className="w-full py-4 uppercase tracking-[0.2em] text-xs">
                                    Register
                                </Button>
                            </div>
                        </form>

                        <p className="mt-10 text-center text-sm text-gray-500">
                            Already registered?{' '}
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

export default Register;
