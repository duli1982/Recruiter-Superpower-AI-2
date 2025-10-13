import React from 'react';
import {
  Tab, TabInfo, Candidate, JobRequisition, PipelineStage,
  CandidateStatus, JobStatus, EmailTemplateType, Interview, InterviewStage,
  InterviewStatus, InterviewerStatus, Offer, OfferStatus, ApprovalStatus,
  CommunityPrompt, EmailSequence, SentEmail, EmailStatus, TagType, Scorecard, EEOData, Referral
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
const UserCheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>;
const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.4l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.4l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
const Share2Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const ArrowUpCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>;


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
  { id: Tab.Onboarding, name: "Onboarding", icon: <UserCheckIcon /> },
  { id: Tab.EmployeeReferrals, name: "Employee Referrals", icon: <Share2Icon /> },
  { id: Tab.InternalMobility, name: "Internal Mobility", icon: <ArrowUpCircleIcon /> },
  { id: Tab.PerformanceCreativity, name: "Performance & Creativity", icon: <ActivityIcon /> },
  { id: Tab.PredictiveAnalytics, name: "Predictive Analytics", icon: <TrendingUpIcon /> },
  { id: Tab.IntegrationUpskilling, name: "Integrations & Upskilling", icon: <SettingsIcon /> },
  { id: Tab.AdoptionCommunity, name: "Adoption & Community", icon: <ZapIcon /> },
];

export const MANAGER_TABS: TabInfo[] = TABS.filter(tab => [
  Tab.Dashboard,
  Tab.JobRequisitions,
  Tab.CandidatePipeline,
  Tab.CandidateProfiles,
].includes(tab.id));


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
    crm: { 
        relationshipStatus: 'Warm', 
        relationshipScore: 85, 
        touchpointHistory: [
            { id: 'tp-1', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'Email', notes: 'Sent follow-up email about interview schedule.', author: 'Taylor Kim'},
            { id: 'tp-2', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: 'Call', notes: 'Initial phone screen, candidate was very engaged.', author: 'Taylor Kim'}
        ], 
        nurtureSettings: { autoNurture: true, cadence: 'Monthly', contentType: 'Industry Insights' }, 
        communitySettings: { newsletter: true, eventInvites: true } 
    },
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
    tags: [TagType.Referral],
    referrer: { name: 'Morgan Lee', employeeId: 'E-1234' },
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
    onboardingChecklist: [
      { id: '1', task: 'Send Welcome Kit', stakeholder: 'HR', completed: false },
      { id: '2', task: 'Provision Laptop', stakeholder: 'IT', completed: false },
    ],
  },
];

