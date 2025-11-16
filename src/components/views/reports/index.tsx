import React from 'react';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { Gutter, SetStepNav, type StepNavItem } from '@payloadcms/ui';
import type { AdminViewServerProps } from 'payload';

export const ReportsView: React.FC<AdminViewServerProps> = ({ initPageResult, params }: AdminViewServerProps) => {
  if (!initPageResult.req.user) {
    return <div>You must be logged in to view this page.</div>;
  }

  const steps: StepNavItem[] = [
    {
      url: '/reports',
      label: 'Reports',
    },
  ];

  return (
    <DefaultTemplate
      visibleEntities={initPageResult.visibleEntities}
      i18n={initPageResult.req.i18n}
      payload={initPageResult.req.payload}
      locale={initPageResult.locale}
      params={params}
      permissions={initPageResult.permissions}
      user={initPageResult.req.user || undefined}
    >
      <SetStepNav nav={steps} />
      <Gutter>
        <h1 style={{ margin: '1rem 0 2rem' }}>Reports Dashboard</h1>
      </Gutter>
    </DefaultTemplate>
  );
};

export default ReportsView;
