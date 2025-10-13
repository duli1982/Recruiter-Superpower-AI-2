// This file defines all the shared types for the application.

import React from 'react';

// --- ENUMS ---

export enum Tab {
  Dashboard = 'dashboard',
  AIAssistant = 'ai-assistant',
  InsightJudgment = 'insight-judgment',
  DiversityEthics = 'diversity-ethics',
  CandidateProfiles = 'candidate-profiles',
  JobRequisitions = 'job-requisitions',
  CandidatePipeline = 'candidate-pipeline',
  CandidateExperience = 'candidate-experience',
  ProactiveSourcing = 'proactive-sourcing',
  OfferManagement = 'offer-management',
  Onboarding = 'onboarding',
  EmployeeReferrals = 'employee-referrals',
  InternalMobility = 'internal-mobility',
  PerformanceCreativity = 'performance-creativity',
  PredictiveAnalytics = 'predictive-analytics',
  IntegrationUpskilling = 'integration-upskilling',
  AdoptionCommunity = 'adoption-community',
}

export enum EmailTemplateType {
  Rejection = 'Rejection',
  InterviewInvite = 'Interview Invite',
  FollowUp = 'Follow Up',
}

export enum CandidateStatus {
  Active = 'Active',
  Passive = 'Passive',
  Interviewing = 'Interviewing',
  Hired = 'Hired',
  DoNotContact = 'Do Not Contact',
}

export enum JobStatus {
  Open = 'Open',
  OnHold = 'On Hold',
  Closed = 'Closed',
  PendingApproval = 'Pending Approval',
}

export enum TagType {
  Internal = 'Internal Candidate',
  Passive = 'Passive Sourcing',
  Referral = 'Referral',
  HighPriority = 'High Priority',
}

export enum PipelineStage {
  Applied = 'Applied',
  PhoneScreen = 'Phone Screen',
  TechnicalInterview = 'Technical Interview',
  FinalInterview = 'Final Interview',
  Offer = 'Offer',
  Hired = 'Hired',
}

export enum InterviewStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Canceled = 'Canceled',
  NoShow = 'No Show',
}

export enum InterviewerStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Declined = 'Declined',
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

export enum ApprovalStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum EmailStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Opened = 'Opened',
  Clicked = 'Clicked',
  Replied = 'Replied',
  Bounced = 'Bounced',
}

export type RelationshipStatus = 'Hot' | 'Warm' | 'Cold' | 'Past Candidate' | 'Silver Medalist';
export type TouchpointType = 'Email' | 'Call' | 'Meeting' | 'Note';
export type NurtureCadence = 'Monthly' | 'Quarterly' | 'Bi-annual';
export type NurtureContentType = 'Company News' | 'Industry Insights' | 'Career Tips' | 'New Roles';
export type InterviewStage = 'Phone Screen' | 'Technical Interview' | 'Final Interview' | 'Hiring Manager Interview';
export type RefinableSourcingField = 'jobTitle' | 'skills' | 'location';
export type OverallRecommendation = 'Strong Hire' | 'Hire' | 'No Hire' | 'Strong No Hire';
export type ViewMode = 'recruiter' | 'hiringManager';


// --- INTERFACES & TYPES ---

export interface TabInfo {
  id: Tab;
  name: string;
  icon: React.ReactNode;
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
  nextFollowUpDate?: string;
}

export interface ApplicationHistory {
  jobTitle: string;
  dateApplied: string;
  stageReached: string;
  outcome: 'Hired' | 'In Progress' | 'Rejected' | 'Withdrew';
}

export interface Attachment {
  id: string;
  name: string;
  type: 'Resume' | 'Cover Letter' | 'Portfolio';
  url: string;
  uploadedAt: string;
}

export interface ComplianceInfo {
  consentStatus: 'Given' | 'Pending' | 'Expired' | 'Not Requested';
  consentDate?: string;
  consentPurpose?: string;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  skills: string;
  resumeSummary: string;
  status: CandidateStatus;
  experience?: number;
  location?: string;
  availability?: string;
  tags?: string[];
  lastContactDate?: string;
  source?: string;
  compensation?: {
    currentSalary: number;
    salaryExpectation: number;
    negotiationNotes: string;
  };
  visaStatus?: string;
  applicationHistory: ApplicationHistory[];
  crm: CandidateCRM;
  attachments?: Attachment[];
  compliance?: ComplianceInfo;
  onboardingChecklist?: OnboardingTask[];
  hasCompetingOffer?: boolean;
  referrer?: {
    name: string;
    employeeId: string;
  };
}

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

