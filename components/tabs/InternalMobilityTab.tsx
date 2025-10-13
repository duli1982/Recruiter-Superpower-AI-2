import React, { useState, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { JobRequisition, JobStatus } from '../../types';
import { MOCK_JOB_REQUISITIONS } from '../../constants';

const ArrowUpCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>;

const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

const ApplyModal: React.FC<{ job: JobRequisition; onClose: () => void; onSubmit: () => void; }> = ({ job, onClose, onSubmit }) => {
    const [interestStatement, setInterestStatement] = useState('');
    const currentUser = "Alex Rivera"; // Hardcoded internal employee

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-white">Apply for {job.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">Your profile will be shared with the hiring manager.</p>
                </div>
                <div className="p-6 space-y-4 border-t border-b border-gray-700">
                    <div>
                        <label className="label">Name</label>
                        <input type="text" value={currentUser} readOnly className="input-field bg-gray-800" />
                    </div>
                    <div>
                        <label className="label">Why are you interested in this role?</label>
                        <textarea
                            value={interestStatement}
                            onChange={(e) => setInterestStatement(e.target.value)}
                            rows={5}
                            className="input-field"
                            placeholder="Share your interest and how your current skills align with this new opportunity..."
                            required
                        />
                    </div>
                </div>
                <div className="p-6 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit Application</Button>
                </div>
            </form>
        </div>
    );
};


export const InternalMobilityTab: React.FC = () => {
    const [requisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [isModalOpen, setIsModalOpen] = useState<JobRequisition | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    const internalJobs = useMemo(() => requisitions.filter(r => r.internalOnly && r.status === JobStatus.Open), [requisitions]);
    
    const handleApplySuccess = () => {
        setIsModalOpen(null);
        setSuccessMessage('Your application has been submitted successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Internal Mobility</h2>
             {successMessage && <div className="mb-4 text-green-400 text-sm p-3 bg-green-900/20 border border-green-800 rounded-md text-center">{successMessage}</div>}
            <Card>
                <CardHeader
                    title="Internal Opportunities"
                    icon={<ArrowUpCircleIcon />}
                    description="Explore roles open exclusively to current employees."
                />
                <div className="mt-4 space-y-4">
                    {internalJobs.length > 0 ? (
                        internalJobs.map(job => (
                            <div key={job.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <h4 className="font-bold text-white">{job.title}</h4>
                                    <p className="text-sm text-indigo-400">{job.department}</p>
                                    <p className="text-xs text-gray-400 mt-2">{job.description}</p>
                                </div>
                                <Button onClick={() => setIsModalOpen(job)} className="flex-shrink-0">Apply Now</Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-10">There are currently no internal-only opportunities available. Please check back later.</p>
                    )}
                </div>
            </Card>
            {isModalOpen && <ApplyModal job={isModalOpen} onClose={() => setIsModalOpen(null)} onSubmit={handleApplySuccess} />}
             <style>{`.label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; margin-bottom: 0.25rem;} .input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; padding: 0.5rem 0.75rem;} .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }`}</style>
        </div>
    );
};
