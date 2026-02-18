import React from 'react';
import SecondaryPageLayout from '../components/SecondaryPageLayout';

const Privacy = () => {
    return (
        <SecondaryPageLayout
            title="Privacy Protocol"
            subtitle="Protecting your neural data and celestial footprint."
        >
            <section className="space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-4">I. Data Collection</h2>
                    <p>
                        NextVision collects telemetry relevant to your learning progress and research experiments. This includes:
                    </p>
                    <ul className="list-disc pl-5 mt-4 space-y-2">
                        <li><strong>Advanced Telemetry:</strong> Encrypted metadata for laboratory optimization.</li>
                        <li><strong>Experimental Data:</strong> Research duration and interaction patterns.</li>
                        <li><strong>Global Geolocation:</strong> To ensure synchronization with nearest data nodes.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">II. Encrypted Transmission</h2>
                    <p>
                        All data is transmitted via 256-bit <strong>Quantum Encryption</strong>. Your biological data is never stored in raw format and is subject to immediate anonymization upon session termination.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">III. Third-Party Access</h2>
                    <p>
                        We do not share your private chronicle with outside corporations. Information is shared only with certified Mentors for the sole purpose of research advancement.
                    </p>
                </div>
            </section>
        </SecondaryPageLayout>
    );
};

export default Privacy;
