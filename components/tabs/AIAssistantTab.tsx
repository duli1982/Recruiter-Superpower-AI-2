import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { generateEmail, parseResume } from '../../services/geminiService';
// FIX: Add CandidateStatus to imports to satisfy the Candidate type requirements.
import { Candidate, EmailTemplateType, SentEmail, EmailStatus, EmailSequence, CandidateStatus, CandidateCRM } from '../../types';
import { MOCK_CANDIDATES, MOCK_SENT_EMAILS, MOCK_SEQUENCES } from '../../constants';

// Icons
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const History = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>;
const TestTube = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h-3c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/></svg>;
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

// --- STORAGE KEYS ---
const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const SENT_EMAILS_STORAGE_KEY = 'recruiter-ai-sent-emails';
const SEQUENCES_STORAGE_KEY = 'recruiter-ai-sequences';

// FIX: Create a blank CRM object to satisfy Candidate type requirements
const BLANK_CRM: CandidateCRM = { relationshipStatus: 'Cold', relationshipScore: 10, touchpointHistory: [], nurtureSettings: { autoNurture: false, cadence: 'Monthly', contentType: 'New Roles' }, communitySettings: { newsletter: false, eventInvites: false }};


// --- HELPER FUNCTIONS & COMPONENTS ---
const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <div className="flex items-center">
        <button type="button" className={`${checked ? 'bg-indigo-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900`} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
            <span aria-hidden="true" className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
        </button>
        <span className="ml-3 text-sm font-medium text-gray-300">{label}</span>
    </div>
);

const ParsedResumeForm: React.FC<{ initialData: Partial<Candidate>; onSave: (data: Omit<Candidate, 'id'>) => void; onCancel: () => void; }> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: initialData.name || '', email: initialData.email || '', phone: initialData.phone || '', skills: initialData.skills || '', resumeSummary: initialData.resumeSummary || '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); 
        // FIX: Add the required 'status' property to the object passed to onSave.
        onSave({ ...formData, status: CandidateStatus.Passive, applicationHistory: [], crm: BLANK_CRM }); 
    };
    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-4 bg-gray-800 rounded-md border border-gray-700 animate-fade-in">
            <h4 className="font-semibold text-gray-200">Review Extracted Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label htmlFor="name" className="label">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 input-field" required /></div>
                <div><label htmlFor="email" className="label">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 input-field" required /></div>
            </div>
            <div><label htmlFor="phone" className="label">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 input-field" /></div>
            <div><label htmlFor="skills" className="label">Skills (comma-separated)</label><input type="text" name="skills" value={formData.skills} onChange={handleChange} className="mt-1 input-field" /></div>
            <div><label htmlFor="resumeSummary" className="label">AI Generated Summary</label><textarea name="resumeSummary" rows={5} value={formData.resumeSummary} onChange={handleChange} className="mt-1 input-field"></textarea></div>
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Add Candidate</Button>
            </div>
        </form>
    );
};

const StatusBadge: React.FC<{ status: EmailStatus }> = ({ status }) => {
    const styles: Record<EmailStatus, string> = {
        [EmailStatus.Sent]: 'bg-blue-500/20 text-blue-300',
        [EmailStatus.Opened]: 'bg-purple-500/20 text-purple-300',
        [EmailStatus.Clicked]: 'bg-yellow-500/20 text-yellow-300',
        [EmailStatus.Replied]: 'bg-green-500/20 text-green-300',
        [EmailStatus.Bounced]: 'bg-red-500/20 text-red-300',
        [EmailStatus.Draft]: 'bg-gray-600/20 text-gray-300',
    };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>{status}</span>;
};


