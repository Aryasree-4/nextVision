import React from 'react';
import SecondaryPageLayout from '../components/SecondaryPageLayout';

const Terms = () => {
    return (
        <SecondaryPageLayout
            title="Code of Conduct"
            subtitle="The legal framework for the next generation of pioneers."
        >
            <section className="space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-4">I. User Eligibility</h2>
                    <p>
                        Access to the NextVision Laboratories is restricted to certified Pioneers and authorized Mentors. Unauthorized entry into restricted data sectors is strictly prohibited.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">II. Intellectual Property</h2>
                    <p>
                        All discoveries made within the Virtual Research Interface are the joint property of the Pioneer and NextVision Research Laboratory, unless otherwise specified in specialized mission contracts.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">III. Liability</h2>
                    <p>
                        NextVision is not responsible for any neural fatigue or temporal displacement resulting from extended sessions in high-fidelity simulation environments.
                    </p>
                </div>
            </section>
        </SecondaryPageLayout>
    );
};

export default Terms;
