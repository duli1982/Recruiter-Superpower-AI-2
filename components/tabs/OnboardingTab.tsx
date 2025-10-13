import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { JobRequisition, Candidate, PipelineStage, OnboardingTask } from '../../types';
import { MOCK_JOB_REQUISITIONS, MOCK_CANDIDATES, MOCK_PIPELINE_DATA } from '../../constants';

const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';
const PIPELINE_STORAGE_KEY = 'recruiter-ai-pipeline';

type PipelineData = { [jobId: number]: { [stage in PipelineStage]?: number[] } };

const UserCheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>;

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

export const OnboardingTab: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [requisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [pipelineData] = useState<PipelineData>(() => getInitialData(PIPELINE_STORAGE_KEY, MOCK_PIPELINE_DATA));

    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(candidates));
    }, [candidates]);

    const hiredCandidatesMap = useMemo(() => {
        const hiredMap = new Map<number, JobRequisition>();
        requisitions.forEach(job => {
            const jobPipeline = pipelineData[job.id];
            if (jobPipeline && jobPipeline.Hired) {
                jobPipeline.Hired.forEach(candidateId => {
                    if (!hiredMap.has(candidateId)) {
                        hiredMap.set(candidateId, job);
                    }
                });
            }
        });
        return hiredMap;
    }, [pipelineData, requisitions]);

    const hiredCandidates = useMemo(() => {
        return candidates.filter(c => hiredCandidatesMap.has(c.id));
    }, [candidates, hiredCandidatesMap]);

    useEffect(() => {
        if (!selectedCandidateId && hiredCandidates.length > 0) {
            setSelectedCandidateId(hiredCandidates[0].id);
        }
    }, [hiredCandidates, selectedCandidateId]);

    const selectedCandidate = useMemo(() => {
        return candidates.find(c => c.id === selectedCandidateId);
    }, [candidates, selectedCandidateId]);

    const handleToggleTask = (taskId: string) => {
        if (!selectedCandidateId) return;
        setCandidates(prev =>
            prev.map(c => {
                if (c.id === selectedCandidateId) {
                    const updatedChecklist = c.onboardingChecklist?.map(task =>
                        task.id === taskId ? { ...task, completed: !task.completed } : task
                    );
                    return { ...c, onboardingChecklist: updatedChecklist };
                }
                return c;
            })
        );
    };

    const OnboardingChecklist: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
        const checklist = candidate.onboardingChecklist || [];
        const progress = checklist.length > 0 ? (checklist.filter(t => t.completed).length / checklist.length) * 100 : 0;
        const job = hiredCandidatesMap.get(candidate.id);

        return (
            <div>
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">{candidate.name}</h3>
                    <p className="text-sm text-indigo-400">Hired for: {job?.title || 'Unknown Role'}</p>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                         <span className="text-sm font-medium text-gray-300">Onboarding Progress</span>
                         <span className="text-sm font-bold text-white">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {checklist.map(task => (
                        <div key={task.id} className="flex items-center p-3 bg-gray-800 rounded-md border border-gray-700">
                            <input
                                type="checkbox"
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onChange={() => handleToggleTask(task.id)}
                                className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`task-${task.id}`} className={`ml-3 flex-grow ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                {task.task}
                            </label>
                            <span className="text-xs font-medium bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{task.stakeholder}</span>
                        </div>
                    ))}
                    {checklist.length === 0 && <p className="text-center text-gray-500 py-8">No onboarding tasks defined for this candidate.</p>}
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Onboarding Hub</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-11rem)]">
                {/* Hired Candidates List */}
                <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader title="New Hires" />
                    <div className="overflow-y-auto space-y-2 flex-grow -mr-4 pr-3">
                        {hiredCandidates.map(candidate => {
                             const checklist = candidate.onboardingChecklist || [];
                             const progress = checklist.length > 0 ? (checklist.filter(t => t.completed).length / checklist.length) * 100 : 0;
                            return (
                                <div key={candidate.id} onClick={() => setSelectedCandidateId(candidate.id)} className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedCandidateId === candidate.id ? 'bg-indigo-600/30 border-indigo-500' : 'bg-gray-800 hover:bg-gray-700/50 border-gray-700'}`}>
                                    <p className="font-semibold text-white truncate">{candidate.name}</p>
                                    <div className="flex justify-between items-center mt-2 text-xs">
                                        <span className="text-gray-400">Progress</span>
                                        <span className="font-semibold">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                                        <div className="bg-green-500 h-1 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                         {hiredCandidates.length === 0 && <p className="text-center text-gray-500 py-10">No candidates are currently in the onboarding process.</p>}
                    </div>
                </Card>

                {/* Checklist Details */}
                <Card className="lg:col-span-2 flex flex-col">
                    {selectedCandidate ? (
                        <OnboardingChecklist candidate={selectedCandidate} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                            <div>
                                <UserCheckIcon className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-300">Select a New Hire</h3>
                                <p>Choose a candidate from the list to view their onboarding checklist.</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
            <style>{`.form-checkbox { appearance: none; -webkit-appearance: none; background-color: #374151; border: 1px solid #4b5563; border-radius: 0.25rem; } .form-checkbox:checked { background-color: #4f46e5; border-color: #4f46e5; background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e"); background-size: 100% 100%; background-position: center; background-repeat: no-repeat; }`}</style>
        </div>
    );
};