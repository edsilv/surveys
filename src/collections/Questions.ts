import type { CollectionConfig } from 'payload';

export const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'label',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Textarea', value: 'textarea' },
        { label: 'Multiple Choice', value: 'multiple_choice' },
        { label: 'Multiple Select', value: 'multiple_select' },
        { label: 'Multiple Select with Other', value: 'multiple_select_with_other' },
        { label: 'Rating', value: 'rating' },
        { label: 'Yes/No', value: 'yes_no' },
      ],
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Unique identifier for this question (used in responses)',
      },
    },
    {
      name: 'options',
      type: 'array',
      admin: {
        condition: (data) => {
          return ['multiple_choice', 'multiple_select', 'multiple_select_with_other'].includes(data.type);
        },
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
      name: 'scale',
      type: 'number',
      admin: {
        condition: (data) => data.type === 'rating',
        description: 'Maximum rating value (e.g., 5 for 1-5 scale)',
      },
    },
    {
      name: 'validation',
      type: 'group',
      fields: [
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'minLength',
          type: 'number',
          admin: {
            condition: (data) => {
              return data.type === 'text' || data.type === 'textarea';
            },
          },
        },
        {
          name: 'maxLength',
          type: 'number',
          admin: {
            condition: (data) => {
              return data.type === 'text' || data.type === 'textarea';
            },
          },
        },
        {
          name: 'minChoices',
          type: 'number',
          admin: {
            condition: (data) => {
              return ['multiple_select', 'multiple_select_with_other'].includes(data.type);
            },
          },
        },
        {
          name: 'maxChoices',
          type: 'number',
          admin: {
            condition: (data) => {
              return ['multiple_select', 'multiple_select_with_other'].includes(data.type);
            },
          },
        },
      ],
    },
    {
      name: 'condition',
      type: 'group',
      admin: {
        description: 'Conditional display based on another question',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Name of the question this depends on',
          },
        },
        {
          name: 'value',
          type: 'json',
          admin: {
            description: 'Value that triggers this question to display',
          },
        },
      ],
    },
  ],
};
