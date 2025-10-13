import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { generateInterviewPacket } from '../../services/geminiService';
import { Candidate, InterviewStage, JobRequisition, Interview, InterviewStatus, InterviewPacket, InterviewerStatus, Interviewer, InterviewFeedback, OverallRecommendation, ViewMode } from '../../types';
import { MOCK_CANDIDATES, MOCK_JOB_REQUISITIONS, MOCK_SCHEDULED_INTERVIEWS } from '../../constants';

// Icons
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const AlertCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const HelpCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;


const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';
const SCHEDULED_INTERVIEWS_KEY = 'recruiter-ai-interviews';

interface CandidateExperienceTabProps {
  currentView: ViewMode;
  currentUser: string;
}

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

const InterviewStatusBadge: React.FC<{ status: InterviewStatus }> = ({ status }) => {
    const styles: Record<InterviewStatus, string> = {
        [InterviewStatus.Scheduled]: 'bg-blue-500/20 text-blue-300',
        [InterviewStatus.Completed]: 'bg-green-500/20 text-green-300',
        [InterviewStatus.Canceled]: 'bg-gray-600/20 text-gray-300',
        [InterviewStatus.NoShow]: 'bg-red-500/20 text-red-300',
    };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>{status}</span>;
};

const InterviewerStatusBadge: React.FC<{ status: InterviewerStatus }> = ({ status }) => {
    const styles: Record<InterviewerStatus, string> = {
        'Pending': 'bg-yellow-500/20 text-yellow-300',
        'Confirmed': 'bg-green-500/20 text-green-300',
        'Declined': 'bg-red-500/20 text-red-300',
    };
    const icons: Record<InterviewerStatus, React.ReactNode> = {
        'Pending': <HelpCircleIcon className="h-3 w-3" />,
        'Confirmed': <CheckCircleIcon className="h-3 w-3" />,
        'Declined': <XCircleIcon className="h-3 w-3" />,
    };
    return <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>{icons[status]} {status}</span>;
}

