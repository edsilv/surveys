'use client';

import { useEffect, useState } from 'react';
import React from 'react';

interface ResponseItem {
  id: string;
  surveyResponse:
    | string
    | {
        id: string;
        survey:
          | string
          | {
              id: string | number;
              title: string;
            };
        respondent:
          | string
          | {
              id: string | number;
              email: string;
            };
      };
  question:
    | string
    | {
        id: string | number;
        title: string;
        slug: string;
      };
  questionSlug: string;
  questionType: string;
  textValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  arrayValue?: Array<{ value: string }>;
  sentiment?: number;
  createdAt: string;
  updatedAt: string;
}

type SortField = 'respondent' | 'question' | 'sentiment';
type SortDirection = 'asc' | 'desc';

export const ReportsClient: React.FC = () => {
  const [responseItems, setResponseItems] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('sentiment');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedSurvey, setSelectedSurvey] = useState<string>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    const fetchResponseItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/response-items?limit=1000&depth=2', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch response items');
        }

        const data = await response.json();
        const items = data.docs || [];
        setResponseItems(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchResponseItems();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Get unique surveys for the filter dropdown
  const surveys = Array.from(
    new Map(
      responseItems
        .map((item) => {
          if (typeof item.surveyResponse === 'object' && typeof item.surveyResponse.survey === 'object') {
            return item.surveyResponse.survey;
          }
          return null;
        })
        .filter((survey): survey is { id: string | number; title: string } => survey !== null)
        .map((survey) => [survey.id.toString(), survey]),
    ).values(),
  );

  const textResponses = responseItems
    .filter((item) => {
      // Filter by textarea with sentiment
      if (!item.textValue || item.questionType !== 'textarea' || item.sentiment === undefined) {
        return false;
      }

      // Filter by selected survey
      if (selectedSurvey !== 'all') {
        const surveyId =
          typeof item.surveyResponse === 'object' && typeof item.surveyResponse.survey === 'object'
            ? item.surveyResponse.survey.id.toString()
            : null;
        if (surveyId !== selectedSurvey) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let compareValue = 0;

      if (sortField === 'respondent') {
        const respondentA =
          typeof a.surveyResponse === 'object' && typeof a.surveyResponse.respondent === 'object'
            ? a.surveyResponse.respondent.email
            : '';
        const respondentB =
          typeof b.surveyResponse === 'object' && typeof b.surveyResponse.respondent === 'object'
            ? b.surveyResponse.respondent.email
            : '';
        compareValue = respondentA.localeCompare(respondentB);
      } else if (sortField === 'question') {
        const questionA = typeof a.question === 'object' && a.question.title ? a.question.title : a.questionSlug;
        const questionB = typeof b.question === 'object' && b.question.title ? b.question.title : b.questionSlug;
        compareValue = questionA.localeCompare(questionB);
      } else if (sortField === 'sentiment') {
        const sentimentA = a.sentiment ?? 0.5;
        const sentimentB = b.sentiment ?? 0.5;
        compareValue = sentimentA - sentimentB;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

  const positiveSentiments = textResponses.filter((item) => item.sentiment && item.sentiment >= 0.6).length;
  const negativeSentiments = textResponses.filter(
    (item) => item.sentiment !== undefined && item.sentiment < 0.4,
  ).length;
  const neutralSentiments = textResponses.filter(
    (item) => item.sentiment !== undefined && item.sentiment >= 0.4 && item.sentiment < 0.6,
  ).length;

  return (
    <div>
      {/* <h2>Sentiment Analysis Report</h2> */}

      {textResponses.length === 0 ? (
        <div style={{ marginTop: '2rem', padding: '2rem', color: '#ffffffff' }}>
          <p>No responses yet</p>
        </div>
      ) : (
        <>
          <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            <label htmlFor="survey-filter" style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>
              Filter by Survey:
            </label>
            <select
              id="survey-filter"
              value={selectedSurvey}
              onChange={(e) => setSelectedSurvey(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#000',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Surveys</option>
              {surveys.map((survey) => (
                <option key={survey.id} value={survey.id.toString()}>
                  {survey.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Sentiment Summary</h3>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '1rem',
                  background: '#66ff66',
                  borderRadius: '4px',
                  color: '#000',
                }}
              >
                <strong>Positive:</strong> {positiveSentiments}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '1rem',
                  background: '#ffff66',
                  borderRadius: '4px',
                  color: '#000',
                }}
              >
                <strong>Neutral:</strong> {neutralSentiments}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '1rem',
                  background: '#ff6666',
                  borderRadius: '4px',
                  color: '#000',
                }}
              >
                <strong>Negative:</strong> {negativeSentiments}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3>Text Responses with Sentiment:</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: '#fff' }}>
              <thead>
                <tr style={{ background: '#000' }}>
                  <th
                    style={{
                      padding: '0.5rem',
                      textAlign: 'left',
                      border: '1px solid #ddd',
                      color: '#fff',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => handleSort('respondent')}
                  >
                    Respondent {sortField === 'respondent' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#fff' }}>
                    Survey
                  </th>
                  <th
                    style={{
                      padding: '0.5rem',
                      textAlign: 'left',
                      border: '1px solid #ddd',
                      color: '#fff',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => handleSort('question')}
                  >
                    Question {sortField === 'question' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#fff' }}>
                    Response
                  </th>
                  <th
                    style={{
                      padding: '0.5rem',
                      textAlign: 'left',
                      border: '1px solid #ddd',
                      color: '#fff',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => handleSort('sentiment')}
                  >
                    Sentiment {sortField === 'sentiment' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {textResponses.map((item) => {
                  const sentimentScore = item.sentiment ?? 0.5;
                  const sentimentLabel =
                    sentimentScore >= 0.6 ? 'Positive' : sentimentScore < 0.4 ? 'Negative' : 'Neutral';
                  const sentimentColor =
                    sentimentScore >= 0.6 ? '#66ff66' : sentimentScore < 0.4 ? '#ff6666' : '#ffff66';

                  const respondent =
                    typeof item.surveyResponse === 'object' && typeof item.surveyResponse.respondent === 'object'
                      ? item.surveyResponse.respondent
                      : null;
                  const respondentEmail = respondent ? respondent.email : 'N/A';
                  const respondentId = respondent ? respondent.id : null;

                  const survey =
                    typeof item.surveyResponse === 'object' && typeof item.surveyResponse.survey === 'object'
                      ? item.surveyResponse.survey
                      : null;
                  const surveyTitle = survey ? survey.title : 'N/A';
                  const surveyId = survey ? survey.id : null;

                  return (
                    <tr key={item.id} style={{ background: '#fff' }}>
                      <td style={{ padding: '0.5rem', border: '1px solid #ddd', color: '#000' }}>
                        {respondentId ? (
                          <a
                            href={`/admin/collections/respondents/${respondentId}`}
                            style={{ color: '#0066cc', textDecoration: 'underline' }}
                          >
                            {respondentEmail}
                          </a>
                        ) : (
                          respondentEmail
                        )}
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #ddd', color: '#000' }}>
                        {surveyId ? (
                          <a
                            href={`/admin/collections/surveys/${surveyId}`}
                            style={{ color: '#0066cc', textDecoration: 'underline' }}
                          >
                            {surveyTitle}
                          </a>
                        ) : (
                          surveyTitle
                        )}
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #ddd', color: '#000' }}>
                        <strong>
                          {typeof item.question === 'object' && item.question.title
                            ? item.question.title
                            : item.questionSlug}
                        </strong>{' '}
                        {typeof item.question === 'object' && item.question.id && (
                          <a
                            href={`/admin/collections/questions/${item.question.id}`}
                            style={{ color: '#0066cc', textDecoration: 'underline', fontSize: '0.9em' }}
                          >
                            [{item.question.id}]
                          </a>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #ddd', color: '#000' }}>
                        {item.textValue}{' '}
                        <a
                          href={`/admin/collections/response-items/${item.id}`}
                          style={{ color: '#0066cc', textDecoration: 'underline', fontSize: '0.9em' }}
                        >
                          [{item.id}]
                        </a>
                      </td>
                      <td
                        style={{
                          padding: '0.5rem',
                          border: '1px solid #ddd',
                          background: sentimentColor,
                          fontWeight: 'bold',
                          color: '#000',
                        }}
                      >
                        {sentimentLabel} ({sentimentScore.toFixed(2)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
