import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user } = useAuth();

    return (
        <div className="relative isolate px-6 pt-14 lg:px-8">
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Welcome to NextVision Auth
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                    A production-ready full-stack authentication system using session-based cookies.
                    Secure, simple, and built with modern tech.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Get Started
                            </Link>
                            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
                                Log In <span aria-hidden="true">→</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Landing;
