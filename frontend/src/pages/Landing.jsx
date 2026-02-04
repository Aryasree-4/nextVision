import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user } = useAuth();

    return (
        <div className="relative isolate px-6 pt-14 lg:px-8">
            <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
                    Welcome to NextVision
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300 drop-shadow-md">
                    A Web-Based Learning Platform for Advanced and Future-Oriented Specializations
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="rounded-md bg-space-blue px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-space-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-blue"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="rounded-md bg-space-light px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-space-light/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-light transition-all duration-300"
                            >
                                Get Started
                            </Link>
                            <Link to="/login" className="text-sm font-semibold leading-6 text-white hover:text-gray-300 transition-colors">
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
