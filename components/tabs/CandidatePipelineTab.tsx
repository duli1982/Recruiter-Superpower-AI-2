import React, { useState, useEffect, useMemo } from 'react';
// FIX: Correct import path for types
import { JobRequisition, Candidate, PipelineStage, OnboardingTask } from '../../types';
// FIX: Correct import path for constants
import { MOCK_JOB_REQUISITIONS, MOCK_CANDIDATES, PIPELINE_STAGES, MOCK_PIPELINE_DATA } from '../../constants';
import { Card } from '../ui/Card';

const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';
const PIPELINE_STORAGE_KEY = 'recruiter-ai-pipeline';

type PipelineData = { [jobId: number]: { [stage in PipelineStage]?: number[] } };

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const FireIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const CheckSquareIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;


const OnboardingChecklistModal: React.FC<{ 
    candidate: Candidate; 
    onClose: () => void; 
    onUpdate: (updatedChecklist: OnboardingTask[]) => void;
}> = ({ candidate, onClose, onUpdate }) => {
    const [checklist, setChecklist] = useState(candidate.onboardingChecklist || []);

    const handleToggle = (taskId: string) => {
        const updated = checklist.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setChecklist(updated);
        onUpdate(updated);
    };

    const progress = checklist.length > 0 ? (checklist.filter(t => t.completed).length / checklist.length) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg text-white">Onboarding for {candidate.name}</h3>
                <p className="text-sm text-gray-400 mb-4">Tracking cross-functional handoff tasks.</p>

                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {checklist.map(task => (
                        <div key={task.id} className="flex items-center p-3 bg-gray-800 rounded-md">
                            <input
                                type="checkbox"
                                id={`task-${task.id}`}
                                checked={task.completed}
                                onChange={() => handleToggle(task.id)}
                                className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`task-${task.id}`} className={`ml-3 flex-grow ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                {task.task}
                            </label>
                            <span className="text-xs font-medium bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{task.stakeholder}</span>
                        </div>
                    ))}
                </div>
                 <div className="mt-6 text-right">
                    <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">Close</button>
                </div>
            </Card>
        </div>
    );
};


const CandidateCard: React.FC<{ 
    candidate: Candidate; 
    stage: PipelineStage;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, candidateId: number) => void;
    onClick: (candidate: Candidate) => void;
}> = ({ candidate, stage, onDragStart, onClick }) => {
    const daysSinceContact = candidate.lastContactDate ? Math.floor((new Date().getTime() - new Date(candidate.lastContactDate).getTime()) / (1000 * 3600 * 24)) : 0;
    const isAging = daysSinceContact > 14;
    const isHired = stage === PipelineStage.Hired;

    return (
        <div
            draggable={!isHired}
            onDragStart={(e) => onDragStart(e, candidate.id)}
            onClick={() => isHired && onClick(candidate)}
            className={`bg-gray-800 p-3 rounded-md border border-gray-700 shadow-sm hover:bg-gray-700/50 transition-colors ${isHired ? 'cursor-pointer border-green-500/50' : 'cursor-grab active:cursor-grabbing'}`}
        >
            <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-white truncate">{candidate.name}</p>
                 <div className="flex items-center gap-2">
                    {isHired && <CheckSquareIcon className="h-4 w-4 text-green-400" />}
                    {isAging && <span title={`${daysSinceContact} days since last contact`}><ClockIcon className="h-4 w-4 text-yellow-400 flex-shrink-0" /></span>}
                    {candidate.hasCompetingOffer && <span title="Has competing offer!"><FireIcon className="h-4 w-4 text-red-500 flex-shrink-0" /></span>}
                </div>
            </div>
            <p className="text-xs text-gray-400 truncate">{candidate.skills.split(',')[0]}</p>
        </div>
    );
};

const PipelineColumn: React.FC<{
    stage: PipelineStage;
    candidateIds: number[];
    allCandidates: Candidate[];
    onDragStart: (e: React.DragEvent<HTMLDivElement>, candidateId: number) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, stage: PipelineStage) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onCardClick: (candidate: Candidate) => void;
    isDragOver: boolean;
}> = ({ stage, candidateIds, allCandidates, onDragStart, onDrop, onDragOver, onCardClick, isDragOver }) => {
    const candidates = useMemo(() => 
        candidateIds.map(id => allCandidates.find(c => c.id === id)).filter((c): c is Candidate => !!c),
        [candidateIds, allCandidates]
    );

    return (
        <div
            onDrop={(e) => onDrop(e, stage)}
            onDragOver={onDragOver}
            className={`w-64 flex-shrink-0 bg-gray-900/80 rounded-lg p-3 transition-colors ${isDragOver ? 'bg-indigo-900/50' : ''}`}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm text-gray-300 uppercase tracking-wider">{stage}</h3>
                <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded-full">{candidates.length}</span>
            </div>
            <div className="space-y-3 h-full overflow-y-auto">
                {candidates.map(candidate => (
                    <CandidateCard key={candidate.id} candidate={candidate} stage={stage} onDragStart={onDragStart} onClick={onCardClick} />
                ))}
            </div>
        </div>
    );
};

export const CandidatePipelineTab: React.FC = () => {
    const [allCandidates, setAllCandidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [allRequisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [pipelineData, setPipelineData] = useState<PipelineData>(() => getInitialData(PIPELINE_STORAGE_KEY, MOCK_PIPELINE_DATA));
    
    const openRequisitions = useMemo(() => allRequisitions.filter(r => r.status === 'Open' || r.status === 'Closed'), [allRequisitions]);
    const [selectedJobId, setSelectedJobId] = useState<number | undefined>(openRequisitions.find(r => r.status === 'Open')?.id);

    const [draggedItem, setDraggedItem] = useState<{ candidateId: number, sourceStage: PipelineStage } | null>(null);
    const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
    const [showChecklistFor, setShowChecklistFor] = useState<Candidate | null>(null);


    useEffect(() => {
        localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(pipelineData));
        localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(allCandidates));
    }, [pipelineData, allCandidates]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, candidateId: number) => {
        if (!selectedJobId) return;
        const jobPipeline = pipelineData[selectedJobId] || {};
        // FIX: Cast Object.entries to the correct type to resolve type inference issue with `ids`.
        const sourceStage = (Object.entries(jobPipeline) as [PipelineStage, number[] | undefined][]).find(([, ids]) => ids?.includes(candidateId))?.[0] as PipelineStage;
        if (sourceStage) {
            setDraggedItem({ candidateId, sourceStage });
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: PipelineStage) => {
        e.preventDefault();
        setDragOverStage(stage);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStage: PipelineStage) => {
        e.preventDefault();
        if (!draggedItem || !selectedJobId || draggedItem.sourceStage === targetStage) {
            setDragOverStage(null);
            return;
        }

        const { candidateId, sourceStage } = draggedItem;
        
        setPipelineData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const jobPipeline = newData[selectedJobId] || {};
            
            // Remove from source
            const sourceIds = jobPipeline[sourceStage]?.filter((id: number) => id !== candidateId) || [];
            jobPipeline[sourceStage] = sourceIds;
            
            // Add to target
            const targetIds = jobPipeline[targetStage] || [];
            if (!targetIds.includes(candidateId)) {
                jobPipeline[targetStage] = [...targetIds, candidateId];
            }

            newData[selectedJobId] = jobPipeline;
            return newData;
        });
        
        setDraggedItem(null);
        setDragOverStage(null);
    };

    const handleUpdateChecklist = (candidateId: number, updatedChecklist: OnboardingTask[]) => {
        setAllCandidates(prev => 
            prev.map(c => c.id === candidateId ? { ...c, onboardingChecklist: updatedChecklist } : c)
        );
        // Also update the candidate in the modal
        setShowChecklistFor(prev => prev ? { ...prev, onboardingChecklist: updatedChecklist } : null);
    };

    const currentPipeline = selectedJobId ? pipelineData[selectedJobId] || {} : {};

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Candidate Pipeline</h2>
                <div>
                    <label htmlFor="jobSelect" className="text-sm font-medium text-gray-300 mr-2">Job Requisition:</label>
                    <select
                        id="jobSelect"
                        value={selectedJobId || ''}
                        onChange={e => setSelectedJobId(Number(e.target.value))}
                        className="bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white p-2"
                    >
                        {openRequisitions.map(job => (
                            <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedJobId ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {PIPELINE_STAGES.map(stage => (
                        <PipelineColumn
                            key={stage}
                            stage={stage}
                            candidateIds={currentPipeline[stage] || []}
                            allCandidates={allCandidates}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onDragOver={(e) => handleDragOver(e, stage)}
                            onCardClick={(candidate) => setShowChecklistFor(candidate)}
                            isDragOver={dragOverStage === stage}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-900/50 rounded-lg">
                    <p className="text-gray-400">Please select an open job requisition to view the pipeline.</p>
                </div>
            )}

            {showChecklistFor && (
                <OnboardingChecklistModal 
                    candidate={showChecklistFor}
                    onClose={() => setShowChecklistFor(null)}
                    onUpdate={(updatedChecklist) => handleUpdateChecklist(showChecklistFor.id, updatedChecklist)}
                />
            )}
             <style>{`.form-checkbox { appearance: none; -webkit-appearance: none; background-color: #374151; border: 1px solid #4b5563; border-radius: 0.25rem; } .form-checkbox:checked { background-color: #4f46e5; border-color: #4f46e5; background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e"); background-size: 100% 100%; background-position: center; background-repeat: no-repeat; }`}</style>
        </div>
    );
};