// --- MAIN COMPONENT ---
export const AIAssistantTab: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState('composer');
    const [candidates, setCandidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [sentEmails, setSentEmails] = useState<SentEmail[]>(() => getInitialData(SENT_EMAILS_STORAGE_KEY, MOCK_SENT_EMAILS));
    const [sequences, setSequences] = useState<EmailSequence[]>(() => getInitialData(SEQUENCES_STORAGE_KEY, MOCK_SEQUENCES));

    // Composer State
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
    const [jobTitle, setJobTitle] = useState('Senior Product Manager');
    const [keyPoints, setKeyPoints] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>(EmailTemplateType.Rejection);
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [isABTesting, setIsABTesting] = useState(false);
    const [subjectA, setSubjectA] = useState('');
    const [subjectB, setSubjectB] = useState('');

    // Resume Parser State
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [parsedData, setParsedData] = useState<Partial<Candidate> | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState('');
    
    // --- EFFECTS ---
    useEffect(() => {
        if (candidates.length > 0 && !selectedCandidateId) {
            setSelectedCandidateId(String(candidates[0].id));
        }
    }, [candidates, selectedCandidateId]);

    useEffect(() => { handleTemplateChange(EmailTemplateType.Rejection); }, []);
    useEffect(() => { localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(candidates)); }, [candidates]);
    useEffect(() => { localStorage.setItem(SENT_EMAILS_STORAGE_KEY, JSON.stringify(sentEmails)); }, [sentEmails]);
    useEffect(() => { localStorage.setItem(SEQUENCES_STORAGE_KEY, JSON.stringify(sequences)); }, [sequences]);

    // Effect to simulate email status updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSentEmails(currentEmails => {
                return currentEmails.map(email => {
                    if ([EmailStatus.Replied, EmailStatus.Bounced].includes(email.status)) return email;
                    const random = Math.random();
                    let newStatus = email.status;
                    if (email.status === EmailStatus.Sent && random < 0.1) newStatus = EmailStatus.Opened;
                    else if (email.status === EmailStatus.Opened && random < 0.05) newStatus = EmailStatus.Clicked;
                    else if (email.status === EmailStatus.Clicked && random < 0.02) newStatus = EmailStatus.Replied;
                    return { ...email, status: newStatus };
                });
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const selectedCandidate = useMemo(() => candidates.find(c => c.id === parseInt(selectedCandidateId, 10)), [selectedCandidateId, candidates]);

    // --- HANDLERS ---
    const handleTemplateChange = (template: EmailTemplateType) => {
        setSelectedTemplate(template);
        setGeneratedEmail('');
        let points = '', subject = 'Update on your application';
        switch (template) {
            case EmailTemplateType.InterviewInvite:
                points = '- Role: \n- Time: \n- Duration: 45 minutes\n- Interviewers: \n- Platform: Google Meet (link to follow)';
                subject = `Interview Invitation for ${jobTitle}`;
                break;
            case EmailTemplateType.FollowUp:
                points = 'Just a quick follow-up on your application. We are currently reviewing candidates and will provide an update by the end of the week. Thank you for your patience!';
                subject = 'Following up on your application';
                break;
            case EmailTemplateType.Rejection:
            default:
                points = 'While their experience is impressive, we decided to move forward with candidates whose backgrounds more closely align with the specific technical requirements of this role.';
                break;
        }
        setKeyPoints(points);
        setSubjectA(subject);
        setSubjectB(`${subject} at Innovate Inc.`);
    };

    const handleGenerateEmail = async () => {
        if (!selectedCandidate) { setEmailError('Please select a candidate.'); return; }
        setIsGeneratingEmail(true);
        setEmailError('');
        setGeneratedEmail('');
        try {
            const email = await generateEmail(selectedTemplate, selectedCandidate.name, jobTitle, 'Innovate Inc.', keyPoints);
            setGeneratedEmail(email);
        } catch (err) { setEmailError('Failed to generate email. Please try again.'); } finally { setIsGeneratingEmail(false); }
    };

    const handleSendAndTrack = () => {
        if (!selectedCandidate || !generatedEmail) return;
        const subject = isABTesting ? subjectA : subjectA; // For mailto, we can only use one
        const mailtoLink = `mailto:${selectedCandidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generatedEmail)}`;
        
        const newEmail: SentEmail = {
            id: `email-${Date.now()}`,
            candidateId: selectedCandidate.id,
            candidateName: selectedCandidate.name,
            jobTitle: jobTitle,
            subject: subject,
            body: generatedEmail,
            templateType: selectedTemplate,
            sentAt: new Date().toISOString(),
            status: EmailStatus.Sent,
            abTestVariant: isABTesting ? (Math.random() > 0.5 ? 'A' : 'B') : undefined
        };
        if (isABTesting) newEmail.subject = newEmail.abTestVariant === 'A' ? subjectA : subjectB;

        setSentEmails(prev => [newEmail, ...prev]);
        window.location.href = mailtoLink;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setResumeText(event.target?.result as string);
                setSelectedFile(file);
                setParseError('');
                setParsedData(null);
            };
            reader.readAsText(file);
        } else if(file) {
            setParseError(`Unsupported file type. Please use .txt or paste content.`);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleParse = async () => {
        if (!resumeText) { setParseError('Please paste or upload resume text.'); return; }
        setIsParsing(true);
        setParseError('');
        setParsedData(null);
        try {
            const result = await parseResume(resumeText);
            setParsedData(result);
        } catch (err) { setParseError(err instanceof Error ? err.message : 'Unknown parsing error.'); } finally { setIsParsing(false); }
    };
    
    const resetParser = () => {
        setResumeText('');
        setSelectedFile(null);
        setParsedData(null);
        setParseError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAddCandidate = (formData: Omit<Candidate, 'id'>) => {
        const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
        // FIX: Remove redundant `status` property, as it's now included in `formData`.
        const newCandidate: Candidate = { id: newId, ...formData, tags: [] };
        const updatedCandidates = [...candidates, newCandidate];
        setCandidates(updatedCandidates);
        setSelectedCandidateId(String(newId));
        setShowSuccessMessage(`Added ${newCandidate.name}!`);
        resetParser();
        setTimeout(() => setShowSuccessMessage(''), 5000);
    };

    // --- RENDER LOGIC ---
    const renderComposer = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader title="Data Entry Eraser" description="Parse resumes to auto-create candidate profiles." icon={<UploadIcon />}/>
                <div className="mt-4 space-y-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt"/>
                    <div onClick={() => fileInputRef.current?.click()} className="p-6 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-800/50 transition-colors">
                        <UploadIcon className="h-10 w-10 text-gray-500"/>
                        <p className="mt-2 text-sm text-gray-400">Drag & drop or click to browse</p>
                        <p className="mt-1 text-xs text-gray-500">.txt files only, or paste below</p>
                    </div>
                    {selectedFile && <div className="flex items-center justify-between bg-gray-800 p-2 rounded-md border border-gray-700"><div className="flex items-center gap-2"><FileTextIcon className="h-5 w-5 text-gray-400" /><span className="text-sm text-gray-300 truncate">{selectedFile.name}</span></div><button onClick={resetParser} className="p-1 rounded-full hover:bg-gray-700"><XIcon className="h-4 w-4 text-gray-400"/></button></div>}
                    <textarea placeholder="...or paste resume text here" rows={6} value={resumeText} onChange={e => setResumeText(e.target.value)} className="input-field"></textarea>
                    <Button onClick={handleParse} isLoading={isParsing} className="w-full" disabled={!resumeText}>Parse Resume</Button>
                </div>
                {(isParsing || parseError || showSuccessMessage || parsedData) && (
                    <div className="mt-4">
                        {isParsing && <Spinner text="Parsing resume..." />}
                        {parseError && <p className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-800 rounded-md">{parseError}</p>}
                        {showSuccessMessage && <p className="text-green-400 text-sm p-3 bg-green-900/20 border border-green-800 rounded-md">{showSuccessMessage}</p>}
                        {parsedData && !isParsing && <ParsedResumeForm initialData={parsedData} onSave={handleAddCandidate} onCancel={resetParser} />}
                    </div>
                )}
            </Card>
            <Card className="flex flex-col">
                <CardHeader title="AI Email Composer" description="Draft and track personalized emails with AI." icon={<MailIcon />}/>
                <div className="space-y-4 flex-grow">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="label">Candidate</label><select value={selectedCandidateId} onChange={e => setSelectedCandidateId(e.target.value)} className="mt-1 input-field" disabled={candidates.length === 0}>{candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div><label className="label">Template</label><select value={selectedTemplate} onChange={e => handleTemplateChange(e.target.value as EmailTemplateType)} className="mt-1 input-field">{Object.values(EmailTemplateType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    </div>
                    <div><label className="label">Job Title</label><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="mt-1 input-field" /></div>
                    <div>
                        <ToggleSwitch checked={isABTesting} onChange={setIsABTesting} label="A/B Test Subject Line" />
                        {isABTesting && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                <input type="text" placeholder="Subject A" value={subjectA} onChange={e => setSubjectA(e.target.value)} className="input-field-sm" />
                                <input type="text" placeholder="Subject B" value={subjectB} onChange={e => setSubjectB(e.target.value)} className="input-field-sm" />
                            </div>
                        )}
                    </div>
                    <div><label className="label">Key Points for AI</label><textarea rows={4} value={keyPoints} onChange={e => setKeyPoints(e.target.value)} className="mt-1 input-field"></textarea></div>
                    <Button onClick={handleGenerateEmail} isLoading={isGeneratingEmail} className="w-full" disabled={!selectedCandidateId}>Generate Email Body</Button>
                </div>
                {(isGeneratingEmail || generatedEmail || emailError) && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-md border border-gray-700">
                        <h4 className="font-semibold text-gray-200 mb-2">Email Preview:</h4>
                        {isGeneratingEmail && <Spinner text="Composing..." />}
                        {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
                        {generatedEmail && (
                            <>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{generatedEmail}</p>
                                <Button onClick={handleSendAndTrack} className="mt-4 w-full" icon={<SendIcon className="h-4 w-4" />}>Send & Track</Button>
                            </>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
    
    const renderTracking = () => {
        const stats = useMemo(() => {
            const totalSent = sentEmails.length;
            const opened = sentEmails.filter(e => [EmailStatus.Opened, EmailStatus.Clicked, EmailStatus.Replied].includes(e.status)).length;
            const clicked = sentEmails.filter(e => [EmailStatus.Clicked, EmailStatus.Replied].includes(e.status)).length;
            const replied = sentEmails.filter(e => e.status === EmailStatus.Replied).length;
            return {
                openRate: totalSent > 0 ? (opened / totalSent * 100).toFixed(0) : 0,
                clickRate: opened > 0 ? (clicked / opened * 100).toFixed(0) : 0,
                responseRate: totalSent > 0 ? (replied / totalSent * 100).toFixed(0) : 0,
            };
        }, [sentEmails]);

        const followUpReminders = useMemo(() => sentEmails.filter(e => {
            const daysAgo = (new Date().getTime() - new Date(e.sentAt).getTime()) / (1000 * 3600 * 24);
            return daysAgo > 3 && ![EmailStatus.Replied, EmailStatus.Bounced].includes(e.status);
        }), [sentEmails]);

        return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader title="Engagement Funnel (Last 30 Days)" icon={<TrendingUpIcon />} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="p-4 bg-gray-800 rounded-lg text-center">
                                <h4 className="text-3xl font-bold text-indigo-400">{stats.openRate}%</h4>
                                <p className="text-sm text-gray-300">Open Rate</p>
                                <p className="text-xs text-gray-500">Industry Avg: 35-45%</p>
                            </div>
                             <div className="p-4 bg-gray-800 rounded-lg text-center">
                                <h4 className="text-3xl font-bold text-indigo-400">{stats.clickRate}%</h4>
                                <p className="text-sm text-gray-300">Click-through Rate</p>
                                <p className="text-xs text-gray-500">Industry Avg: 15-25%</p>
                            </div>
                             <div className="p-4 bg-gray-800 rounded-lg text-center">
                                <h4 className="text-3xl font-bold text-indigo-400">{stats.responseRate}%</h4>
                                <p className="text-sm text-gray-300">Response Rate</p>
                                <p className="text-xs text-gray-500">Industry Avg: 5-10%</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <CardHeader title="Recent Activity" icon={<History />} />
                        <div className="mt-2 -mx-6">
                           <table className="min-w-full">
                                <thead className="border-b border-gray-700 text-xs text-gray-400 uppercase"><tr><th className="px-6 py-3 text-left">Candidate</th><th className="px-6 py-3 text-left">Subject</th><th className="px-6 py-3 text-left">Sent</th><th className="px-6 py-3 text-left">Status</th></tr></thead>
                                <tbody>{sentEmails.slice(0, 10).map(e => (
                                    <tr key={e.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-3 text-sm text-white">{e.candidateName}</td>
                                        <td className="px-6 py-3 text-sm text-gray-300">{e.subject}</td>
                                        <td className="px-6 py-3 text-sm text-gray-400">{new Date(e.sentAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-3"><StatusBadge status={e.status} /></td>
                                    </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                <div className="space-y-6">
                     <Card>
                        <CardHeader title="Follow-up Reminders" icon={<AlertTriangleIcon />} />
                        <div className="mt-4 space-y-3">
                            {followUpReminders.length > 0 ? followUpReminders.map(e => (
                                <div key={e.id} className="p-3 bg-gray-800 rounded-md">
                                    <p className="font-semibold text-sm text-white">{e.candidateName}</p>
                                    <p className="text-xs text-gray-400">Sent {Math.floor((new Date().getTime() - new Date(e.sentAt).getTime()) / (1000 * 3600 * 24))} days ago. No reply.</p>
                                </div>
                            )) : <p className="text-sm text-gray-500 text-center py-4">No reminders right now.</p>}
                        </div>
                    </Card>
                     <Card>
                        <CardHeader title="A/B Test Results" icon={<TestTube />} />
                        <div className="mt-4 text-center text-sm text-gray-500 py-4">No active A/B tests. Start one from the composer!</div>
                    </Card>
                </div>
            </div>
        );
    }
    
    const renderSequences = () => (
         <Card>
            <div className="flex justify-between items-center">
                <CardHeader title="Email Sequences" description="Create automated multi-step email campaigns." icon={<History />} />
                <Button icon={<PlusIcon />}>New Sequence</Button>
            </div>
            <div className="mt-4 space-y-4">
                {sequences.map(seq => (
                    <div key={seq.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h4 className="font-bold text-white">{seq.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{seq.description}</p>
                        <div className="mt-3 flex items-center gap-4">
                            {seq.steps.map((step, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600/50 flex items-center justify-center text-sm font-bold text-indigo-200">{step.day}</div>
                                    <div>
                                        <p className="text-xs text-gray-300">Day {step.day}</p>
                                        <p className="text-xs text-gray-500">{step.subject}</p>
                                    </div>
                                    {index < seq.steps.length - 1 && <div className="w-12 h-px bg-gray-600"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );

    const subTabs = [
        { id: 'composer', name: 'Composer & Tools' },
        { id: 'tracking', name: 'Tracking & Analytics' },
        { id: 'sequences', name: 'Sequences' }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {subTabs.map(tab => (
                             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${tab.id === activeTab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>{tab.name}</button>
                        ))}
                    </nav>
                </div>
            </div>

            {activeTab === 'composer' && renderComposer()}
            {activeTab === 'tracking' && renderTracking()}
            {activeTab === 'sequences' && renderSequences()}

            <style>{`
                .label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; }
                .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; }
                .input-field { padding: 0.5rem 0.75rem; }
                .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; }
                .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};