import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Candidate, RankedCandidate, BiasAuditReport, JobRequisition, JobStatus, EmailTemplateType, InterviewStage, ScoutedCandidate, AIGroupAnalysisReport, PredictiveAnalysisReport, SourcingStrategy, RefinableSourcingField, InterviewPacket, Offer, BooleanSearchQuery } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateEmail = async (templateType: EmailTemplateType, candidateName: string, jobTitle: string, companyName: string, keyPoints: string): Promise<string> => {
    let promptIntro = '';

    switch (templateType) {
        case EmailTemplateType.InterviewInvite:
            promptIntro = `
                You are a friendly and efficient recruiting coordinator. Your task is to write a professional and clear interview invitation email.
                The key points include details like the interview time, location (or video call link), and interviewers.
            `;
            break;
        case EmailTemplateType.FollowUp:
            promptIntro = `
                You are a helpful senior recruiter. Your task is to write a professional follow-up email.
                This could be to check in after an application, provide an update on the hiring timeline, or ask for more information.
            `;
            break;
        case EmailTemplateType.Rejection:
        default:
            promptIntro = `
                You are a senior recruiter with high emotional intelligence. Your task is to write an empathetic, professional, and encouraging rejection email.
                Incorporate the specific feedback in a constructive and positive way. Avoid generic phrases.
            `;
            break;
    }
    
    const prompt = `
        ${promptIntro}

        Details:
        - Candidate Name: ${candidateName}
        - Job Title: ${jobTitle}
        - Company Name: ${companyName}
        - Key Points to Include: ${keyPoints}

        Instructions:
        1. Address the candidate by name.
        2. Thank them for their time and interest.
        3. Clearly state the purpose of the email based on the template type (${templateType}).
        4. Incorporate the key points naturally into the email body.
        5. Keep the tone appropriate for the template type (e.g., warm and encouraging for rejection, clear and concise for invitation).
        6. Do not invent details not provided.
        7. The output should be only the email body text.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating email:", error);
        return "Sorry, I encountered an error while generating the email. Please check the console for details.";
    }
};

export const parseResume = async (resumeText: string): Promise<Partial<Candidate>> => {
    const prompt = `
        You are an expert resume parser for a recruiting agency. 
        Analyze the following resume text and extract the specified information.

        Resume Text:
        ---
        ${resumeText}
        ---

        Your task is to return a single JSON object with the following fields. If a field is not found, omit it or return an empty string.
        - name: The candidate's full name (string).
        - email: The candidate's email address (string).
        - phone: The candidate's phone number (string).
        - skills: A comma-separated string of relevant skills.
        - resumeSummary: A concise 3-4 sentence summary of the candidate's experience and qualifications based on the entire resume.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        email: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        skills: { type: Type.STRING },
                        resumeSummary: { type: Type.STRING },
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Partial<Candidate>;
    } catch (error) {
        console.error("Error parsing resume:", error);
        throw new Error("Failed to parse resume. The AI model might have returned an invalid format.");
    }
};


