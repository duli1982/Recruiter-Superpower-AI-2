import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Tab } from './types';
import { AIAssistantTab } from './components/tabs/AIAssistantTab';
import { InsightJudgmentTab } from './components/tabs/InsightJudgmentTab';
import { DiversityEthicsTab } from './components/tabs/DiversityEthicsTab';
import { PlaceholderTab } from './components/tabs/PlaceholderTab';
import { CandidateProfilesTab } from './components/tabs/CandidateProfilesTab';
import { JobRequisitionsTab } from './components/tabs/JobRequisitionsTab';
import { CandidateExperienceTab } from './components/tabs/CandidateExperienceTab';
import { CandidatePipelineTab } from './components/tabs/CandidatePipelineTab';
import { TABS } from './constants';
import { IntegrationUpskillingTab } from './components/tabs/IntegrationUpskillingTab';
import { ProactiveSourcingTab } from './components/tabs/ProactiveSourcingTab';
import { AdoptionCommunityTab } from './components/tabs/AdoptionCommunityTab';
// FIX: Correct import path for PredictiveAnalyticsTab
import { PredictiveAnalyticsTab } from './components/tabs/PredictiveAnalyticsTab';
import { PerformanceCreativityTab } from './components/tabs/PerformanceCreativityTab';
import { OfferManagementTab } from './components/tabs/OfferManagementTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.AIAssistant);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.AIAssistant:
        return <AIAssistantTab />;
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
      case Tab.OfferManagement:
        return <OfferManagementTab />;
      case Tab.CandidateExperience:
        return <CandidateExperienceTab />;
      case Tab.IntegrationUpskilling:
        return <IntegrationUpskillingTab />;
      case Tab.ProactiveSourcing:
        return <ProactiveSourcingTab />;
      case Tab.AdoptionCommunity:
        return <AdoptionCommunityTab />;
      case Tab.PredictiveAnalytics:
        return <PredictiveAnalyticsTab />;
      case Tab.PerformanceCreativity:
        return <PerformanceCreativityTab />;
      default:
        const tabInfo = TABS.find(t => t.id === activeTab);
        return <PlaceholderTab title={tabInfo?.name || 'Coming Soon'} description={tabInfo?.description || 'This feature is under development.'} icon={tabInfo?.icon} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-800 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
