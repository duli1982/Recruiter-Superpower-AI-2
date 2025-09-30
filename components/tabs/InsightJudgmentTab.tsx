import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { rankCandidates } from '../../services/geminiService';
import { MOCK_CANDIDATES, MOCK_JOB_DESCRIPTION } from '../../constants';
import { RankedCandidate } from '../../types';

const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;

const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
};

export const InsightJudgmentTab: React.FC = () => {
    const [jobDescription, setJobDescription] = useState(MOCK_JOB_DESCRIPTION);
    const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRankCandidates = async () => {
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
                        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
                        <textarea id="jobDescription" rows={15} value={jobDescription} onChange={e => setJobDescription(e.target.value)} className="block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-3"></textarea>
                         <Button onClick={handleRankCandidates} isLoading={isLoading} className="mt-4 w-full lg:w-auto">
                            Rank Candidates
                        </Button>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Ranked Candidates</h4>
                        <div className="h-[28rem] overflow-y-auto bg-gray-800 border-gray-600 border rounded-md p-3 space-y-3">
                            {isLoading && <Spinner text="Analyzing candidates..." />}
                            {error && <div className="text-red-400 text-center p-4">{error}</div>}
                            {!isLoading && !rankedCandidates && <div className="text-center text-gray-400 p-8">Click "Rank Candidates" to see results.</div>}
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