export const rankCandidates = async (jobDescription: string, candidates: Candidate[]): Promise<RankedCandidate[]> => {
    const prompt = `
        You are an expert talent acquisition partner with a knack for identifying hidden potential. 
        Given the following job description and a list of candidate summaries, please rank them based on their suitability for the role.

        Job Description:
        ---
        ${jobDescription}
        ---

        Candidates:
        ---
        ${candidates.map(c => `ID: ${c.id}, Name: ${c.name}, Summary: ${c.resumeSummary}`).join('\n\n')}
        ---

        Your task is to return a JSON array of objects. Each object should represent a candidate and include:
        - id: The candidate's original ID (number).
        - name: The candidate's name (string).
        - rank: Their rank (number, starting from 1).
        - matchScore: A score from 0 to 100 representing their match to the job description (number).
        - reasoning: A brief, insightful explanation for their rank and score, highlighting strengths and potential gaps (string).
        - cultureFit: A brief analysis of their potential cultural fit based on soft skills or traits mentioned in their summary (string).
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            name: { type: Type.STRING },
                            rank: { type: Type.NUMBER },
                            matchScore: { type: Type.NUMBER },
                            reasoning: { type: Type.STRING },
                            cultureFit: { type: Type.STRING },
                        },
                        required: ["id", "name", "rank", "matchScore", "reasoning", "cultureFit"],
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as RankedCandidate[];
    } catch (error) {
        console.error("Error ranking candidates:", error);
        throw new Error("Failed to rank candidates. See console for details.");
    }
};

export const auditJobDescription = async (jobDescription: string): Promise<BiasAuditReport> => {
    const prompt = `
        You are an expert in Diversity, Equity, and Inclusion (DEI) specializing in hiring practices. 
        Analyze the following job description for potential biases (e.g., gendered language, ageism, exclusionary terminology, ableism).

        Job Description:
        ---
        ${jobDescription}
        ---

        Your task is to provide a detailed audit. Return a single JSON object with the following structure:
        - overallScore: A number from 0 to 100, where 100 is perfectly inclusive and 0 is highly biased.
        - summary: A brief one-paragraph summary of the job description's inclusivity.
        - suggestions: An array of objects, where each object identifies a biased phrase and offers a more inclusive alternative. Each object should have:
            - originalText: The problematic text from the job description.
            - suggestion: The recommended inclusive alternative.
            - explanation: A brief explanation of why the original text is problematic and why the suggestion is better.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallScore: { type: Type.NUMBER },
                        summary: { type: Type.STRING },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    originalText: { type: Type.STRING },
                                    suggestion: { type: Type.STRING },
                                    explanation: { type: Type.STRING },
                                },
                                required: ["originalText", "suggestion", "explanation"],
                            }
                        }
                    },
                    required: ["overallScore", "summary", "suggestions"],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as BiasAuditReport;
    } catch (error) {
        console.error("Error auditing job description:", error);
        throw new Error("Failed to audit job description. See console for details.");
    }
};

export const getJobRequisitionSuggestion = async (requisition: JobRequisition, previousStatus: JobStatus, newStatus: JobStatus): Promise<string> => {
    const prompt = `
        You are an AI assistant for a recruiter. A job requisition's status has just been changed. Provide a brief, actionable suggestion based on this change.

        Job Details:
        - Title: ${requisition.title}
        - Department: ${requisition.department}
        - Status Change: From "${previousStatus}" to "${newStatus}"

        Examples of good suggestions:
        - If status becomes Open: "This role is now active. Consider starting a new sourcing campaign on LinkedIn for candidates with ${requisition.requiredSkills.join(', ')} skills."
        - If status becomes On Hold: "This role is paused. How about moving the top 3 candidates from this pipeline to the similar 'Senior Backend Engineer' role?"
        - If status becomes Closed: "Great, this role is filled! Based on recent market trends for this role, should we consider opening a similar 'Mid-Level' position to build the talent pipeline for next quarter?"

        Based on the provided job details, generate a single, concise suggestion. The output should be only the suggestion text.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating job requisition suggestion:", error);
        return "Could not generate a suggestion at this time.";
    }
};

export const getCRMSuggestion = async (candidate: Candidate): Promise<{ suggestion: string; nextStep: 'Email' | 'Call' | 'Note' }> => {
    const lastContactDaysAgo = candidate.lastContactDate ? Math.floor((new Date().getTime() - new Date(candidate.lastContactDate).getTime()) / (1000 * 3600 * 24)) : null;

    const prompt = `
        You are an expert Candidate Relationship Management (CRM) strategist for a senior recruiter, thinking like a top-tier salesperson.
        Analyze the following candidate profile and provide a concise, actionable next step to nurture the relationship and move them towards a close.

        Candidate Profile:
        - Name: ${candidate.name}
        - Skills: ${candidate.skills}
        - Summary: ${candidate.resumeSummary}
        - CRM Status: ${candidate.crm?.relationshipStatus}
        - Last Contact: ${lastContactDaysAgo !== null ? `${lastContactDaysAgo} days ago` : 'N/A'}
        - Touchpoint History: ${candidate.crm?.touchpointHistory.map(tp => `${new Date(tp.date).toLocaleDateString()}: ${tp.type} - ${tp.notes}`).join('\n')}

        Today's date is ${new Date().toLocaleDateString()}.

        **CRITICAL RULE:** If the last contact was more than 14 days ago, the candidate is "going cold." Your primary goal is to suggest a specific, high-value re-engagement tactic to warm them up again. DO NOT suggest a generic "check-in." Instead, suggest sharing a relevant article, mentioning a company milestone, or referencing one of their skills in a new context.

        Your task is to return a single JSON object with two keys:
        1. "suggestion": A creative, personalized, and actionable suggestion for the next touchpoint. Be specific. If suggesting an email, mention the topic.
        2. "nextStep": The type of action suggested. Must be one of: 'Email', 'Call', 'Note'.

        Example for a "Silver Medalist" who is going cold:
        {
          "suggestion": "Brenda went cold 45 days ago. Re-engage her by sending a link to our new design system blog post. Mention how her expertise in Figma, which she discussed in her last interview, would be invaluable for the next version.",
          "nextStep": "Email"
        }
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: { type: Type.STRING },
                        nextStep: { type: Type.STRING },
                    },
                    required: ['suggestion', 'nextStep']
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as { suggestion: string; nextStep: 'Email' | 'Call' | 'Note' };
    } catch (error) {
        console.error("Error generating CRM suggestion:", error);
        throw new Error("Failed to generate CRM suggestion.");
    }
};

