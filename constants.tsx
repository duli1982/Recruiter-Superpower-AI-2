import React from 'react';
import { Tab, Candidate, JobRequisition, JobStatus, PipelineStage, TagType, CommunityPrompt, CandidateStatus, EmailSequence, SentEmail, EmailStatus, EmailTemplateType } from './types';

// SVG Icons as React Components
const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.09 16.05A6.5 6.5 0 0 1 8.94 9.9M9 9h.01M4.93 4.93l.01.01M2 12h.01M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 2v.01M19.07 4.93l-.01.01M22 12h-.01M19.07 19.07l-.01-.01M12 22v-.01" /></svg>;
const SmileIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;
const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const GridIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>;
const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const LayoutGridIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>;


// FIX: Changed icon type from JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
export const TABS: { id: Tab; name: string; icon: React.ReactElement, description: string }[] = [
  { id: Tab.AIAssistant, name: 'AI Assistant', icon: <ZapIcon className="h-5 w-5" />, description: "Automate tasks like data entry, email drafting, and scheduling." },
  { id: Tab.InsightJudgment, name: 'Insight & Judgment', icon: <LightbulbIcon className="h-5 w-5" />, description: "Amplify your advisory skills with AI-powered insights and predictions."},
  { id: Tab.JobRequisitions, name: 'Job Requisitions', icon: <BriefcaseIcon className="h-5 w-5" />, description: "Manage and track job statuses with AI-driven suggestions."},
  { id: Tab.CandidateProfiles, name: 'Candidate Profiles', icon: <ProfileIcon className="h-5 w-5" />, description: "View, add, and manage detailed candidate profiles." },
  { id: Tab.CandidatePipeline, name: 'Candidate Pipeline', icon: <LayoutGridIcon className="h-5 w-5" />, description: "Visualize and manage your hiring workflow with a drag-and-drop Kanban board." },
  { id: Tab.CandidateExperience, name: 'Candidate Experience', icon: <SmileIcon className="h-5 w-5" />, description: "Fix broken processes and deliver a personalized candidate journey."},
  { id: Tab.PerformanceCreativity, name: 'Performance & Creativity', icon: <BarChartIcon className="h-5 w-5" />, description: "Track your performance and get creative sourcing ideas from AI."},
  { id: Tab.AdoptionCommunity, name: 'Adoption & Community', icon: <UsersIcon className="h-5 w-5" />, description: "Learn AI skills and collaborate with peers by sharing prompts."},
  { id: Tab.PredictiveAnalytics, name: 'Predictive Analytics', icon: <TrendingUpIcon className="h-5 w-5" />, description: "Forecast future hiring needs and identify skill gaps proactively."},
  { id: Tab.DiversityEthics, name: 'Diversity & Ethics', icon: <ShieldIcon className="h-5 w-5" />, description: "Reduce bias in your hiring process and build more inclusive teams."},
  { id: Tab.ProactiveSourcing, name: 'Proactive Sourcing', icon: <SearchIcon className="h-5 w-5" />, description: "Find and engage passive candidates with AI-powered intent signals."},
  { id: Tab.AdvancedInteraction, name: 'Advanced Interaction', icon: <MicIcon className="h-5 w-5" />, description: "Leverage voice AI and autonomous agents for next-level screening."},
  { id: Tab.IntegrationUpskilling, name: 'Integration & Upskilling', icon: <GridIcon className="h-5 w-5" />, description: "Scale your impact through seamless integrations and personalized learning."},
];

