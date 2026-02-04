import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
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
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Create a new account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
                    {/* Dummy inputs to trap browser autofill */}
                    <input type="text" name="dummy_email" style={{ display: 'none' }} tabIndex="-1" />
                    <input type="password" name="dummy_password" style={{ display: 'none' }} tabIndex="-1" />

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <Input
                        id="user_reg_name"
                        type="text"
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="off"
                        minLength={2}
                        maxLength={50}
                        pattern="^[a-zA-Z\s]+$"
                        title="Name can only contain letters and spaces"
                    />

                    <Input
                        id="user_reg_email"
                        type="email"
                        label="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="off"
                    />

                    <Input
                        id="user_reg_password"
                        type="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        minLength={8}
                    />

                    <div>
                        <Button type="submit" isLoading={loading}>
                            Sign up
                        </Button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