export interface ApprovalStep {
  stage: string;
  approver: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp?: string;
}

export interface ScorecardCompetency {
  id: string;
  name: string;
  description: string;
}

export interface Scorecard {
  competencies: ScorecardCompetency[];
}

export interface JobRequisition {
  id: number;
  title: string;
  department: string;
  status: JobStatus;
  description: string;
  requiredSkills: string[];
  applications: number;
  createdAt: string;
  hiringManager: string;
  recruiter?: string;
  budget: {
    salaryMin: number;
    salaryMax: number;
    currency: string;
    budgetCode: string;
  };
  approvalWorkflow: ApprovalStep[];
  isLocked?: boolean;
  initialRequiredSkills?: string[];
  scorecard?: Scorecard;
  internalOnly?: boolean;
}

export interface InterviewPacket {
  candidateSummary: string;
  roleSummary: string;
  keyFocusAreas: string[];
  suggestedQuestions: {
    behavioral: string[];
    technical: string[];
  };
  scorecard?: Scorecard;
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
    platform: 'LinkedIn' | 'GitHub' | string;
    query: string;
  }[];
  untappedChannels: {
    channel: string;
    reasoning: string;
  }[];
}

export interface NegotiationHistoryItem {
    date: string;
    author: 'Company' | 'Candidate';
    compensation: {
        baseSalary: number;
        bonus?: number;
        equity?: string;
    };
    notes?: string;
}

export interface OfferApprovalStep {
  role: string;
  approver: string;
  status: ApprovalStatus;
  notes?: string;
}

export interface Offer {
  id: string;
  candidateId: number;
  jobId: number;
  status: OfferStatus;
  startDate: string;
  currentCompensation: {
    baseSalary: number;
    bonus: number;
    equity: string;
  };
  negotiationHistory: NegotiationHistoryItem[];
  approvalChain: OfferApprovalStep[];
  competitiveIntel?: string[];
}

export interface CompetitiveJobAnalysis {
  commonSkills: string[];
  competitorSpecificSkills: {
    competitor: string;
    skills: string[];
  }[];
  salaryInsights: string;
  benefitsInsights: string;
  strategicTakeaways: string[];
}

export interface OnboardingTask {
  id: string;
  task: string;
  stakeholder: 'IT' | 'HR' | 'Hiring Manager' | 'Facilities';
  completed: boolean;
}

export interface Interviewer {
  name: string;
  role: string;
  status: InterviewerStatus;
}

export interface InterviewFeedback {
  interviewerName: string;
  submissionDate: string;
  overallRecommendation: OverallRecommendation;
  ratings: {
    competencyId: string;
    rating: number; // 1-5
    notes: string;
  }[];
  summary: string;
}

export interface Interview {
  id: string;
  candidateId: number;
  jobId: number;
  stage: InterviewStage;
  startTime: string;
  endTime: string;
  interviewers: Interviewer[];
  status: InterviewStatus;
  feedbackSubmitted: boolean;
  feedback?: InterviewFeedback[];
}

export interface CommunityPrompt {
  id: number;
  title: string;
  description: string;
  promptText: string;
  targetFeature: Tab;
  author: string;
  upvotes: number;
  usageCount: number;
  tags: string[];
}

export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  steps: {
    day: number;
    subject: string;
    template: string;
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
}

export type DemographicData = {
  [group: string]: number;
};

export interface EEOData {
  [stage: string]: {
    [category: string]: DemographicData;
  };
}

export type ReferralStatus = 'In Review' | 'Rejected' | PipelineStage;

export interface Referral {
  id: string;
  referrerName: string;
  candidateName: string;
  candidateEmail: string;
  jobId: number;
  submittedDate: string;
  status: ReferralStatus;
  bonusAmount: number;
  bonusStatus: 'Eligible on Hire' | 'Paid' | 'Not Eligible';
}