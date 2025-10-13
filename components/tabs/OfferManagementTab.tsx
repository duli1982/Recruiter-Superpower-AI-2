import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Offer, OfferStatus, ApprovalStatus, Candidate, JobRequisition, OfferApprovalStep, NegotiationHistoryItem } from '../../types';
import { MOCK_OFFERS, MOCK_CANDIDATES, MOCK_JOB_REQUISITIONS } from '../../constants';
import { generateOfferLetter, getNegotiationAdvice } from '../../services/geminiService';

// Icons
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05A6.5 6.5 0 0 1 8.94 9.9M9 9h.01M4.93 4.93l.01.01M2 12h.01M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v.01M19.07 4.93l-.01.01M22 12h-.01M19.07 19.07l-.01-.01M12 22v-.01" /></svg>;
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const FireIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;


const OFFERS_STORAGE_KEY = 'recruiter-ai-offers';
const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

const OfferStatusBadge: React.FC<{ status: OfferStatus }> = ({ status }) => {
    const styles: Record<OfferStatus, string> = {
        [OfferStatus.Accepted]: 'bg-green-500/20 text-green-300',
        [OfferStatus.Negotiating]: 'bg-yellow-500/20 text-yellow-300',
        [OfferStatus.Sent]: 'bg-blue-500/20 text-blue-300',
        [OfferStatus.PendingApproval]: 'bg-purple-500/20 text-purple-300 animate-pulse',
        [OfferStatus.Declined]: 'bg-red-500/20 text-red-300',
        [OfferStatus.Expired]: 'bg-gray-600/20 text-gray-300',
        [OfferStatus.Draft]: 'bg-gray-700 text-gray-400',
    };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>{status}</span>;
};

const ApprovalStepDisplay: React.FC<{ step: OfferApprovalStep }> = ({ step }) => {
    const icons: Record<ApprovalStatus, React.ReactNode> = {
        'Approved': <CheckCircleIcon className="h-5 w-5 text-green-400" />,
        'Pending': <ClockIcon className="h-5 w-5 text-yellow-400" />,
        'Rejected': <XCircleIcon className="h-5 w-5 text-red-400" />,
    };
    return (
        <div className="flex items-start gap-4 relative last:pb-0 pb-6">
            <div className="absolute left-[9px] top-5 h-full w-px bg-gray-600"></div>
            <div className="z-10 bg-gray-900">{icons[step.status]}</div>
            <div>
                <p className="font-semibold text-gray-200">{step.role}</p>
                <p className="text-sm text-gray-400">{step.approver}</p>
                {step.notes && <p className="text-xs text-yellow-400 italic mt-1">Note: {step.notes}</p>}
            </div>
        </div>
    );
};

