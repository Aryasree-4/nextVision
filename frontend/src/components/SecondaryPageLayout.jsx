import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceBackground from './SpaceBackground';
import GlassCard from './GlassCard';
import Logo from './Logo';

const SecondaryPageLayout = ({ title, subtitle, children }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden font-body text-gray-300">
            <SpaceBackground mode="static" />

            {/* Header / Nav */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-space-navy/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <button onClick={() => navigate('/')} className="hover:opacity-80 transition-opacity">
                        <Logo className="h-6 w-auto" />
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
                    >
                        Back
                    </button>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Hero area for the page */}
                    <div className="mb-16 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-space-light/5 border border-space-light/10 text-space-light text-[10px] font-black tracking-widest uppercase mb-4">
                            Sector: Information
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                            {title}
                        </h1>
                        <p className="text-lg text-gray-500 font-light max-w-2xl">
                            {subtitle}
                        </p>
                    </div>

                    <GlassCard className="p-8 md:p-12 animate-scale-in" hover={false}>
                        <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-strong:text-space-light prose-a:text-space-light hover:prose-a:underline transition-all">
                            {children}
                        </div>
                    </GlassCard>
                </div>
            </main>

            <footer className="py-10 text-center border-t border-white/5 bg-space-navy/40 backdrop-blur-sm relative z-10">
                <p className="text-[10px] text-gray-600 uppercase font-bold tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} NextVision Research Laboratory &bull; Celestial Division
                </p>
            </footer>
        </div>
    );
};

export default SecondaryPageLayout;
