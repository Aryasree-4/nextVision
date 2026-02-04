import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

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
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-space-blue/30 backdrop-blur-md p-8 rounded-xl ring-1 ring-white/10 shadow-2xl">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white mb-6">
                        Create a new account
                    </h2>
                </div>

                <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
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
                            <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-200">
                                Account Type
                            </label>
                            <div className="mt-2">
                                <select
                                    id="role"
                                    name="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-space-light sm:text-sm sm:leading-6"
                                >
                                    <option value="learner">Learner</option>
                                    <option value="mentor">Mentor</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Button type="submit" isLoading={loading} className="flex w-full justify-center rounded-md bg-space-blue px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-space-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-blue">
                                Sign up
                            </Button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-300">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold leading-6 text-space-light hover:text-white transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
