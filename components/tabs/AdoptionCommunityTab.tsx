import React, { useState, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
// FIX: Correct import path for types
import { CommunityPrompt, Tab } from '../../types';
// FIX: Correct import path for constants
import { MOCK_COMMUNITY_PROMPTS, TABS } from '../../constants';

// Icons
const ThumbsUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a2 2 0 0 1 3 1.88z"/></svg>;
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;

const PROMPTS_STORAGE_KEY = 'recruiter-ai-community-prompts';

const getInitialPrompts = (): CommunityPrompt[] => {
    try {
        const stored = localStorage.getItem(PROMPTS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error("Failed to parse prompts from localStorage", error); }
    return MOCK_COMMUNITY_PROMPTS;
};

const SharePromptModal: React.FC<{ onSave: (prompt: Omit<CommunityPrompt, 'id'>) => void; onClose: () => void }> = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        promptText: '',
        targetFeature: Tab.ProactiveSourcing,
        tags: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPrompt = {
            ...formData,
            author: "Me", // In a real app, this would be the logged-in user
            upvotes: 0,
            usageCount: 0,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        onSave(newPrompt);
    };

    // FIX: Replaced Tab.AdminElimination with Tab.AIAssistant, which exists in the Tab enum.
    const targetableTabs = TABS.filter(t => [Tab.ProactiveSourcing, Tab.AIAssistant, Tab.DiversityEthics, Tab.InsightJudgment].includes(t.id));

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white">Share Your Prompt</h3>
                <div>
                    <label className="label">Prompt Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" required />
                </div>
                 <div>
                    <label className="label">Target Feature</label>
                    <select name="targetFeature" value={formData.targetFeature} onChange={handleChange} className="input-field">
                       {targetableTabs.map(tab => <option key={tab.id} value={tab.id}>{tab.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label">Description</label>
                    <textarea name="description" rows={2} value={formData.description} onChange={handleChange} className="input-field" required></textarea>
                </div>
                <div>
                    <label className="label">The Prompt</label>
                    <textarea name="promptText" rows={4} value={formData.promptText} onChange={handleChange} className="input-field" required></textarea>
                </div>
                 <div>
                    <label className="label">Tags (comma-separated)</label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="input-field" />
                </div>
                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Share Prompt</Button>
                </div>
            </form>
        </div>
    );
};


export const AdoptionCommunityTab: React.FC = () => {
    const [prompts, setPrompts] = useState<CommunityPrompt[]>(getInitialPrompts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredPrompts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return prompts.filter(p => 
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.tags.join(' ').toLowerCase().includes(query)
        ).sort((a,b) => b.upvotes - a.upvotes);
    }, [prompts, searchQuery]);

    const handleUpvote = (id: number) => {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
    };

    const handleUsePrompt = (prompt: CommunityPrompt) => {
        setPrompts(prev => prev.map(p => p.id === prompt.id ? { ...p, usageCount: p.usageCount + 1 } : p));
        const targetTab = TABS.find(t => t.id === prompt.targetFeature);
        alert(`Simulating Action:\n\nNavigating to "${targetTab?.name}" and applying the prompt:\n\n"${prompt.promptText}"`);
    };

    const handleSavePrompt = (newPrompt: Omit<CommunityPrompt, 'id'>) => {
        const newId = prompts.length > 0 ? Math.max(...prompts.map(p => p.id)) + 1 : 1;
        setPrompts(prev => [{id: newId, ...newPrompt}, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Adoption & Community Hub</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card>
                        <CardHeader title="Recruiting is Multi-Stakeholder Chaos ❌" icon={<AlertTriangleIcon className="text-yellow-400" />} />
                        <div className="mt-4 space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-300">The Invisible Stakeholders:</h4>
                                <p className="text-sm text-gray-400">Finance, Legal, IT, Facilities, Coordinators, EAs, Peer Interviewers...</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-300">A Real Comedy of Errors:</h4>
                                <div className="mt-2 space-y-1 text-sm text-gray-300 border-l-2 border-gray-700 pl-4">
                                    <p><strong>Day 1:</strong> Candidate wants to interview</p>
                                    <p><strong>Day 4:</strong> Hiring manager replies</p>
                                    <p><strong>Day 7:</strong> 3 interviewers confirmed, 1 on vacation</p>
                                    <p><strong>Day 11:</strong> All confirmed for next Tuesday</p>
                                    <p className="font-bold text-red-400">Day 12: Candidate emails "I accepted another offer"</p>
                                </div>
                            </div>
                             <blockquote className="mt-4 pl-4 border-l-4 border-indigo-500 bg-gray-800/50 p-4 rounded-r-lg">
                                <p className="text-gray-300 italic">This app's new features, like the "Interview Loop Status" and "Onboarding Checklist," are designed to create a central command center, preventing these costly delays.</p>
                            </blockquote>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader title="A Common Hiring Scenario" icon={<ZapIcon className="text-yellow-400" />} />
                        <div className="mt-4 space-y-2 text-sm text-gray-300">
                           <p><strong>Week 1:</strong> "I need a React developer."</p>
                           <p><strong>Week 3:</strong> "Actually, they also need backend experience."</p>
                           <p><strong>Week 5:</strong> "And mobile. Oh, and they should speak Mandarin."</p>
                           <p><strong>Week 7:</strong> "Why can't we find anyone?"</p>
                        </div>
                         <blockquote className="mt-4 pl-4 border-l-4 border-indigo-500 bg-gray-800/50 p-4 rounded-r-lg">
                            <p className="text-gray-300 italic">This tool's new features, like 'Requirement Lock-down' and 'Scope Creep Alerts' in the Job Requisitions tab, are designed to prevent this exact problem.</p>
                        </blockquote>
                    </Card>

                    <Card>
                        <CardHeader title="Recruiting Realities This App Ignores" icon={<AlertTriangleIcon className="text-yellow-400" />} />
                        <div className="mt-4 space-y-6">
                            <div>
                                <h4 className="text-lg font-bold text-white flex items-center">
                                    1. Recruiting is Sales, Not HR <span className="text-red-500 ml-2">❌</span>
                                </h4>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-gray-800 p-3 rounded-md">
                                        <p className="font-semibold text-gray-400">The App Treats It Like:</p>
                                        <p className="text-gray-200">Data management</p>
                                    </div>
                                    <div className="bg-gray-800 p-3 rounded-md">
                                        <p className="font-semibold text-gray-400">The Reality:</p>
                                        <p className="text-gray-200">It's relationship building</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h5 className="font-semibold text-gray-300">Real Talk:</h5>
                                <blockquote className="mt-2 pl-4 border-l-4 border-indigo-500 bg-gray-800/50 p-4 rounded-r-lg">
                                    <p className="text-gray-300 italic">"Great recruiters are closers. They know when to push, when to pull back, when to bring in the CEO for a coffee chat. This app is a great assistant, but it doesn't teach you how to close."</p>
                                </blockquote>
                            </div>
                        </div>
                    </Card>
                </div>
                 <div className="space-y-8">
                    <Card>
                        <CardHeader title="Hiring Manager Training" icon={<BookOpenIcon />} description="Share these resources with your hiring managers to improve collaboration and outcomes." />
                        <div className="mt-4 space-y-3">
                            <a href="#" className="block p-3 bg-gray-800 rounded-md hover:bg-gray-700/50 transition-colors">
                                <h4 className="font-semibold text-indigo-300">Effective Interviewing 101</h4>
                                <p className="text-sm text-gray-400">Learn to ask behavioral questions that reveal true potential.</p>
                            </a>
                            <a href="#" className="block p-3 bg-gray-800 rounded-md hover:bg-gray-700/50 transition-colors">
                                <h4 className="font-semibold text-indigo-300">Reducing Unconscious Bias</h4>
                                <p className="text-sm text-gray-400">Techniques to ensure a fair and equitable evaluation process for all candidates.</p>
                            </a>
                             <a href="#" className="block p-3 bg-gray-800 rounded-md hover:bg-gray-700/50 transition-colors">
                                <h4 className="font-semibold text-indigo-300">How to Give Constructive Feedback</h4>
                                <p className="text-sm text-gray-400">Master the art of providing timely and helpful feedback to the recruiting team.</p>
                            </a>
                        </div>
                    </Card>
                    <Card>
                         <div className="flex flex-wrap gap-4 justify-between items-center">
                            <CardHeader title="Community Prompt Library" />
                            <div className="flex gap-4 items-center">
                                <input type="search" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field-sm" />
                                {/* FIX: Replaced the unsupported 'size' prop with 'className' to control button size. */}
                                <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />} className="!text-xs !py-1 !px-2">Share</Button>
                            </div>
                        </div>
                        <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                            {filteredPrompts.map(prompt => {
                                const targetTabInfo = TABS.find(t => t.id === prompt.targetFeature);
                                return (
                                    <Card key={prompt.id} className="flex flex-col bg-gray-800/50">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-md font-bold text-white">{prompt.title}</h3>
                                            {targetTabInfo && React.cloneElement(targetTabInfo.icon as React.ReactElement<any>, { className: 'h-5 w-5 text-indigo-400' })}
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-gray-700 flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                <button onClick={() => handleUpvote(prompt.id)} className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                    <ThumbsUpIcon className="h-4 w-4" /> {prompt.upvotes}
                                                </button>
                                            </div>
                                            <Button variant="secondary" className="!text-xs !py-1" onClick={() => handleUsePrompt(prompt)}>Use</Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>

             {isModalOpen && <SharePromptModal onSave={handleSavePrompt} onClose={() => setIsModalOpen(false)} />}
             <style>{`
                .label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; margin-bottom: 0.25rem;}
                .input-field, .input-field-sm { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; }
                .input-field { padding: 0.5rem 0.75rem; }
                .input-field-sm { padding: 0.375rem 0.625rem; font-size: 0.875rem; }
                .input-field:focus, .input-field-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }
            `}</style>
        </div>
    );
};