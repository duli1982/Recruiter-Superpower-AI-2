import React, { useMemo } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { MOCK_SCHEDULED_INTERVIEWS, MOCK_JOB_REQUISITIONS, MOCK_OFFERS, MOCK_CANDIDATES } from '../../constants';
import { InterviewStatus, JobStatus, OfferStatus, ApprovalStatus, Tab } from '../../types';

interface HiringManagerDashboardTabProps {
  currentUser: string;
  setActiveTab: (tab: Tab) => void;
}

const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const CheckSquareIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;


export const HiringManagerDashboardTab: React.FC<HiringManagerDashboardTabProps> = ({ currentUser, setActiveTab }) => {
    const actionItems = useMemo(() => {
        const feedbackNeeded = MOCK_SCHEDULED_INTERVIEWS.filter(i =>
            i.status === InterviewStatus.Completed &&
            !i.feedbackSubmitted &&
            i.interviewers.some(interviewer => interviewer.name === currentUser)
        ).map(i => ({
            type: 'Feedback',
            text: `Provide feedback for ${MOCK_CANDIDATES.find(c => c.id === i.candidateId)?.name}`,
            link: Tab.CandidateExperience
        }));

        const reqApprovalsNeeded = MOCK_JOB_REQUISITIONS.filter(r =>
            r.approvalWorkflow.some(step => step.approver === currentUser && step.status === 'Pending')
        ).map(r => ({
            type: 'Approval',
            text: `Approve requisition for ${r.title}`,
            link: Tab.JobRequisitions
        }));

        const offerApprovalsNeeded = MOCK_OFFERS.filter(o =>
            o.approvalChain.some(step => step.approver === currentUser && step.status === 'Pending')
        ).map(o => ({
            type: 'Approval',
            text: `Approve offer for ${MOCK_CANDIDATES.find(c => c.id === o.candidateId)?.name}`,
            link: Tab.OfferManagement // Note: Offer Management tab is not in manager view, this is a simplification
        }));
        
        return [...feedbackNeeded, ...reqApprovalsNeeded, ...offerApprovalsNeeded];
    }, [currentUser]);

    const openRequisitions = useMemo(() => {
        return MOCK_JOB_REQUISITIONS.filter(r => r.hiringManager === currentUser && r.status === JobStatus.Open);
    }, [currentUser]);

    const ActionItem: React.FC<{ item: typeof actionItems[0] }> = ({ item }) => {
        const icons = {
            'Feedback': <MessageSquareIcon className="h-5 w-5 text-yellow-300" />,
            'Approval': <CheckSquareIcon className="h-5 w-5 text-purple-300" />,
        };
        return (
            <div 
                className="flex items-center justify-between p-3 bg-gray-800 rounded-md hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => setActiveTab(item.link)}
            >
                <div className="flex items-center gap-3">
                    {icons[item.type as keyof typeof icons]}
                    <p className="text-sm text-white">{item.text}</p>
                </div>
                <span className="text-xs text-indigo-400 font-semibold">View</span>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Hiring Manager Dashboard</h2>
            <p className="text-gray-400 mb-6">Welcome, {currentUser}. Here's a summary of your open roles and pending actions.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader title="Action Items" description="Tasks requiring your attention" icon={<AlertTriangleIcon className="text-yellow-400" />} />
                        <div className="mt-4 space-y-3">
                            {actionItems.length > 0 ? (
                                actionItems.map((item, index) => <ActionItem key={index} item={item} />)
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-8">No pending actions. Great job!</p>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader title="Your Open Requisitions" />
                        <div className="mt-4 space-y-4">
                            {openRequisitions.length > 0 ? (
                                openRequisitions.map(req => (
                                    <div key={req.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-lg text-white">{req.title}</h4>
                                            <span className="text-sm text-gray-400">{req.applications} Applicants</span>
                                        </div>
                                        <p className="text-sm text-indigo-400">{req.department}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-8">You have no open requisitions.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