export const parseAvailability = async (text: string, timezone: string): Promise<{startTime: string, endTime: string}[]> => {
    const prompt = `
        You are an intelligent scheduling assistant. Your task is to parse the following text for available time slots and return them as structured data.

        - Today's date is: ${new Date().toISOString()}.
        - The user's timezone is: ${timezone}.
        - The desired interview duration is 30 minutes.

        Availability Text:
        ---
        ${text}
        ---

        Instructions:
        1. Identify all concrete time ranges from the text.
        2. Break these ranges down into 30-minute slots.
        3. Return a JSON array of objects. Each object must represent a single 30-minute slot and have "startTime" and "endTime" properties.
        4. Both "startTime" and "endTime" MUST be in full ISO 8601 format in UTC (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ").
        5. If the text is vague (e.g., "sometime next week"), return an empty array.
    `;
    
    try {
        // FIX: Explicitly typing the response variable ensures that the return value of the function is correctly inferred, preventing downstream type errors.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            startTime: { type: Type.STRING },
                            endTime: { type: Type.STRING },
                        },
                        required: ["startTime", "endTime"],
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText);
        // FIX: Cast the parsed result to the expected return type.
        return parsedResult as {startTime: string, endTime: string}[];
    } catch (error) {
        console.error("Error parsing availability:", error);
        throw new Error("Failed to parse availability. Please try being more specific with dates and times.");
    }
};

export const generateSchedulingEmail = async (candidateName: string, jobTitle: string, interviewStage: InterviewStage, timeSlots: string[], interviewers: string[], videoLink: string): Promise<string> => {
    const isPanelInterview = interviewers.length > 1;
    
    const prompt = `
        You are a friendly and efficient recruiting coordinator. Your task is to write an email to a candidate to schedule their interview.

        Details:
        - Candidate Name: ${candidateName}
        - Job Title: ${jobTitle}
        - Interview Stage: ${interviewStage}
        ${interviewers.length > 0 ? `- Interviewers: ${interviewers.join(', ')}` : ''}
        ${videoLink ? `- Video Conference Link: ${videoLink}` : ''}
        - Proposed Time Slots:\n${timeSlots.join('\n')}

        Instructions:
        1. Write a warm and professional email.
        2. Address the candidate by their first name.
        3. State the purpose of the email: to schedule the ${interviewStage}.
        ${interviewers.length > 0 ? `4. Mention that they will be meeting with ${interviewers.join(' and ')}.` : ''}
        5. Present the proposed time slots clearly in a list.
        ${isPanelInterview
            ? '6. Ask the candidate to reply with their preferred time, noting that it needs to work for all interviewers.'
            : '6. Ask the candidate to reply with their preferred time.'}
        ${videoLink
            ? '7. Inform them that the video call link is included in this email and they should use it to join at the scheduled time.'
            : '7. Mention that a formal calendar invitation with a video conference link will be sent after they confirm a time.'}
        8. Keep the tone enthusiastic and organized.
        9. The output should be only the email body text.
    `;

    try {
        // FIX: Explicitly typing the response variable for type safety and consistency.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating scheduling email:", error);
        return "Sorry, I encountered an error while generating the email.";
    }
};