export const OfferManagementTab: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>(() => getInitialData(OFFERS_STORAGE_KEY, MOCK_OFFERS));
    const [candidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [requisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(offers[1]?.id || null);
    const [filter, setFilter] = useState<OfferStatus | 'All'>('All');

    const [negotiationAdvice, setNegotiationAdvice] = useState<string[]>([]);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [offerLetter, setOfferLetter] = useState('');
    const [isLoadingLetter, setIsLoadingLetter] = useState(false);

    useEffect(() => {
        localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
    }, [offers]);

    const filteredOffers = useMemo(() => {
        return offers.filter(o => filter === 'All' || o.status === filter)
                     .sort((a,b) => new Date(b.negotiationHistory[0]?.date).getTime() - new Date(a.negotiationHistory[0]?.date).getTime());
    }, [offers, filter]);

    const selectedOffer = useMemo(() => offers.find(o => o.id === selectedOfferId), [offers, selectedOfferId]);
    const selectedCandidate = useMemo(() => candidates.find(c => c.id === selectedOffer?.candidateId), [candidates, selectedOffer]);
    const selectedJob = useMemo(() => requisitions.find(j => j.id === selectedOffer?.jobId), [requisitions, selectedOffer]);

    const handleGetAdvice = async () => {
        if (!selectedOffer || !selectedJob || !selectedCandidate) return;
        setIsLoadingAdvice(true);
        setNegotiationAdvice([]);
        try {
            const advice = await getNegotiationAdvice(selectedOffer, selectedJob, selectedCandidate);
            setNegotiationAdvice(advice);
        } catch (error) {
            console.error(error);
            alert("Failed to get negotiation advice.");
        } finally {
            setIsLoadingAdvice(false);
        }
    };
    
    const handleGenerateAndShowLetter = async () => {
        if (!selectedOffer || !selectedJob || !selectedCandidate) return;
        setIsSendModalOpen(true);
        setIsLoadingLetter(true);
        setOfferLetter('');
        try {
            const letter = await generateOfferLetter(selectedCandidate.name, selectedJob.title, selectedOffer, selectedJob.hiringManager);
            setOfferLetter(letter);
        } catch(error) {
            alert("Failed to generate offer letter.");
            setOfferLetter("Error generating letter. Please try again.");
        } finally {
            setIsLoadingLetter(false);
        }
    };

    const handleSendOffer = () => {
        if (!selectedOfferId) return;
        setOffers(prev => prev.map(o => o.id === selectedOfferId ? { ...o, status: OfferStatus.Sent } : o));
        setIsSendModalOpen(false);
    };

    const allApprovalsComplete = useMemo(() => {
        return selectedOffer?.approvalChain.every(step => step.status === ApprovalStatus.Approved) || false;
    }, [selectedOffer]);
    
    const canSendOffer = selectedOffer?.status === OfferStatus.PendingApproval && allApprovalsComplete;

    const SendOfferModal = () => (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsSendModalOpen(false)}>
            <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <CardHeader title="Generate & Send Offer" icon={<FileTextIcon />} />
                <div className="overflow-y-auto pr-2 -mr-4 mt-2 flex-grow">
                    {isLoadingLetter ? <Spinner text="Generating formal offer letter..."/> : (
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans bg-gray-800 p-4 rounded-md border border-gray-700">
                            {offerLetter}
                        </pre>
                    )}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setIsSendModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendOffer} disabled={isLoadingLetter} icon={<SendIcon className="h-4 w-4"/>}>
                        Send via E-Sign
                    </Button>
                </div>
            </Card>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Offer Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-11rem)]">
                {/* Offer List */}
                <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader title="All Offers" />
                    <select value={filter} onChange={e => setFilter(e.target.value as any)} className="input-field mb-4">
                        <option value="All">All Statuses</option>
                        {Object.values(OfferStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="overflow-y-auto space-y-2 flex-grow -mr-4 pr-3">
                        {filteredOffers.map(offer => {
                            const candidate = candidates.find(c => c.id === offer.candidateId);
                            const job = requisitions.find(j => j.id === offer.jobId);
                            return (
                                <div key={offer.id} onClick={() => setSelectedOfferId(offer.id)} className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedOfferId === offer.id ? 'bg-indigo-600/30 border-indigo-500' : 'bg-gray-800 hover:bg-gray-700/50 border-gray-700'}`}>
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-white truncate pr-2">{candidate?.name || 'Unknown Candidate'}</p>
                                        <OfferStatusBadge status={offer.status} />
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{job?.title || 'Unknown Job'}</p>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Offer Details */}
                <Card className="lg:col-span-2 flex flex-col">
                    {selectedOffer && selectedCandidate && selectedJob ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3>
                                    <p className="text-sm text-indigo-400">{selectedJob.title}</p>
                                </div>
                                <OfferStatusBadge status={selectedOffer.status} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto flex-grow -mr-4 pr-3">
                                {/* Left Column: Negotiation & Actions */}
                                <div className="md:col-span-2 space-y-6">
                                    {canSendOffer && (
                                        <Card className="bg-green-900/30 border-green-500/50">
                                            <div className="flex items-center gap-4">
                                                <CheckCircleIcon className="h-8 w-8 text-green-400 flex-shrink-0"/>
                                                <div>
                                                    <h4 className="font-semibold text-white">Offer Approved</h4>
                                                    <p className="text-sm text-green-200">This offer has received all necessary approvals and is ready to be sent to the candidate.</p>
                                                </div>
                                            </div>
                                            <Button onClick={handleGenerateAndShowLetter} className="w-full mt-4">Generate & Send Offer</Button>
                                        </Card>
                                    )}
                                    {selectedOffer.competitiveIntel && selectedOffer.competitiveIntel.length > 0 && (
                                        <Card className="border-red-500/50 bg-red-900/20">
                                            <CardHeader title="Urgency Indicator" icon={<FireIcon className="text-red-400"/>} />
                                            <ul className="list-disc list-inside mt-2 space-y-1 text-red-200 text-sm">
                                                {selectedOffer.competitiveIntel.map((intel, i) => <li key={i}>{intel}</li>)}
                                            </ul>
                                        </Card>
                                    )}
                                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                        <h4 className="font-semibold text-gray-200 mb-2">Negotiation History</h4>
                                        <div className="space-y-3">
                                            {selectedOffer.negotiationHistory.map((item, index) => (
                                                <div key={index} className={`p-2 rounded-md ${item.author === 'Company' ? 'bg-gray-900' : 'bg-indigo-900/50'}`}>
                                                    <p className="font-bold text-sm text-white">{item.author}'s Offer - ${item.compensation.baseSalary.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</p>
                                                    {item.notes && <p className="text-xs italic text-yellow-300 mt-1">Note: {item.notes}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                     <Card className="bg-gray-950 border-indigo-700/50">
                                        <CardHeader title="AI Closing Playbook" icon={<LightbulbIcon />} />
                                        <Button onClick={handleGetAdvice} isLoading={isLoadingAdvice} className="w-full">Generate Closing Tactics</Button>
                                        {negotiationAdvice.length > 0 && (
                                            <ul className="mt-4 space-y-2 list-disc list-inside text-sm text-indigo-200">
                                                {negotiationAdvice.map((advice, i) => <li key={i}>{advice}</li>)}
                                            </ul>
                                        )}
                                    </Card>
                                </div>
                                {/* Right Column: Approvals */}
                                <div>
                                    <h4 className="font-semibold text-gray-200 mb-2">Approval Workflow</h4>
                                    <div>{selectedOffer.approvalChain.map((step, i) => <ApprovalStepDisplay key={i} step={step} />)}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                            <p>Select an offer from the list to view details.</p>
                        </div>
                    )}
                </Card>
            </div>
             {isSendModalOpen && <SendOfferModal />}
             <style>{`
                .input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; padding: 0.5rem 0.75rem; }
                .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }
                .overflow-y-auto::-webkit-scrollbar { width: 6px; }
                .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
                .overflow-y-auto::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>
        </div>
    );
};