export const MOCK_CANDIDATES: Candidate[] = [
    { 
        id: 1, 
        name: 'Alex Johnson', 
        email: 'alex.j@example.com', 
        phone: '123-456-7890', 
        skills: 'React, Node.js, AWS, CI/CD, TypeScript', 
        resumeSummary: '10+ years of experience in full-stack development (React, Node.js). Led a team of 5 engineers at a major tech firm. Strong background in cloud architecture (AWS) and CI/CD pipelines. Proven track record of delivering complex projects on time.', 
        experience: 10, 
        location: 'San Francisco, CA', 
        availability: '2 Weeks Notice', 
        tags: [TagType.HighPriority, TagType.Passive],
        status: CandidateStatus.Interviewing,
        lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'LinkedIn Recruiter',
        compensation: {
            currentSalary: 170000,
            salaryExpectation: 180000,
            negotiationNotes: 'Firm on expectation, but open to sign-on bonus.'
        },
        visaStatus: 'US Citizen',
        gender: 'Male',
        applicationHistory: [
            { jobId: 101, jobTitle: 'Senior Frontend Engineer', stageReached: 'Technical Interview', dateApplied: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), outcome: 'In Progress' }
        ]
    },
    { 
        id: 2, 
        name: 'Brenda Smith', 
        email: 'brenda.s@example.com', 
        phone: '234-567-8901', 
        skills: 'React, TypeScript, UI/UX, Design Systems, Jest', 
        resumeSummary: 'Senior Frontend Engineer with 8 years of expertise in React, TypeScript, and modern state management libraries. Passionate about UI/UX and design systems. Contributed to open-source projects and speaks at tech conferences.', 
        experience: 8, 
        location: 'New York, NY', 
        availability: '1 Month Notice', 
        tags: [TagType.Referral],
        status: CandidateStatus.Passive,
        lastContactDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Referral by J. Doe',
        compensation: {
            currentSalary: 155000,
            salaryExpectation: 165000,
        },
        visaStatus: 'Green Card',
        gender: 'Female',
        applicationHistory: [
             { jobId: 103, jobTitle: 'UX/UI Designer', stageReached: 'Initial Screen', dateApplied: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), outcome: 'Withdrew' }
        ]
    },
    { 
        id: 3, 
        name: 'Charles Davis', 
        email: 'charles.d@example.com', 
        phone: '345-678-9012', 
        skills: 'Python, Django, Flask, PostgreSQL, Microservices', 
        resumeSummary: 'Mid-level Backend Engineer with 4 years of experience in Python (Django, Flask) and database management (PostgreSQL). Eager to grow into a senior role. Experience with microservices and RESTful APIs. Quick learner and team player.', 
        experience: 4, 
        location: 'Austin, TX', 
        availability: 'Immediate', 
        tags: [],
        status: CandidateStatus.Active,
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Career Page',
        compensation: {
            salaryExpectation: 120000,
        },
        visaStatus: 'H1-B (Transfer)',
        gender: 'Male',
        applicationHistory: [
            { jobId: 102, jobTitle: 'Product Manager, Growth', stageReached: 'Applied', dateApplied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), outcome: 'In Progress' }
        ]
    },
    { 
        id: 4, 
        name: 'Diana Miller', 
        email: 'diana.m@example.com', 
        phone: '456-789-0123', 
        skills: 'React, Firebase, JavaScript, HTML, CSS', 
        resumeSummary: 'Recent computer science graduate with internship experience at a startup. Built several projects using React and Firebase. Strong foundation in algorithms and data structures. Highly motivated and looking for a challenging frontend role.', 
        experience: 1, 
        location: 'Remote', 
        availability: 'Immediate', 
        tags: [TagType.Internal],
        status: CandidateStatus.Hired,
        lastContactDate: new Date('2024-03-15T00:00:00.000Z').toISOString(),
        source: 'University Career Fair',
        compensation: {
            currentSalary: 95000,
            salaryExpectation: 95000,
        },
        visaStatus: 'Needs Sponsorship (F1-OPT)',
        gender: 'Female',
        applicationHistory: [
            { jobId: 104, jobTitle: 'DevOps Engineer', stageReached: 'Hired', dateApplied: new Date('2024-01-20T00:00:00.000Z').toISOString(), outcome: 'Hired' }
        ]
    },
    { 
        id: 5, 
        name: 'Frank Green', 
        email: 'frank.g@example.com', 
        phone: '567-890-1234', 
        skills: 'Kubernetes, Terraform, AWS, CI/CD, Go', 
        resumeSummary: 'Experienced DevOps Engineer with 7 years in cloud infrastructure and automation. Specializes in Kubernetes orchestration and Infrastructure as Code with Terraform. Proven ability to build scalable and resilient systems on AWS.', 
        experience: 7, 
        location: 'Seattle, WA', 
        availability: '1 Month Notice', 
        tags: [TagType.Passive],
        status: CandidateStatus.Passive,
        lastContactDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'LinkedIn Recruiter',
        gender: 'Male',
        visaStatus: 'US Citizen',
    },
    { 
        id: 6, 
        name: 'George Harris', 
        email: 'george.h@example.com', 
        phone: '678-901-2345', 
        skills: 'Python, Django, Microservices, RabbitMQ, Docker', 
        resumeSummary: 'Senior Backend Engineer with a focus on building distributed systems. Proficient in Python (Django) and designing scalable microservice architectures. Experience with message queuing systems like RabbitMQ and containerization with Docker.', 
        experience: 9, 
        location: 'Chicago, IL', 
        availability: '3 Weeks Notice', 
        tags: [TagType.Referral],
        status: CandidateStatus.Interviewing,
        lastContactDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Referral by B. Smith',
        gender: 'Male',
        visaStatus: 'Green Card',
    }
];

