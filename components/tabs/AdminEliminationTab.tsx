import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { generateFeedbackEmail } from '../../services/geminiService';

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;

export const AdminEliminationTab: React.FC = () => {
    const [candidateName, setCandidateName] = useState('Jane Doe');
    const [jobTitle, setJobTitle] = useState('Senior Product Manager');
    const [feedback, setFeedback] = useState('While their experience is impressive, we decided to move forward with candidates whose backgrounds more closely align with the specific technical requirements of this role.');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateEmail = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedEmail('');
        try {
            const email = await generateFeedbackEmail(candidateName, jobTitle, 'Innovate Inc.', feedback);
            setGeneratedEmail(email);
        } catch (err) {
            setError('Failed to generate email. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Admin Elimination</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader title="Data Entry Eraser" description="Upload resumes to automatically populate candidate profiles." icon={<UploadIcon />}/>
                    <div className="mt-4 p-8 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center">
                        <UploadIcon className="h-12 w-12 text-gray-500"/>
                        <p className="mt-2 text-sm text-gray-400">Drag & drop files here or click to browse</p>
                        <p className="mt-1 text-xs text-gray-500">(Feature mocked for prototype)</p>
                        <Button variant="secondary" className="mt-4">
                            Select Files
                        </Button>
                    </div>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader title="Rejection & Feedback Generator" description="Draft empathetic and constructive feedback emails in seconds." icon={<MailIcon />}/>
                    <div className="space-y-4 flex-grow">
                        <div>
                            <label htmlFor="candidateName" className="block text-sm font-medium text-gray-300">Candidate Name</label>
                            <input type="text" id="candidateName" value={candidateName} onChange={e => setCandidateName(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2" />
                        </div>
                        <div>
                            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300">Job Title</label>
                            <input type="text" id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2" />
                        </div>
                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium text-gray-300">Core Feedback / Reason</label>
                            <textarea id="feedback" rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"></textarea>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button onClick={handleGenerateEmail} isLoading={isLoading} className="w-full">
                            Generate Email
                        </Button>
                    </div>
                    {(isLoading || generatedEmail || error) && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-md border border-gray-700">
                           <h4 className="font-semibold text-gray-200 mb-2">Generated Email Preview:</h4>
                            {isLoading && <Spinner text="Generating..." />}
                            {error && <p className="text-red-400">{error}</p>}
                            {generatedEmail && <p className="text-sm text-gray-300 whitespace-pre-wrap">{generatedEmail}</p>}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
