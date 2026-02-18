import React from 'react';
import SecondaryPageLayout from '../components/SecondaryPageLayout';

const Documentation = () => {
    return (
        <SecondaryPageLayout
            title="Technical Documentation"
            subtitle="The architecture of the NextVision ecosystem and research protocols."
        >
            <section className="space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-4">I. Platform Architecture</h2>
                    <p>
                        NextVision operates as a multidisciplinary research hub, leveraging high-performance <strong>Computational Synthesis</strong> to support future-oriented subjects from a diverse range of domains. Our architecture is designed to accommodate exploratory frontiers across various disciplines, including but not limited to:
                    </p>
                    <ul className="list-disc pl-5 mt-4 space-y-2">
                        <li><strong>Advanced Physics & Energy:</strong> Exploring next-generation power sources and sub-atomic structures.</li>
                        <li><strong>Digital Intelligence & Neural Systems:</strong> Investigating the evolution of cognition and human-machine collaboration.</li>
                        <li><strong>Biomedical & Environmental Tech:</strong> Pioneering sustainable life systems and molecular medicine.</li>
                        <li><strong>Space Discovery & Logistics:</strong> Designing the infrastructure for interstellar expansion.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">II. Research Protocols</h2>
                    <p>
                        All Pioneers must adhere to the <strong>Interface Alpha</strong> guidelines. Research integrity is monitored via blockchain verification of all experimental telemetry.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">III. API & Integration</h2>
                    <p>
                        Our RESTful API endpoints are accessible via secured JWT handshake. For advanced telemetry streaming, WebSocket connections are available under the <code>/api/nebula</code> namespace.
                    </p>
                </div>
            </section>
        </SecondaryPageLayout>
    );
};

export default Documentation;
