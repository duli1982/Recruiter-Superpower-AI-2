import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
// FIX: Correct import path for types
import { Candidate, TagType, AIGroupAnalysisReport, CandidateStatus, ApplicationHistory, RelationshipStatus, CandidateCRM, Touchpoint, TouchpointType, NurtureCadence, NurtureContentType } from '../../types';
import { MOCK_CANDIDATES } from '../../constants';
// FIX: Correct import path for geminiService
import { analyzeCandidateGroup, getCRMSuggestion } from '../../services/geminiService';
import { Spinner } from '../ui/Spinner';

// Icons
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const BookmarkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L8 8l-5 2 5 2 2 5 2-5 5-2-5-2-2-5zM18 13l-1.5 3-3 1.5 3 1.5 1.5 3 1.5-3 3-1.5-3-1.5-1.5-3z"/></svg>;
const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
// FIX: Added the missing UsersIcon component definition to resolve the "Cannot find name" error.
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

const STORAGE_KEY = 'recruiter-ai-candidates';
const SAVED_SEARCHES_KEY = 'recruiter-ai-saved-searches';

interface Filters {
    searchQuery: string;
    skills: string;
    location: string;
    minExperience: number;
    maxExperience: number;
    tag: string;
    status: string;
    source: string;
    visaStatus: string;
    relationshipStatus: RelationshipStatus | 'All';
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

const BLANK_FILTERS: Filters = { searchQuery: '', skills: '', location: '', minExperience: 0, maxExperience: 20, tag: 'All', status: 'All', source: '', visaStatus: '', relationshipStatus: 'All' };
const BLANK_CRM: CandidateCRM = { relationshipStatus: 'Cold', relationshipScore: 10, touchpointHistory: [], nurtureSettings: { autoNurture: false, cadence: 'Monthly', contentType: 'New Roles' }, communitySettings: { newsletter: false, eventInvites: false }};
const BLANK_CANDIDATE: Omit<Candidate, 'id'> = { name: '', email: '', phone: '', skills: '', resumeSummary: '', experience: 0, location: '', availability: 'Immediate', tags: [], status: CandidateStatus.Passive, lastContactDate: '', source: '', compensation: { currentSalary: 0, salaryExpectation: 0, negotiationNotes: ''}, visaStatus: '', applicationHistory: [], crm: BLANK_CRM };

export const CandidateProfilesTab: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>(() => getInitialData(STORAGE_KEY, MOCK_CANDIDATES));
    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<Omit<Candidate, 'id'> | Candidate>(BLANK_CANDIDATE);
    const [filters, setFilters] = useState<Filters>(BLANK_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => getInitialData(SAVED_SEARCHES_KEY, []));
    const [activeDetailTab, setActiveDetailTab] = useState<'profile' | 'crm'>('profile');

