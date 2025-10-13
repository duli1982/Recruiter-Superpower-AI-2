import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { JobRequisition, JobStatus, ApprovalStep, ScorecardCompetency, ViewMode } from '../../types';
import { MOCK_JOB_REQUISITIONS } from '../../constants';
import { getJobRequisitionSuggestion } from '../../services/geminiService';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05A6.5 6.5 0 0 1 8.94 9.9M9 9h.01M4.93 4.93l.01.01M2 12h.01M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v.01M19.07 4.93l-.01.01M22 12h-.01M19.07 19.07l-.01-.01M12 22v-.01" /></svg>;
const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const LockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


const STORAGE_KEY = 'recruiter-ai-requisitions';

const getInitialRequisitions = (): JobRequisition[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error("Failed to parse requisitions from localStorage", error); }
    return MOCK_JOB_REQUISITIONS;
};

const BLANK_REQUISITION: Omit<JobRequisition, 'id'> = { 
    title: '', 
    department: '', 
    status: JobStatus.PendingApproval, 
    requiredSkills: [], 
    description: '',
    applications: 0,
    hiringManager: '',
    createdAt: new Date().toISOString(),
    budget: { salaryMin: 0, salaryMax: 0, currency: 'USD', budgetCode: ''},
    approvalWorkflow: [
        { stage: 'Hiring Manager Approval', approver: 'TBD', status: 'Pending'},
        { stage: 'Finance Approval', approver: 'Alex Rivera', status: 'Pending'},
        { stage: 'VP Approval', approver: 'Jordan Lee', status: 'Pending'},
    ],
    scorecard: { competencies: [] },
};

interface JobRequisitionsTabProps {
  currentView: ViewMode;
  currentUser: string;
}