export const generateInterviewPacket = async (candidate: Candidate, requisition: JobRequisition): Promise<InterviewPacket> => {
    const prompt = `
        You are an expert recruitment strategist preparing an interviewer for an upcoming interview. 
        Your task is to create a concise and insightful interview packet based on the provided candidate and job details.

        Candidate Information:
        - Name: ${candidate.name}
        - Skills: ${candidate.skills}
        - Resume Summary: ${candidate.resumeSummary}

        Job Requisition:
        - Title: ${requisition.title}
        - Required Skills: ${requisition.requiredSkills.join(', ')}
        - Description: ${requisition.description}

        Generate a JSON object with the following structure:
        - candidateSummary: A 2-3 sentence summary of the candidate's background and why they are being considered for this role.
        - roleSummary: A 2-3 sentence summary of the core responsibilities and goals of the role.
        - keyFocusAreas: An array of 3-4 strings highlighting the most important areas to probe during the interview. These should be specific and derived from comparing the candidate's resume to the job requirements (e.g., "Probe deeper into their AWS experience, as it's mentioned but not detailed", "Assess their leadership style for the team lead aspect of the role").
        - suggestedQuestions: An object with two properties:
            - behavioral: An array of 4-5 insightful behavioral questions tailored to the role and candidate.
            - technical: An array of 4-5 relevant technical questions or topics to discuss, based on the required skills.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        candidateSummary: { type: Type.STRING },
                        roleSummary: { type: Type.STRING },
                        keyFocusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedQuestions: {
                            type: Type.OBJECT,
                            properties: {
                                behavioral: { type: Type.ARRAY, items: { type: Type.STRING } },
                                technical: { type: Type.ARRAY, items: { type: Type.STRING } },
                            },
                            required: ["behavioral", "technical"],
                        },
                    },
                    required: ["candidateSummary", "roleSummary", "keyFocusAreas", "suggestedQuestions"],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as InterviewPacket;
    } catch (error) {
        console.error("Error generating interview packet:", error);
        throw new Error("Failed to generate the interview packet. The AI model may have returned an unexpected response.");
    }
};

export const scoutForTalent = async (jobTitle: string, skills: string, location: string, experience: string): Promise<ScoutedCandidate[]> => {
    const prompt = `
        You are an expert talent sourcer with a unique ability to identify passive candidates who are likely to be open to new opportunities. 
        Based on the following criteria, generate a list of 3 fictional but realistic-sounding candidates.

        Search Criteria:
        - Job Title / Role: ${jobTitle}
        - Key Skills: ${skills}
        - Location: ${location}
        - Experience Level: ${experience}

        For each candidate, provide the following information:
        - A plausible reason (the "intent signal") why they might be open to a new role, even if they aren't actively applying. This should be creative, e.g., their company just had layoffs, they recently got a new certification, their role anniversary just passed, they are very active on technical forums, etc.
        - A personalized engagement suggestion for an initial outreach message.

        Return a JSON array of objects. Each object must have the following structure:
        - id: A unique string identifier for the candidate (e.g., a simple uuid-like string).
        - name: The candidate's full name.
        - currentRole: Their current job title.
        - currentCompany: Their current employer.
        - matchScore: A score from 80-98 representing their fit for the role.
        - intentSignal: The creative reason they might be open to a new role.
        - engagementSuggestion: A short (2-3 sentences) personalized outreach message.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            currentRole: { type: Type.STRING },
                            currentCompany: { type: Type.STRING },
                            matchScore: { type: Type.NUMBER },
                            intentSignal: { type: Type.STRING },
                            engagementSuggestion: { type: Type.STRING },
                        },
                        required: ["id", "name", "currentRole", "currentCompany", "matchScore", "intentSignal", "engagementSuggestion"],
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ScoutedCandidate[];
    } catch (error) {
        console.error("Error scouting for talent:", error);
        throw new Error("Failed to scout for talent. The AI model might have returned an invalid format or encountered an error.");
    }
};

