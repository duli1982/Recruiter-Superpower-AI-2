import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Candidate, TagType } from '../../types';
import { MOCK_CANDIDATES } from '../../constants';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const BookmarkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;

const STORAGE_KEY = 'recruiter-ai-candidates';
const SAVED_SEARCHES_KEY = 'recruiter-ai-saved-searches';

interface Filters {
    searchQuery: string;
    skills: string;
    location: string;
    minExperience: number;
    maxExperience: number;
    tag: string;
}

interface SavedSearch {
    name: string;
    filters: Filters;
}

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

const BLANK_FILTERS: Filters = { searchQuery: '', skills: '', location: '', minExperience: 0, maxExperience: 20, tag: 'All' };
const BLANK_CANDIDATE: Omit<Candidate, 'id'> = { name: '', email: '', phone: '', skills: '', resumeSummary: '', experience: 0, location: '', salaryExpectation: 0, availability: 'Immediate', tags: [] };

export const CandidateProfilesTab: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>(() => getInitialData(STORAGE_KEY, MOCK_CANDIDATES));
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<Omit<Candidate, 'id'> | Candidate>(BLANK_CANDIDATE);
    const [filters, setFilters] = useState<Filters>(BLANK_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => getInitialData(SAVED_SEARCHES_KEY, []));

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    }, [candidates]);

    useEffect(() => {
        localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
    }, [savedSearches]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const query = filters.searchQuery.toLowerCase();
            const searchMatch = query === '' ||
                c.name.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query) ||
                c.skills.toLowerCase().includes(query) ||
                (c.tags && c.tags.join(' ').toLowerCase().includes(query)) ||
                c.resumeSummary.toLowerCase().includes(query);

            const skillsList = filters.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
            const skillsMatch = skillsList.length === 0 || skillsList.every(skill => c.skills.toLowerCase().includes(skill));
            const locationMatch = filters.location === '' || c.location?.toLowerCase().includes(filters.location.toLowerCase());
            const expMatch = (c.experience ?? 0) >= filters.minExperience && (c.experience ?? 0) <= filters.maxExperience;
            const tagMatch = filters.tag === 'All' || c.tags?.includes(filters.tag);
            
            return searchMatch && skillsMatch && locationMatch && expMatch && tagMatch;
        });
    }, [candidates, filters]);
    
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
        if (selectedCandidate) {
            setSelectedCandidateId(selectedCandidate.id);
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
        const emailToCheck = (formState as Candidate).email.toLowerCase();
        
        if ('id' in formState) { // Editing existing
            setCandidates(prev => prev.map(c => c.id === formState.id ? formState as Candidate : c));
        } else { // Adding new
            const isDuplicate = candidates.some(c => c.email.toLowerCase() === emailToCheck);
            if (isDuplicate) {
                if (!window.confirm('A candidate with this email already exists. Add anyway?')) return;
            }
            const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
            const newCandidate = { id: newId, ...formState as Omit<Candidate, 'id'> };
            setCandidates(prev => [...prev, newCandidate]);
            setSelectedCandidateId(newId);
        }
        setIsEditing(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'tags') {
            setFormState(prev => ({ ...prev, [name]: value.split(',').map(t => t.trim()) }));
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: name.includes('Experience') ? parseInt(value, 10) : value }));
    };
    
    const handleSaveSearch = () => {
        const name = prompt("Enter a name for this talent pool:");
        if (name) {
            setSavedSearches(prev => [...prev, { name, filters }]);
        }
    };
    
    const handleApplySearch = (search: SavedSearch) => {
        setFilters(search.filters);
        setShowFilters(true);
    };

    const handleDeleteSearch = (name: string) => {
        setSavedSearches(prev => prev.filter(s => s.name !== name));
    };

