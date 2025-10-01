import React, { useState, useEffect, useMemo } from 'react';
import { JobRequisition, Candidate, PipelineStage } from '../../types';
import { MOCK_JOB_REQUISITIONS, MOCK_CANDIDATES, PIPELINE_STAGES, MOCK_PIPELINE_DATA } from '../../constants';

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

const CandidateCard: React.FC<{ candidate: Candidate; onDragStart: (e: React.DragEvent<HTMLDivElement>, candidateId: number) => void }> = ({ candidate, onDragStart }) => {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, candidate.id)}
            className="bg-gray-800 p-3 rounded-md border border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-700/50 transition-colors"
        >
            <p className="font-semibold text-sm text-white truncate">{candidate.name}</p>
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
    isDragOver: boolean;
}> = ({ stage, candidateIds, allCandidates, onDragStart, onDrop, onDragOver, isDragOver }) => {
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
                    <CandidateCard key={candidate.id} candidate={candidate} onDragStart={onDragStart} />
                ))}
            </div>
        </div>
    );
};

export const CandidatePipelineTab: React.FC = () => {
    const [allCandidates] = useState<Candidate[]>(() => getInitialData(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES));
    const [allRequisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS));
    const [pipelineData, setPipelineData] = useState<PipelineData>(() => getInitialData(PIPELINE_STORAGE_KEY, MOCK_PIPELINE_DATA));
    
    const openRequisitions = useMemo(() => allRequisitions.filter(r => r.status === 'Open'), [allRequisitions]);
    const [selectedJobId, setSelectedJobId] = useState<number | undefined>(openRequisitions[0]?.id);

    const [draggedItem, setDraggedItem] = useState<{ candidateId: number, sourceStage: PipelineStage } | null>(null);
    const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

    useEffect(() => {
        localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(pipelineData));
    }, [pipelineData]);

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