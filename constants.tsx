import React from 'react';
import {
  Tab, TabInfo, Candidate, JobRequisition, PipelineStage,
  CandidateStatus, JobStatus, EmailTemplateType, Interview, InterviewStage,
  InterviewStatus, InterviewerStatus, Offer, OfferStatus, ApprovalStatus,
  CommunityPrompt, EmailSequence, SentEmail, EmailStatus, TagType
} from './types';

// Icons for sidebar tabs
const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>;
const WandIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2m0 14v-2m-3.5-8.5L10 2m0 12l-1.5 1.5M12 22l-3-3m5 0l3-3m-6-1.5L2 12l1.5-1.5M10 22l3-3"/><path d="m20 12-1.5-1.5m-15 0L2 12l1.5 1.5M20 12l-1.5 1.5M12 2v2m0 18v-2m8.5-11.5L22 10m-12 0l-1.5-1.5"/></svg>;
const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const GitBranchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>;
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const GiftIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;


export const TABS: TabInfo[] = [
  { id: Tab.Dashboard, name: "Dashboard", icon: <BarChartIcon /> },
  { id: Tab.AIAssistant, name: "AI Assistant", icon: <WandIcon /> },
  { id: Tab.InsightJudgment, name: "Insight & Judgment", icon: <TargetIcon /> },
  { id: Tab.DiversityEthics, name: "Diversity & Ethics", icon: <ShieldIcon /> },
  { id: Tab.CandidateProfiles, name: "Candidate Profiles", icon: <UsersIcon /> },
  { id: Tab.JobRequisitions, name: "Job Requisitions", icon: <BriefcaseIcon /> },
  { id: Tab.CandidatePipeline, name: "Candidate Pipeline", icon: <GitBranchIcon /> },
  { id: Tab.CandidateExperience, name: "Candidate Experience", icon: <CalendarIcon /> },
  { id: Tab.ProactiveSourcing, name: "Proactive Sourcing", icon: <SearchIcon /> },
  { id: Tab.OfferManagement, name: "Offer Management", icon: <GiftIcon /> },
  { id: Tab.PerformanceCreativity, name: "Performance & Creativity", icon: <ActivityIcon /> },
  { id: Tab.PredictiveAnalytics, name: "Predictive Analytics", icon: <TrendingUpIcon /> },
  { id: Tab.IntegrationUpskilling, name: "Integrations & Upskilling", icon: <SettingsIcon /> },
  { id: Tab.AdoptionCommunity, name: "Adoption & Community", icon: <ZapIcon /> },
];


export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: 'Morgan Lee',
    email: 'morgan.lee@example.com',
    phone: '111-222-3333',
    skills: 'React, TypeScript, Node.js, GraphQL',
    resumeSummary: 'Senior Frontend Engineer with 8 years of experience building scalable web applications. Proficient in modern JavaScript frameworks and passionate about user experience.',
    status: CandidateStatus.Interviewing,
    experience: 8,
    location: 'San Francisco, CA',
    source: 'LinkedIn',
    lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applicationHistory: [{ jobTitle: 'Senior Product Manager', dateApplied: '2023-05-10', stageReached: 'Final Interview', outcome: 'In Progress' }],
    crm: { relationshipStatus: 'Warm', relationshipScore: 85, touchpointHistory: [], nurtureSettings: { autoNurture: true, cadence: 'Monthly', contentType: 'Industry Insights' }, communitySettings: { newsletter: true, eventInvites: true } },
    onboardingChecklist: [
      { id: '1', task: 'Send Welcome Kit', stakeholder: 'HR', completed: true },
      { id: '2', task: 'Provision Laptop', stakeholder: 'IT', completed: true },
      { id: '3', task: 'Schedule Day 1 Meetings', stakeholder: 'Hiring Manager', completed: false },
    ],
    hasCompetingOffer: true,
  },
  {
    id: 2,
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '444-555-6666',
    skills: 'Python, Django, AWS, Docker, Kubernetes',
    resumeSummary: 'Backend Engineer with a strong background in cloud infrastructure and DevOps. Experienced in designing and maintaining microservices architectures.',
    status: CandidateStatus.Passive,
    experience: 6,
    location: 'Austin, TX',
    source: 'Referral',
    lastContactDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    applicationHistory: [],
    crm: { relationshipStatus: 'Cold', relationshipScore: 40, touchpointHistory: [], nurtureSettings: { autoNurture: false, cadence: 'Quarterly', contentType: 'New Roles' }, communitySettings: { newsletter: false, eventInvites: false } },
    tags: [TagType.Referral]
  },
  {
    id: 3,
    name: 'Casey Chen',
    email: 'casey.chen@example.com',
    phone: '777-888-9999',
    skills: 'Figma, Sketch, UI/UX Design, Prototyping',
    resumeSummary: 'Product Designer focused on creating intuitive and user-centered digital experiences. Skilled in the entire design process from research to high-fidelity mockups.',
    status: CandidateStatus.Active,
    experience: 5,
    location: 'New York, NY',
    source: 'AI Talent Scout',
    lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applicationHistory: [{ jobTitle: 'Lead Product Designer', dateApplied: '2023-06-01', stageReached: 'Phone Screen', outcome: 'In Progress' }],
    crm: { relationshipStatus: 'Hot', relationshipScore: 95, touchpointHistory: [], nurtureSettings: { autoNurture: true, cadence: 'Monthly', contentType: 'Company News' }, communitySettings: { newsletter: true, eventInvites: false } },
    hasCompetingOffer: false,
  },
];