export const generateOutreachEmail = async (jobTitle: string, skills: string, candidateCount: number): Promise<{ subject: string; body: string; }> => {
    const prompt = `
        You are an expert tech recruiter writing a bulk outreach email. Based on the following criteria, generate a compelling but slightly generic email template that can be sent to multiple candidates at once.

        Role: ${jobTitle}
        Key Skills: ${skills}
        Number of recipients: ${candidateCount}

        Your response must be a single JSON object with two keys: "subject" and "body".

        Instructions for the "subject":
        - Make it catchy and professional to maximize open rates.
        - Mention the role, for example: "Opportunity for a Senior Backend Engineer".

        Instructions for the "body":
        1. Start directly with the main content. DO NOT include a greeting like "Hi [Candidate Name]," or "Hello,".
        2. The tone should be enthusiastic, professional, and respectful of their time.
        3. Briefly introduce yourself and your company (use "Innovate Inc.").
        4. Mention the ${jobTitle} role and explain why their expertise in skills like ${skills} is relevant.
        5. Keep it concise (around 3-4 short paragraphs).
        6. End with a clear, low-pressure call to action, like suggesting a brief, informal chat.
        7. Do not include a sign-off (like "Best regards,"). The user will add this.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING },
                    },
                    required: ["subject", "body"],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as { subject: string; body: string; };
    } catch (error) {
        console.error("Error generating outreach email:", error);
        throw new Error("Failed to generate the outreach email. The AI model may have returned an unexpected response.");
    }
};

export const analyzeCandidateGroup = async (candidates: Candidate[], jobTitle: string): Promise<AIGroupAnalysisReport> => {
    const prompt = `
        You are a senior recruiting manager tasked with analyzing a group of candidates for a hiring manager.

        Target Role: ${jobTitle}

        Candidate Profiles:
        ---
        ${candidates.map(c => `
            ID: ${c.id}
            Name: ${c.name}
            Skills: ${c.skills}
            Experience Summary: ${c.resumeSummary}
        `).join('\n---\n')}
        ---

        Based on the profiles above, provide a comprehensive analysis. Your response MUST be a single JSON object with the following structure:
        - combinedSummary: A 2-3 sentence paragraph summarizing the collective strengths of this group as it relates to the "${jobTitle}" role.
        - collectiveStrengths: An array of strings, with each string being a key strength or skill overlap observed across multiple candidates.
        - potentialGaps: An array of strings, with each string being a potential skill or experience gap for the target role when considering the group as a whole.
        - suggestedRoles: An array of 3-4 strings, listing other job titles this group of candidates would be a strong fit for.
        - individualAnalysis: An array of objects, one for each candidate. Each object should contain:
            - id: The candidate's original ID (number).
            - name: The candidate's name (string).
            - matchScore: A score from 0 to 100 representing their match to the "${jobTitle}" role (number).
            - strengths: An array of strings listing the candidate's key strengths for this role.
            - weaknesses: An array of strings listing the candidate's key weaknesses or gaps for this role.
            - reasoning: A brief, insightful explanation for their score (string).
        
        IMPORTANT: The 'individualAnalysis' array MUST be sorted in descending order by 'matchScore'.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        combinedSummary: { type: Type.STRING },
                        collectiveStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        potentialGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                        individualAnalysis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.NUMBER },
                                    name: { type: Type.STRING },
                                    matchScore: { type: Type.NUMBER },
                                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    reasoning: { type: Type.STRING },
                                },
                                required: ["id", "name", "matchScore", "strengths", "weaknesses", "reasoning"],
                            }
                        }
                    },
                    required: ["combinedSummary", "collectiveStrengths", "potentialGaps", "suggestedRoles", "individualAnalysis"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as AIGroupAnalysisReport;
        
        // Ensure sorting is correct, even if the model doesn't follow instructions perfectly
        result.individualAnalysis.sort((a, b) => b.matchScore - a.matchScore);

        return result;
    } catch (error) {
        console.error("Error analyzing candidate group:", error);
        throw new Error("Failed to generate candidate analysis. The AI model may have returned an unexpected response.");
    }
};