const InterviewPacketModal: React.FC<{ packet: InterviewPacket, onClose: () => void }> = ({ packet, onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <CardHeader title="AI-Generated Interview Packet" icon={<FileTextIcon />} />
            <div className="overflow-y-auto pr-2 -mr-4 mt-2 space-y-6">
                <div>
                    <h3 className="font-semibold text-indigo-300 mb-2">Candidate Summary</h3>
                    <p className="text-sm text-gray-300">{packet.candidateSummary}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-indigo-300 mb-2">Role Summary</h3>
                    <p className="text-sm text-gray-300">{packet.roleSummary}</p>
                </div>
                {packet.scorecard && packet.scorecard.competencies.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-indigo-300 mb-2">Interview Scorecard</h3>
                        <div className="space-y-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                            {packet.scorecard.competencies.map(c => (
                                <div key={c.id}>
                                    <p className="font-semibold text-gray-200 text-sm">{c.name}</p>
                                    <p className="text-xs text-gray-400">{c.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold text-indigo-300 mb-2">Suggested Behavioral Questions</h3>
                        <ul className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                            {packet.suggestedQuestions.behavioral.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-indigo-300 mb-2">Suggested Technical Topics</h3>
                        <ul className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                            {packet.suggestedQuestions.technical.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                <Button onClick={onClose}>Close</Button>
            </div>
        </Card>
    </div>
);

const FeedbackModal: React.FC<{
    interview: Interview;
    job: JobRequisition;
    currentUser: string;
    onClose: () => void;
    onSubmit: (interviewId: string, feedback: InterviewFeedback) => void;
}> = ({ interview, job, onClose, onSubmit, currentUser }) => {
    const [feedback, setFeedback] = useState<Omit<InterviewFeedback, 'interviewerName' | 'submissionDate'>>({
        overallRecommendation: 'Hire',
        summary: '',
        ratings: job.scorecard?.competencies.map(c => ({ competencyId: c.id, rating: 0, notes: '' })) || [],
    });

    const handleRatingChange = (competencyId: string, rating: number) => {
        setFeedback(prev => ({
            ...prev,
            ratings: prev.ratings.map(r => r.competencyId === competencyId ? { ...r, rating } : r),
        }));
    };

    const handleNotesChange = (competencyId: string, notes: string) => {
        setFeedback(prev => ({
            ...prev,
            ratings: prev.ratings.map(r => r.competencyId === competencyId ? { ...r, notes } : r),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalFeedback: InterviewFeedback = {
            ...feedback,
            interviewerName: currentUser,
            submissionDate: new Date().toISOString(),
        };
        onSubmit(interview.id, finalFeedback);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">Submit Feedback</h3>
                    <p className="text-sm text-gray-400">For {job.title}</p>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    {job.scorecard?.competencies.map((comp, index) => (
                        <div key={comp.id} className="p-3 bg-gray-800 rounded-md">
                            <p className="font-semibold text-gray-200">{comp.name}</p>
                            <p className="text-xs text-gray-400 mb-2">{comp.description}</p>
                            <div className="flex items-center gap-2 mb-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button type="button" key={star} onClick={() => handleRatingChange(comp.id, star)}>
                                        <StarIcon className={`h-6 w-6 transition-colors ${(feedback.ratings[index]?.rating || 0) >= star ? 'text-yellow-400 fill-current' : 'text-gray-600 hover:text-gray-400'}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea value={feedback.ratings[index]?.notes || ''} onChange={e => handleNotesChange(comp.id, e.target.value)} placeholder="Notes for this competency..." rows={2} className="input-field-sm"></textarea>
                        </div>
                    ))}
                    <div>
                        <label className="label">Overall Summary</label>
                        <textarea value={feedback.summary} onChange={e => setFeedback(p => ({...p, summary: e.target.value}))} rows={3} className="input-field" required></textarea>
                    </div>
                    <div>
                        <label className="label">Recommendation</label>
                        <select value={feedback.overallRecommendation} onChange={e => setFeedback(p => ({...p, overallRecommendation: e.target.value as OverallRecommendation}))} className="input-field">
                            <option>Strong Hire</option><option>Hire</option><option>No Hire</option><option>Strong No Hire</option>
                        </select>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit Feedback</Button>
                </div>
            </form>
        </div>
    );
};


export const CandidateExperienceTab: React.FC<CandidateExperienceTabProps> = ({ currentView, currentUser }) => {
    const [candidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [requisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [interviews, setInterviews] = useState<Interview[]>(() => getInitialData(SCHEDULED_INTERVIEWS_KEY, MOCK_SCHEDULED_INTERVIEWS));
    
    const [isCalendarConnected, setIsCalendarConnected] = useState(true);
    const [selectedPacket, setSelectedPacket] = useState<InterviewPacket | null>(null);
    const [isGeneratingPacket, setIsGeneratingPacket] = useState<string | null>(null); // Store interview ID
    const [feedbackModalOpen, setFeedbackModalOpen] = useState<Interview | null>(null);
    
    useEffect(() => {
        localStorage.setItem(SCHEDULED_INTERVIEWS_KEY, JSON.stringify(interviews));
    }, [interviews]);
    
    const upcomingInterviews = useMemo(() => interviews.filter(i => {
        const isUpcoming = new Date(i.startTime) >= new Date();
        if (currentView === 'hiringManager') {
            return isUpcoming && i.interviewers.some(interviewer => interviewer.name === currentUser);
        }
        return isUpcoming;
    }).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()), [interviews, currentView, currentUser]);

    const pastInterviews = useMemo(() => interviews.filter(i => {
        const isPast = new Date(i.startTime) < new Date();
        if (currentView === 'hiringManager') {
            return isPast && i.interviewers.some(interviewer => interviewer.name === currentUser);
        }
        return isPast;
    }).sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()), [interviews, currentView, currentUser]);
    
    const interviewsNeedingFeedback = useMemo(() => pastInterviews.filter(i => i.status === InterviewStatus.Completed && !i.feedbackSubmitted), [pastInterviews]);

    const handleGeneratePacket = async (interviewId: string) => {
        const interview = interviews.find(i => i.id === interviewId);
        if (!interview) return;
        const candidate = candidates.find(c => c.id === interview.candidateId);
        const requisition = requisitions.find(r => r.id === interview.jobId);
        if (!candidate || !requisition) {
            alert("Candidate or Job Requisition not found for this interview.");
            return;
        }

        setIsGeneratingPacket(interviewId);
        try {
            const packet = await generateInterviewPacket(candidate, requisition);
            setSelectedPacket(packet);
        } catch (error) {
            console.error(error);
            alert("Failed to generate interview packet.");
        } finally {
            setIsGeneratingPacket(null);
        }
    };

    const handleFeedbackSubmit = (interviewId: string, feedback: InterviewFeedback) => {
        setInterviews(prev => prev.map(i => {
            if (i.id === interviewId) {
                return {
                    ...i,
                    feedback: [...(i.feedback || []), feedback],
                    feedbackSubmitted: true,
                };
            }
            return i;
        }));
        setFeedbackModalOpen(null);
    };

    const InterviewCard: React.FC<{ interview: Interview, isPast?: boolean }> = ({ interview, isPast = false }) => {
        const candidate = candidates.find(c => c.id === interview.candidateId);
        const job = requisitions.find(j => j.id === interview.jobId);
        if (!candidate || !job) return null;

        const handleStatusUpdate = (id: string, status: InterviewStatus) => {
            if (currentView === 'hiringManager') return;
            setInterviews(prev => prev.map(i => i.id === id ? { ...i, status } : i));
        };
        
        const feedbackMissing = isPast && interview.status === InterviewStatus.Completed && !interview.feedbackSubmitted;
        const hasPendingInterviewers = interview.interviewers.some(i => i.status === 'Pending');

        return (
            <Card className={`bg-gray-800/50 ${feedbackMissing ? 'border-yellow-500/50' : ''}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-white">{candidate.name}</h4>
                        <p className="text-sm text-indigo-300">{job.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{interview.stage}</p>
                    </div>
                    <InterviewStatusBadge status={interview.status} />
                </div>
                 <div className="mt-4 text-sm text-gray-300 space-y-2">
                    <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-gray-500" /><span>{new Date(interview.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
                </div>

                {!isPast && (
                    <div className="mt-3">
                        <h5 className="text-xs font-semibold text-gray-400 mb-2">Interview Loop Status</h5>
                        <div className="space-y-2">
                            {interview.interviewers.map(interviewer => (
                                <div key={interviewer.name} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-300">{interviewer.name}</span>
                                    <InterviewerStatusBadge status={interviewer.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {currentView === 'recruiter' && (
                    <div className="mt-4 pt-3 border-t border-gray-700 flex flex-wrap gap-2 justify-end">
                        {isPast ? (
                            <>
                               <Button variant="secondary" className="!text-xs !py-1 !px-2" onClick={() => handleStatusUpdate(interview.id, InterviewStatus.Completed)}>Mark Completed</Button>
                               <Button variant="secondary" className="!text-xs !py-1 !px-2" onClick={() => handleStatusUpdate(interview.id, InterviewStatus.NoShow)}>Mark No-Show</Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="secondary"
                                    className="!text-xs !py-1 !px-2"
                                    onClick={() => handleGeneratePacket(interview.id)}
                                    isLoading={isGeneratingPacket === interview.id}
                                >
                                    Generate Packet
                                </Button>
                                <Button variant="secondary" className="!text-xs !py-1 !px-2" disabled={hasPendingInterviewers} title={hasPendingInterviewers ? "Confirm all interviewers first" : ""}>
                                    Send Invites
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </Card>
        );
    };

    const FeedbackAccountabilityCard: React.FC = () => (
        <Card className="border-yellow-500/30">
            <CardHeader 
                title={`Feedback Accountability (${interviewsNeedingFeedback.length})`} 
                icon={<AlertCircleIcon className="text-yellow-400" />}
                description="Interviews completed but awaiting feedback."
            />
            <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                {interviewsNeedingFeedback.length > 0 ? interviewsNeedingFeedback.map(interview => {
                    const candidate = candidates.find(c => c.id === interview.candidateId);
                    const job = requisitions.find(j => j.id === interview.jobId);
                    return (
                        <div key={interview.id} className="p-3 bg-gray-800 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-sm text-white">{candidate?.name}</p>
                                <p className="text-xs text-gray-400">{job?.title}</p>
                            </div>
                            <Button variant="secondary" className="!text-xs !py-1 !px-2" onClick={() => setFeedbackModalOpen(interview)}>Submit Feedback</Button>
                        </div>
                    );
                }) : <p className="text-sm text-gray-500 text-center py-4">All feedback is up to date!</p>}
            </div>
        </Card>
    );

    const feedbackJob = useMemo(() => {
        if (!feedbackModalOpen) return null;
        return requisitions.find(r => r.id === feedbackModalOpen.jobId);
    }, [feedbackModalOpen, requisitions]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Scheduling & Coordination</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {currentView === 'recruiter' && (
                    <div className="lg:col-span-1 space-y-6">
                        <FeedbackAccountabilityCard />
                        <Card>
                            <CardHeader title="Calendar Sync" icon={<CalendarIcon />} />
                            <div className="mt-4">
                                {isCalendarConnected ? (
                                     <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                            <p className="font-medium text-sm text-white">Google Calendar Connected</p>
                                        </div>
                                        <button onClick={() => setIsCalendarConnected(false)} className="text-xs text-gray-400 hover:text-white">Disconnect</button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-400">Connect your calendar to automatically check availability and schedule interviews.</p>
                                        <div className="flex gap-2">
                                            <Button className="w-full" onClick={() => setIsCalendarConnected(true)}>Connect Google Calendar</Button>
                                            <Button variant="secondary" className="w-full">Connect Outlook</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
                
                <div className={currentView === 'recruiter' ? 'lg:col-span-2 space-y-6' : 'lg:col-span-3 space-y-6'}>
                    <Card className="max-h-[80vh] flex flex-col">
                        <CardHeader title="Upcoming Interviews" icon={<ClockIcon />} />
                        <div className="mt-2 space-y-4 overflow-y-auto">
                            {upcomingInterviews.length > 0 ? (
                                upcomingInterviews.map(interview => <InterviewCard key={interview.id} interview={interview} />)
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-8">No upcoming interviews scheduled.</p>
                            )}
                        </div>
                    </Card>
                     <Card className="max-h-[80vh] flex flex-col">
                        <CardHeader title="Past Interviews" />
                        <div className="mt-2 space-y-4 overflow-y-auto">
                           {pastInterviews.length > 0 ? (
                                pastInterviews.map(interview => <InterviewCard key={interview.id} interview={interview} isPast />)
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-8">No past interviews.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {selectedPacket && <InterviewPacketModal packet={selectedPacket} onClose={() => setSelectedPacket(null)} />}
            {feedbackModalOpen && feedbackJob && (
                <FeedbackModal 
                    interview={feedbackModalOpen}
                    job={feedbackJob}
                    currentUser={currentUser}
                    onClose={() => setFeedbackModalOpen(null)}
                    onSubmit={handleFeedbackSubmit}
                />
            )}

            <style>{`
                .label { display: block; text-transform: uppercase; font-size: 0.75rem; font-weight: 500; color: #9ca3af; margin-bottom: 0.25rem;}
                .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; }
                .input-field { padding: 0.5rem 0.75rem; }
                .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; }
                .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }
                /* Custom scrollbar for content areas */
                .overflow-y-auto::-webkit-scrollbar { width: 6px; }
                .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
                .overflow-y-auto::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>
        </div>
    );
};