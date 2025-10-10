import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { generatePredictiveAnalysis } from '../../services/geminiService';
import { PredictiveAnalysisReport, JobRequisition, Candidate, SkillGap } from '../../types';
import { MOCK_JOB_REQUISITIONS, MOCK_CANDIDATES } from '../../constants';
import { Button } from '../ui/Button';

// Icons
const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
const RefreshCwIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>;


const REQUISITIONS_STORAGE_KEY = 'recruiter-ai-requisitions';
const CANDIDATES_STORAGE_KEY = 'recruiter-ai-candidates';
const PREDICTIVE_REPORT_CACHE_KEY = 'recruiter-ai-predictive-report';

const getInitialData = <T,>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); }
    return fallback;
};

const SeverityBadge: React.FC<{ severity: SkillGap['severity'] }> = ({ severity }) => {
    const colors = {
        'Critical': 'bg-red-500/20 text-red-300',
        'Moderate': 'bg-yellow-500/20 text-yellow-300',
        'Minor': 'bg-blue-500/20 text-blue-300',
    };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[severity]}`}>{severity}</span>
};

export const PredictiveAnalyticsTab: React.FC = () => {
    const [report, setReport] = useState<PredictiveAnalysisReport | null>(() => getInitialData(PREDICTIVE_REPORT_CACHE_KEY, null));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError('');
        try {
            const requisitions = getInitialData<JobRequisition[]>(REQUISITIONS_STORAGE_KEY, MOCK_JOB_REQUISITIONS);
            const candidates = getInitialData<Candidate[]>(CANDIDATES_STORAGE_KEY, MOCK_CANDIDATES);
            const analysisResult = await generatePredictiveAnalysis(requisitions, candidates);
            
            const newReport: PredictiveAnalysisReport = {
                ...analysisResult,
                generatedAt: new Date().toISOString(),
            };
            
            setReport(newReport);
            localStorage.setItem(PREDICTIVE_REPORT_CACHE_KEY, JSON.stringify(newReport));

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <Spinner text="Generating strategic forecast..." size="lg" />;
        }

        if (error) {
            return (
                 <div className="text-center">
                    <p className="text-red-400 p-4 bg-red-900/20 rounded-lg">{error}</p>
                    <Button onClick={handleGenerateReport} className="mt-4">Try Again</Button>
                </div>
            );
        }

        if (!report) {
            return (
                <Card className="text-center max-w-lg mx-auto">
                    <CardHeader title="Generate Predictive Report" icon={<TrendingUpIcon />} description="Analyze historical hiring data and your current talent pool to forecast future needs, identify skill gaps, and get strategic market insights."/>
                    <div className="mt-6">
                        <Button onClick={handleGenerateReport} isLoading={isLoading}>Generate Report</Button>
                    </div>
                </Card>
            );
        }

        return (
            <div>
                 <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                    <p className="text-sm text-gray-400">
                        Report generated: <span className="font-semibold text-gray-300">{new Date(report.generatedAt).toLocaleString()}</span>
                    </p>
                    <Button onClick={handleGenerateReport} isLoading={isLoading} variant="secondary" icon={<RefreshCwIcon className="h-4 w-4"/>}>
                        Generate New Report
                    </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader title="Hiring Demand Forecast (Next 6 Months)" icon={<TrendingUpIcon />} description="AI-predicted roles based on historical hiring velocity and departmental growth." />
                            <div className="mt-4 space-y-4">
                                {report.hiringForecasts.map(forecast => (
                                    <div key={forecast.roleTitle} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h4 className="font-bold text-white">{forecast.roleTitle}</h4>
                                                <p className="text-sm text-indigo-300">{forecast.department}</p>
                                                <p className="text-sm text-gray-400 mt-2">{forecast.reasoning}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-indigo-400">{forecast.demandScore}</p>
                                                <p className="text-xs text-gray-400">Demand</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: `${forecast.demandScore}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card>
                            <CardHeader title="Strategic Market Insights" icon={<GlobeIcon />} description="External trends that may impact your hiring strategy." />
                            <div className="mt-4 space-y-3">
                                {report.marketTrends.map((trend, i) => (
                                    <div key={i} className="p-3 bg-gray-800 rounded-md">
                                        <p className="font-semibold text-gray-200">{trend.insight}</p>
                                        <p className="text-sm text-gray-400 mt-1"><strong className="text-gray-300">Impact:</strong> {trend.impact}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader title="Critical Skill Gaps" icon={<AlertTriangleIcon />} description="Skills to prioritize in proactive sourcing campaigns." />
                            <div className="mt-4 space-y-3">
                                {report.skillGaps.map(gap => (
                                    <div key={gap.skill} className="p-3 bg-gray-800 rounded-md border border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-white">{gap.skill}</h4>
                                            <SeverityBadge severity={gap.severity} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2 text-center text-xs">
                                            <div className="bg-gray-700 p-2 rounded">
                                                <p className="text-gray-400">Demand</p>
                                                <p className="font-semibold text-white">{gap.demandLevel}</p>
                                            </div>
                                            <div className="bg-gray-700 p-2 rounded">
                                                <p className="text-gray-400">Talent Pool Supply</p>
                                                <p className="font-semibold text-white">{gap.supplyLevel}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Predictive Analytics Dashboard</h2>
            {renderContent()}
        </div>
    );
};