export const generatePredictiveAnalysis = async (requisitions: JobRequisition[], candidates: Candidate[]): Promise<PredictiveAnalysisReport> => {
    const historicalDataSummary = requisitions.map(r => `Role: ${r.title}, Dept: ${r.department}, Status: ${r.status}, Salary: ${r.budget.salaryMin}-${r.budget.salaryMax}`).join('; ');
    const availableSkillsSummary = [...new Set(candidates.flatMap(c => c.skills.split(',').map(s => s.trim())))].join(', ');
    const candidateDemographicsSummary = `Total candidates: ${candidates.length}. Gender distribution: ${JSON.stringify(candidates.reduce((acc, c) => {
        const gender = c.gender || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
    }, {} as Record<string, number>))}.`;


    const prompt = `
        You are a strategic workforce planning analyst for a C-Level audience. Your task is to provide a predictive analysis for a recruiting team. The time horizon is the next 6 months.

        Historical Requisition Data (last 12-18 months):
        ---
        ${historicalDataSummary}
        ---

        Current Talent Pool Skills & Demographics:
        ---
        Skills: ${availableSkillsSummary}
        Demographics: ${candidateDemographicsSummary}
        ---

        Based on the data provided, generate a predictive report. Your response must be a single JSON object with the following structure:

        - hiringForecasts: An array of 3-4 objects, sorted by demandScore descending. Each object should represent a role with high predicted hiring demand and contain:
            - roleTitle: The job title (string).
            - department: The department (string).
            - demandScore: A score from 0 to 100 representing the hiring probability/urgency (number).
            - reasoning: A brief (1-2 sentences) explanation for the forecast.
            - predictedTimeToFill: A predicted number of days to fill this role, based on market difficulty (integer).
            - estimatedRecruitingCost: An estimated cost in USD. Assume a standard 20% recruiting fee on the average of the provided salary range for that role.
        - skillGaps: An array of 4-5 objects, identifying the most critical skill gaps. Each object should contain:
            - skill: The specific skill needed (e.g., 'React Native', 'Terraform') (string).
            - demandLevel: 'High' | 'Medium' | 'Low'.
            - supplyLevel: 'High' | 'Medium' | 'Low' | 'Very Low'. Based on the current talent pool.
            - severity: 'Critical' | 'Moderate' | 'Minor'. 'Critical' means high demand and very low supply.
        - marketTrends: An array of 2-3 objects, providing fictional but plausible external market insights. Each object should contain:
            - insight: A concise statement about a market trend (string).
            - impact: A brief explanation of how this trend impacts the company's hiring strategy (string).
        - competitiveIntelligence: An array of 2-3 fictional but plausible observations about competitors. Each object must have:
            - observation: A statement about a competitor's hiring activity (e.g., "Competitor X is hiring 30% more frontend engineers").
            - implication: What this means for our company.
        - diversityAnalysis: An array of 1-2 objects analyzing the current talent pool. Each object must have:
            - department: The department being analyzed (e.g., "Engineering" or "Overall").
            - metric: The diversity metric being reported (e.g., "Male Representation in Pipeline").
            - value: The percentage value as a string (e.g., "85%").
            - insight: A brief, actionable insight based on the metric.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        hiringForecasts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    roleTitle: { type: Type.STRING },
                                    department: { type: Type.STRING },
                                    demandScore: { type: Type.NUMBER },
                                    reasoning: { type: Type.STRING },
                                    predictedTimeToFill: { type: Type.NUMBER },
                                    estimatedRecruitingCost: { type: Type.NUMBER },
                                },
                                required: ["roleTitle", "department", "demandScore", "reasoning", "predictedTimeToFill", "estimatedRecruitingCost"],
                            }
                        },
                        skillGaps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    skill: { type: Type.STRING },
                                    demandLevel: { type: Type.STRING },
                                    supplyLevel: { type: Type.STRING },
                                    severity: { type: Type.STRING },
                                },
                                required: ["skill", "demandLevel", "supplyLevel", "severity"],
                            }
                        },
                        marketTrends: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    insight: { type: Type.STRING },
                                    impact: { type: Type.STRING },
                                },
                                required: ["insight", "impact"],
                            }
                        },
                        competitiveIntelligence: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    observation: { type: Type.STRING },
                                    implication: { type: Type.STRING },
                                },
                                required: ["observation", "implication"],
                            }
                        },
                        diversityAnalysis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    department: { type: Type.STRING },
                                    metric: { type: Type.STRING },
                                    value: { type: Type.STRING },
                                    insight: { type: Type.STRING },
                                },
                                required: ["department", "metric", "value", "insight"],
                            }
                        }
                    },
                    required: ["hiringForecasts", "skillGaps", "marketTrends", "competitiveIntelligence", "diversityAnalysis"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PredictiveAnalysisReport;
    } catch (error) {
        console.error("Error generating predictive analysis:", error);
        throw new Error("Failed to generate predictive analysis report. The AI model may have returned an unexpected response.");
    }
};

export const generateSourcingStrategy = async (query: BooleanSearchQuery): Promise<SourcingStrategy> => {
    const prompt = `
        You are a world-class talent sourcer, an expert in crafting advanced boolean search strings and creative sourcing strategies.
        Based on the following detailed search criteria, generate a comprehensive sourcing strategy.

        Search Criteria:
        - Job Title: "${query.jobTitle}"
        - Location: "${query.location}"
        - Experience: ${query.experience.min}-${query.experience.max} years
        - Must-Have Keywords (AND): ${query.mustHave.join(', ')}
        - Nice-to-Have Keywords (OR): ${query.niceToHave.join(', ')}
        - Exclude Keywords (NOT): ${query.exclude.join(', ')}
        - Current Target Companies: ${query.currentCompanies.join(', ')}
        - Past Target Companies (Alumni): ${query.pastCompanies.join(', ')}

        Your task is to return a single JSON object with the following structure:
        - masterBooleanString: A single, powerful boolean string for general professional networks that combines all criteria.
        - platformSpecificStrings: An array of 2-3 objects for specific platforms. Each object must have:
            - platform: The platform name ('LinkedIn', 'GitHub', 'General').
            - query: A search string or URL fragment tailored for that platform. For GitHub, focus on user bios or repo descriptions.
        - creativeKeywords: An array of 5-7 creative keywords and boolean strings.
        - alternativeJobTitles: An array of 4-6 alternative job titles.
        - untappedChannels: An array of 3-4 objects, each representing an unconventional sourcing channel. Each object must have:
            - channel: The name of the channel.
            - reasoning: Why this is a good channel for this specific search.
        - sampleOutreachMessage: A concise, compelling, and personalized outreach message template.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        masterBooleanString: { type: Type.STRING },
                        platformSpecificStrings: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    platform: { type: Type.STRING },
                                    query: { type: Type.STRING },
                                },
                                required: ["platform", "query"],
                            },
                        },
                        creativeKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        alternativeJobTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
                        untappedChannels: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    channel: { type: Type.STRING },
                                    reasoning: { type: Type.STRING },
                                },
                                required: ["channel", "reasoning"],
                            },
                        },
                        sampleOutreachMessage: { type: Type.STRING },
                    },
                    required: ["masterBooleanString", "platformSpecificStrings", "creativeKeywords", "alternativeJobTitles", "untappedChannels", "sampleOutreachMessage"],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SourcingStrategy;
    } catch (error) {
        console.error("Error generating sourcing strategy:", error);
        throw new Error("Failed to generate sourcing strategy. The AI model may have returned an unexpected response.");
    }
};

