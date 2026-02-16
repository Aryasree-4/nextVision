import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Landing = () => {
    const { user, logout } = useAuth();

    const features = [
        {
            title: "Future-Ready Topics",
            description: "Master AI, Robotics, Quantum Computing, and other emerging fields.",
            icon: "🚀"
        },
        {
            title: "Research-Driven Learning",
            description: "Engage with latest research papers and expert-led case studies.",
            icon: "🔬"
        },
        {
            title: "Expert Mentorship",
            description: "Connect with industry leaders and academic pioneers globally.",
            icon: "🎓"
        },
        {
            title: "Interactive Classrooms",
            description: "Collaborative learning environments with real-time feedback.",
            icon: "💻"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Logo className="h-8 w-auto cursor-pointer" />
                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/dashboard"
                                    className="px-4 py-2 bg-space-light rounded-lg text-sm font-semibold hover:bg-space-light/90 transition-all shadow-lg shadow-space-light/20"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-space-light rounded-lg text-sm font-semibold hover:bg-space-light/90 transition-all shadow-lg shadow-space-light/20"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-space-light/10 border border-space-light/20 text-space-light text-xs font-bold tracking-wider uppercase mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-space-light opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-space-light"></span>
                            </span>
                            Ed-Tech of the Future
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                            Learning Beyond <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-space-light to-white">
                                Boundaries
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Discover a universe of knowledge with NextVision. We bridge the gap between
                            traditional education and future-ready specializations through immersive learning.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-4 bg-space-light rounded-xl text-lg font-bold hover:bg-space-light/90 transition-all shadow-xl shadow-space-light/30 text-center"
                            >
                                Start Learning Now
                            </Link>
                            <Link
                                to="/about"
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-lg font-bold transition-all border border-white/10 text-center"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>

                    {/* Minimal Tech Illustration Area */}
                    <div className="flex-1 relative">
                        <div className="relative z-10 glass-card p-4 animate-scale-up">
                            <div className="bg-space-blue/40 rounded-xl p-8 aspect-video flex items-center justify-center overflow-hidden border border-white/5">
                                {/* Abstract SVG Illustration */}
                                <svg width="200" height="200" viewBox="0 0 100 100" className="opacity-80">
                                    <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="5,5" />
                                    <circle cx="50" cy="50" r="30" stroke="#3B82F6" strokeWidth="1" fill="none" />
                                    <path d="M50 20 L50 80 M20 50 L80 50" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
                                    <rect x="45" y="45" width="10" height="10" rx="2" fill="#3B82F6" className="animate-pulse" />
                                </svg>
                            </div>
                        </div>
                        {/* Decorative Background Elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-space-light/20 blur-[100px] -z-10 rounded-full"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 blur-[60px] -z-10 rounded-full"></div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="glass-card p-8 hover:bg-white/10 transition-all duration-300 group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <Logo className="h-6 w-auto" />
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} NextVision Ed-Tech. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
