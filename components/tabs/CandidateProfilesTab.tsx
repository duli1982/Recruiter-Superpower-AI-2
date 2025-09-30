import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Candidate } from '../../types';
import { MOCK_CANDIDATES } from '../../constants';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;


const STORAGE_KEY = 'recruiter-ai-candidates';

const getInitialCandidates = (): Candidate[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error("Failed to parse candidates from localStorage", error);
    }
    return MOCK_CANDIDATES;
};

const BLANK_CANDIDATE: Omit<Candidate, 'id'> = { name: '', email: '', phone: '', skills: '', resumeSummary: '' };

export const CandidateProfilesTab: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>(getInitialCandidates);
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<Omit<Candidate, 'id'> | Candidate>(BLANK_CANDIDATE);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    }, [candidates]);
    
    const selectedCandidate = useMemo(() => {
        return candidates.find(c => c.id === selectedCandidateId) || null;
    }, [selectedCandidateId, candidates]);
    
    const handleSelectCandidate = (candidate: Candidate) => {
        setSelectedCandidateId(candidate.id);
        setIsEditing(false);
    };

    const handleAddNew = () => {
        setSelectedCandidateId(null);
        setFormState(BLANK_CANDIDATE);
        setIsEditing(true);
    };
    
    const handleEdit = () => {
        if(selectedCandidate) {
            setFormState(selectedCandidate);
            setIsEditing(true);
        }
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        if (!selectedCandidateId) {
            setFormState(BLANK_CANDIDATE);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this candidate?")) {
            setCandidates(prev => prev.filter(c => c.id !== id));
            if (selectedCandidateId === id) {
                setSelectedCandidateId(null);
                setIsEditing(false);
            }
        }
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if ('id' in formState) { // Editing existing
            setCandidates(prev => prev.map(c => c.id === formState.id ? formState as Candidate : c));
        } else { // Adding new
            const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
            const newCandidate = { id: newId, ...formState as Omit<Candidate, 'id'> };
            setCandidates(prev => [...prev, newCandidate]);
            setSelectedCandidateId(newId);
        }
        setIsEditing(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Candidate Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-[75vh] flex flex-col">
                    <CardHeader title="All Candidates" />
                    <div className="flex items-center mb-4">
                        <Button onClick={handleAddNew} variant="secondary" className="w-full" icon={<PlusIcon className="h-4 w-4" />}>
                            Add New Candidate
                        </Button>
                    </div>
                    <ul className="overflow-y-auto space-y-2 pr-2 -mr-2">
                        {candidates.map(candidate => (
                            <li key={candidate.id}>
                                <button
                                    onClick={() => handleSelectCandidate(candidate)}
                                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedCandidateId === candidate.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <p className="font-semibold truncate">{candidate.name}</p>
                                    <p className={`text-sm truncate ${selectedCandidateId === candidate.id ? 'text-indigo-200' : 'text-gray-400'}`}>{candidate.email}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card className="md:col-span-2 h-[75vh] flex flex-col">
                    {!selectedCandidate && !isEditing ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-600"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
                           <h3 className="text-lg font-semibold text-gray-300">Select a candidate</h3>
                           <p>Choose a candidate from the list to view their profile, or add a new one.</p>
                        </div>
                    ) : isEditing ? (
                        <form onSubmit={handleSave} className="flex flex-col h-full">
                            <h3 className="text-lg font-bold text-white mb-4">{'id' in formState ? 'Edit Candidate' : 'Add New Candidate'}</h3>
                            <div className="overflow-y-auto space-y-4 flex-1 pr-2 -mr-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                                        <input type="text" name="name" id="name" value={formState.name} onChange={handleFormChange} className="mt-1 input-field" required />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                                        <input type="email" name="email" id="email" value={formState.email} onChange={handleFormChange} className="mt-1 input-field" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Phone</label>
                                        <input type="tel" name="phone" id="phone" value={formState.phone} onChange={handleFormChange} className="mt-1 input-field" />
                                    </div>
                                    <div>
                                        <label htmlFor="skills" className="block text-sm font-medium text-gray-300">Skills (comma-separated)</label>
                                        <input type="text" name="skills" id="skills" value={formState.skills} onChange={handleFormChange} className="mt-1 input-field" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="resumeSummary" className="block text-sm font-medium text-gray-300">Resume / Summary</label>
                                    <textarea name="resumeSummary" id="resumeSummary" rows={8} value={formState.resumeSummary} onChange={handleFormChange} className="mt-1 input-field"></textarea>
                                </div>
                            </div>
                             <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    ) : selectedCandidate ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3>
                                    <p className="text-sm text-indigo-400">{selectedCandidate.email}</p>
                                    <p className="text-sm text-gray-400">{selectedCandidate.phone}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleEdit} variant="secondary" icon={<EditIcon className="h-4 w-4"/>}>Edit</Button>
                                    {/* FIX: Added an empty string as children to satisfy the required 'children' prop for the Button component. */}
                                    <Button onClick={() => handleDelete(selectedCandidate.id)} variant="secondary" className="hover:bg-red-800/50" icon={<TrashIcon className="h-4 w-4 text-red-400"/>}>{''}</Button>
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-1 space-y-4 pr-2 -mr-2">
                                <div>
                                    <h4 className="font-semibold text-gray-300 mb-1">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCandidate.skills.split(',').map(skill => skill.trim()).filter(Boolean).map(skill => (
                                            <span key={skill} className="bg-gray-700 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-300 mb-1">Resume / Summary</h4>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded-md border border-gray-700">{selectedCandidate.resumeSummary}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </Card>
            </div>
            <style>{`
                .input-field {
                    display: block;
                    width: 100%;
                    background-color: #1f2937; /* gray-800 */
                    border: 1px solid #4b5563; /* gray-600 */
                    border-radius: 0.375rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    color: white;
                    padding: 0.5rem 0.75rem;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #6366f1; /* indigo-500 */
                    box-shadow: 0 0 0 1px #6366f1;
                }
            `}</style>
        </div>
    );
};