// FIX: Defined a `TagPillProps` interface and used `React.FC` to correctly type the `TagPill` component's props, resolving an issue where React's `key` prop caused a type mismatch.
    interface TagPillProps {
        tag: string;
    }

    const TagPill: React.FC<TagPillProps> = ({ tag }) => {
        const colors: { [key: string]: string } = {
            [TagType.Internal]: 'bg-blue-500/20 text-blue-300',
            [TagType.Passive]: 'bg-purple-500/20 text-purple-300',
            [TagType.Referral]: 'bg-teal-500/20 text-teal-300',
            [TagType.HighPriority]: 'bg-yellow-500/20 text-yellow-300',
            [TagType.DoNotContact]: 'bg-red-500/20 text-red-300',
        };
        const colorClass = colors[tag] || 'bg-gray-700 text-gray-300';
        return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colorClass}`}>{tag}</span>
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Candidate Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-[80vh] flex flex-col">
                    <CardHeader title="Talent Pool" />
                    <div className="flex items-center mb-2 gap-2">
                        <input type="text" name="searchQuery" placeholder="Search name, skills, tags..." value={filters.searchQuery} onChange={handleFilterChange} className="input-field-sm flex-grow"/>
                        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} icon={<FilterIcon className="h-4 w-4"/>}>{''}</Button>
                    </div>
                    {showFilters && (
                        <div className="p-3 bg-gray-800 rounded-md mb-3 space-y-3">
                            <h4 className="text-sm font-semibold">Advanced Filters</h4>
                            <div>
                                <label className="text-xs text-gray-400">Skills (comma-separated)</label>
                                <input type="text" name="skills" placeholder="e.g. react, node" value={filters.skills} onChange={handleFilterChange} className="input-field-sm mt-1"/>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Location</label>
                                <input type="text" name="location" placeholder="e.g. remote, ny" value={filters.location} onChange={handleFilterChange} className="input-field-sm mt-1"/>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Tag</label>
                                <select name="tag" value={filters.tag} onChange={handleFilterChange} className="input-field-sm mt-1">
                                    <option>All</option>
                                    {Object.values(TagType).map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-xs text-gray-400">Experience (Years: {filters.minExperience}-{filters.maxExperience})</label>
                                <input type="range" name="maxExperience" min="0" max="20" value={filters.maxExperience} onChange={handleFilterChange} className="w-full mt-1"/>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => setFilters(BLANK_FILTERS)} variant="secondary" className="text-xs flex-grow">Reset</Button>
                                <Button onClick={handleSaveSearch} variant="secondary" icon={<BookmarkIcon className="h-4 w-4"/>} className="text-xs">Save</Button>
                            </div>
                        </div>
                    )}
                    {savedSearches.length > 0 && (
                        <div className="mb-3">
                             <h4 className="text-sm font-semibold mb-2">Saved Talent Pools</h4>
                             <div className="flex flex-wrap gap-2">
                                {savedSearches.map(s => (
                                    <div key={s.name} className="flex items-center gap-1 bg-gray-700 rounded-full pl-3 pr-1 py-1 text-xs">
                                        <button onClick={() => handleApplySearch(s)} className="hover:text-indigo-300">{s.name}</button>
                                        <button onClick={() => handleDeleteSearch(s.name)} className="text-gray-400 hover:text-white"> &times;</button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-400">{filteredCandidates.length} of {candidates.length} candidates</span>
                        <Button onClick={handleAddNew} variant="secondary" className="!px-2 !py-1 text-xs" icon={<PlusIcon className="h-4 w-4" />}>
                            Add New
                        </Button>
                    </div>
                    <ul className="overflow-y-auto space-y-2 flex-grow">
                        {filteredCandidates.map(candidate => (
                            <li key={candidate.id}>
                                <button
                                    onClick={() => handleSelectCandidate(candidate)}
                                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedCandidateId === candidate.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <p className="font-semibold truncate">{candidate.name}</p>
                                    <p className={`text-sm truncate ${selectedCandidateId === candidate.id ? 'text-indigo-200' : 'text-gray-400'}`}>{candidate.skills}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card className="md:col-span-2 h-[80vh] flex flex-col">
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
                                    <div><label className="label">Full Name</label><input type="text" name="name" value={formState.name} onChange={handleFormChange} className="input-field" required /></div>
                                    <div><label className="label">Email</label><input type="email" name="email" value={formState.email} onChange={handleFormChange} className="input-field" required /></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="label">Phone</label><input type="tel" name="phone" value={formState.phone} onChange={handleFormChange} className="input-field" /></div>
                                    <div><label className="label">Location</label><input type="text" name="location" value={formState.location || ''} onChange={handleFormChange} className="input-field" /></div>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="label">Experience (Years)</label><input type="number" name="experience" value={formState.experience || 0} onChange={handleFormChange} className="input-field" /></div>
                                    <div><label className="label">Availability</label><input type="text" name="availability" value={formState.availability || ''} onChange={handleFormChange} className="input-field" /></div>
                                </div>
                                <div><label className="label">Skills (comma-separated)</label><input type="text" name="skills" value={formState.skills} onChange={handleFormChange} className="input-field" /></div>
                                <div><label className="label">Tags (comma-separated)</label><input type="text" name="tags" value={formState.tags?.join(', ') || ''} onChange={handleFormChange} className="input-field" /></div>
                                <div><label className="label">Resume / Summary</label><textarea name="resumeSummary" rows={8} value={formState.resumeSummary} onChange={handleFormChange} className="input-field"></textarea></div>
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
                                    <Button onClick={() => handleDelete(selectedCandidate.id)} variant="secondary" className="hover:bg-red-800/50" icon={<TrashIcon className="h-4 w-4 text-red-400"/>}>{''}</Button>
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-1 space-y-4 pr-2 -mr-2">
                                <div className="grid grid-cols-3 gap-4 text-sm text-center">
                                    <div><p className="text-gray-400">Experience</p><p>{selectedCandidate.experience ?? 'N/A'} yrs</p></div>
                                    <div><p className="text-gray-400">Location</p><p>{selectedCandidate.location || 'N/A'}</p></div>
                                    <div><p className="text-gray-400">Availability</p><p>{selectedCandidate.availability || 'N/A'}</p></div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-300 mb-1">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCandidate.tags?.length ? selectedCandidate.tags.map(tag => <TagPill key={tag} tag={tag} />) : <p className="text-sm text-gray-500">No tags.</p>}
                                    </div>
                                </div>
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
                .label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; margin-bottom: 0.25rem;}
                .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; }
                .input-field { padding: 0.5rem 0.75rem; }
                .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; }
                .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }
                /* Custom scrollbar for candidate list */
                .overflow-y-auto::-webkit-scrollbar { width: 6px; }
                .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
                .overflow-y-auto::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>
        </div>
    );
};