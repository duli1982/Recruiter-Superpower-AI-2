import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

// Icons
const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>;
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const UploadCloudIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16l-4-4-4 4M12 12v9"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><path d="M16 16l-4-4-4 4"/></svg>;
const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
  <button
    type="button"
    className={`${checked ? 'bg-indigo-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
  >
    <span
      aria-hidden="true"
      className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

const JOB_BOARDS = [
    { id: 'linkedIn', name: 'LinkedIn' },
    { id: 'indeed', name: 'Indeed' },
    { id: 'glassdoor', name: 'Glassdoor' },
    { id: 'zipRecruiter', name: 'ZipRecruiter' },
];

const ATS_SYSTEMS = ['Greenhouse', 'Lever', 'Workday', 'iCIMS'];

const WIDGET_CODE = `<div id="recruiter-ai-jobs"></div>
<script 
  src="https://your-company.com/recruiter-ai-widget.js" 
  data-company-id="YOUR_COMPANY_ID"
  async>
</script>`;

export const IntegrationUpskillingTab: React.FC = () => {
    const [connectedATS, setConnectedATS] = useState<string | null>('Greenhouse');
    const [syndication, setSyndication] = useState({ linkedIn: true, indeed: true, glassdoor: false, zipRecruiter: true });
    const [syncOptions, setSyncOptions] = useState({ newCandidates: true, requisitions: true, statusUpdates: false });
    const [isImporting, setIsImporting] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const handleToggleSyndication = (boardId: string) => {
        setSyndication(prev => ({ ...prev, [boardId]: !prev[boardId] }));
    };
    
    const handleToggleSync = (option: string) => {
        setSyncOptions(prev => ({...prev, [option]: !prev[option]}));
    }

    const handleImport = () => {
        setIsImporting(true);
        setTimeout(() => {
            setIsImporting(false);
            alert('Candidate import started. This may take a few minutes. You will be notified upon completion.');
        }, 2000);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(WIDGET_CODE);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Integration & Upskilling</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader title="ATS Integration" description="Connect to your primary Applicant Tracking System to enable powerful, time-saving workflows." icon={<LinkIcon />} />
                        <div className="mt-4">
                            {connectedATS ? (
                                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircleIcon className="h-6 w-6 text-green-400" />
                                        <div>
                                            <p className="font-semibold text-white">Connected to {connectedATS}</p>
                                            <p className="text-sm text-gray-400">Data sync is active.</p>
                                        </div>
                                    </div>
                                    <Button variant="secondary" onClick={() => setConnectedATS(null)}>Disconnect</Button>
                                </div>
                            ) : (
                                <div className="flex items-end gap-3">
                                    <div className="flex-grow">
                                        <label htmlFor="ats-select" className="block text-sm font-medium text-gray-300">Select ATS</label>
                                        <select id="ats-select" className="mt-1 input-field">
                                            {ATS_SYSTEMS.map(ats => <option key={ats}>{ats}</option>)}
                                        </select>
                                    </div>
                                    <Button onClick={() => setConnectedATS('Greenhouse')}>Connect</Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="Job Board Syndication" description="Automatically post and update your open requisitions on popular job boards." />
                        <div className="mt-4 space-y-3">
                            {JOB_BOARDS.map(board => (
                                <div key={board.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                                    <span className="font-medium text-gray-200">{board.name}</span>
                                    <ToggleSwitch checked={syndication[board.id]} onChange={() => handleToggleSyndication(board.id)} />
                                </div>
                            ))}
                        </div>
                    </Card>
                    
                    <Card>
                        <CardHeader title="Data Synchronization Rules" description="Control how data flows between Recruiter Superpower AI and your ATS."/>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                                <div>
                                    <p className="font-medium text-gray-200">Sync new candidates from ATS</p>
                                    <p className="text-xs text-gray-400">Automatically import new applicants from your ATS.</p>
                                </div>
                                <ToggleSwitch checked={syncOptions.newCandidates} onChange={() => handleToggleSync('newCandidates')} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                                <div>
                                    <p className="font-medium text-gray-200">Sync new job requisitions to ATS</p>
                                    <p className="text-xs text-gray-400">New jobs created here will be pushed to your ATS.</p>
                                </div>
                                <ToggleSwitch checked={syncOptions.requisitions} onChange={() => handleToggleSync('requisitions')} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                                 <div>
                                    <p className="font-medium text-gray-200">Two-way sync candidate pipeline status</p>
                                    <p className="text-xs text-gray-400">Updates made here will reflect in your ATS, and vice-versa.</p>
                                </div>
                                <ToggleSwitch checked={syncOptions.statusUpdates} onChange={() => handleToggleSync('statusUpdates')} />
                            </div>
                        </div>
                    </Card>

                </div>

                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader title="Career Page Widget" description="Embed a live jobs list directly on your company website." icon={<CodeIcon />} />
                        <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-2">Copy this snippet and paste it into your website's HTML where you want the job list to appear.</p>
                            <div className="relative">
                                <pre className="bg-gray-950 p-3 rounded-md text-xs text-gray-300 overflow-x-auto">
                                    <code>
                                        {WIDGET_CODE}
                                    </code>
                                </pre>
                                <Button onClick={handleCopyCode} variant="secondary" className="absolute top-2 right-2 !px-2 !py-1 text-xs">
                                    <ClipboardIcon className="h-4 w-4 mr-1" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <CardHeader title="Manual Data Transfer" description="Perform one-time import or export operations." icon={<UploadCloudIcon />} />
                        <div className="mt-4 space-y-3">
                           <Button onClick={handleImport} isLoading={isImporting} className="w-full">
                               Import All Candidates from ATS
                           </Button>
                           <Button variant="secondary" className="w-full" onClick={() => alert('Feature coming soon!')}>
                               Export All Candidates (CSV)
                           </Button>
                        </div>
                    </Card>
                </div>
            </div>
            <style>{`.input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; padding: 0.5rem 0.75rem; } .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }`}</style>
        </div>
    );
};
