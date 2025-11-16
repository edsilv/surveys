import type { CollectionConfig } from 'payload';

export const Respondents: CollectionConfig = {
  slug: 'respondents',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: () => true,
  },
  auth: true,
  fields: [],
};