const MOCK_SCORECARD: Scorecard = {
  competencies: [
    { id: 'c1', name: 'Product Vision', description: 'Ability to define a compelling product strategy and roadmap.' },
    { id: 'c2', name: 'User Empathy', description: 'Deep understanding of user needs and ability to advocate for them.' },
    { id: 'c3', name: 'Technical Acumen', description: 'Can effectively communicate with engineering and understand technical constraints.' },
    { id: 'c4', name: 'Data-Driven Decisions', description: 'Uses data and metrics to inform product choices and measure success.' }
  ]
};

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
    scorecard: MOCK_SCORECARD,
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
    approvalWorkflow: [{ stage: 'Finance Approval', approver: 'Jordan Lee', status: 'Pending' }],
  },
  {
    id: 103,
    title: 'Internal Product Strategy Lead',
    department: 'Product',
    status: JobStatus.Open,
    description: 'An internal opportunity for a seasoned product manager to lead a new strategic initiative. This role is not open to external candidates.',
    requiredSkills: ['Product Strategy', 'Internal Stakeholder Management', 'Market Analysis'],
    applications: 3,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    hiringManager: 'Jordan Lee',
    recruiter: 'Taylor Kim',
    budget: { salaryMin: 160000, salaryMax: 190000, currency: 'USD', budgetCode: 'PROD-INT-01' },
    approvalWorkflow: [{ stage: 'VP Approval', approver: 'Alex Rivera', status: 'Approved' }],
    internalOnly: true,
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
    [PipelineStage.Applied]: [2],
    [PipelineStage.TechnicalInterview]: [1],
    [PipelineStage.Hired]: [3],
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
  },
  {
    id: 'int-2',
    candidateId: 3,
    jobId: 101,
    stage: 'Technical Interview',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    interviewers: [
      { name: 'Dana Scully', role: 'Lead Engineer', status: InterviewerStatus.Confirmed },
    ],
    status: InterviewStatus.Completed,
    feedbackSubmitted: true,
    feedback: [
      {
        interviewerName: 'Dana Scully',
        submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        overallRecommendation: 'Hire',
        summary: "Casey has a strong design sense and user-centric approach. Communication was clear and they handled technical questions well. Some gaps in deep systems thinking but very coachable.",
        ratings: [
          { competencyId: 'c1', rating: 4, notes: 'Good vision for the feature we discussed.' },
          { competencyId: 'c2', rating: 5, notes: 'Excellent empathy, constantly brought the conversation back to the user.' },
          { competencyId: 'c3', rating: 3, notes: 'Understands APIs but not database architecture deeply.' },
          { competencyId: 'c4', rating: 4, notes: 'Referenced A/B testing and metric-driven design in their examples.' }
        ]
      }
    ]
  },
  {
    id: 'int-3',
    candidateId: 2,
    jobId: 101,
    stage: 'Phone Screen',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
    interviewers: [{ name: 'Taylor Kim', role: 'Recruiter', status: InterviewerStatus.Confirmed }],
    status: InterviewStatus.Completed,
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
    approvalChain: [{ role: 'Finance', approver: 'Jordan Lee', status: ApprovalStatus.Pending, notes: "Checking budget for increase." }],
    competitiveIntel: ["Received a competing offer from a FAANG company.", "Candidate is a top priority for the hiring manager."],
  },
  {
    id: 'offer-3',
    candidateId: 1,
    jobId: 101,
    status: OfferStatus.PendingApproval,
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    currentCompensation: { baseSalary: 170000, bonus: 18000, equity: '6,000 RSUs' },
    negotiationHistory: [{ date: new Date().toISOString(), author: 'Company', compensation: { baseSalary: 170000 } }],
    approvalChain: [
      { role: 'VP of Product', approver: 'Jordan Lee', status: ApprovalStatus.Approved },
      { role: 'Finance', approver: 'Alex Rivera', status: ApprovalStatus.Approved }
    ],
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

export const MOCK_EEO_DATA: EEOData = {
  [PipelineStage.Applied]: {
    Gender: { 'Male': 520, 'Female': 460, 'Non-binary': 20, 'Undeclared': 50 },
    Ethnicity: { 'White': 400, 'Asian': 250, 'Hispanic': 150, 'Black': 120, 'Two or more': 50, 'Undeclared': 80 }
  },
  [PipelineStage.PhoneScreen]: {
    Gender: { 'Male': 104, 'Female': 92, 'Non-binary': 4, 'Undeclared': 10 },
    Ethnicity: { 'White': 85, 'Asian': 50, 'Hispanic': 30, 'Black': 25, 'Two or more': 10, 'Undeclared': 10 }
  },
  [PipelineStage.TechnicalInterview]: {
    Gender: { 'Male': 55, 'Female': 40, 'Non-binary': 2, 'Undeclared': 3 },
    Ethnicity: { 'White': 48, 'Asian': 28, 'Hispanic': 12, 'Black': 8, 'Two or more': 2, 'Undeclared': 2 }
  },
  [PipelineStage.FinalInterview]: {
    Gender: { 'Male': 25, 'Female': 18, 'Non-binary': 1, 'Undeclared': 1 },
    Ethnicity: { 'White': 22, 'Asian': 13, 'Hispanic': 5, 'Black': 3, 'Two or more': 1, 'Undeclared': 1 }
  },
  [PipelineStage.Offer]: {
    Gender: { 'Male': 12, 'Female': 8, 'Non-binary': 0, 'Undeclared': 0 },
    Ethnicity: { 'White': 11, 'Asian': 6, 'Hispanic': 2, 'Black': 1, 'Two or more': 0, 'Undeclared': 0 }
  },
  [PipelineStage.Hired]: {
    Gender: { 'Male': 9, 'Female': 6, 'Non-binary': 0, 'Undeclared': 0 },
    Ethnicity: { 'White': 8, 'Asian': 4, 'Hispanic': 2, 'Black': 1, 'Two or more': 0, 'Undeclared': 0 }
  }
};

export const MOCK_REFERRALS: Referral[] = [
  {
    id: 'ref-1',
    referrerName: 'Taylor Kim',
    candidateName: 'Jordan Smith',
    candidateEmail: 'j.smith@example.com',
    jobId: 101,
    submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: PipelineStage.TechnicalInterview,
    bonusAmount: 5000,
    bonusStatus: 'Eligible on Hire',
  },
  {
    id: 'ref-2',
    referrerName: 'Taylor Kim',
    candidateName: 'Chris Green',
    candidateEmail: 'c.green@example.com',
    jobId: 102,
    submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Rejected',
    bonusAmount: 2000,
    bonusStatus: 'Not Eligible',
  },
  {
    id: 'ref-3',
    referrerName: 'Taylor Kim',
    candidateName: 'Pat Johnson',
    candidateEmail: 'p.johnson@example.com',
    jobId: 101,
    submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'In Review',
    bonusAmount: 5000,
    bonusStatus: 'Eligible on Hire',
  },
];


export const MOCK_SENT_EMAILS: SentEmail[] = [
  {
    id: 'email-1',
    candidateId: 1,
    candidateName: 'Morgan Lee',
    jobTitle: 'Senior Product Manager',
    subject: 'Following up on your application',
    body: 'Hi Morgan, Just a quick follow-up on your application...',
    templateType: EmailTemplateType.FollowUp,
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: EmailStatus.Opened,
  },
  {
    id: 'email-2',
    candidateId: 2,
    candidateName: 'Alex Rivera',
    jobTitle: 'Senior Product Manager',
    subject: 'Update on your application for Senior Product Manager at Innovate Inc.',
    body: 'Hi Alex, While your experience is impressive, we decided to move forward with other candidates...',
    templateType: EmailTemplateType.Rejection,
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: EmailStatus.Sent,
  },
   {
    id: 'email-3',
    candidateId: 3,
    candidateName: 'Casey Chen',
    jobTitle: 'Senior Product Manager',
    subject: 'Interview Invitation for Senior Product Manager',
    body: 'Hi Casey, We were impressed with your background and would like to invite you for an interview...',
    templateType: EmailTemplateType.InterviewInvite,
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: EmailStatus.Replied,
    abTestVariant: 'A',
  },
];
export const MOCK_SEQUENCES: EmailSequence[] = [
  {
    id: 'seq-1',
    name: 'Passive Backend Candidate Nurture',
    description: 'A 3-step sequence to engage passive backend engineering talent over 30 days.',
    steps: [
      { day: 1, subject: 'Connecting with top engineering talent', template: 'Initial Outreach' },
      { day: 7, subject: '[Company News] Our latest engineering blog post', template: 'Value Add' },
      { day: 30, subject: 'Checking in', template: 'Follow-up' },
    ]
  },
  {
    id: 'seq-2',
    name: 'Silver Medalist Keep-Warm',
    description: 'A quarterly check-in for high-potential candidates who previously made it to final rounds.',
    steps: [
      { day: 1, subject: 'Keeping in touch', template: 'Post-Interview Follow-up' },
      { day: 90, subject: 'New roles at Innovate Inc.', template: 'New Opportunities' },
    ]
  }
];