export const MOCK_JOB_REQUISITIONS: JobRequisition[] = [
  {
    id: 101,
    title: 'Senior Product Manager',
    department: 'Product',
    status: JobStatus.Open,
    description: 'We are looking for a Senior Product Manager to lead our core product initiatives. You will be responsible for the product lifecycle from concept to launch.',
    requiredSkills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping'],
    applications: 42,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    hiringManager: 'Jordan Lee',
    recruiter: 'Taylor Kim',
    budget: { salaryMin: 150000, salaryMax: 180000, currency: 'USD', budgetCode: 'PROD-1024' },
    approvalWorkflow: [{ stage: 'VP Approval', approver: 'Alex Rivera', status: 'Approved' }],
    isLocked: true,
    initialRequiredSkills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping'],
  },
  {
    id: 102,
    title: 'Lead Backend Engineer',
    department: 'Engineering',
    status: JobStatus.PendingApproval,
    description: 'Lead a team of backend engineers to build and scale our services. This role requires strong leadership and technical skills in distributed systems.',
    requiredSkills: ['Go', 'Kubernetes', 'Microservices', 'Team Leadership'],
    applications: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    hiringManager: 'Dana Scully',
    recruiter: 'Sam Jones',
    budget: { salaryMin: 170000, salaryMax: 200000, currency: 'USD', budgetCode: 'ENG-305' },
    approvalWorkflow: [{ stage: 'Finance Approval', approver: 'Alex Rivera', status: 'Pending' }],
  }
];

export const MOCK_BIASED_JOB_DESCRIPTION = `We're seeking a rockstar ninja developer to join our young, dynamic team. The ideal candidate will be a digital native who can work hard and play hard. Must be able to handle high-pressure situations and be a true team player. Recent graduates are encouraged to apply.`;

export const PIPELINE_STAGES: PipelineStage[] = [
  PipelineStage.Applied,
  PipelineStage.PhoneScreen,
  PipelineStage.TechnicalInterview,
  PipelineStage.FinalInterview,
  PipelineStage.Offer,
  PipelineStage.Hired
];

export const MOCK_PIPELINE_DATA = {
  101: {
    [PipelineStage.Applied]: [2, 3],
    [PipelineStage.TechnicalInterview]: [1],
    [PipelineStage.Offer]: [],
    [PipelineStage.Hired]: [],
  },
  102: {
    [PipelineStage.Applied]: [],
    [PipelineStage.PhoneScreen]: [],
  }
};

export const MOCK_SCHEDULED_INTERVIEWS: Interview[] = [
  {
    id: 'int-1',
    candidateId: 1,
    jobId: 101,
    stage: 'Final Interview',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    interviewers: [
      { name: 'Jordan Lee', role: 'VP of Product', status: InterviewerStatus.Confirmed },
      { name: 'Alex Rivera', role: 'CEO', status: InterviewerStatus.Pending }
    ],
    status: InterviewStatus.Scheduled,
    feedbackSubmitted: false,
  }
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    candidateId: 3,
    jobId: 101,
    status: OfferStatus.Accepted,
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    currentCompensation: { baseSalary: 165000, bonus: 15000, equity: '5,000 RSUs' },
    negotiationHistory: [{ date: new Date().toISOString(), author: 'Company', compensation: { baseSalary: 165000 } }],
    approvalChain: [{ role: 'VP of Product', approver: 'Jordan Lee', status: ApprovalStatus.Approved }],
  },
  {
    id: 'offer-2',
    candidateId: 1,
    jobId: 101,
    status: OfferStatus.Negotiating,
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    currentCompensation: { baseSalary: 175000, bonus: 20000, equity: '8,000 RSUs' },
    negotiationHistory: [{ date: new Date().toISOString(), author: 'Candidate', compensation: { baseSalary: 180000 }, notes: "Hoping to get to the top of the band." }],
    approvalChain: [{ role: 'Finance', approver: 'Alex Rivera', status: ApprovalStatus.Pending, notes: "Checking budget for increase." }],
    competitiveIntel: ["Received a competing offer from a FAANG company.", "Candidate is a top priority for the hiring manager."],
  }
];

export const MOCK_COMMUNITY_PROMPTS: CommunityPrompt[] = [
  {
    id: 1,
    title: "Generate a 'Day in the Life' Job Description",
    description: "Creates a more engaging and realistic job description by framing it as a typical day.",
    promptText: "Rewrite the following job description to be from the perspective of a 'Day in the Life' of someone in the role: [Paste JD here]",
    targetFeature: Tab.JobRequisitions,
    author: 'Taylor Kim',
    upvotes: 124,
    usageCount: 450,
    tags: ['Job Description', 'Creativity'],
  }
];

export const MOCK_SENT_EMAILS: SentEmail[] = [];
export const MOCK_SEQUENCES: EmailSequence[] = [];
