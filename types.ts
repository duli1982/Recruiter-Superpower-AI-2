export enum Tab {
  AIAssistant = 'AI_ASSISTANT',
  InsightJudgment = 'INSIGHT_JUDGMENT',
  JobRequisitions = 'JOB_REQUISITIONS',
  CandidateProfiles = 'CANDIDATE_PROFILES',
  CandidatePipeline = 'CANDIDATE_PIPELINE',
  OfferManagement = 'OFFER_MANAGEMENT',
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
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
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
  predictedTimeToFill: number;
  estimatedRecruitingCost: number;
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

export interface CompetitiveInsight {
  observation: string;
  implication: string;
}

export interface DiversityMetric {
  department: string;
  metric: string; // e.g., "Male Representation"
  value: string; // e.g., "85%"
  insight: string;
}

export interface PredictiveAnalysisReport {
  generatedAt: string; // ISO 8601 string
  hiringForecasts: HiringForecast[];
  skillGaps: SkillGap[];
  marketTrends: MarketTrend[];
  competitiveIntelligence: CompetitiveInsight[];
  diversityAnalysis: DiversityMetric[];
}

export type RefinableSourcingField = 'creativeKeywords' | 'alternativeJobTitles' | 'sampleOutreachMessage';


// New types for advanced sourcing and boolean search
export interface BooleanSearchQuery {
  mustHave: string[];
  niceToHave: string[];
  exclude: string[];
  jobTitle: string;
  location: string;
  currentCompanies: string[];
  pastCompanies: string[];
  experience: {
    min: number;
    max: number;
  };
}

export interface SourcingStrategy {
  masterBooleanString: string;
  platformSpecificStrings: {
    platform: 'LinkedIn' | 'GitHub' | 'General';
    query: string;
  }[];
  creativeKeywords: string[];
  alternativeJobTitles: string[];
  untappedChannels: {
    channel: string;
    reasoning:string;
  }[];
  sampleOutreachMessage: string;
}

// New types for advanced email features
export enum EmailStatus {
    Draft = 'Draft',
    Sent = 'Sent',
    Opened = 'Opened',
    Clicked = 'Clicked',
    Replied = 'Replied',
    Bounced = 'Bounced',
}

export interface SentEmail {
    id: string;
    candidateId: number;
    candidateName: string;
    jobTitle: string;
    subject: string;
    body: string;
    templateType: EmailTemplateType;
    sentAt: string; // ISO 8601
    status: EmailStatus;
    abTestVariant?: 'A' | 'B';
    sequenceId?: string;
    sequenceStep?: number;
}

export interface EmailSequenceStep {
    day: number;
    subject: string;
    keyPoints: string;
    templateType: EmailTemplateType;
}

export interface EmailSequence {
    id: string;
    name: string;
    description: string;
    steps: EmailSequenceStep[];
}

// New types for advanced scheduling
export enum InterviewStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Canceled = 'Canceled',
  NoShow = 'No-Show',
}

export interface Interview {
  id: string;
  candidateId: number;
  jobId: number;
  stage: InterviewStage;
  status: InterviewStatus;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  interviewers: string[];
  videoLink: string;
  reminders: {
    twentyFourHour: boolean;
    oneHour: boolean;
    fifteenMin: boolean;
  };
}

export interface InterviewPacket {
  candidateSummary: string;
  roleSummary: string;
  keyFocusAreas: string[];
  suggestedQuestions: {
    behavioral: string[];
    technical: string[];
  };
}

// New types for Offer Management
export enum OfferStatus {
  Draft = 'Draft',
  PendingApproval = 'Pending Approval',
  Sent = 'Sent',
  Negotiating = 'Negotiating',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Expired = 'Expired',
}

export interface OfferCompensation {
  baseSalary: number;
  bonus: number;
  equity: {
    shares: number;
    vestingSchedule: string;
  };
  signOnBonus?: number;
}

export interface NegotiationHistoryItem {
  date: string; // ISO 8601
  author: 'Company' | 'Candidate';
  compensation: OfferCompensation;
  notes?: string;
}

export interface OfferApprovalStep {
    role: string;
    approver: string;
    status: ApprovalStatus;
    timestamp?: string; // ISO 8601
    notes?: string;
}

export interface Offer {
  id: string;
  candidateId: number;
  jobId: number;
  status: OfferStatus;
  startDate: string; // ISO 8601
  expirationDate: string; // ISO 8601
  relocationPackage: number;
  currentCompensation: OfferCompensation;
  approvalChain: OfferApprovalStep[];
  negotiationHistory: NegotiationHistoryItem[];
  competitiveIntel?: string[];
}