import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import SpaceBackground from '../components/SpaceBackground';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const Resignation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Redirect if not mentor
    useEffect(() => {
        if (user && user.role !== 'mentor') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const generateCertificate = async (isBackup = false) => {
        try {
            setIsGenerating(true);
            setError('');

            if (!user || !user.name) {
                throw new Error("User data is incomplete. Please try logging out and back in.");
            }

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const width = doc.internal.pageSize.getWidth();
            const height = doc.internal.pageSize.getHeight();

            // Background: Soft Off-white (#FCFBF7)
            doc.setFillColor(252, 251, 247);
            doc.rect(0, 0, width, height, 'F');

            // Outer Border: Deep Navy Blue (#1A2B48)
            doc.setDrawColor(26, 43, 72);
            doc.setLineWidth(15);
            doc.rect(0, 0, width, height, 'S');

            // Inner Border: Accent Gold (#C5A059) thin double line
            doc.setDrawColor(197, 160, 89);
            doc.setLineWidth(1);
            doc.rect(12, 12, width - 24, height - 24, 'S');
            doc.rect(14, 14, width - 28, height - 28, 'S');

            // Authoritative Header
            doc.setTextColor(26, 43, 72); // Deep Navy
            doc.setFont('times', 'bold');
            doc.setFontSize(36);
            doc.text('EXPERIENCE CERTIFICATE', width / 2, 45, { align: 'center' });

            // Decorative Line
            doc.setDrawColor(197, 160, 89); // Gold
            doc.setLineWidth(0.5);
            doc.line(width / 2 - 40, 50, width / 2 + 40, 50);

            doc.setFontSize(14);
            doc.setFont('times', 'italic');
            doc.text('This is to officially certify that', width / 2, 65, { align: 'center' });

            // Mentor Name - Bold Serif
            doc.setFontSize(28);
            doc.setFont('times', 'bold');
            doc.text(user.name.toUpperCase(), width / 2, 80, { align: 'center' });

            // Body Text - Clean Serif
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(14);
            doc.setFont('times', 'normal');

            // Date Safety Check
            const registrationDate = user.createdAt ? new Date(user.createdAt) : new Date();
            const startDate = format(registrationDate, 'do MMMM yyyy');
            const endDate = format(new Date(), 'do MMMM yyyy');

            const certificateText = `has served as a Mentor for the NextVision Learning Platform from ${startDate} to ${endDate}.`;
            const splitCertificateText = doc.splitTextToSize(certificateText, width - 60);
            doc.text(splitCertificateText, width / 2, 95, { align: 'center' });

            const bodyText = "During their tenure, they have demonstrated exceptional dedication to teaching, academic excellence, and student mentorship. Their contributions to the development of advanced learning resources and interactive classroom experiences have been instrumental to the platform's vision.";
            const splitBodyText = doc.splitTextToSize(bodyText, width - 70);
            doc.text(splitBodyText, width / 2, 110, { align: 'center' });

            const appreciationText = "We deeply appreciate their professionalism and commitment. This certificate is issued as a token of gratitude for their invaluable service.";
            const splitAppreciationText = doc.splitTextToSize(appreciationText, width - 70);
            doc.text(splitAppreciationText, width / 2, 135, { align: 'center' });

            // Footer Text
            doc.setFontSize(12);
            doc.text('We wish them every success in their future career and personal milestones.', width / 2, 150, { align: 'center' });

            // Signature Block
            doc.setTextColor(26, 43, 72);
            doc.setFont('times', 'bold');
            doc.setFontSize(14);
            doc.text('__________________________', width - 85, height - 50);
            doc.text('Mithun S', width - 85, height - 43);
            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            doc.text('Founder & CEO', width - 85, height - 38);
            doc.text(`Issued on: ${endDate}`, width - 85, height - 33);

            // Footer Contact (Improved Visibility)
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('NextVision Ed-Tech Learning Platform  |  contact: mithunsudhakaran95@gmail.com', width / 2, height - 15, { align: 'center' });

            setIsGenerating(false);
            if (isBackup) {
                return doc.output('datauristring');
            } else {
                doc.save(`${user.name}_Experience_Certificate.pdf`);
            }
        } catch (err) {
            console.error("Certificate Generation Error:", err);
            setError("Failed to generate certificate. Please ensure your profile information is complete.");
            setIsGenerating(false);
            throw err; // Re-throw for handleLeavePlatform if needed
        }
    };

    const handleLeavePlatform = async () => {
        if (!window.confirm('Are you absolutely sure you want to leave? This will permanently delete your account and all your classrooms. This action is irreversible.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Generate certificate data for backup
            const certificateData = await generateCertificate(true);

            await api.post('/users/resign', {
                certificateData,
                fileName: `${user.name}_Resignation_Backup.pdf`
            });

            // If success, logout locally and redirect
            await logout();
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to complete resignation. Please try again or contact support.');
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 font-body">
            <SpaceBackground mode="interactive" />

            <div className="max-w-2xl w-full relative z-10 px-4">
                <GlassCard className="p-10 md:p-16 text-center animate-scale-in" hover={false}>
                    <div className="w-24 h-24 bg-space-accent/10 border border-space-accent/20 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl shadow-[0_0_50px_rgba(0,240,255,0.15)] animate-float">
                        <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">✨</span>
                    </div>

                    <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">Final Appreciation</h1>
                    <p className="text-[10px] text-space-accent font-black uppercase tracking-[0.3em] mb-8">Personnel: {user.name}</p>

                    <p className="text-lg text-gray-300 mb-12 leading-relaxed font-medium">
                        Your contribution to the <span className="text-white font-bold">NextVision Collective</span> has been instrumental.
                        As you prepare for your next deployment, we acknowledge your dedication to the progression of knowledge.
                    </p>

                    <div className="space-y-8">
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 group hover:border-space-accent/30 transition-all duration-500">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">Credential Acquisition Phase</p>
                            <Button
                                onClick={() => generateCertificate(false)}
                                disabled={isGenerating}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                {isGenerating ? 'Processing Data...' : 'SECURE EXPERIENCE CERTIFICATE'}
                            </Button>
                            <p className="text-[10px] text-gray-600 mt-4 italic">Recommended: Backup your service record before departure.</p>
                        </div>

                        {error && (
                            <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                                System Alert: {error}
                            </div>
                        )}

                        <div className="pt-10 border-t border-white/5 space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-error/60">Critical Operation</p>
                                <button
                                    onClick={handleLeavePlatform}
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border ${loading
                                        ? 'bg-gray-800 text-gray-600 border-transparent'
                                        : 'bg-error/5 text-error border-error/20 hover:bg-error hover:text-white hover:shadow-[0_0_30px_rgba(255,59,48,0.3)]'
                                        }`}
                                >
                                    {loading ? 'Executing Purge Sequence...' : 'LEAVE PLATFORM PERMANENTLY'}
                                </button>
                            </div>

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-space-accent transition-all"
                            >
                                &#8212; ABORT DISCONNECT & RETURN TO COMMAND &#8212;
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="mt-12 text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] relative z-10">
                NextVision &bull; Knowledge Progression Engine
            </div>
        </div>
    );
};

export default Resignation;
