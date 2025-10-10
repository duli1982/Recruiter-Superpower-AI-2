import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { JobRequisition, JobStatus } from '../../types';
import { MOCK_JOB_REQUISITIONS } from '../../constants';
import { getJobRequisitionSuggestion } from '../../services/geminiService';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05A6.5 6.5 0 0 1 8.94 9.9M9 9h.01M4.93 4.93l.01.01M2 12h.01M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v.01M19.07 4.93l-.01.01M22 12h-.01M19.07 19.07l-.01-.01M12 22v-.01" /></svg>;

const STORAGE_KEY = 'recruiter-ai-requisitions';

const getInitialRequisitions = (): JobRequisition[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error("Failed to parse requisitions from localStorage", error); }
    return MOCK_JOB_REQUISITIONS;
};

const BLANK_REQUISITION: Omit<JobRequisition, 'id'> = { title: '', department: '', status: JobStatus.Open, requiredSkills: [], description: '', applications: 0 };

const StatusBadge = ({ status }: { status: JobStatus }) => {
    const colorClasses = {
        [JobStatus.Open]: 'bg-green-500/20 text-green-300 ring-green-500/30',
        [JobStatus.OnHold]: 'bg-yellow-500/20 text-yellow-300 ring-yellow-500/30',
        [JobStatus.Closed]: 'bg-red-500/20 text-red-300 ring-red-500/30',
    };
    return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${colorClasses[status]}`}>{status}</span>;
};

export const JobRequisitionsTab: React.FC = () => {
    const [requisitions, setRequisitions] = useState<JobRequisition[]>(getInitialRequisitions);
    const [filters, setFilters] = useState({ status: 'All', department: 'All' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReq, setEditingReq] = useState<Omit<JobRequisition, 'id'> | JobRequisition | null>(null);
    const [aiSuggestion, setAiSuggestion] = useState<string>('');
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState<boolean>(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requisitions));
    }, [requisitions]);

    const departments = useMemo(() => ['All', ...Array.from(new Set(requisitions.map(r => r.department)))], [requisitions]);

    const filteredRequisitions = useMemo(() => {
        return requisitions.filter(req => 
            (filters.status === 'All' || req.status === filters.status) &&
            (filters.department === 'All' || req.department === filters.department)
        );
    }, [requisitions, filters]);

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
        if (!editingReq) return;

        if ('id' in editingReq) { // Editing
            setRequisitions(prev => prev.map(r => r.id === (editingReq as JobRequisition).id ? (editingReq as JobRequisition) : r));
        } else { // Creating
            const newId = requisitions.length > 0 ? Math.max(...requisitions.map(r => r.id)) + 1 : 1;
            setRequisitions(prev => [...prev, { id: newId, ...(editingReq as Omit<JobRequisition, 'id'>) }]);
        }
        setIsModalOpen(false);
        setEditingReq(null);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditingReq(prev => prev ? { ...prev, [name]: name === 'requiredSkills' ? value.split(',').map(s => s.trim()) : value } : null);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Manage Requisitions</h2>

            {(aiSuggestion || isLoadingSuggestion) && (
                <Card className="mb-6 bg-indigo-900/50 border-indigo-700">
                    <div className="flex items-start gap-3">
                        <LightbulbIcon className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-indigo-300">AI Suggestion</h4>
                            {isLoadingSuggestion && <Spinner size="sm" text="Generating insight..." />}
                            {aiSuggestion && <p className="text-sm text-indigo-200 mt-1">{aiSuggestion}</p>}
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <div className="flex flex-wrap gap-4 items-center mb-4">
                        <div className="flex">
                            <div>
                                <label htmlFor="statusFilter" className="text-xs text-gray-400">Status</label>
                                <select id="statusFilter" onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="input-field-sm mt-1 select-custom-arrow rounded-r-none">
                                    <option>All</option>
                                    {Object.values(JobStatus).map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="deptFilter" className="text-xs text-gray-400">Department</label>
                                <select id="deptFilter" onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} className="input-field-sm mt-1 select-custom-arrow rounded-l-none -ml-px">
                                    {departments.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="ml-auto">
                           <Button onClick={() => { setEditingReq(BLANK_REQUISITION); setIsModalOpen(true); }} icon={<PlusIcon />}>Create</Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                           {/* ... table content ... */}
                           <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-3">Role</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Skills</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredRequisitions.map(req => (
                                    <tr key={req.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-3">
                                            <div className="font-medium text-white">{req.title}</div>
                                            <div className="text-gray-400">{req.department}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <select value={req.status} onChange={e => handleStatusChange(req.id, e.target.value as JobStatus)} className="input-field-sm bg-gray-900 border-gray-600 select-custom-arrow">
                                                {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-300">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {req.requiredSkills.slice(0, 3).map(s => <span key={s} className="bg-gray-700 text-indigo-300 text-xs font-medium px-2 py-0.5 rounded-full">{s}</span>)}
                                            </div>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                                            <button onClick={() => { setEditingReq(req); setIsModalOpen(true); }} className="text-indigo-400 hover:text-indigo-300"><EditIcon className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card>
                    <CardHeader title="Job Metrics"/>
                     <p className="text-sm text-gray-400 mb-4">Total applications per open role.</p>
                     <div className="space-y-3">
                        {requisitions.filter(r => r.status === JobStatus.Open).map(req => (
                            <div key={req.id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">{req.title}</span>
                                    <span className="font-medium text-white">{req.applications}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(req.applications / Math.max(...requisitions.map(r => r.applications)))*100}%`}}></div>
                                </div>
                            </div>
                        ))}
                     </div>
                </Card>
            </div>
            {isModalOpen && editingReq && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
                    <form onSubmit={handleSave} className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white">{'id' in editingReq ? 'Edit Requisition' : 'Create Requisition'}</h3>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Job Title</label>
                            <input type="text" name="title" value={editingReq.title} onChange={handleFormChange} className="mt-1 input-field" required/>
                        </div>
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-300">Department</label>
                            <input type="text" name="department" value={editingReq.department} onChange={handleFormChange} className="mt-1 input-field" required/>
                        </div>
                         <div>
                            <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-300">Required Skills (comma-separated)</label>
                            <input type="text" name="requiredSkills" value={Array.isArray(editingReq.requiredSkills) ? editingReq.requiredSkills.join(', ') : ''} onChange={handleFormChange} className="mt-1 input-field" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                            <textarea name="description" rows={4} value={editingReq.description} onChange={handleFormChange} className="mt-1 input-field"></textarea>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end gap-3">
                           <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                           <Button type="submit">Save Requisition</Button>
                       </div>
                    </form>
                </div>
            )}
            <style>{`
                .input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; padding: 0.5rem 0.75rem; }
                .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }
                .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; color: white; padding: 0.25rem 0.5rem; font-size: 0.875rem; }
                .select-custom-arrow {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-right: 2.5rem;
                }
            `}</style>
        </div>
    );
};