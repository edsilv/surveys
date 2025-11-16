'use client';

import { useEffect, useState } from 'react';
import React from 'react';

interface ResponseItem {
  id: string;
  surveyResponse:
    | string
    | {
        id: string;
        member:
          | string
          | {
              id: string | number;
              email: string;
            };
      };
  question: string;
  questionSlug: string;
  questionType: string;
  textValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  arrayValue?: Array<{ value: string }>;
  createdAt: string;
  updatedAt: string;
}

async function analyseSentiment(text: string): Promise<string> {
  try {
    const response = await fetch('/api/sentiment-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyse sentiment');
    }

    const data = await response.json();
    return data.sentiment || 'Neutral';
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return 'Error';
  }
}

export const ReportsClient: React.FC = () => {
  const [responseItems, setResponseItems] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentiments, setSentiments] = useState<Record<string, string>>({});
  const [analyzingCount, setAnalyzingCount] = useState(0);

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

        // Analyse sentiment for text and textarea responses only
        const textItems = items.filter(
          (item: ResponseItem) => item.textValue && ['text', 'textarea'].includes(item.questionType),
        );
        setAnalyzingCount(textItems.length);

        const sentimentResults: Record<string, string> = {};

        for (const item of textItems) {
          if (item.textValue) {
            const sentiment = await analyseSentiment(item.textValue);
            sentimentResults[item.id] = sentiment;
            setSentiments({ ...sentimentResults });
            setAnalyzingCount((prev) => prev - 1);
          }
        }
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

  const textResponses = responseItems.filter(
    (item) => item.textValue && ['text', 'textarea'].includes(item.questionType),
  );
  const positiveSentiments = Object.values(sentiments).filter((s) => s === 'Positive').length;
  const negativeSentiments = Object.values(sentiments).filter((s) => s === 'Negative').length;
  const neutralSentiments = Object.values(sentiments).filter((s) => s === 'Neutral').length;

  return (
    <div>
      {/* <h2>Sentiment Analysis Report</h2> */}

      {analyzingCount > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '4px' }}>
          <p>Analyzing sentiment... {analyzingCount} remaining</p>
        </div>
      )}

      {Object.keys(sentiments).length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Sentiment Summary</h3>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ display: 'inline-block', padding: '1rem', background: '#66ff66', borderRadius: '4px', color: '#000' }}>
              <strong>Positive:</strong> {positiveSentiments}
            </div>
            <div style={{ display: 'inline-block', padding: '1rem', background: '#ffff66', borderRadius: '4px', color: '#000' }}>
              <strong>Neutral:</strong> {neutralSentiments}
            </div>
            <div style={{ display: 'inline-block', padding: '1rem', background: '#ff6666', borderRadius: '4px', color: '#000' }}>
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
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#fff' }}>
                Member
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#fff' }}>
                Survey Response
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#fff' }}>
                Question
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#fff' }}>
                Response
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#fff' }}>
                Sentiment
              </th>
            </tr>
          </thead>
          <tbody>
            {textResponses.map((item) => {
              const sentiment = sentiments[item.id];
              const sentimentColor =
                sentiment === 'Positive' ? '#66ff66' : sentiment === 'Negative' ? '#ff6666' : '#ffff66';

              const surveyResponseId =
                typeof item.surveyResponse === 'object' ? item.surveyResponse.id : item.surveyResponse;
              const member =
                typeof item.surveyResponse === 'object' && typeof item.surveyResponse.member === 'object'
                  ? item.surveyResponse.member
                  : null;
              const memberEmail = member ? member.email : 'N/A';
              const memberId = member ? member.id : null;

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
                    <a
                      href={`/admin/collections/survey-responses/${surveyResponseId}`}
                      style={{ color: '#0066cc', textDecoration: 'underline' }}
                    >
                      {surveyResponseId}
                    </a>
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd', color: '#000' }}>
                    <strong>{item.questionSlug}</strong>
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd', color: '#000' }}>{item.textValue}</td>
                  <td
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      background: sentimentColor,
                      fontWeight: 'bold',
                      color: '#000',
                    }}
                  >
                    {sentiment || 'Analyzing...'}
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
