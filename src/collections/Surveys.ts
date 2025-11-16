import type { CollectionConfig } from 'payload';
import { slugField } from '@/fields/slug';

export const Surveys: CollectionConfig = {
  slug: 'surveys',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField('title', {
      slugOverrides: {
        unique: true,
      },
    }),
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'questions',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'question',
          type: 'relationship',
          relationTo: 'questions',
          required: true,
        },
      ],
    },
    {
      name: 'respondents',
      type: 'relationship',
      relationTo: 'respondents',
      hasMany: true,
      admin: {
        description: 'Respondents who can access and complete this survey',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this survey is currently accepting responses',
      },
    },
  ],
};
