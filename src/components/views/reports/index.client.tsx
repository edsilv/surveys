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
        member:
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

type SortField = 'member' | 'survey' | 'question' | 'sentiment';
type SortDirection = 'asc' | 'desc';

export const ReportsClient: React.FC = () => {
  const [responseItems, setResponseItems] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('sentiment');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const textResponses = responseItems
    .filter((item) => item.textValue && item.questionType === 'textarea' && item.sentiment !== undefined)
    .sort((a, b) => {
      let compareValue = 0;

      if (sortField === 'member') {
        const memberA =
          typeof a.surveyResponse === 'object' && typeof a.surveyResponse.member === 'object'
            ? a.surveyResponse.member.email
            : '';
        const memberB =
          typeof b.surveyResponse === 'object' && typeof b.surveyResponse.member === 'object'
            ? b.surveyResponse.member.email
            : '';
        compareValue = memberA.localeCompare(memberB);
      } else if (sortField === 'survey') {
        const surveyA =
          typeof a.surveyResponse === 'object' && typeof a.surveyResponse.survey === 'object'
            ? a.surveyResponse.survey.title
            : '';
        const surveyB =
          typeof b.surveyResponse === 'object' && typeof b.surveyResponse.survey === 'object'
            ? b.surveyResponse.survey.title
            : '';
        compareValue = surveyA.localeCompare(surveyB);
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

      {textResponses.length > 0 && (
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
      )}

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
                onClick={() => handleSort('member')}
              >
                Member {sortField === 'member' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                onClick={() => handleSort('survey')}
              >
                Survey {sortField === 'survey' && (sortDirection === 'asc' ? '↑' : '↓')}
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
              const sentimentLabel = sentimentScore >= 0.6 ? 'Positive' : sentimentScore < 0.4 ? 'Negative' : 'Neutral';
              const sentimentColor = sentimentScore >= 0.6 ? '#66ff66' : sentimentScore < 0.4 ? '#ff6666' : '#ffff66';

              const member =
                typeof item.surveyResponse === 'object' && typeof item.surveyResponse.member === 'object'
                  ? item.surveyResponse.member
                  : null;
              const memberEmail = member ? member.email : 'N/A';
              const memberId = member ? member.id : null;

              const survey =
                typeof item.surveyResponse === 'object' && typeof item.surveyResponse.survey === 'object'
                  ? item.surveyResponse.survey
                  : null;
              const surveyTitle = survey ? survey.title : 'N/A';
              const surveyId = survey ? survey.id : null;

              return (
                <tr key={item.id} style={{ background: '#fff' }}>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd', color: '#000' }}>
                    {memberId ? (
                      <a
                        href={`/admin/collections/members/${memberId}`}
                        style={{ color: '#0066cc', textDecoration: 'underline' }}
                      >
                        {memberEmail}
                      </a>
                    ) : (
                      memberEmail
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
    </div>
  );
};
