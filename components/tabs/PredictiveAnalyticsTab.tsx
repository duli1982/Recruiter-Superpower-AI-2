import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { analyzeCompetitorPostings } from '../../services/geminiService';
import { CompetitiveJobAnalysis } from '../../types';

const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const CheckCircle = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;


export const PredictiveAnalyticsTab: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
  const [competitors, setCompetitors] = useState('Meta, Apple, Netflix');
  const [analysisResult, setAnalysisResult] = useState<CompetitiveJobAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!jobTitle || !competitors) {
      setError('Please provide both a job title and competitors.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);
    try {
      const result = await analyzeCompetitorPostings(jobTitle, competitors);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Predictive Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Hiring Forecast: Q4 2024" icon={<TrendingUpIcon />} />
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-300">Engineering</span>
              <span className="font-bold text-2xl text-white">8-12 Hires</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-300">Product</span>
              <span className="font-bold text-2xl text-white">3-5 Hires</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-300">Design</span>
              <span className="font-bold text-2xl text-white">1-2 Hires</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Talent Supply & Demand" icon={<UsersIcon />} />
          <div className="mt-4 space-y-4 text-sm">
            <p className="text-yellow-300 p-3 bg-yellow-900/30 rounded-lg">
              <span className="font-bold">High Demand:</span> Senior Go Engineers. Talent supply is low, expect longer time-to-fill.
            </p>
            <p className="text-green-300 p-3 bg-green-900/30 rounded-lg">
              <span className="font-bold">High Supply:</span> Junior React Developers. Talent pool is large, consider raising the bar for entry-level roles.
            </p>
            <p className="text-gray-300 p-3 bg-gray-800/80 rounded-lg">
              <span className="font-bold">Trending Skill:</span> Rust. A growing number of candidates are listing Rust experience.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Attrition Risk Model" icon={<ClockIcon />} />
          <div className="mt-4 space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-white">Coming Soon</h3>
                <p className="text-gray-400 mt-2">AI-powered predictions to identify roles at high risk of turnover, allowing for proactive backfilling.</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader title="Competitive Job Posting Analysis" icon={<SearchIcon />} description="Use AI to analyze competitor job postings and identify market trends." />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="jobTitle" className="label">Job Title to Analyze</label>
            <input type="text" id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-field" />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="competitors" className="label">Competitors</label>
            <input type="text" id="competitors" value={competitors} onChange={e => setCompetitors(e.target.value)} placeholder="e.g., Google, Meta, Apple" className="input-field" />
          </div>
          <div className="md:col-span-1">
            <Button onClick={handleAnalyze} isLoading={isLoading} className="w-full">Analyze Postings</Button>
          </div>
        </div>
        
        {isLoading && <Spinner text="Analyzing market data..." />}
        {error && <p className="mt-4 text-red-400 text-sm p-3 bg-red-900/20 border border-red-800 rounded-md text-center">{error}</p>}
        
        {analysisResult && (
          <div className="mt-6 border-t border-gray-700 pt-6 space-y-6">
            <div>
              <h4 className="font-semibold text-lg text-indigo-300 mb-2">Commonly Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.commonSkills.map(skill => <span key={skill} className="bg-gray-700 text-indigo-300 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg text-indigo-300 mb-2">Salary & Benefits Insights</h4>
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3 text-sm">
                  <p><strong className="text-gray-300">Compensation:</strong> {analysisResult.salaryInsights}</p>
                  <p><strong className="text-gray-300">Perks:</strong> {analysisResult.benefitsInsights}</p>
                </div>
              </div>
               <div>
                <h4 className="font-semibold text-lg text-indigo-300 mb-2">Competitor-Specific Demands</h4>
                <div className="space-y-3">
                  {analysisResult.competitorSpecificSkills.map(item => (
                    <div key={item.competitor} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <p className="font-bold text-gray-200">{item.competitor}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.skills.map(skill => <span key={skill} className="bg-gray-700 text-yellow-300 text-xs font-medium px-2 py-1 rounded-full">{skill}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg text-indigo-300 mb-2">Strategic Takeaways</h4>
              <ul className="space-y-2">
                {analysisResult.strategicTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>
      <style>{`.label { display: block; text-transform: uppercase; font-size: 0.75rem; font-medium; color: #9ca3af; margin-bottom: 0.25rem;} .input-field { display: block; width: 100%; background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); color: white; padding: 0.5rem 0.75rem;} .input-field:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px #6366f1; }`}</style>
    </div>
  );
};