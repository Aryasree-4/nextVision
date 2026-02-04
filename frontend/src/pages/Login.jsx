import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

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
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-space-blue/30 backdrop-blur-md p-8 rounded-xl ring-1 ring-white/10 shadow-2xl">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white mb-6">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                        {/* Dummy inputs to trap browser autofill */}
                        <input type="text" name="dummy_email" style={{ display: 'none' }} tabIndex="-1" />
                        <input type="password" name="dummy_password" style={{ display: 'none' }} tabIndex="-1" />

                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                        <Input
                            id="user_login_email"
                            type="email"
                            label="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                        />

                        <Input
                            id="user_login_password"
                            type="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />

                        <div>
                            <Button type="submit" isLoading={loading} className="flex w-full justify-center rounded-md bg-space-blue px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-space-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-blue">
                                Sign in
                            </Button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-300">
                        Not a member?{' '}
                        <Link to="/register" className="font-semibold leading-6 text-space-light hover:text-white transition-colors">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
