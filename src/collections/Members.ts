import type { CollectionConfig } from 'payload';

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: () => true,
  },
  auth: true,
  fields: [],
};
