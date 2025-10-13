import React, { useState, useEffect, useMemo } from 'react';
import { JobRequisition, Candidate, PipelineStage, OnboardingTask, ViewMode } from '../../types';
import { MOCK_JOB_REQUISITIONS, MOCK_CANDIDATES, PIPELINE_STAGES, MOCK_PIPELINE_DATA } from '../../constants';
import { Card } from '../ui/Card';

const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';
const PIPELINE_STORAGE_KEY = 'recruiter-ai-pipeline';

type PipelineData = { [jobId: number]: { [stage in PipelineStage]?: number[] } };

interface CandidatePipelineTabProps {
  currentView: ViewMode;
  currentUser: string;
}

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

const CandidateCard: React.FC<{ 
    candidate: Candidate; 
    stage: PipelineStage;
    isDraggable: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, candidateId: number) => void;
}> = ({ candidate, stage, onDragStart, isDraggable }) => {
    const daysSinceContact = candidate.lastContactDate ? Math.floor((new Date().getTime() - new Date(candidate.lastContactDate).getTime()) / (1000 * 3600 * 24)) : 0;
    const isAging = daysSinceContact > 14;
    const isHired = stage === PipelineStage.Hired;

    const cursorClass = isHired ? 'cursor-default' : isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default';

    return (
        <div
            draggable={isDraggable && !isHired}
            onDragStart={(e) => onDragStart(e, candidate.id)}
            title={isHired ? 'Manage this new hire in the Onboarding tab' : candidate.name}
            className={`bg-gray-800 p-3 rounded-md border border-gray-700 shadow-sm hover:bg-gray-700/50 transition-colors ${cursorClass} ${isHired ? 'border-green-500/50 opacity-80' : ''}`}
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
    isDraggable: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, candidateId: number) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, stage: PipelineStage) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    isDragOver: boolean;
}> = ({ stage, candidateIds, allCandidates, onDragStart, onDrop, onDragOver, isDragOver, isDraggable }) => {
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
                    <CandidateCard key={candidate.id} candidate={candidate} stage={stage} onDragStart={onDragStart} isDraggable={isDraggable} />
                ))}
            </div>
        </div>
    );
};

export const CandidatePipelineTab: React.FC<CandidatePipelineTabProps> = ({ currentView, currentUser }) => {
    const [allCandidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [allRequisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [pipelineData, setPipelineData] = useState<PipelineData>(() => getInitialData(PIPELINE_STORAGE_KEY, MOCK_PIPELINE_DATA));
    
    const openRequisitions = useMemo(() => {
        let reqs = allRequisitions.filter(r => r.status === 'Open' || r.status === 'Closed');
        if (currentView === 'hiringManager') {
            reqs = reqs.filter(r => r.hiringManager === currentUser);
        }
        return reqs;
    }, [allRequisitions, currentView, currentUser]);

    const [selectedJobId, setSelectedJobId] = useState<number | undefined>(openRequisitions[0]?.id);

    const [draggedItem, setDraggedItem] = useState<{ candidateId: number, sourceStage: PipelineStage } | null>(null);
    const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
    
    useEffect(() => {
        if (!selectedJobId && openRequisitions.length > 0) {
            setSelectedJobId(openRequisitions[0].id);
        }
    }, [openRequisitions, selectedJobId]);

    useEffect(() => {
        localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(pipelineData));
    }, [pipelineData]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, candidateId: number) => {
        if (!selectedJobId || currentView === 'hiringManager') return;
        const jobPipeline = pipelineData[selectedJobId] || {};
        const sourceStage = (Object.entries(jobPipeline) as [PipelineStage, number[] | undefined][]).find(([, ids]) => ids?.includes(candidateId))?.[0] as PipelineStage;
        if (sourceStage) {
            setDraggedItem({ candidateId, sourceStage });
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stage: PipelineStage) => {
        if (currentView === 'hiringManager') return;
        e.preventDefault();
        setDragOverStage(stage);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStage: PipelineStage) => {
        if (currentView === 'hiringManager') return;
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
                            isDraggable={currentView === 'recruiter'}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onDragOver={(e) => handleDragOver(e, stage)}
                            isDragOver={dragOverStage === stage}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-900/50 rounded-lg">
                    <p className="text-gray-400">Please select an open job requisition to view the pipeline.</p>
                </div>
            )}
        </div>
    );
};