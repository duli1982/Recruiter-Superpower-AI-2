import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { auditJobDescription } from '../../services/geminiService';
import { MOCK_BIASED_JOB_DESCRIPTION, MOCK_JOB_REQUISITIONS } from '../../constants';
import { BiasAuditReport, JobRequisition } from '../../types';

const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;

const getScoreColorRing = (score: number) => {
    if (score >= 85) return 'ring-green-500';
    if (score >= 60) return 'ring-yellow-500';
    return 'ring-red-500';
};
const getScoreColorText = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
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


export const DiversityEthicsTab: React.FC = () => {
    const [jobRequisitions] = useState<JobRequisition[]>(getInitialRequisitions);
    const [selectedJobId, setSelectedJobId] = useState<number | undefined>(jobRequisitions[0]?.id);
    const [jobDescription, setJobDescription] = useState(jobRequisitions[0]?.description || MOCK_BIASED_JOB_DESCRIPTION);
    const [auditReport, setAuditReport] = useState<BiasAuditReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newJobId = parseInt(e.target.value, 10);
        const selectedJob = jobRequisitions.find(job => job.id === newJobId);
        if (selectedJob) {
            setSelectedJobId(selectedJob.id);
            setJobDescription(selectedJob.description);
            setAuditReport(null); // Clear results when job changes
        }
    };

    const handleAudit = async () => {
        setIsLoading(true);
        setError('');
        setAuditReport(null);
        try {
            const result = await auditJobDescription(jobDescription);
            setAuditReport(result);
        } catch (err) {
            setError('Failed to audit job description. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplySuggestion = (original: string, suggestion: string) => {
        setJobDescription(currentJD => currentJD.replace(original, suggestion));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Diversity & Ethics</h2>
            <Card>
                <CardHeader title="Bias Auditor Engine" description="Scan job descriptions for exclusionary or biased language and get inclusive alternatives." icon={<ShieldCheckIcon />}/>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    <div>
                        <div className="mb-4">
                            <label htmlFor="jobSelect" className="block text-sm font-medium text-gray-300 mb-1">Select Job Requisition</label>
                            <select
                                id="jobSelect"
                                value={selectedJobId || ''}
                                onChange={handleJobChange}
                                disabled={jobRequisitions.length === 0}
                                className="block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {jobRequisitions.length > 0 ? (
                                    jobRequisitions.map(job => (
                                        <option key={job.id} value={job.id}>
                                            {job.title}
                                        </option>
                                    ))
                                ) : (
                                    <option>No job requisitions found</option>
                                )}
                            </select>
                        </div>
                        <label htmlFor="jdInput" className="block text-sm font-medium text-gray-300 mb-1">Job Description to Audit</label>
                        <textarea id="jdInput" rows={12} value={jobDescription} onChange={e => setJobDescription(e.target.value)} className="block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-3"></textarea>
                        <Button onClick={handleAudit} isLoading={isLoading} className="mt-4 w-full lg:w-auto" disabled={!jobDescription || isLoading}>
                            Audit for Bias
                        </Button>
                    </div>
                    <div className="h-[28rem] overflow-y-auto">
                        <h4 className="text-sm font-medium text-gray-300 mb-1 sticky top-0 bg-gray-900 py-2">Audit Report</h4>
                        {isLoading && <Spinner text="Auditing..." />}
                        {error && <div className="text-red-400 text-center p-4">{error}</div>}
                        {!isLoading && !auditReport && 
                            <div className="text-center text-gray-400 p-8">
                                {jobRequisitions.length > 0
                                    ? 'Select a job and click "Audit for Bias" to see the report.'
                                    : 'Please add a job requisition in the "Job Requisitions" tab first.'
                                }
                            </div>
                        }
                        {auditReport && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                                    <div className={`relative h-20 w-20 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-900 ring-4 ${getScoreColorRing(auditReport.overallScore)}`}>
                                        <span className={`text-3xl font-bold ${getScoreColorText(auditReport.overallScore)}`}>{auditReport.overallScore}</span>
                                        <span className="absolute bottom-2 text-xs text-gray-400">/ 100</span>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-white">Inclusivity Score</h5>
                                        <p className="text-sm text-gray-300">{auditReport.summary}</p>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-white mb-2">Suggestions for Improvement</h5>
                                    <div className="space-y-3">
                                        {auditReport.suggestions.map((item, index) => (
                                            <div key={index} className="bg-gray-800 p-3 rounded-md border border-gray-700">
                                                <p className="text-sm text-red-400 line-through">"{item.originalText}"</p>
                                                <p className="text-sm text-green-400 mt-1">"{item.suggestion}"</p>
                                                <p className="text-xs text-gray-400 mt-2">{item.explanation}</p>
                                                <div className="mt-3 text-right">
                                                    <Button variant="secondary" className="!text-xs !py-1 !px-2" onClick={() => handleApplySuggestion(item.originalText, item.suggestion)}>
                                                        Apply Suggestion
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};