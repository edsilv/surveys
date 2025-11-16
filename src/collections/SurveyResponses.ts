import type { CollectionConfig } from 'payload';

export const SurveyResponses: CollectionConfig = {
  slug: 'survey-responses',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['survey', 'completed', 'completedAt', 'submittedBy'],
  },
  fields: [
    {
      name: 'survey',
      type: 'relationship',
      relationTo: 'surveys',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'respondent',
      type: 'relationship',
      relationTo: 'respondents',
      required: true,
      index: true,
      admin: {
        description: 'The respondent who completed this survey',
        readOnly: true,
      },
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      index: true,
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
};