export const refineSourcingStrategy = async (
    query: BooleanSearchQuery,
    currentStrategy: SourcingStrategy,
    fieldToRefine: RefinableSourcingField,
    feedback: string
): Promise<Partial<SourcingStrategy>> => {
    
    const whatToGenerate = {
        creativeKeywords: "an array of 5-7 new creative keywords and boolean strings",
        alternativeJobTitles: "an array of 4-6 new alternative or related job titles",
        sampleOutreachMessage: "a new concise, compelling, and personalized outreach message template (as a string)"
    };

    const responseSchemaProperties = {
        creativeKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        alternativeJobTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
        sampleOutreachMessage: { type: Type.STRING },
    };

    const prompt = `
        You are an expert sourcing strategist refining a previously generated plan.

        Original Search Query:
        - Title: ${query.jobTitle}
        - Must Haves: ${query.mustHave.join(', ')}
        - Nice to Haves: ${query.niceToHave.join(', ')}

        Current Sourcing Strategy:
        - Creative Keywords: ${currentStrategy.creativeKeywords.join(', ')}
        - Alternative Job Titles: ${currentStrategy.alternativeJobTitles.join(', ')}
        - Untapped Channels: ${currentStrategy.untappedChannels.map(c => c.channel).join(', ')}
        - Sample Outreach Message: "${currentStrategy.sampleOutreachMessage}"

        The user wants to refine the "${fieldToRefine}" section based on the following feedback:
        Feedback: "${feedback}"

        Your task is to regenerate ONLY the "${fieldToRefine}" part of the strategy.
        Generate ${whatToGenerate[fieldToRefine]}.

        Return your response as a single JSON object containing only the key for the refined field ("${fieldToRefine}").
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        [fieldToRefine]: responseSchemaProperties[fieldToRefine],
                    },
                    required: [fieldToRefine],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Partial<SourcingStrategy>;
    } catch (error) {
        console.error("Error refining sourcing strategy:", error);
        throw new Error(`Failed to refine ${fieldToRefine}. The AI model may have returned an unexpected response.`);
    }
};

export const generateOfferLetter = async (candidateName: string, jobTitle: string, offer: Offer, hiringManager: string): Promise<string> => {
    const prompt = `
        You are an expert HR professional tasked with generating a formal job offer letter.
        Use the following details to create a comprehensive and professional offer letter.
        The company name is "Innovate Inc.".

        Details:
        - Candidate Name: ${candidateName}
        - Job Title: ${jobTitle}
        - Hiring Manager: ${hiringManager}
        - Start Date: ${new Date(offer.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        - Base Salary: $${offer.currentCompensation.baseSalary.toLocaleString()} per year
        - Annual Bonus Target: $${offer.currentCompensation.bonus.toLocaleString()}
        - Sign-On Bonus: $${(offer.currentCompensation.signOnBonus || 0).toLocaleString()} (if greater than 0)
        - Equity: ${offer.currentCompensation.equity.shares.toLocaleString()} stock options with a ${offer.currentCompensation.equity.vestingSchedule}
        - Relocation Assistance: $${offer.relocationPackage.toLocaleString()} (if greater than 0)
        - Offer Expiration Date: ${new Date(offer.expirationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

        Instructions:
        1.  The letter should be structured professionally with a date, candidate's name and address placeholder, a clear subject line, and a formal salutation.
        2.  Include paragraphs covering: the position, compensation details (base, bonus, sign-on), equity, start date, and any contingencies (like background check).
        3.  Ensure the tone is welcoming and enthusiastic.
        4.  Conclude with instructions on how to accept the offer and a closing from the hiring manager.
        5.  The output should be the full text of the offer letter.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating offer letter:", error);
        throw new Error("Failed to generate the offer letter. Please try again.");
    }
};

export const getNegotiationAdvice = async (offer: Offer, job: JobRequisition, candidate: Candidate): Promise<string[]> => {
    const prompt = `
        You are an expert negotiation coach and sales closer for tech recruiters. Analyze the following negotiation situation and provide 3-4 actionable, strategic bullet points for a "Closing Playbook".

        Context:
        - Job Title: ${job.title}
        - Role Budget: $${job.budget.salaryMin.toLocaleString()} - $${job.budget.salaryMax.toLocaleString()}
        - Candidate: ${candidate.name}, ${candidate.experience} years of experience.
        - Candidate's Salary Expectation (if known): $${(candidate.compensation?.salaryExpectation || 0).toLocaleString()}
        - Negotiation History: ${JSON.stringify(offer.negotiationHistory)}
        - Competitive Intelligence (if known): ${offer.competitiveIntel?.join(', ') || 'None'}

        Based on this data, provide a tactical closing playbook. Focus on how to structure the next counter-offer, what to say, and how to create urgency. The output must be a JSON array of strings.
        
        Example output:
        [
          "The candidate's counter of $185k is slightly above the max budget but justifiable given their 10 years of experience and the competing FAANG offer. Frame the next offer as 'best and final' to create urgency.",
          "Instead of matching the base salary, lead with an increased sign-on bonus from $10k to $15k. This is a powerful one-time incentive that doesn't affect long-term salary bands.",
          "Emphasize the value of our equity grant and faster vesting schedule compared to the competitor's offer. This is a key non-monetary differentiator you must highlight on the call.",
          "Suggest a 15-minute coffee chat between the candidate and the hiring manager or CEO. This personal touch can be a powerful closing tool to build rapport and sell the vision."
        ]
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as string[];
    } catch (error) {
        console.error("Error generating negotiation advice:", error);
        throw new Error("Failed to generate negotiation advice.");
    }
};