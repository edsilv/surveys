import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze sentiment of text and return a score between 0-1
 * 0 = very negative, 0.5 = neutral, 1 = very positive
 */
export async function analyseSentiment(text: string): Promise<number> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a sentiment analysis assistant. Analyse the sentiment and respond with only a number between 0 and 1, where 0 is very negative, 0.5 is neutral, and 1 is very positive. Be precise and use decimals.',
        },
        {
          role: 'user',
          content: `Analyse the sentiment of the following text and return only a number between 0 and 1: "${text}"`,
        },
      ],
      max_tokens: 10,
    });

    const result = response.choices[0]?.message?.content?.trim();
    const score = parseFloat(result || '0.5');

    // Ensure the score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('Failed to analyse sentiment:', error);
    // Return neutral sentiment on error
    return 0.5;
  }
}
