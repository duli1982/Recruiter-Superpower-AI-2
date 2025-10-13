import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { parseAvailability, generateSchedulingEmail } from '../../services/geminiService';
import { Candidate, InterviewStage } from '../../types';
import { MOCK_CANDIDATES } from '../../constants';

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;


type TimeSlot = { startTime: string; endTime: string };

const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';

export const CandidateExperienceTab: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
    const [interviewStage, setInterviewStage] = useState<InterviewStage>(InterviewStage.PhoneScreen);
    const [interviewers, setInterviewers] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [availabilityText, setAvailabilityText] = useState('Tomorrow from 2pm to 4:30pm, and Friday morning from 10am to 11am.');
    
    const [isParsing, setIsParsing] = useState(false);
    const [parsingError, setParsingError] = useState('');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CANDIDATES_STORAGE_KEY);
        const loadedCandidates = stored ? JSON.parse(stored) : MOCK_CANDIDATES;
        setCandidates(loadedCandidates);
        if (loadedCandidates.length > 0) {
            setSelectedCandidateId(String(loadedCandidates[0].id));
        }
    }, []);

    const selectedCandidate = useMemo(() => {
        return candidates.find(c => c.id === parseInt(selectedCandidateId, 10));
    }, [selectedCandidateId, candidates]);

    const handleParse = async () => {
        setIsParsing(true);
        setParsingError('');
        setTimeSlots([]);
        setSelectedSlots(new Set());
        setGeneratedEmail('');
        try {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const result = await parseAvailability(availabilityText, userTimezone);
            setTimeSlots(result);
        } catch (error) {
            setParsingError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsParsing(false);
        }
    };
    
    const handleSlotToggle = (startTime: string) => {
        const newSelected = new Set(selectedSlots);
        if (newSelected.has(startTime)) {
            newSelected.delete(startTime);
        } else {
            newSelected.add(startTime);
        }
        setSelectedSlots(newSelected);
        setGeneratedEmail('');
    };

    const handleGenerateEmail = async () => {
        if (!selectedCandidate || selectedSlots.size === 0) {
            setGenerationError('Please select a candidate and at least one time slot.');
            return;
        }
        setIsGenerating(true);
        setGenerationError('');
        setGeneratedEmail('');
        try {
            const formattedSlots = Array.from(selectedSlots).map((slot: string) => {
                return new Date(slot).toLocaleString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    timeZoneName: 'short',
                });
            });
            const interviewerList = interviewers.split(',').map(name => name.trim()).filter(Boolean);
            const email = await generateSchedulingEmail(selectedCandidate.name, 'Senior Product Manager', interviewStage, formattedSlots, interviewerList, videoLink);
            setGeneratedEmail(email);
        } catch (error) {
            setGenerationError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatSlot = (slot: TimeSlot) => {
        const date = new Date(slot.startTime);
        return date.toLocaleString(undefined, {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    };
    
    const groupedSlots = useMemo(() => {
        return timeSlots.reduce((acc, slot) => {
            const date = new Date(slot.startTime).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(slot);
            return acc;
        }, {} as Record<string, TimeSlot[]>);
    }, [timeSlots]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Candidate Experience</h2>
            <Card>
                <CardHeader title="AI Scheduling Assistant" description="Automatically find interview slots from plain text and draft scheduling emails." icon={<CalendarIcon />}/>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                    {/* Left Column: Input */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="candidateSelect" className="block text-sm font-medium text-gray-300">Candidate</label>
                                <select id="candidateSelect" value={selectedCandidateId} onChange={e => setSelectedCandidateId(e.target.value)} className="mt-1 input-field" disabled={candidates.length === 0}>
                                    {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="interviewStage" className="block text-sm font-medium text-gray-300">Interview Stage</label>
                                <select id="interviewStage" value={interviewStage} onChange={e => setInterviewStage(e.target.value as InterviewStage)} className="mt-1 input-field">
                                    {(Object.values(InterviewStage) as string[]).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="interviewers" className="block text-sm font-medium text-gray-300">Interviewers (comma-separated)</label>
                            <input
                                id="interviewers"
                                type="text"
                                value={interviewers}
                                onChange={(e) => setInterviewers(e.target.value)}
                                className="mt-1 input-field"
                                placeholder="e.g., Jane Doe, John Smith"
                            />
                        </div>
                        <div>
                            <label htmlFor="videoLink" className="block text-sm font-medium text-gray-300">Video Conference Link</label>
                            <input
                                id="videoLink"
                                type="text"
                                value={videoLink}
                                onChange={(e) => setVideoLink(e.target.value)}
                                className="mt-1 input-field"
                                placeholder="e.g., https://meet.google.com/xyz-abc-def"
                            />
                        </div>
                        <div>
                            <label htmlFor="availabilityText" className="block text-sm font-medium text-gray-300">Enter your availability</label>
                            <textarea id="availabilityText" rows={3} value={availabilityText} onChange={e => setAvailabilityText(e.target.value)} className="mt-1 input-field" placeholder="e.g., Tomorrow afternoon, next Monday 10am-12pm"></textarea>
                        </div>
                        <Button onClick={handleParse} isLoading={isParsing} disabled={!availabilityText} className="w-full">
                            Find Available Times
                        </Button>
                        {isParsing && <Spinner text="Finding slots..." />}
                        {parsingError && <p className="text-red-400 text-sm">{parsingError}</p>}
                        {timeSlots.length > 0 && (
                             <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-200">Select slots to offer:</h4>
                                {Object.entries(groupedSlots).map(([date, slots]) => (
                                    <div key={date}>
                                        <p className="text-sm font-medium text-indigo-300 mb-2">{date}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {slots.map(slot => (
                                                <button key={slot.startTime} onClick={() => handleSlotToggle(slot.startTime)} className={`px-3 py-2 text-sm rounded-md transition-colors ${selectedSlots.has(slot.startTime) ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}>
                                                    {formatSlot(slot)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>

                    {/* Right Column: Output */}
                    <div className="space-y-4">
                        <Button onClick={handleGenerateEmail} isLoading={isGenerating} disabled={selectedSlots.size === 0} className="w-full">
                            Generate Candidate Email
                        </Button>
                         {(isGenerating || generationError || generatedEmail) && (
                            <div className="p-4 bg-gray-800 rounded-md border border-gray-700 h-full min-h-[200px] flex flex-col">
                                {isGenerating && <Spinner text="Drafting email..." />}
                                {generationError && <p className="text-red-400 text-sm">{generationError}</p>}
                                {generatedEmail && (
                                    <div className="flex-grow flex flex-col">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold text-gray-200">Email Preview:</h4>
                                            <Button onClick={handleCopyToClipboard} variant="secondary" icon={copied ? <CheckIcon className="h-4 w-4 text-green-400"/> : <ClipboardIcon className="h-4 w-4"/>}>
                                                {copied ? 'Copied!' : 'Copy'}
                                            </Button>
                                        </div>
                                        <textarea readOnly value={generatedEmail} className="input-field text-sm flex-grow w-full bg-gray-900 resize-none"></textarea>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
            <style>{`.input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; padding: 0.5rem 0.75rem; } .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }`}</style>
        </div>
    );
};