const StatusBadge = ({ status }: { status: JobStatus }) => {
    const colorClasses = {
        [JobStatus.Open]: 'bg-green-500/20 text-green-300 ring-green-500/30',
        [JobStatus.OnHold]: 'bg-yellow-500/20 text-yellow-300 ring-yellow-500/30',
        [JobStatus.Closed]: 'bg-red-500/20 text-red-300 ring-red-500/30',
        [JobStatus.PendingApproval]: 'bg-blue-500/20 text-blue-300 ring-blue-500/30',
    };
    return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${colorClasses[status]}`}>{status}</span>;
};

const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


export const JobRequisitionsTab: React.FC<JobRequisitionsTabProps> = ({ currentView, currentUser }) => {
    const [requisitions, setRequisitions] = useState<JobRequisition[]>(getInitialRequisitions);
    const [filters, setFilters] = useState({ status: 'All', department: 'All' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReq, setEditingReq] = useState<Omit<JobRequisition, 'id'> | JobRequisition | null>(null);
    const [aiSuggestion, setAiSuggestion] = useState<string>('');
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState<boolean>(false);
    const [selectedReqId, setSelectedReqId] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requisitions));
    }, [requisitions]);
    
    const selectedReq = useMemo(() => requisitions.find(r => r.id === selectedReqId), [requisitions, selectedReqId]);

    const departments = useMemo(() => ['All', ...Array.from(new Set(requisitions.map(r => r.department)))], [requisitions]);

    const filteredRequisitions = useMemo(() => {
        let reqs = requisitions.filter(req => 
            (filters.status === 'All' || req.status === filters.status) &&
            (filters.department === 'All' || req.department === filters.department)
        );

        if (currentView === 'hiringManager') {
            reqs = reqs.filter(req => req.hiringManager === currentUser);
        }

        return reqs;
    }, [requisitions, filters, currentView, currentUser]);

    // Effect to select the first item when filter/view changes
    useEffect(() => {
      if (filteredRequisitions.length > 0) {
        setSelectedReqId(filteredRequisitions[0].id);
      } else {
        setSelectedReqId(null);
      }
    }, [filteredRequisitions]);


    const handleStatusChange = async (id: number, newStatus: JobStatus) => {
        const req = requisitions.find(r => r.id === id);
        if (!req || req.status === newStatus) return;

        const previousStatus = req.status;
        setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        
        setIsLoadingSuggestion(true);
        setAiSuggestion('');
        try {
            const suggestion = await getJobRequisitionSuggestion({ ...req, status: newStatus }, previousStatus, newStatus);
            setAiSuggestion(suggestion);
        } catch (error) {
            setAiSuggestion('Could not get AI suggestion.');
        } finally {
            setIsLoadingSuggestion(false);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReq || currentView === 'hiringManager') return;

        if ('id' in editingReq) { // Editing
            setRequisitions(prev => prev.map(r => r.id === (editingReq as JobRequisition).id ? (editingReq as JobRequisition) : r));
        } else { // Creating
            const newId = requisitions.length > 0 ? Math.max(...requisitions.map(r => r.id)) + 1 : 1;
            const newReq = { 
                id: newId, 
                ...editingReq,
                createdAt: new Date().toISOString(),
                applications: 0,
                isLocked: true, // Lock requirements on creation
                initialRequiredSkills: editingReq.requiredSkills
            } as JobRequisition;
            setRequisitions(prev => [newReq, ...prev]);
            setSelectedReqId(newId);
        }
        setIsModalOpen(false);
        setEditingReq(null);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('budget.')) {
            const field = name.split('.')[1];
            setEditingReq(prev => prev ? {
                ...prev,
                budget: { ...prev.budget, [field]: field.includes('salary') ? Number(value) : value }
            } : null);
        } else {
            setEditingReq(prev => prev ? { ...prev, [name]: name === 'requiredSkills' ? value.split(',').map(s => s.trim()) : value } : null);
        }
    };
    
    const handleCompetencyChange = (index: number, field: keyof ScorecardCompetency, value: string) => {
        setEditingReq(prev => {
            if (!prev || !prev.scorecard) return prev;
            const newCompetencies = [...prev.scorecard.competencies];
            newCompetencies[index] = { ...newCompetencies[index], [field]: value };
            return { ...prev, scorecard: { ...prev.scorecard, competencies: newCompetencies }};
        });
    };

    const handleAddCompetency = () => {
        setEditingReq(prev => {
            if (!prev) return prev;
            const newCompetency: ScorecardCompetency = { id: `comp-${Date.now()}`, name: '', description: '' };
            const scorecard = prev.scorecard ? { ...prev.scorecard, competencies: [...prev.scorecard.competencies, newCompetency] } : { competencies: [newCompetency] };
            return { ...prev, scorecard };
        });
    };

    const handleRemoveCompetency = (index: number) => {
        setEditingReq(prev => {
            if (!prev || !prev.scorecard) return prev;
            const newCompetencies = prev.scorecard.competencies.filter((_, i) => i !== index);
            return { ...prev, scorecard: { ...prev.scorecard, competencies: newCompetencies }};
        });
    };

    const ApprovalStepDisplay: React.FC<{ step: ApprovalStep }> = ({ step }) => {
        const icons = {
            'Approved': <CheckCircleIcon className="h-5 w-5 text-green-400" />,
            'Pending': <ClockIcon className="h-5 w-5 text-yellow-400" />,
            'Rejected': <XCircleIcon className="h-5 w-5 text-red-400" />,
        };
        const statusColors = {
            'Approved': 'text-gray-300',
            'Pending': 'text-yellow-300 animate-pulse',
            'Rejected': 'text-red-300',
        };

        return (
            <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                    {icons[step.status]}
                    <div className="h-full w-px bg-gray-600 my-1 min-h-[2rem]"></div>
                </div>
                <div>
                    <p className={`font-semibold ${statusColors[step.status]}`}>{step.stage}</p>
                    <p className="text-sm text-gray-400">{step.approver}</p>
                    {step.timestamp && <p className="text-xs text-gray-500">{new Date(step.timestamp).toLocaleDateString()}</p>}
                </div>
            </div>
        );
    };

    const ScopeCreepAlert: React.FC<{req: JobRequisition}> = ({req}) => {
        if (!req.isLocked || !req.initialRequiredSkills) return null;

        const initialSkills = new Set(req.initialRequiredSkills);
        const currentSkills = new Set(req.requiredSkills);
        
        const added = req.requiredSkills.filter(skill => !initialSkills.has(skill));
        const removed = req.initialRequiredSkills.filter(skill => !currentSkills.has(skill));

        if (added.length === 0 && removed.length === 0) return null;

        return (
            <Card className="border-yellow-500/50 bg-yellow-900/20">
                <CardHeader title="Scope Creep Alert" icon={<AlertTriangleIcon className="text-yellow-400" />} />
                <div className="mt-2 text-sm space-y-3">
                    <p className="text-yellow-200">The required skills for this role have changed since it was approved.</p>
                    {added.length > 0 && <div>
                        <h5 className="font-semibold text-green-300">Skills Added:</h5>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {added.map(s => <span key={s} className="bg-green-500/20 text-green-200 text-xs font-medium px-2 py-1 rounded-full">{s}</span>)}
                        </div>
                    </div>}
                     {removed.length > 0 && <div>
                        <h5 className="font-semibold text-red-300">Skills Removed:</h5>
                         <div className="flex flex-wrap gap-2 mt-1">
                            {removed.map(s => <span key={s} className="bg-red-500/20 text-red-200 text-xs font-medium px-2 py-1 rounded-full line-through">{s}</span>)}
                        </div>
                    </div>}
                </div>
            </Card>
        );
    }

    return (
        <div className="h-[calc(100vh-11rem)]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Manage Requisitions</h2>
                {currentView === 'recruiter' && <Button onClick={() => { setEditingReq(BLANK_REQUISITION); setIsModalOpen(true); }} icon={<PlusIcon />}>Create</Button>}
            </div>
            {(aiSuggestion || isLoadingSuggestion) && (
                <Card className="mb-4 bg-indigo-900/50 border-indigo-700">
                     <div className="flex items-start gap-3">
                        <LightbulbIcon className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-indigo-300">AI Suggestion</h4>
                            {isLoadingSuggestion ? <Spinner size="sm" /> : <p className="text-sm text-indigo-200 mt-1">{aiSuggestion}</p>}
                        </div>
                    </div>
                </Card>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <Card className="lg:col-span-1 flex flex-col h-full">
                    <CardHeader title="Requisition List" />
                     <div className="flex gap-2 mb-4">
                        <select onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="input-field-sm select-custom-arrow flex-1">
                            <option value="All">All Statuses</option>
                            {Object.values(JobStatus).map(s => <option key={s}>{s}</option>)}
                        </select>
                        <select onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} className="input-field-sm select-custom-arrow flex-1">
                            {departments.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="overflow-y-auto space-y-2 flex-grow -mr-4 pr-3">
                        {filteredRequisitions.map(req => {
                            const daysOpen = getDaysSince(req.createdAt);
                            const isStale = daysOpen > 60 && req.status === 'Open';
                            return (
                                <div key={req.id} onClick={() => setSelectedReqId(req.id)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedReqId === req.id ? 'bg-indigo-600/30 border-indigo-500' : 'bg-gray-800 hover:bg-gray-700/50 border-gray-700'} border`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {req.isLocked && <span title="Requirements Locked"><LockIcon className="h-3 w-3 text-gray-400 flex-shrink-0" /></span>}
                                            <p className="font-semibold text-white truncate pr-2">{req.title}</p>
                                        </div>
                                        <StatusBadge status={req.status} />
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-xs">
                                        <p className="text-gray-400">{req.department}</p>
                                        <div className={`flex items-center gap-1 ${isStale ? 'text-yellow-400' : 'text-gray-500'}`}>
                                            {isStale && <AlertTriangleIcon className="h-3 w-3"/>}
                                            <span>{daysOpen} days old</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
                <Card className="lg:col-span-2 flex flex-col h-full">
                    {selectedReq ? (
                         <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedReq.title}</h3>
                                    <p className="text-sm text-indigo-400">{selectedReq.department}</p>
                                </div>
                                {currentView === 'recruiter' && <Button onClick={() => { setEditingReq(selectedReq); setIsModalOpen(true); }} variant="secondary" icon={<EditIcon className="h-4 w-4"/>}>Edit</Button>}
                            </div>
                            <div className="overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 -mr-4 pr-3">
                                <div className="md:col-span-2 space-y-4">
                                    <ScopeCreepAlert req={selectedReq} />
                                    <div>
                                        <h4 className="font-semibold text-gray-300 mb-1">Description</h4>
                                        <p className="text-sm text-gray-400 whitespace-pre-wrap">{selectedReq.description}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-300 mb-1">Required Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedReq.requiredSkills.map(s => <span key={s} className="bg-gray-700 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">{s}</span>)}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-300 mb-1">Interview Scorecard</h4>
                                        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 space-y-2">
                                            {(selectedReq.scorecard?.competencies || []).length > 0 ? (
                                                selectedReq.scorecard?.competencies.map(c => (
                                                    <div key={c.id}>
                                                        <p className="font-semibold text-sm text-gray-200">{c.name}</p>
                                                        <p className="text-xs text-gray-400">{c.description}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No scorecard defined.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <h4 className="font-semibold text-gray-300 mb-2">Approval Workflow</h4>
                                    <div className="relative">
                                        {selectedReq.approvalWorkflow.map((step, index) => (
                                            <div key={index} className={index === selectedReq.approvalWorkflow.length -1 ? 'pb-0' : 'pb-2'}>
                                                <ApprovalStepDisplay step={step} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                            <p>Select a requisition to see details.</p>
                        </div>
                    )}
                </Card>
            </div>
            {isModalOpen && editingReq && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <form onSubmit={handleSave} className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-white mb-4">{'id' in editingReq ? 'Edit Requisition' : 'Create Requisition'}</h3>
                             <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-3 -mr-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="label">Job Title</label><input type="text" name="title" value={editingReq.title} onChange={handleFormChange} className="input-field" required/></div>
                                    <div><label className="label">Department</label><input type="text" name="department" value={editingReq.department} onChange={handleFormChange} className="input-field" required/></div>
                                </div>
                                <div><label className="label">Hiring Manager</label><input type="text" name="hiringManager" value={editingReq.hiringManager} onChange={handleFormChange} className="input-field" required/></div>
                                <div><label className="label">Required Skills (comma-separated)</label><input type="text" name="requiredSkills" value={Array.isArray(editingReq.requiredSkills) ? editingReq.requiredSkills.join(', ') : ''} onChange={handleFormChange} className="input-field" /></div>
                                <div><label className="label">Description</label><textarea name="description" rows={4} value={editingReq.description} onChange={handleFormChange} className="input-field"></textarea></div>
                                
                                <div className="border-t border-gray-700 pt-4">
                                    <h4 className="text-md font-semibold text-gray-200 mb-2">Scorecard Builder</h4>
                                    <div className="space-y-3">
                                        {editingReq.scorecard?.competencies.map((comp, index) => (
                                            <div key={comp.id} className="grid grid-cols-1 gap-2 p-3 bg-gray-800 rounded-md border border-gray-700">
                                                <div className="flex justify-between items-center">
                                                    <label className="label">Competency #{index + 1}</label>
                                                    <button type="button" onClick={() => handleRemoveCompetency(index)} className="text-red-400 hover:text-red-300">
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <input type="text" placeholder="Competency Name (e.g., Teamwork)" value={comp.name} onChange={e => handleCompetencyChange(index, 'name', e.target.value)} className="input-field-sm" />
                                                <textarea placeholder="Description of what you're looking for..." value={comp.description} onChange={e => handleCompetencyChange(index, 'description', e.target.value)} rows={2} className="input-field-sm"></textarea>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="secondary" onClick={handleAddCompetency} icon={<PlusIcon className="h-4 w-4"/>} className="mt-3">Add Competency</Button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-800/50 rounded-b-lg flex justify-end gap-3">
                           <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                           <Button type="submit">Save Requisition</Button>
                       </div>
                    </form>
                </div>
            )}
            <style>{`
                .label { display: block; text-transform: uppercase; font-size: 0.75rem; font-weight: 500; color: #9ca3af; margin-bottom: 0.25rem;}
                .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; }
                .input-field { padding: 0.5rem 0.75rem; }
                .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; }
                .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }
                .select-custom-arrow {
                    -webkit-appearance: none; -moz-appearance: none; appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem;
                }
                 /* Custom scrollbar for content areas */
                .overflow-y-auto::-webkit-scrollbar { width: 6px; }
                .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
                .overflow-y-auto::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>
        </div>
    );
};