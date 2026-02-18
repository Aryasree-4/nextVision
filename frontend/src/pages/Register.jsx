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
    const [role, setRole] = useState('learner');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password, role);
            if (role === 'mentor') navigate('/mentor-dashboard');
            else if (role === 'admin') navigate('/admin-dashboard');
            else navigate('/learner-dashboard');
        } catch (err) {
            console.error('Registration Error:', err);
            if (err.response?.data?.errors) {
                setError(err.response.data.errors.map(e => e.msg).join(', '));
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
                                placeholder="Commander Shepard"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoComplete="off"
                            />

                            <Input
                                id="user_reg_email"
                                type="email"
                                label="Email address"
                                placeholder="name@station.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="off"
                            />

                            <Input
                                id="user_reg_password"
                                type="password"
                                label="Security Key"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">
                                    Specialization Role
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
