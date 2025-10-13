import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
// FIX: Correct import path for types
import { JobRequisition, Candidate, PipelineStage, SourcingStrategy, TagType, RefinableSourcingField, BooleanSearchQuery } from '../../types';
import { MOCK_JOB_REQUISITIONS, MOCK_CANDIDATES, PIPELINE_STAGES, MOCK_PIPELINE_DATA } from '../../constants';
// FIX: Correct import path for geminiService
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
const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.225 1.839 1.225 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;


const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};


export const PerformanceCreativityTab: React.FC = () => {
    const [requisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [candidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [pipelineData] = useState<PipelineData>(() => getInitialData(PIPELINE_STORAGE_KEY, MOCK_PIPELINE_DATA));

    const [booleanQuery, setBooleanQuery] = useState<BooleanSearchQuery>({
        jobTitle: 'Senior Software Engineer',
        mustHave: ['React', 'Node.js'],
        niceToHave: ['TypeScript', 'GraphQL'],
        exclude: ['Angular', 'Vue'],
        location: 'Remote',
        currentCompanies: [''],
        pastCompanies: [''],
        experience: { min: 5, max: 10 }
    });
    const [sourcingStrategy, setSourcingStrategy] = useState<SourcingStrategy | null>(null);
    const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
    const [refinementFeedback, setRefinementFeedback] = useState('');
    const [copiedQuery, setCopiedQuery] = useState<string | null>(null);

    const performanceMetrics = useMemo(() => {
        let totalHires = 0;
        let totalTimeToFill = 0;
        let totalApplicants = 0;

        requisitions.filter(r => r.status === 'Closed').forEach(req => {
            const jobPipeline: JobPipeline = pipelineData[req.id] || {};
            const hiresInJob = jobPipeline.Hired?.length || 0;
            // FIX: The `createdAt` property might be missing or invalid if data is loaded from
            // a malformed localStorage entry. This check ensures we only perform date calculations
            // when `createdAt` is a valid value, preventing runtime errors and ensuring metric accuracy.
            if (hiresInJob > 0 && req.createdAt) {
                totalHires += hiresInJob;
                const timeToFill = (new Date().getTime() - new Date(req.createdAt).getTime()) / (1000 * 3600 * 24);
                totalTimeToFill += timeToFill;
            }
            totalApplicants += req.applications;
        });

        const avgTimeToFill = totalHires > 0 ? (totalTimeToFill / totalHires).toFixed(1) : 'N/A';
        const conversionRate = totalApplicants > 0 ? (totalHires / totalApplicants * 100).toFixed(2) : 'N/A';
        const sourceEffectiveness = candidates.reduce((acc, c) => {
            if (c.status === 'Hired' && c.source) {
                acc[c.source] = (acc[c.source] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return {
            totalHires,
            avgTimeToFill,
            conversionRate,
            sourceEffectiveness: Object.entries(sourceEffectiveness).sort(([, a], [, b]) => b - a)
        };
    }, [requisitions, pipelineData, candidates]);

    const handleGenerateStrategy = async () => {
        setIsLoadingStrategy(true);
        setSourcingStrategy(null);
        try {
            const strategy = await generateSourcingStrategy(booleanQuery);
            setSourcingStrategy(strategy);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingStrategy(false);
        }
    };
    
    const handleRefineStrategy = async () => {
        if (!sourcingStrategy || !refinementFeedback) return;
        setIsLoadingStrategy(true);
        try {
            const refined = await refineSourcingStrategy(sourcingStrategy, refinementFeedback);
            setSourcingStrategy(refined);
            setRefinementFeedback('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingStrategy(false);
        }
    };

    const handleCopy = (text: string, queryType: string) => {
        navigator.clipboard.writeText(text);
        setCopiedQuery(queryType);
        setTimeout(() => setCopiedQuery(null), 2000);
    };


    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setBooleanQuery(prev => ({ ...prev, [parent]: { ...(prev[parent as keyof BooleanSearchQuery] as object), [child]: value } }));
        } else {
            const isArray = ['mustHave', 'niceToHave', 'exclude'].includes(name);
            setBooleanQuery(prev => ({ ...prev, [name]: isArray ? value.split(',').map(s => s.trim()) : value }));
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Performance & Creativity</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Metrics */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader title="Key Performance Indicators" icon={<BarChartIcon />} />
                        <div className="mt-4 space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center gap-3"><UsersIcon className="h-5 w-5 text-indigo-400" /><span className="text-gray-300">Total Hires (Q3)</span></div>
                                <span className="font-bold text-xl text-white">{performanceMetrics.totalHires}</span>
                            </div>
                             <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center gap-3"><ClockIcon className="h-5 w-5 text-indigo-400" /><span className="text-gray-300">Avg. Time-to-Fill</span></div>
                                <span className="font-bold text-xl text-white">{performanceMetrics.avgTimeToFill} days</span>
                            </div>
                             <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center gap-3"><TargetIcon className="h-5 w-5 text-indigo-400" /><span className="text-gray-300">Applicant-to-Hire</span></div>
                                <span className="font-bold text-xl text-white">{performanceMetrics.conversionRate}%</span>
                            </div>
                        </div>
                    </Card>
                     <Card>
                        <CardHeader title="Source of Hire" />
                        <div className="mt-4 space-y-3">
                            {performanceMetrics.sourceEffectiveness.map(([source, count]) => {
                                const percentage = (count / (performanceMetrics.totalHires || 1)) * 100;
                                return (
                                     <div key={source}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-300">{source}</span>
                                            <span className="text-gray-400">{count} hires</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
                {/* Creativity Engine */}
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader title="AI Sourcing Strategist" description="Generate powerful boolean search strings and discover untapped talent pools." icon={<LightbulbIcon />} />
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="label">Job Title</label><input type="text" name="jobTitle" value={booleanQuery.jobTitle} onChange={handleQueryChange} className="input-field" /></div>
                            <div><label className="label">Location</label><input type="text" name="location" value={booleanQuery.location} onChange={handleQueryChange} className="input-field" /></div>
                            <div><label className="label">Must-Have Skills</label><input type="text" name="mustHave" value={booleanQuery.mustHave.join(', ')} onChange={handleQueryChange} className="input-field" placeholder="Comma-separated"/></div>
                            <div><label className="label">Nice-to-Have Skills</label><input type="text" name="niceToHave" value={booleanQuery.niceToHave.join(', ')} onChange={handleQueryChange} className="input-field" placeholder="Comma-separated"/></div>
                            <div><label className="label">Exclude Skills</label><input type="text" name="exclude" value={booleanQuery.exclude.join(', ')} onChange={handleQueryChange} className="input-field" placeholder="Comma-separated"/></div>
                        </div>
                        <Button onClick={handleGenerateStrategy} isLoading={isLoadingStrategy} className="mt-4 w-full">Generate Strategy</Button>

                        {isLoadingStrategy && <Spinner text="Generating sourcing strategy..." />}

                        {sourcingStrategy && (
                            <div className="mt-6 space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-200 mb-2">Master Boolean String</h4>
                                    <div className="relative"><pre className="bg-gray-800 p-3 rounded-md text-sm text-indigo-300 overflow-x-auto">{sourcingStrategy.masterBooleanString}</pre><Button variant="secondary" onClick={() => handleCopy(sourcingStrategy.masterBooleanString, 'master')} className="absolute top-2 right-2 !px-2 !py-1 text-xs">{copiedQuery === 'master' ? 'Copied!' : 'Copy'}</Button></div>
                                </div>
                                 <div>
                                    <h4 className="font-semibold text-gray-200 mb-2">Platform-Specific Queries</h4>
                                    <div className="space-y-2">{sourcingStrategy.platformSpecificStrings.map(p => (
                                        <div key={p.platform} className="relative flex items-center gap-2"><div className="flex-shrink-0 w-6 h-6">{p.platform === 'LinkedIn' ? <LinkedInIcon/> : <GitHubIcon/>}</div><pre className="flex-grow bg-gray-800 p-2 rounded-md text-sm text-indigo-300 overflow-x-auto">{p.query}</pre><Button variant="secondary" onClick={() => handleCopy(p.query, p.platform)} className="absolute top-1 right-1 !px-2 !py-1 text-xs">{copiedQuery === p.platform ? 'Copied!' : 'Copy'}</Button></div>
                                    ))}</div>
                                </div>
                                 <div>
                                    <h4 className="font-semibold text-gray-200 mb-2">Untapped Channels</h4>
                                    <div className="space-y-2">{sourcingStrategy.untappedChannels.map(c => (
                                        <div key={c.channel} className="p-3 bg-gray-800 rounded-md"><h5 className="font-semibold text-gray-300">{c.channel}</h5><p className="text-sm text-gray-400">{c.reasoning}</p></div>
                                    ))}</div>
                                </div>
                                <div className="border-t border-gray-700 pt-4">
                                     <h4 className="font-semibold text-gray-200 mb-2">Refine Strategy</h4>
                                     <div className="flex gap-2">
                                         <input type="text" value={refinementFeedback} onChange={e => setRefinementFeedback(e.target.value)} className="input-field flex-grow" placeholder="e.g., Add 'SaaS experience'"/>
                                         <Button onClick={handleRefineStrategy} isLoading={isLoadingStrategy}>Refine</Button>
                                     </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
             <style>{`.label { display: block; text-transform: uppercase; font-size: 0.75rem; font-weight: 500; color: #9ca3af; margin-bottom: 0.25rem;} .input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; padding: 0.5rem 0.75rem;} .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }`}</style>
        </div>
    );
};