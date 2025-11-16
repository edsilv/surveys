import type { CollectionConfig } from 'payload';
import { analyseSentiment } from '../lib/ai';

export const ResponseItems: CollectionConfig = {
  slug: 'response-items',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['surveyResponse', 'question', 'value'],
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Only analyse sentiment for new textarea responses
        if (operation === 'create' && data.textValue && data.questionType === 'textarea') {
          try {
            const sentiment = await analyseSentiment(data.textValue);
            // Add sentiment to the data being created
            data.sentiment = sentiment;
          } catch (error) {
            console.error('Failed to analyse sentiment for response item:', error);
            // Set neutral sentiment on error
            data.sentiment = 0.5;
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'surveyResponse',
      type: 'relationship',
      relationTo: 'survey-responses',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'question',
      type: 'relationship',
      relationTo: 'questions',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'questionSlug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'questionType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Textarea', value: 'textarea' },
        { label: 'Multiple Choice', value: 'multiple_choice' },
        { label: 'Multiple Select', value: 'multiple_select' },
        { label: 'Multiple Select with Other', value: 'multiple_select_with_other' },
        { label: 'Rating', value: 'rating' },
        { label: 'Yes/No', value: 'yes_no' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'textValue',
      type: 'text',
      admin: {
        condition: (data) => {
          return ['text', 'textarea', 'multiple_choice'].includes(data.questionType);
        },
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'numberValue',
      type: 'number',
      admin: {
        condition: (data) => data.questionType === 'rating',
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'booleanValue',
      type: 'checkbox',
      admin: {
        condition: (data) => data.questionType === 'yes_no',
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'arrayValue',
      type: 'array',
      admin: {
        condition: (data) => {
          return ['multiple_select', 'multiple_select_with_other'].includes(data.questionType);
        },
        readOnly: true,
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'sentiment',
      type: 'number',
      min: 0,
      max: 1,
      admin: {
        description: 'Sentiment score: 0 = negative, 0.5 = neutral, 1 = positive',
        condition: (data) => {
          return data.questionType === 'textarea';
        },
        readOnly: true,
      },
      index: true,
    },
  ],
  timestamps: true,
};
