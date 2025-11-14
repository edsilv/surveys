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
    },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      index: true,
      admin: {
        description: 'The member who completed this survey',
      },
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'completedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'submittedBy',
      type: 'text',
      index: true,
      admin: {
        description: 'Email or identifier of the person who submitted the survey (denormalized from member)',
      },
    },
  ],
  timestamps: true,
};
