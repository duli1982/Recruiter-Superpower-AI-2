export enum Tab {
  AIAssistant = 'AI_ASSISTANT',
  InsightJudgment = 'INSIGHT_JUDGMENT',
  JobRequisitions = 'JOB_REQUISITIONS',
  CandidateProfiles = 'CANDIDATE_PROFILES',
  CandidatePipeline = 'CANDIDATE_PIPELINE',
  CandidateExperience = 'CANDIDATE_EXPERIENCE',
  PerformanceCreativity = 'PERFORMANCE_CREATIVITY',
  AdoptionCommunity = 'ADOPTION_COMMUNITY',
  PredictiveAnalytics = 'PREDICTIVE_ANALYTICS',
  DiversityEthics = 'DIVERSITY_ETHICS',
  ProactiveSourcing = 'PROACTIVE_SOURCING',
  AdvancedInteraction = 'ADVANCED_INTERACTION',
  IntegrationUpskilling = 'INTEGRATION_UPSKILLING',
}

export enum TagType {
    Internal = 'Internal',
    Passive = 'Passive',
    Referral = 'Referral',
    HighPriority = 'High Priority',
}

export enum CandidateStatus {
    Active = 'Active',
    Passive = 'Passive',
    Interviewing = 'Interviewing',
    Hired = 'Hired',
    DoNotContact = 'Do Not Contact',
}

export interface ApplicationHistory {
    jobId: number;
    jobTitle: string;
    stageReached: string;
    dateApplied: string; // ISO 8601 string
    outcome: 'Withdrew' | 'Rejected' | 'Hired' | 'In Progress';
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  skills: string; // Comma-separated for simplicity
  resumeSummary: string;
  experience?: number; // in years
  location?: string;
  availability?: string; // e.g., 'Immediate', '2 Weeks Notice'
  tags?: string[];
  // NEW FIELDS
  status: CandidateStatus;
  lastContactDate?: string; // ISO 8601 string
  source?: string; // e.g., 'LinkedIn', 'Referral', 'Career Page'
  compensation?: {
    currentSalary?: number;
    salaryExpectation?: number;
    negotiationNotes?: string;
  };
  visaStatus?: string; // e.g., 'US Citizen', 'H1-B', 'Needs Sponsorship'
  applicationHistory?: ApplicationHistory[];
}

export interface RankedCandidate {
  id: number;
  name: string;
  rank: number;
  matchScore: number;
  reasoning: string;
  cultureFit: string;
}

export interface BiasAuditReport {
  suggestions: {
    originalText: string;
    suggestion: string;
    explanation: string;
  }[];
  overallScore: number;
  summary: string;
}

export enum JobStatus {
    PendingApproval = 'Pending Approval',
    Open = 'Open',
    OnHold = 'On Hold',
    Closed = 'Closed',
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ApprovalStep {
    stage: string;
    approver: string;
    status: ApprovalStatus;
    timestamp?: string; // ISO 8601 string
}

export interface JobRequisition {
    id: number;
    title: string;
    department: string;
    status: JobStatus;
    requiredSkills: string[];
    description: string;
    applications: number; // For visualization mock
    // New fields for advanced requisition management
    hiringManager: string;
    createdAt: string; // ISO 8601 string, for aging
    budget: {
        salaryMin: number;
        salaryMax: number;
        currency: 'USD';
        budgetCode: string;
    };
    approvalWorkflow: ApprovalStep[];
}


export enum EmailTemplateType {
    Rejection = 'Rejection',
    InterviewInvite = 'Interview Invitation',
    FollowUp = 'General Follow-up',
}

export enum InterviewStage {
    PhoneScreen = '30-Minute Phone Screen',
    TechnicalInterview = '60-Minute Technical Interview',
    HiringManager = '45-Minute Hiring Manager Interview',
    FinalRound = '2-Hour Final Round Panel',
}

export enum PipelineStage {
    Applied = 'Applied',
    PhoneScreen = 'Phone Screen',
    TechnicalInterview = 'Technical Interview',
    FinalInterview = 'Final Interview',
    Offer = 'Offer',
    Hired = 'Hired',
}

export interface ScoutedCandidate {
  id: string;
  name: string;
  currentRole: string;
  currentCompany: string;
  matchScore: number;
  intentSignal: string;
  engagementSuggestion: string;
}

export interface IndividualCandidateReport {
  id: number;
  name: string;
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  reasoning: string;
}

export interface AIGroupAnalysisReport {
  combinedSummary: string;
  collectiveStrengths: string[];
  potentialGaps: string[];
  suggestedRoles: string[];
  individualAnalysis: IndividualCandidateReport[];
}

export interface CommunityPrompt {
  id: number;
  title: string;
  description: string;
  promptText: string;
  author: string;
  upvotes: number;
  usageCount: number;
  targetFeature: Tab; // Link the prompt to a specific feature/tab
  tags: string[];
}

// New types for Predictive Analytics
export interface HiringForecast {
  roleTitle: string;
  department: string;
  demandScore: number; // e.g., 0-100
  reasoning: string;
}

export interface SkillGap {
  skill: string;
  demandLevel: 'High' | 'Medium' | 'Low';
  supplyLevel: 'High' | 'Medium' | 'Low' | 'Very Low';
  severity: 'Critical' | 'Moderate' | 'Minor';
}

export interface MarketTrend {
  insight: string;
  impact: string;
}

export interface PredictiveAnalysisReport {
  generatedAt: string; // ISO 8601 string
  hiringForecasts: HiringForecast[];
  skillGaps: SkillGap[];
  marketTrends: MarketTrend[];
}

export type RefinableSourcingField = 'creativeKeywords' | 'alternativeJobTitles' | 'sampleOutreachMessage';

export interface SourcingStrategy {
  creativeKeywords: string[];
  alternativeJobTitles: string[];
  untappedChannels: {
    channel: string;
    reasoning:string;
  }[];
  sampleOutreachMessage: string;
}