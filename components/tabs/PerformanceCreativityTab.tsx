import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { JobRequisition, Candidate, PipelineStage, SourcingStrategy, TagType, RefinableSourcingField, BooleanSearchQuery } from '../../types';
import { MOCK_JOB_REQUISITIONS, MOCK_CANDIDATES, PIPELINE_STAGES, MOCK_PIPELINE_DATA } from '../../constants';
import { generateSourcingStrategy, refineSourcingStrategy } from '../../services/geminiService';

const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';
const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const PIPELINE_STORAGE_KEY = 'recruiter-ai-pipeline';

type PipelineData = { [jobId: number]: { [stage in PipelineStage]?: number[] } };
type JobPipeline = { [stage in PipelineStage]?: number[] };

// Icons
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>;
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05A6.5 6.5 0 0 1 8.94 9.9M9 9h.01M4.93 4.93l.01.01M2 12h.01M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v.01M19.07 4.93l-.01.01M22 12h-.01M19.07 19.07l-.01-.01M12 22v-.01" /></svg>;
const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

const MetricCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
            <div className="text-indigo-400">{icon}</div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-xl font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <Button onClick={handleCopy} variant="secondary" className="!px-2 !py-1 !text-xs">
            <ClipboardIcon className="h-4 w-4 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
        </Button>
    );
};

