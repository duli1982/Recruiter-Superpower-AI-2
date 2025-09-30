export enum Tab {
  AdminElimination = 'ADMIN_ELIMINATION',
  InsightJudgment = 'INSIGHT_JUDGMENT',
  JobRequisitions = 'JOB_REQUISITIONS',
  CandidateProfiles = 'CANDIDATE_PROFILES',
  CandidateExperience = 'CANDIDATE_EXPERIENCE',
  PerformanceCreativity = 'PERFORMANCE_CREATIVITY',
  AdoptionCommunity = 'ADOPTION_COMMUNITY',
  PredictiveAnalytics = 'PREDICTIVE_ANALYTICS',
  DiversityEthics = 'DIVERSITY_ETHICS',
  ProactiveSourcing = 'PROACTIVE_SOURCING',
  AdvancedInteraction = 'ADVANCED_INTERACTION',
  IntegrationUpskilling = 'INTEGRATION_UPSKILLING',
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  skills: string; // Comma-separated for simplicity
  resumeSummary: string;
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
    Open = 'Open',
    OnHold = 'On Hold',
    Closed = 'Closed',
}

export interface JobRequisition {
    id: number;
    title: string;
    department: string;
    status: JobStatus;
    requiredSkills: string[];
    description: string;
    applications: number; // For visualization mock
}