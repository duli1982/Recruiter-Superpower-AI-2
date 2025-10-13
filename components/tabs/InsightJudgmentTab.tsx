import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
// FIX: Correct import path for geminiService
import { rankCandidates } from '../../services/geminiService';
import { MOCK_CANDIDATES, MOCK_JOB_REQUISITIONS } from '../../constants';
// FIX: Correct import path for types
import { RankedCandidate, JobRequisition } from '../../types';

const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;

const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
};

const STORAGE_KEY = 'recruiter-ai-requisitions';

const getInitialRequisitions = (): JobRequisition[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Failed to parse requisitions from localStorage", error);
    }
    return MOCK_JOB_REQUISITIONS;
};


export const InsightJudgmentTab: React.FC = () => {
    const [jobRequisitions] = useState<JobRequisition[]>(getInitialRequisitions);
    const [requisitionFilter, setRequisitionFilter] = useState('');
    const [selectedJobId, setSelectedJobId] = useState<number | undefined>(jobRequisitions[0]?.id);
    const [jobDescription, setJobDescription] = useState(jobRequisitions[0]?.description || '');
    const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const filteredRequisitions = useMemo(() => {
        if (!requisitionFilter) {
            return jobRequisitions;
        }
        const lowercasedFilter = requisitionFilter.toLowerCase();
        return jobRequisitions.filter(job =>
            job.title.toLowerCase().includes(lowercasedFilter) ||
            job.department.toLowerCase().includes(lowercasedFilter)
        );
    }, [jobRequisitions, requisitionFilter]);
    
    useEffect(() => {
        const isSelectedJobInFilteredList = filteredRequisitions.some(job => job.id === selectedJobId);

        if (!isSelectedJobInFilteredList && filteredRequisitions.length > 0) {
            // If current selection is filtered out, select the first available one
            const newSelectedJob = filteredRequisitions[0];
            setSelectedJobId(newSelectedJob.id);
            setJobDescription(newSelectedJob.description);
            setRankedCandidates(null);
        } else if (filteredRequisitions.length === 0) {
            // If filter returns no results, clear everything
            setSelectedJobId(undefined);
            setJobDescription('');
            setRankedCandidates(null);
        }
    }, [filteredRequisitions, selectedJobId]);


    const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newJobId = parseInt(e.target.value, 10);
        const selectedJob = jobRequisitions.find(job => job.id === newJobId);
        if (selectedJob) {
            setSelectedJobId(selectedJob.id);
            setJobDescription(selectedJob.description);
            setRankedCandidates(null); // Clear results when job changes
        }
    };

    const handleRankCandidates = async () => {
        if (!jobDescription) return;
        setIsLoading(true);
        setError('');
        setRankedCandidates(null);
        try {
            const result = await rankCandidates(jobDescription, MOCK_CANDIDATES);
            result.sort((a, b) => a.rank - b.rank); // Ensure sorted by rank
            setRankedCandidates(result);
        } catch (err) {
            setError('Failed to rank candidates. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Insight & Judgment</h2>
            <Card>
                <CardHeader title="Matchmaking Oracle" description="Get an AI-powered ranking of candidates based on your job description, going beyond simple keywords." icon={<TargetIcon />}/>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    <div>
                        <div className="mb-4">
                            <label htmlFor="jobFilter" className="block text-sm font-medium text-gray-300 mb-1">Filter Requisitions</label>
                             <input
                                type="text"
                                id="jobFilter"
                                placeholder="Search by title or department..."
                                value={requisitionFilter}
                                onChange={e => setRequisitionFilter(e.target.value)}
                                className="block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-3"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="jobSelect" className="block text-sm font-medium text-gray-300 mb-1">Select Job Requisition ({filteredRequisitions.length})</label>
                            <select
                                id="jobSelect"
                                value={selectedJobId || ''}
                                onChange={handleJobChange}
                                disabled={filteredRequisitions.length === 0}
                                className="block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {filteredRequisitions.length > 0 ? (
                                    filteredRequisitions.map(job => (
                                        <option key={job.id} value={job.id}>
                                            {job.title}
                                        </option>
                                    ))
                                ) : (
                                    <option>No requisitions found</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
                            <textarea id="jobDescription" rows={10} value={jobDescription} onChange={e => setJobDescription(e.target.value)} className="block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-3"></textarea>
                        </div>
                         <Button onClick={handleRankCandidates} isLoading={isLoading} className="mt-4 w-full lg:w-auto" disabled={!jobDescription || isLoading}>
                            Rank Candidates
                        </Button>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Ranked Candidates</h4>
                        <div className="h-[28rem] overflow-y-auto bg-gray-800 border-gray-600 border rounded-md p-3 space-y-3">
                            {isLoading && <Spinner text="Analyzing candidates..." />}
                            {error && <div className="text-red-400 text-center p-4">{error}</div>}
                            {!isLoading && !rankedCandidates && (
                                <div className="text-center text-gray-400 p-8">
                                    {jobRequisitions.length > 0 
                                        ? 'Select a job and click "Rank Candidates" to see results.'
                                        : 'Please add a job requisition in the "Job Requisitions" tab first.'
                                    }
                                </div>
                            )}
                            {rankedCandidates?.map((candidate) => (
                                <div key={candidate.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white">{candidate.rank}. {candidate.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-bold ${getScoreColor(candidate.matchScore)}`}>{candidate.matchScore}</p>
                                            <p className="text-xs text-gray-400">Match Score</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-sm text-gray-300 space-y-2">
                                        <p><strong className="text-gray-400">Reasoning:</strong> {candidate.reasoning}</p>
                                        <p><strong className="text-gray-400">Culture Fit:</strong> {candidate.cultureFit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
