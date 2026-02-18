import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';

const Landing = () => {
    const { user, logout } = useAuth();

    const features = [
        {
            title: "Frontier frontiers",
            description: "Explore multidisciplinary breakthroughs across a diverse range of visionary domains.",
            icon: "✨"
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
        <div className="min-h-screen flex flex-col selection:bg-space-light/30">
            <SpaceBackground mode="interactive" />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-space-navy/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Logo className="h-8 w-auto cursor-pointer" />
                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/dashboard"
                                    className="btn-primary py-2 px-5 text-sm"
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
                            <div className="flex items-center gap-8">
                                <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary py-2 px-6 text-sm"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow pt-40 pb-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 text-center lg:text-left animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-space-light/5 border border-space-light/10 text-space-light text-xs font-bold tracking-[0.2em] uppercase mb-10">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-space-light opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-space-light"></span>
                            </span>
                            v1.0 Beta
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
                            The Future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-space-light via-white to-space-accent">
                                Innovation
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                            Step into a mentor-guided learning ecosystem designed for the next generation of
                            pioneers in diverse, future-oriented subjects from across various domains.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                            <Link
                                to="/register"
                                className="btn-primary w-full sm:w-auto px-10 py-4 text-lg"
                            >
                                Get Started
                            </Link>
                            <Link
                                to="/about"
                                className="btn-secondary w-full sm:w-auto px-10 py-4 text-lg"
                            >
                                About Platform
                            </Link>
                        </div>
                    </div>

                    {/* Futuristic Illustration Area */}
                    <div className="flex-1 relative animate-float">
                        <GlassCard className="p-2 relative z-10 overflow-hidden" hover={false}>
                            <div className="bg-space-navy/40 rounded-[10px] p-10 aspect-square flex items-center justify-center overflow-hidden border border-white/5 relative">
                                {/* Abstract SVG Innovation */}
                                <svg width="240" height="240" viewBox="0 0 100 100" className="opacity-60 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.2" fill="none" className="text-space-light/30" />
                                    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4,4" className="text-space-light/50" />
                                    <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="0.1" className="text-white/20" />
                                    <circle cx="50" cy="50" r="15" fill="url(#grad)" className="animate-pulse" />
                                    <defs>
                                        <radialGradient id="grad">
                                            <stop offset="0%" stopColor="#3B82F6" />
                                            <stop offset="100%" stopColor="#6366F1" />
                                        </radialGradient>
                                    </defs>
                                    {/* Rotating rings */}
                                    <g className="origin-center animate-[spin_20s_linear_infinite]">
                                        <rect x="20" y="20" width="60" height="60" rx="4" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-space-light/20" />
                                    </g>
                                </svg>

                                {/* Overlay data points */}
                                <div className="absolute top-6 left-6 font-mono text-[10px] text-space-light/60 tracking-widest">
                                    COORD: 24.91N / 121.35E
                                </div>
                                <div className="absolute bottom-6 right-6 font-mono text-[10px] text-space-light/60 tracking-widest">
                                    STATUS: CALIBRATING...
                                </div>
                            </div>
                        </GlassCard>
                        {/* Radiant Glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-space-light/20 blur-[120px] -z-10 rounded-full"></div>
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-space-accent/10 blur-[80px] -z-10 rounded-full"></div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto mt-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <GlassCard key={index} className="p-10 group bg-space-blue-dark/40">
                            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 inline-block drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-space-light transition-colors">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed font-light">
                                {feature.description}
                            </p>
                        </GlassCard>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-16 px-6 border-t border-white/5 bg-space-navy/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Logo className="h-6 w-auto" />
                        <p className="text-gray-500 text-xs tracking-wider uppercase">
                            Empowering the creators of tomorrow.
                        </p>
                    </div>
                    <div className="flex gap-10 text-sm text-gray-500 font-medium tracking-wide">
                        <Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                    <p className="text-gray-600 text-xs">
                        © {new Date().getFullYear()} NextVision Laboratory.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
