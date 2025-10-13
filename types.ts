// This file defines all the core types and enums used throughout the application.

// ========== ENUMS ==========

export enum Tab {
  AIAssistant = 'ai-assistant',
  InsightJudgment = 'insight-judgment',
  JobRequisitions = 'job-requisitions',
  CandidateProfiles = 'candidate-profiles',
  CandidatePipeline = 'candidate-pipeline',
  OfferManagement = 'offer-management',
  CandidateExperience = 'candidate-experience',
  PerformanceCreativity = 'performance-creativity',
  AdoptionCommunity = 'adoption-community',
  PredictiveAnalytics = 'predictive-analytics',
  DiversityEthics = 'diversity-ethics',
  ProactiveSourcing = 'proactive-sourcing',
  AdvancedInteraction = 'advanced-interaction',
  IntegrationUpskilling = 'integration-upskilling',
}

export enum JobStatus {
  Open = 'Open',
  OnHold = 'On Hold',
  Closed = 'Closed',
  PendingApproval = 'Pending Approval',
}

export enum PipelineStage {
  Applied = 'Applied',
  PhoneScreen = 'Phone Screen',
  TechnicalInterview = 'Technical Interview',
  FinalInterview = 'Final Interview',
  Offer = 'Offer',
  Hired = 'Hired',
}

export enum TagType {
  HighPriority = 'High Priority',
  Passive = 'Passive',
  Referral = 'Referral',
  Internal = 'Internal',
}

export enum CandidateStatus {
    Active = 'Active',
    Passive = 'Passive',
    Interviewing = 'Interviewing',
    Hired = 'Hired',
    DoNotContact = 'Do Not Contact'
}

export enum EmailTemplateType {
  Rejection = 'Rejection',
  InterviewInvite = 'Interview Invite',
  FollowUp = 'Follow Up',
}

export enum EmailStatus {
  Sent = 'Sent',
  Opened = 'Opened',
  Clicked = 'Clicked',
  Replied = 'Replied',
  Bounced = 'Bounced',
  Draft = 'Draft',
}

export enum InterviewStage {
  PhoneScreen = 'Phone Screen',
  TechnicalInterview = 'Technical Interview',
  FinalRound = 'Final Round',
}

export enum InterviewStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Canceled = 'Canceled',
  NoShow = 'No-Show',
}

