import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <div className="w-32">
                        <Button onClick={logout}>Logout</Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                            <div className="mt-5 border-t border-gray-200">
                                <dl className="sm:divide-y sm:divide-gray-200">
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500">Full name</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.name}</dd>
                                    </div>
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
                                    </div>
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500">User ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?._id}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
