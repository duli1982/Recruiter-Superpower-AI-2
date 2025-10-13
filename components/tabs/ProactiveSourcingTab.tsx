import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
// FIX: Correct import path for geminiService
import { generateOutreachEmail, scoutForTalent } from '../../services/geminiService';
// FIX: Added CandidateStatus to imports to be used when creating a new candidate.
// FIX: Correct import path for types
import { ScoutedCandidate, Candidate, CandidateStatus, CandidateCRM } from '../../types';

// Icons
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>;
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05A6.5 6.5 0 0 1 8.94 9.9M9 9h.01M4.93 4.93l.01.01M2 12h.01M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v.01M19.07 4.93l-.01.01M22 12h-.01M19.07 19.07l-.01-.01M12 22v-.01" /></svg>;
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;


const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
// FIX: Create a blank CRM object to satisfy Candidate type requirements
const BLANK_CRM: CandidateCRM = { relationshipStatus: 'Cold', relationshipScore: 10, touchpointHistory: [], nurtureSettings: { autoNurture: false, cadence: 'Monthly', contentType: 'New Roles' }, communitySettings: { newsletter: false, eventInvites: false }};

const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 85) return 'text-yellow-400';
    return 'text-orange-400';
};

const EmailComposerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    recipients: ScoutedCandidate[];
    initialEmail: { subject: string; body: string; };
}> = ({ isOpen, onClose, recipients, initialEmail }) => {
    const [subject, setSubject] = useState(initialEmail.subject);
    const [body, setBody] = useState(initialEmail.body);

    useEffect(() => {
        setSubject(initialEmail.subject);
        setBody(initialEmail.body);
    }, [initialEmail]);

    if (!isOpen) return null;

    const handleSend = () => {
        const bccEmails = recipients
            .map(r => `${r.name.toLowerCase().replace(/\s+/g, '.')}@example.com`) // mock email
            .join(',');
        
        const mailtoLink = `mailto:?bcc=${encodeURIComponent(bccEmails)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">Compose Outreach Email</h3>
                    <p className="text-sm text-gray-400">
                        Sending to {recipients.length} candidate(s): {recipients.map(r => r.name).slice(0, 3).join(', ')}{recipients.length > 3 ? '...' : ''}
                    </p>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    <div>
                        <label htmlFor="subject" className="label">Subject</label>
                        <input id="subject" type="text" value={subject} onChange={e => setSubject(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label htmlFor="body" className="label">Body</label>
                        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-800 rounded-md">
                            <strong>Note:</strong> This is a bulk email. Greetings (e.g., "Hi [Name],") should be added in your email client if it supports mail merge.
                        </div>
                        <textarea id="body" value={body} onChange={e => setBody(e.target.value)} className="input-field min-h-[250px] resize-y"></textarea>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSend} icon={<SendIcon className="h-4 w-4" />}>Send via Email Client</Button>
                </div>
            </div>
             <style>{`.label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; margin-bottom: 0.25rem;}`}</style>
        </div>
    );
};

export const ProactiveSourcingTab: React.FC = () => {
    const [formData, setFormData] = useState({
        jobTitle: 'Senior Backend Engineer',
        skills: 'Go, Kubernetes, AWS, PostgreSQL',
        location: 'Remote',
        experience: 'Senior (5-8 years)',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [scoutedCandidates, setScoutedCandidates] = useState<ScoutedCandidate[]>([]);
    const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());
    const [showSuccessMessage, setShowSuccessMessage] = useState('');

    // State for multi-select and email composition
    const [multiSelectIds, setMultiSelectIds] = useState<Set<string>>(new Set());
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailContent, setEmailContent] = useState<{ subject: string; body: string; }>({ subject: '', body: '' });
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const [emailError, setEmailError] = useState('');


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleScout = async () => {
        setIsLoading(true);
        setError('');
        setScoutedCandidates([]);
        setShowSuccessMessage('');
        setMultiSelectIds(new Set()); // Clear selection on new search
        try {
            const results = await scoutForTalent(formData.jobTitle, formData.skills, formData.location, formData.experience);
            setScoutedCandidates(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveCandidate = (scoutedCandidate: ScoutedCandidate) => {
        // FIX: Added all required properties to satisfy the Candidate type.
        const newCandidate: Omit<Candidate, 'id'> = {
            name: scoutedCandidate.name,
            email: `${scoutedCandidate.name.toLowerCase().replace(' ', '.')}@example.com`, // mock email
            phone: '123-456-7890', // mock phone
            skills: formData.skills,
            resumeSummary: `${scoutedCandidate.currentRole} at ${scoutedCandidate.currentCompany}. Identified by AI as a potential fit for the ${formData.jobTitle} role. Intent signal: ${scoutedCandidate.intentSignal}`,
            status: CandidateStatus.Passive,
            experience: 5, // mock experience
            location: formData.location,
            source: 'AI Talent Scout',
            crm: BLANK_CRM,
            applicationHistory: [],
        };

        try {
            const stored = localStorage.getItem(CANDIDATES_STORAGE_KEY);
            const currentCandidates: Candidate[] = stored ? JSON.parse(stored) : [];
            const newId = currentCandidates.length > 0 ? Math.max(...currentCandidates.map(c => c.id)) + 1 : 1;
            const updatedCandidates = [...currentCandidates, { id: newId, ...newCandidate }];
            localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(updatedCandidates));
            
            setSavedCandidates(prev => new Set(prev).add(scoutedCandidate.id));
            setShowSuccessMessage(`Successfully saved ${scoutedCandidate.name}! View them in the "Candidate Profiles" tab.`);
            setTimeout(() => setShowSuccessMessage(''), 5000);
        } catch (error) {
            setError('Failed to save candidate to local storage.');
            console.error(error);
        }
    };
    
    const handleDismissCandidate = (id: string) => {
        setScoutedCandidates(prev => prev.filter(c => c.id !== id));
    };

    const handleMultiSelectToggle = (candidateId: string) => {
        setMultiSelectIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(candidateId)) {
                newSet.delete(candidateId);
            } else {
                newSet.add(candidateId);
            }
            return newSet;
        });
    };
    
    const handleComposeEmail = async () => {
        if (multiSelectIds.size === 0) return;
        
        setIsGeneratingEmail(true);
        setEmailError('');
        try {
            const emailData = await generateOutreachEmail(formData.jobTitle, formData.skills, multiSelectIds.size);
            setEmailContent(emailData);
            setIsEmailModalOpen(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setEmailError(errorMessage);
            alert(`Error generating email: ${errorMessage}`);
        } finally {
            setIsGeneratingEmail(false);
        }
    };
    
    const selectedForEmail = useMemo(() => {
        return scoutedCandidates.filter(c => multiSelectIds.has(c.id));
    }, [multiSelectIds, scoutedCandidates]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Proactive Sourcing</h2>
            <Card>
                <CardHeader title="AI Talent Scout" description="Define your ideal candidate persona and let our AI scout for passive talent." icon={<SearchIcon />}/>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300">Job Title / Role</label>
                        <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} className="mt-1 input-field" />
                    </div>
                     <div>
                        <label htmlFor="skills" className="block text-sm font-medium text-gray-300">Key Skills</label>
                        <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} className="mt-1 input-field" />
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-300">Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="mt-1 input-field" />
                    </div>
                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-300">Experience Level</label>
                        <select name="experience" value={formData.experience} onChange={handleInputChange} className="mt-1 input-field">
                            <option>Junior (1-3 years)</option>
                            <option>Mid-level (3-5 years)</option>
                            <option>Senior (5-8 years)</option>
                            <option>Lead/Principal (8+ years)</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6">
                    <Button onClick={handleScout} isLoading={isLoading} className="w-full md:w-auto" disabled={!formData.jobTitle || !formData.skills}>
                        Scout for Talent
                    </Button>
                </div>
            </Card>

            <div className="mt-8">
                {isLoading && <Spinner text="Scouting for hidden gems..." />}
                {error && <p className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-800 rounded-md text-center">{error}</p>}
                 {showSuccessMessage && <p className="mb-4 text-green-400 text-sm p-3 bg-green-900/20 border border-green-800 rounded-md text-center">{showSuccessMessage}</p>}
                
                {scoutedCandidates.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Scouted Candidates ({scoutedCandidates.length})</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {scoutedCandidates.map(candidate => (
                                <Card key={candidate.id} className="flex flex-col relative">
                                     <div className="absolute top-3 right-3 z-10">
                                         <input
                                            type="checkbox"
                                            checked={multiSelectIds.has(candidate.id)}
                                            onChange={() => handleMultiSelectToggle(candidate.id)}
                                            className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
                                         />
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{candidate.name}</h4>
                                            <p className="text-sm text-gray-400">{candidate.currentRole} at {candidate.currentCompany}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className={`text-2xl font-bold ${getScoreColor(candidate.matchScore)}`}>{candidate.matchScore}%</p>
                                            <p className="text-xs text-gray-400">Match</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-gray-300 space-y-3 flex-grow">
                                        <p>
                                            <strong className="text-indigo-400 flex items-center gap-2"><LightbulbIcon className="h-4 w-4"/>Intent Signal:</strong> 
                                            <span className="block mt-1 pl-1 border-l-2 border-indigo-800">{candidate.intentSignal}</span>
                                        </p>
                                        <p>
                                            <strong className="text-indigo-400">Engagement Suggestion:</strong> 
                                            <span className="block mt-1 text-gray-400 italic">"{candidate.engagementSuggestion}"</span>
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end gap-2">
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => handleDismissCandidate(candidate.id)} 
                                            icon={<XCircleIcon className="h-4 w-4"/>}
                                        >
                                            Dismiss
                                        </Button>
                                        <Button 
                                            onClick={() => handleSaveCandidate(candidate)} 
                                            disabled={savedCandidates.has(candidate.id)}
                                            icon={<UserPlusIcon className="h-4 w-4"/>}
                                        >
                                            {savedCandidates.has(candidate.id) ? 'Saved' : 'Save Profile'}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {multiSelectIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-20 animate-fade-in-up">
                    <div className="bg-gray-950 border border-indigo-500/50 rounded-lg shadow-2xl p-4 flex items-center justify-between mx-4">
                        <span className="font-semibold text-white">{multiSelectIds.size} selected</span>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleComposeEmail} isLoading={isGeneratingEmail}>
                                Compose Email
                            </Button>
                            <Button variant="secondary" onClick={() => setMultiSelectIds(new Set())}>Clear</Button>
                        </div>
                    </div>
                </div>
            )}

            <EmailComposerModal 
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                recipients={selectedForEmail}
                initialEmail={emailContent}
            />

            <style>{`
                .input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; padding: 0.5rem 0.75rem; } .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }
                .form-checkbox { appearance: none; -webkit-appearance: none; background-color: #374151; border: 1px solid #4b5563; border-radius: 0.25rem; } .form-checkbox:checked { background-color: #4f46e5; border-color: #4f46e5; background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e"); background-size: 100% 100%; background-position: center; background-repeat: no-repeat; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
