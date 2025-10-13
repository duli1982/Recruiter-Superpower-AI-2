import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Candidate, TagType, AIGroupAnalysisReport, CandidateStatus, ApplicationHistory, RelationshipStatus, CandidateCRM, Touchpoint, TouchpointType, NurtureCadence, NurtureContentType, Attachment, ComplianceInfo, Interview, JobRequisition, OverallRecommendation, ViewMode, PipelineStage } from '../../types';
import { MOCK_CANDIDATES, MOCK_SCHEDULED_INTERVIEWS, MOCK_JOB_REQUISITIONS, MOCK_PIPELINE_DATA } from '../../constants';
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
const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

const STORAGE_KEY = 'recruiter-ai-candidates';
const SAVED_SEARCHES_KEY = 'recruiter-ai-saved-searches';
const INTERVIEWS_KEY = 'recruiter-ai-interviews';
const REQUISITIONS_KEY = 'recruiter-ai-requisitions';
const PIPELINE_KEY = 'recruiter-ai-pipeline';

type PipelineData = { [jobId: number]: { [stage in PipelineStage]?: number[] } };

interface CandidateProfilesTabProps {
  currentView: ViewMode;
  currentUser: string;
}

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
const BLANK_CANDIDATE: Omit<Candidate, 'id'> = { name: '', email: '', phone: '', skills: '', resumeSummary: '', experience: 0, location: '', availability: 'Immediate', tags: [], status: CandidateStatus.Passive, lastContactDate: '', source: '', compensation: { currentSalary: 0, salaryExpectation: 0, negotiationNotes: ''}, visaStatus: '', applicationHistory: [], crm: BLANK_CRM, attachments: [], compliance: { consentStatus: 'Not Requested' } };