export const PerformanceCreativityTab: React.FC = () => {
    const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [pipelineData, setPipelineData] = useState<PipelineData>({});
    const [selectedAnalyticsJobId, setSelectedAnalyticsJobId] = useState<number | 'all'>('all');

    const [searchQuery, setSearchQuery] = useState<BooleanSearchQuery>({
        jobTitle: 'Senior React Engineer',
        mustHave: ['React', 'TypeScript'],
        niceToHave: ['Node.js', 'AWS'],
        exclude: ['Recruiter', 'Sales'],
        location: 'San Francisco OR New York OR Remote',
        currentCompanies: ['Google', 'Meta', 'Netflix'],
        pastCompanies: [],
        experience: { min: 5, max: 10 },
    });
    const [strategy, setStrategy] = useState<SourcingStrategy | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setRequisitions(getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
        setCandidates(getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
        setPipelineData(getInitialData(PIPELINE_STORAGE_KEY, MOCK_PIPELINE_DATA));
    }, []);

    const metrics = useMemo(() => {
        const isAllJobs = selectedAnalyticsJobId === 'all';
        const relevantPipeline = isAllJobs ? pipelineData : { [selectedAnalyticsJobId]: pipelineData[selectedAnalyticsJobId] || {} };
        const hiredCandidatesInPipeline: Set<number> = new Set((Object.values(relevantPipeline) as JobPipeline[]).flatMap((job) => job[PipelineStage.Hired] || []));
        const offerCandidatesInPipeline: Set<number> = new Set((Object.values(relevantPipeline) as JobPipeline[]).flatMap((job) => job[PipelineStage.Offer] || []));
        const totalOffersMade = hiredCandidatesInPipeline.size + offerCandidatesInPipeline.size;
        const offerAcceptanceRate = totalOffersMade > 0 ? (hiredCandidatesInPipeline.size / totalOffersMade) * 100 : 0;
        const hiredCandidatesDetails = candidates.filter(c => hiredCandidatesInPipeline.has(c.id));
        const sourceCounts = hiredCandidatesDetails.flatMap(c => c.tags || []).reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] || 0) + 1 }), {} as Record<string, number>);
        const topSource = Object.entries(sourceCounts).sort(([, countA], [, countB]) => countB - countA)[0]?.[0] || 'N/A';
        const randomSeed = isAllJobs ? 1 : selectedAnalyticsJobId;
        const seededRandom = (max: number, min: number) => Math.floor(Math.sin(randomSeed) * 10000 % 1 * (max - min + 1)) + min;
        return { avgTimeToFill: `${seededRandom(60, 30)} days`, avgTimeToHire: `${seededRandom(30, 15)} days`, offerAcceptanceRate: `${offerAcceptanceRate.toFixed(0)}%`, topSourceOfHire: topSource };
    }, [candidates, pipelineData, selectedAnalyticsJobId]);
    
    const handleGenerateStrategy = async () => {
        setIsLoading(true);
        setError('');
        setStrategy(null);
        try {
            const result = await generateSourcingStrategy(searchQuery);
            setStrategy(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof BooleanSearchQuery) => {
        const value = e.target.value.split(',').map(s => s.trim());
        setSearchQuery(prev => ({ ...prev, [field]: value }));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Performance & Creativity</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <Card>
                        <CardHeader title={'Performance Analytics'} icon={<BarChartIcon />} />
                        <div className="mt-4 space-y-4">
                             <div>
                                <label htmlFor="analytics-job-select" className="block text-sm font-medium text-gray-300 mb-1">Select Analysis Scope</label>
                                <select id="analytics-job-select" value={selectedAnalyticsJobId} onChange={e => setSelectedAnalyticsJobId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="input-field">
                                    <option value="all">All Jobs (Combined)</option>
                                    {requisitions.map(job => <option key={job.id} value={job.id}>{job.title} ({job.status})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricCard title="Avg. Time to Fill" value={metrics.avgTimeToFill} icon={<ClockIcon />} />
                                <MetricCard title="Avg. Time to Hire" value={metrics.avgTimeToHire} icon={<ClockIcon />} />
                                <MetricCard title="Offer Acceptance" value={metrics.offerAcceptanceRate} icon={<TargetIcon />} />
                                <MetricCard title="Top Source" value={metrics.topSourceOfHire} icon={<UsersIcon />} />
                            </div>
                        </div>
                    </Card>
                </div>
                <div>
                    <Card className="sticky top-8">
                        <CardHeader title="Advanced Sourcing Toolkit" icon={<LightbulbIcon />} description="Build a detailed search query to find your ideal passive candidates."/>
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="label">Job Title</label><input name="jobTitle" value={searchQuery.jobTitle} onChange={handleTextChange} className="input-field-sm" /></div>
                                <div><label className="label">Location</label><input name="location" value={searchQuery.location} onChange={handleTextChange} className="input-field-sm" /></div>
                                <div><label className="label">Must-Have Skills (AND)</label><input value={searchQuery.mustHave.join(', ')} onChange={e => handleArrayChange(e, 'mustHave')} placeholder="React, TypeScript" className="input-field-sm" /></div>
                                <div><label className="label">Nice-to-Have Skills (OR)</label><input value={searchQuery.niceToHave.join(', ')} onChange={e => handleArrayChange(e, 'niceToHave')} placeholder="Node.js, AWS" className="input-field-sm" /></div>
                                <div><label className="label">Exclude Keywords (NOT)</label><input value={searchQuery.exclude.join(', ')} onChange={e => handleArrayChange(e, 'exclude')} placeholder="Recruiter, Sales" className="input-field-sm" /></div>
                                <div><label className="label">Current Companies</label><input value={searchQuery.currentCompanies.join(', ')} onChange={e => handleArrayChange(e, 'currentCompanies')} placeholder="Google, Meta" className="input-field-sm" /></div>
                            </div>
                            <Button onClick={handleGenerateStrategy} isLoading={isLoading} disabled={isLoading} className="w-full">Generate Sourcing Strategy</Button>
                        </div>
                        <div className="mt-4">
                            {isLoading && <Spinner text="Brainstorming..." />}
                            {error && <p className="text-red-400 text-center p-3 bg-red-900/20 rounded-md">{error}</p>}
                            {strategy && (
                                <div className="space-y-6 animate-fade-in overflow-y-auto max-h-[60vh] pr-2">
                                    <div>
                                        <h4 className="font-semibold text-indigo-300 mb-2">Master Boolean String</h4>
                                        <div className="flex items-center gap-2 bg-gray-950 p-2 rounded-md">
                                            <code className="text-xs text-gray-300 flex-grow">{strategy.masterBooleanString}</code>
                                            <CopyButton textToCopy={strategy.masterBooleanString} />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-300 mb-2">Platform-Specific Queries</h4>
                                        <div className="space-y-2">
                                            {strategy.platformSpecificStrings.map((ps, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-gray-800 p-2 rounded-md">
                                                    {ps.platform === 'LinkedIn' && <LinkedInIcon className="h-5 w-5 text-gray-300 flex-shrink-0" />}
                                                    {ps.platform === 'GitHub' && <GitHubIcon className="h-5 w-5 text-gray-300 flex-shrink-0" />}
                                                    <code className="text-xs text-gray-300 flex-grow truncate">{ps.query}</code>
                                                    <CopyButton textToCopy={ps.query} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-300 mb-2">Untapped Sourcing Channels</h4>
                                        <div className="space-y-3">
                                            {strategy.untappedChannels.map((uc, i) => (
                                                <div key={i} className="p-3 bg-gray-800 rounded-md">
                                                    <p className="font-semibold text-gray-200">{uc.channel}</p>
                                                    <p className="text-sm text-gray-400 mt-1">{uc.reasoning}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
            <style>{`
                .label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; margin-bottom: 0.25rem;}
                .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; padding: 0.5rem 0.75rem; } .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; } .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};