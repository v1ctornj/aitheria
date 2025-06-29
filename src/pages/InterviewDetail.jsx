import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
//import { getInterviewDetails } from '../utils/mem0'; // Assuming this function fetches interview details
//import { fetchContextualInfo } from '../utils/tavily'; // Assuming this function fetches contextual info
//import { getKeywordsQualityScore } from '../utils/keywords'; // Assuming this function checks keyword quality

const InterviewDetail = () => {
    const { interviewId } = useParams();
    const [interview, setInterview] = useState(null);
    const [contextualInfo, setContextualInfo] = useState([]);
    const [keywordsScore, setKeywordsScore] = useState(null);

    useEffect(() => {
        const fetchInterviewData = async () => {
            const interviewData = await getInterviewDetails(interviewId);
            setInterview(interviewData);

            const contextInfo = await fetchContextualInfo(interviewData.themes);
            setContextualInfo(contextInfo);

            const score = await getKeywordsQualityScore(interviewData.transcript);
            setKeywordsScore(score);
        };

        fetchInterviewData();
    }, [interviewId]);

    if (!interview) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{interview.title}</h1>
            <p className="mt-2">{interview.transcript}</p>
            <h2 className="mt-4 text-xl">Thematic Summary</h2>
            <p>{interview.themes}</p>
            <h2 className="mt-4 text-xl">Contextual Information</h2>
            <ul>
                {contextualInfo.map((info, index) => (
                    <li key={index}>{info}</li>
                ))}
            </ul>
            {keywordsScore && (
                <div className="mt-4">
                    <h2 className="text-xl">Keywords Quality Score</h2>
                    <p>{keywordsScore}</p>
                </div>
            )}
        </div>
    );
};

export default InterviewDetail;