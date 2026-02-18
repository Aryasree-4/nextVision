import { Link } from 'react-router-dom';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const NotFound = () => {
    return (
        <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 font-body">
            <SpaceBackground mode="interactive" />

            <div className="max-w-md w-full relative z-10">
                <GlassCard className="p-12 text-center animate-scale-in" hover={false}>
                    <div className="text-6xl font-black text-space-accent mb-6 animate-float drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                        404
                    </div>

                    <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Signal Lost</h1>
                    <p className="text-sm text-gray-400 mb-10 leading-relaxed font-medium">
                        The coordinates you provided do not correspond to any known sector in the NextVision network.
                    </p>

                    <Link to="/">
                        <Button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]">
                            Return to Command Center
                        </Button>
                    </Link>

                    <div className="mt-8 text-[9px] font-black uppercase tracking-widest text-gray-600">
                        Error Code: SECTOR_NOT_FOUND
                    </div>
                </GlassCard>
            </div>
        </main>
    );
};

export default NotFound;
