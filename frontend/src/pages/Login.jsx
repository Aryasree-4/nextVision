import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';
import Logo from '../components/Logo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            if (data.role === 'mentor') navigate('/mentor-dashboard');
            else if (data.role === 'admin') navigate('/admin-dashboard');
            else navigate('/learner-dashboard');
        } catch (err) {
            console.error('Login Error:', err);
            setError(err.response?.data?.message || err.message || 'Login failed. Please check if the server is running.');
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

            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">
                <div className="hidden lg:block animate-fade-in">
                    <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Journey into the <br />
                        <span className="text-space-light">Unknown</span>
                    </h2>
                    <p className="text-gray-400 text-lg font-light leading-relaxed max-w-md">
                        Access your research portal and continue building the future. Your mentorship-guided pathway awaits.
                    </p>
                </div>

                <GlassCard className="p-10 animate-scale-in" hover={false}>
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-gray-500 text-sm mb-10">
                            Identify yourself to proceed to the dashboard.
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
                                id="user_login_email"
                                type="email"
                                label="Email address"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="off"
                            />

                            <Input
                                id="user_login_password"
                                type="password"
                                label="Password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />

                            <div className="pt-4">
                                <Button type="submit" isLoading={loading} className="w-full py-4 uppercase tracking-[0.2em] text-xs">
                                    Authorize Access
                                </Button>
                            </div>
                        </form>

                        <p className="mt-10 text-center text-sm text-gray-500">
                            First mission?{' '}
                            <Link to="/register" className="font-bold text-space-light hover:text-white transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default Login;
