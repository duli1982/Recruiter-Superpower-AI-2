import React, { useState, useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { CommunityPrompt, Tab } from '../../types';
import { MOCK_COMMUNITY_PROMPTS, TABS } from '../../constants';

// Icons
const ThumbsUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a2 2 0 0 1 3 1.88z"/></svg>;
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;

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

    const targetableTabs = TABS.filter(t => [Tab.ProactiveSourcing, Tab.AdminElimination, Tab.DiversityEthics, Tab.InsightJudgment].includes(t.id));

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
                <div className="flex gap-4 items-center">
                    <input
                        type="search"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input-field-sm"
                    />
                    <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon />}>Share a Prompt</Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map(prompt => {
                    const targetTabInfo = TABS.find(t => t.id === prompt.targetFeature);
                    return (
                        <Card key={prompt.id} className="flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-bold text-white">{prompt.title}</h3>
                                {/* FIX: Cast icon to allow passing className prop without type errors. */}
                                {targetTabInfo && React.cloneElement(targetTabInfo.icon as React.ReactElement<any>, { className: 'h-6 w-6 text-indigo-400' })}
                            </div>
                            <p className="text-sm text-gray-400 flex-grow">{prompt.description}</p>
                            <div className="my-3 flex flex-wrap gap-2">
                                {prompt.tags.map(tag => (
                                    <span key={tag} className="bg-gray-700 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                                ))}
                            </div>
                             <div className="text-xs text-gray-500 mb-4">By {prompt.author}</div>
                            
                            <div className="mt-auto pt-4 border-t border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <button onClick={() => handleUpvote(prompt.id)} className="flex items-center gap-1.5 hover:text-white transition-colors">
                                        <ThumbsUpIcon className="h-4 w-4" /> {prompt.upvotes}
                                    </button>
                                    <span className="flex items-center gap-1.5">
                                        <EyeIcon className="h-4 w-4" /> {prompt.usageCount}
                                    </span>
                                </div>
                                <Button variant="secondary" onClick={() => handleUsePrompt(prompt)}>Use Prompt</Button>
                            </div>
                        </Card>
                    );
                })}
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