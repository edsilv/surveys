'use client';

import { useEffect, useState } from 'react';
import React from 'react';

interface SortChevronProps {
  field: 'respondent' | 'question' | 'sentiment';
  currentSortField: 'respondent' | 'question' | 'sentiment';
  currentSortDirection: 'asc' | 'desc';
  onSort: (field: 'respondent' | 'question' | 'sentiment', direction: 'asc' | 'desc') => void;
}

const SortChevron: React.FC<SortChevronProps> = ({ field, currentSortField, currentSortDirection, onSort }) => {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'row', gap: '2px' }}>
      <button
        onClick={() => onSort(field, 'asc')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          width: '16px',
          height: '16px',
        }}
      >
        <svg
          height="100%"
          viewBox="0 0 20 20"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: 'rotate(180deg)' }}
        >
          <path
            d="M14 8L10 12L6 8"
            strokeLinecap="square"
            stroke={
              currentSortField === field && currentSortDirection === 'asc' ? '#fff' : 'var(--theme-elevation-400)'
            }
            fill="none"
          />
        </svg>
      </button>
      <button
        onClick={() => onSort(field, 'desc')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          width: '16px',
          height: '16px',
        }}
      >
        <svg height="100%" viewBox="0 0 20 20" width="100%" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 8L10 12L6 8"
            strokeLinecap="square"
            stroke={
              currentSortField === field && currentSortDirection === 'desc' ? '#fff' : 'var(--theme-elevation-400)'
            }
            fill="none"
          />
        </svg>
      </button>
    </span>
  );
};

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

  // Calculate pie chart segments
  const total = positiveSentiments + neutralSentiments + negativeSentiments;
  const positivePercent = total > 0 ? (positiveSentiments / total) * 100 : 0;
  const neutralPercent = total > 0 ? (neutralSentiments / total) * 100 : 0;
  const negativePercent = total > 0 ? (negativeSentiments / total) * 100 : 0;

  // Create pie chart paths
  const createPieSlice = (startPercent: number, endPercent: number, color: string) => {
    if (endPercent - startPercent === 0) return null;

    const startAngle = (startPercent / 100) * 2 * Math.PI - Math.PI / 2;
    const endAngle = (endPercent / 100) * 2 * Math.PI - Math.PI / 2;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = endPercent - startPercent > 50 ? 1 : 0;

    if (endPercent - startPercent === 100) {
      // Full circle
      return <circle cx={centerX} cy={centerY} r={radius} fill={color} />;
    }

    return (
      <path
        d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
        fill={color}
      />
    );
  };

  return (
    <div>
      <h1 style={{ margin: '1rem 0 2rem' }}>Sentiment Analysis</h1>

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
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginTop: '1rem' }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                {createPieSlice(0, positivePercent, '#66ff66')}
                {createPieSlice(positivePercent, positivePercent + neutralPercent, '#ffff66')}
                {createPieSlice(positivePercent + neutralPercent, 100, '#ff6666')}
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '20px', height: '20px', background: '#66ff66', borderRadius: '2px' }}></div>
                  <span style={{ color: '#fff' }}>
                    <strong>Positive:</strong> {positiveSentiments} ({positivePercent.toFixed(1)}%)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '20px', height: '20px', background: '#ffff66', borderRadius: '2px' }}></div>
                  <span style={{ color: '#fff' }}>
                    <strong>Neutral:</strong> {neutralSentiments} ({neutralPercent.toFixed(1)}%)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '20px', height: '20px', background: '#ff6666', borderRadius: '2px' }}></div>
                  <span style={{ color: '#fff' }}>
                    <strong>Negative:</strong> {negativeSentiments} ({negativePercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--theme-elevation-400)',
                      fontWeight: 'normal',
                    }}
                  >
                    Respondent{' '}
                    <SortChevron
                      field="respondent"
                      currentSortField={sortField}
                      currentSortDirection={sortDirection}
                      onSort={(field, direction) => {
                        setSortField(field);
                        setSortDirection(direction);
                      }}
                    />
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--theme-elevation-400)',
                      fontWeight: 'normal',
                    }}
                  >
                    Survey
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--theme-elevation-400)',
                      fontWeight: 'normal',
                    }}
                  >
                    Question{' '}
                    <SortChevron
                      field="question"
                      currentSortField={sortField}
                      currentSortDirection={sortDirection}
                      onSort={(field, direction) => {
                        setSortField(field);
                        setSortDirection(direction);
                      }}
                    />
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--theme-elevation-400)',
                      fontWeight: 'normal',
                    }}
                  >
                    Response
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--theme-elevation-400)',
                      fontWeight: 'normal',
                    }}
                  >
                    Sentiment{' '}
                    <SortChevron
                      field="sentiment"
                      currentSortField={sortField}
                      currentSortDirection={sortDirection}
                      onSort={(field, direction) => {
                        setSortField(field);
                        setSortDirection(direction);
                      }}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {textResponses.map((item, index) => {
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
                    <tr
                      key={item.id}
                      style={{ background: index % 2 === 0 ? 'var(--theme-elevation-50)' : 'transparent' }}
                    >
                      <td style={{ padding: '1rem', color: '#fff' }}>
                        {respondentId ? (
                          <a
                            href={`/admin/collections/respondents/${respondentId}`}
                            style={{ color: '#fff', textDecoration: 'underline' }}
                          >
                            {respondentEmail}
                          </a>
                        ) : (
                          respondentEmail
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: '#fff' }}>
                        {surveyId ? (
                          <a
                            href={`/admin/collections/surveys/${surveyId}`}
                            style={{ color: '#fff', textDecoration: 'underline' }}
                          >
                            {surveyTitle}
                          </a>
                        ) : (
                          surveyTitle
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: '#fff' }}>
                        {typeof item.question === 'object' && item.question.title
                          ? item.question.title
                          : item.questionSlug}{' '}
                        {typeof item.question === 'object' && item.question.id && (
                          <a
                            href={`/admin/collections/questions/${item.question.id}`}
                            style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.9em' }}
                          >
                            [{item.question.id}]
                          </a>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: '#fff' }}>
                        {item.textValue}{' '}
                        <a
                          href={`/admin/collections/response-items/${item.id}`}
                          style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.9em' }}
                        >
                          [{item.id}]
                        </a>
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          color: '#fff',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: sentimentColor,
                            marginRight: '8px',
                          }}
                        ></span>
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