export enum OfferStatus {
  Draft = 'Draft',
  PendingApproval = 'Pending Approval',
  Sent = 'Sent',
  Negotiating = 'Negotiating',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Expired = 'Expired',
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type RelationshipStatus = 'Hot' | 'Warm' | 'Cold' | 'Silver Medalist' | 'Past Candidate';
export type TouchpointType = 'Email' | 'Call' | 'Meeting' | 'Note';
export type NurtureCadence = 'Monthly' | 'Quarterly' | 'Bi-annual';
export type NurtureContentType = 'Company News' | 'Industry Insights' | 'Career Tips' | 'New Roles';

// ========== INTERFACES ==========

export interface ApprovalStep {
    stage: string;
    approver: string;
    status: ApprovalStatus;
    timestamp?: string;
    notes?: string;
}

export interface JobRequisition {
    id: number;
    title: string;
    department: string;
    status: JobStatus;
    requiredSkills: string[];
    description: string;
    applications: number;
    hiringManager: string;
    createdAt: string;
    budget: {
        salaryMin: number;
        salaryMax: number;
        currency: string;
        budgetCode: string;
    };
    approvalWorkflow: ApprovalStep[];
    isLocked?: boolean;
    initialRequiredSkills?: string[];
}

export interface ApplicationHistory {
    jobId: number;
    jobTitle: string;
    stageReached: string;
    dateApplied: string;
    outcome: 'In Progress' | 'Hired' | 'Rejected' | 'Withdrew';
}

export interface Touchpoint {
    id: string;
    date: string;
    type: TouchpointType;
    notes: string;
    author: string;
}

export interface CandidateCRM {
    relationshipStatus: RelationshipStatus;
    nextFollowUpDate?: string;
    relationshipScore: number;
    touchpointHistory: Touchpoint[];
    nurtureSettings: {
        autoNurture: boolean;
        cadence: NurtureCadence;
        contentType: NurtureContentType;
    };
    communitySettings: {
        newsletter: boolean;
        eventInvites: boolean;
    };
}

export interface Candidate {
    id: number;
    name: string;
    email: string;
    phone?: string;
    skills: string;
    resumeSummary: string;
    experience?: number;
    location?: string;
    availability?: string;
    tags?: (TagType | string)[];
    status: CandidateStatus;
    lastContactDate?: string;
    source?: string;
    compensation?: {
        currentSalary?: number;
        salaryExpectation?: number;
        negotiationNotes?: string;
    };
    visaStatus?: string;
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    hasCompetingOffer?: boolean;
    applicationHistory?: ApplicationHistory[];
    crm?: CandidateCRM;
}

export interface CommunityPrompt {
    id: number;
    title: string;
    description: string;
    promptText: string;
    author: string;
    upvotes: number;
    usageCount: number;
    targetFeature: Tab;
    tags: string[];
}

export interface EmailSequence {
    id: string;
    name: string;
    description: string;
    steps: {
        day: number;
        templateType: EmailTemplateType;
        subject: string;
        keyPoints: string;
    }[];
}

export interface SentEmail {
    id: string;
    candidateId: number;
    candidateName: string;
    jobTitle: string;
    subject: string;
    body: string;
    templateType: EmailTemplateType;
    sentAt: string;
    status: EmailStatus;
    abTestVariant?: 'A' | 'B';
    sequenceId?: string;
    sequenceStep?: number;
}

export interface Interview {
    id: string;
    candidateId: number;
    jobId: number;
    stage: InterviewStage;
    status: InterviewStatus;
    startTime: string;
    endTime: string;
    interviewers: string[];
    videoLink?: string;
    reminders: {
        twentyFourHour: boolean;
        oneHour: boolean;
        fifteenMin: boolean;
    };
    feedbackSubmitted: boolean;
}

export interface OfferApprovalStep {
    role: string;
    approver: string;
    status: ApprovalStatus;
    timestamp?: string;
    notes?: string;
}

export interface CompensationPackage {
    baseSalary: number;
    bonus?: number;
    equity?: {
        shares: number;
        vestingSchedule: string;
    };
    signOnBonus?: number;
}

export interface NegotiationHistoryItem {
    date: string;
    author: 'Company' | 'Candidate';
    compensation: CompensationPackage;
    notes?: string;
}

export interface Offer {
    id: string;
    candidateId: number;
    jobId: number;
    status: OfferStatus;
    startDate: string;
    expirationDate: string;
    relocationPackage?: number;
    currentCompensation: CompensationPackage;
    approvalChain: OfferApprovalStep[];
    negotiationHistory: NegotiationHistoryItem[];
    competitiveIntel?: string[];
}

// ========== AI SERVICE-SPECIFIC TYPES ==========

export interface RankedCandidate extends Candidate {
    rank: number;
    matchScore: number;
    reasoning: string;
    cultureFit: string;
}

export interface BiasAuditReport {
    overallScore: number;
    summary: string;
    suggestions: {
        originalText: string;
        suggestion: string;
        explanation: string;
    }[];
}

export interface AIGroupAnalysisReport {
    combinedSummary: string;
    collectiveStrengths: string[];
    potentialGaps: string[];
    individualAnalysis: {
        id: number;
        name: string;
        matchScore: number;
        reasoning: string;
    }[];
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

export interface ScoutedCandidate {
    id: string;
    name: string;
    currentRole: string;
    currentCompany: string;
    matchScore: number;
    intentSignal: string;
    engagementSuggestion: string;
}

export interface BooleanSearchQuery {
    jobTitle: string;
    mustHave: string[];
    niceToHave: string[];
    exclude: string[];
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
        platform: 'LinkedIn' | 'GitHub';
        query: string;
    }[];
    untappedChannels: {
        channel: string;
        reasoning: string;
    }[];
}

export interface CompetitiveJobAnalysis {
    commonSkills: string[];
    competitorSpecificSkills: { competitor: string; skills: string[] }[];
    salaryInsights: string;
    benefitsInsights: string;
    strategicTakeaways: string[];
}

export type RefinableSourcingField = keyof SourcingStrategy;