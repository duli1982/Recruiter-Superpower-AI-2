import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { JobRequisition, Candidate, PipelineStage, SourcingStrategy, TagType, RefinableSourcingField } from '../../types';
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

const RefineComponent: React.FC<{
    field: RefinableSourcingField;
    isRefining: boolean;
    refiningField: RefinableSourcingField | null;
    setRefiningField: (field: RefinableSourcingField | null) => void;
    refinementFeedback: string;
    setRefinementFeedback: (feedback: string) => void;
    handleRefineStrategy: (e: React.FormEvent) => void;
}> = ({ field, isRefining, refiningField, setRefiningField, refinementFeedback, setRefinementFeedback, handleRefineStrategy }) => {
    const isThisFieldRefining = refiningField === field;

    if (isThisFieldRefining) {
        return (
            <form onSubmit={handleRefineStrategy} className="mt-2 space-y-2 p-2 bg-gray-950 rounded-md">
                <input
                    type="text"
                    placeholder="Your feedback, e.g., 'more focus on public APIs'"
                    value={refinementFeedback}
                    onChange={(e) => setRefinementFeedback(e.target.value)}
                    className="input-field-sm w-full"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setRefiningField(null)} className="!text-xs !py-1 !px-2">Cancel</Button>
                    <Button type="submit" isLoading={isRefining} className="!text-xs !py-1 !px-2">Refine</Button>
                </div>
            </form>
        );
    }

    return (
        <div className="text-right mt-2">
            <Button
                variant="secondary"
                onClick={() => { setRefiningField(field); setRefinementFeedback(''); }}
                className="!text-xs !py-1 !px-2"
            >
                Suggest Alternatives
            </Button>
        </div>
    );
};

