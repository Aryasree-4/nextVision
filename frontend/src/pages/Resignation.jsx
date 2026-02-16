import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import Logo from '../components/Logo';

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
            doc.text(certificateText, width / 2, 95, { align: 'center' });

            const bodyText = "During their tenure, they have demonstrated exceptional dedication to teaching, academic excellence, and student mentorship. Their contributions to the development of advanced learning resources and interactive classroom experiences have been instrumental to the platform's vision.";
            const splitBodyText = doc.splitTextToSize(bodyText, width - 80);
            doc.text(splitBodyText, width / 2, 110, { align: 'center' });

            const appreciationText = "We deeply appreciate their professionalism and commitment. This certificate is issued as a token of gratitude for their invaluable service.";
            doc.text(appreciationText, width / 2, 135, { align: 'center' });

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

            // Footer Contact
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('NextVision Ed-Tech Learning Platform  |  contact: mithunsudhakaran95@gmail.com', width / 2, height - 12, { align: 'center' });

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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-br from-[#0a0d24] via-space-blue to-[#050614]">
            <Logo className="mb-12 h-12 w-auto" />

            <div className="max-w-2xl w-full glass-card p-12 text-center border-white/20">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                    🌟
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">Thank You, {user.name}</h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                    Your contribution to NextVision has been invaluable. You've inspired learners
                    and helped us grow. We are truly grateful for your service and dedication.
                </p>

                <div className="flex flex-col gap-6">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <p className="text-sm text-gray-400 mb-4">
                            Before you go, please download your official Experience Certificate.
                        </p>
                        <button
                            onClick={() => generateCertificate(false)}
                            disabled={isGenerating}
                            className="bg-space-light hover:bg-space-light/80 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-space-light/20 transition flex items-center justify-center gap-2 mx-auto"
                        >
                            {isGenerating ? 'Generating...' : '📥 Download Experience Certificate'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="pt-8 border-t border-white/10">
                        <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest">Permanent Action</p>
                        <button
                            onClick={handleLeavePlatform}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold transition-all border ${loading
                                ? 'bg-gray-700 text-gray-500 border-transparent'
                                : 'bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600 hover:text-white'
                                }`}
                        >
                            {loading ? 'Processing Resignation...' : 'Leave Platform Permanently'}
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 text-sm text-gray-400 hover:text-white transition"
                        >
                            Wait, I changed my mind. Go back to Dashboard.
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-gray-500 text-sm">
                NextVision Ed-Tech Platform • Wishing you success in your future endeavors.
            </div>
        </div>
    );
};

export default Resignation;