    // Multi-select and AI summary state
    const [multiSelectIds, setMultiSelectIds] = useState<Set<number>>(new Set());
    const [targetJobTitle, setTargetJobTitle] = useState('Senior Frontend Engineer');
    const [summaryReport, setSummaryReport] = useState<AIGroupAnalysisReport | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    // CRM state
    const [crmSuggestion, setCrmSuggestion] = useState<{suggestion: string, nextStep: string} | null>(null);
    const [isGeneratingCrmSuggestion, setIsGeneratingCrmSuggestion] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    }, [candidates]);

    useEffect(() => {
        localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
    }, [savedSearches]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const query = filters.searchQuery.toLowerCase();
            const searchMatch = query === '' || c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query) || c.skills.toLowerCase().includes(query) || (c.tags && c.tags.join(' ').toLowerCase().includes(query)) || c.resumeSummary.toLowerCase().includes(query);
            const skillsList = filters.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
            const skillsMatch = skillsList.length === 0 || skillsList.every(skill => c.skills.toLowerCase().includes(skill));
            const locationMatch = filters.location === '' || c.location?.toLowerCase().includes(filters.location.toLowerCase());
            const expMatch = (c.experience ?? 0) >= filters.minExperience && (c.experience ?? 0) <= filters.maxExperience;
            const tagMatch = filters.tag === 'All' || c.tags?.includes(filters.tag);
            const statusMatch = filters.status === 'All' || c.status === filters.status;
            const sourceMatch = filters.source === '' || c.source?.toLowerCase().includes(filters.source.toLowerCase());
            const visaMatch = filters.visaStatus === '' || c.visaStatus?.toLowerCase().includes(filters.visaStatus.toLowerCase());
            const crmStatusMatch = filters.relationshipStatus === 'All' || c.crm?.relationshipStatus === filters.relationshipStatus;
            
            return searchMatch && skillsMatch && locationMatch && expMatch && tagMatch && statusMatch && sourceMatch && visaMatch && crmStatusMatch;
        });
    }, [candidates, filters]);
    
    const selectedCandidate = useMemo(() => candidates.find(c => c.id === selectedCandidateId) || null, [selectedCandidateId, candidates]);
    
    const handleSelectCandidate = (candidate: Candidate) => {
        setSelectedCandidateId(candidate.id);
        setIsEditing(false);
        setActiveDetailTab('profile');
        setCrmSuggestion(null);
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
        if (selectedCandidate) setSelectedCandidateId(selectedCandidate.id);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure?")) {
            setCandidates(prev => prev.filter(c => c.id !== id));
            if (selectedCandidateId === id) setSelectedCandidateId(null);
        }
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const emailToCheck = (formState as Candidate).email.toLowerCase();
        if ('id' in formState) {
            setCandidates(prev => prev.map(c => c.id === formState.id ? formState as Candidate : c));
        } else {
            const isDuplicate = candidates.some(c => c.email.toLowerCase() === emailToCheck);
            if (isDuplicate && !window.confirm('Email exists. Add anyway?')) return;
            const newId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;
            const newCandidate = { id: newId, ...formState as Omit<Candidate, 'id'> };
            setCandidates(prev => [...prev, newCandidate]);
            setSelectedCandidateId(newId);
        }
        setIsEditing(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
    
        setFormState(prev => {
            const keys = name.split('.');
            if (keys.length === 1) {
                return { ...prev, [name]: type === 'number' ? (value ? Number(value) : undefined) : value };
            }
            
            // Handle nested state
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] = current[keys[i]] || {};
            }
            current[keys[keys.length - 1]] = isCheckbox ? checked : value;
            return newState;
        });
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: name.includes('Experience') ? parseInt(value, 10) : value }));
    };
    
    const handleSaveSearch = () => {
        const name = prompt("Enter a name for this talent pool:");
        if (name) setSavedSearches(prev => [...prev, { name, filters }]);
    };
    
    const handleApplySearch = (search: SavedSearch) => {
        setFilters(search.filters);
        setShowFilters(true);
    };

    const handleDeleteSearch = (name: string) => setSavedSearches(prev => prev.filter(s => s.name !== name));

    const handleMultiSelectToggle = (candidateId: number) => {
        setMultiSelectIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(candidateId)) newSet.delete(candidateId);
            else newSet.add(candidateId);
            return newSet;
        });
    };

    const handleGenerateSummary = async () => {
        if (multiSelectIds.size === 0) return;
        const selectedForSummary = candidates.filter(c => multiSelectIds.has(c.id));
        setIsGeneratingSummary(true);
        setSummaryError('');
        setSummaryReport(null);
        try {
            const report = await analyzeCandidateGroup(selectedForSummary, targetJobTitle);
            setSummaryReport(report);
        } catch (error) {
            setSummaryError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleGetCrmSuggestion = async () => {
        if (!selectedCandidate) return;
        setIsGeneratingCrmSuggestion(true);
        setCrmSuggestion(null);
        try {
            const suggestion = await getCRMSuggestion(selectedCandidate);
            setCrmSuggestion(suggestion);
        } catch(e) {
            alert('Failed to get AI suggestion.');
        } finally {
            setIsGeneratingCrmSuggestion(false);
        }
    };

    const StatusBadge: React.FC<{ status: CandidateStatus }> = ({ status }) => {
        const colors = { [CandidateStatus.Active]: 'bg-green-500/20 text-green-300', [CandidateStatus.Passive]: 'bg-blue-500/20 text-blue-300', [CandidateStatus.Interviewing]: 'bg-purple-500/20 text-purple-300', [CandidateStatus.Hired]: 'bg-teal-500/20 text-teal-300', [CandidateStatus.DoNotContact]: 'bg-red-500/20 text-red-300' };
        return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[status] || 'bg-gray-700 text-gray-300'}`}>{status}</span>;
    };

    const RelationshipStatusBadge: React.FC<{ status: RelationshipStatus }> = ({ status }) => {
        const colors: Record<RelationshipStatus, string> = { 'Hot': 'bg-red-500/20 text-red-300', 'Warm': 'bg-yellow-500/20 text-yellow-300', 'Cold': 'bg-blue-500/20 text-blue-300', 'Silver Medalist': 'bg-teal-500/20 text-teal-300', 'Past Candidate': 'bg-gray-600/20 text-gray-300' };
        return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[status]}`}>{status}</span>;
    };

    const ApplicationHistoryItem: React.FC<{ item: ApplicationHistory }> = ({ item }) => {
        const outcomeColors = { 'Hired': 'text-green-400', 'In Progress': 'text-blue-400', 'Rejected': 'text-red-400', 'Withdrew': 'text-yellow-400' };
        return (
            <div className="flex gap-4">
                <div className="flex flex-col items-center"><div className="w-3 h-3 bg-gray-500 rounded-full"></div><div className="w-px h-full bg-gray-700"></div></div>
                <div>
                    <p className="font-semibold text-gray-200">{item.jobTitle}</p>
                    <p className="text-sm text-gray-400">Applied: {new Date(item.dateApplied).toLocaleDateString()}</p>
                    <p className={`text-sm font-medium ${outcomeColors[item.outcome]}`}>Outcome: {item.outcome} <span className="text-gray-400 font-normal">(Stage: {item.stageReached})</span></p>
                </div>
            </div>
        );
    };

    const TagPill: React.FC<{ tag: string }> = ({ tag }) => {
        const colors: { [key: string]: string } = { [TagType.Internal]: 'bg-blue-500/20 text-blue-300', [TagType.Passive]: 'bg-purple-500/20 text-purple-300', [TagType.Referral]: 'bg-teal-500/20 text-teal-300', [TagType.HighPriority]: 'bg-yellow-500/20 text-yellow-300' };
        return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[tag] || 'bg-gray-700 text-gray-300'}`}>{tag}</span>
    };

    const getScoreColor = (score: number) => score >= 85 ? 'text-green-400' : score >= 70 ? 'text-yellow-400' : 'text-red-400';

    const renderProfileDetails = (candidate: Candidate) => (
         <div className="overflow-y-auto flex-1 space-y-4 pr-2 -mr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><p className="text-gray-400">Experience</p><p>{candidate.experience ?? 'N/A'} yrs</p></div>
                <div><p className="text-gray-400">Location</p><p>{candidate.location || 'N/A'}</p></div>
                <div><p className="text-gray-400">Source</p><p>{candidate.source || 'N/A'}</p></div>
                <div><p className="text-gray-400">Visa Status</p><p>{candidate.visaStatus || 'N/A'}</p></div>
                <div><p className="text-gray-400">Last Contact</p><p>{candidate.lastContactDate ? new Date(candidate.lastContactDate).toLocaleDateString() : 'N/A'}</p></div>
            </div>
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2"><DollarSignIcon className="h-4 w-4 text-gray-400"/> Compensation</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-400">Current Salary</p><p>${(candidate.compensation?.currentSalary || 0).toLocaleString()}</p></div>
                    <div><p className="text-gray-400">Expected Salary</p><p>${(candidate.compensation?.salaryExpectation || 0).toLocaleString()}</p></div>
                </div>
                {candidate.compensation?.negotiationNotes && <div className="mt-2"><p className="text-gray-400 text-sm">Notes</p><p className="text-sm italic text-gray-300">"{candidate.compensation.negotiationNotes}"</p></div>}
            </div>
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2"><BriefcaseIcon className="h-4 w-4 text-gray-400"/> Application History</h4>
                {candidate.applicationHistory?.length ? <div className="space-y-3 relative">{candidate.applicationHistory.map((item, index) => <ApplicationHistoryItem key={index} item={item} />)}</div> : <p className="text-sm text-gray-500">No application history.</p>}
            </div>
            <div>
                <h4 className="font-semibold text-gray-300 mb-1">Skills & Tags</h4>
                <div className="flex flex-wrap gap-2">{candidate.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => <span key={skill} className="bg-gray-700 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>)}{candidate.tags?.map(tag => <TagPill key={tag} tag={tag} />)}</div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-300 mb-1">Resume / Summary</h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 p-3 rounded-md border border-gray-700">{candidate.resumeSummary}</p>
            </div>
        </div>
    );
    
    const renderCrmDetails = (candidate: Candidate) => {
        const crm = candidate.crm || BLANK_CRM;
        const daysSinceContact = candidate.lastContactDate ? Math.floor((new Date().getTime() - new Date(candidate.lastContactDate).getTime()) / (1000 * 3600 * 24)) : null;
        const isAging = daysSinceContact !== null && daysSinceContact > 14;
        const touchpointIcons: Record<TouchpointType, React.ReactNode> = { 'Email': <MessageCircleIcon className="h-4 w-4"/>, 'Call': <PhoneIcon className="h-4 w-4"/>, 'Meeting': <UsersIcon className="h-4 w-4"/>, 'Note': <EditIcon className="h-4 w-4"/> };
        return(
            <div className="overflow-y-auto flex-1 space-y-6 pr-2 -mr-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-800 rounded-lg"><p className="label">Relationship Status</p><RelationshipStatusBadge status={crm.relationshipStatus}/></div>
                    <div className="p-3 bg-gray-800 rounded-lg"><p className="label">Next Follow-up</p><p className="text-sm font-semibold">{crm.nextFollowUpDate ? new Date(crm.nextFollowUpDate).toLocaleDateString() : 'Not Set'}</p></div>
                    <div className="p-3 bg-gray-800 rounded-lg"><p className="label">Relationship Score</p><p className={`text-sm font-semibold ${getScoreColor(crm.relationshipScore)}`}>{crm.relationshipScore}/100</p></div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-gray-300 mb-2">Relationship Health</h4>
                    {isAging ? (
                        <div className="flex items-center gap-3 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-md">
                            <AlertTriangleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-yellow-300">Candidate is going cold!</p>
                                <p className="text-sm text-yellow-400">Last contact was {daysSinceContact} days ago. It's time to re-engage.</p>
                            </div>
                        </div>
                    ) : (
                         <p className="text-sm text-gray-400">Relationship is warm. Last contact was {daysSinceContact} days ago.</p>
                    )}
                </div>

                <Card className="bg-gray-950 border-indigo-700/50">
                    <CardHeader title="AI Nurture Assistant" icon={<SparklesIcon />} description="Get smart suggestions for your next move."/>
                    <Button onClick={handleGetCrmSuggestion} isLoading={isGeneratingCrmSuggestion} className="w-full">{isAging ? 'Suggest Re-engagement' : 'Suggest Next Step'}</Button>
                    {isGeneratingCrmSuggestion && <Spinner text="Thinking..."/>}
                    {crmSuggestion && <div className="mt-4 p-3 bg-indigo-900/40 rounded-lg text-sm text-indigo-200">{crmSuggestion.suggestion}</div>}
                </Card>
                <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Touchpoint History</h4>
                    <div className="space-y-4">
                        {crm.touchpointHistory.length > 0 ? crm.touchpointHistory.map(tp => (
                            <div key={tp.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-400">{touchpointIcons[tp.type]}</div>
                                <div>
                                    <p className="text-sm text-gray-400">{new Date(tp.date).toLocaleString()} &bull; {tp.author}</p>
                                    <p className="text-sm text-gray-200">{tp.notes}</p>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-4">No touchpoints logged.</p>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Candidate Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-[80vh] flex flex-col">
                    <CardHeader title="Talent Pool" />
                    <div className="flex items-center mb-2 gap-2">
                        <input type="text" name="searchQuery" placeholder="Search..." value={filters.searchQuery} onChange={handleFilterChange} className="input-field-sm flex-grow"/>
                        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} icon={<FilterIcon className="h-4 w-4"/>}>{''}</Button>
                    </div>
                    {showFilters && (
                        <div className="p-3 bg-gray-800 rounded-md mb-3 space-y-3">
                            <h4 className="text-sm font-semibold">Advanced Filters</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="label">Status</label><select name="status" value={filters.status} onChange={handleFilterChange} className="input-field-sm mt-1"><option>All</option>{Object.values(CandidateStatus).map(s => <option key={s}>{s}</option>)}</select></div>
                                <div><label className="label">CRM Status</label><select name="relationshipStatus" value={filters.relationshipStatus} onChange={handleFilterChange} className="input-field-sm mt-1"><option>All</option>{['Cold', 'Warm', 'Hot', 'Past Candidate', 'Silver Medalist'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            </div>
                            <div className="flex gap-2"><Button onClick={() => setFilters(BLANK_FILTERS)} variant="secondary" className="text-xs flex-grow">Reset</Button><Button onClick={handleSaveSearch} variant="secondary" icon={<BookmarkIcon className="h-4 w-4"/>} className="text-xs">Save</Button></div>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4"><span className="text-sm text-gray-400">{filteredCandidates.length} of {candidates.length}</span><Button onClick={handleAddNew} variant="secondary" className="!px-2 !py-1 text-xs" icon={<PlusIcon className="h-4 w-4" />}>Add New</Button></div>
                    <ul className="overflow-y-auto space-y-2 flex-grow">
                        {filteredCandidates.map(c => (
                             <li key={c.id}><div className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${selectedCandidateId === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700/50'}`}>
                                <input type="checkbox" checked={multiSelectIds.has(c.id)} onChange={() => handleMultiSelectToggle(c.id)} className="form-checkbox" />
                                <div className="flex-grow cursor-pointer" onClick={() => handleSelectCandidate(c)}>
                                    <div className="flex items-center justify-between"><p className="font-semibold truncate">{c.name}</p>{c.crm && <RelationshipStatusBadge status={c.crm.relationshipStatus} />}</div>
                                    <p className={`text-sm truncate ${selectedCandidateId === c.id ? 'text-indigo-200' : 'text-gray-400'}`}>{c.skills}</p>
                                </div>
                            </div></li>
                        ))}
                    </ul>
                </Card>
                <Card className="md:col-span-2 h-[80vh] flex flex-col">
                    {!selectedCandidate && !isEditing ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-600"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
                           <h3 className="text-lg font-semibold text-gray-300">Select a candidate</h3><p>Choose a candidate from the list to view their profile, or add a new one.</p>
                        </div>
                    ) : isEditing ? (
                        <form onSubmit={handleSave} className="flex flex-col h-full">
                            <h3 className="text-lg font-bold text-white mb-4">{'id' in formState ? 'Edit' : 'Add New'} Candidate</h3>
                            <div className="overflow-y-auto space-y-4 flex-1 pr-2 -mr-2">
                                <details open><summary className="font-semibold cursor-pointer">Profile Info</summary><div className="space-y-4 mt-2 p-2 border-l border-gray-700">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="label">Full Name</label><input type="text" name="name" value={formState.name} onChange={handleFormChange} className="input-field" required /></div>
                                        <div><label className="label">Email</label><input type="email" name="email" value={formState.email} onChange={handleFormChange} className="input-field" required /></div>
                                    </div>
                                    {/* Other profile fields here */}
                                </div></details>
                                <details><summary className="font-semibold cursor-pointer">CRM Info</summary><div className="space-y-4 mt-2 p-2 border-l border-gray-700">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="label">Relationship Status</label><select name="crm.relationshipStatus" value={formState.crm?.relationshipStatus} onChange={handleFormChange} className="input-field">{['Cold', 'Warm', 'Hot', 'Past Candidate', 'Silver Medalist'].map(s => <option key={s}>{s}</option>)}</select></div>
                                        <div><label className="label">Next Follow-up Date</label><input type="date" name="crm.nextFollowUpDate" value={formState.crm?.nextFollowUpDate?.split('T')[0] || ''} onChange={handleFormChange} className="input-field" /></div>
                                    </div>
                                    <div className="p-2 border border-gray-700 rounded">
                                        <label className="label">Nurture Settings</label>
                                        <div className="flex items-center"><input type="checkbox" name="crm.nurtureSettings.autoNurture" checked={formState.crm?.nurtureSettings?.autoNurture} onChange={handleFormChange} className="form-checkbox mr-2"/><label>Enable Auto-Nurture</label></div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div><label className="label">Cadence</label><select name="crm.nurtureSettings.cadence" value={formState.crm?.nurtureSettings?.cadence} onChange={handleFormChange} className="input-field">{['Monthly', 'Quarterly', 'Bi-annual'].map(s => <option key={s}>{s}</option>)}</select></div>
                                            <div><label className="label">Content Type</label><select name="crm.nurtureSettings.contentType" value={formState.crm?.nurtureSettings?.contentType} onChange={handleFormChange} className="input-field">{['Company News', 'Industry Insights', 'Career Tips', 'New Roles'].map(s => <option key={s}>{s}</option>)}</select></div>
                                        </div>
                                    </div>
                                </div></details>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button><Button type="submit">Save Changes</Button></div>
                        </form>
                    ) : selectedCandidate ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-3"><h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3><StatusBadge status={selectedCandidate.status} /></div>
                                    <p className="text-sm text-indigo-400">{selectedCandidate.email}</p>
                                </div>
                                <div className="flex gap-2"><Button onClick={handleEdit} variant="secondary" icon={<EditIcon className="h-4 w-4"/>}>Edit</Button><Button onClick={() => handleDelete(selectedCandidate.id)} variant="secondary" className="hover:bg-red-800/50" icon={<TrashIcon className="h-4 w-4 text-red-400"/>}>{''}</Button></div>
                            </div>
                            <div className="border-b border-gray-700 mb-4">
                                <nav className="-mb-px flex space-x-6">
                                    <button onClick={() => setActiveDetailTab('profile')} className={`${activeDetailTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-2 px-1 border-b-2 font-medium text-sm`}>Profile</button>
                                    <button onClick={() => setActiveDetailTab('crm')} className={`${activeDetailTab === 'crm' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>CRM <HeartIcon className="h-4 w-4"/></button>
                                </nav>
                            </div>
                            {activeDetailTab === 'profile' ? renderProfileDetails(selectedCandidate) : renderCrmDetails(selectedCandidate)}
                        </div>
                    ) : null}
                </Card>
            </div>
            {multiSelectIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 w-full max-w-2xl z-20 animate-fade-in-up">
                    <div className="bg-gray-950 border border-indigo-500/50 rounded-lg shadow-2xl p-4 flex items-center gap-4 mx-4">
                        <span className="font-semibold text-white">{multiSelectIds.size} selected</span>
                        <input type="text" value={targetJobTitle} onChange={e => setTargetJobTitle(e.target.value)} placeholder="Target job..." className="input-field-sm flex-grow" />
                        <Button onClick={handleGenerateSummary} isLoading={isGeneratingSummary} icon={<SparklesIcon className="h-4 w-4" />}>Summarize</Button>
                        <Button variant="secondary" onClick={() => setMultiSelectIds(new Set())}>Clear</Button>
                    </div>
                </div>
            )}
            {summaryReport && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSummaryReport(null)}>
                    <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <CardHeader title="AI Candidate Group Analysis" description={`For role: ${targetJobTitle}`} icon={<SparklesIcon />} />
                        <div className="overflow-y-auto pr-2 -mr-4 mt-2 space-y-6">
                             <div>
                                <h3 className="text-lg font-semibold text-indigo-300 mb-2 border-b border-gray-700 pb-2">Group Summary</h3>
                                <div className="space-y-4 mt-2">
                                    <p className="text-gray-300">{summaryReport.combinedSummary}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><h4 className="font-semibold text-green-400 mb-2">Strengths</h4><ul className="list-disc list-inside space-y-1 text-gray-300">{summaryReport.collectiveStrengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                                        <div><h4 className="font-semibold text-yellow-400 mb-2">Gaps</h4><ul className="list-disc list-inside space-y-1 text-gray-300">{summaryReport.potentialGaps.map((g, i) => <li key={i}>{g}</li>)}</ul></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-300 mb-2 border-b border-gray-700 pb-2">Individual Rankings</h3>
                                <div className="space-y-4 mt-2">
                                    {summaryReport.individualAnalysis.map(c => ( <div key={c.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                        <div className="flex justify-between items-start"><p className="font-bold text-white">{c.name}</p><p className={`text-2xl font-bold ${getScoreColor(c.matchScore)}`}>{c.matchScore}</p></div>
                                        <p className="text-sm text-gray-400 mt-1">{c.reasoning}</p>
                                    </div>))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end"><Button onClick={() => setSummaryReport(null)}>Close</Button></div>
                    </Card>
                </div>
            )}
            <style>{`.label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; margin-bottom: 0.25rem;} .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; } .input-field { padding: 0.5rem 0.75rem; } .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; } .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; } .input-field[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); } .form-checkbox { height: 1rem; width: 1rem; appearance: none; -webkit-appearance: none; background-color: #374151; border: 1px solid #4b5563; border-radius: 0.25rem; } .form-checkbox:checked { background-color: #4f46e5; border-color: #4f46e5; background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e"); } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } .overflow-y-auto::-webkit-scrollbar { width: 6px; } .overflow-y-auto::-webkit-scrollbar-track { background: transparent; } .overflow-y-auto::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }`}</style>
        </div>
    );
};
