import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
// FIX: Correct import path for geminiService
import { generateEmail, parseResume } from '../../services/geminiService';
// FIX: Add CandidateStatus to imports to satisfy the Candidate type requirements.
// FIX: Correct import path for types
import { Candidate, EmailTemplateType, CandidateStatus, CandidateCRM } from '../../types';
import { MOCK_CANDIDATES } from '../../constants';

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';

// FIX: Create a blank CRM object to satisfy Candidate type requirements
const BLANK_CRM: CandidateCRM = { relationshipStatus: 'Cold', relationshipScore: 10, touchpointHistory: [], nurtureSettings: { autoNurture: false, cadence: 'Monthly', contentType: 'New Roles' }, communitySettings: { newsletter: false, eventInvites: false }};

// Sub-component for the parsed data form
const ParsedResumeForm: React.FC<{
    initialData: Partial<Candidate>;
    onSave: (data: Omit<Candidate, 'id'>) => void;
    onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        skills: initialData.skills || '',
        resumeSummary: initialData.resumeSummary || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Add all required properties for the Candidate type to prevent type errors.
        const fullCandidateData: Omit<Candidate, 'id'> = {
            ...formData,
            status: CandidateStatus.Passive,
            experience: 0,
            location: '',
            availability: 'Immediate',
            tags: [],
            lastContactDate: new Date().toISOString(),
            source: 'Resume Upload',
            applicationHistory: [],
            crm: BLANK_CRM,
        };
        onSave(fullCandidateData);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-4 bg-gray-800 rounded-md border border-gray-700 animate-fade-in">
            <h4 className="font-semibold text-gray-200">Review Extracted Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 input-field" required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 input-field" required />
                </div>
            </div>
             <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Phone</label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 input-field" />
            </div>
            <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-300">Skills (comma-separated)</label>
                <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} className="mt-1 input-field" />
            </div>
            <div>
                <label htmlFor="resumeSummary" className="block text-sm font-medium text-gray-300">AI Generated Summary</label>
                <textarea name="resumeSummary" id="resumeSummary" rows={5} value={formData.resumeSummary} onChange={handleChange} className="mt-1 input-field"></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Add Candidate</Button>
            </div>
             <style>{`.input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; padding: 0.5rem 0.75rem; } .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; } @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }`}</style>
        </form>
    );
};