export const MOCK_JOB_REQUISITIONS: JobRequisition[] = [
    { 
        id: 101, 
        title: 'Senior Frontend Engineer', 
        department: 'Engineering', 
        status: JobStatus.Open, 
        requiredSkills: ['React', 'TypeScript', 'AWS'], 
        description: 'Looking for an experienced frontend engineer to lead our new platform development.', 
        applications: 78,
        hiringManager: 'Casey Newton',
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
        budget: { salaryMin: 150000, salaryMax: 190000, currency: 'USD', budgetCode: 'ENG-FE-Q324-01' },
        approvalWorkflow: [
            { stage: 'Hiring Manager Approval', approver: 'Casey Newton', status: 'Approved', timestamp: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString() },
            { stage: 'Finance Approval', approver: 'Alex Rivera', status: 'Approved', timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() },
            { stage: 'VP Approval', approver: 'Jordan Lee', status: 'Approved', timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() },
        ]
    },
    { 
        id: 102, 
        title: 'Product Manager, Growth', 
        department: 'Product', 
        status: JobStatus.PendingApproval, 
        requiredSkills: ['A/B Testing', 'SQL', 'Mixpanel'], 
        description: 'Join our growth team to drive user acquisition and retention strategies.', 
        applications: 0,
        hiringManager: 'Taylor Smith',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        budget: { salaryMin: 130000, salaryMax: 160000, currency: 'USD', budgetCode: 'PROD-GR-Q324-05' },
        approvalWorkflow: [
            { stage: 'Hiring Manager Approval', approver: 'Taylor Smith', status: 'Approved', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { stage: 'Finance Approval', approver: 'Alex Rivera', status: 'Pending' },
            { stage: 'VP Approval', approver: 'Jordan Lee', status: 'Pending' },
        ]
    },
    { 
        id: 103, 
        title: 'UX/UI Designer', 
        department: 'Design', 
        status: JobStatus.OnHold, 
        requiredSkills: ['Figma', 'Prototyping', 'User Research'], 
        description: 'Hiring on hold pending Q3 budget approval for a new designer.', 
        applications: 32,
        hiringManager: 'Morgan Kelly',
        createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(), // 95 days ago
        budget: { salaryMin: 110000, salaryMax: 140000, currency: 'USD', budgetCode: 'DES-UX-Q224-11' },
        approvalWorkflow: [
             { stage: 'Hiring Manager Approval', approver: 'Morgan Kelly', status: 'Approved', timestamp: new Date(Date.now() - 96 * 24 * 60 * 60 * 1000).toISOString() },
            { stage: 'Finance Approval', approver: 'Alex Rivera', status: 'Approved', timestamp: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString() },
            { stage: 'VP Approval', approver: 'Jordan Lee', status: 'Approved', timestamp: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString() },
        ]
    },
    { 
        id: 104, 
        title: 'DevOps Engineer', 
        department: 'Engineering', 
        status: JobStatus.Closed, 
        requiredSkills: ['Kubernetes', 'Terraform', 'CI/CD'], 
        description: 'Position filled in Q1. Candidate started on March 15th.', 
        applications: 123,
        hiringManager: 'Casey Newton',
        createdAt: new Date('2024-01-15T00:00:00.000Z').toISOString(),
        budget: { salaryMin: 160000, salaryMax: 200000, currency: 'USD', budgetCode: 'ENG-DO-Q124-02' },
        approvalWorkflow: [
            { stage: 'Hiring Manager Approval', approver: 'Casey Newton', status: 'Approved' },
            { stage: 'Finance Approval', approver: 'Alex Rivera', status: 'Approved' },
            { stage: 'VP Approval', approver: 'Jordan Lee', status: 'Approved' },
        ]
    },
    { 
        id: 105, 
        title: 'Data Scientist', 
        department: 'Data & Analytics', 
        status: JobStatus.Open, 
        requiredSkills: ['Python', 'Machine Learning', 'Spark'], 
        description: 'Seeking a data scientist to build predictive models for customer behavior.', 
        applications: 61,
        hiringManager: 'Sam Altman',
        createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(), // 65 days ago
        budget: { salaryMin: 140000, salaryMax: 175000, currency: 'USD', budgetCode: 'DATA-DS-Q224-09' },
        approvalWorkflow: [
            { stage: 'Hiring Manager Approval', approver: 'Sam Altman', status: 'Approved' },
            { stage: 'Finance Approval', approver: 'Alex Rivera', status: 'Approved' },
            { stage: 'VP Approval', approver: 'Jordan Lee', status: 'Approved' },
        ]
    },
];


export const MOCK_JOB_DESCRIPTION = `
Position: Senior Frontend Engineer (React)

We are seeking a passionate and experienced Senior Frontend Engineer to join our dynamic team. In this role, you will be responsible for building and maintaining our user-facing web applications using React and TypeScript. You will work closely with our product and design teams to create intuitive and performant user experiences.

Key Responsibilities:
- Develop new user-facing features using React.js and TypeScript.
- Build reusable components and front-end libraries for future use.
- Translate designs and wireframes into high-quality code.
- Optimize components for maximum performance across a vast array of web-capable devices and browsers.
- Mentor junior engineers and contribute to our team's best practices.

Qualifications:
- 5+ years of professional experience in frontend development.
- Strong proficiency in JavaScript, TypeScript, CSS, and HTML.
- Deep understanding of React.js and its core principles.
- Experience with popular React.js workflows (such as Redux or Context API).
- Familiarity with modern front-end build pipelines and tools (e.g., Webpack, Babel, NPM).
- Excellent communication and teamwork skills.
`;

export const MOCK_BIASED_JOB_DESCRIPTION = `
Position: Rockstar Senior Frontend Ninja

We're looking for a young, energetic coding ninja to join our fast-paced brotherhood. The ideal candidate will be a recent grad from a top-tier university who can work long hours and crush code. He must be a dominant force on the keyboard and a true hacker at heart.

Responsibilities:
- Man the front lines of our UI development.
- Work tirelessly to meet aggressive deadlines.
- Hunt down bugs with killer instincts.

Requirements:
- Must be a digital native.
- He should have at least 10 years of React experience.
- A competitive, work-hard-play-hard attitude is a must.
`;

export const PIPELINE_STAGES = [
    PipelineStage.Applied,
    PipelineStage.PhoneScreen,
    PipelineStage.TechnicalInterview,
    PipelineStage.FinalInterview,
    PipelineStage.Offer,
    PipelineStage.Hired,
];

export const MOCK_PIPELINE_DATA: { [jobId: number]: { [stage in PipelineStage]?: number[] } } = {
    101: { // Senior Frontend Engineer
        [PipelineStage.Applied]: [4],
        [PipelineStage.PhoneScreen]: [2],
        [PipelineStage.TechnicalInterview]: [1, 6],
    },
    102: { // Product Manager
        [PipelineStage.Applied]: [3],
    },
    105: { // Data Scientist
        // No candidates yet
    }
};

export const MOCK_COMMUNITY_PROMPTS: CommunityPrompt[] = [
    {
        id: 1,
        title: "Find Senior Go Developers with K8s experience",
        description: "A prompt for the AI Talent Scout to find experienced backend developers who are likely to be open to new roles.",
        promptText: "Job Title: Senior Backend Engineer, Skills: Go, Kubernetes, AWS, PostgreSQL, Location: Remote, Experience: Senior (5-8 years)",
        author: "Alex",
        upvotes: 42,
        usageCount: 112,
        targetFeature: Tab.ProactiveSourcing,
        tags: ["Sourcing", "Backend", "Go"]
    },
    {
        id: 2,
        title: "Empathetic Rejection Email for Strong Candidates",
        description: "A template for the AI Email Composer that provides constructive feedback for a candidate who was a strong contender but not a perfect fit.",
        promptText: "While their experience in X was impressive, we decided to move forward with candidates whose backgrounds in Y more closely align with the specific technical requirements of this role. Mention their great communication skills during the interview.",
        author: "Jordan",
        upvotes: 78,
        usageCount: 254,
        targetFeature: Tab.AIAssistant,
        tags: ["Email", "Candidate Experience", "Rejection"]
    },
    {
        id: 3,
        title: "Audit Job Description for Gender-Neutral Language",
        description: "Use this with the Bias Auditor to specifically check for and replace gendered language in a job description.",
        promptText: "Analyze the following job description for gendered language (e.g., he/she, chairman, brotherhood) and suggest neutral alternatives.",
        author: "Taylor",
        upvotes: 55,
        usageCount: 98,
        targetFeature: Tab.DiversityEthics,
        tags: ["DEI", "Job Description", "Bias"]
    },
    {
        id: 4,
        title: "Rank Frontend Candidates for a Design-Focused Role",
        description: "A prompt for the Matchmaking Oracle that prioritizes UI/UX skills and experience with design systems.",
        promptText: "We are looking for a Senior Frontend Engineer who is passionate about pixel-perfect UI and has proven experience building and maintaining design systems. Rank candidates based on their expertise in React, TypeScript, and their demonstrated eye for UI/UX.",
        author: "Casey",
        upvotes: 31,
        usageCount: 76,
        targetFeature: Tab.InsightJudgment,
        tags: ["Ranking", "Frontend", "UI/UX"]
    }
];

export const MOCK_SEQUENCES: EmailSequence[] = [
    {
        id: 'seq-1',
        name: 'Passive Backend Engineer Outreach',
        description: 'A 3-step sequence to engage passive backend candidates over 7 days.',
        steps: [
            { day: 1, templateType: EmailTemplateType.FollowUp, subject: 'Opportunity at Innovate Inc.', keyPoints: 'Saw your profile, impressed with your Go & K8s work. We are building something exciting in the cloud-native space. Open to a quick chat?' },
            { day: 4, templateType: EmailTemplateType.FollowUp, subject: 'Re: Opportunity at Innovate Inc.', keyPoints: 'Just wanted to follow up on my previous message. We just released a blog post about our scaling challenges that might interest you. [link]' },
            { day: 7, templateType: EmailTemplateType.FollowUp, subject: 'Final Follow-up', keyPoints: 'Checking in one last time. If the timing isn\'t right, no worries at all. Feel free to connect on LinkedIn to stay in touch for future opportunities.' },
        ]
    },
    {
        id: 'seq-2',
        name: 'Post-Interview Follow-up',
        description: 'Keep candidates warm after the final interview round.',
        steps: [
            { day: 1, templateType: EmailTemplateType.FollowUp, subject: 'Following up on your interview', keyPoints: 'It was great speaking with you! The team was very impressed. We are finalizing our decision process and will have an update for you within 3 business days.' },
            { day: 4, templateType: EmailTemplateType.FollowUp, subject: 'Quick Update', keyPoints: 'Just a quick note to let you know you are still a top candidate and we appreciate your patience. We expect to have a final decision by tomorrow.' },
        ]
    }
];

export const MOCK_SENT_EMAILS: SentEmail[] = [
    {
        id: 'email-1',
        candidateId: 2,
        candidateName: 'Brenda Smith',
        jobTitle: 'Senior Frontend Engineer',
        subject: 'Re: Your application for Senior Frontend Engineer',
        body: '...',
        templateType: EmailTemplateType.FollowUp,
        sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        status: EmailStatus.Sent,
    },
    {
        id: 'email-2',
        candidateId: 1,
        candidateName: 'Alex Johnson',
        jobTitle: 'Senior Frontend Engineer',
        subject: 'Invitation to interview at Innovate Inc.',
        body: '...',
        templateType: EmailTemplateType.InterviewInvite,
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        status: EmailStatus.Opened,
        abTestVariant: 'A',
    },
    {
        id: 'email-3',
        candidateId: 3,
        candidateName: 'Charles Davis',
        jobTitle: 'Product Manager, Growth',
        subject: 'An opportunity with our Product team',
        body: '...',
        templateType: EmailTemplateType.FollowUp,
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        status: EmailStatus.Clicked,
        abTestVariant: 'B',
        sequenceId: 'seq-1',
        sequenceStep: 1,
    },
    {
        id: 'email-4',
        candidateId: 4,
        candidateName: 'Diana Miller',
        jobTitle: 'DevOps Engineer',
        subject: 'Update on your application',
        body: '...',
        templateType: EmailTemplateType.Rejection,
        sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        status: EmailStatus.Replied,
    },
];