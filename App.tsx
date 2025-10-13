import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Tab } from './types';
import { AdminEliminationTab } from './components/tabs/AdminEliminationTab';
import { InsightJudgmentTab } from './components/tabs/InsightJudgmentTab';
import { DiversityEthicsTab } from './components/tabs/DiversityEthicsTab';
import { CandidateProfilesTab } from './components/tabs/CandidateProfilesTab';
import { JobRequisitionsTab } from './components/tabs/JobRequisitionsTab';
import { CandidatePipelineTab } from './components/tabs/CandidatePipelineTab';
import { CandidateExperienceTab } from './components/tabs/CandidateExperienceTab';
import { ProactiveSourcingTab } from './components/tabs/ProactiveSourcingTab';
import { OfferManagementTab } from './components/tabs/OfferManagementTab';
import { PerformanceCreativityTab } from './components/tabs/PerformanceCreativityTab';
import { PredictiveAnalyticsTab } from './components/tabs/PredictiveAnalyticsTab';
import { IntegrationUpskillingTab } from './components/tabs/IntegrationUpskillingTab';
import { AdoptionCommunityTab } from './components/tabs/AdoptionCommunityTab';
import { OperationalDashboardTab } from './components/tabs/OperationalDashboardTab';
import { TABS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);

  const renderActiveTab = () => {
    switch (activeTab) {
      case Tab.Dashboard:
        return <OperationalDashboardTab />;
      case Tab.AIAssistant:
        return <AdminEliminationTab />; // Using AdminEliminationTab for AI Assistant
      case Tab.InsightJudgment:
        return <InsightJudgmentTab />;
      case Tab.DiversityEthics:
        return <DiversityEthicsTab />;
      case Tab.CandidateProfiles:
        return <CandidateProfilesTab />;
      case Tab.JobRequisitions:
        return <JobRequisitionsTab />;
      case Tab.CandidatePipeline:
        return <CandidatePipelineTab />;
      case Tab.CandidateExperience:
        return <CandidateExperienceTab />;
      case Tab.ProactiveSourcing:
        return <ProactiveSourcingTab />;
      case Tab.OfferManagement:
        return <OfferManagementTab />;
      case Tab.PerformanceCreativity:
        return <PerformanceCreativityTab />;
      case Tab.PredictiveAnalytics:
        return <PredictiveAnalyticsTab />;
      case Tab.IntegrationUpskilling:
        return <IntegrationUpskillingTab />;
      case Tab.AdoptionCommunity:
        return <AdoptionCommunityTab />;
      default:
        const tabInfo = TABS.find(t => t.id === activeTab);
        return <div>{tabInfo?.name || 'Unknown'} tab is not implemented.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default App;