export const CandidateProfilesTab: React.FC<CandidateProfilesTabProps> = ({ currentView, currentUser }) => {
    const [candidates, setCandidates] = useState<Candidate[]>(() => getInitialData(STORAGE_KEY, MOCK_CANDIDATES));
    const [interviews] = useState<Interview[]>(() => getInitialData(INTERVIEWS_KEY, MOCK_SCHEDULED_INTERVIEWS));
    const [requisitions] = useState<JobRequisition[]>(() => getInitialData(REQUISITIONS_KEY, MOCK_JOB_REQUISITIONS));
    const [pipelineData] = useState<PipelineData>(() => getInitialData(PIPELINE_KEY, MOCK_PIPELINE_DATA));

    const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formState, setFormState] = useState<Omit<Candidate, 'id'> | Candidate>(BLANK_CANDIDATE);
    const [filters, setFilters] = useState<Filters>(BLANK_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => getInitialData(SAVED_SEARCHES_KEY, []));
    const [activeDetailTab, setActiveDetailTab] = useState<'profile' | 'crm' | 'feedback' | 'documents'>('profile');

    const [multiSelectIds, setMultiSelectIds] = useState<Set<number>>(new Set());
    const [targetJobTitle, setTargetJobTitle] = useState('Senior Frontend Engineer');
    const [summaryReport, setSummaryReport] = useState<AIGroupAnalysisReport | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    const [crmSuggestion, setCrmSuggestion] = useState<{suggestion: string, nextStep: string} | null>(null);
    const [isGeneratingCrmSuggestion, setIsGeneratingCrmSuggestion] = useState(false);
    const [newActivity, setNewActivity] = useState({ type: 'Note' as TouchpointType, notes: '' });

    useEffect(() => {
        if (currentView === 'recruiter') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
        }
    }, [candidates, currentView]);

    useEffect(() => {
        if (currentView === 'recruiter') {
            localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
        }
    }, [savedSearches, currentView]);

    const filteredCandidates = useMemo(() => {
        let candidatesToFilter = candidates;

        if (currentView === 'hiringManager') {
            const managerReqIds = requisitions
                .filter(r => r.hiringManager === currentUser)
                .map(r => r.id);
            
            const candidateIdsInPipeline = new Set<number>();
            managerReqIds.forEach(reqId => {
                const jobPipeline = pipelineData[reqId] || {};
                // FIX: Use Array.isArray as a type guard. The type of `candidateIdArray` can be
                // inferred as `unknown` when using Object.values on a complex type, so this
                // ensures we only call forEach on an actual array.
                Object.values(jobPipeline).forEach(candidateIdArray => {
                    if (Array.isArray(candidateIdArray)) {
                        candidateIdArray.forEach(id => candidateIdsInPipeline.add(id));
                    }
                });
            });
            candidatesToFilter = candidates.filter(c => candidateIdsInPipeline.has(c.id));
        }

        const filtered = candidatesToFilter.filter(c => {
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
        
        // After filtering, if a selected candidate is no longer in the list, deselect them.
        if (selectedCandidateId && !filtered.some(c => c.id === selectedCandidateId)) {
            setSelectedCandidateId(null);
        }
        
        return filtered;
    }, [candidates, filters, currentView, currentUser, requisitions, pipelineData, selectedCandidateId]);
    
    const selectedCandidate = useMemo(() => candidates.find(c => c.id === selectedCandidateId) || null, [selectedCandidateId, candidates]);
    
    const handleSelectCandidate = (candidate: Candidate) => {
        setSelectedCandidateId(candidate.id);
        setIsEditing(false);
        setActiveDetailTab('profile');
        setCrmSuggestion(null);
    };

    const handleAddNew = () => {
        if (currentView === 'hiringManager') return;
        setSelectedCandidateId(null);
        setFormState(BLANK_CANDIDATE);
        setIsEditing(true);
    };
    
    const handleEdit = () => {
        if(selectedCandidate && currentView === 'recruiter') {
            setFormState(selectedCandidate);
            setIsEditing(true);
        }
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        if (selectedCandidate) setSelectedCandidateId(selectedCandidate.id);
    };

    const handleDelete = (id: number) => {
        if (currentView === 'hiringManager' || !window.confirm("Are you sure?")) return;
        setCandidates(prev => prev.filter(c => c.id !== id));
        if (selectedCandidateId === id) setSelectedCandidateId(null);
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentView === 'hiringManager') return;

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
        if (currentView === 'hiringManager') return;
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

    const handleLogActivity = () => {
        if (!selectedCandidateId || !newActivity.notes || currentView === 'hiringManager') return;
        const newTouchpoint: Touchpoint = {
            id: `tp-${Date.now()}`,
            date: new Date().toISOString(),
            type: newActivity.type,
            notes: newActivity.notes,
            author: currentUser,
        };

        setCandidates(prev => prev.map(c => {
            if (c.id === selectedCandidateId) {
                const updatedCrm = c.crm ? { ...c.crm, touchpointHistory: [newTouchpoint, ...c.crm.touchpointHistory] } : { ...BLANK_CRM, touchpointHistory: [newTouchpoint] };
                return { ...c, crm: updatedCrm, lastContactDate: new Date().toISOString() };
            }
            return c;
        }));
        setNewActivity({ type: 'Note', notes: '' });
    };

    const handleUpdateConsent = () => {
        if (!selectedCandidateId || currentView === 'hiringManager') return;
        const statuses: ComplianceInfo['consentStatus'][] = ['Given', 'Pending', 'Expired', 'Not Requested'];
        
        setCandidates(prev => prev.map(c => {
            if (c.id === selectedCandidateId) {
                const currentStatus = c.compliance?.consentStatus || 'Not Requested';
                const currentIndex = statuses.indexOf(currentStatus);
                const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                const newCompliance: ComplianceInfo = {
                    ...c.compliance,
                    consentStatus: nextStatus,
                    consentDate: nextStatus === 'Given' ? new Date().toISOString() : c.compliance?.consentDate,
                    consentPurpose: nextStatus === 'Given' ? 'General consideration for open roles.' : c.compliance?.consentPurpose,
                };
                return { ...c, compliance: newCompliance };
            }
            return c;
        }));
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

    const ComplianceStatusBadge: React.FC<{ status: ComplianceInfo['consentStatus'] }> = ({ status }) => {
        const colors: Record<ComplianceInfo['consentStatus'], string> = {
            'Given': 'bg-green-500/20 text-green-300',
            'Pending': 'bg-yellow-500/20 text-yellow-300',
            'Expired': 'bg-red-500/20 text-red-300',
            'Not Requested': 'bg-gray-600/20 text-gray-300'
        };
        return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[status]}`}>{status}</span>;
    };

    const getScoreColor = (score: number) => score >= 85 ? 'text-green-400' : score >= 70 ? 'text-yellow-400' : 'text-red-400';
    
    const RecommendationBadge: React.FC<{ recommendation: OverallRecommendation }> = ({ recommendation }) => {
        const styles: Record<OverallRecommendation, string> = {
            'Strong Hire': 'bg-green-500/20 text-green-300',
            'Hire': 'bg-teal-500/20 text-teal-300',
            'No Hire': 'bg-yellow-500/20 text-yellow-300',
            'Strong No Hire': 'bg-red-500/20 text-red-300',
        };
        return <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[recommendation]}`}>{recommendation}</span>;
    };

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
                <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2"><ShieldCheckIcon className="h-4 w-4 text-gray-400"/> Compliance</h4>
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <p className="text-gray-400">Consent Status: <ComplianceStatusBadge status={candidate.compliance?.consentStatus || 'Not Requested'} /></p>
                        {candidate.compliance?.consentDate && <p className="text-gray-500 text-xs mt-1">Date: {new Date(candidate.compliance.consentDate).toLocaleDateString()}</p>}
                    </div>
                    {currentView === 'recruiter' && <Button variant="secondary" className="!text-xs !py-1 !px-2" onClick={handleUpdateConsent}>Update</Button>}
                </div>
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
                 {currentView === 'recruiter' && (
                     <Card className="bg-gray-800">
                        <h4 className="font-semibold text-gray-300 mb-2">Log Activity</h4>
                        <div className="flex gap-2 mb-2">
                            {(['Email', 'Call', 'Meeting', 'Note'] as const).map(type => (
                                <button key={type} onClick={() => setNewActivity(p => ({...p, type}))} className={`px-2 py-1 text-xs rounded-md ${newActivity.type === type ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{type}</button>
                            ))}
                        </div>
                        <textarea value={newActivity.notes} onChange={e => setNewActivity(p => ({...p, notes: e.target.value}))} placeholder={`Log a ${newActivity.type.toLowerCase()}...`} rows={3} className="input-field mb-2"></textarea>
                        <Button onClick={handleLogActivity} disabled={!newActivity.notes} className="w-full">Log</Button>
                    </Card>
                 )}
                <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Activity Timeline</h4>
                    <div className="space-y-4">
                        {crm.touchpointHistory.length > 0 ? crm.touchpointHistory.map(tp => (
                            <div key={tp.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-400" title={tp.type}>{touchpointIcons[tp.type]}</div>
                                <div>
                                    <p className="text-sm text-gray-400">{new Date(tp.date).toLocaleString()} &bull; {tp.author}</p>
                                    <p className="text-sm text-gray-200">{tp.notes}</p>
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-4">No activities logged.</p>}
                    </div>
                </div>
            </div>
        );
    };

    const renderFeedbackDetails = (candidate: Candidate) => {
        const candidateInterviews = interviews.filter(i => i.candidateId === candidate.id && i.feedback && i.feedback.length > 0);

        if (candidateInterviews.length === 0) {
            return <div className="text-center text-gray-500 py-10">No interview feedback submitted for this candidate.</div>;
        }

        return (
            <div className="overflow-y-auto flex-1 space-y-6 pr-2 -mr-2">
                {candidateInterviews.map(interview => {
                    const job = requisitions.find(r => r.id === interview.jobId);
                    return (
                        <Card key={interview.id} className="bg-gray-800/50">
                            <h4 className="font-semibold text-gray-200">{interview.stage} for {job?.title}</h4>
                            <p className="text-xs text-gray-400 mb-3">on {new Date(interview.startTime).toLocaleDateString()}</p>
                            {interview.feedback?.map((fb, index) => (
                                <div key={index} className="space-y-4">
                                    <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-md">
                                        <div>
                                            <p className="font-semibold text-gray-300">{fb.interviewerName}</p>
                                            <p className="text-xs text-gray-500">Submitted: {new Date(fb.submissionDate).toLocaleDateString()}</p>
                                        </div>
                                        <RecommendationBadge recommendation={fb.overallRecommendation} />
                                    </div>
                                    <p className="text-sm italic text-gray-300 p-2 border-l-2 border-indigo-500">"{fb.summary}"</p>
                                    <div>
                                        <h5 className="text-sm font-semibold text-gray-400 mb-2">Competency Ratings:</h5>
                                        <div className="space-y-2">
                                            {fb.ratings.map(r => {
                                                const competency = job?.scorecard?.competencies.find(c => c.id === r.competencyId);
                                                return (
                                                    <div key={r.competencyId} className="p-2 bg-gray-800 rounded">
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-sm font-medium text-gray-200">{competency?.name || 'Unknown Competency'}</p>
                                                            <div className="flex gap-1">{[...Array(5)].map((_, i) => <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />)}</div>
                                                        </div>
                                                        {r.notes && <p className="text-xs text-gray-400 mt-1 italic">"{r.notes}"</p>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    );
                })}
            </div>
        );
    };

    const renderDocumentsDetails = (candidate: Candidate) => (
        <div className="overflow-y-auto flex-1 space-y-4 pr-2 -mr-2">
            {currentView === 'recruiter' && (
                <Button variant="secondary" icon={<UploadIcon className="h-4 w-4" />} onClick={() => alert("Simulating document upload...")}>
                    Upload Document
                </Button>
            )}
            <div className="space-y-3">
                {(candidate.attachments || []).map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <FileTextIcon className="h-6 w-6 text-indigo-400 flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-semibold text-white">{doc.name}</p>
                            <p className="text-xs text-gray-400">{doc.type} &bull; Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                    </a>
                ))}
            </div>
            {(candidate.attachments || []).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No documents uploaded for this candidate.</p>
            )}
        </div>
    );

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
                                <div><label className="label">Status</label><select name="status" value={filters.status} onChange={handleFilterChange} className="input-field-sm mt-1"><option>All</option>{Object.values(CandidateStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                <div><label className="label">CRM Status</label><select name="relationshipStatus" value={filters.relationshipStatus} onChange={handleFilterChange} className="input-field-sm mt-1"><option>All</option>{['Cold', 'Warm', 'Hot', 'Past Candidate', 'Silver Medalist'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            </div>
                            <div className="flex gap-2"><Button onClick={() => setFilters(BLANK_FILTERS)} variant="secondary" className="text-xs flex-grow">Reset</Button><Button onClick={handleSaveSearch} variant="secondary" icon={<BookmarkIcon className="h-4 w-4"/>} className="text-xs">Save</Button></div>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4"><span className="text-sm text-gray-400">{filteredCandidates.length} of {candidates.length}</span>{currentView === 'recruiter' && <Button onClick={handleAddNew} variant="secondary" className="!px-2 !py-1 text-xs" icon={<PlusIcon className="h-4 w-4" />}>Add New</Button>}</div>
                    <ul className="overflow-y-auto space-y-2 flex-grow">
                        {filteredCandidates.map(c => (
                             <li key={c.id}><div className={`w-full text-left p-3 rounded-md transition-colors flex items-center gap-3 ${selectedCandidateId === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700/50'}`}>
                                {currentView === 'recruiter' && <input type="checkbox" checked={multiSelectIds.has(c.id)} onChange={() => handleMultiSelectToggle(c.id)} className="form-checkbox" />}
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
                                {currentView === 'recruiter' && <div className="flex gap-2"><Button onClick={handleEdit} variant="secondary" icon={<EditIcon className="h-4 w-4"/>}>Edit</Button><Button onClick={() => handleDelete(selectedCandidate.id)} variant="secondary" className="hover:bg-red-800/50" icon={<TrashIcon className="h-4 w-4 text-red-400"/>}>{''}</Button></div>}
                            </div>
                            <div className="border-b border-gray-700 mb-4">
                                <nav className="-mb-px flex space-x-6">
                                    <button onClick={() => setActiveDetailTab('profile')} className={`${activeDetailTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-2 px-1 border-b-2 font-medium text-sm`}>Profile</button>
                                    <button onClick={() => setActiveDetailTab('crm')} className={`${activeDetailTab === 'crm' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>CRM</button>
                                    <button onClick={() => setActiveDetailTab('feedback')} className={`${activeDetailTab === 'feedback' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>Feedback</button>
                                    <button onClick={() => setActiveDetailTab('documents')} className={`${activeDetailTab === 'documents' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'} py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>Documents</button>
                                </nav>
                            </div>
                            {activeDetailTab === 'profile' && renderProfileDetails(selectedCandidate)}
                            {activeDetailTab === 'crm' && renderCrmDetails(selectedCandidate)}
                            {activeDetailTab === 'feedback' && renderFeedbackDetails(selectedCandidate)}
                            {activeDetailTab === 'documents' && renderDocumentsDetails(selectedCandidate)}
                        </div>
                    ) : null}
                </Card>
            </div>
            {currentView === 'recruiter' && multiSelectIds.size > 0 && (
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
            <style>{`.label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; margin-bottom: 0.25rem;} .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; } .input-field { padding: 0.5rem 0.75rem; } .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; } .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; } .form-checkbox { appearance: none; -webkit-appearance: none; background-color: #374151; border: 1px solid #4b5563; border-radius: 0.25rem; } .form-checkbox:checked { background-color: #4f46e5; border-color: #4f46e5; background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e"); background-size: 100% 100%; background-position: center; background-repeat: no-repeat; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};