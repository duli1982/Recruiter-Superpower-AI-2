// This file is new
import React, { useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { MOCK_CANDIDATES, MOCK_JOB_REQUISITIONS, MOCK_OFFERS, MOCK_PIPELINE_DATA, PIPELINE_STAGES } from '../../constants';
import { CandidateStatus, JobStatus, OfferStatus, PipelineStage } from '../../types';

// Icons
const BarChart3Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CheckCircle2Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;

// Mock data for trend charts
const generateWeeklyData = (base: number, trend: number) => {
    return [
        { week: '4 weeks ago', value: Math.round(base * (1 - trend * 3)) },
        { week: '3 weeks ago', value: Math.round(base * (1 - trend * 2)) },
        { week: '2 weeks ago', value: Math.round(base * (1 - trend)) },
        { week: 'Last week', value: base },
    ];
};

const weeklyApplications = generateWeeklyData(85, 0.1);
const weeklyInterviews = generateWeeklyData(22, -0.05);
const weeklyOffers = generateWeeklyData(5, 0);

// Mock data for time in stage
const avgTimeInStage: Record<PipelineStage, number> = {
    [PipelineStage.Applied]: 2,
    [PipelineStage.PhoneScreen]: 7,
    [PipelineStage.TechnicalInterview]: 14,
    [PipelineStage.FinalInterview]: 12,
    [PipelineStage.Offer]: 5,
    [PipelineStage.Hired]: 0,
};

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="flex items-center gap-4">
        <div className="p-3 bg-indigo-600/20 rounded-lg">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </Card>
);