export const AdminEliminationTab: React.FC = () => {
    // State for Email Composer
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
    const [jobTitle, setJobTitle] = useState('Senior Product Manager');
    const [keyPoints, setKeyPoints] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>(EmailTemplateType.Rejection);
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const [emailError, setEmailError] = useState('');

    // State for Data Entry Eraser
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [parsedData, setParsedData] = useState<Partial<Candidate> | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem(CANDIDATES_STORAGE_KEY);
        const loadedCandidates = stored ? JSON.parse(stored) : MOCK_CANDIDATES;
        setCandidates(loadedCandidates);
        if (loadedCandidates.length > 0) {
            setSelectedCandidateId(String(loadedCandidates[0].id));
        }
        handleTemplateChange(EmailTemplateType.Rejection); // Set initial keyPoints
    }, []);

    const selectedCandidate = useMemo(() => {
        return candidates.find(c => c.id === parseInt(selectedCandidateId, 10));
    }, [selectedCandidateId, candidates]);

    const handleTemplateChange = (template: EmailTemplateType) => {
        setSelectedTemplate(template);
        setGeneratedEmail('');
        switch (template) {
            case EmailTemplateType.InterviewInvite:
                setKeyPoints('- Role: \n- Time: \n- Duration: 45 minutes\n- Interviewers: \n- Platform: Google Meet (link to follow)');
                break;
            case EmailTemplateType.FollowUp:
                setKeyPoints('Just a quick follow-up on your application. We are currently reviewing candidates and will provide an update by the end of the week. Thank you for your patience!');
                break;
            case EmailTemplateType.Rejection:
            default:
                setKeyPoints('While their experience is impressive, we decided to move forward with candidates whose backgrounds more closely align with the specific technical requirements of this role.');
                break;
        }
    };

    const handleGenerateEmail = async () => {
        if (!selectedCandidate) {
            setEmailError('Please select a candidate.');
            return;
        }
        setIsGeneratingEmail(true);
        setEmailError('');
        setGeneratedEmail('');
        try {
            const email = await generateEmail(selectedTemplate, selectedCandidate.name, jobTitle, 'Innovate Inc.', keyPoints);
            setGeneratedEmail(email);
        } catch (err) {
            setEmailError('Failed to generate email. Please try again.');
            console.error(err);
        } finally {
            setIsGeneratingEmail(false);
        }
    };
    
    const handleSendEmail = () => {
        if (!selectedCandidate || !generatedEmail) return;
        const subject = `Update on your application for ${jobTitle} at Innovate Inc.`;
        const mailtoLink = `mailto:${selectedCandidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generatedEmail)}`;
        window.location.href = mailtoLink;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setResumeText(event.target?.result as string);
                    setSelectedFile(file);
                    setParseError('');
                    setParsedData(null);
                };
                reader.readAsText(file);
            } else {
                setParseError(`Unsupported file type: "${file.name}". Only .txt files are supported for direct upload. For PDF/DOCX, please paste the content directly.`);
                setSelectedFile(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setResumeText('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleParse = async () => {
        if (!resumeText) {
            setParseError('Please upload a file or paste resume text.');
            return;
        }
        setIsParsing(true);
        setParseError('');
        setParsedData(null);
        setShowSuccessMessage('');
        try {
            const result = await parseResume(resumeText);
            setParsedData(result);
        } catch (err) {
            setParseError(err instanceof Error ? err.message : 'An unknown error occurred during parsing.');
            console.error(err);
        } finally {
            setIsParsing(false);
        }
    };
    
    const resetParser = () => {
        setResumeText('');
        setSelectedFile(null);
        setParsedData(null);
        setParseError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddCandidate = (formData: Omit<Candidate, 'id'>) => {
        if (!formData || !formData.email) return;
        try {
            const stored = localStorage.getItem(CANDIDATES_STORAGE_KEY);
            const currentCandidates: Candidate[] = stored ? JSON.parse(stored) : [];

            const isDuplicate = currentCandidates.some(c => c.email.toLowerCase() === formData.email.toLowerCase());
            if (isDuplicate) {
                if (!window.confirm('A candidate with this email already exists. Do you want to add them as a duplicate?')) {
                    return; // Abort if user cancels
                }
            }

            const newId = currentCandidates.length > 0 ? Math.max(...currentCandidates.map(c => c.id)) + 1 : 1;
            const newCandidate: Candidate = { id: newId, ...formData, tags: [] };
            const updatedCandidates = [...currentCandidates, newCandidate];
            localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(updatedCandidates));
            
            setCandidates(updatedCandidates); // Update local state for email composer
            setSelectedCandidateId(String(newId)); // Select the new candidate
            setShowSuccessMessage(`Successfully added ${newCandidate.name}! View them in the "Candidate Profiles" tab.`);
            resetParser();
            setTimeout(() => setShowSuccessMessage(''), 5000);
        } catch (error) {
            setParseError('Failed to save candidate to local storage.');
            console.error(error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">AI Assistant</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader title="Data Entry Eraser" description="Parse resumes to auto-create candidate profiles." icon={<UploadIcon />}/>
                    <div className="mt-4 space-y-4">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt"/>
                        <div onClick={() => fileInputRef.current?.click()} className="p-6 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-800/50 transition-colors">
                            <UploadIcon className="h-10 w-10 text-gray-500"/>
                            <p className="mt-2 text-sm text-gray-400">Drag & drop a .txt file or click to browse</p>
                            <p className="mt-1 text-xs text-gray-500">For PDF/DOCX, paste content below</p>
                        </div>
                         {selectedFile && (
                            <div className="flex items-center justify-between bg-gray-800 p-2 rounded-md border border-gray-700">
                                <div className="flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-300 truncate">{selectedFile.name}</span>
                                </div>
                                <button onClick={clearFile} className="p-1 rounded-full hover:bg-gray-700"><XIcon className="h-4 w-4 text-gray-400"/></button>
                            </div>
                        )}
                        <div className="relative">
                           <textarea placeholder="...or paste resume text here" rows={6} value={resumeText} onChange={e => { setResumeText(e.target.value); setSelectedFile(null); }} className="block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"></textarea>
                            <span className="absolute top-2 right-2 text-xs text-gray-500">Paste here</span>
                        </div>
                        <Button onClick={handleParse} isLoading={isParsing} className="w-full" disabled={!resumeText}>
                            Parse Resume
                        </Button>
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
                    <CardHeader title="AI Email Composer" description="Select a candidate and template to quickly draft professional emails." icon={<MailIcon />}/>
                    <div className="space-y-4 flex-grow">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="candidateName" className="block text-sm font-medium text-gray-300">Candidate</label>
                                <select id="candidateName" value={selectedCandidateId} onChange={e => setSelectedCandidateId(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2" disabled={candidates.length === 0}>
                                    {candidates.length > 0 ? (
                                        candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    ) : (
                                        <option>No candidates found</option>
                                    )}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="template" className="block text-sm font-medium text-gray-300">Template</label>
                                <select id="template" value={selectedTemplate} onChange={e => handleTemplateChange(e.target.value as EmailTemplateType)} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2">
                                    {/* FIX: Use Object.entries for string enums to get [key, value] pairs for stable keys. */}
                                    {Object.entries(EmailTemplateType).map(([key, value]) => <option key={key} value={value}>{value}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300">Job Title</label>
                            <input type="text" id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2" />
                        </div>
                        <div>
                            <label htmlFor="keyPoints" className="block text-sm font-medium text-gray-300">Key Points for AI</label>
                            <textarea id="keyPoints" rows={4} value={keyPoints} onChange={e => setKeyPoints(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"></textarea>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button onClick={handleGenerateEmail} isLoading={isGeneratingEmail} className="w-full" disabled={!selectedCandidateId}>
                            Compose with AI
                        </Button>
                    </div>
                    {(isGeneratingEmail || generatedEmail || emailError) && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-md border border-gray-700">
                           <h4 className="font-semibold text-gray-200 mb-2">Email Preview:</h4>
                            {isGeneratingEmail && <Spinner text="Composing..." />}
                            {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
                            {generatedEmail && (
                                <>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{generatedEmail}</p>
                                    <Button onClick={handleSendEmail} className="mt-4 w-full" icon={<SendIcon className="h-4 w-4" />}>
                                        Send via Email Client
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
