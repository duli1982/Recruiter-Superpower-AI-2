import React, { useState, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { JobRequisition, Referral, ReferralStatus, PipelineStage } from '../../types';
import { MOCK_REFERRALS, MOCK_JOB_REQUISITIONS, PIPELINE_STAGES } from '../../constants';

const Share2Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>;

const REFERRALS_STORAGE_KEY = 'recruiter-ai-referrals';
const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

const ReferralStatusTracker: React.FC<{ status: ReferralStatus }> = ({ status }) => {
    const isStandardStage = PIPELINE_STAGES.includes(status as PipelineStage);
    const stages = ['In Review', ...PIPELINE_STAGES];
    const currentIndex = isStandardStage ? stages.indexOf(status) + 1 : (status === 'In Review' ? 0 : -1);

    return (
        <div className="flex items-center space-x-2">
            {stages.map((stage, index) => (
                <React.Fragment key={stage}>
                    <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${index <= currentIndex ? 'bg-green-500' : 'bg-gray-600'} ${status === 'Rejected' ? 'bg-red-500' : ''}`}></div>
                    </div>
                    {index < stages.length - 1 && <div className={`flex-grow h-1 rounded-full ${index < currentIndex ? 'bg-green-500' : 'bg-gray-600'} ${status === 'Rejected' ? 'bg-red-500' : ''}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};


export const EmployeeReferralsTab: React.FC = () => {
    const [referrals, setReferrals] = useState<Referral[]>(() => getInitialData(REFERRALS_STORAGE_KEY, MOCK_REFERRALS));
    const [requisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [formData, setFormData] = useState({
        candidateName: '',
        candidateEmail: '',
        jobId: requisitions.find(r => !r.internalOnly)?.id || 0,
        resume: null as File | null,
    });
    const [successMessage, setSuccessMessage] = useState('');
    const currentUser = "Taylor Kim"; // Hardcoded for demo

    const openRequisitions = useMemo(() => requisitions.filter(r => !r.internalOnly), [requisitions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newReferral: Referral = {
            id: `ref-${Date.now()}`,
            referrerName: currentUser,
            candidateName: formData.candidateName,
            candidateEmail: formData.candidateEmail,
            jobId: Number(formData.jobId),
            submittedDate: new Date().toISOString(),
            status: 'In Review',
            bonusAmount: 5000, // Mock bonus
            bonusStatus: 'Eligible on Hire',
        };
        const updatedReferrals = [newReferral, ...referrals];
        setReferrals(updatedReferrals);
        localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(updatedReferrals));
        setFormData({ candidateName: '', candidateEmail: '', jobId: openRequisitions[0]?.id || 0, resume: null });
        setSuccessMessage('Referral submitted successfully! Thank you.');
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Employee Referrals</h2>
            {successMessage && <div className="mb-4 text-green-400 text-sm p-3 bg-green-900/20 border border-green-800 rounded-md text-center">{successMessage}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader title="Submit a Referral" icon={<UserPlusIcon />} description="Know someone great? Refer them for a role and earn a bonus!" />
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="candidateName" className="label">Candidate's Name</label>
                                <input type="text" name="candidateName" value={formData.candidateName} onChange={handleFormChange} className="input-field" required />
                            </div>
                             <div>
                                <label htmlFor="candidateEmail" className="label">Candidate's Email</label>
                                <input type="email" name="candidateEmail" value={formData.candidateEmail} onChange={handleFormChange} className="input-field" required />
                            </div>
                             <div>
                                <label htmlFor="jobId" className="label">Referred For</label>
                                <select name="jobId" value={formData.jobId} onChange={handleFormChange} className="input-field">
                                    {openRequisitions.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="resume" className="label">Resume (Optional)</label>
                                <input type="file" name="resume" className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/40" />
                            </div>
                            <Button type="submit" className="w-full">Submit Referral</Button>
                        </form>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader title="Your Referral History" />
                        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            {referrals.filter(r => r.referrerName === currentUser).map(referral => {
                                const job = requisitions.find(j => j.id === referral.jobId);
                                return (
                                    <div key={referral.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-white">{referral.candidateName}</h4>
                                                <p className="text-sm text-gray-400">Referred for: {job?.title || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">Submitted: {new Date(referral.submittedDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-green-400">${referral.bonusAmount.toLocaleString()}</p>
                                                <p className="text-xs text-gray-400">{referral.bonusStatus}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-700">
                                             <div className="flex justify-between items-center text-xs mb-1">
                                                <span className="font-semibold text-gray-300">Status: {referral.status}</span>
                                             </div>
                                            <ReferralStatusTracker status={referral.status} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>
            <style>{`.label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; margin-bottom: 0.25rem;} .input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; padding: 0.5rem 0.75rem;} .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }`}</style>
        </div>
    );
};