export const PerformanceCreativityTab: React.FC = () => {
    const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [pipelineData, setPipelineData] = useState<PipelineData>({});

    const [selectedAnalyticsJobId, setSelectedAnalyticsJobId] = useState<number | 'all'>('all');
    const [selectedSourcingJobId, setSelectedSourcingJobId] = useState<number | undefined>();
    const [strategy, setStrategy] = useState<SourcingStrategy | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // State for refinement
    const [refiningField, setRefiningField] = useState<RefinableSourcingField | null>(null);
    const [refinementFeedback, setRefinementFeedback] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    useEffect(() => {
        const allReqs = getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS);
        setRequisitions(allReqs);
        setCandidates(getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
        setPipelineData(getInitialData(PIPELINE_STORAGE_KEY, MOCK_PIPELINE_DATA));

        const openRequisitions = allReqs.filter(r => r.status === 'Open');
        if (openRequisitions.length > 0) {
            setSelectedSourcingJobId(openRequisitions[0].id);
        }
    }, []);

    const openRequisitions = useMemo(() => requisitions.filter(r => r.status === 'Open'), [requisitions]);

    useEffect(() => {
        if (!selectedSourcingJobId && openRequisitions.length > 0) {
            setSelectedSourcingJobId(openRequisitions[0].id);
        }
    }, [openRequisitions, selectedSourcingJobId]);

    const metrics = useMemo(() => {
        const isAllJobs = selectedAnalyticsJobId === 'all';
        const relevantPipeline = isAllJobs ? pipelineData : { [selectedAnalyticsJobId]: pipelineData[selectedAnalyticsJobId] || {} };

        const hiredCandidatesInPipeline: Set<number> = new Set(
            (Object.values(relevantPipeline) as JobPipeline[]).flatMap((job) => job[PipelineStage.Hired] || [])
        );
        const offerCandidatesInPipeline: Set<number> = new Set(
             (Object.values(relevantPipeline) as JobPipeline[]).flatMap((job) => job[PipelineStage.Offer] || [])
        );

        const totalOffersMade = hiredCandidatesInPipeline.size + offerCandidatesInPipeline.size;
        const offerAcceptanceRate = totalOffersMade > 0 ? (hiredCandidatesInPipeline.size / totalOffersMade) * 100 : 0;
        
        const hiredCandidatesDetails = candidates.filter(c => hiredCandidatesInPipeline.has(c.id));
        const sourceCounts = hiredCandidatesDetails.flatMap(c => c.tags || [])
            .reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const topSource = Object.entries(sourceCounts).sort(([, countA], [, countB]) => countB - countA)[0]?.[0] || 'N/A';
        
        const randomSeed = isAllJobs ? 1 : selectedAnalyticsJobId;
        const seededRandom = (max: number, min: number) => Math.floor(Math.sin(randomSeed) * 10000 % 1 * (max - min + 1)) + min;

        return {
            avgTimeToFill: `${seededRandom(60, 30)} days`,
            avgTimeToHire: `${seededRandom(30, 15)} days`,
            offerAcceptanceRate: `${offerAcceptanceRate.toFixed(0)}%`,
            topSourceOfHire: topSource
        };
    }, [candidates, pipelineData, selectedAnalyticsJobId]);
    
    const funnelData = useMemo(() => {
        const isAllJobs = selectedAnalyticsJobId === 'all';
        const relevantPipeline = isAllJobs ? pipelineData : { [selectedAnalyticsJobId]: pipelineData[selectedAnalyticsJobId] || {} };

        const stageCounts = PIPELINE_STAGES.reduce((acc, stage) => {
            acc[stage] = (Object.values(relevantPipeline) as JobPipeline[]).reduce((sum: number, job) => sum + (job[stage]?.length || 0), 0);
            return acc;
        }, {} as Record<PipelineStage, number>);
        
        const totalApplied = stageCounts[PipelineStage.Applied] || 1;
        
        return PIPELINE_STAGES.map((stage, index) => {
            const count = stageCounts[stage];
            const prevCount = index > 0 ? stageCounts[PIPELINE_STAGES[index-1]] : count;
            const stageToStageConversion = prevCount > 0 ? (count / prevCount * 100) : 100;
            const widthPercentage = (count / totalApplied) * 100;
            return { stage, count, stageToStageConversion, widthPercentage };
        });
    }, [pipelineData, selectedAnalyticsJobId]);

    const sourceEffectiveness = useMemo(() => {
        const isAllJobs = selectedAnalyticsJobId === 'all';
        const relevantPipeline = isAllJobs ? pipelineData : { [selectedAnalyticsJobId]: pipelineData[selectedAnalyticsJobId] || {} };

        const hiredIds = new Set((Object.values(relevantPipeline) as JobPipeline[]).flatMap((p) => p[PipelineStage.Hired] || []));
        const sourceCounts = candidates
            .filter(c => hiredIds.has(c.id))
            .flatMap(c => c.tags || [TagType.Passive]) // Default to passive if no tags
            .reduce((acc: Record<string, number>, tag: string) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const totalHires = (Object.values(sourceCounts) as number[]).reduce((sum, count) => sum + count, 0);
        return (Object.entries(sourceCounts) as [string, number][]).map(([source, count]) => ({
            source,
            count,
            percentage: totalHires > 0 ? (count / totalHires) * 100 : 0
        })).sort((a,b) => b.count - a.count);
    }, [candidates, pipelineData, selectedAnalyticsJobId]);

    const handleGenerateStrategy = async () => {
        if (!selectedSourcingJobId) return;
        const selectedReq = requisitions.find(r => r.id === selectedSourcingJobId);
        if (!selectedReq) return;

        setIsLoading(true);
        setError('');
        setStrategy(null);
        try {
            const result = await generateSourcingStrategy(selectedReq);
            setStrategy(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefineStrategy = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!refiningField || !strategy || !selectedSourcingJobId || !refinementFeedback) return;
        
        const selectedReq = requisitions.find(r => r.id === selectedSourcingJobId);
        if (!selectedReq) return;

        setIsRefining(true);
        setError('');
        try {
            const refinedPart = await refineSourcingStrategy(selectedReq, strategy, refiningField, refinementFeedback);
            setStrategy(prev => prev ? { ...prev, ...refinedPart } : null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during refinement.");
        } finally {
            setIsRefining(false);
            setRefiningField(null);
            setRefinementFeedback('');
        }
    };
    
    const selectedAnalyticsJob = requisitions.find(r => r.id === selectedAnalyticsJobId);
    const analyticsTitle = selectedAnalyticsJob ? `Analytics for: ${selectedAnalyticsJob.title}` : 'Performance Analytics (All Jobs)';
    const funnelDescription = selectedAnalyticsJob ? `Candidate conversion rates for this role.` : `Candidate conversion rates across all roles.`

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Performance & Creativity</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <Card>
                        <CardHeader title={analyticsTitle} icon={<BarChartIcon />} />
                        <div className="mt-4 space-y-4">
                             <div>
                                <label htmlFor="analytics-job-select" className="block text-sm font-medium text-gray-300 mb-1">Select Analysis Scope</label>
                                <select 
                                    id="analytics-job-select" 
                                    value={selectedAnalyticsJobId} 
                                    onChange={e => setSelectedAnalyticsJobId(e.target.value === 'all' ? 'all' : Number(e.target.value))} 
                                    className="input-field"
                                >
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
                    <Card>
                        <CardHeader title="Hiring Funnel" description={funnelDescription} />
                        <div className="mt-4 space-y-2">
                             {funnelData.map(({ stage, count, stageToStageConversion, widthPercentage }, index) => (
                                <div key={stage} className="flex items-center gap-2">
                                    <div className="w-28 text-sm text-gray-300 truncate text-right">{stage}</div>
                                    <div className="flex-1 bg-gray-800 rounded-full h-6 flex items-center group">
                                        <div 
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full h-6 flex items-center justify-between px-2 transition-all duration-500" 
                                            style={{ width: `${widthPercentage}%` }}
                                        >
                                            <span className="text-sm font-bold text-white">{count}</span>
                                             {index > 0 && count > 0 && 
                                                <span className="text-xs text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {stageToStageConversion.toFixed(0)}%
                                                </span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                     <Card>
                        <CardHeader title="Source Effectiveness" description="Where your successful hires are coming from." />
                        <div className="mt-4 space-y-3">
                            {sourceEffectiveness.length > 0 ? sourceEffectiveness.map(({ source, count, percentage }) => (
                                <div key={source}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">{source}</span>
                                        <span className="font-medium text-white">{count} Hires</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-gray-500 text-center">No hired candidates for this selection.</p>}
                        </div>
                    </Card>
                </div>

                <div>
                    <Card className="sticky top-8">
                        <CardHeader title="AI Sourcing Strategist" icon={<LightbulbIcon />} description="Generate creative sourcing ideas for tough-to-fill roles."/>
                        <div className="mt-4 space-y-4">
                             <div>
                                <label htmlFor="sourcing-job-select" className="block text-sm font-medium text-gray-300 mb-1">Select Open Requisition</label>
                                <select id="sourcing-job-select" value={selectedSourcingJobId || ''} onChange={e => setSelectedSourcingJobId(Number(e.target.value))} className="input-field">
                                    {openRequisitions.length > 0 ? (
                                        openRequisitions.map(job => <option key={job.id} value={job.id}>{job.title}</option>)
                                    ) : (
                                        <option>No open requisitions</option>
                                    )}
                                </select>
                            </div>
                            <Button onClick={handleGenerateStrategy} isLoading={isLoading} disabled={!selectedSourcingJobId || isLoading} className="w-full">
                                Generate Sourcing Strategy
                            </Button>
                        </div>
                        <div className="mt-4">
                            {isLoading && <Spinner text="Brainstorming..." />}
                            {error && <p className="text-red-400 text-center p-3 bg-red-900/20 rounded-md">{error}</p>}
                            {strategy && (
                                <div className="space-y-6 animate-fade-in overflow-y-auto max-h-[60vh] pr-2">
                                    <div>
                                        <h4 className="font-semibold text-indigo-300 mb-2">Creative Keywords & Boolean</h4>
                                        {isRefining && refiningField === 'creativeKeywords' ? <Spinner size="sm" /> :
                                            <div className="space-y-2">
                                                {strategy.creativeKeywords.map((kw, i) => <code key={i} className="block text-xs bg-gray-950 p-2 rounded-md text-gray-300">{kw}</code>)}
                                            </div>
                                        }
                                        <RefineComponent field="creativeKeywords" isRefining={isRefining} refiningField={refiningField} setRefiningField={setRefiningField} refinementFeedback={refinementFeedback} setRefinementFeedback={setRefinementFeedback} handleRefineStrategy={handleRefineStrategy} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-300 mb-2">Alternative Job Titles</h4>
                                         {isRefining && refiningField === 'alternativeJobTitles' ? <Spinner size="sm" /> :
                                            <div className="flex flex-wrap gap-2">
                                                {strategy.alternativeJobTitles.map((title, i) => <span key={i} className="bg-gray-700 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">{title}</span>)}
                                            </div>
                                        }
                                        <RefineComponent field="alternativeJobTitles" isRefining={isRefining} refiningField={refiningField} setRefiningField={setRefiningField} refinementFeedback={refinementFeedback} setRefinementFeedback={setRefinementFeedback} handleRefineStrategy={handleRefineStrategy} />
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
                                    <div>
                                        <h4 className="font-semibold text-indigo-300 mb-2">Sample Outreach Message</h4>
                                         {isRefining && refiningField === 'sampleOutreachMessage' ? <Spinner size="sm" /> :
                                            <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded-md border border-gray-700">{strategy.sampleOutreachMessage}</p>
                                        }
                                        <RefineComponent field="sampleOutreachMessage" isRefining={isRefining} refiningField={refiningField} setRefiningField={setRefiningField} refinementFeedback={refinementFeedback} setRefinementFeedback={setRefinementFeedback} handleRefineStrategy={handleRefineStrategy} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
            <style>{`
                .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; padding: 0.5rem 0.75rem; } .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; } .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};