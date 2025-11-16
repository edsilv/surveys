'use client';

import { useEffect, useState } from 'react';
import React from 'react';

interface ResponseItem {
  id: string;
  surveyResponse: string;
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
        const response = await fetch('/api/response-items?limit=1000', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch response items');
        }

        const data = await response.json();
        const items = data.docs || [];
        setResponseItems(items);

        // Analyse sentiment for text responses
        const textItems = items.filter((item: ResponseItem) => item.textValue);
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

  const textResponses = responseItems.filter((item) => item.textValue);
  const positiveSentiments = Object.values(sentiments).filter((s) => s === 'Positive').length;
  const negativeSentiments = Object.values(sentiments).filter((s) => s === 'Negative').length;
  const neutralSentiments = Object.values(sentiments).filter((s) => s === 'Neutral').length;

  return (
    <div>
      <h2>Sentiment Analysis Report</h2>
      <p>Total response items: {responseItems.length}</p>
      <p>Text responses: {textResponses.length}</p>

      {analyzingCount > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '4px' }}>
          <p>Analyzing sentiment... {analyzingCount} remaining</p>
        </div>
      )}

      {Object.keys(sentiments).length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Sentiment Summary</h3>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', background: '#c8e6c9', borderRadius: '4px', flex: 1, color: '#000' }}>
              <strong>Positive:</strong> {positiveSentiments}
            </div>
            <div style={{ padding: '1rem', background: '#ffccbc', borderRadius: '4px', flex: 1, color: '#000' }}>
              <strong>Negative:</strong> {negativeSentiments}
            </div>
            <div style={{ padding: '1rem', background: '#e0e0e0', borderRadius: '4px', flex: 1, color: '#000' }}>
              <strong>Neutral:</strong> {neutralSentiments}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Text Responses with Sentiment:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#000' }}>
                Question
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#000' }}>
                Response
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ddd', color: '#000' }}>
                Sentiment
              </th>
            </tr>
          </thead>
          <tbody>
            {textResponses.map((item) => {
              const sentiment = sentiments[item.id];
              const sentimentColor =
                sentiment === 'Positive' ? '#c8e6c9' : sentiment === 'Negative' ? '#ffccbc' : '#e0e0e0';

              return (
                <tr key={item.id}>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                    <strong>{item.questionSlug}</strong>
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{item.textValue}</td>
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