export const OperationalDashboardTab: React.FC = () => {
    const metrics = useMemo(() => {
        const closedReqs = MOCK_JOB_REQUISITIONS.filter(r => r.status === JobStatus.Closed);
        const totalTimeToFill = closedReqs.reduce((sum, req) => {
            const hiredDate = new Date(); // Assuming today for simplicity
            const createdDate = new Date(req.createdAt);
            const diffDays = (hiredDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
            return sum + diffDays;
        }, 0);

        const acceptedOffers = MOCK_OFFERS.filter(o => o.status === OfferStatus.Accepted).length;
        const offerAcceptanceRate = MOCK_OFFERS.length > 0 ? ((acceptedOffers / MOCK_OFFERS.length) * 100).toFixed(0) : 0;

        const activeCandidates = MOCK_CANDIDATES.filter(c => [CandidateStatus.Active, CandidateStatus.Interviewing].includes(c.status)).length;

        const openReqsByDept = MOCK_JOB_REQUISITIONS.filter(r => r.status === JobStatus.Open).reduce((acc, req) => {
            acc[req.department] = (acc[req.department] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const recruiterLeaderboard = MOCK_JOB_REQUISITIONS.reduce((acc, req) => {
            if (req.recruiter) {
                if (!acc[req.recruiter]) {
                    acc[req.recruiter] = { hires: 0, interviews: 0, openReqs: 0 };
                }
                if (req.status === JobStatus.Open) {
                    acc[req.recruiter].openReqs += 1;
                }
                const pipeline = MOCK_PIPELINE_DATA[req.id] || {};
                if (pipeline.Hired) {
                    acc[req.recruiter].hires += pipeline.Hired.length;
                }
                const interviewsCount = (pipeline.TechnicalInterview?.length || 0) + (pipeline.FinalInterview?.length || 0);
                acc[req.recruiter].interviews += interviewsCount;
            }
            return acc;
        }, {} as Record<string, { hires: number; interviews: number; openReqs: number; }>);


        return {
            avgTimeToFill: closedReqs.length > 0 ? (totalTimeToFill / closedReqs.length).toFixed(1) : 'N/A',
            offerAcceptanceRate: `${offerAcceptanceRate}%`,
            activeCandidates,
            openReqsByDept: Object.entries(openReqsByDept),
            recruiterLeaderboard: Object.entries(recruiterLeaderboard).sort(([,a],[,b]) => b.hires - a.hires),
        };
    }, []);

    const maxTime = Math.max(...Object.values(avgTimeInStage));

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Operational Dashboard</h2>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <KPICard title="Avg. Time to Fill" value={`${metrics.avgTimeToFill} days`} icon={<ClockIcon className="h-6 w-6 text-indigo-300"/>} />
                <KPICard title="Offer Acceptance Rate" value={metrics.offerAcceptanceRate} icon={<CheckCircle2Icon className="h-6 w-6 text-indigo-300"/>} />
                <KPICard title="Active Candidates" value={metrics.activeCandidates} icon={<UsersIcon className="h-6 w-6 text-indigo-300"/>} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {/* Trend Chart */}
                    <Card>
                        <CardHeader title="Hiring Funnel Velocity" description="Activity over the last 4 weeks" />
                        <div className="mt-4 flex gap-4 h-60">
                            {[weeklyApplications, weeklyInterviews, weeklyOffers].map((data, idx) => {
                                const metricName = ['Apps', 'Interviews', 'Offers'][idx];
                                const color = ['bg-indigo-500', 'bg-purple-500', 'bg-teal-500'][idx];
                                const maxVal = Math.max(...data.map(d => d.value));
                                return (
                                    <div key={metricName} className="flex-1 flex flex-col">
                                        <p className="text-center text-sm font-semibold text-gray-300 mb-2">{metricName}</p>
                                        <div className="flex-grow flex justify-around items-end gap-2">
                                            {data.map(item => (
                                                <div key={item.week} className="flex-1 flex flex-col items-center gap-1" title={`${item.week}: ${item.value}`}>
                                                    <div className="text-xs font-bold text-white">{item.value}</div>
                                                    <div className={`${color} w-full rounded-t-md hover:opacity-80 transition-opacity`} style={{ height: `${(item.value / maxVal) * 100}%`}}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Bottleneck Analysis */}
                    <Card>
                        <CardHeader title="Pipeline Bottlenecks" description="Average time candidates spend in each stage" />
                        <div className="mt-4 space-y-3">
                            {PIPELINE_STAGES.filter(s => s !== PipelineStage.Hired).map(stage => {
                                const time = avgTimeInStage[stage];
                                const width = (time / maxTime) * 100;
                                const color = time > 10 ? 'bg-yellow-500' : 'bg-green-500';
                                return (
                                    <div key={stage} className="flex items-center gap-4">
                                        <span className="w-40 text-sm text-gray-300 truncate">{stage}</span>
                                        <div className="flex-grow bg-gray-700 rounded-full h-4">
                                            <div className={`${color} h-4 rounded-full`} style={{ width: `${width}%`}}></div>
                                        </div>
                                        <span className="w-16 text-sm font-semibold text-white text-right">{time} days</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
                
                <div className="space-y-6">
                    {/* Recruiter Leaderboard */}
                    <Card>
                        <CardHeader title="Recruiter Leaderboard" icon={<UsersIcon />} />
                        <table className="w-full text-sm text-left mt-2">
                            <thead className="text-xs text-gray-400 uppercase">
                                <tr><th className="py-2">Recruiter</th><th className="py-2 text-center">Hires</th><th className="py-2 text-center">Interviews</th></tr>
                            </thead>
                            <tbody>
                                {metrics.recruiterLeaderboard.map(([name, data]) => (
                                    <tr key={name} className="border-t border-gray-700">
                                        <td className="py-2 font-medium text-white">{name}</td>
                                        <td className="py-2 text-center text-gray-200">{data.hires}</td>
                                        <td className="py-2 text-center text-gray-200">{data.interviews}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                     {/* Open Reqs by Department */}
                    <Card>
                        <CardHeader title="Open Reqs by Department" icon={<BriefcaseIcon />} />
                        <div className="mt-4 space-y-3">
                             {metrics.openReqsByDept.map(([dept, count]) => {
                                const maxCount = Math.max(...metrics.openReqsByDept.map(([,c]) => c));
                                const width = (count / maxCount) * 100;
                                return (
                                    <div key={dept}>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span className="text-gray-300">{dept}</span>
                                            <span className="font-semibold text-white">{count}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-indigo-500 h-2 rounded-full" style={{width: `${width}%`}}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
