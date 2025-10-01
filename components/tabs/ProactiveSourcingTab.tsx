import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { scoutForTalent } from '../../services/geminiService';
import { ScoutedCandidate, Candidate } from '../../types';

// Icons
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>;
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05A6.5 6.5 0 0 1 8.94 9.9M9 9h.01M4.93 4.93l.01.01M2 12h.01M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v.01M19.07 4.93l-.01.01M22 12h-.01M19.07 19.07l-.01-.01M12 22v-.01" /></svg>;

const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';

const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 85) return 'text-yellow-400';
    return 'text-orange-400';
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleScout = async () => {
        setIsLoading(true);
        setError('');
        setScoutedCandidates([]);
        setShowSuccessMessage('');
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
        const newCandidate: Omit<Candidate, 'id'> = {
            name: scoutedCandidate.name,
            email: `${scoutedCandidate.name.toLowerCase().replace(' ', '.')}@example.com`, // mock email
            phone: '123-456-7890', // mock phone
            skills: formData.skills,
            resumeSummary: `${scoutedCandidate.currentRole} at ${scoutedCandidate.currentCompany}. Identified by AI as a potential fit for the ${formData.jobTitle} role. Intent signal: ${scoutedCandidate.intentSignal}`
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
                                <Card key={candidate.id} className="flex flex-col">
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
            <style>{`.input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; padding: 0.5rem 0.75rem; } .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }`}</style>
        </div>
    );
};