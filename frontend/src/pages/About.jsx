import React from 'react';
import SecondaryPageLayout from '../components/SecondaryPageLayout';
import GlassCard from '../components/GlassCard';

const About = () => {
    return (
        <SecondaryPageLayout title="The Vision">
            <div className="space-y-16">
                {/* Vision Section */}
                <section className="animate-fade-in">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="h-1 w-12 bg-space-accent rounded-full mb-8"></div>
                            <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                                Molding the Tech <br />
                                <span className="text-space-accent">Experts of Tomorrow</span>
                            </h2>
                            <p className="text-gray-400 text-lg font-light leading-relaxed">
                                NextVision was founded on the belief that the future belongs to those who can master
                                the synthesis of diverse technical domains. We are not just an educational platform;
                                we are an incubator for the next generation of multidisciplinary researchers,
                                engineers, and visionary pioneers.
                            </p>
                            <p className="text-gray-400 text-lg font-light leading-relaxed">
                                Our mission is to break down the silos of traditional learning and provide a
                                collaborative environment where future-oriented subjects—from advanced physics
                                to neural systems—can be explored with depth and purpose.
                            </p>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-space-accent to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative aspect-video bg-gray-900/50 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
                                <span className="text-7xl group-hover:scale-110 transition-transform duration-700">🚀</span>
                                {/* Low-tech but high-style fallback for missing generated image */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Vision Stream Alpha // Visualizing Future Arch</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Non-Profit Declaration */}
                <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <GlassCard className="p-12 border-space-accent/20 bg-space-accent/5 backdrop-blur-xl" hover={false}>
                        <div className="max-w-3xl mx-auto text-center space-y-8">
                            <div className="w-16 h-16 bg-space-accent text-black rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                                ⚛️
                            </div>
                            <h3 className="text-3xl font-bold text-white uppercase tracking-wider">A Non-Profit Frontier</h3>
                            <p className="text-gray-300 text-lg font-medium leading-relaxed">
                                NextVision is strictly a non-commercial entity. This platform is not designed
                                for financial gain or earning money. Our singular objective is the advancement
                                of free knowledge and the cultivation of expertise in emerging scientific
                                and technological frontiers.
                            </p>
                            <div className="pt-4 flex justify-center gap-8">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Status</span>
                                    <span className="text-space-accent font-bold">Educational</span>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Funding</span>
                                    <span className="text-space-accent font-bold">Independent</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </section>

                {/* Restrictions & Limits */}
                <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="grid lg:grid-cols-3 gap-8 text-white">
                        <div className="lg:col-span-1 py-8">
                            <h3 className="text-2xl font-bold mb-6 tracking-tight">Platform Limits & <br /><span className="text-gray-500">Protocol Restrictions</span></h3>
                            <p className="text-gray-400 font-light leading-relaxed">
                                To maintain the integrity of our research environment, we operate under several
                                critical constraints. Every pioneer must understand these boundaries before engagement.
                            </p>
                        </div>
                        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                            {[
                                {
                                    title: "Sandbox Environment",
                                    desc: "All neural simulations and data processing take place in isolated containers with limited eternal gateway access.",
                                    icon: "🔒"
                                },
                                {
                                    title: "Data Retention",
                                    desc: "Experimental data is stored for research analysis purposes only and is subject to periodic baseline resets.",
                                    icon: "💾"
                                },
                                {
                                    title: "Scale Limits",
                                    desc: "Classroom occupancy is capped at 20 pioneers per mentor to ensure high-fidelity knowledge transfer.",
                                    icon: "📊"
                                },
                                {
                                    title: "Code of Ethics",
                                    desc: "Usage for the development of destructive technology or unauthorized data harvesting is strictly prohibited.",
                                    icon: "⚖️"
                                }
                            ].map((item, i) => (
                                <GlassCard key={i} className="p-6 border-white/5" hover={true}>
                                    <span className="text-2xl mb-4 block">{item.icon}</span>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2">{item.title}</h4>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </SecondaryPageLayout>
    );
};

export default About;
